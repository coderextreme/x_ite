/*******************************************************************************
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

import SupportedNodes from "../Configuration/SupportedNodes.js";
import Box            from "./Geometry3D/Box.js";
import Cone           from "./Geometry3D/Cone.js";
import Cylinder       from "./Geometry3D/Cylinder.js";
import ElevationGrid  from "./Geometry3D/ElevationGrid.js";
import Extrusion      from "./Geometry3D/Extrusion.js";
import IndexedFaceSet from "./Geometry3D/IndexedFaceSet.js";
import Sphere         from "./Geometry3D/Sphere.js";

const Types =
{
   Box:            Box,
   Cone:           Cone,
   Cylinder:       Cylinder,
   ElevationGrid:  ElevationGrid,
   Extrusion:      Extrusion,
   IndexedFaceSet: IndexedFaceSet,
   Sphere:         Sphere,
};

const AbstractTypes =
{
};

for (const typeName in Types)
   SupportedNodes .addType (typeName, Types [typeName]);

for (const typeName in AbstractTypes)
   SupportedNodes .addAbstractType (typeName, AbstractTypes [typeName]);

export default undefined;
