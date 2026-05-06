[![MERN Stack CI](https://github.com/ChuanKai1410/AI-Driven-Incident-Reporting-System-AIRS-/actions/workflows/ci.yml/badge.svg)](https://github.com/ChuanKai1410/AI-Driven-Incident-Reporting-System-AIRS-/actions/workflows/ci.yml)

# 📦 AI-Driven Incident Reporting System (AIRS)
### DHL Digital Automation Challenge - Scenario 2

---

## 📖 Project Overview

AIRS is an intelligent automation platform designed to solve DHL's challenge of handling fragmented and unstructured incident reports.

Customer support teams receive incident data from multiple inconsistent sources such as emails, WhatsApp messages, call logs and handwritten notes. This leads to poor visibility, duplicated work, incorrect routing and slow response times.

AIRS addresses this by integrating **Robotic Process Automation (RPA)** with **Artificial Intelligence (AI)** to automatically transform messy raw inputs into structured, actionable incident records with real-time tracking and analysis.

---

## 🎯 Solution Overview

AIRS automates the full incident lifecycle:

- 📥 Collects raw data via UiPath (RPA)
- 🧠 Uses Google Gemini AI to extract structured insights
- 🏷️ Classifies incidents by category, priority and department
- 🔁 Detects duplicate incidents using semantic similarity
- 📊 Groups incidents into clusters for pattern analysis
- 📋 Provides a web dashboard for management and tracking

---

## 🏗️ System Architecture

![System Architecture](./images/architecture.png)

The system follows a three-layer architecture:

### 1. Ingestion Layer (RPA - UiPath)
- Automated bots read raw `.txt` inputs simulating real DHL channels
- Sends structured requests to backend API

### 2. Intelligence Layer (Backend + AI)
- Node.js + Express API
- Google Gemini:
  - Incident summarization
  - Classification (category, priority, department)
  - Embedding generation for similarity detection
- MongoDB stores structured incident data

### 3. Management Layer (Frontend - React)
- Secure web dashboard
- Incident workflow tracking
- Search, filter and visualization
- Cluster-based grouping of incidents

---

## 🔄 End-to-End Workflow

1. UiPath reads unstructured incident reports from files
2. Data is sent to backend via REST API
3. Gemini AI:
   - Generates structured summary
   - Extracts key metadata
4. Embeddings are generated for semantic comparison
5. System detects duplicate incidents using cosine similarity
6. Incidents are stored in MongoDB
7. React dashboard displays:
   - Incident list
   - Status workflow
   - Cluster visualization

---

## 🤖 AI Capabilities

- 🧠 Automatic incident summarization
- 🏷️ Intelligent classification (category, priority, department)
- 🔁 Duplicate detection using semantic similarity
- 📊 Cluster visualization of related incidents

---

## 🚀 Core Features

- 🤖 **Automated Ingestion (UiPath RPA)**  
  Collects raw incident data from multiple simulated sources

- 🧠 **AI-Powered Processing (Gemini)**  
  Converts messy input into structured incident records

- 🔁 **Duplicate Detection (AI + Embeddings)**  
  Uses semantic similarity to identify repeated issues

- 📊 **Cluster Visualization**  
  Groups incidents by category for better insights

- 🛡️ **Secured Dashboard**  
  Centralized platform for managing incidents

- ⚡ **Workflow Tracking**  
  Status management (Pending → In Progress → Resolved)

- 🔍 **Search & Filtering**  
  Quickly find incidents by keywords or category

---

## 📸 Screenshots

> *(Add your screenshots here for maximum impact)*

### Dashboard
![Dashboard](./screenshots/dashboard.png)

### Incident Details
![Details](./screenshots/details.png)

### Cluster Visualization
![Cluster](./screenshots/cluster.png)

### UiPath Workflow
![UiPath](./screenshots/uipath.png)

---

## ⚙️ Tech Stack

- **Frontend:** React.js  
- **Backend:** Node.js, Express.js  
- **Database:** MongoDB  
- **AI:** Google Gemini API (LLM + Embedding)  
- **RPA:** UiPath Studio  
- **CI/CD:** GitHub Actions  

---

## 🛠️ Setup & Installation

### 1. Clone Repository

```bash
git clone https://github.com/your-username/AI-Driven-Incident-Reporting-System-AIRS-.git
cd AI-Driven-Incident-Reporting-System-AIRS-

## 🛠️ Setup & Installation

### 1\. Repository Setup

```bash
git clone https://github.com/your-username/AI-Driven-Incident-Reporting-System-AIRS-.git
cd AI-Driven-Incident-Reporting-System-AIRS-
```

### 2\. Backend & Frontend Setup

Open two terminal windows:

**Terminal 1 (Server):**

```bash
cd server
npm install
node server.js
```

*Create server/.env*
```env
MONGO_URI=your_mongo_uri
GEMINI_API_KEY=your_gemini_api_key
```

**Terminal 2 (Client):**

```bash
cd client
npm install
npm start
```

### 3\. Automation Workflow (UiPath)

To link the RPA collector to the web dashboard:

1.  Open the `rpa-uipath` folder in **UiPath Studio**.
2.  Open `Main.xaml`.
3.  Locate the **HTTP Request** activity and ensure the `Request URL` is set to `http://localhost:5000/api/incidents`.
4.  Run the bot to simulate real-world incident ingestion.

---

## 📂 Project Structure
```bash
- client/        → React frontend
- server/        → Node.js backend + AI processing
- rpa-uipath/    → UiPath automation workflows
```

---

## 🚀 Future Improvements
- Integration with real email and Google Drive APIs
- Real-time analytics dashboard
- Vector database integration (e.g., Pinecone)
- Advanced clustering visualization (2D embedding maps)
- AI-based incident recommendation system

---

## 🧑‍💻 Author

**Chew Chuan Kai** - *Software Engineering, Universiti Teknologi Malaysia (UTM)*

