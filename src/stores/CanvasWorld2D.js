import { ref, computed, watch } from "vue";
import ShapeDefinition from "@/services/ShapeDefinition";
import { addSegment, scaleSegment } from "@/services/math";
import Vector2 from "@/services/math/definition/Vector2";

export function useCanvasWorld2D() {
  const VertexTrackingSheet = ref([]);
  const CanvasShapes = ref([]);

  const enableHandler = ref(false);
  const DrawingShapes = computed(() => {
    if (enableHandler.value) return CanvasShapes.value;
    return CanvasShapes.value.filter(shape => shape.role !== 'handler');
  });
  const handlerHitSize = ref(10);

  const trigger = ref(0);
  const hitSize = ref(10);


  const rulerCm = ref(5);
  const pointSize = ref(8);
  /*shape 별로 다르게 지정할거라 삭제*/const lineThickness = ref(2);

  function getPosition(index) {
    return VertexTrackingSheet.value[index];
  }

  function addShape({
    role,
    vertices,
    color,
    lineThickness,
    traceShapeID,
    trace,
    offset,
    size,
  }) {
    const pointIndices = vertices.map((vertex) => {
      const index = VertexTrackingSheet.value.length;
      VertexTrackingSheet.value.push({ ...vertex });
      return index;
    });

    const newShape = {
      id: Date.now().toString(),
      definition: ShapeDefinition.define({ vertexSize: pointIndices.length }),
      role,
      color,
      lineThickness,
      pointIndices, // 기록해둔 인덱스 배열을 사용
      traceShapeID, // 핸들러 전용
      trace, // 핸들러 전용
      offset, // 핸들러 전용
      size, // 핸들러 전용
      hasHandlers: false
    };

    CanvasShapes.value.push(newShape);

    return newShape;
  }

  function addHandler(shape, { size = 10, color = "skyblue", offset = 0 }) {
    shape.hasHandlers = true;

    return shape.pointIndices.map((vertexToTraceIndex, i) => {
      return addShape({
        role: "handler",
        traceShapeID: shape.id, // 어느 도형에 속한 핸들러인지 기록
        trace: vertexToTraceIndex, // 추적할 원본 꼭짓점의 인덱스 기록
        vertices: [{ x: 0, y: 0 }],
        color: color,
        offset,
        size,
      });
    });
  }

  function removeShape(shapeID) {
    const shapeIndex = CanvasShapes.value.findIndex((s) => s.id === shapeID);
    if (shapeIndex === -1) return;

    const shape = CanvasShapes.value[shapeIndex];
    const { pointIndices } = shape;

    CanvasShapes.value.splice(shapeIndex, 1);
    const removed = [...pointIndices].sort((a, b) => b - a);

    // 4) VertexTrackingSheet 에서 splice 하고,
    //    각 삭제 시점마다 남은 shape들의 indices 보정
    for (const idx of removed) {
      VertexTrackingSheet.value.splice(idx, 1);
      // 보정: 삭제된 idx보다 큰 인덱스는 -1
      CanvasShapes.value.forEach((shape) => {
        shape.pointIndices = shape.pointIndices.map((i) =>
          i > idx ? i - 1 : i
        );
      });
    }

    // 핸들러 삭제
    if (!shape.hasHandlers) return;
    const handlers = CanvasShapes.value.filter(_shape => _shape.role === "handler" && _shape.traceShapeID === shape.id);
    handlers.forEach((handler) => removeShape(handler.id));
  }

  function removeShapesByRole(role) {
    // 1) 같은 role의 ID 목록 추출
    const idsToRemove = CanvasShapes.value
      .filter((s) => s.role === role)
      .map((s) => s.id);

    // 2) 하나씩 removeShapeById 호출
    idsToRemove.forEach((id) => removeShape(id));
  }

  function updateHandlersPosition() {
    const shapes = CanvasShapes.value.filter(shape => shape.role !== 'handler');
    shapes.forEach(shape => {
      /* shape의 끝점 p1, p2 */const [p1, p2] = shape.pointIndices.map(indice => getPosition(indice));
      const addedSegment = addSegment({ v1: new Vector2(p1.x, p1.y), v2: new Vector2(p2.x, p2.y), k: 15 });
      /* 핸들러는 shape 선분 d에 상수 k 만큼 증가된 선분 d' 끝점으로 지정 */
      const handlers = CanvasShapes.value.filter(handler => handler.traceShapeID === shape.id);
      handlers.forEach((handler, i) => {
        VertexTrackingSheet.value[handler.pointIndices[0]].x = addedSegment[i].x;
        VertexTrackingSheet.value[handler.pointIndices[0]].y = addedSegment[i].y;
      });
    });
  }

  function refresh() {
    trigger.value++;
  }

  return {
    VertexTrackingSheet,
    CanvasShapes,
    DrawingShapes,
    getPosition,
    addShape,
    addHandler,
    removeShape,
    removeShapesByRole,
    enableHandler,
    handlerHitSize,
    hitSize,
    rulerCm,
    pointSize,
    lineThickness,
    updateHandlersPosition,
    trigger,
    refresh
  };
}
