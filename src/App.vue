<template>
  <div class="app-container">
    <main class="main-content">
      <div class="canvas-container">
        <canvas ref="mainCanvas"></canvas>

        <div class="canvas-label label-top-left">CANVAS</div>

        <div
          class="ruler-cm-editor label"
          style="top: 150px; left: 180px"
          title="This is a static example"
        >
          15.00 cm
        </div>

        <div
          class="target-cm-display label"
          style="top: 250px; left: 300px"
          title="This is a static example"
        >
          8.25 cm
        </div>
      </div>
    </main>

    <aside class="sidebar">
      <div class="sidebar-main-content">
        <div class="sidebar-group">
          <h3 class="sidebar-title">Tools</h3>
          <div class="tool-buttons">
            <button class="tool-button ruler-button active">
              <span class="material-symbols-outlined"> straighten </span>
              Base
            </button>
            <button class="tool-button target-button">
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
        <input type="file" id="file-upload" class="hidden-file-input" />
        <label for="file-upload" class="file-upload-button">
          <span class="material-symbols-outlined"> add_photo_alternate </span>
          Choose File
        </label>
      </div>
    </aside>
  </div>
</template>

<script setup>
// All logic is removed as requested for this static layout.
</script>

<style src="./App.css" scoped></style>