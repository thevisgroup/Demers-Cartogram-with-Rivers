const fs = require("fs");
const { parse } = require("csv-parse");
const { stringify } = require("csv-stringify");
const likertscale = () => {
    return {
        "Strongly agree": 0,
        "Agree": 0,
        "Neither agree nor disagree": 0,
        "Disagree": 0,
        "Strongly disagree": 0,
    }
}



const choropleth = likertscale();
const cartogram = likertscale();
const likertScales = {
    1: likertscale(),
    2: likertscale(),
    3: likertscale(),
    4: likertscale(),
    5: likertscale(),
}

function readCSV() {
    fs.createReadStream("./result.csv")
        .pipe(parse({ delimiter: ", ", relax_quotes: true, from_line: 1 }))
        .on("data", function (row) {
            addFamiliarity(row);
            addLikert(row);

        })
        .on("end", function () {
            printFamiliarity();
            printLikert();
        });
}
readCSV();

function writeCSV(name, columns, data) {
    const writableStream = fs.createWriteStream(`./${name}.csv`);
    const stringifier = stringify({ header: true, columns: columns });
    data.forEach((row) => {
        stringifier.write(row);
    });
    stringifier.pipe(writableStream);
}

function addFamiliarity(row) {
    choropleth[row[0].trim()]++;
    cartogram[row[1].trim()]++;
}

function addLikert(row) {
    for (let i = 1; i <= 5; i++) {
        likertScales[i][row[49 + i].trim()]++;
    }
}
function printLikert() {
    for (let i = 1; i <= 5; i++) {
        for (const key in likertScales[i]) {
            console.log(`${likertScales[i][key]}`)
        }
        console.log("");
    }
}

function printFamiliarity() {
    console.log("choropleth familiarity");
    for (const key in choropleth) {
        console.log(`${choropleth[key]}`)
    }

    console.log("cartogram familiarity");
    for (const key in cartogram) {
        console.log(`${cartogram[key]}`)
    }
}

