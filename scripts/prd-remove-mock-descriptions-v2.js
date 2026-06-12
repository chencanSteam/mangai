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

  // 示例密码/默认值
  content = content.replace(/默认填充示例密码/g, '用户需手动输入密码');
  content = content.replace(/手机号默认填充 ，验证码默认填充 。/g, '手机号与验证码需用户手动输入。');
  content = content.replace(/（示例 场景下为纯 UI，不发真实短信）/g, '（点击后向用户手机发送短信验证码）');
  content = content.replace(/默认示例内容/g, '默认内容');
  content = content.replace(/的示例内容/g, '的内容');
  content = content.replace(/预设示例/g, '预设');
  content = content.replace(/当前页面内容为预设，用于展示[^。]*。/g, '页面内容来源于内容管理系统。');
  content = content.replace(/为前端 示例 实现，不经过真实服务端。/g, '消息经由服务端实时推送。');
  content = content.replace(/支付为 示例 实现，提交订单后默认标记为「已支付」。/g, '支付完成后，订单状态更新为「已支付」。');
  content = content.replace(/金融授信支付方式在 示例 中与普通在线支付等效。/g, '金融授信支付方式与普通在线支付流程一致。');
  content = content.replace(/示例 推荐内容/g, '推荐内容');
  content = content.replace(/示例层面/g, '系统层面');
  content = content.replace(/订单列表 \+ 服务商O订单示例/g, '订单列表');
  
  // 默认展示模式（）空括号
  content = content.replace(/密码登录为默认展示模式（）。/g, '密码登录为默认展示模式。');

  // 清理多余空行
  content = content.replace(/\n{3,}/g, '\n\n');

  if (content !== original) {
    fs.writeFileSync(fp, content, 'utf-8');
    modified++;
    console.log('已修改:', fp);
  }
}

console.log('共修改', modified, '个文件');
