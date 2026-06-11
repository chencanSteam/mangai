const fs = require('fs');
const path = require('path');

const PRD_DIR = path.join(__dirname, '..', 'docs', 'prd');

function fixFile(filepath) {
  let content = fs.readFileSync(filepath, 'utf-8');
  const original = content;

  // 修复被截断的 camelCase 片段
  const fragments = {
    'urchaseRecords': '采购记录',
    'rderMocks': '订单示例',
    'ompletedOrders': '已完成订单',
    'ollectBtn': '收藏按钮',
    'oLlectBtn': '收藏按钮',
    'ikeBtn': '点赞按钮',
    'iKeBtn': '点赞按钮',
    'hippingSubmit': '发货提交',
    'hIppingSubmit': '发货提交',
    'hatSubmit': '对话提交',
    'hareBtn': '分享按钮',
    'hAreBtn': '分享按钮',
    'hShareBtn': '分享按钮',
    'handleP': '处理',
    'handleAd': '处理',
    'hIDden': '隐藏',
    'grID': '网格',
    'goodsStatus': '商品状态',
    'forumCategory': '论坛分类',
    'formatP': '格式',
    'ervicePricingRows': '服务定价',
    'eleteBtn': '删除按钮',
    'electedUserVehicle': '选中车辆',
    'ejectStatus': '拒单状态',
    'ctiveMallRecom': '激活推荐',
    'completedOrders': '已完成订单',
    'cceptanceOrders': '待接单',
    'aseEditorP': '案例编辑器',
    'afterSaleReason': '售后原因',
    'acceptanceOrders': '待接单',
    'syncP': '同步',
    'buildUserGoodsOrderLink': '商品订单链接',
    'buildGarageComboOrderLink': '爱车组合订单链接',
    'caseEffect': '案例效果',
  };
  for (const [k, v] of Object.entries(fragments)) {
    const re = new RegExp(k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
    content = content.replace(re, v);
  }

  // 更多完整 camelCase
  content = content.replace(/getProviderPurchaseRecords/g, '采购记录');
  content = content.replace(/providerOrderMocks/g, '服务商订单示例');
  content = content.replace(/providerCompletedOrders/g, '服务商已完成订单');
  content = content.replace(/providerAcceptanceOrders/g, '服务商待接单');
  content = content.replace(/providerServicePricingRows/g, '服务商服务定价');
  content = content.replace(/providerRejectStatus/g, '服务商拒单状态');
  content = content.replace(/syncProviderCaseEditorP/g, '同步案例编辑器');
  content = content.replace(/activeMallRecom/g, '激活推荐');
  content = content.replace(/hidden/g, '隐藏');
  content = content.replace(/grid/g, '网格');
  content = content.replace(/deleteBtn/g, '删除按钮');
  content = content.replace(/selectedUserVehicle/g, '选中车辆');
  content = content.replace(/shippingSubmit/g, '发货提交');
  content = content.replace(/chatSubmit/g, '对话提交');
  content = content.replace(/collectBtn/g, '收藏按钮');
  content = content.replace(/likeBtn/g, '点赞按钮');
  content = content.replace(/shareBtn/g, '分享按钮');

  // 清理残留
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
