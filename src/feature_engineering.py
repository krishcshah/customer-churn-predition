import pandas as pd
import numpy as np
from sklearn.base import BaseEstimator, TransformerMixin

class FeatureEngineer(BaseEstimator, TransformerMixin):
    def __init__(self):
        pass

    def fit(self, X, y=None):
        return self

    def transform(self, X):
        X_out = X.copy()
        
        # 1. Feature: Tenure Buckets
        if 'Tenure' in X_out.columns:
            X_out.loc[:, 'tenure_group'] = pd.cut(
                X_out['Tenure'], 
                bins=[-1, 12, 24, 48, 60, np.inf], 
                labels=['0-12', '12-24', '24-48', '48-60', '>60']
            ).astype(str)
            
        # 2. Add Risk Factor proxy combining support delays and interactions
        if 'Payment Delay' in X_out.columns and 'Support Calls' in X_out.columns:
            X_out.loc[:,'service_friction'] = X_out['Payment Delay'] + X_out['Support Calls']
            
        return X_out
