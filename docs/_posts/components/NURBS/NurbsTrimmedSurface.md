---
title: NurbsTrimmedSurface
date: 2022-01-07
nav: components-NURBS
categories: [components, NURBS]
tags: [NurbsTrimmedSurface, NURBS]
---
<style>
.post h3 {
  word-spacing: 0.2em;
}
</style>

## Overview

NurbsTrimmedSurface generates texture coordinates from a Non-Uniform Rational B-Spline (NURBS) surface.

The NurbsTrimmedSurface node belongs to the **NURBS** component and its container field is *geometry.* It is available since X3D version 3.0 or later.

## Hierarchy

```
+ X3DNode
  + X3DGeometryNode
    + X3DParametricGeometryNode
      + X3DNurbsSurfaceGeometryNode
        + NurbsTrimmedSurface
```

## Fields

### SFNode [in, out] **metadata** NULL <small>[X3DMetadataObject]</small>

Metadata are not part of the X3D world and not interpreted by the X3D browser, but they can be accessed via the ECMAScript interface.

### SFInt32 [in, out] **uTessellation** <small>(-∞,∞)</small>

Hint for surface tesselation.

### SFInt32 [in, out] **vTessellation** <small>(-∞,∞)</small>

Hint for surface tesselation.

### SFBool [ ] **uClosed** FALSE

Whether opposite surface sides are closed (seamless) across u dimension.

### SFBool [ ] **vClosed** FALSE

Whether opposite surface sides are closed (seamless) across u dimension.

### SFBool [ ] **solid** TRUE

Setting solid true means draw only one side of polygons (backface culling on), setting solid false means draw both sides of polygons (backface culling off).

#### Hint

If in doubt, use solid='false' for maximum visibility.

#### Warning

Default value true can completely hide geometry if viewed from wrong side!

### SFInt32 [ ] **uOrder** 3 <small>[2,∞)</small>

Define order of surface by polynomials of degree = order-1.

### SFInt32 [ ] **vOrder** 3 <small>[2,∞)</small>

Define order of surface by polynomials of degree = order-1.

### SFInt32 [ ] **uDimension** <small>[0,∞)</small>

Number of control points in u dimension.

### SFInt32 [ ] **vDimension** <small>[0,∞)</small>

Number of control points in v dimension.

### MFDouble [ ] **uKnot** [ ] <small>(-∞,∞)</small>

Knot vector, where size = number of control points + order of curve.

### MFDouble [ ] **vKnot** [ ] <small>(-∞,∞)</small>

Knot vector, where size = number of control points + order of curve.

### MFDouble [in, out] **weight** [ ] <small>(0,∞)</small>

Vector assigning relative weight value to each control point.

### SFNode [in, out] **texCoord** NULL <small>[X3DTextureCoordinateNode|NurbsTextureCoordinate]</small>

Input/Output field texCoord.

### SFNode [in, out] **controlPoint** NULL <small>[X3DCoordinateNode]</small>

Input/Output field controlPoint.

### MFNode [in] **addTrimmingContour**

Input field addTrimmingContour.

### MFNode [in] **removeTrimmingContour**

Input field removeTrimmingContour.

### MFNode [in, out] **trimmingContour** [ ] <small>[Contour2D]</small>

Input/Output field trimmingContour.

## External Links

- [X3D Specification of NurbsTrimmedSurface](https://www.web3d.org/documents/specifications/19775-1/V4.0/Part01/components/nurbs.html#NurbsTrimmedSurface){:target="_blank"}