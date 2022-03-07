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
   "x_ite/Components/Texturing/X3DSingleTextureNode",
   "x_ite/Base/X3DConstants",
],
function (X3DSingleTextureNode,
          X3DConstants)
{
"use strict";

   const defaultData = new Uint8Array ([ 255, 255, 255, 255 ]);

   function X3DTexture2DNode (executionContext)
   {
      X3DSingleTextureNode .call (this, executionContext);

      this .addType (X3DConstants .X3DTexture2DNode);

      const gl = this .getBrowser () .getContext ();

      this .target = gl .TEXTURE_2D;
      this .width  = 0;
      this .height = 0;
      this .flipY  = false;
      this .data   = null;
   }

   X3DTexture2DNode .prototype = Object .assign (Object .create (X3DSingleTextureNode .prototype),
   {
      constructor: X3DTexture2DNode,
      initialize: function ()
      {
         X3DSingleTextureNode .prototype .initialize .call (this);

         this ._repeatS .addInterest ("updateTextureProperties", this);
         this ._repeatT .addInterest ("updateTextureProperties", this);

         const gl = this .getBrowser () .getContext ();

         gl .bindTexture (gl .TEXTURE_2D, this .getTexture ());
         gl .texImage2D  (gl .TEXTURE_2D, 0, gl .RGBA, 1, 1, 0, gl .RGBA, gl .UNSIGNED_BYTE, defaultData);
      },
      getTarget: function ()
      {
         return this .target;
      },
      getWidth: function ()
      {
         return this .width;
      },
      getHeight: function ()
      {
         return this .height;
      },
      getFlipY: function ()
      {
         return this .flipY;
      },
      getData: function ()
      {
         return this .data;
      },
      clearTexture: function ()
      {
         this .setTexture (1, 1, false, defaultData, false);

         this .data = null;
      },
      setTexture: function (width, height, transparent, data, flipY)
      {
         try
         {
            this .width  = width;
            this .height = height;
            this .flipY  = flipY;
            this .data   = data;

            const gl = this .getBrowser () .getContext ();

            gl .pixelStorei (gl .UNPACK_FLIP_Y_WEBGL, flipY);
            gl .pixelStorei (gl .UNPACK_ALIGNMENT, 1);
            gl .bindTexture (gl .TEXTURE_2D, this .getTexture ());
            gl .texImage2D  (gl .TEXTURE_2D, 0, gl .RGBA, width, height, 0, gl .RGBA, gl .UNSIGNED_BYTE, data);

            this .setTransparent (transparent);
            this .updateTextureProperties ();
            this .addNodeEvent ();
         }
         catch (error)
         { }
      },
      updateTexture: function (data, flipY)
      {
         try
         {
            this .data = data;

            const gl = this .getBrowser () .getContext ();

            gl .pixelStorei (gl .UNPACK_FLIP_Y_WEBGL, flipY);
            gl .bindTexture (gl .TEXTURE_2D, this .getTexture ());
            gl .texSubImage2D (gl .TEXTURE_2D, 0, 0, 0, gl .RGBA, gl .UNSIGNED_BYTE, data);

            if (this .texturePropertiesNode ._generateMipMaps .getValue ())
               gl .generateMipmap (gl .TEXTURE_2D);

            this .addNodeEvent ();
         }
         catch (error)
         { }
      },
      updateTextureProperties: function ()
      {
         X3DSingleTextureNode .prototype .updateTextureProperties .call (this,
                                                                         this .target,
                                                                         this ._textureProperties .getValue (),
                                                                         this .texturePropertiesNode,
                                                                         this .width,
                                                                         this .height,
                                                                         this ._repeatS .getValue (),
                                                                         this ._repeatT .getValue (),
                                                                         false);
      },
      setShaderUniformsToChannel: function (gl, shaderObject, renderObject, i)
      {
         gl .activeTexture (gl .TEXTURE0 + shaderObject .getBrowser () .getTexture2DUnits () [i]);
         gl .bindTexture (gl .TEXTURE_2D, this .getTexture ());
         gl .uniform1i (shaderObject .x3d_TextureType [i], 2);
      },
   });

   return X3DTexture2DNode;
});
