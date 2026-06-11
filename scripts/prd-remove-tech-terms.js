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

  // 1. 清理数据字典表格中的技术来源描述
  // 替换表格第三列（来源文件）中的技术术语
  content = content.replace(/\|\s*示例数据\s*\/\s*主应用脚本\s*\|/g, '| 系统 |');
  content = content.replace(/\|\s*示例数据\s*\/\s*页面定义\s*\|/g, '| 系统 |');
  content = content.replace(/\|\s*示例数据\s*\/\s*页面配置\s*\|/g, '| 系统 |');
  content = content.replace(/\|\s*示例数据\s*\+\s*本地存储\s*\|/g, '| 系统 |');
  content = content.replace(/\|\s*示例数据\s*\/\s*用户输入\s*\|/g, '| 系统 / 用户 |');
  content = content.replace(/\|\s*示例数据\s*\/\s*用户上传\s*\|/g, '| 系统 / 用户 |');
  content = content.replace(/\|\s*示例数据\s*\/\s*页面功能\s*\|/g, '| 系统 |');
  content = content.replace(/\|\s*本地记录\s*\|/g, '| 系统 |');
  content = content.replace(/\|\s*本地存储\s*\|/g, '| 系统 |');
  content = content.replace(/\|\s*页面功能\s*\|/g, '| 系统 |');
  content = content.replace(/\|\s*页面定义\s*\|/g, '| 系统 |');
  content = content.replace(/\|\s*页面配置\s*\|/g, '| 系统 |');
  content = content.replace(/\|\s*页面逻辑\s*\|/g, '| 系统 |');
  content = content.replace(/\|\s*示例数据\s*\|/g, '| 系统 |');
  content = content.replace(/\|\s*主应用脚本\s*\|/g, '| 系统 |');
  content = content.replace(/\|\s*主应用脚本\s*\/\s*示例数据\s*\|/g, '| 系统 |');
  content = content.replace(/\|\s*主应用脚本\s*\/\s*本地记录\s*\|/g, '| 系统 |');

  // 2. 清理正文中的技术实现描述（逐行处理）
  const lines = content.split(/\r?\n/);
  const filtered = lines.map(line => {
    // 保留标题行
    if (/^#{1,6}\s/.test(line.trim())) return line;
    // 保留表格分隔行
    if (/^\|[-\s|]+\|$/.test(line.trim())) return line;

    // 删除包含以下关键词的整行（列表项或段落）
    const deletePatterns = [
      /示例数据\s*中已定义/,
      /示例数据\s*中已存在/,
      /示例数据\s*中预置/,
      /本地记录\s*中已存在/,
      /本地记录\s*中读取/,
      /本地记录\s*中写入/,
      /本地存储\s*中已存在/,
      /将.*写入\s*本地记录/,
      /将.*写入\s*本地存储/,
      /持久化到\s*本地记录/,
      /持久化到\s*本地存储/,
      /存储在\s*本地记录/,
      /存储在\s*本地存储/,
      /以列表形式存储在/,
      /当前实现为前端静态原型/,
      /前端静态原型/,
      /所有数据仅保存在/,
      /刷新页面后恢复/,
      /恢复为初始/,
      /恢复初始/,
      /预设数据/,
      /初始数据/,
      /浏览器会拦截/,
      /浏览器本地/,
      /仅保存在/,
      /仅修改/,
      /仅作临时/,
      /临时保存/,
      /临时生效/,
      /临时存储/,
      /内存中的/,
      /内存数组/,
      /保存在内存中/,
      /页面展示\s+和\s+页面展示/,
      /页面展示\s+通用函数/,
      /页面展示\s+接收到的/,
      /页面展示\s+为/,
      /结构为\s*\{/,  // 数据结构描述如 { 订单ID, carrier... }
    ];
    for (const p of deletePatterns) {
      if (p.test(line)) return '';
    }

    // 替换行内的技术术语
    let cleaned = line;
    cleaned = cleaned.replace(/示例数据/g, '');
    cleaned = cleaned.replace(/主应用脚本/g, '');
    cleaned = cleaned.replace(/本地记录/g, '');
    cleaned = cleaned.replace(/本地存储/g, '');
    cleaned = cleaned.replace(/页面功能/g, '');
    cleaned = cleaned.replace(/页面定义/g, '');
    cleaned = cleaned.replace(/页面配置/g, '');
    cleaned = cleaned.replace(/页面逻辑/g, '');
    cleaned = cleaned.replace(/页面展示/g, '');
    cleaned = cleaned.replace(/浏览器/g, '');
    cleaned = cleaned.replace(/前端静态/g, '');
    cleaned = cleaned.replace(/预设数据/g, '');
    cleaned = cleaned.replace(/初始数据/g, '');
    cleaned = cleaned.replace(/恢复初始/g, '');
    cleaned = cleaned.replace(/恢复为初始/g, '');
    cleaned = cleaned.replace(/mock/gi, '');

    // 清理因替换产生的多余空格和标点
    cleaned = cleaned.replace(/\s{2,}/g, ' ');
    cleaned = cleaned.replace(/，\s*，/g, '，');
    cleaned = cleaned.replace(/。\s*。/g, '。');
    cleaned = cleaned.replace(/；\s*；/g, '；');
    cleaned = cleaned.replace(/、\s*、/g, '、');
    cleaned = cleaned.replace(/\/\s*\/\s*\/+/g, '/');
    cleaned = cleaned.replace(/\(\s*\)/g, '');
    cleaned = cleaned.replace(/（\s*）/g, '');
    cleaned = cleaned.replace(/\|\s*\|/g, '|');

    return cleaned;
  });

  content = filtered.join('\n');

  // 3. 清理空行和格式问题
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
