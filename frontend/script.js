/**
 * SentimentAI - Frontend JavaScript
 * iPhone 15 vs Galaxy S24 Sentiment Analyzer
 */

// Configuration
const API_BASE_URL = 'https://nlp-project-backend.vercel.app';

// DOM Elements
const elements = {
    reviewInput: document.getElementById('review-input'),
    charCount: document.getElementById('char-count'),
    analyzeBtn: document.getElementById('analyze-btn'),
    resultPlaceholder: document.getElementById('result-placeholder'),
    resultContent: document.getElementById('result-content'),
    sentimentBadge: document.getElementById('sentiment-badge'),
    confidenceValue: document.getElementById('confidence-value'),
    confidenceFill: document.getElementById('confidence-fill'),
    probPositive: document.getElementById('prob-positive'),
    probNeutral: document.getElementById('prob-neutral'),
    probNegative: document.getElementById('prob-negative'),
    probPositiveValue: document.getElementById('prob-positive-value'),
    probNeutralValue: document.getElementById('prob-neutral-value'),
    probNegativeValue: document.getElementById('prob-negative-value'),
    cleanedText: document.getElementById('cleaned-text'),
    sampleButtons: document.getElementById('sample-buttons'),

    // Comparison elements
    iphoneReview: document.getElementById('iphone-review'),
    samsungReview: document.getElementById('samsung-review'),
    compareBtn: document.getElementById('compare-btn'),
    iphoneResult: document.getElementById('iphone-result'),
    samsungResult: document.getElementById('samsung-result'),
    compareSummary: document.getElementById('compare-summary'),
    summaryText: document.getElementById('summary-text'),

    // Phone selector buttons
    phoneBtns: document.querySelectorAll('.phone-btn'),
    navLinks: document.querySelectorAll('.nav-link'),
    statusDot: document.querySelector('.status-dot'),
    statusText: document.querySelector('.status-text')
};

// State
let selectedPhone = 'iphone';
let isLoading = false;

// Sample reviews for quick testing
const sampleReviews = {
    positive: [
        "The iPhone 15 camera is absolutely stunning! Best photos I've ever taken with a phone.",
        "Galaxy S24 display is incredible! The colors are so vibrant and the refresh rate is buttery smooth.",
        "Love this phone! Battery life is amazing and it's super fast."
    ],
    negative: [
        "Disappointed with the battery life. Barely lasts half a day with normal use.",
        "Overpriced for what you get. There are much better options available.",
        "The phone keeps freezing and crashing. Worst purchase I've made."
    ],
    neutral: [
        "It's okay, nothing special. Does what I need but nothing groundbreaking.",
        "Average phone for the price. Some features are good, others are lacking.",
        "Decent camera but the battery could be better. Mixed feelings overall."
    ]
};

// Initialize application
function init() {
    setupEventListeners();
    populateSampleButtons();
    checkAPIHealth();
    setupSmoothScrolling();
}

// Setup event listeners
function setupEventListeners() {
    // Text input
    elements.reviewInput.addEventListener('input', handleInputChange);

    // Analyze button
    elements.analyzeBtn.addEventListener('click', handleAnalyze);

    // Phone selector
    elements.phoneBtns.forEach(btn => {
        btn.addEventListener('click', () => handlePhoneSelect(btn));
    });

    // Compare button
    elements.compareBtn.addEventListener('click', handleCompare);

    // Navigation links
    elements.navLinks.forEach(link => {
        link.addEventListener('click', (e) => handleNavClick(e, link));
    });

    // Enter key to analyze
    elements.reviewInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && e.ctrlKey && !elements.analyzeBtn.disabled) {
            handleAnalyze();
        }
    });
}

// Handle input changes
function handleInputChange() {
    const text = elements.reviewInput.value;
    elements.charCount.textContent = text.length;
    elements.analyzeBtn.disabled = text.trim().length < 3;
}

// Handle phone selection
function handlePhoneSelect(btn) {
    elements.phoneBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    selectedPhone = btn.dataset.phone;
}

// Handle navigation click
function handleNavClick(e, link) {
    e.preventDefault();
    elements.navLinks.forEach(l => l.classList.remove('active'));
    link.classList.add('active');

    const targetId = link.getAttribute('href');
    const target = document.querySelector(targetId);
    if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
    }
}

// Setup smooth scrolling for all internal links
function setupSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
}

// Populate sample review buttons
function populateSampleButtons() {
    const samples = [
        { label: 'Positive', icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>', reviews: sampleReviews.positive },
        { label: 'Neutral', icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="8" y1="12" x2="16" y2="12"/></svg>', reviews: sampleReviews.neutral },
        { label: 'Negative', icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>', reviews: sampleReviews.negative }
    ];

    samples.forEach(sample => {
        const btn = document.createElement('button');
        btn.className = 'sample-btn';
        btn.innerHTML = `${sample.icon} ${sample.label}`;
        btn.addEventListener('click', () => {
            const randomReview = sample.reviews[Math.floor(Math.random() * sample.reviews.length)];
            elements.reviewInput.value = randomReview;
            handleInputChange();
        });
        elements.sampleButtons.appendChild(btn);
    });
}

// Check API health status
async function checkAPIHealth() {
    try {
        const response = await fetch(`${API_BASE_URL}/`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });

        if (response.ok) {
            const data = await response.json();
            updateAPIStatus(true, data.model_loaded);
        } else {
            updateAPIStatus(false);
        }
    } catch (error) {
        console.log('API not available, using demo mode');
        updateAPIStatus(false);
    }
}

// Update API status indicator
function updateAPIStatus(online, modelLoaded = false) {
    if (online) {
        elements.statusDot.style.background = modelLoaded ? '#10b981' : '#f59e0b';
        elements.statusText.textContent = modelLoaded ? 'API Online' : 'Demo Mode';
    } else {
        elements.statusDot.style.background = '#f59e0b';
        elements.statusText.textContent = 'Offline Mode';
    }
}

// Handle analyze button click
async function handleAnalyze() {
    if (isLoading) return;

    const text = elements.reviewInput.value.trim();
    if (text.length < 3) return;

    setLoadingState(true);

    try {
        const result = await analyzeSentiment(text);
        displayResult(result);
    } catch (error) {
        console.error('Analysis error:', error);
        // Use fallback analysis
        const fallbackResult = fallbackAnalysis(text);
        displayResult(fallbackResult);
    } finally {
        setLoadingState(false);
    }
}

// Analyze sentiment via API
async function analyzeSentiment(text) {
    try {
        const response = await fetch(`${API_BASE_URL}/analyze`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                text: text,
                phone_model: selectedPhone
            })
        });

        if (!response.ok) {
            throw new Error('API request failed');
        }

        return await response.json();
    } catch (error) {
        console.log('Using fallback analysis');
        return fallbackAnalysis(text);
    }
}

// Fallback analysis (rule-based) when API is not available
function fallbackAnalysis(text) {
    const positiveWords = ['love', 'great', 'amazing', 'excellent', 'best', 'good', 'awesome',
        'fantastic', 'wonderful', 'perfect', 'happy', 'satisfied', 'recommend',
        'beautiful', 'stunning', 'fast', 'smooth', 'quality', 'worth', 'incredible'];
    const negativeWords = ['hate', 'bad', 'terrible', 'worst', 'poor', 'awful', 'horrible',
        'disappointed', 'waste', 'broken', 'slow', 'expensive', 'overpriced',
        'issue', 'problem', 'defect', 'useless', 'regret', 'return', 'freezing'];

    const textLower = text.toLowerCase();
    let posCount = 0;
    let negCount = 0;

    positiveWords.forEach(word => {
        if (textLower.includes(word)) posCount++;
    });

    negativeWords.forEach(word => {
        if (textLower.includes(word)) negCount++;
    });

    let sentiment, confidence, probabilities;

    if (posCount > negCount) {
        confidence = Math.min(0.6 + (posCount * 0.08), 0.95);
        sentiment = 'Positive';
        probabilities = {
            Positive: confidence,
            Neutral: (1 - confidence) * 0.6,
            Negative: (1 - confidence) * 0.4
        };
    } else if (negCount > posCount) {
        confidence = Math.min(0.6 + (negCount * 0.08), 0.95);
        sentiment = 'Negative';
        probabilities = {
            Positive: (1 - confidence) * 0.3,
            Neutral: (1 - confidence) * 0.7,
            Negative: confidence
        };
    } else {
        confidence = 0.5;
        sentiment = 'Neutral';
        probabilities = {
            Positive: 0.25,
            Neutral: 0.5,
            Negative: 0.25
        };
    }

    // Simple text cleaning for display
    const cleanedText = text.toLowerCase()
        .replace(/[^\w\s]/g, '')
        .split(' ')
        .filter(word => word.length > 2)
        .join(' ');

    return {
        sentiment,
        confidence,
        probabilities,
        cleaned_text: cleanedText
    };
}

// Display analysis result
function displayResult(result) {
    // Hide placeholder, show result
    elements.resultPlaceholder.style.display = 'none';
    elements.resultContent.classList.remove('hidden');

    // Update sentiment badge
    const sentimentClass = result.sentiment.toLowerCase();
    elements.sentimentBadge.className = `sentiment-badge ${sentimentClass}`;

    // SVG icons for sentiments (professional look)
    const icons = {
        positive: '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
        neutral: '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="8" y1="12" x2="16" y2="12"/></svg>',
        negative: '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>'
    };

    elements.sentimentBadge.querySelector('.sentiment-icon').innerHTML = icons[sentimentClass] || icons.neutral;
    elements.sentimentBadge.querySelector('.sentiment-label').textContent = result.sentiment;

    // Update confidence
    const confidencePercent = Math.round(result.confidence * 100);
    elements.confidenceValue.textContent = `${confidencePercent}%`;

    // Animate confidence bar
    setTimeout(() => {
        elements.confidenceFill.style.width = `${confidencePercent}%`;
    }, 100);

    // Update probability bars
    const probs = result.probabilities;
    const posProb = Math.round((probs.Positive || 0) * 100);
    const neuProb = Math.round((probs.Neutral || 0) * 100);
    const negProb = Math.round((probs.Negative || 0) * 100);

    elements.probPositiveValue.textContent = `${posProb}%`;
    elements.probNeutralValue.textContent = `${neuProb}%`;
    elements.probNegativeValue.textContent = `${negProb}%`;

    setTimeout(() => {
        elements.probPositive.style.width = `${posProb}%`;
        elements.probNeutral.style.width = `${neuProb}%`;
        elements.probNegative.style.width = `${negProb}%`;
    }, 200);

    // Update cleaned text
    elements.cleanedText.textContent = result.cleaned_text || 'N/A';
}

// Handle comparison
async function handleCompare() {
    const iphoneText = elements.iphoneReview.value.trim();
    const samsungText = elements.samsungReview.value.trim();

    if (iphoneText.length < 3 || samsungText.length < 3) {
        alert('Please enter at least 3 characters for both reviews.');
        return;
    }

    elements.compareBtn.disabled = true;
    elements.compareBtn.innerHTML = '<span>Analyzing...</span>';

    try {
        let iphoneResult, samsungResult;

        try {
            const response = await fetch(`${API_BASE_URL}/compare`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    iphone_review: iphoneText,
                    samsung_review: samsungText
                })
            });

            if (response.ok) {
                const data = await response.json();
                iphoneResult = data.iphone;
                samsungResult = data.samsung;
            } else {
                throw new Error('API failed');
            }
        } catch {
            // Fallback to local analysis
            iphoneResult = fallbackAnalysis(iphoneText);
            samsungResult = fallbackAnalysis(samsungText);
        }

        displayCompareResult('iphone', iphoneResult);
        displayCompareResult('samsung', samsungResult);
        displayCompareSummary(iphoneResult, samsungResult);

    } catch (error) {
        console.error('Comparison error:', error);
    } finally {
        elements.compareBtn.disabled = false;
        elements.compareBtn.innerHTML = `
            <span>Compare Sentiments</span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M8 6l4-4 4 4M8 18l4 4 4-4M12 2v20"/>
            </svg>
        `;
    }
}

// Display comparison result for a phone
function displayCompareResult(phone, result) {
    const resultEl = phone === 'iphone' ? elements.iphoneResult : elements.samsungResult;
    resultEl.classList.remove('hidden');

    // SVG icons for comparison results
    const icons = {
        Positive: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
        Neutral: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="8" y1="12" x2="16" y2="12"/></svg>',
        Negative: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>'
    };

    const colors = {
        Positive: '#10b981',
        Neutral: '#f59e0b',
        Negative: '#ef4444'
    };

    resultEl.querySelector('.compare-sentiment').innerHTML =
        `<span style="color: ${colors[result.sentiment]}; display: flex; align-items: center; gap: 8px;">${icons[result.sentiment]} ${result.sentiment}</span>`;
    resultEl.querySelector('.compare-confidence').textContent =
        `Confidence: ${Math.round(result.confidence * 100)}%`;
}

// Display comparison summary
function displayCompareSummary(iphoneResult, samsungResult) {
    elements.compareSummary.classList.remove('hidden');

    const sentimentOrder = { 'Positive': 3, 'Neutral': 2, 'Negative': 1 };
    const iphoneScore = sentimentOrder[iphoneResult.sentiment] * iphoneResult.confidence;
    const samsungScore = sentimentOrder[samsungResult.sentiment] * samsungResult.confidence;

    let summary = '';

    if (iphoneResult.sentiment === samsungResult.sentiment) {
        if (iphoneResult.confidence > samsungResult.confidence) {
            summary = `Both reviews are ${iphoneResult.sentiment.toLowerCase()}, but the iPhone 15 review has stronger sentiment (${Math.round(iphoneResult.confidence * 100)}% vs ${Math.round(samsungResult.confidence * 100)}%).`;
        } else if (samsungResult.confidence > iphoneResult.confidence) {
            summary = `Both reviews are ${iphoneResult.sentiment.toLowerCase()}, but the Galaxy S24 review has stronger sentiment (${Math.round(samsungResult.confidence * 100)}% vs ${Math.round(iphoneResult.confidence * 100)}%).`;
        } else {
            summary = `Both reviews express similar ${iphoneResult.sentiment.toLowerCase()} sentiment with equal confidence.`;
        }
    } else {
        if (iphoneScore > samsungScore) {
            summary = `The iPhone 15 review is more favorable (${iphoneResult.sentiment}) compared to the Galaxy S24 review (${samsungResult.sentiment}).`;
        } else if (samsungScore > iphoneScore) {
            summary = `The Galaxy S24 review is more favorable (${samsungResult.sentiment}) compared to the iPhone 15 review (${iphoneResult.sentiment}).`;
        } else {
            summary = `The reviews show different sentiments: iPhone 15 is ${iphoneResult.sentiment.toLowerCase()} while Galaxy S24 is ${samsungResult.sentiment.toLowerCase()}.`;
        }
    }

    elements.summaryText.textContent = summary;
}

// Set loading state
function setLoadingState(loading) {
    isLoading = loading;
    elements.analyzeBtn.classList.toggle('loading', loading);
    elements.analyzeBtn.disabled = loading;
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', init);

// Update navigation on scroll
window.addEventListener('scroll', () => {
    const sections = ['hero', 'analyzer', 'compare', 'about'];
    const scrollPos = window.scrollY + 200;

    sections.forEach(sectionId => {
        const section = document.getElementById(sectionId);
        if (section) {
            const top = section.offsetTop;
            const bottom = top + section.offsetHeight;

            if (scrollPos >= top && scrollPos < bottom) {
                elements.navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        }
    });
});
