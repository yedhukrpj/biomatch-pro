// CDN path for face-api.js models (Vlad Mandic fork)
const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/';

// State
let referenceDescriptor = null;
let referenceImageElement = null;
let targetImages = []; // Array of HTMLImageElements

// DOM Elements
const statusText = document.getElementById('status-text');
const statusPulse = document.querySelector('.pulse');
const startBtn = document.getElementById('start-match-btn');

const refUploadArea = document.getElementById('reference-upload-area');
const refInput = document.getElementById('reference-input');
const refPreviewContainer = document.getElementById('reference-preview-container');
const refImg = document.getElementById('reference-img');
const clearRefBtn = document.getElementById('clear-ref');

const targetUploadArea = document.getElementById('target-upload-area');
const targetInput = document.getElementById('target-input');
const targetGallery = document.getElementById('target-gallery');
const clearTargetsBtn = document.getElementById('clear-targets');

const scanningOverlay = document.getElementById('scanning-overlay');
const resultsModal = document.getElementById('results-modal');
const closeResultsBtn = document.getElementById('close-results');
const resultsGrid = document.getElementById('results-grid');
const noMatchState = document.getElementById('no-match-state');
const matchCountBadge = document.getElementById('match-count');

// Initialize Application
async function init() {
    try {
        console.log("Loading FaceAPI Models...");
        // Load the models
        await Promise.all([
            faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
            faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
            faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
        ]);

        statusText.innerText = "System Ready";
        statusPulse.classList.add('ready');
        checkReadyState();

    } catch (err) {
        console.error("Failed to load models:", err);
        statusText.innerText = "Model Load Failed";
        statusPulse.style.backgroundColor = "red";
    }
}

// Check if we can enable the start button
function checkReadyState() {
    if (referenceDescriptor && targetImages.length > 0) {
        startBtn.disabled = false;
    } else {
        startBtn.disabled = true;
    }
}

// Convert File to HTMLImageElement
function fileToImage(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    });
}

// Handle Reference Image Upload
refInput.addEventListener('change', async (e) => {
    if (e.target.files.length > 0) {
        const file = e.target.files[0];
        try {
            const img = await fileToImage(file);
            refImg.src = img.src;
            referenceImageElement = img;
            
            // Show preview
            refPreviewContainer.style.display = 'flex';
            
            // Extract face descriptor
            statusText.innerText = "Extracting Reference...";
            statusPulse.classList.remove('ready');
            
            // Yield to the browser so it can paint the image on screen before the heavy AI processing starts
            await new Promise(resolve => setTimeout(resolve, 100));
            
            const detection = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor();
            
            if (detection) {
                referenceDescriptor = detection.descriptor;
                statusText.innerText = "Reference Loaded";
                statusPulse.classList.add('ready');
            } else {
                alert("No face detected in reference image. Please try another one.");
                clearReference();
            }
        } catch (err) {
            console.error(err);
            alert("Error processing image.");
        }
        checkReadyState();
    }
});

function clearReference() {
    refInput.value = '';
    refImg.src = '';
    referenceDescriptor = null;
    referenceImageElement = null;
    refPreviewContainer.style.display = 'none';
    statusText.innerText = "System Ready";
    checkReadyState();
}

clearRefBtn.addEventListener('click', clearReference);

// Handle Target Images Upload
targetInput.addEventListener('change', async (e) => {
    if (e.target.files.length > 0) {
        statusText.innerText = "Loading Targets...";
        statusPulse.classList.remove('ready');
        
        for (const file of e.target.files) {
            const img = await fileToImage(file);
            targetImages.push(img);
            
            // Add to gallery preview
            const thumb = document.createElement('img');
            thumb.src = img.src;
            targetGallery.appendChild(thumb);
        }
        
        targetGallery.style.display = 'grid';
        clearTargetsBtn.style.display = 'flex';
        
        statusText.innerText = "System Ready";
        statusPulse.classList.add('ready');
        checkReadyState();
    }
});

function clearTargets() {
    targetInput.value = '';
    targetGallery.innerHTML = '';
    targetImages = [];
    targetGallery.style.display = 'none';
    clearTargetsBtn.style.display = 'none';
    checkReadyState();
}

clearTargetsBtn.addEventListener('click', clearTargets);

// Matching Logic
startBtn.addEventListener('click', async () => {
    if (!referenceDescriptor || targetImages.length === 0) return;

    // Set the scanning image to the reference image for a cool visual effect
    document.getElementById('scan-image').src = referenceImageElement.src;

    // Show scanning animation
    scanningOverlay.classList.add('active');
    
    // Simulate some loading time for the professional effect if processing is too fast
    await new Promise(r => setTimeout(r, 2000));

    resultsGrid.innerHTML = '';
    let matchCount = 0;

    for (let i = 0; i < targetImages.length; i++) {
        const tImg = targetImages[i];
        
        // Detect all faces in the target image
        const detections = await faceapi.detectAllFaces(tImg).withFaceLandmarks().withFaceDescriptors();
        
        for (const det of detections) {
            // Compare with reference
            const distance = faceapi.euclideanDistance(referenceDescriptor, det.descriptor);
            
            // distance < 0.5 is a good threshold for match
            if (distance < 0.5) {
                matchCount++;
                const isGroupPhoto = detections.length > 1;
                await createResultCard(tImg, det.detection.box, isGroupPhoto, distance);
            }
        }
    }

    // Hide scanner, show results
    scanningOverlay.classList.remove('active');
    matchCountBadge.innerText = `${matchCount} Match${matchCount !== 1 ? 'es' : ''} Found`;
    
    if (matchCount === 0) {
        noMatchState.style.display = 'block';
        resultsGrid.style.display = 'none';
    } else {
        noMatchState.style.display = 'none';
        resultsGrid.style.display = 'grid';
    }
    
    resultsModal.classList.add('active');
});

// Create and append a result card
async function createResultCard(sourceImg, box, isGroupPhoto, distance) {
    const card = document.createElement('div');
    card.className = 'result-card';
    
    const imgWrapper = document.createElement('div');
    imgWrapper.className = 'result-card-img-wrapper';
    
    const displayImg = document.createElement('img');
    
    if (isGroupPhoto) {
        // Crop the face from the group photo using a canvas
        const canvas = document.createElement('canvas');
        // Add padding to bounding box for better crop
        const padding = 0.2; 
        const width = box.width * (1 + padding * 2);
        const height = box.height * (1 + padding * 2);
        const x = Math.max(0, box.x - box.width * padding);
        const y = Math.max(0, box.y - box.height * padding);
        
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(sourceImg, x, y, width, height, 0, 0, width, height);
        displayImg.src = canvas.toDataURL();
    } else {
        // If it's a single photo, just show the full photo as requested ("matching images should pop up")
        displayImg.src = sourceImg.src;
    }
    
    imgWrapper.appendChild(displayImg);
    
    // Confidence score based on distance (lower distance = higher confidence)
    const confidence = Math.max(0, (1 - distance) * 100).toFixed(1);
    
    const scoreBadge = document.createElement('div');
    scoreBadge.className = 'match-score';
    scoreBadge.innerHTML = `<i data-lucide="check-circle" style="width:12px;height:12px;display:inline-block;vertical-align:middle;margin-right:4px;"></i>${confidence}% Match`;
    imgWrapper.appendChild(scoreBadge);
    
    card.appendChild(imgWrapper);
    
    const info = document.createElement('div');
    info.className = 'result-card-info';
    info.innerText = isGroupPhoto ? "Target isolated from group" : "Target matched in file";
    card.appendChild(info);
    
    resultsGrid.appendChild(card);
    
    // Re-initialize lucide icons for newly added elements
    lucide.createIcons({ root: card });
}

// Modal closing
closeResultsBtn.addEventListener('click', () => {
    resultsModal.classList.remove('active');
});

// Boot up
window.addEventListener('DOMContentLoaded', init);
