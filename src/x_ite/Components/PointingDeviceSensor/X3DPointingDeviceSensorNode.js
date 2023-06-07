/*******************************************************************************
 *
 * DO NOT ALTER OR REMOVE COPYRIGHT NOTICES OR THIS FILE HEADER.
 *
 * Copyright create3000, Scheffelstraße 31a, Leipzig, Germany 2011 - 2022.
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
 * Copyright 2011 - 2022, Holger Seelig <holger.seelig@yahoo.de>.
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
 * along with X_ITE.  If not, see <https://www.gnu.org/licenses/gpl.html> for a
 * copy of the GPLv3 License.
 *
 * For Silvio, Joy and Adi.
 *
 ******************************************************************************/

import X3DSensorNode                 from "../Core/X3DSensorNode.js";
import PointingDeviceSensorContainer from "../../Browser/PointingDeviceSensor/PointingDeviceSensorContainer.js";
import X3DConstants                  from "../../Base/X3DConstants.js";

function X3DPointingDeviceSensorNode (executionContext)
{
   X3DSensorNode .call (this, executionContext);

   this .addType (X3DConstants .X3DPointingDeviceSensorNode);
}

X3DPointingDeviceSensorNode .prototype = Object .assign (Object .create (X3DSensorNode .prototype),
{
   constructor: X3DPointingDeviceSensorNode,
   initialize ()
   {
      X3DSensorNode .prototype .initialize .call (this);

      this .getLive () .addInterest ("set_live__", this);

      this ._enabled .addInterest ("set_live__", this);

      this .set_live__ ();
   },
   set_live__ ()
   {
      if (this .getLive () .getValue () && this ._enabled .getValue ())
      {
         this .getBrowser () .addPointingDeviceSensor (this);

         delete this .push;
      }
      else
      {
         this .getBrowser () .removePointingDeviceSensor (this);

         if (this ._isActive .getValue ())
            this ._isActive = false;

         if (this ._isOver .getValue ())
            this ._isOver = false;

         this .push = Function .prototype;
      }
   },
   set_over__ (over, hit)
   {
      if (over !== this ._isOver .getValue ())
      {
         this ._isOver = over;

         if (over)
            this .getBrowser () .getNotification () ._string = this ._description;
      }
   },
   set_active__ (active, hit)
   {
      if (active !== this ._isActive .getValue ())
         this ._isActive = active
   },
   set_motion__ (hit)
   { },
   push (renderObject, sensors)
   {
      sensors .push (new PointingDeviceSensorContainer (this,
                                                        renderObject .getModelViewMatrix  () .get (),
                                                        renderObject .getProjectionMatrix () .get (),
                                                        renderObject .getViewVolume () .getViewport ()));
   },
});

Object .defineProperties (X3DPointingDeviceSensorNode,
{
   typeName:
   {
      value: "X3DPointingDeviceSensorNode",
      enumerable: true,
   },
   componentName:
   {
      value: "PointingDeviceSensor",
      enumerable: true,
   },
});

export default X3DPointingDeviceSensorNode;
