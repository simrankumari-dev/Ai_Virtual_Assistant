# 🤖 AI Virtual Assistant (MERN + Gemini API)

An AI-powered Virtual Assistant built using the MERN stack with authentication, voice recognition, AI-generated responses, assistant customization, and smart command handling.

This project demonstrates full-stack development skills including authentication, API integration, cloud storage, and real-time user interaction.

---

## 🚀 Features

- 🔐 User Authentication (JWT + HTTP-only Cookies)
- 🤖 AI Response Generation using Gemini API
- 🎙 Voice Recognition Support
- 🖼 Assistant Customization (Name + Image)
- ☁️ Image Upload with Cloudinary
- 🧠 User Conversation History Tracking
- 📅 Smart Commands:
  - Get Date
  - Get Time
  - Get Day
  - Get Month
  - Google Search
  - YouTube Search / Play
  - Open Instagram / Facebook
  - Weather Info
  - Calculator Open
- 🛡 Protected Routes with Middleware

---

## 🛠 Tech Stack

### Frontend
- React (Vite)
- Tailwind CSS
- Axios
- Context API

### Backend
- Node.js
- Express.js
- MongoDB (Mongoose)
- JWT Authentication
- Cookie Parser
- Multer (File Upload)
- Cloudinary (Cloud Image Storage)
- Gemini API Integration

---

## 📂 Project Structure

```
4.virtualAssistant/
│
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middlewares/
│   ├── models/
│   ├── routes/
│   ├── public/
│   └── index.js
│
├── frontend/
│   ├── src/
│   ├── public/
│   └── vite.config.js
│
└── README.md
```

---

## ⚙️ Environment Variables

Create a `.env` file inside the **backend** folder and add the following:

```
PORT=8000
MONGODB_URL=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

GEMINI_API_URL=your_gemini_api_url
```


## 🖥 Installation & Setup

### 1️⃣ Clone Repository

```
git clone https://github.com/yourusername/ai-virtual-assistant.git
cd ai-virtual-assistant
```

---

### 2️⃣ Backend Setup

```
cd backend
npm install
npm run dev
```

Backend runs at:
```
http://localhost:8000
```

---

### 3️⃣ Frontend Setup

Open new terminal:

```
cd frontend
npm install
npm run dev
```

Frontend runs at:
```
http://localhost:5174
```

---

## 🔐 Authentication Flow

1. User signs up / logs in
2. JWT token is generated
3. Token stored in HTTP-only cookie
4. Middleware verifies token
5. Protected routes accessible only when authenticated

---

## 🌟 Future Improvements

- Better error handling
- UI/UX enhancements
- Deployment (Vercel + Render)
- Chat optimization
- Real-time streaming responses

---

## 👩‍💻 Author

Your Name  
LinkedIn: https://linkedin.com/in/yourprofile  
GitHub: https://github.com/yourusername  

---

⭐ If you like this project, give it a star!