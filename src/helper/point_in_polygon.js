import * as pointInSvgPolygon from "point-in-svg-polygon";
import * as d3 from "d3";

const processPIP = () => {
  const result = {};

  ["missouri", "mississippi", "rio_grande"].forEach((name) => {
    const points = d3
      .select(`path.river-layer.${name}`)
      ._groups[0][0].getPathData();

    const list = [];

    d3.selectAll(".county-layer > path")._groups[0].forEach((cp) => {
      const box = pointInSvgPolygon.segments(cp.getAttribute("d"));

      const county_id = cp.getAttribute("county_id");

      if (!list.includes(county_id)) {
        for (let index = 0; index < points.length; index++) {
          const mp = points[index];
          if (pointInSvgPolygon.isInside(mp.values, box)) {
            list.push(county_id);
            break;
          }
        }
      }
    });

    result[name] = list;
  });

  console.log(JSON.stringify(result));
};

export default processPIP;
