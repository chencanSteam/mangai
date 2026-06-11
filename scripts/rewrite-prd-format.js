const fs = require('fs');
const path = require('path');

const PRD_DIR = path.join(__dirname, '..', 'docs', 'prd');

function parseMd(mdPath) {
  const content = fs.readFileSync(mdPath, 'utf-8');
  const titleMatch = content.match(/^#\s+(.+)$/m);
  const title = titleMatch ? titleMatch[1].trim() : '未命名';

  const sections = {};
  let currentSec = null;
  for (const line of content.split(/\r?\n/)) {
    const m1 = line.match(/^##\s+\d+\.\s+(.+)$/);
    if (m1) {
      currentSec = m1[1].trim();
      sections[currentSec] = [];
      continue;
    }
    const m2 = line.match(/^###\s+\d+\.\d+\s+(.+)$/);
    if (m2) {
      currentSec = m2[1].trim();
      sections[currentSec] = [];
      continue;
    }
    if (currentSec !== null) {
      sections[currentSec].push(line);
    }
  }
  for (const sec in sections) {
    sections[sec] = sections[sec].join('\n').trim();
  }
  return { title, sections, raw: content };
}

function extractTable(text) {
  const rows = [];
  for (const line of text.split(/\r?\n/)) {
    if (line.trim().startsWith('|')) {
      const parts = line.split('|').slice(1, -1).map(p => p.trim());
      if (!parts.every(p => /^[-:]+$/.test(p))) {
        rows.push(parts);
      }
    }
  }
  return rows;
}

function extractBullets(text) {
  const items = [];
  for (const line of text.split(/\r?\n/)) {
    const m = line.trim().match(/^-\s+(.+)$/);
    if (m) items.push(m[1]);
  }
  return items;
}

function extractDetailSections(raw) {
  const sections = [];
  const normalized = raw.replace(/\r\n/g, '\n');
  const re = /###\s+\d+\.\d+\s+(.+?)\n([\s\S]*?)(?=###\s+\d+\.\d+|##\s+\d+\.|$)/g;
  let m;
  while ((m = re.exec(normalized)) !== null) {
    sections.push([m[1].trim(), m[2].trim()]);
  }
  return sections;
}

function extractLabelContent(subContent, label) {
  const normalized = subContent.replace(/\r\n/g, '\n');
  // 匹配 **label** 后跟换行，捕获到下一个 ** 或章节结束
  const pattern = `\\*\\*${label}\\*\\*\\n([\\s\\S]*?)(?=\\n\\*\\*|$)`;
  const re = new RegExp(pattern);
  const mm = normalized.match(re);
  if (mm) {
    return mm[1].trim();
  }
  return null;
}

function cleanText(text) {
  if (!text) return '';
  return text.replace(/\r/g, '').replace(/\s*---+\s*$/, '').trim();
}

function buildPrd(title, sections, raw) {
  const overview = cleanText(sections['页面概述'] || '');
  const desc = cleanText(sections['功能描述'] || '');
  const analysis = sections['功能分析'] || '';
  const rolesText = sections['用户角色'] || '';
  const dsText = sections['数据源'] || '';
  const detailSections = extractDetailSections(raw);
  const dsRows = extractTable(dsText);
  const roles = extractTable(rolesText);

  const parts = [];

  // 封面标题
  parts.push(`# ${title}`);
  parts.push('');

  // 文档属性
  parts.push('## 文档属性');
  parts.push('');
  parts.push('| 项目 | 内容 |');
  parts.push('|------|------|');
  parts.push('| 文件状态 | [√] 发布 |');
  parts.push('| 当前版本 | V1.0.0 |');
  parts.push('| 归属项目 | 满改汽车改装平台 |');
  parts.push('| 编写人 | |');
  parts.push('| 编写日期 | 2026.06.10 |');
  parts.push('| 文档密级 | 机密 |');
  parts.push('');

  // 版本历史
  parts.push('## 版本历史');
  parts.push('');
  parts.push('| 版本 | 日期 | 修订人 | 修订说明 |');
  parts.push('|------|------|--------|----------|');
  parts.push('| V1.0.0 | 2026.06.10 | | 初稿发布 |');
  parts.push('');
  parts.push('---');
  parts.push('');

  // 一、引言
  parts.push('## 一、引言');
  parts.push('');

  parts.push('### 1、编写目的');
  parts.push('');
  if (overview) {
    parts.push(overview);
  } else {
    parts.push(`本文编写的目的是提供一个开发系统的用户需求目标，并对所实现的 ${title} 业务功能做全面的需求描述，作为系统设计和实现的目标及验收依据。`);
  }
  parts.push('');

  parts.push('### 2、背景');
  parts.push('');
  parts.push('满改平台是一个高端汽车改装服务系统，涵盖用户端 App、服务商端 App、平台网页端、品牌网页端和管理员端 App。');
  parts.push('');

  parts.push('### 3、定义');
  parts.push('');
  parts.push('#### 3.1 术语');
  parts.push('');
  parts.push('PRD：产品需求文档（Product Requirements Document）。');
  parts.push('PV：页面浏览量（Page View）。');
  parts.push('');
  parts.push('#### 3.2 缩略语');
  parts.push('');
  parts.push('App：应用程序（Application）。');
  parts.push('SKU：库存量单位（Stock Keeping Unit）。');
  parts.push('');

  parts.push('### 4、参考资料');
  parts.push('');
  parts.push('《满改平台App原型优化修改任务清单》');
  parts.push('《用户、服务商端App原型优化修改意见》');
  parts.push('');
  parts.push('---');
  parts.push('');

  // 二、任务概述
  parts.push('## 二、任务概述');
  parts.push('');

  parts.push('### 1、产品定位');
  parts.push('');
  parts.push('满改平台是面向高端汽车改装领域的综合服务平台，连接车主用户、改装服务商和品牌供应商，提供从内容种草、方案咨询、商品采购到施工履约的一站式改装服务。');
  parts.push('');

  parts.push('### 2、产品目标');
  parts.push('');
  parts.push('通过平台化运营，提升改装行业的服务标准化水平和交易透明度，降低用户决策成本，帮助服务商拓展客源，实现多方共赢。');
  parts.push('');

  parts.push('### 3、目标用户与使用场景');
  parts.push('');
  parts.push('目标用户包括：有改装需求的车主、提供改装服务的服务商门店、管理平台的运营人员、品牌供应商。');
  parts.push('');

  parts.push('### 4、用户的特点');
  parts.push('');
  parts.push('车主用户注重改装品质与安全性，决策周期较长，需要案例参考和专业建议。服务商关注订单获取效率与结算周期。');
  parts.push('');

  parts.push('### 5、岗位与角色');
  parts.push('');
  if (roles.length > 1) {
    const header = roles[0];
    const sep = '| ' + header.map(() => '------').join(' | ') + ' |';
    parts.push('| ' + header.join(' | ') + ' |');
    parts.push(sep);
    for (let i = 1; i < roles.length; i++) {
      parts.push('| ' + roles[i].join(' | ') + ' |');
    }
  } else {
    parts.push('| 角色/岗位名称 | 职责 | 权限 | 描述 |');
    parts.push('|------|------|------|------|');
    parts.push('| 普通用户 | 浏览与交易 | 全部功能 | 已登录用户 |');
    parts.push('| 游客 | 浏览 | 部分功能受限 | 未登录用户 |');
  }
  parts.push('');

  parts.push('### 6、假定和约束');
  parts.push('');
  parts.push('当前实现为前端静态原型，所有数据仅保存在示例数据中，刷新页面后恢复初始数据。');
  parts.push('');
  parts.push('---');
  parts.push('');

  // 三、产品结构
  parts.push('## 三、产品结构');
  parts.push('');
  parts.push('（按需绘制产品架构图、功能结构图、信息结构图）');
  parts.push('');
  parts.push('---');
  parts.push('');

  // 四、全局说明
  parts.push('## 四、全局说明');
  parts.push('');
  parts.push('### 1、全局交互规范');
  parts.push('');
  parts.push('列表加载中/列表没有更多数据/消息没有更多数据：页面底部展示对应提示文案。');
  parts.push('弱网加载/请求或加载超时：提示网络异常，支持重试。');
  parts.push('列表没有数据：展示空状态插图与提示文案。');
  parts.push('');
  parts.push('---');
  parts.push('');

  // 五、功能需求
  parts.push('## 五、功能需求');
  parts.push('');

  parts.push('### 1、功能描述');
  parts.push('');
  if (desc) {
    parts.push(desc);
  } else {
    parts.push(`${title} 的核心功能概述。`);
  }
  parts.push('');

  parts.push('### 2、功能分析');
  parts.push('');
  const bullets = extractBullets(analysis);
  if (bullets.length > 0) {
    for (const b of bullets) {
      parts.push(`· ${b}`);
    }
  } else {
    parts.push('（功能点分析待补充）');
  }
  parts.push('');

  parts.push('### 3、用户角色');
  parts.push('');
  if (roles.length > 1) {
    const header = roles[0];
    const sep = '| ' + header.map(() => '------').join(' | ') + ' |';
    parts.push('| ' + header.join(' | ') + ' |');
    parts.push(sep);
    for (let i = 1; i < roles.length; i++) {
      parts.push('| ' + roles[i].join(' | ') + ' |');
    }
  } else {
    parts.push('| 角色/岗位名称 | 职责 | 权限 | 描述 |');
    parts.push('|------|------|------|------|');
    parts.push('| 普通用户 | 浏览与交易 | 全部功能 | 已登录用户 |');
  }
  parts.push('');

  parts.push('### 4、数据字典');
  parts.push('');
  if (dsRows.length > 1) {
    const header = dsRows[0];
    const sep = '| ' + header.map(() => '------').join(' | ') + ' |';
    parts.push('| ' + header.join(' | ') + ' |');
    parts.push(sep);
    for (let i = 1; i < dsRows.length; i++) {
      parts.push('| ' + dsRows[i].join(' | ') + ' |');
    }
  } else {
    parts.push('（数据字典待补充）');
  }
  parts.push('');

  parts.push('### 5、功能详细说明');
  parts.push('');

  for (let idx = 0; idx < detailSections.length; idx++) {
    const [subTitle, subContent] = detailSections[idx];
    parts.push(`#### 5.${idx + 1} ${subTitle}`);
    parts.push('');

    const labels = ['用户场景', '前置条件', '需求描述', '后置条件', '补充说明'];
    let hasAny = false;
    for (const label of labels) {
      const text = extractLabelContent(subContent, label);
      if (text) {
        hasAny = true;
        parts.push(`**${label}**`);
        parts.push('');
        parts.push(text);
        parts.push('');
      }
    }
    if (!hasAny) {
      parts.push('（待补充）');
      parts.push('');
    }
  }

  if (detailSections.length === 0) {
    parts.push('（功能详细说明待补充）');
  }

  return parts.join('\n') + '\n';
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
  const { title, sections, raw } = parseMd(filepath);
  const newContent = buildPrd(title, sections, raw);
  fs.writeFileSync(filepath, newContent, 'utf-8');
  modified++;
  console.log(`已重写: ${filepath}`);
}
console.log(`\n共重写 ${modified}/${files.length} 个文件`);
