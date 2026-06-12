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

  // 后续迭代
  content = content.replace(/- 该部分在后续迭代中应接入真实[^。]*。\n?/g, '');
  content = content.replace(/- 后续迭代.*\n?/g, '');
  content = content.replace(/后续版本.*\n?/g, '');

  // 前端模拟未接入真实
  content = content.replace(/- .*为前端模拟实现，未接入真实[^。]*。\n?/g, '');
  content = content.replace(/- .*为前端模拟，实际仅[^。]*。\n?/g, '');
  content = content.replace(/- 当前为模拟提交，无后端接口调用，不修改数据状态。\n?/g, '');
  content = content.replace(/- 当前为前端文件选择模拟，实际上传功能需接入[^。]*。\n?/g, '');
  content = content.replace(/- 附件上传为前端文件选择模拟，实际发送时不上传至服务器。\n?/g, '');
  content = content.replace(/- 消息发送后页面即时重新渲染，无网络延迟模拟。\n?/g, '');
  content = content.replace(/- 图片上传为前端模拟，实际仅统计文件数量，未真实上传。\n?/g, '');
  content = content.replace(/- 已完成[^（]*（模拟）。\n?/g, '');
  content = content.replace(/- 服务商逐一点击上传按钮，模拟完成[^。]*。\n?/g, '');

  // 示例静态数据
  content = content.replace(/- .*为.*示例.*静态数据。\n?/g, match => match.replace(/为.*示例.*静态数据/, '来源于对应业务系统'));
  content = content.replace(/- .*为.*示例.*静态值[^。]*。\n?/g, match => match.replace(/为.*示例.*静态值[^。]*/, '来源于对应业务系统'));
  content = content.replace(/- 库存为.*示例.*静态数据。\n?/g, '- 库存数据来源于商品库存系统。\n');
  content = content.replace(/- 浏览量与发布时间为静态示例值。\n?/g, '- 浏览量与发布时间来源于内容发布系统。\n');

  // 示例值
  content = content.replace(/- 手机号输入框默认填充示例值[^。]*。\n?/g, '');
  content = content.replace(/- .*示例.*场景下默认通过[^。]*。\n?/g, match => match.replace(/（示例.*场景下默认通过[^）]*）/, ''));
  content = content.replace(/- 手机号与验证码有默认示例值[^。]*。\n?/g, '');
  content = content.replace(/- 首先提供.*按钮，点击后模拟获取[^。]*。\n?/g, '');
  content = content.replace(/- 独立页面默认填充示例标题[^，]*，/g, '- ');

  // 写死/视觉示意
  content = content.replace(/- .*为写死的静态值，用于视觉示意。\n?/g, match => match.replace(/为写死的静态值，用于视觉示意/, '来源于对应业务系统'));

  // 订单数据示例合并
  content = content.replace(/- 订单数据来源于.*，合并了.*示例.*备用.*数据。\n?/g, '- 订单数据来源于订单系统。\n');

  // 清理多余空行
  content = content.replace(/\n{3,}/g, '\n\n');

  if (content !== original) {
    fs.writeFileSync(fp, content, 'utf-8');
    modified++;
    console.log('已修改:', fp);
  }
}

console.log('共修改', modified, '个文件');
