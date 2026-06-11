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

const fixes = [
  // 条目的XXX → 自然表述
  [/条目的用户/g, '用户'],
  [/条目的service/g, '服务项目'],
  [/条目的appoint个人中心nt/g, '预约时间'],
  [/条目的上一个iew/g, '最新预览'],
  [/条目的ti个人中心line/g, '时间线'],
  [/条目的ti个人中心/g, '时间'],
  [/条目的sales/g, '销量'],
  [/条目的sold/g, '已售'],
  [/条目的分类/g, '分类'],
  [/条目的标题/g, '标题'],
  [/条目的model/g, '车型'],
  [/条目的style/g, '风格'],
  [/条目的修改类型/g, '修改类型'],
  [/条目的cost/g, '费用'],
  [/条目的图片P评价/g, '图片预览'],
  [/条目的图片/g, '图片'],
  [/条目的city/g, '城市'],
  [/条目的district/g, '区域'],
  [/条目的ratio%/g, '占比'],
  [/条目的售后状态/g, '售后状态'],
  [/条目的售后类型/g, '售后类型'],
  [/条目的售后原因/g, '售后原因'],
  [/条目的物流公司/g, '物流公司'],
  [/条目的物流单号/g, '物流单号'],
  [/条目的消息列表/g, '消息记录'],
  [/条目的city/g, '城市'],

  // 其他被破坏的词汇
  [/appoint个人中心nt/g, '预约时间'],
  [/上一个iew/g, '预览'],
  [/ti个人中心line/g, '时间线'],
  [/ti个人中心/g, '时间'],
  [/图片P评价/g, '图片预览'],
  [/获取O订单时间个人中心line/g, '时间线'],
  [/O订单时间个人中心line/g, '时间线'],

  // 清理"条目的"前缀残留（通用）
  [/条目的([\u4e00-\u9fff]+)/g, '$1'],
  [/条目的([a-zA-Z]+)/g, '$1'],
];

const files = getAllFiles(PRD_DIR);
let modified = 0;
for (const fp of files) {
  let content = fs.readFileSync(fp, 'utf-8');
  const original = content;
  for (const [re, replacement] of fixes) {
    content = content.replace(re, replacement);
  }
  // 清理多余空格
  content = content.replace(/  +/g, ' ');
  content = content.replace(/\n{3,}/g, '\n\n');
  if (content !== original) {
    fs.writeFileSync(fp, content, 'utf-8');
    modified++;
    console.log('已修复:', fp);
  }
}
console.log('共修复', modified, '个文件');
