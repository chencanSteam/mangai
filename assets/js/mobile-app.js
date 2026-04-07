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
    userSelected: {
      goods: products[0]?.sku || "",
      service: services[0]?.id || services[0]?.name || "",
    },
    userMallPage: "",
    userOrderForm: {
      type: "",
      id: "",
    },
    userFeedback: "",
    userMe: {
      selectedOrder: orders[0]?.id || "",
      selectedMessage: "msg-2",
      addressCreateOpen: false,
    },
    userGarage: {
      selectedVehicle: vehicles[0]?.id || vehicles[0]?.plate || vehicles[0]?.model || "",
      createOpen: false,
    },
    userForum: {
      selectedPost: posts[0]?.id || "",
      createOpen: false,
      replyPostId: "",
    },
    userDialog: {
      type: "",
      orderId: "",
      sourceName: "",
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
    userBanners: [
      "M3 Touring 轻度姿态方案本周热度上涨 26%，适合春季城市通勤与周末山路。",
      "AMG 夜间氛围灯套件支持分区联动，新增车主到店体验预约。",
      "高性能街道刹车套装到货，适配宝马 G 系与奥迪 S/RS 常见车型。",
    ],
    providerMessages: [
      { id: "msg-1", title: "平台调度", preview: "OD-240403-021 已派送至当前门店，请尽快接单。", time: "刚刚", status: "在线", messages: [{ from: "platform", text: "OD-240403-021 已派送至当前门店，请尽快接单并安排施工位。", time: "09:42" }, { from: "provider", text: "收到，正在确认施工位，5 分钟内反馈。", time: "09:43" }] },
      { id: "msg-2", title: "客户验收群", preview: "客户想确认尾段排气声浪是否已调校完成。", time: "12 分钟前", status: "沟通中", messages: [{ from: "user", text: "想确认尾段排气声浪是否已经调校完成？", time: "09:18" }, { from: "provider", text: "已经完成联调，稍后我把完工视频发您确认。", time: "09:20" }] },
      { id: "msg-3", title: "采购物流", preview: "BBS 轮毂已发货，预计明天下午送达。", time: "35 分钟前", status: "已发货", messages: [{ from: "platform", text: "BBS 轮毂已发货，预计明天下午送达门店。", time: "08:55" }, { from: "provider", text: "收到，到货后我这边安排签收。", time: "08:58" }] },
      { id: "msg-4", title: "运营审核", preview: "案例 AMG C43 排气升级建议补充完工图。", time: "今天 09:10", status: "待回复", messages: [{ from: "platform", text: "案例《AMG C43 排气升级》建议补充完工图后再次提交。", time: "09:10" }, { from: "provider", text: "明白，我补充完工图后重新提审。", time: "09:12" }] },
    ],
    userHistoryOrders: [
      { id: "UO-240401", user: "当前用户", vehicle: "宝马 G20 330i", service: "BBS 轮毂套装 x1", quote: "¥ 18,800", status: "待验收", progress: "商品已安装完成，等待用户确认验收。", appointment: "2026-04-01 14:00" },
      { id: "UO-240328", user: "当前用户", vehicle: "AMG C43", service: "Akrapovic 排气升级", quote: "¥ 31,500", status: "已完成", progress: "已完成验收并归档。", appointment: "2026-03-28 10:30" },
      { id: "UO-240320", user: "当前用户", vehicle: "保时捷 718 Cayman", service: "XPEL 车衣施工", quote: "¥ 12,600", status: "施工中", progress: "门店已接单，正在施工中。", appointment: "2026-03-20 09:00" },
    ],
    userAddresses: [
      { id: "ADDR-1", name: "周恺", phone: "13800138000", address: "上海市闵行区申长路 1688 号 2 栋 801", tag: "默认地址" },
      { id: "ADDR-2", name: "周恺", phone: "13800138000", address: "杭州市滨江区江南大道 588 号 1 单元 1202", tag: "常用地址" },
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
      ${appType === "provider" ? renderProviderDialog() : appType === "user" ? renderUserDialog() : ""}
    `;
    bindEvents();
  }

  function bindEvents() {
    screenEl.querySelectorAll("[data-tab]").forEach((b) => b.addEventListener("click", () => {
      state.tab = b.dataset.tab;
      if (b.dataset.tab === "mall") state.userMallPage = "";
      render();
    }));
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
    screenEl.querySelectorAll("[data-user-pick]").forEach((b) => b.addEventListener("click", () => {
      if (b.dataset.userType === "garage-vehicle") {
        state.userGarage.selectedVehicle = b.dataset.userId;
      } else {
        state.userSelected[b.dataset.userType] = b.dataset.userId;
      }
      render();
    }));
    screenEl.querySelectorAll("[data-user-action]").forEach((b) => b.addEventListener("click", () => handleUserAction(b)));
    screenEl.querySelectorAll("select[data-user-action='user-vehicle-select']").forEach((s) => s.addEventListener("change", () => handleUserAction(s)));
    screenEl.querySelectorAll("[data-user-order-form]").forEach((form) => form.addEventListener("submit", handleUserOrderSubmit));
    screenEl.querySelectorAll("[data-user-vehicle-form]").forEach((form) => form.addEventListener("submit", handleUserVehicleSubmit));
    screenEl.querySelectorAll("[data-user-forum-form]").forEach((form) => form.addEventListener("submit", handleUserForumSubmit));
    screenEl.querySelectorAll("[data-user-forum-reply-form]").forEach((form) => form.addEventListener("submit", handleUserForumReplySubmit));
    screenEl.querySelectorAll("[data-user-chat-form]").forEach((form) => form.addEventListener("submit", handleUserChatSubmit));
    screenEl.querySelectorAll("[data-user-address-form]").forEach((form) => form.addEventListener("submit", handleUserAddressSubmit));
    screenEl.querySelectorAll("[data-user-dialog-action]").forEach((b) => b.addEventListener("click", () => handleUserDialogAction(b)));
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

  function renderUserDialog() {
    const { type, orderId, sourceName } = state.userDialog;
    if (!type) return "";
    if (type === "vehicle-create") {
      return `<div class="modal visible"><div class="panel modal-card provider-dialog-card"><div class="eyebrow">New Vehicle</div><h3>新增车辆</h3><p class="muted">选择车辆型号，填写车牌号，并上传一张车辆图片用于爱车档案展示。</p>${renderUserVehicleForm()}</div></div>`;
    }
    if (type === "service-upsell") {
      return `<div class="modal visible"><div class="panel modal-card provider-dialog-card"><div class="eyebrow">Payment Success</div><h3>是否需要改装服务？</h3><p class="muted">${safe(sourceName, "商品")} 已完成付款，是否同步预约门店安装或改装服务？</p><div class="provider-dialog-summary"><strong>${orderId}</strong><span>可继续选择到店安装、调校或施工服务</span></div><div class="admin-action-row"><button class="btn btn-primary" type="button" data-user-dialog-action="need-service">需要改装服务</button><button class="btn btn-secondary" type="button" data-user-dialog-action="skip-service">暂不需要</button></div></div></div>`;
    }
    if (type === "provider-pick") {
      const options = providers.filter((item) => nAudit(item.auditStatus) === "已通过").slice(0, 3);
      return `<div class="modal visible"><div class="panel modal-card provider-dialog-card"><div class="eyebrow">Provider Select</div><h3>选择意向服务商</h3><p class="muted">请选择承接 ${safe(sourceName, "商品")} 安装或改装服务的意向门店，也可以交由平台统一派单。</p><div class="admin-suggest-list">${options.map((item, index) => `<button class="admin-suggest-item" type="button" data-user-dialog-action="pick-provider" data-provider-id="${item.id}"><strong>${safe(item.name, "服务商")}</strong><span>${safe(item.city, "城市")} / ${safe(item.specialties, "改装服务")} / 参考价格 ¥${(index + 1) * 800 + 1200}</span></button>`).join("")}</div><div class="admin-action-row"><button class="btn btn-primary" type="button" data-user-dialog-action="platform-assign">由平台派单</button><button class="btn btn-secondary" type="button" data-user-dialog-action="provider-back">返回</button></div></div></div>`;
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

  function renderUser() {
    if (state.tab === "home" && typeof window !== "undefined" && window.location.pathname.endsWith("/pages/user-app.html")) {
      return `<div class="stack"><section class="hero-banner"><div class="eyebrow">PREMIUM MOD</div><h3 style="margin:10px 0 8px; font-size:28px; font-family:var(--font-display);">精选改装</h3><p class="muted">赛道基因，保时捷 911 GT3 RS 碳纤维宽体方案发布。</p><div class="admin-action-row" style="margin-top:18px;"><a class="btn btn-primary" href="user-case-detail.html">立即探索</a></div></section><section class="mobile-grid-2"><button class="mobile-item" style="text-align:left; border:0; width:100%; cursor:pointer;" type="button" data-tab="mall"><div class="eyebrow">Mall</div><strong>改装商城</strong><div class="muted" style="margin-top:8px;">全球正品配件</div></button><button class="mobile-item" style="text-align:left; border:0; width:100%; cursor:pointer;" type="button" data-tab="forum"><div class="eyebrow">Forum</div><strong>社区交流</strong><div class="muted" style="margin-top:8px;">硬核改装日记</div></button></section><button class="mobile-item" style="text-align:left; border:0; width:100%; cursor:pointer;" type="button" data-tab="garage"><div style="display:flex; justify-content:space-between; gap:16px; align-items:center;"><div><div class="eyebrow">Garage</div><strong style="display:block; margin-top:6px;">我的爱车</strong><div class="muted" style="margin-top:8px;">管理你的改装进度</div></div><div class="pill">已绑定 2 台</div></div></button><section><div style="display:flex; justify-content:space-between; align-items:center; gap:12px; margin-bottom:12px;"><h3 style="margin:0; font-size:22px;">热门话题 <span style="color:var(--brand);">TRENDING</span></h3><a class="muted" href="user-topic-detail.html">查看更多</a></div><div class="mobile-grid-2"><a class="mobile-item" style="display:block; text-decoration:none; color:inherit;" href="user-topic-detail.html"><div class="eyebrow"># 暗夜聚会</div><strong>魔都午夜巡游改装盛典回顾</strong><div class="muted" style="margin-top:8px;">夜景街拍、姿态案例与精选现场瞬间。</div></a><a class="mobile-item" style="display:block; text-decoration:none; color:inherit;" href="user-topic-detail.html"><div class="eyebrow"># 技术解析</div><strong>为什么锻造轮毂更适合高性能街道设定</strong><div class="muted" style="margin-top:8px;">轻量化、强度和簧下质量一次讲透。</div></a></div></section><section><div style="display:flex; justify-content:space-between; align-items:center; gap:12px; margin-bottom:12px;"><h3 style="margin:0; font-size:22px;">最新动态 <span style="color:var(--brand);">LATEST</span></h3></div><div class="mobile-list"><a class="mobile-item" style="display:block; text-decoration:none; color:inherit;" href="user-news-detail.html"><strong>全新宝马 M4 改装案例：打造街道赛道双重利器</strong><div class="muted" style="margin-top:8px;">作者：改装大神林哥 · 2 小时前</div><div style="margin-top:10px; display:flex; gap:10px; flex-wrap:wrap;"><span class="pill">精品案例</span><span class="pill">4.2w 浏览</span></div></a><a class="mobile-item" style="display:block; text-decoration:none; color:inherit;" href="user-news-detail.html"><strong>姿态玩家必看：空气避震安装避坑指南</strong><div class="muted" style="margin-top:8px;">作者：StanceWorks · 5 小时前</div><div style="margin-top:10px; display:flex; gap:10px; flex-wrap:wrap;"><span class="pill">技术干货</span><span class="pill">1.8w 浏览</span></div></a></div></section></div>`;
    }
    if (state.tab === "home") {
      return `<div class="stack"><section class="hero-banner"><div class="eyebrow">PREMIUM MOD</div><h3 style="margin:10px 0 8px; font-size:28px; font-family:var(--font-display);">精选改装</h3><p class="muted">赛道基因，保时捷 911 GT3 RS 碳纤维宽体方案发布。</p><div class="admin-action-row" style="margin-top:18px;"><button class="btn btn-primary" type="button">立即探索</button></div></section><section class="mobile-grid-2"><article class="mobile-item"><div class="eyebrow">Mall</div><strong>改装商城</strong><div class="muted" style="margin-top:8px;">全球正品配件</div></article><article class="mobile-item"><div class="eyebrow">Forum</div><strong>社区交流</strong><div class="muted" style="margin-top:8px;">硬核改装日记</div></article></section><section class="mobile-item"><div style="display:flex; justify-content:space-between; gap:16px; align-items:center;"><div><div class="eyebrow">Garage</div><strong style="display:block; margin-top:6px;">我的爱车</strong><div class="muted" style="margin-top:8px;">管理你的改装进度</div></div><div class="pill">已绑定 2 台</div></div></section><section><div style="display:flex; justify-content:space-between; align-items:center; gap:12px; margin-bottom:12px;"><h3 style="margin:0; font-size:22px;">热门话题 <span style="color:var(--brand);">TRENDING</span></h3><span class="muted">查看更多</span></div><div class="mobile-grid-2"><article class="mobile-item"><div class="eyebrow"># 暗夜聚会</div><strong>魔都午夜巡游改装盛典回顾</strong><div class="muted" style="margin-top:8px;">夜景街拍、姿态案例与精选现场瞬间。</div></article><article class="mobile-item"><div class="eyebrow"># 技术解析</div><strong>为什么锻造轮毂更适合高性能街道设定</strong><div class="muted" style="margin-top:8px;">轻量化、强度和簧下质量一次讲透。</div></article></div></section><section><div style="display:flex; justify-content:space-between; align-items:center; gap:12px; margin-bottom:12px;"><h3 style="margin:0; font-size:22px;">最新动态 <span style="color:var(--brand);">LATEST</span></h3></div><div class="mobile-list"><article class="mobile-item"><strong>全新宝马 M4 改装案例：打造街道赛道双重利器</strong><div class="muted" style="margin-top:8px;">作者：改装大神林哥 · 2 小时前</div><div style="margin-top:10px; display:flex; gap:10px; flex-wrap:wrap;"><span class="pill">精品案例</span><span class="pill">4.2w 浏览</span></div></article><article class="mobile-item"><strong>姿态玩家必看：空气避震安装避坑指南</strong><div class="muted" style="margin-top:8px;">作者：StanceWorks · 5 小时前</div><div style="margin-top:10px; display:flex; gap:10px; flex-wrap:wrap;"><span class="pill">技术干货</span><span class="pill">1.8w 浏览</span></div></article></div></section></div>`;
    }
    if (state.tab === "home") return `<div class="stack"><section class="hero-banner"><div class="eyebrow">Inspiration</div><h3 style="margin:10px 0 8px; font-size:28px; font-family:var(--font-display);">高端改装推荐</h3><p class="muted">${fallback.userBanners[0]}</p></section><section class="mobile-list">${cases.map((i) => `<article class="mobile-item"><strong>${safe(i.title, "案例")}</strong><div class="muted" style="margin-top:8px;">${safe(i.model, "车型")} / ${safe(i.style, "风格")}</div><div style="margin-top:10px; display:flex; gap:10px;"><span class="pill">${safe(i.cost, "-")}</span>${tag(nCaseDisplay(i.display))}</div></article>`).join("")}</section></div>`;
    if (state.tab === "mall") {
      if (state.userMallPage) return renderUserMallCategoryPage();
      const selectedSku = state.userSelected.goods || "PR-8804";
      const selectedProduct = products.find((item) => item.sku === selectedSku) || products[0];
      const mallCards = [selectedProduct, ...products.filter((item) => item.sku !== selectedSku)].slice(0, 4);
      return `<div class="stack">${state.userFeedback ? `<div class="provider-feedback">${state.userFeedback}</div>` : ""}<section class="mobile-item"><input class="input" type="text" placeholder="搜索改装配件、品牌..." aria-label="搜索改装配件、品牌"></section><section class="mobile-grid-3"><article class="mobile-item"><div class="eyebrow">01</div><strong>外观套件</strong><div class="muted" style="margin-top:8px;">前唇 / 尾翼 / 宽体</div></article><article class="mobile-item"><div class="eyebrow">02</div><strong>动力性能</strong><div class="muted" style="margin-top:8px;">进气 / 排气 / 程序</div></article><article class="mobile-item"><div class="eyebrow">03</div><strong>电子系统</strong><div class="muted" style="margin-top:8px;">仪表 / ECU / 监控</div></article><article class="mobile-item"><div class="eyebrow">04</div><strong>更多</strong><div class="muted" style="margin-top:8px;">内饰 / 车灯 / 精品</div></article></section><section><div style="display:flex; justify-content:space-between; align-items:center; gap:12px; margin-bottom:12px;"><h3 style="margin:0; font-size:22px;">热门品牌</h3><span class="muted">查看全部</span></div><div class="mobile-grid-3"><article class="mobile-item"><strong>3D Design</strong><div class="muted" style="margin-top:8px;">宝马高端外观件</div></article><article class="mobile-item"><strong>Akrapovic</strong><div class="muted" style="margin-top:8px;">钛合金排气系统</div></article><article class="mobile-item"><strong>AERO PRO</strong><div class="muted" style="margin-top:8px;">空气动力学套件</div></article></div></section><section><div style="display:flex; align-items:center; gap:10px; margin-bottom:12px;"><span style="display:inline-block; width:4px; height:28px; background:var(--brand); border-radius:999px;"></span><h3 style="margin:0; font-size:22px;">高性能改装店</h3></div><div class="mobile-grid-2">${mallCards.map((item, index) => `<article class="mobile-item"><div class="eyebrow">${index === 0 ? "当前推荐" : safe(item.category, "精选单品")}</div><strong>${safe(item.name, "商品")}</strong><div style="margin-top:10px; font-size:28px; font-weight:700; color:var(--brand);">${safe(item.price, "¥0")}</div><div class="muted" style="margin-top:8px;">${safe(item.fitment || item.description, "适配当前车型")}</div></article>`).join("")}</div></section></div>`;
    }
    if (state.tab === "mall") {
      const active = state.subTab.mall || "goods";
      const rows = active === "goods" ? products : services;
      const selectedKey = state.userSelected[active] || (active === "goods" ? rows[0]?.sku : rows[0]?.id || rows[0]?.name || "");
      const selected = rows.find((item) => (active === "goods" ? item.sku : item.id || item.name) === selectedKey) || rows[0];
      return `${subTabs([{ id: "goods", label: "商品列表" }, { id: "service", label: "服务下单" }])}${state.userFeedback ? `<div class="provider-feedback">${state.userFeedback}</div>` : ""}<div class="mobile-list">${rows.map((i) => {
        const itemId = active === "goods" ? i.sku : i.id || i.name;
        const isActive = (active === "goods" ? i.sku : i.id || i.name) === (active === "goods" ? selected?.sku : selected?.id || selected?.name);
        return `<div class="admin-inline-block"><button class="mobile-item admin-pick-card ${isActive ? "active" : ""}" type="button" data-user-pick data-user-type="${active}" data-user-id="${itemId}">${active === "goods" ? `<strong>${safe(i.name, "商品")}</strong><div class="muted" style="margin-top:8px;">${safe(i.brand, "品牌")} / ${safe(i.fitment || i.model, "适配车型")}</div><div style="margin-top:10px; display:flex; gap:10px;"><span class="pill">${safe(i.price, "-")}</span>${tag(nProduct(i.status))}</div>` : `<strong>${safe(i.name, "服务")}</strong><div class="muted" style="margin-top:8px;">${safe(i.desc, "服务说明")}</div><div class="muted" style="margin-top:6px;">${safe(i.duration, "支持预约到店")}</div><div style="margin-top:10px;"><span class="pill">${safe(i.price, "-")}</span></div>`}</button>${isActive ? renderUserMallDetail(i, active) : ""}</div>`;
      }).join("")}</div>`;
    }
    if (state.tab === "garage") {
      const active = state.subTab.garage || "vehicles";
      const selectedVehicle = getSelectedUserVehicle();
      return `${subTabs([{ id: "vehicles", label: "我的车辆" }, { id: "render", label: "渲染展示" }, { id: "map", label: "附近门店" }])}${active === "vehicles" ? renderUserGarageVehicles(selectedVehicle) : active === "map" ? renderUserGarageMap(selectedVehicle) : renderUserGarageRender(selectedVehicle)}`;
    }
    if (state.tab === "forum") return renderUserForum();
    return renderUserMe();
  }

  function renderUserMe() {
    const active = state.subTab.me || "profile";
    return `${subTabs([{ id: "profile", label: "基本信息" }, { id: "orders", label: "历史订单" }, { id: "messages", label: "消息" }, { id: "address", label: "地址管理" }, { id: "credit", label: "金融授信" }])}${active === "profile" ? renderUserProfile() : active === "orders" ? renderUserHistoryOrders() : active === "messages" ? renderUserMessages() : active === "address" ? renderUserAddress() : renderUserCredit()}`;
  }

  function getUserOrders() {
    return [...fallback.userHistoryOrders, ...orders.filter((item) => safe(item.user, "") === "当前用户")].slice(0, 8);
  }

  function renderUserProfile() {
    return `<div class="stack"><section class="admin-detail-card"><div class="eyebrow">User Profile</div><h3>用户基本信息</h3><div class="admin-kv-list"><div><span>昵称</span><strong>当前用户</strong></div><div><span>手机号</span><strong>13800138000</strong></div><div><span>常用城市</span><strong>上海</strong></div><div><span>默认爱车</span><strong>${safe(getSelectedUserVehicle()?.model, "未绑定车辆")}</strong></div><div><span>账号状态</span><strong>正常</strong></div></div></section></div>`;
  }

  function renderUserHistoryOrders() {
    const rows = getUserOrders();
    const selected = rows.find((item) => item.id === state.userMe.selectedOrder) || rows[0];
    return `<div class="mobile-list">${rows.map((item) => `<div class="admin-inline-block"><button class="mobile-item admin-pick-card ${selected?.id === item.id ? "active" : ""}" type="button" data-user-action="user-order-pick" data-user-id="${item.id}"><strong>${item.id}</strong><div class="muted" style="margin-top:8px;">${safe(item.vehicle, "车型")} / ${safe(item.appointment, "-")}</div><div style="margin-top:8px;">${safe(item.service, "服务")}</div><div class="muted" style="margin-top:8px;">${safe(item.progress, "处理中")}</div><div style="margin-top:10px; display:flex; gap:10px; flex-wrap:wrap;"><span class="pill">${safe(item.quote, "-")}</span>${tag(nOrder(item.status))}</div></button>${selected?.id === item.id ? renderUserHistoryOrderDetail(item) : ""}</div>`).join("") || `<article class="mobile-item"><strong>暂无历史订单</strong></article>`}</div>`;
  }

  function renderUserMessages() {
    const rows = fallback.providerMessages.filter((item) => item.messages.some((message) => message.from === "user" || message.from === "provider" || message.from === "platform"));
    const selected = rows.find((item) => item.id === state.userMe.selectedMessage) || rows[0];
    return `<section class="provider-chat-shell"><div class="provider-chat-list">${rows.map((item) => `<div class="admin-inline-block"><button class="provider-chat-thread ${selected?.id === item.id ? "active" : ""}" type="button" data-user-action="user-message-pick" data-user-id="${item.id}"><div class="provider-chat-thread-head"><strong>${safe(item.title, "消息")}</strong><span>${safe(item.time, "刚刚")}</span></div><div class="provider-chat-thread-preview">${safe(item.preview, "暂无消息内容")}</div><div class="provider-chat-thread-meta">${tag(safe(item.status, "正常"))}</div></button>${selected?.id === item.id ? `<section class="provider-chat-panel"><header class="provider-chat-header"><div><div class="eyebrow">Realtime Chat</div><h3>${safe(item.title, "即时对话")}</h3></div>${tag(safe(item.status, "正常"))}</header><div class="provider-chat-body">${item.messages.map((message) => `<article class="provider-chat-bubble ${message.from === "user" ? "is-self" : ""}"><div class="provider-chat-bubble-role">${message.from === "user" ? "我" : message.from === "provider" ? "服务商" : "平台"}</div><p>${message.text}</p><time>${message.time}</time></article>`).join("")}</div><form class="provider-chat-composer" data-user-chat-form data-user-id="${item.id}"><input class="input" name="userChatMessage" type="text" placeholder="输入消息并实时发送" autocomplete="off" required><button class="btn btn-primary" type="submit">发送</button></form></section>` : ""}</div>`).join("")}</div></section>`;
  }

  function renderUserHistoryOrderDetail(item) {
    const canAccept = nOrder(item.status) === "待验收";
    const providerMeta = providerOrderExtras[item.id] || {};
    const completionSummary = safe(item.progress, "服务商暂未提交完工说明");
    const uploadSummary = safe(providerMeta.arrival, "暂未上传完工图片");
    const acceptanceTips = safe(providerMeta.remark, "请重点核对施工效果、功能联调和随车物品");
    return `<section class="admin-detail-card"><div class="eyebrow">Order Detail</div><h3>${item.id}</h3><div class="admin-kv-list"><div><span>车辆</span><strong>${safe(item.vehicle, "-")}</strong></div><div><span>服务</span><strong>${safe(item.service, "-")}</strong></div><div><span>预约时间</span><strong>${safe(item.appointment, "-")}</strong></div><div><span>订单金额</span><strong>${safe(item.quote, "-")}</strong></div><div><span>当前进度</span><strong>${completionSummary}</strong></div><div><span>订单状态</span><strong>${nOrder(item.status)}</strong></div></div>${canAccept ? `<section class="provider-complete-form"><div class="field-group"><label class="field-label">服务商完工情况</label><div class="admin-timeline"><div>${completionSummary}</div><div>${uploadSummary}</div><div>验收提示：${acceptanceTips}</div></div></div></section>` : ""}<div class="admin-action-row">${canAccept ? `<button class="btn btn-primary" type="button" data-user-action="user-order-acceptance" data-user-id="${item.id}">确认验收</button>` : `<button class="btn btn-secondary" type="button" disabled>当前无需验收</button>`}</div></section>`;
  }

  function renderUserAddress() {
    const rows = fallback.userAddresses;
    return `<div class="stack"><div class="admin-action-row"><button class="btn btn-primary" type="button" data-user-action="${state.userMe.addressCreateOpen ? "user-address-cancel" : "user-address-add"}">${state.userMe.addressCreateOpen ? "收起新增地址" : "新增地址"}</button></div>${state.userMe.addressCreateOpen ? renderUserAddressForm() : ""}<div class="mobile-list">${rows.map((item) => `<section class="mobile-item"><strong>${item.name} / ${item.phone}</strong><div class="muted" style="margin-top:8px;">${item.address}</div><div style="margin-top:10px; display:flex; justify-content:space-between; gap:12px; align-items:center;"><span class="pill">${item.tag}</span><button class="btn btn-danger" type="button" data-user-action="user-address-delete" data-user-id="${item.id}">删除</button></div></section>`).join("")}</div></div>`;
  }

  function renderUserAddressForm() {
    return `<form class="provider-complete-form" data-user-address-form><div class="form-grid"><div class="field-group"><label class="field-label" for="address-name-new">收件人</label><input class="input" id="address-name-new" name="addressName" type="text" value="周恺" required></div><div class="field-group"><label class="field-label" for="address-phone-new">联系电话</label><input class="input" id="address-phone-new" name="addressPhone" type="text" value="13800138000" required></div><div class="field-group"><label class="field-label" for="address-detail-new">详细地址</label><input class="input" id="address-detail-new" name="addressDetail" type="text" value="上海市徐汇区虹桥路 188 号 3 单元 1201" required></div></div><div class="admin-action-row"><button class="btn btn-primary" type="submit">保存地址</button><button class="btn btn-secondary" type="button" data-user-action="user-address-cancel">取消</button></div></form>`;
  }

  function renderUserCredit() {
    return `<div class="stack"><section class="admin-detail-card"><div class="eyebrow">Credit Service</div><h3>金融授信</h3><div class="admin-kv-list"><div><span>授信状态</span><strong>已开通</strong></div><div><span>可用额度</span><strong>¥80,000</strong></div><div><span>已使用额度</span><strong>¥12,600</strong></div><div><span>最近还款日</span><strong>2026-04-10</strong></div></div><div class="admin-timeline"><div>支持商品分期、改装施工分期与门店联合金融方案。</div><div>如需提升额度，可在平台完成补充资料与信用评估。</div></div></section></div>`;
  }

  function renderUserForum() {
    const active = state.subTab.forum || "posts";
    const rows = active === "posts" ? posts : posts.filter((item) => safe(item.author, "") === "当前用户");
    const selected = rows.find((item) => item.id === state.userForum.selectedPost) || rows[0];
    return `${subTabs([{ id: "posts", label: "帖子列表" }, { id: "mine", label: "我的发布" }])}<div class="admin-action-row" style="margin-bottom:12px;"><button class="btn btn-primary" type="button" data-user-action="${state.userForum.createOpen ? "user-forum-cancel" : "user-forum-create"}">${state.userForum.createOpen ? "收起发布表单" : "发布帖子"}</button></div>${state.userForum.createOpen ? renderUserForumForm() : ""}<div class="mobile-list">${rows.map((item) => `<div class="admin-inline-block"><button class="mobile-item admin-pick-card ${selected?.id === item.id ? "active" : ""}" type="button" data-user-action="user-forum-pick" data-user-id="${item.id}"><strong>${safe(item.title, "帖子")}</strong><div class="muted" style="margin-top:8px;">${safe(item.author, "作者")} / ${safe(item.time, "今天")}</div><div style="margin-top:10px; display:flex; gap:10px; flex-wrap:wrap;"><span class="pill">回复 ${item.replies || 0}</span><span class="pill">点赞 ${item.likes || 0}</span>${tag(nForum(item.status))}</div></button>${selected?.id === item.id ? renderUserForumDetail(item) : ""}</div>`).join("") || `<article class="mobile-item"><strong>暂无帖子</strong><div class="muted" style="margin-top:8px;">先发布第一条帖子吧。</div></article>`}</div>`;
  }

  function renderUserForumForm() {
    return `<form class="provider-complete-form" data-user-forum-form><div class="form-grid"><div class="field-group"><label class="field-label" for="forum-title-new">帖子标题</label><input class="input" id="forum-title-new" name="forumTitle" type="text" value="分享本周新改的轮毂搭配" required></div><div class="field-group"><label class="field-label" for="forum-media-new">上传图片或视频</label><label class="upload-panel" for="forum-media-new"><input id="forum-media-new" class="upload-input" name="forumMedia" type="file" accept="image/*,video/*" multiple><span class="upload-illustration"></span><strong>上传帖子素材</strong><small>支持上传图片或短视频，展示施工细节、完工效果或用车日常，最多选择 9 个文件</small></label></div><div class="field-group"><label class="field-label" for="forum-content-new">帖子内容</label><textarea class="textarea" id="forum-content-new" name="forumContent" required>刚换了新轮毂和短簧，欢迎大家看看效果，也想听听后续轮胎搭配建议。</textarea></div></div><div class="admin-action-row"><button class="btn btn-primary" type="submit">确认发布</button><button class="btn btn-secondary" type="button" data-user-action="user-forum-cancel">取消</button></div></form>`;
  }

  function renderUserForumDetail(item) {
    const replyOpen = state.userForum.replyPostId === item.id;
    const related = comments.filter((comment) => comment.post === item.id && nForum(comment.status) !== "已删除");
    const mine = safe(item.author, "") === "当前用户";
    return `<section class="admin-detail-card"><div class="eyebrow">Forum Detail</div><h3>${safe(item.title, "帖子详情")}</h3><div class="admin-kv-list"><div><span>作者</span><strong>${safe(item.author, "-")}</strong></div><div><span>发布时间</span><strong>${safe(item.time, "-")}</strong></div><div><span>互动数据</span><strong>回复 ${item.replies || 0} / 点赞 ${item.likes || 0}</strong></div><div><span>状态</span><strong>${nForum(item.status)}</strong></div></div><div class="admin-comment-block"><strong>评论区</strong><div class="admin-comment-list">${related.length ? related.map((comment) => `<div class="admin-comment-item"><div class="admin-comment-head"><strong>${safe(comment.author, "评论用户")}</strong><span class="muted">${safe(comment.time, "刚刚")}</span></div><p>${safe(comment.content, "评论内容")}</p></div>`).join("") : `<div class="muted">当前暂无评论</div>`}</div></div><div class="admin-action-row"><button class="btn btn-primary" type="button" data-user-action="user-forum-like" data-user-id="${item.id}">点赞</button><button class="btn btn-secondary" type="button" data-user-action="${replyOpen ? "user-forum-reply-cancel" : "user-forum-reply"}" data-user-id="${item.id}">${replyOpen ? "取消回复" : "回复"}</button>${mine ? `<button class="btn btn-danger" type="button" data-user-action="user-forum-delete" data-user-id="${item.id}">删除</button>` : ""}</div>${replyOpen ? renderUserForumReplyForm(item) : ""}</section>`;
  }

  function renderUserForumReplyForm(item) {
    return `<form class="provider-complete-form" data-user-forum-reply-form data-user-id="${item.id}"><div class="field-group"><label class="field-label" for="forum-reply-${item.id}">回复内容</label><textarea class="textarea" id="forum-reply-${item.id}" name="forumReply" required>这个搭配很顺眼，建议再试试更贴合街道使用场景的胎壁比例。</textarea></div><div class="admin-action-row"><button class="btn btn-primary" type="submit">提交回复</button><button class="btn btn-secondary" type="button" data-user-action="user-forum-reply-cancel" data-user-id="${item.id}">取消</button></div></form>`;
  }

  function renderUserMallDetail(item, active) {
    const itemId = active === "goods" ? item.sku : item.id || item.name;
    const orderOpen = state.userOrderForm.type === active && state.userOrderForm.id === itemId;
    return `<section class="admin-detail-card"><div class="eyebrow">${active === "goods" ? "Mall Goods" : "Service Booking"}</div><h3>${safe(item.name, active === "goods" ? "商品详情" : "服务详情")}</h3><div class="admin-kv-list">${active === "goods" ? `<div><span>品牌</span><strong>${safe(item.brand, "-")}</strong></div><div><span>适配车型</span><strong>${safe(item.fitment || item.model, "-")}</strong></div><div><span>价格</span><strong>${safe(item.price, "-")}</strong></div><div><span>状态</span><strong>${nProduct(item.status)}</strong></div>` : `<div><span>服务名称</span><strong>${safe(item.name, "-")}</strong></div><div><span>服务说明</span><strong>${safe(item.desc, "-")}</strong></div><div><span>价格参考</span><strong>${safe(item.price, "-")}</strong></div><div><span>预约方式</span><strong>${safe(item.duration, "支持到店预约")}</strong></div>`}</div><div class="admin-action-row"><button class="btn btn-primary" type="button" data-user-action="${orderOpen ? "user-order-cancel" : "user-order-open"}" data-user-id="${itemId}" data-user-type="${active}">${orderOpen ? "收起下单表单" : "立即下单"}</button></div>${orderOpen ? renderUserOrderForm(item, active) : ""}</section>`;
  }

  function getUserVehicleKey(item) {
    return item.id || item.plate || item.model;
  }

  function getSelectedUserVehicle() {
    return vehicles.find((item) => getUserVehicleKey(item) === state.userGarage.selectedVehicle) || vehicles[0];
  }

  function renderUserGarageVehicles(selectedVehicle) {
    return `<div class="stack"><section class="mobile-item"><div style="display:flex; justify-content:space-between; align-items:center; gap:16px;"><div><div class="eyebrow">AERO S-LINE</div><strong style="display:block; margin-top:8px; font-size:24px;">${safe(selectedVehicle?.model, "AERO S-LINE")}</strong><div class="muted" style="margin-top:8px;">定制动力青</div></div><div style="display:flex; gap:10px;"><button class="btn btn-secondary" type="button" data-user-action="user-vehicle-add">新增</button></div></div><div class="admin-timeline" style="margin-top:14px;"><div>车型参考：AERO S-LINE 经典双门定制版</div><div>当前车辆：${safe(selectedVehicle?.model, "未绑定车辆")} / ${safe(selectedVehicle?.plate, "-")}</div></div></section><section class="mobile-grid-2"><button class="mobile-item" type="button" data-user-action="user-garage-exterior"><div class="eyebrow">Exterior</div><strong>车身套件</strong><div class="muted" style="margin-top:8px;">外观改装</div></button><button class="mobile-item" type="button" data-user-action="user-garage-wheel"><div class="eyebrow">Wheel</div><strong>轮毂</strong><div class="muted" style="margin-top:8px;">轻量化轮组升级</div></button><button class="mobile-item" type="button" data-user-action="user-garage-exhaust"><div class="eyebrow">Exhaust</div><strong>排气</strong><div class="muted" style="margin-top:8px;">声浪与流量优化</div></button><button class="mobile-item" type="button" data-user-action="user-garage-interior"><div class="eyebrow">Interior</div><strong>内饰定制</strong><div class="muted" style="margin-top:8px;">座舱氛围与材质升级</div></button></section><button class="mobile-item" type="button" data-user-action="user-garage-store" style="background:linear-gradient(135deg, rgba(122,233,255,0.95), rgba(30,216,255,0.85)); color:#062833;"><div style="display:flex; justify-content:space-between; align-items:center; gap:16px;"><strong style="font-size:22px; color:inherit;">附近门店</strong><span style="color:rgba(6,40,51,0.78);">找到 3 家门店</span></div></button></div>`;
    return `<div class="stack"><div class="admin-action-row"><button class="btn btn-primary" type="button" data-user-action="${state.userGarage.createOpen ? "user-vehicle-cancel" : "user-vehicle-add"}">${state.userGarage.createOpen ? "收起新增车辆" : "新增车辆"}</button></div>${state.userGarage.createOpen ? renderUserVehicleForm() : ""}<div class="mobile-list">${vehicles.map((item) => `<div class="admin-inline-block"><button class="mobile-item admin-pick-card ${getUserVehicleKey(item) === getUserVehicleKey(selectedVehicle) ? "active" : ""}" type="button" data-user-pick data-user-type="garage-vehicle" data-user-id="${getUserVehicleKey(item)}"><strong>${safe(item.model, "车辆")}</strong><div class="muted" style="margin-top:8px;">${safe(item.plate, "-")} / ${safe(item.owner, "-")}</div><div style="margin-top:8px;">查看车辆信息与系统记录的改装历史</div></button>${getUserVehicleKey(item) === getUserVehicleKey(selectedVehicle) ? renderUserVehicleDetail(item) : ""}</div>`).join("")}</div></div>`;
  }

  function renderUserGarageMap(selectedVehicle) {
    const stores = [
      { name: "德驭 Performance Studio", distance: "2.3km", address: "上海市闵行区申长路 1688 号 A 栋 102", intro: "主打欧系性能车外观套件、轮毂升级与高端施工交付。", hours: "10:00 - 20:00" },
      { name: "AERO Lab Motorsport", distance: "4.8km", address: "上海市徐汇区龙腾大道 2450 号 1 层", intro: "专注排气、程序与街道赛道双用途底盘调校。", hours: "09:30 - 21:00" },
      { name: "Urban Carbon Garage", distance: "6.1km", address: "上海市浦东新区锦绣东路 3899 号 3 号楼", intro: "擅长碳纤维车身件、内饰定制和精品升级方案。", hours: "10:00 - 19:30" },
    ];
    return `<div class="stack"><section class="mobile-item"><div style="display:flex; justify-content:space-between; align-items:center; gap:12px;"><div><div class="eyebrow">Map View</div><strong style="display:block; margin-top:8px; font-size:22px;">附近门店地图</strong><div class="muted" style="margin-top:8px;">已为 ${safe(selectedVehicle?.model, "当前车辆")} 找到附近 3 家适配门店</div></div><button class="btn btn-secondary" type="button" data-user-action="user-garage-map-back">返回爱车</button></div></section><section class="mobile-item"><div style="min-height:220px; border-radius:20px; position:relative; overflow:hidden; background:radial-gradient(circle at 20% 30%, rgba(122,233,255,0.22), transparent 28%), radial-gradient(circle at 70% 40%, rgba(122,233,255,0.18), transparent 24%), linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02));"><div style="position:absolute; inset:0; background-image:linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px); background-size:32px 32px;"></div><div style="position:absolute; top:22%; left:26%; width:18px; height:18px; border-radius:999px; background:var(--brand); box-shadow:0 0 0 8px rgba(122,233,255,0.16);"></div><div style="position:absolute; top:46%; left:58%; width:18px; height:18px; border-radius:999px; background:#ff7a45; box-shadow:0 0 0 8px rgba(255,122,69,0.16);"></div><div style="position:absolute; top:66%; left:38%; width:18px; height:18px; border-radius:999px; background:#7f9cff; box-shadow:0 0 0 8px rgba(127,156,255,0.16);"></div><div style="position:absolute; right:16px; bottom:16px;" class="pill">当前定位：上海市</div></div></section><div class="mobile-list">${stores.map((item, index) => `<section class="admin-detail-card"><div style="display:flex; justify-content:space-between; align-items:center; gap:12px;"><div><div class="eyebrow">门店 0${index + 1}</div><h3 style="margin-top:8px;">${item.name}</h3></div><span class="pill">${item.distance}</span></div><div class="admin-kv-list"><div><span>地址</span><strong>${item.address}</strong></div><div><span>营业时间</span><strong>${item.hours}</strong></div><div><span>适配车型</span><strong>${safe(selectedVehicle?.model, "高端改装车型")}</strong></div></div><div class="admin-timeline"><div>${item.intro}</div></div></section>`).join("")}</div></div>`;
  }

  function renderUserVehicleForm() {
    const modelOptions = ["保时捷 718 Cayman", "宝马 M4 Coupe", "奔驰 AMG C63", "奥迪 RS5 Sportback", "日产 GT-R R35"];
    return `<form class="provider-complete-form" data-user-vehicle-form><div class="form-grid"><div class="field-group"><label class="field-label" for="garage-model-new">车辆型号</label><select class="input" id="garage-model-new" name="garageModel" required>${modelOptions.map((item, index) => `<option value="${item}" ${index === 0 ? "selected" : ""}>${item}</option>`).join("")}</select></div><div class="field-group"><label class="field-label" for="garage-plate-new">车牌号</label><input class="input" id="garage-plate-new" name="garagePlate" type="text" value="沪A 718CM" placeholder="请输入车牌号" required></div><div class="field-group"><label class="field-label" for="garage-image-new">车辆图片</label><label class="upload-panel" for="garage-image-new"><input id="garage-image-new" class="upload-input" name="garageImage" type="file" accept="image/*"><span class="upload-illustration"></span><strong>上传车辆图片</strong><small>支持上传 1 张车辆外观图，用于爱车档案封面展示</small></label></div><div class="field-group"><label class="field-label" for="garage-owner-new">车主</label><input class="input" id="garage-owner-new" name="garageOwner" type="text" value="当前用户" required></div></div><div class="admin-timeline"><div>保存后会自动建立车辆档案，后续订单和施工记录会沉淀到这辆车名下。</div></div><div class="admin-action-row"><button class="btn btn-primary" type="submit">保存车辆</button><button class="btn btn-secondary" type="button" data-user-action="user-vehicle-cancel">取消</button></div></form>`;
  }

  function renderUserMallCategoryPage() {
    const selectedVehicle = getSelectedUserVehicle();
    const pageMap = {
      exterior: {
        title: "车身套件商城",
        intro: `${safe(selectedVehicle?.model, "当前车型")} 适配外观件推荐`,
        skus: ["PR-8804", "PR-8803", "PR-8801"],
      },
      wheel: {
        title: "轮毂商城",
        intro: "锻造轮毂与轮组升级推荐",
        skus: ["PR-8801", "PR-8803", "PR-8804"],
      },
      exhaust: {
        title: "排气商城",
        intro: "阀门排气与高性能声浪升级推荐",
        skus: ["PR-8802", "PR-8805", "PR-8803"],
      },
      interior: {
        title: "内饰商城",
        intro: "座舱氛围、材质升级与精品推荐",
        skus: ["PR-8805", "PR-8804", "PR-8801"],
      },
    };
    const current = pageMap[state.userMallPage] || pageMap.exterior;
    const pageProducts = current.skus.map((sku) => products.find((item) => item.sku === sku)).filter(Boolean);
    return `<div class="stack"><section class="mobile-item"><div style="display:flex; justify-content:space-between; align-items:center; gap:12px;"><div><div class="eyebrow">Mall Page</div><strong style="display:block; margin-top:8px; font-size:22px;">${current.title}</strong><div class="muted" style="margin-top:8px;">${current.intro}</div></div><button class="btn btn-secondary" type="button" data-user-action="user-mall-back">返回商城</button></div></section><div class="mobile-list">${pageProducts.map((item) => `<section class="admin-detail-card"><div class="eyebrow">${safe(item.category, "精选商品")}</div><h3>${safe(item.name, "商品")}</h3><div class="admin-kv-list"><div><span>品牌</span><strong>${safe(item.brand, "-")}</strong></div><div><span>适配车型</span><strong>${safe(item.fitment || selectedVehicle?.model, "-")}</strong></div><div><span>价格</span><strong>${safe(item.price, "-")}</strong></div><div><span>状态</span><strong>${nProduct(item.status)}</strong></div></div><div class="admin-timeline"><div>${safe(item.description, "查看商品详情与安装建议。")}</div></div><div class="admin-action-row"><button class="btn btn-primary" type="button" data-user-action="user-order-open" data-user-id="${item.sku}" data-user-type="goods">立即下单</button></div>${state.userOrderForm.type === "goods" && state.userOrderForm.id === item.sku ? renderUserOrderForm(item, "goods") : ""}</section>`).join("")}</div></div>`;
  }

  function renderUserVehicleDetail(item) {
    return `<section class="admin-detail-card"><div class="eyebrow">Vehicle Profile</div><h3>${safe(item.model, "车辆详情")}</h3><div class="admin-kv-list"><div><span>车型</span><strong>${safe(item.model, "-")}</strong></div><div><span>车牌</span><strong>${safe(item.plate, "-")}</strong></div><div><span>车主</span><strong>${safe(item.owner, "-")}</strong></div><div><span>当前状态</span><strong>已绑定</strong></div></div><div class="admin-action-row"><button class="btn btn-danger" type="button" data-user-action="user-vehicle-delete" data-user-id="${getUserVehicleKey(item)}">删除车辆</button></div><div class="admin-comment-block"><strong>改装历史记录</strong><div class="admin-comment-list">${String(item.history || "暂无改装记录").split(/[；;。]/).filter(Boolean).map((entry) => `<div class="admin-comment-item"><p>${entry.trim()}</p></div>`).join("") || `<div class="muted">暂无改装历史记录</div>`}</div></div></section>`;
  }

  function renderUserGarageRender(selectedVehicle) {
    return `<div class="stack"><section class="garage-preview"><div class="eyebrow">Render Lab</div><strong style="display:block; margin-top:10px; font-size:22px;">${safe(selectedVehicle?.model, "宝马 G20 330i")} 外观预览</strong><div class="muted" style="margin-top:6px;">通过下拉切换当前爱车，再调整车身颜色与轮毂样式，当前方案仅做图片式渲染模拟。</div><div class="field-group" style="margin-top:14px;"><label class="field-label" for="garage-render-select">选择爱车</label><select class="input" id="garage-render-select" data-user-action="user-vehicle-select">${vehicles.map((item) => `<option value="${getUserVehicleKey(item)}" ${getUserVehicleKey(item) === getUserVehicleKey(selectedVehicle) ? "selected" : ""}>${safe(item.model, "爱车")} / ${safe(item.plate, "-")}</option>`).join("")}</select></div><div class="car-render"><div class="car-wheel left" id="leftWheel"></div><div class="car-wheel right" id="rightWheel"></div><div class="car-render-body" id="carBody"></div></div><div class="swatch-row">${fallback.colors.map((i, idx) => `<button class="swatch ${idx === state.garageColor ? "active" : ""}" style="background:${i.value};" type="button" title="${i.name}" data-color-index="${idx}"></button>`).join("")}</div></section><section class="mobile-list">${fallback.wheels.map((i, idx) => `<button class="wheel-option ${idx === state.garageWheel ? "active" : ""}" type="button" data-wheel-index="${idx}"><span><strong>${i.name}</strong><div class="muted" style="margin-top:6px;">${i.spokes} 辐设计 / 高端改装风格</div></span><span class="wheel-badge" data-tone="${idx === 0 ? "gold" : idx === 1 ? "grey" : "silver"}"></span></button>`).join("")}</section></div>`;
  }

  function renderUserOrderForm(item, active) {
    const itemId = active === "goods" ? item.sku : item.id || item.name;
    return `<form class="provider-complete-form" data-user-order-form data-user-type="${active}" data-user-id="${itemId}"><div class="form-grid"><div class="field-group"><label class="field-label" for="user-vehicle-${itemId}">车辆信息</label><input class="input" id="user-vehicle-${itemId}" name="userVehicle" type="text" value="${vehicles[0]?.model || "宝马 G20 330i"}" required></div><div class="field-group"><label class="field-label" for="user-phone-${itemId}">联系电话</label><input class="input" id="user-phone-${itemId}" name="userPhone" type="text" value="13800138000" required></div>${active === "goods" ? `<div class="field-group"><label class="field-label" for="user-receiver-${itemId}">收件人</label><input class="input" id="user-receiver-${itemId}" name="userReceiver" type="text" value="周恺" required></div><div class="field-group"><label class="field-label" for="user-address-${itemId}">收件地址</label><input class="input" id="user-address-${itemId}" name="userAddress" type="text" value="上海市闵行区申长路 1688 号 2 栋 801" required></div>` : ""}<div class="field-group"><label class="field-label" for="user-time-${itemId}">${active === "goods" ? "收货/到店时间" : "预约时间"}</label><input class="input" id="user-time-${itemId}" name="userTime" type="text" value="2026-04-03 14:30" required></div><div class="field-group"><label class="field-label" for="user-qty-${itemId}">${active === "goods" ? "数量" : "服务数量"}</label><input class="input" id="user-qty-${itemId}" name="userQuantity" type="number" min="1" max="9" value="1" required></div><div class="field-group"><label class="field-label" for="user-note-${itemId}">备注</label><textarea class="textarea" id="user-note-${itemId}" name="userNote" required>${active === "goods" ? "请确认到货后通知安装时间。" : "请优先安排周末到店。"} </textarea></div></div><div class="admin-action-row"><button class="btn btn-primary" type="submit">提交订单</button><button class="btn btn-secondary" type="button" data-user-action="user-order-cancel" data-user-id="${itemId}" data-user-type="${active}">取消</button></div></form>`;
  }

  function handleUserAction(button) {
    const action = button.dataset.userAction;
    const id = button.dataset.userId || "";
    const type = button.dataset.userType || "";
    if (action === "user-vehicle-add") {
      state.userGarage.createOpen = true;
      state.userFeedback = "";
      state.userDialog = { type: "vehicle-create", orderId: "", sourceName: "" };
      render();
      return;
    }
    if (action === "user-vehicle-cancel") {
      state.userGarage.createOpen = false;
      state.userDialog = { type: "", orderId: "", sourceName: "" };
      render();
      return;
    }
    if (action === "user-vehicle-select") {
      state.userGarage.selectedVehicle = button.value;
      render();
      return;
    }
    if (action === "user-garage-exterior") {
      state.tab = "mall";
      state.userMallPage = "exterior";
      state.userSelected.goods = "PR-8804";
      state.userFeedback = "";
      render();
      return;
    }
    if (action === "user-garage-wheel") {
      state.tab = "mall";
      state.userMallPage = "wheel";
      state.userSelected.goods = "PR-8801";
      state.userFeedback = "";
      render();
      return;
    }
    if (action === "user-garage-exhaust") {
      state.tab = "mall";
      state.userMallPage = "exhaust";
      state.userSelected.goods = "PR-8802";
      state.userFeedback = "";
      render();
      return;
    }
    if (action === "user-garage-interior") {
      state.tab = "mall";
      state.userMallPage = "interior";
      state.userSelected.goods = "PR-8805";
      state.userFeedback = "";
      render();
      return;
    }
    if (action === "user-garage-store") {
      state.subTab.garage = "map";
      render();
      return;
    }
    if (action === "user-garage-map-back") {
      state.subTab.garage = "vehicles";
      render();
      return;
    }
    if (action === "user-mall-back") {
      state.userMallPage = "";
      render();
      return;
    }
    if (action === "user-vehicle-delete") {
      const targetIndex = vehicles.findIndex((item) => getUserVehicleKey(item) === id);
      if (targetIndex === -1) return;
      vehicles.splice(targetIndex, 1);
      state.userGarage.selectedVehicle = vehicles[0] ? getUserVehicleKey(vehicles[0]) : "";
      state.userFeedback = "车辆已从爱车列表删除。";
      render();
      return;
    }
    if (action === "user-order-open") {
      state.userOrderForm = { type, id };
      state.userFeedback = "";
      render();
      return;
    }
    if (action === "user-order-pick") {
      state.userMe.selectedOrder = id;
      render();
      return;
    }
    if (action === "user-order-acceptance") {
      const target = orders.find((item) => item.id === id);
      if (!target) return;
      target.status = "已完成";
      target.progress = "用户已完成验收，订单已归档。";
      state.userFeedback = `${id} 已确认验收。`;
      render();
      return;
    }
    if (action === "user-order-cancel") {
      state.userOrderForm = { type: "", id: "" };
      render();
      return;
    }
    if (action === "user-message-pick") {
      state.userMe.selectedMessage = id;
      render();
      return;
    }
    if (action === "user-address-add") {
      state.userMe.addressCreateOpen = true;
      render();
      return;
    }
    if (action === "user-address-cancel") {
      state.userMe.addressCreateOpen = false;
      render();
      return;
    }
    if (action === "user-address-delete") {
      const idx = fallback.userAddresses.findIndex((item) => item.id === id);
      if (idx === -1) return;
      fallback.userAddresses.splice(idx, 1);
      state.userFeedback = "地址已删除。";
      render();
      return;
    }
    if (action === "user-forum-create") {
      state.userForum.createOpen = true;
      render();
      return;
    }
    if (action === "user-forum-cancel") {
      state.userForum.createOpen = false;
      render();
      return;
    }
    if (action === "user-forum-pick") {
      state.userForum.selectedPost = id;
      render();
      return;
    }
    if (action === "user-forum-like") {
      const target = posts.find((item) => item.id === id);
      if (!target) return;
      target.likes = (target.likes || 0) + 1;
      state.userFeedback = `${safe(target.title, "帖子")} 已点赞。`;
      render();
      return;
    }
    if (action === "user-forum-reply") {
      state.userForum.replyPostId = id;
      render();
      return;
    }
    if (action === "user-forum-reply-cancel") {
      state.userForum.replyPostId = "";
      render();
      return;
    }
    if (action === "user-forum-delete") {
      const target = posts.find((item) => item.id === id);
      if (!target) return;
      target.status = "已删除";
      state.userFeedback = `${safe(target.title, "帖子")} 已删除。`;
      state.userForum.replyPostId = "";
      render();
    }
  }

  function handleUserVehicleSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const model = String(formData.get("garageModel") || "").trim();
    const plate = String(formData.get("garagePlate") || "").trim();
    const owner = String(formData.get("garageOwner") || "当前用户").trim();
    if (!model || !plate || !owner) return;
    const id = `CAR-${Date.now().toString().slice(-6)}`;
    vehicles.unshift({ id, model, plate, owner, history: "系统已创建车辆档案，待后续订单和施工记录自动生成改装历史。" });
    state.userGarage.selectedVehicle = id;
    state.userGarage.createOpen = false;
    state.userDialog = { type: "", orderId: "", sourceName: "" };
    state.userFeedback = `${model} 已添加到爱车列表。`;
    render();
  }

  function handleUserForumSubmit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const title = String(formData.get("forumTitle") || "").trim();
    const content = String(formData.get("forumContent") || "").trim();
    const mediaCount = form.querySelector('input[name="forumMedia"]')?.files?.length || 0;
    if (!title || !content) return;
    const id = `POST-${Date.now().toString().slice(-6)}`;
    posts.unshift({
      id,
      title,
      author: "当前用户",
      time: "刚刚",
      replies: 0,
      likes: 0,
      status: "正常",
      content: mediaCount ? `${content} / 已上传 ${mediaCount} 个图片或视频文件` : content,
    });
    state.userForum.selectedPost = id;
    state.userForum.createOpen = false;
    state.userFeedback = mediaCount ? `${title} 已发布，并上传 ${mediaCount} 个图片或视频文件。` : `${title} 已发布。`;
    render();
  }

  function handleUserForumReplySubmit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const id = form.dataset.userId || "";
    const target = posts.find((item) => item.id === id);
    if (!target) return;
    const text = String(new FormData(form).get("forumReply") || "").trim();
    if (!text) return;
    comments.unshift({
      id: `COMMENT-${Date.now().toString().slice(-6)}`,
      post: id,
      author: "当前用户",
      time: "刚刚",
      content: text,
      status: "正常",
    });
    target.replies = (target.replies || 0) + 1;
    state.userForum.replyPostId = "";
    state.userFeedback = `${safe(target.title, "帖子")} 已回复。`;
    render();
  }

  function handleUserChatSubmit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const id = form.dataset.userId || "";
    const target = fallback.providerMessages.find((item) => item.id === id);
    if (!target) return;
    const text = String(new FormData(form).get("userChatMessage") || "").trim();
    if (!text) return;
    const now = new Date();
    const time = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    target.messages.push({ from: "user", text, time });
    target.preview = text;
    target.time = time;
    target.status = "沟通中";
    state.userMe.selectedMessage = id;
    state.userFeedback = `${safe(target.title, "消息")} 已发送。`;
    render();
  }

  function handleUserAddressSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const name = String(formData.get("addressName") || "").trim();
    const phone = String(formData.get("addressPhone") || "").trim();
    const address = String(formData.get("addressDetail") || "").trim();
    if (!name || !phone || !address) return;
    fallback.userAddresses.unshift({
      id: `ADDR-${Date.now().toString().slice(-6)}`,
      name,
      phone,
      address,
      tag: "新增地址",
    });
    state.userMe.addressCreateOpen = false;
    state.userFeedback = "地址已新增。";
    render();
  }

  function handleUserOrderSubmit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const type = form.dataset.userType || "";
    const id = form.dataset.userId || "";
    const formData = new FormData(form);
    const vehicle = String(formData.get("userVehicle") || "").trim();
    const phone = String(formData.get("userPhone") || "").trim();
    const receiver = String(formData.get("userReceiver") || "").trim();
    const address = String(formData.get("userAddress") || "").trim();
    const time = String(formData.get("userTime") || "").trim();
    const quantity = Math.max(1, Number(formData.get("userQuantity") || 1));
    const note = String(formData.get("userNote") || "").trim();
    if (!vehicle || !phone || !time || !note) return;
    if (type === "goods" && (!receiver || !address)) return;
    const source = (type === "goods" ? products.find((item) => item.sku === id) : services.find((item) => String(item.id || item.name) === id));
    if (!source) return;
    const orderId = `UO-${Date.now().toString().slice(-6)}`;
    orders.unshift({
      id: orderId,
      user: "当前用户",
      vehicle,
      service: `${safe(source.name, "下单项目")} x${quantity}`,
      provider: safe(providers[0]?.name, "推荐门店"),
      city: safe(providers[0]?.city, "上海"),
      quote: safe(source.price, "待确认"),
      payment: type === "goods" ? "已支付" : "待支付",
      status: "待分配",
      progress: `${type === "goods" ? `商品已付款，收件人 ${receiver} / ${address}` : "服务预约已提交"}，备注：${note}`,
      appointment: time,
      intention: safe(providers[0]?.name, "推荐门店"),
      phone,
    });
    state.userOrderForm = { type: "", id: "" };
    state.userFeedback = `${safe(source.name, "订单")} 已提交，下单编号 ${orderId}。`;
    if (type === "goods") {
      state.userDialog = { type: "service-upsell", orderId, sourceName: safe(source.name, "商品") };
      state.tab = "mall";
    } else {
      state.tab = "me";
    }
    render();
  }

  function handleUserDialogAction(button) {
    const action = button.dataset.userDialogAction;
    const { orderId, sourceName } = state.userDialog;
    if (action === "need-service") {
      state.userDialog = { type: "provider-pick", orderId, sourceName };
      render();
      return;
    }
    if (action === "pick-provider") {
      const provider = providers.find((item) => item.id === button.dataset.providerId) || providers[0];
      state.userDialog = { type: "", orderId: "", sourceName: "" };
      state.tab = "mall";
      state.subTab.mall = "service";
      state.userFeedback = `${orderId} 已付款，已选择 ${safe(provider?.name, "服务商")}，请继续预约改装服务。`;
      render();
      return;
    }
    if (action === "platform-assign") {
      state.userDialog = { type: "", orderId: "", sourceName: "" };
      state.tab = "mall";
      state.subTab.mall = "service";
      state.userFeedback = `${orderId} 已付款，改装服务将由平台统一派单。`;
      render();
      return;
    }
    if (action === "provider-back") {
      state.userDialog = { type: "service-upsell", orderId, sourceName };
      render();
      return;
    }
    if (action === "skip-service") {
      state.userDialog = { type: "", orderId: "", sourceName: "" };
      state.tab = "me";
      state.userFeedback = `${orderId} 已完成付款，暂不预约改装服务。`;
      render();
    }
  }

  function updateGarageRender() { const color = fallback.colors[state.garageColor]; const wheel = fallback.wheels[state.garageWheel]; const body = document.getElementById("carBody"); const leftWheel = document.getElementById("leftWheel"); const rightWheel = document.getElementById("rightWheel"); if (!body || !leftWheel || !rightWheel) return; body.style.background = `linear-gradient(145deg, ${shade(color.value, -18)}, ${color.value})`; const g = `radial-gradient(circle, #a3a9b3 0 10%, ${shade(wheel.color, -30)} 12% 44%, #0a0d11 46% 100%)`; leftWheel.style.background = g; rightWheel.style.background = g; screenEl.querySelectorAll("[data-color-index]").forEach((e, i) => e.classList.toggle("active", i === state.garageColor)); screenEl.querySelectorAll("[data-wheel-index]").forEach((e, i) => e.classList.toggle("active", i === state.garageWheel)); }
  function shade(hex, amount) { const v = hex.replace("#", ""); const size = v.length === 3 ? 1 : 2; const parts = []; for (let i = 0; i < 3; i += 1) { const s = i * size; const c = size === 1 ? parseInt(v[s] + v[s], 16) : parseInt(v.slice(s, s + 2), 16); const n = Math.max(0, Math.min(255, c + amount)); parts.push(n.toString(16).padStart(2, "0")); } return `#${parts.join("")}`; }

  render();
  updateGarageRender();
})();
