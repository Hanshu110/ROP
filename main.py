"""
ROP Detection - Modern FastAPI Backend
Retinopathy of Prematurity Detection using Deep Learning
"""

import io
import base64
from pathlib import Path

import torch
import torch.nn as nn
import torchvision.models as models
import torchvision.transforms as transforms
import numpy as np
import matplotlib.cm as mplcm
from PIL import Image
from fastapi import FastAPI, UploadFile, File
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse, JSONResponse

# ---------- Config ----------
MODEL_PATH = Path(__file__).parent / "ROP_model.pth"
STATIC_DIR = Path(__file__).parent / "static"
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")
INPUT_SIZE = 224
LABEL_MAP = {0: "Normal", 1: "Pre-Plus", 2: "Plus"}
SEVERITY_COLORS = {
    "Normal": "#10b981",     # Green
    "Pre-Plus": "#f59e0b",   # Amber
    "Plus": "#ef4444"        # Red
}

# ---------- Load Model ----------
def load_model():
    model = models.efficientnet_b0(weights=None)
    model.classifier[1] = nn.Linear(model.classifier[1].in_features, 3)
    model.load_state_dict(torch.load(MODEL_PATH, map_location=DEVICE))
    model.to(DEVICE).eval()
    return model

model = load_model()

# ---------- Find Target Layer ----------
def find_target_layer(module):
    for m in reversed(list(module.modules())):
        if isinstance(m, nn.Conv2d):
            return m
    raise RuntimeError("Conv2D layer not found")

target_layer = find_target_layer(model)

# ---------- Preprocessing ----------
transform = transforms.Compose([
    transforms.Resize((INPUT_SIZE, INPUT_SIZE)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
])

# ---------- Grad-CAM ----------
class GradCAM:
    def __init__(self, model, target_layer):
        self.model = model
        self.target_layer = target_layer
        self.activations = None
        self.gradients = None

        target_layer.register_forward_hook(
            lambda m, i, o: setattr(self, 'activations', o.detach())
        )
        target_layer.register_full_backward_hook(
            lambda m, gi, go: setattr(self, 'gradients', go[0].detach())
        )

    def __call__(self, input_tensor):
        self.model.zero_grad()
        out = self.model(input_tensor)
        softmax = torch.nn.functional.softmax(out, dim=1)
        idx = int(out.argmax(dim=1))
        confidence = float(softmax[0][idx])

        one_hot = torch.zeros_like(out)
        one_hot[0][idx] = 1
        out.backward(gradient=one_hot)

        grads = self.gradients[0]
        weights = grads.mean(dim=(1, 2))
        activations = self.activations[0]

        cam = torch.zeros(activations.shape[1:], device=activations.device)
        for w, a in zip(weights, activations):
            cam += w * a

        cam = torch.relu(cam)
        cam -= cam.min()
        cam /= cam.max() if cam.max() > 0 else 1

        return cam.cpu().numpy(), idx, confidence

# ---------- FastAPI App ----------
app = FastAPI(
    title="ROP Detection",
    description="Retinopathy of Prematurity Detection using Deep Learning"
)

# Mount static files
STATIC_DIR.mkdir(exist_ok=True)
app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")

@app.get("/", response_class=HTMLResponse)
async def serve_frontend():
    """Serve the main HTML page"""
    html_path = STATIC_DIR / "index.html"
    return HTMLResponse(content=html_path.read_text(encoding="utf-8"))

@app.post("/api/predict")
async def predict(file: UploadFile = File(...)):
    """Process uploaded image and return prediction with Grad-CAM visualization"""
    try:
        # Read and process image
        contents = await file.read()
        image = Image.open(io.BytesIO(contents)).convert("RGB")
        
        # Run inference
        inp = transform(image).unsqueeze(0).to(DEVICE)
        cam_np, idx, confidence = GradCAM(model, target_layer)(inp)
        
        diagnosis = LABEL_MAP[idx]
        color = SEVERITY_COLORS[diagnosis]
        
        # Create Grad-CAM heatmap overlay
        cam_img = Image.fromarray(np.uint8(255 * cam_np)).resize(image.size)
        heatmap = mplcm.get_cmap("gnuplot2")(np.array(cam_img) / 255.0)[:, :, :3]
        heatmap = Image.fromarray(np.uint8(255 * heatmap))
        
        overlay = Image.blend(
            image.convert("RGBA"),
            heatmap.convert("RGBA"),
            0.4
        )
        
        # Convert images to base64
        def img_to_base64(img):
            buffer = io.BytesIO()
            img.convert("RGB").save(buffer, format="PNG")
            return base64.b64encode(buffer.getvalue()).decode()
        
        return JSONResponse({
            "success": True,
            "diagnosis": diagnosis,
            "confidence": round(confidence * 100, 2),
            "color": color,
            "original_image": img_to_base64(image),
            "heatmap_overlay": img_to_base64(overlay)
        })
        
    except Exception as e:
        return JSONResponse({
            "success": False,
            "error": str(e)
        }, status_code=500)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
