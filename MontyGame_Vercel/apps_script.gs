/*  MONTY GAME — Backend (Google Apps Script Web App)
 *  Handles: shared leaderboard stored in a Google Sheet + emailing the
 *  ID Card to the #1 player.  No servers, no API keys needed.
 *
 *  SETUP (one time):
 *  1. Open the Google Sheet you want to use as the leaderboard.
 *  2. Extensions ▸ Apps Script. Delete any sample code, paste THIS file.
 *  3. Click Deploy ▸ New deployment ▸ type "Web app".
 *       - Execute as: Me
 *       - Who has access: Anyone
 *     Click Deploy, authorize, and COPY the Web app URL (ends with /exec).
 *  4. Paste that URL into index.html  ->  const BACKEND_URL = "PASTE_HERE";
 *  5. Re-deploy the site to Vercel. Done.
 *
 *  Note: emailing uses your own Gmail (MailApp), ~100 emails/day on free
 *  accounts — plenty for picking a daily/weekly champion.
 */

const SHEET_NAME = 'Leaderboard';

function getSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) {
    sh = ss.insertSheet(SHEET_NAME);
    sh.appendRow(['ts', 'name', 'score', 'finished', 'outfit']);
  }
  return sh;
}

function readAll() {
  const sh = getSheet();
  const rows = sh.getDataRange().getValues();
  const out = [];
  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    if (!r[0]) continue;
    let outfit = {};
    try { outfit = JSON.parse(r[4] || '{}'); } catch (e) {}
    out.push({
      ts: Number(r[0]),
      name: String(r[1]),
      score: Number(r[2]),
      finished: (r[3] === true || r[3] === 'true' || r[3] === 1 || r[3] === '1'),
      outfit: outfit
    });
  }
  out.sort(function (a, b) { return (b.score - a.score) || (a.ts - b.ts); });
  return out.slice(0, 100);
}

function jsonOut(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  const action = (e && e.parameter && e.parameter.action) || 'list';
  if (action === 'list') return jsonOut(readAll());
  return jsonOut({ ok: true });
}

function doPost(e) {
  let body = {};
  try { body = JSON.parse(e.postData.contents); }
  catch (err) { return jsonOut({ ok: false, error: 'bad json' }); }

  const action = body.action;

  if (action === 'submit') {
    const en = body.entry || {};
    getSheet().appendRow([
      en.ts || Date.now(),
      en.name || '',
      en.score || 0,
      en.finished ? true : false,
      JSON.stringify(en.outfit || {})
    ]);
    return jsonOut(readAll());
  }

  if (action === 'emailCard') {
    try {
      const to = body.email;
      if (!to) return jsonOut({ ok: false, error: 'no email' });
      const subject = 'MONTY Player Card — ' + (body.name || 'Juara');
      const html =
        '<div style="font-family:Arial,sans-serif;max-width:560px">' +
        '<h2 style="color:#E94E1E;margin:0 0 6px">MONTY&amp;Co. — Player Card</h2>' +
        '<p>Hai ' + escapeHtml_(body.name || '') + ', kamu Juara #1! 🎉</p>' +
        '<p style="color:#5a3014">Tanggal Main: ' + escapeHtml_(body.date || '') +
        '<br>XL Drink: <b>' + (Number(body.score) || 0) + '</b>' +
        '<br>Status: ' + (body.finished ? 'FINISH 🏁' : 'GAME OVER') + '</p>' +
        (body.image ? '<img src="cid:card" style="max-width:100%;border-radius:12px;border:1px solid #eee">' : '') +
        '<p style="color:#b08a63;font-size:12px;margin-top:14px">Sampai jumpa di MONTY Run berikutnya!</p></div>';
      const opts = { htmlBody: html, name: 'MONTY&Co.' };
      if (body.image) {
        const m = String(body.image).match(/^data:(.+?);base64,(.*)$/);
        if (m) {
          const blob = Utilities.newBlob(Utilities.base64Decode(m[2]), m[1], 'monty-card.png');
          blob.setName('monty-card.png');
          opts.inlineImages = { card: blob };
          opts.attachments = [blob];
        }
      }
      MailApp.sendEmail(to, subject, 'Buka email ini di mode HTML untuk melihat kartu.', opts);
      return jsonOut({ ok: true });
    } catch (err) {
      return jsonOut({ ok: false, error: String(err) });
    }
  }

  return jsonOut({ ok: false, error: 'unknown action' });
}

function escapeHtml_(s) {
  return String(s).replace(/[&<>"]/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
  });
}
