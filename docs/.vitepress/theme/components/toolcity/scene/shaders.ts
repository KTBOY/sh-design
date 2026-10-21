export const BUILDING_VERTEX = /* glsl */ `
attribute float aSeed;
attribute float aTone;
attribute float aZone;

varying vec3 vWorldPos;
varying vec3 vNormalW;
varying vec3 vSize;
varying vec3 vViewDir;
varying float vBase;
varying float vSeed;
varying float vTone;
varying float vZone;

#include <fog_pars_vertex>

void main() {
  vec3 iScale = vec3(
    length(instanceMatrix[0].xyz),
    length(instanceMatrix[1].xyz),
    length(instanceMatrix[2].xyz)
  );
  vSize = iScale;
  vBase = instanceMatrix[3].y - iScale.y * 0.5;
  vSeed = aSeed;
  vTone = aTone;
  vZone = aZone;

  vec4 worldPos = modelMatrix * instanceMatrix * vec4(position, 1.0);
  vWorldPos = worldPos.xyz;
  vNormalW = normalize(mat3(modelMatrix) * mat3(instanceMatrix) * normal);
  vViewDir = normalize(cameraPosition - worldPos.xyz);

  vec4 mvPosition = viewMatrix * worldPos;
  gl_Position = projectionMatrix * mvPosition;
  #include <fog_vertex>
}
`

export const BUILDING_FRAGMENT = /* glsl */ `
uniform vec3 uWall;
uniform vec3 uGlass;
uniform vec3 uLit;
uniform vec3 uRoof;
uniform vec3 uFrame;
uniform vec3 uSky;
uniform float uLitChance;
uniform vec3 uTintA;
uniform vec3 uTintB;
uniform float uActiveZone;
uniform float uActiveMix;
uniform float uGroupSplit;

varying vec3 vWorldPos;
varying vec3 vNormalW;
varying vec3 vSize;
varying vec3 vViewDir;
varying float vBase;
varying float vSeed;
varying float vTone;
varying float vZone;

#include <fog_pars_fragment>

float hash21(vec2 p) {
  p = fract(p * vec2(127.31, 311.7));
  p += dot(p, p + 34.77);
  return fract(p.x * p.y);
}

void main() {
  vec3 n = normalize(vNormalW);
  float up = step(0.5, n.y);
  vec3 col = uRoof;

  float faceW = abs(n.x) > 0.5 ? vSize.z : vSize.x;
  float u = (abs(n.x) > 0.5 ? vWorldPos.z : vWorldPos.x) / max(faceW, 0.001) + 0.5;
  float v = (vWorldPos.y - vBase) / max(vSize.y, 0.001);

  float floors = max(1.0, floor(vSize.y / 0.98));
  float bays = max(1.0, floor(faceW / 0.92));
  vec2 cell = vec2(u * bays, v * floors);
  vec2 g = fract(cell);
  vec2 id = floor(cell);

  float win = step(0.2, g.x) * step(g.x, 0.8) * step(0.3, g.y) * step(g.y, 0.82);
  float glassVar = 0.72 + 0.28 * hash21(id + vSeed * 13.0);

  vec3 wall = uWall * vTone;
  float slab = step(0.88, g.y);
  float mull = max(smoothstep(0.9, 1.0, g.x), smoothstep(0.1, 0.0, g.x));

  vec3 facade = wall;
  facade = mix(facade, uGlass, win * (0.58 + 0.22 * glassVar));
  facade = mix(facade, wall * 1.06, slab * (1.0 - win) * 0.9);
  facade = mix(facade, uFrame, mull * (1.0 - win) * 0.62);

  float isActive = step(-0.5, uActiveZone) * step(abs(vZone - uActiveZone), 0.5);
  float focus = isActive * uActiveMix;
  float lit = step(1.0 - uLitChance - focus * 0.16, hash21(id + floor(vSeed * 91.0)));
  facade = mix(facade, uLit, win * lit * 0.5);

  float lobby = 1.0 - step(vBase + 1.05, vWorldPos.y);
  facade = mix(facade, uGlass * 1.12, lobby * 0.55);

  float rise = smoothstep(vBase, vBase + max(vSize.y, 0.001), vWorldPos.y);
  facade *= mix(0.94, 1.02, rise);

  float corner = smoothstep(0.0, 0.055, u) * smoothstep(1.0, 0.945, u);
  facade *= mix(0.82, 1.0, corner);
  facade *= mix(0.9, 1.0, smoothstep(0.0, 0.16, v));

  col = mix(facade, col, up);

  float key = clamp(dot(n, normalize(vec3(0.38, 0.66, 0.65))), 0.0, 1.0);
  col *= mix(0.78, 1.05, key);
  col *= mix(vec3(0.9, 0.94, 1.0), vec3(1.0), clamp(abs(n.z), 0.0, 1.0));

  float fres = pow(1.0 - clamp(dot(n, vViewDir), 0.0, 1.0), 2.6);
  col = mix(col, uSky, fres * 0.2);

  float grp = vZone < 0.0 ? -1.0 : step(uGroupSplit - 0.5, vZone);
  col *= grp < 0.0 ? vec3(1.0) : mix(uTintA, uTintB, max(grp, 0.0));

  col = mix(col, mix(col, uLit, 0.34) * 1.05, focus);
  float dim = uActiveMix * (1.0 - isActive);
  col *= mix(1.0, 0.9, dim);
  col = mix(col, uSky, dim * 0.18);

  float ao = smoothstep(0.0, 2.4, vWorldPos.y);
  col *= mix(0.9, 1.0, ao);

  gl_FragColor = vec4(col, 1.0);
  #include <colorspace_fragment>
  #include <fog_fragment>
}
`

export const GROUND_VERTEX = /* glsl */ `
varying vec3 vWorldPos;

#include <fog_pars_vertex>

void main() {
  vec4 worldPos = modelMatrix * vec4(position, 1.0);
  vWorldPos = worldPos.xyz;
  vec4 mvPosition = viewMatrix * worldPos;
  gl_Position = projectionMatrix * mvPosition;
  #include <fog_vertex>
}
`

export const GROUND_FRAGMENT = /* glsl */ `
uniform vec3 uNear;
uniform vec3 uFar;

varying vec3 vWorldPos;

#include <fog_pars_fragment>

float hash21(vec2 p) {
  p = fract(p * vec2(211.83, 329.17));
  p += dot(p, p + 27.13);
  return fract(p.x * p.y);
}

void main() {
  float d = clamp(length(vWorldPos.xz) / 240.0, 0.0, 1.0);
  vec3 col = mix(uNear, uFar, d);
  col *= 0.988 + 0.024 * hash21(floor(vWorldPos.xz * 1.6));
  gl_FragColor = vec4(col, 1.0);
  #include <colorspace_fragment>
  #include <fog_fragment>
}
`
