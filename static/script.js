/**
 * ROP Detection - Frontend JavaScript
 * Handles image upload, API communication, and result rendering
 */

document.addEventListener('DOMContentLoaded', () => {
    const uploadZone = document.getElementById('upload-zone');
    const fileInput = document.getElementById('file-input');
    const uploadContent = document.getElementById('upload-content');
    const loadingContent = document.getElementById('loading-content');
    const resultsSection = document.getElementById('results');

    // Click to upload
    uploadZone.addEventListener('click', () => fileInput.click());

    // File input change
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleFile(e.target.files[0]);
        }
    });

    // Drag and drop handlers
    uploadZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadZone.classList.add('dragover');
    });

    uploadZone.addEventListener('dragleave', (e) => {
        e.preventDefault();
        uploadZone.classList.remove('dragover');
    });

    uploadZone.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadZone.classList.remove('dragover');

        if (e.dataTransfer.files.length > 0) {
            handleFile(e.dataTransfer.files[0]);
        }
    });

    // Handle file upload
    async function handleFile(file) {
        // Validate file type
        if (!file.type.startsWith('image/')) {
            showError('Please upload a valid image file (JPG, PNG)');
            return;
        }

        // Validate file size (10MB max)
        if (file.size > 10 * 1024 * 1024) {
            showError('File size must be less than 10MB');
            return;
        }

        // Show loading state
        uploadContent.classList.add('hidden');
        loadingContent.classList.remove('hidden');
        resultsSection.classList.add('hidden');

        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch('/api/predict', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (data.success) {
                showResults(data);
            } else {
                showError(data.error || 'Analysis failed. Please try again.');
            }
        } catch (error) {
            console.error('Error:', error);
            showError('Connection error. Please check your network and try again.');
        } finally {
            // Reset upload zone
            uploadContent.classList.remove('hidden');
            loadingContent.classList.add('hidden');
            fileInput.value = '';
        }
    }

    // Show results
    function showResults(data) {
        const severityInfo = {
            'Normal': {
                icon: 'check-circle',
                gradient: 'from-emerald-500 to-teal-500',
                bgGradient: 'from-emerald-500/10 to-teal-500/10',
                borderColor: 'border-emerald-500/30',
                description: 'No signs of Retinopathy of Prematurity detected. The retinal blood vessels appear to be developing normally.',
                recommendation: 'Continue routine screening as recommended by your healthcare provider.',
                severity: 'Low Risk'
            },
            'Pre-Plus': {
                icon: 'alert-triangle',
                gradient: 'from-amber-500 to-orange-500',
                bgGradient: 'from-amber-500/10 to-orange-500/10',
                borderColor: 'border-amber-500/30',
                description: 'Early signs of abnormal blood vessel development detected. This stage requires close monitoring.',
                recommendation: 'Schedule a follow-up examination within 1-2 weeks. Consult with a pediatric ophthalmologist.',
                severity: 'Medium Risk'
            },
            'Plus': {
                icon: 'alert-octagon',
                gradient: 'from-red-500 to-rose-500',
                bgGradient: 'from-red-500/10 to-rose-500/10',
                borderColor: 'border-red-500/30',
                description: 'Significant abnormal blood vessel growth detected. This indicates advanced disease requiring immediate attention.',
                recommendation: 'Urgent referral to a pediatric ophthalmologist is recommended. Treatment may be necessary to prevent vision loss.',
                severity: 'High Risk'
            }
        };

        const info = severityInfo[data.diagnosis];

        resultsSection.innerHTML = `
            <div class="result-card glass-card rounded-3xl overflow-hidden" data-diagnosis="${data.diagnosis}" data-confidence="${data.confidence}" data-color="${data.color}" data-description="${info.description}" data-recommendation="${info.recommendation}" data-severity="${info.severity}" data-original="${data.original_image}" data-heatmap="${data.heatmap_overlay}">
                <!-- Header -->
                <div class="bg-gradient-to-r ${info.bgGradient} p-8 border-b border-white/10">
                    <div class="flex items-center justify-between flex-wrap gap-6">
                        <div class="flex items-center gap-5">
                            <div class="w-20 h-20 rounded-2xl bg-gradient-to-br ${info.gradient} flex items-center justify-center shadow-lg">
                                <i data-lucide="${info.icon}" class="w-10 h-10"></i>
                            </div>
                            <div>
                                <div class="text-sm text-gray-400 mb-1">AI Diagnosis</div>
                                <h3 class="text-3xl font-bold mb-1" style="color: ${data.color};">${data.diagnosis}</h3>
                                <div class="badge ${info.borderColor}">
                                    <i data-lucide="gauge" class="w-3 h-3"></i>
                                    ${info.severity}
                                </div>
                            </div>
                        </div>
                        <div class="text-right">
                            <div class="text-sm text-gray-400 mb-1">Confidence Score</div>
                            <div class="text-5xl font-bold stat-number">${data.confidence}<span class="text-2xl text-gray-500">%</span></div>
                        </div>
                    </div>
                </div>
                
                <!-- Body -->
                <div class="p-8">
                    <!-- Description Grid -->
                    <div class="grid md:grid-cols-2 gap-6 mb-8">
                        <div class="p-5 rounded-2xl bg-white/5 border border-white/5">
                            <div class="flex items-center gap-3 mb-3">
                                <div class="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                                    <i data-lucide="file-text" class="w-5 h-5 text-blue-400"></i>
                                </div>
                                <h4 class="font-semibold">Analysis Summary</h4>
                            </div>
                            <p class="text-gray-400 text-sm leading-relaxed">${info.description}</p>
                        </div>
                        <div class="p-5 rounded-2xl bg-white/5 border border-white/5">
                            <div class="flex items-center gap-3 mb-3">
                                <div class="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                                    <i data-lucide="stethoscope" class="w-5 h-5 text-purple-400"></i>
                                </div>
                                <h4 class="font-semibold">Recommendation</h4>
                            </div>
                            <p class="text-gray-400 text-sm leading-relaxed">${info.recommendation}</p>
                        </div>
                    </div>
                    
                    <!-- Grad-CAM Visualization -->
                    <div class="mb-8">
                        <div class="flex items-center gap-3 mb-4">
                            <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center">
                                <i data-lucide="flame" class="w-5 h-5 text-amber-400"></i>
                            </div>
                            <div>
                                <h4 class="font-semibold">Grad-CAM Visualization</h4>
                                <p class="text-sm text-gray-500">Heatmap shows regions influencing the AI's decision</p>
                            </div>
                        </div>
                        <div class="image-compare">
                            <div class="image-frame">
                                <img src="data:image/png;base64,${data.original_image}" alt="Original Image" class="w-full h-auto">
                                <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4">
                                    <div class="flex items-center gap-2 text-sm">
                                        <i data-lucide="image" class="w-4 h-4 text-gray-400"></i>
                                        Original Fundus Image
                                    </div>
                                </div>
                            </div>
                            <div class="image-frame">
                                <img src="data:image/png;base64,${data.heatmap_overlay}" alt="Grad-CAM Heatmap" class="w-full h-auto">
                                <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4">
                                    <div class="flex items-center gap-2 text-sm">
                                        <i data-lucide="flame" class="w-4 h-4 text-amber-400"></i>
                                        AI Attention Heatmap
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Disclaimer -->
                    <div class="p-5 rounded-2xl bg-amber-500/5 border border-amber-500/20 flex items-start gap-4 mb-8">
                        <div class="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                            <i data-lucide="shield-alert" class="w-5 h-5 text-amber-400"></i>
                        </div>
                        <div>
                            <h4 class="font-semibold text-amber-200 mb-1">Medical Disclaimer</h4>
                            <p class="text-sm text-amber-200/70 leading-relaxed">
                                This AI tool is designed to assist healthcare professionals and should not replace clinical judgment. 
                                Always consult a qualified ophthalmologist for diagnosis and treatment decisions.
                            </p>
                        </div>
                    </div>
                    
                    <!-- Action Buttons -->
                    <div class="flex flex-wrap gap-4">
                        <button onclick="printReport()" class="glass px-6 py-3.5 rounded-xl font-medium hover:bg-white/10 transition-all flex items-center gap-3">
                            <i data-lucide="printer" class="w-5 h-5"></i>
                            Print Report
                        </button>
                        <button onclick="downloadReport()" class="glass px-6 py-3.5 rounded-xl font-medium hover:bg-white/10 transition-all flex items-center gap-3">
                            <i data-lucide="download" class="w-5 h-5"></i>
                            Download
                        </button>
                        <button onclick="location.reload()" class="glow-btn px-6 py-3.5 rounded-xl font-medium flex items-center gap-3">
                            <span class="flex items-center gap-3">
                                <i data-lucide="plus-circle" class="w-5 h-5"></i>
                                Analyze New Image
                            </span>
                        </button>
                    </div>
                </div>
            </div>
        `;

        resultsSection.classList.remove('hidden');

        // Re-initialize Lucide icons for new elements
        lucide.createIcons();

        // Scroll to results
        resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    // Show error message
    function showError(message) {
        resultsSection.innerHTML = `
            <div class="result-card glass-card rounded-3xl p-8">
                <div class="flex items-center gap-5">
                    <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500/20 to-rose-500/20 flex items-center justify-center">
                        <i data-lucide="x-circle" class="w-8 h-8 text-red-400"></i>
                    </div>
                    <div>
                        <h3 class="text-xl font-semibold mb-1 text-red-400">Analysis Failed</h3>
                        <p class="text-gray-400">${message}</p>
                    </div>
                </div>
                <div class="flex gap-4 mt-6">
                    <button onclick="location.reload()" class="glass px-6 py-3 rounded-xl font-medium hover:bg-white/10 transition-all flex items-center gap-2">
                        <i data-lucide="refresh-cw" class="w-5 h-5"></i>
                        Try Again
                    </button>
                </div>
            </div>
        `;

        resultsSection.classList.remove('hidden');
        lucide.createIcons();
    }

    // Download report function
    window.downloadReport = function () {
        const resultsEl = document.querySelector('.result-card');
        if (resultsEl) {
            const diagnosis = resultsEl.dataset.diagnosis || 'Unknown';
            const confidence = resultsEl.dataset.confidence || 'N/A';
            const severity = resultsEl.dataset.severity || 'N/A';
            const description = resultsEl.dataset.description || '';
            const recommendation = resultsEl.dataset.recommendation || '';

            const report = `════════════════════════════════════════════════════════════
                    ROP DETECTION REPORT
════════════════════════════════════════════════════════════

Generated: ${new Date().toLocaleString()}

────────────────────────────────────────────────────────────
DIAGNOSIS RESULTS
────────────────────────────────────────────────────────────

Diagnosis:      ${diagnosis}
Risk Level:     ${severity}
Confidence:     ${confidence}%

────────────────────────────────────────────────────────────
ANALYSIS SUMMARY
────────────────────────────────────────────────────────────

${description}

────────────────────────────────────────────────────────────
RECOMMENDATION
────────────────────────────────────────────────────────────

${recommendation}

────────────────────────────────────────────────────────────
MEDICAL DISCLAIMER
────────────────────────────────────────────────────────────

This AI tool is designed to assist healthcare professionals and 
should not replace clinical judgment. Always consult a qualified 
ophthalmologist for diagnosis and treatment decisions.

════════════════════════════════════════════════════════════
              AI-Powered ROP Detection System
════════════════════════════════════════════════════════════`;

            const blob = new Blob([report], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `rop-report-${Date.now()}.txt`;
            a.click();
            URL.revokeObjectURL(url);
        }
    };

    // Print report function - direct download as HTML file (no redirection)
    window.printReport = function () {
        const resultsEl = document.querySelector('.result-card');
        if (!resultsEl) return;

        const diagnosis = resultsEl.dataset.diagnosis || 'Unknown';
        const confidence = resultsEl.dataset.confidence || 'N/A';
        const severity = resultsEl.dataset.severity || 'N/A';
        const color = resultsEl.dataset.color || '#000';
        const description = resultsEl.dataset.description || '';
        const recommendation = resultsEl.dataset.recommendation || '';
        const originalImage = resultsEl.dataset.original || '';
        const heatmapImage = resultsEl.dataset.heatmap || '';

        const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>ROP Detection Report</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            padding: 30px 40px;
            color: #1a1a2e;
            line-height: 1.5;
            max-width: 800px;
            margin: 0 auto;
        }
        .header {
            text-align: center;
            border-bottom: 3px solid #3b82f6;
            padding-bottom: 15px;
            margin-bottom: 25px;
        }
        .header h1 {
            font-size: 24px;
            color: #1a1a2e;
            margin-bottom: 5px;
        }
        .header p {
            color: #666;
            font-size: 13px;
        }
        .diagnosis-box {
            background: linear-gradient(135deg, #f8fafc, #e2e8f0);
            border-radius: 10px;
            padding: 20px;
            margin-bottom: 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-left: 5px solid ${color};
        }
        .diagnosis-box h2 {
            font-size: 28px;
            color: ${color};
            margin-bottom: 5px;
        }
        .diagnosis-box .label {
            font-size: 11px;
            color: #666;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        .severity-badge {
            display: inline-block;
            padding: 4px 12px;
            background: ${color}22;
            color: ${color};
            border-radius: 15px;
            font-size: 11px;
            font-weight: 600;
            margin-top: 5px;
        }
        .confidence { text-align: right; }
        .confidence .number {
            font-size: 36px;
            font-weight: bold;
            color: #1a1a2e;
        }
        .confidence .percent {
            font-size: 18px;
            color: #666;
        }
        .section {
            margin-bottom: 18px;
        }
        .section h3 {
            font-size: 13px;
            color: #3b82f6;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 8px;
            padding-bottom: 5px;
            border-bottom: 1px solid #e2e8f0;
        }
        .section p {
            color: #374151;
            font-size: 13px;
        }
        .images {
            display: flex;
            gap: 15px;
            justify-content: center;
            margin-bottom: 15px;
        }
        .image-box {
            text-align: center;
            flex: 1;
            max-width: 280px;
        }
        .image-box img {
            width: 100%;
            height: auto;
            border-radius: 8px;
            border: 1px solid #e2e8f0;
        }
        .image-box .caption {
            font-size: 11px;
            color: #666;
            margin-top: 6px;
        }
        .disclaimer {
            background: #fffbeb;
            border: 1px solid #fcd34d;
            border-radius: 8px;
            padding: 12px 15px;
            margin-top: 15px;
        }
        .disclaimer h4 {
            color: #b45309;
            font-size: 12px;
            margin-bottom: 4px;
        }
        .disclaimer p {
            color: #92400e;
            font-size: 11px;
        }
        .footer {
            text-align: center;
            margin-top: 20px;
            padding-top: 12px;
            border-top: 1px solid #e2e8f0;
            font-size: 10px;
            color: #9ca3af;
        }
        @media print {
            body { padding: 15px 20px; }
            @page { size: A4; margin: 15mm; }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🔬 ROP Detection Report</h1>
        <p>Generated on ${new Date().toLocaleString()}</p>
    </div>

    <div class="diagnosis-box">
        <div>
            <div class="label">AI Diagnosis</div>
            <h2>${diagnosis}</h2>
            <span class="severity-badge">${severity}</span>
        </div>
        <div class="confidence">
            <div class="label">Confidence Score</div>
            <div class="number">${confidence}<span class="percent">%</span></div>
        </div>
    </div>

    <div class="section">
        <h3>📋 Analysis Summary</h3>
        <p>${description}</p>
    </div>

    <div class="section">
        <h3>💊 Recommendation</h3>
        <p>${recommendation}</p>
    </div>

    <div class="section">
        <h3>🔥 Grad-CAM Visualization</h3>
        <div class="images">
            <div class="image-box">
                <img src="data:image/png;base64,${originalImage}" alt="Original">
                <div class="caption">Original Fundus Image</div>
            </div>
            <div class="image-box">
                <img src="data:image/png;base64,${heatmapImage}" alt="Heatmap">
                <div class="caption">AI Attention Heatmap</div>
            </div>
        </div>
    </div>

    <div class="disclaimer">
        <h4>⚠️ Medical Disclaimer</h4>
        <p>This AI tool is designed to assist healthcare professionals and should not replace clinical judgment. Always consult a qualified ophthalmologist for diagnosis and treatment decisions.</p>
    </div>

    <div class="footer">
        <p>ROP Detection | AI-Powered Retinopathy of Prematurity Diagnosis System</p>
    </div>
</body>
</html>`;

        // Direct download as HTML file
        const blob = new Blob([htmlContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ROP-Report-${new Date().toISOString().slice(0, 10)}.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };
});


