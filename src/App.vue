<template>
  <div class="app-container">
    <main class="main-content">
      <div class="canvas-container" ref="canvasContainer">
        <canvas ref="mainCanvas"></canvas>
      </div>
    </main>

    <aside class="sidebar">
      <div class="sidebar-main-content">
        <div class="sidebar-group">
          <h3 class="sidebar-title">Tools</h3>
          <div class="tool-buttons">
            <button
              class="tool-button ruler-button"
              :class="{ active: tool === 'base' }"
              @click="setTool('base')"
            >
              <span class="material-symbols-outlined"> straighten </span>
              Base
            </button>
            <button
              class="tool-button target-button"
              :class="{ active: tool === 'measure' }"
              :disabled="!baseLine"
              @click="setTool('measure')"
            >
              <span class="material-symbols-outlined"> my_location </span>
              Measure
            </button>
          </div>
        </div>

        <div class="sidebar-group">
          <h3 class="sidebar-title">Settings</h3>
          <div class="slider-group">
            <div class="slider-item">
              <label for="handler-size">Handler Size</label>
              <input
                type="range"
                id="handler-size"
                min="1"
                max="20"
                value="8"
              />
            </div>
            <div class="slider-item">
              <label for="line-thickness">Line Thickness</label>
              <input
                type="range"
                id="line-thickness"
                min="1"
                max="10"
                value="3"
              />
            </div>
          </div>
        </div>
      </div>

      <div class="sidebar-footer">
        <input
          type="file"
          id="file-upload"
          class="hidden-file-input"
          ref="fileInput"
          @change="onFileChange"
        />
        <label for="file-upload" class="file-upload-button">
          <span class="material-symbols-outlined"> add_photo_alternate </span>
          Choose File
        </label>
      </div>
    </aside>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onBeforeUnmount } from 'vue'

const mainCanvas = ref(null)
const canvasContainer = ref(null)
const fileInput = ref(null)
const tool = ref('base')

const state = reactive({
  drawing: null,
  action: 'idle',
  start: { x: 0, y: 0 },
  basePx: 0,
  lines: [],
  selected: null,
  image: null,
  startLine: null,
})

const baseLine = ref(null)

function setTool(t) {
  if (t === 'measure' && !baseLine.value) return
  tool.value = t
}

function onFileChange(e) {
  const file = e.target.files[0]
  if (!file) return
  const img = new Image()
  img.onload = () => {
    state.image = img
    // Reset any existing measurement state when a new image is loaded
    state.lines = []
    state.selected = null
    state.basePx = 0
    baseLine.value = null
    tool.value = 'base'
    clearLabels()
    clearSelectionControls()
    resizeCanvas()
    draw()
  }
  img.src = URL.createObjectURL(file)
}

function resizeCanvas() {
  const canvas = mainCanvas.value
  const container = canvasContainer.value
  if (!canvas || !container) return
  const dpr = window.devicePixelRatio || 1
  const width = container.clientWidth
  const height = container.clientHeight
  canvas.width = Math.max(1, Math.floor(width * dpr))
  canvas.height = Math.max(1, Math.floor(height * dpr))
  canvas.style.width = width + 'px'
  canvas.style.height = height + 'px'
  const ctx = canvas.getContext('2d')
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
}

function getPos(evt) {
  const rect = mainCanvas.value.getBoundingClientRect()
  return { x: evt.clientX - rect.left, y: evt.clientY - rect.top }
}

function distance(x1, y1, x2, y2) {
  return Math.hypot(x2 - x1, y2 - y1)
}

function midpoint(line) {
  return { x: (line.x1 + line.x2) / 2, y: (line.y1 + line.y2) / 2 }
}

function getNormal(line) {
  const dx = line.x2 - line.x1
  const dy = line.y2 - line.y1
  const len = Math.hypot(dx, dy)
  if (!len) return { x: 0, y: -1 }
  return { x: -dy / len, y: dx / len }
}

function addLabel(line) {
  const label = document.createElement('div')
  label.className = line.type === 'base' ? 'ruler-cm-editor label' : 'target-cm-display label'
  const cm = Number.isFinite(line.cm) ? line.cm : 0
  label.textContent = `${cm.toFixed(2)} cm`
  const mid = midpoint(line)
  const n = getNormal(line)
  const off = 20
  label.style.left = `${mid.x + n.x * off}px`
  label.style.top = `${mid.y + n.y * off}px`
  label.style.display = 'block'
  if (line.type === 'base') {
    label.addEventListener('click', () => {
      const val = parseFloat(prompt('Enter baseline length (cm)', line.cm))
      if (!isNaN(val) && val > 0) {
        line.cm = val
        state.basePx = distance(line.x1, line.y1, line.x2, line.y2)
        recalcMeasures()
        draw()
      }
    })
  } else {
    label.style.pointerEvents = 'none'
  }
  canvasContainer.value.appendChild(label)
  return label
}

function clearLabels() {
  canvasContainer.value
    .querySelectorAll('.ruler-cm-editor, .target-cm-display')
    .forEach((el) => el.remove())
}

function recalcMeasures() {
  if (!baseLine.value || !state.basePx) return
  state.lines.forEach((l) => {
    const len = distance(l.x1, l.y1, l.x2, l.y2)
    l.cm = (baseLine.value.cm * len) / state.basePx
  })
}

function draw() {
  const canvas = mainCanvas.value
  const ctx = canvas.getContext('2d')
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  if (state.image) {
    const cw = canvas.width / (window.devicePixelRatio || 1)
    const ch = canvas.height / (window.devicePixelRatio || 1)
    const scale = Math.min(cw / state.image.width, ch / state.image.height)
    const w = state.image.width * scale
    const h = state.image.height * scale
    const dx = (cw - w) / 2
    const dy = (ch - h) / 2
    ctx.drawImage(state.image, dx, dy, w, h)
  }

  clearLabels()

  if (baseLine.value) {
    drawLine(ctx, baseLine.value, 'deepskyblue')
    baseLine.value.label = addLabel(baseLine.value)
  }
  state.lines.forEach((l) => {
    drawLine(ctx, l, 'tomato')
    l.label = addLabel(l)
  })

  updateSelectionControls()
}

function drawLine(ctx, line, color) {
  ctx.save()
  ctx.strokeStyle = color
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.moveTo(line.x1, line.y1)
  ctx.lineTo(line.x2, line.y2)
  ctx.stroke()
  ctx.restore()
}

function findLine(x, y) {
  const hit = (line) => {
    const A = x - line.x1
    const B = y - line.y1
    const C = line.x2 - line.x1
    const D = line.y2 - line.y1
    const dot = A * C + B * D
    const len = C * C + D * D
    const param = len ? dot / len : -1
    let xx, yy
    if (param < 0) {
      xx = line.x1
      yy = line.y1
    } else if (param > 1) {
      xx = line.x2
      yy = line.y2
    } else {
      xx = line.x1 + param * C
      yy = line.y1 + param * D
    }
    const dx = x - xx
    const dy = y - yy
    return Math.hypot(dx, dy) < 10
  }
  if (baseLine.value && hit(baseLine.value)) return { type: 'base', line: baseLine.value }
  for (let i = state.lines.length - 1; i >= 0; i--) {
    if (hit(state.lines[i])) return { type: 'measure', line: state.lines[i], index: i }
  }
  return null
}

const pointerStrategies = {
  idle: {
    pointerdown(evt) {
      const pos = getPos(evt)
      const hit = findLine(pos.x, pos.y)
      if (hit) {
        selectLine(hit)
        return
      }
      if (tool.value === 'measure' && !baseLine.value) return
      if (tool.value === 'base' || tool.value === 'measure') {
        state.drawing = { x1: pos.x, y1: pos.y, x2: pos.x, y2: pos.y, type: tool.value }
        state.action = 'drawing'
      }
    },
    pointermove() {},
    pointerup() {},
    pointercancel() {},
  },
  drawing: {
    pointerdown() {},
    pointermove(evt) {
      const pos = getPos(evt)
      state.drawing.x2 = pos.x
      state.drawing.y2 = pos.y
      draw()
      const ctx = mainCanvas.value.getContext('2d')
      drawLine(ctx, state.drawing, state.drawing.type === 'base' ? 'deepskyblue' : 'tomato')
    },
    pointerup() {
      if (tool.value === 'base') {
        baseLine.value = { ...state.drawing }
        const defaultCm = '10'
        const entered = prompt('Enter baseline length (cm)', defaultCm)
        const val = parseFloat(entered || defaultCm)
        baseLine.value.cm = !isNaN(val) && val > 0 ? val : parseFloat(defaultCm)
        baseLine.value.type = 'base'
        state.basePx = distance(
          baseLine.value.x1,
          baseLine.value.y1,
          baseLine.value.x2,
          baseLine.value.y2,
        )
        state.lines = []
        tool.value = 'measure'
      } else {
        const len = distance(
          state.drawing.x1,
          state.drawing.y1,
          state.drawing.x2,
          state.drawing.y2,
        )
        const cm = state.basePx ? (baseLine.value.cm * len) / state.basePx : 0
        state.lines.push({ ...state.drawing, cm, type: 'measure' })
      }
      state.drawing = null
      state.action = 'idle'
      draw()
    },
    pointercancel() {
      state.drawing = null
      state.action = 'idle'
      draw()
    },
  },
  move: {
    pointerdown() {},
    pointermove(evt) {
      if (!state.selected) return
      const pos = getPos(evt)
      const line = state.selected.line
      const dx = pos.x - state.start.x
      const dy = pos.y - state.start.y
      line.x1 = state.startLine.x1 + dx
      line.y1 = state.startLine.y1 + dy
      line.x2 = state.startLine.x2 + dx
      line.y2 = state.startLine.y2 + dy
      if (line.type === 'base') {
        state.basePx = distance(line.x1, line.y1, line.x2, line.y2)
        recalcMeasures()
      }
      draw()
    },
    pointerup() {
      state.action = 'idle'
      draw()
    },
    pointercancel() {
      if (state.selected) {
        Object.assign(state.selected.line, state.startLine)
        if (state.selected.line.type === 'base') {
          state.basePx = distance(
            state.selected.line.x1,
            state.selected.line.y1,
            state.selected.line.x2,
            state.selected.line.y2,
          )
          recalcMeasures()
        }
        draw()
      }
      state.action = 'idle'
    },
  },
  rotate: {
    pointerdown() {},
    pointermove(evt) {
      if (!state.selected) return
      const pos = getPos(evt)
      const line = state.selected.line
      const center = midpoint(line)
      const angle = Math.atan2(pos.y - center.y, pos.x - center.x)
      const len = distance(line.x1, line.y1, line.x2, line.y2) / 2
      line.x1 = center.x - len * Math.cos(angle)
      line.y1 = center.y - len * Math.sin(angle)
      line.x2 = center.x + len * Math.cos(angle)
      line.y2 = center.y + len * Math.sin(angle)
      if (line.type === 'base') {
        state.basePx = distance(line.x1, line.y1, line.x2, line.y2)
        recalcMeasures()
      }
      draw()
    },
    pointerup() {
      state.action = 'idle'
      draw()
    },
    pointercancel() {
      if (state.selected) {
        Object.assign(state.selected.line, state.startLine)
        if (state.selected.line.type === 'base') {
          state.basePx = distance(
            state.selected.line.x1,
            state.selected.line.y1,
            state.selected.line.x2,
            state.selected.line.y2,
          )
          recalcMeasures()
        }
        draw()
      }
      state.action = 'idle'
    },
  },
  start: {
    pointerdown() {},
    pointermove(evt) {
      if (!state.selected) return
      const pos = getPos(evt)
      const line = state.selected.line
      line.x1 = pos.x
      line.y1 = pos.y
      if (line.type === 'base') {
        state.basePx = distance(line.x1, line.y1, line.x2, line.y2)
        recalcMeasures()
      }
      draw()
    },
    pointerup() {
      state.action = 'idle'
      draw()
    },
    pointercancel() {
      if (state.selected) {
        Object.assign(state.selected.line, state.startLine)
        if (state.selected.line.type === 'base') {
          state.basePx = distance(
            state.selected.line.x1,
            state.selected.line.y1,
            state.selected.line.x2,
            state.selected.line.y2,
          )
          recalcMeasures()
        }
        draw()
      }
      state.action = 'idle'
    },
  },
  end: {
    pointerdown() {},
    pointermove(evt) {
      if (!state.selected) return
      const pos = getPos(evt)
      const line = state.selected.line
      line.x2 = pos.x
      line.y2 = pos.y
      if (line.type === 'base') {
        state.basePx = distance(line.x1, line.y1, line.x2, line.y2)
        recalcMeasures()
      }
      draw()
    },
    pointerup() {
      state.action = 'idle'
      draw()
    },
    pointercancel() {
      if (state.selected) {
        Object.assign(state.selected.line, state.startLine)
        if (state.selected.line.type === 'base') {
          state.basePx = distance(
            state.selected.line.x1,
            state.selected.line.y1,
            state.selected.line.x2,
            state.selected.line.y2,
          )
          recalcMeasures()
        }
        draw()
      }
      state.action = 'idle'
    },
  },
}

function handlePointer(type, evt) {
  const strat = pointerStrategies[state.action]
  if (strat && strat[type]) strat[type](evt)
}

function selectLine(hit) {
  state.selected = hit
  state.startLine = { ...hit.line }
  state.action = 'idle' // 선택 시 조작 상태 초기화
  // Redraw to ensure handles and control icons are visible for the selected line
  draw()
}

let handleStart = null
let handleEnd = null
let controlBox = null

function clearSelectionControls() {
  ;[handleStart, handleEnd, controlBox].forEach((el) => el && el.remove())
  handleStart = handleEnd = controlBox = null
}

function updateSelectionControls() {
  clearSelectionControls()
  if (!state.selected) return
  const line = state.selected.line
  const container = canvasContainer.value

  handleStart = document.createElement('div')
  handleEnd = document.createElement('div')
  handleStart.className = handleEnd.className = 'line-handle'
  handleStart.style.backgroundColor = line.type === 'base' ? 'deepskyblue' : 'tomato'
  handleEnd.style.backgroundColor = line.type === 'base' ? 'deepskyblue' : 'tomato'
  handleStart.style.left = `${line.x1 - 6}px`
  handleStart.style.top = `${line.y1 - 6}px`
  handleEnd.style.left = `${line.x2 - 6}px`
  handleEnd.style.top = `${line.y2 - 6}px`
  handleStart.addEventListener('pointerdown', (e) => startManip(e, 'start'))
  handleEnd.addEventListener('pointerdown', (e) => startManip(e, 'end'))
  container.appendChild(handleStart)
  container.appendChild(handleEnd)

  controlBox = document.createElement('div')
  controlBox.className = 'line-controls'
  const rotateBtn = document.createElement('button')
  rotateBtn.textContent = '⟳'
  rotateBtn.addEventListener('pointerdown', (e) => startManip(e, 'rotate'))
  const moveBtn = document.createElement('button')
  moveBtn.textContent = '✥'
  moveBtn.addEventListener('pointerdown', (e) => startManip(e, 'move'))
  const delBtn = document.createElement('button')
  delBtn.textContent = '✕'
  delBtn.addEventListener('click', () => {
    if (state.selected.type === 'base') {
      baseLine.value = null
      state.lines = []
    } else {
      const idx = state.lines.indexOf(state.selected.line)
      if (idx !== -1) state.lines.splice(idx, 1)
    }
    state.selected = null
    clearSelectionControls()
    draw()
  })
  controlBox.appendChild(rotateBtn)
  controlBox.appendChild(moveBtn)
  controlBox.appendChild(delBtn)
  container.appendChild(controlBox)
  const mid = midpoint(line)
  const n = getNormal(line)
  controlBox.style.left = `${mid.x + n.x * 30 - 30}px`
  controlBox.style.top = `${mid.y + n.y * 30 - 10}px`
}

function startManip(e, type) {
  e.stopPropagation()
  state.action = type
  state.start = getPos(e)
  state.startLine = { ...state.selected.line }
}

function onWindowResize() {
  resizeCanvas()
  draw()
}

onMounted(() => {
  const canvas = mainCanvas.value
  canvas.addEventListener('pointerdown', (e) => handlePointer('pointerdown', e))
  canvas.addEventListener('pointermove', (e) => handlePointer('pointermove', e))
  canvas.addEventListener('pointercancel', (e) => handlePointer('pointercancel', e))
  window.addEventListener('pointerup', (e) => handlePointer('pointerup', e))
  window.addEventListener('pointercancel', (e) => handlePointer('pointercancel', e))
  window.addEventListener('resize', onWindowResize)

  resizeCanvas()
  draw()
})

onBeforeUnmount(() => {
  const canvas = mainCanvas.value
  if (canvas) {
    canvas.removeEventListener('pointerdown', (e) => handlePointer('pointerdown', e))
    canvas.removeEventListener('pointermove', (e) => handlePointer('pointermove', e))
    canvas.removeEventListener('pointercancel', (e) => handlePointer('pointercancel', e))
  }
  window.removeEventListener('pointerup', (e) => handlePointer('pointerup', e))
  window.removeEventListener('pointercancel', (e) => handlePointer('pointercancel', e))
  window.removeEventListener('resize', onWindowResize)
})
</script>

<style src="./App.css" scoped></style>
