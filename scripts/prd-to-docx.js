const fs = require('fs');
const path = require('path');
const docx = require('docx');

const {
  Document, Packer, Paragraph, TextRun, Table, TableCell, TableRow,
  WidthType, AlignmentType, HeadingLevel, BorderStyle, convertInchesToTwip
} = docx;

const PRD_DIR = path.join(__dirname, '..', 'docs', 'prd');
const OUT_DIR = path.join(__dirname, '..', 'docs', 'prd-docx-v2');

// 宋体
const SONG = '宋体';
const HEI = '黑体';

function createCell(text, bold = false, center = false) {
  return new TableCell({
    children: [new Paragraph({
      children: [new TextRun({ text: String(text), bold, font: SONG, size: 21 })],
      alignment: center ? AlignmentType.CENTER : AlignmentType.LEFT,
    })],
    verticalAlign: 'center',
  });
}

function createTable(headers, rows) {
  const headerRow = new TableRow({
    children: headers.map(h => createCell(h, true, true)),
    tableHeader: true,
  });
  const dataRows = rows.map(row =>
    new TableRow({
      children: row.map(cell => createCell(cell, false, false)),
    })
  );
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [headerRow, ...dataRows],
    borders: {
      top: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
      bottom: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
      left: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
      right: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
      insideVertical: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
    },
  });
}

function createHeading(text, level = 1) {
  const sizes = { 1: 32, 2: 28, 3: 24 };
  return new Paragraph({
    children: [new TextRun({ text, bold: true, font: SONG, size: sizes[level] || 21 })],
    spacing: { before: 200, after: 100 },
  });
}

function createParagraph(text, indent = true) {
  return new Paragraph({
    children: [new TextRun({ text, font: SONG, size: 21 })],
    indent: indent ? { firstLine: convertInchesToTwip(0.3) } : undefined,
    spacing: { line: 360, after: 60 },
  });
}

function createBoldLabelParagraph(label, text) {
  return new Paragraph({
    children: [
      new TextRun({ text: `${label}：`, bold: true, font: SONG, size: 21 }),
      new TextRun({ text, font: SONG, size: 21 }),
    ],
    indent: { firstLine: convertInchesToTwip(0.3) },
    spacing: { line: 360, after: 60 },
  });
}

function parseMd(mdPath) {
  const content = fs.readFileSync(mdPath, 'utf-8');
  const titleMatch = content.match(/^#\s+(.+)$/m);
  const title = titleMatch ? titleMatch[1].trim() : '未命名';

  const sections = {};
  let currentSec = null;
  for (const line of content.split('\n')) {
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
  for (const line of text.split('\n')) {
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
  for (const line of text.split('\n')) {
    const m = line.trim().match(/^-\s+(.+)$/);
    if (m) items.push(m[1]);
  }
  return items;
}

async function buildDocx(title, sections, raw, outPath) {
  const children = [];

  // 封面标题
  children.push(new Paragraph({
    children: [new TextRun({ text: title, bold: true, font: HEI, size: 44 })],
    alignment: AlignmentType.CENTER,
    spacing: { after: 400 },
  }));
  children.push(new Paragraph({ text: '' }));

  // 文档属性
  children.push(createHeading('文档属性', 2));
  children.push(createTable(
    ['项目', '内容'],
    [
      ['文件状态', '[√] 发布'],
      ['当前版本', 'V1.0.0'],
      ['归属项目', '满改汽车改装平台'],
      ['编写人', ''],
      ['编写日期', '2026.06.10'],
      ['文档密级', '机密'],
    ]
  ));
  children.push(new Paragraph({ text: '' }));

  // 版本历史
  children.push(createHeading('版本历史', 2));
  children.push(createTable(
    ['版本', '日期', '修订人', '修订说明'],
    [['V1.0.0', '2026.06.10', '', '初稿发布']]
  ));
  children.push(new Paragraph({ children: [new TextRun({ text: '', break: 1 })] }));

  // 一、引言
  children.push(createHeading('一、引言', 1));

  children.push(createHeading('1、编写目的', 2));
  const overview = sections['页面概述'] || '';
  if (overview) {
    children.push(createParagraph(overview.replace(/\n/g, ' ')));
  } else {
    children.push(createParagraph(`本文编写的目的是提供一个开发系统的用户需求目标，并对所实现的 ${title} 业务功能做全面的需求描述，作为系统设计和实现的目标及验收依据。`));
  }

  children.push(createHeading('2、背景', 2));
  children.push(createParagraph('满改平台是一个高端汽车改装服务系统，涵盖用户端 App、服务商端 App、平台网页端、品牌网页端和管理员端 App。'));

  children.push(createHeading('3、定义', 2));
  children.push(createHeading('3.1 术语', 3));
  children.push(createParagraph('PRD：产品需求文档（Product Requirements Document）。'));
  children.push(createParagraph('PV：页面浏览量（Page View）。'));
  children.push(createHeading('3.2 缩略语', 3));
  children.push(createParagraph('App：应用程序（Application）。'));
  children.push(createParagraph('SKU：库存量单位（Stock Keeping Unit）。'));

  children.push(createHeading('4、参考资料', 2));
  children.push(createParagraph('《满改平台App原型优化修改任务清单》'));
  children.push(createParagraph('《用户、服务商端App原型优化修改意见》'));

  // 二、任务概述
  children.push(createHeading('二、任务概述', 1));

  children.push(createHeading('1、产品定位', 2));
  children.push(createParagraph('满改平台是面向高端汽车改装领域的综合服务平台，连接车主用户、改装服务商和品牌供应商，提供从内容种草、方案咨询、商品采购到施工履约的一站式改装服务。'));

  children.push(createHeading('2、产品目标', 2));
  children.push(createParagraph('通过平台化运营，提升改装行业的服务标准化水平和交易透明度，降低用户决策成本，帮助服务商拓展客源，实现多方共赢。'));

  children.push(createHeading('3、目标用户与使用场景', 2));
  children.push(createParagraph('目标用户包括：有改装需求的车主、提供改装服务的服务商门店、管理平台的运营人员、品牌供应商。'));

  children.push(createHeading('4、用户的特点', 2));
  children.push(createParagraph('车主用户注重改装品质与安全性，决策周期较长，需要案例参考和专业建议。服务商关注订单获取效率与结算周期。'));

  children.push(createHeading('5、岗位与角色', 2));
  const roles = extractTable(sections['用户角色'] || '');
  if (roles.length > 1) {
    children.push(createTable(roles[0], roles.slice(1)));
  } else {
    children.push(createTable(
      ['角色/岗位名称', '职责', '权限', '描述'],
      [
        ['普通用户', '浏览与交易', '全部功能', '已登录用户'],
        ['游客', '浏览', '部分功能受限', '未登录用户'],
      ]
    ));
  }

  children.push(createHeading('6、假定和约束', 2));
  children.push(createParagraph('当前实现为前端静态原型，所有数据仅保存在示例数据中，刷新页面后恢复初始数据。'));

  // 三、产品结构
  children.push(createHeading('三、产品结构', 1));
  children.push(createParagraph('（按需绘制产品架构图、功能结构图、信息结构图）'));

  // 四、全局说明
  children.push(createHeading('四、全局说明', 1));
  children.push(createHeading('1、全局交互规范', 2));
  children.push(createParagraph('列表加载中/列表没有更多数据/消息没有更多数据：页面底部展示对应提示文案。'));
  children.push(createParagraph('弱网加载/请求或加载超时：提示网络异常，支持重试。'));
  children.push(createParagraph('列表没有数据：展示空状态插图与提示文案。'));

  // 五、功能需求
  children.push(createHeading('五、功能需求', 1));

  children.push(createHeading('1、功能描述', 2));
  const desc = sections['功能描述'] || '';
  if (desc) {
    children.push(createParagraph(desc.replace(/\n/g, ' ')));
  } else {
    children.push(createParagraph(`${title} 的核心功能概述。`));
  }

  children.push(createHeading('2、功能分析', 2));
  const bullets = extractBullets(sections['功能分析'] || '');
  if (bullets.length > 0) {
    for (const b of bullets) {
      children.push(createParagraph(`· ${b}`));
    }
  } else {
    children.push(createParagraph('（功能点分析待补充）'));
  }

  children.push(createHeading('3、用户角色', 2));
  const roleText = sections['用户角色'] || '';
  if (roleText) {
    const roleRows = extractTable(roleText);
    if (roleRows.length > 1) {
      children.push(createTable(roleRows[0], roleRows.slice(1)));
    } else {
      children.push(createParagraph(roleText));
    }
  } else {
    children.push(createTable(
      ['角色/岗位名称', '职责', '权限', '描述'],
      [['普通用户', '浏览与交易', '全部功能', '已登录用户']]
    ));
  }

  children.push(createHeading('4、数据字典', 2));
  const dsText = sections['数据源'] || '';
  if (dsText) {
    const ds = extractTable(dsText);
    if (ds.length > 1) {
      children.push(createTable(ds[0], ds.slice(1)));
    } else {
      children.push(createParagraph('（数据字典待补充）'));
    }
  } else {
    children.push(createParagraph('（数据字典待补充）'));
  }

  children.push(createHeading('5、功能详细说明', 2));

  // 提取所有 6.x 子章节
  let detailSections = [];
  const re1 = /###\s+\d+\.\d+\s+(.+?)\n(.*?)(?=###\s+\d+\.\d+|##\s+\d+\.|$)/gs;
  let m;
  while ((m = re1.exec(raw)) !== null) {
    detailSections.push([m[1].trim(), m[2].trim()]);
  }
  if (detailSections.length === 0) {
    const re2 = /###\s+(.+?)\n(.*?)(?=###\s+|##\s+\d+\.|$)/gs;
    while ((m = re2.exec(raw)) !== null) {
      detailSections.push([m[1].trim(), m[2].trim()]);
    }
  }

  for (let idx = 0; idx < detailSections.length; idx++) {
    const [subTitle, subContent] = detailSections[idx];
    children.push(createHeading(`5.${idx + 1} ${subTitle}`, 3));

    const labels = ['用户场景', '前置条件', '需求描述', '后置条件', '补充说明'];
    for (const label of labels) {
      const re = new RegExp(`\\*\\*${label}\\*\\*\\n(.*?)\\n(?=\\*\\*|\\\\Z|$)`, 's');
      const mm = subContent.match(re);
      if (mm) {
        const text = mm[1].trim().replace(/\n/g, ' ');
        children.push(createBoldLabelParagraph(label, text));
      } else {
        // 尝试无 ** 包裹
        const re2 = new RegExp(`${label}\\n(.*?)\\n(?=用户场景|前置条件|需求描述|后置条件|补充说明|\\\\Z|$)`, 's');
        const mm2 = subContent.match(re2);
        if (mm2) {
          const text = mm2[1].trim().replace(/\n/g, ' ');
          children.push(createBoldLabelParagraph(label, text));
        }
      }
    }
  }

  if (detailSections.length === 0) {
    children.push(createParagraph('（功能详细说明待补充）'));
  }

  const document = new Document({
    sections: [{
      properties: {},
      children,
    }],
    styles: {
      default: {
        document: {
          run: { font: SONG, size: 21 },
        },
      },
    },
  });

  const buffer = await Packer.toBuffer(document);
  fs.writeFileSync(outPath, buffer);
  console.log(`Created: ${outPath}`);
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const entries = fs.readdirSync(PRD_DIR, { withFileTypes: true });

  // Process root-level .md files
  for (const entry of entries) {
    if (entry.isDirectory()) continue;
    if (!entry.name.endsWith('.md')) continue;
    const mdPath = path.join(PRD_DIR, entry.name);
    const outPath = path.join(OUT_DIR, entry.name.replace('.md', '.docx'));
    const { title, sections, raw } = parseMd(mdPath);
    await buildDocx(title, sections, raw, outPath);
  }

  // Process subdirectories
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const subDir = path.join(PRD_DIR, entry.name);
    const outSub = path.join(OUT_DIR, entry.name);
    fs.mkdirSync(outSub, { recursive: true });

    const files = fs.readdirSync(subDir);
    for (const file of files) {
      if (!file.endsWith('.md')) continue;
      const mdPath = path.join(subDir, file);
      const outPath = path.join(outSub, file.replace('.md', '.docx'));
      const { title, sections, raw } = parseMd(mdPath);
      await buildDocx(title, sections, raw, outPath);
    }
  }

  console.log('\nAll done.');
}

main().catch(console.error);
