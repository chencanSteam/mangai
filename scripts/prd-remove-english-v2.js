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

  // === CSS类名/组件名混合 ===
  content = content.replace(/品牌-web-empty/g, '品牌空状态');
  content = content.replace(/帖子-hero-卡片/g, '帖子首屏卡片');
  content = content.replace(/帖子-标签-row/g, '帖子标签行');
  content = content.replace(/帖子-engage-bar/g, '帖子互动栏');
  content = content.replace(/帖子-reply-卡片/g, '帖子回复卡片');
  content = content.replace(/用户-个人中心ssage-分页/g, '用户消息分页');
  content = content.replace(/mobile-stat/g, '移动端统计');
  content = content.replace(/管理员-kv-list/g, '管理员键值列表');
  content = content.replace(/日期时间-local/g, '本地日期时间');
  content = content.replace(/mall-购物车-角标/g, '商城购物车角标');
  content = content.replace(/封面图预览，compact 模式/g, '封面图预览，紧凑模式');
  content = content.replace(/封面图预览，compact模式/g, '封面图预览，紧凑模式');

  // === 代码变量/英文单词 ===
  content = content.replace(/night-cruise/g, '夜间巡游');
  content = content.replace(/wheelPR-8801/g, '推荐商品');
  content = content.replace(/new-case-cover/g, '新案例封面');
  content = content.replace(/services/g, '服务');
  content = content.replace(/clipboard\.文本写入/g, '文本复制');
  content = content.replace(/clipboard/g, '剪贴板');
  content = content.replace(/compact/g, '紧凑');
  content = content.replace(/engage/g, '互动');
  content = content.replace(/intention/g, '意向');
  content = content.replace(/progress/g, '进度');
  content = content.replace(/official/g, '官方');
  content = content.replace(/forum/g, '论坛');
  content = content.replace(/stat/g, '统计');
  content = content.replace(/web/g, '网页');
  content = content.replace(/ssage/g, '消息');
  content = content.replace(/row/g, '行');
  content = content.replace(/reply/g, '回复');
  content = content.replace(/list/g, '列表');
  content = content.replace(/kv/g, '键值');
  content = content.replace(/mall/g, '商城');
  content = content.replace(/local/g, '本地');
  content = content.replace(/hero/g, '首屏');
  content = content.replace(/district/g, '区域');
  content = content.replace(/cruise/g, '巡游');
  content = content.replace(/jpg/g, '图片');
  content = content.replace(/state/g, '状态');
  content = content.replace(/city/g, '城市');

  // === 英文描述 ===
  content = content.replace(/类目英文名（eyebrow）/g, '类目眉标');
  content = content.replace(/eyebrow/g, '眉标');
  content = content.replace(/标签页 → forum/g, '标签页 → 论坛');

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
