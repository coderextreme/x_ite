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
 * along with X_ITE.  If not, see <http://www.gnu.org/licenses/gpl.html> for a
 * copy of the GPLv3 License.
 *
 * For Silvio, Joy and Adi.
 *
 ******************************************************************************/

import X3DObject    from "../Base/X3DObject.js";
import X3DConstants from "../Base/X3DConstants.js";
import SFNodeCache  from "../Fields/SFNodeCache.js";
import Generator    from "../InputOutput/Generator.js";

const
   _executionContext = Symbol (),
   _sourceNode       = Symbol (),
   _sourceField      = Symbol (),
   _destinationNode  = Symbol (),
   _destinationField = Symbol ();

function X3DRoute (executionContext, sourceNode, sourceField, destinationNode, destinationField)
{
   X3DObject .call (this, executionContext);

   this [_executionContext] = executionContext;
   this [_sourceNode]       = sourceNode;
   this [_sourceField]      = sourceField;
   this [_destinationNode]  = destinationNode;
   this [_destinationField] = destinationField;

   // Must connect in every context, to make X3DBaseNode.hasRoutes work.

   sourceField .addFieldInterest (destinationField);

   sourceField      .addOutputRoute (this);
   destinationField .addInputRoute (this);
}

X3DRoute .prototype = Object .assign (Object .create (X3DObject .prototype),
{
   getTypeName: function ()
   {
      return "X3DRoute";
   },
   getExecutionContext: function ()
   {
      return this [_executionContext];
   },
   getSourceNode: function ()
   {
      ///  SAI
      return this [_sourceNode];
   },
   getSourceField: function ()
   {
      ///  SAI
      return this [_sourceField];
   },
   getDestinationNode: function ()
   {
      ///  SAI
      return this [_destinationNode];
   },
   getDestinationField: function ()
   {
      ///  SAI
      return this [_destinationField];
   },
   disconnect: function ()
   {
      this [_sourceField] .removeFieldInterest (this [_destinationField]);

      this [_sourceField]      .removeOutputRoute (this);
      this [_destinationField] .removeInputRoute (this);
   },
   toVRMLStream: function (stream)
   {
      const
         generator           = Generator .Get (stream),
         sourceNodeName      = generator .LocalName (this [_sourceNode]),
         destinationNodeName = generator .LocalName (this [_destinationNode]);

      stream .string += generator .Indent ();
      stream .string += "ROUTE";
      stream .string += " ";
      stream .string += sourceNodeName;
      stream .string += ".";
      stream .string += this [_sourceField] .getName ();

      if (this [_sourceField] .getAccessType () === X3DConstants .inputOutput)
         stream .string += "_changed";

      stream .string += " ";
      stream .string += "TO";
      stream .string += " ";
      stream .string += destinationNodeName;
      stream .string += ".";

      if (this [_destinationField] .getAccessType () === X3DConstants .inputOutput)
         stream .string += "set_";

      stream .string += this [_destinationField] .getName ();
   },
   toXMLStream: function (stream)
   {
      const
         generator           = Generator .Get (stream),
         sourceNodeName      = generator .LocalName (this [_sourceNode]),
         destinationNodeName = generator .LocalName (this [_destinationNode]);

      stream .string += generator .Indent ();
      stream .string += "<ROUTE";
      stream .string += " ";
      stream .string += "fromNode='";
      stream .string += generator .XMLEncode (sourceNodeName);
      stream .string += "'";
      stream .string += " ";
      stream .string += "fromField='";
      stream .string += generator .XMLEncode (this [_sourceField] .getName ());

      if (this [_sourceField] .getAccessType () === X3DConstants .inputOutput)
         stream .string += "_changed";

      stream .string += "'";
      stream .string += " ";
      stream .string += "toNode='";
      stream .string += generator .XMLEncode (destinationNodeName);
      stream .string += "'";
      stream .string += " ";
      stream .string += "toField='";

      if (this [_destinationField] .getAccessType () === X3DConstants .inputOutput)
         stream .string += "set_";

      stream .string += generator .XMLEncode (this [_destinationField] .getName ());
      stream .string += "'";
      stream .string += "/>";
   },
   dispose: function ()
   {
      this .disconnect ();

      this [_executionContext] .deleteRoute (this);

      X3DObject .prototype .dispose .call (this);
   }
});

for (const key of Reflect .ownKeys (X3DRoute .prototype))
   Object .defineProperty (X3DRoute .prototype, key, { enumerable: false });

Object .defineProperty (X3DRoute .prototype, "sourceNode",
{
   get: function ()
   {
      return SFNodeCache .get (this [_sourceNode]);
   },
   enumerable: true,
   configurable: false
});

Object .defineProperty (X3DRoute .prototype, "sourceField",
{
   get: function ()
   {
      return this [_sourceField] .getName ();
   },
   enumerable: true,
   configurable: false
});

Object .defineProperty (X3DRoute .prototype, "destinationNode",
{
   get: function ()
   {
      return SFNodeCache .get (this [_destinationNode]);
   },
   enumerable: true,
   configurable: false
});

Object .defineProperty (X3DRoute .prototype, "destinationField",
{
   get: function ()
   {
      return this [_destinationField] .getName ();
   },
   enumerable: true,
   configurable: false
});

export default X3DRoute;
