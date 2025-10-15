from fastapi import FastAPI, File, UploadFile
import uvicorn
import numpy as np
from io import BytesIO
from PIL import Image
import tensorflow as tf

app = FastAPI()

MODEL = tf.keras.models.load_model("../models/1.0.keras")
CLASS_NAMES = ["Early Blight", "Late Blight", "Healthy"]

IMAGE_SIZE = 256
CHANNELS = 3

@app.get("/ping")
async def ping():
    return "Hello, I am alive"

def read_file_as_image(data) -> np.ndarray:
    image = Image.open(BytesIO(data))
    
    # Convert to RGB if not already (handles grayscale, RGBA, etc.)
    if image.mode != "RGB":
        image = image.convert("RGB")
    
    # Resize to expected dimensions
    image = image.resize((IMAGE_SIZE, IMAGE_SIZE))
    
    # Convert to numpy array with correct dtype
    image = np.array(image, dtype=np.float32)
    
    return image

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    image = read_file_as_image(await file.read())
    
    # Add batch dimension: (256, 256, 3) -> (1, 256, 256, 3)
    image_batch = np.expand_dims(image, 0)
    
    print(f"Image batch shape: {image_batch.shape}")  # Debug print
    
    prediction = MODEL.predict(image_batch)

    predicted_class = CLASS_NAMES[np.argmax(prediction[0])]
    confidence = np.max(prediction[0])
    
    return {
        'class': predicted_class,
        'confidence': float(confidence)
    }

if __name__ == "__main__":
    uvicorn.run(app, host="localhost", port=8001)    