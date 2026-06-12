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

  // === 英文标签相关 ===
  content = content.replace(/英文标签 发货单/g, '标签：发货单');
  content = content.replace(/英文标签 和中文标题/g, '标签和中文标题');
  content = content.replace(/英文标签 Store Pro文件，中文标题/g, '标签：门店档案，中文标题');
  content = content.replace(/英文标签 ，标题为/g, '标签：');
  content = content.replace(/英文标签 、会话标题/g, '标签、会话标题');
  content = content.replace(/英文标签「LATEST」/g, '标签「最新」');
  content = content.replace(/包含英文标签/g, '包含标签');
  content = content.replace(/顶部展示英文标签/g, '顶部展示标签');
  content = content.replace(/面板顶部带英文标签/g, '面板顶部带标签');
  content = content.replace(/聊天头部.*英文标签/g, '聊天头部：返回按钮、标签');
  content = content.replace(/- \*\*英文标签\*\*：Work Bench/g, '- **标签**：工作台');
  content = content.replace(/- \*\*英文标签\*\*：P服务商 Audit/g, '- **标签**：服务商审核');
  content = content.replace(/- \*\*英文标签\*\*：P服务商 Detail/g, '- **标签**：服务商详情');
  content = content.replace(/- \*\*英文标签\*\*：Goods Order/g, '- **标签**：商品订单');
  content = content.replace(/- \*\*英文标签\*\*：（待分配）或 Service Order/g, '- **标签**：（待分配）或服务订单');
  content = content.replace(/- \*\*英文标签\*\*：After Sale/g, '- **标签**：售后');
  content = content.replace(/- \*\*英文标签\*\*：Case Review/g, '- **标签**：案例审核');
  content = content.replace(/- \*\*英文标签\*\*：Forum Moderation/g, '- **标签**：论坛审核');

  // === 清理多余空格 ===
  content = content.replace(/  +/g, ' ');
  content = content.replace(/\n{3,}/g, '\n\n');

  if (content !== original) {
    fs.writeFileSync(fp, content, 'utf-8');
    modified++;
    console.log('已修改:', fp);
  }
}

console.log('共修改', modified, '个文件');
