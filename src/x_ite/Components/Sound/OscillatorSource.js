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
import X3DSoundSourceNode   from "./X3DSoundSourceNode.js";
import X3DConstants         from "../../Base/X3DConstants.js";
import X3DCast              from "../../Base/X3DCast.js";

function OscillatorSource (executionContext)
{
   X3DSoundSourceNode .call (this, executionContext);

   this .addType (X3DConstants .OscillatorSource);

   this .addChildObjects (X3DConstants .inputOutput, "loop", new Fields .SFBool ());

   const audioContext = this .getBrowser () .getAudioContext ();

   this .oscillatorNode = new OscillatorNode (audioContext);
   this .mergerNode     = new ChannelMergerNode (audioContext, { numberOfInputs: 2 });
}

Object .assign (Object .setPrototypeOf (OscillatorSource .prototype, X3DSoundSourceNode .prototype),
{
   initialize ()
   {
      X3DSoundSourceNode .prototype .initialize .call (this);

      this ._detune       .addInterest ("set_detune__",       this);
      this ._frequency    .addInterest ("set_frequency__",    this);
      this ._periodicWave .addInterest ("set_periodicWave__", this);

      this .set_periodicWave__ ();
   },
   set_type__: (function ()
   {
      const types = new Set ([
         "sine",
         "square",
         "sawtooth",
         "triangle",
      ]);

      return function ()
      {
         this .periodicWaveNode ._optionsReal .removeInterest ("set_periodicWaveOptions__", this);
         this .periodicWaveNode ._optionsImag .removeInterest ("set_periodicWaveOptions__", this);

         const type = this .periodicWaveNode ._type .getValue () .toLowerCase ();

         if (type === "custom")
         {
            this .periodicWaveNode ._optionsReal .addInterest ("set_periodicWaveOptions__", this);
            this .periodicWaveNode ._optionsImag .addInterest ("set_periodicWaveOptions__", this);

            this .set_periodicWaveOptions__ ();
         }
         else
         {
            this .oscillatorNode .type = types .has (type) ? type : "square";
         }
      };
   })(),
   set_frequency__ ()
   {
      this .oscillatorNode .frequency .value = this ._frequency .getValue ();
   },
   set_detune__ ()
   {
      this .oscillatorNode .detune .value = this ._detune .getValue ();
   },
   set_periodicWave__ ()
   {
      this .periodicWaveNode ?._type .removeInterest ("set_type__", this);

      this .periodicWaveNode = X3DCast (X3DConstants .PeriodicWave, this ._periodicWave)
         ?? this .getBrowser () .getDefaultPeriodicWave ();

      this .periodicWaveNode ._type .addInterest ("set_type__", this);

      this .set_type__ ();
   },
   set_periodicWaveOptions__ ()
   {
      this .oscillatorNode .setPeriodicWave (this .periodicWaveNode .createPeriodicWave ());
   },
   set_start ()
   {
      const audioContext = this .getBrowser () .getAudioContext ();

      this .oscillatorNode = new OscillatorNode (audioContext);

      this .set_type__ ();
      this .set_frequency__ ();
      this .set_detune__ ();

      this .oscillatorNode .connect (this .mergerNode, 0, 0);
      this .oscillatorNode .connect (this .mergerNode, 0, 1);
      this .mergerNode     .connect (this .getAudioSource ());

      this .oscillatorNode .start ();
   },
   set_pause ()
   {
      this .mergerNode .disconnect ();
   },
   set_resume ()
   {
      this .mergerNode .connect (this .getAudioSource ());
   },
   set_stop ()
   {
      this .oscillatorNode .stop ();
      this .oscillatorNode .disconnect ();
   },
});

Object .defineProperties (OscillatorSource,
{
   typeName:
   {
      value: "OscillatorSource",
      enumerable: true,
   },
   componentName:
   {
      value: "Sound",
      enumerable: true,
   },
   containerField:
   {
      value: "children",
      enumerable: true,
   },
   specificationRange:
   {
      value: Object .freeze (["4.0", "Infinity"]),
      enumerable: true,
   },
   fieldDefinitions:
   {
      value: new FieldDefinitionArray ([
         new X3DFieldDefinition (X3DConstants .inputOutput, "metadata",     new Fields .SFNode ()),
         new X3DFieldDefinition (X3DConstants .inputOutput, "description",  new Fields .SFString ()),
         new X3DFieldDefinition (X3DConstants .inputOutput, "enabled",      new Fields .SFBool (true)),

         new X3DFieldDefinition (X3DConstants .inputOutput, "gain",         new Fields .SFFloat (1)),
         new X3DFieldDefinition (X3DConstants .inputOutput, "frequency",    new Fields .SFFloat ()),
         new X3DFieldDefinition (X3DConstants .inputOutput, "detune",       new Fields .SFFloat ()),
         new X3DFieldDefinition (X3DConstants .inputOutput, "periodicWave", new Fields .SFNode ()),

         new X3DFieldDefinition (X3DConstants .inputOutput, "startTime",    new Fields .SFTime ()),
         new X3DFieldDefinition (X3DConstants .inputOutput, "resumeTime",   new Fields .SFTime ()),
         new X3DFieldDefinition (X3DConstants .inputOutput, "pauseTime",    new Fields .SFTime ()),
         new X3DFieldDefinition (X3DConstants .inputOutput, "stopTime",     new Fields .SFTime ()),
         new X3DFieldDefinition (X3DConstants .outputOnly,  "isPaused",     new Fields .SFBool ()),
         new X3DFieldDefinition (X3DConstants .outputOnly,  "isActive",     new Fields .SFBool ()),
         new X3DFieldDefinition (X3DConstants .outputOnly,  "elapsedTime",  new Fields .SFTime ()),
      ]),
      enumerable: true,
   },
});

export default OscillatorSource;
