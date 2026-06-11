const fs = require('fs');
const path = require('path');

const PRD_DIR = path.join(__dirname, '..', 'docs', 'prd');

function fixFile(filepath) {
  let content = fs.readFileSync(filepath, 'utf-8');
  const original = content;

  // ===== 函数名（未匹配到的） =====
  const funcMap = {
    'getProviderStore': '门店信息',
    'getProviderAllOrders': '全部订单数据',
    'getProviderPurchaseRecords': '采购记录数据',
    'getProviderCaseRows': '案例数据',
    'getProviderSettlementRows': '结算数据',
    'getProviderPurchasableProducts': '可采购商品',
    'getProviderForumRows': '论坛帖子数据',
    'getUserOrders': '用户订单数据',
    'getUserMallCategoryMeta': '分类信息',
    'getStoreCases': '门店案例',
    'getAdminProviderBusinessStats': '经营统计数据',
    'getNotificationsForRole': '消息通知',
    'markNotificationsRead': '标记已读',
    'getProviderAddresses': '地址信息',
    'getItem': '数据读取',
    'nForum': '论坛状态映射',
    'nAudit': '审核状态映射',
    'nOrder': '订单状态映射',
    'nCaseDisplay': '案例展示状态',
    'nCaseAudit': '案例审核状态',
    'matchAdminOrderStatus': '订单状态匹配',
    'isAdminGoodsOrder': '商品订单判断',
    'isShipped': '发货状态',
    'isStatus': '状态判断',
    'formatTag': '状态标签',
    'filterRows': '筛选功能',
    'toLocaleString': '数字格式化',
    'jumpToPage': '页面跳转',
    'bindDashboardEvents': '事件绑定',
    'bindServiceChatEvents': '事件绑定',
    'openPlatformDetailModal': '详情弹窗',
    'handleProviderProfileSubmit': '资料保存',
    'productSales': '销量统计',
    'orderReceiverInfo': '收件信息',
    'brandOrders': '品牌订单',
    'brandProducts': '品牌商品',
    'execCommand': '编辑命令',
    'writeText': '文本复制',
    'toString': '字符串转换',
    'brandAccounts': '品牌账号',
  };
  for (const [k, v] of Object.entries(funcMap)) {
    const re = new RegExp('`?' + k.replace(/\./g, '\\.') + '`?', 'g');
    content = content.replace(re, v);
  }

  // ===== 基础变量名（带反引号） =====
  const varMap = {
    'vehicles': '车辆列表',
    'posts': '帖子列表',
    'cases': '案例列表',
    'providers': '服务商列表',
    'orders': '订单列表',
    'products': '商品列表',
    'comments': '评论列表',
    'messages': '消息列表',
    'btn': '按钮',
    'tab': '标签页',
    'card': '卡片',
    'toolbar': '工具栏',
    'navigator': '导航栏',
    'panel': '面板',
    'bubble': '气泡',
    'pill': '标签',
    'primary': '主色调',
    'secondary': '次色调',
    'active': '激活状态',
    'warning': '警告状态',
    'success': '成功状态',
    'pending': '待处理状态',
    'audit': '审核状态',
    'status': '状态',
    'me': '个人中心',
    'detail': '详情',
    'chat': '对话',
    'topic': '帖子',
    'time': '时间',
    'id': 'ID',
    'title': '标题',
    'type': '类型',
    'share': '分享',
    'address': '地址',
    'brand': '品牌',
    'store': '门店',
    'provider': '服务商',
    'product': '商品',
    'order': '订单',
    'item': '条目',
    'def': '配置',
    'data': '数据',
    'stats': '统计',
    'specialties': '专长',
    'true': '是',
    'false': '否',
    'user': '用户',
    'admin': '管理员',
    'platform': '平台',
    'content': '内容',
    'name': '名称',
    'phone': '手机号',
    'email': '邮箱',
    'avatar': '头像',
    'image': '图片',
    'video': '视频',
    'file': '文件',
    'text': '文本',
    'link': '链接',
    'url': '链接',
    'sku': 'SKU',
    'price': '价格',
    'amount': '金额',
    'count': '数量',
    'number': '数量',
    'date': '日期',
    'time': '时间',
    'day': '日期',
    'year': '年份',
    'month': '月份',
    'hour': '小时',
    'minute': '分钟',
    'second': '秒',
    'role': '角色',
    'permission': '权限',
    'action': '操作',
    'event': '事件',
    'callback': '回调',
    'error': '错误',
    'result': '结果',
    'response': '响应',
    'request': '请求',
    'params': '参数',
    'query': '查询条件',
    'body': '请求体',
    'header': '请求头',
    'config': '配置',
    'settings': '设置',
    'options': '选项',
    'value': '值',
    'key': '键',
    'index': '索引',
    'length': '数量',
    'size': '大小',
    'width': '宽度',
    'height': '高度',
    'top': '顶部',
    'bottom': '底部',
    'left': '左侧',
    'right': '右侧',
    'center': '居中',
    'start': '开始',
    'end': '结束',
    'prev': '上一个',
    'next': '下一个',
    'first': '第一个',
    'last': '最后一个',
    'current': '当前',
    'selected': '选中',
    'checked': '已选中',
    'disabled': '禁用',
    'readonly': '只读',
    'required': '必填',
    'optional': '选填',
    'default': '默认',
    'placeholder': '占位符',
    'hint': '提示',
    'tip': '提示',
    'label': '标签',
    'icon': '图标',
    'badge': '角标',
    'tag': '标签',
    'flag': '标记',
    'mark': '标记',
    'note': '备注',
    'desc': '描述',
    'description': '描述',
    'summary': '摘要',
    'detail': '详情',
    'info': '信息',
    'msg': '消息',
    'message': '消息',
    'notify': '通知',
    'alert': '警告',
    'confirm': '确认',
    'cancel': '取消',
    'submit': '提交',
    'save': '保存',
    'delete': '删除',
    'remove': '移除',
    'add': '添加',
    'create': '创建',
    'edit': '编辑',
    'update': '更新',
    'modify': '修改',
    'change': '变更',
    'set': '设置',
    'get': '获取',
    'fetch': '获取',
    'load': '加载',
    'reload': '重新加载',
    'refresh': '刷新',
    'reset': '重置',
    'clear': '清空',
    'search': '搜索',
    'filter': '筛选',
    'sort': '排序',
    'group': '分组',
    'page': '分页',
    'pages': '分页',
    'limit': '限制',
    'offset': '偏移量',
    'total': '总计',
    'sum': '合计',
    'avg': '平均',
    'min': '最小',
    'max': '最大',
    'count': '计数',
    'num': '数量',
    'quantity': '数量',
    'stock': '库存',
    'inventory': '库存',
    'cart': '购物车',
    'wishlist': '收藏夹',
    'favorite': '收藏',
    'collect': '收藏',
    'like': '点赞',
    'follow': '关注',
    'subscribe': '订阅',
    'unsubscribe': '取消订阅',
    'block': '屏蔽',
    'unblock': '取消屏蔽',
    'report': '举报',
    'complaint': '投诉',
    'feedback': '反馈',
    'review': '评价',
    'rating': '评分',
    'score': '分数',
    'level': '等级',
    'rank': '排名',
    'grade': '等级',
    'type': '类型',
    'category': '分类',
    'class': '类别',
    'group': '分组',
    'tag': '标签',
    'keyword': '关键词',
    'search': '搜索',
  };
  for (const [k, v] of Object.entries(varMap)) {
    // Match backtick-wrapped versions
    const re = new RegExp('`?' + k + '`?', 'g');
    content = content.replace(re, v);
  }

  // ===== 清理 object.property 残留（如 平台数据.materials的...） =====
  content = content.replace(/([\u4e00-\u9fff]+)\.([a-zA-Z_]+)/g, '$1中的$2');
  content = content.replace(/([\u4e00-\u9fff]+)的([a-zA-Z_]+)\[\]/g, '$1中的$2配置');
  content = content.replace(/([\u4e00-\u9fff]+)的([a-zA-Z_]+)\[\]\.([a-zA-Z_]+)/g, '$1中的$2$3');

  // ===== 清理残留的反引号 =====
  content = content.replace(/`([\u4e00-\u9fff]+)`/g, '$1');
  content = content.replace(/`{2,}/g, '');
  content = content.replace(/`\s*$/gm, '');
  content = content.replace(/^\s*`/gm, '');

  // ===== 清理 HTML/JS 残留 =====
  content = content.replace(/`?from:\s*"[^"]*"`?/g, '');
  content = content.replace(/`?fromName:\s*"[^"]*"`?/g, '');
  content = content.replace(/`?fromId:\s*"[^"]*"`?/g, '');
  content = content.replace(/\/\/\s*.*/g, ''); // 删除行尾注释
  content = content.replace(/`?button\.dataset\.[^`\s]*`?/g, '按钮数据');
  content = content.replace(/`?name="[^"]*"`?/g, '');
  content = content.replace(/`?type="[^"]*"`?/g, '');

  // ===== 代码表达式残留 =====
  content = content.replace(/`?([a-zA-Z_]+)\s*=>\s*([a-zA-Z_]+)\(([a-zA-Z_]+)\)`?/g, '对应筛选');
  content = content.replace(/`?([a-zA-Z_]+)\s*=>\s*!\s*([a-zA-Z_]+)\(([a-zA-Z_]+)\)`?/g, '对应筛选');
  content = content.replace(/`?SF`?\s*\+\s*时间戳/g, '物流单号');

  // ===== 技术术语 =====
  content = content.replace(/当前为演示版本/g, '当前为演示版本');
  content = content.replace(/前端演示版本/g, '演示版本');
  content = content.replace(/数据列表\s+/g, '数据');
  content = content.replace(/临时存储\s+/g, '临时存储');
  content = content.replace(/仅临时保存/g, '仅作临时保存');
  content = content.replace(/实时消息推送/g, '实时通信');

  // ===== 清理多余的空格和标点 =====
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
