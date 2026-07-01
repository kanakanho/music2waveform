import { mat4Multiply, mat4Perspective, mat4RotationX, mat4RotationY, mat4RotationZ, mat4Scale, mat4Translation } from './math/mat'
import shaderSource from './shader/shader.wgsl?raw'

function buildRenderBundle(
  gpuDevice: GPUDevice,
  pipeline: GPURenderPipeline,
  presentationFormat: GPUTextureFormat,
  multiSampleCount: number,
  uniformBindGroup: GPUBindGroup,
  vertexBuffer: GPUBuffer,
  indexBuffer: GPUBuffer,
  indexCount: number,
): GPURenderBundle {
  const renderBundleDescriptor: GPURenderBundleEncoderDescriptor = {
    colorFormats: [presentationFormat],
    depthStencilFormat: 'depth24plus',
    sampleCount: multiSampleCount,
  }

  const encoder = gpuDevice.createRenderBundleEncoder(renderBundleDescriptor)
  encoder.setPipeline(pipeline)
  encoder.setBindGroup(0, uniformBindGroup)
  encoder.setVertexBuffer(0, vertexBuffer)
  encoder.setIndexBuffer(indexBuffer, 'uint16')
  encoder.drawIndexed(indexCount)
  return encoder.finish()
}

export default function template(
  canvas: HTMLCanvasElement,
  gpuDevice: GPUDevice,
  context: GPUCanvasContext,
  presentationFormat: GPUTextureFormat,
) {
  const multiSampleCount = 4

  const shaderModule = gpuDevice.createShaderModule({ code: shaderSource })

  // レンダリングパイプラインの作成
  const pipeline = gpuDevice.createRenderPipeline({
    layout: 'auto',
    vertex: {
      module: shaderModule,
      entryPoint: 'vs_main',
      /**
       * 頂点バッファのレイアウトを定義する
       * arrayStride: 各頂点のデータサイズ（今回は位置3 + 色3 + 法線3 = 9要素 * 4バイト = 36バイト）
       * attributes: 各頂点属性の場所、オフセット、フォーマットを定義する
       * shaderLocation: シェーダー内での属性の場所（@location(n)と対応させる）
       * offset: 頂点データ内での属性の開始位置（位置は0、色は12、法線は24バイト目から）
       * format: データのフォーマット（float32x3は3要素の32ビット浮動小数点数）
       *
       * ```wgsl
       * struct VertexInput {
       *   @location(0) position: vec3f,  // ←これに対応
       *   @location(1) color: vec3f,     // ←これに対応
       *   @location(2) normal: vec3f,    // ←これに対応
       * };
       * ```
       */
      buffers: [
        {
          arrayStride: 36,
          attributes: [
            { shaderLocation: 0, offset: 0, format: 'float32x3' },
            { shaderLocation: 1, offset: 12, format: 'float32x3' },
            { shaderLocation: 2, offset: 24, format: 'float32x3' },
          ],
        },
      ],
    },
    fragment: {
      module: shaderModule,
      entryPoint: 'fs_main',
      /**
       * シェーダー内のoverride変数に定数を渡す
       * ```wgsl
       * override isUnlit: bool = false;         // ライティング計算を飛ばすか
       * override metallic: f32 = 1.0;           // 金属感の強さ
       * override shininess: f32 = 96.0;         // 鏡面反射の鋭さ (スペキュラ指数)
       * override ambientIntensity: f32 = 0.12;  // 環境光の強さ
       * ```
       */
      constants: {
        isUnlit: 0,
        metallic: 0.0,
        shininess: 96.0,
        ambientIntensity: 0.12,
      },
      targets: [{ format: presentationFormat }],
    },
    primitive: {
      topology: 'triangle-list',
      cullMode: 'back',
    },
    depthStencil: {
      format: 'depth24plus',
      depthWriteEnabled: true,
      depthCompare: 'less',
    },
    multisample: {
      count: multiSampleCount,
    },
  })

  // 頂点データの作成
  // [位置(xyz), 色(rgb), 法線(xyz)] を各頂点ごとに36バイトで格納
  const vertices = new Float32Array([
    -1,
    -1,
    1,
    1,
    0.2,
    0.2,
    0,
    0,
    1,
    1,
    -1,
    1,
    1,
    0.2,
    0.2,
    0,
    0,
    1,
    1,
    1,
    1,
    1,
    0.2,
    0.2,
    0,
    0,
    1,
    -1,
    1,
    1,
    1,
    0.2,
    0.2,
    0,
    0,
    1,

    1,
    -1,
    -1,
    0.2,
    1,
    0.2,
    0,
    0,
    -1,
    -1,
    -1,
    -1,
    0.2,
    1,
    0.2,
    0,
    0,
    -1,
    -1,
    1,
    -1,
    0.2,
    1,
    0.2,
    0,
    0,
    -1,
    1,
    1,
    -1,
    0.2,
    1,
    0.2,
    0,
    0,
    -1,

    -1,
    -1,
    -1,
    0.2,
    0.2,
    1,
    -1,
    0,
    0,
    -1,
    -1,
    1,
    0.2,
    0.2,
    1,
    -1,
    0,
    0,
    -1,
    1,
    1,
    0.2,
    0.2,
    1,
    -1,
    0,
    0,
    -1,
    1,
    -1,
    0.2,
    0.2,
    1,
    -1,
    0,
    0,

    1,
    -1,
    1,
    1,
    1,
    0.2,
    1,
    0,
    0,
    1,
    -1,
    -1,
    1,
    1,
    0.2,
    1,
    0,
    0,
    1,
    1,
    -1,
    1,
    1,
    0.2,
    1,
    0,
    0,
    1,
    1,
    1,
    1,
    1,
    0.2,
    1,
    0,
    0,

    -1,
    1,
    1,
    1,
    0.2,
    1,
    0,
    1,
    0,
    1,
    1,
    1,
    1,
    0.2,
    1,
    0,
    1,
    0,
    1,
    1,
    -1,
    1,
    0.2,
    1,
    0,
    1,
    0,
    -1,
    1,
    -1,
    1,
    0.2,
    1,
    0,
    1,
    0,

    -1,
    -1,
    -1,
    0.2,
    1,
    1,
    0,
    -1,
    0,
    1,
    -1,
    -1,
    0.2,
    1,
    1,
    0,
    -1,
    0,
    1,
    -1,
    1,
    0.2,
    1,
    1,
    0,
    -1,
    0,
    -1,
    -1,
    1,
    0.2,
    1,
    1,
    0,
    -1,
    0,
  ])

  // インデックスデータの作成
  // 頂点の順番を指定して、三角形を構成する
  // 0,1,2 と 0,2,3 で最初の面を作る。これを6面分繰り返す。
  const indices = new Uint16Array([
    0,
    1,
    2,
    0,
    2,
    3,
    4,
    5,
    6,
    4,
    6,
    7,
    8,
    9,
    10,
    8,
    10,
    11,
    12,
    13,
    14,
    12,
    14,
    15,
    16,
    17,
    18,
    16,
    18,
    19,
    20,
    21,
    22,
    20,
    22,
    23,
  ])

  // 頂点バッファの作成
  const vertexBuffer = gpuDevice.createBuffer({
    size: vertices.byteLength,
    usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
  })
  gpuDevice.queue.writeBuffer(vertexBuffer, 0, vertices)

  // インデックスバッファの作成
  const indexBuffer = gpuDevice.createBuffer({
    size: indices.byteLength,
    usage: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST,
  })
  gpuDevice.queue.writeBuffer(indexBuffer, 0, indices)

  // ユニフォームバッファの作成
  // UniformBuffer はシェーダー上でアクセスできる読み取り専用のメモリ領域
  const uniformBuffer = gpuDevice.createBuffer({
    size: 128,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  })

  // バインドグループの作成
  // BindGroup はシェーダーのリソース（バッファやテクスチャ）をパイプラインに結びつけるためのオブジェクト
  const uniformBindGroup = gpuDevice.createBindGroup({
    layout: pipeline.getBindGroupLayout(0),
    entries: [{ binding: 0, resource: { buffer: uniformBuffer } }],
  })

  // MSAA（マルチサンプルアンチエイリアシング）のための設定
  const msaaTexture = gpuDevice.createTexture({
    size: [canvas.width, canvas.height],
    sampleCount: multiSampleCount,
    format: presentationFormat,

    usage: GPUTextureUsage.RENDER_ATTACHMENT,
  })
  const msaaView = msaaTexture.createView()

  // 深度バッファの作成
  // 深度バッファは、物体の前後関係を正しく描画するために使用される
  const depthTexture = gpuDevice.createTexture({
    size: [canvas.width, canvas.height],
    sampleCount: multiSampleCount,
    format: 'depth24plus',
    usage: GPUTextureUsage.RENDER_ATTACHMENT,
  })
  const depthView = depthTexture.createView()

  const renderBundle = buildRenderBundle(
    gpuDevice,
    pipeline,
    presentationFormat,
    multiSampleCount,
    uniformBindGroup,
    vertexBuffer,
    indexBuffer,
    indices.length,
  )

  // フレームごとの描画処理
  function frame() {
    const time = performance.now() * 0.001
    const aspect = canvas.width / canvas.height

    // model = カメラから見た物体の位置と向きを表す行列
    // view = カメラの位置と向きを表す行列（今回は単位行列で、カメラは原点にあるとする）
    // projection = 3D空間を2Dスクリーンに投影する行列
    // projection * view * model の順で行列を掛けると、モデルの頂点がスクリーン上のどこに描画されるかが決まる
    const projection = mat4Perspective((45 * Math.PI) / 180, aspect, 0.1, 100)
    const cornerDownTilt = Math.atan(1 / Math.sqrt(2))
    const orientation = mat4Multiply(mat4RotationX(cornerDownTilt), mat4RotationZ(Math.PI / 4))
    const spinY = mat4RotationY(time)
    const rotation = mat4Multiply(spinY, orientation)
    const translation = mat4Translation(0, 0, -5)
    const scale = mat4Scale(0.5, 0.5, 0.5)
    const model = mat4Multiply(translation, mat4Multiply(scale, rotation))
    const mvp = mat4Multiply(projection, model)

    // ユニフォームバッファに行列データを書き込む
    const uniformData = new Float32Array(32)
    uniformData.set(mvp, 0)
    uniformData.set(model, 16)

    gpuDevice.queue.writeBuffer(uniformBuffer, 0, uniformData)

    // コマンドエンコーダーの作成
    const commandEncoder = gpuDevice.createCommandEncoder()
    const passEncoder = commandEncoder.beginRenderPass({
      // 描画先のテクスチャ
      colorAttachments: [
        {
          // 描画先のテクスチャビュー。MSAAを使用する場合は、マルチサンプル用のテクスチャビューを指定する
          view: msaaView,

          // GPURenderPassColorAttachment#viewがマルチサンプルの場合、
          // このカラーアタッチメントの解決された出力を受け取るテクスチャサブリソースを記述するGPUTextureViewです。
          resolveTarget: context.getCurrentTexture().createView(),

          // クリアカラーの設定
          clearValue: { r: 1.0, g: 1.0, b: 1.0, a: 1 },
          loadOp: 'clear',
          storeOp: 'store',
        },
      ],
      // 深度バッファの設定
      depthStencilAttachment: {
        view: depthView,
        depthClearValue: 1.0,
        depthLoadOp: 'clear',
        depthStoreOp: 'store',
      },
    })

    // レンダーバンドルの実行
    passEncoder.executeBundles([renderBundle])
    passEncoder.end()

    // コマンドの送信
    gpuDevice.queue.submit([commandEncoder.finish()])
    requestAnimationFrame(frame)
  }

  requestAnimationFrame(frame)
}
