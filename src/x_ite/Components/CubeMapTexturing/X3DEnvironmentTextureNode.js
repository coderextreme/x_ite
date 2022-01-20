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
	"x_ite/Bits/X3DConstants",
],
function (X3DSingleTextureNode,
          X3DConstants)
{
"use strict";

	function X3DEnvironmentTextureNode (executionContext)
	{
		X3DSingleTextureNode .call (this, executionContext);

		this .addType (X3DConstants .X3DEnvironmentTextureNode);

		const gl = this .getBrowser () .getContext ();

		this .target = gl .TEXTURE_CUBE_MAP;

		this .targets = [
			gl .TEXTURE_CUBE_MAP_POSITIVE_Z, // Front
			gl .TEXTURE_CUBE_MAP_NEGATIVE_Z, // Back
			gl .TEXTURE_CUBE_MAP_NEGATIVE_X, // Left
			gl .TEXTURE_CUBE_MAP_POSITIVE_X, // Right
			gl .TEXTURE_CUBE_MAP_POSITIVE_Y, // Top
			gl .TEXTURE_CUBE_MAP_NEGATIVE_Y, // Bottom
		];
}

	X3DEnvironmentTextureNode .prototype = Object .assign (Object .create (X3DSingleTextureNode .prototype),
	{
		constructor: X3DEnvironmentTextureNode,
		getTarget: function ()
		{
			return this .target;
		},
		getTargets: function ()
		{
			return this .targets;
		},
		clearTexture: (function ()
		{
			var defaultData = new Uint8Array ([ 255, 255, 255, 255 ]);

			return function ()
			{
				var
					gl      = this .getBrowser () .getContext (),
					targets = this .getTargets ();

				gl .bindTexture (this .getTarget (), this .getTexture ());

				for (var i = 0, length = targets .length; i < length; ++ i)
					gl .texImage2D (targets [i], 0, gl .RGBA, 1, 1, 0, gl .RGBA, gl .UNSIGNED_BYTE, defaultData);
			};
		})(),
		updateTextureProperties: function ()
		{
			X3DSingleTextureNode .prototype .updateTextureProperties .call (this,
			                                                                this .target,
			                                                                this .textureProperties_ .getValue (),
			                                                                this .texturePropertiesNode,
			                                                                128,
			                                                                128,
			                                                                false,
			                                                                false,
			                                                                false);
		},
		setShaderUniformsToChannel: function (gl, shaderObject, renderObject, i)
		{
			gl .activeTexture (gl .TEXTURE0 + shaderObject .getBrowser () .getCubeMapTextureUnits () [i]);
			gl .bindTexture (gl .TEXTURE_CUBE_MAP, this .getTexture ());
			gl .uniform1i (shaderObject .x3d_TextureType [i], 4);
		},
	});

	return X3DEnvironmentTextureNode;
});
