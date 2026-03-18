"""
Plant Disease Detection Model Training
=======================================
Agent 2 — AI/ML Models

Trains a CNN-based model using MobileNetV2 transfer learning
for detecting plant diseases from leaf images.

MODES:
  --demo    Creates a small demo model for pipeline testing (default)
  --train   Full training with PlantVillage dataset (requires dataset download)
"""

import os
import sys
import json
import argparse
import numpy as np
from pathlib import Path

# ── Paths ────────────────────────────────────────────────────────────────────
BASE_DIR = Path(__file__).resolve().parent.parent
MODELS_DIR = BASE_DIR / "models"
DATA_DIR = BASE_DIR / "data"

MODEL_PATH = MODELS_DIR / "plant_disease_model.h5"
CLASSES_PATH = MODELS_DIR / "disease_classes.json"

# ── Disease classes (subset of PlantVillage for demo) ────────────────────────
DEMO_CLASSES = [
    "Apple___Apple_scab",
    "Apple___healthy",
    "Corn_(maize)___Common_rust",
    "Corn_(maize)___healthy",
    "Grape___Black_rot",
    "Grape___healthy",
    "Potato___Early_blight",
    "Potato___healthy",
    "Tomato___Bacterial_spot",
    "Tomato___Early_blight",
    "Tomato___Late_blight",
    "Tomato___Leaf_Mold",
    "Tomato___healthy",
    "Rice___Brown_spot",
    "Rice___healthy",
]

# ── Treatment suggestions ───────────────────────────────────────────────────
TREATMENTS = {
    "Apple___Apple_scab": "Apply fungicide (captan or myclobutanil). Remove infected leaves. Improve air circulation.",
    "Apple___healthy": "No treatment needed. Continue regular care and monitoring.",
    "Corn_(maize)___Common_rust": "Apply fungicide (azoxystrobin). Plant resistant varieties. Rotate crops.",
    "Corn_(maize)___healthy": "No treatment needed. Maintain proper nutrition and irrigation.",
    "Grape___Black_rot": "Remove infected fruit/leaves. Apply mancozeb or captan fungicide. Maintain canopy airflow.",
    "Grape___healthy": "No treatment needed. Continue regular pruning and monitoring.",
    "Potato___Early_blight": "Apply chlorothalonil or mancozeb fungicide. Rotate crops. Remove plant debris.",
    "Potato___healthy": "No treatment needed. Maintain proper watering and fertilization.",
    "Tomato___Bacterial_spot": "Apply copper-based bactericide. Remove infected plants. Avoid overhead irrigation.",
    "Tomato___Early_blight": "Apply chlorothalonil fungicide. Mulch around plants. Stake plants for airflow.",
    "Tomato___Late_blight": "Apply metalaxyl or chlorothalonil. Remove infected plants immediately. Avoid wet foliage.",
    "Tomato___Leaf_Mold": "Improve ventilation. Reduce humidity. Apply fungicide if severe.",
    "Tomato___healthy": "No treatment needed. Continue regular care.",
    "Rice___Brown_spot": "Apply mancozeb or carbendazim. Use balanced fertilization. Treat seeds before planting.",
    "Rice___healthy": "No treatment needed. Maintain proper water management.",
}


def create_demo_model():
    """Create a small demo model for testing the API pipeline."""
    print("[DEMO] Creating demo disease detection model...")
    print("  This creates a small model for pipeline testing.")
    print("  For real accuracy, train with the full PlantVillage dataset.\n")

    try:
        os.environ["TF_CPP_MIN_LOG_LEVEL"] = "2"
        import tensorflow as tf
        from tensorflow.keras.applications import MobileNetV2
        from tensorflow.keras.layers import Dense, GlobalAveragePooling2D, Dropout
        from tensorflow.keras.models import Model
    except ImportError:
        print("[ERROR] TensorFlow not installed. Install with: pip install tensorflow")
        print("  Creating a placeholder model metadata file instead...")
        _create_placeholder()
        return

    num_classes = len(DEMO_CLASSES)

    # Build model architecture
    print("[ARCH] Building MobileNetV2 + custom head...")
    base_model = MobileNetV2(
        weights="imagenet",
        include_top=False,
        input_shape=(224, 224, 3),
    )
    base_model.trainable = False  # Freeze base

    x = base_model.output
    x = GlobalAveragePooling2D()(x)
    x = Dense(256, activation="relu")(x)
    x = Dropout(0.3)(x)
    x = Dense(128, activation="relu")(x)
    x = Dropout(0.2)(x)
    predictions = Dense(num_classes, activation="softmax")(x)

    model = Model(inputs=base_model.input, outputs=predictions)
    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=0.001),
        loss="categorical_crossentropy",
        metrics=["accuracy"],
    )

    print(f"  [INFO] Total params: {model.count_params():,}")
    print(f"  [INFO] Classes: {num_classes}")

    # Save model
    MODELS_DIR.mkdir(parents=True, exist_ok=True)
    model.save(str(MODEL_PATH))
    print(f"  [SAVE] Model → {MODEL_PATH}")

    # Save class names and treatments
    class_info = {
        "classes": DEMO_CLASSES,
        "treatments": TREATMENTS,
        "input_shape": [224, 224, 3],
        "model_type": "MobileNetV2",
        "mode": "demo",
    }
    with open(CLASSES_PATH, "w") as f:
        json.dump(class_info, f, indent=2)
    print(f"  [SAVE] Class info → {CLASSES_PATH}")

    print("\n✅ Demo model created!")
    print("  ⚠️  This model is untrained — it will give random predictions.")
    print("  For real results, train with: python train_disease_model.py --train")


def _create_placeholder():
    """Create placeholder files when TensorFlow is not available."""
    MODELS_DIR.mkdir(parents=True, exist_ok=True)
    class_info = {
        "classes": DEMO_CLASSES,
        "treatments": TREATMENTS,
        "input_shape": [224, 224, 3],
        "model_type": "MobileNetV2",
        "mode": "placeholder",
        "note": "TensorFlow was not available. Install TensorFlow and re-run to create real model.",
    }
    with open(CLASSES_PATH, "w") as f:
        json.dump(class_info, f, indent=2)
    print(f"  [SAVE] Class info (placeholder) → {CLASSES_PATH}")
    print("\n⚠️  Placeholder model created. Install TensorFlow for real model.")


def train_full_model():
    """Full training with PlantVillage dataset."""
    print("[TRAIN] Full training mode")
    dataset_dir = DATA_DIR / "PlantVillage"

    if not dataset_dir.exists():
        print(f"\n[ERROR] PlantVillage dataset not found at {dataset_dir}")
        print("  Download it from: https://www.kaggle.com/datasets/emmarex/plantdisease")
        print(f"  Extract to: {dataset_dir}")
        print(f"  Expected structure:")
        print(f"    {dataset_dir}/")
        print(f"      Apple___Apple_scab/")
        print(f"      Apple___healthy/")
        print(f"      ...")
        sys.exit(1)

    try:
        os.environ["TF_CPP_MIN_LOG_LEVEL"] = "2"
        import tensorflow as tf
        from tensorflow.keras.applications import MobileNetV2
        from tensorflow.keras.layers import Dense, GlobalAveragePooling2D, Dropout
        from tensorflow.keras.models import Model
        from tensorflow.keras.preprocessing.image import ImageDataGenerator
        from tensorflow.keras.callbacks import EarlyStopping, ModelCheckpoint
    except ImportError:
        print("[ERROR] TensorFlow required for training. Install: pip install tensorflow")
        sys.exit(1)

    # Data generators with augmentation
    print("[DATA] Setting up data generators with augmentation...")
    train_datagen = ImageDataGenerator(
        rescale=1.0 / 255,
        rotation_range=20,
        width_shift_range=0.2,
        height_shift_range=0.2,
        horizontal_flip=True,
        fill_mode="nearest",
        validation_split=0.2,
    )

    train_gen = train_datagen.flow_from_directory(
        dataset_dir,
        target_size=(224, 224),
        batch_size=32,
        class_mode="categorical",
        subset="training",
    )

    val_gen = train_datagen.flow_from_directory(
        dataset_dir,
        target_size=(224, 224),
        batch_size=32,
        class_mode="categorical",
        subset="validation",
    )

    num_classes = train_gen.num_classes
    class_names = list(train_gen.class_indices.keys())
    print(f"  [INFO] Found {num_classes} classes")

    # Build model
    print("[ARCH] Building MobileNetV2 + custom head...")
    base_model = MobileNetV2(weights="imagenet", include_top=False, input_shape=(224, 224, 3))

    # Freeze base initially
    base_model.trainable = False

    x = base_model.output
    x = GlobalAveragePooling2D()(x)
    x = Dense(256, activation="relu")(x)
    x = Dropout(0.3)(x)
    x = Dense(128, activation="relu")(x)
    x = Dropout(0.2)(x)
    predictions = Dense(num_classes, activation="softmax")(x)

    model = Model(inputs=base_model.input, outputs=predictions)
    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=0.001),
        loss="categorical_crossentropy",
        metrics=["accuracy"],
    )

    # Callbacks
    MODELS_DIR.mkdir(parents=True, exist_ok=True)
    callbacks = [
        EarlyStopping(monitor="val_loss", patience=5, restore_best_weights=True),
        ModelCheckpoint(str(MODEL_PATH), monitor="val_accuracy", save_best_only=True),
    ]

    # Phase 1: Train head only
    print("\n[PHASE 1] Training classification head (base frozen)...")
    model.fit(train_gen, validation_data=val_gen, epochs=10, callbacks=callbacks)

    # Phase 2: Fine-tune top layers of base
    print("\n[PHASE 2] Fine-tuning top layers...")
    base_model.trainable = True
    for layer in base_model.layers[:-30]:
        layer.trainable = False

    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=1e-4),
        loss="categorical_crossentropy",
        metrics=["accuracy"],
    )
    model.fit(train_gen, validation_data=val_gen, epochs=15, callbacks=callbacks)

    # Evaluate
    print("\n[EVAL] Final evaluation...")
    loss, accuracy = model.evaluate(val_gen)
    print(f"  Validation Loss:     {loss:.4f}")
    print(f"  Validation Accuracy: {accuracy:.4f}")

    # Save class info
    class_info = {
        "classes": class_names,
        "treatments": TREATMENTS,
        "input_shape": [224, 224, 3],
        "model_type": "MobileNetV2",
        "mode": "trained",
        "val_accuracy": float(accuracy),
    }
    with open(CLASSES_PATH, "w") as f:
        json.dump(class_info, f, indent=2)
    print(f"  [SAVE] Class info → {CLASSES_PATH}")
    print(f"\n✅ Full model training complete! Accuracy: {accuracy:.4f}")


def main():
    parser = argparse.ArgumentParser(description="Plant Disease Detection Model")
    parser.add_argument("--train", action="store_true", help="Full training with PlantVillage dataset")
    parser.add_argument("--demo", action="store_true", help="Create demo model (default)")
    args = parser.parse_args()

    if args.train:
        train_full_model()
    else:
        create_demo_model()


if __name__ == "__main__":
    main()
