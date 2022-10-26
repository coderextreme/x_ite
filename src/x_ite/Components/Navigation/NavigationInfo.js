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
   "x_ite/Components/Core/X3DBindableNode",
   "x_ite/Rendering/TraverseType",
   "x_ite/Base/X3DConstants",
],
function (Fields,
          X3DFieldDefinition,
          FieldDefinitionArray,
          X3DBindableNode,
          TraverseType,
          X3DConstants)
{
"use strict";

   const TransitionType =
   {
      TELEPORT: true,
      LINEAR:   true,
      ANIMATE:  true,
   };

   function NavigationInfo (executionContext)
   {
      X3DBindableNode .call (this, executionContext);

      this .addType (X3DConstants .NavigationInfo);

      this .addChildObjects ("transitionStart",  new Fields .SFBool (),
                             "availableViewers", new Fields .MFString (),
                             "viewer",           new Fields .SFString ("EXAMINE"));

      this ._avatarSize      .setUnit ("length");
      this ._speed           .setUnit ("speed");
      this ._visibilityLimit .setUnit ("speed");
   }

   NavigationInfo .prototype = Object .assign (Object .create (X3DBindableNode .prototype),
   {
      constructor: NavigationInfo,
      [Symbol .for ("X_ITE.X3DBaseNode.fieldDefinitions")]: new FieldDefinitionArray ([
         new X3DFieldDefinition (X3DConstants .inputOutput, "metadata",           new Fields .SFNode ()),
         new X3DFieldDefinition (X3DConstants .inputOnly,   "set_bind",           new Fields .SFBool ()),
         new X3DFieldDefinition (X3DConstants .inputOutput, "type",               new Fields .MFString ("EXAMINE", "ANY")),
         new X3DFieldDefinition (X3DConstants .inputOutput, "avatarSize",         new Fields .MFFloat (0.25, 1.6, 0.75)),
         new X3DFieldDefinition (X3DConstants .inputOutput, "speed",              new Fields .SFFloat (1)),
         new X3DFieldDefinition (X3DConstants .inputOutput, "headlight",          new Fields .SFBool (true)),
         new X3DFieldDefinition (X3DConstants .inputOutput, "visibilityLimit",    new Fields .SFFloat ()),
         new X3DFieldDefinition (X3DConstants .inputOutput, "transitionType",     new Fields .MFString ("LINEAR")),
         new X3DFieldDefinition (X3DConstants .inputOutput, "transitionTime",     new Fields .SFTime (1)),
         new X3DFieldDefinition (X3DConstants .outputOnly,  "transitionComplete", new Fields .SFBool ()),
         new X3DFieldDefinition (X3DConstants .outputOnly,  "isBound",            new Fields .SFBool ()),
         new X3DFieldDefinition (X3DConstants .outputOnly,  "bindTime",           new Fields .SFTime ()),
      ]),
      getTypeName: function ()
      {
         return "NavigationInfo";
      },
      getComponentName: function ()
      {
         return "Navigation";
      },
      getContainerField: function ()
      {
         return "children";
      },
      initialize: function ()
      {
         X3DBindableNode .prototype .initialize .call (this);

         this ._type               .addInterest ("set_type__",               this);
         this ._headlight          .addInterest ("set_headlight__",          this);
         this ._transitionStart    .addInterest ("set_transitionStart__",    this);
         this ._transitionComplete .addInterest ("set_transitionComplete__", this);
         this ._isBound            .addInterest ("set_isBound__",            this);

         this .set_type__ ();
         this .set_headlight__ ();
      },
      getViewer: function ()
      {
         return this ._viewer .getValue ();
      },
      getCollisionRadius: function ()
      {
         if (this ._avatarSize .length > 0)
         {
            if (this ._avatarSize [0] > 0)
               return this ._avatarSize [0];
         }

         return 0.25;
      },
      getAvatarHeight: function ()
      {
         if (this ._avatarSize .length > 1)
            return this ._avatarSize [1];

         return 1.6;
      },
      getStepHeight: function ()
      {
         if (this ._avatarSize .length > 2)
            return this ._avatarSize [2];

         return 0.75;
      },
      getNearValue: function ()
      {
         const nearValue = this .getCollisionRadius ();

         if (nearValue === 0)
            return 1e-5;

         else
            return nearValue / 2;
      },
      getFarValue: function (viewpoint)
      {
         return this ._visibilityLimit .getValue ()
                ? this ._visibilityLimit .getValue ()
                : viewpoint .getMaxFarValue ();
      },
      getTransitionType: function ()
      {
         for (const value of this ._transitionType)
         {
            const transitionType = TransitionType [value];

            if (transitionType)
               return value;
         }

         return "LINEAR";
      },
      set_type__: function ()
      {
         // Determine active viewer.

         this ._viewer = "EXAMINE";

         for (const string of this ._type)
         {
            switch (string)
            {
               case "EXAMINE":
               case "WALK":
               case "FLY":
               case "LOOKAT":
               case "PLANE":
               case "NONE":
                  this ._viewer = string;
                  break;
               case "PLANE_create3000.de":
                  this ._viewer = "PLANE";
                  break;
               default:
                  continue;
            }

            // Leave for loop.
            break;
         }

         // Determine available viewers.

         let
            examineViewer = false,
            walkViewer    = false,
            flyViewer     = false,
            planeViewer   = false,
            noneViewer    = false,
            lookAt        = false;

         if (! this ._type .length)
         {
            examineViewer = true;
            walkViewer    = true;
            flyViewer     = true;
            planeViewer   = true;
            noneViewer    = true;
            lookAt        = true;
         }
         else
         {
            for (const string of this ._type)
            {
               switch (string)
               {
                  case "EXAMINE":
                     examineViewer = true;
                     continue;
                  case "WALK":
                     walkViewer = true;
                     continue;
                  case "FLY":
                     flyViewer = true;
                     continue;
                  case "LOOKAT":
                     lookAt = true;
                     continue;
                  case "PLANE":
                     planeViewer = true;
                     continue;
                  case "NONE":
                     noneViewer = true;
                     continue;
                  case "ANY":
                     examineViewer = true;
                     walkViewer    = true;
                     flyViewer     = true;
                     planeViewer   = true;
                     noneViewer    = true;
                     lookAt        = true;
                     break;
                  default:
                     // Some string defaults to EXAMINE.
                     examineViewer = true;
                     continue;
               }

               break;
            }
         }

         this ._availableViewers .length = 0;

         if (examineViewer)
            this ._availableViewers .push ("EXAMINE");

         if (walkViewer)
            this ._availableViewers .push ("WALK");

         if (flyViewer)
            this ._availableViewers .push ("FLY");

         if (planeViewer)
            this ._availableViewers .push ("PLANE");

         if (lookAt)
            this ._availableViewers .push ("LOOKAT");

         if (noneViewer)
            this ._availableViewers .push ("NONE");
      },
      set_headlight__: function ()
      {
         if (this ._headlight .getValue ())
            delete this .enable;
         else
            this .enable = Function .prototype;
      },
      set_transitionStart__: function ()
      {
         if (! this ._transitionActive .getValue ())
            this ._transitionActive = true;
      },
      set_transitionComplete__: function ()
      {
         if (this ._transitionActive .getValue ())
            this ._transitionActive = false;
      },
      set_isBound__: function ()
      {
         if (this ._isBound .getValue ())
            return;

         if (this ._transitionActive .getValue ())
            this ._transitionActive = false;
      },
      enable: function (type, renderObject)
      {
         if (type !== TraverseType .DISPLAY)
            return;

         if (this ._headlight .getValue ())
            renderObject .getGlobalObjects () .push (this .getBrowser () .getHeadlight ());
      },
      traverse: function (type, renderObject)
      {
         if (type !== TraverseType .CAMERA)
            return;

         renderObject .getLayer () .getNavigationInfos () .push (this);
      }
   });

   return NavigationInfo;
});
