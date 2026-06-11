const fs = require('fs');
const path = require('path');

const PRD_DIR = path.join(__dirname, '..', 'docs', 'prd');

function fixFile(filepath) {
  let content = fs.readFileSync(filepath, 'utf-8');
  const original = content;

  // 1. 代码表达式 / 条件判断
  content = content.replace(/\(vehicles\.length\s*>\s*1\)/g, '');
  content = content.replace(/\(allOrders\.length\)/g, '');
  content = content.replace(/\(getProviderPendingOrders\(\)\.length\)/g, '（待处理订单数量）');
  content = content.replace(/\(getProviderProcessingOrders\(\)\.length\)/g, '（进行中订单数量）');
  content = content.replace(/\(shipped\)/g, '');
  content = content.replace(/\(record模式\)/g, '（记录查看模式）');
  content = content.replace(/\(compact\s+模式\)/g, '（紧凑模式）');

  // 2. state 变量
  content = content.replace(/`?state\.userGarage\.selectedVehicle`?/g, '当前选中车辆');
  content = content.replace(/`?state\.userForum\.selectedPost`?/g, '当前选中帖子');
  content = content.replace(/`?state\.tab\s*=\s*"messages"`?/g, '切换至消息中心');
  content = content.replace(/`?state\.tab\s*=\s*"[^"]*"`?/g, '切换对应页面');
  content = content.replace(/\bstate\.[a-zA-Z_]+\b/g, '页面状态');

  // 3. data-user-action / data 属性
  content = content.replace(/`?data-user-action="user-vehicle-select"`?/g, '车辆切换下拉选择');
  content = content.replace(/`?data-user-action="user-mall-category"`?/g, '商品分类切换');
  content = content.replace(/`?data-user-action="user-forum-category"`?/g, '帖子分类切换');
  content = content.replace(/`?data-user-action="user-forum-like"`?/g, '点赞按钮');
  content = content.replace(/`?data-user-action="user-forum-comment-delete"`?/g, '删除评论操作');
  content = content.replace(/`?data-user-action="user-garage-exterior"`?/g, '外观改装入口');
  content = content.replace(/`?data-user-action="[^"]*"`?/g, '交互操作');
  content = content.replace(/`?data-user-auth-mode="smsLogin"`?/g, '手机短信登录模式');
  content = content.replace(/`?data-provider-case-field="content"`?/g, '案例内容字段');

  // 4. renderXxx 函数名
  content = content.replace(/`?renderServiceChatPage\s*\+\s*renderSidebar`?/g, '重新加载客服对话页面与侧边栏');
  content = content.replace(/`?renderServiceChatPage`?/g, '客服对话页面');
  content = content.replace(/`?renderSidebar`?/g, '侧边栏');
  content = content.replace(/`?renderTablePage`?/g, '表格管理页面');
  content = content.replace(/`?renderSimplePage`?/g, '简化表格页面');
  content = content.replace(/`?renderOrderTable`?/g, '订单列表');
  content = content.replace(/`?renderUserMallDetail`?/g, '商品详情展示');
  content = content.replace(/`?renderUserForumCreateForm`?/g, '快速发帖表单');
  content = content.replace(/`?renderUserForumDetail`?/g, '帖子详情展示');
  content = content.replace(/`?renderProviderForumDetail`?/g, '帖子管理面板');
  content = content.replace(/`?renderProviderPurchaseDetail`?/g, '商品采购详情');
  content = content.replace(/`?renderProviderPurchaseForm`?/g, '采购表单');
  content = content.replace(/`?renderProviderProductDetail`?/g, '商品详情面板');
  content = content.replace(/`?renderProviderCaseDetail`?/g, '案例详情面板');
  content = content.replace(/`?renderProviderCaseForm`?/g, '案例编辑表单');
  content = content.replace(/`?renderProviderModeratorForm`?/g, '版主申请表单');
  content = content.replace(/`?renderProviderDialog`?/g, '操作确认对话框');
  content = content.replace(/`?renderProviderCompleteForm`?/g, '完工确认表单');
  content = content.replace(/`?renderProviderProfileForm`?/g, '个人资料表单');
  content = content.replace(/`?renderAdminOrderDetail`?/g, '订单详情面板');
  content = content.replace(/`?renderAdminProviderDetail`?/g, '服务商详情面板');
  content = content.replace(/`?renderAdminProviderDetailPage`?/g, '服务商完整详情页');
  content = content.replace(/`?renderAdminCaseDetail`?/g, '案例详情面板');
  content = content.replace(/`?renderAdminForumDetail`?/g, '帖子详情面板');
  content = content.replace(/`?renderCaseCoverPreview`?/g, '封面图预览');
  content = content.replace(/`?renderVisitorMonitorPage`?/g, '访客监控页面');
  content = content.replace(/`?renderDashboard`?/g, '工作台首页');
  content = content.replace(/`?renderForumManagePage`?/g, '论坛管理页面');
  content = content.replace(/`?renderUserAuth`?/g, '登录注册页面');
  content = content.replace(/`?renderUserCredit`?/g, '金融授信页面');
  content = content.replace(/`?renderUserMe`?/g, '个人中心页面');
  content = content.replace(/`?renderUserInvoices`?/g, '发票管理页面');
  content = content.replace(/`?renderUserGarageVehicles`?/g, '爱车管理页面');
  content = content.replace(/`?renderUserOrders`?/g, '订单列表页面');
  content = content.replace(/`?renderUserOrderDetail`?/g, '订单详情页面');
  content = content.replace(/`?renderUserMessages`?/g, '消息中心页面');
  content = content.replace(/`?renderUserForum`?/g, '社区首页页面');
  content = content.replace(/`?renderUserMallHome`?/g, '商城首页页面');
  content = content.replace(/`?renderUserCaseDetail`?/g, '案例详情页面');
  content = content.replace(/`?renderUserNewsDetail`?/g, '资讯详情页面');
  content = content.replace(/`?renderUserProductDetail`?/g, '商品详情页面');
  content = content.replace(/`?renderProviderHome`?/g, '服务商首页');
  content = content.replace(/`?renderProviderOrders`?/g, '服务商订单页面');
  content = content.replace(/`?renderProviderOperations`?/g, '服务商运营页面');
  content = content.replace(/`?renderProviderMessages`?/g, '服务商消息页面');
  content = content.replace(/`?renderProviderMe`?/g, '服务商个人中心');
  content = content.replace(/`?renderShowcasePage`?/g, '门店展示页面');
  content = content.replace(/`?renderCaseManagePage`?/g, '案例管理页面');
  content = content.replace(/`?renderJoinPage`?/g, '入驻申请页面');
  content = content.replace(/`?renderAdmin`?/g, '管理员工作台');
  content = content.replace(/`?render[^`\s(]+`?/g, '页面展示');

  // 5. getXxx 函数名
  content = content.replace(/`?getMockUserAuth\(\)`?/g, '当前登录用户信息');
  content = content.replace(/`?getProviderPendingOrders\(\)`?/g, '待处理订单');
  content = content.replace(/`?getProviderProcessingOrders\(\)`?/g, '进行中订单');
  content = content.replace(/`?getNowStamp\(\)`?/g, '当前时间');
  content = content.replace(/`?getPageViewLabel\([^)]+\)`?/g, '浏览量统计');
  content = content.replace(/`?getActionCountLabel\([^)]+\)`?/g, '互动数据统计');

  // 6. 对象属性 / 字段名
  content = content.replace(/`?vehicle\.history`?/g, '车辆历史记录');
  content = content.replace(/`?item\.content`?/g, '帖子正文内容');
  content = content.replace(/`?posts`\/`?comments`\s+数组/g, '帖子与评论数据');
  content = content.replace(/内存中的\s+`?posts`\/`?comments`?\s+数组/g, '内存中的帖子与评论数据');

  // 7. mock / 数据生成
  content = content.replace(/`?mock\s+生成`?/g, '示例数据');
  content = content.replace(/`?mock-data\.js`?/g, '数据文件');
  content = content.replace(/`?window\.MockData`?/g, '平台数据');
  content = content.replace(/\bMockData\b/g, '数据');
  content = content.replace(/\bmock\b/g, '示例');

  // 8. CSS / 样式值
  content = content.replace(/`?min-height:\s*200px`?/g, '固定高度展示区域');
  content = content.replace(/`?min-height:\s*100%`?/g, '全高区域');
  content = content.replace(/`?backdrop-filter:\s*blur\(8px\)`?/g, '背景模糊效果');
  content = content.replace(/`?rgba\(255,106,0,0\.06\)`?/g, '浅橙色背景');
  content = content.replace(/`?3px\s+solid\s+#ff6a00`?/g, '橙色左边框');
  content = content.replace(/`?28px`?/g, '大号字体');
  content = content.replace(/`?180px`?/g, '固定高度');
  content = content.replace(/`?340px`?/g, '固定宽度');
  content = content.replace(/`?12px`?/g, '圆角');
  content = content.replace(/`?22px`?/g, '大圆角');
  content = content.replace(/`?0\.55px`?/g, '对应比例');
  content = content.replace(/`?1\.3px`?/g, '对应比例');
  // 通用 px 值清理
  content = content.replace(/\(\s*\d+px\s*，/g, '（');
  content = content.replace(/，\s*\d+px\s*\)/g, '）');

  // 9. 其他技术术语
  content = content.replace(/`?localStorage`?/g, '本地存储');
  content = content.replace(/`?浏览器本地缓存`?/g, '本地记录');
  content = content.replace(/`?页面渲染`?/g, '页面展示');
  content = content.replace(/`?页面状态`?/g, '当前页面');
  content = content.replace(/`?系统数据`?/g, '平台数据');
  content = content.replace(/`?用户认证信息`?/g, '用户登录状态');
  content = content.replace(/`?原型数据`?/g, '示例数据');
  content = content.replace(/`?URL`?/g, '链接');
  content = content.replace(/`?HTML`?/g, '网页内容');
  content = content.replace(/`?CSS`?/g, '样式');
  content = content.replace(/`?JSON`?/g, '数据格式');
  content = content.replace(/`?API`?/g, '接口');
  content = content.replace(/`?SPA`?/g, '单页面应用');
  content = content.replace(/`?DOM`?/g, '页面元素');

  // 10. 文件路径 / 代码文件
  content = content.replace(/`?assets\/js\/[^`\s]+`?/g, '前端脚本');
  content = content.replace(/`?assets\/css\/[^`\s]+`?/g, '样式文件');
  content = content.replace(/`?pages\/[^`\s]+`?/g, '独立页面');
  content = content.replace(/`?visitor-stats\.js`?/g, '统计脚本');
  content = content.replace(/`?mobile-app\.js`?/g, '主应用脚本');
  content = content.replace(/`?platform-web\.js`?/g, '平台端脚本');
  content = content.replace(/`?provider-web\.js`?/g, '服务商网页脚本');
  content = content.replace(/`?brand-web\.js`?/g, '品牌网页脚本');

  // 11. 清理残留的空括号、多余空格
  content = content.replace(/（\s*）/g, '');
  content = content.replace(/\(\s*\)/g, '');
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
