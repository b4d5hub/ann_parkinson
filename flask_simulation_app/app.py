import os
import warnings
from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
import onnxruntime as ort
from sklearn.preprocessing import StandardScaler

warnings.filterwarnings('ignore')

app = Flask(__name__)
CORS(app)

# ── Initialization: Load Data, Fit Scaler, Calculate Means ────────────────────
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(BASE_DIR)  # parent = Projet/

print("[INFO] Loading dataset and configuring scaler...")
try:
    # Use absolute-relative paths from the repository root for Vercel compatibility
    REPO_ROOT = os.getcwd()
    csv_path = os.path.join(REPO_ROOT, 'data', 'parkinsons.csv')
    df = pd.read_csv(csv_path)
    numeric_df = df.drop(columns=['name'])
    X = numeric_df.drop(columns=['status'])

    # Healthy-patient means as padding for the 16 features the user does NOT control
    healthy_patients = df[df['status'] == 0].drop(columns=['name', 'status'])
    feature_means = healthy_patients.mean().to_dict()

    scaler = StandardScaler()
    scaler.fit(X)
    feature_columns = list(X.columns)
    print(f"[INFO] Scaler fitted on {len(feature_columns)} features.")
except Exception as e:
    print(f"[ERROR] Failed to load dataset or fit scaler: {e}")
    feature_columns = []

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
        scaled_vector = scaler.transform(feature_vector)
        
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
