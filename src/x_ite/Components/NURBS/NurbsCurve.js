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
   "x_ite/Base/X3DCast",
   "x_ite/Fields",
   "x_ite/Base/X3DFieldDefinition",
   "x_ite/Base/FieldDefinitionArray",
   "x_ite/Components/NURBS/X3DParametricGeometryNode",
   "x_ite/Components/Rendering/X3DLineGeometryNode",
   "x_ite/Base/X3DConstants",
   "x_ite/Browser/NURBS/NURBS",
   "nurbs",
],
function (X3DCast,
          Fields,
          X3DFieldDefinition,
          FieldDefinitionArray,
          X3DParametricGeometryNode,
          X3DLineGeometryNode,
          X3DConstants,
          NURBS,
          nurbs)
{
"use strict";

   function NurbsCurve (executionContext)
   {
      X3DParametricGeometryNode .call (this, executionContext);

      this .addType (X3DConstants .NurbsCurve);

      this .setGeometryType (1);

      this .knots         = [ ];
      this .weights       = [ ];
      this .controlPoints = [ ];
      this .mesh          = { };
      this .sampleOptions = { resolution: [ ] };
   }

   NurbsCurve .prototype = Object .assign (Object .create (X3DParametricGeometryNode .prototype),
      X3DLineGeometryNode .prototype,
   {
      constructor: NurbsCurve,
      [Symbol .for ("X3DBaseNode.fieldDefinitions")]: new FieldDefinitionArray ([
         new X3DFieldDefinition (X3DConstants .inputOutput,    "metadata",     new Fields .SFNode ()),
         new X3DFieldDefinition (X3DConstants .inputOutput,    "tessellation", new Fields .SFInt32 ()),
         new X3DFieldDefinition (X3DConstants .initializeOnly, "closed",       new Fields .SFBool ()),
         new X3DFieldDefinition (X3DConstants .initializeOnly, "order",        new Fields .SFInt32 (3)),
         new X3DFieldDefinition (X3DConstants .initializeOnly, "knot",         new Fields .MFDouble ()),
         new X3DFieldDefinition (X3DConstants .inputOutput,    "weight",       new Fields .MFDouble ()),
         new X3DFieldDefinition (X3DConstants .inputOutput,    "controlPoint", new Fields .SFNode ()),
      ]),
      getTypeName: function ()
      {
         return "NurbsCurve";
      },
      getComponentName: function ()
      {
         return "NURBS";
      },
      getContainerField: function ()
      {
         return "geometry";
      },
      initialize: function ()
      {
         X3DParametricGeometryNode .prototype .initialize .call (this);

         this .controlPoint_ .addInterest ("set_controlPoint__", this);

         this .setPrimitiveMode (this .getBrowser () .getContext () .LINES);
         this .setSolid (false);

         this .set_controlPoint__ ();
      },
      set_controlPoint__: function ()
      {
         if (this .controlPointNode)
            this .controlPointNode .removeInterest ("requestRebuild", this);

         this .controlPointNode = X3DCast (X3DConstants .X3DCoordinateNode, this .controlPoint_);

         if (this .controlPointNode)
            this .controlPointNode .addInterest ("requestRebuild", this);
      },
      getTessellation: function (numKnots)
      {
         return NURBS .getTessellation (this .tessellation_ .getValue (), numKnots - this .order_ .getValue ());
      },
      getClosed: function (order, knot, weight, controlPointNode)
      {
         if (! this .closed_ .getValue ())
            return false;

         return NURBS .getClosed (order, knot, weight, controlPointNode);
      },
      getWeights: function (result, dimension, weight)
      {
         return NURBS .getWeights (result, dimension, weight);
      },
      getControlPoints: function (result, closed, order, weights, controlPointNode)
      {
         return NURBS .getControlPoints (result, closed, order, weights, controlPointNode);
      },
      tessellate: function ()
      {
         if (this .order_ .getValue () < 2)
            return [ ];

         if (! this .controlPointNode)
            return [ ];

         if (this .controlPointNode .getSize () < this .order_ .getValue ())
            return [ ];

         var
            vertexArray = this .getVertices (),
            array       = [ ];

         if (vertexArray .length)
         {
            for (var i = 0, length = vertexArray .length; i < length; i += 8)
               array .push (vertexArray [i], vertexArray [i + 1], vertexArray [i + 2]);

            array .push (vertexArray [length - 4], vertexArray [length - 3], vertexArray [length - 2]);
         }

         return array;
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

         this .sampleOptions .resolution [0] = this .getTessellation (knots .length);
         this .sampleOptions .haveWeights    = Boolean (weights);

         var
            mesh        = nurbs .sample (this .mesh, surface, this .sampleOptions),
            points      = mesh .points,
            vertexArray = this .getVertices ();

         for (var i2 = 3, length = points .length; i2 < length; i2 += 3)
         {
            var i1 = i2 - 3;

            vertexArray .push (points [i1], points [i1 + 1], points [i1 + 2], 1);
            vertexArray .push (points [i2], points [i2 + 1], points [i2 + 2], 1);
         }
      },
   });

   return NurbsCurve;
});
