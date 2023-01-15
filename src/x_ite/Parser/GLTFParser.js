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

import X3DParser  from "./X3DParser.js";
import Vector3    from "../../standard/Math/Numbers/Vector3.js";
import Quaternion from "../../standard/Math/Numbers/Quaternion.js";
import Rotation4  from "../../standard/Math/Numbers/Rotation4.js";
import Matrix4    from "../../standard/Math/Numbers/Matrix4.js";
import Color3     from "../../standard/Math/Numbers/Color3.js";
import Color4     from "../../standard/Math/Numbers/Color4.js";

// https://registry.khronos.org/glTF/specs/2.0/glTF-2.0.html

function GLTFParser (scene)
{
   X3DParser .call (this, scene);

   this .extensionsUsed = new Set ();
   this .buffers        = [ ];
   this .bufferViews    = [ ];
   this .accessors      = [ ];
   this .samplers       = [ ];
   this .materials      = [ ];
   this .cameras        = [ ];
   this .viewpoints     = [ ];
   this .nodes          = [ ];
}

GLTFParser .prototype = Object .assign (Object .create (X3DParser .prototype),
{
   constructor: GLTFParser,
   getEncoding: function ()
   {
      return "JSON";
   },
   isValid: (function ()
   {
      const keys = new Set ([
         "asset",
         "extensionsRequired",
         "extensionsUsed",
         "buffers",
         "bufferViews",
         "accessors",
         "samplers",
         "images",
         "textures",
         "materials",
         "meshes",
         "cameras",
         "nodes",
         "scenes",
         "scene",
         "animations",
         "skins",
      ]);

      return function ()
      {
         return this .input instanceof Object && Object .keys (this .input) .every (key => keys .has (key));
      };
   })(),
   getInput: function ()
   {
      return this .input;
   },
   setInput: function (json)
   {
      try
      {
         if (typeof json === "string")
            json = JSON .parse (json);

         this .input = json;
      }
      catch (error)
      {
         this .input = undefined;
      }
   },
   parseIntoScene: function (success, error)
   {
      this .rootObject (this .input)
         .then (success)
         .catch (error);
   },
   rootObject: async function (glTF)
   {
      if (!(glTF instanceof Object))
         return;

      // Set profile and components.

      const
         browser = this .getBrowser (),
         scene   = this .getScene ();

      scene .setEncoding ("GLTF");
      scene .setProfile (browser .getProfile ("Interchange"));
      scene .addComponent (browser .getComponent ("Texturing3D", 2));

      await this .loadComponents ();

      // Parse root objects.

      this .assetObject             (glTF .asset);
      this .extensionsRequiredArray (glTF .extensionsRequired),
      this .extensionsUsedArray     (glTF .extensionsUsed);

      await this .buffersArray (glTF .buffers);

      this .bufferViewsArray (glTF .bufferViews);
      this .accessorsArray   (glTF .accessors);
      this .samplersArray    (glTF .samplers);
      this .imagesArray      (glTF .images);
      this .texturesArray    (glTF .textures);
      this .materialsArray   (glTF .materials);
      this .meshesArray      (glTF .meshes);
      this .camerasArray     (glTF .cameras);
      this .nodesArray       (glTF .nodes);
      this .scenesArray      (glTF .scenes, glTF .scene);
      this .animationsArray  (glTF .animations);
      this .skinsArray       (glTF .skins);

      return this .getScene ();
   },
   assetObject: function (asset)
   {
      if (!(asset instanceof Object))
         return;

      const
         scene         = this .getScene (),
         worldURL      = scene .getWorldURL (),
         worldInfoNode = scene .createNode ("WorldInfo", false);

      worldInfoNode ._title = decodeURI (new URL (worldURL) .pathname .split ("/") .at (-1) || worldURL);

      for (const [key, value] of Object .entries (asset))
      {
         if (typeof value === "string")
            worldInfoNode ._info .push (`${key}: ${value}`);
      }

      worldInfoNode .setup ();

      scene .getRootNodes () .push (worldInfoNode);
   },
   extensionsRequiredArray: function (extensionsRequired)
   {
      if (!(extensionsRequired instanceof Array))
         return;
   },
   extensionsUsedArray: function (extensionsUsed)
   {
      if (!(extensionsUsed instanceof Array))
         return;

      this .extensionsUsed = new Set (extensionsUsed);
   },
   buffersArray: async function (buffers)
   {
      if (!(buffers instanceof Array))
         return;

      this .buffers = await Promise .all (buffers .map (buffer => this .bufferObject (buffer)));
   },
   bufferObject: function (buffer)
   {
      if (!(buffer instanceof Object))
         return;

      const url = new URL (buffer .uri, this .getScene () .getWorldURL ());

      return fetch (url)
         .then (response => response .blob ())
         .then (blob => blob .arrayBuffer ());
   },
   bufferViewsArray: function (bufferViews)
   {
      if (!(bufferViews instanceof Array))
         return;

      this .bufferViews = bufferViews;

      for (const bufferView of bufferViews)
         bufferView .buffer = this .buffers [bufferView .buffer];
   },
   accessorsArray: function (accessors)
   {
      if (!(accessors instanceof Array))
         return;

      this .accessors = accessors;

      for (const accessor of accessors)
         this .accessorObject (accessor);
   },
   accessorObject: (function ()
   {
      const TypedArrays = new Map ([
         [5120, Int8Array],
         [5121, Uint8Array],
         [5122, Int16Array],
         [5123, Uint16Array],
         [5124, Int32Array],
         [5125, Uint32Array],
         [5126, Float32Array],
      ]);

      const Components = new Map ([
         ["SCALAR", 1],
         ["VEC2",   2],
         ["VEC3",   3],
         ["VEC4",   4],
         ["MAT2",   4],
         ["MAT3",   9],
         ["MAT4",   16],
      ]);

      const DefaultBufferView =
      {
         "buffer": new ArrayBuffer (0),
         "byteOffset": 0,
         "byteLength": 0,
      };

      return function (accessor)
      {
         if (!(accessor instanceof Object))
            return;

         const
            TypedArray = TypedArrays .get (accessor .componentType),
            bufferView = this .bufferViews [accessor .bufferView] || DefaultBufferView,
            byteOffset = (accessor .byteOffset || 0) + (bufferView .byteOffset || 0),
            byteStride = bufferView .byteStride || 0,
            components = Components .get (accessor .type),
            count      = accessor .count || 0,
            length     = (byteStride ? byteStride / TypedArray .BYTES_PER_ELEMENT : components) * count,
            array      = new TypedArray (bufferView .buffer, byteOffset, length),
            stride     = (byteStride / TypedArray .BYTES_PER_ELEMENT) || components;

         if (stride !== components)
         {
            const
               length = count * components,
               dense  = new TypedArray (length);

            for (let i = 0, j = 0; i < length; j += stride)
            {
               for (let c = 0; c < components; ++ c, ++ i)
                  dense [i] = array [j + c];
            }

            accessor .array = dense;
         }
         else
         {
            accessor .array = array;
         }
      };
   })(),
   samplersArray: function (samplers)
   {
      if (!(samplers instanceof Array))
         return;

      this .samplers = samplers;

      for (const sampler of samplers)
         this .samplerObject (sampler);
   },
   samplerObject: (function ()
   {
      const MinificationFilters = new Map ([
         [9728, ["NEAREST_PIXEL",                false]],
         [9729, ["AVG_PIXEL",                    false]],
         [9984, ["NEAREST_PIXEL_NEAREST_MIPMAP", true]],
         [9985, ["AVG_PIXEL_NEAREST_MIPMAP",     true]],
         [9986, ["NEAREST_PIXEL_AVG_MIPMAP",     true]],
         [9987, ["AVG_PIXEL_AVG_MIPMAP",         true]],
      ]);

      const MagnificationFilters = new Map ([
         [9728, "NEAREST_PIXEL"],
         [9729, "AVG_PIXEL"],
      ]);

	   const BoundaryModes = new Map ([
         [33071, "CLAMP_TO_EDGE"],
         [33648, "MIRRORED_REPEAT"],
         [10497, "REPEAT"],
      ]);

      return function (sampler)
      {
         if (!(sampler instanceof Object))
            return;

         const
            scene                 = this .getScene (),
            texturePropertiesNode = scene .createNode ("TextureProperties", false),
            name                  = this .sanitizeName (sampler .name);

         if (name)
            scene .addNamedNode (scene .getUniqueName (name), texturePropertiesNode);

         // minFilter

         const minificationFilter = MinificationFilters .get (sampler .minFilter) || ["AVG_PIXEL", false];

         texturePropertiesNode ._minificationFilter = minificationFilter [0];
         texturePropertiesNode ._generateMipMaps    = minificationFilter [1];

         // magFilter

         texturePropertiesNode ._magnificationFilter = MagnificationFilters .get (sampler .magFilter) || "AVG_PIXEL";

         // boundaryMode

         texturePropertiesNode ._boundaryModeS = BoundaryModes .get (sampler .wrapS) || "REPEAT";
         texturePropertiesNode ._boundaryModeT = BoundaryModes .get (sampler .wrapT) || "REPEAT";

         // setup

         texturePropertiesNode .setup ();

         sampler .texturePropertiesNode = texturePropertiesNode;
      };
   })(),
   imagesArray: function (images)
   {
      if (!(images instanceof Array))
         return;

      this .images = images;
   },
   texturesArray: function (textures)
   {
      if (!(textures instanceof Array))
         return;

      this .textures = textures;

      for (const texture of textures)
         this .textureObject (texture);
   },
   textureObject: function (texture)
   {
      if (!(texture instanceof Object))
         return;

      let textureNode = null;

      Object .defineProperty (texture, "textureNode",
      {
         get: () =>
         {
            if (textureNode)
               return textureNode;

            const
               scene            = this .getScene (),
               imageTextureNode = scene .createNode ("ImageTexture", false);

            const sampler = this .samplers [texture .sampler];

            if (sampler)
               imageTextureNode ._textureProperties = sampler .texturePropertiesNode;

            const image = this .images [texture .source];

            if (image)
            {
               const name = this .sanitizeName (image .name);

               if (name)
                  scene .addNamedNode (scene .getUniqueName (name), imageTextureNode);

               imageTextureNode ._url = [image .uri];
            }

            imageTextureNode .setup ();

            return textureNode = imageTextureNode;
         },
      });
   },
   materialsArray: function (materials)
   {
      if (!(materials instanceof Array))
         return;

      this .materials = materials;

      for (const material of materials)
         this .materialObject (material)
   },
   materialObject: function (material)
   {
      if (!(material instanceof Object))
         return;

      const
         scene          = this .getScene (),
         appearanceNode = scene .createNode ("Appearance", false),
         name           = this .sanitizeName (material .name);

      if (name)
         scene .addNamedNode (scene .getUniqueName (name), appearanceNode);

      appearanceNode ._alphaMode   = material .alphaMode || "OPAQUE";
      appearanceNode ._alphaCutoff = this .numberValue (material .alphaCutoff, 0.5);

      const
         materialNode   = this .materialObjectMaterial (material),
         emissiveFactor = new Color3 (0, 0, 0);

      if (this .vectorValue (material .emissiveFactor, emissiveFactor))
         materialNode ._emissiveColor = emissiveFactor;

      materialNode ._emissiveTexture = this .textureInfo (material .emissiveTexture);

	   this .occlusionTextureInfo (material .occlusionTexture, materialNode);
	   this .normalTextureInfo    (material .normalTexture,    materialNode);

      materialNode .setup ();

      appearanceNode ._material         = materialNode;
      appearanceNode ._textureTransform = this .getDefaultTextureTransform (materialNode);

      appearanceNode .setup ();

      material .appearanceNode = appearanceNode;
   },
   materialObjectMaterial: function (material)
   {
      const materials = [
         this .pbrMetallicRoughnessObject .bind (this, material .pbrMetallicRoughness),
         this .extensionsObject           .bind (this, material .extensions),
         this .pbrMetallicRoughnessObject .bind (this, { }),
      ];

      for (const material of materials)
      {
         const materialNode = material ();

         if (materialNode)
            return materialNode;
      }
   },
   pbrMetallicRoughnessObject: function (pbrMetallicRoughness)
   {
      if (!(pbrMetallicRoughness instanceof Object))
         return null;

      const
         scene        = this .getScene (),
         materialNode = scene .createNode ("PhysicalMaterial", false);

      const
         baseColorFactor = new Color4 (0, 0, 0, 0),
         baseColor       = new Color3 (0, 0, 0);

      if (this .vectorValue (pbrMetallicRoughness .baseColorFactor, baseColorFactor))
      {
         materialNode ._baseColor    = baseColor .set (... baseColorFactor);
         materialNode ._transparency = 1 - baseColorFactor .a;
      }

      materialNode ._metallic  = this .numberValue (pbrMetallicRoughness .metallicFactor,  1);
      materialNode ._roughness = this .numberValue (pbrMetallicRoughness .roughnessFactor, 1);

      materialNode ._baseTexture              = this .textureInfo (pbrMetallicRoughness .baseColorTexture);
      materialNode ._metallicRoughnessTexture = this .textureInfo (pbrMetallicRoughness .metallicRoughnessTexture);

      return materialNode;
   },
   extensionsObject: function (extensions)
   {
      if (!(extensions instanceof Object))
         return;

      for (const key in extensions)
      {
         if (!this .extensionsUsed .has (key))
            continue;

         switch (key)
         {
            case "KHR_materials_pbrSpecularGlossiness":
               return this .pbrSpecularGlossinessObject (extensions [key]);
         }
      }

      return null;
   },
   pbrSpecularGlossinessObject: function (pbrSpecularGlossiness)
   {
      if (!(pbrSpecularGlossiness instanceof Object))
         return null;

      const
         scene        = this .getScene (),
         materialNode = scene .createNode ("Material", false);

      const
         diffuseFactor  = new Color4 (0, 0, 0, 0),
         diffuseColor   = new Color3 (0, 0, 0),
         specularFactor = new Color3 (0, 0, 0);

      if (this .vectorValue (pbrSpecularGlossiness .diffuseFactor, diffuseFactor))
      {
         materialNode ._diffuseColor = diffuseColor .set (diffuseFactor .r, diffuseFactor .g, diffuseFactor .b);
         materialNode ._transparency = 1 - diffuseFactor .a;
      }
      else
      {
         materialNode ._diffuseColor = Color3 .White;
      }

      if (this .vectorValue (pbrSpecularGlossiness .specularFactor, specularFactor))
         materialNode ._specularColor = specularFactor;
      else
         materialNode ._specularColor = Color3 .White;

      materialNode ._shininess = this .numberValue (pbrSpecularGlossiness .glossinessFactor, 1);

      materialNode ._diffuseTexture   = this .textureInfo (pbrSpecularGlossiness .diffuseTexture);
      materialNode ._specularTexture  = this .textureInfo (pbrSpecularGlossiness .specularGlossinessTexture);
      materialNode ._shininessTexture = this .textureInfo (pbrSpecularGlossiness .specularGlossinessTexture);

      return materialNode;
   },
   occlusionTextureInfo: function (occlusionTexture, materialNode)
   {
      if (!(occlusionTexture instanceof Object))
         return null;

   },
   normalTextureInfo: function (normalTexture, materialNode)
   {
      if (!(normalTexture instanceof Object))
         return null;

      materialNode ._normalScale   = this .numberValue (normalTexture .scale, 1);
      materialNode ._normalTexture = this .textureInfo (normalTexture);
   },
   textureInfo: function (texture)
   {
      if (!(texture instanceof Object))
         return null;

      return this .textures [texture .index] .textureNode;
   },
   meshesArray: function (meshes)
   {
      if (!(meshes instanceof Array))
         return;

      this .meshes = meshes;

      for (const mesh of meshes)
         this .meshObject (mesh);
   },
   meshObject: function (mesh)
   {
      if (!(mesh instanceof Object))
         return;

      mesh .shapeNodes = this .primitivesArray (mesh .primitives);

      // Name Shape nodes.

      const
         scene = this .getScene (),
         name  = this .sanitizeName (mesh .name);

      if (name)
      {
         for (const shapeNode of mesh .shapeNodes)
            scene .addNamedNode (scene .getUniqueName (name), shapeNode);
      }
   },
   primitivesArray: function (primitives)
   {
      if (!(primitives instanceof Array))
         return [ ];

      const shapeNodes = [ ];

      for (const primitive of primitives)
         this .primitiveObject (primitive, shapeNodes);

      return shapeNodes;
   },
   primitiveObject: function (primitive, shapeNodes)
   {
      if (!(primitive instanceof Object))
         return;

      this .attributesObject (primitive .attributes);
      this .targetsArray     (primitive .targets);

      primitive .indices   = this .accessors [primitive .indices];
      primitive .material  = this .materials [primitive .material];

      shapeNodes .push (this .createShape (primitive));
   },
   attributesObject: function (attributes)
   {
      if (!(attributes instanceof Object))
         return;

      attributes .TANGENT  = this .accessors [attributes .TANGENT];
      attributes .NORMAL   = this .accessors [attributes .NORMAL];
      attributes .POSITION = this .accessors [attributes .POSITION];

      attributes .TEXCOORD = [ ];
      attributes .COLOR    = [ ];
      attributes .JOINTS   = [ ];
      attributes .WEIGHTS  = [ ];

      for (let i = 0; Number .isInteger (attributes ["TEXCOORD_" + i]); ++ i)
         attributes .TEXCOORD .push (this .accessors [attributes ["TEXCOORD_" + i]]);

      for (let i = 0; Number .isInteger (attributes ["COLOR_" + i]); ++ i)
         attributes .COLOR .push (this .accessors [attributes ["COLOR_" + i]]);

      for (let i = 0; Number .isInteger (attributes ["JOINTS_" + i]); ++ i)
         attributes .JOINTS .push (this .accessors [attributes ["JOINTS_" + i]]);

      for (let i = 0; Number .isInteger (attributes ["WEIGHTS_" + i]); ++ i)
         attributes .WEIGHTS .push (this .accessors [attributes ["WEIGHTS_" + i]]);
   },
   targetsArray: function (targets)
   {
      if (!(targets instanceof Array))
         return;
   },
   camerasArray: function (cameras)
   {
      if (!(cameras instanceof Array))
         return;

      this .cameras = cameras;

      for (const camera of cameras)
         this .cameraObject (camera);
   },
   cameraObject: function (camera)
   {
      if (!(camera instanceof Object))
         return;

      const viewpointNode = this .cameraType (camera);

      if (!viewpointNode)
         return;

      const
         scene = this .getScene (),
         name  = this .sanitizeName (camera .name);

      // Name

      if (name)
         scene .addNamedNode (scene .getUniqueName (name), viewpointNode);

      if (camera .name)
         viewpointNode ._description = camera .name;
      else
         viewpointNode ._description = `Viewpoint ${++ this .viewpoints}`;

      camera .viewpointNode = viewpointNode;
   },
   cameraType: function (camera)
   {
      switch (camera .type)
      {
         case "orthographic":
            return this .orthographicCamera (camera .orthographic);
         case "perspective":
            return this .perspectiveCamera (camera .perspective);
      }
   },
   orthographicCamera: function (camera)
   {
      const
         scene         = this .getScene (),
         viewpointNode = scene .createNode ("OrthoViewpoint", false);

      if (typeof camera .xmag === "number")
      {
         viewpointNode ._fieldOfView [0] = -camera .xmag / 2;
         viewpointNode ._fieldOfView [2] = +camera .xmag / 2;
      }

      if (typeof camera .ymag === "number")
      {
         viewpointNode ._fieldOfView [1] = -camera .ymag / 2;
         viewpointNode ._fieldOfView [3] = +camera .ymag / 2;
      }

      if (typeof camera .znear === "number")
         viewpointNode ._nearDistance = camera .zfar;

      if (typeof camera .zfar === "number")
         viewpointNode ._farDistance = camera .zfar;

      viewpointNode .setup ();

      return viewpointNode;
   },
   perspectiveCamera: function (camera)
   {
      const
         scene         = this .getScene (),
         viewpointNode = scene .createNode ("Viewpoint", false);

      if (typeof camera .yfov === "number")
         viewpointNode ._fieldOfView = camera .yfov;

      if (typeof camera .znear === "number")
         viewpointNode ._nearDistance = camera .zfar;

      if (typeof camera .zfar === "number")
         viewpointNode ._farDistance = camera .zfar;

      viewpointNode .setup ();

      return viewpointNode;
   },
   nodesArray: function (nodes)
   {
      if (!(nodes instanceof Array))
         return;

      this .nodes = nodes;
   },
   nodeObject: function (node)
   {
      if (!(node instanceof Object))
         return;

      if (node .transformNode)
         return node .transformNode;

      // Create Transform.

      const
         scene         = this .getScene (),
         transformNode = scene .createNode ("Transform", false),
         name          = this .sanitizeName (node .name);

      // Name

      if (name)
         scene .addNamedNode (scene .getUniqueName (name), transformNode);

      // Transformation Matrix

      const
         translation      = new Vector3 (0, 0, 0),
         quaternion       = new Quaternion (0, 0, 0, 1),
         rotation         = new Rotation4 (),
         scale            = new Vector3 (1, 1, 1),
         scaleOrientation = new Rotation4 (),
         matrix           = new Matrix4 ();

      if (!this .vectorValue (node .matrix, matrix))
      {
         if (this .vectorValue (node .scale, scale))
            matrix .scale (scale);

         if (this .vectorValue (node .rotation, quaternion))
            matrix .rotate (new Rotation4 (quaternion));

         if (this .vectorValue (node .translation, translation))
            matrix .translate (translation);
      }

      matrix .get (translation, rotation, scale, scaleOrientation);

      transformNode ._translation      = translation;
      transformNode ._rotation         = rotation;
      transformNode ._scale            = scale;
      transformNode ._scaleOrientation = scaleOrientation;

      // Add camera.

      if (Number .isInteger (node .camera))
      {
         const camera = this .cameras [node .camera];

         if (camera)
            transformNode ._children .push (camera .viewpointNode);
      }

      // Add mesh.

      if (Number .isInteger (node .mesh))
      {
         const mesh = this .meshes [node .mesh];

         if (mesh)
            transformNode ._children .push (... mesh .shapeNodes);
      }

      // Get children.

      transformNode ._children .push (... this .nodeChildrenArray (node .children));

      // Finish.

      transformNode .setup ();

      node .transformNode = transformNode;

      return transformNode;
   },
   nodeChildrenArray: function (children)
   {
      if (!(children instanceof Array))
         return [ ];

      return children .map (index => this .nodeObject (this .nodes [index])) .filter (node => node);
   },
   scenesArray: function (scenes, sceneNumber)
   {
      if (!(scenes instanceof Array))
         return;

      const
         scene    = this .getScene (),
         children = scenes .map (scene => this .sceneObject (scene));

      switch (children .length)
      {
         case 0:
         {
            return;
         }
         case 1:
         {
            if (sceneNumber === 0)
            {
               scene .getRootNodes () .push (children [0]);
               return;
            }

            // Proceed with next case:
         }
         default:
         {
            // Root

            const switchNode = scene .createNode ("Switch", false);

            scene .addNamedNode (scene .getUniqueName ("Scenes"), switchNode);

            // Scenes.

            switchNode ._whichChoice = sceneNumber;
            switchNode ._children    = children;

            switchNode .setup ();

            scene .getRootNodes () .push (switchNode);

            return;
         }
      }
   },
   sceneObject: function (sceneObject)
   {
      if (!(sceneObject instanceof Object))
         return null;

      const nodes = this .sceneNodesArray (sceneObject .nodes);

      switch (nodes .length)
      {
         case 0:
         {
            return null;
         }
         case 1:
         {
            return this .nodeObject (nodes [0]);
         }
         default:
         {
            const
               scene     = this .getScene (),
               groupNode = scene .createNode ("Group", false),
               name      = this .sanitizeName (sceneObject .name);

            if (name)
               scene .addNamedNode (scene .getUniqueName (name), groupNode);

            groupNode ._children = nodes .map (node => this .nodeObject (node));

            groupNode .setup ();

            return groupNode;
         }
      }
   },
   sceneNodesArray: function (nodes)
   {
      if (!(nodes instanceof Array))
         return [ ];

      return nodes .map (node => this .nodes [node]) .filter (node => node);
   },
   animationsArray: function (animations)
   {
      if (!(animations instanceof Array))
         return;
   },
   skinsArray: function (skins)
   {
      if (!(skins instanceof Array))
         return;
   },
   createShape: function (primitive)
   {
      const
         scene          = this .getScene (),
         shapeNode      = scene .createNode ("Shape", false),
         appearanceNode = primitive .material ? primitive .material .appearanceNode : this .getDefaultAppearance (),
         geometryNode   = this .createGeometry (primitive);

      shapeNode ._appearance = appearanceNode;
      shapeNode ._geometry   = geometryNode;

      shapeNode .setup ();

      return shapeNode;
   },
   getDefaultAppearance: function ()
   {
      if (this .defaultAppearance)
         return this .defaultAppearance;

      const
         scene          = this .getScene (),
         appearanceNode = scene .createNode ("Appearance", false),
         materialNode   = scene .createNode ("PhysicalMaterial", false);

      appearanceNode ._alphaMode = "OPAQUE";
      appearanceNode ._material  = materialNode;

      materialNode   .setup ();
      appearanceNode .setup ();

      this .defaultAppearance = appearanceNode;

      return appearanceNode;
   },
   getDefaultTextureTransform: function (materialNode)
   {
      if (!+materialNode .getTextureBits ())
         return null;

      if (this .defaultTextureTransform)
         return this .defaultTextureTransform;

      const
         scene                 = this .getScene (),
         textureTransformNode = scene .createNode ("TextureTransform", false);

      textureTransformNode ._translation .y = 1;
      textureTransformNode ._scale .y       = -1;

      textureTransformNode .setup ();

      this .defaultTextureTransform = textureTransformNode;

      return textureTransformNode;
   },
   createGeometry: function (primitive)
   {
      switch (primitive .mode)
      {
         case 0: // POINTS
         {
            return null;
         }
         case 1: // LINES
         {
            return null;
         }
         case 2: // LINE_LOOP
         {
            return null;
         }
         case 3: // LINE_STRIP
         {
            return null;
         }
         default:
         case 4: // TRIANGLES
         {
            if (primitive .indices)
               return this .createIndexedTriangleSet (primitive);

            return this .createTriangleSet (primitive);
         }
         case 5: // TRIANGLE_STRIP
         {
            return null;
         }
         case 6: // TRIANGLE_FAN
         {
            return null;
         }
      }
   },
   createIndexedTriangleSet: function ({ attributes, indices, material })
   {
      const
         scene        = this .getScene (),
         geometryNode = scene .createNode ("IndexedTriangleSet", false);

      geometryNode ._index    = indices .array;
      geometryNode ._color    = this .createColor (attributes .COLOR [0]);
      geometryNode ._texCoord = this .createMultiTextureCoordinate (attributes .TEXCOORD);
      geometryNode ._normal   = this .createNormal (attributes .NORMAL);
      geometryNode ._coord    = this .createCoordinate (attributes .POSITION);

      geometryNode ._solid           = material ? ! material .doubleSided : true;
      geometryNode ._normalPerVertex = geometryNode ._normal;

      geometryNode .setup ();

      return geometryNode;
   },
   createTriangleSet: function ({ attributes, material })
   {
      const
         scene        = this .getScene (),
         geometryNode = scene .createNode ("TriangleSet", false);

      geometryNode ._color    = this .createColor (attributes .COLOR [0]);
      geometryNode ._texCoord = this .createMultiTextureCoordinate (attributes .TEXCOORD);
      geometryNode ._normal   = this .createNormal (attributes .NORMAL);
      geometryNode ._coord    = this .createCoordinate (attributes .POSITION);

      geometryNode ._solid = material ? ! material .doubleSided : true;

      geometryNode .setup ();

      return geometryNode;
   },
   createColor: function (color)
   {
      if (!color)
         return null;

      switch (color .type)
      {
         case "VEC3":
         {
            const
               scene     = this .getScene (),
               colorNode = scene .createNode ("Color", false);

            colorNode ._color = color .array;

            colorNode .setup ();

            return colorNode;
         }
         case "VEC4":
         {
            const
               scene     = this .getScene (),
               colorNode = scene .createNode ("ColorRGBA", false);

            colorNode ._color = color .array;

            colorNode .setup ();

            return colorNode;
         }
      }

      return null;
   },
   createMultiTextureCoordinate: function (texCoords)
   {
      switch (texCoords .length)
      {
         case 0:
            return null;
         case 1:
            return this .createTextureCoordinate (texCoords [0]);
         default:
            return null;
      }
   },
   createTextureCoordinate: function (texCoords)
   {
      if (!texCoords)
         return null;

      switch (texCoords .type)
      {
         case "VEC2":
         {
            const
               scene                 = this .getScene (),
               textureCoordinateNode = scene .createNode ("TextureCoordinate", false);

            textureCoordinateNode ._point = texCoords .array;

            textureCoordinateNode .setup ();

            return textureCoordinateNode;
         }
         case "VEC3":
         {
            const
               scene                 = this .getScene (),
               textureCoordinateNode = scene .createNode ("TextureCoordinate3D", false);

            textureCoordinateNode ._point = texCoords .array;

            textureCoordinateNode .setup ();

            return textureCoordinateNode;
         }
         case "VEC4":
         {
            const
               scene                 = this .getScene (),
               textureCoordinateNode = scene .createNode ("TextureCoordinate4D", false);

            textureCoordinateNode ._point = texCoords .array;

            textureCoordinateNode .setup ();

            return textureCoordinateNode;
         }
      }

      return null;
   },
   createNormal: function (normal)
   {
      if (!(normal instanceof Object))
         return null;

      if (!normal)
         return null;

      if (normal .type !== "VEC3")
         return null;

      const
         scene      = this .getScene (),
         normalNode = scene .createNode ("Normal", false);

      normalNode ._vector = normal .array;

      normalNode .setup ();

      return normalNode;
   },
   createCoordinate: function (position)
   {
      if (!(position instanceof Object))
         return null;

      if (!position)
         return null;

      if (position .type !== "VEC3")
         return null;

      const
         scene          = this .getScene (),
         coordinateNode = scene .createNode ("Coordinate", false);

      coordinateNode ._point = position .array;

      coordinateNode .setup ();

      return coordinateNode;
   },
   vectorValue: function (array, vector)
   {
      if (!(array instanceof Array))
         return false;

      if (array .length !== vector .length)
         return false;

      vector .set (... array);

      return true;
   },
   numberValue: function (value, defaultValue)
   {
      if (typeof value !== "number")
         return defaultValue;

      return value;
   }
});

export default GLTFParser;
