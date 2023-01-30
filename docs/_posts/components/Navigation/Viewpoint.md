---
title: Viewpoint
date: 2022-01-07
nav: components-Navigation
categories: [components, Navigation]
tags: [Viewpoint, Navigation]
---
<style>
.post h3 {
  word-spacing: 0.2em;
}
</style>

## Overview

Viewpoint provides a specific location and direction where the user may view the scene.

The Viewpoint node belongs to the **Navigation** component and its container field is *children.* It is available since X3D version 3.0 or later.

## Hierarchy

```
+ X3DNode
  + X3DChildNode
    + X3DBindableNode
      + X3DViewpointNode
        + Viewpoint
```

## Fields

### SFNode [in, out] **metadata** NULL <small>[X3DMetadataObject]</small>

Metadata are not part of the X3D world and not interpreted by the X3D browser, but they can be accessed via the ECMAScript interface.

### SFBool [in] **set_bind**

Sending event set_bind=true makes this node active. Sending event set_bind=false makes this node inactive. Thus setting set_bind to true/false will pop/push (enable/disable) this Viewpoint.

### SFString [in, out] **description** ""

Text description or navigation hint to identify this Viewpoint.

#### Hints

Use spaces, make descriptions clear and readable. Many XML tools substitute XML character references automatically if needed (such as &amp;#38; for &amp; ampersand, or &amp;#34; for " quotation mark).

#### Warning

Without description, this Viewpoint is unlikely to appear on browser Viewpoints menu.

### SFVec3f [in, out] **position** 0 0 10 <small>(-∞,∞)</small>

Position (x, y, z in meters) relative to local coordinate system.

### SFRotation [in, out] **orientation** 0 0 1 0 <small>[-1,1],(-∞,∞)</small>

Rotation (axis, angle in radians) of Viewpoint, relative to default -Z axis direction in local coordinate system.

#### Hints

This is orientation \_change\_ from default direction (0 0 -1). Complex rotations can be accomplished axis-by-axis using parent Transforms.

### SFVec3f [in, out] **centerOfRotation** 0 0 0 <small>(-∞,∞)</small>

CenterOfRotation specifies center point about which to rotate user's eyepoint when in EXAMINE or LOOKAT mode.

### SFFloat [in, out] **fieldOfView** 0.7854 <small>(0,π)</small>

Preferred minimum viewing angle from this viewpoint in radians. Small field of view roughly corresponds to a telephoto lens, large field of view roughly corresponds to a wide-angle lens.

#### Hint

Modifying Viewpoint distance to object may be better for zooming.

#### Warning

FieldOfView may not be correct for different window sizes and aspect ratios. Interchange profile hint: this field may be ignored, applying the default value regardless.

### SFBool [in, out] **jump** TRUE

Transition instantly by jumping, or smoothly adjust offsets in place when changing to this Viewpoint.

#### Hint

Set jump=true for smooth camera motion when going to this viewpoint.

### SFBool [in, out] **retainUserOffsets** FALSE

Retain (true) or reset to zero (false) any prior user navigation offsets from defined viewpoint position, orientation.

### SFBool [out] **isBound**

Event true sent when node becomes active, event false sent when unbound by another node.

### SFTime [out] **bindTime**

Event sent when node becomes active/inactive.

## Description

### Hint

- NavigationInfo, Background, TextureBackground, Fog, OrthoViewpoint and Viewpoint are bindable nodes, meaning that no more than one of each node type can be active at a given time.

Warning
-------

- Do not include Viewpoint or OrthoViewpoint as a child of LOD or Switch, instead use ViewpointGroup as parent to constrain location proximity where the viewpoint is available to user.

## Example

<x3d-canvas src="https://create3000.github.io/media/examples/Navigation/Viewpoint/Viewpoint.x3d"></x3d-canvas>

## External Links

- [X3D Specification of Viewpoint](https://www.web3d.org/documents/specifications/19775-1/V4.0/Part01/components/navigation.html#Viewpoint){:target="_blank"}
- [X3D Scene Authoring Hints, Viewpoints](https://www.web3d.org/x3d/content/examples/X3dSceneAuthoringHints.html#Viewpoints){:target="_blank"}