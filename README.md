# FinDashboard: Comprehensive Dual Finance Tracker 📊

FinDashboard is an advanced, full-stack ReactJS application structurally engineered to manage and unify **Personal Finance** and **Business Order Tracking** under a highly responsive, unified interface. Built using modern stack constraints, it strictly operates locally combining persistent browser logic with a secure backend authentication matrix.

---

## 🌟 Core Features

### 1. Dual-Scope Finance Tracking
- **Personal Tracker:** Effortlessly track private deductions. Explicitly log and calculate distinct savings goals using the dedicated *PiggyBank* tracking mechanism decoupled from standard expenses!
- **Business Tracker / CRM:** Strictly tracks income related to enterprise operations. Includes a dynamically scaling Customer Database containing histories, contacts, and auto-suggest map forms resolving into active orders!

### 2. Comprehensive Visual Analytics
- **Smart Dashboard:** The landing interface synthesizes 6 crucial active statistics including explicitly measured Total Income, Expenses, Daily Operation Limits, and overarching Net Profit.
- **Interactive Recharts:** Provides a beautiful 6-Month history Bar Chart strictly mapping historic income vs. expenses, followed directly by a smooth Area Gradient chart mapping lifetime Profit expansion!

### 3. Professional Auto-Generators
- **Invoice Renderer:** Natively leverages `jsPDF` to map business orders completely into editable, downloadable PDF Bills securely branded for local operation.
- **Smart Monthly Analyzer:** Contains a distinct reporting suite automatically aggregating every personal and corporate stat across a manually selected historical month. Delivers deep dive calculations printable explicitly to formatted PDF ledgers!

### 4. Enterprise-Grade Configurations
- **Global Theming Layer:** Built upon CSS Variables and integrated natively with React's Context/LocalStorage, features a highly polished deep **Dark Mode** toggle!
- **Universal Delete Control:** Provides surgical precision by implementing a universal garbage/deletion functionality effectively across every single logged transaction matrix globally.

### 5. Secure Architecture
- **JWT Node.js Backend:** The entire UI intercepts unknown requests via a strict Router Auth check. Unauthorized sessions are securely pushed to front-facing Login/Register menus. 
- The backend leverages `bcryptjs` and `jsonwebtoken` to dispense locally resolving signatures preventing breaches effortlessly.
- **Auto-Login Mechanisms:** Automatically clears secondary signup checks, directly deploying active sessions and porting brand new accounts forcefully behind the gateway immediately!

---

## 🛠 Tech Stack

- **Frontend Core:** React, Vite ⚡️
- **Styling Architecture:** Vanilla CSS3 Variables, Glassmorphism 🎨
- **Icons & Visualization:** `lucide-react`, `recharts` 📈
- **Document Rendering:** `jsPDF` 📑
- **Backend Auth Logic:** Node.js, Express, `jsonwebtoken`, `bcryptjs` 🔑

---

## 🚀 Getting Started

To launch both the secure API mechanism and the React client, follow the setup identically:

1. **Clone & Install Details**
   ```bash
   git clone <your-repository-url>
   cd "finance tracker"
   npm install
   ```

2. **Booting the Authentication API**
   To launch the backend logic processing on `Port 5005`:
   ```bash
   node backend/server.js
   ```

3. **Running the Frontend Matrix**
   While your Express API runs in a parallel terminal, execute the fast Vite process locally to inject the DOM cleanly:
   ```bash
   npm run dev
   ```

4. **Navigate to Deployment** 
   Access the dashboard at `http://localhost:5173`. 
   *Note: Because of strict router protection, you must register a new Master Password sequence natively upon your first visit before breaching the tracker interfaces!*

---
