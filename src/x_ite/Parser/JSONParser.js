﻿/* -*- Mode: JavaScript; coding: utf-8; tab-width: 3; indent-tabs-mode: tab; c-basic-offset: 3 -*-
 *******************************************************************************
 *
 * DO NOT ALTER OR REMOVE COPYRIGHT NOTICES OR THIS FILE HEADER.
 *
 * Copyright create3000, Scheffelstraße 31a, Leipzig, Germany 2011.
 * X3DJSONLD Copyright John Carlson, USA 2016-2017
 * https://coderextreme.net/X3DJSONLD/
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
 * This file is part of the Cobweb Project.
 *
 * Cobweb is free software: you can redistribute it and/or modify it under the
 * terms of the GNU General Public License version 3 only, as published by the
 * Free Software Foundation.
 *
 * Cobweb is distributed in the hope that it will be useful, but WITHOUT ANY
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR
 * A PARTICULAR PURPOSE. See the GNU General Public License version 3 for more
 * details (a copy is included in the LICENSE file that accompanied this code).
 *
 * You should have received a copy of the GNU General Public License version 3
 * along with Cobweb.  If not, see <http://www.gnu.org/licenses/gpl.html> for a
 * copy of the GPLv3 License.
 *
 * For Silvio, Joy and Adi.
 *
 ******************************************************************************/


define ([
   "x_ite/Parser/XMLParser",
   "x_ite/Parser/X3DParser",
],
function (XMLParser,
          X3DParser)
{
"use strict";

   function JSONParser (scene)
   {
      X3DParser .call (this, scene);

      this .x3djsonNS = "http://www.web3d.org/specifications/x3d-namespace";
   }

   JSONParser .prototype = Object .assign (Object .create (X3DParser .prototype),
   {
      constructor: JSONParser,
      isValid: function ()
      {
         return this .jsobj instanceof Object;
      },
      parseIntoScene: function (jsobj, success, error)
      {
         if (typeof jsobj === "string")
            jsobj = JSON .parse (jsobj)

         this .jsobj = jsobj;

         /**
          * Load X3D JSON into an element.
          * jsobj - the JavaScript object to convert to DOM.
          */

         const child = this .createElement ("X3D");

         this .convertToDOM (jsobj, "", child);

         // call the DOM parser
         new XMLParser (this .scene) .parseIntoScene (child, success, error);

         return child;
      },
      elementSetAttribute: function (element, key, value)
      {
         /**
          * Yet another way to set an attribute on an element.  does not allow you to
          * set JSON schema or encoding.
          */

         switch (key)
         {
            case "SON schema":
            {
               // JSON Schema
               break;
            }
            case "ncoding":
            {
               // encoding, UTF-8, UTF-16 or UTF-32
               break;
            }
            default:
            {
               if (typeof element .setAttribute === "function")
                  element .setAttribute (key, value);

               break;
            }
         }
      },
      convertChildren: function (parentkey, object, element)
      {
         /**
          * converts children of object to DOM.
          */

         for (const key in object)
         {
            if (typeof object [key] === "object")
            {
               if (isNaN (parseInt (key)))
                  this .convertObject (key, object, element, parentkey .substr (1));

               else
                  this .convertToDOM (object[ key], key, element, parentkey .substr (1));
            }
         }
      },
      createElement: function (key, containerField)
      {
         /**
          * a method to create and element with tagnam key to DOM in a namespace.  If
          * containerField is set, then the containerField is set in the elemetn.
          */

         if (typeof this .x3djsonNS === "undefined")
         {
            var child = document .createElement (key);
         }
         else
         {
            var child = document .createElementNS (this .x3djsonNS, key);

            if (child === null || typeof child === "undefined")
            {
               console .error ("Trouble creating element for", key);

               child = document .createElement(key);
            }
         }

         if (typeof containerField !== "undefined")
            this .elementSetAttribute (child, "containerField", containerField);

         return child;
      },
      createCDATA: function (document, element, str)
      {
         /**
          * a way to create a CDATA function or script in HTML, by using a DOM parser.
          */

         let y = str .trim ()
            .replace (/\\"/g, "\\\"")
            .replace (/&lt;/g, "<")
            .replace (/&gt;/g, ">")
            .replace (/&amp;/g, "&");

         do
         {
            str = y;
            y   = str .replace (/'([^'\r\n]*)\n([^']*)'/g, "'$1\\n$2'");

            if (str !== y)
               console .log ("CDATA Replacing", str, "with", y);
         }
         while (y !== str);

         const
            domParser = new DOMParser(),
            cdataStr  = "<script> <![CDATA[ " + y + " ]]> </script>", // has to be wrapped into an element
            scriptDoc = domParser .parseFromString (cdataStr, "application/xml"),
            cdata     = scriptDoc .children [0] .childNodes [1]; // space after script is childNode[0]

         element .appendChild (cdata);
      },
      convertObject: function (key, object, element, containerField)
      {
         /**
          * convert the object at object[key] to DOM.
          */

         if (object !== null && typeof object [key] === "object")
         {
            if (key .substr (0, 1) === "@")
            {
               this .convertToDOM (object [key], key, element);
            }
            else if (key .substr (0, 1) === "-")
            {
               this .convertChildren (key, object [key], element);
            }
            else if (key === "#comment")
            {
               for (const c in object [key])
               {
                  const child = document .createComment (this .commentStringToXML (object [key] [c]));

                  element .appendChild (child);
               }
            }
            else if (key === "#sourceCode" || key === "@sourceCode" || key === "#sourceText")
            {
               this .createCDATA (document, element, object [key] .join ("\r\n") + "\r\n");
            }
            else
            {
               if (key === "connect" || key === "fieldValue" || key === "field" || key === "meta" || key === "component")
               {
                  for (const childkey in object [key])
                  {
                     // for each field
                     if (typeof object [key] [childkey] === "object")
                     {
                        const child = this .createElement (key, containerField);

                        this .convertToDOM (object [key] [childkey], childkey, child);

                        element .appendChild (child);
                        element .appendChild (document .createTextNode ("\n"));
                     }
                  }
               }
               else
               {
                  const child = this .createElement (key, containerField);

                  this .convertToDOM (object [key], key, child);

                  element .appendChild (child);
                  element .appendChild (document .createTextNode ("\n"));
               }
            }
         }
      },
      commentStringToXML: function (str)
      {
         /**
          * convert a comment string in JavaScript to XML.  Pass the string
          */

         let y = str;

         str = str .replace (/\\\\/g, "\\");

         if (y !== str)
            console .log ("X3DJSONLD <!-> replacing", y, "with", str);

         return str;
      },
      SFStringToXML: function (str)
      {
         /**
          * convert an SFString to XML.
          */

         const y = str;

         /*
         str = (""+str).replace(/\\\\/g, "\\\\");
         str = str.replace(/\\\\\\\\/g, "\\\\");
         str = str.replace(/(\\+)"/g, "\\"");
         */

         str = str .replace (/\\/g, "\\\\");
         str = str .replace (/"/g, "\\\"");

         if (y !== str)
            console .log ("X3DJSONLD [] replacing", y, "with", str);

         return str;
      },
      JSONStringToXML: function (str)
      {
         /**
          * convert a JSON String to XML.
          */

         const y = str;

         str = str .replace (/\\/g, "\\\\");
         str = str .replace (/\n/g, "\\n");

         if (y !== str)
            console .log ("X3DJSONLD replacing", y, "with", str);

         return str;
      },
      convertToDOM: function(object, parentkey, element, containerField)
      {
         /**
          * main routine for converting a JavaScript object to DOM.
          * object is the object to convert.
          * parentkey is the key of the object in the parent.
          * element is the parent element.
          * containerField is a possible containerField.
          */

         let
            isArray        = false,
            localArray     = [ ],
            arrayOfStrings = false;

         for (const key in object)
         {
            isArray = !isNaN (parseInt (key));

            if (isArray)
            {
               switch (typeof object [key])
               {
                  case "number":
                  {
                     localArray .push (object [key]);
                     break;
                  }
                  case "string":
                  {
                     localArray .push (object [key]);

                     arrayOfStrings = true;
                     break;
                  }
                  case "boolean":
                  {
                     localArray .push (object [key]);
                     break;
                  }
                  case "object":
                  {
                     /*
                     if (object[key] != null && typeof object[key].join === "function") {
                        localArray.push(object[key].join(" "));
                     }
                     */
                     this .convertToDOM (object [key], key, element);
                     break;
                  }
                  case "undefined":
                  {
                     break;
                  }
                  default:
                  {
                     console .error ("Unknown type found in array " + typeof object [key]);
                  }
               }
            }
            else
            {
               switch (typeof object [key])
               {
                  case "object":
                  {
                     // This is where the whole thing starts

                     if (key === "X3D")
                        this .convertToDOM (object [key], key, element);

                     else
                        this .convertObject (key, object, element, containerField);

                     break;
                  }
                  case "number":
                  {
                     this .elementSetAttribute (element, key .substr (1), object [key]);
                     break;
                  }
                  case "string":
                  {
                     if (key !== "#comment")
                     {
                        // ordinary string attributes
                        this .elementSetAttribute (element, key .substr (1), this .JSONStringToXML (object [key]));
                     }
                     else
                     {
                        const child = document .createComment (this .commentStringToXML (object [key]));

                        element .appendChild (child);
                     }

                     break;
                  }
                  case "boolean":
                  {
                     this .elementSetAttribute (element, key .substr (1), object [key]);
                     break;
                  }
                  case "undefined":
                  {
                     break;
                  }
                  default:
                  {
                     console .error ("Unknown type found in object " + typeof object [key]);
                     console .error (object);
                  }
               }
            }
         }

         if (isArray)
         {
            if (parentkey .substr (0,1) === "@")
            {
               if (arrayOfStrings)
               {
                  arrayOfStrings = false;

                  for (const str in localArray)
                     localArray [str] = this .SFStringToXML (localArray [str]);

                  this .elementSetAttribute (element, parentkey .substr (1), '"' + localArray .join ('" "') + '"');
               }
               else
               {
                  // if non string array
                  this .elementSetAttribute (element, parentkey .substr (1), localArray .join (" "));
               }
            }

            isArray = false;
         }

         return element;
      },
   });

   return JSONParser;
});
