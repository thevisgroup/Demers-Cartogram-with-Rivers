const fs = require("fs");
const { parse } = require("csv-parse");
const likertscale = () => {
    return {
        "Strongly agree": 0,
        "Agree": 0,
        "Neither agree nor disagree": 0,
        "Disagree": 0,
        "Strongly disagree": 0,
    }
}

const taskList = [
    { ccg: "E38000243", withRiver: true, allowCrossing: false, correct: 0 },
    { ccg: "E38000136", withRiver: true, allowCrossing: false, correct: 0 },
    { ccg: "E38000242", withRiver: true, allowCrossing: false, correct: 0 },
    { ccg: "E38000244", withRiver: true, allowCrossing: false, correct: 0 },
    { ccg: "E38000243", withRiver: false, allowCrossing: true, correct: 0 },
    { ccg: "E38000136", withRiver: false, allowCrossing: true, correct: 0 },
    { ccg: "E38000242", withRiver: false, allowCrossing: true, correct: 0 },
    { ccg: "E38000244", withRiver: false, allowCrossing: true, correct: 0 },
    { ccg: "E38000243", withRiver: true, allowCrossing: true, correct: 0 },
    { ccg: "E38000136", withRiver: true, allowCrossing: true, correct: 0 },
    { ccg: "E38000242", withRiver: true, allowCrossing: true, correct: 0 },
    { ccg: "E38000244", withRiver: true, allowCrossing: true, correct: 0 },
    { ccg: "E38000243", withRiver: false, allowCrossing: false, correct: 0 },
    { ccg: "E38000136", withRiver: false, allowCrossing: false, correct: 0 },
    { ccg: "E38000242", withRiver: false, allowCrossing: false, correct: 0 },
    { ccg: "E38000244", withRiver: false, allowCrossing: false, correct: 0 },
];

const resultPerCCG = {
    E38000243: { withRiver: 0, withoutRiver: 0 },
    E38000136: { withRiver: 0, withoutRiver: 0 },
    E38000242: { withRiver: 0, withoutRiver: 0 },
    E38000244: { withRiver: 0, withoutRiver: 0 },
};

const resultPerQuestion = [
    { withRiver: 0, withoutRiver: 0, responseTime: 0 },
    { withRiver: 0, withoutRiver: 0, responseTime: 0 },
    { withRiver: 0, withoutRiver: 0, responseTime: 0 },
    { withRiver: 0, withoutRiver: 0, responseTime: 0 },

    { withRiver: 0, withoutRiver: 0, responseTime: 0 },
    { withRiver: 0, withoutRiver: 0, responseTime: 0 },
    { withRiver: 0, withoutRiver: 0, responseTime: 0 },
    { withRiver: 0, withoutRiver: 0, responseTime: 0 },

    { withRiver: 0, withoutRiver: 0, responseTime: 0 },
    { withRiver: 0, withoutRiver: 0, responseTime: 0 },
    { withRiver: 0, withoutRiver: 0, responseTime: 0 },
    { withRiver: 0, withoutRiver: 0, responseTime: 0 },

    { withRiver: 0, withoutRiver: 0, responseTime: 0 },
    { withRiver: 0, withoutRiver: 0, responseTime: 0 },
    { withRiver: 0, withoutRiver: 0, responseTime: 0 },
    { withRiver: 0, withoutRiver: 0, responseTime: 0 },
];

const result = {
    withRiver: { allowCrossing: 0, noCrossing: 0, total: 0 },
    withoutRiver: { allowCrossing: 0, noCrossing: 0, total: 0 },
};

let rowCount = 0;


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
            rowCount++;
            addFamiliarity(row);
            addLikert(row);
            for (let i = 0; i < taskList.length; i++) {
                const answer = row[i * 3 + 3];
                if (taskList[i].ccg === answer) {
                    taskList[i].correct++;
                    countPerQuestion(i);
                }
                const time = parseInt(row[i * 3 + 4]);
                resultPerQuestion[i].responseTime += time
            }

        })
        .on("end", function () {
            printResultPerQuestion();
            // printFamiliarity();
            // printLikert();
        });
}

readCSV();

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

function count() {
    fs.createReadStream("./result.csv")
        .pipe(parse({ delimiter: "$", relax_quotes: true, from_line: 1 }))
        .on("data", function (row) {
            rowCount++;
            for (let i = 0; i < taskList.length; i++) {
                if (taskList[i].ccg === row[i].split(",")[1].trim()) {
                    taskList[i].correct++;
                    countPerQuestion(i);
                }
                let time = parseInt(row[i].split(",")[2].trim().replace("\"", ""));
                console.log(time);
                resultPerQuestion[i].responseTime += time
            }
        })
        .on("end", function () {
            taskList.forEach((task) => {
                if (task.withRiver) {
                    if (task.allowCrossing) {
                        result.withRiver.allowCrossing += task.correct;
                    } else {
                        result.withRiver.noCrossing += task.correct;
                    }

                    result.withRiver.total += task.correct;
                } else {
                    if (task.allowCrossing) {
                        result.withoutRiver.allowCrossing += task.correct;
                    } else {
                        result.withoutRiver.noCrossing += task.correct;
                    }

                    result.withoutRiver.total += task.correct;
                }
            });
            // console.log(result);
            // console.log(resultPerQuestion);
            // console.log(resultPerCCG);
            printResultPerQuestion();
        });
}

//count();

function printResultPerQuestion() {
    console.log("with river");
    for (let i = 0; i < resultPerQuestion.length; i++) {
        console.log(`${resultPerQuestion[i].withRiver}`);
    }
    console.log("without river");
    for (let i = 0; i < resultPerQuestion.length; i++) {
        console.log(`${resultPerQuestion[i].withoutRiver}`);
    }

    console.log("response time");
    // print response time
    for (let i = 0; i < resultPerQuestion.length; i++) {
        console.log(`${resultPerQuestion[i].responseTime / 1000 / rowCount}`);
    }
}

function countPerQuestion(i) {
    if (taskList[i].withRiver) {
        resultPerQuestion[i].withRiver++;
        resultPerCCG[taskList[i].ccg].withRiver++;
    } else {
        resultPerQuestion[i].withoutRiver++;
        resultPerCCG[taskList[i].ccg].withoutRiver++;
    }
}


