# Customer Churn Intelligence Platform

An end-to-end Machine Learning project to predict customer churn, featuring a robust ML pipeline, a FastAPI backend, and a modern frontend dashboard.

## Architecture

1. **ML Pipeline (`src/`)**: Automated data preprocessing, feature engineering, model training (XGBoost/RandomForest), and evaluation using Scikit-Learn pipelines.
2. **Backend API (`backend/`)**: FastAPI server exposing endpoints for prediction, SHAP feature importance, and model metrics.
3. **Frontend Dashboard (`frontend/`)**: Modern UI (Next.js/React + TailwindCSS) acting as a SaaS analytics interface.

## Project Structure

```text
customer-churn-platform/
├── data/                  # Raw and processed datasets
├── notebooks/             # Exploratory Data Analysis (EDA)
├── src/                   # ML Training scripts and feature engineering
├── models/                # Serialized model (.pkl)
├── backend/               # FastAPI application
└── frontend/              # Next.js/React UI implementation
```

## How to Run Locally

### 1. Model Training
```bash
cd customer-churn-platform/src
python train_model.py
```
This will train the XGBoost model and save it to `models/saved_model.pkl`.

### 2. Run Backend API
```bash
cd customer-churn-platform/backend
pip install fastapi uvicorn pandas scikit-learn xgboost pydantic
uvicorn main:app --reload --port 8000
```
API Documentation will be available at: `http://localhost:8000/docs`

### 3. Setup Frontend
To set up the Next.js frontend, run from the root directory:
```bash
npx create-next-app@latest customer-churn-platform/frontend
cd customer-churn-platform/frontend
npm run dev
```

## Deployment Ready
- **Backend:** Easily deployable on Render or Railway using the included FastAPI architecture.
- **Frontend:** Ready for Vercel deployment.
