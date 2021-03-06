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
	"x_ite/Basic/X3DBaseNode",
	"x_ite/Bits/X3DConstants",
],
function (X3DBaseNode,
          X3DConstants)
{
"use strict";

	function X3DNode (executionContext)
	{
		X3DBaseNode .call (this, executionContext);

		this .addType (X3DConstants .X3DNode);
	}

	X3DNode .prototype = Object .assign (Object .create (X3DBaseNode .prototype),
	{
		constructor: X3DNode,
		getLayers: function ()
		{
			return this .findParents (X3DConstants .X3DLayerNode, this);
		},
		findParents: function (type, object)
		{
			var
				array = [ ],
				seen  = new Set ();

			object .getParents () .forEach (function (parent)
			{
				this .findParentsImpl (type, parent, array, seen);
			},
			this);
	
			return array;
		},
		findParentsImpl: function (type, object, array, seen)
		{
			if (seen .has (object .getId ()))
				return;

			seen .add (object .getId ());

			if (object instanceof X3DBaseNode)
			{
				var types = object .getType ();

				for (var t = types .length - 1; t >= 0; -- t)
				{
					switch (types [t])
					{
						case X3DConstants .X3DProtoDeclarationNode:
						case X3DConstants .X3DNode:
							break;
						case X3DConstants .LayerSet:
						case X3DConstants .X3DBaseNode:
						case X3DConstants .X3DMetadataObject:
						case X3DConstants .X3DProgrammableShaderObject:
						case X3DConstants .X3DScriptNode:
							return;
						default:
							continue;
					}
		
					break;
				}

				if (object .getType () .indexOf (type) !== -1)
				{
					array .push (object);
					return;
				}
			}

			object .getParents () .forEach (function (parent)
			{
				this .findParentsImpl (type, parent, array, seen);
			},
			this);
		},
	});

	return X3DNode;
});

