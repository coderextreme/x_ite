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

import Fields                    from "../../Fields.js";
import X3DFieldDefinition        from "../../Base/X3DFieldDefinition.js";
import FieldDefinitionArray      from "../../Base/FieldDefinitionArray.js";
import X3DEnvironmentTextureNode from "./X3DEnvironmentTextureNode.js";
import X3DUrlObject              from "../Networking/X3DUrlObject.js";
import X3DConstants              from "../../Base/X3DConstants.js";
import Vector2                   from "../../../standard/Math/Numbers/Vector2.js";
import Algorithm                 from "../../../standard/Math/Algorithm.js";
import DEVELOPMENT               from "../../DEVELOPMENT.js";

const defaultData = new Uint8Array ([ 255, 255, 255, 255 ]);

function ImageCubeMapTexture (executionContext)
{
   X3DEnvironmentTextureNode .call (this, executionContext);
   X3DUrlObject .call (this, executionContext);

   this .addType (X3DConstants .ImageCubeMapTexture);

   this .image    = $("<img></img>");
   this .canvas   = $("<canvas></canvas>");
   this .urlStack = new Fields .MFString ();
}

Object .assign (Object .setPrototypeOf (ImageCubeMapTexture .prototype, X3DEnvironmentTextureNode .prototype),
   X3DUrlObject .prototype,
{
   initialize ()
   {
      X3DEnvironmentTextureNode .prototype .initialize .call (this);
      X3DUrlObject              .prototype .initialize .call (this);

      // Upload default data.

      const gl = this .getBrowser () .getContext ();

      gl .bindTexture (this .getTarget (), this .getTexture ());

      for (let i = 0; i < 6; ++ i)
         gl .texImage2D  (this .getTargets () [i], 0, gl .RGBA, 1, 1, 0, gl .RGBA, gl .UNSIGNED_BYTE, defaultData);

      // Initialize.

      this .image .on ("load",        this .setImage .bind (this));
      this .image .on ("abort error", this .setError .bind (this));
      this .image .prop ("crossOrigin", "Anonymous");

      this .requestImmediateLoad () .catch (Function .prototype);
   },
   unloadData ()
   {
      this .clearTexture ();
   },
   loadData ()
   {
      this .urlStack .setValue (this ._url);
      this .loadNext ();
   },
   loadNext ()
   {
      if (this .urlStack .length === 0)
      {
         this .clearTexture ();
         this .setLoadState (X3DConstants .FAILED_STATE);
         return;
      }

      // Get URL.

      this .URL = new URL (this .urlStack .shift (), this .getExecutionContext () .getBaseURL ());

      if (this .URL .protocol !== "data:")
      {
         if (!this .getCache ())
            this .URL .searchParams .set ("_", Date .now ());
      }

      if (this .URL .pathname .match (/\.ktx2?$/))
      {
         this .getBrowser () .getKTXDecoder ()
            .then (decoder => decoder .loadKtxFromUri (this .URL))
            .then (texture => this .setKTXTexture (texture))
            .catch (error => this .setError ({ type: error .message }));
      }
      else
      {
         this .image .attr ("src", this .URL .href);
      }
   },
   setError (event)
   {
      if (this .URL .protocol !== "data:")
         console .warn (`Error loading image '${decodeURI (this .URL .href)}'`, event .type);

      this .loadNext ();
   },
   setKTXTexture (texture)
   {
      if (DEVELOPMENT)
      {
         if (this .URL .protocol !== "data:")
            console .info (`Done loading image cube map texture '${decodeURI (this .URL .href)}'`);
      }

      try
      {
         if (texture .target === this .getTarget ())
         {
            this .setTexture (texture);
            this .setTransparent (false);
            this .setHasMipMaps (texture .levels > 1);
            this .setSize (texture .baseWidth);

            this .setLoadState (X3DConstants .COMPLETE_STATE);
         }
         else
         {
            this .setError ({ type: "Invalid KTX texture target, must be 'TEXTURE_CUBE_MAP'." });
         }
      }
      catch (error)
      {
         // Catch security error from cross origin requests.
         this .setError ({ type: error .message });
      }
   },
   setImage ()
   {
      if (DEVELOPMENT)
      {
         if (this .URL .protocol !== "data:")
            console .info (`Done loading image cube map texture '${decodeURI (this .URL .href)}'`);
      }

      try
      {
         const aspectRatio = this .image .prop ("width") / this .image .prop ("height");

         if (Math .abs (aspectRatio - 4/3) < 0.01)
            this .skyBoxToCubeMap ();

         if (Math .abs (aspectRatio - 2/1) < 0.01)
            this .panoramaToCubeMap ();

         this .updateTextureParameters ();

         // Update load state.

         this .setLoadState (X3DConstants .COMPLETE_STATE);
      }
      catch (error)
      {
         // Catch security error from cross origin requests.
         this .setError ({ type: error .message });
      }
   },
   skyBoxToCubeMap: (function ()
   {
      const offsets = [
         new Vector2 (1, 1), // Front
         new Vector2 (3, 1), // Back
         new Vector2 (0, 1), // Left
         new Vector2 (2, 1), // Right
         new Vector2 (1, 0), // Top
         new Vector2 (1, 2), // Bottom
      ];

      //     -----
      //     | t |
      // -----------------
      // | l | f | r | b |
      // -----------------
      //     | b |
      //     -----

      return function ()
      {
         const
            image  = this .image [0],
            canvas = this .canvas [0],
            cx     = canvas .getContext ("2d", { willReadFrequently: true });

         let
            width     = image .width,
            height    = image .height,
            width1_4  = Math .floor (width / 4),
            height1_3 = Math .floor (height / 3);

         // Scale image.

         if (!Algorithm .isPowerOfTwo (width1_4) || !Algorithm .isPowerOfTwo (height1_3) || width1_4 * 4 !== width || height1_3 * 3 !== height)
         {
            width1_4  = Algorithm .nextPowerOfTwo (width1_4);
            height1_3 = Algorithm .nextPowerOfTwo (height1_3);
            width     = width1_4  * 4;
            height    = height1_3 * 3;

            canvas .width  = width;
            canvas .height = height;

            cx .drawImage (image, 0, 0, image .width, image .height, 0, 0, width, height);
         }
         else
         {
            canvas .width  = width;
            canvas .height = height;

            cx .drawImage (image, 0, 0);
         }

         // Extract images.

         const gl = this .getBrowser () .getContext ();

         let transparent = false;

         gl .bindTexture (this .getTarget (), this .getTexture ());

         for (let i = 0; i < 6; ++ i)
         {
            const data = cx .getImageData (offsets [i] .x * width1_4, offsets [i] .y * height1_3, width1_4, height1_3) .data;

            // Determine image alpha.

            if (!transparent)
               transparent = this .isImageTransparent (data);

            // Transfer image.

            gl .texImage2D (this .getTargets () [i], 0, gl .RGBA, width1_4, height1_3, false, gl .RGBA, gl .UNSIGNED_BYTE, new Uint8Array (data .buffer));
         }

         // Update size and transparent field.

         this .setTransparent (transparent);
         this .setSize (width1_4);
      };
   })(),
   panoramaToCubeMap ()
   {
      // Mercator Projection

      const
         browser         = this .getBrowser (),
         gl              = browser .getContext (),
         shaderNode      = browser .getPanoramaShader (),
         framebuffer     = gl .createFramebuffer (),
         panoramaTexture = gl .createTexture (),
         textureUnit     = browser .getTextureCubeUnit (),
         cubeMapSize     = this .image .prop ("height") / 2;

      // Create panorama texture.

      gl .bindTexture (gl .TEXTURE_2D, panoramaTexture);
      gl .texImage2D (gl .TEXTURE_2D, 0, gl .RGBA, gl .RGBA, gl .UNSIGNED_BYTE, this .image [0]);

      gl .texParameteri (gl .TEXTURE_2D, gl .TEXTURE_WRAP_S, gl .MIRRORED_REPEAT);
      gl .texParameteri (gl .TEXTURE_2D, gl .TEXTURE_WRAP_T, gl .MIRRORED_REPEAT);
      gl .texParameteri (gl .TEXTURE_2D, gl .TEXTURE_MIN_FILTER, gl .LINEAR);
      gl .texParameteri (gl .TEXTURE_2D, gl .TEXTURE_MAG_FILTER, gl .LINEAR);

      // Init cube map texture.

      gl .bindTexture (this .getTarget (), this .getTexture ());

      for (let i = 0; i < 6; ++ i)
         gl .texImage2D  (this .getTargets () [i], 0, gl .RGBA, cubeMapSize, cubeMapSize, 0, gl .RGBA, gl .UNSIGNED_BYTE, null);

      // Render faces.

      gl .useProgram (shaderNode .getProgram ());

      gl .activeTexture (gl .TEXTURE0 + textureUnit);
      gl .bindTexture (gl .TEXTURE_2D, panoramaTexture);
      gl .uniform1i (shaderNode .x3d_PanoramaTexture, textureUnit);

      gl .bindFramebuffer (gl .FRAMEBUFFER, framebuffer);
      gl .viewport (0, 0, cubeMapSize, cubeMapSize);
      gl .disable (gl .DEPTH_TEST);
      gl .enable (gl .CULL_FACE);
      gl .frontFace (gl .CCW);
      gl .clearColor (0, 0, 0, 0);
      gl .bindVertexArray (browser .getFullscreenVertexArrayObject ());

      for (let i = 0; i < 6; ++ i)
      {
         gl .framebufferTexture2D (gl .FRAMEBUFFER, gl .COLOR_ATTACHMENT0, this .getTargets () [i], this .getTexture (), 0);
         gl .clear (gl .COLOR_BUFFER_BIT);

         gl .uniform1i (shaderNode .x3d_CurrentFace, i);

         gl .drawArrays (gl .TRIANGLES, 0, 6);
      }

      gl .deleteFramebuffer (framebuffer);
      gl .deleteTexture (panoramaTexture);

      browser .resetTextureUnits ();

      // Determine image alpha.

      const
         image  = this .image [0],
         canvas = this .canvas [0],
         cx     = canvas .getContext ("2d", { willReadFrequently: true });

      canvas .width  = image .width;
      canvas .height = image .height;

      cx .drawImage (image, 0, 0);

      const data = cx .getImageData (0, 0, image .width, image .height) .data;

      // Update size and transparent field.

      this .setTransparent (this .isImageTransparent (data));
      this .setSize (cubeMapSize);
   },
   dispose ()
   {
      X3DUrlObject              .prototype .dispose .call (this);
      X3DEnvironmentTextureNode .prototype .dispose .call (this);
   },
});

Object .defineProperties (ImageCubeMapTexture,
{
   typeName:
   {
      value: "ImageCubeMapTexture",
      enumerable: true,
   },
   componentName:
   {
      value: "CubeMapTexturing",
      enumerable: true,
   },
   containerField:
   {
      value: "texture",
      enumerable: true,
   },
   specificationRange:
   {
      value: Object .freeze (["3.0", "Infinity"]),
      enumerable: true,
   },
   fieldDefinitions:
   {
      value: new FieldDefinitionArray ([
         new X3DFieldDefinition (X3DConstants .inputOutput,    "metadata",             new Fields .SFNode ()),
         new X3DFieldDefinition (X3DConstants .inputOutput,    "description",          new Fields .SFString ()),
         new X3DFieldDefinition (X3DConstants .inputOutput,    "load",                 new Fields .SFBool (true)),
         new X3DFieldDefinition (X3DConstants .inputOutput,    "url",                  new Fields .MFString ()),
         new X3DFieldDefinition (X3DConstants .inputOutput,    "autoRefresh",          new Fields .SFTime ()),
         new X3DFieldDefinition (X3DConstants .inputOutput,    "autoRefreshTimeLimit", new Fields .SFTime (3600)),
         new X3DFieldDefinition (X3DConstants .initializeOnly, "textureProperties",    new Fields .SFNode ()),
      ]),
      enumerable: true,
   },
});

export default ImageCubeMapTexture;
