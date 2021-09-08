const checkOverlap = (type, A, B) => {
  if (type === "rect") {
    return A.X1 < B.X2 && A.X2 > B.X1 && A.Y1 > B.Y2 && A.Y2 < B.Y1;
  }
};

export { checkOverlap };
