# 📊 Finsight

**A modern financial insights and deal management platform built with React, TypeScript, and cutting-edge web technologies.**

Finsight empowers financial professionals to analyze deals, manage documents, and gain actionable insights through AI-powered analysis.

---

## 🚀 **Features**

- **📈 Deal Management**: Track and manage financial deals with comprehensive detail views
- **📄 Document Analysis**: Upload and analyze financial documents with AI insights  
- **💬 Q&A Interface**: Ask questions about your documents and get intelligent responses
- **📊 Financial Insights**: Automated analysis and reporting of key financial metrics
- **🔐 Secure Authentication**: Modern authentication with Clerk integration
- **📱 Responsive Design**: Beautiful UI that works on desktop and mobile

---

## 🏗️ **Project Structure**

This project uses a modern monorepo structure:

- **`client/`** - React frontend application with TypeScript and Tailwind CSS
- **`server/`** - Node.js backend API with Express and TypeScript
- **`shared/`** - Shared types, utilities, and constants
- **`docs/`** - Documentation and research materials

---

## 🛠️ **Tech Stack**

### **Frontend**
- **React 18** + **TypeScript** for type-safe development
- **Vite** for lightning-fast development and builds  
- **Tailwind CSS** + **shadcn/ui** for beautiful, responsive design
- **React Router** for client-side navigation
- **Clerk** for authentication and user management

### **Backend**  
- **Node.js** + **Express** + **TypeScript**
- **Supabase** for database and storage
- **Claude AI** for document analysis and insights
- **PDF parsing** and **CSV analysis** capabilities

---

## 🚀 **Getting Started**

### **Prerequisites**
- Node.js 18+ 
- npm or yarn
- Git

### **Installation**

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/finsight.git
   cd finsight
   ```

2. **Install dependencies:**
   ```bash
   npm run install:all
   ```

3. **Start development servers:**
   ```bash
   npm run dev
   ```

This will start both the frontend (`http://localhost:5173`) and backend (`http://localhost:3000`) concurrently.

### **Individual Commands**

```bash
# Frontend only
npm run dev:client

# Backend only  
npm run dev:server

# Build for production
npm run build

# Lint code
cd client && npm run lint
```

---

## 📱 **Usage**

1. **Login**: Access the platform with secure authentication
2. **Create Deals**: Add new financial deals to track and analyze
3. **Upload Documents**: Upload PDFs, financial statements, and CSV files
4. **AI Analysis**: Get automated insights and analysis of your documents
5. **Q&A**: Ask specific questions about your financial data
6. **Export Reports**: Generate PDF reports with key insights

---

## 🤝 **Development Workflow**

This project follows a feature-branch workflow:

1. Create feature branches for new work
2. Make pull requests for code review
3. Use conventional commits for clear history
4. Test thoroughly before merging

### **Branch Naming Convention**
- `feature/` - New features
- `fix/` - Bug fixes  
- `docs/` - Documentation updates
- `refactor/` - Code refactoring

Contributions are welcome! Please read our contributing guidelines and submit pull requests for any improvements.

---

**Built with ❤️ for the future of financial insights**
