import kagglehub
import shutil
import os

print("Downloading dataset via kagglehub...")
path = kagglehub.dataset_download("muhammadshahidazeem/customer-churn-dataset")

print("Path to dataset files:", path)

target_dir = "../data/raw"
os.makedirs(target_dir, exist_ok=True)

# Find the CSV and copy it exactly where our pipeline expects it
for file in os.listdir(path):
    if file.endswith(".csv"):
        source_file = os.path.join(path, file)
        target_file = os.path.join(target_dir, "customer_churn_dataset.csv")
        shutil.copy(source_file, target_file)
        print(f"Successfully copied {file} to {target_file}")
