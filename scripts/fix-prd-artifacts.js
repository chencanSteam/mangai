const fs = require('fs');
const path = require('path');

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

const fixes = [
  [/short剪切s/g, '快捷入口'],
  [/Top P服务商s/g, '头部服务商'],
  [/交互属性/g, '交互操作'],
  [/备用的服务商消息\[\]\.消息列表/g, '服务商消息数据'],
  [/服务商Web的门店\.案例列表/g, '服务商门店案例'],
  [/平台数据中的materials的车辆列表\[\]\.colors`/g, '平台数据中的车辆颜色配置'],
  [/当前页面 \/ 当前页面 \/ 当前页面/g, '当前页面'],
  [/\(`swatch-row`\)/g, '（颜色选择行）'],
  [/车辆切换下拉选择 绑定 变更 事件/g, '车辆切换选择绑定切换事件'],
  [/表单通过 交互操作 绑定提交事件/g, '表单通过交互操作绑定提交事件'],
];

const files = getAllFiles('docs/prd');
let modified = 0;
for (const fp of files) {
  let content = fs.readFileSync(fp, 'utf-8');
  const original = content;
  for (const [re, replacement] of fixes) {
    content = content.replace(re, replacement);
  }
  if (content !== original) {
    fs.writeFileSync(fp, content, 'utf-8');
    modified++;
    console.log('已修复:', fp);
  }
}
console.log('共修复', modified, '个文件');
