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
	"x_ite/DEBUG",
	"x_ite/Browser/X3DBrowserContext",
	"x_ite/Configuration/SupportedNodes",
	"x_ite/Components/Core",
	"x_ite/Components/EnvironmentalEffects",
	"x_ite/Components/EnvironmentalSensor",
	"x_ite/Components/Followers",
	"x_ite/Components/Geometry3D",
	"x_ite/Components/Grouping",
	"x_ite/Components/Interpolation",
	"x_ite/Components/Layering",
	"x_ite/Components/Lighting",
	"x_ite/Components/Navigation",
	"x_ite/Components/Networking",
	"x_ite/Components/PointingDeviceSensor",
	"x_ite/Components/Rendering",
	"x_ite/Components/Shaders",
	"x_ite/Components/Shape",
	"x_ite/Components/Sound",
	"x_ite/Components/Text",
	"x_ite/Components/Texturing",
	"x_ite/Components/Time",
],
function (DEBUG,
          X3DBrowserContext,
          SupportedNodes)
{
"use strict";

	function Components () { }

	Components .prototype =
	{
		addComponent: function (component)
		{
			if (component .types)
			{
				for (const typeName in component .types)
					SupportedNodes .addType (typeName, component .types [typeName]);
			}

			if (component .abstractTypes)
			{
				for (const typeName in component .abstractTypes)
					SupportedNodes .addAbstractType (typeName, component .abstractTypes [typeName]);
			}

			if (component .browser)
				X3DBrowserContext .addContext (component .browser);

			if (component .name)
			{
				if (DEBUG)
					console .log ("Done loading external component '" + component .name + "'.");
			}
		},
	};

	return new Components ();
});
