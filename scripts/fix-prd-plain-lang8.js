const fs = require('fs');
const path = require('path');

const PRD_DIR = path.join(__dirname, '..', 'docs', 'prd');

function fixFile(filepath) {
  let content = fs.readFileSync(filepath, 'utf-8');
  const original = content;

  // ===== 修复重复词 =====
  content = content.replace(/列表\s+列表/g, '列表');
  content = content.replace(/数据\s+数据/g, '数据');
  content = content.replace(/状态\s+状态/g, '状态');
  content = content.replace(/页面\s+页面/g, '页面');
  content = content.replace(/信息\s+信息/g, '信息');
  content = content.replace(/记录\s+记录/g, '记录');
  content = content.replace(/数量\s+数量/g, '数量');
  content = content.replace(/按钮\s+按钮/g, '按钮');
  content = content.replace(/标签\s+标签/g, '标签');
  content = content.replace(/条目\s+条目/g, '条目');
  content = content.replace(/卡片\s+卡片/g, '卡片');
  content = content.replace(/面板\s+面板/g, '面板');

  // ===== 修复代码残留 =====
  content = content.replace(/push/g, '添加');
  content = content.replace(/unshift/g, '插入到首位');
  content = content.replace(/`?post\s*===\s*ID`?/g, '帖子ID匹配');
  content = content.replace(/`?===`?/g, '等于');
  content = content.replace(/`?!==`?/g, '不等于');
  content = content.replace(/`?===\s*ID`?/g, 'ID匹配');

  // ===== 修复畸形替换 =====
  content = content.replace(/ti个人中心:\s*当前时间/g, '当前时间');
  content = content.replace(/备用的服务商消息\[\]\.消息列表/g, '服务商消息数据');
  content = content.replace(/服务商Web的门店\.案例列表/g, '服务商门店案例');
  content = content.replace(/门店信息获取/g, '门店信息');
  content = content.replace(/全部订单数据/g, '全部订单');
  content = content.replace(/采购记录数据/g, '采购记录');
  content = content.replace(/案例数据/g, '案例');
  content = content.replace(/结算数据/g, '结算记录');
  content = content.replace(/用户订单数据/g, '用户订单');
  content = content.replace(/论坛帖子数据/g, '论坛帖子');
  content = content.replace(/可采购商品/g, '可采购商品');
  content = content.replace(/分类信息/g, '分类信息');
  content = content.replace(/门店案例/g, '门店案例');
  content = content.replace(/经营统计数据/g, '经营统计');
  content = content.replace(/消息通知/g, '消息通知');
  content = content.replace(/标记已读/g, '标记已读');
  content = content.replace(/地址信息/g, '地址信息');
  content = content.replace(/数据读取/g, '数据读取');

  // ===== 修复 "来源 车辆历史记录" 等 =====
  content = content.replace(/来源\s+([\u4e00-\u9fff]+)/g, '来源：$1');
  content = content.replace(/写入\s+([\u4e00-\u9fff]+)/g, '写入$1');
  content = content.replace(/加入\s+([\u4e00-\u9fff]+)/g, '加入$1');

  // ===== 修复 "车辆列表 列表首位" =====
  content = content.replace(/车辆列表\s+列表首位/g, '车辆列表首位');
  content = content.replace(/帖子列表\s+列表首位/g, '帖子列表首位');

  // ===== 修复 "圆角 大圆角" =====
  content = content.replace(/圆角\s+大圆角/g, '大圆角');

  // ===== 清理多余空格 =====
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
