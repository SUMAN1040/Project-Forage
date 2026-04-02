# 🚀 Project Reforge (Project-Forage)

[![Django](https://img.shields.io/badge/Framework-Django-092e20?logo=django&logoColor=white)](https://www.djangoproject.com/)
[![Redis](https://img.shields.io/badge/Database-Redis-DC382D?logo=redis&logoColor=white)](https://upstash.com/)
[![Gemini](https://img.shields.io/badge/AI-Gemini-4285F4?logo=google&logoColor=white)](https://ai.google.dev/)

**Project Reforge** is a high-performance, secure clipboard management and AI assistant suite. It enables seamless sharing of text and files across devices via short-lived, secure retrieval codes, integrated with a powerful Gemini AI companion.

---

## ✨ Core Features

### 📋 Secure Clipboard Management
- **Universal Clips**: Store text snippets or files (images, documents) securely.
- **Short-Code Retrieval**: Generate easy-to-type codes for quick retrieval on any device.
- **Self-Destructing Data**: All clips are stored in Redis with a configurable Time-To-Live (TTL), ensuring your data doesn't persist indefinitely.
- **Sanitized Input**: Automatic sanitization of text and validation of file types/sizes for maximum security.

### 🤖 AI-Mate Assistant
- **Gemini Powered**: Built-in chat interface powered by `gemini-flash-latest`.
- **Contextual Help**: Get instant answers, code explanations, or general assistance directly within the app.
- **Optimized Performance**: High-speed AI responses with custom generation parameters (temperature, top-k/p).

### 🧩 Chrome Extension
- **Instant Access**: Capture and retrieve clips directly from your browser.
- **Fluid UI**: Modern, glassmorphism-inspired design for a premium extension experience.
- **Cross-Tab Clipboard**: Sync snippets across multiple browser instances seamlessly.

---

## 🛠️ Technical Stack

- **Backend**: Python / [Django 4.2](https://www.djangoproject.com/)
- **Caching/Storage**: [Upstash Redis](https://upstash.com/)
- **AI Engine**: [Google Gemini Pro/Flash](https://ai.google.dev/)
- **Frontend**: Vanilla JS, Modern CSS (Glassmorphism, Animations)
- **Security**: 
  - Environment-based configuration (`python-dotenv`)
  - CSRF protection for cross-origin requests
  - Base64 encoding for secure file handling

---

## 🚀 Getting Started

### Prerequisites
- Python 3.8+
- Redis access (Upstash account recommended)
- Google Gemini API Key

### Installation

1. **Clone the Repository**
   ```bash
   git clone https://github.com/SUMAN1040/Project-Forage.git
   cd Project-Forage
   ```

2. **Set Up Environment Variables**
   Create a `.env` file in the root directory (refer to [`.env.example`](.env.example)):
   ```env
   UPSTASH_REDIS_REST_URL="your_upstash_url"
   UPSTASH_REDIS_REST_TOKEN="your_upstash_token"
   SESSION_SECRET="your_django_secret"
   GEMINI_API_KEY="your_gemini_key"
   ```

3. **Install Dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Run Migrations**
   ```bash
   python manage.py migrate
   ```

5. **Start the Development Server**
   ```bash
   python manage.py runserver
   ```

---

## 📂 Project Structure

```text
├── chatApp/                # Gemini AI Chat logic
├── clipboard_app/          # Core clipboard retrieval logic
├── extension/              # Chrome Extension source
├── static/                 # Global CSS/JS and assets
├── templates/              # HTML Templates
└── manage.py               # Django management script
```

---

## 🛡️ Security Note
This project is designed with privacy in mind. **Never** commit your `.env` file to version control. The `.gitignore` is pre-configured to exclude sensitive credentials and local databases.

---

## 📄 License
This project is for educational/personal use. Please refer to the repository owner for specific licensing details.
