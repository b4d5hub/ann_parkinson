# 20-Minute Presentation Plan: Prediction of Parkinson's Disease Using ANNs

This document contains a slide-by-slide 20-minute presentation plan structured around the 4 team members.

## General Tips
- **Total Slides:** ~15–20.
- **Timing:** ~5 minutes per member.
- **Visuals:** Use minimal text. Add charts from `figures/` for the results section. Include architecture diagrams.

---

## Part 1: Member 1 (Introduction & Theory) - 5 Minutes

### Slide 1: Title Slide
- Project Title
- Team Members
- Course/Date

### Slide 2: Introduction
- The medical aspect: What is Parkinson's disease?
- The technical aspect: Why use vocal features for prediction?
- Project goals.

### Slide 3: Introduction to Artificial Neural Networks
- High-level view of standard ANN architecture (Input, Hidden layers, Output).
- Flow of Forward Propagation and Backpropagation.

### Slide 4: Key Concepts & Activation Functions
- **Activation Functions Overview:** Sigmoid, Tanh, ReLU. Why are they needed?
- **Optimization:** Stochastic Gradient Descent (SGD) basics.
- **Challenges:** Briefly mention Overfitting and the Vanishing Gradient problem.

---

## Part 2: Member 2 (Data & Preprocessing) - 5 Minutes

### Slide 5: The Parkinsons Dataset
- Source: UCI Machine Learning Repository
- Size: 195 rows, 22 features (Biomedical voice measurements).
- Target variable (`status`): Binary classification (1 = Disease, 0 = Healthy).

### Slide 6: Exploratory Data Analysis (EDA)
- *Include figure: `class_distribution.png`*
- Mention class proportion constraints (75% positive, 25% negative).
- Feature correlations overview.

### Slide 7: Data Preprocessing Steps
- Cleaning (removing `name` column).
- Feature Scaling (why `StandardScaler` is required).
- Splitting Strategy (70% Train, 15% Val, 15% Test).
- Target Labeling (One-Hot Encoding handling for categorical CE).

---

## Part 3: Member 3 (Modeling & Experiments) - 5 Minutes

### Slide 8: The Baseline Model Architecture
- Input Layer: 22 Features.
- Hidden Layers: 16 (ReLU), 8 (ReLU).
- Output Layer: 1 (Sigmoid).
- Compilation: SGD, Binary Crossentropy.

### Slide 9: Experiment 1 - Activation Functions
- Discuss testing ReLU against Sigmoid and Tanh.
- Show how the choice of function affects network training.

### Slide 10: Experiment 2 - Loss Functions
- Why the assignment asks to compare Binary Crossentropy, MSE, and Categorical Crossentropy.
- Why Binary CE is functionally the best option here.

### Slide 11: Experiments 3 & 4 - Overfitting & Depth
- The impact of adding Dropout(0.3).
- Analyzing network depth in relation to the Vanishing Gradient Problem.

---

## Part 4: Member 4 (Results & Conclusion) - 5 Minutes

### Slide 12: Comparison of Models
- Evaluation Metrics: Accuracy, Precision, Recall, F1.
- Why Accuracy isn't enough (Importance of False Negatives in medical data).

### Slide 13: Addressing Overfitting
- *Include figure: `loss_curve.png`*
- Show side-by-side graphs of the network training with and without Dropout.

### Slide 14: Final Model Performance
- *Include figure: `confusion_matrix.png`*
- Discuss the test set result of the best model (Baseline + Dropout).

### Slide 15: Conclusion and the Future
- Summary: ANNs are highly effective but require tuning to prevent overfitting on small datasets.
- Limitations of current work (small dataset).
- Future additions (cross-validation, parameter grids).

### Slide 16: Q&A
- Thank the audience.
- Open the floor to questions.
