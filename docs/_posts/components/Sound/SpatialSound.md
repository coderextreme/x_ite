---
title: SpatialSound
date: 2023-01-31
nav: components-Sound
categories: [components, Sound]
tags: [SpatialSound, Sound]
---
<style>
.post h3 {
   word-spacing: 0.2em;
}
</style>

## Overview

SpatialSound ...

The SpatialSound node belongs to the **Sound** component and its default container field is *children.* It is available since X3D version 4.0 or later.

## Hierarchy

```
+ X3DNode
```

## Fields

### SFNode [in, out] **metadata** NULL <small>[X3DMetadataObject]</small>

### SFString [in, out] **description** ""

### SFBool [in, out] **enabled** <small></small>

### SFBool [] **spatialize** <small></small>

### SFFloat [in, out] **coneInnerAngle** <small></small>

### SFFloat [in, out] **coneOuterAngle** <small></small>

### SFFloat [in, out] **coneOuterGain** <small></small>

### SFVec3f [in, out] **direction** <small></small>

### SFString [in, out] **distanceModel** <small></small>

### SFBool [in, out] **dopplerEnabled** <small></small>

### SFBool [in, out] **enableHRTF** <small></small>

### SFFloat [in, out] **gain** <small></small>

### SFFloat [in, out] **intensity** <small></small>

### SFVec3f [in, out] **location** <small></small>

### SFFloat [in, out] **maxDistance** <small></small>

### SFFloat [in, out] **priority** <small></small>

### SFFloat [in, out] **referenceDistance** <small></small>

### SFFloat [in, out] **rolloffFactor** <small></small>

### MFNode [in, out] **children** <small></small>

## External Links

- [X3D Specification of SpatialSound](https://www.web3d.org/documents/specifications/19775-1/V4.0/Part01/components/sound.html#SpatialSound){:target="_blank"}