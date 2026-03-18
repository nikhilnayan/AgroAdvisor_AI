"""
Data Preprocessing Pipeline for AI-Based Crop Advisory System
=============================================================
Agent 1 — Data Integration

This script:
  1. Loads the raw Crop Recommendation dataset
  2. Cleans and validates data (missing values, duplicates, outlier ranges)
  3. Normalizes numerical features
  4. Exports a clean, ML-ready dataset
"""

import os
import sys
import pandas as pd
import numpy as np
from pathlib import Path

# ── Paths ────────────────────────────────────────────────────────────────────
BASE_DIR = Path(__file__).resolve().parent.parent
RAW_DATA_DIR = BASE_DIR / "data" / "raw"
PROCESSED_DATA_DIR = BASE_DIR / "data" / "processed"
RAW_CSV = RAW_DATA_DIR / "crop_recommendation.csv"
CLEAN_CSV = PROCESSED_DATA_DIR / "clean_crop_dataset.csv"

# ── Expected value ranges (agronomic plausibility) ───────────────────────────
VALID_RANGES = {
    "N": (0, 200),
    "P": (0, 200),
    "K": (0, 300),
    "temperature": (-10, 55),
    "humidity": (0, 100),
    "ph": (0, 14),
    "rainfall": (0, 600),
}

FEATURE_COLS = ["N", "P", "K", "temperature", "humidity", "ph", "rainfall"]
LABEL_COL = "label"


def load_raw_data(path: Path = RAW_CSV) -> pd.DataFrame:
    """Load the raw CSV dataset."""
    if not path.exists():
        print(f"[ERROR] Raw data not found at {path}")
        sys.exit(1)
    df = pd.read_csv(path)
    print(f"[INFO] Loaded {len(df)} rows × {len(df.columns)} columns from {path.name}")
    return df


def validate_columns(df: pd.DataFrame) -> pd.DataFrame:
    """Ensure required columns exist."""
    required = FEATURE_COLS + [LABEL_COL]
    missing = [c for c in required if c not in df.columns]
    if missing:
        print(f"[ERROR] Missing columns: {missing}")
        sys.exit(1)
    return df[required]


def handle_missing_values(df: pd.DataFrame) -> pd.DataFrame:
    """Handle missing/null values by filling numeric cols with median and dropping remaining nulls."""
    before = len(df)
    # Fill numeric nulls with column median
    for col in FEATURE_COLS:
        if df[col].isnull().any():
            median_val = df[col].median()
            null_count = df[col].isnull().sum()
            df[col] = df[col].fillna(median_val)
            print(f"  [FIX] Filled {null_count} nulls in '{col}' with median={median_val:.2f}")

    # Drop rows where label is missing
    df = df.dropna(subset=[LABEL_COL])
    after = len(df)
    if before != after:
        print(f"  [FIX] Dropped {before - after} rows with missing labels")
    else:
        print("  [OK] No missing values found")
    return df


def remove_duplicates(df: pd.DataFrame) -> pd.DataFrame:
    """Remove exact duplicate rows."""
    before = len(df)
    df = df.drop_duplicates()
    after = len(df)
    removed = before - after
    if removed > 0:
        print(f"  [FIX] Removed {removed} duplicate rows")
    else:
        print("  [OK] No duplicates found")
    return df


def clip_outliers(df: pd.DataFrame) -> pd.DataFrame:
    """Clip feature values to valid agronomic ranges."""
    clipped_total = 0
    for col, (low, high) in VALID_RANGES.items():
        outlier_mask = (df[col] < low) | (df[col] > high)
        count = outlier_mask.sum()
        if count > 0:
            df[col] = df[col].clip(low, high)
            clipped_total += count
            print(f"  [FIX] Clipped {count} values in '{col}' to [{low}, {high}]")
    if clipped_total == 0:
        print("  [OK] All values within valid ranges")
    return df


def normalize_features(df: pd.DataFrame) -> pd.DataFrame:
    """Apply Min-Max normalization to feature columns and save stats."""
    stats = {}
    for col in FEATURE_COLS:
        col_min = df[col].min()
        col_max = df[col].max()
        if col_max - col_min == 0:
            df[col] = 0.0
        else:
            df[col] = (df[col] - col_min) / (col_max - col_min)
        stats[col] = {"min": col_min, "max": col_max}

    # Save normalization stats for inference-time use
    stats_df = pd.DataFrame(stats).T
    stats_path = PROCESSED_DATA_DIR / "normalization_stats.csv"
    stats_df.to_csv(stats_path, index=True)
    print(f"  [SAVE] Normalization stats → {stats_path.name}")
    return df


def clean_labels(df: pd.DataFrame) -> pd.DataFrame:
    """Standardize label text (lowercase, strip whitespace)."""
    df[LABEL_COL] = df[LABEL_COL].str.strip().str.lower()
    unique = df[LABEL_COL].nunique()
    print(f"  [INFO] {unique} unique crop labels: {sorted(df[LABEL_COL].unique())}")
    return df


def print_summary(df: pd.DataFrame):
    """Print dataset summary statistics."""
    print("\n" + "=" * 60)
    print("DATASET SUMMARY")
    print("=" * 60)
    print(f"  Rows:    {len(df)}")
    print(f"  Columns: {len(df.columns)}")
    print(f"  Labels:  {df[LABEL_COL].nunique()} crops")
    print(f"\n  Samples per crop:")
    for crop, count in df[LABEL_COL].value_counts().sort_index().items():
        print(f"    {crop:15s} → {count:4d}")
    print("\n  Feature statistics (after normalization):")
    print(df[FEATURE_COLS].describe().round(4).to_string())
    print("=" * 60)


def main():
    print("=" * 60)
    print("DATA PREPROCESSING PIPELINE")
    print("=" * 60)

    PROCESSED_DATA_DIR.mkdir(parents=True, exist_ok=True)

    # Step 1: Load
    print("\n[1/6] Loading raw data...")
    df = load_raw_data()

    # Step 2: Validate columns
    print("\n[2/6] Validating columns...")
    df = validate_columns(df)

    # Step 3: Handle missing values
    print("\n[3/6] Handling missing values...")
    df = handle_missing_values(df)

    # Step 4: Remove duplicates
    print("\n[4/6] Removing duplicates...")
    df = remove_duplicates(df)

    # Step 5: Clip outliers
    print("\n[5/6] Clipping outliers to valid ranges...")
    df = clip_outliers(df)

    # Step 6: Clean labels
    print("\n[6/6] Cleaning labels...")
    df = clean_labels(df)

    # Normalize (creates a separate file for ML use)
    print("\n[NORM] Normalizing features...")
    df_normalized = df.copy()
    df_normalized = normalize_features(df_normalized)

    # Save both raw-cleaned and normalized versions
    df.to_csv(CLEAN_CSV, index=False)
    print(f"\n[SAVE] Clean dataset → {CLEAN_CSV}")

    normalized_csv = PROCESSED_DATA_DIR / "normalized_crop_dataset.csv"
    df_normalized.to_csv(normalized_csv, index=False)
    print(f"[SAVE] Normalized dataset → {normalized_csv}")

    # Summary
    print_summary(df)
    print("\n✅ Data preprocessing complete!")


if __name__ == "__main__":
    main()
