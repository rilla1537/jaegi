import Vector2 from "./definition/Vector2";

/**
 * 원래 선분 d의 중점에서 수직으로,
 * 길이 length인 선분 d'의 양 끝점(Vector2)을 반환
 * 
 * 선분 d의 중심을 교차하는 선분 d'의 길이만 알고 있을 때, d'의 각 끝점을 찾는 함수
 *
 * @param {Vector2} v1  원래 선분 d의 첫 번째 끝점
 * @param {Vector2} v2  원래 선분 d의 두 번째 끝점
 * @param {number} length  생성할 선분 d'의 전체 길이
 * @returns {[Vector2, Vector2]} 길이 2 배열: [끝점A, 끝점B]
 */
export function midPerpVec({ v1, v2, length }) {
    // 1) 중점 계산
  const midpoint = v1.add(v2).multiplyScalar(0.5);

  // 2) 원래 선분의 방향 벡터
  const dir = v2.sub(v1);

  // 3) 수직 법선 벡터: (-dy, dx)
  const normal = new Vector2(-dir.y, dir.x).normalize();

  // 4) 절반 길이만큼 오프셋
  const half = length / 2;
  const offset = normal.multiplyScalar(half);

  // 5) 교차점 기준 양쪽 끝점
  const pointA = midpoint.add(offset);
  const pointB = midpoint.sub(offset);

  return [pointA, pointB];
}

/**
 * 선분 d의 중심을 기준으로 양끝을 비율 k만큼 연장·축소한 선분 d'의 양 끝점(Vector2)을 반환
 *
 * @param {Vector2} v1      원래 선분 d의 첫 번째 끝점
 * @param {Vector2} v2      원래 선분 d의 두 번째 끝점
 * @param {number} k        연장·축소 비율 (k > 1: 연장, 0 < k < 1: 축소)
 * @returns {[Vector2, Vector2]} 길이 2 배열: [새로운 끝점A, 새로운 끝점B]
 */
export function scaleSegment({ v1, v2, k }) {
  const mid = v1.add(v2).multiplyScalar(0.5);
  const newA = mid.add( v1.sub(mid).multiplyScalar(k) );
  const newB = mid.add( v2.sub(mid).multiplyScalar(k) );
  return [newA, newB];
}

/**
 * 선분 d의 각 끝점을, 선분 방향으로부터
 * 일정한 거리 k만큼 연장(또는 축소)한 선분 d'의 양 끝점(Vector2)을 반환
 *
 * @param {Vector2} v1    원래 선분 d의 첫 번째 끝점
 * @param {Vector2} v2    원래 선분 d의 두 번째 끝점
 * @param {number} k      이동 거리 (k > 0: 연장, k < 0: 축소, k = 0: 원래 끝점)
 * @returns {[Vector2, Vector2]}  길이 2 배열: [연장된 끝점A, 연장된 끝점B]
 */
export function addSegment({ v1, v2, k }) {
  // 1) 선분의 방향 벡터
  const dir = v2.sub(v1).normalize();
  
  // 2) 첫 번째 끝점은 dir 반대 방향으로, 두 번째 끝점은 dir 방향으로 k만큼 이동
  const newA = v1.add( dir.multiplyScalar(-k) );
  const newB = v2.add( dir.multiplyScalar( k) );
  
  return [newA, newB];
}

/**
 * 주어진 점(point)이, 선분 d(v1→v2)의 중점을 중심으로
 * 반대칭 직사각형(hit 박스) 안에 있는지 검사한다.
 *
 * hit 박스는
 *  - 축 방향: 선분 d의 방향으로 길이 |v2-v1|
 *  - 법선 방향: 길이 hit
 * 직사각형이며, 중점이 박스의 중심이다.
 *
 * @param {Vector2} point 검사할 점
 * @param {Vector2} v1    선분 d의 첫 번째 끝점
 * @param {Vector2} v2    선분 d의 두 번째 끝점
 * @param {number} hit    축법선 방향 반폭 (hitSize)
 * @returns {boolean}     박스 안에 있으면 true
 */
export function isPointInSegmentHitBox({ point, v1, v2, hit }) {
  // 1) 축 방향 단위 벡터와 법선 방향 단위 벡터
  const dir = v2.sub(v1).normalize();
  const normal = new Vector2(-dir.y, dir.x);

  // 2) 중점
  const mid = v1.add(v2).multiplyScalar(0.5);

  // 3) point → mid 벡터
  const rel = point.sub(mid);

  // 4) 축 성분, 법선 성분
  const u = rel.dot(dir);       // 축 방향 거리 (음수 ~ 양수)
  const v = rel.dot(normal);    // 법선 방향 거리

  // 5) 반길이, 반폭
  const halfLen = v2.sub(v1).length() / 2;
  const halfHit = hit / 2;

  return Math.abs(u) <= halfLen && Math.abs(v) <= halfHit;
}
