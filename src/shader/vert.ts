export const vert = /* wgsl */ `
struct Uniforms {
  mvp: mat4x4f,
  model: mat4x4f,
};

struct VertexInput {
  @location(0) position: vec3f,
  @location(1) color: vec3f,
  @location(2) normal: vec3f,
};

struct VertexOutput {
  @builtin(position) position: vec4f,
  @location(0) color: vec3f,
  @location(1) normal: vec3f,
  @location(2) worldPos: vec3f,
};

@group(0) @binding(0) var<uniform> u: Uniforms;

@vertex
fn main(input: VertexInput) -> VertexOutput {
  var output: VertexOutput;
  let worldPos4 = u.model * vec4f(input.position, 1.0);
  output.position = u.mvp * vec4f(input.position, 1.0);
  output.color = input.color;
  output.normal = normalize((u.model * vec4f(input.normal, 0.0)).xyz);
  output.worldPos = worldPos4.xyz;
  return output;
}
`
