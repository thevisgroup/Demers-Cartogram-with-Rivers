import statsmodels.api as sm
import statsmodels.formula.api as smf
import pandas as pd

file_path = "/Users/henry/Git/PhD/GHRVis/user-study/responses.csv"
df = pd.read_csv(file_path)

# Logistic Regression with Interaction for Accuracy
logit_model_interaction = smf.logit(
    "is_correct ~ river_presence * node_movement_constraint", data=df
).fit()
logit_interaction_summary = logit_model_interaction.summary()

# Linear Regression with Interaction for Response Time
lin_model_interaction = smf.ols(
    "time_taken ~ river_presence * node_movement_constraint", data=df
).fit()
lin_interaction_summary = lin_model_interaction.summary()

print(logit_interaction_summary, lin_interaction_summary)

import matplotlib.pyplot as plt
import seaborn as sns

df["river_presence"] = df["river_presence"].map({1: "Yes", 0: "No"})
df["node_movement_constraint"] = df["node_movement_constraint"].map({0: "Yes", 1: "No"})

# Set up visualization style
sns.set(style="whitegrid")

# Visualization 1: Accuracy vs. River Presence & Node Movement Constraint
plt.figure(figsize=(8, 5), dpi=200)
sns.barplot(
    x="river_presence",
    y="is_correct",
    hue="node_movement_constraint",
    data=df,
    errorbar=None,
)
plt.xlabel("River Presence")
plt.ylabel("Accuracy")
plt.title("Accuracy by River Presence and Node Movement Constraint")
plt.legend(title="Node Movement Constraint")
# plt.show()

# Visualization 2: Response Time vs. River Presence & Node Movement Constraint
plt.figure(figsize=(8, 5), dpi=200)

# 2. Overlay means with markers
sns.pointplot(
    data=df,
    x="river_presence",
    y="time_taken",
    hue="node_movement_constraint",
    errorbar="sd",  # Add SD bars
    dodge=0.4,  # Align with boxplot groups
    join=False,
    palette="dark",  # Different color for visibility
    markers="D",  # Diamond shape for mean
    linestyles="",
)

plt.title("Response Time Distribution with Mean ± SD")
plt.xlabel("River Presence")
plt.ylabel("Response Time (ms)")
plt.legend(title="Node Movement Constraint")
plt.tight_layout()
# plt.show()

# Visualization 3: Interaction Effect on Response Time
plt.figure(figsize=(8, 5), dpi=200)
sns.pointplot(
    x="river_presence",
    y="time_taken",
    hue="node_movement_constraint",
    data=df,
    dodge=True,
    markers=["o", "s"],
    capsize=0.1,
)
plt.xlabel("River Presence")
plt.ylabel("Mean Response Time (ms)")
plt.title(
    "Interaction Effect of River Presence & Node Movement Constraint on Response Time"
)
plt.legend(title="Node Movement Constraint")
# plt.show()
