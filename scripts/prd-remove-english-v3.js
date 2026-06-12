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

  // === 品牌端英文 ===
  content = content.replace(/英文标签 Shipped/g, '已发货标签');
  content = content.replace(/英文标签 Products/g, '商品列表标签');
  content = content.replace(/英文标签 P结束ing/g, '进行中标签');
  content = content.replace(/销量 \{sales\}/g, '销量');
  content = content.replace(/Ship个人中心nt/g, '发货单');
  content = content.replace(/事件的pr事件Default/g, '默认行为阻止');
  content = content.replace(/订单的service/g, '订单的服务项目');
  content = content.replace(/当前品牌[^：]*：[^（]*（如"BBS"）/g, match => match.replace(/BBS/, '某品牌'));

  // === 平台端英文 ===
  content = content.replace(/筛选-chip/g, '筛选标签');
  content = content.replace(/drawer/g, '侧边抽屉');
  content = content.replace(/UGC/g, '用户原创内容');
  content = content.replace(/发布时间（replies）/g, '发布时间、回复数');
  content = content.replace(/删除Reason/g, '删除原因');
  content = content.replace(/Top N/g, '前N名');
  content = content.replace(/Top N 页面/g, '前N名页面');
  content = content.replace(/Top N 商品/g, '前N名商品');
  content = content.replace(/Top N 热门内容/g, '前N名热门内容');
  content = content.replace(/商品 SKU/g, '商品编码');
  content = content.replace(/SKU 匹配/g, '商品编码匹配');
  content = content.replace(/KPI/g, '关键指标');
  content = content.replace(/TOP 门店/g, '排名门店');
  content = content.replace(/Platform 控制中心/g, '平台控制中心');
  content = content.replace(/Short剪切s/g, '快捷入口');
  content = content.replace(/Todo Queue/g, '待办队列');
  content = content.replace(/Alerts/g, '告警');

  // === 服务商端英文 ===
  content = content.replace(/御驰 Performance Studio/g, '某改装门店');
  content = content.replace(/门店的certifications 列表/g, '门店认证列表');
  content = content.replace(/new-案例-cover的图片/g, '新案例封面图片');
  content = content.replace(/硬删除（从列表中 splice）/g, '硬删除（从列表中移除）');
  content = content.replace(/链接.创建Object链接/g, '创建对象链接');
  content = content.replace(/OSS\/CDN/g, '对象存储/内容分发网络');
  content = content.replace(/内容edi标签页le div/g, '富文本编辑区域');

  // === 通用英文缩写/术语 ===
  content = content.replace(/TPU/g, '热塑性聚氨酯');
  content = content.replace(/"BBS FI-R 20寸锻造轮毂"/g, '"某品牌20寸锻造轮毂"');
  content = content.replace(/MD5/g, '哈希值');
  content = content.replace(/BSSID/g, '基站标识');
  content = content.replace(/WAVY/g, '波浪');

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
