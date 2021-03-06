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
	"x_ite/Basic/X3DFieldDefinition",
	"x_ite/Basic/FieldDefinitionArray",
	"x_ite/Components/Texturing/X3DTextureTransformNode",
	"x_ite/Bits/X3DConstants",
	"x_ite/Bits/X3DCast",
],
function (Fields,
          X3DFieldDefinition,
          FieldDefinitionArray,
          X3DTextureTransformNode, 
          X3DConstants,
          X3DCast)
{
"use strict";

	function MultiTextureTransform (executionContext)
	{
		X3DTextureTransformNode .call (this, executionContext);

		this .addType (X3DConstants .MultiTextureTransform);

		this .textureTransformNodes = [ ];
	}

	MultiTextureTransform .prototype = Object .assign (Object .create (X3DTextureTransformNode .prototype),
	{
		constructor: MultiTextureTransform,
		fieldDefinitions: new FieldDefinitionArray ([
			new X3DFieldDefinition (X3DConstants .inputOutput, "metadata",         new Fields .SFNode ()),
			new X3DFieldDefinition (X3DConstants .inputOutput, "textureTransform", new Fields .MFNode ()),
		]),
		getTypeName: function ()
		{
			return "MultiTextureTransform";
		},
		getComponentName: function ()
		{
			return "Texturing";
		},
		getContainerField: function ()
		{
			return "textureTransform";
		},
		initialize: function ()
		{
			X3DTextureTransformNode .prototype .initialize .call (this);

			this .textureTransform_ .addInterest ("set_textureTransform_", this);

			this .set_textureTransform__ ();
		},
		set_textureTransform__: function ()
		{
			var textureTransformNodes = this .textureTransformNodes;

			textureTransformNodes .length = 0;

			for (var i = 0, length = this .textureTransform_ .length; i < length; ++ i)
			{
				var node = this .textureTransform_ [i];

				if (X3DCast (X3DConstants .MultiTextureTransform, node))
					continue;

				var textureTransformNode = X3DCast (X3DConstants .X3DTextureTransformNode, node);

				if (textureTransformNode)
					textureTransformNodes .push (textureTransformNode);
			}
		},
		setShaderUniforms: function (gl, shaderObject)
		{
			var
				textureTransformNodes = this .textureTransformNodes,
				length                = Math .min (shaderObject .x3d_MaxTextures, textureTransformNodes .length);

			for (var i = 0; i < length; ++ i)
				textureTransformNodes [i] .setShaderUniformsToChannel (gl, shaderObject, i);

			if (length)
			{
				var last = length - 1;

				for (var i = length, length = shaderObject .x3d_MaxTextures; i < length; ++ i)
					textureTransformNodes [last] .setShaderUniformsToChannel (gl, shaderObject, i);
			}
			else
			{
				for (var i = 0, length = shaderObject .x3d_MaxTextures; i < length; ++ i)
					this .setShaderUniformsToChannel (gl, shaderObject, i);
			}
		},
	});

	return MultiTextureTransform;
});


