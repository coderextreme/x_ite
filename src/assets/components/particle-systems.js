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


define ([
   "x_ite/Components",
   "x_ite/Browser/ParticleSystems/X3DParticleSystemsContext",
   "x_ite/Components/ParticleSystems/BoundedPhysicsModel",
   "x_ite/Components/ParticleSystems/ConeEmitter",
   "x_ite/Components/ParticleSystems/ExplosionEmitter",
   "x_ite/Components/ParticleSystems/ForcePhysicsModel",
   "x_ite/Components/ParticleSystems/ParticleSystem",
   "x_ite/Components/ParticleSystems/PointEmitter",
   "x_ite/Components/ParticleSystems/PolylineEmitter",
   "x_ite/Components/ParticleSystems/SurfaceEmitter",
   "x_ite/Components/ParticleSystems/VolumeEmitter",
   "x_ite/Components/ParticleSystems/WindPhysicsModel",
   "x_ite/Components/ParticleSystems/X3DParticleEmitterNode",
   "x_ite/Components/ParticleSystems/X3DParticlePhysicsModelNode",
],
function (Components,
          X3DParticleSystemsContext,
          BoundedPhysicsModel,
          ConeEmitter,
          ExplosionEmitter,
          ForcePhysicsModel,
          ParticleSystem,
          PointEmitter,
          PolylineEmitter,
          SurfaceEmitter,
          VolumeEmitter,
          WindPhysicsModel,
          X3DParticleEmitterNode,
          X3DParticlePhysicsModelNode)
{
"use strict";

   Components .addComponent ({
      name: "ParticleSystems",
      types:
      {
         BoundedPhysicsModel: BoundedPhysicsModel,
         ConeEmitter:         ConeEmitter,
         ExplosionEmitter:    ExplosionEmitter,
         ForcePhysicsModel:   ForcePhysicsModel,
         ParticleSystem:      ParticleSystem,
         PointEmitter:        PointEmitter,
         PolylineEmitter:     PolylineEmitter,
         SurfaceEmitter:      SurfaceEmitter,
         VolumeEmitter:       VolumeEmitter,
         WindPhysicsModel:    WindPhysicsModel,
      },
      abstractTypes:
      {
         X3DParticleEmitterNode:      X3DParticleEmitterNode,
         X3DParticlePhysicsModelNode: X3DParticlePhysicsModelNode,
      },
      browserContext: X3DParticleSystemsContext,
   });
});
