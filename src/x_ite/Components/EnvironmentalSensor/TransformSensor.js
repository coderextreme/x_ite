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
	"x_ite/Components/EnvironmentalSensor/X3DEnvironmentalSensorNode",
	"x_ite/Bits/TraverseType",
	"x_ite/Bits/X3DConstants",
	"x_ite/Bits/X3DCast",
	"standard/Math/Numbers/Vector3",
	"standard/Math/Numbers/Rotation4",
	"standard/Math/Numbers/Matrix4",
	"standard/Math/Geometry/Box3",
	"standard/Utility/ObjectCache",
],
function (Fields,
          X3DFieldDefinition,
          FieldDefinitionArray,
          X3DEnvironmentalSensorNode, 
          TraverseType,
          X3DConstants,
          X3DCast,
          Vector3,
          Rotation4,
          Matrix4,
          Box3,
          ObjectCache)
{
"use strict";

	var
		ModelMatrixCache = ObjectCache (Matrix4),
		TargetBBoxCache  = ObjectCache (Box3);

	function TransformSensor (executionContext)
	{
		X3DEnvironmentalSensorNode .call (this, executionContext);

		this .addType (X3DConstants .TransformSensor);

		this .position_changed_ .setUnit ("length");

		this .setZeroTest (true);

		this .bbox             = new Box3 ();
		this .targetObjectNode = null;
		this .modelMatrices    = [ ];
		this .targetBBoxes     = [ ];
	}

	TransformSensor .prototype = Object .assign (Object .create (X3DEnvironmentalSensorNode .prototype),
	{
		constructor: TransformSensor,
		fieldDefinitions: new FieldDefinitionArray ([
			new X3DFieldDefinition (X3DConstants .inputOutput, "metadata",            new Fields .SFNode ()),
			new X3DFieldDefinition (X3DConstants .inputOutput, "enabled",             new Fields .SFBool (true)),
			new X3DFieldDefinition (X3DConstants .inputOutput, "size",                new Fields .SFVec3f ()),
			new X3DFieldDefinition (X3DConstants .inputOutput, "center",              new Fields .SFVec3f ()),
			new X3DFieldDefinition (X3DConstants .outputOnly,  "enterTime",           new Fields .SFTime ()),
			new X3DFieldDefinition (X3DConstants .outputOnly,  "exitTime",            new Fields .SFTime ()),
			new X3DFieldDefinition (X3DConstants .outputOnly,  "isActive",            new Fields .SFBool ()),
			new X3DFieldDefinition (X3DConstants .outputOnly,  "position_changed",    new Fields .SFVec3f ()),
			new X3DFieldDefinition (X3DConstants .outputOnly,  "orientation_changed", new Fields .SFRotation ()),
			new X3DFieldDefinition (X3DConstants .inputOutput, "targetObject",        new Fields .SFNode ()),
		]),
		getTypeName: function ()
		{
			return "TransformSensor";
		},
		getComponentName: function ()
		{
			return "EnvironmentalSensor";
		},
		getContainerField: function ()
		{
			return "children";
		},
		initialize: function ()
		{
			X3DEnvironmentalSensorNode .prototype .initialize .call (this);
		
			this .isLive () .addInterest ("set_enabled__", this);

			this .enabled_      .addInterest ("set_enabled__",      this);
			this .size_         .addInterest ("set_enabled__",      this);
			this .size_         .addInterest ("set_bbox__",         this);
			this .center_       .addInterest ("set_bbox__",         this);
			this .targetObject_ .addInterest ("set_targetObject__", this);

			this .set_bbox__ ();
			this .set_targetObject__ ();
		},
		set_live__: function ()
		{ },
		set_enabled__: function ()
		{
			if (this .isLive () .getValue () && this .targetObjectNode && this .enabled_ .getValue () && ! this .size_. getValue () .equals (Vector3 .Zero))
			{
				this .setPickableObject (true);
				this .getBrowser () .addTransformSensor (this);
				this .targetObjectNode .addTransformSensor (this);
			}
			else
			{
				this .setPickableObject (false);
				this .getBrowser () .removeTransformSensor (this);

				if (this .targetObjectNode)
					this .targetObjectNode .removeTransformSensor (this);

				if (this .isActive_ .getValue ())
				{
					this .isActive_ = false;
					this .exitTime_ = this .getBrowser () .getCurrentTime ();
				}
			}
		},
		set_bbox__: function ()
		{
			this .bbox .set (this .size_ .getValue (), this .center_ .getValue ());
		},
		set_targetObject__: function ()
		{
			this .targetObjectNode = null;

			try
			{
				var
					node = this .targetObject_ .getValue () .getInnerNode (),
					type = node .getType ();
	
				for (var t = type .length - 1; t >= 0; -- t)
				{
					switch (type [t])
					{
						case X3DConstants .X3DGroupingNode:
						case X3DConstants .X3DShapeNode:
						{
							this .targetObjectNode = node;
							break;
						}
						default:
							continue;
					}
				}
			}
			catch (error)
			{ }

			this .set_enabled__ ();
		},
		traverse: function (type, renderObject)
		{
			// TransformSensor nodes are sorted out and only traversed during PICKING, except if is child of a LOD or Switch node.

			if (type !== TraverseType .PICKING)
				return;

			if (this .getPickableObject ())
				this .modelMatrices .push (ModelMatrixCache .pop () .assign (renderObject .getModelViewMatrix () .get ()));
		},
		collect: function (targetBBox)
		{
			this .targetBBoxes .push (TargetBBoxCache .pop () .assign (targetBBox));
		},
		process: (function ()
		{
			var
				bbox        = new Box3 (),
				position    = new Vector3 (0, 0, 0),
				orientation = new Rotation4 (0, 0, 1, 0),
				infinity    = new Vector3 (-1, -1, -1);

			return function ()
			{
				var
					modelMatrices = this .modelMatrices,
					targetBBoxes  = this .targetBBoxes,
					active        = false;

				for (var m = 0, mLength = modelMatrices .length; m < mLength; ++ m)
				{
					var modelMatrix = modelMatrices [m];

					bbox .assign (this .bbox) .multRight (modelMatrix);

					for (var t = 0, tLength = targetBBoxes .length; t < tLength; ++ t)
					{
						var targetBBox = targetBBoxes [t];

						if (this .size_ .getValue () .equals (infinity) || bbox .intersectsBox (targetBBox))
						{
							active = true;

							targetBBox .multRight (modelMatrix .inverse ()) .getMatrix () .get (position, orientation);
						}

						TargetBBoxCache .push (targetBBox);
					}

					ModelMatrixCache .push (modelMatrix);
				}

				if (active)
				{
					if (this .isActive_ .getValue ())
					{
						if (! this .position_changed_ .getValue () .equals (position))
							this .position_changed_ = position;
		
						if (! this .orientation_changed_ .getValue () .equals (orientation))
							this .orientation_changed_ = orientation;
					}
					else
					{
						this .isActive_            = true;
						this .enterTime_           = this .getBrowser () .getCurrentTime ();
						this .position_changed_    = position;
						this .orientation_changed_ = orientation;
					}
				}
				else
				{
					if (this .isActive_ .getValue ())
					{
						this .isActive_ = false;
						this .exitTime_ = this .getBrowser () .getCurrentTime ();
					}
				}

				this .modelMatrices .length = 0;
				this .targetBBoxes  .length = 0;
			};
		})(),
	});

	return TransformSensor;
});


