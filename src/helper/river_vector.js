const bounding_box = (topLeft, bottomRight, point) => {
  return (
    topLeft[0] <= point[0] &&
    point[0] <= bottomRight[0] &&
    topLeft[1] <= point[1] &&
    point[1] <= bottomRight[1]
  );
};

const cal_slope = (start, end) => {
  return (start[1] - end[1]) / (start[0] - end[0]);
};

const is_upper_side = (node, color) => {
  return node.attr("original_fill") === color;
};

export { bounding_box, cal_slope, is_upper_side };
