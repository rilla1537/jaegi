<template>
  <div class="app-container">
    <header>
      <ImageUploadButton @file-uploaded="whenUserUploadImage" />
      <div class="slider-group">
        <HandlerSizeSlider v-model="world.pointSize.value" />
        <LineThicknessSlider v-model="world.lineThickness.value" />
      </div>
    </header>

    <main>
      <div class="canvas-container">
        <canvas ref="_OriginalCanvas"></canvas>
        <div class="canvas-label label-top-left">ORIGINAL</div>

        <div class="tool-buttons">
          <button
            class="tool-button ruler-button"
            :class="{ active: _IsDrawableRulerMode }"
            @click="_InteractionMode = 'DrawableRulerMode'"
          >
            <span class="material-symbols-outlined"> straighten </span>
            Ruler
          </button>
          <button
            class="tool-button target-button"
            :class="{ active: _IsDrawableTargetMode }"
            @click="_InteractionMode = 'DrawableTargetMode'"
          >
            <span class="material-symbols-outlined"> straighten </span>
            Target
          </button>
        </div>

        <div
          v-if="!isEditingRulerCm"
          class="ruler-cm-editor label"
          @click.stop="startEditingRulerCm"
          title="클릭하여 길이 수정"
        >
          {{ world.rulerCm.value }} cm
        </div>

        <input
          v-if="isEditingRulerCm"
          type="number"
          ref="rulerCmInput"
          class="ruler-cm-editor input"
          v-model="editingRulerCmValue"
          @blur="finishEditingRulerCm"
          @keydown.enter.prevent="finishEditingRulerCm"
          @click.stop
        />

        <!-- <div v-if="world.objects.value.target" class="target-cm-display label" :style="getScreenPositionStyle(world.objects.value.target.labelPosition)
          ">
          {{ world.targetLengthCm.value }} cm
        </div> -->
      </div>

      <div class="canvas-container">
        <canvas ref="previewCanvas"></canvas>
        <div class="canvas-label label-top-left">PREVIEW</div>

        <div
          v-if="false"
          class="ruler-cm-editor label"
          :style="{
            top: `${world.objects.value.ruler.labelPosition.y}px`,
            left: `${world.objects.value.ruler.labelPosition.x}px`,
          }"
        >
          {{ world.rulerCm.value }} cm
        </div>

        <div
          v-if="false"
          class="target-cm-display label"
          :style="{
            top: `${world.objects.value.target.labelPosition.y}px`,
            left: `${world.objects.value.target.labelPosition.x}px`,
          }"
        >
          {{ world.targetLengthCm.value }} cm
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick, watchEffect, computed } from "vue";
import { useCanvasWorld2D } from "./stores/CanvasWorld2D.js";
import ShapeDrawer from "@/services/ShapeDrawer.js";
import CanvasInteractionMode from "@/services/CanvasInteractionMode.js";
import { scaleSegment, addSegment } from "@/services/math";
import Vector2 from "@/services/math/definition/Vector2";

import ImageUploadButton from "./components/header/ImageUploadButton.vue";
import HandlerSizeSlider from "./components/header/HandlerSizeSlider.vue";
import LineThicknessSlider from "./components/header/LineThicknessSlider.vue";

const world = useCanvasWorld2D();

const _OriginalCanvas = ref(null);
const _PreviewCanvas = ref(null);

const _InteractionMode = ref(null);
const _Interaction = ref(CanvasInteractionMode.from(world, newModeName => {
  _InteractionMode.value = newModeName;
}));
const _IsDrawableRulerMode = computed(
  () => _InteractionMode.value === "DrawableRulerMode"
);
const _IsDrawableTargetMode = computed(
  () => _InteractionMode.value === "DrawableTargetMode"
);
watch(_InteractionMode, (newMode) => {
  _Interaction.value.set(newMode);
});

onMounted(() => {
  const canvas = _OriginalCanvas.value;
  if (!canvas) return;

  const rect = canvas.getBoundingClientRect();
  // 기기의 픽셀 비율을 가져옵니다 (일반 화면은 1, 레티나는 2 이상).
  const dpr = window.devicePixelRatio || 1;
  // 드로잉 버퍼의 크기를 표시 크기 × 픽셀 비율로 설정합니다.
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  // 캔버스 컨텍스트의 좌표계도 동일한 비율로 확대해줍니다.
  // 이렇게 하지 않으면 모든 그림이 작게 그려집니다.
  const ctx = canvas.getContext("2d");
  ctx.scale(dpr, dpr);

  canvas.addEventListener("mousedown", (e) => {
    _Interaction.value.onDown(e);
  });

  canvas.addEventListener("mousemove", (e) => {
    _Interaction.value.onMove(e);
  });

  canvas.addEventListener("mouseup", (e) => {
    _Interaction.value.onUp(e);
  });

  window.addEventListener("keydown", e => {
    _Interaction.value.onKeyDown(e);
  });
});

watch(world.VertexTrackingSheet, (newSheet) => {
  drawShapes();
}, { deep: true });

watch(world.trigger, newV => {
  drawShapes();
});

watch(world.enableHandler, () => {
  drawShapes();
});

function drawShapes() {
  const canvas = _OriginalCanvas.value;
  if (!canvas || !world.DrawingShapes.value) return;

  const ctx = canvas.getContext("2d");
  const shapeDrawer = ShapeDrawer.from(world).using(ctx);

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (const shape of world.DrawingShapes.value) {
    if (shape.role === "handler") {
      shapeDrawer.handler(shape);
    } else {
      shapeDrawer.path(shape);
    }
  }
}
</script>

<style src="./App.css" scoped></style>
