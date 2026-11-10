# DataForge AI — Data Dictionary
### Dataset: UCI Adult Census Income Benchmark Dataset
**Provenance:** 1994 US Census Bureau database (Ronny Kohavi & Barry Becker)  
**URL:** [https://archive.ics.uci.edu/dataset/2/adult](https://archive.ics.uci.edu/dataset/2/adult)  
**Total Records:** 32,561  
**Original Attributes:** 15  
**Engineered Features:** 4  

---

## 1. Raw Feature Specification

| Feature Name | Data Type | Inferred Type | Missing Count | Missing % | Value Range / Categories | Description |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `age` | `int64` | Numerical | 0 | 0.0% | 17 to 90 | Age of the individual in continuous chronological years. |
| `workclass` | `object` | Categorical | 1,836 (`?`) | 5.64% | Private, Self-emp-not-inc, Self-emp-inc, Federal-gov, Local-gov, State-gov, Without-pay, Never-worked | Employment sector classification. |
| `fnlwgt` | `int64` | Numerical | 0 | 0.0% | 12,285 to 1,484,705 | Final weight (CPS sampling weight) indicating the estimated population bracket represented by the row. |
| `education` | `object` | Categorical | 0 | 0.0% | Bachelors, Some-college, 11th, HS-grad, Prof-school, Assoc-acdm, Assoc-voc, 9th, 7th-8th, 12th, Masters, 1st-4th, 10th, Doctorate, 5th-6th, Preschool | Highest completed formal educational attainment. |
| `education_num` | `int64` | Numerical | 0 | 0.0% | 1 to 16 | Number of educational years completed, aligned ordinally with `education`. |
| `marital_status`| `object` | Categorical | 0 | 0.0% | Married-civ-spouse, Divorced, Never-married, Separated, Widowed, Married-spouse-absent, Married-AF-spouse | Marital status at the census survey date. |
| `occupation` | `object` | Categorical | 1,843 (`?`) | 5.66% | Tech-support, Craft-repair, Other-service, Sales, Exec-managerial, Prof-specialty, Handlers-cleaners, Machine-op-inspct, Adm-clerical, Farming-fishing, Transport-moving, Priv-house-serv, Protective-serv, Armed-Forces | Professional occupation category. |
| `relationship` | `object` | Categorical | 0 | 0.0% | Wife, Own-child, Husband, Not-in-family, Other-relative, Unmarried | Relationship role within the household unit. |
| `race` | `object` | Categorical | 0 | 0.0% | White, Asian-Pac-Islander, Amer-Indian-Eskimo, Other, Black | Racial demographic self-identification. |
| `sex` | `object` | Categorical | 0 | 0.0% | Female, Male | Biological sex of respondent. |
| `capital_gain` | `int64` | Numerical | 0 | 0.0% | 0 to 99,999 | Realized annual capital gains from financial investment portfolios (in USD). Highly skewed with zero-inflated mode. |
| `capital_loss` | `int64` | Numerical | 0 | 0.0% | 0 to 4,356 | Realized annual capital losses reported for federal taxation. |
| `hours_per_week`| `int64` | Numerical | 0 | 0.0% | 1 to 99 | Reported weekly work hours. Modal peak centered at 40 hours. |
| `native_country`| `object` | Categorical | 583 (`?`) | 1.79% | 41 countries (United-States, Mexico, Philippines, Germany, Canada, etc.) | Country of origin of the respondent. |
| `income` | `object` | Categorical (Target) | 0 | 0.0% | `<=50K`, `>50K` | Binary classification target indicating annual individual income above or below $50,000 threshold. |

---

## 2. Engineered Domain Features

| Feature Name | Data Type | Source Feature | Transformation Strategy | Purpose & ML Impact |
| :--- | :--- | :--- | :--- | :--- |
| `age_group` | `category` / `str` | `age` | Categorical Binning into 4 career brackets: Youth (&lt;25), Early-Career (25-44), Mid-Career (45-64), Retirement (65+) | Maps non-linear earning power across age lifecycle without forcing linear correlation. |
| `work_schedule_type` | `category` / `str` | `hours_per_week` | Categorical Binning: Part-Time (&lt;35h), Standard (35-40h), Extended (41-50h), Overtime (&gt;50h) | Segments formal labor standard commitments into discrete employment tiers. |
| `has_capital_gain` | `int64` (Binary) | `capital_gain` | Indicator flag: `1` if `capital_gain > 0` else `0` | Eliminates heavy right-tail zero inflation, capturing active investment participation. |
| `has_capital_loss` | `int64` (Binary) | `capital_loss` | Indicator flag: `1` if `capital_loss > 0` else `0` | Distinguishes tax-reporting investment accounts from standard single-income filers. |

---

## 3. Data Quality & Preprocessing Summary
- **Baseline Missing Count:** 4,262 instances across `workclass` (1,836), `occupation` (1,843), `native_country` (583).
- **Imputation Strategy:** Categorical Mode Imputation (`workclass` -> `Private`, `occupation` -> `Prof-specialty`, `native_country` -> `United-States`).
- **Baseline Duplicate Records:** 24 exact duplicates pruned using `keep='first'`.
- **Outlier Mitigation:** Winsorization clipping at IQR 1.5× boundaries (`age`: [ -2, 78 ], `hours_per_week`: [ 32.5, 52.5 ]).
- **Overall Final Quality Score:** 100% Completeness, 100% Uniqueness (Grade: A+).
