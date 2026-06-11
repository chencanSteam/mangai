const fs = require('fs');
const path = require('path');

const PRD_DIR = path.join(__dirname, '..', 'docs', 'prd');

function fixFile(filepath) {
  let content = fs.readFileSync(filepath, 'utf-8');
  const original = content;

  // 1. mock 变量名 / 数据键
  content = content.replace(/`?mockTopicEngage:\$\{topicKey\}`?/g, '帖子互动状态记录');
  content = content.replace(/`?mockTopicDeleted:\$\{topicKey\}`?/g, '帖子删除状态记录');
  content = content.replace(/`?mockTopicReplies:\$\{topicKey\}`?/g, '评论数据记录');
  content = content.replace(/`?mockUserCollections`?/g, '用户收藏数据');
  content = content.replace(/`?mockUserCart`?/g, '购物车数据');
  content = content.replace(/`?mockUserOrders`?/g, '用户订单数据');
  content = content.replace(/`?availableCoupons`?/g, '可用优惠券');
  content = content.replace(/`?allOrders\.length`?/g, '全部订单数量');

  // 2. 函数调用 / 变量名
  content = content.replace(/`?nProvider\(store\.status\)`?/g, '门店营业状态');
  content = content.replace(/`?caseCount`?/g, '案例数量');

  // 3. 技术库名称
  content = content.replace(/Quill、TinyMCE 或 Editor\.js/g, '专业富文本编辑器');
  content = content.replace(/WebGL\/Three\.js/g, '3D 渲染引擎');

  // 4. 硬编码
  content = content.replace(/硬编码示例/g, '预设示例');
  content = content.replace(/硬编码数组/g, '预设数据');
  content = content.replace(/硬编码/g, '预设');

  // 5. 独立页面链接中的 .html（保留页面入口表格中的，只改正文描述中的）
  // user-app.html?tab=forum → 社区首页
  content = content.replace(/`?user-app\.html\?tab=forum`?/g, '社区首页');
  content = content.replace(/`?user-app\.html`?/g, '用户端首页');
  // 其他 .html 引用在正文中改为「独立页面」
  content = content.replace(/（`?user-product-detail\.html`?）/g, '（独立页面）');
  content = content.replace(/（`?user-topic-detail\.html`?）/g, '（独立页面）');
  content = content.replace(/（`?user-case-detail\.html`?）/g, '（独立页面）');
  content = content.replace(/（`?user-news-detail\.html`?）/g, '（独立页面）');
  content = content.replace(/（`?user-topic-create\.html`?）/g, '（独立页面）');
  content = content.replace(/（`?user-order-create\.html`?）/g, '（独立页面）');
  content = content.replace(/（`?provider-topic-detail\.html`?）/g, '（独立页面）');

  // 6. 链接参数中的 .html?id=xxx 等
  content = content.replace(/`?user-product-detail\.html\?id=xxx`?/g, '商品详情独立页面');
  content = content.replace(/`?user-case-detail\.html\?id=xxx`?/g, '案例详情独立页面');
  content = content.replace(/`?user-topic-detail\.html\?topic=xxx`?/g, '帖子详情独立页面');
  content = content.replace(/`?user-order-create\.html`?/g, '订单创建独立页面');
  content = content.replace(/`?user-news-detail\.html`?/g, '资讯详情独立页面');
  content = content.replace(/`?user-topic-create\.html`?/g, '帖子发布独立页面');
  content = content.replace(/`?user-product-detail\.html`?/g, '商品详情独立页面');
  content = content.replace(/`?user-case-detail\.html`?/g, '案例详情独立页面');
  content = content.replace(/`?user-topic-detail\.html`?/g, '帖子详情独立页面');
  content = content.replace(/`?provider-topic-detail\.html`?/g, '帖子详情独立页面');

  // 7. 清理「本地记录」后的 mock 引用
  content = content.replace(/`?本地记录`?\s*:\s*mock/g, '本地记录');

  // 8. 链接 参数 → 链接参数
  content = content.replace(/链接 参数/g, '链接参数');

  // 9. 纯 样式 实现 → 纯样式实现
  content = content.replace(/纯 样式 实现/g, '纯样式实现');

  // 10. 页面入口表格中的 html 文件保留页面名但去掉扩展名
  content = content.replace(/`?user-product-detail\.html`?/g, '商品详情页');
  content = content.replace(/`?user-case-detail\.html`?/g, '案例详情页');
  content = content.replace(/`?user-topic-detail\.html`?/g, '帖子详情页');
  content = content.replace(/`?user-news-detail\.html`?/g, '资讯详情页');
  content = content.replace(/`?user-order-create\.html`?/g, '订单创建页');
  content = content.replace(/`?user-topic-create\.html`?/g, '帖子发布页');
  content = content.replace(/`?provider-topic-detail\.html`?/g, '帖子详情页');
  content = content.replace(/`?tab=forum`?（发帖态）/g, '社区首页发帖状态');
  content = content.replace(/`?tab=forum`?/g, '社区首页');

  // 11. 清理多余空格
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
