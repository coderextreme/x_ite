---
title: SliderJoint
date: 2022-01-07
nav: components-RigidBodyPhysics
categories: [components, RigidBodyPhysics]
tags: [SliderJoint, RigidBodyPhysics]
---
<style>
.post h3 {
  word-spacing: 0.2em;
}
</style>

## Overview

SliderJoint constrains all movement between body1 and body2 along a single axis. Contains two RigidBody nodes (containerField values body1, body2).

The SliderJoint node belongs to the **RigidBodyPhysics** component and its container field is *joints.* It is available since X3D version 3.2 or later.

## Hierarchy

```
+ X3DNode
  + X3DRigidJointNode
    + SliderJoint
```

## Fields

### SFNode [in, out] **metadata** NULL <small>[X3DMetadataObject]</small>

Metadata are not part of the X3D world and not interpreted by the X3D browser, but they can be accessed via the ECMAScript interface.

### MFString [in, out] **forceOutput** "NONE" <small>["ALL","NONE",...]</small>

ForceOutput controls which output fields are generated for the next frame. Values are ALL, NONE, or exact names of output fields updated at start of next frame.

### SFVec3f [in, out] **axis** 0 1 0

Axis is normalized vector specifying direction of motion.

### SFFloat [in, out] **minSeparation** <small>[0,∞)</small>

MinSeparation is minimum separation distance between the two bodies.

#### Hint

If (minSeparation is less than maxSeparation) then no stop is effective.

### SFFloat [in, out] **maxSeparation** 1 <small>[0,∞)</small>

MaxSeparation is maximum separation distance between the two bodies.

#### Hint

If (minSeparation is less than maxSeparation) then no stop is effective.

### SFFLoat [in, out] **sliderForce** 0 <span class="no"><small class="small">not supported</small></span>

Input/Output field sliderForce.

### SFFloat [in, out] **stopBounce** <small>[0,1] <span class="no">not supported</span></small>

StopBounce is velocity factor for bounce back once stop point is reached.

#### Hint

0 means no bounce, 1 means return velocity matches.

### SFFloat [in, out] **stopErrorCorrection** 1 <small>[0,1] <span class="no">not supported</span></small>

StopErrorCorrection is fraction of error correction performed during time step once stop point is reached.

#### Hint

0 means no error correction, 1 means all error corrected in single step.

### SFFloat [out] **separation** <span class="no"><small class="small">not supported</small></span>  

Separation indicates final separation distance between the two bodies.

### SFFloat [out] **separationRate** <span class="no"><small class="small">not supported</small></span>

SeparationRate indicates change in separation distance over time between the two bodies.

### SFNode [in, out] **body1** NULL <small>[RigidBody]</small>

Input/Output field body1.

### SFNode [in, out] **body2** NULL <small>[RigidBody]</small>

Input/Output field body2.

## Description

### Hint

- RigidBodyPhysics component, level 2.

## Example

<x3d-canvas src="https://create3000.github.io/media/examples/RigidBodyPhysics/SliderJoint/SliderJoint.x3d"></x3d-canvas>

## External Links

- [X3D Specification of SliderJoint](https://www.web3d.org/documents/specifications/19775-1/V4.0/Part01/components/rigidBodyPhysics.html#SliderJoint){:target="_blank"}