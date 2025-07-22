const DEFINITION = {
  1: "vertex",
  2: "line",
  3: "triangle",
  4: "rectangle",
};

export default {
  define({ vertexSize }) {
    const shape = DEFINITION[vertexSize];
    return shape;
  },
};

// export function ruler({ vertices }) {
//     return shape({ vertices, color: 'skyblue', type: 'ruler' });
// }

// export function target({ vertices }) {
//     return shape({ vertices, color: 'tomato', type: 'target' });
// }
