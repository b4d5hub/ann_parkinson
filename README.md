# Parkinson's Neural Network Simulation

A full-stack, AI-driven diagnostic simulation application for analyzing and mapping Parkinson's disease acoustic biomarkers. The system relies on a trained Artificial Neural Network (ANN) packaged into a highly optimized, lightweight serverless deployment.

## ✨ Features
* **Native Matrix Engine:** Completely removes the hefty 1GB+ `TensorFlow` dependency. A custom algorithm natively parses the raw Keras `.h5` model using only mathematics (`NumPy` and `h5py`), drastically reducing bundle size and deployment times.
* **Clinical PDF Generation:** Generates real-time, professionally formatted medical assessment reports via raw `jsPDF` structures (featuring Data source tags, Patient Demographics, and a Diagnostic Summary).
* **22-Parameter Deep Mapping:** Explicitly routes and exposes all 22 distinct multidimensional acoustic properties into a unified UI panel for unparalleled research controls.
* **Premium UI/UX System:** Completely custom responsive frontend built in React, utilizing a dual-engine Theme Toggle (Deep Glassmorphism Dark Mode & Sleek High-Contrast Light Mode).
* **Multi-Environment Ready:** Optimized natively for Docker, Kubernetes (Minikube), Vercel Serverless Hosting, or standard Local Developer executions.

## 🏗️ Architecture Stack
* **Frontend:** React 19, Vite, Tailwind-inspired Vanilla CSS, Framer Motion (Animations), jsPDF (Report Parsing), Three.js (3D Agent rendering).
* **Backend:** Python 3.10, Flask, NumPy, h5py.
* **Model:** A pre-trained Multi-Layer Perceptron (MLP) stored in `parkinsons_model.h5`.

---

## 🚀 Quick Start (Local Development)

### Prerequisites
* Node.js (v20+ recommended)
* Python (v3.10+)

### Windows Batch Launcher
The easiest way to boot the entire stack instantly on a Windows machine:
```bash
./start_app.bat
```

### Manual Execution
**1. Boot the API Backend:**
```bash
# Install lightweight inference dependencies
pip install -r requirements.txt
# Launch API on port 5000
python server.py
```

**2. Boot the Frontend Interface:**
```bash
cd simulation_app
npm install
npm run dev
```

---

## 🐳 Docker Deployment (Unified Multi-Stage)
The repository features an ultra-efficient Multi-Stage Dockerfile that compiles the React site and securely hosts both the UI and the Python API from a single container.

```bash
# Compile the unified architecture
docker build -t parkinsons-webapp:latest .

# Spin up the application
docker run -p 5005:5000 parkinsons-webapp:latest
```
Visit `http://localhost:5005` in your browser.

---

## ☸️ Kubernetes Deployment
If deploying locally via Minikube, execute the configured manifests:

```bash
# Ensure your image is loaded into Minikube's registry
minikube image load parkinsons-webapp:latest

# Apply the Deployment and NodePort Service
kubectl apply -f deployment.yaml
kubectl apply -f service.yaml

# Access the cluster
minikube service webapp-service
```

---

## ☁️ Serverless Vercel Deployment
The repository is perfectly structured for Vercel hybrid deployments. The `vercel.json` intercepts builds, assigning:
* `@vercel/static-build` to naturally compile `simulation_app/package.json`.
* `@vercel/python` to effortlessly deploy `server.py` as a scalable Serverless function.

Simply link your GitHub repository to Vercel, leave the default build settings, and the custom routings will handle the rest flawlessly.
