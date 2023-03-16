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

import Fields               from "../../Fields.js";
import X3DFieldDefinition   from "../../Base/X3DFieldDefinition.js";
import FieldDefinitionArray from "../../Base/FieldDefinitionArray.js";
import X3DBaseNode          from "../../Base/X3DBaseNode.js";
import X3DConstants         from "../../Base/X3DConstants.js";
import PrimitiveQuality     from "./PrimitiveQuality.js";
import Shading              from "./Shading.js";
import TextureQuality       from "./TextureQuality.js";
import Algorithm            from "../../../standard/Math/Algorithm.js";

function BrowserOptions (executionContext)
{
   X3DBaseNode .call (this, executionContext);

   this .addAlias ("AntiAliased", this ._Antialiased);

   const browser = this .getBrowser ();

   this .localStorage     = browser .getLocalStorage () .addNameSpace ("BrowserOptions.");
   this .textureQuality   = TextureQuality .MEDIUM
   this .primitiveQuality = PrimitiveQuality .MEDIUM;
   this .shading          = Shading .GOURAUD;
}

BrowserOptions .prototype = Object .assign (Object .create (X3DBaseNode .prototype),
{
   constructor: BrowserOptions,
   [Symbol .for ("X_ITE.X3DBaseNode.fieldDefinitions")]: new FieldDefinitionArray ([
      new X3DFieldDefinition (X3DConstants .inputOutput, "SplashScreen",           new Fields .SFBool (true)),
      new X3DFieldDefinition (X3DConstants .inputOutput, "Dashboard",              new Fields .SFBool (true)),
      new X3DFieldDefinition (X3DConstants .inputOutput, "Rubberband",             new Fields .SFBool (true)),
      new X3DFieldDefinition (X3DConstants .inputOutput, "EnableInlineViewpoints", new Fields .SFBool (true)),
      new X3DFieldDefinition (X3DConstants .inputOutput, "Antialiased",            new Fields .SFBool (true)),
      new X3DFieldDefinition (X3DConstants .inputOutput, "TextureQuality",         new Fields .SFString ("MEDIUM")),
      new X3DFieldDefinition (X3DConstants .inputOutput, "PrimitiveQuality",       new Fields .SFString ("MEDIUM")),
      new X3DFieldDefinition (X3DConstants .inputOutput, "QualityWhenMoving",      new Fields .SFString ("MEDIUM")),
      new X3DFieldDefinition (X3DConstants .inputOutput, "Shading",                new Fields .SFString ("GOURAUD")),
      new X3DFieldDefinition (X3DConstants .inputOutput, "MotionBlur",             new Fields .SFBool ()),
      new X3DFieldDefinition (X3DConstants .inputOutput, "Cache",                  new Fields .SFBool (true)),
      new X3DFieldDefinition (X3DConstants .inputOutput, "ContentScale",           new Fields .SFFloat (1)),
      new X3DFieldDefinition (X3DConstants .inputOutput, "ContextMenu",            new Fields .SFBool (true)),
      new X3DFieldDefinition (X3DConstants .inputOutput, "Debug",                  new Fields .SFBool ()),
      new X3DFieldDefinition (X3DConstants .inputOutput, "Gravity",                new Fields .SFFloat (9.80665)),
      new X3DFieldDefinition (X3DConstants .inputOutput, "LogarithmicDepthBuffer", new Fields .SFBool ()),
      new X3DFieldDefinition (X3DConstants .inputOutput, "Notifications",          new Fields .SFBool (true)),
      new X3DFieldDefinition (X3DConstants .inputOutput, "Multisampling",          new Fields .SFInt32 (4)),
      new X3DFieldDefinition (X3DConstants .inputOutput, "StraightenHorizon",      new Fields .SFBool (true)),
      new X3DFieldDefinition (X3DConstants .inputOutput, "Timings",                new Fields .SFBool ()),
   ]),
   getTypeName: function ()
   {
      return "BrowserOptions";
   },
   getComponentName: function ()
   {
      return "X_ITE";
   },
   getContainerField: function ()
   {
      return "browserOptions";
   },
   initialize: function ()
   {
      X3DBaseNode .prototype .initialize .call (this);

      this .localStorage .addDefaultValues ({
         Rubberband:        this ._Rubberband        .getValue (),
         PrimitiveQuality:  this ._PrimitiveQuality  .getValue (),
         TextureQuality:    this ._TextureQuality    .getValue (),
         StraightenHorizon: this ._StraightenHorizon .getValue (),
         Timings:           this ._Timings           .getValue (),
      });

      this ._Rubberband             .addInterest ("set_rubberband__",             this);
      this ._Antialiased            .addInterest ("set_antialiased__",            this);
      this ._PrimitiveQuality       .addInterest ("set_primitiveQuality__",       this);
      this ._TextureQuality         .addInterest ("set_textureQuality__",         this);
      this ._Shading                .addInterest ("set_shading__",                this);
      this ._StraightenHorizon      .addInterest ("set_straightenHorizon__",      this);
      this ._ContentScale           .addInterest ("set_contentScale__",           this);
      this ._LogarithmicDepthBuffer .addInterest ("set_logarithmicDepthBuffer__", this);
      this ._Multisampling          .addInterest ("set_multisampling__",          this);

      this .configure ();
   },
   configure: (function ()
   {
      const attributes = new Set ([
         "Antialiased",
         "Cache",
         "ContentScale",
         "ContextMenu",
         "Debug",
         "Multisampling",
         "Notifications",
         "SplashScreen",
      ]);

      const restorable = [
         "Rubberband",
         "PrimitiveQuality",
         "TextureQuality",
         "StraightenHorizon",
         "Timings",
      ];

      return function ()
      {
         const
            browser      = this .getBrowser (),
            localStorage = this .localStorage;

         for (const { name, value } of this .getFieldDefinitions ())
         {
            if (attributes .has (name))
            {
               const attribute = name [0] .toLowerCase () + name .slice (1);
               browser .attributeChangedCallback (attribute, null, browser .getElement () .attr (name));
               continue;
            }

            if (localStorage [name] !== undefined)
               continue;

            const field = this .getField (name);

            if (field .equals (value))
               continue;

            field .assign (value);
         }

         for (const name of restorable)
         {
            const
               value = localStorage [name],
               field = this .getField (name);

            if (value !== field .getValue ())
               field .setValue (value);
         }
      };
   })(),
   getPrimitiveQuality: function ()
   {
      return this .primitiveQuality;
   },
   getShading: function ()
   {
      return this .shading;
   },
   getTextureQuality: function ()
   {
      return this .textureQuality;
   },
   set_rubberband__: function (rubberband)
   {
      this .localStorage .Rubberband = rubberband .getValue ();
   },
   set_antialiased__: function ()
   {
      this .set_multisampling__ (this ._Multisampling);
   },
   set_primitiveQuality__: function (value)
   {
      const
         browser          = this .getBrowser (),
         primitiveQuality = value .getValue () .toUpperCase ();

      this .localStorage .PrimitiveQuality = primitiveQuality;
      this .primitiveQuality               = this .getEnum (PrimitiveQuality, primitiveQuality, PrimitiveQuality .MEDIUM);

      if (typeof browser .setPrimitiveQuality2D === "function")
         browser .setPrimitiveQuality2D (this .primitiveQuality);

      if (typeof browser .setPrimitiveQuality3D === "function")
         browser .setPrimitiveQuality3D (this .primitiveQuality);
   },
   set_textureQuality__: function (value)
   {
      const
         browser        = this .getBrowser (),
         textureQuality = value .getValue () .toUpperCase ();

      this .localStorage .TextureQuality = textureQuality;
      this .textureQuality               = this .getEnum (TextureQuality, textureQuality, TextureQuality .MEDIUM);

      if (typeof browser .setTextureQuality === "function")
         browser .setTextureQuality (this .textureQuality);
   },
   set_shading__: (function ()
   {
      const strings = {
         [Shading .POINT]:     "POINT",
         [Shading .WIREFRAME]: "WIREFRAME",
         [Shading .FLAT]:      "FLAT",
         [Shading .GOURAUD]:   "GOURAUD",
         [Shading .PHONG]:     "PHONG",
      };

      return function (value)
      {
         const
            browser = this .getBrowser (),
            shading = value .getValue () .toUpperCase () .replace ("POINTSET", "POINT");

         this .shading = this .getEnum (Shading, shading, Shading .GOURAUD);

         browser .getRenderingProperties () ._Shading = strings [this .shading];
         browser .setShading (this .shading);
      };
   })(),
   set_straightenHorizon__: function (straightenHorizon)
   {
      this .localStorage .StraightenHorizon = straightenHorizon .getValue ();

      if (straightenHorizon .getValue ())
         this .getBrowser () .getActiveLayer ()?.straightenView ();
   },
   updateContentScale: function ()
   {
      const
         browser = this .getBrowser (),
         media   = window .matchMedia (`(resolution: ${window .devicePixelRatio}dppx)`),
         update  = this .updateContentScale .bind (this);

      if (this .removeUpdateContentScale)
         this .removeUpdateContentScale ();

      this .removeUpdateContentScale = function () { media .removeEventListener ("change", update) };

      media .addEventListener ("change", update);

      browser .getRenderingProperties () ._ContentScale = window .devicePixelRatio;

      browser .reshape ();
   },
   set_contentScale__: function (contentScale)
   {
      const browser = this .getBrowser ();

      if (this .removeUpdateContentScale)
         this .removeUpdateContentScale ();

      if (contentScale .getValue () === -1)
         this .updateContentScale ();
      else
         browser .getRenderingProperties () ._ContentScale = Math .max (contentScale .getValue (), 0) || 1;

      browser .reshape ();
   },
   set_logarithmicDepthBuffer__: function (logarithmicDepthBuffer)
   {
      const
         browser = this .getBrowser (),
         gl      = browser .getContext ();

      browser .getRenderingProperties () ._LogarithmicDepthBuffer = logarithmicDepthBuffer .getValue () && gl .HAS_FEATURE_FRAG_DEPTH;
   },
   set_multisampling__: function (multisampling)
   {
      const
         browser = this .getBrowser (),
         samples = Algorithm .clamp (multisampling .getValue (), 0, browser .getMaxSamples ());

      browser .getRenderingProperties () ._Multisampling = this ._Antialiased .getValue () ? samples : 0;
      browser .getRenderingProperties () ._Antialiased   = browser .getAntialiased ();

      browser .reshape ();
   },
});

export default BrowserOptions;
