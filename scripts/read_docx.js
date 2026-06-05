const fs = require('fs');
const xml2js = require('xml2js');

const xml = fs.readFileSync('docx_extract/word/document.xml', 'utf8');

function isBlueColor(color) {
  if (!color) return false;
  const c = color.toLowerCase();
  // Common blue colors in Word
  return c === '0000ff' || c === '000080' || c === '0070c0' || c === '2e75b6' || c === '4472c4' || c === '5b9bd5' || c === '00b0f0' || c === '1f4e79' || c === '305496' || c === '264478' || c === '17375e' || c === '002060' || c === '1f3864';
}

function extractTextFromRun(r) {
  const rPr = r['w:rPr'] ? r['w:rPr'][0] : null;
  const color = rPr && rPr['w:color'] ? rPr['w:rPr'][0]['w:color'][0]['$']['w:val'] : null;
  const textNodes = r['w:t'] || [];
  const text = textNodes.map(t => typeof t === 'string' ? t : t['_']).join('');
  return { text, color };
}

function processParagraph(p, idx) {
  const runs = p['w:r'] || [];
  let paraText = '';
  let hasBlue = false;

  runs.forEach(r => {
    const rPr = r['w:rPr'] ? r['w:rPr'][0] : null;
    const color = rPr && rPr['w:color'] ? rPr['w:color'][0]['$']['w:val'] : null;
    const textNodes = r['w:t'] || [];
    const text = textNodes.map(t => typeof t === 'string' ? t : t['_']).join('');

    if (isBlueColor(color)) {
      hasBlue = true;
    }
    paraText += text;
  });

  return { idx, text: paraText, hasBlue };
}

const parser = new xml2js.Parser();
parser.parseString(xml, (err, result) => {
  if (err) {
    console.error(err);
    return;
  }

  const body = result['w:document']['w:body'][0];
  const paragraphs = body['w:p'] || [];
  const tables = body['w:tbl'] || [];

  console.log("=== 段落文本 ===");
  paragraphs.forEach((p, idx) => {
    const res = processParagraph(p, idx);
    if (res.text.trim()) {
      console.log(`${res.idx}: [BLUE=${res.hasBlue}] ${res.text.trim()}`);
    }
  });

  console.log("\n=== 表格文本 ===");
  tables.forEach((tbl, tidx) => {
    const rows = tbl['w:tr'] || [];
    rows.forEach((row, ridx) => {
      const cells = row['w:tc'] || [];
      cells.forEach((cell, cidx) => {
        const cellPars = cell['w:p'] || [];
        cellPars.forEach((p, pidx) => {
          const res = processParagraph(p, `${tidx}-${ridx}-${cidx}-${pidx}`);
          if (res.text.trim()) {
            console.log(`T${res.idx}: [BLUE=${res.hasBlue}] ${res.text.trim()}`);
          }
        });
      });
    });
  });
});
