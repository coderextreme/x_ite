---
title: MotorJoint
date: 2022-01-07
nav: components-RigidBodyPhysics
categories: [components, RigidBodyPhysics]
tags: [MotorJoint, RigidBodyPhysics]
---
<style>
.post h3 {
  word-spacing: 0.2em;
}
</style>

## Overview

MotorJoint drives relative angular velocities between body1 and body2 within a common reference frame. Contains two RigidBody nodes (containerField values body1, body2).

The MotorJoint node belongs to the **RigidBodyPhysics** component and its container field is *joints.* It is available since X3D version 3.2 or later.

## Hierarchy

```
+ X3DNode
  + X3DRigidJointNode
    + MotorJoint
```

## Fields

### SFNode [in, out] **metadata** NULL <small>[X3DMetadataObject]</small>

Metadata are not part of the X3D world and not interpreted by the X3D browser, but they can be accessed via the ECMAScript interface.

### MFString [in, out] **forceOutput** "NONE" <small>["ALL","NONE",...]</small>

ForceOutput controls which output fields are generated for the next frame. Values are ALL, NONE, or exact names of output fields updated at start of next frame.

### SFInt32 [in, out] **enabledAxes** 1 <small>[0,3]</small>

EnabledAxes indicates which motor axes are active. (0) none, (1) axis 1, (2) axes 1 and 2, (3) all three axes.

### SFVec3f [in, out] **motor1Axis** 0 0 0

Motor1Axis defines axis vector of corresponding motor axis.

#### Hint

0 0 0 means motor disabled.

### SFVec3f [in, out] **motor2Axis** 0 0 0

Motor2Axis defines axis vector of corresponding motor axis.

#### Hint

0 0 0 means motor disabled.

### SFVec3f [in, out] **motor3Axis** 0 0 0

Motor3Axis defines axis vector of corresponding motor axis.

#### Hint

0 0 0 means motor disabled.

### SFFloat [in, out] **axis1Angle**<small>[-π,π]</small>

Axis1Angle (radians) is rotation angle for corresponding motor axis when in user-calculated mode.

### SFFloat [in, out] **axis2Angle**<small>[-π,π]</small>

Axis2Angle (radians) is rotation angle for corresponding motor axis when in user-calculated mode.

### SFFloat [in, out] **axis3Angle** <small>[-π,π]</small>

Axis3Angle (radians) is rotation angle for corresponding motor axis when in user-calculated mode.

### SFFloat [in, out] **axis1Torque** <small>(-∞,∞)</small>

Axis1Torque is rotational torque applied by corresponding motor axis when in user-calculated mode.

### SFFloat [in, out] **axis2Torque** <small>(-∞,∞)</small>

Axis2Torque is rotational torque applied by corresponding motor axis when in user-calculated mode.

### SFFloat [in, out] **axis3Torque** <small>(-∞,∞)</small>

Axis3Torque is rotational torque applied by corresponding motor axis when in user-calculated mode.

### SFFloat [in, out] **stop1Bounce**<small>[0,1]</small>

Stop1Bounce is velocity factor for bounce back once stop point is reached.

#### Hint

0 means no bounce, 1 means return velocity matches.

### SFFloat [in, out] **stop2Bounce**<small>[0,1]</small>

Stop2Bounce is velocity factor for bounce back once stop point is reached.

#### Hint

0 means no bounce, 1 means return velocity matches.

### SFFloat [in, out] **stop3Bounce** <small>[0,1]</small>

Stop3Bounce is velocity factor for bounce back once stop point is reached.

#### Hint

0 means no bounce, 1 means return velocity matches.

### SFFloat [in, out] **stop1ErrorCorrection** 0.8 <small>[0,1]</small>

Stop1ErrorCorrection is fraction of error correction performed during time step once stop point is reached.

#### Hint

0 means no error correction, 1 means all error corrected in single step.

### SFFloat [in, out] **stop2ErrorCorrection** 0.8 <small>[0,1]</small>

Stop2ErrorCorrection is fraction of error correction performed during time step once stop point is reached.

#### Hint

0 means no error correction, 1 means all error corrected in single step.

### SFFloat [in, out] **stop3ErrorCorrection** 0.8 <small>[0,1]</small>

Stop3ErrorCorrection is fraction of error correction performed during time step once stop point is reached.

#### Hint

0 means no error correction, 1 means all error corrected in single step.

### SFFloat [out] **motor1Angle**

Motor1Angle provides calculated angle of rotation (radians) for this motor joint from last frame.

### SFFloat [out] **motor2Angle**

Motor2Angle provides calculated angle of rotation (radians) for this motor joint from last frame.

### SFFloat [out] **motor3Angle**

Motor3Angle provides calculated angle of rotation (radians) for this motor joint from last frame.

### SFFloat [out] **motor1AngleRate**

Motor1AngleRate provides calculated anglular rotation rate (radians/second) for this motor joint from last frame.

### SFFloat [out] **motor2AngleRate**

Motor2AngleRate provides calculated anglular rotation rate (radians/second) for this motor joint from last frame.

### SFFloat [out] **motor3AngleRate**

Motor3AngleRate provides calculated anglular rotation rate (radians/second) for this motor joint from last frame.

### SFBool [ ] **autoCalc** FALSE

AutoCalc controls whether user manually provides individual angle rotations each frame (false) or if angle values are automatically calculated by motor implementations (true).

### SFNode [in, out] **body1** NULL <small>[RigidBody]</small>

Input/Output field body1.

### SFNode [in, out] **body2** NULL <small>[RigidBody]</small>

Input/Output field body2.

## Description

### Hints

- Useful in combination with BallJoint.
- RigidBodyPhysics component, level 2.

## External Links

- [X3D Specification of MotorJoint](https://www.web3d.org/documents/specifications/19775-1/V4.0/Part01/components/rigidBodyPhysics.html#MotorJoint){:target="_blank"}