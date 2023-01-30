---
title: Layer
date: 2022-01-07
nav: components-Layering
categories: [components, Layering]
tags: [Layer, Layering]
---
<style>
.post h3 {
  word-spacing: 0.2em;
}
</style>

## Overview

Layer contains a list of children nodes that define the contents of the layer.

The Layer node belongs to the **Layering** component and its container field is *layers.* It is available since X3D version 3.2 or later.

## Hierarchy

```
+ X3DNode
  + X3DLayerNode
    + Layer
```

## Fields

### SFNode [in, out] **metadata** NULL <small>[X3DMetadataObject]</small>

Metadata are not part of the X3D world and not interpreted by the X3D browser, but they can be accessed via the ECMAScript interface.

### SFBool [in, out] **isPickable** TRUE

IsPickable determines whether pick traversal is performed for this layer.

### SFNode [in, out] **viewport** NULL <small>[X3DViewportNode]</small>

The viewport field is a single Viewport node that constrains layer output to a sub-region of the render surface.

### MFNode [in] **addChildren**

Input field addChildren.

### MFNode [in] **removeChildren**

Input field removeChildren.

### MFNode [in, out] **children** [ ] <small>[X3DChildNode]</small>

Nodes making up this layer.

#### Hint

No transformations are possible above each Layerset/Layer combination in the scene graph hierarchy.

## Description

### Hints

- No transformations are possible above each Layerset/Layer combination in the scene graph hierarchy.
- Each Layer node contains its own binding stacks and thus has its own viewpoints and navigation.

## External Links

- [X3D Specification of Layer](https://www.web3d.org/documents/specifications/19775-1/V4.0/Part01/components/layering.html#Layer){:target="_blank"}