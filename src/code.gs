/**
  Two-Way Sync Between Google Sheets & Google Contacts **/

const SPREADSHEET_ID = '1pJKu-a-qeg4eqAl7Yf5xg_1wlgKdWW_IwU54wuGiee0';
const ss = SpreadsheetApp.openById(SPREADSHEET_ID);

const SHEET_NAME = 'Sheet1';
const CONTACTS_LABEL_SYNC = 'EDXSO Sync';
const CONTACTS_LABEL_INCOMING = 'EDXSO Incoming';
const HEADER_ROWS = 1;

const sheet = ss.getSheetByName(SHEET_NAME);


// --- CREATE / FETCH CONTACT GROUP ---
function getContactGroupResourceName(labelName) {

  if (typeof People === 'undefined' || !People.ContactGroups) {
    throw new Error("People API is not enabled in Services.");
  }

  const groupsResponse = People.ContactGroups.list({ pageSize: 200 });
  const groups = groupsResponse.contactGroups || [];

  const existing = groups.find(g => g.name === labelName);
  if (existing) return existing.resourceName;

  const created = People.ContactGroups.create({
    contactGroup: { name: labelName }
  });

  return created.resourceName;
}



// ======================================================================
//  PART A — SHEETS → GOOGLE CONTACTS//
// ======================================================================

function syncNewSheetEntries() {

  if (!sheet) return;

  const lastRow = sheet.getLastRow();
  if (lastRow <= HEADER_ROWS) return;

  const COL_NAME = 0;
  const COL_PHONE = 1;
  const COL_EMAIL = 2;
  const COL_STATUS = 3;
  const COL_TIMESTAMP = 4;

  const data = sheet.getRange(2, 1, lastRow - 1, 4).getValues();

  try {
    const syncGroup = getContactGroupResourceName(CONTACTS_LABEL_SYNC);

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const sheetRow = HEADER_ROWS + 1 + i;

      const name = row[COL_NAME] ? String(row[COL_NAME]).trim() : '';
      const phone = row[COL_PHONE] ? String(row[COL_PHONE]).trim() : '';
      const email = row[COL_EMAIL] ? String(row[COL_EMAIL]).trim() : '';
      const status = row[COL_STATUS] ? String(row[COL_STATUS]).trim() : '';

      if (!name || !phone || status !== '') continue;

      try {
        const conn = People.People.Connections.list('people/me', {
          pageSize: 500,
          personFields: 'names,phoneNumbers,emailAddresses'
        });

        const connections = conn.connections || [];

        const duplicate = connections.some(p =>
          p.names &&
          p.names[0].displayName === name &&
          p.phoneNumbers &&
          p.phoneNumbers.some(n => String(n.value).trim() === phone)
        );

        if (duplicate) {
          sheet.getRange(sheetRow, COL_STATUS + 1).setValue('SKIPPED (Duplicate)');
          continue;
        }

        // --- CREATE CONTACT ---
        People.People.createContact({
          names: [{ displayName: name }],
          phoneNumbers: [{ value: phone }],
          emailAddresses: email ? [{ value: email }] : [],
          memberships: [{
            contactGroupMembership: { contactGroupResourceName: syncGroup }
          }]
        });

        // Update Sync Status
        sheet.getRange(sheetRow, COL_STATUS + 1).setValue('SYNCED');

        // Add Timestamp (NEW)
        sheet.getRange(sheetRow, COL_TIMESTAMP + 1).setValue(new Date());

      } catch (err) {
        sheet.getRange(sheetRow, COL_STATUS + 1)
          .setValue('FAILED: ' + err.message.substring(0, 50));
        console.error(err);
      }
    }

  } catch (e) {
    sheet.getRange(2, 4).setValue('CRITICAL ERROR: ' + e.message.substring(0, 50));
  }
}



// ======================================================================
//  PART B — GOOGLE CONTACTS → SHEETS
// ======================================================================

function syncNewContacts() {

  if (!sheet) return;

  const incomingGroup = getContactGroupResourceName(CONTACTS_LABEL_INCOMING);

  const COL_NAME = 0;
  const COL_PHONE = 1;
  const COL_EMAIL = 2;
  const COL_STATUS = 3;
  const COL_TIMESTAMP = 4;

  const lastRow = sheet.getLastRow();
  const existingPhones = new Set();

  if (lastRow > HEADER_ROWS) {
    const phoneData = sheet.getRange(2, 2, lastRow - 1, 1).getValues();
    phoneData.forEach(r => {
      if (r[0]) existingPhones.add(String(r[0]).trim());
    });
  }

  const response = People.People.Connections.list('people/me', {
    pageSize: 500,
    personFields: 'names,phoneNumbers,emailAddresses,memberships'
  });

  const contacts = response.connections || [];
  const newRows = [];

  for (const c of contacts) {

    const isInIncomingGroup = (c.memberships || []).some(m =>
      m.contactGroupMembership &&
      m.contactGroupMembership.contactGroupResourceName === incomingGroup
    );

    if (!isInIncomingGroup) continue;

    const name = c.names?.[0]?.displayName || 'No Name';
    const phoneRaw = c.phoneNumbers?.[0]?.value;
    const email = c.emailAddresses?.[0]?.value || '';

    if (!phoneRaw) continue;

    const phone = String(phoneRaw).trim();
    if (!phone || existingPhones.has(phone)) continue;

    newRows.push([
      name,
      phone,
      email,
      'INCOMING SYNCED',
      new Date()
    ]);

    existingPhones.add(phone);
  }

  if (newRows.length > 0) {
    sheet.getRange(sheet.getLastRow() + 1, 1, newRows.length, 5).setValues(newRows);
  }
}
