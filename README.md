# 🚀 Project Reforge (Forage)

[![Django](https://img.shields.io/badge/Backend-Django%204.2-092E20?style=for-the-badge&logo=django&logoColor=white)](https://www.djangoproject.com/)
[![Redis](https://img.shields.io/badge/Cache-Upstash%20Redis-FF4438?style=for-the-badge&logo=redis&logoColor=white)](https://upstash.com/)
[![Gemini](https://img.shields.io/badge/AI-Google%20Gemini-4285F4?style=for-the-badge&logo=google-gemini&logoColor=white)](https://ai.google.dev/)
[![Chrome Extension](https://img.shields.io/badge/Extension-Manifest%20V3-4285F4?style=for-the-badge&logo=google-chrome&logoColor=white)](https://developer.chrome.com/docs/extensions/mv3/intro/)

**Project Reforge** is a high-performance, secure, and intelligent application ecosystem designed for modern clipboard management and AI-assisted interactions. It bridges the gap between your desktop, browser, and AI workflows through a unified, secure backend.

---

## ✨ Key Features

### 🔒 Secure Clipboard Management
- **Text & File Sharing**: Instantly share text snippets or files with encrypted-ready data handling.
- **Timed Expiration**: All shared "clips" are stored in a high-performance Redis cache with a configurable TTL (Time-To-Live).
- **Retrieval Codes**: Secure 6-character alphanumeric codes for easy cross-device retrieval.

### 🤖 AI-Mate Integration
- **Gemini Powered**: Built-in intelligent chatbot powered by **Google Gemini Flash** for rapid assistance and information retrieval.
- **Context Aware**: Designed to assist with project tasks, code explanation, and general queries directly from the interface.

### 🌐 Browser Extension (MV3)
- **Seamless Workflow**: Create and retrieve clips without leaving your current tab.
- **Local History**: Integrated storage to keep track of your active shared links and codes.
- **Modern UI**: Sleek, glassmorphic design tailored for a premium user experience.

### 📡 Real-time Notifications
- **Telegram Integration**: Optional Telegram bot integration for instant notifications of activity and logs.

---

## 🛠️ Technical Stack

- **Backend**: [Django 4.2](https://www.djangoproject.com/) (Python)
- **Primary Cache/Storage**: [Upstash Redis](https://upstash.com/)
- **Database**: SQLite (Development)
- **AI Engine**: [Google Generative AI (Gemini Flash)](https://ai.google.dev/)
- **Frontend**: Semantic HTML5, Vanilla CSS (Modern UI/UX), JavaScript (ES6+)
- **Security**: Environment-based configuration, CORS protection, and secure session management.

---

## 🚀 Getting Started

### Prerequisites
- Python 3.10+
- [Upstash Redis](https://upstash.com/) account (REST API enabled)
- [Google AI Studio](https://aistudio.google.com/) API Key (Gemini)

### 1. Clone & Setup
```bash
git clone https://github.com/SUMAN1040/Project-Forage.git
cd Project-Forage
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Environment Configuration
Create a `.env` file in the root directory:
```env
SESSION_SECRET=your_django_secret_key
UPSTASH_REDIS_REST_URL=your_upstash_url
UPSTASH_REDIS_REST_TOKEN=your_upstash_token
GEMINI_API_KEY=your_google_gemini_key

# Optional: Telegram Notifications
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_CHAT_ID=your_chat_id
```

### 3. Initialize Database
```bash
python manage.py migrate
python manage.py collectstatic
```

### 4. Run Development Server
```bash
python manage.py runserver
```
The application will be available at `http://127.0.0.1:8000`.

---

## 🧩 Extension Installation

1. Open Chrome and navigate to `chrome://extensions/`.
2. Enable **Developer mode** (toggle in the top right).
3. Click **Load unpacked**.
4. Select the `extension` folder from this project directory.
5. Pin the extension for quick access!

---

## 📂 Project Structure

```text
├── chatApp/                # AI Chat integration logic
├── clipboard_app/          # Core clipboard & file sharing logic
├── extension/              # Chrome Extension source code
├── secure_clipboard_django/ # Project configuration & settings
├── static/                 # CSS, JS, and global assets
├── templates/              # HTML templates
├── manage.py               # Django entry point
└── requirements.txt        # Backend dependencies
```

---

## 🛡️ Security Note
Project Reforge is designed with security in mind. It uses CORS headers to restrict extension access and environment variables for all sensitive keys. For production deployment, ensure `DEBUG=False` and a secure `SECRET_KEY` is set.

---

## 🤝 Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License
This project is licensed under the MIT License - see the LICENSE file for details.

---
Developed with ❤️ by [SUMAN1040](https://github.com/SUMAN1040)
