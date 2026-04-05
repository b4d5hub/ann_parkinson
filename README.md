# 🧠 Prediction of Parkinson's Disease Using Artificial Neural Networks

> A comparative ANN study for Parkinson's disease prediction, with analysis of activation functions,
> loss functions, SGD optimization, overfitting control using dropout, and discussion of the vanishing gradient problem.

---

## 📁 Project Structure

```
ANN_Parkinson_Project/
│
├── data/
│   └── parkinsons.csv           ← UCI Parkinsons dataset
│
├── notebooks/
│   └── ann_parkinsons.ipynb     ← Main notebook (all experiments)
│
├── figures/                     ← Auto-generated plots
│   ├── class_distribution.png
│   ├── correlation_heatmap.png
│   ├── loss_curve.png
│   ├── accuracy_curve.png
│   └── confusion_matrix.png
│
├── report/
│   └── report.docx              ← Final written report
│
├── presentation/
│   └── ANN_Parkinsons.pptx      ← 20-min oral presentation slides
│
└── README.md
```

---

## 👥 Team Roles

| Member   | Responsibility            | Sections in Notebook                        |
|----------|---------------------------|---------------------------------------------|
| Member 1 | Theory & Literature       | Section 1 – ANN Theory                      |
| Member 2 | Data & Preprocessing      | Section 2 – EDA & Preprocessing             |
| Member 3 | Modeling & Experiments    | Sections 3–6 – Model Building & Experiments |
| Member 4 | Evaluation & Presentation | Section 7 – Results, Metrics, Conclusion    |

---

## 🚀 How to Run

### Option A — Google Colab (Recommended)
1. Upload the `notebooks/ann_parkinsons.ipynb` file to [Google Colab](https://colab.research.google.com/)
2. Upload `data/parkinsons.csv` to the Colab session or mount Google Drive
3. Run all cells in order (`Runtime > Run all`)

### Option B — Local (Jupyter)
```bash
pip install tensorflow pandas numpy matplotlib seaborn scikit-learn
jupyter notebook notebooks/ann_parkinsons.ipynb
```

---

## 📊 Experiments Covered

| # | Experiment                         | Purpose                                       |
|---|------------------------------------|-----------------------------------------------|
| E1 | ReLU vs Sigmoid vs Tanh           | Compare activation functions                  |
| E2 | BCE vs MSE vs Categorical CE      | Compare loss functions (assignment requirement)|
| E3 | Without Dropout vs With Dropout   | Demonstrate overfitting control               |
| E4 | 1 vs 2 vs 3 Hidden Layers         | Model depth & vanishing gradient discussion   |

---

## 📦 Dataset

- **Source**: [UCI Machine Learning Repository – Parkinsons Dataset](https://archive.ics.uci.edu/ml/datasets/parkinsons)
- **Author**: Max A. Little, University of Oxford
- **Samples**: 195
- **Features**: 22 biomedical voice measurements
- **Target**: `status` — 1 = Parkinson's, 0 = Healthy
- **Class balance**: ~75% Parkinson's, ~25% Healthy

---

## 🎯 Best Model Configuration

```python
model = Sequential([
    Dense(16, activation='relu', input_shape=(X_train.shape[1],)),
    Dropout(0.3),
    Dense(8, activation='relu'),
    Dense(1, activation='sigmoid')
])
model.compile(optimizer=SGD(learning_rate=0.01), loss='binary_crossentropy', metrics=['accuracy'])
```

---

## 📚 References

- UCI Parkinsons Dataset — Max A. Little et al.
- Goodfellow et al., *Deep Learning*, MIT Press, 2016
- Chollet, F., *Deep Learning with Python*, Manning, 2021
- TensorFlow / Keras Documentation — https://keras.io
- Scikit-learn Documentation — https://scikit-learn.org
