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

function cleanLine(line) {
  // Don't modify header lines
  if (/^#{1,6}\s/.test(line.trim())) return line;
  // Don't modify table separator lines
  if (/^\|[-\s|]+\|$/.test(line.trim())) return line;
  // Don't modify the data dictionary header row
  if (/\|\s*数据项\s*\|\s*来源变量\s*\|\s*来源文件\s*\|/.test(line)) return line;

  let cleaned = line;

  // Remove (ID: xxx) and （ID: xxx）
  cleaned = cleaned.replace(/[(（]ID\s*[:：]\s*[a-zA-Z0-9_\u4e00-\u9fff]*[)）]/g, '');

  // Remove backtick-wrapped content (code references)
  cleaned = cleaned.replace(/`[^`\n]*`/g, '');

  // Fix "条目的XXX" artifacts
  cleaned = cleaned.replace(/条目的用户/g, '用户');
  cleaned = cleaned.replace(/条目的service/g, '服务项目');
  cleaned = cleaned.replace(/条目的appoint个人中心nt/g, '预约时间');
  cleaned = cleaned.replace(/条目的上一个iew/g, '最新预览');
  cleaned = cleaned.replace(/条目的ti个人中心line/g, '时间线');
  cleaned = cleaned.replace(/条目的ti个人中心/g, '时间');
  cleaned = cleaned.replace(/条目的sales/g, '销量');
  cleaned = cleaned.replace(/条目的sold/g, '已售');
  cleaned = cleaned.replace(/条目的分类/g, '分类');
  cleaned = cleaned.replace(/条目的标题/g, '标题');
  cleaned = cleaned.replace(/条目的model/g, '车型');
  cleaned = cleaned.replace(/条目的style/g, '风格');
  cleaned = cleaned.replace(/条目的修改类型/g, '修改类型');
  cleaned = cleaned.replace(/条目的cost/g, '费用');
  cleaned = cleaned.replace(/条目的图片P评价/g, '图片预览');
  cleaned = cleaned.replace(/条目的图片/g, '图片');
  cleaned = cleaned.replace(/条目的city/g, '城市');
  cleaned = cleaned.replace(/条目的district/g, '区域');
  cleaned = cleaned.replace(/条目的ratio%/g, '占比');
  cleaned = cleaned.replace(/条目的售后状态/g, '售后状态');
  cleaned = cleaned.replace(/条目的售后类型/g, '售后类型');
  cleaned = cleaned.replace(/条目的售后原因/g, '售后原因');
  cleaned = cleaned.replace(/条目的物流公司/g, '物流公司');
  cleaned = cleaned.replace(/条目的物流单号/g, '物流单号');
  cleaned = cleaned.replace(/条目的消息列表/g, '消息记录');
  cleaned = cleaned.replace(/备用的服务商消息\[\]\.消息列表/g, '服务商消息数据');
  cleaned = cleaned.replace(/服务商Web的门店\.案例列表/g, '服务商门店案例');

  // Fix other broken words
  cleaned = cleaned.replace(/appoint个人中心nt/g, '预约时间');
  cleaned = cleaned.replace(/上一个iew/g, '预览');
  cleaned = cleaned.replace(/ti个人中心line/g, '时间线');
  cleaned = cleaned.replace(/ti个人中心/g, '时间');
  cleaned = cleaned.replace(/图片P评价/g, '图片预览');
  cleaned = cleaned.replace(/获取O订单时间个人中心line/g, '时间线');
  cleaned = cleaned.replace(/O订单时间个人中心line/g, '时间线');
  cleaned = cleaned.replace(/ship个人中心nt/g, '发货记录');
  cleaned = cleaned.replace(/docu个人中心nt/g, '文档');
  cleaned = cleaned.replace(/fit个人中心nt/g, '适配');

  // Fix function name fragments
  cleaned = cleaned.replace(/获取P服务商A待接单/g, '待接单');
  cleaned = cleaned.replace(/获取P服务商C已完成订单/g, '已完成订单');
  cleaned = cleaned.replace(/获取P服务商S服务定价/g, '服务定价');
  cleaned = cleaned.replace(/获取P服务商/g, '获取服务商');
  cleaned = cleaned.replace(/short剪切s/g, '快捷入口');
  cleaned = cleaned.replace(/Top P服务商s/g, '头部服务商');

  // Replace table cell technical terms with "系统"
  // Only in table rows (lines starting with |)
  if (cleaned.trim().startsWith('|')) {
    cleaned = cleaned.replace(/示例数据\s*\/\s*主应用脚本/g, '系统');
    cleaned = cleaned.replace(/示例数据\s*\/\s*页面定义/g, '系统');
    cleaned = cleaned.replace(/示例数据\s*\/\s*页面配置/g, '系统');
    cleaned = cleaned.replace(/示例数据\s*\/\s*页面功能/g, '系统');
    cleaned = cleaned.replace(/示例数据\s*\/\s*用户输入/g, '系统 / 用户');
    cleaned = cleaned.replace(/示例数据\s*\/\s*用户上传/g, '系统 / 用户');
    cleaned = cleaned.replace(/示例数据\s*\+\s*本地存储/g, '系统');
    cleaned = cleaned.replace(/示例数据/g, '系统');
    cleaned = cleaned.replace(/本地记录/g, '系统');
    cleaned = cleaned.replace(/本地存储/g, '系统');
    cleaned = cleaned.replace(/页面功能/g, '系统');
    cleaned = cleaned.replace(/页面定义/g, '系统');
    cleaned = cleaned.replace(/页面配置/g, '系统');
    cleaned = cleaned.replace(/页面逻辑/g, '系统');
    cleaned = cleaned.replace(/页面展示/g, '系统');
    cleaned = cleaned.replace(/主应用脚本/g, '系统');
    cleaned = cleaned.replace(/浏览器本地存储/g, '系统');
  }

  // Clean up extra spaces
  cleaned = cleaned.replace(/  +/g, ' ');

  return cleaned;
}

const files = getAllFiles(PRD_DIR);
let modified = 0;

for (const fp of files) {
  let content = fs.readFileSync(fp, 'utf-8');
  const original = content;

  const lines = content.split(/\r?\n/);
  const filtered = lines.map(line => cleanLine(line));

  // Now delete lines that are entirely technical descriptions
  const result = filtered.map(line => {
    if (/^#{1,6}\s/.test(line.trim())) return line;
    if (/^\|[-\s|]+\|$/.test(line.trim())) return line;
    if (/\|\s*数据项\s*\|\s*来源变量\s*\|\s*来源文件\s*\|/.test(line)) return line;

    const deletePatterns = [
      /示例数据\s*中已定义/,
      /示例数据\s*中已存在/,
      /示例数据\s*中预置/,
      /本地记录\s*中已存在/,
      /本地记录\s*中读取/,
      /本地记录\s*中写入/,
      /本地存储\s*中已存在/,
      /将.*写入\s*本地记录/,
      /将.*写入\s*本地存储/,
      /持久化到\s*本地记录/,
      /持久化到\s*本地存储/,
      /存储在\s*本地记录/,
      /存储在\s*本地存储/,
      /以列表形式存储在/,
      /当前实现为前端静态原型/,
      /前端静态原型/,
      /所有数据仅保存在/,
      /刷新页面后恢复/,
      /恢复为初始/,
      /恢复初始/,
      /预设数据/,
      /初始数据/,
      /浏览器会拦截/,
      /浏览器本地/,
      /仅保存在/,
      /仅修改/,
      /仅作临时/,
      /临时保存/,
      /临时生效/,
      /临时存储/,
      /内存中的/,
      /内存数组/,
      /保存在内存中/,
      /页面展示\s+和\s+页面展示/,
      /页面展示\s+通用函数/,
      /页面展示\s+接收到的/,
      /页面展示\s+为/,
      /结构为\s*\{/,
    ];
    for (const p of deletePatterns) {
      if (p.test(line)) return '';
    }
    return line;
  });

  content = result.join('\n');

  // Clean up empty lines
  content = content.replace(/\n{3,}/g, '\n\n');
  content = content.replace(/^\s*$/gm, '');
  content = content.replace(/\n{3,}/g, '\n\n');

  if (content !== original) {
    fs.writeFileSync(fp, content, 'utf-8');
    modified++;
    console.log('已修改:', fp);
  }
}

console.log('共修改', modified, '个文件');
