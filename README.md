# 🔬 ROP Detection

[![Python](https://img.shields.io/badge/Python-3.8+-blue.svg)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-green.svg)](https://fastapi.tiangolo.com)
[![PyTorch](https://img.shields.io/badge/PyTorch-2.0+-red.svg)](https://pytorch.org)

AI-powered detection of **Retinopathy of Prematurity (ROP)** in infants using deep learning analysis of retinal fundus images.

---

## ✨ Features

- 🧠 **Deep Learning Model** — EfficientNet-B0 trained for 3-class classification (Normal, Pre-Plus, Plus)
- 🔥 **Grad-CAM Visualization** — Highlights regions influencing the AI's decision
- 🎨 **Modern Web UI** — Premium glassmorphism design with animations
- ⚡ **Fast Inference** — Results in under 3 seconds
- 📄 **Report Generation** — Downloadable HTML reports with images

---

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- pip

### Installation

```bash
# Clone the repository
git clone https://github.com/hanshu110/ROP.git
cd ROP

# Install dependencies
pip install -r requirements.txt

# Run the server
uvicorn main:app --reload
```

Open your browser at **http://127.0.0.1:8000**

---

## 📁 Project Structure

```
ROP/
├── main.py              # FastAPI backend
├── requirements.txt     # Python dependencies
├── ROP_model.pth        # Trained PyTorch model
└── static/
    ├── index.html       # Frontend UI
    ├── styles.css       # Custom CSS (glassmorphism, animations)
    ├── script.js        # Frontend JavaScript
    └── favicon.png      # App icon
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Backend** | FastAPI, Uvicorn |
| **ML** | PyTorch, EfficientNet-B0 |
| **Frontend** | TailwindCSS, Vanilla JS, Lucide Icons |
| **Visualization** | Grad-CAM, Matplotlib |

---

## 📊 Model Information

- **Architecture:** EfficientNet-B0
- **Classes:** Normal, Pre-Plus, Plus Disease
- **Input Size:** 224 × 224 pixels
- **Accuracy:** ~95%

---

## 🩺 What is ROP?

**Retinopathy of Prematurity** is a potentially blinding eye disorder affecting premature infants. Abnormal blood vessel growth in the retina can lead to vision impairment or blindness if not detected early.

**Early detection is critical** — with timely intervention, vision loss can be prevented in most cases.

---

## 📝 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | Serve frontend UI |
| `POST` | `/api/predict` | Upload image for ROP detection |

### Example Request

```bash
curl -X POST "http://127.0.0.1:8000/api/predict" \
  -F "file=@retinal_image.jpg"
```

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

## ⚠️ Disclaimer

This AI tool is designed to **assist healthcare professionals** and should not replace clinical judgment. Always consult a qualified ophthalmologist for diagnosis and treatment decisions.

---

## 📧 Contact

- **GitHub:** [@hanshu110](https://github.com/hanshu110)
- **Email:** hanishb81@gmail.com

---

<p align="center">Made with ❤️ for infant eye health</p>
