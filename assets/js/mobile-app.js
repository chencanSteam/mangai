(function () {
  const appType = document.body.dataset.mobileApp;
  if (!appType) return;

  const screenEl = document.getElementById("mobileApp");
  const { providers, orders, products, settlements, cases, posts, comments, vehicles, services } = window.MockData;

  const appConfigs = {
    admin: { title: "平台管理端", tabs: ["home", "providers", "orders", "operations", "me"], labels: { home: "首页", providers: "服务商", orders: "订单", operations: "运营", me: "我的" } },
    provider: { title: "服务商端", tabs: ["home", "orders", "operations", "messages", "me"], labels: { home: "首页", orders: "订单", operations: "运营", messages: "消息", me: "我的" } },
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
    providerSelected: {
      orders: orders[0]?.id || "",
      products: products[0]?.sku || "",
      cases: cases[0]?.id || "",
      forum: posts[0]?.id || "",
      messages: "msg-1",
      settlements: settlements[0]?.id || "",
    },
    providerFeedback: "",
    providerCompletion: {
      orderId: "",
    },
    providerPurchase: {
      sku: "",
    },
    providerCaseForm: {
      mode: "",
      id: "",
    },
    providerDialog: {
      type: "",
      orderId: "",
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
    providerMessages: [
      { id: "msg-1", title: "平台调度", preview: "OD-240403-021 已派送至当前门店，请尽快接单。", time: "刚刚", status: "在线", messages: [{ from: "platform", text: "OD-240403-021 已派送至当前门店，请尽快接单并安排施工位。", time: "09:42" }, { from: "provider", text: "收到，正在确认施工位，5 分钟内反馈。", time: "09:43" }] },
      { id: "msg-2", title: "客户验收群", preview: "客户想确认尾段排气声浪是否已调校完成。", time: "12 分钟前", status: "沟通中", messages: [{ from: "user", text: "想确认尾段排气声浪是否已经调校完成？", time: "09:18" }, { from: "provider", text: "已经完成联调，稍后我把完工视频发您确认。", time: "09:20" }] },
      { id: "msg-3", title: "采购物流", preview: "BBS 轮毂已发货，预计明天下午送达。", time: "35 分钟前", status: "已发货", messages: [{ from: "platform", text: "BBS 轮毂已发货，预计明天下午送达门店。", time: "08:55" }, { from: "provider", text: "收到，到货后我这边安排签收。", time: "08:58" }] },
      { id: "msg-4", title: "运营审核", preview: "案例 AMG C43 排气升级建议补充完工图。", time: "今天 09:10", status: "待回复", messages: [{ from: "platform", text: "案例《AMG C43 排气升级》建议补充完工图后再次提交。", time: "09:10" }, { from: "provider", text: "明白，我补充完工图后重新提审。", time: "09:12" }] },
    ],
  };

  const providerOrderExtras = {
    "OD-240402-011": {
      phone: "13800139011",
      duration: "1 天",
      bay: "2 号工位",
      remark: "客户希望当天完成刹车升级，优先安排底盘工位。",
      arrival: "预计 09:40 到店",
    },
    "OD-240402-008": {
      phone: "13900135208",
      duration: "1-2 天",
      bay: "4 号工位",
      remark: "氛围灯与内饰包覆同步施工，需在交付前做整车联调。",
      arrival: "已于昨日 13:55 到店",
    },
    "OD-240401-023": {
      phone: "13700131023",
      duration: "0.5 天",
      bay: "备货区",
      remark: "商品单无需占用施工位，重点核对轮毂包装与物流签收。",
      arrival: "待物流揽收",
    },
    "OD-240331-017": {
      phone: "13600133317",
      duration: "1 天",
      bay: "1 号工位",
      remark: "完工资料已上传，等待平台确认赛道模式底盘参数。",
      arrival: "已完工待客户验收",
    },
    "OD-240329-006": {
      phone: "13500139006",
      duration: "2 天",
      bay: "3 号工位",
      remark: "订单已完工交付，建议补录售后回访结果与客户改装清单。",
      arrival: "已交付客户",
    },
    "OD-240403-021": {
      phone: "18800133021",
      duration: "1.5 天",
      bay: "5 号工位",
      remark: "客户要求今天完成漆面膜预洗和边角复查，优先安排贴膜位。",
      arrival: "预计 15:10 到店",
    },
    "OD-240403-018": {
      phone: "18600137018",
      duration: "1 天",
      bay: "2 号工位",
      remark: "轮毂已到位，施工后需要安排高速平衡和路试反馈。",
      arrival: "已于 08:46 到店",
    },
    "OD-240402-026": {
      phone: "13900131126",
      duration: "1 天",
      bay: "1 号工位",
      remark: "排气阀门联调已完成，等待平台确认视频和声浪说明。",
      arrival: "已完工待客户验收",
    },
  };

  const providerOrderMocks = [
    {
      id: "OD-240403-021",
      type: "服务订单",
      user: "周恺",
      vehicle: "宝马 G28 325Li",
      service: "XPEL 车衣 + 镀晶收边",
      provider: "擎速 Motorsport Lab",
      city: "杭州",
      quote: "¥ 12,600",
      payment: "已支付",
      status: "待分配",
      progress: "客户已确认今天下午到店，等待门店接单。",
      appointment: "2026-04-03 15:30",
      intention: "擎速 Motorsport Lab",
    },
    {
      id: "OD-240403-018",
      type: "服务订单",
      user: "韩骁",
      vehicle: "奥迪 S4 Avant",
      service: "BBS 轮毂升级 + 四轮定位",
      provider: "擎速 Motorsport Lab",
      city: "杭州",
      quote: "¥ 22,800",
      payment: "已支付",
      status: "施工中",
      progress: "轮毂已安装完成，正在进行定位与路试。",
      appointment: "2026-04-03 09:00",
      intention: "擎速 Motorsport Lab",
    },
    {
      id: "OD-240402-026",
      type: "服务订单",
      user: "顾辰",
      vehicle: "AMG C43",
      service: "Akrapovic 排气升级",
      provider: "擎速 Motorsport Lab",
      city: "杭州",
      quote: "¥ 31,500",
      payment: "已支付",
      status: "待验收",
      progress: "完工照片与排气阀门联调视频已上传。",
      appointment: "2026-04-02 13:30",
      intention: "擎速 Motorsport Lab",
    },
  ];

  const providerPurchaseRecords = getProviderPurchasableProducts().slice(0, 3).map((item, index) => ({
    id: `PO-24040${index + 1}`,
    sku: item.sku,
    name: item.name,
    brand: item.brand,
    model: item.model || item.spec || item.fitment || item.sku,
    category: item.category,
    quantity: index === 0 ? 4 : index === 1 ? 2 : 1,
    amount: item.price,
    status: index === 0 ? "待发货" : index === 1 ? "已发货" : "已签收",
    note: index === 0 ? "采购已提交，等待仓库安排发货" : index === 1 ? "商品已从仓库发出，请留意物流并及时签收" : "商品已完成签收，可安排安装或入库",
  }));

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
  const nPurchaseStatus = (v) => String(v || "").includes("签收") ? "已签收" : String(v || "").includes("发货") ? "已发货" : "待发货";

  function render() {
    const cfg = appConfigs[appType];
    screenEl.innerHTML = `
      <div class="android-status"><span>9:41</span><span>5G 92%</span></div>
      <header class="android-topbar"><span class="eyebrow">${cfg.title}</span><h2>${cfg.labels[state.tab]}</h2><div class="muted">${appType === "admin" ? "轻审批、轻处理、待办集中办结" : appType === "provider" ? "门店作业、采购与结算" : "案例推荐、服务消费与爱车管理"}</div></header>
      <section class="screen-content">${appType === "admin" ? renderAdmin() : appType === "provider" ? renderProvider() : renderUser()}</section>
      <nav class="bottom-nav">${cfg.tabs.map((id) => `<button class="${state.tab === id ? "active" : ""}" type="button" data-tab="${id}"><span>${cfg.labels[id]}</span></button>`).join("")}</nav>
      ${appType === "provider" ? renderProviderDialog() : ""}
    `;
    bindEvents();
  }

  function bindEvents() {
    screenEl.querySelectorAll("[data-tab]").forEach((b) => b.addEventListener("click", () => { state.tab = b.dataset.tab; render(); }));
    screenEl.querySelectorAll("[data-sub-tab]").forEach((b) => b.addEventListener("click", () => { state.subTab[state.tab] = b.dataset.subTab; render(); }));
    screenEl.querySelectorAll("[data-admin-pick]").forEach((b) => b.addEventListener("click", () => { state.adminSelected[b.dataset.adminType] = b.dataset.adminId; render(); }));
    screenEl.querySelectorAll("[data-admin-shortcut]").forEach((b) => b.addEventListener("click", () => { state.tab = b.dataset.adminShortcut; if (state.tab === "providers") state.subTab.providers = "audit"; if (state.tab === "orders") state.subTab.orders = "assign"; if (state.tab === "operations") state.subTab.operations = b.dataset.operationsTarget || "cases"; render(); }));
    screenEl.querySelectorAll("[data-admin-action]").forEach((b) => b.addEventListener("click", () => handleAdminAction(b)));
    screenEl.querySelectorAll("[data-provider-pick]").forEach((b) => b.addEventListener("click", () => { state.providerSelected[b.dataset.providerType] = b.dataset.providerId; render(); }));
    screenEl.querySelectorAll("[data-provider-shortcut]").forEach((b) => b.addEventListener("click", () => {
      state.tab = b.dataset.providerShortcut;
      if (state.tab === "orders") state.subTab.orders = b.dataset.ordersTarget || "pending";
      if (state.tab === "operations") state.subTab.operations = b.dataset.operationsTarget || "cases";
      if (state.tab === "messages") state.subTab.messages = b.dataset.messagesTarget || "all";
      if (state.tab === "me") state.subTab.me = b.dataset.meTarget || "settlements";
      render();
    }));
    screenEl.querySelectorAll("[data-provider-action]").forEach((b) => b.addEventListener("click", () => handleProviderAction(b)));
    screenEl.querySelectorAll("[data-provider-complete-form]").forEach((form) => form.addEventListener("submit", handleProviderCompleteSubmit));
    screenEl.querySelectorAll("[data-provider-purchase-form]").forEach((form) => form.addEventListener("submit", handleProviderPurchaseSubmit));
    screenEl.querySelectorAll("[data-provider-case-form]").forEach((form) => form.addEventListener("submit", handleProviderCaseSubmit));
    screenEl.querySelectorAll("[data-provider-chat-form]").forEach((form) => form.addEventListener("submit", handleProviderChatSubmit));
    screenEl.querySelectorAll("[data-provider-dialog-action]").forEach((b) => b.addEventListener("click", () => handleProviderDialogAction(b)));
    screenEl.querySelectorAll("[data-provider-reject-form]").forEach((form) => form.addEventListener("submit", handleProviderRejectSubmit));
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

  function renderProvider() {
    if (state.tab === "home") return renderProviderHome();
    if (state.tab === "orders") return renderProviderOrders();
    if (state.tab === "operations") return renderProviderOperations();
    if (state.tab === "messages") return renderProviderMessages();
    return renderProviderMe();
  }

  function renderProviderHome() {
    const cards = [
      { title: "待接单", value: getProviderPendingOrders().length, note: "新派单等待门店确认", tab: "orders", ordersTarget: "pending" },
      { title: "施工中", value: getProviderProcessingOrders().length, note: "跟进施工与完工节点", tab: "orders", ordersTarget: "all" },
      { title: "待申请结算", value: getProviderSettlementRows().filter((item) => nSettlement(item.status) !== "已通过").length || 1, note: "完工订单尽快提交结算", tab: "me", meTarget: "settlements" },
      { title: "采购与运营", value: getProviderPurchasableProducts().length + getProviderCaseRows().filter((item) => nCaseAudit(item.audit) !== "已通过").length, note: "采购、案例和帖子统一处理", tab: "operations", operationsTarget: "purchase" },
      { title: "待处理消息", value: fallback.providerMessages.filter((item) => item.status !== "已处理").length, note: "及时查看派单、验收和采购提醒", tab: "messages", messagesTarget: "all" },
    ];
    return `<div class="stack"><section class="hero-banner"><div class="eyebrow">Store Dashboard</div><h3 style="margin:10px 0 8px; font-size:28px; font-family:var(--font-display);">门店工作台</h3><p class="muted">聚焦接单、施工、采购、内容运营、消息处理和结算申请，适合门店前台快速处理。</p></section><section class="mobile-grid-2">${cards.map((item) => `<button class="m3-card admin-shortcut-card" type="button" data-provider-shortcut="${item.tab}" ${item.ordersTarget ? `data-orders-target="${item.ordersTarget}"` : ""} ${item.operationsTarget ? `data-operations-target="${item.operationsTarget}"` : ""} ${item.messagesTarget ? `data-messages-target="${item.messagesTarget}"` : ""} ${item.meTarget ? `data-me-target="${item.meTarget}"` : ""}><div class="muted">${item.title}</div><span class="mobile-stat">${item.value}</span><div class="muted">${item.note}</div></button>`).join("")}</section><section class="mobile-list"><article class="mobile-item"><strong>今日到店 6 台 / 完工 3 台</strong><div class="muted" style="margin-top:8px;">轮毂升级、隐形车衣与精品内饰是当前主力订单。</div></article><article class="mobile-item"><strong>本周营收 ¥186,000</strong><div class="muted" style="margin-top:8px;">高端改装订单客单价保持在 ¥13,000 以上。</div></article></section></div>`;
  }

  function renderProviderOrders() {
    const active = state.subTab.orders || "pending";
    const rows =
      active === "pending" ? getProviderPendingOrders() :
      active === "processing" ? getProviderProcessingOrders() :
      active === "acceptance" ? getProviderAcceptanceOrders() :
      getProviderAllOrders();
    const selected = rows.find((item) => item.id === state.providerSelected.orders) || rows[0];
    return `${subTabs([{ id: "all", label: "全部订单" }, { id: "pending", label: "待接单" }, { id: "processing", label: "施工中" }, { id: "acceptance", label: "待验收" }])}${state.providerFeedback ? `<div class="provider-feedback">${state.providerFeedback}</div>` : ""}<div class="mobile-list">${rows.map((item) => `<div class="admin-inline-block"><button class="mobile-item admin-pick-card ${selected?.id === item.id ? "active" : ""}" type="button" data-provider-pick data-provider-type="orders" data-provider-id="${item.id}"><div style="display:flex; justify-content:space-between; gap:12px;"><strong>${safe(item.vehicle, "车辆")}</strong>${tag(providerOrderViewStatus(item, active))}</div><div class="muted" style="margin-top:8px;">${safe(item.user, "用户")} / ${getProviderOrderMeta(item).phone}</div><div style="margin-top:8px;">${safe(item.service, "服务")}</div><div class="muted" style="margin-top:8px;">${safe(item.quote, "-")} / ${safe(item.appointment, "-")}</div><div class="muted" style="margin-top:6px;">${getProviderOrderMeta(item).arrival}</div></button>${selected?.id === item.id ? renderProviderOrderDetail(item) : ""}</div>`).join("") || `<article class="mobile-item"><strong>当前暂无订单</strong><div class="muted" style="margin-top:8px;">新的派单或施工单会出现在这里。</div></article>`}</div>`;
  }

  function renderProviderOperations() {
    const active = state.subTab.operations || "purchase";
    const rows =
      active === "purchase" ? getProviderPurchasableProducts() :
      active === "record" ? getProviderPurchaseRecords() :
      active === "cases" ? getProviderCaseRows() :
      getProviderForumRows();
    const selected =
      active === "purchase" || active === "record"
        ? rows.find((item) => (item.sku || item.id) === state.providerSelected.products) || rows[0]
        : rows.find((item) => item.id === state.providerSelected[active]) || rows[0];
    return `${subTabs([{ id: "purchase", label: "商品采购" }, { id: "record", label: "采购记录" }, { id: "cases", label: "案例管理" }, { id: "forum", label: "论坛管理" }])}${active === "cases" ? `<div class="admin-action-row" style="margin-bottom:12px;"><button class="btn btn-primary" type="button" data-provider-action="case-add">新增案例</button></div>${state.providerCaseForm.mode === "create" ? renderProviderCaseForm() : ""}` : ""}<div class="mobile-list">${rows.map((item) => `<div class="admin-inline-block"><button class="mobile-item admin-pick-card ${(active === "purchase" || active === "record") ? (selected && (selected.sku || selected.id) === (item.sku || item.id) ? "active" : "") : (selected?.id === item.id ? "active" : "")}" type="button" data-provider-pick data-provider-type="${active === "purchase" || active === "record" ? "products" : active}" data-provider-id="${item.sku || item.id}">${active === "purchase" ? `<div class="provider-product-media"><div class="provider-product-visual" data-product-tone="${(item.brand || "").length % 3}"><span>${safe(item.category, "商品")}</span></div></div><strong>${safe(item.name, "商品")}</strong><div class="muted" style="margin-top:8px;">${safe(item.brand, "品牌")} / 型号 ${providerProductModel(item)}</div><div class="muted" style="margin-top:6px;">${safe(item.category, "类目")}</div><div style="margin-top:10px; display:flex; gap:10px; flex-wrap:wrap;"><span class="pill">${safe(item.price, "-")}</span>${tag(nProduct(item.status))}</div>` : active === "record" ? `<strong>${safe(item.id, "采购记录")}</strong><div class="muted" style="margin-top:8px;">${safe(item.name, "商品")} / 型号 ${providerProductModel(item)}</div><div class="muted" style="margin-top:6px;">数量 ${item.quantity || 1} / ${safe(item.amount, "-")}</div><div style="margin-top:10px; display:flex; gap:10px; flex-wrap:wrap;">${tag(nPurchaseStatus(item.status))}</div>` : active === "cases" ? `<strong>${safe(item.title, "案例")}</strong><div class="muted" style="margin-top:8px;">${safe(item.model, "车型")} / ${safe(item.cost, "-")}</div><div style="margin-top:10px; display:flex; gap:10px; flex-wrap:wrap;">${tag(nCaseAudit(item.audit))}<span class="pill">${nCaseDisplay(item.display)}</span></div>` : `<strong>${safe(item.title, "帖子")}</strong><div class="muted" style="margin-top:8px;">回复 ${item.replies || 0} / 点赞 ${item.likes || 0}</div><div style="margin-top:10px;">${tag(nForum(item.status))}</div>`}</button>${(active === "purchase" || active === "record") ? (selected && (selected.sku || selected.id) === (item.sku || item.id) ? renderProviderProductDetail(item, active) : "") : (selected?.id === item.id ? (active === "cases" ? renderProviderCaseDetail(item) : renderProviderForumDetail(item)) : "")}</div>`).join("")}</div>`;
  }

  function renderProviderMessages() {
    const rows = fallback.providerMessages;
    const selected = rows.find((item) => item.id === state.providerSelected.messages) || rows[0];
    if (!selected) return `<div class="stack">${subTabs([{ id: "all", label: "全部消息" }])}<section class="admin-detail-card"><h3>暂无会话</h3></section></div>`;
    return `<div class="stack">${subTabs([{ id: "all", label: "全部消息" }])}<section class="provider-chat-shell"><div class="provider-chat-list">${rows.map((item) => `<div class="admin-inline-block"><button class="provider-chat-thread ${selected.id === item.id ? "active" : ""}" type="button" data-provider-pick data-provider-type="messages" data-provider-id="${item.id}"><div class="provider-chat-thread-head"><strong>${item.title}</strong><span>${item.time}</span></div><div class="provider-chat-thread-preview">${safe(item.preview, "暂无新消息")}</div><div class="provider-chat-thread-meta">${tag(item.status)}</div></button>${selected.id === item.id ? `<section class="provider-chat-panel"><header class="provider-chat-header"><div><div class="eyebrow">Realtime Chat</div><h3>${item.title}</h3></div>${tag(item.status)}</header><div class="provider-chat-body">${item.messages.map((message) => `<article class="provider-chat-bubble ${message.from === "provider" ? "is-self" : ""}"><div class="provider-chat-bubble-role">${message.from === "provider" ? "门店" : message.from === "user" ? "客户" : "平台"}</div><p>${message.text}</p><time>${message.time}</time></article>`).join("")}</div><form class="provider-chat-composer" data-provider-chat-form data-provider-id="${item.id}"><input class="input" name="chatMessage" type="text" placeholder="输入消息并实时发送" autocomplete="off" required><button class="btn btn-primary" type="submit">发送</button></form></section>` : ""}</div>`).join("")}</div></section></div>`;
  }

  function renderProviderMe() {
    const active = state.subTab.me || "settlements";
    const rows = getProviderSettlementRows();
    const selected = rows.find((item) => item.id === state.providerSelected.settlements) || rows[0];
    return `${subTabs([{ id: "settlements", label: "结算管理" }, { id: "business", label: "营业情况" }, { id: "profile", label: "门店资料" }])}${active === "profile" ? `<div class="stack"><section class="admin-detail-card"><div class="eyebrow">Store Profile</div><h3>门店与账号信息</h3><div class="admin-kv-list"><div><span>门店名称</span><strong>${safe(getProviderStore().name, "高端改装门店")}</strong></div><div><span>联系人</span><strong>${safe(getProviderStore().contact, "-")}</strong></div><div><span>主营能力</span><strong>${safe(getProviderStore().specialties, "-")}</strong></div><div><span>工位数量</span><strong>${getProviderStore().bays || 0} 个</strong></div><div><span>门店状态</span><strong>${nProvider(getProviderStore().status)}</strong></div><div><span>账号角色</span><strong>门店管理员</strong></div></div><div class="admin-action-row"><button class="btn btn-secondary" type="button" data-provider-action="provider-profile-edit">更新门店资料</button><button class="btn btn-primary" type="button" data-provider-action="provider-profile-contact">联系平台客服</button></div></section></div>` : active === "business" ? renderProviderBusiness() : `<div class="mobile-list">${rows.map((item) => `<div class="admin-inline-block"><button class="mobile-item admin-pick-card ${selected?.id === item.id ? "active" : ""}" type="button" data-provider-pick data-provider-type="settlements" data-provider-id="${item.id}"><strong>${item.id}</strong><div class="muted" style="margin-top:8px;">${safe(item.amount, "-")} / ${safe(item.provider, "当前门店")}</div><div style="margin-top:10px;">${tag(nSettlement(item.status))}</div></button>${selected?.id === item.id ? renderProviderSettlementDetail(item) : ""}</div>`).join("")}</div>`}`;
  }

  function renderProviderDialog() {
    const { type, orderId } = state.providerDialog;
    if (!type || !orderId) return "";
    const order = getProviderOrderById(orderId);
    if (!order) return "";
    if (type === "accept") {
      return `<div class="modal visible"><div class="panel modal-card provider-dialog-card"><div class="eyebrow">Order Confirm</div><h3>确认接单</h3><p class="muted">确认后，该订单会进入施工中，并从待接单流转到施工流程。</p><div class="provider-dialog-summary"><strong>${orderId}</strong><span>${safe(order.vehicle, "车辆")} / ${safe(order.service, "服务")}</span></div><div class="admin-action-row"><button class="btn btn-primary" type="button" data-provider-dialog-action="confirm-accept" data-provider-id="${orderId}">确认接单</button><button class="btn btn-secondary" type="button" data-provider-dialog-action="close">取消</button></div></div></div>`;
    }
    if (type === "reject") {
      return `<div class="modal visible"><div class="panel modal-card provider-dialog-card"><div class="eyebrow">Reject Order</div><h3>填写拒单原因</h3><p class="muted">拒单后，平台会依据原因重新分配订单。</p><form class="form-grid" data-provider-reject-form data-provider-id="${orderId}"><div class="provider-dialog-summary"><strong>${orderId}</strong><span>${safe(order.vehicle, "车辆")} / ${safe(order.service, "服务")}</span></div><div class="field-group"><label class="field-label" for="reject-reason-${orderId}">拒单原因</label><textarea class="textarea" id="reject-reason-${orderId}" name="rejectReason" placeholder="请填写无法接单的具体原因" required>当前施工位已满，建议平台重新分配。</textarea></div><div class="admin-action-row"><button class="btn btn-danger" type="submit">提交拒单</button><button class="btn btn-secondary" type="button" data-provider-dialog-action="close">取消</button></div></form></div></div>`;
    }
    return "";
  }

  function getProviderStore() {
    return providers.find((item) => nAudit(item.auditStatus) === "已通过") || providers[0];
  }

  function getProviderAllOrders() {
    const store = getProviderStore();
    const rows = [...orders, ...providerOrderMocks];
    return rows.filter((item) => item.provider === store.name || item.intention === store.name);
  }

  function getProviderPendingOrders() {
    return getProviderAllOrders().filter((item) => {
      const status = nOrder(item.status);
      return status === "待分配" || status === "处理中";
    });
  }

  function getProviderProcessingOrders() {
    return getProviderAllOrders().filter((item) => nOrder(item.status) === "施工中");
  }

  function getProviderAcceptanceOrders() {
    return getProviderAllOrders().filter((item) => nOrder(item.status) === "待验收");
  }

  function providerOrderViewStatus(item, active) {
    const status = nOrder(item.status);
    if (active === "pending" && status === "待分配") return "待接单";
    if (status === "施工中") return "施工中";
    if (status === "待验收") return "待验收";
    if (status === "已完成") return "已完成";
    if (status === "处理中") return "已拒单";
    return status;
  }

  function getProviderOrderMeta(item) {
    return providerOrderExtras[item.id] || {
      phone: "13800130000",
      duration: "1 天",
      bay: "待排工位",
      remark: "请与客户确认具体施工需求和交付时间。",
      arrival: "等待客户确认到店时间",
    };
  }

  function getProviderOrderById(id) {
    return [...orders, ...providerOrderMocks].find((item) => item.id === id);
  }

  function renderProviderOrderDetail(item) {
    const status = nOrder(item.status);
    const meta = getProviderOrderMeta(item);
    const actions = [];
    const completionOpen = state.providerCompletion.orderId === item.id;
    if (status === "待分配" || status === "处理中") {
      actions.push(`<button class="btn btn-primary" type="button" data-provider-action="order-accept" data-provider-id="${item.id}">接单</button>`);
      actions.push(`<button class="btn btn-danger" type="button" data-provider-action="order-reject" data-provider-id="${item.id}">拒单</button>`);
    } else if (status === "施工中") {
      actions.push(`<button class="btn btn-primary" type="button" data-provider-action="${completionOpen ? "order-complete-cancel" : "order-complete"}" data-provider-id="${item.id}">${completionOpen ? "收起完工表单" : "提交完工"}</button>`);
    } else if (status === "待验收") {
      actions.push(`<button class="btn btn-secondary" type="button" data-provider-action="order-follow" data-provider-id="${item.id}">查看客户验收说明</button>`);
    }
    return `<section class="admin-detail-card"><div class="eyebrow">Order Workbench</div><h3>${item.id}</h3><div class="admin-kv-list"><div><span>用户</span><strong>${safe(item.user, "-")}</strong></div><div><span>联系电话</span><strong>${meta.phone}</strong></div><div><span>车辆</span><strong>${safe(item.vehicle, "-")}</strong></div><div><span>服务项目</span><strong>${safe(item.service, "-")}</strong></div><div><span>报价</span><strong>${safe(item.quote, "-")}</strong></div><div><span>预约时间</span><strong>${safe(item.appointment, "-")}</strong></div><div><span>到店信息</span><strong>${meta.arrival}</strong></div><div><span>预计工时</span><strong>${providerEstimateDuration(item)}</strong></div><div><span>客户意向</span><strong>${safe(item.intention, "未指定")}</strong></div><div><span>当前状态</span><strong>${providerOrderViewStatus(item, "all")}</strong></div></div><div class="admin-action-row">${actions.join("")}</div>${completionOpen ? renderProviderCompleteForm(item) : ""}<div class="admin-timeline"><div>${safe(item.progress, "等待处理")}</div><div>施工备注：${providerOrderRemark(item)}</div><div>门店视角：${status === "施工中" ? "施工进行中，请按节点提交完工。" : status === "待验收" ? "已提交完工资料，等待客户验收。" : "请尽快响应订单，提升接单转化。"}</div></div></section>`;
  }

  function renderProviderCompleteForm(item) {
    return `<form class="provider-complete-form" data-provider-complete-form data-provider-id="${item.id}"><div class="field-group"><label class="field-label" for="complete-note-${item.id}">完工说明</label><textarea class="textarea" id="complete-note-${item.id}" name="completeNote" placeholder="请填写施工完成情况、交付内容和客户注意事项" required>施工已完成，外观与功能已复检，交付前已与客户确认项目清单。</textarea></div><div class="form-grid"><div class="field-group"><label class="field-label" for="complete-images-${item.id}">上传图片</label><label class="upload-panel" for="complete-images-${item.id}"><input id="complete-images-${item.id}" class="upload-input" name="completeImages" type="file" accept="image/*" multiple><span class="upload-illustration"></span><strong>上传完工图片</strong><small>支持施工完成图、交付图、细节图，最多选择 9 张</small></label></div><div class="field-group"><label class="field-label" for="complete-check-${item.id}">提醒客户验收</label><input class="input" id="complete-check-${item.id}" name="acceptanceTips" type="text" value="请客户重点确认外观细节、功能联调与随车物品" required></div></div><div class="admin-action-row"><button class="btn btn-primary" type="submit">确认提交完工</button><button class="btn btn-secondary" type="button" data-provider-action="order-complete-cancel" data-provider-id="${item.id}">取消</button></div></form>`;
  }

  function providerEstimateDuration(item) {
    const meta = getProviderOrderMeta(item);
    if (meta.duration) return meta.duration;
    const service = String(item.service || "");
    if (service.includes("车衣") || service.includes("改色")) return "2-3 天";
    if (service.includes("轮毂") || service.includes("刹车")) return "1 天";
    if (service.includes("内饰") || service.includes("氛围灯")) return "1-2 天";
    return "0.5-1 天";
  }

  function providerOrderRemark(item) {
    const meta = getProviderOrderMeta(item);
    if (meta.remark) return meta.remark;
    const status = nOrder(item.status);
    if (status === "待分配") return "建议优先与客户确认到店时间，并预留基础施工资源。";
    if (status === "处理中") return "当前订单已拒单，等待平台根据拒单原因重新分配。";
    if (status === "施工中") return "请按施工节点拍照留档，便于后续完工验收。";
    if (status === "待验收") return "完工资料已提交，请保持电话畅通，等待客户验收反馈。";
    return "订单已进入稳定阶段，注意客户回访与售后记录。";
  }

  function getProviderPurchasableProducts() {
    return products.slice(0, 4);
  }

  function getProviderPurchaseRecords() {
    return providerPurchaseRecords;
  }

  function providerProductModel(item) {
    return safe(item.model || item.spec || item.fitment || item.sku, "标准型号");
  }

  function renderProviderProductDetail(item, active) {
    if (active === "purchase") {
      const purchaseOpen = state.providerPurchase.sku === item.sku;
      return `<section class="admin-detail-card"><div class="eyebrow">Purchase Action</div><div class="provider-product-hero"><div class="provider-product-visual large" data-product-tone="${(item.brand || "").length % 3}"><span>${safe(item.category, "商品")}</span></div><div><h3>${safe(item.name, "商品采购")}</h3><div class="muted" style="margin-top:8px;">${safe(item.description, "商品说明待补充")}</div></div></div><div class="admin-kv-list"><div><span>品牌</span><strong>${safe(item.brand, "-")}</strong></div><div><span>型号</span><strong>${providerProductModel(item)}</strong></div><div><span>类目</span><strong>${safe(item.category, "-")}</strong></div><div><span>价格</span><strong>${safe(item.price, "-")}</strong></div><div><span>库存状态</span><strong>${nProduct(item.status)}</strong></div></div><div class="admin-action-row"><button class="btn btn-primary" type="button" data-provider-action="${purchaseOpen ? "product-purchase-cancel" : "product-purchase"}" data-provider-id="${item.sku}">${purchaseOpen ? "收起采购表单" : "采购"}</button></div>${purchaseOpen ? renderProviderPurchaseForm(item) : ""}</section>`;
    }
    return `<section class="admin-detail-card"><div class="eyebrow">Purchase Record</div><h3>${safe(item.id, "采购记录")}</h3><div class="admin-kv-list"><div><span>商品</span><strong>${safe(item.name, "-")}</strong></div><div><span>型号</span><strong>${providerProductModel(item)}</strong></div><div><span>数量</span><strong>${item.quantity || 1}</strong></div><div><span>金额</span><strong>${safe(item.amount, "-")}</strong></div><div><span>状态</span><strong>${nPurchaseStatus(item.status)}</strong></div><div><span>进度说明</span><strong>${safe(item.note, "-")}</strong></div></div><div class="admin-action-row"><button class="btn btn-secondary" type="button" data-provider-action="purchase-record-detail" data-provider-id="${item.id}">查看记录</button></div></section>`;
  }

  function renderProviderPurchaseForm(item) {
    return `<form class="provider-complete-form" data-provider-purchase-form data-provider-id="${item.sku}"><div class="form-grid"><div class="field-group"><label class="field-label" for="purchase-quantity-${item.sku}">采购数量</label><input class="input" id="purchase-quantity-${item.sku}" name="purchaseQuantity" type="number" min="1" max="99" value="1" required></div><div class="field-group"><label class="field-label" for="purchase-note-${item.sku}">采购备注</label><input class="input" id="purchase-note-${item.sku}" name="purchaseNote" type="text" value="门店补货采购" required></div></div><div class="admin-action-row"><button class="btn btn-primary" type="submit">确认采购</button><button class="btn btn-secondary" type="button" data-provider-action="product-purchase-cancel" data-provider-id="${item.sku}">取消</button></div></form>`;
  }

  function renderProviderCaseForm(item) {
    const editing = !!item;
    return `<form class="provider-complete-form" data-provider-case-form data-provider-id="${editing ? item.id : ""}"><div class="form-grid"><div class="field-group"><label class="field-label" for="case-title-${editing ? item.id : "new"}">案例标题</label><input class="input" id="case-title-${editing ? item.id : "new"}" name="caseTitle" type="text" value="${editing ? safe(item.title, "") : ""}" required></div><div class="field-group"><label class="field-label" for="case-model-${editing ? item.id : "new"}">车型</label><input class="input" id="case-model-${editing ? item.id : "new"}" name="caseModel" type="text" value="${editing ? safe(item.model, "") : ""}" required></div><div class="field-group"><label class="field-label" for="case-cost-${editing ? item.id : "new"}">费用区间</label><input class="input" id="case-cost-${editing ? item.id : "new"}" name="caseCost" type="text" value="${editing ? safe(item.cost, "") : ""}" required></div><div class="field-group"><label class="field-label" for="case-images-${editing ? item.id : "new"}">上传图片</label><label class="upload-panel" for="case-images-${editing ? item.id : "new"}"><input id="case-images-${editing ? item.id : "new"}" class="upload-input" name="caseImages" type="file" accept="image/*" multiple><span class="upload-illustration"></span><strong>上传案例图片</strong><small>支持封面图、施工过程图、完工图，最多选择 9 张</small></label></div><div class="field-group"><label class="field-label" for="case-desc-${editing ? item.id : "new"}">案例说明</label><textarea class="textarea" id="case-desc-${editing ? item.id : "new"}" name="caseDesc" required>${editing ? safe(item.description || item.style, "") : "请填写改装项目、施工亮点和交付效果。"}</textarea></div></div><div class="admin-action-row"><button class="btn btn-primary" type="submit">${editing ? "保存案例" : "新增案例"}</button><button class="btn btn-secondary" type="button" data-provider-action="case-form-cancel" data-provider-id="${editing ? item.id : ""}">取消</button></div></form>`;
  }

  function getProviderCaseRows() {
    return cases.slice(0, 4);
  }

  function getProviderForumRows() {
    return posts.slice(0, 4);
  }

  function renderProviderCaseDetail(item) {
    const editing = state.providerCaseForm.mode === "edit" && state.providerCaseForm.id === item.id;
    return `<section class="admin-detail-card"><div class="eyebrow">Case Operation</div><h3>${safe(item.title, "案例详情")}</h3><div class="admin-kv-list"><div><span>车型</span><strong>${safe(item.model, "-")}</strong></div><div><span>费用区间</span><strong>${safe(item.cost, "-")}</strong></div><div><span>审核状态</span><strong>${nCaseAudit(item.audit)}</strong></div><div><span>展示状态</span><strong>${nCaseDisplay(item.display)}</strong></div></div><div class="admin-action-row"><button class="btn btn-primary" type="button" data-provider-action="case-submit" data-provider-id="${item.id}">提交审核</button><button class="btn btn-secondary" type="button" data-provider-action="${editing ? "case-form-cancel" : "case-edit"}" data-provider-id="${item.id}">${editing ? "取消编辑" : "编辑案例"}</button></div>${editing ? renderProviderCaseForm(item) : ""}</section>`;
  }

  function renderProviderForumDetail(item) {
    return `<section class="admin-detail-card"><div class="eyebrow">Forum Operation</div><h3>${safe(item.title, "帖子详情")}</h3><div class="admin-kv-list"><div><span>互动</span><strong>回复 ${item.replies || 0} / 点赞 ${item.likes || 0}</strong></div><div><span>当前状态</span><strong>${nForum(item.status)}</strong></div></div><div class="admin-action-row"><button class="btn btn-primary" type="button" data-provider-action="forum-reply" data-provider-id="${item.id}">查看评论</button><button class="btn btn-secondary" type="button" data-provider-action="forum-toggle" data-provider-id="${item.id}">${nForum(item.status) === "已删除" ? "恢复显示" : "删除帖子"}</button></div></section>`;
  }

  function getProviderSettlementRows() {
    const store = getProviderStore();
    const rows = settlements.filter((item) => item.provider === store.name);
    return rows.length ? rows : settlements.slice(0, 3).map((item) => ({ ...item, provider: store.name }));
  }

  function renderProviderBusiness() {
    const store = getProviderStore();
    const allOrders = getProviderAllOrders();
    const completedOrders = allOrders.filter((item) => nOrder(item.status) === "已完成").length;
    const processingOrders = allOrders.filter((item) => nOrder(item.status) === "施工中").length;
    const acceptanceOrders = allOrders.filter((item) => nOrder(item.status) === "待验收").length;
    const pendingPurchase = getProviderPurchaseRecords().filter((item) => nPurchaseStatus(item.status) !== "已签收").length;
    const caseCount = getProviderCaseRows().length;
    const revenue = getProviderSettlementRows()
      .map((item) => Number(String(item.amount || "").replace(/[^\d.]/g, "")) || 0)
      .reduce((sum, value) => sum + value, 0);
    return `<div class="stack"><section class="hero-banner"><div class="eyebrow">Business Overview</div><h3 style="margin:10px 0 8px; font-size:28px; font-family:var(--font-display);">门店营业情况</h3><p class="muted">${safe(store.name, "当前门店")} 的接单、施工、验收和采购情况都汇总在这里。</p></section><section class="mobile-grid-2"><article class="m3-card"><div class="muted">累计完成订单</div><span class="mobile-stat">${completedOrders}</span><div class="muted">本阶段已完工并交付客户</div></article><article class="m3-card"><div class="muted">施工中订单</div><span class="mobile-stat">${processingOrders}</span><div class="muted">当前正在施工的订单数量</div></article><article class="m3-card"><div class="muted">待客户验收</div><span class="mobile-stat">${acceptanceOrders}</span><div class="muted">已提交完工，等待客户确认</div></article><article class="m3-card"><div class="muted">采购跟进中</div><span class="mobile-stat">${pendingPurchase}</span><div class="muted">待发货或运输中的采购记录</div></article></section><section class="admin-detail-card"><div class="eyebrow">Store Status</div><h3>今日营业概览</h3><div class="admin-kv-list"><div><span>门店营业状态</span><strong>${nProvider(store.status)}</strong></div><div><span>门店工位数量</span><strong>${store.bays || 0} 个</strong></div><div><span>案例展示数量</span><strong>${caseCount} 个</strong></div><div><span>累计结算金额</span><strong>¥${revenue.toLocaleString("zh-CN")}</strong></div></div><div class="admin-timeline"><div>当前门店施工节奏稳定，可继续处理新接订单。</div><div>如有待验收订单，建议及时在消息页跟进客户反馈。</div><div>采购记录已并入运营页，可在发货后同步安排施工计划。</div></div></section></div>`;
  }

  function renderProviderSettlementDetail(item) {
    return `<section class="admin-detail-card"><div class="eyebrow">Settlement</div><h3>${item.id}</h3><div class="admin-kv-list"><div><span>门店</span><strong>${safe(item.provider, "-")}</strong></div><div><span>结算金额</span><strong>${safe(item.amount, "-")}</strong></div><div><span>状态</span><strong>${nSettlement(item.status)}</strong></div></div><div class="admin-action-row"><button class="btn btn-primary" type="button" data-provider-action="settlement-apply" data-provider-id="${item.id}">发起结算申请</button><button class="btn btn-secondary" type="button" data-provider-action="settlement-detail" data-provider-id="${item.id}">查看详情</button></div></section>`;
  }

  function handleProviderAction(button) {
    const action = button.dataset.providerAction;
    const id = button.dataset.providerId || "";
    if (action.startsWith("order-")) {
      const target = getProviderOrderById(id);
      if (!target) return;
      state.providerFeedback = "";
      if (action === "order-accept") {
        state.providerDialog = { type: "accept", orderId: id };
      } else if (action === "order-reject") {
        state.providerDialog = { type: "reject", orderId: id };
      } else if (action === "order-complete") {
        state.providerCompletion.orderId = id;
      } else if (action === "order-complete-cancel") {
        state.providerCompletion.orderId = "";
      } else if (action === "order-follow") {
        target.progress = "已与客户确认验收时间，等待客户完成验收";
        state.providerFeedback = `${id} 已更新客户验收跟进说明。`;
      }
      render();
      return;
    }
    if (action.startsWith("product-")) {
      if (action === "product-purchase") {
        state.providerPurchase.sku = id;
      } else if (action === "product-purchase-cancel") {
        state.providerPurchase.sku = "";
      }
      render();
      return;
    }
    if (action.startsWith("case-")) {
      if (action === "case-add") {
        state.providerCaseForm = { mode: "create", id: "" };
        render();
        return;
      }
      const target = cases.find((item) => item.id === id);
      if (action === "case-form-cancel") {
        state.providerCaseForm = { mode: "", id: "" };
        render();
        return;
      }
      if (!target && action !== "case-submit") return;
      if (action === "case-submit" && target) {
        target.audit = "待审核";
        state.providerFeedback = `${safe(target.title, "案例")} 已提交审核。`;
      }
      if (action === "case-edit" && target) {
        state.providerCaseForm = { mode: "edit", id };
      }
      render();
      return;
    }
    if (action.startsWith("forum-")) {
      const target = posts.find((item) => item.id === id);
      if (target && action === "forum-toggle") target.status = nForum(target.status) === "已删除" ? "正常" : "已删除";
      render();
      return;
    }
    if (action.startsWith("settlement-")) {
      const target = settlements.find((item) => item.id === id);
      if (target && action === "settlement-apply") target.status = "审核中";
      render();
      return;
    }
    render();
  }

  function handleProviderCompleteSubmit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const id = form.dataset.providerId || "";
    const target = getProviderOrderById(id);
    if (!target) return;
    const formData = new FormData(form);
    const completeNote = String(formData.get("completeNote") || "").trim();
    const acceptanceTips = String(formData.get("acceptanceTips") || "").trim();
    const imageCount = form.querySelector('input[name="completeImages"]')?.files?.length || 0;
    if (!completeNote || !acceptanceTips) return;
    target.status = "待验收";
    target.progress = `门店已提交完工资料：${completeNote} / 已上传 ${imageCount} 张图片 / 提醒客户：${acceptanceTips}`;
    const extra = providerOrderExtras[id] || (providerOrderExtras[id] = {});
    extra.arrival = `已上传完工图片 ${imageCount} 张，待客户验收`;
    extra.remark = acceptanceTips;
    state.providerCompletion.orderId = "";
    state.subTab.orders = "acceptance";
    state.providerSelected.orders = id;
    state.providerFeedback = `${id} 已提交完工资料和图片，等待客户验收。`;
    render();
  }

  function handleProviderPurchaseSubmit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const sku = form.dataset.providerId || "";
    const product = getProviderPurchasableProducts().find((item) => item.sku === sku);
    if (!product) return;
    const formData = new FormData(form);
    const quantity = Math.max(1, Number(formData.get("purchaseQuantity") || 1));
    const note = String(formData.get("purchaseNote") || "").trim() || "门店补货采购";
    const id = `PO-${Date.now().toString().slice(-6)}`;
    providerPurchaseRecords.unshift({
      id,
      sku: product.sku,
      name: product.name,
      brand: product.brand,
      model: providerProductModel(product),
      category: product.category,
      quantity,
      amount: `${product.price} x${quantity}`,
      status: "待发货",
      note,
    });
    state.providerPurchase.sku = "";
    state.subTab.operations = "record";
    state.providerSelected.products = id;
    state.providerFeedback = `${safe(product.name, "商品")} 已采购 ${quantity} 件，已加入采购记录。`;
    render();
  }

  function handleProviderCaseSubmit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const id = form.dataset.providerId || "";
    const formData = new FormData(form);
    const title = String(formData.get("caseTitle") || "").trim();
    const model = String(formData.get("caseModel") || "").trim();
    const cost = String(formData.get("caseCost") || "").trim();
    const desc = String(formData.get("caseDesc") || "").trim();
    const imageCount = form.querySelector('input[name="caseImages"]')?.files?.length || 0;
    const caseDesc = imageCount ? `${desc} / 已上传 ${imageCount} 张案例图片` : desc;
    if (!title || !model || !cost || !desc) return;
    if (id) {
      const target = cases.find((item) => item.id === id);
      if (!target) return;
      target.title = title;
      target.model = model;
      target.cost = cost;
      target.style = caseDesc;
      target.description = caseDesc;
      state.providerSelected.cases = id;
      state.providerFeedback = `${title} 已更新。`;
    } else {
      const newId = `CASE-${Date.now().toString().slice(-6)}`;
      cases.unshift({
        id: newId,
        title,
        model,
        cost,
        style: caseDesc,
        description: caseDesc,
        provider: getProviderStore().name,
        audit: "待提交",
        display: "未展示",
      });
      state.providerSelected.cases = newId;
      state.providerFeedback = `${title} 已新增，可继续提交审核。`;
    }
    state.providerCaseForm = { mode: "", id: "" };
    state.subTab.operations = "cases";
    render();
  }

  function handleProviderChatSubmit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const id = form.dataset.providerId || "";
    const target = fallback.providerMessages.find((item) => item.id === id);
    if (!target) return;
    const formData = new FormData(form);
    const text = String(formData.get("chatMessage") || "").trim();
    if (!text) return;
    const now = new Date();
    const time = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    target.messages.push({ from: "provider", text, time });
    target.preview = text;
    target.time = time;
    target.status = "沟通中";
    state.providerSelected.messages = id;
    state.providerFeedback = `${target.title} 已发送新消息。`;
    render();
  }

  function handleProviderDialogAction(button) {
    const action = button.dataset.providerDialogAction;
    const id = button.dataset.providerId || state.providerDialog.orderId;
    if (action === "close") {
      state.providerDialog = { type: "", orderId: "" };
      render();
      return;
    }
    if (action === "confirm-accept") {
      const target = getProviderOrderById(id);
      if (!target) return;
      target.status = "施工中";
      target.progress = "门店已接单，施工位已预留";
      state.providerDialog = { type: "", orderId: "" };
      state.providerFeedback = `${id} 已接单，订单已进入施工中。`;
      render();
    }
  }

  function handleProviderRejectSubmit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const id = form.dataset.providerId || "";
    const target = getProviderOrderById(id);
    if (!target) return;
    const reason = String(new FormData(form).get("rejectReason") || "").trim();
    if (!reason) return;
    target.status = "处理中";
    target.progress = `门店已拒单：${reason}`;
    state.providerDialog = { type: "", orderId: "" };
    state.providerFeedback = `${id} 已拒单，平台将根据拒单原因重新分配。`;
    render();
  }

  function renderUser() { if (state.tab === "home") return `<div class="stack"><section class="hero-banner"><div class="eyebrow">Inspiration</div><h3 style="margin:10px 0 8px; font-size:28px; font-family:var(--font-display);">高端改装推荐</h3><p class="muted">${fallback.userBanners[0]}</p></section><section class="mobile-list">${cases.map((i) => `<article class="mobile-item"><strong>${safe(i.title, "案例")}</strong><div class="muted" style="margin-top:8px;">${safe(i.model, "车型")} / ${safe(i.style, "风格")}</div><div style="margin-top:10px; display:flex; gap:10px;"><span class="pill">${safe(i.cost, "-")}</span>${tag(nCaseDisplay(i.display))}</div></article>`).join("")}</section></div>`; if (state.tab === "mall") { const active = state.subTab.mall || "goods"; return `${subTabs([{ id: "goods", label: "商品列表" }, { id: "service", label: "服务下单" }])}<div class="mobile-list">${(active === "goods" ? products : services).map((i) => active === "goods" ? `<article class="mobile-item"><strong>${safe(i.name, "商品")}</strong><div class="muted" style="margin-top:8px;">${safe(i.brand, "品牌")} / ${safe(i.fitment, "适配车型")}</div><div style="margin-top:10px; display:flex; gap:10px;"><span class="pill">${safe(i.price, "-")}</span>${tag(nProduct(i.status))}</div></article>` : `<article class="mobile-item"><strong>${safe(i.name, "服务")}</strong><div class="muted" style="margin-top:8px;">${safe(i.desc, "服务说明")}</div><div style="margin-top:10px;"><span class="pill">${safe(i.price, "-")}</span></div></article>`).join("")}</div>`; } if (state.tab === "garage") { const active = state.subTab.garage || "render"; return `${subTabs([{ id: "vehicles", label: "我的车辆" }, { id: "render", label: "渲染展示" }])}${active === "vehicles" ? `<div class="mobile-list">${vehicles.map((i) => `<article class="mobile-item"><strong>${safe(i.model, "车辆")}</strong><div class="muted" style="margin-top:8px;">${safe(i.plate, "-")} / ${safe(i.owner, "-")}</div><div style="margin-top:8px;">${safe(i.history, "改装记录")}</div></article>`).join("")}</div>` : `<div class="stack"><section class="garage-preview"><div class="eyebrow">Render Lab</div><strong style="display:block; margin-top:10px; font-size:22px;">宝马 G20 330i 外观预览</strong><div class="muted" style="margin-top:6px;">点击切换车身颜色与轮毂样式，当前方案仅做图片式渲染模拟。</div><div class="car-render"><div class="car-wheel left" id="leftWheel"></div><div class="car-wheel right" id="rightWheel"></div><div class="car-render-body" id="carBody"></div></div><div class="swatch-row">${fallback.colors.map((i, idx) => `<button class="swatch ${idx === state.garageColor ? "active" : ""}" style="background:${i.value};" type="button" title="${i.name}" data-color-index="${idx}"></button>`).join("")}</div></section><section class="mobile-list">${fallback.wheels.map((i, idx) => `<button class="wheel-option ${idx === state.garageWheel ? "active" : ""}" type="button" data-wheel-index="${idx}"><span><strong>${i.name}</strong><div class="muted" style="margin-top:6px;">${i.spokes} 辐设计 / 高端改装风格</div></span><span class="wheel-badge" data-tone="${idx === 0 ? "gold" : idx === 1 ? "grey" : "silver"}"></span></button>`).join("")}</section></div>`}`; } if (state.tab === "forum") { const active = state.subTab.forum || "posts"; return `${subTabs([{ id: "posts", label: "帖子列表" }, { id: "mine", label: "我的发布" }])}<div class="mobile-list">${(active === "posts" ? posts : comments).map((i) => active === "posts" ? `<article class="mobile-item"><strong>${safe(i.title, "帖子")}</strong><div class="muted" style="margin-top:8px;">${safe(i.author, "作者")} / ${safe(i.time, "今天")}</div><div style="margin-top:10px; display:flex; gap:10px;"><span class="pill">回复 ${i.replies || 0}</span><span class="pill">点赞 ${i.likes || 0}</span></div></article>` : `<article class="mobile-item"><strong>${safe(i.content, "评论")}</strong><div class="muted" style="margin-top:8px;">所属 ${safe(i.post, "帖子")} / ${safe(i.time, "今天")}</div></article>`).join("")}</div>`; } return `<div class="stack"><section class="mobile-list">${orders.slice(0, 4).map((i) => `<article class="mobile-item"><strong>${i.id}</strong><div class="muted" style="margin-top:8px;">${safe(i.vehicle, "车型")}</div><div style="margin-top:8px;">${safe(i.service, "服务")}</div><div style="margin-top:10px;">${tag(nOrder(i.status))}</div></article>`).join("")}<article class="mobile-item"><strong>我的资料</strong><div class="muted" style="margin-top:8px;">地址管理、消息通知、金融授信与基础设置。</div></article></section></div>`; }

  function updateGarageRender() { const color = fallback.colors[state.garageColor]; const wheel = fallback.wheels[state.garageWheel]; const body = document.getElementById("carBody"); const leftWheel = document.getElementById("leftWheel"); const rightWheel = document.getElementById("rightWheel"); if (!body || !leftWheel || !rightWheel) return; body.style.background = `linear-gradient(145deg, ${shade(color.value, -18)}, ${color.value})`; const g = `radial-gradient(circle, #a3a9b3 0 10%, ${shade(wheel.color, -30)} 12% 44%, #0a0d11 46% 100%)`; leftWheel.style.background = g; rightWheel.style.background = g; screenEl.querySelectorAll("[data-color-index]").forEach((e, i) => e.classList.toggle("active", i === state.garageColor)); screenEl.querySelectorAll("[data-wheel-index]").forEach((e, i) => e.classList.toggle("active", i === state.garageWheel)); }
  function shade(hex, amount) { const v = hex.replace("#", ""); const size = v.length === 3 ? 1 : 2; const parts = []; for (let i = 0; i < 3; i += 1) { const s = i * size; const c = size === 1 ? parseInt(v[s] + v[s], 16) : parseInt(v.slice(s, s + 2), 16); const n = Math.max(0, Math.min(255, c + amount)); parts.push(n.toString(16).padStart(2, "0")); } return `#${parts.join("")}`; }

  render();
  updateGarageRender();
})();
