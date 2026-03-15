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

## Deployment Instructions

### Deploying the Backend on Render
1. Create an account on Render.com and connect your GitHub repository.
2. Click "New +" and select "Web Service".
3. Select this repository from your connected GitHub account.
4. Fill in the following specific deployment details:
   * **Root Directory:** backend
   * **Environment:** Python 3
   * **Build Command:** pip install -r requirements.txt
   * **Start Command:** uvicorn main:app --host 0.0.0.0 --port 10000
5. You will need to create a equirements.txt file inside your ackend/ folder before doing this. It should contain astapi, uvicorn, pydantic, pandas, joblib, and xgboost.
6. Note: Render will need access to the src/ and models/ directories since the backend depends on them. You might need to move main.py to the root folder or adjust your import paths (sys.path.append) to ensure the Python environment finds the pickled model in a production state.
7. Click "Create Web Service". Render will provide you with a live URL (e.g., https://your-backend-app.onrender.com).

### Deploying the Frontend on Vercel
1. Create an account on Vercel.com and connect your GitHub repository.
2. Click "Add New..." and select "Project".
3. Import your designated repository.
4. In the configuration settings, modify the following:
   * **Framework Preset:** Next.js
   * **Root Directory:** rontend
5. Open your frontend source code (specifically rontend/src/app/page.tsx) and replace all instances of http://127.0.0.1:8080 with the live URL you received from Render in the previous step.
6. Click "Deploy". Vercel will automatically build the Next.js application and provide a live URL.
