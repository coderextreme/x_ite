---
title: SegmentedVolumeData
date: 2022-01-07
nav: components-VolumeRendering
categories: [components, VolumeRendering]
tags: [SegmentedVolumeData, VolumeRendering]
---
<style>
.post h3 {
  word-spacing: 0.2em;
}
</style>

## Overview

SegmentedVolumeData displays a segmented voxel dataset with different RenderStyle nodes.

The SegmentedVolumeData node belongs to the **VolumeRendering** component and its container field is *children.* It is available since X3D version 3.3 or later.

## Hierarchy

```
+ X3DNode
  + X3DChildNode
    + X3DVolumeDataNode
      + SegmentedVolumeData
```

## Fields

### SFVec3f [in, out] **dimensions** 1 1 1 <small>(0,∞)</small>

Actual-size X-Y-Z dimensions of volume data in local coordinate system.

### SFNode [in, out] **metadata** NULL <small>[X3DMetadataObject]</small>

Metadata are not part of the X3D world and not interpreted by the X3D browser, but they can be accessed via the ECMAScript interface.

### MFNode [in, out] **renderStyle** [ ] <small>[X3DVolumeRenderStyleNode]</small>

Input/Output field renderStyle.

### MFBool [in, out] **segmentEnabled** [ ]

Input/Output field segmentEnabled.

### SFNode [in, out] **segmentIdentifiers** NULL <small>[X3DTexture3DNode]</small>

Input/Output field segmentIdentifiers.

### SFNode [in, out] **voxels** NULL <small>[X3DTexture3DNode]</small>

Input/Output field voxels.

### SFVec3f [ ] **bboxCenter** 0 0 0 <small>(-∞,∞)</small>

Bounding box center: optional hint for position offset from origin of local coordinate system.

### SFVec3f [ ] **bboxSize** -1 -1 -1 <small>[0,∞) or -1 -1 -1</small>

Bounding box size is usually omitted, and can easily be calculated automatically by an X3D player at scene-loading time with minimal computational cost. Bounding box size can also be defined as an optional authoring hint that suggests an optimization or constraint.

#### Hint

Can be useful for collision computations or inverse-kinematics (IK) engines.

## Description

### Hints

- SegmentedVolumeData can contain a single ComposedTexture3D, ImageTexture3D or PixelTexture3D node with containerField='segmentIdentifiers' and another with containerField='voxels'.
- SegmentedVolumeData can contain multiple RenderStyle nodes.

## Example

<x3d-canvas src="https://create3000.github.io/media/examples/VolumeRendering/SegmentedVolumeData/SegmentedVolumeData.x3d"></x3d-canvas>

## External Links

- [X3D Specification of SegmentedVolumeData](https://www.web3d.org/documents/specifications/19775-1/V4.0/Part01/components/volume.html#SegmentedVolumeData){:target="_blank"}