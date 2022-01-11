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
	"standard/Math/Algorithm",
],
function (Algorithm)
{
"use strict";

	function Vector2 (x, y)
	{
		this .x = x;
		this .y = y;
	}

	Vector2 .prototype =
	{
		constructor: Vector2,
		length: 2,
		copy: function ()
		{
			const copy = Object .create (Vector2 .prototype);
			copy .x = this .x;
			copy .y = this .y;
			return copy;
		},
		assign: function (vector)
		{
			this .x = vector .x;
			this .y = vector .y;
			return this;
		},
		set: function (x, y)
		{
			this .x = x;
			this .y = y;
			return this;
		},
		equals: function (vector)
		{
			return this .x === vector .x &&
			       this .y === vector .y;
		},
		negate: function ()
		{
			this .x = -this .x;
			this .y = -this .y;
			return this;
		},
		add: function (vector)
		{
			this .x += vector .x;
			this .y += vector .y;
			return this;
		},
		subtract: function (vector)
		{
			this .x -= vector .x;
			this .y -= vector .y;
			return this;
		},
		multiply: function (value)
		{
			this .x *= value;
			this .y *= value;
			return this;
		},
		multVec: function (vector)
		{
			this .x *= vector .x;
			this .y *= vector .y;
			return this;
		},
		divide: function (value)
		{
			this .x /= value;
			this .y /= value;
			return this;
		},
		divVec: function (vector)
		{
			this .x /= vector .x;
			this .y /= vector .y;
			return this;
		},
		normalize: function ()
		{
			const
				x = this .x,
				y = this .y;

			var length = Math .sqrt (x * x +
			                         y * y);

			if (length)
			{
				length = 1 / length;

				this .x = x * length;
				this .y = y * length;
			}

			return this;
		},
		dot: function (vector)
		{
			return this .x * vector .x +
			       this .y * vector .y;
		},
		norm: function ()
		{
			const
				x = this .x,
				y = this .y;

			return x * x +
			       y * y;
		},
		abs: function ()
		{
			const
				x = this .x,
				y = this .y;

			return Math .sqrt (x * x +
			                   y * y);
		},
		distance: function (vector)
		{
			const
				x = this .x - vector .x,
				y = this .y - vector .y;

			return Math .sqrt (x * x +
			                   y * y);
		},
		lerp: function (destination, t)
		{
			const
				x = this .x,
				y = this .y;

			this .x = x + t * (destination .x - x);
			this .y = y + t * (destination .y - y);
			return this;
		},
		min: function (vector)
		{
			var
				x = this .x,
				y = this .y;

			for (var i = 0, length = arguments .length; i < length; ++ i)
			{
				const vector = arguments [i];

				x = Math .min (x, vector .x);
				y = Math .min (y, vector .y);
			}

			this .x = x;
			this .y = y;
			return this;
		},
		max: function (vector)
		{
			var
				x = this .x,
				y = this .y;

			for (var i = 0, length = arguments .length; i < length; ++ i)
			{
				const vector = arguments [i];

				x = Math .max (x, vector .x);
				y = Math .max (y, vector .y);
			}

			this .x = x;
			this .y = y;
			return this;
		},
		toString: function ()
		{
			return this .x + " " +
			       this .y;
		}
	};

	Object .defineProperty (Vector2 .prototype, "0",
	{
		get: function () { return this .x; },
		set: function (value) { this .x = value; },
		enumerable: false,
		configurable: false
	});

	Object .defineProperty (Vector2 .prototype, "1",
	{
		get: function () { return this .y; },
		set: function (value) { this .y = value; },
		enumerable: false,
		configurable: false
	});

	Object .assign (Vector2,
	{
		Zero: new Vector2 (0, 0),
		One: new Vector2 (1, 1),
		negate: function (vector)
		{
			return vector .copy () .negate ();
		},
		add: function (lhs, rhs)
		{
			return lhs .copy () .add (rhs);
		},
		subtract: function (lhs, rhs)
		{
			return lhs .copy () .subtract (rhs);
		},
		multiply: function (lhs, rhs)
		{
			return lhs .copy () .multiply (rhs);
		},
		multVec: function (lhs, rhs)
		{
			return lhs .copy () .multVec (rhs);
		},
		divide: function (lhs, rhs)
		{
			return lhs .copy () .divide (rhs);
		},
		divVec: function (lhs, rhs)
		{
			return lhs .copy () .divVec (rhs);
		},
		normalize: function (vector)
		{
			return vector .copy () .normalize ();
		},
		dot: function (lhs, rhs)
		{
			return lhs .copy () .dot (rhs);
		},
		lerp: function (source, destination, t)
		{
			return source .copy () .lerp (destination, t);
		},
		min: function (lhs, rhs)
		{
			return Vector2 .prototype .min .apply (lhs .copy (), arguments);
		},
		max: function (lhs, rhs)
		{
			return Vector2 .prototype .max .apply (lhs .copy (), arguments);
		},
	});

	return Vector2;
});
