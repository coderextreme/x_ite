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
   "x_ite/Components/Shape/Appearance",
   "x_ite/Components/Shape/PointProperties",
   "x_ite/Components/Shape/LineProperties",
   "x_ite/Components/Shape/FillProperties",
   "x_ite/Components/Shape/UnlitMaterial",
   "x_ite/Components/Texturing/ImageTexture",
   "x_ite/Components/Texturing/TextureProperties",
   "x_ite/Browser/Networking/urls",
],
function (Appearance,
          PointProperties,
          LineProperties,
          FillProperties,
          UnlitMaterial,
          ImageTexture,
          TextureProperties,
          urls)
{
"use strict";

   function X3DShapeContext ()
   {
      this .linetypeTextures   = [ ];
      this .hatchStyleTextures = [ ];
   }

   X3DShapeContext .prototype =
   {
      initialize: function ()
      { },
      getDefaultAppearance: function ()
      {
         this .defaultAppearance = new Appearance (this .getPrivateScene ());
         this .defaultAppearance .setup ();

         this .getDefaultAppearance = function () { return this .defaultAppearance; };

         return this .defaultAppearance;
      },
      getDefaultPointProperties: function ()
      {
         this .defaultPointProperties = new PointProperties (this .getPrivateScene ());
         this .defaultPointProperties .setup ();

         this .getDefaultPointProperties = function () { return this .defaultPointProperties; };

         return this .defaultPointProperties;
      },
      getDefaultLineProperties: function ()
      {
         this .defaultLineProperties = new LineProperties (this .getPrivateScene ());

         this .defaultLineProperties .applied_ = false;
         this .defaultLineProperties .setup ();

         this .getDefaultLineProperties = function () { return this .defaultLineProperties; };

         return this .defaultLineProperties;
      },
      getDefaultFillProperties: function ()
      {
         this .defaultFillProperties = new FillProperties (this .getPrivateScene ());

         this .defaultFillProperties .hatched_ = false;
         this .defaultFillProperties .setup ();

         this .getDefaultFillProperties = function () { return this .defaultFillProperties; };

         return this .defaultFillProperties;
      },
      getDefaultMaterial: function ()
      {
         this .defaultMaterial = new UnlitMaterial (this .getPrivateScene ());

         this .defaultMaterial .setup ();

         this .getDefaultMaterial = function () { return this .defaultMaterial; };

         return this .defaultMaterial;
      },
      getLinetype: function (index)
      {
         if (index < 1 || index > 15)
            index = 1;

         var linetypeTexture = this .linetypeTextures [index];

         if (linetypeTexture)
            return linetypeTexture;

         linetypeTexture = this .linetypeTextures [index] = new ImageTexture (this .getPrivateScene ());

         linetypeTexture .url_ [0]           = urls .getLinetypeUrl (index);
         linetypeTexture .textureProperties_ = this .getLineFillTextureProperties ();
         linetypeTexture .setup ();

         return linetypeTexture;
      },
      getHatchStyle: function (index)
      {
         if (index < 1 || index > 19)
            index = 1;

         var hatchStyleTexture = this .hatchStyleTextures [index];

         if (hatchStyleTexture)
            return hatchStyleTexture;

         hatchStyleTexture = this .hatchStyleTextures [index] = new ImageTexture (this .getPrivateScene ());

         hatchStyleTexture .url_ [0]           = urls .getHatchingUrl (index);
         hatchStyleTexture .textureProperties_ = this .getLineFillTextureProperties ();
         hatchStyleTexture .setup ();

         return hatchStyleTexture;
      },
      getLineFillTextureProperties: function ()
      {
         this .lineFillTextureProperties = new TextureProperties (this .getPrivateScene ());
         this .lineFillTextureProperties .setup ();

         this .getLineFillTextureProperties = function () { return this .lineFillTextureProperties; };

         return this .lineFillTextureProperties;
      },
   };

   return X3DShapeContext;
});
