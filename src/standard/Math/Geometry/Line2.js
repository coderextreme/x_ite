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
   "standard/Math/Numbers/Vector2",
],
function (Vector2)
{
"use strict";

   function Line2 (point, direction)
   {
      this .point     = point     .copy ();
      this .direction = direction .copy ();
   }

   Line2 .prototype =
   {
      constructor: Line2,
      copy: function ()
      {
         const copy = Object .create (Line2 .prototype);
         copy .point     = this .point .copy ();
         copy .direction = this .direction .copy ();
         return copy;
      },
      assign: function (line)
      {
         this .point     .assign (line .point);
         this .direction .assign (line .direction);
         return this;
      },
      set: function (point, direction)
      {
         this .point     .assign (point);
         this .direction .assign (direction);
         return this;
      },
      setPoints: function (point1, point2)
      {
         this .point .assign (point1);
         this .direction .assign (point2) .subtract (point1) .normalize ();
         return this;
      },
      multMatrixLine: function (matrix)
      {
         matrix .multMatrixVec (this .point);
         matrix .multMatrixDir (this .direction) .normalize ();
         return this;
      },
      multLineMatrix: function (matrix)
      {
         matrix .multVecMatrix (this .point);
         matrix .multDirMatrix (this .direction) .normalize ();
         return this;
      },
      getClosestPointToPoint: function (point, result)
      {
         const
            r = result .assign (point) .subtract (this .point),
            d = r .dot (this .direction);

         return result .assign (this .direction) .multiply (d) .add (this .point);
      },
      getClosestPointToLine: (function ()
      {
         const u = new Vector2 (0, 0);

         return function (line, point)
         {
            const
               p1 = this .point,
               p2 = line .point,
               d1 = this .direction,
               d2 = line .direction;

            let t = d1 .dot (d2);

            if (Math .abs (t) >= 1)
               return false;  // lines are parallel

            u .assign (p2) .subtract (p1);

            t = (u .dot (d1) - t * u .dot (d2)) / (1 - t * t);

            point .assign (d1) .multiply (t) .add (p1);
            return true;
         };
      })(),
      getPerpendicularVectorToPoint: (function ()
      {
         const t = new Vector2 (0, 0);

         return function (point, result)
         {
            const d = result;

            d .assign (this .point) .subtract (point);

            return d .subtract (t .assign (this .direction) .multiply (d .dot (this .direction)));
         };
      })(),
      intersectsLine: (function ()
      {
         const u = Vector2 (0, 0);

         return function (line, point)
         {
            const
               p1 = this .point,
               p2 = line .point,
               d1 = this .direction,
               d2 = line .direction;

            const theta = d1 .dot (d2); // angle between both lines

            if (Math .abs (theta) >= 1)
               return false; // lines are parallel

            u .assign (p2) .subtract (p1);

            const t = (u .dot (d1) - theta * u .dot (d2)) / (1 - theta * theta);

            point .assign (d1) .multiply (t) .add (p1);

            return true;
         };
      })(),
      toString: function ()
      {
         return this .point + ", " + this .direction;
      },
   };

   Line2 .Points = function (point1, point2)
   {
      const line = Object .create (Line2 .prototype);
      line .point     = point1 .copy ();
      line .direction = Vector2 .subtract (point2, point1) .normalize ();
      return line;
   };

   return Line2;
});
