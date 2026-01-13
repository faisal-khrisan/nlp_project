# 🧠 SentimentAI - iPhone 15 vs Galaxy S24 Sentiment Analysis

A stunning web application for analyzing customer sentiment in mobile phone reviews using advanced NLP and Machine Learning techniques.

![Sentiment Analysis](https://img.shields.io/badge/NLP-Sentiment%20Analysis-blue)
![Python](https://img.shields.io/badge/Python-3.8%2B-green)
![FastAPI](https://img.shields.io/badge/FastAPI-0.104-teal)

## ✨ Features

- **Real-time Sentiment Analysis**: Analyze any review text instantly
- **Phone Comparison**: Compare iPhone 15 vs Galaxy S24 reviews side-by-side
- **Multiple ML Models**: TF-IDF + Logistic Regression, Word2Vec + SVM, FastText + SVM
- **Confidence Scores**: See probability distributions for each sentiment class
- **Beautiful UI**: Modern glassmorphism design with smooth animations
- **Offline Mode**: Works with demo predictions when API is unavailable

## 🚀 Quick Start

### 1. Install Backend Dependencies

```bash
cd backend
pip install -r requirements.txt
```


### 3. Start the API Server

```bash
cd backend
python -m uvicorn app:app --reload --port 8000
```

### 4. Open the Frontend

Simply open `frontend/index.html` in your browser, or serve it with:

```bash
cd frontend
python -m http.server 3000
```

Then visit: http://localhost:3000

## 📁 Project Structure

```
nlp/
├── backend/
│   ├── app.py              # FastAPI application
│   ├── requirements.txt    # Python dependencies
│   └── models/             # Trained model files
│       ├── tfidf_vectorizer.pkl
│       └── sentiment_model.pkl
├── frontend/
│   ├── index.html          # Main HTML page
│   ├── styles.css          # Premium CSS styling
│   └── script.js           # Interactive JavaScript
├── Sentiment_iPhone15_vs_S24_FINAL.ipynb  # Training notebook
├── export_models.py        # Model export utility
└── README.md               # This file
```

## 🔧 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Health check |
| `/analyze` | POST | Analyze single review sentiment |
| `/compare` | POST | Compare iPhone vs Samsung reviews |
| `/sample-reviews` | GET | Get sample reviews for demo |

### Example Request

```bash
curl -X POST "http://localhost:8000/analyze" \
     -H "Content-Type: application/json" \
     -d '{"text": "This phone is amazing!", "phone_model": "iPhone 15"}'
```

### Example Response

```json
{
  "sentiment": "Positive",
  "confidence": 0.92,
  "cleaned_text": "phone amazing",
  "probabilities": {
    "Positive": 0.92,
    "Neutral": 0.05,
    "Negative": 0.03
  }
}
```

## 🤖 Models

| Model | Method | Accuracy |
|-------|--------|----------|
| Model A | TF-IDF (Unigram) + Logistic Regression | ~71% |
| Model B | TF-IDF (Unigram+Bigram) + Logistic Regression | ~72% |
| Model C | Word2Vec + SVM | ~72% |
| Model D | FastText + SVM | ~71% |

## 🎨 Tech Stack

**Backend:**
- Python 3.8+
- FastAPI
- Scikit-learn
- NLTK
- Gensim (Word2Vec, FastText)

**Frontend:**
- HTML5
- CSS3 (Glassmorphism, Animations)
- Vanilla JavaScript
- Google Fonts (Inter, Space Grotesk)

## 📊 Dataset

This project uses the [Mobile Reviews Sentiment and Specification](https://www.kaggle.com/datasets/mohankrishnathalla/mobile-reviews-sentiment-and-specification) dataset from Kaggle, filtered for iPhone 15 and Galaxy S24 reviews.

## 🌐 Deployment Options

### Local Development
Follow the Quick Start guide above.

### Docker (Coming Soon)
```bash
docker-compose up
```

### Cloud Deployment
- **Backend**: Deploy to Railway, Render, or Heroku
- **Frontend**: Deploy to Vercel, Netlify, or GitHub Pages

## 📝 License

MIT License - feel free to use this project for learning and development!

---

Built with ❤️ using Python, FastAPI, and modern web technologies.
