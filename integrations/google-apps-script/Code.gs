/**
 * Mahasen Game Leads — TEST ONLY
 * Google Sheets > Extensions > Apps Script > paste this code.
 * Run testWrite() to verify a synthetic row can be inserted.
 * Deploy > New deployment > Web app:
 * Execute as: Me; Who has access: Anyone.
 * Do not launch to public before anti-fraud and privacy review.
 */
const SPREADSHEET_ID = '1OXkNpSJD8l9pUeY27O3uZo7hupuRjaIcP9RHVZMv2Ro';
const SHEET_NAME = 'Leads';

function sanitizeText(value, maxLength) {
  const s = String(value == null ? '' : value).trim().slice(0, maxLength);
  // Treat submitted fields as text, never Sheets formulas.
  return /^[=+@\-]/.test(s) ? "'" + s : s;
}

function normalizedPhone(value) {
  const v = String(value || '').replace(/[\s()-]/g, '');
  let p = v;
  if (p.startsWith('+966')) p = p.slice(4);
  else if (p.startsWith('966')) p = p.slice(3);
  else if (p.startsWith('0')) p = p.slice(1);
  if (!/^5\d{8}$/.test(p)) return null;
  return '+966' + p;
}

function buildRecord(p) {
  const name = sanitizeText(p.customer_name, 70);
  const phone = normalizedPhone(p.phone);
  const session = sanitizeText(p.session_id, 90);
  const score = Number(p.score);
  const accuracy = Number(p.accuracy);
  if (name.length < 2 || !phone || !/^[a-zA-Z0-9_-]{12,90}$/.test(session)) {
    throw new Error('Invalid customer fields');
  }
  if (!Number.isFinite(score) || score < 0 || score > 99999 ||
      !Number.isFinite(accuracy) || accuracy < 0 || accuracy > 100) {
    throw new Error('Invalid game metrics');
  }
  const tier = accuracy < 45 ? 0 : score >= 901 ? 20 : score >= 601 ? 15 :
    score >= 301 ? 10 : score >= 101 ? 5 : 0;
  const codes = {5:'MBT5',10:'MMT10',15:'MFT15',20:'MGT20'};
  // Coupon codes are placeholders; never treat this as proof of a genuine award.
  return [
    new Date().toISOString(),
    session, name, phone, score, accuracy,
    tier, codes[tier] || '',
    String(p.marketing_consent) === 'true' ? 'Yes' : 'No',
    sanitizeText(p.terms_version || 'draft-2026-11-07',60),
    sanitizeText(p.utm_source,100),
    sanitizeText(p.utm_medium,100),
    sanitizeText(p.utm_campaign,150),
    sanitizeText(p.page_url,300),
    'TEST_RECEIVED'
  ];
}

function doPost(e) {
  const params = e && e.parameter || {};
  try {
    const record = buildRecord(params);
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);
    if (!sheet) throw new Error('Leads sheet missing');
    const lock = LockService.getScriptLock();
    lock.waitLock(12000);
    try {
      // Avoid repeat submits of same session within the last 1000 rows.
      const lastRow = sheet.getLastRow();
      if (lastRow > 1) {
        const first = Math.max(2, lastRow - 999);
        const existing = sheet.getRange(first, 2, lastRow - first + 1, 1)
          .getDisplayValues().some(row => row[0] === record[1]);
        if (existing) return ContentService.createTextOutput('DUPLICATE');
      }
      sheet.appendRow(record);
    } finally {
      lock.releaseLock();
    }
    return ContentService.createTextOutput('SAVED');
  } catch (err) {
    console.error(err);
    return ContentService.createTextOutput('INVALID');
  }
}

function doGet() {
  return ContentService.createTextOutput('MAHASEN_TEST_ENDPOINT_READY');
}

function testWrite() {
  const s = 'test_' + Utilities.getUuid().replace(/-/g, '');
  const record = buildRecord({
    customer_name:'Test Mahasen',
    phone:'0500000000',
    session_id:s,
    score:'728',
    accuracy:'69',
    marketing_consent:'false',
    terms_version:'draft-test',
    utm_source:'manual_test'
  });
  const sh = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);
  sh.appendRow(record);
  console.log('TEST_ROW_SAVED', s);
}
