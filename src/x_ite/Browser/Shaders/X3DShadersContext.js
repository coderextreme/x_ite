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
   "x_ite/Browser/Core/Shading",
   "x_ite/Components/Shaders/ComposedShader",
   "x_ite/Components/Shaders/ShaderPart",
   "x_ite/Browser/Shaders/ShaderTest",
   "x_ite/Browser/Networking/urls",
],
function (Shading,
          ComposedShader,
          ShaderPart,
          ShaderTest,
          urls)
{
"use strict";

   const
      _shaders       = Symbol (),
      _defaultShader = Symbol (),
      _pointShader   = Symbol (),
      _lineShader    = Symbol (),
      _unlitShader   = Symbol (),
      _gouraudShader = Symbol (),
      _phongShader   = Symbol (),
      _shadowShader  = Symbol (),
      _depthShader   = Symbol ();

   function X3DShadersContext ()
   {
      this [_shaders] = new Set ();
   }

   X3DShadersContext .prototype =
   {
      initialize: function ()
      {
         this .setShading (this .getBrowserOptions () .getShading ());
      },
      getShadingLanguageVersion: function ()
      {
         return this .getContext () .getParameter (this .getContext () .SHADING_LANGUAGE_VERSION);
      },
      getMaxVertexUniformVectors: function ()
      {
         return this .getContext () .getParameter (this .getContext () .MAX_VERTEX_UNIFORM_VECTORS);
      },
      getMaxFragmentUniformVectors: function ()
      {
         return this .getContext () .getParameter (this .getContext () .MAX_FRAGMENT_UNIFORM_VECTORS);
      },
      getMaxVertexAttribs: function ()
      {
         return this .getContext () .getParameter (this .getContext () .MAX_VERTEX_ATTRIBS);
      },
      addShader: function (shader)
      {
         this [_shaders] .add (shader);

         shader .setShading (this .getBrowserOptions () .getShading ());
      },
      removeShader: function (shader)
      {
         this [_shaders] .delete (shader);
      },
      getShaders: function ()
      {
         return this [_shaders];
      },
      getDefaultShader: function ()
      {
         return this [_defaultShader];
      },
      hasPointShader: function ()
      {
         return !! this [_pointShader];
      },
      getPointShader: function ()
      {
         this [_pointShader] = this .createShader ("PointShader", "PointSet");

         this .getPointShader = function () { return this [_pointShader]; };

         Object .defineProperty (this, "getPointShader", { enumerable: false });

         return this [_pointShader];
      },
      hasLineShader: function ()
      {
         return !! this [_lineShader];
      },
      getLineShader: function ()
      {
         this [_lineShader] = this .createShader ("WireframeShader", "Wireframe");

         this .getLineShader = function () { return this [_lineShader]; };

         Object .defineProperty (this, "getLineShader", { enumerable: false });

         return this [_lineShader];
      },
      hasUnlitShader: function ()
      {
         return !! this [_unlitShader];
      },
      getUnlitShader: function ()
      {
         this [_unlitShader] = this .createShader ("UnlitShader", "Unlit");

         this [_unlitShader] .isValid_ .addInterest ("set_unlit_shader_valid__", this);

         this .getUnlitShader = function () { return this [_unlitShader]; };

         Object .defineProperty (this, "getUnlitShader", { enumerable: false });

         return this [_unlitShader];
      },
      hasGouraudShader: function ()
      {
         return !! this [_gouraudShader];
      },
      getGouraudShader: function ()
      {
         this [_gouraudShader] = this .createShader ("GouraudShader", "Gouraud", false);

         this [_gouraudShader] .isValid_ .addInterest ("set_gouraud_shader_valid__", this);

         this .getGouraudShader = function () { return this [_gouraudShader]; };

         Object .defineProperty (this, "getGouraudShader", { enumerable: false });

         return this [_gouraudShader];
      },
      hasPhongShader: function ()
      {
         return !! this [_phongShader];
      },
      getPhongShader: function ()
      {
         this [_phongShader] = this .createShader ("PhongShader", "Phong", false);

         this [_phongShader] .isValid_ .addInterest ("set_phong_shader_valid__", this);

         this .getPhongShader = function () { return this [_phongShader]; };

         Object .defineProperty (this, "getPhongShader", { enumerable: false });

         return this [_phongShader];
      },
      hasShadowShader: function ()
      {
         return !! this [_shadowShader];
      },
      getShadowShader: function ()
      {
         this [_shadowShader] = this .createShader ("ShadowShader", "Phong", true);

         this [_shadowShader] .isValid_ .addInterest ("set_shadow_shader_valid__", this);

         this .getShadowShader = function () { return this [_shadowShader]; };

         Object .defineProperty (this, "getShadowShader", { enumerable: false });

         return this [_shadowShader];
      },
      hasDepthShader: function ()
      {
         return !! this [_depthShader];
      },
      getDepthShader: function ()
      {
         this [_depthShader] = this .createShader ("DepthShader", "Depth");

         this .getDepthShader = function () { return this [_depthShader]; };

         Object .defineProperty (this, "getDepthShader", { enumerable: false });

         return this [_depthShader];
      },
      setShading: function (type)
      {
         switch (type)
         {
            case Shading .PHONG:
            {
               this [_defaultShader] = this .getPhongShader ();
               break;
            }
            default:
            {
               this [_defaultShader] = this .getGouraudShader ();
               break;
            }
         }

         // Configure shaders.

         for (const shader of this .getShaders ())
            shader .setShading (type);
      },
      createShader: function (name, file, shadow = false)
      {
         if (this .getDebug ())
            console .log ("Initializing " + name);

         const version = this .getContext () .getVersion ();

         const vertexShader = new ShaderPart (this .getPrivateScene ());
         vertexShader .setName (name + "Vertex");
         vertexShader .url_ .push (urls .getShaderUrl ("webgl" + version + "/" + file + ".vs"));
         vertexShader .setShadow (shadow);
         vertexShader .setup ();

         const fragmentShader = new ShaderPart (this .getPrivateScene ());
         fragmentShader .setName (name + "Fragment");
         fragmentShader .type_  = "FRAGMENT";
         fragmentShader .url_ .push (urls .getShaderUrl ("webgl" + version + "/" + file + ".fs"));
         fragmentShader .setShadow (shadow);
         fragmentShader .setup ();

         const shader = new ComposedShader (this .getPrivateScene ());
         shader .setName (name);
         shader .language_ = "GLSL";
         shader .parts_ .push (vertexShader);
         shader .parts_ .push (fragmentShader);
         shader .setCustom (false);
         shader .setShading (this .getBrowserOptions () .getShading ());
         shader .setup ();

         this .addShader (shader);

         return shader;
      },
      set_unlit_shader_valid__: function (valid)
      {
         this [_unlitShader] .isValid_ .removeInterest ("set_unlit_shader_valid__", this);

         if (valid .getValue () && ShaderTest .verify (this, this [_unlitShader]))
            return;

         console .error ("X_ITE: Unlit shading is not available, using fallback VRML shader.");

         // Recompile shader.
         this [_unlitShader] .parts_ [0] .url = [ urls .getShaderUrl ("webgl1/FallbackUnlit.vs") ];
         this [_unlitShader] .parts_ [1] .url = [ urls .getShaderUrl ("webgl1/FallbackUnlit.fs") ];
      },
      set_gouraud_shader_valid__: function (valid)
      {
         this [_gouraudShader] .isValid_ .removeInterest ("set_gouraud_shader_valid__", this);

         if (valid .getValue () && ShaderTest .verify (this, this [_gouraudShader]))
            return;

         console .warn ("X_ITE: All else fails, using fallback VRML shader.");

         // Recompile shader.
         this [_gouraudShader] .parts_ [0] .url = [ urls .getShaderUrl ("webgl1/Fallback.vs") ];
         this [_gouraudShader] .parts_ [1] .url = [ urls .getShaderUrl ("webgl1/Fallback.fs") ];
      },
      set_phong_shader_valid__: function (valid)
      {
         this [_phongShader] .isValid_ .removeInterest ("set_phong_shader_valid__", this);

         if (valid .getValue () && ShaderTest .verify (this, this [_phongShader]))
            return;

         console .warn ("X_ITE: Phong shading is not available, using Gouraud shading.");

         this [_phongShader] = this .getGouraudShader ();

         this .setShading (this .getBrowserOptions () .getShading ());
      },
      set_shadow_shader_valid__: function (valid)
      {
         this [_shadowShader] .isValid_ .removeInterest ("set_shadow_shader_valid__", this);

         if (valid .getValue () && ShaderTest .verify (this, this [_shadowShader]))
            return;

         console .warn ("X_ITE: Shadow shading is not available, using Gouraud shading.");

         this [_shadowShader] = this .getGouraudShader ();
      },
   };

   return X3DShadersContext;
});
