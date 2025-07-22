export function init(world, { set }) {
  let moveable = false;
  let mouseTrackingIndices;
  let cachedEnableHandler = world.enableHandler.value;

  return {
    onDown: (e) => {
      
      /* 드로잉을 시작하면 핸들러 숨김 */ world.enableHandler.value = false;
      /**
       * Ruler는 캔버스상에서 오직 하나로만 존재하므로 기존 Ruler를 없애고 새로운 Ruler를 추가한다.
       */
      world.removeShapesByRole('ruler');

      const ruler = world.addShape({
        role: "ruler",
        vertices: [
          { x: e.offsetX, y: e.offsetY },
          { x: e.offsetX, y: e.offsetY },
        ],
        color: "skyblue",
      });

      // world.addHandler(ruler, { color: 'skyblue', size: 15 });

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
    },
    onWheel: (e) => {
      /* 줌인앤아웃 */
    },
  };
}
