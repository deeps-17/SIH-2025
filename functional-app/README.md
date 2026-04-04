# 🐄 Cattle Breed Recognition System

Production-ready cattle breed classifier using MobileNetV2 Transfer Learning. Model developed and evaluated in the companion analysis repository.

## 🚀 How to Run

### 1. Backend (FastAPI)
```bash
cd backend
pip install -r requirements.txt
python main.py
```
- API will be live at: `http://localhost:8000`

### 2. Frontend (React)
```bash
cd frontend
npm install
npm start
```
- App will be live at: `http://localhost:3000`

## 📸 Sample Output
When an image is uploaded, the system returns:
- **Predicted Breed** (e.g., Sahiwal)
- **Confidence Score** (e.g., 94%)
- **Breed Characteristics** (e.g., Heat tolerance, high milk yield)

## 🖼️ Demo
![Sample Prediction](backend/demo_prediction.png)

---
*Developed for SIH2025 — Cattle Research Initiative.*
