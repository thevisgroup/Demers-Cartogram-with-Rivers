const bounding_box = (topLeft, bottomRight, point) => {
  return (
    topLeft.x <= point.x &&
    point.x <= bottomRight.x &&
    topLeft.y <= point.y &&
    point.y <= bottomRight.y
  );
};

const cal_slope = (start, end) => {
  return (start[1] - end[1]) / (start[0] - end[0]);
};

const is_upper_side = (node, color) => {
  return node.attr("original_fill") === color;
};

export { bounding_box, cal_slope, is_upper_side };
