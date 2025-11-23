# Setup Guide — Google Sheets ↔ Google Contacts Sync

Follow these steps to set up the project from scratch.

---

## 1️⃣ Create a Google Sheet
Columns required:
- Name
- Phone Number
- Email
- Sync Status
- Timestamp

---

## 2️⃣ Open Apps Script
- Extensions → Apps Script
- Delete default code
- Paste the code from `/src/code.gs`

---

## 3️⃣ Enable People API
### A. Inside Apps Script
- Left menu → Services
- Click (+)
- Add "People API v1"

### B. In Google Cloud
- Apps Script → Project Settings → Click project link
- In Cloud Console → APIs → Enable "People API"

---

## 4️⃣ Set Up Triggers

### **Trigger 1 – Sheets → Contacts**
