---
title: Building a X3D World
date: 2022-11-28
nav: tutorials-shapes-geometry-and-appearance
categories: [Tutorials]
tags: [building, world]
---
## X3D file structure

X3D files contain:

- The file header
- Comments - notes to yourself
- Nodes - nuggets of scene information
- Fields - node attributes you can change
- Values - attribute values
- Routes - connections between fields
- more ...

## A sample X3D file

### XML Encoding

```xml
<?xml version="1.0" encoding="UTF-8"?>

<X3D profile='Full' version='3.3' xmlns:xsd='http://www.w3.org/2001/XMLSchema-instance' xsd:noNamespaceSchemaLocation='http://www.web3d.org/specifications/x3d-3.3.xsd'>
  <Scene>
  <!-- A Cylinder -->
  <Shape>
    <Appearance>
      <Material/>
    <Appearance>
    <Cylinder
        height='2.0'
        radius='1.5'/>
    </Shape>
  </Scene>
</X3D>
```

### Classic Encoding

```js
#X3D V3.3 utf8
# A Cylinder
Shape {
  appearance Appearance {
    material Material { }
  }
  geometry Cylinder {
    height 2.0
    radius 1.5
  }
}
```

### Example

<x3d-canvas src="https://create3000.github.io/media/tutorials/scenes/cylinder1/cylinder1.x3dv">
  <img src="https://create3000.github.io/media/tutorials/scenes/cylinder1/screenshot.png" alt="Cylinder"/>
</x3d-canvas>

[Download ZIP Archive](https://create3000.github.io/media/tutorials/scenes/cylinder1/cylinder1.zip)

## Understanding the header

**\#X3D V3.3 utf8**

- **\#X3D:** File contains X3D text
- **V3.3 :** Text conforms to version 3.3 syntax
- **utf8 :** Text uses UTF8 character set

## Understanding UTF8

- utf8 is an international character set standard
- utf8 stands for:
  - UCS (Universal Character Set) Transformation Format, 8-bit
  - Can encodes up to 2,164,864 characters for many languages
  - ASCII is a subset

## Using comments

```js
# A Cylinder
```

- Comments start with a number-sign (**\#**) and extend to the end of the line

## Using nodes

### XML Encoding

```xml
<Cylinder/>
```

### Classic Encoding

```js
Cylinder {
}
```

- Nodes describe shapes, lights, sounds, etc.
- Every node has:
  - A node type ([Shape](https://www.web3d.org/documents/specifications/19775-1/V3.3/Part01/components/shape.html#Shape), [Cylinder](https://www.web3d.org/documents/specifications/19775-1/V3.3/Part01/components/geometry3D.html#Cylinder), etc.)
  - A pair of curly-braces
  - Zero or more fields inside the curly-braces

## Using node type names

Node type names are case sensitive:

- Each word starts with an upper-case character
- The rest of the word is lower-case

Some examples:

[Appearance](https://www.web3d.org/documents/specifications/19775-1/V3.3/Part01/components/shape.html#Appearance), [Cylinder](https://www.web3d.org/documents/specifications/19775-1/V3.3/Part01/components/geometry3D.html#Cylinder), [Material](https://www.web3d.org/documents/specifications/19775-1/V3.3/Part01/components/shape.html#Material), [Shape](https://www.web3d.org/documents/specifications/19775-1/V3.3/Part01/components/shape.html#Shape)

## Using fields and values

### XML Encoding

```xml
<Cylinder
    height='2.0'
    radius='1.5'/>
```

### Classic Encoding

```js
Cylinder {
  height 2.0
  radius 1.5
}
```

- Fields describe node attributes

Every field has:

- A field name (height, radius, etc.)
- A data type (float, integer, etc.)
- A default value
- Different node types have different fields
- Fields are optional
  - A default value is used if a field is not given
- Fields can be listed in any order
  - The order doesn't affect the node

## Summary

- The file header gives the version and encoding
- Nodes describe scene content
- Fields and values specify node attributes
- Everything is case sensitive
