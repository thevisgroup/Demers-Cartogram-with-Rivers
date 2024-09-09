import math
from dataclasses import dataclass
from typing import List
import pandas as pd


# process the csv file and remove outliers, save into responses.csv

@dataclass
class Response:
    user_id: int
    task_id: int
    with_river: int
    allow_crossing: int
    correct: int
    time: int


@dataclass
class CCGData:
    id: int
    ccg: str
    with_river: bool
    allow_crossing: bool
    correct: int
    time: int
    valid_count: int


# Data list
ccg_list: List[CCGData] = [
    CCGData(
        id=1,
        ccg="E38000243",
        with_river=True,
        allow_crossing=False,
        correct=0,
        time=0,
        valid_count=0,
    ),
    CCGData(
        id=2,
        ccg="E38000136",
        with_river=True,
        allow_crossing=False,
        correct=0,
        time=0,
        valid_count=0,
    ),
    CCGData(
        id=3,
        ccg="E38000242",
        with_river=True,
        allow_crossing=False,
        correct=0,
        time=0,
        valid_count=0,
    ),
    CCGData(
        id=4,
        ccg="E38000244",
        with_river=True,
        allow_crossing=False,
        correct=0,
        time=0,
        valid_count=0,
    ),
    CCGData(
        id=5,
        ccg="E38000243",
        with_river=False,
        allow_crossing=True,
        correct=0,
        time=0,
        valid_count=0,
    ),
    CCGData(
        id=6,
        ccg="E38000136",
        with_river=False,
        allow_crossing=True,
        correct=0,
        time=0,
        valid_count=0,
    ),
    CCGData(
        id=7,
        ccg="E38000242",
        with_river=False,
        allow_crossing=True,
        correct=0,
        time=0,
        valid_count=0,
    ),
    CCGData(
        id=8,
        ccg="E38000244",
        with_river=False,
        allow_crossing=True,
        correct=0,
        time=0,
        valid_count=0,
    ),
    CCGData(
        id=9,
        ccg="E38000243",
        with_river=True,
        allow_crossing=True,
        correct=0,
        time=0,
        valid_count=0,
    ),
    CCGData(
        id=10,
        ccg="E38000136",
        with_river=True,
        allow_crossing=True,
        correct=0,
        time=0,
        valid_count=0,
    ),
    CCGData(
        id=11,
        ccg="E38000242",
        with_river=True,
        allow_crossing=True,
        correct=0,
        time=0,
        valid_count=0,
    ),
    CCGData(
        id=12,
        ccg="E38000244",
        with_river=True,
        allow_crossing=True,
        correct=0,
        time=0,
        valid_count=0,
    ),
    CCGData(
        id=13,
        ccg="E38000243",
        with_river=False,
        allow_crossing=False,
        correct=0,
        time=0,
        valid_count=0,
    ),
    CCGData(
        id=14,
        ccg="E38000136",
        with_river=False,
        allow_crossing=False,
        correct=0,
        time=0,
        valid_count=0,
    ),
    CCGData(
        id=15,
        ccg="E38000242",
        with_river=False,
        allow_crossing=False,
        correct=0,
        time=0,
        valid_count=0,
    ),
    CCGData(
        id=16,
        ccg="E38000244",
        with_river=False,
        allow_crossing=False,
        correct=0,
        time=0,
        valid_count=0,
    ),
]
ccg_list_filtered: List[CCGData] = [
    CCGData(
        id=1,
        ccg="E38000243",
        with_river=True,
        allow_crossing=False,
        correct=0,
        time=0,
        valid_count=0,
    ),
    CCGData(
        id=2,
        ccg="E38000136",
        with_river=True,
        allow_crossing=False,
        correct=0,
        time=0,
        valid_count=0,
    ),
    CCGData(
        id=3,
        ccg="E38000242",
        with_river=True,
        allow_crossing=False,
        correct=0,
        time=0,
        valid_count=0,
    ),
    CCGData(
        id=4,
        ccg="E38000244",
        with_river=True,
        allow_crossing=False,
        correct=0,
        time=0,
        valid_count=0,
    ),
    CCGData(
        id=5,
        ccg="E38000243",
        with_river=False,
        allow_crossing=True,
        correct=0,
        time=0,
        valid_count=0,
    ),
    CCGData(
        id=6,
        ccg="E38000136",
        with_river=False,
        allow_crossing=True,
        correct=0,
        time=0,
        valid_count=0,
    ),
    CCGData(
        id=7,
        ccg="E38000242",
        with_river=False,
        allow_crossing=True,
        correct=0,
        time=0,
        valid_count=0,
    ),
    CCGData(
        id=8,
        ccg="E38000244",
        with_river=False,
        allow_crossing=True,
        correct=0,
        time=0,
        valid_count=0,
    ),
    CCGData(
        id=9,
        ccg="E38000243",
        with_river=True,
        allow_crossing=True,
        correct=0,
        time=0,
        valid_count=0,
    ),
    CCGData(
        id=10,
        ccg="E38000136",
        with_river=True,
        allow_crossing=True,
        correct=0,
        time=0,
        valid_count=0,
    ),
    CCGData(
        id=11,
        ccg="E38000242",
        with_river=True,
        allow_crossing=True,
        correct=0,
        time=0,
        valid_count=0,
    ),
    CCGData(
        id=12,
        ccg="E38000244",
        with_river=True,
        allow_crossing=True,
        correct=0,
        time=0,
        valid_count=0,
    ),
    CCGData(
        id=13,
        ccg="E38000243",
        with_river=False,
        allow_crossing=False,
        correct=0,
        time=0,
        valid_count=0,
    ),
    CCGData(
        id=14,
        ccg="E38000136",
        with_river=False,
        allow_crossing=False,
        correct=0,
        time=0,
        valid_count=0,
    ),
    CCGData(
        id=15,
        ccg="E38000242",
        with_river=False,
        allow_crossing=False,
        correct=0,
        time=0,
        valid_count=0,
    ),
    CCGData(
        id=16,
        ccg="E38000244",
        with_river=False,
        allow_crossing=False,
        correct=0,
        time=0,
        valid_count=0,
    ),
]

response_list: List[Response] = []

file_path = "/Users/henry/Git/PhD/GHRVis/user-study/result.csv"
df = pd.read_csv(file_path, header=None)

odd_columns = df.iloc[:, ::2]  # 1st, 3rd, 5th, etc.
even_columns = df.iloc[:, 1::2]  # 2nd, 4th, 6th, etc.

time_values = []

for row_idx, (odd_row, even_row) in enumerate(
    zip(odd_columns.itertuples(index=False), even_columns.itertuples(index=False))
):
    for pair_idx, pair in enumerate(zip(odd_row, even_row)):
        time_values.append(pair[1])  # Store time values


time_values.sort()
q1_index = int(0.25 * len(time_values))
q3_index = int(0.75 * len(time_values))
q1 = time_values[q1_index]
q3 = time_values[q3_index]
iqr = q3 - q1

print(f"Q1: {q1}, Q3: {q3}, IQR: {iqr}")

# Define outlier threshold using IQR
upper_bound = q3 + 1.5 * iqr
filtered_times = [x for x in time_values if x <= upper_bound]

for row_idx, (odd_row, even_row) in enumerate(
    zip(odd_columns.itertuples(index=False), even_columns.itertuples(index=False))
):
    for pair_idx, pair in enumerate(zip(odd_row, even_row)):
        time_value = pair[1]

        # Check if the time value is in the filtered times
        if time_value in filtered_times:
            ccg = ccg_list[pair_idx]
            response_list.append(
                Response(
                    user_id=row_idx + 1,
                    task_id=pair_idx + 1,
                    with_river=1 if ccg.with_river else 0,
                    allow_crossing=1 if ccg.allow_crossing else 0,
                    correct=1 if pair[0] == ccg.ccg else 0,
                    time=time_value,
                )
            )
print(response_list)

# turn response_list into a csv
df = pd.DataFrame(
    [
        [
            response.user_id,
            response.task_id,
            response.with_river,
            response.allow_crossing,
            response.correct,
            response.time,
        ]
        for response in response_list
    ],
    columns=[
        "participant_id",
        "task_id",
        "river_presence",
        "node_movement_constraint",
        "is_correct",
        "time_taken",
    ],
)
df.to_csv("/Users/henry/Git/PhD/GHRVis/user-study/responses.csv", index=False)
