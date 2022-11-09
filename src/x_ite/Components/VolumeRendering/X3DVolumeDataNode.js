/* -*- Mode: JavaScript; coding: utf-8; tab-width: 3; indent-tabs-mode: tab; c-basic-offset: 3 -*-
 *******************************************************************************
 *
 * DO NOT ALTER OR REMOVE COPYRIGHT NOTICES OR THIS FILE HEADER.
 *
 * Copyright create3000, ScheffelstraÃe 31a, Leipzig, Germany 2011.
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
   "x_ite/Components/Core/X3DChildNode",
   "x_ite/Components/Grouping/X3DBoundedObject",
   "x_ite/Base/X3DConstants",
   "x_ite/Browser/Core/TextureQuality",
   "x_ite/Browser/VolumeRendering/VolumeMaterial",
   "standard/Math/Numbers/Vector3",
],
function (Fields,
          X3DChildNode,
          X3DBoundedObject,
          X3DConstants,
          TextureQuality,
          VolumeMaterial,
          Vector3)
{
"use strict";

   function X3DVolumeDataNode (executionContext)
   {
      X3DChildNode     .call (this, executionContext);
      X3DBoundedObject .call (this, executionContext);

      this .addType (X3DConstants .X3DVolumeDataNode);

      this .proximitySensorNode      = executionContext .createNode ("ProximitySensor",     false);
      this .transformNode            = executionContext .createNode ("Transform",           false);
      this .shapeNode                = executionContext .createNode ("Shape",               false);
      this .appearanceNode           = executionContext .createNode ("Appearance",          false);
      this .textureTransformNode     = executionContext .createNode ("TextureTransform3D",  false);
      this .geometryNode             = executionContext .createNode ("QuadSet",             false);
      this .textureCoordinateNode    = executionContext .createNode ("TextureCoordinate3D", false);
      this .coordinateNode           = executionContext .createNode ("Coordinate",          false);
      this .volumeMaterialNode       = new VolumeMaterial (executionContext);
      this .textureNormalMatrixArray = new Float32Array (9);

      this .setCameraObject (true);
   }

   X3DVolumeDataNode .prototype = Object .assign (Object .create (X3DChildNode .prototype),
      X3DBoundedObject .prototype,
   {
      constructor: X3DVolumeDataNode,
      initialize: function ()
      {
         X3DChildNode     .prototype .initialize .call (this);
         X3DBoundedObject .prototype .initialize .call (this);

         const
            browser = this .getBrowser (),
            gl      = browser .getContext ();

         browser .getBrowserOptions () ._TextureQuality .addInterest ("set_dimensions__", this);

         if (gl .getVersion () >= 2)
         {
            this ._dimensions .addInterest ("set_dimensions__", this);

            this .set_dimensions__ ();
         }

         this ._visible     .addFieldInterest (this .transformNode ._visible);
         this ._bboxDisplay .addFieldInterest (this .transformNode ._bboxDisplay);

         this .proximitySensorNode ._size         = new Fields .SFVec3f (-1, -1, -1);
         this .transformNode ._children           = new Fields .MFNode (this .shapeNode);
         this .shapeNode ._appearance             = this .appearanceNode;
         this .shapeNode ._geometry               = this .geometryNode;
         this .appearanceNode ._alphaMode         = "BLEND";
         this .appearanceNode ._material          = this .volumeMaterialNode;
         this .appearanceNode ._textureTransform  = this .textureTransformNode;
         this .textureTransformNode ._translation = new Fields .SFVec3f (0.5, 0.5, 0.5);
         this .textureTransformNode ._center      = new Fields .SFVec3f (-0.5, -0.5, -0.5);
         this .geometryNode ._texCoord            = this .textureCoordinateNode;
         this .geometryNode ._coord               = this .coordinateNode;

         this .volumeMaterialNode .setVolumeData (this);

         this .coordinateNode        .setPrivate (true);
         this .textureCoordinateNode .setPrivate (true);
         this .geometryNode          .setPrivate (true);
         this .textureTransformNode  .setPrivate (true);
         this .volumeMaterialNode    .setPrivate (true);
         this .appearanceNode        .setPrivate (true);
         this .shapeNode             .setPrivate (true);
         this .transformNode         .setPrivate (true);
         this .proximitySensorNode   .setPrivate (true);

         this .coordinateNode        .setup ();
         this .textureCoordinateNode .setup ();
         this .geometryNode          .setup ();
         this .textureTransformNode  .setup ();
         this .volumeMaterialNode    .setup ();
         this .appearanceNode        .setup ();
         this .shapeNode             .setup ();
         this .transformNode         .setup ();
         this .proximitySensorNode   .setup ();

         this .proximitySensorNode ._orientation_changed .addFieldInterest (this .transformNode ._rotation);
         this .proximitySensorNode ._orientation_changed .addFieldInterest (this .textureTransformNode ._rotation);

         this .textureTransformNode .addInterest ("set_textureTransform__", this);

         this .set_textureTransform__ ();
      },
      getBBox: function (bbox, shadows)
      {
         if (this ._bboxSize .getValue () .equals (this .getDefaultBBoxSize ()))
            return bbox .set (this ._dimensions .getValue (), Vector3 .Zero);

         return bbox .set (this ._bboxSize .getValue (), this ._bboxCenter .getValue ());
      },
      getAppearance: function ()
      {
         return this .appearanceNode;
      },
      updateShader: function ()
      {
         this .volumeMaterialNode .getVolumeShaders () .clear ();
      },
      addShaderUniformNames: function (uniformNames)
      {
         uniformNames .push ("x3d_TextureNormalMatrix");
      },
      getNumPlanes: function ()
      {
         switch (this .getBrowser () .getBrowserOptions () .getTextureQuality ())
         {
            case TextureQuality .LOW:
            {
               return 200;
            }
            case TextureQuality .MEDIUM:
            {
               return 400;
            }
            case TextureQuality .HIGH:
            {
               return 600;
            }
         }

         return 200;
      },
      set_dimensions__: function ()
      {
         const
            NUM_PLANES = this .getNumPlanes (),
            size       = this ._dimensions .getValue () .magnitude (),
            size1_2    = size / 2,
            points     = [ ];

         this .coordinateNode ._point .length = 0;

         for (let i = 0; i < NUM_PLANES; ++ i)
         {
            const z = i / (NUM_PLANES - 1) - 0.5;

            points .push ( size1_2,  size1_2, size * z,
                          -size1_2,  size1_2, size * z,
                          -size1_2, -size1_2, size * z,
                           size1_2, -size1_2, size * z);
         }

         this .coordinateNode ._point        = points;
         this .textureCoordinateNode ._point = points;
         this .textureTransformNode ._scale  = new Fields .SFVec3f (1 / this ._dimensions .x,
                                                                    1 / this ._dimensions .y,
                                                                    1 / this ._dimensions .z);
      },
      set_textureTransform__: function ()
      {
         this .textureNormalMatrixArray .set (this .textureTransformNode .getMatrix () .submatrix .inverse ());
      },
      traverse: function (type, renderObject)
      {
         this .proximitySensorNode .traverse (type, renderObject);
         this .transformNode       .traverse (type, renderObject);
      },
      setShaderUniforms (gl, shaderObject)
      {
         gl .uniformMatrix3fv (shaderObject .x3d_TextureNormalMatrix, true, this .textureNormalMatrixArray);
      },
   });

   return X3DVolumeDataNode;
});
