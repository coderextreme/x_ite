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

import Fields               from "../../Fields.js";
import X3DFieldDefinition   from "../../Base/X3DFieldDefinition.js";
import FieldDefinitionArray from "../../Base/FieldDefinitionArray.js";
import X3DConstants         from "../../Base/X3DConstants.js";
import X3DViewer            from "./X3DViewer.js";
import Vector3              from "../../../standard/Math/Numbers/Vector3.js";

typeof jquery_mousewheel; // import plugin

const macOS = /Mac OS X/i .test (navigator .userAgent)

const SCROLL_FACTOR = macOS ? 1 / 160 : 1 / 20;

const
   vector                 = new Vector3 (0 ,0, 0),
   positionOffset         = new Vector3 (0 ,0, 0),
   centerOfRotationOffset = new Vector3 (0, 0, 0);

function PlaneViewer (executionContext)
{
   X3DViewer .call (this, executionContext);

   this .button    = -1;
   this .fromPoint = new Vector3 (0, 0, 0);
   this .toPoint   = new Vector3 (0, 0, 0);
}

PlaneViewer .prototype = Object .assign (Object .create (X3DViewer .prototype),
{
   constructor: PlaneViewer,
   [Symbol .for ("X_ITE.X3DBaseNode.fieldDefinitions")]: new FieldDefinitionArray ([
      new X3DFieldDefinition (X3DConstants .outputOnly, "isActive", new Fields .SFBool ()),
   ]),
   initialize: function ()
   {
      X3DViewer .prototype .initialize .call (this);

      const
         browser = this .getBrowser (),
         element = browser .getSurface ();

      element .on ("mousedown.PlaneViewer",  this .mousedown  .bind (this));
      element .on ("mouseup.PlaneViewer",    this .mouseup    .bind (this));
      element .on ("mousemove.PlaneViewer",  this .mousemove  .bind (this));
      element .on ("mousewheel.PlaneViewer", this .mousewheel .bind (this));
   },
   mousedown: function (event)
   {
      if (this .button >= 0)
         return;

      const
         offset = this .getBrowser () .getSurface () .offset (),
         x      = event .pageX - offset .left,
         y      = event .pageY - offset .top;

      switch (this .getButton (event .button))
      {
         case 1:
         {
            // Stop event propagation.

            event .preventDefault ();
            event .stopImmediatePropagation ();

            this .button = event .button;

            this .getBrowser () .getSurface () .off ("mousemove.PlaneViewer");
            $(document) .on ("mouseup.PlaneViewer"   + this .getId (), this .mouseup .bind (this));
            $(document) .on ("mousemove.PlaneViewer" + this .getId (), this .mousemove .bind (this));

            this .getActiveViewpoint () .transitionStop ();
            this .getBrowser () .setCursor ("MOVE");

            this .getPointOnCenterPlane (x, y, this .fromPoint);

            this ._isActive = true;
            break;
         }
      }
   },
   mouseup: function (event)
   {
      // Stop event propagation.

      event .preventDefault ();
      event .stopImmediatePropagation ();

      if (event .button !== this .button)
         return;

      this .button = -1;

      $(document) .off (".PlaneViewer" + this .getId ());
      this .getBrowser () .getSurface () .on ("mousemove.PlaneViewer", this .mousemove .bind (this));

      this .getBrowser () .setCursor ("DEFAULT");

      this ._isActive = false;
   },
   mousemove: function (event)
   {
      const
         offset = this .getBrowser () .getSurface () .offset (),
         x      = event .pageX - offset .left,
         y      = event .pageY - offset .top;

      switch (this .getButton (this .button))
      {
         case 1:
         {
            // Stop event propagation.

            event .preventDefault ();
            event .stopImmediatePropagation ();

            // Move.

            const
               viewpoint   = this .getActiveViewpoint (),
               toPoint     = this .getPointOnCenterPlane (x, y, this .toPoint),
               translation = viewpoint .getUserOrientation () .multVecRot (this .fromPoint .subtract (toPoint));

            viewpoint ._positionOffset         = positionOffset         .assign (viewpoint ._positionOffset         .getValue ()) .add (translation);
            viewpoint ._centerOfRotationOffset = centerOfRotationOffset .assign (viewpoint ._centerOfRotationOffset .getValue ()) .add (translation);

            this .fromPoint .assign (toPoint);
            break;
         }
      }
   },
   mousewheel: function (event)
   {
      // Stop event propagation.

      event .preventDefault ();
      event .stopImmediatePropagation ();

      const
         offset = this .getBrowser () .getSurface () .offset (),
         x      = event .pageX - offset .left,
         y      = event .pageY - offset .top;

      // Change viewpoint position.

      const
         viewpoint = this .getActiveViewpoint (),
         fromPoint = this .getPointOnCenterPlane (x, y, this .fromPoint);

      viewpoint .transitionStop ();

      if (event .deltaY > 0) // Move backwards.
      {
         viewpoint ._fieldOfViewScale = Math .max (0.00001, viewpoint ._fieldOfViewScale .getValue () * (1 - SCROLL_FACTOR));
      }
      else if (event .deltaY < 0) // Move forwards.
      {
         viewpoint ._fieldOfViewScale = viewpoint ._fieldOfViewScale .getValue () * (1 + SCROLL_FACTOR);

         this .constrainFieldOfViewScale ();
      }

      if (viewpoint .set_fieldOfView___)
         viewpoint .set_fieldOfView___ (); // XXX: Immediately apply fieldOfViewScale;

      const
         toPoint     = this .getPointOnCenterPlane (x, y, this .toPoint),
         translation = viewpoint .getUserOrientation () .multVecRot (vector .assign (fromPoint) .subtract (toPoint));

      viewpoint ._positionOffset         = positionOffset         .assign (viewpoint ._positionOffset         .getValue ()) .add (translation);
      viewpoint ._centerOfRotationOffset = centerOfRotationOffset .assign (viewpoint ._centerOfRotationOffset .getValue ()) .add (translation);
   },
   constrainFieldOfViewScale: function ()
   {
      const viewpoint = this .getActiveViewpoint ();

      if (viewpoint .getTypeName () .match (/^(?:Viewpoint|GeoViewpoint)$/))
      {
         if (viewpoint ._fieldOfView .getValue () * viewpoint ._fieldOfViewScale .getValue () >= Math .PI)
            viewpoint ._fieldOfViewScale = (Math .PI - 0.001) / viewpoint ._fieldOfView .getValue ();
      }
   },
   dispose: function ()
   {
      this .getBrowser () .getSurface () .off (".PlaneViewer");
      $(document) .off (".PlaneViewer" + this .getId ());
   },
});

export default PlaneViewer;
