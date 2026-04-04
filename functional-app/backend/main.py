# main.py - FastAPI Backend for CNN Model

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
import numpy as np
import io
import tensorflow as tf
import os
from typing import Dict, Any
import logging
from contextlib import asynccontextmanager

# ------------------ Logging ------------------
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ------------------ Global Vars ------------------
cnn_model = None
breed_names = ['Sahiwal', 'Gir', 'Holstein_Friesian', 'Ayrshire', 'Brown_Swiss']
MODEL_FILE = "bovine_breed_classifier.h5"  # update if you saved as .keras

# ------------------ Model Loader ------------------
def load_cnn_model():
    """Load the trained CNN model"""
    global cnn_model

    if not os.path.exists(MODEL_FILE):
        # Try keras format
        alt_file = MODEL_FILE.replace(".h5", ".keras")
        if os.path.exists(alt_file):
            logger.info(f"Switching to Keras format model: {alt_file}")
            model_path = alt_file
        else:
            logger.error(f"❌ Model file not found: {MODEL_FILE}")
            logger.info(f"Current directory: {os.getcwd()}")
            logger.info(f"Files in current directory: {os.listdir('.')}")
            return False
    else:
        model_path = MODEL_FILE

    try:
        logger.info(f"Loading CNN model from {model_path}")
        cnn_model = tf.keras.models.load_model(model_path)
        logger.info("✅ CNN model loaded successfully")
        logger.info(f"Model input shape: {cnn_model.input_shape}")
        logger.info(f"Model output shape: {cnn_model.output_shape}")
        return True
    except Exception as e:
        logger.error(f"❌ Error loading CNN model: {e}")
        return False

# ------------------ Image Preprocessing ------------------
def preprocess_image_for_cnn(image: Image.Image) -> np.ndarray:
    """Preprocess image for CNN model"""
    try:
        img_resized = image.resize((224, 224))
        img_array = np.array(img_resized)
        img_normalized = img_array.astype(np.float32) / 255.0
        img_batch = np.expand_dims(img_normalized, axis=0)
        return img_batch
    except Exception as e:
        raise ValueError(f"Image preprocessing failed: {e}")

# ------------------ Breed Info Helpers ------------------
def get_breed_characteristics(breed_name: str) -> list:
    db = {
        'Sahiwal': [
            'Reddish brown to dark red coat color',
            'Medium to large body size',
            'Loose skin with prominent dewlap',
            'High milk production capacity',
            'Excellent heat tolerance'
        ],
        'Gir': [
            'White to cream with reddish-brown patches',
            'Distinctive curved horns',
            'Large drooping ears',
            'Known for A2 milk production',
            'Indigenous Indian breed from Gujarat'
        ],
        'Holstein_Friesian': [
            'Black and white patched coat pattern',
            'Large body frame with angular features',
            'Very high milk production',
            'European origin breed',
            'Needs good management in hot climates'
        ],
        'Ayrshire': [
            'Red and white patched coat',
            'Medium sized, good proportions',
            'Hardy and adaptable',
            'Good milk quality with moderate yield',
            'Scottish origin breed'
        ],
        'Brown_Swiss': [
            'Light brown to dark brown solid coat',
            'Large muscular build',
            'High protein content in milk',
            'Swiss Alpine origin',
            'Dual-purpose for milk and beef'
        ]
    }
    return db.get(breed_name, ['General cattle characteristics'])

def get_breed_description(breed_name: str) -> str:
    db = {
        'Sahiwal': 'Sahiwal is a premium dairy breed from the Punjab region, renowned for exceptional milk production and heat tolerance.',
        'Gir': 'Gir cattle from Gujarat, India, are famous worldwide for premium A2 milk, with distinctive curved horns and gentle temperament.',
        'Holstein_Friesian': 'Holstein Friesian is the world’s top milk-producing breed, originally from the Netherlands. Needs superior management in hot climates.',
        'Ayrshire': 'Ayrshire cattle from Scotland are hardy, adaptable, and consistent milk producers valued for longevity.',
        'Brown_Swiss': 'Brown Swiss is one of the oldest Swiss dairy breeds, prized for high-protein milk and strong, muscular build suitable for dual purpose.'
    }
    return db.get(breed_name, f'{breed_name} is a cattle breed with specific characteristics.')

# ------------------ Lifespan ------------------
@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("🚀 Starting Cattle Breed Recognition API...")
    logger.info(f"Current working directory: {os.getcwd()}")
    success = load_cnn_model()
    if not success:
        logger.warning("⚠️ Model loading failed, but API will still start")
    yield
    # (Optional) add teardown if needed later

# ------------------ FastAPI App ------------------
app = FastAPI(
    title="Cattle Breed Recognition API",
    version="1.0.0",
    lifespan=lifespan
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ------------------ Routes ------------------
@app.get("/")
async def root():
    return {
        "message": "Cattle Breed Recognition API",
        "status": "running",
        "model_loaded": cnn_model is not None,
        "supported_breeds": breed_names,
        "model_file": MODEL_FILE
    }

@app.get("/model-info")
async def get_model_info():
    if cnn_model is None:
        return {
            "model_loaded": False,
            "error": "Model not found",
            "expected_file": MODEL_FILE,
            "current_directory": os.getcwd(),
            "files_in_directory": [f for f in os.listdir('.') if f.endswith(('.h5', '.keras'))]
        }
    return {
        "model_loaded": True,
        "model_type": "CNN",
        "input_shape": cnn_model.input_shape,
        "output_shape": cnn_model.output_shape,
        "total_parameters": int(cnn_model.count_params()),
        "supported_breeds": breed_names,
        "model_file": MODEL_FILE
    }

@app.post("/predict-breed")
async def predict_breed(file: UploadFile = File(...)) -> Dict[str, Any]:
    if cnn_model is None:
        raise HTTPException(
            status_code=503,
            detail=f"CNN model not loaded. Please check if {MODEL_FILE} exists in the project folder."
        )
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Please upload an image file")

    try:
        logger.info(f"📸 Processing uploaded image: {file.filename}")
        image_bytes = await file.read()
        image = Image.open(io.BytesIO(image_bytes))

        if image.mode != "RGB":
            image = image.convert("RGB")
            logger.info(f"Converted image to RGB")

        logger.info(f"Original image size: {image.size}")

        img_array = preprocess_image_for_cnn(image)

        logger.info("🧠 Making prediction with CNN model...")
        predictions = cnn_model.predict(img_array, verbose=0)[0]

        predicted_class = np.argmax(predictions)
        confidence = float(predictions[predicted_class])
        predicted_breed = breed_names[predicted_class]

        all_predictions = [
            {"breed": breed_names[i], "probability": float(prob)}
            for i, prob in enumerate(predictions)
        ]
        all_predictions.sort(key=lambda x: x["probability"], reverse=True)

        logger.info(f"✅ Prediction: {predicted_breed} ({confidence:.3f})")

        return {
            "success": True,
            "breed": predicted_breed,
            "confidence": confidence,
            "model_used": "CNN",
            "characteristics": get_breed_characteristics(predicted_breed),
            "description": get_breed_description(predicted_breed),
            "all_predictions": all_predictions,
            "image_info": {
                "original_size": list(image.size),
                "processed_size": [224, 224],
                "format": image.format if image.format else "Unknown"
            }
        }
    except Exception as e:
        logger.error(f"❌ Prediction error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

@app.get("/supported-breeds")
async def get_supported_breeds():
    return {
        "breeds": breed_names,
        "count": len(breed_names),
        "model_loaded": cnn_model is not None,
        "model_type": "CNN"
    }

# ------------------ Run Server ------------------
if __name__ == "__main__":
    import uvicorn
    logger.info("🚀 Starting FastAPI server...")
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")
