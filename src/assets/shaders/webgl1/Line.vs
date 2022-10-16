
precision highp float;
precision highp int;

uniform bool x3d_ColorMaterial;   // true if a X3DColorNode is attached, otherwise false
uniform x3d_UnlitMaterialParameters x3d_Material;

uniform mat4 x3d_ProjectionMatrix;
uniform mat4 x3d_ModelViewMatrix;

attribute float x3d_FogDepth;
attribute vec4  x3d_TexCoord0;
attribute vec4  x3d_Color;
attribute vec4  x3d_Vertex;

varying vec2  startPoint;  // in px, stipple support
varying float lengthSoFar; // in px, stipple support
varying float fogDepth;    // fog depth
varying vec4  color;       // color
varying vec3  vertex;      // point on geometry

#ifdef X3D_LOGARITHMIC_DEPTH_BUFFER
varying float depth;
#endif

void
main ()
{
   vec4 position = x3d_ModelViewMatrix * x3d_Vertex;

   startPoint  = x3d_TexCoord0 .xy;
   lengthSoFar = x3d_TexCoord0 .z;
   fogDepth    = x3d_FogDepth;
   vertex      = position .xyz;

   gl_Position = x3d_ProjectionMatrix * position;

   #ifdef X3D_LOGARITHMIC_DEPTH_BUFFER
   depth = 1.0 + gl_Position .w;
   #endif

   float alpha = 1.0 - x3d_Material .transparency;

   if (x3d_ColorMaterial)
   {
      color .rgb = x3d_Color .rgb;
      color .a   = x3d_Color .a * alpha;
   }
   else
   {
      color .rgb = x3d_Material .emissiveColor;
      color .a   = alpha;
   }
}
