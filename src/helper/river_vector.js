const bounding_box = (ref1, ref2, point) => {
  ref1 = { x: ref1[0], y: ref1[1] };
  ref2 = { x: ref2[0], y: ref2[1] };
  // ref1 : top right
  // ref2 : bottom left
  if (ref1.x >= ref2.x && ref1.y < ref2.y) {
    return (
      point.x <= ref1.x &&
      point.x >= ref2.x &&
      point.y >= ref1.y &&
      point.y <= ref2.y
    );
  }

  // ref1 : bottom right
  // ref2 : top left
  else if (ref1.x >= ref2.x && ref1.y >= ref2.y) {
    return (
      point.x < ref1.x &&
      point.x >= ref2.x &&
      point.y < ref1.y &&
      point.y >= ref2.y
    );
  }

  // ref1 : top left
  // ref2 : bottom right
  else if (ref1.x < ref2.x && ref1.y < ref2.y) {
    return (
      point.x >= ref1.x &&
      point.x < ref2.x &&
      point.y >= ref1.y &&
      point.y < ref2.y
    );
  }

  // ref1 : bottom left
  // ref2 : top right
  else if (ref1.x < ref2.x && ref1.y >= ref2.y) {
    return (
      point.x >= ref1.x &&
      point.x < ref2.x &&
      point.y < ref1.y &&
      point.y >= ref2.y
    );
  }
};

const cal_slope = (start, end) => {
  return (start[1] - end[1]) / (start[0] - end[0]);
};

const is_upper_side = (node, color) => {
  return node.attr("original_fill") === color;
};

export { bounding_box, cal_slope, is_upper_side };
