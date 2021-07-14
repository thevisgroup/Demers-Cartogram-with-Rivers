const fs = require("fs");
const path = require("path");

const read = (name) => {
  const p = path.resolve(__dirname, `../../public/data/${name}`);

  try {
    const data = fs.readFileSync(p, "utf8");
    return data;
  } catch (err) {
    console.error(err);
  }
};

const write = (name, content) => {
  const p = path.resolve(__dirname, `../../public/data`);
  fs.mkdirSync(p, { recursive: true }, (err) => {
    if (err) throw err;
  });

  let writer = fs.createWriteStream(`${p}/${name}`, {
    flags: "w",
  });
  writer.write(content);
  writer.end();
};

const inList = (id, type) => {
  const result = [];

  const stateList = {
    missouri: ["4", "24", "56", "58", "71", "74", "75", "80", "92", "112"],
    mississippi: ["24", "56", "61", "62", "72", "73", "93", "109", "111"],
    rio_grande: ["10", "22", "97"],
  };

  const countyList = {
    missouri: [
      "6668",
      "6674",
      "6696",
      "6713",
      "7105",
      "6703",
      "7081",
      "6677",
      "7435",
      "6695",
      "7079",
      "6702",
      "7083",
      "7082",
      "7439",
      "7095",
      "7085",
      "8202",
      "8197",
      "5635",
      "7444",
      "7450",
      "6724",
      "7483",
      "7456",
      "7482",
      "6770",
      "6730",
      "6803",
      "6738",
      "6742",
      "7489",
      "7428",
      "6727",
      "5894",
      "6805",
      "5929",
      "6744",
      "5887",
      "6782",
      "6729",
      "6780",
      "6547",
      "6556",
      "6628",
      "6589",
      "6790",
      "5972",
      "5953",
      "6002",
      "6582",
      "6621",
      "6581",
      "6571",
      "6562",
      "6642",
      "6569",
      "6599",
      "6593",
      "6055",
      "6590",
      "6555",
      "6572",
      "6637",
      "5717",
      "6654",
      "6682",
      "7065",
      "6661",
      "6689",
      "7466",
      "6641",
      "6685",
      "6667",
      "6688",
    ],
    mississippi: [
      "8172",
      "6623",
      "6602",
      "6627",
      "5933",
      "5874",
      "5734",
      "5900",
      "7556",
      "6403",
      "6381",
      "6447",
      "6380",
      "6405",
      "6387",
      "6377",
      "6425",
      "6378",
      "6407",
      "5193",
      "6477",
      "7569",
      "6480",
      "5226",
      "5211",
      "5181",
      "6469",
      "6539",
      "5696",
      "6612",
      "5736",
      "5748",
      "5659",
      "6617",
      "5219",
      "6108",
      "6093",
      "7513",
      "5691",
      "5693",
      "5738",
      "5723",
      "5755",
      "5658",
      "5664",
      "6637",
      "5717",
      "5732",
      "6462",
      "8158",
      "8157",
      "6455",
      "8116",
      "8173",
      "8142",
      "8132",
      "5700",
      "5665",
      "8122",
      "6238",
      "6464",
      "6223",
      "6222",
      "6394",
      "6535",
      "6538",
      "6491",
      "6193",
      "6208",
      "5724",
      "6059",
      "7574",
      "7538",
      "7539",
      "6395",
      "6401",
      "6474",
      "6199",
      "6190",
      "6229",
      "6214",
      "6236",
      "6201",
      "6178",
      "6213",
      "6211",
      "6220",
      "6793",
      "5916",
      "7431",
      "6548",
    ],
    rio_grande: [
      "7607",
      "7807",
      "7747",
      "7818",
      "7825",
      "7616",
      "6865",
      "6886",
      "6885",
      "6858",
      "6881",
      "5333",
      "5362",
      "5359",
      "5307",
      "6887",
      "6879",
      "5317",
      "6873",
      "6890",
      "5346",
      "7774",
      "7700",
      "7656",
      "7838",
      "7799",
      "7693",
    ],
  };

  if (type === "state") {
    for (const key in stateList) {
      if (stateList[key].includes(String(id))) {
        result.push(key);
      }
    }
  } else if (type === "county") {
    for (const key in countyList) {
      if (countyList[key].includes(String(id))) {
        result.push(key);
      }
    }
  }

  return result;
};

const updateShapefile = () => {
  const content = JSON.parse(read("us_state_county.json"));

  for (let i = 0; i < content.objects.state.geometries.length; i++) {
    const insert = inList(
      content.objects.state.geometries[i].properties.fid,
      "state"
    );
    content.objects.state.geometries[i].properties.river = insert;
  }

  for (let i = 0; i < content.objects.county.geometries.length; i++) {
    const insert = inList(
      content.objects.county.geometries[i].properties.id,
      "county"
    );
    content.objects.county.geometries[i].properties.river = insert;
  }

  write("us_state_county.json", JSON.stringify(content));
};

updateShapefile();
