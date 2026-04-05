# Final Report Outline: Prediction of Parkinson's Disease Using Artificial Neural Networks

This outline follows the exact structure provided in the assignment, offering subsections to guide each team member in righting their parts.

## 1. Introduction (Member 1)
### 1.1 Context 
- Importance of AI in medical diagnosis.
- Brief explanation of Parkinson’s disease and its impact on vocal features.
### 1.2 Objective
- Purpose of the project: Predicting Parkinson's presence using vocal feature data via Artificial Neural Networks.

## 2. Theoretical Background (Member 1)
### 2.1 Artificial Neural Networks (ANN)
- Definition and biological inspiration.
- Architecture: Input layer, Hidden layers, Output layer.
- Components: Neurons, weights, and biases.
### 2.2 Activation Functions
- Role of activation functions.
- Detailed explanation of Sigmoid, Tanh, and ReLU.
### 2.3 Loss Functions
- Purpose of loss functions.
- Difference between Mean Squared Error (MSE), Binary Crossentropy, and Categorical Crossentropy.
### 2.4 Optimization and Training
- Stochastic Gradient Descent (SGD).
- Epochs, learning rate, and batch size.
### 2.5 Common Challenges
- The Vanishing Gradient Problem.
- Overfitting and Dropout as a regularization technique.

## 3. Dataset Presentation (Member 2)
### 3.1 Source and Description
- General overview of the UCI Parkinsons Dataset.
### 3.2 Features
- Overview of the 22 biomedical voice measurements (Jitter, Shimmer, NHR, HNR, etc.).
### 3.3 Target Variable and Distribution
- Definition of `status` (1 = Parkinson's, 0 = Healthy).
- Class distribution and potential imbalance impacts.

## 4. Data Preprocessing (Member 2)
### 4.1 Data Cleaning
- Handling missing data and removing unnecessary columns (e.g., patient ID/name).
### 4.2 Data Scaling
- Why scaling is essential for ANNs.
- Application of `StandardScaler`.
### 4.3 Data Splitting
- Train (70%), Validation (15%), and Test (15%) splits.
### 4.4 Label Preparation
- Formatting for binary classification (0 and 1) vs categorical crossentropy.

## 5. Model Design (Member 3)
### 5.1 Baseline Architecture
- Input features mapping to 16 hidden neurons (ReLU) -> 8 hidden neurons (ReLU) -> 1 output neuron (Sigmoid).
### 5.2 Compilation
- Optimizer selected (SGD).
- Loss function selected (Binary Crossentropy).
- Metrics tracked (Accuracy).

## 6. Experiments (Member 3)
### 6.1 Experiment 1: Activation Functions Comparison
- Testing ReLU vs Sigmoid vs Tanh in the hidden layers.
### 6.2 Experiment 2: Loss Functions Comparison
- Binary Crossentropy vs MSE vs Categorical Crossentropy.
### 6.3 Experiment 3: Dropout vs No Dropout
- Using Dropout(0.3) to control overfitting during prolonged training.
### 6.4 Experiment 4: Depth and Vanishing Gradient
- Comparing 1 hidden layer vs deeper networks (using Sigmoid to induce vanishing gradients).

## 7. Results and Discussion (Member 4)
### 7.1 Evaluation Metrics Discussed
- Accuracy, Precision, Recall, F1-Score, and Confusion Matrix.
### 7.2 Results Breakdown
- Evaluation of Experiment 1 (Activation Functions).
- Evaluation of Experiment 2 (Loss Functions).
- Analysis of Overfitting and Dropout Impact (Experiment 3).
- Impact of network depth (Experiment 4).
### 7.3 Best Model Analysis
- Why the Baseline Architecture with Dropout and Binary Crossentropy performed best.

## 8. Conclusion (Member 4)
### 8.1 Summary of Findings
- Effectiveness of the chosen final model.
### 8.2 Limitations
- Small sample size (195 rows) and its effect on generalization.
### 8.3 Future Work
- More extensive tuning, cross-validation, and potentially expanding the dataset.

## 9. References
- UCI Machine Learning Repository
- Key literature used for Deep Learning theory.
