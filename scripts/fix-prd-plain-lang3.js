const fs = require('fs');
const path = require('path');

const PRD_DIR = path.join(__dirname, '..', 'docs', 'prd');

function fixFile(filepath) {
  let content = fs.readFileSync(filepath, 'utf-8');
  const original = content;

  // 1. mock 变量名
  content = content.replace(/`?mockUserAuth`?/g, '用户登录凭证');
  content = content.replace(/`?mockUserInvoices`?/g, '用户发票记录');
  content = content.replace(/`?mockTopicDeleted`?/g, '帖子删除标记');

  // 2. 函数名
  content = content.replace(/`?nProvider`?\s+函数映射/g, '状态映射');
  content = content.replace(/`?nProvider`?/g, '状态映射');
  content = content.replace(/`?getAdminProviderBusinessStats`?\s+函数计算/g, '经营统计计算');
  content = content.replace(/`?getAdminProviderBusinessStats`?/g, '经营统计计算');
  content = content.replace(/计算字段（经营统计计算）/g, '经营统计数据');

  // 3. 本地记录中的 mock 引用清理
  content = content.replace(/本地记录\s*中的\s*`?用户登录凭证`?/g, '本地记录中的用户登录凭证');
  content = content.replace(/本地记录\s*（`?用户登录凭证`?）/g, '本地记录');
  content = content.replace(/本地记录\s*（`?用户发票记录`?）/g, '本地记录');
  content = content.replace(/本地记录\s*（`?帖子删除标记`?）/g, '本地记录');

  // 4. 页面逻辑 / 主应用脚本 等描述
  content = content.replace(/\|\s*页面逻辑\s*\|/g, '| 页面功能 |');
  content = content.replace(/主应用脚本\s*\/\s*本地记录/g, '本地记录');

  // 5. 模拟数据
  content = content.replace(/模拟数据/g, '示例数据');

  // 6. 清理多余空格
  content = content.replace(/  +/g, ' ');
  content = content.replace(/ ，/g, '，');
  content = content.replace(/。 /g, '。');
  content = content.replace(/\n{3,}/g, '\n\n');

  if (content !== original) {
    fs.writeFileSync(filepath, content, 'utf-8');
    return true;
  }
  return false;
}

function getAllFiles(dir) {
  const files = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...getAllFiles(fullPath));
    } else if (entry.name.endsWith('.md')) {
      files.push(fullPath);
    }
  }
  return files;
}

const files = getAllFiles(PRD_DIR);
let modified = 0;
for (const filepath of files) {
  if (fixFile(filepath)) {
    modified++;
    console.log(`已修改: ${filepath}`);
  }
}
console.log(`\n共修改 ${modified}/${files.length} 个文件`);
