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

  // 英文变量名/代码片段
  content = content.replace(/`?carrier`?/g, '物流公司');
  content = content.replace(/`?recipient`?/g, '收件人');
  content = content.replace(/`?re标记`?/g, '标记');
  content = content.replace(/`?trackingNo`?/g, '物流单号');
  content = content.replace(/`?ship个人中心nt`?/g, '发货记录');
  content = content.replace(/`?docu个人中心nt`?/g, '文档');

  // 表格管理页的代码配置残留
  content = content.replace(/配置的columns/g, '列配置');
  content = content.replace(/配置的键s/g, '数据字段');
  content = content.replace(/配置的键/g, '数据字段');
  content = content.replace(/配置的标签s/g, '列标题');
  content = content.replace(/配置的筛选s/g, '筛选条件');
  content = content.replace(/配置的统计/g, '统计指标');
  content = content.replace(/配置s/g, '配置');
  content = content.replace(/标签s/g, '标签');
  content = content.replace(/筛选s/g, '筛选');
  content = content.replace(/键s/g, '键');
  content = content.replace(/统计s/g, '统计');

  // 获取P服务商X... 这种被破坏的函数名
  content = content.replace(/获取P服务商A待接单/g, '待接单');
  content = content.replace(/获取P服务商C已完成订单/g, '已完成订单');
  content = content.replace(/获取P服务商S服务定价/g, '服务定价');
  content = content.replace(/获取P服务商/g, '获取服务商');

  // 清理表格中来源变量的技术残留
  content = content.replace(/\|\s*订单的收件人\s*\/\s*订单的手机号\s*\/\s*订单的地址\s*\|/g, '| 收件人信息 |');
  content = content.replace(/\|\s*订单物流信息\s*\/\s*物流公司\s*\/\s*物流单号\s*\|/g, '| 物流信息 |');
  content = content.replace(/\|\s*数据的订单列表（过滤品牌关联）\s*\|/g, '| 订单列表 |');
  content = content.replace(/\|\s*数据的商品列表（过滤\s*品牌\s*字段）\s*\|/g, '| 商品列表 |');
  content = content.replace(/\|\s*数据的首个品牌账号\s*\|/g, '| 品牌账号 |');
  content = content.replace(/\|\s*订单状态映射\s*\|/g, '| 状态映射 |');
  content = content.replace(/\|\s*论坛状态映射\s*\|/g, '| 状态映射 |');
  content = content.replace(/\|\s*状态标签\s*\/\s*状态判断\s*\|/g, '| 状态标签 |');
  content = content.replace(/\|\s*销量的sales\s*\/\s*已售\s*\/\s*品牌的sales\s*\|/g, '| 销量统计 |');
  content = content.replace(/\|\s*客服消息内容\s*\|/g, '| 消息内容 |');
  content = content.replace(/\|\s*会话状态\s*\|/g, '| 会话状态 |');
  content = content.replace(/\|\s*未读消息数\s*\|/g, '| 未读数 |');
  content = content.replace(/\|\s*业务数据\s*\|/g, '| 业务数据 |');

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
