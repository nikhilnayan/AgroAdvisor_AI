"""
Crop Recommendation Model Training
===================================
Agent 2 — AI/ML Models

Trains a Random Forest classifier to recommend crops based on
soil nutrients (N, P, K), climate (temperature, humidity, rainfall), and pH.
"""

import os
import sys
import pickle
import pandas as pd
import numpy as np
from pathlib import Path
from sklearn.ensemble import RandomForestClassifier
from sklearn.svm import SVC
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    classification_report, confusion_matrix,
)
from sklearn.model_selection import cross_val_score

# ── Paths ────────────────────────────────────────────────────────────────────
BASE_DIR = Path(__file__).resolve().parent.parent
PROCESSED_DIR = BASE_DIR / "data" / "processed"
MODELS_DIR = BASE_DIR / "models"

TRAIN_CSV = PROCESSED_DIR / "train_dataset.csv"
TEST_CSV = PROCESSED_DIR / "test_dataset.csv"
LABEL_MAP_CSV = PROCESSED_DIR / "label_mapping.csv"
MODEL_PATH = MODELS_DIR / "crop_recommendation_model.pkl"


def load_data():
    """Load train/test splits."""
    for path in [TRAIN_CSV, TEST_CSV]:
        if not path.exists():
            print(f"[ERROR] {path} not found. Run feature_engineering.py first!")
            sys.exit(1)

    train = pd.read_csv(TRAIN_CSV)
    test = pd.read_csv(TEST_CSV)

    X_train = train.drop(columns=["label_encoded"])
    y_train = train["label_encoded"]
    X_test = test.drop(columns=["label_encoded"])
    y_test = test["label_encoded"]

    print(f"[INFO] Training set: {X_train.shape}")
    print(f"[INFO] Test set:     {X_test.shape}")
    return X_train, X_test, y_train, y_test


def load_label_mapping():
    """Load crop label mapping."""
    if LABEL_MAP_CSV.exists():
        mapping = pd.read_csv(LABEL_MAP_CSV)
        return dict(zip(mapping["code"], mapping["crop"]))
    return {}


def train_random_forest(X_train, y_train):
    """Train Random Forest classifier."""
    print("\n[MODEL] Training Random Forest...")
    rf = RandomForestClassifier(
        n_estimators=100,
        max_depth=20,
        min_samples_split=5,
        min_samples_leaf=2,
        random_state=42,
        n_jobs=-1,
    )
    rf.fit(X_train, y_train)

    # Cross-validation
    cv_scores = cross_val_score(rf, X_train, y_train, cv=5, scoring="accuracy")
    print(f"  [CV] 5-Fold Accuracy: {cv_scores.mean():.4f} ± {cv_scores.std():.4f}")
    return rf


def train_svm(X_train, y_train):
    """Train SVM classifier for comparison."""
    print("\n[MODEL] Training SVM (for comparison)...")
    svm = SVC(kernel="rbf", C=1.0, gamma="scale", random_state=42)
    svm.fit(X_train, y_train)
    return svm


def evaluate_model(model, X_test, y_test, model_name, label_map):
    """Evaluate a model and print metrics."""
    print(f"\n{'=' * 60}")
    print(f"EVALUATION: {model_name}")
    print(f"{'=' * 60}")

    y_pred = model.predict(X_test)

    acc = accuracy_score(y_test, y_pred)
    prec = precision_score(y_test, y_pred, average="weighted", zero_division=0)
    rec = recall_score(y_test, y_pred, average="weighted", zero_division=0)
    f1 = f1_score(y_test, y_pred, average="weighted", zero_division=0)

    print(f"  Accuracy:   {acc:.4f}")
    print(f"  Precision:  {prec:.4f}")
    print(f"  Recall:     {rec:.4f}")
    print(f"  F1-Score:   {f1:.4f}")

    # Classification report
    target_names = [label_map.get(i, str(i)) for i in sorted(y_test.unique())]
    print(f"\n  Classification Report:")
    print(classification_report(y_test, y_pred, target_names=target_names, zero_division=0))

    return acc


def get_feature_importances(rf_model, feature_names):
    """Print feature importances from Random Forest."""
    print("\n[FEATURES] Feature Importance Ranking:")
    importances = rf_model.feature_importances_
    indices = np.argsort(importances)[::-1]
    for rank, idx in enumerate(indices, 1):
        print(f"  {rank:2d}. {feature_names[idx]:25s}  {importances[idx]:.4f}")


def save_model(model, label_map, feature_names):
    """Save the trained model with metadata."""
    MODELS_DIR.mkdir(parents=True, exist_ok=True)

    model_bundle = {
        "model": model,
        "label_map": label_map,
        "feature_names": list(feature_names),
        "model_type": "RandomForest",
    }

    with open(MODEL_PATH, "wb") as f:
        pickle.dump(model_bundle, f)
    print(f"\n[SAVE] Model saved → {MODEL_PATH}")


def main():
    print("=" * 60)
    print("CROP RECOMMENDATION MODEL TRAINING")
    print("=" * 60)

    # Load data
    X_train, X_test, y_train, y_test = load_data()
    label_map = load_label_mapping()
    feature_names = list(X_train.columns)

    # Train models
    rf_model = train_random_forest(X_train, y_train)
    svm_model = train_svm(X_train, y_train)

    # Evaluate both
    rf_acc = evaluate_model(rf_model, X_test, y_test, "Random Forest", label_map)
    svm_acc = evaluate_model(svm_model, X_test, y_test, "SVM (RBF)", label_map)

    # Select best model
    print(f"\n{'=' * 60}")
    print("MODEL SELECTION")
    print(f"{'=' * 60}")
    if rf_acc >= svm_acc:
        print(f"  ✅ Random Forest selected (Acc: {rf_acc:.4f} vs SVM: {svm_acc:.4f})")
        best_model = rf_model
        get_feature_importances(rf_model, feature_names)
    else:
        print(f"  ✅ SVM selected (Acc: {svm_acc:.4f} vs RF: {rf_acc:.4f})")
        best_model = svm_model

    # Save
    save_model(best_model, label_map, feature_names)
    print("\n✅ Crop recommendation model training complete!")


if __name__ == "__main__":
    main()
