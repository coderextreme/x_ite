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

function MultiSampleFrameBuffer (browser, width, height, samples, oit)
{
   const gl = browser .getContext ();

   if (gl .getVersion () === 1 || width === 0 || height === 0)
      return Fallback;

   this .context = gl;
   this .width   = width;
   this .height  = height;
   this .samples = Math .min (samples, gl .getParameter (gl .MAX_SAMPLES));
   this .oit     = oit;

   // Create frame buffer.

   this .lastBuffer  = gl .getParameter (gl .FRAMEBUFFER_BINDING);
   this .frameBuffer = gl .createFramebuffer ();

   gl .bindFramebuffer (gl .FRAMEBUFFER, this .frameBuffer);

   if (oit)
   {
      // Create accum and revealage buffer.

      this .accumRevealageBuffer = gl .createRenderbuffer ();

      gl .bindRenderbuffer (gl .RENDERBUFFER, this .accumRevealageBuffer);
      gl .renderbufferStorageMultisample (gl .RENDERBUFFER, this .samples, gl .RGBA32F, width, height);
      gl .framebufferRenderbuffer (gl .FRAMEBUFFER, gl .COLOR_ATTACHMENT0, gl .RENDERBUFFER, this .accumRevealageBuffer);

      // Create alpha buffer.

      this .alphaBuffer = gl .createRenderbuffer ();

      gl .bindRenderbuffer (gl .RENDERBUFFER, this .alphaBuffer);
      gl .renderbufferStorageMultisample (gl .RENDERBUFFER, this .samples, gl .RGBA32F, width, height);
      gl .framebufferRenderbuffer (gl .FRAMEBUFFER, gl .COLOR_ATTACHMENT1, gl .RENDERBUFFER, this .alphaBuffer);

      // Set draw buffers.

      gl .drawBuffers ([
         gl .COLOR_ATTACHMENT0, // gl_FragData [0]
         gl .COLOR_ATTACHMENT1, // gl_FragData [1]
      ]);

      // Create accum texture buffer.

      this .accumRevealageTextureBuffer = gl .createFramebuffer ();

      gl .bindFramebuffer (gl .FRAMEBUFFER, this .accumRevealageTextureBuffer);

      // Create accum texture.

      this .accumRevealageTexture = gl .createTexture ();

      gl .bindTexture (gl .TEXTURE_2D, this .accumRevealageTexture);
      gl .texParameteri (gl .TEXTURE_2D, gl .TEXTURE_WRAP_S,     gl .CLAMP_TO_EDGE);
      gl .texParameteri (gl .TEXTURE_2D, gl .TEXTURE_WRAP_T,     gl .CLAMP_TO_EDGE);
      gl .texParameteri (gl .TEXTURE_2D, gl .TEXTURE_MIN_FILTER, gl .LINEAR);
      gl .texParameteri (gl .TEXTURE_2D, gl .TEXTURE_MAG_FILTER, gl .LINEAR);

      gl .texImage2D (gl .TEXTURE_2D, 0, gl .RGBA32F, width, height, 0, gl .RGBA, gl .FLOAT, null);
      gl .framebufferTexture2D (gl .FRAMEBUFFER, gl .COLOR_ATTACHMENT0, gl .TEXTURE_2D, this .accumRevealageTexture, 0);

      // Create alpha texture buffer.

      this .alphaTextureBuffer = gl .createFramebuffer ();

      gl .bindFramebuffer (gl .FRAMEBUFFER, this .alphaTextureBuffer);

      // Create alpha texture.

      this .alphaTexture = gl .createTexture ();

      gl .bindTexture (gl .TEXTURE_2D, this .alphaTexture);
      gl .texParameteri (gl .TEXTURE_2D, gl .TEXTURE_WRAP_S,     gl .CLAMP_TO_EDGE);
      gl .texParameteri (gl .TEXTURE_2D, gl .TEXTURE_WRAP_T,     gl .CLAMP_TO_EDGE);
      gl .texParameteri (gl .TEXTURE_2D, gl .TEXTURE_MIN_FILTER, gl .LINEAR);
      gl .texParameteri (gl .TEXTURE_2D, gl .TEXTURE_MAG_FILTER, gl .LINEAR);

      gl .texImage2D (gl .TEXTURE_2D, 0, gl .RGBA32F, width, height, 0, gl .RGBA, gl .FLOAT, null);
      gl .framebufferTexture2D (gl .FRAMEBUFFER, gl .COLOR_ATTACHMENT1, gl .TEXTURE_2D, this .alphaTexture, 0);

      // Set draw buffers.

      gl .drawBuffers ([
         gl .COLOR_ATTACHMENT0, // gl_FragData [0]
         gl .COLOR_ATTACHMENT1, // gl_FragData [1]
      ]);

      gl .bindFramebuffer (gl .FRAMEBUFFER, this .frameBuffer);

      // Get compose shader and texture units.

      this .shaderNode = browser .getComposeShader ();
      this .program    = this .shaderNode .getProgram ();

      gl .useProgram (this .program);

      const
         accumRevealageTextureUnit = gl .getUniformLocation (this .program, "x3d_AccumRevealageTexture"),
         alphaTextureUnit          = gl .getUniformLocation (this .program, "x3d_AlphaTexture");

      gl .uniform1i (accumRevealageTextureUnit, 0);
      gl .uniform1i (alphaTextureUnit, 1);

      // Quad for compose pass.

      this .quadArray          = gl .createVertexArray ();
      this .quadVerticesBuffer = gl .createBuffer ();

      gl .bindVertexArray (this .quadArray);
      gl .bindBuffer (gl .ARRAY_BUFFER, this .quadVerticesBuffer);
      gl .bufferData (gl .ARRAY_BUFFER, new Float32Array([-1, 1, -1, -1, 1, -1, -1, 1, 1, -1, 1, 1]), gl .STATIC_DRAW);
      gl .vertexAttribPointer (0, 2, gl .FLOAT, false, 0, 0);
      gl .enableVertexAttribArray (0);
   }
   else
   {
      // Create color buffer.

      this .colorBuffer = gl .createRenderbuffer ();

      gl .bindRenderbuffer (gl .RENDERBUFFER, this .colorBuffer);
      gl .renderbufferStorageMultisample (gl .RENDERBUFFER, this .samples, gl .RGBA8, width, height);
      gl .framebufferRenderbuffer (gl .FRAMEBUFFER, gl .COLOR_ATTACHMENT0, gl .RENDERBUFFER, this .colorBuffer);
   }

   // Create depth buffer.

   this .depthBuffer = gl .createRenderbuffer ();

   gl .bindRenderbuffer (gl .RENDERBUFFER, this .depthBuffer);
   gl .renderbufferStorageMultisample (gl .RENDERBUFFER, this .samples, gl .DEPTH_COMPONENT24, width, height);
   gl .framebufferRenderbuffer (gl .FRAMEBUFFER, gl .DEPTH_ATTACHMENT,  gl .RENDERBUFFER, this .depthBuffer);

   const status = gl .checkFramebufferStatus (gl .FRAMEBUFFER) === gl .FRAMEBUFFER_COMPLETE;

   gl .bindFramebuffer (gl .FRAMEBUFFER, this .lastBuffer);

   // Always check that our frame buffer is ok.

   if (!status)
      throw new Error ("Couldn't create frame buffer.");
}

Object .assign (MultiSampleFrameBuffer .prototype,
{
   getWidth ()
   {
      return this .width;
   },
   getHeight ()
   {
      return this .height;
   },
   getSamples ()
   {
      return this .samples;
   },
   getOrderIndependentTransparency ()
   {
      return this .oit;
   },
   bind ()
   {
      const gl = this .context;

      this .lastBuffer = gl .getParameter (gl .FRAMEBUFFER_BINDING);

      gl .bindFramebuffer (gl .FRAMEBUFFER, this .frameBuffer);
   },
   unbind ()
   {
      const gl = this .context;

      gl .bindFramebuffer (gl .FRAMEBUFFER, this .lastBuffer);
   },
   blit ()
   {
      const { context: gl, width, height, oit } = this;

      // Reset viewport before blit, otherwise only last layer size is used.
      gl .viewport (0, 0, width, height);
      gl .scissor  (0, 0, width, height);

      if (oit)
      {
         gl .readBuffer (gl .COLOR_ATTACHMENT0);
         gl .bindFramebuffer (gl .READ_FRAMEBUFFER, this .frameBuffer);
         gl .bindFramebuffer (gl .DRAW_FRAMEBUFFER, this .accumRevealageTextureBuffer);

         gl .blitFramebuffer (0, 0, width, height,
                              0, 0, width, height,
                              gl .COLOR_BUFFER_BIT, gl .LINEAR);

         gl .readBuffer (gl .COLOR_ATTACHMENT1);
         gl .bindFramebuffer (gl .READ_FRAMEBUFFER, this .frameBuffer);
         gl .bindFramebuffer (gl .DRAW_FRAMEBUFFER, this .alphaTextureBuffer);

         gl .blitFramebuffer (0, 0, width, height,
                              0, 0, width, height,
                              gl .COLOR_BUFFER_BIT, gl .LINEAR);

         this .compose ();
      }
      else
      {
         gl .readBuffer (gl .COLOR_ATTACHMENT0);
         gl .bindFramebuffer (gl .READ_FRAMEBUFFER, this .frameBuffer);
         gl .bindFramebuffer (gl .DRAW_FRAMEBUFFER, null);

         gl .blitFramebuffer (0, 0, width, height,
                              0, 0, width, height,
                              gl .COLOR_BUFFER_BIT, gl .LINEAR);
      }
   },
   compose ()
   {
      const { context: gl, program } = this;

      gl .useProgram (program);

      gl .activeTexture (gl .TEXTURE0 + 0);
      gl .bindTexture (gl .TEXTURE_2D, this .accumRevealageTexture);
      gl .activeTexture (gl .TEXTURE0 + 1);
      gl .bindTexture (gl .TEXTURE_2D, this .alphaTexture);

      gl .bindFramebuffer (gl .FRAMEBUFFER, null);
      gl .disable (gl .DEPTH_TEST);
      gl .clearColor (0, 0, 0, 0);
      gl .clear (gl .COLOR_BUFFER_BIT);
      gl .enable (gl .BLEND);
      gl .blendFunc (gl .ONE, gl .ONE_MINUS_SRC_ALPHA);
      gl .bindVertexArray (this .quadArray);
      gl .drawArrays (gl .TRIANGLES, 0, 6);
      gl .disable (gl .BLEND);
      gl .enable (gl .DEPTH_TEST);
   },
   dispose ()
   {
      const gl = this .context;

      gl .deleteFramebuffer (this .frameBuffer);
      gl .deleteRenderbuffer (this .colorBuffer);
      gl .deleteRenderbuffer (this .depthBuffer);

      gl .deleteFramebuffer (this .accumRevealageTextureBuffer);
      gl .deleteFramebuffer (this .alphaTextureBuffer);
      gl .deleteRenderbuffer (this .accumRevealageBuffer);
      gl .deleteRenderbuffer (this .alphaBuffer);
      gl .deleteTexture (this .accumRevealageTexture);
      gl .deleteTexture (this .alphaTexture)
      gl .deleteVertexArray (this .quadArray);
      gl .deleteBuffer (this .quadVerticesBuffer);
   },
});

const Fallback = {
   getWidth: Function .prototype,
   getHeight: Function .prototype,
   getSamples: Function .prototype,
   bind: Function .prototype,
   unbind: Function .prototype,
   blit: Function .prototype,
   dispose: Function .prototype,
};

export default MultiSampleFrameBuffer;
