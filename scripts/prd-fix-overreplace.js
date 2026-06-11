const fs = require("fs");
const path = require("path");

const prdDir = path.join(__dirname, "..", "docs", "prd");

// 页面入口的原始值（从 git 恢复）
const pageEntries = {
  "品牌网页端/发货管理.md": "shipped",
  "品牌网页端/商品管理.md": "products",
  "品牌网页端/订单管理.md": "pending",
  "品牌网页端/首页看板.md": "dashboard",
  "平台网页端/表格管理页.md": "多路由复用：providerAudit、orderAssign、caseManage 等",
  "平台网页端/论坛管理.md": "forumManage",
  "平台网页端/访客监控.md": "visitorMonitor",
  "平台网页端-客服对话.md": "serviceChat",
  "平台网页端-工作台.md": "home",
  "服务商端App/个人中心.md": "me",
  "服务商端App/帖子详情.md": "operations（forum 子 tab）",
  "服务商端App/消息中心.md": "messages",
  "服务商端App/经营概览.md": "home",
  "服务商端App/订单管理.md": "orders",
  "服务商端App/运营中心.md": "operations",
  "服务商网页端/入驻申请.md": "join",
  "服务商网页端/案例展示.md": "showcase",
  "服务商网页端/案例管理.md": "cases",
  "用户端App/个人中心.md": "me",
  "用户端App/商品详情.md": "mall（goods / service）",
  "用户端App/商城首页.md": "mall",
  "用户端App/帖子发布.md": "forum → create",
  "用户端App/帖子详情.md": "forum → detail",
  "用户端App/案例详情.md": "forum → caseDetail",
  "用户端App/消息中心.md": "messages",
  "用户端App/爱车管理.md": "garage",
  "用户端App/登录注册.md": "auth",
  "用户端App/社区首页.md": "forum",
  "用户端App/订单创建.md": "mall / service",
  "用户端App/资讯详情.md": "forum → newsDetail",
  "管理员端App/工作台首页.md": "home",
  "管理员端App/服务商管理.md": "providers",
  "管理员端App/订单管理.md": "orders",
  "管理员端App/运营管理.md": "operations",
};

function fixFile(filePath, relPath) {
  let content = fs.readFileSync(filePath, "utf-8");
  const entry = pageEntries[relPath];
  if (entry) {
    content = content.replace(
      /\| \*\*页面入口\*\* \| 业务数据 \|/,
      `| **页面入口** | ${entry} |`
    );
  }

  // 修复其他过度替换
  // 1. 恢复 "对应原型" 列中被误删的描述
  content = content.replace(/\| \*\*对应原型\*\* \| 业务数据 \|/g, "| **对应原型** | 页面原型 |");

  // 2. 数据源中 "业务数据" 如果是跟随在反引号变量后的正常替换，保留
  // 但 "页面类型" 等不应该被替换
  content = content.replace(/\| \*\*页面类型\*\* \| 业务数据 \|/g, "| **页面类型** | 列表/表单 |");

  fs.writeFileSync(filePath, content, "utf-8");
  console.log("Fixed:", relPath);
}

function walk(dir, base = "") {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const rel = base ? `${base}/${entry.name}` : entry.name;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full, rel);
    } else if (entry.name.endsWith(".md")) {
      fixFile(full, rel);
    }
  }
}

walk(prdDir);
console.log("\nDone.");
