# How to Run the Sync System

Once setup is complete, the project runs automatically.

---

## ▶ Part A — Sheets → Contacts
1. Add a new row:
   - Name
   - Phone
   - Email
2. Script runs on "On Change" trigger
3. Contact appears under “EDXSO Sync”
4. Sync Status = "SYNCED"
5. Timestamp added automatically

---

## ▶ Part B — Contacts → Sheets
1. Go to Google Contacts
2. Create a new contact
3. Assign label “EDXSO Incoming”
4. Script runs every 5 minutes
5. Contact appears in Google Sheet
6. Status + Timestamp added

---

## ▶ Manual Run (Optional)
If needed, run:
- `syncNewSheetEntries()`
- `syncNewContacts()`

Never run helper functions manually.

