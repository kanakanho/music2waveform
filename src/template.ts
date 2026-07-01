import shaderSource from './shader/shader.wgsl?raw'

export default function template(
  _: HTMLCanvasElement,
  gpuDevice: GPUDevice,
  context: GPUCanvasContext,
  presentationFormat: GPUTextureFormat,
  getAudioData: () => Float32Array,
  frequencyBinCount: number,
) {
  const shaderModule = gpuDevice.createShaderModule({ code: shaderSource })

  // パイプラインの作成（頂点バッファは使わないため空）
  const pipeline = gpuDevice.createRenderPipeline({
    layout: 'auto',
    vertex: {
      module: shaderModule,
      entryPoint: 'vs_main',
    },
    fragment: {
      module: shaderModule,
      entryPoint: 'fs_main',
      targets: [{ format: presentationFormat }],
    },
    primitive: {
      topology: 'triangle-list',
    },
  })

  // オーディオデータ用のユニフォームバッファ (256個のf32 = 1024バイト)
  const audioBuffer = gpuDevice.createBuffer({
    size: frequencyBinCount * 4,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  })

  // 解析情報(Nと時間)用のユニフォームバッファ (vec2f = 8バイト。アライメントのため16バイト確保)
  const infoBuffer = gpuDevice.createBuffer({
    size: 16,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  })

  // バインドグループの作成
  const bindGroup = gpuDevice.createBindGroup({
    layout: pipeline.getBindGroupLayout(0),
    entries: [
      { binding: 0, resource: { buffer: audioBuffer } },
      { binding: 1, resource: { buffer: infoBuffer } },
    ],
  })

  function frame() {
    // 1. 最新の周波数データを取得してバッファに書き込み
    const audioData = getAudioData()
    gpuDevice.queue.writeBuffer(audioBuffer, 0, audioData)

    // 2. Nの値と時間を書き込み
    const time = performance.now() * 0.001
    const infoData = new Float32Array([frequencyBinCount, time])
    gpuDevice.queue.writeBuffer(infoBuffer, 0, infoData)

    // 3. コマンドの作成と描画の実行
    const commandEncoder = gpuDevice.createCommandEncoder()
    const passEncoder = commandEncoder.beginRenderPass({
      colorAttachments: [
        {
          view: context.getCurrentTexture().createView(),
          clearValue: { r: 0.0, g: 0.0, b: 0.0, a: 1.0 },
          loadOp: 'clear',
          storeOp: 'store',
        },
      ],
    })

    passEncoder.setPipeline(pipeline)
    passEncoder.setBindGroup(0, bindGroup)
    // 3頂点で画面全体の三角形を描画（vs_mainのロジックに対応）
    passEncoder.draw(3)
    passEncoder.end()

    gpuDevice.queue.submit([commandEncoder.finish()])
    requestAnimationFrame(frame)
  }

  requestAnimationFrame(frame)
}
