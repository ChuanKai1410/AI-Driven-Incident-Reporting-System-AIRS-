# 📦 AI-Driven Incident Reporting System (AIRS)
### DHL Digital Automation Challenge - Scenario 2

![MERN Stack CI](https://github.com/YOUR_GITHUB_USERNAME/YOUR_REPO_NAME/actions/workflows/ci.yml/badge.svg)

## 📖 Project Overview
AIRS is a centralized, automated platform designed to transform messy, unstructured incident reports (from WhatsApp, Emails, and Teams) into clean, actionable data. [cite_start]It bridges the gap between raw data collection and efficient logistics management. [cite: 18, 51]

## 🛠️ Tech Stack & Requirements
- [cite_start]**Web App:** React (Next.js), Node.js, Express.js (MERN) 
- [cite_start]**Database:** MongoDB Atlas 
- [cite_start]**Automation:** UiPath Studio (Mandatory RPA) 
- [cite_start]**AI/LLM:** Google Gemini 1.5 Flash (For Summarization & Duplicate Detection) 
- **CI/CD:** GitHub Actions (Automated Build & Test)

## 🚀 Features
- [cite_start]**Automated Ingestion:** UiPath bots fetch raw data from emails and Google Drive. [cite: 53]
- [cite_start]**AI Summarization:** Converts unstructured chat/email text into professional summaries. [cite: 53]
- [cite_start]**Incident Workflow:** Secured dashboard to manage, search, and track incident statuses. [cite: 53]
- [cite_start]**Duplicate Detection:** Prevents repetitive manual work by flagging similar reports. [cite: 53]

## 📂 Project Structure
```text
├── .github/workflows/   # CI/CD Pipeline Configuration
[cite_start]├── client/              # React Frontend (Dashboard) 
[cite_start]├── server/              # Node.js Backend & LLM Integration 
[cite_start]└── rpa-uipath/          # UiPath .xaml Workflows
