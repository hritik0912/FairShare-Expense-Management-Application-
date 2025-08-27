# FairShare 

FairShare is a **full-stack web app** that simplifies shared expense management for friends, roommates, and families. It features **AI-powered receipt scanning**, **recurring subscriptions**, and a **smart debt simplification algorithm** for efficient settlements.

## 🚀 Features
- Secure **JWT authentication**
- **Group management** (create, invite, join groups)
- **Expense tracking** (manual + AI receipt scanning via Gemini API)
- **Debt simplification** (minimal settlements calculated)
- **Recurring subscriptions** (auto-added via daily cron job)

## 🛠 Tech Stack
- **Frontend:** React 18, Vite, Tailwind CSS, React Router  
- **Backend:** Node.js, Express, MongoDB (Mongoose), Multer, node-cron  
- **External Service:** Google Gemini API (OCR)

## ▶️ Run Locally
To run the application, both the backend and frontend servers must be running concurrently.

Step 1: Start the Backend Server
    Open a terminal window.
    
    Navigate to the project's backend directory.
    
    Run npm install
    
    Run npm run dev 
    
    The server will be running on http://localhost:5000.

Step 2: Start the Frontend Application
    Open a second, separate terminal window.
    
    Navigate to the project's frontend directory.
    
    Run npm install 
    
    Run npm run dev 
    
    The application will be accessible in your browser, typically at http://localhost:5173.


Frontend
cd frontend && npm install && npm run dev # runs at http://localhost:5173
