struct VertexOutput {
  // @builtin(position) をバーテックスの出力にも含めます
  @builtin(position) position: vec4f,
  @location(0) uv: vec2f,
};

@vertex
fn vs_main(@builtin(vertex_index) vertexIndex: u32) -> VertexOutput {
  var output: VertexOutput;
  var pos = vec2f(0.0, 0.0);
  if (vertexIndex == 0u) { pos = vec2f(-1.0, -1.0); }
  if (vertexIndex == 1u) { pos = vec2f(3.0, -1.0); }
  if (vertexIndex == 2u) { pos = vec2f(-1.0, 3.0); }
  
  output.position = vec4f(pos, 0.0, 1.0);
  output.uv = pos * 0.5 + 0.5;
  return output;
}

struct AudioData {
  frequencies: array<vec4f, 16>, // 256要素
};

@group(0) @binding(0) var<uniform> audio: AudioData;
// 元の vec2f に戻します
@group(0) @binding(1) var<uniform> u_info: vec2f; // x: N, y: time

fn hsv2rgb(c: vec3f) -> vec3f {
  let k = vec4f(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
  let p = abs(fract(c.xxx + k.xyz) * 6.0 - k.www);
  return c.z * mix(k.xxx, clamp(p - k.xxx, vec3f(0.0), vec3f(1.0)), c.y);
}

@fragment
fn fs_main(input: VertexOutput) -> @location(0) vec4f {
  let N = u_info.x;
  let time = u_info.y;

  // --- フラグメントシェーダー内だけでアスペクト比を完結させるロジック ---
  let screenWidth = 1.0 / length(vec2f(dpdx(input.uv.x), dpdy(input.uv.x)));
  let screenHeight = 1.0 / length(vec2f(dpdx(input.uv.y), dpdy(input.uv.y)));
  let aspect = screenWidth / screenHeight;

  // 縦のマス数は周波数の分割数 N、横のマス数はアスペクト比を掛けた数
  let gridY_count = N; 
  let gridX_count = N * aspect; 

  // 1. 現在のピクセルが「何番目のマス目（グリッド座標）」にいるかを計算
  let blockX = floor(input.uv.x * gridX_count) / gridX_count;
  let blockY = floor((1.0 - input.uv.y) * gridY_count) / gridY_count;

  // 2. 各マス目の内部でのローカルなUV座標 (0.0 〜 1.0) 
  let localUV = fract(vec2f(input.uv.x * gridX_count, (1.0 - input.uv.y) * gridY_count));

  // 3. 時間（time）に応じてスライド用のオフセットを計算
  let scrollOffset = time * 0.1; 

  // 4. マス目単位（blockY）でスライドとループ処理
  let scrolledY = fract(blockY + scrollOffset);

  // 最初の20%をスキップし、残りの80%の領域を取り出す
  let startOffset = N * 0.1;
  let activeRange = N * 0.6;
  let rawIndex = startOffset + (scrolledY * activeRange);
  let index = u32(clamp(rawIndex, 0.0, N - 1.0));

  // 配列から該当する周波数の強度 (0.0 ～ 1.0) を取り出す
  let vecIndex = index / 4u;
  let componentIndex = index % 4u;
  var intensity = 0.0;
  
  if (componentIndex == 0u) { intensity = audio.frequencies[vecIndex].x; }
  else if (componentIndex == 1u) { intensity = audio.frequencies[vecIndex].y; }
  else if (componentIndex == 2u) { intensity = audio.frequencies[vecIndex].z; }
  else if (componentIndex == 3u) { intensity = audio.frequencies[vecIndex].w; }

  // 5. グリッドの横位置が、強度未満であれば点灯
  var isLit = 0.0;
  if (blockX < intensity) {
    isLit = 1.0;
  }

  // 6. 格子状の黒い境界線（グリッド線）の太さ
  let thickness = 0.12; 
  var gridLine = 1.0;
  if (localUV.x < thickness || localUV.x > (1.0 - thickness) ||
      localUV.y < thickness || localUV.y > (1.0 - thickness)) {
    gridLine = 0.0;
  }

  // --- ★ここを修正★ ---
  // 低音の20%カットを除去した「画面に見えている80%の範囲（scrolledY）」だけで
  // 色相がちょうど1周（0.0 〜 1.0）するように変更します。
  // 1.0を掛けることでぴったり1周になり、時間（time）経過で色が滑らかに回転します。
  let hue = fract(scrolledY * 1.0 + time * 0.05); // blockXを加えて横方向の色変化も追加
  let saturation = 0.32;
  
  let value = mix(0.02, 1.0, isLit);
  var rgb = hsv2rgb(vec3f(hue, saturation, value));

  // グリッドの黒線を合成
  rgb = rgb * gridLine;

  return vec4f(rgb, 1.0);
}
