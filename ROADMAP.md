# SMB Due Diligence AI Tool - 14-Day MVP Development Plan

## Project Overview
Development roadmap for the SMB Due Diligence AI Tool (DueDiligenceAI) - Focused on building a working MVP in 14 days.

## Foundation Setup ✅
**Status: Completed**
- [x] Project structure setup with monorepo organization
- [x] Frontend foundation with React + Vite + TypeScript
- [x] Tailwind CSS + shadcn/ui for styling
- [x] Git workflow with feature branches
- [x] Development environment configuration

---

## **14-Day MVP Plan**

### **Day 1 — Get the basic apps running**

**Ryan (driver)**: Frontend | **Daniel (driver)**: Backend

#### Ryan (FE driver):
- [x] Create new React app (Vite + TypeScript)
- [x] Add Tailwind and shadcn/ui for styling
- [ ] Add 3 pages: Login, Deals list, Deal detail (tabs: Upload / Summary / Q&A)
- [ ] Hook in Clerk login (just local dev mode)

#### Daniel (BE driver):
- [ ] Create Node/Express app (TypeScript)
- [ ] Connect to Supabase (database)
- [ ] Make first DB tables: deals, documents, analyses, qas, logs
- [ ] Create `/health` endpoint that returns "OK"

#### Reviewers:
- [ ] Daniel logs into Ryan's frontend and confirms pages show
- [ ] Ryan hits `/health` in the browser and sees "OK"

**End goal**: We can log in and see an empty Deals page.

---

### **Day 2 — Deals and upload setup**

**Ryan (FE driver)** | **Daniel (BE driver)**

#### Ryan:
- [ ] Add "Create Deal" button and form
- [ ] Show list of deals from backend
- [ ] Click a deal → go to detail page with empty tabs

#### Daniel:
- [ ] Backend route to create a deal (saves user id)
- [ ] Backend route to list deals for a user
- [ ] Set up Supabase Storage for files
- [ ] Backend route to give frontend a pre-signed URL for uploading

#### Reviewers:
- [ ] Daniel tests adding a deal in Ryan's UI
- [ ] Ryan requests a pre-signed URL from Daniel's backend using Postman

**End goal**: Can create a deal and get an upload link for a file.

---

### **Day 3 — Show uploaded files & parse them**

**Daniel (FE driver)** — yes, Daniel does React today | **Ryan (BE driver)** — Ryan does backend today

#### Daniel (FE driver):
- [ ] Build file upload UI (dropzone)
- [ ] On select: ask backend for upload URL → PUT file → tell backend "file uploaded"
- [ ] Show list of uploaded files

#### Ryan (BE driver):
- [ ] Code to read PDFs → plain text (`pdf-parse`)
- [ ] Code to read CSVs → plain text (`papaparse`)
- [ ] Detect file type (P&L, balance sheet, etc.)
- [ ] Backend route to parse a file and save the text in DB

#### Reviewers:
- [ ] Ryan uploads a file in Daniel's UI
- [ ] Daniel hits Ryan's parse endpoint with a sample file

**End goal**: Upload a file → click "Parse" → DB stores its text.

---

### **Day 4 — First AI analysis**

**Ryan (BE driver)** — Ryan does backend | **Daniel (FE driver)** — Daniel does frontend

#### Ryan:
Backend route `/analyze`:
- [ ] Get parsed text from DB
- [ ] Send to Claude API with prompt
- [ ] Validate JSON shape
- [ ] Save analysis result in DB

#### Daniel:
- [ ] "Run Analysis" button on frontend
- [ ] Show raw JSON result (dev view)

#### Reviewers:
- [ ] Daniel clicks "Run Analysis" in his UI to test Ryan's backend
- [ ] Ryan uploads a file and runs Daniel's UI locally to see JSON

**End goal**: Upload → Parse → Analyze → See raw JSON.

---

### **Day 5 — Pretty summary + logging**

**Daniel (FE driver)** | **Ryan (BE driver)**

#### Daniel:
Summary tab UI:
- [ ] Traffic light indicators
- [ ] Health score & verdict
- [ ] Top strengths/risks
- [ ] Key ratios grid

#### Ryan:
- [ ] Logging helper function for backend
- [ ] Record logs for each step (upload, parse, analyze)
- [ ] Backend route to fetch logs for a deal

#### Reviewers:
- [ ] Ryan clicks around Daniel's Summary UI to check formatting
- [ ] Daniel runs Ryan's backend logs endpoint and checks entries

**End goal**: Summary looks nice and backend logs are stored.

---

### **Day 6 — Q&A**

**Ryan (BE driver)** | **Daniel (FE driver)**

#### Ryan:
- [ ] Backend route `/qa`: send user's question + parsed text to Claude
- [ ] Save Q&A in DB

#### Daniel:
- [ ] Q&A tab UI: text input, list of questions/answers

#### Reviewers:
- [ ] Daniel asks a question through his UI → Ryan checks backend logs
- [ ] Ryan runs Daniel's UI and asks a few questions

**End goal**: Can ask AI a question about the uploaded document.

---

### **Day 7 — Full run-through**

**Both pair program**

- [ ] Upload → Parse → Analyze → Summary → Q&A
- [ ] Swap roles halfway through so you each touch FE and BE
- [ ] Add 2–3 sample files for testing
- [ ] Fix small bugs

**End goal**: First full working version from start to finish.

---

### **Day 8 — Export to PDF**

**Daniel (BE driver)** | **Ryan (FE driver)**

#### Daniel:
- [ ] Backend route `/export` that takes Summary HTML → PDF (puppeteer)

#### Ryan:
- [ ] HTML layout for PDF export (one page, A4)

#### Reviewers:
- [ ] Ryan clicks "Export" button → downloads PDF from Daniel's route
- [ ] Daniel opens PDF and checks layout

**End goal**: Click Export → Download a PDF report.

---

### **Day 9 — Chart & local ratios**

**Ryan (BE driver)** | **Daniel (FE driver)**

#### Ryan:
- [ ] Backend: if CSV has clean columns, calculate ratios (CAGR, GM, NM, Current Ratio, D/E)

#### Daniel:
- [ ] Add chart in Summary tab (Recharts) to show revenue trend if CSV data exists

#### Reviewers:
- [ ] Daniel uploads CSV and sees chart from Ryan's data
- [ ] Ryan runs Daniel's UI to confirm chart renders correctly

**End goal**: CSV files get extra chart + numbers without using AI.

---

### **Day 10 — Error handling**

**Daniel (BE driver)** | **Ryan (FE driver)**

#### Daniel:
- [ ] Limit analysis to once per minute per deal
- [ ] Handle bad AI responses, timeouts, and giant files

#### Ryan:
- [ ] Show clear error messages in UI for uploads, parsing, and analysis
- [ ] Disable buttons while waiting

#### Reviewers:
- [ ] Ryan tries bad files to trigger Daniel's backend errors
- [ ] Daniel tries Ryan's UI error states

**End goal**: App handles bad inputs gracefully.

---

### **Day 11 — Security checks**

**Ryan (BE driver)** | **Daniel (FE driver)**

#### Ryan:
- [ ] Make sure user can only see their own deals
- [ ] Double-check DB queries have user checks

#### Daniel:
- [ ] Dev-only "Logs" page in UI that shows backend logs

#### Reviewers:
- [ ] Daniel tries to view another user's deal → should get error
- [ ] Ryan loads Daniel's logs page and sees entries

**End goal**: Only see your own data.

---

### **Day 12 — Polish**

**Daniel (FE driver)** | **Ryan (BE driver)**

#### Daniel:
- [ ] Make Summary and PDF prettier
- [ ] Add disclaimers like "Not financial advice"

#### Ryan:
- [ ] Add token count logging for AI calls
- [ ] Small speed improvements (skip re-parsing same file)

#### Reviewers:
- [ ] Ryan checks Daniel's visual changes
- [ ] Daniel runs Ryan's backend and sees token counts in logs

**End goal**: Feels like a real product.

---

### **Day 13 — Bug bash**

**Both**:
- [ ] Test with clean CSV, clean PDF, messy PDF, oversized file, CSV with missing data
- [ ] Fix high-priority bugs
- [ ] Each person takes turns fixing bugs in both FE and BE

**End goal**: Works on normal files, fails nicely on bad ones.

---

### **Day 14 — Demo day**

**Both**:
- [ ] Prepare a "demo deal" ready to show
- [ ] Practice switching in the middle of demo so you both explain parts you built
- [ ] Backup plan: have an already-analyzed deal ready if AI fails

**End goal**: Smooth, confident 5-minute demo.

---

## Tech Stack

### Frontend
- ✅ **React** with Vite + TypeScript
- ✅ **Tailwind CSS** + shadcn/ui components
- ⏳ **Clerk** for authentication
- ⏳ **React Router** for navigation
- ⏳ **Recharts** for data visualization

### Backend
- ⏳ **Node.js** with Express + TypeScript
- ⏳ **Supabase** (PostgreSQL + Storage)
- ⏳ **Claude API** (Anthropic)
- ⏳ **pdf-parse** & **papaparse** for document processing
- ⏳ **Puppeteer** for PDF generation

### Development Tools
- ✅ **Git** with feature branches
- ✅ **npm workspaces** for monorepo
- ⏳ **Postman** for API testing

## Current Progress
- **Day 1**: ✅ Frontend foundation complete (React, Tailwind, shadcn/ui)
- **Day 1**: ⏳ Need to add 3 pages and Clerk integration
- **Day 1**: ⏳ Backend setup (Node/Express, Supabase, DB schema)

## Notes
- **Role Switching**: Developers alternate between frontend and backend daily
- **Pair Programming**: Days 7, 13, 14 involve both developers working together
- **Review Process**: Each day includes cross-review of the other developer's work
- **MVP Focus**: Prioritize working features over perfect code
- **Demo Ready**: Final day focuses on polished demonstration

---

**Last Updated**: Day 1 - Frontend foundation complete
**Next Milestone**: Complete Day 1 backend setup and move to Day 2