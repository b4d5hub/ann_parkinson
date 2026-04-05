import os
import io
import json
import warnings
from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
import tensorflow as tf
from sklearn.preprocessing import StandardScaler

warnings.filterwarnings('ignore')

app = Flask(__name__)
CORS(app)  # Allow frontend to communicate

# 1. Initialization: Load Data, Fit Scaler, Calculate Means
print("[INFO] Loading dataset and configuring scaler...")
try:
    df = pd.read_csv('data/parkinsons.csv')
    numeric_df = df.drop(columns=['name'])
    X = numeric_df.drop(columns=['status'])
    
    # Calculate feature means of strictly HEALTHY patients (status == 0) to use as padding
    # This ensures the baseline is 0% risk until the 6 sliders introduce instability.
    healthy_patients = df[df['status'] == 0].drop(columns=['name', 'status'])
    feature_means = healthy_patients.mean().to_dict()
    
    # Fit the exact same scaler used in the notebook
    scaler = StandardScaler()
    scaler.fit(X)
    print("[INFO] Scaler fitted successfully on 22 features.")
    
except Exception as e:
    print(f"[ERROR] Failed to load dataset or fit scaler: {e}")

# 2. Load the trained Keras model
print("[INFO] Loading Parkinson's ANN model...")
try:
    model = tf.keras.models.load_model('parkinsons_model.h5')
    print("[INFO] Model loaded successfully.")
except Exception as e:
    print(f"[ERROR] Failed to load model 'parkinsons_model.h5': {e}")
    model = None

@app.route('/predict', methods=['POST'])
def predict():
    if model is None:
        return jsonify({'error': 'Model not loaded on server'}), 500
        
    try:
        data = request.json
        print(f"[POST /predict] Received data: {data}")
        
        # Start with a pristine dictionary of averages for a "Healthy" patient
        # This resolves the 22-feature requirement while only using 6 sliders
        features_dict = feature_means.copy()
        
        # Map the incoming 6 payload values to the correct feature columns
        if 'fo' in data:
            features_dict['MDVP:Fo(Hz)'] = float(data['fo'])
        if 'jitter' in data:
            features_dict['MDVP:Jitter(%)'] = float(data['jitter'])
        if 'shimmer' in data:
            features_dict['MDVP:Shimmer'] = float(data['shimmer'])
        if 'hnr' in data:
            features_dict['HNR'] = float(data['hnr'])
        if 'rpde' in data:
            features_dict['RPDE'] = float(data['rpde'])
        if 'dfa' in data:
            features_dict['DFA'] = float(data['dfa'])
            
        # Convert dictionary back to the exact 22-element array order the scaler expects
        feature_vector = np.array([[features_dict[col] for col in X.columns]])
        
        # Scale the data using the fitted scaler
        scaled_vector = scaler.transform(feature_vector)
        
        # Run prediction
        prediction_prob = model.predict(scaled_vector, verbose=0)[0][0]
        
        # Note: the neural network outputs a probability (sigmoid output 0 to 1)
        # We multiply by 100 to pass it as a percentage to the React app
        prob_percentage = float(prediction_prob * 100)
        
        print(f" -> Predicted Probability: {prob_percentage:.2f}%")
        
        return jsonify({
            'success': True,
            'probability': prob_percentage
        })
        
    except Exception as e:
        print(f"[ERROR /predict] {e}")
        return jsonify({'error': str(e)}), 400

if __name__ == '__main__':
    print("\n=======================================================")
    print("   PARKINSON'S ANN BACKEND IS ONLINE (PORT 5000)")
    print("=======================================================\n")
    app.run(host='0.0.0.0', port=5000, debug=True, use_reloader=False)
