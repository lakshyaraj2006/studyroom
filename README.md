# 📚 StudyRoom - Collaborative Group Study Platform 🚀

StudyRoom is a modern, high-performance collaborative platform designed to make group study interactive, structured, and seamless. Powered by a robust monorepo architecture, it integrates real-time communications, secure access-controlled study rooms, and custom user profiles under a single workspace.

---

## 🛠️ Technology Stack

| Component | Technologies Used |
| :--- | :--- |
| **Frontend** | React 19, Vite, TypeScript, TailwindCSS v4, shadcn/ui, Axios, Socket.io-client |
| **Backend** | Node.js, Express 5, TypeScript, Socket.io, JWT, Argon2, Nodemailer & MJML, Cloudinary & Multer |
| **Database** | MongoDB (via Mongoose ODM) |
| **Monorepo** | NPM Workspaces, Concurrently |

---

## 📁 Repository Structure

The project is structured as a monorepo under the `packages/` directory:

```bash
studyroom/
├── packages/
│   ├── client/          # 💻 React Frontend Application
│   │   ├── src/
│   │   │   ├── components/  # Reusable UI components & shadcn controls
│   │   │   ├── context/     # Global state providers (Authentication)
│   │   │   ├── hooks/       # Custom React hooks (Auth state, logout, token rotation)
│   │   │   ├── layouts/     # Layout templates (Auth pages, dashboard wrapper)
│   │   │   ├── pages/       # Page views (Auth, Rooms Dashboard, Details, Profile)
│   │   │   ├── routes/      # Client-side routing configuration
│   │   │   └── schemas/     # Frontend validation schemas (Zod)
│   │   └── package.json
│   │
│   └── server/          # ⚙️ Node.js / Express API Backend
│       ├── src/
│       │   ├── core/        # Database connectivity, custom errors, middlewares
│       │   ├── jobs/        # Asynchronous tasks and workers
│       │   ├── modules/     # Domain-driven backend modules
│       │   │   ├── user/         # Identity, JWT authentication & email verification
│       │   │   ├── profile/      # User profiles & Cloudinary file management
│       │   │   ├── rooms/        # Study room management & user invitation flows
│       │   │   └── discussions/  # Live messaging & real-time socket events
│       │   └── server.ts    # Application entry point
│       └── package.json
│
├── package.json         # Workspace root package configuration
└── README.md
```

---

## ✨ Features Breakdown

### 🔑 User Authentication & Security (`packages/server/src/modules/user`)
* **Secure Registration:** Multi-step signup featuring secure Argon2 password hashing.
* **Email Verification:** Complete email verification flow powered by Nodemailer & MJML for beautiful email templates.
* **Token Rotation:** Robust JWT-based authentication with auto-rotated Access and Refresh Tokens stored securely.
* **Access Control:** Express middleware blocks unauthorized endpoints and confirms active login states.
* **Password Recovery:** Secure forgot-password and reset-password pipelines using short-lived verification codes.

### 🏫 Study Rooms (`packages/server/src/modules/rooms`)
* **Flexible Visibility:** Support for both Public (open view) and Private (access-controlled) rooms.
* **Invitation System:** Complete flow for inviting members, accepting, or rejecting invitations.
* **Moderation Tools:** Ability for room creators to block or unblock users to maintain study focus.
* **Room Customization:** Custom tags/topics, descriptions, and custom room images.

### 💬 Real-Time Discussions (`packages/server/src/modules/discussions`)
* **Live Bidirectional Communication:** Seamless real-time chat powered by Socket.io.
* **Access Validations:** Real-time restriction checks to enforce user block lists and private room privacy.
* **Message Management:** Edit and delete discussions in real-time with instant socket broadcasts to all online room participants.
* **Cursor Pagination:** Optimized chat history retrieval using cursor-based pagination for smooth scrolling and low database overhead.

### 👤 Profile & Customization (`packages/server/src/modules/profile`)
* **User Accounts:** Manage display names, handles, and user-specific descriptions.
* **Avatar Storage:** Direct upload and integration with Cloudinary for fast CDN-delivered avatar images.

---

## 🚀 Getting Started

### 📋 Prerequisites
* [Node.js](https://nodejs.org/) (v18.x or higher recommended)
* [MongoDB](https://www.mongodb.com/) (Local instance or Atlas URI)
* Cloudinary API Credentials (for avatar uploads)
* SMTP Server Credentials (for verification emails)

### ⚙️ Environment Configuration

1. **Backend Environment Setup:**
   Create a `.env` file in `packages/server/` based on `packages/server/.env.sample`:
   ```env
   PORT=8080
   MONGODB_URI=your_mongodb_connection_string
   ACCESS_TOKEN_SECRET=your_jwt_access_secret
   REFRESH_TOKEN_SECRET=your_jwt_refresh_secret
   SMTP_HOST=your_smtp_host
   SMTP_PORT=your_smtp_port
   SMTP_USER=your_smtp_username
   SMTP_PASS=your_smtp_password
   CLOUDINARY_CLOUD_NAME=your_cloudinary_name
   CLOUDINARY_API_KEY=your_cloudinary_key
   CLOUDINARY_API_SECRET=your_cloudinary_secret
   FRONTEND_URL=http://localhost:5173
   ```

2. **Frontend Environment Setup:**
   Create a `.env` file in `packages/client/` based on `packages/client/.env.sample`:
   ```env
   VITE_API_URL=http://localhost:8080/api/v1
   VITE_SOCKET_URL=http://localhost:8080
   ```

### 💻 Installation & Execution

1. **Install workspace dependencies:**
   Run the following command at the root of the project:
   ```bash
   npm install
   ```

2. **Run both applications concurrently:**
   Start the frontend client and the backend server concurrently with a single command from the project root:
   ```bash
   npm run dev
   ```

3. **Run individually (optional):**
   * To start the server only:
     ```bash
     npm run dev:server
     ```
   * To start the client only:
     ```bash
     npm run dev:client
     ```

---

## 📄 License
This project is licensed under the MIT License - see the `LICENSE` file for details.