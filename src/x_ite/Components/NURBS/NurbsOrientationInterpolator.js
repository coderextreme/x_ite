/* -*- Mode: JavaScript; coding: utf-8; tab-width: 3; indent-tabs-mode: tab; c-basic-offset: 3 -*-
 *******************************************************************************
 *
 * DO NOT ALTER OR REMOVE COPYRIGHT NOTICES OR THIS FILE HEADER.
 *
 * Copyright create3000, Scheffelstraße 31a, Leipzig, Germany 2011.
 *
 * All rights reserved. Holger Seelig <holger.seelig@yahoo.de>.
 *
 * The copyright notice above does not evidence any actual of intended
 * publication of such source code, and is an unpublished work by create3000.
 * This material contains CONFIDENTIAL INFORMATION that is the property of
 * create3000.
 *
 * No permission is granted to copy, distribute, or create derivative works from
 * the contents of this software, in whole or in part, without the prior written
 * permission of create3000.
 *
 * NON-MILITARY USE ONLY
 *
 * All create3000 software are effectively free software with a non-military use
 * restriction. It is free. Well commented source is provided. You may reuse the
 * source in any way you please with the exception anything that uses it must be
 * marked to indicate is contains 'non-military use only' components.
 *
 * DO NOT ALTER OR REMOVE COPYRIGHT NOTICES OR THIS FILE HEADER.
 *
 * Copyright 2015, 2016 Holger Seelig <holger.seelig@yahoo.de>.
 *
 * This file is part of the X_ITE Project.
 *
 * X_ITE is free software: you can redistribute it and/or modify it under the
 * terms of the GNU General Public License version 3 only, as published by the
 * Free Software Foundation.
 *
 * X_ITE is distributed in the hope that it will be useful, but WITHOUT ANY
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR
 * A PARTICULAR PURPOSE. See the GNU General Public License version 3 for more
 * details (a copy is included in the LICENSE file that accompanied this code).
 *
 * You should have received a copy of the GNU General Public License version 3
 * along with X_ITE.  If not, see <http://www.gnu.org/licenses/gpl.html> for a
 * copy of the GPLv3 License.
 *
 * For Silvio, Joy and Adi.
 *
 ******************************************************************************/


define ([
   "x_ite/Fields",
   "x_ite/Base/X3DFieldDefinition",
   "x_ite/Base/FieldDefinitionArray",
   "x_ite/Components/Core/X3DChildNode",
   "x_ite/Components/Interpolation/OrientationInterpolator",
   "x_ite/Base/X3DConstants",
   "x_ite/Base/X3DCast",
   "x_ite/Browser/NURBS/NURBS",
   "standard/Math/Numbers/Vector3",
   "standard/Math/Numbers/Rotation4",
   "nurbs",
],
function (Fields,
          X3DFieldDefinition,
          FieldDefinitionArray,
          X3DChildNode,
          OrientationInterpolator,
          X3DConstants,
          X3DCast,
          NURBS,
          Vector3,
          Rotation4,
          nurbs)
{
"use strict";

   function NurbsOrientationInterpolator (executionContext)
   {
      X3DChildNode .call (this, executionContext);

      this .addType (X3DConstants .NurbsOrientationInterpolator);

      this .addChildObjects ("rebuild", new Fields .SFTime ());

      this .interpolator  = new OrientationInterpolator (executionContext);
      this .knots         = [ ];
      this .weights       = [ ];
      this .controlPoints = [ ];
      this .mesh          = { };
      this .sampleOptions = { resolution: [ 128 ] };
   }

   NurbsOrientationInterpolator .prototype = Object .assign (Object .create (X3DChildNode .prototype),
   {
      constructor: NurbsOrientationInterpolator,
      [Symbol .for ("X3DBaseNode.fieldDefinitions")]: new FieldDefinitionArray ([
         new X3DFieldDefinition (X3DConstants .inputOutput, "metadata",      new Fields .SFNode ()),
         new X3DFieldDefinition (X3DConstants .inputOnly,   "set_fraction",  new Fields .SFFloat ()),
         new X3DFieldDefinition (X3DConstants .inputOutput, "order",         new Fields .SFInt32 (3)),
         new X3DFieldDefinition (X3DConstants .inputOutput, "knot",          new Fields .MFDouble ()),
         new X3DFieldDefinition (X3DConstants .inputOutput, "weight",        new Fields .MFDouble ()),
         new X3DFieldDefinition (X3DConstants .inputOutput, "controlPoint",  new Fields .SFNode ()),
         new X3DFieldDefinition (X3DConstants .outputOnly,  "value_changed", new Fields .SFRotation ()),
      ]),
      getTypeName: function ()
      {
         return "NurbsOrientationInterpolator";
      },
      getComponentName: function ()
      {
         return "NURBS";
      },
      getContainerField: function ()
      {
         return "children";
      },
      initialize: function ()
      {
         X3DChildNode .prototype .initialize .call (this);

         this .order_        .addInterest ("requestRebuild",     this);
         this .knot_         .addInterest ("requestRebuild",     this);
         this .weight_       .addInterest ("requestRebuild",     this);
         this .controlPoint_ .addInterest ("set_controlPoint__", this);

         this .rebuild_ .addInterest ("build", this);

         this .set_fraction_ .addFieldInterest (this .interpolator .set_fraction_);
         this .interpolator .value_changed_ .addFieldInterest (this .value_changed_);

         this .interpolator .setup ();

         this .set_controlPoint__ ();
      },
      set_controlPoint__: function ()
      {
         if (this .controlPointNode)
            this .controlPointNode .removeInterest ("requestRebuild", this);

         this .controlPointNode = X3DCast (X3DConstants .X3DCoordinateNode, this .controlPoint_);

         if (this .controlPointNode)
            this .controlPointNode .addInterest ("requestRebuild", this);

         this .requestRebuild ();
      },
      getClosed: function (order, knot, weight, controlPointNode)
      {
         return false && NURBS .getClosed (order, knot, weight, controlPointNode);
      },
      getKnots: function (result, closed, order, dimension, knot)
      {
         return NURBS .getKnots (result, closed, order, dimension, knot);
      },
      getWeights: function (result, dimension, weight)
      {
         return NURBS .getWeights (result, dimension, weight);
      },
      getControlPoints: function (result, closed, order, weights, controlPointNode)
      {
         return NURBS .getControlPoints (result, closed, order, weights, controlPointNode);
      },
      requestRebuild: function ()
      {
         this .rebuild_ .addEvent ();
      },
      build: function ()
      {
         if (this .order_ .getValue () < 2)
            return;

         if (! this .controlPointNode)
            return;

         if (this .controlPointNode .getSize () < this .order_ .getValue ())
            return;

         // Order and dimension are now positive numbers.

         var
            closed        = this .getClosed (this .order_ .getValue (), this .knot_, this .weight_, this .controlPointNode),
            weights       = this .getWeights (this .weights, this .controlPointNode .getSize (), this .weight_),
            controlPoints = this .getControlPoints (this .controlPoints, closed, this .order_ .getValue (), weights, this .controlPointNode);

         // Knots

         var
            knots = this .getKnots (this .knots, closed, this .order_ .getValue (), this .controlPointNode .getSize (), this .knot_),
            scale = knots .at (-1) - knots [0];

         // Initialize NURBS tessellator

         var degree = this .order_ .getValue () - 1;

         var surface = this .surface = (this .surface || nurbs) ({
            boundary: ["open"],
            degree: [degree],
            knots: [knots],
            points: controlPoints,
            debug: false,
         });

         this .sampleOptions .haveWeights = Boolean (weights);

         var
            mesh         = nurbs .sample (this .mesh, surface, this .sampleOptions),
            points       = mesh .points,
            interpolator = this .interpolator;

         interpolator .key_      .length = 0;
         interpolator .keyValue_ .length = 0;

         for (var i = 0, length = points .length - 3; i < length; i += 3)
         {
            var direction = new Vector3 (points [i + 3] - points [i + 0],
                                         points [i + 4] - points [i + 1],
                                         points [i + 5] - points [i + 2]);

            interpolator .key_      .push (knots [0] + i / (length - 3 + (3 * closed)) * scale);
            interpolator .keyValue_. push (new Rotation4 (Vector3 .zAxis, direction));
         }

         if (closed)
         {
            interpolator .key_      .push (knots [0] + scale);
            interpolator .keyValue_. push (interpolator .keyValue_ [0]);
         }
      },
   });

   return NurbsOrientationInterpolator;
});
