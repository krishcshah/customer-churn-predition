import pandas as pd
import numpy as np
import os

def load_data(filepath='../data/raw/customer_churn_dataset.csv'):
    if not os.path.exists(filepath):
        raise FileNotFoundError(f"File not found: {filepath}")
    return pd.read_csv(filepath)

def clean_data(df):
    if 'CustomerID' in df.columns:
        df = df.drop('CustomerID', axis=1)
        
    # Drop rows where target variable might be missing
    if 'Churn' in df.columns:
        df = df.dropna(subset=['Churn'])
        
    # Handle slight missing values
    df = df.fillna(df.median(numeric_only=True))
    
    # Fill categorical NAs with mode or "Unknown"
    for col in df.select_dtypes(include=['object']).columns:
        df[col] = df[col].fillna("Unknown")
        
    return df
