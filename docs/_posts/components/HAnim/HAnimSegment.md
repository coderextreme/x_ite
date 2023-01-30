---
title: HAnimSegment
date: 2022-01-07
nav: components-HAnim
categories: [components, HAnim]
tags: [HAnimSegment, HAnim]
---
<style>
.post h3 {
  word-spacing: 0.2em;
}
</style>

## Overview

Each body segment is stored in an HAnimSegment node. HAnimSegment contains Coordinate/CoordinateDouble with containerField='coord', HAnimDisplacer with containerField='displacers' and Shape or grouping nodes with containerField='children'.

The HAnimSegment node belongs to the **HAnim** component and its container field is *children.* It is available since X3D version 3.0 or later.

## Hierarchy

```
+ X3DNode
  + X3DChildNode
    + X3DGroupingNode
      + HAnimSegment
```

## Fields

### SFNode [in, out] **metadata** NULL <small>[X3DMetadataObject]</small>

Metadata are not part of the X3D world and not interpreted by the X3D browser, but they can be accessed via the ECMAScript interface.

### SFVec3f [ ] **bboxSize** -1 -1 -1 <small>[0,∞) or −1 −1 −1</small>

Bounding box size is usually omitted, and can easily be calculated automatically by an X3D player at scene-loading time with minimal computational cost. Bounding box size can also be defined as an optional authoring hint that suggests an optimization or constraint.

#### Hint

Can be useful for collision computations or inverse-kinematics (IK) engines.

### SFVec3f [ ] **bboxCenter** 0 0 0 <small>(-∞,∞)</small>

Bounding box center: optional hint for position offset from origin of local coordinate system.

### MFNode [in] **addChildren**

Input field addChildren.

### MFNode [in] **removeChildren**

Input field removeChildren.

### MFNode [in, out] **children** [ ] <small>[X3DChildNode]</small>

Input/Output field children.

### SFVec3f [in, out] **centerOfMass** 0 0 0 <small>(-∞,∞)</small>

Location within segment of center of mass.

### SFNode [in, out] **coord** NULL <small>[X3DCoordinateNode]</small>

Input/Output field coord.

### MFNode [in, out] **displacers** [ ] <small>[HAnimDisplacer]</small>

Input/Output field displacers.

### SFFloat [in, out] **mass** <small>[0,∞)</small>

Total mass of the segment, 0 if not available.

### MFFloat [in, out] **momentsOfInertia** [ 0, 0, 0, 0, 0, 0, 0, 0, 0 ] <small>[0,∞)</small>

3x3 moments of inertia matrix. default: 0 0 0 0 0 0 0 0 0.

### SFString [in, out] **name** ""

Unique name attribute must be defined so that HAnimSegment node can be identified at run time for animation purposes.

#### Hint

For abitrary humanoids, HAnimSegment name can describe geometry between parent HAnimJoint and sibling HAnimJoint nodes (for example LeftHip_to_LeftKnee).

#### Warning

Name is not included if this instance is a USE node. Examples: sacrum pelvis l_thigh l_calf etc. as listed in HAnim Specification.

#### See Also

- [HAnim Humanoid Segment Names HAnim Specification, Humanoid Joint-Segment Hierarchy](https://www.web3d.org/x3d/content/examples/Basic/HumanoidAnimation/tables/HAnimSegmentNames19774V1.0.txt){:target="_blank"}
- [HAnim Specification, Humanoid Joint-Segment Hierarchy](https://www.web3d.org/documents/specifications/19774-1/V2.0/HAnim/concepts.html#Hierarchy){:target="_blank"}

## Description

### Hints

- HAnimSegment displays geometry between parent HAnimJoint and sibling HAnimJoint nodes.
- Include `<component name='HAnim' level='1'/>`

## External Links

- [X3D Specification of HAnimSegment](https://www.web3d.org/documents/specifications/19775-1/V4.0/Part01/components/hanim.html#HAnimSegment){:target="_blank"}
- [HAnim Specification](https://www.web3d.org/documents/specifications/19774-1/V2.0/HAnim/HAnimArchitecture.html){:target="_blank"}
- [HAnim Specification, Segment](https://www.web3d.org/documents/specifications/19774-1/V2.0/HAnim/ObjectInterfaces.html#Segment){:target="_blank"}