# Spendora: Comprehensive Dual Finance Tracker 🚀

Spendora (formerly CashKalesh) is a beautifully designed, full-stack ReactJS application structurally engineered to manage and unify **Personal Finance** and **Business Order Tracking** under a highly responsive, unified interface.


---

## 🌟 Core Features

### 1. Dual-Scope Finance Tracking
- **Personal Tracker:** Effortlessly track private deductions. Explicitly log and calculate distinct savings goals using the dedicated *PiggyBank* tracking mechanism decoupled from standard expenses!
- **Business Tracker / CRM:** The previously standalone Customer Database has been elegantly merged directly into the Business Tracker via a seamless tab system! Track historic income and active orders from your customers in one unified place.

### 2. Beautiful Mobile-First UX
- **Dynamic iOS-style Pill Dock:** On mobile, the sidebar gracefully converts into a floating, frosted glass "pill" dock completely detached from edges for an extremely premium smartphone experience.
- **Top Mobile Header:** Clean and simple floating top navigation on small screens to quickly access your profile.

### 3. Comprehensive Visual Analytics
- **Smart Dashboard:** The landing interface synthesizes crucial active statistics including explicitly measured Total Income, Expenses, Daily Operation Limits, and overarching Net Profit.
- **Vibrant Interactive Recharts:** Provides a beautiful 6-Month history Bar Chart strictly mapping historic income vs. expenses, followed directly by a smooth Area Gradient chart leveraging identical Spendora Purple and Cyan neon palettes.

### 4. Professional Auto-Generators
- **Invoice Renderer:** Natively leverages `jsPDF` to map business orders completely into editable, downloadable PDF Bills securely branded for local operation.
- **Smart Monthly Analyzer:** Contains a distinct reporting suite automatically aggregating every personal and corporate stat across a manually selected historical month. Delivers deep dive calculations printable explicitly to formatted PDF ledgers!

### 5. Secure Architecture
- **JWT Node.js Backend:** The entire UI intercepts unknown requests via a strict Router Auth check tracking against a local Express server.
- The backend leverages `bcryptjs` and `jsonwebtoken` to dispense locally resolving signatures preventing breaches effortlessly.

---

## 🛠 Tech Stack

- **Frontend Core:** React, Vite ⚡️
- **Styling Architecture:** Vanilla CSS3 Variables, Glassmorphism, Neon Theming 🎨
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
   To launch the backend logic processing tightly locked onto `Port 5005`:
   ```bash
   node backend/server.js
   ```

3. **Running the Frontend Matrix**
   While your Express API runs in a background terminal window, execute the fast Vite process locally:
   ```bash
   npm run dev
   ```

4. **Navigate to Deployment** 
   Access the visually immersive dashboard at `http://localhost:5173`. 
