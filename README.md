# 📦 A.I Powered PO Extractor

> **AI-powered Purchase Order extraction tool** — Upload Springfield / Eurofiel Confeccion PDFs and instantly get a structured, formatted Excel summary with full size breakdowns, destinations, and auto-calculated totals.

---

## ✨ Features

- 📄 **Multi-page PDF Processing** — Each page is one PO, all processed in one upload
- 🤖 **Gemini 2.5 Flash AI** — Extracts Style, Patron No, P.O., Color, COL, Size Breakdown (XS–XXXL), Destination & Delivery Date
- 📊 **Auto-formatted Excel Export** — Blue header, zebra rows, green TOTAL row with SUM formulas
- 🏷️ **Dynamic Filename** — Downloaded file named `{Style} {PatronNo} P.O Summary.xlsx`
- 🔒 **Secure API Key** — Stored in `.env`, never hardcoded
- ⚡ **Vite + React Frontend** — Fast, modern UI for uploading and downloading

---

## 🛠️ Tech Stack

| Layer     | Technology                        |
|-----------|-----------------------------------|
| Frontend  | React 18 + Vite + ESLint          |
| Backend   | Node.js + Express                 |
| AI Engine | Google Gemini 2.5 Flash (Vision)  |
| Excel     | ExcelJS                           |
| Upload    | Multer                            |
| Security  | dotenv                            |

---

## 📁 Project Structure

```
CLAUDE/
├── frontend/               # React + Vite frontend
│   ├── src/                # React components & pages
│   ├── public/             # Static assets
│   ├── .gitignore
│   ├── eslint.config.js
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
└── pos/                    # Express backend
    ├── uploads/            # Temp PDF storage (auto-cleared)
    ├── .env                # 🔒 Secret keys (never commit!)
    ├── .gitignore
    ├── database.json       # Last extracted PO data
    ├── package.json
    └── server.js           # Main server
```

---

## ⚙️ Setup & Installation

### Prerequisites
- [Node.js](https://nodejs.org/) v18 or higher
- A [Google Gemini API Key](https://aistudio.google.com/app/apikey)

---

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/your-username/springfield-po-extractor.git
cd springfield-po-extractor
```

---

### 2️⃣ Setup the Backend (`/pos`)

```bash
cd pos
npm install
```

Create your `.env` file:

```bash
# pos/.env
GEMINI_API_KEY=your_gemini_api_key_here
PORT=5000
```

Start the backend server:

```bash
node server.js
# 🚀 Server running on Port 5000
```

---

### 3️⃣ Setup the Frontend (`/frontend`)

Open a **new terminal**:

```bash
cd frontend
npm install
npm run dev
# ⚡ Vite running on http://localhost:5173
```

---

## 🚀 How to Use

1. Open the app at `http://localhost:5173`
2. Click **Upload PDF** and select a Springfield PO PDF
3. AI extracts all data automatically from every page
4. Click **Download Excel** to get your formatted summary
5. File downloads as `4TF284 0264200 P.O Summary.xlsx`

---

## 📊 Excel Output Format

| STYLE | PAT No | P.O. | COLOR | COL | XS | S | M | L | XL | XXL | XXXL | TOTAL | DESTINATION | DEL.DATE |
|-------|--------|------|-------|-----|----|---|---|---|----|-----|------|-------|-------------|----------|
| 4TF284 | 0264200 | 4800486 | IVORY | 96 | 0 | 126 | 252 | 189 | 126 | 63 | 0 | 756 | PT PORTUGAL | 21/05/2026 |
| ... | | | | | | | | | | | | | | |
| | | | **TOTAL** | | **15** | **966** | **1982** | **1940** | **1230** | **767** | **86** | **7100** | | |

- 🔵 **Blue header row** with white bold text
- 🔲 **Zebra striping** on data rows
- 🟢 **Green TOTAL row** with live SUM formulas

---

## 🔒 Environment Variables

| Variable | Description |
|----------|-------------|
| `GEMINI_API_KEY` | Your Google Gemini API key |
| `PORT` | Backend server port (default: `5000`) |

> ⚠️ **Never commit your `.env` file.** It is already included in `.gitignore`.

---

## 📜 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/upload` | Upload PDF → AI extracts & saves data |
| `GET`  | `/download` | Generate & download formatted Excel |

---

## 🤝 Contributing

1. Fork the repo
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

<div align="center">
  <p>Built with ❤️ for Springfield Textile Operations</p>
  <p>
    <img src="https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js&logoColor=white"/>
    <img src="https://img.shields.io/badge/React-Vite-61DAFB?style=for-the-badge&logo=react&logoColor=black"/>
    <img src="https://img.shields.io/badge/AI-Gemini%202.5%20Flash-4285F4?style=for-the-badge&logo=google&logoColor=white"/>
    <img src="https://img.shields.io/badge/Export-Excel%20XLSX-217346?style=for-the-badge&logo=microsoft-excel&logoColor=white"/>
  </p>
</div>
