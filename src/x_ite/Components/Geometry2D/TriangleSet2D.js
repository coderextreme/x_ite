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

import Fields               from "../../Fields.js";
import X3DFieldDefinition   from "../../Base/X3DFieldDefinition.js";
import FieldDefinitionArray from "../../Base/FieldDefinitionArray.js";
import X3DGeometryNode      from "../Rendering/X3DGeometryNode.js";
import X3DConstants         from "../../Base/X3DConstants.js";

function TriangleSet2D (executionContext)
{
   X3DGeometryNode .call (this, executionContext);

   this .addType (X3DConstants .TriangleSet2D);

   this .setGeometryType (2);

   this ._vertices .setUnit ("length");
}

TriangleSet2D .prototype = Object .assign (Object .create (X3DGeometryNode .prototype),
{
   constructor: TriangleSet2D,
   [Symbol .for ("X_ITE.X3DBaseNode.fieldDefinitions")]: new FieldDefinitionArray ([
      new X3DFieldDefinition (X3DConstants .inputOutput,    "metadata", new Fields .SFNode ()),
      new X3DFieldDefinition (X3DConstants .inputOutput,    "vertices", new Fields .MFVec2f ()),
      new X3DFieldDefinition (X3DConstants .initializeOnly, "solid",    new Fields .SFBool ()),
   ]),
   getTypeName: function ()
   {
      return "TriangleSet2D";
   },
   getComponentName: function ()
   {
      return "Geometry2D";
   },
   getContainerField: function ()
   {
      return "geometry";
   },
   getSpecificationRange: function ()
   {
      return ["3.0", "Infinity"];
   },
   build: function ()
   {
      const
         vertices    = this ._vertices .getValue (),
         normalArray = this .getNormals (),
         vertexArray = this .getVertices ();

      for (let i = 0, length = this ._vertices .length * 2; i < length; i += 2)
      {
         normalArray .push (0, 0, 1);
         vertexArray .push (vertices [i], vertices [i + 1], 0, 1);
      }

      this .setSolid (this ._solid .getValue ());
   },
   buildTexCoords: function ()
   {
      const texCoordArray = this .getTexCoords ();

      if (texCoordArray .length === 0)
      {
         const
            p             = this .getTexCoordParams (),
            min           = p .min,
            Ssize         = p .Ssize,
            vertexArray   = this .getVertices () .getValue ();

         for (let i = 0, length = vertexArray .length; i < length; i += 4)
         {
            texCoordArray .push ((vertexArray [i]     - min [0]) / Ssize,
                                 (vertexArray [i + 1] - min [1]) / Ssize,
                                 0,
                                 1);
         }

         texCoordArray .shrinkToFit ();
      }

      this .getMultiTexCoords () .push (texCoordArray);
   },
});

Object .defineProperties (TriangleSet2D,
{
   typeName:
   {
      value: "TriangleSet2D",
   },
   componentName:
   {
      value: "Geometry2D",
   },
   containerField:
   {
      value: "geometry",
   },
   specificationRange:
   {
      value: Object .freeze (["3.0", "Infinity"]),
   },
   fieldDefinitions:
   {
      value: new FieldDefinitionArray ([
         new X3DFieldDefinition (X3DConstants .inputOutput,    "metadata", new Fields .SFNode ()),
         new X3DFieldDefinition (X3DConstants .inputOutput,    "vertices", new Fields .MFVec2f ()),
         new X3DFieldDefinition (X3DConstants .initializeOnly, "solid",    new Fields .SFBool ()),
      ]),
   },
});

export default TriangleSet2D;
