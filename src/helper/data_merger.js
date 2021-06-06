const csv = require("csv-parser");
const fs = require("fs");
const path = require("path");

const shapefile = require("../../public/data/ccg_2020.json");
const ccgs = shapefile.objects.ccg.geometries;

const _indicators = [];
const _output = { metadata: { Person: {}, Male: {}, Female: {} } };

fs.createReadStream(
  path.resolve(__dirname, "./../../public/data/cardiovascular_00754.csv")
)
  .pipe(csv({ separator: "\t" }))
  .on("data", (data) => {
    _indicators.push(data);
    _output[data["ONS code"]] = { name: data["Level description"] };
  })
  .on("end", () => {
    merge();
    calculateMinMax();
    writeResults();
  });

const format = (f) => {
  return {
    value: Number(f["Indicator value"]),
    "CI lower": Number(f["CI lower"]),
    "CI upper": Number(f["CI upper"]),
  };
};

const merge = () => {
  ccgs.forEach((c) => {
    _indicators
      .filter((i) => i["ONS code"] === c.properties.id)
      .forEach((f) => {
        _output[f["ONS code"]][f["Gender"]] = format(f);
      });
  });

  _indicators
    .filter((i) => i["ONS code"] === "E92000001")
    .forEach((f) => {
      _output[f["ONS code"]][f["Gender"]] = format(f);
    });
};

const calculateMinMax = () => {
  const array = Object.values(_output);
  array.shift();
  array.shift();

  ["Person", "Male", "Female"].forEach((t) => {
    ["value", "CI lower", "CI upper"].forEach((v) => {
      let list = array.map((o) => o[t][v]);
      const min = Math.min(...list);
      const max = Math.max(...list);
      const range = Number((max - min).toFixed(2));
      _output["metadata"][t][v] = {
        min,
        max,
        range,
      };
    });
  });
};

// eslint-disable-next-line no-unused-vars
const writeResults = () => {
  fs.writeFileSync(
    path.resolve(__dirname, "./../../public/data/cardiovascular_00754.json"),
    JSON.stringify(_output)
  );
};
