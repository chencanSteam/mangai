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

  // URL参数翻译问题
  content = content.replace(/通过 链接参数 帖子 指定帖子标识，如 \?帖子=[^\n]*/g, '通过链接参数指定帖子标识。');
  content = content.replace(/通过 链接参数 指定帖子标识，如 \?帖子=[^\n]*/g, '通过链接参数指定帖子标识。');
  
  // 帖子-详情-overline
  content = content.replace(/帖子-详情-overline/g, '分类标签');
  
  // 标签页=xxx → 自然中文
  content = content.replace(/用户已切换至 标签页=个人中心 且 子页面为([^。]+)。/g, '用户已切换至「个人中心」标签页，子页面为$1。');
  content = content.replace(/跳转 标签页=消息列表/g, '跳转至「消息列表」标签页');
  content = content.replace(/用户已进入个人中心页面（标签页=个人中心）。/g, '用户已进入个人中心页面。');
  content = content.replace(/用户已进入消息中心页面（标签页=消息列表）。/g, '用户已进入消息中心页面。');
  
  // na个人中心 → 商品名称
  content = content.replace(/na个人中心/g, '商品名称');
  
  // 来自=购物车 → 自然中文
  content = content.replace(/额外携带 来自=购物车 参数/g, '额外携带来源标识「购物车」');
  content = content.replace(/来源为购物车（来自=购物车）/g, '来源为购物车');
  
  // 获取S选中车辆 → 选中车辆
  content = content.replace(/获取S选中车辆/g, '选中车辆');
  
  // 其他 unnatural patterns
  content = content.replace(/链接参数传递：SKU、商品名称、价格、品牌、适配、商城页面、数量/g, '链接参数传递商品信息');
  content = content.replace(/商品的适配 或 链接参数/g, '商品适配信息');
  
  // 清理多余空行
  content = content.replace(/\n{3,}/g, '\n\n');

  if (content !== original) {
    fs.writeFileSync(fp, content, 'utf-8');
    modified++;
    console.log('已修改:', fp);
  }
}

console.log('共修改', modified, '个文件');
