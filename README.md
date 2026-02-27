# User Management System (UMS)

This project is a comprehensive User Management System, featuring a Node.js/Express backend and a React (Vite) frontend with Tailwind CSS.

## Project Structure

- `frontend/`: Contains the React frontend application.
- `src/`: Contains the Node.js backend application code (Express routes, controllers, middleware).
- `database/`: Contains database migration and configuration files (built with Knex.js).
- `package.json`: Manages backend dependencies and scripts.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) installed
- A running relational database (e.g., PostgreSQL or MySQL) compatible with Knex.js, or SQLite for local development depending on the existing config.

### Backend Setup

1. **Navigate to the root directory**:
   ```bash
   cd UMS
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   - Create a `.env` file in the root directory.
   - Configure the required environment variables (database credentials, JWT secrets, etc.):
     ```env
     PORT=5000
     # Database config, etc.
     ```

4. **Run database migrations:**
   ```bash
   npx knex migrate:latest
   ```

5. **Start the backend server:**
   ```bash
   npm run dev
   ```
   *(Or start with `npm start` for production mode)*

### Frontend Setup

1. **Navigate to the frontend directory**:
   ```bash
   cd frontend
   ```

2. **Install frontend dependencies**:
   ```bash
   npm install
   ```

3. **Set up frontend environment variables (if any):**
   - Create a `.env` file in the `frontend` folder (e.g., for API Base URL).

4. **Start the frontend development server:**
   ```bash
   npm run dev
   ```

The frontend should now be running locally, typically at `http://localhost:5173/`, and will be ready to interact with the local backend.

## Features

- User Authentication & Management
- Department/Role Management
- Status tracking
- Web Interface with React & Tailwind CSS
