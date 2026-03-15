import pandas as pd
import numpy as np
import os
import joblib
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from xgboost import XGBClassifier
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score

from data_preprocessing import load_data, clean_data
from feature_engineering import FeatureEngineer

def train_and_evaluate():
    # 1. Load Data
    try:
        df = load_data('../data/raw/customer_churn_dataset.csv')
    except Exception as e:
        print(f"Error loading data: {e}")
        return

    # 2. Clean Data
    df = clean_data(df)

    # 3. Target setup
    # Make sure target is numeric 0/1
    if df['Churn'].dtype == 'object':
         df['Churn'] = df['Churn'].map({'Yes': 1, 'No': 0}).fillna(0).astype(int)
    
    y = df['Churn']
    X = df.drop('Churn', axis=1)

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

    # 4. Detect exact columns for processing dynamically
    numeric_features = X.select_dtypes(include=['int64', 'float64']).columns.tolist()
    categorical_features = X.select_dtypes(include=['object', 'category']).columns.tolist()
    
    # We add custom features engineered later
    numeric_features += ['service_friction']
    categorical_features += ['tenure_group']

    numeric_transformer = Pipeline(steps=[
        ('scaler', StandardScaler())
    ])
    categorical_transformer = Pipeline(steps=[
        ('onehot', OneHotEncoder(handle_unknown='ignore'))
    ])

    preprocessor = ColumnTransformer(
        transformers=[
            ('num', numeric_transformer, numeric_features),
            ('cat', categorical_transformer, categorical_features)
        ])

    # Model Dictionary to compare
    models = {
        'Logistic Regression': LogisticRegression(random_state=42, max_iter=1000),
        'Random Forest': RandomForestClassifier(random_state=42, n_estimators=100),
        'XGBoost': XGBClassifier(random_state=42, eval_metric='logloss')
    }

    best_model = None
    best_auc = 0
    best_model_name = ""
    metrics_summary = {}

    for name, model in models.items():
        print(f"Training {name}...")
        
        clf = Pipeline(steps=[
            ('engineered_features', FeatureEngineer()),
            ('preprocessor', preprocessor),
            ('classifier', model)
        ])
        
        clf.fit(X_train, y_train)
        y_pred = clf.predict(X_test)
        y_prob = clf.predict_proba(X_test)[:, 1]
        
        auc = roc_auc_score(y_test, y_prob)
        metrics_summary[name] = {
            'Accuracy': float(accuracy_score(y_test, y_pred)),
            'Precision': float(precision_score(y_test, y_pred)),
            'Recall': float(recall_score(y_test, y_pred)),
            'F1 Score': float(f1_score(y_test, y_pred)),
            'ROC-AUC': float(auc)
        }
        
        print(f"{name} AUC: {auc:.4f}\n")
        
        if auc > best_auc:
            best_auc = auc
            best_model = clf
            best_model_name = name

    print(f"Best model: {best_model_name} with AUC: {best_auc:.4f}")
    
    # Save the best model
    os.makedirs('../models', exist_ok=True)
    joblib.dump(best_model, '../models/saved_model.pkl')
    
    import json
    with open('../models/metrics.json', 'w') as f:
        json.dump(metrics_summary, f, indent=4)
        
    print("Model and metrics saved successfully to /models/")

if __name__ == '__main__':
    train_and_evaluate()
