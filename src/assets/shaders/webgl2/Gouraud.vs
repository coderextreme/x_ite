#version 300 es

precision highp float;
precision highp int;
precision highp sampler2D;
precision highp sampler3D;
precision highp samplerCube;

#pragma X3D include "include/Vertex.glsl"
#pragma X3D include "include/Material.glsl"

uniform bool x3d_ColorMaterial;

out vec4 frontColor;

#if ! defined (X3D_GEOMETRY_0D) && ! defined (X3D_GEOMETRY_1D)
   out vec4 backColor;
#endif

vec4
getMaterialColor (const in vec3 N,
                  const in vec3 vertex,
                  const in x3d_MaterialParameters material)
{
   #if defined (X3D_NORMALS)
      float alpha            = 1.0 - x3d_Material .transparency;
      vec4  diffuseParameter = x3d_ColorMaterial ? vec4 (x3d_Color .rgb, x3d_Color .a * alpha) : vec4 (material .diffuseColor, alpha);
      vec3  ambientColor     = diffuseParameter .rgb * material .ambientIntensity;
      vec3  finalColor       = getMaterialColor (vertex, N, ambientColor, diffuseParameter .rgb, material .specularColor, material .shininess);

      finalColor += material .emissiveColor;

      return vec4 (finalColor, diffuseParameter .a);
   #else
      float alpha      = 1.0 - material .transparency;
      vec3  finalColor = vec3 (0.0);

      if (x3d_ColorMaterial)
      {
         finalColor  = color .rgb;
         alpha      *= color .a;
      }
      else
      {
         finalColor = material .emissiveColor;
      }

      return vec4 (finalColor, alpha);
   #endif
}

void
main ()
{
   vertex_main ();

   normal     = normalize (normal);
   frontColor = getMaterialColor (normal, vertex, x3d_Material);

   #if ! defined (X3D_GEOMETRY_0D) && ! defined (X3D_GEOMETRY_1D)
      backColor = getMaterialColor (-normal, vertex, x3d_Material);
   #endif
}
