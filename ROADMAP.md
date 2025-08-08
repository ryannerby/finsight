# **14-Day MVP Plan**

### **Day 1 — Get the basic apps running**

**Ryan (driver)**: Frontend

**Daniel (driver)**: Backend

- **Ryan (FE driver)**:
    - [x] ✅ Create new React app (Vite + TypeScript)
    - [x] ✅ Add Tailwind and shadcn/ui for styling
    - [x] ✅ Add 3 pages: Login, Deals list, Deal detail (tabs: Upload / Summary / Q&A)
    - [ ] Hook in Clerk login (just local dev mode)
- **Daniel (BE driver)**:
    - [ ] Create Node/Express app (TypeScript)
    - [ ] Connect to Supabase (database)
    - [ ] Make first DB tables: deals, documents, analyses, qas, logs
    - [ ] Create `/health` endpoint that returns "OK"
- **Reviewers**:
    - [ ] Daniel logs into Ryan's frontend and confirms pages show
    - [ ] Ryan hits `/health` in the browser and sees "OK"

**End goal**: We can log in and see an empty Deals page.

---

### **Day 2 — Deals and upload setup**
// ... (rest of your roadmap continues) 