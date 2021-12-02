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


define (function ()
{
"use strict";

	/*
	 *  Path
	 */

	function Path (path, separator)
	{
		switch (arguments .length)
		{
			case 2:
			{
				const value = this .value = path ? path .split (separator) : [];

				value .separator         = separator;
				value .leadingSeparator  = false;
				value .trailingSeparator = false;

				if (value .length)
				{
					if (value [0] .length === 0)
					{
						value .shift ();
						value .leadingSeparator = true;
					}
				}

				if (value .length)
				{
					if (value [value .length - 1] .length === 0)
					{
						value .pop ();
						value .trailingSeparator = true;
					}
				}

				break;
			}
			case 4:
			{
				const value = this .value = arguments [0];

				value .separator         = arguments [1];
				value .leadingSeparator  = arguments [2];
				value .trailingSeparator = arguments [3];
				break;
			}
		}
	}

	Path .prototype =
	{
		copy: function ()
		{
			const value = this .value;

			return new Path (value .slice (0, value .length),
			                 value .separator,
			                 value .leadingSeparator,
			                 value .trailingSeparator);
		},
		get length ()
		{
			return this .value .length;
		},
		get leadingSeparator ()
		{
			return this .value .leadingSeparator;
		},
		get trailingSeparator ()
		{
			return this .value .trailingSeparator;
		},
		get root ()
		{
			return new Path ([ ],
			                this .value .separator,
			                true,
			                true);
		},
		get base ()
		{
			if (this .value .trailingSeparator)
				return this .copy ();

			return this .parent;
		},
		get parent ()
		{
			const value = this .value;

			switch (value .length)
			{
				case 0:
				case 1:
				{
					if (value .leadingSeparator)
						return this .root;

					return new Path ([ ".." ], value .separator, false, false);
				}
				default:
				{
					return new Path (value .slice (0, value .length - 1),
				                     value .separator,
				                     value .leadingSeparator,
				                     true);
				}
			}

		},
		get basename ()
		{
			const
				value  = this .value,
				length = value .length;

			if (length)
				return value [length - 1];

			return "";
		},
		get stem ()
		{
			const basename = this .basename;

			if (this .trailingSeparator && basename .length)
			{
				const extension = this .extension;

				if (extension .length)
					return basename .substr (0, basename .length - extension .length);
			}

			return basename;
		},
		get extension ()
		{
			const
				basename = this .basename,
				dot      = basename .lastIndexOf (".");

			if (dot > 0)
				return basename .substr (dot);

			return "";
		},
		getRelativePath: function (descendant)
		{
			if (! descendant .leadingSeparator)
				return descendant;

			const
				path           = new Path ([ ], "/", false, descendant .value .trailingSeparator),
				basePath       = this .removeDotSegments () .base,
				descendantPath = descendant .removeDotSegments ();

			var i, j, l;

			for (i = 0, l = Math .min (basePath .value .length, descendantPath .value .length); i < l ; ++ i)
			{
				if (basePath .value [i] !== descendantPath .value [i])
					break;
			}

			for (j = i, l = basePath .value .length; j < l; ++ j)
				path .value .push ("..");

			for (j = i, l = descendantPath .value .length; j < l; ++ j)
				path .value .push (descendantPath .value [j]);

			if (path .value .length === 0)
				path .value .push (".");

			return path;
		},
		removeDotSegments: function ()
		{
			const
				value = this .value,
				path  = new Path ([ ], value .separator, value .leadingSeparator, value .trailingSeparator);

			if (value .length)
			{
				for (var i = 0; i < value .length; ++ i)
				{
					const segment = value [i];

					switch (segment)
					{
						case "":
						{
							break;
						}
						case ".":
						{
							path .value .trailingSeparator = true;
							break;
						}
						case "..":
						{
							path .value .trailingSeparator = true;

							if (path .value .length)
								path .value .pop ();

							break;
						}
						default:
						{
							path .value .trailingSeparator = false;
							path .value .push (segment);
						}
					}
				}

				path .value .trailingSeparator = path .value .trailingSeparator || value .trailingSeparator;
			}

			return path;
		},
		escape: function ()
		{
			const
				copy  = this .copy (),
				value = copy .value;

			for (var i = 0, length = value .length; i < length; ++ i)
				value [i] = encodeURI (value [i]);

			return copy;
		},
		unescape: function ()
		{
			const
				copy  = this .copy (),
				value = copy .value;

			for (var i = 0, length = value .length; i < length; ++ i)
				value [i] = unescape (value [i]);

			return copy;
		},
		toString: function ()
		{
			const value = this .value;

			var string = "";

			if (value .leadingSeparator)
				string += value .separator;

			string += value .join (value .separator);

			if (value .leadingSeparator && value .length === 0)
				return string;

			if (value .trailingSeparator)
				string += value .separator;

			return string;
		},
	};

	/*
	 *  URI
	 *  https://tools.ietf.org/html/rfc3986
	 */

	const wellKnownPorts =
	{
		ftp:   21,
		http:  80,
		https: 443,
		ftps:  990,
	};

	const
		address   = /^(?:([^:\/?#]*?):)?(?:(\/\/)([^\/?#]*))?([^?#]*)(?:\?([^#]*))?(?:#(.*))?$/,
		authority = /^(.*?)(?:\:([^:]*))?$/;

	function parse (uri, string)
	{
		var result = address .exec (string);

		if (result)
		{
			uri .scheme    = result [1] || "";
			uri .slashs    = result [2] || "";
			uri .path      = new Path (unescape (result [4] || ""), "/");
			uri .query     = result [5] || "";
			uri .fragment  = unescape (result [6] || "");

			var result = authority .exec (result [3] || "");

			if (result)
			{
				uri .host = unescape (result [1] || "");
				uri .port = result [2] ? parseInt (result [2]) : 0;
			}

			uri .absolute = !! uri .slashs .length || uri .path [0] === "/";
			uri .local    = /^(?:file|data)$/ .test (uri .scheme) || (! uri .scheme && ! (uri .host || uri .port));
		}
		else
			uri .path = new Path ("", "/");

		uri .string = string;
	}

	function removeDotSegments (path)
	{
		return new Path (path, "/") .removeDotSegments ();
	}

	function URI (uri)
	{
		const value = this .value =
		{
			local:     true,
			absolute:  true,
			scheme:    "",
			slashs:    "",
			host:      "",
			port:      0,
			path:      null,
			query:     "",
			fragment:  "",
			string:    "",
		};

		switch (arguments .length)
		{
			case 0:
				value .path = new Path ("", "/");
				break;
			case 1:
			{
				parse (value, uri);
				break;
			}
			case 9:
			{
				value .local     = arguments [0];
				value .absolute  = arguments [1];
				value .scheme    = arguments [2];
				value .slashs    = arguments [3];
				value .host      = arguments [4];
				value .port      = arguments [5];
				value .path      = arguments [6];
				value .query     = arguments [7];
				value .fragment  = arguments [8];
				value .string    = this .createString ();
				break;
			}
		}
	};

	URI .prototype =
	{
		copy: function ()
		{
			const value = this .value;

			return new URI (value .local,
			                value .absolute,
			                value .scheme,
			                value .slashs,
			                value .host,
			                value .port,
			                value .path .copy (),
			                value .query,
			                value .fragment);
		},
		get length ()
		{
			return this .value .string .length;
		},
		isRelative: function ()
		{
			return ! this .value .absolute;
		},
		isAbsolute: function ()
		{
			return ! this .value .absolute;
		},
		isLocal: function ()
		{
			return this .value .local;
		},
		isNetwork: function ()
		{
			return ! this .value .local;
		},
		isDirectory: function ()
		{
			const value = this .value;

			if (value .path .length)
				return value .path .trailingSeparator;

			return this .isNetwork ();
		},
		isFile: function ()
		{
			return ! this .isDirectory ();
		},
		get hierarchy ()
		{
			const value = this .value;

			var hierarchy = "";

			hierarchy += value .slashs;
			hierarchy += this .authority;
			hierarchy += this .path;

			return hierarchy;
		},
		get authority ()
		{
			const value = this .value;

			var authority = value .host;

			if (value .port)
			{
				authority += ":";
				authority += value .port;
			}

			return authority;
		},
		get scheme ()
		{
			return this .value .scheme;
		},
		get host ()
		{
			return this .value .host;
		},
		get port ()
		{
			return this .value .port;
		},
		get wellKnownPort ()
		{
			const wellKnownPort = wellKnownPorts [this .value .scheme];

			if (wellKnownPort !== undefined)
				return wellKnownPort;

			return 0;
		},
		get path ()
		{
			return this .value .path .toString ();
		},
		set query (value)
		{
			this .value .query = value;
		},
		get query ()
		{
			return this .value .query;
		},
		set fragment (value)
		{
			this .value .fragment = value;
		},
		get fragment ()
		{
			return this .value .fragment;
		},
		get location ()
		{
			return this .toString ();
		},
		get root ()
		{
			const value = this .value;

			return new URI (value .local,
			                value .absolute,
			                value .scheme,
			                value .slashs,
			                value .host,
			                value .port,
			                new Path ("/", "/"),
			                "",
			                "");
		},
		get base ()
		{
			const value = this .value;

			if (this .isDirectory ())
			{
				return new URI (value .local,
				                value .absolute,
				                value .scheme,
				                value .slashs,
				                value .host,
				                value .port,
				                value .path .copy (),
				                "",
				                "");
			}

			return this .parent;
		},
		get parent ()
		{
			const value = this .value;

			return new URI (value .local,
			                value .absolute,
			                value .scheme,
			                value .slashs,
			                value .host,
			                value .port,
			                value .path .parent,
			                "",
			                "");
		},
		get filename ()
		{
			const value = this .value;

			return new URI (value .local,
			                value .absolute,
			                value .scheme,
			                value .slashs,
			                value .host,
			                value .port,
			                value .path .copy (),
			                "",
			                "");
		},
		get basename ()
		{
			return this .value .path .basename;
		},
		get stem ()
		{
			return this .value .path .stem;
		},
		get extension ()
		{
			return this .value .path .extension;
		},
		transform: function (reference)
		{
			if (! (reference instanceof URI))
				reference = new URI (reference .toString ());

			if (reference .scheme == "data")
				return new URI (reference .toString ());

			const value = this .value;

			var
				T_local     = false,
				T_absolute  = false,
				T_scheme    = "",
				T_slashs    = "",
				T_host      = "",
				T_port      = 0,
				T_path      = "",
				T_query     = "",
				T_fragment  = "";

			if (reference .scheme)
			{
				T_local    = reference .isLocal ();
				T_absolute = reference .isAbsolute ();
				T_scheme   = reference .scheme;
				T_slashs   = reference .value .slashs;
				T_host     = reference .host;
				T_port     = reference .port;
				T_path     = reference .path;
				T_query    = reference .query;
			}
			else
			{
				if (reference .authority)
				{
					T_local    = reference .isLocal ();
					T_absolute = reference .isAbsolute ();
					T_host     = reference .host;
					T_port     = reference .port;
					T_path     = reference .path;
					T_query    = reference .query;
				}
				else
				{
					if (reference .path .length === 0)
					{
						T_path = this .path;

						if (reference .query)
							T_query = reference .query;
						else
							T_query = value .query;
					}
					else
					{
						if (reference .path [0] === "/")
						{
							T_path = reference .path;
						}
						else
						{
							// merge (Base .path (), reference .path ());

							const base = this .base;

							if (base .path)
								T_path += base .path;
							else
								T_path = "/";

							T_path += reference .path;
						}

						T_query = reference .query;
					}

					T_local    = this .isLocal ();
					T_absolute = this .isAbsolute () || reference .isAbsolute ();
					T_host     = value .host;
					T_port     = value .port;
				}

				T_scheme = value .scheme;
				T_slashs = value .slashs;
			}

			T_fragment = reference .fragment;

			return new URI (T_local,
			                T_absolute,
			                T_scheme,
			                T_slashs,
			                T_host,
			                T_port,
			                removeDotSegments (T_path),
			                T_query,
			                T_fragment);
		},
		removeDotSegments: function ()
		{
			const value = this .value;

			return new URI (value .local,
			                value .absolute,
			                value .scheme,
			                value .slashs,
			                value .host,
			                value .port,
			                value .path .removeDotSegments (),
			                value .query,
			                value .fragment);
		},
		getRelativePath: function (descendant)
		{
			if (! (descendant instanceof URI))
				descendant = new URI (descendant .toString ());

			const value = this .value;

			if (value .scheme !== descendant .scheme)
				return descendant;

			if (this .authority !== descendant .authority)
				return descendant;

			return new URI (true,
			                false,
			                "",
			                "",
			                "",
			                0,
			                value .path .getRelativePath (descendant .value .path),
			                descendant .query,
			                descendant .fragment);
		},
		escape: function ()
		{
			const value = this .value;

			if (value .scheme === "data")
				return new URI (value .string);

			return new URI (value .local,
			                value .absolute,
			                value .scheme,
			                value .slashs,
			                value .host,
			                value .port,
			                value .path .escape (),
			                value .query,
			                escape (value .fragment));
		},
		unescape: function ()
		{
			const value = this .value;

			if (value .scheme === "data")
				return new URI (value .string);

			return new URI (value .local,
			                value .absolute,
			                value .scheme,
			                value .slashs,
			                value .host,
			                value .port,
			                value .path .unescape (),
			                value .query,
			                unescape (value .fragment));
		},
		toString: function ()
		{
			return this .value .string;
		},
		createString: function ()
		{
			const value = this .value;

			var string = this .value .scheme;

			if (value .scheme)
				string += ":";

			string += this .hierarchy;

			if (value .query)
				string += "?" + value .query;

			if (value .fragment)
				string += "#" + value .fragment;

			return string;
		},
	};

	return URI;
});
