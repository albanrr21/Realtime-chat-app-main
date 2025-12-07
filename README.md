# TrimChat AI - Realtime Chat Application

A modern, full-stack realtime chat application built with **React**, **Node.js**, **Socket.io**, and **SQLite**. Features persistent chat history, secure authentication, and a built-in AI chatbot.

## 🚀 Features

-   **Realtime Messaging**: Instant communication using Socket.io.
-   **🤖 AI Chatbot**: Integrated AI (Pollinations.ai) that responds to `@bot`.
-   **🔐 Secure Authentication**: User Registration & Login (bcrypt + JWT).
-   **💾 Data Persistence**: Chat history and user accounts saved in SQLite (`chat.db`).
-   **📝 Inline Editing**: Edit or delete your messages instantly.
-   **🎨 Modern UI**: Built with React, Vite, and TailwindCSS (Dark Mode).
-   **Typing Indicators**: See when users or the Bot are typing.

## 🛠️ Tech Stack

-   **Frontend**: React, Vite, TailwindCSS, Framer Motion
-   **Backend**: Node.js, Express, Socket.io
-   **Database**: SQLite (handled via `sqlite3`)
-   **Security**: bcryptjs, jsonwebtoken

## 📦 Installation & Setup

1.  **Clone/Download** the repository.
2.  Install **Backend Dependencies**:
    ```bash
    npm install
    ```
3.  Install **Frontend Dependencies**:
    ```bash
    cd client
    npm install
    ```

## ⚙️ Configuration

1.  Create a `.env` file in the root directory.
2.  Copy the contents from `.env.example`:
    ```env
    JWT_SECRET=your_super_secret_key_here
    ```
    *(You can generate a random string for better security).*

## 🏃‍♂️ How to Run

You need to run the **Backend** and **Frontend** in separate terminals.

### Terminal 1: Backend Server
```bash
# From root directory
npm start
# Server runs on http://localhost:3001
```

### Terminal 2: Frontend Client
```bash
# From root directory
cd client
npm run dev
# App runs on http://localhost:5173
```

## 🤖 How to use the Bot
Simply mention `@bot` in any message to get a response from the AI.
> "Hey @bot, tell me a joke!"

## 📂 Project Structure
-   `server.js`: Main backend server entry point.
-   `utils/`: Database and Helper functions.
-   `routes/`: Authentication API routes.
-   `client/`: The React Frontend application.