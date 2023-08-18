const fs = require("fs");
const { parse } = require("csv-parse");
const { stringify } = require("csv-stringify");
const ttest = require('ttest');

const taskList = [
    { id: 1, ccg: "E38000243", withRiver: true, allowCrossing: false, correct: 0, time: 0, validCount: 0 },
    { id: 2, ccg: "E38000136", withRiver: true, allowCrossing: false, correct: 0, time: 0, validCount: 0 },
    { id: 3, ccg: "E38000242", withRiver: true, allowCrossing: false, correct: 0, time: 0, validCount: 0 },
    { id: 4, ccg: "E38000244", withRiver: true, allowCrossing: false, correct: 0, time: 0, validCount: 0 },
    { id: 5, ccg: "E38000243", withRiver: false, allowCrossing: true, correct: 0, time: 0, validCount: 0 },
    { id: 6, ccg: "E38000136", withRiver: false, allowCrossing: true, correct: 0, time: 0, validCount: 0 },
    { id: 7, ccg: "E38000242", withRiver: false, allowCrossing: true, correct: 0, time: 0, validCount: 0 },
    { id: 8, ccg: "E38000244", withRiver: false, allowCrossing: true, correct: 0, time: 0, validCount: 0 },
    { id: 9, ccg: "E38000243", withRiver: true, allowCrossing: true, correct: 0, time: 0, validCount: 0 },
    { id: 10, ccg: "E38000136", withRiver: true, allowCrossing: true, correct: 0, time: 0, validCount: 0 },
    { id: 11, ccg: "E38000242", withRiver: true, allowCrossing: true, correct: 0, time: 0, validCount: 0 },
    { id: 12, ccg: "E38000244", withRiver: true, allowCrossing: true, correct: 0, time: 0, validCount: 0 },
    { id: 13, ccg: "E38000243", withRiver: false, allowCrossing: false, correct: 0, time: 0, validCount: 0 },
    { id: 14, ccg: "E38000136", withRiver: false, allowCrossing: false, correct: 0, time: 0, validCount: 0 },
    { id: 15, ccg: "E38000242", withRiver: false, allowCrossing: false, correct: 0, time: 0, validCount: 0 },
    { id: 16, ccg: "E38000244", withRiver: false, allowCrossing: false, correct: 0, time: 0, validCount: 0 },
];

// with or without river
// always disallow crossing
const group1 = { name: "group1", tasks: taskList.filter((task) => !task.allowCrossing).map((task) => task.id), accuracy: [], response: [] };

// always allow crossing
const group2 = { name: "group2", tasks: taskList.filter((task) => task.allowCrossing).map((task) => task.id), accuracy: [], response: [] };

// allow and disallow crossing
// with rivers
const group3 = { name: "group3", tasks: taskList.filter((task) => task.withRiver).map((task) => task.id), accuracy: [], response: [] };

// without rivers
const group4 = { name: "group4", tasks: taskList.filter((task) => !task.withRiver).map((task) => task.id), accuracy: [], response: [] };

const groupAll = { name: "groupAll", tasks: taskList.map((task) => task.id), accuracy: [], response: [] };

const groups = [group1, group2, group3, group4, groupAll];
// const groups = [group1];


const result_column = ["withRiver", "allowCrossing", "correct", "rt"];
const result = [];

let rowCount = 0;
function readCSV() {
    fs.createReadStream("./result.csv")
        .pipe(parse({ delimiter: ",", from_line: 1 }))
        .on("data", function (row) {
            for (let i = 0; i < taskList.length; i++) {
                const time = parseInt(row[i * 2 + 1]) / 1000;

                // exclude invalid data, RT >= 20s
                if (time >= 60) {
                    continue;
                }

                rowCount++;
                const correctAnswer = taskList[i].ccg;
                const answer = row[i * 2];

                taskList[i].time += time;
                taskList[i].validCount++;
                taskList[i].correct += correctAnswer === answer;

                result.push({
                    id: taskList[i].id,
                    ccg: taskList[i].ccg,
                    withRiver: taskList[i].withRiver ? 1 : 0,
                    allowCrossing: taskList[i].allowCrossing ? 1 : 0,
                    correct: correctAnswer === answer ? 1 : 0,
                    rt: time,
                    validCount: taskList[i].validCount,
                });
                // for (const group of groups) {
                //     if (group.tasks.includes(taskNo)) {
                //         if (withRiver) {
                //             // taskNo, correct
                //             group.accuracy.push([taskNo, correctAnswer === answer ? 1 : 0, 0]);
                //             // taskNo, time
                //             group.response.push([taskNo, time, 0]);
                //         } else {
                //             // taskNo, correct
                //             group.accuracy.push([taskNo, 0, correctAnswer === answer ? 1 : 0]);
                //             // taskNo, time
                //             group.response.push([taskNo, 0, time]);
                //         }
                //     }
                // }

            }

        })
        .on("end", function () {
            console.log(rowCount);
            let w = result.filter((row) => !row.allowCrossing && row.withRiver).map((row) => row.rt);
            let wo = result.filter((row) => !row.allowCrossing && !row.withRiver).map((row) => row.rt);
            tTest(w, wo, "group1");

            w = result.filter((row) => row.allowCrossing && row.withRiver).map((row) => row.rt);
            wo = result.filter((row) => row.allowCrossing && !row.withRiver).map((row) => row.rt);
            tTest(w, wo, "group2");

            w = result.filter((row) => !row.allowCrossing && row.withRiver).map((row) => row.rt);
            wo = result.filter((row) => row.allowCrossing && row.withRiver).map((row) => row.rt);
            tTest(w, wo, "group3");

            w = result.filter((row) => row.allowCrossing && !row.withRiver).map((row) => row.rt);
            wo = result.filter((row) => !row.allowCrossing && !row.withRiver).map((row) => row.rt);
            tTest(w, wo, "group4");

            //E38000136
            w = result.filter((row) => row.withRiver).map((row) => row.rt);
            wo = result.filter((row) => !row.withRiver).map((row) => row.rt);
            tTest(w, wo, "group5");


            computeSingleGroup();

            taskList.forEach((task) => {
                task.time = (task.time / task.validCount).toFixed(2);
                task.correct = (task.correct / task.validCount).toFixed(2);
                for (const group of groups) {
                    if (group.tasks.includes(task.id)) {
                        group.accuracy.push([task.id, task.correct, 0]);
                        group.response.push([task.id, task.time, 0]);
                    }
                }
            });


            for (const group of groups) {
                if (group.name != "groupAll") {
                    const accuracy = Array(4).fill(Array(3).fill(0));
                    const response = Array(4).fill(Array(3).fill(0));
                    for (let i = 0; i < group.tasks.length / 2; i++) {
                        if (group.name == "group2" || group.name == "group3") {
                            group.accuracy[i][2] = group.accuracy[i][1];
                            group.response[i][2] = group.response[i][1];
                            group.accuracy[i][1] = group.accuracy[i + group.tasks.length / 2][1];
                            group.response[i][1] = group.response[i + group.tasks.length / 2][1];
                        } else {
                            group.accuracy[i][2] = group.accuracy[i + group.tasks.length / 2][1];
                            group.response[i][2] = group.response[i + group.tasks.length / 2][1];
                        }
                        group.accuracy[i][0] = taskList.find((task) => task.id === group.accuracy[i][0]).ccg;
                        group.response[i][0] = taskList.find((task) => task.id === group.response[i][0]).ccg;
                        accuracy[i] = group.accuracy[i];
                        response[i] = group.response[i];
                    }

                    const columns = ["taskNo", "with", "without"];

                    writeCSV(group.name + "_accuracy", columns, accuracy);
                    writeCSV(group.name + "_response", columns, response);
                }

            }
        });
}
readCSV();

function computeSingleGroup() {
    const ccgs = [
        { code: "E38000243", with: [], without: [] },
        { code: "E38000136", with: [], without: [] },
        { code: "E38000242", with: [], without: [] },
        { code: "E38000244", with: [], without: [] },
    ];

    const taskListCopy = [...taskList];

    taskListCopy.forEach((task) => {
        const ccg = ccgs.find((ccg) => ccg.code === task.ccg);
        const single = { correct: task.correct, total: task.validCount, rt: task.time };
        if (task.withRiver) {
            ccg.with.push(single);
        } else {
            ccg.without.push(single);
        }
    });


    ccgs.forEach((ccg) => {
        const totalw = ccg.with.reduce((a, b) => a.total + b.total)
        ccg.wrt = ccg.with.reduce((a, b) => a.rt + b.rt) / totalw;
        ccg.with = ccg.with.reduce((a, b) => a.correct + b.correct) / totalw;

        const totalwo = ccg.without.reduce((a, b) => a.total + b.total)
        ccg.wort = ccg.without.reduce((a, b) => a.rt + b.rt) / totalwo;
        ccg.without = ccg.without.reduce((a, b) => a.correct + b.correct) / totalwo;
    });

    const columns = ["CCG Code", "With River", "Without River", "With River RT", "Without River RT"];
    const result = [];
    ccgs.forEach((ccg) => {
        result.push([ccg.code, ccg.with, ccg.without, ccg.wrt, ccg.wort]);
    });

    writeCSV("all", columns, result);
}

function tTest(w, wo, group) {
    let t = ttest(wo, w)
    console.log(w);
    console.log(wo);
    console.log(group);
    console.log("df:", t.freedom());
    console.log("t:", t.testValue());
    console.log("confidence:", t.confidence());
    console.log("p:", t.pValue());
    console.log("t:", t.valid());
    console.log(t);
}

function writeCSV(name, columns, data) {
    const writableStream = fs.createWriteStream(`./${name}.csv`);
    const stringifier = stringify({ header: true, columns: columns });
    data.forEach((row) => {
        stringifier.write(row);
    });
    stringifier.pipe(writableStream);
}
