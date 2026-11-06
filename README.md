# BioMatch Pro 🔍👤

[![Live Demo](https://img.shields.io/badge/Demo-Live%20Website-blue?style=for-the-badge&logo=github)](https://yedhukrpj.github.io/biomatch-pro/)

**BioMatch Pro** is a high-performance, client-side facial recognition and matching web application with a sleek, futuristic dark-mode glassmorphism interface. Powered by `face-api.js` (TensorFlow.js), all facial detection, 68-point landmark mapping, and 128-dimensional biometric descriptor comparisons happen **100% locally inside your browser** — ensuring complete privacy with zero server uploads.

🌐 **Live Demo:** [https://yedhukrpj.github.io/biomatch-pro/](https://yedhukrpj.github.io/biomatch-pro/)

---

## ✨ Features

- **🎯 Reference Subject Scanning:** Upload a reference image of the individual you wish to locate. The AI extracts a 128-D facial vector representation.
- **👥 Multi-Target / Group Photo Analysis:**
  - **Group Photos:** Identifies all faces in a group, compares each against the reference subject, and automatically **crops and isolates** the matching face.
  - **Multiple Photo Batches:** Analyzes batches of target images and filters/pops up only the images where a match is detected.
- **⚡ High-Tech Holographic Scanning Animation:** Interactive scanning overlay with a sweeping laser line and holographic blue-tinted topography of the subject.
- **📊 Match Confidence Scoring:** Computes Euclidean vector distance between face embeddings and displays a calibrated match confidence percentage.
- **🔒 100% Client-Side & Private:** Zero backend server requirements. All neural network models execute on-device via WebGL/Wasm.
- **💎 Glassmorphic UI:** Modern dark UI with translucent cards, glowing accents, and smooth responsive animations.

---

## 🚀 Getting Started

### Prerequisites
All you need is a modern web browser (Google Chrome, Microsoft Edge, Brave, Firefox, or Safari). No installation of Node.js or Python is required!

### Running Locally
1. Clone this repository:
   ```bash
   git clone https://github.com/<your-username>/biomatch-pro.git
   ```
2. Navigate into the project folder:
   ```bash
   cd biomatch-pro
   ```
3. Open `index.html` in your web browser, or launch with any static server:
   - Double-click `index.html` directly in File Explorer.
   - Or run with VS Code Live Server / Python / `npx serve`.

---

## 🛠️ Tech Stack

- **Frontend:** Vanilla HTML5, CSS3 (Modern Glassmorphism & Keyframe Animations), JavaScript (ES6+).
- **AI / Computer Vision:** [face-api.js](https://github.com/vladmandic/face-api) (TensorFlow.js backend):
  - SSD MobileNet V1 (Face Detection)
  - Face Landmark 68 Net (Facial Topography)
  - Face Recognition Net (128-D Feature Embeddings)
- **Icons:** [Lucide Icons](https://lucide.dev/)

---

## 📖 How It Works

1. **Model Initialization:** When opened, the app loads pre-trained neural network weights asynchronously from CDN.
2. **Subject Registration:** The user uploads a reference portrait. The AI validates face presence and computes Euclidean descriptor vectors.
3. **Target Analysis:** When targets are provided and "Start Biometric Match" is initiated:
   - Every face across all target photos is detected and vectorized.
   - Euclidean distances \(d\) are calculated against the reference.
   - Faces with \(d < 0.5\) are flagged as verified matches.
4. **Result Rendering:** If a match is inside a group photo, an HTML5 canvas dynamically crops the face region with proportional padding and displays it with confidence statistics.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
