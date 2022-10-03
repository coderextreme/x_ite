in vec4 x3d_Particle;
in mat4 x3d_ParticleMatrix;

uniform sampler2D x3d_TexCoordRamp;

vec4
texelFetch (const in sampler2D sampler, const in int index, const in int lod)
{
   int   x = textureSize (sampler, lod) .x;
   ivec2 p = ivec2 (index % x, index / x);
   vec4  t = texelFetch (sampler, p, lod);

   return t;
}

vec4
getVertex (const in vec4 vertex)
{
   if (x3d_Particle [0] == 0.0)
      return vertex;

   return x3d_ParticleMatrix * vertex;
}

vec4
getTexCoord (const in vec4 texCoord)
{
   int index0 = int (x3d_Particle [3]);

   if (x3d_Particle [0] == 0.0 || index0 == -1)
      return texCoord;

   const int map [6] = int [6] (0, 1, 2, 0, 2, 3);

   return texelFetch (x3d_TexCoordRamp, index0 + map [gl_VertexID % 6], 0);
}
