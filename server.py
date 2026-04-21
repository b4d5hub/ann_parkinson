import os
import json
import warnings
from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import h5py

warnings.filterwarnings('ignore')

app = Flask(__name__)
CORS(app)  # Allow frontend to communicate

# ── 1. Initialization: Hardcoded Standard Scaling & Feature Means ─────────────
print("[INFO] Loading configuration...")
feature_columns = ["MDVP:Fo(Hz)", "MDVP:Fhi(Hz)", "MDVP:Flo(Hz)", "MDVP:Jitter(%)", "MDVP:Jitter(Abs)", "MDVP:RAP", "MDVP:PPQ", "Jitter:DDP", "MDVP:Shimmer", "MDVP:Shimmer(dB)", "Shimmer:APQ3", "Shimmer:APQ5", "MDVP:APQ", "Shimmer:DDA", "NHR", "HNR", "RPDE", "DFA", "spread1", "spread2", "D2", "PPE"]

feature_means = {
    "MDVP:Fo(Hz)": 181.9377708333333, "MDVP:Fhi(Hz)": 223.63675, "MDVP:Flo(Hz)": 145.2072916666667, 
    "MDVP:Jitter(%)": 0.0038660416666666665, "MDVP:Jitter(Abs)": 2.3375000000000002e-05, "MDVP:RAP": 0.0019250000000000003, 
    "MDVP:PPQ": 0.0020560416666666665, "Jitter:DDP": 0.005776041666666666, "MDVP:Shimmer": 0.01761520833333333, 
    "MDVP:Shimmer(dB)": 0.16295833333333334, "Shimmer:APQ3": 0.009503541666666667, "Shimmer:APQ5": 0.010508541666666668, 
    "MDVP:APQ": 0.013304791666666668, "Shimmer:DDA": 0.028511458333333337, "NHR": 0.011482708333333333, 
    "HNR": 24.678749999999997, "RPDE": 0.442551875, "DFA": 0.6957155625000001, "spread1": -6.759263874999999, 
    "spread2": 0.16029200000000002, "D2": 2.1544907291666666, "PPE": 0.12301710416666667
}

scaler_mean = np.array([154.22864102564102, 197.10491794871797, 116.32463076923077, 0.006220461538461538, 4.395897435897436e-05, 0.003306410256410257, 0.003446358974358974, 0.009919948717948717, 0.0297091282051282, 0.2822512820512821, 0.015664153846153845, 0.017878256410256407, 0.02408148717948718, 0.04699261538461539, 0.02484707692307692, 21.885974358974355, 0.4985355384615385, 0.7180990461538461, -5.684396743589745, 0.22651034871794873, 2.3818260871794874, 0.20655164102564103])
scaler_scale = np.array([41.283799965906525, 91.25665238831346, 43.40967637841882, 0.004835686602250747, 3.47325068897351e-05, 0.00296015495711816, 0.002751893254928691, 0.008880485924417673, 0.018808518603560635, 0.19437696243124433, 0.01012709438557181, 0.011992835897206745, 0.016903227224669554, 0.030380918738842865, 0.04031467829869681, 4.414401569264757, 0.10367485434733356, 0.05519376122810949, 1.0874087661470229, 0.08319162680463385, 0.3818162489128301, 0.08988795028412536])


# ── 2. Native Numpy Implementation of Feed Forward Neural Network ───────────────
class NativeH5Parser:
    """Safely reads raw HDF5 weights without loading bulky TensorFlow"""
    def __init__(self, h5_path):
        W = []
        B = []
        with h5py.File(h5_path, 'r') as f:
            def visit_func(name, node):
                if isinstance(node, h5py.Dataset):
                    if 'kernel' in name:
                        W.append((name, np.array(node)))
                    elif 'bias' in name:
                        B.append((name, np.array(node)))
            f.visititems(visit_func)
            
        # Ensure sequential order (dense_9, dense_10, dense_11)
        W.sort(key=lambda x: int(x[0].split('dense_')[1].split('/')[0]))
        B.sort(key=lambda x: int(x[0].split('dense_')[1].split('/')[0]))
        self.W = [w[1] for w in W]
        self.B = [b[1] for b in B]

    def predict(self, x):
        # Pass input through layers 
        for i in range(len(self.W)):
            x = np.dot(x, self.W[i]) + self.B[i]
            if i == len(self.W) - 1:
                # Output activation: sigmoid (predicts probability)
                x = 1 / (1 + np.exp(-x))
            else:
                # Hidden activation: ReLU
                x = np.maximum(0, x)
        return x

print("[INFO] Natively reading Keras .h5 file without TensorFlow...")
try:
    # Use cwd to find the model whether deployed on Vercel or locally
    model_path = os.path.join(os.getcwd(), 'parkinsons_model.h5')
    if not os.path.exists(model_path):
        model_path = os.path.join(os.path.dirname(__file__), 'parkinsons_model.h5')
    native_model = NativeH5Parser(model_path)
    print("[INFO] Model weights extracted perfectly.")
except Exception as e:
    print(f"[ERROR] Failed to read HDF5 model: {e}")
    native_model = None

@app.route('/predict', methods=['POST'])
def predict():
    if native_model is None:
        return jsonify({'error': 'Native model not loaded on server'}), 500
        
    try:
        data = request.json
        print(f"[POST /predict] Received 22-param data payload.")
        
        # Read all 22 variables from frontend payload explicitly in the correct order
        mapping = {
            "MDVP:Fo(Hz)": data.get('fo', 154), 
            "MDVP:Fhi(Hz)": data.get('fhi', 197), 
            "MDVP:Flo(Hz)": data.get('flo', 116), 
            "MDVP:Jitter(%)": data.get('jitter', 0.006), 
            "MDVP:Jitter(Abs)": data.get('jitterAbs', 0.00004), 
            "MDVP:RAP": data.get('rap', 0.003), 
            "MDVP:PPQ": data.get('ppq', 0.003), 
            "Jitter:DDP": data.get('jitterDDP', 0.009), 
            "MDVP:Shimmer": data.get('shimmer', 0.029), 
            "MDVP:Shimmer(dB)": data.get('shimmerDb', 0.28), 
            "Shimmer:APQ3": data.get('shimmerAPQ3', 0.015), 
            "Shimmer:APQ5": data.get('shimmerAPQ5', 0.017), 
            "MDVP:APQ": data.get('shimmerAPQ', 0.024), 
            "Shimmer:DDA": data.get('shimmerDDA', 0.046), 
            "NHR": data.get('nhr', 0.024), 
            "HNR": data.get('hnr', 21.0), 
            "RPDE": data.get('rpde', 0.49), 
            "DFA": data.get('dfa', 0.71), 
            "spread1": data.get('spread1', -5.6), 
            "spread2": data.get('spread2', 0.22), 
            "D2": data.get('d2', 2.38), 
            "PPE": data.get('ppe', 0.20)
        }
            
        # Reconstruct exactly 22 shape input based strictly on the mapped dict
        feature_vector = np.array([[mapping[col] for col in feature_columns]], dtype=np.float32)
        
        # Native standardization
        scaled_vector = (feature_vector - scaler_mean) / scaler_scale
        
        # Predict using NumPy feed-forward
        prediction_prob = native_model.predict(scaled_vector)[0][0]
        prob_percentage = float(prediction_prob * 100)
        
        print(f" -> Predicted Probability: {prob_percentage:.2f}%")
        return jsonify({'success': True, 'probability': prob_percentage})
        
    except Exception as e:
        print(f"[ERROR /predict] {e}")
        return jsonify({'error': str(e)}), 400

if __name__ == '__main__':
    print("\n=======================================================")
    print("   PARKINSON'S NATIVE H5 BACKEND IS ONLINE (PORT 5000)")
    print("=======================================================\n")
    app.run(host='0.0.0.0', port=5000, debug=True, use_reloader=False)
