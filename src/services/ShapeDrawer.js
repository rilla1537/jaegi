export default {
  from(world) {
    return {
      using(ctx) {
        return {
          path(shape) {
            // 전개 연산자(...)를 사용해 배열의 복사본을 만듭니다.
            const trackingIndexes = [...shape.pointIndices];
            const startPos = world.getPosition(trackingIndexes.shift());

            ctx.beginPath();
            ctx.moveTo(startPos.x, startPos.y);

            trackingIndexes.forEach((index) => {
              const pos = world.getPosition(index);
              ctx.lineTo(pos.x, pos.y);
            });
            ctx.closePath();

            ctx.strokeStyle = shape.color;
            // ctx.lineWidth = world.lineThickness.value;
            ctx.lineWidth = shape.lineThickness;

            ctx.stroke();
          },
          handler(shapeData) {
            const halfSize = shapeData.size / 2;
            const { x, y } = world.getPosition(shapeData.pointIndices[0]);

            ctx.strokeStyle = shapeData.color;
            ctx.lineWidth = 1;
            ctx.strokeRect(x - halfSize, y - halfSize, shapeData.size, shapeData.size);
          },
        };
      },
    };
  },
};
