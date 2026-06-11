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

  // 删除 "3、定义" 整块（从 ### 3、定义 到 ### 4、参考资料 之前）
  content = content.replace(/### 3、定义\n[\s\S]*?(?=### 4、参考资料)/, '');

  // 删除 "4、参考资料" 整块（包括内容，直到下一个 ---）
  content = content.replace(/### 4、参考资料\n[\s\S]*?\n---\n/, '---\n');

  // 删除 "6、假定和约束" 整块（包括内容，直到下一个 ---）
  content = content.replace(/### 6、假定和约束\n[\s\S]*?\n---\n/, '---\n');

  // 删除 "三、产品结构" 整块（包括内容，直到下一个 ---）
  content = content.replace(/## 三、产品结构\n[\s\S]*?\n---\n/, '---\n');

  // 清理多余空行和重复的 ---
  content = content.replace(/\n{4,}/g, '\n\n\n');
  content = content.replace(/---\n\n---\n/g, '---\n');
  content = content.replace(/\n\n---\n\n## /g, '\n\n---\n\n\n## ');

  if (content !== original) {
    fs.writeFileSync(fp, content, 'utf-8');
    modified++;
    console.log('已修改:', fp);
  }
}

console.log('共修改', modified, '个文件');
