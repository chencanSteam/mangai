const fs = require('fs');
const path = require('path');

const PRD_DIR = path.join(__dirname, '..', 'docs', 'prd');

function fixFile(filepath) {
  let content = fs.readFileSync(filepath, 'utf-8');
  const original = content;

  // ===== 修复被替换破坏的单词（id → ID 破坏了其他词） =====
  content = content.replace(/provIDer/g, '服务商');
  content = content.replace(/rovIDer/g, '服务商');
  content = content.replace(/vIDeo/g, '视频');
  content = content.replace(/penID/g, '订单');
  content = content.replace(/openID/g, '开放ID');
  content = content.replace(/matchAdmi/g, '匹配管理员');
  content = content.replace(/avaScript/g, '脚本');
  content = content.replace(/usinessStats/g, '经营统计');
  content = content.replace(/subTabs/g, '子标签页');
  content = content.replace(/serInfo/g, '用户信息');
  content = content.replace(/serMallBrandOptions/g, '品牌选项');
  content = content.replace(/rderTi/g, '订单时间');
  content = content.replace(/shippingRe/g, '发货记录');
  content = content.replace(/authMode/g, '认证模式');
  content = content.replace(/uthMode/g, '认证模式');
  content = content.replace(/trackPageView/g, '页面访问统计');
  content = content.replace(/syncProvIDerCaseEditorP/g, '同步案例编辑器');
  content = content.replace(/showcaseServices/g, '展示服务');
  content = content.replace(/serviceStatus/g, '服务状态');
  content = content.replace(/shippingSubmit/g, '发货提交');
  content = content.replace(/processingOrders/g, '处理中订单');
  content = content.replace(/originalPrice/g, '原价');
  content = content.replace(/modType/g, '修改类型');
  content = content.replace(/logisticsManage/g, '物流管理');
  content = content.replace(/isPost/g, '是否帖子');
  content = content.replace(/iLikeBtn/g, '点赞按钮');
  content = content.replace(/iKeBtn/g, '点赞按钮');
  content = content.replace(/likeBtn/g, '点赞按钮');
  content = content.replace(/collectBtn/g, '收藏按钮');
  content = content.replace(/oLlectBtn/g, '收藏按钮');
  content = content.replace(/shareBtn/g, '分享按钮');
  content = content.replace(/hAreBtn/g, '分享按钮');
  content = content.replace(/hShareBtn/g, '分享按钮');
  content = content.replace(/handleUserForumSubmit/g, '帖子提交处理');
  content = content.replace(/handleUserForumReplySubmit/g, '回复提交处理');
  content = content.replace(/afterSaleType/g, '售后类型');
  content = content.replace(/afterSaleStatus/g, '售后状态');
  content = content.replace(/mallPage/g, '商城页面');
  content = content.replace(/providerWeb/g, '服务商网页');
  content = content.replace(/visitorStats/g, '访客统计');
  content = content.replace(/subTab/g, '子页面');

  // ===== 更多 camelCase 清理 =====
  content = content.replace(/provIDerPurchaseRecords/g, '服务商采购记录');
  content = content.replace(/provIDerOrderMocks/g, '服务商订单示例');
  content = content.replace(/provIDerRejectStatus/g, '服务商拒单状态');
  content = content.replace(/rovIDerCompletedOrders/g, '服务商已完成订单');
  content = content.replace(/rovIDerAcceptanceOrders/g, '服务商待接单');
  content = content.replace(/rovIDerServicePricingRows/g, '服务商服务定价');
  content = content.replace(/rovIDers/g, '服务商');

  // ===== 其他常见代码引用 =====
  content = content.replace(/bindServiceChatEvents/g, '事件绑定');
  content = content.replace(/bindDashboardEvents/g, '事件绑定');
  content = content.replace(/openPlatformDetailModal/g, '详情弹窗');
  content = content.replace(/handleProviderProfileSubmit/g, '资料保存');
  content = content.replace(/jumpToPage/g, '页面跳转');
  content = content.replace(/filterRows/g, '筛选功能');
  content = content.replace(/formatTag/g, '状态标签');

  // ===== 清理纯英文小写技术词 =====
  content = content.replace(/`?join`?/g, '入驻');
  content = content.replace(/`?apply`?/g, '申请');
  content = content.replace(/`?edit`?/g, '编辑');
  content = content.replace(/`?save`?/g, '保存');
  content = content.replace(/`?delete`?/g, '删除');
  content = content.replace(/`?remove`?/g, '移除');
  content = content.replace(/`?add`?/g, '添加');
  content = content.replace(/`?create`?/g, '创建');
  content = content.replace(/`?update`?/g, '更新');
  content = content.replace(/`?submit`?/g, '提交');
  content = content.replace(/`?cancel`?/g, '取消');
  content = content.replace(/`?confirm`?/g, '确认');
  content = content.replace(/`?search`?/g, '搜索');
  content = content.replace(/`?sort`?/g, '排序');
  content = content.replace(/`?filter`?/g, '筛选');
  content = content.replace(/`?page`?/g, '分页');
  content = content.replace(/`?load`?/g, '加载');
  content = content.replace(/`?refresh`?/g, '刷新');
  content = content.replace(/`?reset`?/g, '重置');
  content = content.replace(/`?clear`?/g, '清空');
  content = content.replace(/`?copy`?/g, '复制');
  content = content.replace(/`?paste`?/g, '粘贴');
  content = content.replace(/`?cut`?/g, '剪切');
  content = content.replace(/`?undo`?/g, '撤销');
  content = content.replace(/`?redo`?/g, '重做');
  content = content.replace(/`?select`?/g, '选择');
  content = content.replace(/`?selectAll`?/g, '全选');
  content = content.replace(/`?focus`?/g, '聚焦');
  content = content.replace(/`?blur`?/g, '失焦');
  content = content.replace(/`?hover`?/g, '悬停');
  content = content.replace(/`?click`?/g, '点击');
  content = content.replace(/`?dblclick`?/g, '双击');
  content = content.replace(/`?scroll`?/g, '滚动');
  content = content.replace(/`?resize`?/g, '调整大小');
  content = content.replace(/`?drag`?/g, '拖动');
  content = content.replace(/`?drop`?/g, '放下');
  content = content.replace(/`?swipe`?/g, '滑动');
  content = content.replace(/`?pinch`?/g, '捏合');
  content = content.replace(/`?zoom`?/g, '缩放');
  content = content.replace(/`?rotate`?/g, '旋转');

  // ===== 清理残留 =====
  content = content.replace(/  +/g, ' ');
  content = content.replace(/ ，/g, '，');
  content = content.replace(/。 /g, '。');
  content = content.replace(/\n{3,}/g, '\n\n');
  content = content.replace(/（\s*）/g, '');
  content = content.replace(/\(\s*\)/g, '');
  content = content.replace(/，\s*，/g, '，');
  content = content.replace(/。\s*。/g, '。');

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
