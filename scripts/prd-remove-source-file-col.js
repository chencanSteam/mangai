const fs = require('fs');
const path = require('path');

const PRD_DIR = path.join(__dirname, '..', 'docs', 'prd');

function getAllFiles(dir) {
  const files = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...getAllFiles(fullPath));
    else if (entry.name.endsWith('.md')) files.push(fullPath);
  }
  return files;
}

function convert3ColTo2Col(line) {
  // Only process lines that start with | and have content
  const trimmed = line.trim();
  if (!trimmed.startsWith('|') || !trimmed.endsWith('|')) return line;

  // Split by | and remove empty parts from leading/trailing |
  const parts = trimmed.split('|').map(p => p.trim()).filter(p => p !== '');

  // Only convert if exactly 3 columns
  if (parts.length !== 3) return line;

  // Join first 2 columns back with |
  return '| ' + parts[0] + ' | ' + parts[1] + ' |';
}

const files = getAllFiles(PRD_DIR);
let modified = 0;

for (const fp of files) {
  let content = fs.readFileSync(fp, 'utf-8');
  const original = content;
  const lines = content.split(/\r?\n/);
  let inDataDict = false;
  let inNextSection = false;

  const result = lines.map(line => {
    // Detect entering data dictionary section
    if (/^###\s+4、数据字典/.test(line.trim())) {
      inDataDict = true;
      inNextSection = false;
      return line;
    }
    // Detect leaving data dictionary section (next ### heading)
    if (inDataDict && /^###\s+/.test(line.trim()) && !/^###\s+4、数据字典/.test(line.trim())) {
      inDataDict = false;
      inNextSection = true;
      return line;
    }
    // Also leave on ## heading
    if (inDataDict && /^##\s+/.test(line.trim())) {
      inDataDict = false;
      inNextSection = true;
      return line;
    }

    if (inDataDict) {
      return convert3ColTo2Col(line);
    }
    return line;
  });

  content = result.join('\n');

  if (content !== original) {
    fs.writeFileSync(fp, content, 'utf-8');
    modified++;
    console.log('已修改:', fp);
  }
}

console.log('共修改', modified, '个文件');
