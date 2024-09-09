import math
from dataclasses import dataclass
from typing import List
import pandas as pd


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

ccg_list_filtered = [CCGData(**data.__dict__) for data in ccg_list]

file_path = "/Users/henry/Git/PhD/GHRVis/user-study/result.csv"
df = pd.read_csv(file_path, header=None)

odd_columns = df.iloc[:, ::2]  # 1st, 3rd, 5th, etc.
even_columns = df.iloc[:, 1::2]  # 2nd, 4th, 6th, etc.

time_values = []

for row_idx, (odd_row, even_row) in enumerate(
    zip(odd_columns.itertuples(index=False), even_columns.itertuples(index=False))
):
    for pair_idx, pair in enumerate(zip(odd_row, even_row)):
        ccg = ccg_list[pair_idx]
        ccg.time += pair[1]
        if pair[0] == ccg.ccg:
            ccg.correct += 1
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

if filtered_times:
    filtered_times.sort()
    filtered_q1_index = int(0.25 * len(filtered_times))
    filtered_q3_index = int(0.75 * len(filtered_times))
    filtered_q1 = filtered_times[filtered_q1_index]
    filtered_q3 = filtered_times[filtered_q3_index]
    filtered_iqr = filtered_q3 - filtered_q1
    print(f"Filtered Q1: {filtered_q1}, Filtered Q3: {filtered_q3}, Filtered IQR: {filtered_iqr}")
else:
    print("filtered_times is empty, cannot calculate IQR.")

# Update ccg_list_filtered only when the time is not filtered
for row_idx, (odd_row, even_row) in enumerate(
    zip(odd_columns.itertuples(index=False), even_columns.itertuples(index=False))
):
    for pair_idx, pair in enumerate(zip(odd_row, even_row)):
        time_value = pair[1]

        # Check if the time value is in the filtered times
        if time_value in filtered_times:
            ccg = ccg_list_filtered[pair_idx]
            ccg.time += time_value
            ccg.valid_count += 1
            if pair[0] == ccg.ccg:
                ccg.correct += 1

# Compute mean after filtering
filtered_mean = sum(filtered_times) / len(filtered_times) if filtered_times else 0

mean_time = sum(time_values) / len(time_values) if time_values else 0

print(f"Original count: {len(time_values)}, Filtered count: {len(filtered_times)}")
print(f"Original Mean: {mean_time} Filtered mean: {filtered_mean}")

# Compute median time
time_values.sort()
n = len(time_values)
if n % 2 == 1:
    median_time = time_values[n // 2]
else:
    median_time = (time_values[n // 2 - 1] + time_values[n // 2]) / 2

# The same for filtered_times
filtered_times.sort()
n = len(filtered_times)
if n % 2 == 1:
    filtered_median_time = filtered_times[n // 2]
else:
    filtered_median_time = (filtered_times[n // 2 - 1] + filtered_times[n // 2]) / 2

filtered_mean = sum(filtered_times) / len(filtered_times) if filtered_times else 0

print(f"Original median: {median_time} Filtered median: {filtered_median_time} Filtered mean: {filtered_mean}")

# Compute the range of both original and filtered times
time_range = max(time_values) - min(time_values)
filtered_range = max(filtered_times) - min(filtered_times)

print(
    f"Original range: {min(time_values)} - {max(time_values)} Filtered range: {min(filtered_times)} - {max(filtered_times)}"
)

# Group data
group_1 = [
    data for data in ccg_list_filtered if data.with_river and data.allow_crossing
]
group_2 = [
    data for data in ccg_list_filtered if data.with_river and not data.allow_crossing
]
group_3 = [
    data for data in ccg_list_filtered if not data.with_river and data.allow_crossing
]
group_4 = [
    data
    for data in ccg_list_filtered
    if not data.with_river and not data.allow_crossing
]

# For each group, sum the correct and time values, print them
for group in [group_1, group_2, group_3, group_4]:
    total_correct = sum(data.correct for data in group)
    total_time = sum(data.time for data in group)
    total_valid_count = sum(data.valid_count for data in group)
    print()
    print(f"Group: {group[0].with_river} {group[0].allow_crossing}")
    print(f"Correct: {total_correct}")
    print(f"Time: {total_time}")
    print(f"Valid count: {total_valid_count}")
    print(f"Mean time: {total_time / total_valid_count if total_valid_count else 0}")
    print(f"Accuracy: {total_correct / total_valid_count if total_valid_count else 0}")
    print()
