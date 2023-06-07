/*******************************************************************************
 *
 * DO NOT ALTER OR REMOVE COPYRIGHT NOTICES OR THIS FILE HEADER.
 *
 * Copyright create3000, Scheffelstraße 31a, Leipzig, Germany 2011 - 2022.
 *
 * All rights reserved. Holger Seelig <holger.seelig@yahoo.de>.
 *
 * X3DJSONLD Copyright John Carlson, USA 2016-2017, https://coderextreme.net/X3DJSONLD
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
 * Copyright 2011 - 2022, Holger Seelig <holger.seelig@yahoo.de>.
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
 * along with X_ITE.  If not, see <https://www.gnu.org/licenses/gpl.html> for a
 * copy of the GPLv3 License.
 *
 * For Silvio, Joy and Adi.
 *
 ******************************************************************************/

import XMLParser from "./XMLParser.js";
import X3DParser from "./X3DParser.js";

function JSONParser (scene)
{
   X3DParser .call (this, scene);

   this .namespace = "http://www.web3d.org/specifications/x3d-namespace";
}

JSONParser .prototype = Object .assign (Object .create (X3DParser .prototype),
{
   constructor: JSONParser,
   getEncoding ()
   {
      return "JSON";
   },
   isValid ()
   {
      return this .input instanceof Object;
   },
   setInput (json)
   {
      try
      {
         if (typeof json === "string")
            json = JSON .parse (json);

         this .input = json;
      }
      catch (error)
      {
         this .input = undefined;
      }
   },
   parseIntoScene (resolve, reject)
   {
      /**
       * Load X3D JSON into an element.
       * json - the JavaScript object to convert to DOM.
       */

      const child = this .createElement ("X3D");

      this .convertToDOM (this .input, "", child);

      // Call the DOM parser.

      const parser = new XMLParser (this .getScene ());

      parser .setInput (child);
      parser .parseIntoScene (resolve, reject);

      this .getScene () .setEncoding ("JSON");
   },
   elementSetAttribute (element, key, value)
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
   convertChildren (parentkey, object, element)
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
   createElement (key, containerField)
   {
      /**
       * a method to create and element with tagnam key to DOM in a namespace.  If
       * containerField is set, then the containerField is set in the elemetn.
       */

      if (typeof this .namespace === "undefined")
      {
         var child = document .createElement (key);
      }
      else
      {
         var child = document .createElementNS (this .namespace, key);

         if (child === null || typeof child === "undefined")
         {
            console .error ("Trouble creating element for", key);

            child = document .createElement (key);
         }
      }

      if (typeof containerField !== "undefined")
         this .elementSetAttribute (child, "containerField", containerField);

      return child;
   },
   createCDATA (document, element, str)
   {
      const
         docu  = new DOMParser () .parseFromString ("<xml></xml>", "application/xml"),
         cdata = docu .createCDATASection (str);

      element .appendChild (cdata);
   },
   convertObject (key, object, element, containerField)
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
            this .createCDATA (document, element, object [key] .join ("\n"));
         }
         else
         {
            if (key === "connect" || key === "fieldValue" || key === "field" || key === "meta" || key === "component" || key === "unit")
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
   commentStringToXML (str)
   {
      /**
       * convert a comment string in JavaScript to XML.  Pass the string
       */

      return str .replace (/\\\\/g, "\\");
   },
   SFStringToXML (str)
   {
      /**
       * convert an SFString to XML.
       */

      return str .replace (/([\\"])/g, "\\$1");
   },
   JSONStringToXML (str)
   {
      /**
       * convert a JSON String to XML.
       */

      str = str .replace (/\\/g, "\\\\");
      str = str .replace (/\n/g, "\\n");

      return str;
   },
   convertToDOM(object, parentkey, element, containerField)
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

export default JSONParser;
