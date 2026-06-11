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

  // 1. 删除 "四、全局说明" 整个章节
  content = content.replace(/## 四、全局说明\n[\s\S]*?\n---\n/, '---\n');

  // 2. 删除包含"交互"的整行（列表项、段落行）
  const lines = content.split(/\r?\n/);
  const filtered = lines.filter(line => {
    // 保留标题行（## 开头）
    if (/^#{1,4}\s/.test(line.trim())) return true;
    // 保留表格分隔行
    if (/^\|[-\s|]+\|$/.test(line.trim())) return true;
    // 删除包含"交互"的非标题行
    if (line.includes('交互')) return false;
    return true;
  });
  content = filtered.join('\n');

  // 3. 清理多余空行
  content = content.replace(/\n{3,}/g, '\n\n');
  content = content.replace(/---\n\n---\n/g, '---\n');

  if (content !== original) {
    fs.writeFileSync(fp, content, 'utf-8');
    modified++;
    console.log('已修改:', fp);
  }
}

console.log('共修改', modified, '个文件');
