"""
Feature Engineering Pipeline for AI-Based Crop Advisory System
==============================================================
Agent 1 — Data Integration

This script:
  1. Loads the clean dataset produced by data_preprocessing.py
  2. Creates derived features (nutrient ratios, climate indices)
  3. Encodes categorical labels
  4. Splits data into train/test sets
  5. Saves engineered datasets ready for ML training
"""

import os
import sys
import pandas as pd
import numpy as np
from pathlib import Path
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder

# ── Paths ────────────────────────────────────────────────────────────────────
BASE_DIR = Path(__file__).resolve().parent.parent
PROCESSED_DATA_DIR = BASE_DIR / "data" / "processed"
CLEAN_CSV = PROCESSED_DATA_DIR / "clean_crop_dataset.csv"

FEATURE_COLS = ["N", "P", "K", "temperature", "humidity", "ph", "rainfall"]
LABEL_COL = "label"


def load_clean_data() -> pd.DataFrame:
    """Load the cleaned dataset from preprocessing step."""
    if not CLEAN_CSV.exists():
        print(f"[ERROR] Clean dataset not found at {CLEAN_CSV}")
        print("  Run data_preprocessing.py first!")
        sys.exit(1)
    df = pd.read_csv(CLEAN_CSV)
    print(f"[INFO] Loaded {len(df)} rows from {CLEAN_CSV.name}")
    return df


def create_derived_features(df: pd.DataFrame) -> pd.DataFrame:
    """Create agricultural domain-specific derived features."""
    print("\n[FEAT] Creating derived features...")

    # ── Nutrient Ratios ──
    # These ratios are agronomically meaningful for crop suitability
    df["N_P_ratio"] = df["N"] / (df["P"] + 1e-6)  # Nitrogen-to-Phosphorus
    df["N_K_ratio"] = df["N"] / (df["K"] + 1e-6)  # Nitrogen-to-Potassium
    df["P_K_ratio"] = df["P"] / (df["K"] + 1e-6)  # Phosphorus-to-Potassium
    df["NPK_total"] = df["N"] + df["P"] + df["K"]  # Total nutrient load
    print("  [+] Nutrient ratios: N_P_ratio, N_K_ratio, P_K_ratio, NPK_total")

    # ── Climate Indices ──
    # Temperature-Humidity Index (THI) — common in agriculture
    df["temp_humidity_index"] = (0.8 * df["temperature"]) + \
                                 ((df["humidity"] / 100) * (df["temperature"] - 14.4)) + 46.4
    print("  [+] Temperature-Humidity Index (THI)")

    # Rainfall intensity category
    df["rainfall_category"] = pd.cut(
        df["rainfall"],
        bins=[0, 50, 100, 200, 400, 600],
        labels=[0, 1, 2, 3, 4],  # very_low, low, moderate, high, very_high
        include_lowest=True,
    ).astype(float)
    print("  [+] Rainfall category (0=very_low → 4=very_high)")

    # Soil pH category
    df["ph_category"] = pd.cut(
        df["ph"],
        bins=[0, 5.5, 6.5, 7.5, 14],
        labels=[0, 1, 2, 3],  # acidic, slightly_acidic, neutral, alkaline
        include_lowest=True,
    ).astype(float)
    print("  [+] pH category (0=acidic → 3=alkaline)")

    return df


def encode_labels(df: pd.DataFrame) -> tuple[pd.DataFrame, LabelEncoder]:
    """Encode crop labels as integers."""
    print("\n[ENC] Encoding crop labels...")
    le = LabelEncoder()
    df["label_encoded"] = le.fit_transform(df[LABEL_COL])
    label_map = dict(zip(le.classes_, le.transform(le.classes_)))
    print(f"  [INFO] Label mapping ({len(label_map)} classes):")
    for crop, code in sorted(label_map.items(), key=lambda x: x[1]):
        print(f"    {code:3d} → {crop}")

    # Save label mapping
    mapping_df = pd.DataFrame(list(label_map.items()), columns=["crop", "code"])
    mapping_path = PROCESSED_DATA_DIR / "label_mapping.csv"
    mapping_df.to_csv(mapping_path, index=False)
    print(f"  [SAVE] Label mapping → {mapping_path.name}")

    return df, le


def split_data(df: pd.DataFrame, test_size: float = 0.2, random_state: int = 42):
    """Split into train and test sets with stratification."""
    print(f"\n[SPLIT] Splitting data (test_size={test_size}, stratified)...")

    # All features (original + derived)
    feature_columns = [c for c in df.columns if c not in [LABEL_COL, "label_encoded"]]
    X = df[feature_columns]
    y = df["label_encoded"]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y,
        test_size=test_size,
        random_state=random_state,
        stratify=y,
    )

    print(f"  [INFO] Train: {len(X_train)} rows")
    print(f"  [INFO] Test:  {len(X_test)} rows")

    # Save splits
    train_df = pd.concat([X_train.reset_index(drop=True), y_train.reset_index(drop=True)], axis=1)
    test_df = pd.concat([X_test.reset_index(drop=True), y_test.reset_index(drop=True)], axis=1)

    train_path = PROCESSED_DATA_DIR / "train_dataset.csv"
    test_path = PROCESSED_DATA_DIR / "test_dataset.csv"

    train_df.to_csv(train_path, index=False)
    test_df.to_csv(test_path, index=False)
    print(f"  [SAVE] Training set → {train_path.name}")
    print(f"  [SAVE] Test set     → {test_path.name}")

    # Also save just feature names for model inference
    feature_names_path = PROCESSED_DATA_DIR / "feature_names.csv"
    pd.DataFrame({"feature": feature_columns}).to_csv(feature_names_path, index=False)
    print(f"  [SAVE] Feature names → {feature_names_path.name}")

    return X_train, X_test, y_train, y_test


def print_summary(df: pd.DataFrame):
    """Print engineered dataset summary."""
    feature_columns = [c for c in df.columns if c not in [LABEL_COL, "label_encoded"]]
    print("\n" + "=" * 60)
    print("FEATURE ENGINEERING SUMMARY")
    print("=" * 60)
    print(f"  Total features: {len(feature_columns)}")
    print(f"    Original:  {len(FEATURE_COLS)}")
    print(f"    Derived:   {len(feature_columns) - len(FEATURE_COLS)}")
    print(f"  Feature list:")
    for i, col in enumerate(feature_columns, 1):
        tag = "(orig)" if col in FEATURE_COLS else "(new)"
        print(f"    {i:2d}. {col:25s} {tag}")
    print("=" * 60)


def main():
    print("=" * 60)
    print("FEATURE ENGINEERING PIPELINE")
    print("=" * 60)

    # Step 1: Load clean data
    print("\n[1/4] Loading clean dataset...")
    df = load_clean_data()

    # Step 2: Create derived features
    print("\n[2/4] Engineering features...")
    df = create_derived_features(df)

    # Step 3: Encode labels
    print("\n[3/4] Encoding labels...")
    df, label_encoder = encode_labels(df)

    # Step 4: Split data
    print("\n[4/4] Splitting data...")
    split_data(df)

    # Summary
    print_summary(df)

    # Save full engineered dataset
    engineered_csv = PROCESSED_DATA_DIR / "engineered_dataset.csv"
    df.to_csv(engineered_csv, index=False)
    print(f"\n[SAVE] Full engineered dataset → {engineered_csv}")
    print("\n✅ Feature engineering complete!")


if __name__ == "__main__":
    main()
