import template from './template'

const app = document.getElementById('app') as HTMLDivElement
const canvas = document.createElement('canvas')
// window sizeに合わせる
canvas.width = window.innerWidth
canvas.height = window.innerHeight
app.appendChild(canvas)

async function main() {
// webgpuコンテキストの取得
  const context = canvas.getContext('webgpu') as GPUCanvasContext

  // deviceの取得
  const g_adapter = await navigator.gpu.requestAdapter()
  if (!g_adapter) {
    console.error('WebGPU is not supported on this browser.')
    return
  }
  const g_device = await g_adapter.requestDevice()

  const presentationFormat = navigator.gpu.getPreferredCanvasFormat()
  context.configure({
    device: g_device,
    format: presentationFormat,
    alphaMode: 'opaque', // or 'premultiplied'
  })

  template(canvas, g_device, context, presentationFormat)
}

main()
