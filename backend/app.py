"""
Sentiment Analysis API - iPhone 15 vs Galaxy S24
FastAPI Backend for NLP Sentiment Analysis
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import re
import string
import numpy as np
import pickle
import os

# Download NLTK data on startup
import nltk

# Download all required NLTK data (quietly)
print("📥 Downloading NLTK data...")
nltk.download('punkt', quiet=True)
nltk.download('stopwords', quiet=True)
nltk.download('punkt_tab', quiet=True)
print("✅ NLTK data ready!")

from nltk.corpus import stopwords

app = FastAPI(
    title="Sentiment Analyzer API",
    description="Analyze sentiment for iPhone 15 vs Galaxy S24 reviews",
    version="1.0.0"
)

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global variables for models
tfidf_vectorizer = None
model = None
stop_words = set(stopwords.words('english'))

def clean_text(text: str) -> str:
    """Clean and preprocess text for model input"""
    text = str(text).lower()
    text = re.sub(r"http\S+", "", text)
    text = re.sub(r"\d+", "", text)
    text = text.translate(str.maketrans("", "", string.punctuation))
    tokens = nltk.word_tokenize(text)
    tokens = [t for t in tokens if t not in stop_words and len(t) > 2]
    return " ".join(tokens)

class ReviewRequest(BaseModel):
    text: str
    phone_model: str = "General"

class SentimentResponse(BaseModel):
    sentiment: str
    confidence: float
    cleaned_text: str
    probabilities: dict

class CompareRequest(BaseModel):
    iphone_review: str
    samsung_review: str

class HealthResponse(BaseModel):
    status: str
    model_loaded: bool

@app.on_event("startup")
async def load_models():
    """Load the trained models on startup"""
    global tfidf_vectorizer, model
    
    model_dir = os.path.join(os.path.dirname(__file__), "models")
    
    try:
        tfidf_path = os.path.join(model_dir, "tfidf_vectorizer.pkl")
        model_path = os.path.join(model_dir, "sentiment_model.pkl")
        
        if os.path.exists(tfidf_path) and os.path.exists(model_path):
            with open(tfidf_path, 'rb') as f:
                tfidf_vectorizer = pickle.load(f)
            with open(model_path, 'rb') as f:
                model = pickle.load(f)
            print(" Models loaded successfully!")
        else:
            print(" Model files not found. Using demo mode with rule-based sentiment.")
    except Exception as e:
        print(f" Error loading models: {e}")

def get_demo_sentiment(text: str) -> tuple:
    """Fallback rule-based sentiment for demo purposes"""
    positive_words = ['love', 'great', 'amazing', 'excellent', 'best', 'good', 'awesome', 
                      'fantastic', 'wonderful', 'perfect', 'happy', 'satisfied', 'recommend',
                      'beautiful', 'stunning', 'fast', 'smooth', 'quality', 'worth']
    negative_words = ['hate', 'bad', 'terrible', 'worst', 'poor', 'awful', 'horrible',
                      'disappointed', 'waste', 'broken', 'slow', 'expensive', 'overpriced',
                      'issue', 'problem', 'defect', 'useless', 'regret', 'return']
    
    text_lower = text.lower()
    pos_count = sum(1 for word in positive_words if word in text_lower)
    neg_count = sum(1 for word in negative_words if word in text_lower)
    
    if pos_count > neg_count:
        confidence = min(0.6 + (pos_count * 0.1), 0.95)
        return "Positive", confidence, {
            "Positive": confidence,
            "Neutral": (1 - confidence) * 0.6,
            "Negative": (1 - confidence) * 0.4
        }
    elif neg_count > pos_count:
        confidence = min(0.6 + (neg_count * 0.1), 0.95)
        return "Negative", confidence, {
            "Positive": (1 - confidence) * 0.3,
            "Neutral": (1 - confidence) * 0.7,
            "Negative": confidence
        }
    else:
        return "Neutral", 0.5, {
            "Positive": 0.25,
            "Neutral": 0.5,
            "Negative": 0.25
        }

@app.get("/", response_model=HealthResponse)
async def health_check():
    """Health check endpoint"""
    return HealthResponse(
        status="healthy",
        model_loaded=model is not None
    )

@app.post("/analyze", response_model=SentimentResponse)
async def analyze_sentiment(request: ReviewRequest):
    """Analyze the sentiment of a review text"""
    if not request.text or len(request.text.strip()) < 3:
        raise HTTPException(status_code=400, detail="Text must be at least 3 characters")
    
    cleaned = clean_text(request.text)
    
    if model is not None and tfidf_vectorizer is not None:
        # Use trained model
        vec = tfidf_vectorizer.transform([cleaned])
        prediction = model.predict(vec)[0]
        probabilities = model.predict_proba(vec)[0]
        classes = model.classes_
        
        proba_dict = {cls: float(prob) for cls, prob in zip(classes, probabilities)}
        confidence = float(np.max(probabilities))
    else:
        # Use demo mode
        prediction, confidence, proba_dict = get_demo_sentiment(request.text)
    
    return SentimentResponse(
        sentiment=prediction,
        confidence=round(confidence, 4),
        cleaned_text=cleaned,
        probabilities=proba_dict
    )

@app.post("/compare")
async def compare_phones(request: CompareRequest):
    """Compare sentiment between iPhone and Samsung reviews"""
    iphone_result = await analyze_sentiment(ReviewRequest(text=request.iphone_review, phone_model="iPhone 15"))
    samsung_result = await analyze_sentiment(ReviewRequest(text=request.samsung_review, phone_model="Galaxy S24"))
    
    return {
        "iphone": {
            "sentiment": iphone_result.sentiment,
            "confidence": iphone_result.confidence,
            "probabilities": iphone_result.probabilities
        },
        "samsung": {
            "sentiment": samsung_result.sentiment,
            "confidence": samsung_result.confidence,
            "probabilities": samsung_result.probabilities
        }
    }

@app.get("/sample-reviews")
async def get_sample_reviews():
    """Get sample reviews for demo purposes"""
    return {
        "iphone": [
            "The iPhone 15 camera is absolutely stunning! Best photos I've ever taken.",
            "Battery life on my iPhone 15 is disappointing. Barely lasts a full day.",
            "It's okay, nothing special about the iPhone 15 compared to iPhone 14."
        ],
        "samsung": [
            "Galaxy S24 display is incredible! The colors are so vibrant and smooth.",
            "Overpriced for what you get. Samsung S24 is not worth the money.",
            "The S24 is decent. Does what I need but nothing groundbreaking."
        ]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
