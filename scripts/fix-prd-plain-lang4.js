const fs = require('fs');
const path = require('path');

const PRD_DIR = path.join(__dirname, '..', 'docs', 'prd');

function fixFile(filepath) {
  let content = fs.readFileSync(filepath, 'utf-8');
  const original = content;

  // ===== 通用代码模式替换 =====

  // object.property 模式（如 order.shipment, visitorStats.pageViews）
  content = content.replace(/`?([a-zA-Z_]+)\.([a-zA-Z_]+)`?/g, (match, obj, prop) => {
    // 保留一些常见业务描述
    if (obj === 'order' && prop === 'shipment') return '订单物流信息';
    if (obj === 'order' && prop === 'shippingCompany') return '物流公司';
    if (obj === 'order' && prop === 'shippingNo') return '物流单号';
    if (obj === 'order' && prop === 'receiver') return '收件人信息';
    if (obj === 'visitorStats' && prop === 'pageViews') return '页面浏览统计';
    if (obj === 'visitorStats' && prop === 'todayVisits') return '今日访客数';
    if (obj === 'visitorStats' && prop === 'totalVisits') return '总访问量';
    if (obj === 'visitorStats' && prop === 'productCollections') return '商品收藏统计';
    if (obj === 'visitorStats' && prop === 'postViews') return '帖子浏览统计';
    if (obj === 'visitorStats' && prop === 'caseViews') return '案例浏览统计';
    if (obj === 'serviceChats' && prop === 'status') return '会话状态';
    if (obj === 'serviceChats' && prop === 'unread') return '未读消息数';
    if (obj === 'serviceChats' && prop === 'messages') return '消息内容';
    if (prop === 'status') return '状态';
    if (prop === 'id') return 'ID';
    if (prop === 'name') return '名称';
    // 通用：对象.属性 → 对应数据
    return `${obj}的${prop}`;
  });

  // object[index].property 模式
  content = content.replace(/`?([a-zA-Z_]+)\[[a-zA-Z0-9_]+\]\.([a-zA-Z_]+)`?/g, (match, obj, prop) => {
    if (obj === 'serviceChats' && prop === 'messages') return '客服消息内容';
    if (obj === 'serviceChats' && prop === 'status') return '会话状态';
    if (obj === 'serviceChats' && prop === 'unread') return '未读消息数';
    return `${obj}的${prop}`;
  });

  // 函数调用 object.method() 或 method()
  content = content.replace(/`?([a-zA-Z_]+)\(([^{)]*)\)`?/g, (match, fn, args) => {
    if (fn === 'filterRows') return '筛选处理';
    if (fn === 'formatTag') return '状态标签格式化';
    if (fn === 'isShipped') return '发货状态判断';
    if (fn === 'isStatus') return '状态判断';
    if (fn === 'toLocaleString') return '数字格式化';
    if (fn === 'jumpToPage') return '页面跳转';
    if (fn === 'bindDashboardEvents') return '事件绑定';
    if (fn === 'bindServiceChatEvents') return '事件绑定';
    if (fn === 'openPlatformDetailModal') return '详情弹窗';
    if (fn === 'handleProviderProfileSubmit') return '资料保存处理';
    if (fn === 'productSales') return '销量统计';
    if (fn === 'orderReceiverInfo') return '收件信息拼接';
    if (fn === 'brandOrders') return '品牌订单';
    if (fn === 'brandProducts') return '品牌商品';
    if (fn === 'getProviderStore') return '门店信息获取';
    if (fn === 'getProviderAllOrders') return '全部订单获取';
    if (fn === 'getProviderPurchaseRecords') return '采购记录获取';
    if (fn === 'getProviderCaseRows') return '案例数据获取';
    if (fn === 'getProviderSettlementRows') return '结算数据获取';
    if (fn === 'getProviderPurchasableProducts') return '可采购商品获取';
    if (fn === 'getProviderForumRows') return '论坛帖子获取';
    if (fn === 'getUserOrders') return '用户订单获取';
    if (fn === 'getUserMallCategoryMeta') return '分类元数据获取';
    if (fn === 'getStoreCases') return '门店案例获取';
    if (fn === 'getAdminProviderBusinessStats') return '经营统计获取';
    if (fn === 'getNotificationsForRole') return '消息通知获取';
    if (fn === 'markNotificationsRead') return '标记消息已读';
    if (fn === 'getProviderAddresses') return '地址信息获取';
    if (fn === 'getItem') return '数据读取';
    if (fn === 'nForum') return '论坛状态映射';
    if (fn === 'nAudit') return '审核状态映射';
    if (fn === 'nOrder') return '订单状态映射';
    if (fn === 'nCaseDisplay') return '案例展示状态映射';
    if (fn === 'nCaseAudit') return '案例审核状态映射';
    if (fn === 'matchAdminOrderStatus') return '订单状态匹配';
    if (fn === 'isAdminGoodsOrder') return '商品订单判断';
    if (fn === 'execCommand') return '编辑命令';
    if (fn === 'writeText') return '文本写入';
    if (fn === 'toString') return '字符串转换';
    if (fn === 'data') return '数据'; // data.products
    return '对应功能处理';
  });

  // 数组/对象访问 [index]
  content = content.replace(/`?([a-zA-Z_]+)\[0\]`?/g, '首个$1');
  content = content.replace(/`?([a-zA-Z_]+)\[[a-zA-Z0-9_]+\]`?/g, '$1对应项');

  // ===== 技术术语 =====
  content = content.replace(/前端静态原型/g, '前端演示版本');
  content = content.replace(/内存中的/g, '临时');
  content = content.replace(/内存数组/g, '数据列表');
  content = content.replace(/保存在内存中/g, '临时保存');
  content = content.replace(/仅保存在内存中/g, '仅临时保存');
  content = content.replace(/仅修改内存中的/g, '仅修改临时');
  content = content.replace(/内存中生效/g, '临时生效');
  content = content.replace(/内存/g, '临时存储');
  content = content.replace(/数组/g, '列表');
  content = content.replace(/fallback/g, '备用');
  content = content.replace(/fallback逻辑/g, '备用逻辑');
  content = content.replace(/WebSocket/g, '实时消息推送');
  content = content.replace(/推送机制/g, '消息推送');
  content = content.replace(/浏览器本地存储/g, '本地记录');
  content = content.replace(/本地记录\.getItem/g, '本地数据读取');
  content = content.replace(/预置\s+示例\s+数据/g, '预设示例数据');
  content = content.replace(/预置 示例 数据/g, '预设示例数据');
  content = content.replace(/初始 示例 数据/g, '初始示例数据');
  content = content.replace(/恢复为初始示例数据/g, '恢复为初始数据');
  content = content.replace(/恢复初始状态/g, '恢复初始数据');
  content = content.replace(/恢复初始 示例 数据/g, '恢复初始数据');
  content = content.replace(/页面展示\s+接收到的/g, '页面接收到的');
  content = content.replace(/当前实现为前端演示版本/g, '当前为演示版本');

  // ===== 代码表达式清理 =====
  // 如 brandOrders.filter(isShipped)
  content = content.replace(/([\w\.]+)\.filter\(([\w]+)\)/g, '对应筛选结果');
  // 如 data.products
  content = content.replace(/`?data\.([a-zA-Z_]+)`?/g, '$1数据');
  // 如 brandAccounts[0]
  content = content.replace(/`?([a-zA-Z_]+)\[0\]`?/g, '首个$1');

  // ===== 属性名 / 字段名（剩余 camelCase） =====
  // 用更宽泛的匹配处理剩余 camelCase
  content = content.replace(/`?([a-z]+[A-Z][a-zA-Z]*)`?/g, (match, word) => {
    const map = {
      'serviceChat': '客服对话',
      'serviceChats': '客服会话',
      'providerAudit': '入驻审核',
      'orderAssign': '订单分配',
      'caseManage': '案例管理',
      'invoiceManage': '发票管理',
      'productList': '商品列表',
      'brandManage': '品牌管理',
      'promotionManage': '促销管理',
      'forumManage': '论坛管理',
      'visitorMonitor': '访客监控',
      'providerMessages': '服务商消息',
      'adminMessages': '管理员消息',
      'linkedProducts': '关联商品',
      'topStatus': '置顶状态',
      'featuredStatus': '加精状态',
      'linkAuthStatus': '链接认证状态',
      'creatorPinned': '主页置顶',
      'selectedIndex': '选中项索引',
      'shortcutPage': '快捷页面',
      'subTab': '子页面',
      'meTab': '个人中心页',
      'auditStatus': '审核状态',
      'shippedAt': '发货时间',
      'trackingNo': '物流单号',
      'shippingCompany': '物流公司',
      'shippingNo': '物流单号',
      'providerContact': '联系人',
      'providerAddress': '门店地址',
      'providerSpecialties': '主营能力',
      'productCategories': '商品分类',
      'forumBoards': '论坛板块',
      'serviceList': '服务列表',
      'productReviews': '商品评价',
      'providerInvites': '服务商邀请',
      'mallRecommendations': '商城推荐',
      'userAddresses': '用户地址',
      'registerWechat': '微信注册',
      'orderId': '订单ID',
      'fromRole': '发送者角色',
      'fromName': '发送者名称',
      'fromId': '发送者ID',
      'pageViews': '页面浏览量',
      'todayVisits': '今日访客',
      'totalVisits': '总访问量',
      'productCollections': '商品收藏数',
      'postViews': '帖子浏览量',
      'caseViews': '案例浏览量',
      'productSales': '商品销量',
      'salesCount': '销量统计',
      'sales': '销量',
      'sold': '已售',
      'execCommand': '编辑命令',
      'writeText': '文本写入',
      'toString': '字符串转换',
      'toLocaleString': '数字格式化',
      'getItem': '数据读取',
      'javaScript': '脚本',
    };
    if (map[word]) return map[word];
    // 如果是不认识的 camelCase，尝试拆分
    const parts = word.split(/(?=[A-Z])/);
    if (parts.length > 1) {
      return parts.join('');
    }
    return word;
  });

  // ===== 清理残留的技术描述 =====
  content = content.replace(/，当前页面 更新/g, '，当前页面更新');
  content = content.replace(/状态\s+当前页面/g, '当前页面状态');
  content = content.replace(/当前页面\s+更新/g, '当前页面更新');
  content = content.replace(/写入\s+/g, '写入');
  content = content.replace(/示例 数据/g, '示例数据');
  content = content.replace(/初始 示例 数据/g, '初始数据');
  content = content.replace(/预置 示例 数据/g, '预设数据');

  // 清理 HTML data 属性残留
  content = content.replace(/`?name="[^"]*"`?/g, '');
  content = content.replace(/`?type="[^"]*"`?/g, '');
  content = content.replace(/`?button\.dataset\.[^`\s]*`?/g, '按钮数据');

  // 清理多余的空格和标点
  content = content.replace(/  +/g, ' ');
  content = content.replace(/ ，/g, '，');
  content = content.replace(/。 /g, '。');
  content = content.replace(/\n{3,}/g, '\n\n');
  content = content.replace(/（\s*）/g, '');
  content = content.replace(/\(\s*\)/g, '');

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
