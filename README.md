# ExtraHand Support Agent Platform

The **Support Agent Platform** is a comprehensive solution for managing customer support interactions. It consists of a modern **Next.js Frontend** for agents and a robust **Python FastAPI Backend** for real-time communication and data management.

## 🚀 Repositories

- **Frontend**: `SupportAgentServer` (Next.js 15, TailwindCSS)
- **Backend**: `SupportAgentBackendServer` (Python FastAPI, WebSockets)

## ✨ Key Features

### 🖥️ Agent Portal (Frontend)
- **Real-time Dashboard**: Monitor pending queues and active chats in real-time.
- **Live Chat Interface**: Dedicated chat window with history, typing indicators, and quick replies.
- **Analytics Dashboard**: Visual breakdown of agent performance, response times, and resolution rates.
- **Ticket History**: Browse past interactions and customer ticket history.
- **Knowledge Base**: Built-in access to support resources.

### ⚙️ Backend Server (Backend)
- **WebSocket Gateway**: High-performance WebSocket handling for instant messaging between agents and customers.
- **Session Management**: Automated routing of customer sessions to agents.
- **Authentication**: Secure JWT-based agent login and session verification.
- **Data Persistence**: PostgreSQL integration for reliable storage of chat history, user profiles, and logs.
- **Analytics Engine**: Endpoints to calculate daily/weekly performance metrics.

## 🛠️ Technology Stack

- **Frontend**: Next.js 15 (App Router), React 19, TailwindCSS, Lucide Icons.
- **Backend**: Python 3.x, FastAPI, Uvicorn, WebSockets.
- **Database**: PostgreSQL (via `psycopg2`).
- **Auth**: JWT (JSON Web Tokens).

## 🏃 Quick Start

### 1. Backend Setup (`SupportAgentBackendServer`)

1. Navigate to the backend directory:
   ```bash
   cd SupportAgentBackendServer
   ```
2. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Run the server:
   ```bash
   # Runs on port 8001
   python server.py
   # OR
   uvicorn server:app --host 0.0.0.0 --port 8001 --reload
   ```

### 2. Frontend Setup (`SupportAgentServer`)

1. Navigate to the frontend directory:
   ```bash
   cd SupportAgentServer
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   # Runs on port 3005
   npm run dev
   ```

## 🔌 API Endpoints (Backend)

The backend runs on `http://localhost:8001`.

- **WebSockets**:
  - Customer: `/ws/customer/{session_id}`
  - Agent: `/ws/agent/{username}`
- **REST API**:
  - `POST /api/agent/login`: Authenticate agent.
  - `POST /api/sessions`: Create a new support session.
  - `GET /api/agent/stats/{username}`: Get performance metrics.


