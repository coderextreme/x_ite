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
	"x_ite/Components/CADGeometry/X3DProductStructureChildNode",
	"x_ite/Components/Grouping/X3DBoundedObject",
	"x_ite/Bits/X3DConstants",
	"x_ite/Bits/TraverseType",
],
function (Fields,
          X3DFieldDefinition,
          FieldDefinitionArray,
          X3DProductStructureChildNode,
          X3DBoundedObject,
          X3DConstants,
          TraverseType)
{
"use strict";

	function CADFace (executionContext)
	{
		X3DProductStructureChildNode .call (this, executionContext);
		X3DBoundedObject             .call (this, executionContext);

		this .addType (X3DConstants .CADFace);

		this .shapeNode     = null;
		this .visibleNode   = null;
		this .boundedObject = null;
	}

	CADFace .prototype = Object .assign (Object .create (X3DProductStructureChildNode .prototype),
		X3DBoundedObject .prototype,
	{
		constructor: CADFace,
		fieldDefinitions: new FieldDefinitionArray ([
			new X3DFieldDefinition (X3DConstants .inputOutput,    "metadata",    new Fields .SFNode ()),
			new X3DFieldDefinition (X3DConstants .inputOutput,    "name",        new Fields .SFString ()),
			new X3DFieldDefinition (X3DConstants .inputOutput,    "visible",     new Fields .SFBool (true)),
			new X3DFieldDefinition (X3DConstants .inputOutput,    "bboxDisplay", new Fields .SFBool ()),
			new X3DFieldDefinition (X3DConstants .initializeOnly, "bboxSize",    new Fields .SFVec3f (-1, -1, -1)),
			new X3DFieldDefinition (X3DConstants .initializeOnly, "bboxCenter",  new Fields .SFVec3f ()),
			new X3DFieldDefinition (X3DConstants .inputOutput,    "shape",       new Fields .SFNode ()),
		]),
		getTypeName: function ()
		{
			return "CADFace";
		},
		getComponentName: function ()
		{
			return "CADGeometry";
		},
		getContainerField: function ()
		{
			return "children";
		},
		initialize: function ()
		{
			X3DProductStructureChildNode .prototype .initialize .call (this);
			X3DBoundedObject             .prototype .initialize .call (this);

			this .shape_ .addInterest ("set_shape__", this);

			this .set_shape__ ();
		},
		getBBox: function (bbox, shadow)
		{
			if (this .bboxSize_ .getValue () .equals (this .getDefaultBBoxSize ()))
			{
				const boundedObject = this .visibleNode;

				if (boundedObject)
					return boundedObject .getBBox (bbox, shadow);

				return bbox .set ();
			}

			return bbox .set (this .bboxSize_ .getValue (), this .bboxCenter_ .getValue ());
		},
		set_shape__: function ()
		{
			if (this .shapeNode)
			{
				this .shapeNode .isCameraObject_   .removeFieldInterest (this .isCameraObject_);
				this .shapeNode .isPickableObject_ .removeFieldInterest (this .isPickableObject_);

				this .shapeNode .visible_     .removeInterest ("set_visible__",     this);
				this .shapeNode .bboxDisplay_ .removeInterest ("set_bboxDisplay__", this);
			}

			this .shapeNode = null;

			try
			{
				const
					node = this .shape_ .getValue () .getInnerNode (),
					type = node .getType ();

				for (var t = type .length - 1; t >= 0; -- t)
				{
					switch (type [t])
					{
						case X3DConstants .LOD:
						case X3DConstants .Transform:
						case X3DConstants .X3DShapeNode:
						{
							node .isCameraObject_   .addFieldInterest (this .isCameraObject_);
							node .isPickableObject_ .addFieldInterest (this .isPickableObject_);

							node .visible_     .addInterest ("set_visible__",     this);
							node .bboxDisplay_ .addInterest ("set_bboxDisplay__", this);

							this .setCameraObject   (node .getCameraObject ());
							this .setPickableObject (node .getPickableObject ());

							this .shapeNode = node;
							break;
						}
						default:
							continue;
					}
				}
			}
			catch (error)
			{ }

			if (this .shapeNode)
			{
				delete this .traverse;
			}
			else
			{
				this .setCameraObject   (false);
				this .setPickableObject (false);

				this .traverse = Function .prototype;
			}

			this .set_visible__ ();
			this .set_bboxDisplay__ ();
		},
		set_cameraObject__: function ()
		{
			if (this .shapeNode && this .shapeNode .getCameraObject ())
			{
				this .setCameraObject (this .shapeNode .visible_ .getValue ());
			}
			else
			{
				this .setCameraObject (false);
			}
		},
		set_visible__: function ()
		{
			if (this .shapeNode)
			{
				this .visibleNode = this .shapeNode .visible_ .getValue () ? this .shapeNode : null;
			}
			else
			{
				this .visibleNode = this .shapeNode;
			}

			this .set_cameraObject__ ();
		},
		set_bboxDisplay__: function ()
		{
			if (this .shapeNode)
			{
				this .boundedObject = this .shapeNode .bboxDisplay_ .getValue () ? this .shapeNode : null;
			}
			else
			{
				this .boundedObject = null;
			}
		},
		traverse: function (type, renderObject)
		{
			switch (type)
			{
				case TraverseType .POINTER:
				case TraverseType .CAMERA:
				case TraverseType .DEPTH:
				{
					const visibleNode = this .visibleNode;

					if (visibleNode)
						visibleNode .traverse (type, renderObject);

					return;
				}
				case TraverseType .PICKING:
				{
					const
						browser          = renderObject .getBrowser (),
						pickingHierarchy = browser .getPickingHierarchy ();

					pickingHierarchy .push (this);

					this .shapeNode .traverse (type, renderObject);

					pickingHierarchy .pop ();
					return;
				}
				case TraverseType .COLLISION:
				{
					this .shapeNode .traverse (type, renderObject);
					return;
				}
				case TraverseType .DISPLAY:
				{
					const visibleNode = this .visibleNode;

					if (visibleNode)
						visibleNode .traverse (type, renderObject);

					const boundedObject = this .boundedObject;

					if (boundedObject)
						boundedObject .displayBBox (type, renderObject);

					return;
				}
			}
		},
	});

	return CADFace;
});
