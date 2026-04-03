(function () {
  const appType = document.body.dataset.mobileApp;
  if (!appType) return;

  const screenEl = document.getElementById("mobileApp");
  const { providers, orders, products, settlements, cases, posts, comments, vehicles, services } = window.MockData;

  const appConfigs = {
    admin: { title: "平台管理端", tabs: ["home", "providers", "orders", "operations", "me"], labels: { home: "首页", providers: "服务商", orders: "订单", operations: "运营", me: "我的" } },
    provider: { title: "服务商端", tabs: ["home", "orders", "products", "operations", "me"], labels: { home: "首页", orders: "订单", products: "商品", operations: "运营", me: "我的" } },
    user: { title: "用户端", tabs: ["home", "mall", "garage", "forum", "me"], labels: { home: "首页", mall: "商城", garage: "爱车", forum: "论坛", me: "我的" } },
  };

  const state = {
    tab: appConfigs[appType].tabs[0],
    subTab: {},
    garageColor: 0,
    garageWheel: 0,
    adminSelected: {
      providers: providers[0]?.id || "",
      orders: orders[0]?.id || "",
      cases: cases[0]?.id || "",
      forum: posts[0]?.id || "",
    },
    adminSettings: {
      autoAccept: true,
      messageTpl: true,
      forumAlert: true,
    },
  };

  const fallback = {
    adminMessages: [
      { title: "3 家服务商待审核", note: "上海 / 深圳 / 成都", time: "刚刚", detail: "有 1 家门店营业执照与门头照已提交，仍缺施工环境照和品牌授权资料。" },
      { title: "订单分配超时预警", note: "OD-240402-011", time: "10 分钟前", detail: "该订单已超过预设派单时长，请优先分配给客户意向门店或可接单服务商。" },
      { title: "2 条论坛内容待处理", note: "涉及导流与违规联系方式", time: "28 分钟前", detail: "建议先删除帖子中的联系方式内容，并保留后台处理留痕。" },
    ],
    colors: [
      { name: "曜夜黑", value: "#0d0f12" },
      { name: "电磁灰", value: "#50545c" },
      { name: "深海蓝", value: "#0d3964" },
      { name: "猎装绿", value: "#31533f" },
      { name: "珍珠白", value: "#e5e7ea" },
    ],
    wheels: [
      { name: "Aurora Blade", spokes: 5, color: "#c78a47" },
      { name: "RS Track", spokes: 10, color: "#707782" },
      { name: "Monarch Aero", spokes: 3, color: "#d5d7dd" },
    ],
  };

  const safe = (value, fallbackValue) => {
    if (value == null) return fallbackValue;
    if (typeof value !== "string") return value;
    return /�|锟|鏈|璁|闂|鎴|鐢/.test(value) ? fallbackValue : value;
  };
  const tagType = (text) => ["正常营业", "已通过", "正常", "首页展示", "正常展示", "上架", "启用"].includes(text) ? "success" : ["待审核", "待分配", "待发货", "待验收", "待签收", "待补充", "审核中"].includes(text) ? "warning" : ["已驳回", "暂停接单", "已删除", "缺货", "停用"].includes(text) ? "danger" : ["施工中"].includes(text) ? "info" : "neutral";
  const tag = (text) => `<span class="tag ${tagType(text)}">${text}</span>`;
  const nAudit = (v) => String(v || "").includes("通过") ? "已通过" : String(v || "").includes("驳") ? "已驳回" : String(v || "").includes("补") ? "待补充" : "待审核";
  const nProvider = (v) => String(v || "").includes("暂停") ? "暂停接单" : String(v || "").includes("驳") ? "已驳回" : "正常营业";
  const nOrder = (v) => { const t = String(v || ""); if (t.includes("分配")) return "待分配"; if (t.includes("施工")) return "施工中"; if (t.includes("完成")) return "已完成"; if (t.includes("发货")) return "待发货"; if (t.includes("验收")) return "待验收"; if (t.includes("签收")) return "待签收"; return "处理中"; };
  const nCaseAudit = (v) => String(v || "").includes("通过") ? "已通过" : String(v || "").includes("驳") || String(v || "").includes("修改") ? "已驳回" : "待审核";
  const nCaseDisplay = (v) => String(v || "").includes("首页") || String(v || "").includes("推荐") ? "首页展示" : String(v || "").includes("正常") ? "正常展示" : "未展示";
  const nForum = (v) => String(v || "").includes("删除") ? "已删除" : "正常";
  const nProduct = (v) => String(v || "").includes("缺") ? "缺货" : "上架";
  const nSettlement = (v) => String(v || "").includes("通过") ? "已通过" : String(v || "").includes("中") ? "审核中" : "待审核";

  function render() {
    const cfg = appConfigs[appType];
    screenEl.innerHTML = `
      <div class="android-status"><span>9:41</span><span>5G 92%</span></div>
      <header class="android-topbar"><span class="eyebrow">${cfg.title}</span><h2>${cfg.labels[state.tab]}</h2><div class="muted">${appType === "admin" ? "轻审批、轻处理、待办集中办结" : appType === "provider" ? "门店作业、采购与结算" : "案例推荐、服务消费与爱车管理"}</div></header>
      <section class="screen-content">${appType === "admin" ? renderAdmin() : appType === "provider" ? renderProvider() : renderUser()}</section>
      <nav class="bottom-nav">${cfg.tabs.map((id) => `<button class="${state.tab === id ? "active" : ""}" type="button" data-tab="${id}"><span>${cfg.labels[id]}</span></button>`).join("")}</nav>
    `;
    bindEvents();
  }

  function bindEvents() {
    screenEl.querySelectorAll("[data-tab]").forEach((b) => b.addEventListener("click", () => { state.tab = b.dataset.tab; render(); }));
    screenEl.querySelectorAll("[data-sub-tab]").forEach((b) => b.addEventListener("click", () => { state.subTab[state.tab] = b.dataset.subTab; render(); }));
    screenEl.querySelectorAll("[data-admin-pick]").forEach((b) => b.addEventListener("click", () => { state.adminSelected[b.dataset.adminType] = b.dataset.adminId; render(); }));
    screenEl.querySelectorAll("[data-admin-shortcut]").forEach((b) => b.addEventListener("click", () => { state.tab = b.dataset.adminShortcut; if (state.tab === "providers") state.subTab.providers = "audit"; if (state.tab === "orders") state.subTab.orders = "assign"; if (state.tab === "operations") state.subTab.operations = b.dataset.operationsTarget || "cases"; render(); }));
    screenEl.querySelectorAll("[data-admin-action]").forEach((b) => b.addEventListener("click", () => handleAdminAction(b)));
    screenEl.querySelectorAll("[data-setting-key]").forEach((b) => b.addEventListener("click", () => { const key = b.dataset.settingKey; state.adminSettings[key] = !state.adminSettings[key]; render(); }));
    screenEl.querySelectorAll("[data-color-index]").forEach((b) => b.addEventListener("click", () => { state.garageColor = Number(b.dataset.colorIndex); updateGarageRender(); }));
    screenEl.querySelectorAll("[data-wheel-index]").forEach((b) => b.addEventListener("click", () => { state.garageWheel = Number(b.dataset.wheelIndex); updateGarageRender(); }));
  }

  const subTabs = (items) => `<div class="sub-tabs">${items.map((i) => `<button class="sub-tab ${(state.subTab[state.tab] || items[0].id) === i.id ? "active" : ""}" data-sub-tab="${i.id}" type="button">${i.label}</button>`).join("")}</div>`;

  function renderAdmin() {
    if (state.tab === "home") {
      const todo = [
        { id: "providers", title: "待审核入驻", value: providers.filter((i) => nAudit(i.auditStatus) !== "已通过").length || 3, note: "优先处理新提交资料" },
        { id: "orders", title: "待分配订单", value: orders.filter((i) => nOrder(i.status) === "待分配").length || 1, note: "客户意向门店可直派" },
        { id: "operations", title: "待审核案例", value: cases.filter((i) => nCaseAudit(i.audit) !== "已通过").length || 2, note: "审核后再决定展示状态", operationsTarget: "cases" },
        { id: "operations", title: "待处理论坛", value: posts.filter((i) => nForum(i.status) !== "正常").length || 1, note: "发后管理，删除留痕", operationsTarget: "forum" },
      ];
      return `<div class="stack"><section class="hero-banner"><div class="eyebrow">Work Bench</div><h3 style="margin:10px 0 8px; font-size:28px; font-family:var(--font-display);">平台待办工作台</h3><p class="muted">把服务商审核、订单派单、案例审核和论坛处理集中到移动端快速完成。</p></section><section class="mobile-grid-2">${todo.map((i) => `<button class="m3-card admin-shortcut-card" type="button" data-admin-shortcut="${i.id}" ${i.operationsTarget ? `data-operations-target="${i.operationsTarget}"` : ""}><div class="muted">${i.title}</div><span class="mobile-stat">${i.value}</span><div class="muted">${i.note}</div></button>`).join("")}</section><section class="mobile-list">${fallback.adminMessages.map((i) => `<article class="mobile-item"><strong>${i.title}</strong><div class="muted">${i.note}</div><div style="margin-top:8px;" class="muted">${i.time}</div></article>`).join("")}</section></div>`;
    }
    if (state.tab === "providers") {
      const active = state.subTab.providers || "audit";
      const rows = active === "audit" ? providers.filter((i) => nAudit(i.auditStatus) !== "已通过") : providers.filter((i) => nAudit(i.auditStatus) === "已通过");
      const selected = rows.find((i) => i.id === state.adminSelected.providers) || rows[0];
      return `${subTabs([{ id: "audit", label: "入驻审核" }, { id: "list", label: "服务商列表" }])}<div class="mobile-list">${rows.map((i) => `<div class="admin-inline-block"><button class="mobile-item admin-pick-card ${selected?.id === i.id ? "active" : ""}" type="button" data-admin-pick data-admin-type="providers" data-admin-id="${i.id}"><div style="display:flex; justify-content:space-between; gap:12px;"><strong>${safe(i.name, "服务商")}</strong>${tag(active === "audit" ? nAudit(i.auditStatus) : nProvider(i.status))}</div><div class="muted" style="margin-top:8px;">${safe(i.city, "上海")} / ${safe(i.district, "闵行")} / ${safe(i.specialties, "高端改装")}</div><div style="margin-top:10px;" class="muted">${safe(i.contact, "联系人待补充")}</div></button>${selected?.id === i.id ? renderAdminProviderDetail(i, active) : ""}</div>`).join("")}</div>`;
    }
    if (state.tab === "orders") {
      const active = state.subTab.orders || "list";
      const rows = active === "assign" ? orders.filter((i) => nOrder(i.status) === "待分配") : orders;
      const selected = rows.find((i) => i.id === state.adminSelected.orders) || rows[0];
      return `${subTabs([{ id: "list", label: "订单列表" }, { id: "assign", label: "订单分配" }])}<div class="mobile-list">${rows.map((i) => `<div class="admin-inline-block"><button class="mobile-item admin-pick-card ${selected?.id === i.id ? "active" : ""}" type="button" data-admin-pick data-admin-type="orders" data-admin-id="${i.id}"><div style="display:flex; justify-content:space-between; gap:12px;"><strong>${i.id}</strong>${tag(nOrder(i.status))}</div><div class="muted" style="margin-top:8px;">${safe(i.user, "用户")} / ${safe(i.vehicle, "车型")}</div><div style="margin-top:8px;">${safe(i.service, "服务项目")}</div><div class="muted" style="margin-top:8px;">${active === "assign" ? `意向门店：${safe(i.intention, "未指定")}` : safe(i.progress, "处理中")}</div></button>${selected?.id === i.id ? renderAdminOrderDetail(i, active) : ""}</div>`).join("")}</div>`;
    }
    if (state.tab === "operations") {
      const active = state.subTab.operations || "cases";
      const rows = active === "cases" ? cases : posts;
      const selected = rows.find((i) => i.id === state.adminSelected[active]) || rows[0];
      return `${subTabs([{ id: "cases", label: "案例审核" }, { id: "forum", label: "论坛处理" }])}<div class="mobile-list">${rows.map((i) => active === "cases" ? `<div class="admin-inline-block"><button class="mobile-item admin-pick-card ${selected?.id === i.id ? "active" : ""}" type="button" data-admin-pick data-admin-type="cases" data-admin-id="${i.id}"><strong>${safe(i.title, "案例标题")}</strong><div class="muted" style="margin-top:8px;">${safe(i.model, "车型")} / ${safe(i.provider, "服务商")}</div><div style="margin-top:10px; display:flex; gap:10px; flex-wrap:wrap;">${tag(nCaseAudit(i.audit))}<span class="pill">${nCaseDisplay(i.display)}</span></div></button>${selected?.id === i.id ? renderAdminCaseDetail(i) : ""}</div>` : `<div class="admin-inline-block"><button class="mobile-item admin-pick-card ${selected?.id === i.id ? "active" : ""}" type="button" data-admin-pick data-admin-type="forum" data-admin-id="${i.id}"><strong>${safe(i.title, "帖子标题")}</strong><div class="muted" style="margin-top:8px;">${safe(i.author, "作者")} / ${safe(i.time, "今天")}</div><div style="margin-top:10px; display:flex; gap:10px; flex-wrap:wrap;"><span class="pill">回复 ${i.replies || 0}</span><span class="pill">点赞 ${i.likes || 0}</span>${tag(nForum(i.status))}</div></button>${selected?.id === i.id ? renderAdminForumDetail(i) : ""}</div>`).join("")}</div>`;
    }
    return renderAdminMe();
  }

  function renderAdminMe() {
    const settingRows = [
      { key: "autoAccept", title: "自动验收时长", note: state.adminSettings.autoAccept ? "24 小时" : "已关闭自动验收" },
      { key: "messageTpl", title: "消息模板版本", note: state.adminSettings.messageTpl ? "V2.8 已启用" : "已切换为手动发送" },
      { key: "forumAlert", title: "论坛内容预警", note: state.adminSettings.forumAlert ? "开启敏感词提醒" : "已关闭敏感词提醒" },
    ];
    return `<div class="stack"><section class="admin-detail-card"><div class="eyebrow">Account Profile</div><h3>账号基本信息</h3><div class="admin-kv-list"><div><span>账号名称</span><strong>平台管理员</strong></div><div><span>账号标识</span><strong>PA-ADMIN-001</strong></div><div><span>角色权限</span><strong>平台管理员 / 审核中心负责人</strong></div><div><span>所属部门</span><strong>平台运营中心</strong></div><div><span>手机号</span><strong>138****6608</strong></div><div><span>邮箱</span><strong>admin@mangai.cn</strong></div><div><span>最近登录</span><strong>2026-04-03 09:41</strong></div><div><span>账号状态</span><strong>启用</strong></div></div></section><section class="admin-detail-card"><div class="eyebrow">Quick Settings</div><h3>快捷设置</h3><div class="admin-suggest-list">${settingRows.map((item) => `<button class="admin-suggest-item" type="button" data-setting-key="${item.key}"><strong>${item.title}</strong><span>${item.note}</span></button>`).join("")}</div></section></div>`;
  }

  function renderAdminProviderDetail(item, active) { return `<section class="admin-detail-card"><div class="eyebrow">${active === "audit" ? "Provider Audit" : "Provider Detail"}</div><h3>${safe(item.name, "服务商详情")}</h3><div class="admin-kv-list"><div><span>联系人</span><strong>${safe(item.contact, "-")}</strong></div><div><span>所在城市</span><strong>${safe(item.city, "-")} / ${safe(item.district, "-")}</strong></div><div><span>主营能力</span><strong>${safe(item.specialties, "-")}</strong></div><div><span>营业执照</span><strong>${safe(item.license, "-")}</strong></div><div><span>工位数量</span><strong>${item.bays || 0} 个</strong></div></div><div class="admin-doc-list"><div class="admin-doc-item">营业执照副本</div><div class="admin-doc-item">门头照片</div><div class="admin-doc-item">施工环境照</div><div class="admin-doc-item">案例图片包</div></div><div class="admin-action-row">${active === "audit" ? `<button class="btn btn-primary" type="button" data-admin-action="provider-approve" data-admin-id="${item.id}">审核通过</button><button class="btn btn-secondary" type="button" data-admin-action="provider-supplement" data-admin-id="${item.id}">补充资料</button><button class="btn btn-danger" type="button" data-admin-action="provider-reject" data-admin-id="${item.id}">驳回</button>` : `<button class="btn btn-primary" type="button" data-admin-action="provider-toggle" data-admin-id="${item.id}">${nProvider(item.status) === "暂停接单" ? "恢复营业" : "暂停接单"}</button><button class="btn btn-secondary" type="button" data-admin-action="provider-detail" data-admin-id="${item.id}">查看资料</button>`}</div><div class="admin-timeline">${(item.timeline || []).slice(0, 4).map((l) => `<div>${l}</div>`).join("")}</div></section>`; }
  function renderAdminOrderDetail(item, active) { const opts = providers.filter((p) => nProvider(p.status) !== "暂停接单" && nAudit(p.auditStatus) === "已通过"); return `<section class="admin-detail-card"><div class="eyebrow">${active === "assign" ? "Order Dispatch" : "Order Detail"}</div><h3>${item.id}</h3><div class="admin-kv-list"><div><span>用户</span><strong>${safe(item.user, "-")}</strong></div><div><span>车辆</span><strong>${safe(item.vehicle, "-")}</strong></div><div><span>服务</span><strong>${safe(item.service, "-")}</strong></div><div><span>报价</span><strong>${safe(item.quote, "-")}</strong></div><div><span>预约时间</span><strong>${safe(item.appointment, "-")}</strong></div><div><span>客户意向</span><strong>${safe(item.intention, "未指定")}</strong></div><div><span>当前进度</span><strong>${safe(item.progress, "-")}</strong></div></div>${active === "assign" ? `<div class="admin-suggest-list">${opts.slice(0, 3).map((p) => `<button class="admin-suggest-item" type="button" data-admin-action="order-assign" data-admin-id="${item.id}" data-provider-id="${p.id}"><strong>${safe(p.name, "服务商")}</strong><span>${p.name === item.intention ? "客户意向门店" : safe(p.city, "城市门店")}</span></button>`).join("")}</div>` : ""}<div class="admin-action-row"><button class="btn btn-secondary" type="button" data-admin-action="order-detail" data-admin-id="${item.id}">查看详情</button>${active === "assign" ? `<button class="btn btn-primary" type="button" data-admin-action="order-assign-intention" data-admin-id="${item.id}">一键派给意向门店</button>` : ""}</div></section>`; }
  function renderAdminCaseDetail(item) { return `<section class="admin-detail-card"><div class="eyebrow">Case Review</div><h3>${safe(item.title, "案例详情")}</h3><div class="admin-kv-list"><div><span>服务商</span><strong>${safe(item.provider, "-")}</strong></div><div><span>车型</span><strong>${safe(item.model, "-")}</strong></div><div><span>风格</span><strong>${safe(item.style, "-")}</strong></div><div><span>花费区间</span><strong>${safe(item.cost, "-")}</strong></div><div><span>审核状态</span><strong>${nCaseAudit(item.audit)}</strong></div><div><span>展示状态</span><strong>${nCaseDisplay(item.display)}</strong></div></div><div class="admin-doc-list"><div class="admin-doc-item">案例主图</div><div class="admin-doc-item">施工过程图</div><div class="admin-doc-item">完工对比图</div></div><div class="admin-action-row"><button class="btn btn-primary" type="button" data-admin-action="case-approve" data-admin-id="${item.id}">审核通过</button><button class="btn btn-secondary" type="button" data-admin-action="case-display" data-admin-id="${item.id}">设为正常展示</button><button class="btn btn-danger" type="button" data-admin-action="case-reject" data-admin-id="${item.id}">审核驳回</button></div></section>`; }
  function renderAdminForumDetail(post) { const related = comments.filter((i) => i.post === post.id); return `<section class="admin-detail-card"><div class="eyebrow">Forum Moderation</div><h3>${safe(post.title, "帖子详情")}</h3><div class="admin-kv-list"><div><span>作者</span><strong>${safe(post.author, "-")}</strong></div><div><span>发布时间</span><strong>${safe(post.time, "-")}</strong></div><div><span>当前状态</span><strong>${nForum(post.status)}</strong></div><div><span>互动数据</span><strong>回复 ${post.replies || 0} / 点赞 ${post.likes || 0}</strong></div></div><div class="admin-action-row"><button class="btn btn-primary" type="button" data-admin-action="forum-post-toggle" data-admin-id="${post.id}">${nForum(post.status) === "已删除" ? "恢复帖子" : "删除帖子"}</button></div><div class="admin-comment-block"><strong>评论区</strong><div class="admin-comment-list">${related.length ? related.map((i) => `<div class="admin-comment-item"><div class="admin-comment-head"><strong>${safe(i.author, "评论用户")}</strong>${tag(nForum(i.status))}</div><p>${safe(i.content, "评论内容")}</p><button class="btn btn-secondary" type="button" data-admin-action="forum-comment-toggle" data-admin-id="${i.id}">${nForum(i.status) === "已删除" ? "恢复评论" : "删除评论"}</button></div>`).join("") : `<div class="muted">当前帖子暂无评论</div>`}</div></div></section>`; }
  function handleAdminAction(button) { const action = button.dataset.adminAction; const id = button.dataset.adminId || ""; if (action.startsWith("provider-")) { const t = providers.find((i) => i.id === id); if (!t) return; if (action === "provider-approve") { t.auditStatus = "已通过"; t.status = "正常营业"; } else if (action === "provider-supplement") { t.auditStatus = "待补充"; } else if (action === "provider-reject") { t.auditStatus = "已驳回"; t.status = "已驳回"; } else if (action === "provider-toggle") { t.status = nProvider(t.status) === "暂停接单" ? "正常营业" : "暂停接单"; } render(); return; } if (action.startsWith("order-")) { const t = orders.find((i) => i.id === id); if (!t) return; if (action === "order-assign-intention") { t.provider = t.intention || "推荐门店"; t.status = "施工中"; t.progress = `已派单至 ${t.provider}`; } else if (action === "order-assign") { const p = providers.find((i) => i.id === button.dataset.providerId); if (p) { t.provider = p.name; t.status = "施工中"; t.progress = `已派单至 ${p.name}`; } } render(); return; } if (action.startsWith("case-")) { const t = cases.find((i) => i.id === id); if (!t) return; if (action === "case-approve") t.audit = "已通过"; if (action === "case-display") { t.audit = "已通过"; t.display = "正常展示"; } if (action === "case-reject") { t.audit = "已驳回"; t.display = "未展示"; } render(); return; } if (action === "forum-post-toggle") { const t = posts.find((i) => i.id === id); if (t) t.status = nForum(t.status) === "已删除" ? "正常" : "已删除"; render(); return; } if (action === "forum-comment-toggle") { const t = comments.find((i) => i.id === id); if (t) t.status = nForum(t.status) === "已删除" ? "正常" : "已删除"; render(); } }

  function renderProvider() { const tasks = [{ title: "待接单", value: 5 }, { title: "施工中", value: 12 }, { title: "待完工提交", value: 3 }, { title: "待申请结算", value: 4 }]; if (state.tab === "home") return `<div class="stack"><section class="hero-banner"><div class="eyebrow">Store Dashboard</div><h3 style="margin:10px 0 8px; font-size:28px; font-family:var(--font-display);">门店工作台</h3><p class="muted">聚焦待接单、施工进度、待结算与门店经营数据。</p></section><section class="mobile-grid-2">${tasks.map((i) => `<article class="m3-card"><div class="muted">${i.title}</div><span class="mobile-stat">${i.value}</span></article>`).join("")}</section></div>`; if (state.tab === "orders") { const active = state.subTab.orders || "pending"; const rows = active === "pending" ? orders.filter((i) => ["待分配", "施工中"].includes(nOrder(i.status))) : orders; return `${subTabs([{ id: "pending", label: "待接单" }, { id: "all", label: "全部订单" }])}<div class="mobile-list">${rows.map((i) => `<article class="mobile-item"><div style="display:flex; justify-content:space-between; gap:12px;"><strong>${safe(i.vehicle, "车辆")}</strong>${tag(active === "pending" && nOrder(i.status) === "待分配" ? "待接单" : nOrder(i.status))}</div><div class="muted" style="margin-top:8px;">${safe(i.user, "用户")} / ${safe(i.service, "服务")}</div><div style="margin-top:8px;" class="muted">${safe(i.quote, "-")} / ${safe(i.appointment, "-")}</div></article>`).join("")}</div>`; } if (state.tab === "products") { const active = state.subTab.products || "purchase"; return `${subTabs([{ id: "purchase", label: "商品采购" }, { id: "record", label: "采购记录" }])}<div class="mobile-list">${(active === "purchase" ? products : products.slice(0, 3)).map((i) => `<article class="mobile-item"><strong>${safe(i.name, "商品")}</strong><div class="muted" style="margin-top:8px;">${safe(i.brand, "品牌")} / ${safe(i.category, "类目")}</div><div style="margin-top:10px; display:flex; gap:10px; flex-wrap:wrap;"><span class="pill">${safe(i.price, "-")}</span>${tag(active === "purchase" ? nProduct(i.status) : "已采购")}</div></article>`).join("")}</div>`; } if (state.tab === "operations") { const active = state.subTab.operations || "cases"; return `${subTabs([{ id: "cases", label: "案例管理" }, { id: "forum", label: "论坛管理" }])}<div class="mobile-list">${(active === "cases" ? cases : posts.slice(0, 3)).map((i) => active === "cases" ? `<article class="mobile-item"><strong>${safe(i.title, "案例")}</strong><div class="muted" style="margin-top:8px;">${safe(i.model, "车型")} / ${safe(i.cost, "-")}</div><div style="margin-top:10px;">${tag(nCaseAudit(i.audit))}</div></article>` : `<article class="mobile-item"><strong>${safe(i.title, "帖子")}</strong><div class="muted" style="margin-top:8px;">回复 ${i.replies || 0} / 点赞 ${i.likes || 0}</div></article>`).join("")}</div>`; } return `<div class="stack"><section class="mobile-list">${settlements.map((i) => `<article class="mobile-item"><strong>${safe(i.provider, "服务商")}</strong><div class="muted" style="margin-top:8px;">${i.id}</div><div style="margin-top:8px;">${safe(i.amount, "-")}</div><div style="margin-top:10px;">${tag(nSettlement(i.status))}</div></article>`).join("")}</section></div>`; }

  function renderUser() { if (state.tab === "home") return `<div class="stack"><section class="hero-banner"><div class="eyebrow">Inspiration</div><h3 style="margin:10px 0 8px; font-size:28px; font-family:var(--font-display);">高端改装推荐</h3><p class="muted">${fallback.userBanners[0]}</p></section><section class="mobile-list">${cases.map((i) => `<article class="mobile-item"><strong>${safe(i.title, "案例")}</strong><div class="muted" style="margin-top:8px;">${safe(i.model, "车型")} / ${safe(i.style, "风格")}</div><div style="margin-top:10px; display:flex; gap:10px;"><span class="pill">${safe(i.cost, "-")}</span>${tag(nCaseDisplay(i.display))}</div></article>`).join("")}</section></div>`; if (state.tab === "mall") { const active = state.subTab.mall || "goods"; return `${subTabs([{ id: "goods", label: "商品列表" }, { id: "service", label: "服务下单" }])}<div class="mobile-list">${(active === "goods" ? products : services).map((i) => active === "goods" ? `<article class="mobile-item"><strong>${safe(i.name, "商品")}</strong><div class="muted" style="margin-top:8px;">${safe(i.brand, "品牌")} / ${safe(i.fitment, "适配车型")}</div><div style="margin-top:10px; display:flex; gap:10px;"><span class="pill">${safe(i.price, "-")}</span>${tag(nProduct(i.status))}</div></article>` : `<article class="mobile-item"><strong>${safe(i.name, "服务")}</strong><div class="muted" style="margin-top:8px;">${safe(i.desc, "服务说明")}</div><div style="margin-top:10px;"><span class="pill">${safe(i.price, "-")}</span></div></article>`).join("")}</div>`; } if (state.tab === "garage") { const active = state.subTab.garage || "render"; return `${subTabs([{ id: "vehicles", label: "我的车辆" }, { id: "render", label: "渲染展示" }])}${active === "vehicles" ? `<div class="mobile-list">${vehicles.map((i) => `<article class="mobile-item"><strong>${safe(i.model, "车辆")}</strong><div class="muted" style="margin-top:8px;">${safe(i.plate, "-")} / ${safe(i.owner, "-")}</div><div style="margin-top:8px;">${safe(i.history, "改装记录")}</div></article>`).join("")}</div>` : `<div class="stack"><section class="garage-preview"><div class="eyebrow">Render Lab</div><strong style="display:block; margin-top:10px; font-size:22px;">宝马 G20 330i 外观预览</strong><div class="muted" style="margin-top:6px;">点击切换车身颜色与轮毂样式，当前方案仅做图片式渲染模拟。</div><div class="car-render"><div class="car-wheel left" id="leftWheel"></div><div class="car-wheel right" id="rightWheel"></div><div class="car-render-body" id="carBody"></div></div><div class="swatch-row">${fallback.colors.map((i, idx) => `<button class="swatch ${idx === state.garageColor ? "active" : ""}" style="background:${i.value};" type="button" title="${i.name}" data-color-index="${idx}"></button>`).join("")}</div></section><section class="mobile-list">${fallback.wheels.map((i, idx) => `<button class="wheel-option ${idx === state.garageWheel ? "active" : ""}" type="button" data-wheel-index="${idx}"><span><strong>${i.name}</strong><div class="muted" style="margin-top:6px;">${i.spokes} 辐设计 / 高端改装风格</div></span><span class="wheel-badge" data-tone="${idx === 0 ? "gold" : idx === 1 ? "grey" : "silver"}"></span></button>`).join("")}</section></div>`}`; } if (state.tab === "forum") { const active = state.subTab.forum || "posts"; return `${subTabs([{ id: "posts", label: "帖子列表" }, { id: "mine", label: "我的发布" }])}<div class="mobile-list">${(active === "posts" ? posts : comments).map((i) => active === "posts" ? `<article class="mobile-item"><strong>${safe(i.title, "帖子")}</strong><div class="muted" style="margin-top:8px;">${safe(i.author, "作者")} / ${safe(i.time, "今天")}</div><div style="margin-top:10px; display:flex; gap:10px;"><span class="pill">回复 ${i.replies || 0}</span><span class="pill">点赞 ${i.likes || 0}</span></div></article>` : `<article class="mobile-item"><strong>${safe(i.content, "评论")}</strong><div class="muted" style="margin-top:8px;">所属 ${safe(i.post, "帖子")} / ${safe(i.time, "今天")}</div></article>`).join("")}</div>`; } return `<div class="stack"><section class="mobile-list">${orders.slice(0, 4).map((i) => `<article class="mobile-item"><strong>${i.id}</strong><div class="muted" style="margin-top:8px;">${safe(i.vehicle, "车型")}</div><div style="margin-top:8px;">${safe(i.service, "服务")}</div><div style="margin-top:10px;">${tag(nOrder(i.status))}</div></article>`).join("")}<article class="mobile-item"><strong>我的资料</strong><div class="muted" style="margin-top:8px;">地址管理、消息通知、金融授信与基础设置。</div></article></section></div>`; }

  function updateGarageRender() { const color = fallback.colors[state.garageColor]; const wheel = fallback.wheels[state.garageWheel]; const body = document.getElementById("carBody"); const leftWheel = document.getElementById("leftWheel"); const rightWheel = document.getElementById("rightWheel"); if (!body || !leftWheel || !rightWheel) return; body.style.background = `linear-gradient(145deg, ${shade(color.value, -18)}, ${color.value})`; const g = `radial-gradient(circle, #a3a9b3 0 10%, ${shade(wheel.color, -30)} 12% 44%, #0a0d11 46% 100%)`; leftWheel.style.background = g; rightWheel.style.background = g; screenEl.querySelectorAll("[data-color-index]").forEach((e, i) => e.classList.toggle("active", i === state.garageColor)); screenEl.querySelectorAll("[data-wheel-index]").forEach((e, i) => e.classList.toggle("active", i === state.garageWheel)); }
  function shade(hex, amount) { const v = hex.replace("#", ""); const size = v.length === 3 ? 1 : 2; const parts = []; for (let i = 0; i < 3; i += 1) { const s = i * size; const c = size === 1 ? parseInt(v[s] + v[s], 16) : parseInt(v.slice(s, s + 2), 16); const n = Math.max(0, Math.min(255, c + amount)); parts.push(n.toString(16).padStart(2, "0")); } return `#${parts.join("")}`; }

  render();
  updateGarageRender();
})();
