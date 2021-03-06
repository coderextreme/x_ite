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
	"x_ite/Basic/X3DFieldDefinition",
	"x_ite/Basic/FieldDefinitionArray",
	"x_ite/Components/VolumeRendering/X3DComposableVolumeRenderStyleNode",
	"x_ite/Bits/X3DConstants",
],
function (Fields,
          X3DFieldDefinition,
          FieldDefinitionArray,
          X3DComposableVolumeRenderStyleNode,
          X3DConstants)
{
"use strict";

	function BoundaryEnhancementVolumeStyle (executionContext)
	{
		X3DComposableVolumeRenderStyleNode .call (this, executionContext);

		this .addType (X3DConstants .BoundaryEnhancementVolumeStyle);
	}

	BoundaryEnhancementVolumeStyle .prototype = Object .assign (Object .create (X3DComposableVolumeRenderStyleNode .prototype),
	{
		constructor: BoundaryEnhancementVolumeStyle,
		fieldDefinitions: new FieldDefinitionArray ([
			new X3DFieldDefinition (X3DConstants .inputOutput, "metadata",        new Fields .SFNode ()),
			new X3DFieldDefinition (X3DConstants .inputOutput, "enabled",         new Fields .SFBool (true)),
			new X3DFieldDefinition (X3DConstants .inputOutput, "retainedOpacity", new Fields .SFFloat (0.2)),
			new X3DFieldDefinition (X3DConstants .inputOutput, "boundaryOpacity", new Fields .SFFloat (0.9)),
			new X3DFieldDefinition (X3DConstants .inputOutput, "opacityFactor",   new Fields .SFFloat (2)),
		]),
		getTypeName: function ()
		{
			return "BoundaryEnhancementVolumeStyle";
		},
		getComponentName: function ()
		{
			return "VolumeRendering";
		},
		getContainerField: function ()
		{
			return "renderStyle";
		},
		addShaderFields: function (shaderNode)
		{
			if (! this .enabled_ .getValue ())
				return;

			shaderNode .addUserDefinedField (X3DConstants .inputOutput, "retainedOpacity_" + this .getId (), this .retainedOpacity_ .copy ());
			shaderNode .addUserDefinedField (X3DConstants .inputOutput, "boundaryOpacity_" + this .getId (), this .boundaryOpacity_ .copy ());
			shaderNode .addUserDefinedField (X3DConstants .inputOutput, "opacityFactor_"   + this .getId (), this .opacityFactor_   .copy ());
		},
		getUniformsText: function ()
		{
			if (! this .enabled_ .getValue ())
				return "";

			var string = "";

			string += "\n";
			string += "// BoundaryEnhancementVolumeStyle\n";
			string += "\n";
			string += "uniform float retainedOpacity_" + this .getId () + ";\n";
			string += "uniform float boundaryOpacity_" + this .getId () + ";\n";
			string += "uniform float opacityFactor_" + this .getId () + ";\n";

			string += "\n";
			string += "vec4\n";
			string += "getBoundaryEnhancementStyle_" + this .getId () + " (in vec4 originalColor, in vec3 texCoord)\n";
			string += "{\n";
			string += "	float f0 = texture (x3d_Texture3D [0], texCoord) .r;\n";
			string += "	float f1 = texture (x3d_Texture3D [0], texCoord + vec3 (0.0, 0.0, 1.0 / x3d_TextureSize .z)) .r;\n";
			string += "	float f  = abs (f0 - f1);\n";
			string += "\n";
			string += "	float retainedOpacity = retainedOpacity_" + this .getId () + ";\n";
			string += "	float boundaryOpacity = boundaryOpacity_" + this .getId () + ";\n";
			string += "	float opacityFactor   = opacityFactor_" + this .getId () + ";\n";
			string += "\n";
			string += "	return vec4 (originalColor .rgb, originalColor .a * (retainedOpacity + boundaryOpacity * pow (f, opacityFactor)));\n";
			string += "}\n";

			return string;
		},
		getFunctionsText: function ()
		{
			if (! this .enabled_ .getValue ())
				return "";

			var string = "";

			string += "\n";
			string += "	// BoundaryEnhancementVolumeStyle\n";
			string += "\n";
			string += "	textureColor = getBoundaryEnhancementStyle_" + this .getId () + " (textureColor, texCoord);\n";

			return string;
		},
	});

	return BoundaryEnhancementVolumeStyle;
});
