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
   "x_ite/Components/Grouping/X3DGroupingNode",
   "x_ite/Components/Networking/X3DUrlObject",
   "x_ite/Components/PointingDeviceSensor/TouchSensor",
   "x_ite/Rendering/TraverseType",
   "x_ite/Base/X3DConstants",
   "x_ite/InputOutput/FileLoader",
],
function (Fields,
          X3DFieldDefinition,
          FieldDefinitionArray,
          X3DGroupingNode,
          X3DUrlObject,
          TouchSensor,
          TraverseType,
          X3DConstants,
          FileLoader)
{
"use strict";

   function Anchor (executionContext)
   {
      X3DGroupingNode .call (this, executionContext);
      X3DUrlObject    .call (this, executionContext);

      this .addType (X3DConstants .Anchor);

      this .touchSensorNode = new TouchSensor (executionContext);
      this .anchorSensors   = new Map ();
   }

   Anchor .prototype = Object .assign (Object .create (X3DGroupingNode .prototype),
      X3DUrlObject .prototype,
   {
      constructor: Anchor,
      [Symbol .for ("X_ITE.X3DBaseNode.fieldDefinitions")]: new FieldDefinitionArray ([
         new X3DFieldDefinition (X3DConstants .inputOutput,    "metadata",             new Fields .SFNode ()),
         new X3DFieldDefinition (X3DConstants .inputOutput,    "description",          new Fields .SFString ()),
         new X3DFieldDefinition (X3DConstants .inputOutput,    "load",                 new Fields .SFBool (true)),
         new X3DFieldDefinition (X3DConstants .inputOutput,    "url",                  new Fields .MFString ()),
         new X3DFieldDefinition (X3DConstants .inputOutput,    "parameter",            new Fields .MFString ()),
         new X3DFieldDefinition (X3DConstants .inputOutput,    "autoRefresh",          new Fields .SFTime ()),
         new X3DFieldDefinition (X3DConstants .inputOutput,    "autoRefreshTimeLimit", new Fields .SFTime (3600)),
         new X3DFieldDefinition (X3DConstants .inputOutput,    "visible",              new Fields .SFBool (true)),
         new X3DFieldDefinition (X3DConstants .inputOutput,    "bboxDisplay",          new Fields .SFBool ()),
         new X3DFieldDefinition (X3DConstants .initializeOnly, "bboxSize",             new Fields .SFVec3f (-1, -1, -1)),
         new X3DFieldDefinition (X3DConstants .initializeOnly, "bboxCenter",           new Fields .SFVec3f ()),
         new X3DFieldDefinition (X3DConstants .inputOnly,      "addChildren",          new Fields .MFNode ()),
         new X3DFieldDefinition (X3DConstants .inputOnly,      "removeChildren",       new Fields .MFNode ()),
         new X3DFieldDefinition (X3DConstants .inputOutput,    "children",             new Fields .MFNode ()),
      ]),
      getTypeName: function ()
      {
         return "Anchor";
      },
      getComponentName: function ()
      {
         return "Networking";
      },
      getContainerField: function ()
      {
         return "children";
      },
      initialize: function ()
      {
         X3DGroupingNode .prototype .initialize .call (this);
         X3DUrlObject    .prototype .initialize .call (this);

         this ._description .addFieldInterest (this .touchSensorNode ._description);
         this ._load        .addFieldInterest (this .touchSensorNode ._enabled);

         this .touchSensorNode ._description = this ._description;
         this .touchSensorNode ._enabled     = this ._load;
         this .touchSensorNode .setup ();

         // Modify set_active__ to get immediate response to user action (click event), otherwise links are not opened in this window.

         const
            anchor       = this,
            set_active__ = this .touchSensorNode .set_active__;

         this .touchSensorNode .set_active__ = function (active, hit)
         {
            set_active__ .call (this, active, hit);

            if (this ._isOver .getValue () && ! active)
               anchor .requestImmediateLoad ();
         };
      },
      set_load__: function ()
      { },
      set_url__: function ()
      { },
      requestImmediateLoad: function (cache = true)
      {
         this .setCache (cache);
         this .setLoadState (X3DConstants .IN_PROGRESS_STATE, false);

         new FileLoader (this) .createX3DFromURL (this ._url, this ._parameter,
         function (scene)
         {
            if (scene)
            {
               this .getBrowser () .replaceWorld (scene);
               this .setLoadState (X3DConstants .COMPLETE_STATE, false);
            }
            else
               this .setLoadState (X3DConstants .FAILED_STATE, false);
         }
         .bind (this),
         function (viewpointName)
         {
            this .getBrowser () .changeViewpoint (viewpointName);
            this .setLoadState (X3DConstants .COMPLETE_STATE, false);
         }
         .bind (this),
         function (url, target)
         {
            if (target)
               window .open (url, target);
            else
               location = url;

            this .setLoadState (X3DConstants .COMPLETE_STATE, false);
         }
         .bind (this));
      },
      requestUnload ()
      { },
      traverse: function (type, renderObject)
      {
         if (type === TraverseType .POINTER)
         {
            const
               sensorsStack = this .getBrowser () .getSensors (),
               sensors      = this .anchorSensors;

            sensors .clear ();

            this .touchSensorNode .push (renderObject, sensors);

            if (sensors .size)
            {
               sensorsStack .push (sensors);

               X3DGroupingNode .prototype .traverse .call (this, type, renderObject);

               sensorsStack .pop ();
            }
            else
            {
               X3DGroupingNode .prototype .traverse .call (this, type, renderObject);
            }
          }
         else
         {
            X3DGroupingNode .prototype .traverse .call (this, type, renderObject);
         }
      },
   });

   return Anchor;
});
