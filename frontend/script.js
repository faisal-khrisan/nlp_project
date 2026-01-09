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
document.addEventListener('DOMContentLoaded', () => {
    init();
    initInteractiveEffects();
});

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

    // Scroll reveal
    revealOnScroll();
});

// ============================================
// INTERACTIVE EFFECTS
// ============================================

function initInteractiveEffects() {
    // Check if mobile for reduced animations
    const isMobile = window.innerWidth <= 768;

    // Add reveal class to sections with different directions
    document.querySelectorAll('.analyzer-section').forEach(el => {
        el.classList.add('slide-in-left');
    });

    document.querySelectorAll('.compare-section').forEach(el => {
        el.classList.add('slide-in-right');
    });

    document.querySelectorAll('.about-section').forEach(el => {
        el.classList.add('slide-in-up');
    });

    // Add scale-in to cards
    document.querySelectorAll('.tech-card').forEach((el, i) => {
        el.classList.add('scale-in');
        el.style.transitionDelay = `${i * 0.1}s`;
    });

    // Add blur-in to model info
    document.querySelectorAll('.model-info').forEach(el => {
        el.classList.add('blur-in');
    });

    // Add rotate-in to compare cards
    document.querySelectorAll('.compare-card').forEach((el, i) => {
        el.classList.add('rotate-in');
        el.style.transitionDelay = `${i * 0.2}s`;
    });

    // Add stagger to tech grid
    const techGrid = document.querySelector('.tech-grid');
    if (techGrid) techGrid.classList.add('stagger-children');

    // Add ripple effect to buttons
    document.querySelectorAll('.analyze-btn, .compare-btn, .cta-button, .phone-btn').forEach(btn => {
        btn.classList.add('ripple');
    });

    // Add pulse effect to CTA
    const ctaButton = document.querySelector('.cta-button');
    if (ctaButton) ctaButton.classList.add('pulse-effect');

    // Add floating animation to phones
    document.querySelectorAll('.phone').forEach((phone, i) => {
        phone.style.animationDelay = `${i * 0.5}s`;
    });

    // Start animated counters
    animateCounters();

    // Create floating particles (reduced on mobile)
    createParticles(isMobile ? 8 : 15);

    // Initial reveal check
    setTimeout(revealOnScroll, 100);

    // Add parallax effect on mouse move (desktop only)
    if (!isMobile) {
        addParallaxEffect();
    }
}

// Scroll reveal animation
function revealOnScroll() {
    const animatedElements = document.querySelectorAll('.reveal, .slide-in-left, .slide-in-right, .slide-in-up, .scale-in, .rotate-in, .blur-in');
    const windowHeight = window.innerHeight;

    animatedElements.forEach(el => {
        const top = el.getBoundingClientRect().top;
        const revealPoint = 120;

        if (top < windowHeight - revealPoint) {
            el.classList.add('active');
        }
    });

    // Stagger children
    document.querySelectorAll('.stagger-children').forEach(el => {
        const top = el.getBoundingClientRect().top;
        if (top < windowHeight - 100) {
            el.classList.add('active');
        }
    });
}

// Animate counters
function animateCounters() {
    const counters = document.querySelectorAll('.stat-value');

    counters.forEach(counter => {
        const text = counter.textContent;
        const hasPercent = text.includes('%');
        const hasComma = text.includes(',');
        const target = parseInt(text.replace(/[^0-9]/g, ''));

        if (isNaN(target)) return;

        let current = 0;
        const increment = target / 50;
        const duration = 1500;
        const stepTime = duration / 50;

        counter.classList.add('count-up');

        const updateCounter = () => {
            current += increment;
            if (current < target) {
                let displayValue = Math.floor(current);
                if (hasComma) displayValue = displayValue.toLocaleString();
                if (hasPercent) displayValue += '%';
                counter.textContent = displayValue;
                setTimeout(updateCounter, stepTime);
            } else {
                counter.textContent = text;
                counter.classList.add('counter-glow');
            }
        };

        // Start when visible
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    setTimeout(updateCounter, 300);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        observer.observe(counter);
    });
}

// Create floating particles
function createParticles(count = 15) {
    const colors = ['#6366f1', '#8b5cf6', '#0ea5e9', '#10b981'];
    const container = document.body;

    for (let i = 0; i < count; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.cssText = `
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
            width: ${3 + Math.random() * 5}px;
            height: ${3 + Math.random() * 5}px;
            background: ${colors[Math.floor(Math.random() * colors.length)]};
            animation: floatUp ${5 + Math.random() * 5}s ease-in-out infinite;
            animation-delay: ${Math.random() * 5}s;
        `;
        container.appendChild(particle);
    }
}

// Add parallax effect on mouse movement
function addParallaxEffect() {
    const hero = document.querySelector('.hero');
    const phones = document.querySelectorAll('.phone');
    const orbs = document.querySelectorAll('.orb');
    
    if (!hero) return;
    
    document.addEventListener('mousemove', (e) => {
        const mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
        const mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
        
        // Subtle phone movement
        phones.forEach((phone, i) => {
            const direction = i === 0 ? 1 : -1;
            const x = mouseX * 10 * direction;
            const y = mouseY * 5;
            phone.style.transform = `translate(${x}px, ${y}px)`;
        });
        
        // Move orbs more dramatically
        orbs.forEach((orb, i) => {
            const speed = (i + 1) * 15;
            const x = mouseX * speed;
            const y = mouseY * speed;
            orb.style.transform = `translate(${x}px, ${y}px)`;
        });
    });
    
    // Reset on mouse leave
    hero.addEventListener('mouseleave', () => {
        phones.forEach(phone => {
            phone.style.transform = 'translate(0, 0)';
            phone.style.transition = 'transform 0.5s ease';
        });
        orbs.forEach(orb => {
            orb.style.transform = 'translate(0, 0)';
            orb.style.transition = 'transform 0.5s ease';
        });
    });
    
    hero.addEventListener('mouseenter', () => {
        phones.forEach(phone => {
            phone.style.transition = 'transform 0.1s ease';
        });
        orbs.forEach(orb => {
            orb.style.transition = 'transform 0.1s ease';
        });
    });
}

// Show confetti on successful analysis
function showConfetti() {
    const container = document.createElement('div');
    container.className = 'confetti-container';
    document.body.appendChild(container);

    const colors = ['#6366f1', '#8b5cf6', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444'];

    for (let i = 0; i < 50; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.cssText = `
            left: ${Math.random() * 100}%;
            background: ${colors[Math.floor(Math.random() * colors.length)]};
            animation-delay: ${Math.random() * 0.5}s;
            animation-duration: ${2 + Math.random() * 2}s;
        `;
        container.appendChild(confetti);
    }

    setTimeout(() => container.remove(), 4000);
}

// Show toast notification
function showToast(message, type = 'success') {
    // Remove existing toast
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    const icon = type === 'success'
        ? '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>'
        : '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>';

    toast.innerHTML = `${icon}<span>${message}</span>`;
    document.body.appendChild(toast);

    // Trigger animation
    setTimeout(() => toast.classList.add('show'), 10);

    // Remove after delay
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 400);
    }, 3000);
}

// Override displayResults to add confetti
const originalDisplayResults = displayResults;
displayResults = function (data) {
    originalDisplayResults(data);

    // Show confetti for positive sentiment
    if (data.sentiment === 'Positive' && data.confidence > 0.6) {
        showConfetti();
        showToast('Positive sentiment detected! 🎉', 'success');
    } else if (data.sentiment === 'Negative') {
        showToast('Negative sentiment detected', 'error');
    } else {
        showToast('Analysis complete!', 'success');
    }

    // Add bounce animation to result
    const resultContent = document.getElementById('result-content');
    if (resultContent) {
        resultContent.classList.add('bounce');
        setTimeout(() => resultContent.classList.remove('bounce'), 800);
    }
};

// Add typing effect to hero title
function addTypingEffect() {
    const title = document.querySelector('.hero-title .gradient-text');
    if (title) {
        title.classList.add('animated-gradient-text');
    }
}

// Call typing effect
setTimeout(addTypingEffect, 500);
