const data = require("../../public/data/ccg_2020_simplified.json");
const ccgs = data.objects.ccg.geometries;

ccgs.forEach((c) => {
  console.log(c.properties.ccg20nm);
});
