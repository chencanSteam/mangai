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

const files = getAllFiles(PRD_DIR);
let modified = 0;

for (const fp of files) {
  let content = fs.readFileSync(fp, 'utf-8');
  const original = content;

  // 1. 删除 (ID: xxx) 和（ID: xxx）模式
  content = content.replace(/[(（]ID\s*[:：]\s*[a-zA-Z0-9_\u4e00-\u9fff]+[)）]/g, '');

  // 2. 删除反引号包裹的字段名
  content = content.replace(/`[a-zA-Z_][a-zA-Z0-9_]*`/g, '');

  // 3. 清理数据字典中的"来源变量"列（纯英文代码替换为—）
  content = content.replace(/\|([^|]+)\|\s*([a-zA-Z_][a-zA-Z0-9_\s]*)\s*\|/g, (match, col1, col2) => {
    if (/^[a-zA-Z_][a-zA-Z0-9_\s]*$/.test(col2.trim())) {
      return '|' + col1 + '| — |';
    }
    return match;
  });

  // 4. 删除包含纯技术标识符的列表项/段落行
  const lines = content.split(/\r?\n/);
  const filtered = lines.map(line => {
    if (/^#{1,6}\s/.test(line.trim())) return line;
    if (/^\|[-\s|]+\|$/.test(line.trim())) return line;

    const deletePatterns = [
      /\bstatus\b/i,
      /\bstate\b/i,
      /\btype\b/i,
      /\bmode\b/i,
      /\bcode\b/i,
      /\bflag\b/i,
      /\btag\b/i,
      /\bvalue\b/i,
      /\bkey\b/i,
      /字段名/,
      /枚举值/,
      /参数/,
      /变量/,
      /属性名/,
    ];
    for (const p of deletePatterns) {
      if (p.test(line)) return '';
    }
    return line;
  });
  content = filtered.join('\n');

  // 5. 清理多余空格和空行
  content = content.replace(/  +/g, ' ');
  content = content.replace(/\n{3,}/g, '\n\n');
  content = content.replace(/^\s*$/gm, '');
  content = content.replace(/\n{3,}/g, '\n\n');

  if (content !== original) {
    fs.writeFileSync(fp, content, 'utf-8');
    modified++;
    console.log('已修改:', fp);
  }
}

console.log('共修改', modified, '个文件');
