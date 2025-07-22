// modes/SelectedSahpeMode.js
import Vector2 from "../math/definition/Vector2";

export function init(world, { set }, params) {
  let activeHandler = null;
  const { shapeID } = params;
  console.log('shapeID', shapeID)

  return {
    onDown: (e) => {
      const pt = new Vector2(e.offsetX, e.offsetY);
      let closest = null;
      let minDist = Infinity;

      // role이 'handler'인 shape 중에서
      world.CanvasShapes.value
        .filter((s) => s.role === "handler")
        .forEach((handler) => {
          // 핸들러의 유일한 pointIndices[0]에 대응하는 트래킹 시트 좌표
          const idx = handler.pointIndices[0];
          const { x, y } = world.VertexTrackingSheet.value[idx];
          const center = new Vector2(x, y);

          // 포인터와 핸들러 중심 간 거리
          const dist = center.sub(pt).length();

          // handlerHitSize 이내이면서, 가장 가까운 놈 선택
          if (dist <= world.handlerHitSize.value && dist < minDist) {
            minDist = dist;
            closest = handler;
          }
        });

      if (closest) {
        activeHandler = closest;
      }
    },

    onMove: (e) => {
      if (!activeHandler) return;
      const pt = new Vector2(e.offsetX, e.offsetY);

      // handler.trace에 기록된 원본 vertex index를 사용
      const idx = activeHandler.trace;
      world.VertexTrackingSheet.value[idx].x = pt.x;
      world.VertexTrackingSheet.value[idx].y = pt.y;

      // 핸들러가 움직인 후, 모든 핸들러 위치 재계산
      world.updateHandlersPosition();
    },

    onUp: () => {
      if (activeHandler) {
        // 드래그 끝
        activeHandler = null;
        // 다시 모드를 DetectShapeMode로 전환, 필요시
        // set("DetectShapeMode");
      } else {
        world.removeShapesByRole('handler');
        world.enableHandler.value = false;
        set('DetectShapeMode');
      }
    },

    onWheel: () => {
      
    },
    onKeyDown: e => {
      console.log(e.key, shapeID);
      // 필요시 휠 이벤트 처리
      if (e.key === 'Delete' && shapeID) {
        world.removeShape(shapeID);
      }
    }
  };
}
