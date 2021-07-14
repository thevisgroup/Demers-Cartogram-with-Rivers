import * as pointInSvgPolygon from "point-in-svg-polygon";
import * as d3 from "d3";
import * as topojson from "topojson-client";

const processPIP = (type) => {
  const result = {};

  ["missouri", "mississippi", "rio_grande"].forEach((name) => {
    const points = d3
      .select(`path.river-layer.${name}`)
      ._groups[0][0].getPathData();

    const list = [];

    d3.selectAll(`.${type}-layer > path`)._groups[0].forEach((cp) => {
      const box = pointInSvgPolygon.segments(cp.getAttribute("d"));

      const id = cp.getAttribute(`${type}_id`);

      if (!list.includes(id)) {
        for (let index = 0; index < points.length; index++) {
          const mp = points[index];
          if (pointInSvgPolygon.isInside(mp.values, box)) {
            list.push(id);
            break;
          }
        }
      }
    });

    result[name] = list;
  });

  print(result);
};

const getPathCentroid = async (d) => {
  const path = d3.geoPath();
  const fid = d.properties.fid;
  const list = {
    missouri: ["4", "24", "56", "58", "71", "74", "75", "80", "92", "112"],
    mississippi: ["24", "56", "61", "62", "72", "73", "93", "109", "111"],
    rio_grande: ["10", "22", "97"],
  };

  const shapefile = await d3.json(`/data/us_state_county.json`);

  const states = topojson.feature(shapefile, shapefile.objects.state).features;

  const result = [];

  for (const key in list) {
    if (list[key].includes(String(fid))) {
      const state_path = states.find((e) => e.properties.fid === fid);

      result.push([path.centroid(state_path), key]);
    }
  }

  return result;
};

const print = (input) => {
  console.log(JSON.stringify(input));
};

export { processPIP, getPathCentroid };
