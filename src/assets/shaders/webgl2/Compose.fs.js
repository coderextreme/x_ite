export default /* glsl */ `#version 300 es

precision highp float;
precision highp int;
precision highp sampler2D;

uniform sampler2D x3d_AccumRevealageTexture;
uniform sampler2D x3d_AlphaTexture;

out vec4 x3d_FragColor;

void
main ()
{
   ivec2 fragCoord = ivec2 (gl_FragCoord .xy);
   vec4  accum     = texelFetch (x3d_AccumRevealageTexture, fragCoord, 0);
   float alpha     = texelFetch (x3d_AlphaTexture,          fragCoord, 0) .r;
   float revealage = 1.0 - accum .a;

   x3d_FragColor = vec4 (revealage * accum .rgb / clamp (alpha, 0.001, 50000.0), revealage);
}
`;
