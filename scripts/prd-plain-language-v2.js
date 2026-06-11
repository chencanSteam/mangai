const fs = require("fs");
const path = require("path");

const prdDir = path.join(__dirname, "..", "docs", "prd");

function plainify(content) {
  let text = content;

  // === 1. 页面基本信息表头 ===
  text = text.replace(/\*\*页面路由\/标识\*\*/g, "**页面入口**");
  text = text.replace(/\*\*对应文件\*\*/g, "**对应原型**");

  // === 2. "对应原型"列的值：精确替换代码文件路径描述 ===
  // 匹配 | **对应原型** | `assets/js/xxx.js`（`renderXxx()` 函数） |
  text = text.replace(
    /\| \*\*对应原型\*\* \| `assets\/js\/mobile-app\.js`（[^|）]*） \|/g,
    "| **对应原型** | 用户端 App 页面原型 |"
  );
  text = text.replace(
    /\| \*\*对应原型\*\* \| `assets\/js\/platform-web\.js`（[^|）]*） \|/g,
    "| **对应原型** | 平台网页端页面原型 |"
  );
  text = text.replace(
    /\| \*\*对应原型\*\* \| `assets\/js\/brand-web\.js`（[^|）]*） \|/g,
    "| **对应原型** | 品牌网页端页面原型 |"
  );
  text = text.replace(
    /\| \*\*对应原型\*\* \| `assets\/js\/provider-web\.js`（[^|）]*） \|/g,
    "| **对应原型** | 服务商网页端页面原型 |"
  );
  text = text.replace(
    /\| \*\*对应原型\*\* \| `assets\/js\/visitor-stats\.js` \|/g,
    "| **对应原型** | 统计脚本原型 |"
  );
  text = text.replace(
    /\| \*\*对应原型\*\* \| `pages\/[^|]*` \|/g,
    "| **对应原型** | 独立页面原型 |"
  );

  // === 3. 数据源表格 ===
  // 来源文件列
  text = text.replace(/\| `mock-data\.js` \|/g, "| 原型数据 |");
  text = text.replace(/\| `mobile-app\.js` \|/g, "| 页面逻辑 |");
  text = text.replace(/\| `platform-web\.js` \|/g, "| 页面逻辑 |");
  text = text.replace(/\| `brand-web\.js` \|/g, "| 页面逻辑 |");
  text = text.replace(/\| `provider-web\.js` \|/g, "| 页面逻辑 |");
  text = text.replace(/\| `页面定义` \|/g, "| 页面逻辑 |");

  // 来源变量列：只替换在 "原型数据|页面逻辑" 前面的反引号变量
  text = text.replace(
    /\| `([a-zA-Z_$][a-zA-Z0-9_$\.]*)` \| (原型数据|页面逻辑) \|/g,
    "| 业务数据 | $2 |"
  );

  // === 4. 正文中的技术术语 ===
  // renderXxx() 函数名
  text = text.replace(/`render[A-Za-z]+\(\)`/g, "`页面渲染`");
  text = text.replace(/render[A-Za-z]+\(\)/g, "页面渲染");

  // mock-data.js
  text = text.replace(/`mock-data\.js`/g, "`原型数据`");
  text = text.replace(/mock-data\.js/g, "原型数据");

  // localStorage
  text = text.replace(/`localStorage`/g, "`浏览器本地缓存`");
  text = text.replace(/localStorage/g, "浏览器本地缓存");

  // data-xxx 属性（反引号包裹的）
  text = text.replace(/`data-[a-z-]+`/g, "`交互属性`");

  // window.MockData
  text = text.replace(/`window\.MockData`/g, "`系统数据`");
  text = text.replace(/window\.MockData/g, "系统数据");

  // state.xxx
  text = text.replace(/`state\.[a-zA-Z.]+`/g, "`页面状态`");

  // getMockUserAuth()
  text = text.replace(/`getMockUserAuth\(\)`/g, "`用户认证信息`");
  text = text.replace(/getMockUserAuth\(\)/g, "用户认证信息");

  // 文件路径
  text = text.replace(/`assets\/css\/[^`]+`/g, "`样式文件`");
  text = text.replace(/`assets\/js\/[^`]+`/g, "`脚本文件`");

  // HTML 标签
  text = text.replace(/`<[a-z]+[^>]*>`/g, "`页面元素`");
  text = text.replace(/`\[data-[a-z-]+\]`/g, "`交互元素`");

  return text;
}

function processDir(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      processDir(fullPath);
    } else if (entry.name.endsWith(".md")) {
      const content = fs.readFileSync(fullPath, "utf-8");
      const newContent = plainify(content);
      if (content !== newContent) {
        fs.writeFileSync(fullPath, newContent, "utf-8");
        console.log("Updated:", fullPath.replace(prdDir, ""));
      }
    }
  }
}

processDir(prdDir);
console.log("\nAll markdown PRD files updated.");
