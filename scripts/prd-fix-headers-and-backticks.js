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

  // 1. 恢复被误删的数据字典表头
  content = content.replace(/### 4、数据字典\n\n\|[-\s|]+\|/g, '### 4、数据字典\n\n| 数据项 | 来源变量 | 来源文件 |\n| ------ | -------- | -------- |');

  // 2. 删除所有剩余的反引号内容（包括不成对的）
  // 匹配 `xxx` 成对
  content = content.replace(/`[^`\n]*`/g, (match) => {
    const inner = match.slice(1, -1).trim();
    // 如果是纯中文，保留内容去掉反引号
    if (/^[\u4e00-\u9fff\s]+$/.test(inner)) return inner;
    // 否则删除整个反引号块
    return '';
  });
  // 删除不成对的反引号
  content = content.replace(/`/g, '');

  // 3. 清理因删除产生的多余空格
  content = content.replace(/  +/g, ' ');
  content = content.replace(/\n{3,}/g, '\n\n');

  if (content !== original) {
    fs.writeFileSync(fp, content, 'utf-8');
    modified++;
    console.log('已修改:', fp);
  }
}

console.log('共修改', modified, '个文件');
