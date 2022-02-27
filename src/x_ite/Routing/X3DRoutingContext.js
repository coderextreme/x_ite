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
],
function ()
{
"use strict";

   const
      _taintedFields     = Symbol (),
      _taintedFieldsTemp = Symbol (),
      _taintedNodes      = Symbol (),
      _taintedNodesTemp  = Symbol ();

   function X3DRoutingContext ()
   {
      this [_taintedFields]     = [ ];
      this [_taintedFieldsTemp] = [ ];
      this [_taintedNodes]      = [ ];
      this [_taintedNodesTemp]  = [ ];
   }

   X3DRoutingContext .prototype =
   {
      constructor: X3DRoutingContext,
      initialize: function () { },
      addTaintedField: function (field, event)
      {
         this [_taintedFields] .push (field, event);
      },
      addTaintedNode: function (node)
      {
         this [_taintedNodes] .push (node);
      },
      processEvents: function ()
      {
         do
         {
            // Process field events
            do
            {
               const taintedFields = this [_taintedFields];

               // Swap tainted fields.
               this [_taintedFields]         = this [_taintedFieldsTemp];
               this [_taintedFields] .length = 0;

               for (let i = 0, length = taintedFields .length; i < length; i += 2)
                  taintedFields [i] .processEvent (taintedFields [i + 1]);

               // Don't know why this must be done after the for loop, otherwise a fatal error could be thrown.
               this [_taintedFieldsTemp] = taintedFields;
            }
            while (this [_taintedFields] .length);

            // Process node events
            do
            {
               const taintedNodes = this [_taintedNodes];

               // Swap tainted nodes.
               this [_taintedNodes]         = this [_taintedNodesTemp];
               this [_taintedNodes] .length = 0;

               for (const taintedNode of taintedNodes)
                  taintedNode .processEvents ();

               // Don't know why this must be done after the for loop, otherwise a fatal error could be thrown.
               this [_taintedNodesTemp] = taintedNodes;
            }
            while (! this [_taintedFields] .length && this [_taintedNodes] .length);
         }
         while (this [_taintedFields] .length);
      },
   };

   return X3DRoutingContext;
});
