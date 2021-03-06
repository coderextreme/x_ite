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
	"jquery",
	"x_ite/Error",
	"x_ite/Basic/X3DFieldDefinition",
	"x_ite/Basic/FieldDefinitionArray",
	"x_ite/Basic/X3DField",
	"x_ite/Basic/X3DArrayField",
	"x_ite/Fields",
	"x_ite/Browser/X3DBrowser",
	"x_ite/Configuration/ComponentInfo",
	"x_ite/Configuration/ComponentInfoArray",
	"x_ite/Configuration/ProfileInfo",
	"x_ite/Configuration/ProfileInfoArray",
	"x_ite/Configuration/UnitInfo",
	"x_ite/Configuration/UnitInfoArray",
	"x_ite/Execution/X3DExecutionContext",
	"x_ite/Execution/X3DScene",
	"x_ite/Prototype/ExternProtoDeclarationArray",
	"x_ite/Prototype/ProtoDeclarationArray",
	"x_ite/Prototype/X3DExternProtoDeclaration",
	"x_ite/Prototype/X3DProtoDeclaration",
	"x_ite/Routing/RouteArray",
	"x_ite/Routing/X3DRoute",
	"x_ite/Bits/X3DConstants",
	"x_ite/Browser/Networking/urls",
],
function ($,
          Error,
          X3DFieldDefinition,
          FieldDefinitionArray,
          X3DField,
          X3DArrayField,
          Fields,
          X3DBrowser,
          ComponentInfo,
          ComponentInfoArray,
          ProfileInfo,
          ProfileInfoArray,
          UnitInfo,
          UnitInfoArray,
          X3DExecutionContext,
          X3DScene,
          ExternProtoDeclarationArray,
          ProtoDeclarationArray,
          X3DExternProtoDeclaration,
          X3DProtoDeclaration,
          RouteArray,
          X3DRoute,
          X3DConstants,
          urls)
{
"use strict";

	// Console fallback

	if (! console)        console        = { };
	if (! console .log)   console .log   = function () { };
	if (! console .info)  console .info  = console .log;
	if (! console .warn)  console .warn  = console .log;
	if (! console .error) console .error = console .log;

	// DEBUG
	//	function print ()
	//	{
	//		var string = "";
	//
	//		for (var i = 0; i < arguments .length; ++ i)
	//			string += arguments [i];
	//
	//		$(".x_ite-console") .append (string);
	//	}
	//
	//	console .log   = print;
	//	console .info  = print;
	//	console .warn  = print;
	//	console .error = print;

	// X3D

	function createBrowser (url, parameter)
	{
		var element = $("<X3DCanvas></X3DCanvas>");

		if (url instanceof Fields .MFString)
			 element .attr ("url", url .toString ())

		createBrowserFromElement (element);

		return element [0];
	}

	function getBrowser (dom)
	{
		return $(dom || "X3DCanvas") .data ("browser");
	}

	function createBrowserFromElement (dom)
	{
		dom = $(dom);

		if (dom .find (".x_ite-private-browser") .length)
			return;

		var browser = new X3DBrowser (dom);

		dom .data ("browser", browser);

		browser .setup ();

		return browser;
	}

	var
		initialized = false,
		callbacks   = $.Deferred (),
		fallbacks   = $.Deferred ();

	function X3D (callback, fallback)
	{
		if (typeof callback === "function")
			callbacks .done (callback);

		if (typeof fallback === "function")
			fallbacks .done (fallback);

		if (initialized)
			return;

		initialized = true;

		$(function ()
		{
			var elements = $("X3DCanvas");

			elements .children () .hide ();

			try
			{
				$.map (elements, createBrowserFromElement);
				callbacks .resolve ();
			}
			catch (error)
			{
				Error .fallback (elements, error);
				fallbacks .resolve (error);
			}
		});
	}

	function getComponentUrl (name)
	{
		return urls .getProviderUrl (name);
	}

	Object .assign (X3D,
	{
		require:                     require,
		define:                      define,
		getComponentUrl:             getComponentUrl,

		getBrowser:                  getBrowser,
		createBrowser:               createBrowser,

		X3DConstants:                X3DConstants,
		X3DBrowser:                  X3DBrowser,
		X3DExecutionContext:         X3DExecutionContext,
		X3DScene:                    X3DScene,
		ComponentInfo:               ComponentInfo,
		ComponentInfoArray:          ComponentInfoArray,
		ProfileInfo:                 ProfileInfo,
		ProfileInfoArray:            ProfileInfoArray,
		UnitInfo:                    UnitInfo,
		UnitInfoArray:               UnitInfoArray,
		ExternProtoDeclarationArray: ExternProtoDeclarationArray,
		ProtoDeclarationArray:       ProtoDeclarationArray,
		X3DExterProtonDeclaration:   X3DExternProtoDeclaration,
		X3DProtoDeclaration:         X3DProtoDeclaration,
		RouteArray:                  RouteArray,
		X3DRoute:                    X3DRoute,

		X3DFieldDefinition:          X3DFieldDefinition,
		FieldDefinitionArray:        FieldDefinitionArray,

		X3DField:                    X3DField,
		X3DArrayField:               X3DArrayField,

		SFColor:                     Fields .SFColor,
		SFColorRGBA:                 Fields .SFColorRGBA,
		SFImage:                     Fields .SFImage,
		SFMatrix3d:                  Fields .SFMatrix3d,
		SFMatrix3f:                  Fields .SFMatrix3f,
		SFMatrix4d:                  Fields .SFMatrix4d,
		SFMatrix4f:                  Fields .SFMatrix4f,
		SFNode:                      Fields .SFNode,
		SFRotation:                  Fields .SFRotation,
		SFVec2d:                     Fields .SFVec2d,
		SFVec2f:                     Fields .SFVec2f,
		SFVec3d:                     Fields .SFVec3d,
		SFVec3f:                     Fields .SFVec3f,
		SFVec4d:                     Fields .SFVec4d,
		SFVec4f:                     Fields .SFVec4f,
		VrmlMatrix:                  Fields .VrmlMatrix,
							              
		MFBool:                      Fields .MFBool,
		MFColor:                     Fields .MFColor,
		MFColorRGBA:                 Fields .MFColorRGBA,
		MFDouble:                    Fields .MFDouble,
		MFFloat:                     Fields .MFFloat,
		MFImage:                     Fields .MFImage,
		MFInt32:                     Fields .MFInt32,
		MFMatrix3d:                  Fields .MFMatrix3d,
		MFMatrix3f:                  Fields .MFMatrix3f,
		MFMatrix4d:                  Fields .MFMatrix4d,
		MFMatrix4f:                  Fields .MFMatrix4f,
		MFNode:                      Fields .MFNode,
		MFRotation:                  Fields .MFRotation,
		MFString:                    Fields .MFString,
		MFTime:                      Fields .MFTime,
		MFVec2d:                     Fields .MFVec2d,
		MFVec2f:                     Fields .MFVec2f,
		MFVec3d:                     Fields .MFVec3d,
		MFVec3f:                     Fields .MFVec3f,
		MFVec4d:                     Fields .MFVec4d,
		MFVec4f:                     Fields .MFVec4f,
	});

	return X3D;
});
