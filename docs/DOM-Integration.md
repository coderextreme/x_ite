---
# Feel free to add content and custom Front Matter to this file.
# To modify the layout, see https://jekyllrb.com/docs/themes/#overriding-theme-defaults

layout: single
---
# DOM Integration

## Overview

DOM integration allows you to integrate 3D content seamlessly into your web page, with just a JavaScript file included the scene can be written directly into the XHTML or HTML markup.

Andreas Plesch wrote a nice plug-in for X3D DOM integration. This enables JavaScript authors to use X3D content as if it would be HTML. It links the X3D DOM nodes to the X3D scene graph and thereby allows for control of the X3D scene using regular DOM manipulation methods.

**HTML DOM integration is available by default now.**

## How use with X_ITE

Create an HTML or XHTML page and save it, include the »x_ite.min.js«. Now, X3D content can directly be written within the \<x3d-canvas\> element and regular DOM manipulation methods can be used to manipulate the scene graph. This gives X3D authors the ability to combine HTML with X3D. The example below will show a simple Box node in the \<x3d-canvas\> element.

### Example

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8"/>
    <script src="https://create3000.github.io/code/x_ite/latest/x_ite.min.js"></script>
    <style>
x3d-canvas {
  width: 768px;
  height: 432px;
}
    </style>
    <script>
window .addEventListener ('load', function ()
{
  const
    touchSensor = document .querySelector ('TouchSensor'),
    hitPoint    = document .querySelector ('#hitPoint');

  touchSensor .addEventListener ('hitPoint_changed', function (event)
  {
    hitPoint .textContent = event .detail .value;
  });
});
    </script>
  </head>
  <body>
    <x3d-canvas>
      <X3D profile='Interactive' version='4.0'>
         <Scene>
            <Background
                skyColor='0.2 0.2 0.2'>
            </Background>
            <Viewpoint
                position='4.75079 5.5764 6.80689'
                orientation='-0.67979594907481 0.70155548858341 0.2137694179717 0.842769006819'>
            </Viewpoint>
            <TouchSensor
                description='Box Geometry'>
            </TouchSensor>
            <Shape>
               <Appearance>
                  <Material
                      diffuseColor='0 0.5 1'>
                    <PixelTexture
                        containerField='diffuseTexture'
                        image='2 2 1 0xff 0x00 0x00 0xff'>
                      <TextureProperties
                          boundaryModeS='CLAMP_TO_EDGE'
                          boundaryModeT='CLAMP_TO_EDGE'>
                      </TextureProperties>
                    </PixelTexture>
                  </Material>
               </Appearance>
               <Box></Box>
            </Shape>
         </Scene>
      </X3D>
    </x3d-canvas>
    <p>TouchSensor.hitPoint_changed: <span id="hitPoint"></span></p>
  </body>
</html>
```

## Attributes

If you change an attribute of an X3D element, then the internal state of the node will also change.

```js
const material = document .querySelector ('Material')

material .setAttribute ('diffuseColor', '1 0 0'); // Set diffuse color to red.
```

## Events

You can add a event listener to any X3D element with the name of the output field you want to listen to. If the field has changed an event will occur.

Events send from a node are of type CustomEvent and have the following properties:

```js
{
  type: string,   // name of field
  detail: {
    node: SFNode, // node to which the field belongs to
    value: any,   // new value of field
  }
}
```

## Add and Remove Nodes

The contents of the X3D scene can be modified with DOM manipulation methods to change the scene. You can add and remove nodes to build your own scene.

```js
function addBlueBox ()
{
  const
    scene      = document .querySelector ('Scene'),
    transform  = document .createElement ('Transform'),
    shape      = document .createElement ('Shape'),
    appearance = document .createElement ('Appearance'),
    material   = document .createElement ('Material'),
    box        = document .createElement ('Box');

  transform .setAttribute ('id',           'BlueBox');
  transform .setAttribute ('scale',        '3 5 8');
  material  .setAttribute ('diffuseColor', '0 0.5 1')

  transform  .appendChild (shape);
  shape      .appendChild (appearance);
  shape      .appendChild (box);
  appearance .appendChild (material);
  scene      .appendChild (transform);
}

function removeBlueBox ()
{
  const transform = document .querySelector ('#BlueBox');

  transform .remove ();
}
```

## Inline Nodes

Even the contents of Inline nodes can be accessed and modified. The internal scene of the Inline node is attached to the Inline element as child every time the Inline node is completely loaded. To check if an Inline node is loaded use a LoadSensor node.

```html
<x3d-canvas>
  <X3D profile='Interactive' version='4.0'>
    <Scene>
      <!-- Be aware of the double quotes inside the single quotes of the url attribute, because it is an MFString field. -->
      <Inline DEF='DeerInline'
          url='"Deer.x3d"'>
      </Inline>
      <LoadSensor>
        <Inline USE='DeerInline'></Inline>
      </LoadSensor>
    </Scene>
  </X3D>
</x3d-canvas>
```

Assuming there is a Transform node with 'DEF' name 'Deer' inside the loaded scene 'Deer.x3d', the Transform can be accessed when the Inline is loaded. You should listen to the LoadSensor node's *loadTime* or *isLoaded* field to get informed when this will happen.

```js
const transform = document .querySelector ('[DEF=DeerInline] [DEF=Deer]');
```

## Add and Remove Routes

As well as nodes, routes can also be added and removed using DOM manipulation methods.

```js
function addRoute ()
{
  const
    scene = document .querySelector ('Scene'),
    route = document .createElement ('ROUTE');

  // Connect a TimeSensor node to a ScalarInterpolator node.

  route .setAttribute ('id',        'route1');
  route .setAttribute ('fromNode',  'Timer1');
  route .setAttribute ('fromField', 'fraction_changed');
  route .setAttribute ('toNode',    'Interpolator1');
  route .setAttribute ('toField',   'set_fraction');

  scene .appendChild (route);
}

function removeRoute ()
{
  const route = document .querySelector ("#route1");

  route .remove ();
}
```

## See Also

 * [X3D Encoding : XML](https://www.web3d.org/documents/specifications/19776-1/V3.3/index.html)
* [X3D Abstract : Node Definitions](https://www.web3d.org/content/x3d-v40-abstract-specification)
