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

const groups = [group1, group2, group3, group4];
// const groups = [group1];


function readCSV() {
    fs.createReadStream("./result.csv")
        .pipe(parse({ delimiter: ",", from_line: 1 }))
        .on("data", function (row) {
            for (let i = 0; i < taskList.length; i++) {
                const time = parseInt(row[i * 2 + 1]) / 1000;

                if (time >= 20) {
                    continue;
                }

                const correctAnswer = taskList[i].ccg;
                const answer = row[i * 2];

                taskList[i].time += time;
                taskList[i].validCount++;
                taskList[i].correct += correctAnswer === answer;
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
                const accuracy = Array(4).fill(Array(3).fill(0));
                const response = Array(4).fill(Array(3).fill(0));
                for (let i = 0; i < group.tasks.length / 2; i++) {
                    group.accuracy[i][2] = group.accuracy[i + group.tasks.length / 2][1];
                    group.response[i][2] = group.response[i + group.tasks.length / 2][1];
                    group.accuracy[i][0] = taskList.find((task) => task.id === group.accuracy[i][0]).ccg;
                    group.response[i][0] = taskList.find((task) => task.id === group.response[i][0]).ccg;
                    accuracy[i] = group.accuracy[i];
                    response[i] = group.response[i];
                }

                // const accuracy_t = ttest(accuracy.map(a => a[1]), accuracy.map(a => a[2]), {})
                const accuracy_r = ttest(response.map(a => a[1]), response.map(a => a[2]), {})


                console.log(`${group.name} ttest response time: `)
                console.log(accuracy_r);
                // console.log(group.tasks.slice(0, 4));
                // console.log(group.tasks.slice(4, 8));
            }
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



