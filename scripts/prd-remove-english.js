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

  // === 代码变量/英文标识替换 ===
  // 等号连接的代码值
  content = content.replace(/=business/g, '为营业情况');
  content = content.replace(/=case`/g, '');
  content = content.replace(/=case/g, '');
  content = content.replace(/=personal`/g, '');

  // 配置的xxx
  content = content.replace(/配置的rows/g, '配置的数据');
  content = content.replace(/配置的筛选s/g, '筛选配置');
  content = content.replace(/配置的columns/g, '列配置');
  content = content.replace(/配置的键s/g, '字段配置');
  content = content.replace(/配置的标签s/g, '标签配置');
  content = content.replace(/配置的统计/g, '统计配置');

  // 对象的xxx
  content = content.replace(/订单的quote/g, '订单报价');
  content = content.replace(/商品的promotion/g, '商品促销');
  content = content.replace(/门店的contact/g, '门店联系人');
  content = content.replace(/品牌的sales/g, '品牌销量');

  // 文本area → 文本域
  content = content.replace(/文本area`/g, '文本域');
  content = content.replace(/文本area/g, '文本域');

  // input/变更 → 输入变更
  content = content.replace(/input\/变更/g, '输入变更');
  content = content.replace(/input 事件/g, '输入事件');
  content = content.replace(/input/g, '输入');

  // 按钮-danger → 危险按钮/删除按钮
  content = content.replace(/按钮-danger`/g, '删除按钮');
  content = content.replace(/按钮-danger/g, '删除按钮');
  content = content.replace(/danger/g, '危险');

  // 状态英文
  content = content.replace(/danger/g, '危险');
  content = content.replace(/urgent/g, '紧急');
  content = content.replace(/warning/g, '警告');
  content = content.replace(/success/g, '成功');
  content = content.replace(/info/g, '信息');
  content = content.replace(/pending/g, '待处理');

  // 英文UI术语
  content = content.replace(/Banner/g, '轮播图');
  content = content.replace(/Hero/g, '首屏');
  content = content.replace(/Control Center/g, '控制中心');
  content = content.replace(/Platform Control Center/g, '平台控制中心');
  content = content.replace(/Logo/g, '标识');

  // 其他代码残留
  content = content.replace(/订单列表\(rows, shipped\)/g, '订单列表');
  content = content.replace(/shipped/g, '已发货');
  content = content.replace(/rows/g, '数据');
  content = content.replace(/quote/g, '报价');
  content = content.replace(/promotion/g, '促销');
  content = content.replace(/contact/g, '联系人');
  content = content.replace(/from/g, '来自');
  content = content.replace(/case/g, '案例');
  content = content.replace(/area/g, '区域');
  content = content.replace(/studio/g, '工作室');
  content = content.replace(/performance/g, '性能');

  // 文件格式相关
  content = content.replace(/\.jpg/g, '图片');
  content = content.replace(/\.png/g, '图片');
  content = content.replace(/\.pdf/g, '文档');
  content = content.replace(/\.docx/g, '文档');
  content = content.replace(/\.doc/g, '文档');

  // 清理等号和反引号残留
  content = content.replace(/= /g, '为');
  content = content.replace(/`/g, '');

  // 清理多余空格
  content = content.replace(/  +/g, ' ');
  content = content.replace(/\n{3,}/g, '\n\n');

  if (content !== original) {
    fs.writeFileSync(fp, content, 'utf-8');
    modified++;
    console.log('已修改:', fp);
  }
}

console.log('共修改', modified, '个文件');
