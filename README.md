# 🧠 Prediction of Parkinson's Disease Using Artificial Neural Networks

> A comparative ANN study for Parkinson's disease prediction, with analysis of activation functions,
> loss functions, SGD optimization, overfitting control using dropout, and discussion of the vanishing gradient problem.

⭐ **NEW UPDATE (Live Presentation Simulator):** We have integrated a full-stack Web Application built with **React (Vite), Three.js, and Flask**. It allows for real-time visual simulation of the trained Keras model, including a Web Audio API driven live diagnosis interface using voice commands!

---

## 📁 Project Structure

```text
ANN_Parkinson_Project/
│
├── data/
│   └── parkinsons.csv           ← UCI Parkinsons dataset
│
├── notebooks/
│   └── ann_parkinsons.ipynb     ← Main notebook (all experiments)
│
├── models/
│   └── parkinsons_model.h5      ← Exported Keras AI Model
│
├── simulation_app/              ← ⚛️ NEW: React/Vite 3D Frontend App
│   ├── src/components/          ← UI, Dashboard, 3D Avatar, Web Audio Panel
│   └── src/hooks/               ← useAudioAnalyzer hook for live voice extraction
│
├── server.py                    ← 🐍 NEW: Flask API Python Backend
├── start_app.bat                ← 🚀 NEW: Master Launcher Script
├── run_project.bat              ← Legacy Notebook setup script
└── README.md
```

---

## 👥 Team Roles

| Member   | Responsibility            | Sections in Notebook                        |
|----------|---------------------------|---------------------------------------------|
| Member 1 | Theory & Literature       | Section 1 – ANN Theory                      |
| Member 2 | Data & Preprocessing      | Section 2 – EDA & Preprocessing             |
| Member 3 | Modeling & Experiments    | Sections 3–6 – Model Building & Experiments |
| Member 4 | Evaluation & Presentation | Section 7 – Results, Metrics, Web Simulator |

---

## 🚀 How to Run the Full Stack Application

Instead of just running a static notebook, you can now boot up the **Clinical Presentation Simulator**.

### Step 1: Launch the API & Web App (Windows)
Simply double-click the master batch file from the root directory:
```bash
./start_app.bat
```
This script will automatically:
1. Boot the **Flask Python API (`server.py`)** on Port `5000`. (This loads the dataset to recreate `StandardScaler` perfectly and loads your `.h5` model into memory).
2. Boot the **React Frontend App** on `http://localhost:5173`.
3. Open the original **Jupyter Notebook** so you can view the training metrics.

### Step 2: Use the Simulation Dashboard
- Open your browser to `http://localhost:5173`.
- **Slide the Parameters**: Drag the Jitter, Shimmer, and HNR sliders to instantly see the real `.h5` neural network predict the percentage of Parkinson's Disease.
- **Live Diagnosis Test**: Click the flashing microphone button and read a sentence into your laptop. The web app uses standard Web Audio API to calculate your vocal fluctuations and automatically feeds those exact measurements into the AI.
- **Sim. High Risk / Normal**: Instantly inject dangerous or healthy parameters to test the UI alarms.

### Alternative (Google Colab - Notebook Only)
1. Upload the `notebooks/ann_parkinsons.ipynb` file to [Google Colab](https://colab.research.google.com/)
2. Upload `data/parkinsons.csv` to the Colab session.
3. Run all cells in order (`Runtime > Run all`).

---

## 📊 Experiments Covered (Notebook)

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
- React Three Fiber — https://docs.pmnd.rs/react-three-fiber
