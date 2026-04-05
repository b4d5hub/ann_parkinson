import json

notebook = {
 "cells": [
  {
   "cell_type": "markdown",
   "metadata": {},
   "source": [
    "# 🧠 Prediction of Parkinson's Disease Using Artificial Neural Networks\n",
    "\n",
    "***\n",
    "\n",
    "**Team Members:**\n",
    "- Member 1: Theory and literature (Section 1)\n",
    "- Member 2: Data and preprocessing (Section 2)\n",
    "- Member 3: Modeling and experiments (Sections 3-6)\n",
    "- Member 4: Evaluation, report integration, presentation (Section 7)\n",
    "\n",
    "**Objective:** Build and explain an ANN model that predicts whether a person has Parkinson's disease based on biomedical voice measurements. The notebook covers ANN architecture, activation functions, dropout/overfitting, loss functions, SGD optimization, and the vanishing gradient problem."
   ]
  },
  {
   "cell_type": "markdown",
   "metadata": {},
   "source": [
    "## Member 1 — Theory and Literature (Section 1)"
   ]
  },
  {
   "cell_type": "markdown",
   "metadata": {},
   "source": [
    "### Theoretical Concepts Covered\n",
    "\n",
    "**ANN Architecture:**\n",
    "- **Neurons, layers, weights, bias:** Explain the basic building blocks.\n",
    "- **Forward propagation:** How data moves sequentially from input to output.\n",
    "\n",
    "**Activation Functions:**\n",
    "- Explain `sigmoid`, `tanh`, and `relu`.\n",
    "\n",
    "**Vanishing Gradient Problem:**\n",
    "- Explain how gradients can become exponentially small in deep networks using `sigmoid` or `tanh`.\n",
    "\n",
    "**Dropout and Overfitting:**\n",
    "- Explain how `Dropout` randomly ignores neurons during training to prevent the network from memorizing the data."
   ]
  },
  {
   "cell_type": "markdown",
   "metadata": {},
   "source": [
    "## Member 2 — Data and Preprocessing (Section 2)"
   ]
  },
  {
   "cell_type": "code",
   "execution_count": None,
   "metadata": {},
   "outputs": [],
   "source": [
    "import pandas as pd\n",
    "import numpy as np\n",
    "import matplotlib.pyplot as plt\n",
    "import seaborn as sns\n",
    "import os\n",
    "from sklearn.model_selection import train_test_split\n",
    "from sklearn.preprocessing import StandardScaler\n",
    "\n",
    "# Ensure figures dir exists\n",
    "os.makedirs('../figures', exist_ok=True)\n",
    "\n",
    "# 1. Load Dataset\n",
    "df = pd.read_csv('../data/parkinsons.csv')\n",
    "print(\"Dataset Shape:\", df.shape)\n",
    "df.head()"
   ]
  },
  {
   "cell_type": "code",
   "execution_count": None,
   "metadata": {},
   "outputs": [],
   "source": [
    "# 2. Inspect Data Types and Null Values\n",
    "df.info()\n",
    "print(\"\\nMissing values:\\n\", df.isnull().sum().max())"
   ]
  },
  {
   "cell_type": "code",
   "execution_count": None,
   "metadata": {},
   "outputs": [],
   "source": [
    "# 3. Class Balance (status: 1 = Parkinson's, 0 = Healthy)\n",
    "plt.figure(figsize=(6, 4))\n",
    "sns.countplot(data=df, x='status')\n",
    "plt.title('Class Distribution (Target Variable)')\n",
    "plt.savefig('../figures/class_distribution.png')\n",
    "plt.show()\n",
    "\n",
    "print(\"Class distribution:\\n\", df['status'].value_counts(normalize=True))"
   ]
  },
  {
   "cell_type": "code",
   "execution_count": None,
   "metadata": {},
   "outputs": [],
   "source": [
    "# 4. Correlation Heatmap\n",
    "plt.figure(figsize=(12, 10))\n",
    "# Drop string columns like 'name'\n",
    "numeric_df = df.drop(columns=['name'])\n",
    "sns.heatmap(numeric_df.corr(), annot=False, cmap='coolwarm')\n",
    "plt.title('Feature Correlation Heatmap')\n",
    "plt.savefig('../figures/correlation_heatmap.png')\n",
    "plt.show()"
   ]
  },
  {
   "cell_type": "code",
   "execution_count": None,
   "metadata": {},
   "outputs": [],
   "source": [
    "# 5. Preprocessing (Scaling & Splitting)\n",
    "# Separate X and y\n",
    "X = numeric_df.drop(columns=['status'])\n",
    "y = numeric_df['status']\n",
    "\n",
    "# Recommended split: 70% training, 15% validation, 15% test\n",
    "X_train, X_temp, y_train, y_temp = train_test_split(X, y, test_size=0.30, random_state=42, stratify=y)\n",
    "X_val, X_test, y_val, y_test = train_test_split(X_temp, y_temp, test_size=0.50, random_state=42, stratify=y_temp)\n",
    "\n",
    "print(f\"Train size: {X_train.shape[0]}\")\n",
    "print(f\"Validation size: {X_val.shape[0]}\")\n",
    "print(f\"Test size: {X_test.shape[0]}\")\n",
    "\n",
    "# Feature Scaling\n",
    "scaler = StandardScaler()\n",
    "X_train_scaled = scaler.fit_transform(X_train)\n",
    "X_val_scaled = scaler.transform(X_val)\n",
    "X_test_scaled = scaler.transform(X_test)"
   ]
  },
  {
   "cell_type": "code",
   "execution_count": None,
   "metadata": {},
   "outputs": [],
   "source": [
    "# Categorical labels for Experiment 2 (Categorical Crossentropy)\n",
    "from tensorflow.keras.utils import to_categorical\n",
    "\n",
    "y_train_cat = to_categorical(y_train, num_classes=2)\n",
    "y_val_cat = to_categorical(y_val, num_classes=2)\n",
    "y_test_cat = to_categorical(y_test, num_classes=2)"
   ]
  },
  {
   "cell_type": "markdown",
   "metadata": {},
   "source": [
    "## Member 3 — Modeling and Experiments (Sections 3 - 6)"
   ]
  },
  {
   "cell_type": "code",
   "execution_count": None,
   "metadata": {},
   "outputs": [],
   "source": [
    "import tensorflow as tf\n",
    "from tensorflow.keras.models import Sequential\n",
    "from tensorflow.keras.layers import Dense, Dropout\n",
    "from tensorflow.keras.optimizers import SGD\n",
    "\n",
    "# Set seeds for reproducibility\n",
    "tf.random.set_seed(42)\n",
    "np.random.seed(42)"
   ]
  },
  {
   "cell_type": "markdown",
   "metadata": {},
   "source": [
    "### Phase 5 — Baseline ANN Model\n",
    "- **Hidden Layer 1:** 16 neurons, ReLU\n",
    "- **Hidden Layer 2:** 8 neurons, ReLU\n",
    "- **Output Layer:** 1 neuron, Sigmoid (since binary classification)\n",
    "- **Optimizer:** SGD\n",
    "- **Loss:** binary_crossentropy"
   ]
  },
  {
   "cell_type": "code",
   "execution_count": None,
   "metadata": {},
   "outputs": [],
   "source": [
    "def build_baseline():\n",
    "    model = Sequential([\n",
    "        Dense(16, activation='relu', input_shape=(X_train.shape[1],)),\n",
    "        Dense(8, activation='relu'),\n",
    "        Dense(1, activation='sigmoid')\n",
    "    ])\n",
    "    model.compile(optimizer=SGD(learning_rate=0.01), \n",
    "                  loss='binary_crossentropy', \n",
    "                  metrics=['accuracy'])\n",
    "    return model\n",
    "\n",
    "baseline_model = build_baseline()\n",
    "history_baseline = baseline_model.fit(\n",
    "    X_train_scaled, y_train, \n",
    "    validation_data=(X_val_scaled, y_val), \n",
    "    epochs=100, batch_size=8, verbose=0\n",
    ")\n",
    "\n",
    "print(\"Baseline model trained.\")"
   ]
  },
  {
   "cell_type": "markdown",
   "metadata": {},
   "source": [
    "### Phase 6, Main Experiments\n",
    "\n",
    "#### Experiment 1 — Compare Activation Functions\n",
    "Comparing `ReLU`, `sigmoid`, and `tanh` in the hidden layers."
   ]
  },
  {
   "cell_type": "code",
   "execution_count": None,
   "metadata": {},
   "outputs": [],
   "source": [
    "def build_model_activation(activation_func):\n",
    "    model = Sequential([\n",
    "        Dense(16, activation=activation_func, input_shape=(X_train.shape[1],)),\n",
    "        Dense(8, activation=activation_func),\n",
    "        Dense(1, activation='sigmoid')\n",
    "    ])\n",
    "    model.compile(optimizer=SGD(learning_rate=0.01), loss='binary_crossentropy', metrics=['accuracy'])\n",
    "    return model\n",
    "\n",
    "results_activations = {}\n",
    "for act in ['relu', 'sigmoid', 'tanh']:\n",
    "    print(f\"Training with {act}...\")\n",
    "    model = build_model_activation(act)\n",
    "    history = model.fit(X_train_scaled, y_train, validation_data=(X_val_scaled, y_val), epochs=100, batch_size=8, verbose=0)\n",
    "    results_activations[act] = history"
   ]
  },
  {
   "cell_type": "markdown",
   "metadata": {},
   "source": [
    "#### Experiment 2 — Compare Loss Functions\n",
    "(A) `binary_crossentropy` (Best suited)\n",
    "(B) `mse` (Less suitable)\n",
    "(C) `categorical_crossentropy` (Requires one-hot encoding)"
   ]
  },
  {
   "cell_type": "code",
   "execution_count": None,
   "metadata": {},
   "outputs": [],
   "source": [
    "results_loss = {}\n",
    "\n",
    "# A. Binary Crossentropy\n",
    "model_bce = build_baseline()\n",
    "hist_bce = model_bce.fit(X_train_scaled, y_train, validation_data=(X_val_scaled, y_val), epochs=100, batch_size=8, verbose=0)\n",
    "results_loss['binary_crossentropy'] = hist_bce\n",
    "\n",
    "# B. Mean Squared Error (MSE)\n",
    "model_mse = Sequential([\n",
    "    Dense(16, activation='relu', input_shape=(X_train.shape[1],)),\n",
    "    Dense(8, activation='relu'),\n",
    "    Dense(1, activation='sigmoid')  \n",
    "])\n",
    "model_mse.compile(optimizer=SGD(learning_rate=0.01), loss='mse', metrics=['accuracy'])\n",
    "hist_mse = model_mse.fit(X_train_scaled, y_train, validation_data=(X_val_scaled, y_val), epochs=100, batch_size=8, verbose=0)\n",
    "results_loss['mse'] = hist_mse\n",
    "\n",
    "# C. Categorical Crossentropy (2 Output neurons, Softmax)\n",
    "model_cce = Sequential([\n",
    "    Dense(16, activation='relu', input_shape=(X_train.shape[1],)),\n",
    "    Dense(8, activation='relu'),\n",
    "    Dense(2, activation='softmax') \n",
    "])\n",
    "model_cce.compile(optimizer=SGD(learning_rate=0.01), loss='categorical_crossentropy', metrics=['accuracy'])\n",
    "hist_cce = model_cce.fit(X_train_scaled, y_train_cat, validation_data=(X_val_scaled, y_val_cat), epochs=100, batch_size=8, verbose=0)\n",
    "results_loss['categorical_crossentropy'] = hist_cce"
   ]
  },
  {
   "cell_type": "markdown",
   "metadata": {},
   "source": [
    "#### Experiment 3 — Overfitting & Dropout\n",
    "Comparing model without dropout and with `Dropout(0.3)` to demonstrate overfitting control."
   ]
  },
  {
   "cell_type": "code",
   "execution_count": None,
   "metadata": {},
   "outputs": [],
   "source": [
    "def build_dropout_model():\n",
    "    model = Sequential([\n",
    "        Dense(16, activation='relu', input_shape=(X_train.shape[1],)),\n",
    "        Dropout(0.3),\n",
    "        Dense(8, activation='relu'),\n",
    "        Dense(1, activation='sigmoid')\n",
    "    ])\n",
    "    model.compile(optimizer=SGD(learning_rate=0.01), loss='binary_crossentropy', metrics=['accuracy'])\n",
    "    return model\n",
    "\n",
    "model_dropout = build_dropout_model()\n",
    "hist_dropout = model_dropout.fit(X_train_scaled, y_train, validation_data=(X_val_scaled, y_val), epochs=150, batch_size=8, verbose=0)\n",
    "\n",
    "# The baseline model (from earlier) is our \"without dropout\" comparison\n",
    "hist_no_dropout = baseline_model.fit(X_train_scaled, y_train, validation_data=(X_val_scaled, y_val), epochs=150, batch_size=8, verbose=0)"
   ]
  },
  {
   "cell_type": "markdown",
   "metadata": {},
   "source": [
    "#### Experiment 4 — Effect of Depth (Vanishing Gradient discussion)\n",
    "1 Hidden Layer vs 3 Hidden Layers"
   ]
  },
  {
   "cell_type": "code",
   "execution_count": None,
   "metadata": {},
   "outputs": [],
   "source": [
    "# Shallow (1 Hidden Layer)\n",
    "model_shallow = Sequential([\n",
    "    Dense(16, activation='relu', input_shape=(X_train.shape[1],)),\n",
    "    Dense(1, activation='sigmoid')\n",
    "])\n",
    "model_shallow.compile(optimizer=SGD(learning_rate=0.01), loss='binary_crossentropy', metrics=['accuracy'])\n",
    "hist_shallow = model_shallow.fit(X_train_scaled, y_train, validation_data=(X_val_scaled, y_val), epochs=100, batch_size=8, verbose=0)\n",
    "\n",
    "# Deep (4 Hidden Layers)\n",
    "# Using sigmoid across deep network to force vanishing gradient\n",
    "model_deep = Sequential([\n",
    "    Dense(16, activation='sigmoid', input_shape=(X_train.shape[1],)),\n",
    "    Dense(16, activation='sigmoid'),\n",
    "    Dense(16, activation='sigmoid'),\n",
    "    Dense(8, activation='sigmoid'),\n",
    "    Dense(1, activation='sigmoid')\n",
    "])\n",
    "model_deep.compile(optimizer=SGD(learning_rate=0.01), loss='binary_crossentropy', metrics=['accuracy'])\n",
    "hist_deep = model_deep.fit(X_train_scaled, y_train, validation_data=(X_val_scaled, y_val), epochs=100, batch_size=8, verbose=0)"
   ]
  },
  {
   "cell_type": "markdown",
   "metadata": {},
   "source": [
    "## Member 4 — Evaluation, report integration, presentation (Section 7)"
   ]
  },
  {
   "cell_type": "code",
   "execution_count": None,
   "metadata": {},
   "outputs": [],
   "source": [
    "from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix\n",
    "\n",
    "# Evaluate Best Recommended Model (Dropout Model) on Test Set\n",
    "y_test_pred_prob = model_dropout.predict(X_test_scaled)\n",
    "y_test_pred = (y_test_pred_prob > 0.5).astype(int)\n",
    "\n",
    "acc = accuracy_score(y_test, y_test_pred)\n",
    "prec = precision_score(y_test, y_test_pred)\n",
    "rec = recall_score(y_test, y_test_pred)\n",
    "f1 = f1_score(y_test, y_test_pred)\n",
    "\n",
    "print(\"=== BEST MODEL TEST SET PERFORMANCE (With Dropout) ===\")\n",
    "print(f\"Accuracy : {acc:.4f}\")\n",
    "print(f\"Precision: {prec:.4f}\")\n",
    "print(f\"Recall   : {rec:.4f}\")\n",
    "print(f\"F1 Score : {f1:.4f}\")"
   ]
  },
  {
   "cell_type": "code",
   "execution_count": None,
   "metadata": {},
   "outputs": [],
   "source": [
    "# Confusion Matrix Plot\n",
    "cm = confusion_matrix(y_test, y_test_pred)\n",
    "plt.figure(figsize=(5,4))\n",
    "sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', xticklabels=['Healthy', 'Parkinsons'], yticklabels=['Healthy', 'Parkinsons'])\n",
    "plt.ylabel('True Label')\n",
    "plt.xlabel('Predicted Label')\n",
    "plt.title('Confusion Matrix on Test Set')\n",
    "plt.savefig('../figures/confusion_matrix.png')\n",
    "plt.show()"
   ]
  },
  {
   "cell_type": "code",
   "execution_count": None,
   "metadata": {},
   "outputs": [],
   "source": [
    "# Plot Overfitting Comparison (Experiment 3)\n",
    "plt.figure(figsize=(12, 5))\n",
    "plt.subplot(1, 2, 1)\n",
    "plt.plot(hist_no_dropout.history['loss'], label='Train Loss (No Dropout)')\n",
    "plt.plot(hist_no_dropout.history['val_loss'], label='Val Loss (No Dropout)')\n",
    "plt.title('Loss Curve: Without Dropout')\n",
    "plt.legend()\n",
    "\n",
    "plt.subplot(1, 2, 2)\n",
    "plt.plot(hist_dropout.history['loss'], label='Train Loss (With Dropout)')\n",
    "plt.plot(hist_dropout.history['val_loss'], label='Val Loss (With Dropout)')\n",
    "plt.title('Loss Curve: With Dropout(0.3)')\n",
    "plt.legend()\n",
    "\n",
    "plt.tight_layout()\n",
    "plt.savefig('../figures/loss_curve.png')\n",
    "plt.show()"
   ]
  },
  {
   "cell_type": "code",
   "execution_count": None,
   "metadata": {},
   "outputs": [],
   "source": [
    "# Plot Accuracy Curves for Activation Functions (Experiment 1)\n",
    "plt.figure(figsize=(12, 5))\n",
    "for act in ['relu', 'sigmoid', 'tanh']:\n",
    "    plt.plot(results_activations[act].history['val_accuracy'], label=f'{act} Val Accuracy')\n",
    "\n",
    "plt.title('Validation Accuracy Across Activation Functions')\n",
    "plt.xlabel('Epochs')\n",
    "plt.ylabel('Accuracy')\n",
    "plt.legend()\n",
    "plt.savefig('../figures/accuracy_curve.png')\n",
    "plt.show()"
   ]
  }
 ],
 "metadata": {
  "kernelspec": {
   "display_name": "Python 3",
   "language": "python",
   "name": "python3"
  },
  "language_info": {
   "codemirror_mode": {
    "name": "ipython",
    "version": 3
   },
   "file_extension": ".py",
   "mimetype": "text/x-python",
   "name": "python",
   "nbconvert_exporter": "python",
   "pygments_lexer": "ipython3",
   "version": "3.8.5"
  }
 },
 "nbformat": 4,
 "nbformat_minor": 4
}

with open("c:/Users/msi/Desktop/S8/AI/Projet/notebooks/ann_parkinsons.ipynb", "w", encoding="utf-8") as f:
    json.dump(notebook, f, indent=1)

print("Notebook generated successfully!")
