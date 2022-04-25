const flatten_path = (pathData, translate) => {
  let result = "";

  pathData.forEach((pair) => {
    result += pair.type;
    result += pair.values[0] + translate[0];
    result += ",";
    result += pair.values[1] + translate[1];
  });
  return result;
};

export { flatten_path };
