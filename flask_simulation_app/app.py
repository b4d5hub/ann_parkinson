import os
import warnings
from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
import pandas as pd # Removed
import numpy as np
import onnxruntime as ort

warnings.filterwarnings('ignore')

app = Flask(__name__)
CORS(app)

# ── Initialization: Hardcoded Feature Means & Scaling Parameters ──────────────
REPO_ROOT = os.getcwd()
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

print("[INFO] Loading configuration...")

feature_columns = ["MDVP:Fo(Hz)", "MDVP:Fhi(Hz)", "MDVP:Flo(Hz)", "MDVP:Jitter(%)", "MDVP:Jitter(Abs)", "MDVP:RAP", "MDVP:PPQ", "Jitter:DDP", "MDVP:Shimmer", "MDVP:Shimmer(dB)", "Shimmer:APQ3", "Shimmer:APQ5", "MDVP:APQ", "Shimmer:DDA", "NHR", "HNR", "RPDE", "DFA", "spread1", "spread2", "D2", "PPE"]

feature_means = {"MDVP:Fo(Hz)": 181.9377708333333, "MDVP:Fhi(Hz)": 223.63675, "MDVP:Flo(Hz)": 145.2072916666667, "MDVP:Jitter(%)": 0.0038660416666666665, "MDVP:Jitter(Abs)": 2.3375000000000002e-05, "MDVP:RAP": 0.0019250000000000003, "MDVP:PPQ": 0.0020560416666666665, "Jitter:DDP": 0.005776041666666666, "MDVP:Shimmer": 0.01761520833333333, "MDVP:Shimmer(dB)": 0.16295833333333334, "Shimmer:APQ3": 0.009503541666666667, "Shimmer:APQ5": 0.010508541666666668, "MDVP:APQ": 0.013304791666666668, "Shimmer:DDA": 0.028511458333333337, "NHR": 0.011482708333333333, "HNR": 24.678749999999997, "RPDE": 0.442551875, "DFA": 0.6957155625000001, "spread1": -6.759263874999999, "spread2": 0.16029200000000002, "D2": 2.1544907291666666, "PPE": 0.12301710416666667}

scaler_mean = np.array([154.22864102564102, 197.10491794871797, 116.32463076923077, 0.006220461538461538, 4.395897435897436e-05, 0.003306410256410257, 0.003446358974358974, 0.009919948717948717, 0.0297091282051282, 0.2822512820512821, 0.015664153846153845, 0.017878256410256407, 0.02408148717948718, 0.04699261538461539, 0.02484707692307692, 21.885974358974355, 0.4985355384615385, 0.7180990461538461, -5.684396743589745, 0.22651034871794873, 2.3818260871794874, 0.20655164102564103])

scaler_scale = np.array([41.283799965906525, 91.25665238831346, 43.40967637841882, 0.004835686602250747, 3.47325068897351e-05, 0.00296015495711816, 0.002751893254928691, 0.008880485924417673, 0.018808518603560635, 0.19437696243124433, 0.01012709438557181, 0.011992835897206745, 0.016903227224669554, 0.030380918738842865, 0.04031467829869681, 4.414401569264757, 0.10367485434733356, 0.05519376122810949, 1.0874087661470229, 0.08319162680463385, 0.3818162489128301, 0.08988795028412536])

# ── Load ONNX Model ───────────────────────────────────────────────────────────
print("[INFO] Loading Parkinson's ONNX model...")
try:
    model_path = os.path.join(REPO_ROOT, 'parkinsons_model.onnx')
    ort_session = ort.InferenceSession(model_path)
    model_input_name = ort_session.get_inputs()[0].name
    print("[INFO] ONNX Model loaded successfully.")
except Exception as e:
    print(f"[ERROR] Failed to load ONNX model: {e}")
    ort_session = None


# ── Routes ────────────────────────────────────────────────────────────────────
@app.route('/')
def index():
    """Serve the main simulation UI."""
    return render_template('index.html')


@app.route('/predict', methods=['POST'])
def predict():
    """Accept 6 biomarker values, pad with healthy means, scale, predict."""
    if ort_session is None:
        return jsonify({'error': 'Model not loaded on server'}), 500

    try:
        data = request.json
        print(f"[POST /predict] Received: {data}")

        features_dict = feature_means.copy()

        mapping = {
            'fo':      'MDVP:Fo(Hz)',
            'jitter':  'MDVP:Jitter(%)',
            'shimmer': 'MDVP:Shimmer',
            'hnr':     'HNR',
            'rpde':    'RPDE',
            'dfa':     'DFA',
        }
        for key, col in mapping.items():
            if key in data:
                features_dict[col] = float(data[key])

        feature_vector = np.array([[features_dict[col] for col in feature_columns]], dtype=np.float32)
        
        # Native numpy standard scaling equivalent to scaler.transform
        scaled_vector = (feature_vector - scaler_mean) / scaler_scale
        scaled_vector = scaled_vector.astype(np.float32)
        
        # ONNX Inference
        ort_inputs = {model_input_name: scaled_vector}
        ort_outs = ort_session.run(None, ort_inputs)
        prediction_prob = ort_outs[0][0][0]
        prob_percentage = float(prediction_prob * 100)

        print(f" -> Predicted Probability: {prob_percentage:.2f}%")

        return jsonify({'success': True, 'probability': prob_percentage})

    except Exception as e:
        print(f"[ERROR /predict] {e}")
        return jsonify({'error': str(e)}), 400


# ── Main ──────────────────────────────────────────────────────────────────────
if __name__ == '__main__':
    print("\n=======================================================")
    print("   FLASK SIMULATION APP IS ONLINE  (PORT 5000)")
    print("=======================================================\n")
    app.run(host='0.0.0.0', port=5000, debug=True, use_reloader=False)
