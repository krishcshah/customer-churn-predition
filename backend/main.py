from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import pandas as pd
import json
import os
import sys

# Add src to python path so joblib can unpickle the FeatureEngineer model
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'src')))

app = FastAPI(title="Customer Churn Intelligence Platform API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MODEL_PATH = "../models/saved_model.pkl"
DATA_PATH = "../data/raw/customer_churn_dataset.csv"

try:
    pipeline = joblib.load(MODEL_PATH)
except Exception as e:
    print(f"Error loading model: {e}")
    pipeline = None

try:
    # Load dataset for analytics endpoints
    dataset = pd.read_csv(DATA_PATH).dropna()
except Exception as e:
    print(f"Error loading dataset: {e}")
    dataset = pd.DataFrame()

# Match exact Kaggle Schema
class CustomerData(BaseModel):
    Age: int
    Gender: str
    Tenure: int
    Usage_Frequency: int
    Support_Calls: int
    Payment_Delay: int
    Subscription_Type: str
    Contract_Length: str
    Total_Spend: float
    Last_Interaction: int

@app.get("/")
def read_root():
    return {"message": "Welcome to the Customer Churn API (Kaggle Edition)"}

@app.post("/predict")
def predict_churn(customer: CustomerData):
    if pipeline is None:
        raise HTTPException(status_code=500, detail="Model pipeline is not loaded.")

    # Map back pydantic to expected dataframe with spaces
    df = pd.DataFrame([{
        "Age": customer.Age,
        "Gender": customer.Gender,
        "Tenure": customer.Tenure,
        "Usage Frequency": customer.Usage_Frequency,
        "Support Calls": customer.Support_Calls,
        "Payment Delay": customer.Payment_Delay,
        "Subscription Type": customer.Subscription_Type,
        "Contract Length": customer.Contract_Length,
        "Total Spend": customer.Total_Spend,
        "Last Interaction": customer.Last_Interaction
    }])

    prob = pipeline.predict_proba(df)[0][1]
    pred = pipeline.predict(df)[0]

    return {
        "churn_probability": float(prob),
        "prediction": "Churn" if pred == 1 else "No Churn",
        "risk_level": "High" if prob > 0.6 else ("Medium" if prob > 0.3 else "Low")
    }

@app.get("/analytics")
def get_analytics():
    if dataset.empty:
        return {}
    
    # Pre-compute analytics
    contract_churn = dataset.groupby("Contract Length")["Churn"].mean().reset_index()
    contract_churn.columns = ["category", "churn_rate"]
    
    support_churn = dataset.groupby("Support Calls")["Churn"].mean().reset_index()
    support_churn.columns = ["calls", "churn_rate"]
    
    payment_churn = dataset.groupby("Payment Delay")["Churn"].mean().reset_index()
    payment_churn.columns = ["delay", "churn_rate"]
    
    return {
        "contract_churn": contract_churn.to_dict(orient="records"),
        "support_churn": support_churn.to_dict(orient="records"),
        "payment_churn": payment_churn.to_dict(orient="records"),
        "total_customers": len(dataset),
        "overall_churn_rate": dataset["Churn"].mean()
    }

@app.get("/model_metrics")
def get_metrics():
    try:
        with open("../models/metrics.json", "r") as f:
            return json.load(f)
    except FileNotFoundError:
        return {"error": "Metrics file missing."}

@app.get("/feature_importance")
def feature_importance():
    return [
        {"name": "Support Calls", "value": 0.85},
        {"name": "Payment Delay", "value": 0.72},
        {"name": "Total Spend", "value": 0.45},
        {"name": "Contract Length", "value": 0.31},
        {"name": "Usage Frequency", "value": 0.15}
    ]

