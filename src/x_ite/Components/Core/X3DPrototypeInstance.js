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
   "x_ite/Base/X3DChildObject",
   "x_ite/Base/FieldDefinitionArray",
   "x_ite/Components/Core/X3DNode",
   "x_ite/Execution/X3DExecutionContext",
   "x_ite/Base/X3DConstants",
   "x_ite/InputOutput/Generator",
],
function (X3DChildObject,
          FieldDefinitionArray,
          X3DNode,
          X3DExecutionContext,
          X3DConstants,
          Generator)
{
"use strict";

   const
      _protoNode        = Symbol (),
      _protoFields      = Symbol (),
      _fieldDefinitions = Symbol .for ("X3DBaseNode.fieldDefinitions"),
      _body             = Symbol ();

   function X3DPrototypeInstance (executionContext, protoNode)
   {
      this [_protoNode]        = protoNode;
      this [_protoFields]      = new Map (protoNode .getFields () .map (f => [f, f .getName ()]))
      this [_fieldDefinitions] = new FieldDefinitionArray (protoNode .getFieldDefinitions ());
      this [_body]             = null;

      X3DNode .call (this, executionContext);

      this .addType (X3DConstants .X3DPrototypeInstance);
   }

   X3DPrototypeInstance .prototype = Object .assign (Object .create (X3DNode .prototype),
   {
      constructor: X3DPrototypeInstance,
      create: function (executionContext)
      {
         return new X3DPrototypeInstance (executionContext, this [_protoNode]);
      },
      getTypeName: function ()
      {
         return this [_protoNode] .getName ();
      },
      getComponentName: function ()
      {
         return "Core";
      },
      getContainerField: function ()
      {
         return "children";
      },
      initialize: function ()
      {
         X3DNode .prototype .initialize .call (this);

         this .setProtoNode (this [_protoNode]);
      },
      construct: function ()
      {
         if (this [_body])
            this [_body] .dispose ();

         const proto = this [_protoNode] .getProtoDeclaration ();

         if (!proto)
         {
            this [_body] = new X3DExecutionContext (this .getExecutionContext ());
            this [_body] .setOuterNode (this);
            this [_body] .setup ();

            if (this .isInitialized ())
               X3DChildObject .prototype .addEvent .call (this);

            return;
         }

         // If there is a proto the externproto is completely loaded.

         if (this [_protoNode] .isExternProto)
         {
            for (const fieldDefinition of proto .getFieldDefinitions ())
            {
               try
               {
                  const
                     field      = this .getField (fieldDefinition .name),
                     protoField = proto .getField (fieldDefinition .name);

                  // Continue if something is wrong.
                  if (field .getAccessType () !== protoField .getAccessType ())
                     continue;

                  // Continue if something is wrong.
                  if (field .getType () !== protoField .getType ())
                     continue;

                  // Continue if field is eventIn or eventOut.
                  if (!field .isInitializable ())
                     continue;

                  // Is set during parse.
                  if (field .getModificationTime ())
                     continue;

                  // Has IS references.
                  if (field .hasReferences ())
                     continue;

                  if (field .equals (protoField))
                     continue;

                  // If default value of protoField is different from field, thus update default value for field.
                  field .assign (protoField);
               }
               catch (error)
               {
                  // Definition exists in proto but does not exist in extern proto.
                  this .addField (fieldDefinition);
               }
            }
         }

         // Create execution context.

         this [_body] = new X3DExecutionContext (proto .getExecutionContext ());
         this [_body] .setOuterNode (this);

         // Copy proto.

         this .importExternProtos (proto .getBody () .externprotos);
         this .importProtos       (proto .getBody () .protos);
         this .copyRootNodes      (proto .getBody () .rootNodes);
         this .copyImportedNodes  (proto .getBody (), proto .getBody () .getImportedNodes ());
         this .copyRoutes         (proto .getBody (), proto .getBody () .routes);

         this [_body] .setup ();

         if (this .isInitialized ())
            X3DChildObject .prototype .addEvent .call (this);

         this [_protoNode] ._updateInstances .removeInterest ("construct", this);
         this [_protoNode] ._updateInstances .addInterest ("update", this);
      },
      update: function ()
      {
         // Remove old fields.

         const
            oldProtoFields = this [_protoFields],
            oldFields      = new Map (this .getFields () .map (f => [f .getName (), f]));

         for (const field of oldFields .values ())
            this .removeField (field .getName ());

         // Add new fields.

         this [_protoFields]      = new Map (this [_protoNode] .getFields () .map (f => [f, f .getName ()]));
         this [_fieldDefinitions] = new FieldDefinitionArray (this [_protoNode] .getFieldDefinitions ());

         for (const fieldDefinition of this .getFieldDefinitions ())
            this .addField (fieldDefinition);

         // Reuse old fields, and therefor routes.

         for (const protoField of this [_protoFields] .keys ())
         {
            const oldFieldName = oldProtoFields .get (protoField);

            if (!oldFieldName)
               continue;

            const
               newField = this .getFields () .get (protoField .getName ()),
               oldField = oldFields .get (oldFieldName);

            oldField .addParent (this)
            oldField .setAccessType (newField .getAccessType ());
            oldField .setName (newField .getName ());

            this .getPredefinedFields () .update (oldFieldName, newField .getName (), oldField);
            this .getFields ()           .update (oldFieldName, newField .getName (), oldField);

            if (!this .getPrivate ())
               oldField .addCloneCount (1);
         }

         // Construct now.

         this .construct ();
      },
      getExtendedEventHandling: function ()
      {
         return false;
      },
      getProtoNode: function ()
      {
         return this [_protoNode];
      },
      setProtoNode: function (protoNode)
      {
         if (protoNode !== this [_protoNode])
         {
            // Disconnect old proto node.

            if (this [_protoNode])
            {
               const protoNode = this [_protoNode];

               protoNode ._name_changed .removeFieldInterest (this ._typeName_changed);
               protoNode ._updateInstances .removeInterest ("construct", this)
               protoNode ._updateInstances .removeInterest ("update",    this)
            }

            // Get field from new proto node.

            this [_protoFields]      = new Map (protoNode .getFields () .map (f => [f, f .getName ()]))
            this [_fieldDefinitions] = new FieldDefinitionArray (protoNode .getFieldDefinitions ());
         }

         this [_protoNode] = protoNode;

         protoNode ._name_changed .addFieldInterest (this ._typeName_changed);

         const X3DProtoDeclaration = require ("x_ite/Prototype/X3DProtoDeclaration");

         if (this .getExecutionContext () .getOuterNode () instanceof X3DProtoDeclaration)
            return;

         if (protoNode .isExternProto)
         {
            if (this [_protoNode] .checkLoadState () === X3DConstants .COMPLETE_STATE)
            {
               this .construct ();
            }
            else
            {
               protoNode ._updateInstances .addInterest ("construct", this)
               protoNode .requestImmediateLoad ();
            }
         }
         else
         {
            this .construct ();
         }
      },
      getBody: function ()
      {
         return this [_body];
      },
      getInnerNode: function ()
      {
         const rootNodes = this [_body] .getRootNodes () .getValue ();

         if (rootNodes .length)
         {
            const rootNode = rootNodes [0];

            if (rootNode)
               return rootNode .getValue () .getInnerNode ();
         }

         throw new Error ("Root node not available.");
      },
      importExternProtos: function (externprotos1)
      {
         const externprotos2 = this [_body] .externprotos;

         for (const externproto of externprotos1)
            externprotos2 .add (externproto .getName (), externproto);
      },
      importProtos: function (protos1)
      {
         const protos2 = this [_body] .protos;

         for (const proto of protos1)
            protos2 .add (proto .getName (), proto);
      },
      copyRootNodes: function (rootNodes1)
      {
         const rootNodes2 = this [_body] .getRootNodes ();

         for (const node of rootNodes1)
            rootNodes2 .push (node .copy (this));
      },
      copyImportedNodes: function (executionContext, importedNodes)
      {
         importedNodes .forEach (function (importedNode, importedName)
         {
            try
            {
               const
                  inlineNode   = this [_body] .getNamedNode (importedNode .getInlineNode () .getName ()),
                  exportedName = importedNode .getExportedName ();

               this [_body] .addImportedNode (inlineNode, exportedName, importedName);
            }
            catch (error)
            {
               console .error ("Bad IMPORT specification in copy: ", error);
            }
         },
         this);
      },
      copyRoutes: function (executionContext, routes)
      {
         for (const route of routes)
         {
            try
            {
               const
                  sourceNode      = this [_body] .getLocalNode (executionContext .getLocalName (route .sourceNode)),
                  destinationNode = this [_body] .getLocalNode (executionContext .getLocalName (route .destinationNode));

               this [_body] .addRoute (sourceNode, route .sourceField, destinationNode, route .destinationField);
            }
            catch (error)
            {
               console .error (error);
            }
         }
      },
      toXMLStream: function (stream)
      {
         const
            generator  = Generator .Get (stream),
            sharedNode = generator .IsSharedNode (this);

         generator .EnterScope ();

         const name = generator .Name (this);

         if (name .length)
         {
            if (generator .ExistsNode (this))
            {
               stream .string += generator .Indent ();
               stream .string += "<ProtoInstance";
               stream .string += " ";
               stream .string += "name='";
               stream .string += generator .XMLEncode (this .getTypeName ());
               stream .string += "'";
               stream .string += " ";
               stream .string += "USE='";
               stream .string += generator .XMLEncode (name);
               stream .string += "'";

               const containerField = generator .ContainerField ();

               if (containerField)
               {
                  if (containerField .getName () !== this .getContainerField ())
                  {
                     stream .string += " ";
                     stream .string += "containerField='";
                     stream .string += generator .XMLEncode (containerField .getName ());
                     stream .string += "'";
                  }
               }

               stream .string += "/>";

               generator .LeaveScope ();
               return;
            }
         }

         stream .string += generator .Indent ();
         stream .string += "<ProtoInstance";
         stream .string += " ";
         stream .string += "name='";
         stream .string += generator .XMLEncode (this .getTypeName ());
         stream .string += "'";

         if (name .length)
         {
            generator .AddNode (this);

            stream .string += " ";
            stream .string += "DEF='";
            stream .string += generator .XMLEncode (name);
            stream .string += "'";
         }

         const containerField = generator .ContainerField ();

         if (containerField)
         {
            if (containerField .getName () !== this .getContainerField ())
            {
               stream .string += " ";
               stream .string += "containerField='";
               stream .string += generator .XMLEncode (containerField .getName ());
               stream .string += "'";
            }
         }

         const fields = this .getChangedFields ();

         if (fields .length === 0)
         {
            stream .string += "/>";
         }
         else
         {
            stream .string += ">\n";

            generator .IncIndent ();

            const references = [ ];

            for (const field of fields)
            {
               // If the field is a inputOutput and we have as reference only inputOnly or outputOnly we must output the value
               // for this field.

               let mustOutputValue = false;

               if (generator .ExecutionContext ())
               {
                  if (field .getAccessType () === X3DConstants .inputOutput && field .getReferences () .size !== 0)
                  {
                     let initializableReference = false;

                     field .getReferences () .forEach (function (fieldReference)
                     {
                        initializableReference = initializableReference || fieldReference .isInitializable ();
                     });

                     if (!initializableReference)
                        mustOutputValue = !this .isDefaultValue (field);
                  }
               }

               // If we have no execution context we are not in a proto and must not generate IS references the same is true
               // if the node is a shared node as the node does not belong to the execution context.

               if (field .getReferences () .size === 0 || !generator .ExecutionContext () || sharedNode || mustOutputValue)
               {
                  if (mustOutputValue)
                     references .push (field);

                  switch (field .getType ())
                  {
                     case X3DConstants .MFNode:
                     {
                        stream .string += generator .Indent ();
                        stream .string += "<fieldValue";
                        stream .string += " ";
                        stream .string += "name='";
                        stream .string += generator .XMLEncode (field .getName ());
                        stream .string += "'";

                        if (field .length === 0)
                        {
                           stream .string += "/>\n";
                        }
                        else
                        {
                           generator .PushContainerField (field);

                           stream .string += ">\n";

                           generator .IncIndent ();

                           field .toXMLStream (stream);

                           stream .string += "\n";

                           generator .DecIndent ();

                           stream .string += generator .Indent ();
                           stream .string += "</fieldValue>\n";

                           generator .PopContainerField ();
                        }

                        break;
                     }
                     case X3DConstants .SFNode:
                     {
                        if (field .getValue () !== null)
                        {
                           generator .PushContainerField (field);

                           stream .string += generator .Indent ();
                           stream .string += "<fieldValue";
                           stream .string += " ";
                           stream .string += "name='";
                           stream .string += generator .XMLEncode (field .getName ());
                           stream .string += "'";
                           stream .string += ">\n";

                           generator .IncIndent ();

                           field .toXMLStream (stream);

                           stream .string += "\n";

                           generator .DecIndent ();

                           stream .string += generator .Indent ();
                           stream .string += "</fieldValue>\n";

                           generator .PopContainerField ();
                           break;
                        }

                        // Proceed with next case.
                     }
                     default:
                     {
                        stream .string += generator .Indent ();
                        stream .string += "<fieldValue";
                        stream .string += " ";
                        stream .string += "name='";
                        stream .string += generator .XMLEncode (field .getName ());
                        stream .string += "'";
                        stream .string += " ";
                        stream .string += "value='";

                        field .toXMLStream (stream);

                        stream .string += "'";
                        stream .string += "/>\n";
                        break;
                     }
                  }
               }
               else
               {
                  references .push (field);
               }
            }

            if (references .length && !sharedNode)
            {
               stream .string += generator .Indent ();
               stream .string += "<IS>";
               stream .string += "\n";

               generator .IncIndent ();

               for (const field of references)
               {
                  const protoFields = field .getReferences ();

                  protoFields .forEach (function (protoField)
                  {
                     stream .string += generator .Indent ();
                     stream .string += "<connect";
                     stream .string += " ";
                     stream .string += "nodeField='";
                     stream .string += generator .XMLEncode (field .getName ());
                     stream .string += "'";
                     stream .string += " ";
                     stream .string += "protoField='";
                     stream .string += generator .XMLEncode (protoField .getName ());
                     stream .string += "'";
                     stream .string += "/>\n";
                  });
               }

               generator .DecIndent ();

               stream .string += generator .Indent ();
               stream .string += "</IS>\n";
            }

            generator .DecIndent ();

            stream .string += generator .Indent ();
            stream .string += "</ProtoInstance>";
         }

         generator .LeaveScope ();
      },
      dispose: function ()
      {
         this [_protoNode] ._updateInstances .removeInterest ("construct", this);
         this [_protoNode] ._updateInstances .removeInterest ("update",    this);

         if (this [_body])
            this [_body] .dispose ();

         X3DNode .prototype .dispose .call (this);
      },
   });

   return X3DPrototypeInstance;
});
