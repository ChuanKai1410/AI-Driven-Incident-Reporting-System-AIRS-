# 📦 AI-Driven Incident Reporting System (AIRS)

### DHL Digital Automation Challenge - Scenario 2

## 📖 Project Overview

AIRS is an intelligent automation platform designed to solve DHL's challenge of handling fragmented, unstructured incident reports. By bridging **Robotic Process Automation (RPA)** with **Large Language Models (LLMs)**, AIRS transforms messy raw inputs from WhatsApp, Email, and Teams into standardized, actionable knowledge articles.

## 🏗️ System Architecture

The system follows a three-tier automated pipeline:

1.  **Ingestion Layer (UiPath):** Automated bots fetch raw messy inputs from DHL communication channels.
2.  **Intelligence Layer (Gemini AI):** An LLM-powered backend summarizes text and extracts key problems.
3.  **Management Layer (MERN Web App):** A secured dashboard provides real-time status tracking and search functionality.

## 🚀 Core Features

  * **🤖 Automated Ingestion:** Uses mandatory UiPath RPA to fetch data from disparate sources (Email, Google Drive).
  * **🧠 AI Summarization:** Leverages Google Gemini to rewrite inconsistent content into clean, professional SOPs.
  * **🛡️ Secured Dashboard:** A central React/Next.js hub with protected login for managing and searching incidents.
  * **⚡ Workflow Tracking:** Real-time incident status management (Pending → Assigned → Resolved).

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

*Note: Ensure your `.env` contains `MONGO_URI` and `GEMINI_API_KEY`.*

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
4.  Run the bot to fetch raw inputs and push them to the MERN dashboard.

## 🧑‍💻 Author

**Chew Chuan Kai** - *Software Engineering, Universiti Teknologi Malaysia (UTM)*
