/**
 * 4x4行列の掛け算を行う関数
 * @param a - 4x4行列を表すFloat32Array
 * @param b - 4x4行列を表すFloat32Array
 * @returns aとbの掛け算の結果を表す4x4行列をFloat32Arrayで返す
 */
export function mat4Multiply(a: Float32Array, b: Float32Array) {
  const out = new Float32Array(16)
  for (let col = 0; col < 4; col += 1) {
    for (let row = 0; row < 4; row += 1) {
      out[col * 4 + row]
        = a[0 * 4 + row] * b[col * 4 + 0]
          + a[1 * 4 + row] * b[col * 4 + 1]
          + a[2 * 4 + row] * b[col * 4 + 2]
          + a[3 * 4 + row] * b[col * 4 + 3]
    }
  }
  return out
}

/**
 * 透視投影行列を作成する関数
 * @param fovY - 視野角（ラジアン）
 * @param aspect - アスペクト比（画面の幅 / 高さ）
 * @param near - ニアクリップ面の距離
 * @param far - ファークリップ面の距離
 * @returns 透視投影行列を表す4x4行列をFloat32Arrayで返す
 */
export function mat4Perspective(fovY: number, aspect: number, near: number, far: number): Float32Array {
  const f = 1.0 / Math.tan(fovY * 0.5)
  const out = new Float32Array(16)
  out[0] = f / aspect
  out[5] = f
  out[10] = far / (near - far)
  out[11] = -1
  out[14] = (far * near) / (near - far)
  return out
}

/**
 * 拡大縮小行列を作成する関数
 * @param sx - X軸方向の拡大縮小率
 * @param sy - Y軸方向の拡大縮小率
 * @param sz - Z軸方向の拡大縮小率
 * @returns 拡大縮小行列を表す4x4行列をFloat32Arrayで返す
 */
export function mat4Scale(sx: number, sy: number, sz: number): Float32Array {
  return new Float32Array([
    sx,
    0,
    0,
    0,
    0,
    sy,
    0,
    0,
    0,
    0,
    sz,
    0,
    0,
    0,
    0,
    1,
  ])
}

/**
 * 四元数から回転行列を作成する関数
 * @param q - 回転を表す四元数をFloat32Arrayで渡す（x, y, z, wの順番）
 * @returns 回転行列を表す4x4行列をFloat32Arrayで返す
 */
export function mat4RotationQuaternion(q: Float32Array): Float32Array {
  const x = q[0]
  const y = q[1]
  const z = q[2]
  const w = q[3]

  return new Float32Array([
    1 - 2 * (y * y + z * z),
    2 * (x * y + w * z),
    2 * (x * z - w * y),
    0,
    2 * (x * y - w * z),
    1 - 2 * (x * x + z * z),
    2 * (y * z + w * x),
    0,
    2 * (x * z + w * y),
    1 - 2 * (x * x + y * y),
    0,
    0,
    0,
    0,
    1,
  ])
}

/**
 * 物体を回転させるための行列を作成する関数（X軸回転）
 * @param rad - 回転角度（ラジアン）
 * @returns X軸回転行列を表す4x4行列をFloat32Arrayで返す
 */
export function mat4RotationX(rad: number): Float32Array {
  const c = Math.cos(rad)
  const s = Math.sin(rad)
  return new Float32Array([
    1,
    0,
    0,
    0,
    0,
    c,
    s,
    0,
    0,
    -s,
    c,
    0,
    0,
    0,
    0,
    1,
  ])
}

/**
 * 物体を回転させるための行列を作成する関数（Y軸回転）
 * @param rad - 回転角度（ラジアン）
 * @returns Y軸回転行列を表す4x4行列をFloat32Arrayで返す
 */
export function mat4RotationY(rad: number): Float32Array {
  const c = Math.cos(rad)
  const s = Math.sin(rad)
  return new Float32Array([
    c,
    0,
    -s,
    0,
    0,
    1,
    0,
    0,
    s,
    0,
    c,
    0,
    0,
    0,
    0,
    1,
  ])
}

/**
 * 物体を回転させるための行列を作成する関数（Z軸回転）
 * @param rad - 回転角度（ラジアン）
 * @returns Z軸回転行列を表す4x4行列をFloat32Arrayで返す
 */
export function mat4RotationZ(rad: number): Float32Array {
  const c = Math.cos(rad)
  const s = Math.sin(rad)
  return new Float32Array([
    c,
    s,
    0,
    0,
    -s,
    c,
    0,
    0,
    0,
    0,
    1,
    0,
    0,
    0,
    0,
    1,
  ])
}

/**
 * 物体を平行移動させるための行列を作成する関数
 * @param x - X軸方向の移動量
 * @param y - Y軸方向の移動量
 * @param z - Z軸方向の移動量
 * @returns 平行移動行列を表す4x4行列をFloat32Arrayで返す
 */
export function mat4Translation(x: number, y: number, z: number): Float32Array {
  return new Float32Array([
    1,
    0,
    0,
    0,
    0,
    1,
    0,
    0,
    0,
    0,
    1,
    0,
    x,
    y,
    z,
    1,
  ])
}
