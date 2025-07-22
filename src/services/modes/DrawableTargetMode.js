export function init(world, { set }) {
  let moveable = false;
  let mouseTrackingIndices;
  let cachedEnableHandler = world.enableHandler.value;

  return {
    onDown: (e) => {
      /* 드로잉을 시작하면 핸들러 숨김 */ world.enableHandler.value = false;

      const ruler = world.addShape({
        role: "target",
        vertices: [
          { x: e.offsetX, y: e.offsetY },
          { x: e.offsetX, y: e.offsetY },
        ],
        color: "tomato",
      });

      // world.addHandler(ruler, { color: 'tomato', size: 15 });

      mouseTrackingIndices = ruler.pointIndices[1];
      moveable = true;
    },
    onMove: (e) => {
      if (!moveable || !mouseTrackingIndices) return;
      world.VertexTrackingSheet.value[mouseTrackingIndices].x = e.offsetX;
      world.VertexTrackingSheet.value[mouseTrackingIndices].y = e.offsetY;
    },
    onUp: (e) => {
      moveable = false;
      mouseTrackingIndices = undefined;
      world.enableHandler.value = cachedEnableHandler;

      set('DetectShapeMode');
    },
    onWheel: (e) => {
      /* 줌인앤아웃 */
    },
  };
}
