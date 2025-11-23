# Project Overview — Google Sheets ↔ Google Contacts Sync

This project implements a full two-way synchronization between Google Sheets 
and Google Contacts using Google Apps Script and the People API.

---

## 🔄 What the Project Does

### 1️⃣ Sheets → Contacts Sync
When a new row is added in Google Sheets:
- A new Google Contact is created automatically
- The contact is assigned to the group “EDXSO Sync”
- Sync status updates to "SYNCED"
- Timestamp is added to the row
- Duplicate prevention based on Name + Phone

---

### 2️⃣ Contacts → Sheets Sync
When a contact is added under the “EDXSO Incoming” label:
- It is automatically written to Google Sheets
- Name, Phone, Email are extracted
- Sync status = "INCOMING SYNCED"
- Timestamp added
- Duplicate phones are skipped

---

## 🧩 Why This Project
- Demonstrates automation skills
- Shows real-world API integration
- Works across two Google services
- Production-level error handling
- Perfect for portfolio + assignments

