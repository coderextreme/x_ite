/*******************************************************************************
 *
 * DO NOT ALTER OR REMOVE COPYRIGHT NOTICES OR THIS FILE HEADER.
 *
 * Copyright create3000, Scheffelstraße 31a, Leipzig, Germany 2011 - 2022.
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

import Fields                      from "../../Fields.js";
import X3DFieldDefinition          from "../../Base/X3DFieldDefinition.js";
import FieldDefinitionArray        from "../../Base/FieldDefinitionArray.js";
import X3DNode                     from "../Core/X3DNode.js";
import X3DUrlObject                from "../Networking/X3DUrlObject.js";
import X3DProgrammableShaderObject from "./X3DProgrammableShaderObject.js";
import X3DConstants                from "../../Base/X3DConstants.js";

function ShaderProgram (executionContext)
{
   X3DNode                     .call (this, executionContext);
   X3DUrlObject                .call (this, executionContext);
   X3DProgrammableShaderObject .call (this, executionContext);

   this .addType (X3DConstants .ShaderProgram);
}

ShaderProgram .prototype = Object .assign (Object .create (X3DNode .prototype),
   X3DUrlObject .prototype,
   X3DProgrammableShaderObject .prototype,
{
   constructor: ShaderProgram,
   [Symbol .for ("X_ITE.X3DBaseNode.fieldDefinitions")]: new FieldDefinitionArray ([
      new X3DFieldDefinition (X3DConstants .inputOutput,    "metadata",             new Fields .SFNode ()),
      new X3DFieldDefinition (X3DConstants .inputOutput,    "description",          new Fields .SFString ()),
      new X3DFieldDefinition (X3DConstants .initializeOnly, "type",                 new Fields .SFString ("VERTEX")),
      new X3DFieldDefinition (X3DConstants .inputOutput,    "load",                 new Fields .SFBool (true)),
      new X3DFieldDefinition (X3DConstants .inputOutput,    "url",                  new Fields .MFString ()),
      new X3DFieldDefinition (X3DConstants .inputOutput,    "autoRefresh",          new Fields .SFTime ()),
      new X3DFieldDefinition (X3DConstants .inputOutput,    "autoRefreshTimeLimit", new Fields .SFTime (3600)),
   ]),
   getTypeName: function ()
   {
      return "ShaderProgram";
   },
   getComponentName: function ()
   {
      return "Shaders";
   },
   getContainerField: function ()
   {
      return "programs";
   },
   getSpecificationRange: function ()
   {
      return ["3.0", "Infinity"];
   },
   getSourceText: function ()
   {
      return this ._url;
   },
   requestImmediateLoad: function (cache = true)
   { },
   initialize: function ()
   {
      X3DNode                     .prototype .initialize .call (this);
      X3DUrlObject                .prototype .initialize .call (this);
      X3DProgrammableShaderObject .prototype .initialize .call (this);
   },
   dispose: function ()
   {
      X3DProgrammableShaderObject .prototype .dispose .call (this);
      X3DUrlObject                .prototype .dispose .call (this);
      X3DNode                     .prototype .dispose .call (this);
   },
});

Object .defineProperties (ShaderProgram,
{
   typeName:
   {
      value: "ShaderProgram",
   },
   componentName:
   {
      value: "Shaders",
   },
   containerField:
   {
      value: "programs",
   },
   specificationRange:
   {
      value: Object .freeze (["3.0", "Infinity"]),
   },
   fieldDefinitions:
   {
      value: new FieldDefinitionArray ([
         new X3DFieldDefinition (X3DConstants .inputOutput,    "metadata",             new Fields .SFNode ()),
         new X3DFieldDefinition (X3DConstants .inputOutput,    "description",          new Fields .SFString ()),
         new X3DFieldDefinition (X3DConstants .initializeOnly, "type",                 new Fields .SFString ("VERTEX")),
         new X3DFieldDefinition (X3DConstants .inputOutput,    "load",                 new Fields .SFBool (true)),
         new X3DFieldDefinition (X3DConstants .inputOutput,    "url",                  new Fields .MFString ()),
         new X3DFieldDefinition (X3DConstants .inputOutput,    "autoRefresh",          new Fields .SFTime ()),
         new X3DFieldDefinition (X3DConstants .inputOutput,    "autoRefreshTimeLimit", new Fields .SFTime (3600)),
      ]),
   },
});

export default ShaderProgram;
