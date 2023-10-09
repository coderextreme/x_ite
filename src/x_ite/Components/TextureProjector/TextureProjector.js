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

import Fields                  from "../../Fields.js";
import X3DFieldDefinition      from "../../Base/X3DFieldDefinition.js";
import FieldDefinitionArray    from "../../Base/FieldDefinitionArray.js";
import X3DTextureProjectorNode from "./X3DTextureProjectorNode.js";
import X3DConstants            from "../../Base/X3DConstants.js";
import Camera                  from "../../../standard/Math/Geometry/Camera.js";
import Vector3                 from "../../../standard/Math/Numbers/Vector3.js";
import Rotation4               from "../../../standard/Math/Numbers/Rotation4.js";
import Matrix4                 from "../../../standard/Math/Numbers/Matrix4.js";
import ObjectCache             from "../../../standard/Utility/ObjectCache.js";

const TextureProjectorCache = ObjectCache (TextureProjectorContainer);

function TextureProjectorContainer ()
{
   this .projectionMatrix                = new Matrix4 ();
   this .modelViewMatrix                 = new Matrix4 ();
   this .modelMatrix                     = new Matrix4 ();
   this .invTextureSpaceMatrix           = new Matrix4 ();
   this .invTextureSpaceProjectionMatrix = new Matrix4 ();
   this .location                        = new Vector3 (0, 0, 0);
   this .locationArray                   = new Float32Array (3);
   this .direction                       = new Vector3 (0, 0, 0);
   this .rotation                        = new Rotation4 ();
   this .projectiveTextureMatrix         = new Matrix4 ();
   this .projectiveTextureMatrixArray    = new Float32Array (16);
}

Object .assign (TextureProjectorContainer .prototype,
{
   set (lightNode, groupNode, modelViewMatrix)
   {
      this .browser   = lightNode .getBrowser ();
      this .lightNode = lightNode;

      this .modelViewMatrix .assign (modelViewMatrix);
   },
   renderShadowMap (renderObject)
   { },
   setGlobalVariables (renderObject)
   {
      const
         lightNode             = this .lightNode,
         cameraSpaceMatrix     = renderObject .getCameraSpaceMatrix () .get (),
         modelMatrix           = this .modelMatrix .assign (this .modelViewMatrix) .multRight (cameraSpaceMatrix),
         invTextureSpaceMatrix = this .invTextureSpaceMatrix .assign (lightNode .getGlobal () ? modelMatrix : Matrix4 .Identity);

      this .rotation .setFromToVec (Vector3 .zAxis, this .direction .assign (lightNode .getDirection ()) .negate ());
      lightNode .straightenHorizon (this .rotation);

      invTextureSpaceMatrix .translate (lightNode .getLocation ());
      invTextureSpaceMatrix .rotate (this .rotation);
      invTextureSpaceMatrix .inverse ();

      const
         width        = lightNode .getTexture () .getWidth (),
         height       = lightNode .getTexture () .getHeight (),
         nearDistance = lightNode .getNearDistance (),
         farDistance  = lightNode .getFarDistance (),
         fieldOfView  = lightNode .getFieldOfView ();

      Camera .perspective (fieldOfView, nearDistance, farDistance, width, height, this .projectionMatrix);

      if (! lightNode .getGlobal ())
         invTextureSpaceMatrix .multLeft (modelMatrix .inverse ());

      this .invTextureSpaceProjectionMatrix .assign (invTextureSpaceMatrix) .multRight (this .projectionMatrix) .multRight (lightNode .getBiasMatrix ());

      this .projectiveTextureMatrix .assign (cameraSpaceMatrix) .multRight (this .invTextureSpaceProjectionMatrix);
      this .projectiveTextureMatrixArray .set (this .projectiveTextureMatrix);

      this .modelViewMatrix .multVecMatrix (this .location .assign (lightNode ._location .getValue ()));
      this .locationArray .set (this .location);
   },
   setShaderUniforms (gl, shaderObject, renderObject)
   {
      const i = shaderObject .numProjectiveTextures ++;

      if (shaderObject .hasTextureProjector (i, this))
         return;

      const
         texture     = this .lightNode .getTexture (),
         textureUnit = this .browser .getTexture2DUnit ();

      gl .activeTexture (gl .TEXTURE0 + textureUnit);
      gl .bindTexture (gl .TEXTURE_2D, texture ?.getTexture () ?? this .browser .getDefaultTexture2D ());
      gl .uniform1i (shaderObject .x3d_ProjectiveTexture [i], textureUnit);

      gl .uniformMatrix4fv (shaderObject .x3d_ProjectiveTextureMatrix [i], false, this .projectiveTextureMatrixArray);
      gl .uniform3fv (shaderObject .x3d_ProjectiveTextureLocation [i], this .locationArray);
   },
   dispose ()
   {
      TextureProjectorCache .push (this);
   },
});

function TextureProjector (executionContext)
{
   X3DTextureProjectorNode .call (this, executionContext);

   this .addType (X3DConstants .TextureProjector);

   this ._fieldOfView .setUnit ("angle");
}

Object .assign (Object .setPrototypeOf (TextureProjector .prototype, X3DTextureProjectorNode .prototype),
{
   initialize ()
   {
      X3DTextureProjectorNode .prototype .initialize .call (this);
   },
   getFieldOfView ()
   {
      const fov = this ._fieldOfView .getValue ();

      return fov > 0 && fov < Math .PI ? fov : Math .PI / 4;
   },
   getLights ()
   {
      return TextureProjectorCache;
   },
});

Object .defineProperties (TextureProjector,
{
   typeName:
   {
      value: "TextureProjector",
      enumerable: true,
   },
   componentName:
   {
      value: "TextureProjector",
      enumerable: true,
   },
   containerField:
   {
      value: "children",
      enumerable: true,
   },
   specificationRange:
   {
      value: Object .freeze (["4.0", "Infinity"]),
      enumerable: true,
   },
   fieldDefinitions:
   {
      value: new FieldDefinitionArray ([
         new X3DFieldDefinition (X3DConstants .inputOutput,    "metadata",         new Fields .SFNode ()),
         new X3DFieldDefinition (X3DConstants .inputOutput,    "description",      new Fields .SFString ()),
         new X3DFieldDefinition (X3DConstants .inputOutput,    "global",           new Fields .SFBool (true)),
         new X3DFieldDefinition (X3DConstants .inputOutput,    "on",               new Fields .SFBool (true)),
         new X3DFieldDefinition (X3DConstants .inputOutput,    "color",            new Fields .SFColor (1, 1, 1)),
         new X3DFieldDefinition (X3DConstants .inputOutput,    "intensity",        new Fields .SFFloat (1)),
         new X3DFieldDefinition (X3DConstants .inputOutput,    "ambientIntensity", new Fields .SFFloat ()),

         new X3DFieldDefinition (X3DConstants .inputOutput,    "location",         new Fields .SFVec3f (0, 0, 0)),
         new X3DFieldDefinition (X3DConstants .inputOutput,    "direction",        new Fields .SFVec3f (0, 0, 1)),
         new X3DFieldDefinition (X3DConstants .inputOutput,    "upVector",         new Fields .SFVec3f (0, 0, 1)),
         new X3DFieldDefinition (X3DConstants .inputOutput,    "fieldOfView",      new Fields .SFFloat (0.785398)),
         new X3DFieldDefinition (X3DConstants .inputOutput,    "nearDistance",     new Fields .SFFloat (-1)),
         new X3DFieldDefinition (X3DConstants .inputOutput,    "farDistance",      new Fields .SFFloat (-1)),
         new X3DFieldDefinition (X3DConstants .outputOnly,     "aspectRatio",      new Fields .SFFloat ()),
         new X3DFieldDefinition (X3DConstants .inputOutput,    "texture",          new Fields .SFNode ()),

         new X3DFieldDefinition (X3DConstants .inputOutput,    "shadows",          new Fields .SFBool ()),
         new X3DFieldDefinition (X3DConstants .inputOutput,    "shadowColor",      new Fields .SFColor ()),
         new X3DFieldDefinition (X3DConstants .inputOutput,    "shadowIntensity",  new Fields .SFFloat (1)),
         new X3DFieldDefinition (X3DConstants .inputOutput,    "shadowBias",       new Fields .SFFloat (0.005)),
         new X3DFieldDefinition (X3DConstants .initializeOnly, "shadowMapSize",    new Fields .SFInt32 (1024)),
      ]),
      enumerable: true,
   },
});

export default TextureProjector;
