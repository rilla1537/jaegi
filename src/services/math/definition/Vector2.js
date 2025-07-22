export default class Vector2 {
  /**
   * @param {number} x
   * @param {number} y
   */
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }

  /**
   * 벡터 덧셈
   * @param {Vector2} v
   * @returns {Vector2}
   */
  add(v) {
    return new Vector2(this.x + v.x, this.y + v.y);
  }

  /**
   * 벡터 뺄셈
   * @param {Vector2} v
   * @returns {Vector2}
   */
  sub(v) {
    return new Vector2(this.x - v.x, this.y - v.y);
  }

  /**
   * 스칼라 곱
   * @param {number} s
   * @returns {Vector2}
   */
  multiplyScalar(s) {
    return new Vector2(this.x * s, this.y * s);
  }

  /**
   * 벡터 길이(노름)
   * @returns {number}
   */
  length() {
    return Math.hypot(this.x, this.y);
  }

  /**
   * 단위 벡터 (normalize)
   * @returns {Vector2}
   */
  normalize() {
    const len = this.length();
    if (len === 0) throw new Error("Zero-length vector cannot be normalized.");
    return this.multiplyScalar(1 / len);
  }

  /**
   * @param {Vector2} v
   * @returns {number}
   */
  dot(v) {
    return this.x * v.x + this.y * v.y;
  }

  /**
   * (옵션) 정보 출력용
   */
  toString() {
    return `(${this.x.toFixed(3)}, ${this.y.toFixed(3)})`;
  }
}
