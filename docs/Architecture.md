# Architecture — Google Sheets ↔ Google Contacts Sync

This document explains how the system works internally.

---

## 📌 High-Level Architecture

Sheets → Script → People API → Contacts  
Contacts → People API → Script → Sheets  

---

## 🧱 Components

### ✔ Google Sheets
Stores contact list and sync status.

### ✔ Google Apps Script
Contains the automation logic:
- Filtering
- Duplicate check
- Timestamping
- Error handling

### ✔ Google People API
Used to:
- Create contacts
- Fetch contacts
- Manage groups

### ✔ Google Contacts
Stores synced contacts under:
- “EDXSO Sync”
- “EDXSO Incoming”

---

## 🔄 Sync Flow

### Sheets → Contacts (Forward Sync)
1. Sheet change detected
2. New rows parsed
3. Duplicate check (phone + name)
4. Contact created
5. Group assigned
6. Status updated
7. Timestamp added

### Contacts → Sheets (Reverse Sync)
1. Fetch all contacts
2. Filter by group “EDXSO Incoming”
3. Duplicate phone check
4. Add new rows
5. Add timestamp
6. Mark as synced

---

## ⚙ Triggers

### On Change Trigger
- Runs when Sheet updates

### Time-driven Trigger
- Checks for new incoming contacts every 5 minutes

