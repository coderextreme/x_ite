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

import X3DGeometryNode from "./X3DGeometryNode.js";

function X3DPointGeometryNode (executionContext)
{
   X3DGeometryNode .call (this, executionContext);

   const browser = this .getBrowser ();

   this .setGeometryType (0);
   this .setPrimitiveMode (browser .getContext () .POINTS);
   this .setSolid (false);
   this .setTransparent (true);
}

X3DPointGeometryNode .prototype = Object .assign (Object .create (X3DGeometryNode .prototype),
{
   constructor: X3DPointGeometryNode,
   intersectsLine ()
   {
      return false;
   },
   intersectsBox ()
   {
      return false;
   },
   buildTexCoords ()
   { },
   display (gl, renderContext)
   {
      const
         appearanceNode = renderContext .appearanceNode,
         shaderNode     = appearanceNode .getShader (this, renderContext),
         blendModeNode  = appearanceNode .getBlendMode (),
         attribNodes    = this .getAttrib (),
         attribBuffers  = this .getAttribBuffers ();

      blendModeNode ?.enable (gl);

      // Setup shader.

      shaderNode .enable (gl);
      shaderNode .setUniforms (gl, this, renderContext);

      // Setup vertex attributes.

      if (this .vertexArrayObject .enable (shaderNode))
      {
         for (let i = 0, length = attribNodes .length; i < length; ++ i)
            attribNodes [i] .enable (gl, shaderNode, attribBuffers [i]);

         if (this .hasFogCoords)
            shaderNode .enableFogDepthAttribute (gl, this .fogDepthBuffer, 0, 0);

         if (this .colorMaterial)
            shaderNode .enableColorAttribute (gl, this .colorBuffer, 0, 0);

         if (this .hasNormals)
            shaderNode .enableNormalAttribute (gl, this .normalBuffer, 0, 0);

         shaderNode .enableVertexAttribute (gl, this .vertexBuffer, 0, 0);
      }

      gl .drawArrays (this .primitiveMode, 0, this .vertexCount);

      blendModeNode ?.disable (gl);
   },
   displayParticles (gl, renderContext, particleSystem)
   {
      const
         appearanceNode = renderContext .appearanceNode,
         shaderNode     = appearanceNode .getShader (this, renderContext),
         blendModeNode  = appearanceNode .getBlendMode (),
         attribNodes    = this .getAttrib (),
         attribBuffers  = this .getAttribBuffers ();

      blendModeNode ?.enable (gl);

      // Setup shader.

      shaderNode .enable (gl);
      shaderNode .setUniforms (gl, this, renderContext);

      // Setup vertex attributes.

      const outputParticles = particleSystem .outputParticles;

      if (outputParticles .vertexArrayObject .update (this .updateParticles) .enable (shaderNode))
      {
         const particleStride = particleSystem .particleStride;

         shaderNode .enableParticleAttribute (gl, outputParticles, particleStride, particleSystem .particleOffset, 1);
         shaderNode .enableParticleMatrixAttribute (gl, outputParticles, particleStride, particleSystem .matrixOffset, 1);

         for (let i = 0, length = attribNodes .length; i < length; ++ i)
            attribNodes [i] .enable (gl, shaderNode, attribBuffers [i]);

         if (this .hasFogCoords)
            shaderNode .enableFogDepthAttribute (gl, this .fogDepthBuffer, 0, 0);

         if (this .colorMaterial)
            shaderNode .enableColorAttribute (gl, this .colorBuffer, 0, 0);

         if (this .hasNormals)
            shaderNode .enableNormalAttribute (gl, this .normalBuffer, 0, 0);

         shaderNode .enableVertexAttribute (gl, this .vertexBuffer, 0, 0);

         this .updateParticles = false;
      }

      // Wireframes are always solid so only one drawing call is needed.

      gl .drawArraysInstanced (this .primitiveMode, 0, this .vertexCount, particleSystem .numParticles);

      blendModeNode ?.disable (gl);
   },
});

Object .defineProperties (X3DPointGeometryNode,
{
   typeName:
   {
      value: "X3DPointGeometryNode",
      enumerable: true,
   },
   componentName:
   {
      value: "Rendering",
      enumerable: true,
   },
});

export default X3DPointGeometryNode;
