// modes/DetectShapeMode.js
import { isPointInSegmentHitBox } from "../math";
import Vector2 from "../math/definition/Vector2";

export function init(world, { set }) {
  let prevDetectedId = null;

  return {
    // onMove 함수 전체를 아래 코드로 교체해 보세요.
    onMove: (e) => {
      const pt = new Vector2(e.offsetX, e.offsetY);

      // 1) 마우스 포인터가 걸린 선분 찾기
      const found = world.CanvasShapes.value
        .filter((s) => s.role !== "hint")
        .find((shape) => {
          // 이 부분은 동일하므로 생략
          const [p1, p2] = shape.pointIndices.map((idx) => {
            const { x, y } = world.VertexTrackingSheet.value[idx];
            return new Vector2(x, y);
          });
          return isPointInSegmentHitBox({
            point: pt,
            v1: p1,
            v2: p2,
            hit: world.hitSize.value,
          });
        });

      // 2) 로직 수정: 찾은 도형(found)과 이전 도형(prevDetectedId)을 비교해서 처리
      if (found && prevDetectedId === found.id) {
        // 마우스가 같은 도형 위에 계속 있음 -> 아무것도 안 함
        return;
      }

      // 이전에 있던 힌트는 무조건 삭제 (새 도형을 찾았거나, 도형 밖으로 나갔을 경우)
      world.removeShapesByRole("hint");

      if (found) {
        // 새로운 도형을 찾음 -> 힌트 추가
        const [p1, p2] = found.pointIndices.map((idx) => {
          const { x, y } = world.VertexTrackingSheet.value[idx];
          return { x, y };
        });

        world.addShape({
          role: "hint",
          vertices: [
            { x: p1.x, y: p1.y },
            { x: p2.x, y: p2.y },
          ],
          color: "rgba(0,255,255,0.6)",
          size: world.lineThickness.value * 2,
        });

        // 이전 ID 갱신
        prevDetectedId = found.id;
      } else {
        // 도형을 찾지 못함 (도형 밖으로 마우스가 나감) -> 이전 ID 초기화
        prevDetectedId = null;
      }
    },
    onDown: () => {},
    onUp: () => {
      /* 선택된 shape에 핸들러를 추가 */
      if (prevDetectedId) {
        const matchShape = world.CanvasShapes.value.find(shape => shape.id === prevDetectedId);
        world.addHandler(matchShape, { size: 10, color: matchShape.color, offset: 15 });
        world.updateHandlersPosition();
        world.enableHandler.value = true;
        world.removeShapesByRole('hint');

        set('SelectedShapeMode', { shapeID: prevDetectedId });
      
      } else {
        world.removeShapesByRole('handler');
        world.enableHandler.value = false;
      }
    },
    onWheel: () => {},
  };
}
