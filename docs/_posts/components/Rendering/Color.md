---
title: Color
date: 2022-01-07
nav: components-Rendering
categories: [components, Rendering]
tags: [Color, Rendering]
---
<style>
.post h3 {
  word-spacing: 0.2em;
}
</style>

## Overview

Color node defines a set of RGB color values that apply either to a sibling Coordinate/CoordinateDouble node, or else to a parent ElevationGrid node. Color is only used by ElevationGrid, IndexedFaceSet, IndexedLineSet, LineSet, PointSet, Triangle\* and IndexedTriangle\* nodes.

The Color node belongs to the **Rendering** component and its container field is *color.* It is available since X3D version 3.0 or later.

## Hierarchy

```
+ X3DNode
  + X3DGeometricPropertyNode
    + X3DColorNode
      + Color
```

## Fields

### SFNode [in, out] **metadata** NULL <small>[X3DMetadataObject]</small>

Metadata are not part of the X3D world and not interpreted by the X3D browser, but they can be accessed via the ECMAScript interface.

### MFColor [in, out] **color** [ ] <small>[0,1]</small>

The color field defines an array of 3-tuple RGB colors.

## Description

### Hint

- Colors are often controlled by Material instead.

## Example

<x3d-canvas src="https://create3000.github.io/media/examples/Rendering/Color/Color.x3d"></x3d-canvas>

<table class="x3d-widgets"><tbody><tr><td><button class="button" id="reset-colors-button">Reset Colors</button></td><td><select class="select" id="randomize-colors-button"><option value="0">Preserve Positions</option><option value="1">Move Colors To Left Side</option><option value="2">Move Colors To Right Side</option><option selected="selected" value="3">Randomize Colors</option></select></td></tr></tbody></table>

- [/c3-source-example]

## External Links

- [X3D Specification of Color](https://www.web3d.org/documents/specifications/19775-1/V4.0/Part01/components/rendering.html#Color){:target="_blank"}
- [X3D Scene Authoring Hints, Color](https://www.web3d.org/x3d/content/examples/X3dSceneAuthoringHints.html#Color){:target="_blank"}