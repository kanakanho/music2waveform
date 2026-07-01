export const frag = /* wgsl */ `
override isUnlit: bool = false;         // ライティング計算を飛ばすか
override metallic: f32 = 1.0;           // 金属感の強さ
override shininess: f32 = 96.0;         // 鏡面反射の鋭さ (スペキュラ指数)
override ambientIntensity: f32 = 0.12;  // 環境光の強さ

@fragment
fn main(
  @location(0) color: vec3f,
  @location(1) normal: vec3f,
  @location(2) worldPos: vec3f,
) -> @location(0) vec4f {
  // 1. Unlit（ライティングなし）の早期リターン
  if (isUnlit) {
    return vec4f(color, 1.0);
  }

  let n = normalize(normal);
  let lightDir = normalize(vec3f(0.6, 1.0, 0.5));
  let viewDir = normalize(-worldPos);
  let halfDir = normalize(lightDir + viewDir);

  let ndotl = max(dot(n, lightDir), 0.0);

  // 2. 指数(96.0)をoverride変数に変更
  let spec = pow(max(dot(n, halfDir), 0.0), shininess);

  let diffuse = 0.45 * ndotl;
  let specular = 1.2 * spec;

  // 3. 金属光沢のブレンド（metallic 0.0で元の色、1.0で金属色）
  let baseMetal = mix(color, color * vec3f(0.55, 0.58, 0.62), metallic);
  
  let litColor = baseMetal * (ambientIntensity + diffuse) + vec3f(specular);
  return vec4f(litColor, 1.0);
}
`
