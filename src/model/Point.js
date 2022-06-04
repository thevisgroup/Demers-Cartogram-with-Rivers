export default class Point {
  constructor(x, y, size, shiftXY = false) {
    this.size = size && size > 0 ? size : 0;
    this.halfSize = this.size > 0 ? this.size / 2 : 0;

    // shiftXY is used to shift the point to the center of the rectangle
    if (shiftXY) {
      this.x = x + this.halfSize;
      this.y = y + this.halfSize;
      this.xRect = x;
      this.yRect = y;
    } else {
      this.x = x;
      this.y = y;
      this.xRect = x - this.halfSize;
      this.yRect = y - this.halfSize;
    }
  }

  get coord() {
    return [this.x, this.y];
  }

  get coordRect() {
    return [this.xRect, this.yRect];
  }

  set crossedRiver(river) {
    this.crossedRiver = river;
  }
}
