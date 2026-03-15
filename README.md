# Customer Churn Prediction Engine

This project is a complete end to end machine learning pipeline and web dashboard for analyzing and predicting customer churn. I built it using Python for the backend and data processing, and React for the frontend interface.

## Overview

The system ingests a large dataset of customer records, trains a machine learning model to find patterns in why people leave, and provides a web interface to both explore those macro trends and run individual predictions.

It is split into three main parts:
*   Machine Learning Pipeline: Fetches raw data from Kaggle, cleans it, engineers new features, and trains an XGBoost model.
*   Backend API: A FastAPI server that loads the trained model into memory and exposes endpoints for data analytics and real time predictions.
*   Frontend Dashboard: A Next.js and Tailwind application that visualizes the dataset using Recharts and provides a form to test the model with custom inputs.

## Tech Stack

*   Data Science: Pandas, Scikit Learn, XGBoost
*   Backend: Python, FastAPI, Uvicorn, Pydantic
*   Frontend: React, Next.js, Tailwind CSS, Recharts

## How to Run Locally

1.  Run the pipeline scripts in the src folder to download the data and train the model. This will generate a .pkl file in the models directory.
2.  Start the backend by navigating to the backend folder and running: uvicorn main:app --reload --port 8080
3.  Start the frontend by navigating to the frontend folder and running: npm run dev
4.  Open your browser to localhost:3000 to view the application.

## Notes on the Data

The current model is trained on a synthetic dataset from Kaggle. Users should note that this specific dataset contains some hardcoded mathematical rules (for example, all users over age 50 or on monthly contracts are automatically set to churn). The model learned these rules perfectly, which is mathematically correct but means some prediction inputs will always return extremely strict results.
