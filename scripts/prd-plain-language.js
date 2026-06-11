const fs = require("fs");
const path = require("path");

const prdDir = path.join(__dirname, "..", "docs", "prd");

function plainify(content, fileName) {
  let text = content;

  // 1. 页面基本信息
  text = text.replace(/\*\*页面路由\/标识\*\*/g, "**页面入口**");
  text = text.replace(/\*\*对应文件\*\*/g, "**对应原型**");

  // 2. 对应文件列：把代码文件路径换成白话
  text = text.replace(/\`assets\/js\/mobile-app\.js\`（[^）]*）/g, "用户端 App 页面原型");
  text = text.replace(/\`assets\/js\/mobile-app\.js\`/g, "用户端 App 页面原型");
  text = text.replace(/\`assets\/js\/platform-web\.js\`（[^）]*）/g, "平台网页端页面原型");
  text = text.replace(/\`assets\/js\/platform-web\.js\`/g, "平台网页端页面原型");
  text = text.replace(/\`assets\/js\/brand-web\.js\`（[^）]*）/g, "品牌网页端页面原型");
  text = text.replace(/\`assets\/js\/brand-web\.js\`/g, "品牌网页端页面原型");
  text = text.replace(/\`assets\/js\/provider-web\.js\`（[^）]*）/g, "服务商网页端页面原型");
  text = text.replace(/\`assets\/js\/provider-web\.js\`/g, "服务商网页端页面原型");
  text = text.replace(/\`pages\/[^`]+\.html\`/g, "独立页面原型");
  text = text.replace(/\`assets\/js\/visitor-stats\.js\`/g, "统计脚本原型");

  // 3. 数据源表格：来源文件列
  text = text.replace(/\`mock-data\.js\`/g, "原型数据");
  text = text.replace(/mock-data\.js/g, "原型数据");
  text = text.replace(/\`mobile-app\.js\`/g, "页面逻辑");
  text = text.replace(/mobile-app\.js/g, "页面逻辑");
  text = text.replace(/\`platform-web\.js\`/g, "页面逻辑");
  text = text.replace(/platform-web\.js/g, "页面逻辑");
  text = text.replace(/\`brand-web\.js\`/g, "页面逻辑");
  text = text.replace(/brand-web\.js/g, "页面逻辑");
  text = text.replace(/\`provider-web\.js\`/g, "页面逻辑");
  text = text.replace(/provider-web\.js/g, "页面逻辑");

  // 4. 数据源表格：来源变量列 — 去掉反引号，改为白话描述
  text = text.replace(/\| \`([a-zA-Z_$][a-zA-Z0-9_$\.]*)\` \| (原型数据|页面逻辑|页面定义) \|/g, "| 业务数据 | $2 |");
  text = text.replace(/\| \`([a-zA-Z_$][a-zA-Z0-9_$\.]*)\` \|/g, "| 业务数据 |");

  // 5. 正文中出现的 renderXxx() 函数名
  text = text.replace(/`render[A-Za-z]+\([^`]*\)`/g, "页面渲染逻辑");
  text = text.replace(/render[A-Za-z]+\(\)/g, "页面渲染逻辑");
  text = text.replace(/render[A-Za-z]+\([^)]*\)/g, "页面渲染逻辑");

  // 6. localStorage
  text = text.replace(/`localStorage`/g, "浏览器本地缓存");
  text = text.replace(/localStorage/g, "浏览器本地缓存");

  // 7. data-xxx 属性
  text = text.replace(/`data-[a-z-]+`/g, "交互属性");
  text = text.replace(/data-[a-z-]+/g, "交互属性");

  // 8. 其他代码片段（单行代码）— 保留有意义的业务名词，替换技术实现
  text = text.replace(/`window\.MockData`/g, "系统数据");
  text = text.replace(/window\.MockData/g, "系统数据");
  text = text.replace(/`window\.MockData\.([a-zA-Z]+)`/g, "系统$1数据");
  text = text.replace(/window\.MockData\.([a-zA-Z]+)/g, "系统$1数据");

  // 9. HTML 标签和属性
  text = text.replace(/`<[a-z]+[^>]*>`/g, "页面元素");
  text = text.replace(/`\[data-[a-z-]+\]`/g, "交互元素");

  // 10. 页面路由/标识值 — 去掉反引号
  text = text.replace(/\|`([a-zA-Z]+)`\|/g, "|$1|");

  // 11. 备注中的技术细节
  text = text.replace(/`state\.[a-zA-Z.]+`/g, "页面状态");
  text = text.replace(/state\.[a-zA-Z.]+/g, "页面状态");
  text = text.replace(/`getMockUserAuth\(\)`/g, "用户认证信息");
  text = text.replace(/getMockUserAuth\(\)/g, "用户认证信息");

  // 12. 其他文件路径
  text = text.replace(/`assets\/css\/[^`]+`/g, "样式文件");
  text = text.replace(/`assets\/js\/[^`]+`/g, "脚本文件");

  // 13. SKU 等字段名反引号去掉
  text = text.replace(/`sku`/g, "SKU");
  text = text.replace(/`id`/g, "编号");
  text = text.replace(/`name`/g, "名称");
  text = text.replace(/`status`/g, "状态");

  // 14. 删除多余的"页面渲染逻辑是..."等描述
  text = text.replace(/页面渲染逻辑在[^。]*。/g, "");
  text = text.replace(/页面渲染逻辑支撑了[^。]*。/g, "");
  text = text.replace(/由页面渲染逻辑[^。]*。/g, "");

  return text;
}

function processDir(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      processDir(fullPath);
    } else if (entry.name.endsWith(".md")) {
      const content = fs.readFileSync(fullPath, "utf-8");
      const newContent = plainify(content, entry.name);
      if (content !== newContent) {
        fs.writeFileSync(fullPath, newContent, "utf-8");
        console.log("Updated:", fullPath.replace(prdDir, ""));
      }
    }
  }
}

processDir(prdDir);
console.log("\nAll markdown PRD files updated.");
