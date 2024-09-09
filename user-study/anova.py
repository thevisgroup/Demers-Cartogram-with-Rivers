import numpy as np
import pandas as pd
import statsmodels.formula.api as smf
import matplotlib.pyplot as plt
import seaborn as sns

file_path = "/Users/henry/Git/PhD/GHRVis/user-study/responses.csv"
df = pd.read_csv(file_path)

pd.set_option("display.max_rows", None)
pd.set_option("display.max_columns", None)
pd.set_option("display.width", None)
pd.set_option("display.max_colwidth", None)  # Prevent content truncation

time_model = smf.mixedlm(
    "time_taken ~ river_presence * node_movement_constraint",
    data=df,
    groups="participant_id",
).fit()

# Extract residuals
residuals = time_model.resid
fitted = time_model.fittedvalues

# Plot 1: Histogram of residuals
sns.histplot(residuals, kde=True)
plt.title("Histogram of Residuals")
plt.xlabel("Residual")
# plt.show()

df["log_time_taken"] = np.log(df["time_taken"])

log_time_model = smf.mixedlm(
    "log_time_taken ~ river_presence * node_movement_constraint",
    data=df,
    groups="participant_id",
).fit()

# print("time_model.summary()")
# print(time_model.summary())
# print("log_time_model.summary()")
# print(log_time_model.summary())

from pymer4.models import Lmer

df["river_presence"] = df["river_presence"].astype(int)
df["node_movement_constraint"] = df["node_movement_constraint"].astype(int)
df["participant_id"] = df["participant_id"].astype(str)

# Fit the GLMM (binomial logistic regression with random intercept for participant)
model = Lmer(
    formula="is_correct ~ river_presence * node_movement_constraint + (1|participant_id)",
    data=df,
    family="binomial",
)

# Fit and print summary
accuracy = model.fit()
print(accuracy)


df["fitted"] = model.predict(df, skip_data_checks=True, verify_predictions=False)

# Calculate Pearson residuals
df["residual"] = (df["is_correct"] - df["fitted"]) / np.sqrt(
    df["fitted"] * (1 - df["fitted"])
)

# Pearson Chi-squared statistic
pearson_chi2 = np.sum(df["residual"] ** 2)

# Degrees of freedom = N - number of fixed effects (Intercept + 3 terms)
df_resid = len(df) - 4

# Overdispersion statistic
phi = pearson_chi2 / df_resid
print(pearson_chi2, df_resid)
print(f"Overdispersion (φ) = {phi:.3f}")

import matplotlib.pyplot as plt
import seaborn as sns

sns.set(style="whitegrid")

df["river_presence"] = df["river_presence"].map({1: "Yes", 0: "No"})
df["node_movement_constraint"] = df["node_movement_constraint"].map({0: "Yes", 1: "No"})
plt.figure(figsize=(8, 5), dpi=200)


default_palette = sns.color_palette("deep")
default_blue = default_palette[0]  # First color (blue)
default_orange = default_palette[1]  # Second color (orange)


_type = "is_correct"
# _type = "time_taken"


g = sns.pointplot(
    x="river_presence",
    y=_type,
    hue="node_movement_constraint",
    data=df,
    dodge=True,
    markers=["o", "s"],
    palette={"Yes": default_blue, "No": default_orange},
    errorbar=None,
)

plt.xlabel("River Presence")


if _type == "time_taken":
    plt.title(
        "Interaction Effect of River Presence & Node Movement Constraint on Response Time"
    )
    plt.ylabel("Mean Response Time (ms)")
else:
    plt.title(
        "Interaction Effect of River Presence & Node Movement Constraint on Accuracy"
    )
    plt.ylabel("Mean Accuracy")


plt.legend(title="Node Movement Constraint")
# plt.show()
