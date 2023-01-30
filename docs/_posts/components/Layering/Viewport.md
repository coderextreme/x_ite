---
title: Viewport
date: 2022-01-07
nav: components-Layering
categories: [components, Layering]
tags: [Viewport, Layering]
---
<style>
.post h3 {
  word-spacing: 0.2em;
}
</style>

## Overview

Viewport is a Grouping node that can contain most nodes. Viewport specifies a set of rectangular clip boundaries against which the children nodes are clipped as they are rendered.

The Viewport node belongs to the **Layering** component and its container field is *viewport.* It is available since X3D version 3.2 or later.

## Hierarchy

```
+ X3DNode
  + X3DChildNode
    + X3DGroupingNode
      + X3DViewportNode
        + Viewport (X3DBoundedObject)*
```

<small>\* Derived from multiple interfaces.</small>

## Fields

### SFNode [in, out] **metadata** NULL <small>[X3DMetadataObject]</small>

Metadata are not part of the X3D world and not interpreted by the X3D browser, but they can be accessed via the ECMAScript interface.

### MFFloat [in, out] **clipBoundary** [ 0, 1, 0, 1 ] <small>[0,1]</small>

ClipBoundary is specified in fractions of the normal render surface in the sequence left/right/bottom/top. When children are rendered, the output will only appear in the specified subset of the render surface.

#### Hint

Default value 0 1 0 1 indicates 0-1 left-to-right and 0-1 bottom-to-top, meaning full view.

### SFVec3f [ ] **bboxSize** -1 -1 -1 <small>(0,∞) or -1 -1 -1</small>

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

Grouping nodes contain a list of children nodes.

#### Hint

Each grouping node defines a coordinate space for its children, relative to the coordinate space of its parent node. Thus transformations accumulate down the scene graph hierarchy.

## Example

<x3d-canvas src="https://create3000.github.io/media/examples/Layering/Viewport/Viewport.x3d"></x3d-canvas>

## External Links

- [X3D Specification of Viewport](https://www.web3d.org/documents/specifications/19775-1/V4.0/Part01/components/layering.html#Viewport){:target="_blank"}