import template from './template'

const app = document.getElementById('app') as HTMLDivElement

// --- ★カスタムダイアログ（モーダル）の作成★ ---
const dialog = document.createElement('dialog')
dialog.style.padding = '20px'
dialog.style.borderRadius = '8px'
dialog.style.border = 'none'
dialog.style.backgroundColor = '#222222'
dialog.style.color = '#ffffff'
dialog.style.boxShadow = '0 4px 20px rgba(0,0,0,0.5)'
dialog.style.fontFamily = 'sans-serif'
dialog.style.textAlign = 'center'

const dialogText = document.createElement('p')
dialogText.textContent = '音声ファイル（MP3など）を選択してください。'
dialogText.style.margin = '0 0 15px 0'
dialog.appendChild(dialogText)

const dialogButton = document.createElement('button')
dialogButton.textContent = '閉じる'
dialogButton.style.padding = '8px 16px'
dialogButton.style.border = 'none'
dialogButton.style.borderRadius = '4px'
dialogButton.style.backgroundColor = '#555555'
dialogButton.style.color = '#ffffff'
dialogButton.style.cursor = 'pointer'
dialogButton.addEventListener('click', () => {
  dialog.close()
})
dialog.appendChild(dialogButton)
app.appendChild(dialog)
// ---------------------------------------------

// ドロップの案内テキスト
const hint = document.createElement('div')
hint.textContent = 'ここにオーディオファイルをドラッグ＆ドロップして再生'
hint.style.position = 'absolute'
hint.style.top = '50%'
hint.style.left = '50%'
hint.style.transform = 'translate(-50%, -50%)'
hint.style.color = '#ffffff'
hint.style.fontFamily = 'sans-serif'
hint.style.fontSize = '18px'
hint.style.pointerEvents = 'none'
hint.style.opacity = '0.5'
hint.style.transition = 'opacity 0.3s'
app.appendChild(hint)

const canvas = document.createElement('canvas')
canvas.width = window.innerWidth
canvas.height = window.innerHeight
app.appendChild(canvas)

// リサイズ対応
window.addEventListener('resize', () => {
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
})

async function main() {
  const context = canvas.getContext('webgpu') as GPUCanvasContext
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
    alphaMode: 'opaque',
  })

  // WebAudioAPIの初期化
  let audioContext: AudioContext | null = null
  let analyser: AnalyserNode | null = null
  let audioBufferSource: AudioBufferSourceNode | null = null

  const FFT_SIZE = 128
  const frequencyBinCount = FFT_SIZE / 2

  // 音声ファイルを処理する共通関数
  async function handleAudioFile(file: File) {
    // --- ★alert を dialog に変更★ ---
    if (!file.type.startsWith('audio/')) {
      dialog.showModal() // 背後を操作できなくするカスタムモーダルを表示
      return
    }

    // ファイルが読み込まれたら案内テキストを消す
    hint.style.opacity = '0'

    // 前回の再生を停止
    if (audioBufferSource) {
      try {
        audioBufferSource.stop()
      }
      catch (e) {
        console.warn(`AudioBufferSourceNode is already stopped.: ${e}`)
      }
    }

    if (!audioContext) {
      audioContext = new AudioContext()
      analyser = audioContext.createAnalyser()
      analyser.fftSize = FFT_SIZE
      analyser.connect(audioContext.destination)
    }

    if (audioContext.state === 'suspended') {
      await audioContext.resume()
    }

    const arrayBuffer = await file.arrayBuffer()
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)

    audioBufferSource = audioContext.createBufferSource()
    audioBufferSource.buffer = audioBuffer
    audioBufferSource.connect(analyser!)
    audioBufferSource.start()
  }

  // ドラッグ＆ドロップのイベント設定
  window.addEventListener('dragover', (e) => {
    e.preventDefault()
    hint.style.opacity = '1'
  })

  window.addEventListener('dragleave', () => {
    if (!audioBufferSource) {
      hint.style.opacity = '0.5'
    }
    else {
      hint.style.opacity = '0'
    }
  })

  window.addEventListener('drop', async (e) => {
    e.preventDefault()
    const file = e.dataTransfer?.files?.[0]
    if (file) {
      await handleAudioFile(file)
    }
  })

  // スムーズな正規化用変数
  let smoothMax = 1.0

  // 描画ロジックの起動
  template(canvas, g_device, context, presentationFormat, () => {
    if (!analyser)
      return new Float32Array(frequencyBinCount)
    const dataArray = new Uint8Array(frequencyBinCount)
    analyser.getByteFrequencyData(dataArray)

    let currentMax = 0
    for (let i = 0; i < frequencyBinCount; i++) {
      if (dataArray[i] > currentMax) {
        currentMax = dataArray[i]
      }
    }
    smoothMax = smoothMax + (currentMax - smoothMax) * 0.1

    const floatArray = new Float32Array(frequencyBinCount)
    for (let i = 0; i < frequencyBinCount; i++) {
      const denominator = Math.max(smoothMax, 1.0)
      floatArray[i] = dataArray[i] / denominator
    }
    return floatArray
  }, frequencyBinCount)
}

main()
