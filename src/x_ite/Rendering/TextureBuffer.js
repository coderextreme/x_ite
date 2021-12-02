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
	"standard/Math/Geometry/ViewVolume",
	"standard/Math/Numbers/Vector3",
	"standard/Math/Numbers/Matrix4",
],
function (ViewVolume,
          Vector3,
          Matrix4)
{
"use strict";

	function TextureBuffer (browser, width, height)
	{
		const gl = browser .getContext ();

		this .browser = browser;
		this .width   = width;
		this .height  = height;
		this .array   = new Uint8Array (width * height * 4);

		// The frame buffer.

		this .lastBuffer = gl .getParameter (gl .FRAMEBUFFER_BINDING);
		this .buffer     = gl .createFramebuffer ();

		gl .bindFramebuffer (gl .FRAMEBUFFER, this .buffer);

		// The depth texture

		this .colorTexture = gl .createTexture ();

		gl .bindTexture (gl .TEXTURE_2D, this .colorTexture);
		gl .texParameteri (gl .TEXTURE_2D, gl .TEXTURE_WRAP_S,     gl .CLAMP_TO_EDGE);
		gl .texParameteri (gl .TEXTURE_2D, gl .TEXTURE_WRAP_T,     gl .CLAMP_TO_EDGE);
		gl .texParameteri (gl .TEXTURE_2D, gl .TEXTURE_MIN_FILTER, gl .LINEAR);
		gl .texParameteri (gl .TEXTURE_2D, gl .TEXTURE_MAG_FILTER, gl .LINEAR);
		gl .texImage2D (gl .TEXTURE_2D, 0, gl .RGBA, width, height, 0, gl .RGBA, gl .UNSIGNED_BYTE, null);

		gl .framebufferTexture2D (gl .FRAMEBUFFER, gl .COLOR_ATTACHMENT0, gl .TEXTURE_2D, this .colorTexture, 0);

		// The depth buffer

		if (gl .getVersion () >= 2 || browser .getExtension ("WEBGL_depth_texture"))
		{
			this .depthTexture = gl .createTexture ();

			gl .bindTexture (gl .TEXTURE_2D, this .depthTexture);

			gl .texParameteri (gl .TEXTURE_2D, gl .TEXTURE_WRAP_S,     gl .CLAMP_TO_EDGE);
			gl .texParameteri (gl .TEXTURE_2D, gl .TEXTURE_WRAP_T,     gl .CLAMP_TO_EDGE);
			gl .texParameteri (gl .TEXTURE_2D, gl .TEXTURE_MAG_FILTER, gl .NEAREST);
			gl .texParameteri (gl .TEXTURE_2D, gl .TEXTURE_MIN_FILTER, gl .NEAREST);

			const internalFormat = gl .getVersion () >= 2 ? gl .DEPTH_COMPONENT24 : gl .DEPTH_COMPONENT;

			gl .texImage2D (gl .TEXTURE_2D, 0, internalFormat, width, height, 0, gl .DEPTH_COMPONENT, gl .UNSIGNED_INT, null);
			gl.framebufferTexture2D (gl .FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, this .depthTexture, 0);
		}
		else
		{
			this .depthBuffer = gl .createRenderbuffer ();

			gl .bindRenderbuffer (gl .RENDERBUFFER, this .depthBuffer);
			gl .renderbufferStorage (gl .RENDERBUFFER, gl .DEPTH_COMPONENT16, width, height);
			gl .framebufferRenderbuffer (gl .FRAMEBUFFER, gl .DEPTH_ATTACHMENT, gl .RENDERBUFFER, this .depthBuffer);
		}

		// Always check that our framebuffer is ok

		const complete = gl .checkFramebufferStatus (gl .FRAMEBUFFER) === gl .FRAMEBUFFER_COMPLETE;

		gl .bindFramebuffer (gl .FRAMEBUFFER, this .lastBuffer);

		if (complete)
			return;

		throw new Error ("Couldn't create frame buffer.");
	}

	TextureBuffer .prototype =
	{
		constructor: TextureBuffer,
		getWidth: function ()
		{
			return this .width;
		},
		getHeight: function ()
		{
			return this .height;
		},
		getColorTexture: function ()
		{
			return this .colorTexture;
		},
		getDepthTexture: function ()
		{
			return this .depthTexture;
		},
		readPixels: function ()
		{
			const
				gl     = this .browser .getContext (),
				array  = this .array,
				width  = this .width,
				height = this .height;

			gl .readPixels (0, 0, width, height, gl .RGBA, gl .UNSIGNED_BYTE, array);

			return array;
		},
		getDepth: (function ()
		{
			const
				invProjectionMatrix = new Matrix4 (),
				point               = new Vector3 (0, 0, 0);

			return function (projectionMatrix, viewport)
			{
				try
				{
					const
						gl     = this .browser .getContext (),
						array  = this .array,
						width  = this .width,
						height = this .height;

					var
						winx = 0,
						winy = 0,
						winz = Number .POSITIVE_INFINITY;

					invProjectionMatrix .assign (projectionMatrix) .inverse ();

					gl .readPixels (0, 0, width, height, gl .RGBA, gl .UNSIGNED_BYTE, array);

					for (var wy = 0, i = 0; wy < height; ++ wy)
					{
						for (var wx = 0; wx < width; ++ wx, i += 4)
						{
							const wz = array [i] / 255 + array [i + 1] / (255 * 255) + array [i + 2] / (255 * 255 * 255) + array [i + 3] / (255 * 255 * 255 * 255);

							if (wz < winz)
							{
								winx = wx;
								winy = wy;
								winz = wz;
							}
						}
					}

					ViewVolume .unProjectPointMatrix (winx, winy, winz, invProjectionMatrix, viewport, point);

					return point .z;
				}
				catch (error)
				{
					return 0;
				}
			};
		})(),
		bind: function ()
		{
			const gl = this .browser .getContext ();

			this .lastBuffer = gl .getParameter (gl .FRAMEBUFFER_BINDING);

			gl .bindFramebuffer (gl .FRAMEBUFFER, this .buffer);
		},
		unbind: function ()
		{
			const gl = this .browser .getContext ();
			gl .bindFramebuffer (gl .FRAMEBUFFER, this .lastBuffer);
		},
	};

	return TextureBuffer;
});
