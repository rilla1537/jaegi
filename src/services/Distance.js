export const inPixel = (p1, p2) => {
  if (!p1 || !p2) return 0;
  return Math.hypot(p2.x - p1.x, p2.y - p1.y);
};
