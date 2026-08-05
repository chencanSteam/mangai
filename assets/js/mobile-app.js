(function () {
  const appType = document.body.dataset.mobileApp;
  if (!appType) return;

  const screenEl = document.getElementById("mobileApp");
  const { providers, orders, products, settlements, cases, posts, comments, vehicles, services, forumBoards } = window.MockData;

  const appConfigs = {
    admin: { title: "平台管理端", tabs: ["home", "providers", "orders", "operations", "me"], labels: { home: "首页", providers: "服务商", orders: "订单", operations: "运营", me: "我的" } },
    provider: { title: "服务商端", tabs: ["home", "orders", "operations", "messages", "me"], labels: { home: "首页", orders: "订单", operations: "运营", messages: "消息", me: "我的" } },
    user: { title: "用户端", tabs: ["forum", "mall", "garage", "messages", "me"], labels: { forum: "社区", mall: "商城", garage: "爱车", messages: "消息", me: "我的" } },
  };

  const CART_STORAGE_KEY = "mockUserCart";
  const ORDER_STORAGE_KEY = "mockUserOrders";
  const COLLECTIONS_STORAGE_KEY = "mockUserCollections";
  const AUTH_STORAGE_KEY = "mockUserAuth";
  const INVOICE_STORAGE_KEY = "mockUserInvoices";
  const POINTS_STORAGE_KEY = "mockUserPoints";
  const MALL_RECOMMENDATION_STORAGE_KEY = "mockMallRecommendations";

  function priceToNumber(value) {
    return Number(String(value || "").replace(/[^\d.]/g, "")) || 0;
  }

  function formatCurrency(value) {
    return `¥ ${Number(value || 0).toLocaleString("zh-CN")}`;
  }

  function toDateTimeLocalValue(value) {
    return String(value || "").replace(" ", "T").slice(0, 16);
  }

  function createProviderServicePricingEntry(item, index) {
    const base = priceToNumber(item.price) || 3000;
    const min = Math.max(1000, Math.floor(base * 0.88 / 100) * 100);
    const max = Math.max(min + 500, Math.ceil(base * 1.12 / 100) * 100);
    const suggested = Math.min(max, Math.max(min, Math.round(base / 100) * 100));
    return {
      enabled: item.status !== "停用" && index < 3,
      quote: suggested,
      suggested,
      min,
      max,
    };
  }

  function buildProviderServicePricingState() {
    return services.reduce((acc, item, index) => {
      acc[item.code || item.name || `service-${index}`] = createProviderServicePricingEntry(item, index);
      return acc;
    }, {});
  }

  function getVehicleBrandLabel(model) {
    return String(model || "").trim().split(/\s+/)[0] || "";
  }

  const locationOptions = {
    上海市: { 上海市: ["闵行区", "徐汇区", "浦东新区"] },
    浙江省: { 杭州市: ["滨江区", "西湖区", "余杭区"] },
    广东省: { 深圳市: ["南山区", "福田区", "宝安区"] },
    北京市: { 北京市: ["朝阳区", "海淀区", "通州区"] },
  };

  const state = {
    tab: appConfigs[appType].tabs[0],
    subTab: {},
    garageColor: 0,
    garageWheel: 0,
    garageFilm: 0,
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
    adminProviderDetail: {
      open: false,
      tab: "basic",
    },
    adminOrders: {
      category: "service",
      serviceStatus: "all",
      goodsStatus: "all",
      afterSaleStatus: "all",
    },
    adminShipment: {
      orderId: "",
    },
    providerSelected: {
      orders: orders[0]?.id || "",
      products: products[0]?.sku || "",
      cases: cases[0]?.id || "",
      forum: posts[0]?.id || "",
      messages: "",
    },
    providerFeedback: "",
    providerCompletion: {
      orderId: "",
    },
    providerPurchase: {
      sku: "",
      formOpen: false,
    },
    providerCaseForm: {
      mode: "",
      id: "",
    },
    providerAfterSale: {
      orderId: "",
    },
    providerMe: {
      profileEditOpen: false,
      moderatorApplyOpen: false,
      moderatorStatus: "", // "" | "待审核" | "已通过" | "已驳回"
      profileStores: [],
    },
    providerServicePricing: buildProviderServicePricingState(),
    providerDialog: {
      type: "",
      orderId: "",
    },
    userSelected: {
      goods: products[0]?.sku || "",
      service: services[0]?.id || services[0]?.name || "",
    },
    userMallPage: "",
    userMall: {
      keyword: "",
      brand: getVehicleBrandLabel(vehicles[0]?.model),
      model: vehicles[0]?.model || "",
    },
    userOrderForm: {
      type: "",
      id: "",
    },
    userFeedback: "",
    userAuthMode: "login",
    userAuthFeedback: "",
    wechatBindInfo: null,
    userMe: {
      selectedOrder: "",
      selectedMessage: "",
      invoiceOrderId: "",
      addressCreateOpen: false,
      creditApplyOpen: false,
      couponFilter: "available",
      afterSaleOrderId: "",
      reviewOrderId: "",
    },
    userGarage: {
      selectedVehicle: vehicles[0]?.id || vehicles[0]?.plate || vehicles[0]?.model || "",
      createOpen: false,
      detailOpen: false,
      locationProvince: "上海市",
      locationCity: "上海市",
      locationCounty: "闵行区",
      locationEditing: false,
    },
    userForum: {
      selectedPost: "",
      createOpen: false,
      replyPostId: "",
      editingPostId: "",
      filter: "hot",
      category: "all",
    },
    userDialog: {
      type: "",
      orderId: "",
      sourceName: "",
      rating: 0,
    },
    userShareSheet: {
      open: false,
      id: "",
      type: "",
    },
  };

  if (appType === "user" && typeof window !== "undefined") {
    const params = new URLSearchParams(window.location.search);
    if (window.location.pathname.endsWith("/pages/user-app.html")) {
      const targetTab = params.get("tab") || "";
      const mallPage = params.get("mallPage") || "";
      const meTab = params.get("meTab") || "";
      const forumCategory = params.get("forumCategory") || "";
      const orderId = params.get("orderId") || "";
      const feedback = params.get("feedback") || "";
      if (targetTab && appConfigs.user.tabs.includes(targetTab)) {
        state.tab = targetTab;
      }
      if (mallPage) {
        state.tab = "mall";
        state.userMallPage = mallPage;
      }
      if (meTab) state.subTab.me = meTab;
      if (forumCategory) state.userForum.category = forumCategory;
      if (orderId && params.get("openDetail") === "1") state.userMe.selectedOrder = orderId;
      if (feedback) state.userFeedback = feedback;
    }
  }

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
    providerMessages: window.MockData.orderChats || [],
    userHistoryOrders: [
      { id: "UO-240401", type: "商品订单", displayType: "自提", user: "当前用户", vehicle: "宝马 G20 330i", service: "BBS 轮毂套装 x1", quote: "¥ 18,800", sku: "PR-8801", status: "待验收", progress: "商品已安装完成，等待用户确认验收。", appointment: "2026-04-01 14:00", provider: "御驰 Performance Studio" },
      { id: "UO-240328", type: "商品订单", displayType: "自提", user: "当前用户", vehicle: "AMG C43", service: "Akrapovic 排气升级", quote: "¥ 31,500", sku: "PR-8802", status: "已完成", progress: "已完成验收并归档。", appointment: "2026-03-28 10:30", provider: "擎速 Motorsport Lab" },
      { id: "UO-240320", type: "服务订单", displayType: "改装服务", user: "当前用户", vehicle: "保时捷 718 Cayman", service: "XPEL 车衣施工", quote: "¥ 12,600", status: "施工中", progress: "门店已接单，正在施工中。", appointment: "2026-03-20 09:00", provider: "凌速 High Spec Garage" },
    ],
    userAddresses: [
      { id: "ADDR-1", name: "周恺", phone: "13800138000", address: "上海市闵行区申长路 1688 号 2 栋 801", tag: "默认地址" },
      { id: "ADDR-2", name: "周恺", phone: "13800138000", address: "杭州市滨江区江南大道 588 号 1 单元 1202", tag: "常用地址" },
    ],
    providerAddresses: [
      { id: "PA-1", name: "御驰 Performance Studio", phone: "021-54321098", address: "上海市闵行区申长路 1688 号改装产业园 A2-301", tag: "门店地址" },
      { id: "PA-2", name: "御驰 Performance Studio", phone: "021-54321098", address: "上海市浦东新区张江高科路 888 号 3 栋 502", tag: "备用收货点" },
    ],
  };

  const providerOrderExtras = {
    "OD-240402-011": {
      phone: "13800139011",
      duration: "1 天",
      remark: "客户希望当天完成刹车升级，请优先安排施工排期。",
      arrival: "预计 09:40 到店",
    },
    "OD-240402-008": {
      phone: "13900135208",
      duration: "1-2 天",
      remark: "氛围灯与内饰包覆同步施工，需在交付前做整车联调。",
      arrival: "已于昨日 13:55 到店",
    },
    "OD-240401-023": {
      phone: "13700131023",
      duration: "0.5 天",
      remark: "商品单以备货签收为主，重点核对轮毂包装与物流签收。",
      arrival: "待物流揽收",
    },
    "OD-240331-017": {
      phone: "13600133317",
      duration: "1 天",
      remark: "完工资料已上传，等待平台确认赛道模式底盘参数。",
      arrival: "已完工待客户验收",
    },
    "OD-240329-006": {
      phone: "13500139006",
      duration: "2 天",
      remark: "订单已完工交付，建议补录售后回访结果与客户改装清单。",
      arrival: "已交付客户",
    },
    "OD-240403-021": {
      phone: "18800133021",
      duration: "1.5 天",
      remark: "客户要求今天完成漆面膜预洗和边角复查，请优先安排施工排期。",
      arrival: "预计 15:10 到店",
    },
    "OD-240403-018": {
      phone: "18600137018",
      duration: "1 天",
      remark: "轮毂已到位，施工后需要安排高速平衡和路试反馈。",
      arrival: "已于 08:46 到店",
    },
    "OD-240402-026": {
      phone: "13900131126",
      duration: "1 天",
      remark: "排气阀门联调已完成，等待平台确认视频和声浪说明。",
      arrival: "已完工待客户验收",
    },
    "OD-240401-015": {
      phone: "13800136015",
      duration: "1 天",
      remark: "轮毂升级与定位数据已复核完成，客户已确认交付。",
      arrival: "已完成交车并归档",
    },
    "OD-240330-012": {
      phone: "13900132012",
      duration: "1 天",
      remark: "客户反馈高速路段有轻微异响，已安排返店复查。",
      arrival: "已预约 2026-04-09 10:00 返店售后",
      afterSaleStatus: "售后处理中",
      afterSaleType: "异响复查",
      afterSaleTime: "2026-04-09 10:00",
      afterSaleNote: "复查排气吊耳与连接卡箍，路试后再次回访客户。",
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
    {
      id: "OD-240401-015",
      type: "服务订单",
      user: "陆川",
      vehicle: "宝马 G20 330i",
      service: "BBS 轮毂升级 + 四轮定位",
      provider: "擎速 Motorsport Lab",
      city: "杭州",
      quote: "¥ 18,800",
      payment: "已支付",
      status: "已完成",
      progress: "客户已完成验收，订单已归档。",
      appointment: "2026-04-01 11:00",
      intention: "擎速 Motorsport Lab",
    },
    {
      id: "OD-240330-012",
      type: "服务订单",
      user: "沈越",
      vehicle: "保时捷 718 Cayman",
      service: "Akrapovic 尾段排气升级",
      provider: "擎速 Motorsport Lab",
      city: "杭州",
      quote: "¥ 26,500",
      payment: "已支付",
      status: "售后中",
      progress: "已登记售后：异响复查，预约 2026-04-09 10:00 返店处理。",
      appointment: "2026-03-30 14:30",
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
  const getProductStandardFacts = (item) => [
    ["系列", item.series],
    ["车型", item.vehicleModel],
    ["产品型号", item.productModel],
    ["材质/颜色", item.materialColor],
    ["轮毂尺寸(英寸)", item.wheelSizeInch],
    ["刹车碟规格(mm)", item.brakeDiscSpecMm],
    ["刹车碟可选花纹", item.brakeDiscPatterns],
    ["卡钳可选颜色", item.caliperColors],
    ["产品图1", item.productImage1],
    ["产品图2", item.productImage2],
    ["产品图3", item.productImage3],
    ["产品图4", item.productImage4],
    ["产品图5", item.productImage5],
    ["产品图6", item.productImage6],
    ["安装图1", item.installImage1],
    ["安装图2", item.installImage2],
    ["安装图3", item.installImage3],
    ["安装图4", item.installImage4],
    ["国际汽联认证", item.fiaCertified],
    ["配件可选码数", item.optionalSizes],
    ["ENP镀镍/氧化灰版本零售价格", item.nickelGreyRetailPrice],
    ["折扣力度", item.discountLevel],
    ["终端零售价", item.terminalRetailPrice],
    ["是否含税", item.taxIncluded],
    ["是否包含运费", item.freightIncluded],
    ["备注", item.remark],
  ];
  const renderProductStandardFacts = (item) => getProductStandardFacts(item)
    .map(([label, value]) => `<div><span>${label}</span><strong>${safe(value, "-")}</strong></div>`)
    .join("");
  const formatProviderRegion = (item) => {
    const province = safe(item?.locationProvince, "");
    const city = safe(item?.locationCity, item?.city ? `${item.city}${String(item.city).endsWith("市") ? "" : "市"}` : "");
    const county = safe(item?.locationCounty, item?.district ? `${item.district}${String(item.district).endsWith("区") ? "" : "区"}` : "");
    return [province, city && city !== province ? city : "", county].filter(Boolean).join(" / ") || `${safe(item?.city, "-")} / ${safe(item?.district, "-")}`;
  };
  const formatStoreAddress = (store) =>
    safe(
      store?.address ||
        `${safe(store?.locationProvince, "")}${safe(store?.locationCity, "")}${safe(store?.locationCounty, "")}${safe(store?.locationAddress, "")}`,
      "-"
    );
  const getProviderStores = (row) => {
    if (Array.isArray(row?.stores) && row.stores.length) return row.stores;
    return [
      {
        id: row?.id,
        name: row?.name,
        address: row?.address,
        city: row?.city,
        district: row?.district,
        locationProvince: row?.locationProvince,
        locationCity: row?.locationCity,
        locationCounty: row?.locationCounty,
        locationAddress: row?.locationAddress,
        status: row?.status,
        auditStatus: row?.auditStatus,
        isPrimary: true,
      },
    ];
  };
  const deriveProviderStatusFromStores = (row) => {
    const stores = getProviderStores(row);
    const statuses = stores.map((s) => s.auditStatus);
    if (statuses.every((s) => s === "已通过")) {
      row.auditStatus = "已通过";
      row.status = "正常营业";
    } else if (statuses.every((s) => s === "已驳回")) {
      row.auditStatus = "已驳回";
      row.status = "已驳回";
    } else if (statuses.some((s) => s === "待补充")) {
      row.auditStatus = "待补充";
      row.status = "";
    } else {
      row.auditStatus = "待审核";
      row.status = "";
    }
  };
  const setStoreAuditStatus = (row, storeId, auditStatus) => {
    const store = getProviderStores(row).find((s) => s.id === storeId);
    if (!store) return;
    store.auditStatus = auditStatus;
    if (auditStatus === "已通过") store.status = "正常营业";
    else if (auditStatus === "已驳回") store.status = "已驳回";
    else store.status = "";
    deriveProviderStatusFromStores(row);
  };
  const tagType = (text) => ["正常营业", "已通过", "正常", "首页展示", "正常展示", "上架", "启用", "已完成", "已结清", "已归档", "已开具"].includes(text) ? "success" : ["待审核", "待分配", "待接单", "待发货", "待验收", "待签收", "待补充", "审核中", "售后中", "待付款", "待确认", "待复核", "待开票"].includes(text) ? "warning" : ["已驳回", "已拒单", "暂停接单", "已删除", "缺货", "停用"].includes(text) ? "danger" : ["施工中"].includes(text) ? "info" : "neutral";
  const tag = (text) => `<span class="tag ${tagType(text)}">${text}</span>`;
  const nAudit = (v) => String(v || "").includes("通过") ? "已通过" : String(v || "").includes("驳") ? "已驳回" : String(v || "").includes("补") ? "待补充" : "待审核";
  const nProvider = (v) => String(v || "").includes("暂停") ? "暂停接单" : String(v || "").includes("驳") ? "已驳回" : "正常营业";
  const nOrder = (v) => { const t = String(v || ""); if (t.includes("售后")) return "售后中"; if (t.includes("接单")) return "待接单"; if (t.includes("分配")) return "待分配"; if (t.includes("施工")) return "施工中"; if (t.includes("完成")) return "已完成"; if (t.includes("发货")) return "待发货"; if (t.includes("验收")) return "待验收"; if (t.includes("签收")) return "待签收"; return "处理中"; };
  const nCaseAudit = (v) => String(v || "").includes("通过") ? "已通过" : String(v || "").includes("驳") || String(v || "").includes("修改") ? "已驳回" : "待审核";
  const nCaseDisplay = (v) => String(v || "").includes("首页") || String(v || "").includes("推荐") ? "首页展示" : String(v || "").includes("正常") ? "正常展示" : "未展示";
  const nForum = (v) => String(v || "").includes("删除") ? "已删除" : "正常";
  const nProduct = (v) => String(v || "").includes("缺") ? "缺货" : "上架";
  const nSettlement = (v) => {
    const text = String(v || "");
    if (text.includes("归档") || text.includes("结清") || text.includes("通过")) return "已归档";
    if (text.includes("复核") || text.includes("确认") || text.includes("审核中")) return "待复核";
    return text || "待复核";
  };
  const nPurchaseStatus = (v) => String(v || "").includes("签收") ? "已签收" : String(v || "").includes("发货") ? "已发货" : "待发货";
  const getSettlementGrossAmount = (item) => safe(item.grossAmount || item.amount, "¥ 0");
  const getOrderTimeline = (item) =>
    item.timeline || [
      `${safe(item.appointment, "2026-04-02 09:00")} 订单创建`,
      `${safe(item.appointment, "2026-04-02 09:00")} 当前进度：${safe(item.progress, "处理中")}`,
    ];
  function getNowStamp() {
    const date = new Date();
    const pad = (value) => String(value).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }
  function appendOrderTimeline(order, text) {
    if (!order) return;
    const timeline = Array.isArray(order.timeline) ? order.timeline : getOrderTimeline(order);
    order.timeline = [`${getNowStamp()} ${text}`, ...timeline];
  }
  function pushNotification(target, title, content) {
    const notifications = window.MockData.notifications = window.MockData.notifications || [];
    notifications.unshift({ id: `NOT-${Date.now().toString().slice(-6)}`, target, title, content, time: getNowStamp(), read: false });
  }
  function getUnreadNotificationCount(role) {
    const notifications = window.MockData.notifications || [];
    return notifications.filter((n) => n.target === role && !n.read).length;
  }
  function markNotificationsRead(role) {
    const notifications = window.MockData.notifications || [];
    notifications.forEach((n) => { if (n.target === role) n.read = true; });
  }
  function getNotificationsForRole(role) {
    return (window.MockData.notifications || []).filter((n) => n.target === role);
  }

  function render() {
    const cfg = appConfigs[appType];
    const userLoggedIn = appType !== "user" || !!getMockUserAuth();
    const topbarMarkup = appType === "user"
      ? ""
      : `<header class="android-topbar"><span class="eyebrow">${cfg.title}</span><h2>${cfg.labels[state.tab]}</h2></header>`;
    screenEl.dataset.mobileShell = appType;
    screenEl.innerHTML = `
      <div class="android-status"><span>9:41</span><span>5G 92%</span></div>
      ${topbarMarkup}
      <section class="screen-content">${!userLoggedIn ? renderUserAuth() : appType === "admin" ? renderAdmin() : appType === "provider" ? renderProvider() : renderUser()}</section>
      ${userLoggedIn ? `<nav class="bottom-nav">${cfg.tabs.map((id) => { const unread = id === "messages" ? getUnreadNotificationCount(appType === "provider" ? "provider" : appType === "user" ? "user" : "admin") : 0; return `<button class="${state.tab === id ? "active" : ""}" type="button" data-tab="${id}">${unread > 0 ? `<i class="nav-badge">${unread}</i>` : ""}<span>${cfg.labels[id]}</span></button>`; }).join("")}</nav>` : ""}
      ${userLoggedIn ? (appType === "provider" ? renderProviderDialog() : appType === "user" ? renderUserDialog() + renderUserShareSheet() : "") : ""}
    `;
    const phoneFrame = screenEl.closest(".phone-frame");
    if (phoneFrame) {
      phoneFrame.style.position = "relative";
      const oldSheet = phoneFrame.querySelector(".share-sheet");
      const shareSheetEl = screenEl.querySelector(".share-sheet");
      if (shareSheetEl) {
        if (oldSheet && oldSheet !== shareSheetEl) oldSheet.remove();
        phoneFrame.appendChild(shareSheetEl);
      } else if (oldSheet) {
        oldSheet.remove();
      }
    }
    bindEvents();
  }

  function bindEvents() {
    screenEl.querySelectorAll("[data-tab]").forEach((b) => b.addEventListener("click", () => {
      state.tab = b.dataset.tab;
      if (b.dataset.tab === "mall") state.userMallPage = "";
      if (b.dataset.tab === "forum") {
        state.userForum.category = "all";
        state.userForum.selectedPost = "";
        state.userForum.createOpen = false;
      }
      render();
    }));
    screenEl.querySelectorAll("[data-sub-tab]").forEach((b) => b.addEventListener("click", () => { state.subTab[state.tab] = b.dataset.subTab; render(); }));
    screenEl.querySelectorAll("[data-admin-pick]").forEach((b) => b.addEventListener("click", () => { state.adminSelected[b.dataset.adminType] = b.dataset.adminId; render(); }));
    screenEl.querySelectorAll("[data-admin-provider-detail-tab]").forEach((b) => b.addEventListener("click", () => { state.adminProviderDetail.tab = b.dataset.adminProviderDetailTab; render(); }));
    screenEl.querySelectorAll("[data-admin-order-category]").forEach((b) => b.addEventListener("click", () => {
      state.adminOrders.category = b.dataset.adminOrderCategory || "service";
      const rows = getAdminFilteredOrders();
      state.adminSelected.orders = rows[0]?.id || "";
      render();
    }));
    screenEl.querySelectorAll("[data-admin-order-status]").forEach((b) => b.addEventListener("click", () => {
      const category = state.adminOrders.category || "service";
      if (category === "goods") {
        state.adminOrders.goodsStatus = b.dataset.adminOrderStatus || "all";
      } else {
        state.adminOrders.serviceStatus = b.dataset.adminOrderStatus || "all";
      }
      const rows = getAdminFilteredOrders();
      state.adminSelected.orders = rows[0]?.id || "";
      render();
    }));
    screenEl.querySelectorAll("[data-admin-shortcut]").forEach((b) => b.addEventListener("click", () => {
      state.tab = b.dataset.adminShortcut;
      if (state.tab === "providers") state.subTab.providers = "audit";
      if (state.tab === "orders") {
        state.adminOrders.category = "service";
        state.adminOrders.serviceStatus = "all";
        state.adminSelected.orders = getAdminFilteredOrders()[0]?.id || "";
      }
      if (state.tab === "operations") state.subTab.operations = b.dataset.operationsTarget || "cases";
      render();
    }));
    screenEl.querySelectorAll("[data-admin-action]").forEach((b) => b.addEventListener("click", () => handleAdminAction(b)));
    screenEl.querySelectorAll("[data-admin-shipping-form]").forEach((form) => form.addEventListener("submit", handleAdminShippingSubmit));
    screenEl.querySelectorAll("[data-provider-pick]").forEach((b) => b.addEventListener("click", () => { if (state.subTab.operations === "forum") { window.location.href = `provider-topic-detail.html?id=${b.dataset.providerId}`; return; } state.providerSelected[b.dataset.providerType] = b.dataset.providerId; render(); }));
    screenEl.querySelectorAll("[data-provider-shortcut]").forEach((b) => b.addEventListener("click", () => {
      state.tab = b.dataset.providerShortcut;
      if (state.tab === "orders") state.subTab.orders = b.dataset.ordersTarget || "pending";
      if (state.tab === "operations") state.subTab.operations = b.dataset.operationsTarget || "cases";
      if (state.tab === "messages") state.subTab.messages = b.dataset.messagesTarget || "all";
      if (state.tab === "me") state.subTab.me = b.dataset.meTarget || "profile";
      render();
    }));
    screenEl.querySelectorAll("[data-provider-action]").forEach((b) => b.addEventListener("click", () => handleProviderAction(b)));
    screenEl.querySelectorAll("[data-provider-complete-form]").forEach((form) => form.addEventListener("submit", handleProviderCompleteSubmit));
    screenEl.querySelectorAll("[data-provider-purchase-form]").forEach((form) => form.addEventListener("submit", handleProviderPurchaseSubmit));
    screenEl.querySelectorAll("[data-provider-case-form]").forEach((form) => form.addEventListener("submit", handleProviderCaseSubmit));
    screenEl.querySelectorAll("[data-provider-accept-form]").forEach((form) => form.addEventListener("submit", handleProviderAcceptSubmit));
    screenEl.querySelectorAll("[data-provider-profile-form]").forEach((form) => {
      form.addEventListener("submit", handleProviderProfileSubmit);
      bindProviderProfileStoreEvents(form);
    });
    screenEl.querySelectorAll("[data-provider-pricing-form]").forEach((form) => {
      form.addEventListener("submit", handleProviderPricingSubmit);
      syncProviderPricingForm(form);
      form.querySelectorAll("[data-provider-price-toggle]").forEach((input) => input.addEventListener("change", () => syncProviderPricingForm(form)));
    });
    screenEl.querySelectorAll("[data-provider-chat-form]").forEach((form) => form.addEventListener("submit", handleProviderChatSubmit));
    screenEl.querySelectorAll("[data-provider-dialog-action]").forEach((b) => b.addEventListener("click", () => handleProviderDialogAction(b)));
    screenEl.querySelectorAll("[data-provider-moderator-form]").forEach((form) => form.addEventListener("submit", handleProviderModeratorSubmit));
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
    screenEl.querySelectorAll("select[data-user-mall-filter]").forEach((s) => s.addEventListener("change", () => handleUserMallFilterChange(s)));
    screenEl.querySelectorAll("[data-user-mall-search-form]").forEach((form) => form.addEventListener("submit", handleUserMallSearchSubmit));
    screenEl.querySelectorAll("[data-user-order-form]").forEach((form) => form.addEventListener("submit", handleUserOrderSubmit));
    screenEl.querySelectorAll("[data-user-auth-form]").forEach((form) => form.addEventListener("submit", handleUserAuthSubmit));
    screenEl.querySelectorAll("[data-user-auth-mode]").forEach((b) => b.addEventListener("click", () => {
      state.userAuthMode = b.dataset.userAuthMode || "login";
      state.userAuthFeedback = "";
      render();
    }));
    screenEl.querySelectorAll("[data-user-invoice-form]").forEach((form) => form.addEventListener("submit", handleUserInvoiceSubmit));
    screenEl.querySelectorAll("[data-user-vehicle-form]").forEach((form) => form.addEventListener("submit", handleUserVehicleSubmit));
    screenEl.querySelectorAll("[data-user-forum-form]").forEach((form) => form.addEventListener("submit", handleUserForumSubmit));
    screenEl.querySelectorAll("[data-rich-cmd]").forEach((btn) => btn.addEventListener("click", () => {
      const cmd = btn.dataset.richCmd;
      const val = btn.dataset.richVal || null;
      if (cmd === "createLink") {
        const url = prompt("请输入链接地址：", "https://");
        if (url) document.execCommand(cmd, false, url);
      } else {
        document.execCommand(cmd, false, val);
      }
      const editor = screenEl.querySelector("#forumRichEditor");
      if (editor) editor.focus();
    }));
    screenEl.querySelectorAll("[data-user-forum-reply-form]").forEach((form) => form.addEventListener("submit", handleUserForumReplySubmit));
    screenEl.querySelectorAll("[data-user-forum-edit-form]").forEach((form) => form.addEventListener("submit", handleUserForumEditSubmit));
    screenEl.querySelectorAll("[data-user-chat-form]").forEach((form) => form.addEventListener("submit", handleUserChatSubmit));
    screenEl.querySelectorAll("[data-user-address-form]").forEach((form) => form.addEventListener("submit", handleUserAddressSubmit));
    screenEl.querySelectorAll("[data-user-credit-form]").forEach((form) => form.addEventListener("submit", handleUserCreditSubmit));
    screenEl.querySelectorAll("[data-user-profile-form]").forEach((form) => form.addEventListener("submit", handleUserProfileSubmit));
    screenEl.querySelectorAll("[data-user-avatar-input]").forEach((input) => input.addEventListener("change", handleUserAvatarChange));
    screenEl.querySelectorAll("[data-user-after-sale-form]").forEach((form) => form.addEventListener("submit", handleUserAfterSaleSubmit));
    screenEl.querySelectorAll("[data-user-after-sale-return-form]").forEach((form) => form.addEventListener("submit", handleUserAfterSaleReturnSubmit));
    screenEl.querySelectorAll("[data-user-after-sale-action]").forEach((button) => button.addEventListener("click", () => handleUserAfterSaleAction(button)));
    screenEl.querySelectorAll("[data-user-review-form]").forEach((form) => form.addEventListener("submit", handleUserReviewSubmit));
    screenEl.querySelectorAll("[data-user-review-media]").forEach((input) => input.addEventListener("change", handleUserReviewMediaChange));
    screenEl.querySelectorAll("[data-user-dialog-action]").forEach((b) => b.addEventListener("click", () => handleUserDialogAction(b)));
    screenEl.querySelectorAll("[data-user-dialog-rating]").forEach((b) => b.addEventListener("click", () => {
      state.userDialog.rating = Number(b.dataset.userDialogRating || 0);
      render();
    }));
    screenEl.querySelectorAll("[data-setting-key]").forEach((b) => b.addEventListener("click", () => { const key = b.dataset.settingKey; state.adminSettings[key] = !state.adminSettings[key]; render(); }));
    screenEl.querySelectorAll("[data-color-index]").forEach((b) => b.addEventListener("click", () => { updateGarageChoice("color", Number(b.dataset.colorIndex)); }));
    screenEl.querySelectorAll("[data-wheel-index]").forEach((b) => b.addEventListener("click", () => { updateGarageChoice("wheel", Number(b.dataset.wheelIndex)); }));
    screenEl.querySelectorAll("[data-film-index]").forEach((b) => b.addEventListener("click", () => { updateGarageChoice("film", Number(b.dataset.filmIndex)); }));
    screenEl.querySelectorAll("[data-stop-propagation]").forEach((el) => el.addEventListener("click", (e) => e.stopPropagation()));
    bindScrollableSubTabs();
  }

  function bindScrollableSubTabs() {
    screenEl.querySelectorAll(".sub-tabs").forEach((wrap) => {
      let pointerActive = false;
      let moved = false;
      let startX = 0;
      let startLeft = 0;
      let dragMoved = false;

      wrap.addEventListener("wheel", (event) => {
        if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
        wrap.scrollLeft += event.deltaY;
        event.preventDefault();
      }, { passive: false });

      wrap.addEventListener("pointerdown", (event) => {
        if (event.pointerType === "mouse" && event.button !== 0) return;
        pointerActive = true;
        moved = false;
        startX = event.clientX;
        startLeft = wrap.scrollLeft;
      });

      wrap.addEventListener("pointermove", (event) => {
        if (!pointerActive) return;
        const delta = event.clientX - startX;
        if (Math.abs(delta) > 6) {
          moved = true;
          wrap.classList.add("dragging");
        }
        wrap.scrollLeft = startLeft - delta;
      });

      const stopDragging = () => {
        if (!pointerActive) return;
        pointerActive = false;
        wrap.classList.remove("dragging");
        if (moved) {
          dragMoved = true;
          window.setTimeout(() => {
            moved = false;
            dragMoved = false;
          }, 0);
        }
      };

      wrap.addEventListener("pointerup", stopDragging);
      wrap.addEventListener("pointercancel", stopDragging);
      wrap.addEventListener("pointerleave", stopDragging);

      wrap.addEventListener("click", (event) => {
        if (!dragMoved) return;
        if (event.target.closest(".sub-tab")) {
          event.preventDefault();
          event.stopPropagation();
        }
      });
    });
  }

  function syncProviderPricingForm(form) {
    form.querySelectorAll("[data-provider-price-toggle]").forEach((toggle) => {
      const code = toggle.dataset.providerPriceToggle;
      const input = form.querySelector(`[data-provider-price-input="${code}"]`);
      if (!input) return;
      input.disabled = toggle.disabled || !toggle.checked;
    });
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
      if (active === "list" && state.adminProviderDetail.open && selected) {
        return `${subTabs([{ id: "audit", label: "入驻审核" }, { id: "list", label: "服务商列表" }])}${renderAdminProviderDetailPage(selected)}`;
      }
      return `${subTabs([{ id: "audit", label: "入驻审核" }, { id: "list", label: "服务商列表" }])}<div class="mobile-list">${rows.map((i) => `<div class="admin-inline-block"><button class="mobile-item admin-pick-card ${selected?.id === i.id ? "active" : ""}" type="button" data-admin-pick data-admin-type="providers" data-admin-id="${i.id}"><div style="display:flex; justify-content:space-between; gap:12px;"><strong>${safe(i.name, "服务商")}</strong>${tag(active === "audit" ? nAudit(i.auditStatus) : nProvider(i.status))}</div><div class="muted" style="margin-top:8px;">${formatProviderRegion(i)} / ${safe(i.specialties, "高端改装")}</div><div style="margin-top:10px;" class="muted">${safe(i.contact, "联系人待补充")}</div></button>${selected?.id === i.id ? renderAdminProviderDetail(i, active) : ""}</div>`).join("")}</div>`;
    }
    if (state.tab === "orders") {
      {
      const category = state.adminOrders.category || "service";
      const status = getAdminCurrentOrderStatus();
      const rows = getAdminFilteredOrders();
      const selected = rows.find((i) => i.id === state.adminSelected.orders) || rows[0];
      const categoryTabs = [{ id: "goods", label: "商品订单" }, { id: "service", label: "服务订单" }, { id: "after-sale", label: "售后订单" }];
      const statusTabs = getAdminOrderStatusTabs(category);
      const listContent = rows.length ? rows.map((i) => {
        const isGoods = isAdminGoodsOrder(i);
        return `<div class="admin-inline-block"><button class="mobile-item admin-pick-card ${selected?.id === i.id ? "active" : ""}" type="button" data-admin-pick data-admin-type="orders" data-admin-id="${i.id}"><div style="display:flex; justify-content:space-between; gap:12px;"><strong>${i.id}</strong>${tag(nOrder(i.status))}</div><div class="muted" style="margin-top:8px;">${safe(i.user, "用户")} / ${safe(i.vehicle, "车型")}</div><div style="margin-top:8px;">${safe(i.service, isGoods ? "商品" : "服务项目")}</div>${isGoods ? "" : `<div class="muted" style="margin-top:8px;">服务商：${safe(i.provider, "待分配")}</div>`}<div class="muted" style="margin-top:8px;">${isGoods ? `支付状态：${safe(i.payment, "-")} / ${safe(i.progress, "待履约")}` : `服务进度：${safe(i.progress, "处理中")}`}</div></button>${selected?.id === i.id ? renderAdminOrderDetail(i, category) : ""}</div>`;
      }).join("") : `<article class="mobile-item"><strong>${category === "goods" ? "暂无商品订单" : category === "after-sale" ? "暂无售后订单" : "暂无服务订单"}</strong><div class="muted" style="margin-top:8px;">当前状态为 ${statusTabs.find((item) => item.id === status)?.label || "全部"}，可切换上方标签查看其他订单。</div></article>`;
      return `<div class="stack"><div class="sub-tabs">${categoryTabs.map((item) => `<button class="sub-tab ${category === item.id ? "active" : ""}" type="button" data-admin-order-category="${item.id}">${item.label}</button>`).join("")}</div><div class="sub-tabs">${statusTabs.map((item) => `<button class="sub-tab ${status === item.id ? "active" : ""}" type="button" data-admin-order-status="${item.id}">${item.label}</button>`).join("")}</div><section class="admin-detail-card"><div class="eyebrow">Order Overview</div><h3>${category === "goods" ? "商品订单" : category === "after-sale" ? "售后订单" : "服务订单"}</h3><div class="admin-kv-list"><div><span>当前状态</span><strong>${statusTabs.find((item) => item.id === status)?.label || "全部"}</strong></div><div><span>订单数量</span><strong>${rows.length}</strong></div><div><span>业务说明</span><strong>${category === "goods" ? "平台商城商品销售、发货与履约跟进" : category === "after-sale" ? "用户售后申请、平台审核与退款/换货处理" : "用户改装需求、派单施工与验收闭环"}</strong></div></div></section><div class="mobile-list">${listContent}</div></div>`;
      }
      const active = state.subTab.orders || "list";
      const rows = active === "assign" ? orders.filter((i) => nOrder(i.status) === "待分配") : orders;
      const selected = rows.find((i) => i.id === state.adminSelected.orders) || rows[0];
      return `${subTabs([{ id: "list", label: "订单列表" }, { id: "assign", label: "订单分配" }])}<div class="mobile-list">${rows.map((i) => `<div class="admin-inline-block"><button class="mobile-item admin-pick-card ${selected?.id === i.id ? "active" : ""}" type="button" data-admin-pick data-admin-type="orders" data-admin-id="${i.id}"><div style="display:flex; justify-content:space-between; gap:12px;"><strong>${i.id}</strong>${tag(nOrder(i.status))}</div><div class="muted" style="margin-top:8px;">${safe(i.user, "用户")} / ${safe(i.vehicle, "车型")}</div><div style="margin-top:8px;">${safe(i.service, "服务项目")}</div><div class="muted" style="margin-top:8px;">服务商：${safe(i.provider, "待分配")}</div><div class="muted" style="margin-top:8px;">${active === "assign" ? `意向门店：${safe(i.intention, "未指定")}` : safe(i.progress, "处理中")}</div></button>${selected?.id === i.id ? renderAdminOrderDetail(i, active) : ""}</div>`).join("")}</div>`;
    }
    if (state.tab === "operations") {
      const active = state.subTab.operations || "cases";
      const rows = active === "cases" ? cases : posts;
      const selected = rows.find((i) => i.id === state.adminSelected[active]) || rows[0];
      return `${subTabs([{ id: "cases", label: "案例审核" }, { id: "forum", label: "论坛处理" }])}<div class="mobile-list">${rows.map((i) => active === "cases" ? `<div class="admin-inline-block"><button class="mobile-item admin-pick-card ${selected?.id === i.id ? "active" : ""}" type="button" data-admin-pick data-admin-type="cases" data-admin-id="${i.id}"><strong>${safe(i.title, "案例标题")}</strong><div class="muted" style="margin-top:8px;">${safe(i.model, "车型")} / ${safe(i.modType, "改装类型")} / ${safe(i.provider, "服务商")}</div><div style="margin-top:10px; display:flex; gap:10px; flex-wrap:wrap;">${tag(nCaseAudit(i.audit))}<span class="pill">${nCaseDisplay(i.display)}</span></div></button>${selected?.id === i.id ? renderAdminCaseDetail(i) : ""}</div>` : `<div class="admin-inline-block"><button class="mobile-item admin-pick-card ${selected?.id === i.id ? "active" : ""}" type="button" data-admin-pick data-admin-type="forum" data-admin-id="${i.id}"><strong>${safe(i.title, "帖子标题")}</strong><div class="muted" style="margin-top:8px;">${safe(i.author, "作者")} / ${safe(i.time, "今天")}</div><div style="margin-top:10px; display:flex; gap:10px; flex-wrap:wrap;"><span class="pill">回复 ${i.replies || 0}</span><span class="pill">点赞 ${i.likes || 0}</span><span class="pill">浏览 ${(i.views || 0).toLocaleString("zh-CN")}</span>${tag(nForum(i.status))}</div></button>${selected?.id === i.id ? renderAdminForumDetail(i) : ""}</div>`).join("")}</div>`;
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

  function renderAdminProviderDetail(item, active) {
    const stores = getProviderStores(item);
    return `<section class="admin-detail-card"><div class="eyebrow">${active === "audit" ? "Provider Audit" : "Provider Detail"}</div><h3>${safe(item.name, "服务商详情")}</h3><div class="admin-kv-list"><div><span>联系人</span><strong>${safe(item.contact, "-")}</strong></div><div><span>所在区域</span><strong>${formatProviderRegion(item)}</strong></div><div><span>门店数量</span><strong>${stores.length} 家</strong></div><div><span>主营能力</span><strong>${safe(item.specialties, "-")}</strong></div><div><span>营业执照</span><strong>${safe(item.license, "-")}</strong></div></div><div class="admin-doc-list"><div class="admin-doc-item">营业执照副本</div><div class="admin-doc-item">门头照片</div><div class="admin-doc-item">施工环境照</div><div class="admin-doc-item">案例图片包</div></div><div class="admin-action-row">${active === "audit" ? `<button class="btn btn-primary" type="button" data-admin-action="provider-detail" data-admin-id="${item.id}">按门店审核</button>` : `<button class="btn btn-primary" type="button" data-admin-action="provider-toggle" data-admin-id="${item.id}">${nProvider(item.status) === "暂停接单" ? "恢复营业" : "暂停接单"}</button><button class="btn btn-secondary" type="button" data-admin-action="provider-detail" data-admin-id="${item.id}">查看详情</button>`}</div><div class="admin-timeline">${(item.timeline || []).slice(0, 4).map((l) => `<div>${l}</div>`).join("")}</div></section>`;
  }

  function getAdminProviderRelatedOrders(item) {
    return [...orders, ...providerOrderMocks].filter((order) => order.provider === item.name || order.intention === item.name);
  }

  function getAdminProviderBusinessStats(item) {
    const currentOrderCount = getAdminProviderRelatedOrders(item).filter((order) => !["已完成"].includes(nOrder(order.status))).length;
    return {
      totalOrders: item.totalOrders || item.monthOrders || 0,
      monthOrders: item.monthOrders || 0,
      currentOrderCount,
      currentRevenue: safe(item.currentRevenue, formatCurrency((item.monthOrders || 0) * 3600)),
      unsettledAmount: safe(item.unsettledAmount, formatCurrency((item.monthOrders || 0) * 1400)),
      settledAmount: safe(item.settledAmount, formatCurrency((item.monthOrders || 0) * 7200)),
    };
  }

  function getAdminProviderQualificationRows(item) {
    const passed = nAudit(item.auditStatus) === "已通过";
    return [
      { title: "营业执照", status: "已上传", note: safe(item.license, "待补充营业执照信息") },
      { title: "门店照片", status: passed ? "已上传" : "待补充", note: passed ? "已上传门头照、接待区与施工环境照" : "需补充门头照片、施工区域照片和接待区照片" },
      { title: "品牌授权/合作证明", status: passed ? "已上传" : "待补充", note: passed ? `已上传 ${safe(item.specialties, "主营项目")} 相关品牌授权或合作证明` : "待补充品牌授权函、合作证明或安装授权资料" },
      { title: "其他资质证明", status: passed ? "已上传" : "待补充", note: passed ? "已上传技师资质、施工规范承诺书及其他辅助证明" : "可补充技师证书、保险证明与环保施工说明" },
    ];
  }

  function renderAdminProviderStoreList(item) {
    const stores = getProviderStores(item);
    return `<section class="admin-detail-card"><div class="eyebrow">Store List</div><h3>门店列表 <span class="pill">${stores.length} 家</span></h3><div class="mobile-list">${stores
      .map(
        (store, index) => `
      <article class="mobile-item">
        <div style="display:flex; justify-content:space-between; gap:12px; align-items:flex-start;">
          <strong>${index + 1}. ${safe(store.name, item.name)}${store.isPrimary ? ' <span class="pill">主门店</span>' : ""}</strong>
          <div style="display:flex; gap:6px; flex-wrap:wrap;">${store.auditStatus ? tag(nAudit(store.auditStatus)) : ""}${store.status && store.status !== item.status ? tag(nProvider(store.status)) : ""}</div>
        </div>
        <div class="muted" style="margin-top:8px;">${formatStoreAddress(store)}</div>
        ${store.auditStatus === "已通过" ? "" : `<div style="display:flex; gap:8px; flex-wrap:wrap; margin-top:12px;"><button class="btn btn-primary btn-sm" type="button" data-admin-action="provider-store-approve" data-admin-id="${item.id}" data-store-id="${store.id}">通过</button><button class="btn btn-secondary btn-sm" type="button" data-admin-action="provider-store-supplement" data-admin-id="${item.id}" data-store-id="${store.id}">补充</button><button class="btn btn-danger btn-sm" type="button" data-admin-action="provider-store-reject" data-admin-id="${item.id}" data-store-id="${store.id}">驳回</button></div>`}
      </article>
    `
      )
      .join("")}</div></section>`;
  }

  function renderAdminProviderDetailPage(item) {
    const active = state.adminProviderDetail.tab || "basic";
    const stats = getAdminProviderBusinessStats(item);
    const qualificationRows = getAdminProviderQualificationRows(item);
    const stores = getProviderStores(item);
    return `<div class="stack"><section class="admin-detail-card"><div class="admin-action-row"><button class="btn btn-secondary" type="button" data-admin-action="provider-detail-back" data-admin-id="${item.id}">返回服务商列表</button><div style="display:flex; gap:10px; flex-wrap:wrap;">${tag(nProvider(item.status))}${tag(nAudit(item.auditStatus))}</div></div><div class="eyebrow">Provider Detail</div><h3>${safe(item.name, "服务商详情")}</h3><div class="muted">${formatProviderRegion(item)} / 评分 ${item.score || "-"}</div></section><div class="sub-tabs">${[{ id: "basic", label: "基础信息页" }, { id: "qualification", label: "资质信息页" }, { id: "business", label: "经营状态页" }].map((tab) => `<button class="sub-tab ${active === tab.id ? "active" : ""}" type="button" data-admin-provider-detail-tab="${tab.id}">${tab.label}</button>`).join("")}</div>${active === "basic" ? `<section class="admin-detail-card"><div class="eyebrow">Basic Information</div><h3>服务商基础信息</h3><div class="admin-kv-list"><div><span>服务商名称</span><strong>${safe(item.name, "-")}</strong></div><div><span>联系人</span><strong>${safe(item.contact, "-")}</strong></div><div><span>所在区域</span><strong>${formatProviderRegion(item)}</strong></div><div><span>门店数量</span><strong>${stores.length} 家</strong></div><div><span>主营能力</span><strong>${safe(item.specialties, "-")}</strong></div><div><span>营业执照</span><strong>${safe(item.license, "-")}</strong></div><div><span>入驻状态</span><strong>${nAudit(item.auditStatus)}</strong></div><div><span>接单状态</span><strong>${nProvider(item.status)}</strong></div></div></section>${renderAdminProviderStoreList(item)}` : active === "qualification" ? `<section class="admin-detail-card"><div class="eyebrow">Qualifications</div><h3>资质信息</h3><div class="mobile-list">${qualificationRows.map((row) => `<article class="mobile-item"><div style="display:flex; justify-content:space-between; gap:12px; align-items:flex-start;"><strong>${row.title}</strong><span class="pill">${row.status}</span></div><div class="muted" style="margin-top:8px;">${row.note}</div></article>`).join("")}</div></section>` : `<section class="admin-detail-card"><div class="eyebrow">Business Status</div><h3>经营状态</h3><div class="admin-kv-list"><div><span>总接单量</span><strong>${stats.totalOrders}</strong></div><div><span>本月接单量</span><strong>${stats.monthOrders}</strong></div><div><span>当前订单数</span><strong>${stats.currentOrderCount}</strong></div><div><span>当前营业额</span><strong>${stats.currentRevenue}</strong></div><div><span>未结算金额</span><strong>${stats.unsettledAmount}</strong></div><div><span>已结算金额</span><strong>${stats.settledAmount}</strong></div></div></section>`}</div>`;
  }
  function isAdminGoodsOrder(item) {
    return safe(item.type, "").includes("商品");
  }

  function getAdminCurrentOrderStatus() {
    const category = state.adminOrders.category === "goods" ? "goods" : state.adminOrders.category === "after-sale" ? "after-sale" : "service";
    const statusMap = { goods: "goodsStatus", "after-sale": "afterSaleStatus", service: "serviceStatus" };
    return state.adminOrders[statusMap[category]] || "all";
  }

  function getAdminOrderStatusTabs(category) {
    if (category === "goods") {
      return [{ id: "all", label: "全部" }, { id: "unpaid", label: "待付款" }, { id: "pending-delivery", label: "待发货" }, { id: "receiving", label: "待收货" }, { id: "completed", label: "已完成" }];
    }
    if (category === "after-sale") {
      return [{ id: "all", label: "全部" }, { id: "pending", label: "待审核" }, { id: "approved", label: "已通过" }, { id: "rejected", label: "已驳回" }];
    }
    return [{ id: "all", label: "全部" }, { id: "pending", label: "待分配" }, { id: "processing", label: "施工中" }, { id: "acceptance", label: "待验收" }, { id: "completed", label: "已完成" }];
  }

  function matchAdminOrderStatus(item, category, status) {
    const currentStatus = nOrder(item.status);
    if (status === "all") return true;
    if (category === "after-sale") {
      if (status === "pending") return item.afterSaleStatus === "待平台审核";
      if (status === "approved") return item.afterSaleStatus === "已通过";
      if (status === "rejected") return item.afterSaleStatus === "已驳回";
      return false;
    }
    if (category === "goods") {
      if (status === "unpaid") return currentStatus === "待支付";
      if (status === "pending-delivery") return currentStatus === "待发货";
      if (status === "receiving") return ["待收货", "已发货", "运输中", "已签收"].includes(currentStatus);
      if (status === "completed") return currentStatus === "已完成";
      return false;
    }
    if (status === "pending") return ["待分配", "待接单", "待报价", "待确认", "待预约"].includes(currentStatus);
    if (status === "processing") return currentStatus === "施工中";
    if (status === "acceptance") return currentStatus === "待验收";
    if (status === "completed") return currentStatus === "已完成";
    return false;
  }

  function getAdminFilteredOrders() {
    const category = state.adminOrders.category || "service";
    const status = getAdminCurrentOrderStatus();
    if (category === "after-sale") {
      return orders.filter((item) => item.afterSaleType && matchAdminOrderStatus(item, category, status));
    }
    return orders.filter((item) => (category === "goods" ? isAdminGoodsOrder(item) : !isAdminGoodsOrder(item)) && matchAdminOrderStatus(item, category, status));
  }

  function renderAdminOrderDetail(item, active) {
    const isGoods = active === "goods";
    const isAfterSale = active === "after-sale";
    if (isAfterSale) {
      return `<section class="admin-detail-card"><div class="eyebrow">After Sale</div><h3>${item.id}</h3><div class="admin-kv-list"><div><span>订单类型</span><strong>商品订单</strong></div><div><span>用户</span><strong>${safe(item.user, "-")}</strong></div><div><span>商品</span><strong>${safe(item.service, "-")}</strong></div><div><span>订单金额</span><strong>${safe(item.quote, "-")}</strong></div><div><span>售后类型</span><strong>${safe(item.afterSaleType, "-")}</strong></div><div><span>售后原因</span><strong>${safe(item.afterSaleReason, "-")}</strong></div><div><span>售后状态</span><strong>${safe(item.afterSaleStatus, "处理中")}</strong></div><div><span>申请时间</span><strong>${safe(item.afterSaleTime, "-")}</strong></div></div><div class="admin-timeline">${getOrderTimeline(item).map((line) => `<div>${line}</div>`).join("")}</div><div class="admin-action-row">${item.afterSaleStatus === "待平台审核" ? `<button class="btn btn-primary" type="button" data-admin-action="after-sale-approve" data-admin-id="${item.id}">通过申请</button><button class="btn btn-danger" type="button" data-admin-action="after-sale-reject" data-admin-id="${item.id}">驳回申请</button>` : `<button class="btn btn-secondary" type="button" disabled>已处理</button>`}</div></section>`;
    }
    if (isGoods) {
      const canShip = nOrder(item.status) === "待发货";
      const shippingOpen = state.adminShipment.orderId === item.id;
      const canAfterSale = item.afterSaleStatus === "待平台审核";
      return `<section class="admin-detail-card"><div class="eyebrow">Goods Order</div><h3>${item.id}</h3><div class="admin-kv-list"><div><span>订单类型</span><strong>商品订单</strong></div><div><span>用户</span><strong>${safe(item.user, "-")}</strong></div><div><span>收货城市</span><strong>${safe(item.city, "-")}</strong></div><div><span>商品</span><strong>${safe(item.service, "-")}</strong></div><div><span>订单金额</span><strong>${safe(item.quote, "-")}</strong></div><div><span>支付状态</span><strong>${safe(item.payment, "-")}</strong></div><div><span>订单状态</span><strong>${nOrder(item.status)}</strong></div><div><span>履约进度</span><strong>${safe(item.progress, "-")}</strong></div><div><span>物流公司</span><strong>${safe(item.shippingCompany, canShip ? "待录入" : "-")}</strong></div><div><span>物流单号</span><strong>${safe(item.shippingNo, canShip ? "待录入" : "-")}</strong></div><div><span>发货备注</span><strong>${safe(item.shippingRemark, canShip ? "待录入" : "-")}</strong></div>${item.afterSaleType ? `<div><span>售后类型</span><strong>${safe(item.afterSaleType, "-")}</strong></div><div><span>售后状态</span><strong>${safe(item.afterSaleStatus, "处理中")}</strong></div>` : ""}</div>${shippingOpen ? renderAdminShippingForm(item) : ""}<div class="admin-timeline">${getOrderTimeline(item).map((line) => `<div>${line}</div>`).join("")}</div><div class="admin-action-row">${canShip ? `<button class="btn btn-primary" type="button" data-admin-action="${shippingOpen ? "order-ship-cancel" : "order-ship"}" data-admin-id="${item.id}">${shippingOpen ? "收起发货表单" : "发货"}</button>` : canAfterSale ? `<button class="btn btn-primary" type="button" data-admin-action="after-sale-approve" data-admin-id="${item.id}">通过售后</button><button class="btn btn-danger" type="button" data-admin-action="after-sale-reject" data-admin-id="${item.id}">驳回售后</button>` : `<button class="btn btn-secondary" type="button" disabled>${nOrder(item.status) === "已完成" ? "已完成履约" : "平台履约跟进中"}</button>`}</div></section>`;
    }
    const opts = providers.filter((p) => nProvider(p.status) !== "暂停接单" && nAudit(p.auditStatus) === "已通过");
    const canAssign = nOrder(item.status) === "待分配";
    return `<section class="admin-detail-card"><div class="eyebrow">${canAssign ? "Order Dispatch" : "Service Order"}</div><h3>${item.id}</h3><div class="admin-kv-list"><div><span>订单类型</span><strong>服务订单</strong></div><div><span>用户</span><strong>${safe(item.user, "-")}</strong></div><div><span>车辆</span><strong>${safe(item.vehicle, "-")}</strong></div><div><span>改装项目</span><strong>${safe(item.service, "-")}</strong></div><div><span>报价金额</span><strong>${safe(item.quote, "-")}</strong></div><div><span>预约安装时间</span><strong>${safe(item.appointment, "-")}</strong></div><div><span>服务商</span><strong>${safe(item.provider, "待分配")}</strong></div><div><span>当前进度</span><strong>${safe(item.progress, "-")}</strong></div></div>${canAssign ? `<div class="admin-suggest-list">${opts.slice(0, 3).map((p) => `<button class="admin-suggest-item" type="button" data-admin-action="order-assign" data-admin-id="${item.id}" data-provider-id="${p.id}"><strong>${safe(p.name, "服务商")}</strong><span>${p.name === item.intention ? "客户意向门店" : safe(p.city, "城市门店")}</span></button>`).join("")}</div>` : ""}<div class="admin-timeline">${getOrderTimeline(item).map((line) => `<div>${line}</div>`).join("")}</div><div class="admin-action-row"><button class="btn btn-secondary" type="button" data-admin-action="order-detail" data-admin-id="${item.id}">查看详情</button>${canAssign ? `<button class="btn btn-primary" type="button" data-admin-action="order-assign-intention" data-admin-id="${item.id}">一键派给意向门店</button>` : ""}</div></section>`;
  }
  function renderAdminCaseDetail(item) { return `<section class="admin-detail-card"><div class="eyebrow">Case Review</div><h3>${safe(item.title, "案例详情")}</h3><div class="admin-kv-list"><div><span>服务商</span><strong>${safe(item.provider, "-")}</strong></div><div><span>车型</span><strong>${safe(item.model, "-")}</strong></div><div><span>风格</span><strong>${safe(item.style, "-")}</strong></div><div><span>改装类型</span><strong>${safe(item.modType, "-")}</strong></div><div><span>花费区间</span><strong>${safe(item.cost, "-")}</strong></div><div><span>审核状态</span><strong>${nCaseAudit(item.audit)}</strong></div><div><span>展示状态</span><strong>${nCaseDisplay(item.display)}</strong></div></div><div class="admin-doc-list"><div class="admin-doc-item">案例主图</div><div class="admin-doc-item">施工过程图</div><div class="admin-doc-item">完工对比图</div></div><div class="admin-action-row"><button class="btn btn-primary" type="button" data-admin-action="case-approve" data-admin-id="${item.id}">审核通过</button><button class="btn btn-secondary" type="button" data-admin-action="case-display" data-admin-id="${item.id}">设为正常展示</button><button class="btn btn-danger" type="button" data-admin-action="case-reject" data-admin-id="${item.id}">审核驳回</button></div></section>`; }
  function renderAdminForumDetail(post) { const related = comments.filter((i) => i.post === post.id); return `<section class="admin-detail-card"><div class="eyebrow">Forum Moderation</div><h3>${safe(post.title, "帖子详情")}</h3><div class="admin-kv-list"><div><span>作者</span><strong>${safe(post.author, "-")}</strong></div><div><span>发布时间</span><strong>${safe(post.time, "-")}</strong></div><div><span>当前状态</span><strong>${nForum(post.status)}</strong></div><div><span>互动数据</span><strong>回复 ${post.replies || 0} / 点赞 ${post.likes || 0} / 浏览 ${(post.views || 0).toLocaleString("zh-CN")}</strong></div></div><div class="admin-action-row"><button class="btn btn-primary" type="button" data-admin-action="forum-post-toggle" data-admin-id="${post.id}">${nForum(post.status) === "已删除" ? "恢复帖子" : "删除帖子"}</button></div><div class="admin-comment-block"><strong>评论区</strong><div class="admin-comment-list">${related.length ? related.map((i) => `<div class="admin-comment-item"><div class="admin-comment-head"><strong>${safe(i.author, "评论用户")}</strong>${tag(nForum(i.status))}</div><p>${safe(i.content, "评论内容")}</p><button class="btn btn-secondary" type="button" data-admin-action="forum-comment-toggle" data-admin-id="${i.id}">${nForum(i.status) === "已删除" ? "恢复评论" : "删除评论"}</button></div>`).join("") : `<div class="muted">当前帖子暂无评论</div>`}</div></div></section>`; }
  function renderAdminShippingForm(item) {
    return `<form class="provider-complete-form" data-admin-shipping-form data-admin-id="${item.id}"><div class="form-grid"><div class="field-group"><label class="field-label" for="admin-shipping-company-${item.id}">物流公司</label><input class="input" id="admin-shipping-company-${item.id}" name="shippingCompany" type="text" value="${safe(item.shippingCompany, "顺丰速运")}" required></div><div class="field-group"><label class="field-label" for="admin-shipping-no-${item.id}">物流单号</label><input class="input" id="admin-shipping-no-${item.id}" name="shippingNo" type="text" value="${safe(item.shippingNo, "")}" placeholder="请输入物流单号" required></div></div><div class="field-group"><label class="field-label" for="admin-shipping-remark-${item.id}">备注</label><textarea class="textarea" id="admin-shipping-remark-${item.id}" name="shippingRemark" placeholder="请填写包装说明、拆分发货或签收提醒" required>${safe(item.shippingRemark, "木箱加固包装，签收前请先检查外箱。")}</textarea></div><div class="admin-action-row"><button class="btn btn-primary" type="submit">确认发货</button><button class="btn btn-secondary" type="button" data-admin-action="order-ship-cancel" data-admin-id="${item.id}">取消</button></div></form>`;
  }
  function handleAdminAction(button) {
    const action = button.dataset.adminAction;
    const id = button.dataset.adminId || "";
    if (action.startsWith("provider-")) {
      if (action === "provider-detail-back") {
        state.adminProviderDetail.open = false;
        state.adminProviderDetail.tab = "basic";
        render();
        return;
      }
      const target = providers.find((item) => item.id === id);
      if (!target) return;
      state.adminSelected.providers = id;
      if (action === "provider-detail") {
        state.subTab.providers = "list";
        state.adminProviderDetail.open = true;
        state.adminProviderDetail.tab = "basic";
      } else if (action === "provider-approve") {
        target.auditStatus = "已通过";
        target.status = "正常营业";
        getProviderStores(target).forEach((store) => {
          store.auditStatus = "已通过";
          store.status = "正常营业";
        });
      } else if (action === "provider-supplement") {
        target.auditStatus = "待补充";
      } else if (action === "provider-reject") {
        target.auditStatus = "已驳回";
        target.status = "已驳回";
        getProviderStores(target).forEach((store) => {
          store.auditStatus = "已驳回";
          store.status = "已驳回";
        });
      } else if (action === "provider-toggle") {
        target.status = nProvider(target.status) === "暂停接单" ? "正常营业" : "暂停接单";
      } else if (action === "provider-store-approve") {
        const storeId = button.dataset.storeId;
        setStoreAuditStatus(target, storeId, "已通过");
        state.providerFeedback = `${getProviderStores(target).find((s) => s.id === storeId)?.name || "门店"} 已通过审核`;
      } else if (action === "provider-store-supplement") {
        const storeId = button.dataset.storeId;
        setStoreAuditStatus(target, storeId, "待补充");
        state.providerFeedback = `${getProviderStores(target).find((s) => s.id === storeId)?.name || "门店"} 被要求补充资料`;
      } else if (action === "provider-store-reject") {
        const storeId = button.dataset.storeId;
        setStoreAuditStatus(target, storeId, "已驳回");
        state.providerFeedback = `${getProviderStores(target).find((s) => s.id === storeId)?.name || "门店"} 已被驳回`;
      }
      render();
      return;
    }
    if (action.startsWith("order-")) {
      const target = orders.find((item) => item.id === id);
      if (!target) return;
      if (action === "order-ship") {
        state.adminShipment.orderId = id;
      } else if (action === "order-ship-cancel") {
        state.adminShipment.orderId = "";
      } else if (action === "order-assign-intention") {
        target.provider = target.intention || "推荐门店";
        target.status = "施工中";
        target.progress = `已派单至 ${target.provider}`;
        appendOrderTimeline(target, `平台派单给 ${target.provider}`);
      } else if (action === "order-assign") {
        const provider = providers.find((item) => item.id === button.dataset.providerId);
        if (provider) {
          target.provider = provider.name;
          target.status = "施工中";
          target.progress = `已派单至 ${provider.name}`;
          appendOrderTimeline(target, `平台派单给 ${provider.name}`);
        }
      }
      render();
      return;
    }
    if (action.startsWith("case-")) {
      const target = cases.find((item) => item.id === id);
      if (!target) return;
      if (action === "case-approve") target.audit = "已通过";
      if (action === "case-display") {
        target.audit = "已通过";
        target.display = "正常展示";
      }
      if (action === "case-reject") {
        target.audit = "已驳回";
        target.display = "未展示";
      }
      render();
      return;
    }
    if (action === "forum-post-toggle") {
      const target = posts.find((item) => item.id === id);
      if (target) target.status = nForum(target.status) === "已删除" ? "正常" : "已删除";
      render();
      return;
    }
    if (action === "forum-comment-toggle") {
      const target = comments.find((item) => item.id === id);
      if (target) target.status = nForum(target.status) === "已删除" ? "正常" : "已删除";
      render();
      return;
    }
    if (action.startsWith("after-sale-")) {
      const target = orders.find((item) => item.id === id);
      if (!target) return;
      if (action === "after-sale-approve") {
        target.afterSaleStatus = "已通过";
        target.status = "已完成";
        target.progress = `售后申请已通过：${target.afterSaleType}，平台已安排处理。`;
        appendOrderTimeline(target, `平台通过售后申请：${target.afterSaleType}`);
        state.userFeedback = `${id} 售后申请已通过。`;
      } else if (action === "after-sale-reject") {
        target.afterSaleStatus = "已驳回";
        target.status = "已完成";
        target.progress = `售后申请已驳回：${target.afterSaleType}，如有疑问请联系平台客服。`;
        appendOrderTimeline(target, `平台驳回售后申请：${target.afterSaleType}`);
        state.userFeedback = `${id} 售后申请已驳回。`;
      }
      render();
      return;
    }
  }

  function handleAdminShippingSubmit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const orderId = form.dataset.adminId || "";
    const target = orders.find((item) => item.id === orderId);
    if (!target) return;
    const formData = new FormData(form);
    const shippingCompany = String(formData.get("shippingCompany") || "").trim();
    const shippingNo = String(formData.get("shippingNo") || "").trim();
    const shippingRemark = String(formData.get("shippingRemark") || "").trim();
    target.shippingCompany = shippingCompany;
    target.shippingNo = shippingNo;
    target.shippingRemark = shippingRemark;
    target.status = "待收货";
    target.progress = `${shippingCompany} 已发货，运单号 ${shippingNo}。`;
    appendOrderTimeline(target, `${shippingCompany} 已发货，运单号 ${shippingNo}`);
    state.adminShipment.orderId = "";
    state.adminSelected.orders = orderId;
    render();
  }

  function renderProvider() {
    if (state.tab === "home") return renderProviderHome();
    if (state.tab === "orders") return renderProviderOrders();
    if (state.tab === "operations") return renderProviderOperations();
    if (state.tab === "messages") return renderProviderMessages();
    return renderProviderMe();
  }

  function renderProviderHome() {
    const cards = [
      { title: "待接单", value: getProviderPendingOrders().length, note: "", tab: "orders", ordersTarget: "pending" },
      { title: "施工中", value: getProviderProcessingOrders().length, note: "", tab: "orders", ordersTarget: "all" },
      { title: "采购与运营", value: getProviderPurchasableProducts().length + getProviderCaseRows().filter((item) => nCaseAudit(item.audit) !== "已通过").length, note: "", tab: "operations", operationsTarget: "purchase" },
      { title: "待处理消息", value: fallback.providerMessages.filter((item) => item.status !== "已处理").length, note: "", tab: "messages", messagesTarget: "all" },
    ];
    return `<div class="stack"><section class="hero-banner" style="min-height:auto; padding-bottom:16px;"><div class="eyebrow">Store Dashboard</div><h3 style="margin:10px 0 0; font-size:28px; font-family:var(--font-display);">门店工作台</h3></section><section class="mobile-grid-2">${cards.map((item) => `<button class="m3-card admin-shortcut-card" type="button" data-provider-shortcut="${item.tab}" ${item.ordersTarget ? `data-orders-target="${item.ordersTarget}"` : ""} ${item.operationsTarget ? `data-operations-target="${item.operationsTarget}"` : ""} ${item.messagesTarget ? `data-messages-target="${item.messagesTarget}"` : ""} ${item.meTarget ? `data-me-target="${item.meTarget}"` : ""}><div class="muted">${item.title}</div><span class="mobile-stat">${item.value}</span>${item.note ? `<div class="muted">${item.note}</div>` : ""}</button>`).join("")}</section><section class="mobile-list"><article class="mobile-item"><strong>今日到店 6 台 / 完工 3 台</strong></article><article class="mobile-item"><strong>本周营收 ¥186,000</strong></article></section></div>`;
  }

  function renderProviderOrders() {
    const active = state.subTab.orders || "pending";
    const rows =
      active === "pending" ? getProviderPendingOrders() :
      active === "processing" ? getProviderProcessingOrders() :
      active === "acceptance" ? getProviderAcceptanceOrders() :
      active === "completed" ? getProviderCompletedOrders() :
      getProviderAllOrders();
    const selected = rows.find((item) => item.id === state.providerSelected.orders) || rows[0];
    return `${subTabs([{ id: "all", label: "全部订单" }, { id: "pending", label: "待接单" }, { id: "processing", label: "施工中" }, { id: "acceptance", label: "待验收" }, { id: "completed", label: "已完成" }])}${state.providerFeedback ? `<div class="provider-feedback">${state.providerFeedback}</div>` : ""}<div class="mobile-list">${rows.map((item) => `<div class="admin-inline-block"><button class="mobile-item admin-pick-card ${selected?.id === item.id ? "active" : ""}" type="button" data-provider-pick data-provider-type="orders" data-provider-id="${item.id}"><div style="display:flex; justify-content:space-between; gap:12px;"><strong>${safe(item.vehicle, "车辆")}</strong>${tag(providerOrderViewStatus(item, active))}</div><div class="muted" style="margin-top:8px;">${safe(item.user, "用户")} / ${active === "pending" ? String(getProviderOrderMeta(item).phone).replace(/(\d{3})\d{4}(\d{4})/, "$1****$2") : getProviderOrderMeta(item).phone}</div><div style="margin-top:8px;">${safe(item.service, "服务")}</div></button>${selected?.id === item.id ? renderProviderOrderDetail(item) : ""}</div>`).join("") || `<article class="mobile-item"><strong>当前暂无订单</strong><div class="muted" style="margin-top:8px;">新的派单或施工单会出现在这里。</div></article>`}</div>`;
  }

  function renderProviderOperations() {
    const active = state.subTab.operations || "purchase";
    const tabs = [
      { id: "purchase", label: "配件采购" },
      { id: "record", label: "采购记录" },
      { id: "pricing", label: "服务定价" },
      { id: "cases", label: "案例管理" },
      { id: "forum", label: "论坛管理" },
    ];
    if (active === "pricing") {
      return `${subTabs(tabs)}${state.providerFeedback ? `<div class="provider-feedback">${state.providerFeedback}</div>` : ""}${renderProviderServicePricing()}`;
    }
    if (active === "purchase" && state.providerPurchase.sku) {
      const product = getProviderPurchasableProducts().find((item) => item.sku === state.providerPurchase.sku);
      if (product) {
        return `${subTabs(tabs)}${state.providerFeedback ? `<div class="provider-feedback">${state.providerFeedback}</div>` : ""}${renderProviderPurchaseDetail(product)}`;
      }
    }
    const rows =
      active === "purchase" ? getProviderPurchasableProducts() :
      active === "record" ? getProviderPurchaseRecords() :
      active === "cases" ? getProviderCaseRows() :
      getProviderForumRows();
    const selected =
      active === "purchase" || active === "record"
        ? rows.find((item) => (item.sku || item.id) === state.providerSelected.products) || rows[0]
        : rows.find((item) => item.id === state.providerSelected[active]) || rows[0];
    if (active === "purchase") {
      return `${subTabs(tabs)}${state.providerFeedback ? `<div class="provider-feedback">${state.providerFeedback}</div>` : ""}<div class="user-mall-v3-grid" style="margin-top:12px;">${rows.map((item, index) => `<article class="user-mall-v3-card"><button class="user-mall-v3-card-art" type="button" data-provider-action="provider-product-pick" data-provider-id="${item.sku}" data-tone="${(index % 4) + 1}"></button><div class="user-mall-v3-card-body"><strong>${safe(item.name, "商品")}</strong><span>${safe(item.brand, "-")} / ${safe(item.category, "-")}</span><p>${safe(item.fitment, "适配当前车型")}</p><div><b>${safe(item.price, "-")}</b></div></div></article>`).join("")}</div>`;
    }
    return `${subTabs(tabs)}${state.providerFeedback ? `<div class="provider-feedback">${state.providerFeedback}</div>` : ""}${active === "cases" ? `<div class="admin-action-row" style="margin-bottom:12px;"><button class="btn btn-primary" type="button" data-provider-action="case-add">新增案例</button></div>${state.providerCaseForm.mode === "create" ? renderProviderCaseForm() : ""}` : active === "forum" ? `<div class="admin-action-row" style="margin-bottom:12px;"><button class="btn btn-primary" type="button" data-provider-action="moderator-apply">${state.providerMe.moderatorStatus === "已通过" ? "版主权限管理" : state.providerMe.moderatorStatus === "待审核" ? "审核中" : "申请版主"}</button>${state.providerMe.moderatorStatus === "已通过" ? `<button class="btn btn-secondary" type="button" data-provider-action="moderator-manage">管理板块</button>` : ""}</div>${state.providerMe.moderatorApplyOpen ? renderProviderModeratorForm() : ""}` : ""}<div class="mobile-list">${rows.map((item) => `<div class="admin-inline-block"><button class="mobile-item admin-pick-card ${selected && (selected.sku || selected.id) === (item.sku || item.id) ? "active" : ""}" type="button" data-provider-pick data-provider-type="products" data-provider-id="${item.sku || item.id}">${active === "record" ? `<strong>${safe(item.id, "采购记录")}</strong><div class="muted" style="margin-top:8px;">${safe(item.name, "商品")} / 型号 ${providerProductModel(item)}</div><div class="muted" style="margin-top:6px;">数量 ${item.quantity || 1} / ${safe(item.amount, "-")}</div><div style="margin-top:10px; display:flex; gap:10px; flex-wrap:wrap;">${tag(nPurchaseStatus(item.status))}</div>` : active === "cases" ? `<strong>${safe(item.title, "案例")}</strong><div class="muted" style="margin-top:8px;">${safe(item.model, "车型")} / ${safe(item.modType, "改装类型")} / ${safe(item.cost, "-")}</div><div style="margin-top:10px; display:flex; gap:10px; flex-wrap:wrap;">${tag(nCaseAudit(item.audit))}<span class="pill">${nCaseDisplay(item.display)}</span></div>` : `<strong>${safe(item.title, "帖子")}</strong><div class="muted" style="margin-top:8px;">回复 ${item.replies || 0} / 点赞 ${item.likes || 0}</div><div style="margin-top:10px;">${tag(nForum(item.status))}</div>`}</button>${selected?.id === item.id ? (active === "purchase" || active === "record" ? renderProviderProductDetail(item) : active === "cases" ? renderProviderCaseDetail(item) : "") : ""}</div>`).join("")}</div>`;
  }

  function renderProviderMessages() {
    const rows = fallback.providerMessages;
    const notifications = getNotificationsForRole("provider");
    const selected = rows.find((item) => item.id === state.providerSelected.messages);
    markNotificationsRead("provider");
    if (!selected) {
      return `<div class="stack user-message-page">${state.providerFeedback ? `<div class="provider-feedback">${state.providerFeedback}</div>` : ""}${notifications.length ? `<section class="mobile-list" style="margin-bottom:12px;">${notifications.map((n) => `<article class="mobile-item" style="background:rgba(255,106,0,0.06); border-left:3px solid #ff6a00;"><div style="display:flex; justify-content:space-between; gap:12px; align-items:flex-start;"><strong>${safe(n.title, "系统通知")}</strong><span style="font-size:11px; color:var(--text-muted);">${safe(n.time, "刚刚")}</span></div><div class="muted" style="margin-top:6px;">${safe(n.content, "")}</div></article>`).join("")}</section>` : ""}<section class="provider-chat-shell user-message-list-shell"><div class="provider-chat-list user-message-list">${rows.map((item) => `<button class="provider-chat-thread user-message-thread" type="button" data-provider-action="provider-message-pick" data-provider-id="${item.id}"><div class="provider-chat-thread-head"><strong>${safe(item.title, "消息")}</strong><span>${safe(item.time, "刚刚")}</span></div><div class="provider-chat-thread-preview">${safe(item.preview, "暂无消息内容")}</div><div class="provider-chat-thread-meta">${tag(safe(item.status, "正常"))}</div></button>`).join("")}</div></section></div>`;
    }
    return `<div class="stack user-message-page">${state.providerFeedback ? `<div class="provider-feedback">${state.providerFeedback}</div>` : ""}<section class="provider-chat-panel user-message-detail"><header class="provider-chat-header"><button class="user-message-back" type="button" data-provider-action="provider-message-back">返回</button><div><div class="eyebrow">Realtime Chat</div><h3>${safe(selected.title, "即时对话")}</h3></div>${tag(safe(selected.status, "正常"))}</header><div class="provider-chat-body">${selected.messages.map((message) => `<article class="provider-chat-bubble ${message.from === "provider" ? "is-self" : ""}"><div class="provider-chat-bubble-role">${message.from === "provider" ? "门店" : "客户"}</div><p>${message.text}</p><time>${message.time}</time></article>`).join("")}</div><form class="provider-chat-composer user-message-composer" data-provider-chat-form data-provider-id="${selected.id}"><label class="user-message-attach" title="添加附件"><input name="providerChatAttachment" type="file" accept="image/*,video/*,.pdf,.doc,.docx" multiple><span>＋</span></label><input class="input" name="chatMessage" type="text" placeholder="输入消息并实时发送" autocomplete="off"><button class="btn btn-primary" type="submit">发送</button></form></section></div>`;
  }

  function renderProviderMe() {
    const active = state.subTab.me || "profile";
    const store = getProviderStore();
    const stores = getProviderStores(store);
    return `${subTabs([{ id: "business", label: "营业情况" }, { id: "profile", label: "门店资料" }])}${state.providerFeedback ? `<div class="provider-feedback">${state.providerFeedback}</div>` : ""}${active === "profile" ? `<div class="stack"><section class="admin-detail-card"><div class="eyebrow">Store Profile</div><h3>门店与账号信息</h3><div class="admin-kv-list"><div><span>门店名称</span><strong>${safe(store.name, "高端改装门店")}</strong></div><div><span>联系人</span><strong>${safe(store.contact, "-")}</strong></div><div><span>门店数量</span><strong>${stores.length} 家</strong></div><div><span>主营能力</span><strong>${safe(store.specialties, "-")}</strong></div><div><span>审核状态</span><strong>${nAudit(store.auditStatus)}</strong></div><div><span>门店状态</span><strong>${nProvider(store.status)}</strong></div></div><div class="admin-action-row"><button class="btn btn-secondary" type="button" data-provider-action="provider-profile-edit">${state.providerMe.profileEditOpen ? "收起资料表单" : "更新门店资料"}</button><button class="btn btn-primary" type="button" data-provider-action="provider-profile-contact">联系平台客服</button></div></section>${state.providerMe.profileEditOpen ? renderProviderProfileForm() : ""}</div>` : renderProviderBusiness()}`;
  }

  function renderProviderDialog() {
    const { type, orderId } = state.providerDialog;
    if (!type || !orderId) return "";
    const order = getProviderOrderById(orderId);
    if (!order) return "";
    if (type === "accept") {
      return `<div class="modal visible"><div class="panel modal-card provider-dialog-card"><div class="eyebrow">Order Confirm</div><h3>确认接单并填写排期</h3><p class="muted">确认后，该订单会进入施工中，并按门店填写的排期时间进入施工安排。</p><form class="form-grid" data-provider-accept-form data-provider-id="${orderId}"><div class="provider-dialog-summary"><strong>${orderId}</strong><span>${safe(order.vehicle, "车辆")} / ${safe(order.service, "服务")}</span></div><div class="field-group"><label class="field-label" for="accept-schedule-${orderId}">排期时间</label><input class="input" id="accept-schedule-${orderId}" name="scheduleTime" type="datetime-local" value="${toDateTimeLocalValue(order.appointment) || "2026-04-09T10:00"}" required></div><div class="field-group"><label class="field-label" for="accept-note-${orderId}">排期说明</label><input class="input" id="accept-note-${orderId}" name="scheduleNote" type="text" value="已完成排期安排，建议客户提前 30 分钟到店" required></div><div class="admin-action-row"><button class="btn btn-primary" type="submit">确认接单</button><button class="btn btn-secondary" type="button" data-provider-dialog-action="close">取消</button></div></form></div></div>`;
    }
    if (type === "reject") {
      return `<div class="modal visible"><div class="panel modal-card provider-dialog-card"><div class="eyebrow">Reject Order</div><h3>填写拒单原因</h3><p class="muted">拒单后，平台会依据原因重新分配订单。</p><form class="form-grid" data-provider-reject-form data-provider-id="${orderId}"><div class="provider-dialog-summary"><strong>${orderId}</strong><span>${safe(order.vehicle, "车辆")} / ${safe(order.service, "服务")}</span></div><div class="field-group"><label class="field-label" for="reject-reason-${orderId}">拒单原因</label><textarea class="textarea" id="reject-reason-${orderId}" name="rejectReason" placeholder="请填写无法接单的具体原因" required>当前排期已满，建议平台重新分配。</textarea></div><div class="admin-action-row"><button class="btn btn-danger" type="submit">提交拒单</button><button class="btn btn-secondary" type="button" data-provider-dialog-action="close">取消</button></div></form></div></div>`;
    }
    return "";
  }

  function renderUserDialog() {
    const { type, orderId, sourceName, rating } = state.userDialog;
    if (!type) return "";
    if (type === "order-acceptance") {
      const order = getUserOrderById(orderId);
      if (!order) return "";
      const providerMeta = providerOrderExtras[order.id] || {};
      const starButtons = [1, 2, 3, 4, 5].map((score) => `<button class="btn ${rating >= score ? "btn-primary" : "btn-secondary"}" type="button" data-user-dialog-rating="${score}" style="min-width:44px; padding:10px 12px;">${rating >= score ? "★" : "☆"}</button>`).join("");
      return `<div class="modal visible"><div class="panel modal-card provider-dialog-card"><div class="eyebrow">Order Acceptance</div><h3>确认验收</h3><p class="muted">请确认施工项目、完工图片和功能联调结果无误后，再完成本次验收。</p><div class="provider-dialog-summary"><strong>${order.id}</strong><span>${safe(order.vehicle, "车辆")} / ${safe(order.service, "服务")}</span></div><div class="admin-timeline"><div>完工情况：${safe(order.progress, "服务商已提交完工资料")}</div><div>图片与交付：${safe(providerMeta.arrival, "已上传完工图片，等待用户确认")}</div><div>验收提示：${safe(providerMeta.remark, "请重点核对施工效果、功能联调和随车物品")}</div></div><section class="provider-complete-form"><div class="field-group"><label class="field-label">本次服务评分</label><div style="display:flex; gap:8px; flex-wrap:wrap; margin-bottom:8px;">${starButtons}<button class="btn btn-secondary" type="button" data-user-dialog-rating="0">清空评分</button></div><div class="muted">当前评分：${rating} 分（0-5 分）</div></div></section><div class="admin-action-row"><button class="btn btn-secondary" type="button" data-user-dialog-action="acceptance-contact">联系服务商</button><button class="btn btn-primary" type="button" data-user-dialog-action="confirm-acceptance">确认验收</button><button class="btn btn-secondary" type="button" data-user-dialog-action="close">暂不验收</button></div></div></div>`;
    }
    if (type === "vehicle-create") {
      return `<div class="modal visible"><div class="panel modal-card provider-dialog-card"><div class="eyebrow">New Vehicle</div><h3>新增车辆</h3><p class="muted">选择车辆型号，填写车牌号，并上传一张车辆图片用于爱车档案展示。</p>${renderUserVehicleForm()}</div></div>`;
    }
    if (type === "service-upsell") {
      return `<div class="modal visible"><div class="panel modal-card provider-dialog-card"><div class="eyebrow">Payment Success</div><h3>是否需要改装服务？</h3><p class="muted">${safe(sourceName, "商品")} 已完成付款并进入自提流程，是否同步预约门店安装或改装服务？</p><div class="provider-dialog-summary"><strong>${orderId}</strong><span>可继续选择历史服务商或交由平台派单</span></div><div class="admin-action-row"><button class="btn btn-primary" type="button" data-user-dialog-action="need-service">需要改装服务</button><button class="btn btn-secondary" type="button" data-user-dialog-action="skip-service">暂不需要</button></div></div></div>`;
    }
    if (type === "provider-pick") {
      const options = getUserPreferredProviders();
      return `<div class="modal visible"><div class="panel modal-card provider-dialog-card"><div class="eyebrow">Provider Select</div><h3>选择意向服务商</h3><p class="muted">意向服务商按你的改装历史服务商优先展示，也可以交由平台统一派单。</p><div class="admin-suggest-list">${options.map((item, index) => `<button class="admin-suggest-item" type="button" data-user-dialog-action="pick-provider" data-provider-id="${item.id}"><strong>${safe(item.name, "服务商")}</strong><span>${formatProviderRegion(item)} / ${safe(item.specialties, "改装服务")} / ${index === 0 ? "历史服务商优先" : "候选服务商"}</span></button>`).join("")}</div><div class="admin-action-row"><button class="btn btn-primary" type="button" data-user-dialog-action="platform-assign">由平台派单</button><button class="btn btn-secondary" type="button" data-user-dialog-action="provider-back">返回</button></div></div></div>`;
    }
    if (type === "order-acceptance") {
      const order = getUserOrderById(orderId);
      if (!order) return "";
      const providerMeta = providerOrderExtras[order.id] || {};
      return `<div class="modal visible"><div class="panel modal-card provider-dialog-card"><div class="eyebrow">Order Acceptance</div><h3>确认验收</h3><p class="muted">请确认施工项目、完工图片和功能联调结果无误后，再完成本次验收。</p><div class="provider-dialog-summary"><strong>${order.id}</strong><span>${safe(order.vehicle, "车辆")} / ${safe(order.service, "服务")}</span></div><div class="admin-timeline"><div>完工情况：${safe(order.progress, "服务商已提交完工资料")}</div><div>图片与交付：${safe(providerMeta.arrival, "已上传完工图片，等待用户确认")}</div><div>验收提示：${safe(providerMeta.remark, "请重点核对施工效果、功能联调和随车物品")}</div></div><div class="admin-action-row"><button class="btn btn-secondary" type="button" data-user-dialog-action="acceptance-contact">联系服务商</button><button class="btn btn-primary" type="button" data-user-dialog-action="confirm-acceptance">确认验收</button><button class="btn btn-secondary" type="button" data-user-dialog-action="close">暂不验收</button></div></div></div>`;
    }
    if (type === "invoice-view") {
      const invoice = getUserInvoices().find((item) => safe(item.id, "") === state.userDialog.invoiceId);
      if (!invoice) return "";
      return `<div class="modal visible"><div class="panel modal-card provider-dialog-card"><div class="eyebrow">Invoice Detail</div><h3>发票详情</h3><div class="admin-kv-list" style="margin-top:14px;"><div><span>发票编号</span><strong>${safe(invoice.id, "-")}</strong></div><div><span>订单号</span><strong>${safe(invoice.orderId, "-")}</strong></div><div><span>发票类型</span><strong>${safe(invoice.type || invoice.invoiceType, "-")}</strong></div><div><span>金额</span><strong>${safe(invoice.amount, "-")}</strong></div><div><span>状态</span><strong>${safe(invoice.status, "-")}</strong></div><div><span>开具时间</span><strong>${safe(invoice.deliveredAt || invoice.time, "-")}</strong></div>${invoice.attachmentName ? `<div><span>附件</span><strong>${safe(invoice.attachmentName, "-")}</strong></div>` : ""}</div><div class="admin-action-row"><button class="btn btn-primary" type="button" data-user-action="user-invoice-download" data-user-id="${safe(invoice.id, "")}">下载</button><button class="btn btn-secondary" type="button" data-user-action="user-invoice-share" data-user-id="${safe(invoice.id, "")}">分享</button><button class="btn btn-secondary" type="button" data-user-dialog-action="close">关闭</button></div></div></div>`;
    }
    return "";
  }

  function renderUserShareSheet() {
    if (!state.userShareSheet.open) return "";
    return `<div class="share-sheet visible" style="position:absolute;"><div class="share-sheet-overlay" data-user-action="user-share-sheet-close"></div><div class="share-sheet-panel" data-stop-propagation><div class="share-sheet-title">分享到</div><div class="share-external-row"><button class="share-external-item" type="button" data-user-action="user-share-wechat"><div class="share-external-icon">💬</div><span>微信</span></button><button class="share-external-item" type="button" data-user-action="user-share-moments"><div class="share-external-icon">👥</div><span>朋友圈</span></button><button class="share-external-item" type="button" data-user-action="user-share-douyin"><div class="share-external-icon">🎵</div><span>抖音</span></button><button class="share-external-item" type="button" data-user-action="user-share-copy"><div class="share-external-icon">🔗</div><span>复制链接</span></button></div><div class="share-user-section"><div class="share-user-section-title">分享给平台用户</div><div class="share-user-list"><button class="share-user-item" type="button" data-user-action="user-share-platform"><div class="share-user-avatar">平</div><div class="share-user-name">平台推荐</div></button></div></div><button class="share-sheet-close" type="button" data-user-action="user-share-sheet-close">取消</button></div></div>`;
  }

  function getProviderStore() {
    return providers.find((item) => nAudit(item.auditStatus) === "已通过") || providers[0];
  }

  function getProviderAddresses() {
    const store = getProviderStore();
    const defaultAddress = store?.address ? {
      id: "PA-0",
      name: store.name || "门店",
      phone: store.contactPhone || store.phone || "021-54321098",
      address: store.address,
      tag: "门店地址",
    } : null;
    const rows = fallback.providerAddresses || [];
    if (defaultAddress && !rows.some((item) => item.address === defaultAddress.address)) {
      return [defaultAddress, ...rows];
    }
    return rows;
  }

  function getProviderAllOrders() {
    const store = getProviderStore();
    const rows = [...orders, ...providerOrderMocks];
    return rows.filter((item) => item.provider === store.name || item.intention === store.name);
  }

  function getProviderPendingOrders() {
    return getProviderAllOrders().filter((item) => {
      const status = nOrder(item.status);
      return !item.providerRejectStatus && (status === "待分配" || status === "处理中");
    });
  }

  function getProviderProcessingOrders() {
    return getProviderAllOrders().filter((item) => nOrder(item.status) === "施工中");
  }

  function getProviderAcceptanceOrders() {
    return getProviderAllOrders().filter((item) => nOrder(item.status) === "待验收");
  }

  function getProviderCompletedOrders() {
    return getProviderAllOrders().filter((item) => {
      const status = nOrder(item.status);
      return status === "已完成" || status === "售后中";
    });
  }

  function providerOrderViewStatus(item, active) {
    if (item.providerRejectStatus) return "已拒单";
    const status = nOrder(item.status);
    if (active === "pending" && status === "待分配") return "待接单";
    if (status === "售后中") return "售后中";
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
    const afterSaleStatus = safe(meta.afterSaleStatus, status === "售后中" ? "售后处理中" : "未发起");
    if (!item.providerRejectStatus && (status === "待分配" || status === "处理中")) {
      actions.push(`<button class="btn btn-primary" type="button" data-provider-action="order-accept" data-provider-id="${item.id}">接单</button>`);
      actions.push(`<button class="btn btn-danger" type="button" data-provider-action="order-reject" data-provider-id="${item.id}">拒单</button>`);
    } else if (status === "施工中") {
      actions.push(`<button class="btn btn-primary" type="button" data-provider-action="${completionOpen ? "order-complete-cancel" : "order-complete"}" data-provider-id="${item.id}">${completionOpen ? "收起完工表单" : "提交完工"}</button>`);
    } else if (status === "待验收") {
      actions.push(`<button class="btn btn-secondary" type="button" data-provider-action="order-follow" data-provider-id="${item.id}">查看客户验收说明</button>`);
    }
    return `<section class="admin-detail-card"><div class="eyebrow">Order Workbench</div><h3>${item.id}</h3><div class="admin-kv-list"><div><span>用户</span><strong>${safe(item.user, "-")}</strong></div><div><span>联系电话</span><strong>${status === "待分配" ? String(meta.phone).replace(/(\d{3})\d{4}(\d{4})/, "$1****$2") : meta.phone}</strong></div><div><span>车辆</span><strong>${safe(item.vehicle, "-")}</strong></div><div><span>服务项目</span><strong>${safe(item.service, "-")}</strong></div><div><span>预约安装时间</span><strong>${safe(item.appointment, "-")}</strong></div><div><span>预计工时</span><strong>${providerEstimateDuration(item)}</strong></div><div><span>当前状态</span><strong>${providerOrderViewStatus(item, "all")}</strong></div>${status === "已完成" || status === "售后中" ? `<div><span>售后状态</span><strong>${afterSaleStatus}</strong></div>` : ""}</div><div class="admin-action-row">${actions.join("")}</div>${completionOpen ? renderProviderCompleteForm(item) : ""}</section>`;
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
    if (status === "售后中") return "客户已反馈售后诉求，请按预约时间完成复查、返修或功能复检。";
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
    return `<section class="admin-detail-card"><div class="eyebrow">Purchase Record</div><h3>${safe(item.id, "采购记录")}</h3><div class="admin-kv-list"><div><span>商品</span><strong>${safe(item.name, "-")}</strong></div><div><span>型号</span><strong>${providerProductModel(item)}</strong></div><div><span>数量</span><strong>${item.quantity || 1}</strong></div><div><span>金额</span><strong>${safe(item.amount, "-")}</strong></div><div><span>支付方式</span><strong>${safe(item.payment, "-")}</strong></div><div><span>收货地址</span><strong>${safe(item.address, "-")}</strong></div><div><span>状态</span><strong>${nPurchaseStatus(item.status)}</strong></div><div><span>进度说明</span><strong>${safe(item.note, "-")}</strong></div></div><div class="admin-action-row">${nPurchaseStatus(item.status) !== "已签收" ? `<button class="btn btn-primary" type="button" data-provider-action="purchase-record-confirm" data-provider-id="${item.id}">确认收货</button>` : `<button class="btn btn-secondary" type="button" disabled>已确认收货</button>`}<button class="btn btn-secondary" type="button" data-provider-action="purchase-record-detail" data-provider-id="${item.id}">查看记录</button></div></section>`;
  }

  function renderProviderPurchaseDetail(item) {
    const formOpen = state.providerPurchase.formOpen;
    return `<div class="stack provider-purchase-detail-page">${state.providerFeedback ? `<div class="provider-feedback">${state.providerFeedback}</div>` : ""}<section class="provider-purchase-detail"><header class="provider-purchase-detail-header"><button class="user-message-back" type="button" data-provider-action="provider-product-back">返回</button><div><div class="eyebrow">Product Detail</div><h3>${safe(item.name, "商品详情")}</h3></div>${tag(nProduct(item.status))}</header><div class="provider-purchase-detail-body"><div class="provider-product-visual large" data-product-tone="${(item.brand || "").length % 3}"><span>${safe(item.category, "商品")}</span></div><div class="admin-kv-list" style="margin-top:14px;"><div><span>品牌</span><strong>${safe(item.brand, "-")}</strong></div><div><span>型号</span><strong>${providerProductModel(item)}</strong></div><div><span>类目</span><strong>${safe(item.category, "-")}</strong></div><div><span>价格</span><strong>${safe(item.price, "-")}</strong></div><div><span>库存状态</span><strong>${nProduct(item.status)}</strong></div></div>${formOpen ? renderProviderPurchaseForm(item) : `<div class="admin-action-row" style="margin-top:16px;"><button class="btn btn-primary" type="button" data-provider-action="provider-product-buy" data-provider-id="${item.sku}">立即采购</button></div>`}</div></section></div>`;
  }

  function renderProviderPurchaseForm(item) {
    const addressRows = getProviderAddresses();
    const defaultAddress = addressRows.find((a) => a.tag === "门店地址") || addressRows[0];
    return `<form class="provider-complete-form" data-provider-purchase-form data-provider-id="${item.sku}"><div class="form-grid"><div class="field-group"><label class="field-label" for="purchase-quantity-${item.sku}">采购数量</label><input class="input" id="purchase-quantity-${item.sku}" name="purchaseQuantity" type="number" min="1" max="99" value="1" required></div><div class="field-group"><label class="field-label" for="purchase-payment-${item.sku}">支付方式</label><select class="input" id="purchase-payment-${item.sku}" name="purchasePayment" required><option value="支付宝">支付宝</option><option value="微信支付">微信支付</option></select></div><div class="field-group field-group-full"><label class="field-label" for="purchase-address-${item.sku}">收货地址</label><select class="input" id="purchase-address-${item.sku}" name="purchaseAddressId" required>${addressRows.map((a) => `<option value="${a.id}" ${a.id === defaultAddress?.id ? "selected" : ""}>${a.tag} · ${a.address}</option>`).join("")}</select></div><div class="field-group field-group-full"><label class="field-label" for="purchase-note-${item.sku}">采购备注</label><input class="input" id="purchase-note-${item.sku}" name="purchaseNote" type="text" value="门店补货采购" required></div></div><div class="admin-action-row"><button class="btn btn-primary" type="submit">确认采购</button><button class="btn btn-secondary" type="button" data-provider-action="provider-product-buy-cancel" data-provider-id="${item.sku}">取消</button></div></form>`;
  }

  function renderProviderCaseForm(item) {
    const editing = !!item;
    const linked = editing ? (item.linkedProducts || []) : [];
    const grouped = {};
    products.forEach((p) => {
      if (!grouped[p.category]) grouped[p.category] = [];
      grouped[p.category].push(p);
    });
    const productSelectorHtml = Object.entries(grouped).map(([cat, list]) => {
      return `<div style="margin-bottom:10px;"><div style="font-size:12px;color:var(--text-muted);margin-bottom:6px;">${cat}</div><div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">${list.map((p) => {
        const checked = linked.includes(p.sku) ? "checked" : "";
        return `<label style="display:flex;align-items:center;gap:6px;padding:8px;border-radius:8px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.06);cursor:pointer;font-size:12px;"><input type="checkbox" name="caseLinkedProducts" value="${p.sku}" ${checked}><span style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${p.name}</span></label>`;
      }).join("")}</div></div>`;
    }).join("");

    return `<form class="provider-complete-form" data-provider-case-form data-provider-id="${editing ? item.id : ""}"><div class="form-grid"><div class="field-group"><label class="field-label" for="case-title-${editing ? item.id : "new"}">案例标题</label><input class="input" id="case-title-${editing ? item.id : "new"}" name="caseTitle" type="text" value="${editing ? safe(item.title, "") : ""}" required></div><div class="field-group"><label class="field-label" for="case-model-${editing ? item.id : "new"}">车型</label><input class="input" id="case-model-${editing ? item.id : "new"}" name="caseModel" type="text" value="${editing ? safe(item.model, "") : ""}" required></div><div class="field-group"><label class="field-label" for="case-cost-${editing ? item.id : "new"}">费用区间</label><input class="input" id="case-cost-${editing ? item.id : "new"}" name="caseCost" type="text" value="${editing ? safe(item.cost, "") : ""}" required></div><div class="field-group"><label class="field-label" for="case-modType-${editing ? item.id : "new"}">改装类型</label><select class="select" id="case-modType-${editing ? item.id : "new"}" name="caseModType" required><option value="车衣改造" ${editing && item.modType === "车衣改造" ? "selected" : ""}>车衣改造</option><option value="轮毂改造" ${editing && item.modType === "轮毂改造" ? "selected" : ""}>轮毂改造</option></select></div><div class="field-group"><label class="field-label" for="case-images-${editing ? item.id : "new"}">上传图片</label><label class="upload-panel" for="case-images-${editing ? item.id : "new"}"><input id="case-images-${editing ? item.id : "new"}" class="upload-input" name="caseImages" type="file" accept="image/*" multiple><span class="upload-illustration"></span><strong>上传案例图片</strong><small>支持封面图、施工过程图、完工图，最多选择 9 张</small></label></div><div class="field-group"><label class="field-label" for="case-desc-${editing ? item.id : "new"}">案例说明</label><textarea class="textarea" id="case-desc-${editing ? item.id : "new"}" name="caseDesc" required>${editing ? safe(item.description || item.style, "") : "请填写改装项目、施工亮点和交付效果。"}</textarea></div></div><div class="field-group" style="margin-top:12px;"><label class="field-label">关联商品（可多选）</label><div style="max-height:220px;overflow-y:auto;padding:10px;border-radius:12px;background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.06);">${productSelectorHtml}</div></div></form>`;
  }

  function getProviderCaseRows() {
    return cases.slice(0, 4);
  }

  function getProviderForumRows() {
    const storeName = safe(getProviderStore().name, "当前门店");
    return posts.slice(0, 4).map((item, index) => ({
      ...item,
      linkAuthStatus: item.linkAuthStatus || (index === 0 ? "已授权" : "未授权"),
      linkedProducts: Array.isArray(item.linkedProducts) ? item.linkedProducts : (index === 0 ? ["PR-8801"] : []),
      creatorPinned: item.creatorPinned || (index === 0 ? "是" : "否"),
      creatorName: item.creatorName || storeName,
    }));
  }

  function renderProviderCaseDetail(item) {
    const editing = state.providerCaseForm.mode === "edit" && state.providerCaseForm.id === item.id;
    const linkedProducts = (item.linkedProducts || []).map((sku) => products.find((p) => p.sku === sku)).filter(Boolean);
    const linkedHtml = linkedProducts.length ? `<div class="admin-comment-block" style="margin-top:10px;"><strong>关联商品</strong><div class="admin-comment-list">${linkedProducts.map((p) => `<div class="admin-comment-item"><div class="admin-comment-head"><strong>${safe(p.name, "-")}</strong><span class="muted">${safe(p.price, "-")}</span></div><p>${safe(p.brand, "-")} / ${safe(p.category, "-")}</p></div>`).join("")}</div></div>` : "";
    return `<section class="admin-detail-card"><div class="eyebrow">Case Operation</div><h3>${safe(item.title, "案例详情")}</h3><div class="admin-kv-list"><div><span>车型</span><strong>${safe(item.model, "-")}</strong></div><div><span>改装类型</span><strong>${safe(item.modType, "-")}</strong></div><div><span>费用区间</span><strong>${safe(item.cost, "-")}</strong></div><div><span>审核状态</span><strong>${nCaseAudit(item.audit)}</strong></div><div><span>展示状态</span><strong>${nCaseDisplay(item.display)}</strong></div></div>${linkedHtml}<div class="admin-action-row"><button class="btn btn-primary" type="button" data-provider-action="case-submit" data-provider-id="${item.id}">提交审核</button><button class="btn btn-secondary" type="button" data-provider-action="${editing ? "case-form-cancel" : "case-edit"}" data-provider-id="${item.id}">${editing ? "取消编辑" : "编辑案例"}</button></div>${editing ? renderProviderCaseForm(item) : ""}</section>`;
  }

  function renderProviderForumDetail(item) {
    const linkedProducts = (item.linkedProducts || []).map((sku) => products.find((product) => product.sku === sku)).filter(Boolean);
    return `<section class="admin-detail-card"><div class="eyebrow">Forum Operation</div><h3>${safe(item.title, "帖子详情")}</h3><div class="admin-kv-list"><div><span>互动</span><strong>回复 ${item.replies || 0} / 点赞 ${item.likes || 0}</strong></div><div><span>当前状态</span><strong>${nForum(item.status)}</strong></div><div><span>商品链接权限</span><strong>${safe(item.linkAuthStatus, "未授权")}</strong></div><div><span>已挂商品</span><strong>${linkedProducts.length ? linkedProducts.map((product) => product.name).join(" / ") : "未挂商品"}</strong></div><div><span>创作者主页</span><strong>${item.creatorPinned === "是" ? "置顶作品" : "未置顶"}</strong></div></div><div class="admin-action-row"><button class="btn btn-primary" type="button" data-provider-action="forum-reply" data-provider-id="${item.id}">查看评论</button><button class="btn btn-secondary" type="button" data-provider-action="forum-toggle" data-provider-id="${item.id}">${nForum(item.status) === "已删除" ? "恢复显示" : "删除帖子"}</button></div>${linkedProducts.length ? `<div class="admin-comment-block"><strong>帖子挂载商品</strong><div class="admin-comment-list">${linkedProducts.map((product) => `<div class="admin-comment-item"><div class="admin-comment-head"><strong>${safe(product.name, "商品")}</strong><span class="muted">${safe(product.price, "-")}</span></div><p>${safe(product.brand, "-")} / ${safe(product.category, "-")} / ${safe(product.fitment, "适配车型待补充")}</p></div>`).join("")}</div></div>` : ""}</section>`;
  }

  function renderProviderModeratorForm() {
    const store = getProviderStore();
    return `<form class="provider-complete-form" data-provider-moderator-form><section class="admin-detail-card"><div class="eyebrow">Moderator Apply</div><h3>申请成为论坛版主</h3><div class="admin-kv-list"><div><span>申请门店</span><strong>${safe(store.name, "-")}</strong></div><div><span>主营类目</span><strong>${safe(store.specialties, "-")}</strong></div></div><div class="field-group field-group-full"><label class="field-label" for="moderator-board">申请管理板块</label><select class="input" id="moderator-board" name="moderatorBoard" required><option value="">选择板块</option><option value="jdm">JDM 专区</option><option value="euro">欧系性能</option></select></div><div class="field-group field-group-full"><label class="field-label" for="moderator-reason">申请理由</label><textarea class="textarea" id="moderator-reason" name="moderatorReason" placeholder="请说明门店在对应领域的技术能力和内容运营计划" required>本店在对应改装领域有丰富施工经验，愿意维护板块秩序并分享专业内容。</textarea></div><div class="admin-action-row"><button class="btn btn-primary" type="submit">提交申请</button><button class="btn btn-secondary" type="button" data-provider-action="moderator-apply-cancel">取消</button></div></section></form>`;
  }

  function getProviderSettlementRows() {
    const store = getProviderStore();
    const rows = settlements.filter((item) => item.provider === store.name);
    const sourceRows = rows.length ? rows : settlements.slice(0, 3).map((item) => ({ ...item, provider: store.name }));
    return sourceRows.map((item) => {
      const serviceTimes = Number(item.serviceTimes || item.orders || 0);
      const referredUsers = Number(item.referredUsers || item.referralUsers || item.referralOrders * 6 || 0);
      const status = nSettlement(item.status);
      return { ...item, serviceTimes, referredUsers, referralUsers: referredUsers, status };
    });
  }

  function getProviderServicePricingRows() {
    return services.map((item, index) => {
      const key = item.code || item.name || `service-${index}`;
      const current = state.providerServicePricing[key] || createProviderServicePricingEntry(item, index);
      return { ...item, key, ...current };
    });
  }

  function renderProviderServicePricing() {
    const store = getProviderStore();
    const rows = getProviderServicePricingRows();
    const enabledCount = rows.filter((item) => item.enabled && item.status !== "停用").length;
    return `<div class="stack"><section class="admin-detail-card"><div class="eyebrow">Service Pricing</div><h3>服务定价设置</h3><div class="admin-kv-list"><div><span>当前门店</span><strong>${safe(store.name, "当前门店")}</strong></div><div><span>已启用服务项</span><strong>${enabledCount} 项</strong></div><div><span>平台定价规则</span><strong>报价需在平台区间内</strong></div><div><span>报价用途</span><strong>用于咨询、派单与服务下单展示</strong></div></div></section><form class="provider-complete-form" data-provider-pricing-form>${rows.map((item) => `<section class="mobile-item" style="margin-bottom:12px;"><div style="display:flex; justify-content:space-between; gap:12px; align-items:flex-start;"><div><strong>${safe(item.name, "服务项目")}</strong></div><label style="display:inline-flex; align-items:center; gap:8px; white-space:nowrap; color:${item.status === "停用" ? "var(--text-muted)" : "#fff"};"><input type="checkbox" name="serviceEnabled-${item.key}" data-provider-price-toggle="${item.key}" ${item.enabled ? "checked" : ""} ${item.status === "停用" ? "disabled" : ""}>当前可接</label></div><div class="form-grid" style="margin-top:14px;"><div class="field-group"><label class="field-label" for="service-range-${item.key}">平台价格范围</label><input class="input" id="service-range-${item.key}" type="text" value="${formatCurrency(item.min)} - ${formatCurrency(item.max)}" disabled></div><div class="field-group"><label class="field-label" for="service-price-${item.key}">门店报价</label><input class="input" id="service-price-${item.key}" name="servicePrice-${item.key}" data-provider-price-input="${item.key}" type="number" min="${item.min}" max="${item.max}" step="100" value="${item.quote}" ${item.status === "停用" || !item.enabled ? "disabled" : ""} required></div></div><div style="margin-top:10px; display:flex; gap:10px; flex-wrap:wrap;">${tag(item.status === "停用" ? "停用" : "启用")}<span class="pill">建议价 ${formatCurrency(item.suggested)}</span><span class="pill">${item.enabled && item.status !== "停用" ? "已纳入门店报价" : "未纳入门店报价"}</span></div></section>`).join("")}<div class="admin-action-row"><button class="btn btn-primary" type="submit">保存服务定价</button><button class="btn btn-secondary" type="button" data-provider-action="pricing-reset">恢复建议价</button></div></form></div>`;
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
      .map((item) => priceToNumber(getSettlementGrossAmount(item)))
      .reduce((sum, value) => sum + value, 0);
    return `<div class="stack"><section class="hero-banner" style="min-height:auto; padding-bottom:16px;"><div class="eyebrow">Business Overview</div><h3 style="margin:10px 0 0; font-size:28px; font-family:var(--font-display);">门店营业情况</h3></section><section class="mobile-grid-2"><article class="m3-card"><div class="muted">累计完成订单</div><span class="mobile-stat">${completedOrders}</span></article><article class="m3-card"><div class="muted">施工中订单</div><span class="mobile-stat">${processingOrders}</span></article><article class="m3-card"><div class="muted">待客户验收</div><span class="mobile-stat">${acceptanceOrders}</span></article><article class="m3-card"><div class="muted">采购跟进中</div><span class="mobile-stat">${pendingPurchase}</span></article></section><section class="admin-detail-card"><div class="eyebrow">Store Status</div><h3>今日营业概览</h3><div class="admin-kv-list"><div><span>门店营业状态</span><strong>${nProvider(store.status)}</strong></div><div><span>案例展示数量</span><strong>${caseCount} 个</strong></div><div><span>累计订单数量</span><strong>${allOrders.length} 个</strong></div></div></section></div>`;
  }

  function renderProviderSettlementDetail(item) {
    const opened = state.providerMe.settlementDetailId === item.id;
    const serviceTimes = item.serviceTimes || item.orders || 0;
    const referredUsers = item.referredUsers || item.referralUsers || 0;
    return `<section class="admin-detail-card"><div class="eyebrow">Service Stats</div><h3>${item.id}</h3><div class="admin-kv-list"><div><span>门店</span><strong>${safe(item.provider, "-")}</strong></div><div><span>服务次数</span><strong>${serviceTimes} 次</strong></div><div><span>推荐用户</span><strong>${referredUsers} 人</strong></div><div><span>订单金额</span><strong>${getSettlementGrossAmount(item)}</strong></div><div><span>统计状态</span><strong>${nSettlement(item.status)}</strong></div></div><div class="admin-action-row"><button class="btn btn-secondary" type="button" data-provider-action="settlement-detail" data-provider-id="${item.id}">${opened ? "收起详情" : "查看详情"}</button></div>${opened ? `<div class="admin-timeline"><div>统计周期：近 ${serviceTimes} 次已完工并验收服务</div><div>推荐用户：${referredUsers} 人（推荐码、平台推荐或历史服务转化）</div><div>订单金额合计：${getSettlementGrossAmount(item)}</div><div>记录更新时间：${safe(item.paidAt || item.applyTime, "待更新")}</div></div>` : ""}</section>`;
  }

  function getProviderProfileStores() {
    const store = getProviderStore();
    if (state.providerMe.profileStores?.length) return state.providerMe.profileStores;
    return getProviderStores(store);
  }

  function renderProviderProfileStoreRow(store, index, total) {
    return `
      <div class="provider-profile-store-row" data-provider-profile-store-index="${index}">
        <div style="display:flex; justify-content:space-between; align-items:center; gap:12px; margin-bottom:10px;">
          <span class="pill">门店 ${index + 1}${store.isPrimary ? " · 主门店" : ""}</span>
          ${total > 1 ? `<button class="btn btn-danger btn-sm" type="button" data-provider-profile-store-remove="${index}">删除</button>` : ""}
        </div>
        <div class="form-grid">
          <div class="field-group field-group-full">
            <label class="field-label" for="provider-store-name-${index}">门店名称</label>
            <input class="input" id="provider-store-name-${index}" name="providerStoreName-${index}" type="text" value="${safe(store.name, "")}" required>
          </div>
          <div class="field-group field-group-full">
            <label class="field-label" for="provider-store-address-${index}">门店地址</label>
            <input class="input" id="provider-store-address-${index}" name="providerStoreAddress-${index}" type="text" value="${safe(store.address, "")}" required>
          </div>
        </div>
      </div>
    `;
  }

  function bindProviderProfileStoreEvents(form) {
    form.querySelector("[data-provider-profile-store-add]")?.addEventListener("click", () => {
      state.providerMe.profileStores = getProviderProfileStores();
      state.providerMe.profileStores.push({
        id: `ST-NEW-${Date.now()}`,
        name: "",
        address: "",
        isPrimary: false,
      });
      render();
    });
    form.querySelectorAll("[data-provider-profile-store-remove]").forEach((button) => {
      button.addEventListener("click", () => {
        const index = Number(button.dataset.providerProfileStoreRemove);
        state.providerMe.profileStores = getProviderProfileStores();
        state.providerMe.profileStores.splice(index, 1);
        render();
      });
    });
  }

  function renderProviderProfileForm() {
    const store = getProviderStore();
    const stores = getProviderProfileStores();
    return `<form class="provider-complete-form" data-provider-profile-form><div class="form-grid"><div class="field-group"><label class="field-label" for="provider-contact-edit">联系人</label><input class="input" id="provider-contact-edit" name="providerContact" type="text" value="${safe(store.contact, "")}" required></div><div class="field-group"><label class="field-label" for="provider-specialties-edit">主营能力</label><input class="input" id="provider-specialties-edit" name="providerSpecialties" type="text" value="${safe(store.specialties, "")}" required></div></div><div class="provider-profile-stores"><div style="display:flex; justify-content:space-between; align-items:center; gap:12px; margin:18px 0 12px;"><h3 style="font-size:16px; margin:0;">门店信息</h3><button class="btn btn-secondary btn-sm" type="button" data-provider-profile-store-add>新增门店</button></div>${stores.map((item, index) => renderProviderProfileStoreRow(item, index, stores.length)).join("")}</div><div class="admin-action-row"><button class="btn btn-primary" type="submit">保存资料</button><button class="btn btn-secondary" type="button" data-provider-action="provider-profile-edit">取消</button></div></form>`;
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
        appendOrderTimeline(target, "门店已跟进客户验收时间");
        state.providerFeedback = `${id} 已更新客户验收跟进说明。`;
      }
      render();
      return;
    }
    if (action === "provider-product-pick") {
      state.providerPurchase.sku = id;
      state.providerPurchase.formOpen = false;
      render();
      return;
    }
    if (action === "provider-product-back") {
      state.providerPurchase.sku = "";
      state.providerPurchase.formOpen = false;
      render();
      return;
    }
    if (action === "provider-product-buy") {
      state.providerPurchase.formOpen = true;
      render();
      return;
    }
    if (action === "provider-product-buy-cancel") {
      state.providerPurchase.formOpen = false;
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
    if (action.startsWith("purchase-record-")) {
      const target = providerPurchaseRecords.find((item) => item.id === id);
      if (!target) {
        render();
        return;
      }
      if (action === "purchase-record-confirm") {
        target.status = "已签收";
        target.note = "门店已完成签收，可安排安装、入库或后续施工。";
        state.providerSelected.products = id;
        state.providerFeedback = `${id} 已确认收货，可继续安排安装或入库。`;
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
    if (action.startsWith("pricing-")) {
      if (action === "pricing-reset") {
        state.providerServicePricing = buildProviderServicePricingState();
        state.providerFeedback = "服务定价已恢复为平台建议价，可继续调整后保存。";
        state.subTab.operations = "pricing";
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
    if (action.startsWith("moderator-")) {
      state.subTab.operations = "forum";
      if (action === "moderator-apply") {
        if (state.providerMe.moderatorStatus === "已通过") {
          state.providerFeedback = "您已经是版主，可在管理板块中维护帖子秩序。";
        } else if (state.providerMe.moderatorStatus === "待审核") {
          state.providerFeedback = "版主申请正在审核中，请耐心等待平台审批。";
        } else {
          state.providerMe.moderatorApplyOpen = !state.providerMe.moderatorApplyOpen;
        }
      } else if (action === "moderator-apply-cancel") {
        state.providerMe.moderatorApplyOpen = false;
      } else if (action === "moderator-manage") {
        state.providerFeedback = "版主管理功能：可删除违规帖子、置顶优质内容。";
      }
      render();
      return;
    }
    if (action === "provider-message-pick") {
      state.providerSelected.messages = id;
      render();
      return;
    }
    if (action === "provider-message-back") {
      state.providerSelected.messages = "";
      render();
      return;
    }
    if (action.startsWith("provider-profile-")) {
      state.subTab.me = "profile";
      if (action === "provider-profile-edit") {
        state.providerMe.profileEditOpen = !state.providerMe.profileEditOpen;
        if (!state.providerMe.profileEditOpen) state.providerFeedback = "已收起门店资料表单。";
      } else if (action === "provider-profile-contact") {
        state.tab = "messages";
      }
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
    appendOrderTimeline(target, `门店提交完工资料，上传 ${imageCount} 张图片`);
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
    const payment = String(formData.get("purchasePayment") || "支付宝").trim();
    const addressId = String(formData.get("purchaseAddressId") || "").trim();
    const addressItem = getProviderAddresses().find((a) => a.id === addressId);
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
      payment,
      address: addressItem?.address || getProviderStore()?.address || "",
      addressName: addressItem?.name || getProviderStore()?.name || "",
      addressPhone: addressItem?.phone || "",
      status: "待发货",
      note,
    });
    state.providerPurchase.sku = "";
    state.providerPurchase.formOpen = false;
    state.subTab.operations = "record";
    state.providerSelected.products = id;
    state.providerFeedback = `${safe(product.name, "商品")} 已采购 ${quantity} 件，支付方式 ${payment}，已加入采购记录。`;
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
    const modType = String(formData.get("caseModType") || "").trim();
    const desc = String(formData.get("caseDesc") || "").trim();
    const imageCount = form.querySelector('input[name="caseImages"]')?.files?.length || 0;
    const caseDesc = imageCount ? `${desc} / 已上传 ${imageCount} 张案例图片` : desc;
    const linkedProducts = Array.from(form.querySelectorAll('input[name="caseLinkedProducts"]:checked')).map((cb) => cb.value);
    if (!title || !model || !cost || !modType || !desc) return;
    if (id) {
      const target = cases.find((item) => item.id === id);
      if (!target) return;
      target.title = title;
      target.model = model;
      target.cost = cost;
      target.modType = modType;
      target.style = caseDesc;
      target.description = caseDesc;
      target.linkedProducts = linkedProducts;
      state.providerSelected.cases = id;
      state.providerFeedback = `${title} 已更新。`;
    } else {
      const newId = `CASE-${Date.now().toString().slice(-6)}`;
      cases.unshift({
        id: newId,
        title,
        model,
        cost,
        modType,
        style: caseDesc,
        description: caseDesc,
        provider: getProviderStore().name,
        audit: "待提交",
        display: "未展示",
        linkedProducts,
      });
      state.providerSelected.cases = newId;
      state.providerFeedback = `${title} 已新增，可继续提交审核。`;
    }
    state.providerCaseForm = { mode: "", id: "" };
    state.subTab.operations = "cases";
    render();
  }

  function handleProviderPricingSubmit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    let enabledCount = 0;
    let adjustCount = 0;
    getProviderServicePricingRows().forEach((item) => {
      const toggle = form.querySelector(`[data-provider-price-toggle="${item.key}"]`);
      const input = form.querySelector(`[data-provider-price-input="${item.key}"]`);
      if (!toggle || !input) return;
      if (item.status === "停用") {
        state.providerServicePricing[item.key] = {
          enabled: false,
          quote: item.suggested,
          suggested: item.suggested,
          min: item.min,
          max: item.max,
        };
        return;
      }
      let quote = Math.round((Number(input.value || item.quote) || item.suggested) / 100) * 100;
      if (quote < item.min) {
        quote = item.min;
        adjustCount += 1;
      }
      if (quote > item.max) {
        quote = item.max;
        adjustCount += 1;
      }
      state.providerServicePricing[item.key] = {
        enabled: !!toggle.checked,
        quote,
        suggested: item.suggested,
        min: item.min,
        max: item.max,
      };
      if (toggle.checked) enabledCount += 1;
    });
    state.providerFeedback = adjustCount ? `已保存 ${enabledCount} 个服务项定价，${adjustCount} 项超出平台范围并已自动调整。` : `已保存 ${enabledCount} 个服务项定价，可用于咨询和平台派单展示。`;
    state.subTab.operations = "pricing";
    render();
  }

  function handleProviderAcceptSubmit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const id = form.dataset.providerId || "";
    const target = getProviderOrderById(id);
    if (!target) return;
    const formData = new FormData(form);
    const scheduleTime = String(formData.get("scheduleTime") || "").trim();
    const scheduleNote = String(formData.get("scheduleNote") || "").trim();
    if (!scheduleTime || !scheduleNote) return;
    const appointment = scheduleTime.replace("T", " ");
    target.status = "施工中";
    target.appointment = appointment;
    target.progress = `门店已接单，排期 ${appointment} 入场施工`;
    appendOrderTimeline(target, `门店接单，排期 ${appointment} 入场施工`);
    const extra = providerOrderExtras[id] || (providerOrderExtras[id] = {});
    extra.arrival = `已排期 ${appointment} 到店施工`;
    extra.remark = scheduleNote;
    state.providerDialog = { type: "", orderId: "" };
    state.providerSelected.orders = id;
    state.providerFeedback = `${id} 已接单，排期时间已更新为 ${appointment}。`;
    render();
  }


  function handleProviderProfileSubmit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const store = getProviderStore();
    const formData = new FormData(form);
    const contact = String(formData.get("providerContact") || "").trim();
    const specialties = String(formData.get("providerSpecialties") || "").trim();
    const stores = getProviderProfileStores();
    const updatedStores = stores
      .map((item, index) => ({
        ...item,
        name: String(formData.get(`providerStoreName-${index}`) || "").trim(),
        address: String(formData.get(`providerStoreAddress-${index}`) || "").trim(),
      }))
      .filter((item) => item.name && item.address);
    if (!contact || !specialties || !updatedStores.length) return;
    store.contact = contact;
    store.specialties = specialties;
    store.stores = updatedStores;
    const primaryStore = updatedStores.find((item) => item.isPrimary) || updatedStores[0];
    store.address = primaryStore.address;
    store.name = primaryStore.name;
    store.auditStatus = "待审核";
    state.providerMe.profileStores = [];
    state.subTab.me = "profile";
    state.providerMe.profileEditOpen = false;
    state.providerFeedback = `门店资料已更新，共 ${updatedStores.length} 家门店，平台将重新审核，审核通过后方可正常接单。`;
    render();
  }

  function handleProviderChatSubmit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const id = form.dataset.providerId || "";
    const target = fallback.providerMessages.find((item) => item.id === id);
    if (!target) return;
    const text = String(new FormData(form).get("chatMessage") || "").trim();
    const files = Array.from(form.querySelector('input[name="providerChatAttachment"]')?.files || []);
    if (!text && !files.length) return;
    const now = new Date();
    const time = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    const attachmentText = files.length ? `附件：${files.map((file) => file.name).slice(0, 3).join("、")}${files.length > 3 ? ` 等 ${files.length} 个文件` : ""}` : "";
    const messageText = [text, attachmentText].filter(Boolean).join("\n");
    target.messages.push({ from: "provider", text: messageText, time });
    target.preview = text || attachmentText;
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
      target.progress = "门店已接单，已进入排期";
      appendOrderTimeline(target, "门店接单，订单进入排期");
      state.providerDialog = { type: "", orderId: "" };
      state.providerFeedback = `${id} 已接单，订单已进入施工中。`;
      render();
    }
  }

  function handleProviderModeratorSubmit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const board = String(new FormData(form).get("moderatorBoard") || "").trim();
    const reason = String(new FormData(form).get("moderatorReason") || "").trim();
    if (!board || !reason) return;
    state.providerMe.moderatorApplyOpen = false;
    state.providerMe.moderatorStatus = "待审核";
    state.providerFeedback = `版主申请已提交（板块：${board === "jdm" ? "JDM 专区" : "欧系性能"}），平台将在 3 个工作日内完成审核。`;
    render();
  }

  function handleProviderRejectSubmit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const id = form.dataset.providerId || "";
    const target = getProviderOrderById(id);
    if (!target) return;
    const reason = String(new FormData(form).get("rejectReason") || "").trim();
    if (!reason) return;
    target.status = "待分配";
    target.provider = "平台重派中";
    target.progress = "等待服务商接单";
    target.userVisibleStatus = "待接单";
    target.userVisibleProgress = "已提交需求，平台正在安排可接单服务商。";
    target.platformInterventionStatus = "待重派";
    target.platformInterventionAction = "重派/延期";
    target.delayDeadline = "2026-04-03 18:00";
    target.providerRejectStatus = "已拒单";
    target.rejectedBy = getProviderStore().name;
    target.rejectReason = reason;
    appendOrderTimeline(target, `门店拒单：${reason}，平台介入重派/延期，用户端保持待接单`);
    state.providerDialog = { type: "", orderId: "" };
    state.providerFeedback = `${id} 已提交拒单原因，平台将介入重派或延期；用户端仍显示待接单。`;
    render();
  }

  function renderUser() {
    if (state.tab === "forum") return renderUserForum();
    if (state.tab === "mall") {
      if (state.userMallPage) return renderUserMallCategoryPage();
      return renderUserMallHome();
    }
    if (state.tab === "garage") {
      const selectedVehicle = getSelectedUserVehicle();
      return `<div class="stack">${renderUserGarageVehicles(selectedVehicle)}${renderUserGarageRender(selectedVehicle)}</div>`;
    }
    if (state.tab === "messages") return renderUserMessages();
    return renderUserMe();
  }

  function renderUserHome() {
    const selectedVehicle = getSelectedUserVehicle();
    const historyEntries = getVehicleHistoryEntries(selectedVehicle);
    const providerEntries = getVehicleIntentProviders(selectedVehicle);
    const providersText = providerEntries.join(" / ") || "暂无改装历史服务商";
    const activeOrders = getUserActiveOrders(selectedVehicle);
    const currentOrder = activeOrders[0] || getUserOrders()[0] || null;
    const featuredProducts = products.slice(0, 2);
    const featuredCases = cases.slice(0, 2);
    const primaryCase = featuredCases[0];
    const secondaryCase = featuredCases[1];
    if (!selectedVehicle) {
      return `<div class="stack user-home-v2">${state.userFeedback ? `<div class="provider-feedback">${state.userFeedback}</div>` : ""}<section class="user-home-board user-home-board-empty"><div class="user-home-hero-shell"><div class="user-home-hero-stage"><div class="user-home-car-scene"><div class="user-home-car-shape"></div></div></div><div class="user-home-hero-copy"><div class="user-home-overline">爱车首页</div><h2>先绑定爱车，再开始改装</h2><p>绑定车辆后，首页会围绕你的爱车、订单进度和改装内容做展示。</p><div class="user-home-chip-row"><span class="user-home-chip">订单进度集中查看</span><span class="user-home-chip">案例与商品联动推荐</span></div><div class="admin-action-row"><button class="btn btn-primary" type="button" data-tab="garage">立即绑定</button><button class="btn btn-secondary" type="button" data-tab="mall">先逛商城</button></div></div><div class="user-home-stage-card"><div class="user-home-stage-head"><div><div class="user-home-overline">准备开始</div><strong>建立你的爱车档案</strong></div><span class="pill">待绑定</span></div><div class="user-home-stage-summary"><div><span>首页内容</span><strong>车辆、订单、履历与案例推荐</strong></div><div><span>下一步</span><strong>先去爱车页完成车辆绑定</strong></div></div></div></div></section><section class="user-home-quick-grid"><button class="user-home-quick-card" type="button" data-tab="mall"><span class="user-home-quick-mark">商城</span><strong>改装商城</strong><small>直接进入配件与精品列表</small></button><a class="user-home-quick-card" href="user-app.html?tab=forum&forumCategory=case"><span class="user-home-quick-mark">案例</span><strong>精选案例</strong><small>浏览改装方案和完工效果</small></a><button class="user-home-quick-card" type="button" data-user-action="user-home-orders"><span class="user-home-quick-mark">订单</span><strong>订单中心</strong><small>查看服务进度和历史记录</small></button><button class="user-home-quick-card" type="button" data-tab="garage"><span class="user-home-quick-mark">爱车</span><strong>爱车档案</strong><small>绑定车辆与常用定位信息</small></button></section><section class="user-home-editorial-grid">${primaryCase ? `<a class="user-home-spotlight" href="user-case-detail.html?id=CA-240402-007"><div class="user-home-spotlight-media" data-tone="1"></div><div class="user-home-spotlight-body"><div class="user-home-panel-head"><div><div class="user-home-overline">精选案例</div><h3>${safe(primaryCase.title, "精选案例")}</h3></div><span class="pill">${safe(primaryCase.style, "改装风格")}</span></div><p>${safe(primaryCase.model, "适配车型")} / ${safe(primaryCase.provider, "服务商")}</p></div></a>` : ""}<div class="user-home-product-stack">${featuredProducts.map((item, index) => `<article class="user-home-product-card"><div class="user-home-product-visual" data-tone="${index + 1}"></div><div><strong>${safe(item.name, "商品")}</strong><div class="muted" style="margin-top:6px;">${safe(item.price, "-")} / ${safe(item.brand, "品牌")}</div></div><div class="admin-action-row"><a class="btn btn-secondary" href="user-product-detail.html?sku=${encodeURIComponent(item.sku || "")}&name=${encodeURIComponent(safe(item.name, "商品"))}&price=${encodeURIComponent(safe(item.price, "¥0"))}&brand=${encodeURIComponent(safe(item.brand, "-"))}&fitment=${encodeURIComponent(safe(item.fitment || item.description, "适配当前车型"))}&mallPage=${encodeURIComponent(item.sku === "PR-8801" ? "wheel" : item.sku === "PR-8802" ? "exhaust" : item.sku === "PR-8805" ? "interior" : "exterior")}">商品详情</a><a class="btn btn-primary" href="${buildUserGoodsOrderLink(item)}">立即下单</a></div></article>`).join("")}</div></section></div>`;
    }
    return `<div class="stack user-home-v2">${state.userFeedback ? `<div class="provider-feedback">${state.userFeedback}</div>` : ""}<section class="user-home-board user-home-hero-v2"><div class="user-home-hero-shell"><div class="user-home-location-bar"><div><span class="user-home-location-label">当前定位</span><strong>${getGarageLocationSummary()}</strong></div><button class="btn btn-secondary user-home-location-trigger" type="button" data-user-action="${state.userGarage.locationEditing ? "user-location-cancel" : "user-location-edit"}">${state.userGarage.locationEditing ? "收起" : "切换定位"}</button></div>${state.userGarage.locationEditing ? renderUserHomeLocationPicker() : ""}<div class="user-home-hero-stage"><div class="user-home-car-scene"><div class="user-home-car-shape"></div></div></div><div class="user-home-hero-copy"><h2>${safe(selectedVehicle.model, "当前爱车")}</h2><p>${safe(selectedVehicle.plate, "-")} / ${safe(selectedVehicle.color, "-")} / 车主 ${safe(selectedVehicle.owner, "-")}</p><div class="user-home-status-bar"><article class="user-home-status-item"><span>意向服务商</span><strong>${providersText}</strong></article></div><div class="user-home-metric-row"><article class="user-home-metric"><span>进行中订单</span><strong>${activeOrders.length}</strong></article><article class="user-home-metric"><span>改装履历</span><strong>${historyEntries.length}</strong></article><article class="user-home-metric"><span>常用服务商</span><strong>${providerEntries.length}</strong></article></div><div class="admin-action-row"><button class="btn btn-secondary" type="button" data-tab="garage">查看爱车页</button><button class="btn btn-primary" type="button" data-user-action="user-home-orders">查看订单</button></div></div><div class="user-home-stage-card">${currentOrder ? `<div class="user-home-stage-head"><div><div class="user-home-overline">当前服务</div><strong>${safe(currentOrder.service, "订单服务")}</strong></div>${tag(nOrder(currentOrder.status))}</div><div class="user-home-stage-summary"><div><span>预约时间</span><strong>${safe(currentOrder.appointment, "-")}</strong></div><div><span>服务商</span><strong>${safe(currentOrder.provider || currentOrder.intention, "-")}</strong></div><div><span>订单金额</span><strong>${safe(currentOrder.quote, "-")}</strong></div></div><div class="admin-action-row"><button class="btn btn-primary" type="button" data-user-action="user-home-order-detail" data-user-id="${currentOrder.id}">查看详情</button><button class="btn btn-secondary" type="button" data-user-action="user-order-contact" data-user-id="${currentOrder.id}">联系服务商</button></div>` : `<div class="user-home-stage-head"><div><div class="user-home-overline">当前服务</div><strong>当前暂无进行中服务</strong></div><span class="pill">可直接下单</span></div><div class="user-home-stage-summary"><div><span>推荐动作</span><strong>先去商城选商品，或浏览案例再预约</strong></div><div><span>常用服务商</span><strong>${providersText}</strong></div></div><div class="admin-action-row"><button class="btn btn-primary" type="button" data-tab="mall">去商城</button><a class="btn btn-secondary" href="user-case-detail.html">看案例</a></div>`}</div></div></section><section class="user-home-quick-grid"><button class="user-home-quick-card" type="button" data-tab="mall"><span class="user-home-quick-mark">商城</span><strong>改装商城</strong><small>轮毂、排气、制动与精品件</small></button><a class="user-home-quick-card" href="user-case-detail.html"><span class="user-home-quick-mark">案例</span><strong>案例灵感</strong><small>看适配当前车型的方案</small></a><button class="user-home-quick-card" type="button" data-tab="forum"><span class="user-home-quick-mark">社区</span><strong>社区动态</strong><small>查看帖子与互动内容</small></button><button class="user-home-quick-card" type="button" data-user-action="user-home-orders"><span class="user-home-quick-mark">订单</span><strong>订单中心</strong><small>集中查看服务进度</small></button></section><section class="user-home-content-grid"><article class="user-home-panel"><div class="user-home-panel-head"><div><div class="user-home-overline">改装履历</div><h3>最近改装记录</h3></div><button class="btn btn-secondary" type="button" data-tab="garage">查看全部</button></div><div class="user-home-history-list">${historyEntries.slice(0, 3).map((entry, index) => `<div class="user-home-history-row"><span class="user-home-history-index">${String(index + 1).padStart(2, "0")}</span><div><strong>${entry}</strong><small>${providersText}</small></div></div>`).join("")}</div></article><article class="user-home-panel"><div class="user-home-panel-head"><div><div class="user-home-overline">服务摘要</div><h3>当前订单信息</h3></div><button class="btn btn-secondary" type="button" data-user-action="user-home-orders">订单中心</button></div><div class="user-home-order-list">${currentOrder ? `<div class="user-home-order-row"><span>服务项目</span><strong>${safe(currentOrder.service, "-")}</strong></div><div class="user-home-order-row"><span>服务商</span><strong>${safe(currentOrder.provider || currentOrder.intention, "-")}</strong></div><div class="user-home-order-row"><span>支付方式</span><strong>${safe(currentOrder.paymentMethod, "线上支付")}</strong></div><div class="user-home-order-row"><span>订单金额</span><strong>${safe(currentOrder.quote, "-")}</strong></div>` : `<div class="user-home-order-row"><span>当前状态</span><strong>暂无订单</strong></div><div class="user-home-order-row"><span>建议动作</span><strong>去商城或案例页发起需求</strong></div>`}</div></article></section><section class="user-home-editorial-grid">${primaryCase ? `<a class="user-home-spotlight" href="user-case-detail.html"><div class="user-home-spotlight-media" data-tone="1"></div><div class="user-home-spotlight-body"><div class="user-home-panel-head"><div><div class="user-home-overline">精选案例</div><h3>${safe(primaryCase.title, "精选案例")}</h3></div><span class="pill">${safe(primaryCase.style, "改装风格")}</span></div><p>${safe(primaryCase.model, "适配车型")} / ${safe(primaryCase.provider, "服务商")}</p></div></a>` : ""}<div class="user-home-product-stack">${secondaryCase ? `<a class="user-home-mini-case" href="user-case-detail.html"><div class="user-home-mini-case-media" data-tone="2"></div><div><div class="user-home-overline">推荐案例</div><strong>${safe(secondaryCase.title, "推荐案例")}</strong><p>${safe(secondaryCase.model, "车型")} / ${safe(secondaryCase.style, "风格")}</p></div></a>` : ""}${featuredProducts.map((item, index) => `<article class="user-home-product-card"><div class="user-home-product-visual" data-tone="${index + 1}"></div><div><strong>${safe(item.name, "商品")}</strong><div class="muted" style="margin-top:6px;">${safe(item.price, "-")} / ${safe(item.brand, "品牌")}</div></div><div class="admin-action-row"><a class="btn btn-secondary" href="user-product-detail.html?sku=${encodeURIComponent(item.sku || "")}&name=${encodeURIComponent(safe(item.name, "商品"))}&price=${encodeURIComponent(safe(item.price, "¥0"))}&brand=${encodeURIComponent(safe(item.brand, "-"))}&fitment=${encodeURIComponent(safe(item.fitment || item.description, "适配当前车型"))}&mallPage=${encodeURIComponent(item.sku === "PR-8801" ? "wheel" : item.sku === "PR-8802" ? "exhaust" : item.sku === "PR-8805" ? "interior" : "exterior")}">商品详情</a><a class="btn btn-primary" href="${buildUserGoodsOrderLink(item)}">立即下单</a></div></article>`).join("")}</div></section></div>`;
  }

  function renderUserMallHome() {
    const selectedVehicle = getSelectedUserVehicle();
    const categoryMeta = getUserMallCategoryMeta();
    const brandOptions = getUserMallBrandOptions();
    const activeBrand = state.userMall.brand && brandOptions.includes(state.userMall.brand) ? state.userMall.brand : brandOptions[0] || "";
    const modelOptions = getUserMallModelOptions(activeBrand);
    const activeModel = state.userMall.model && modelOptions.includes(state.userMall.model) ? state.userMall.model : modelOptions[0] || "";
    const rows = getUserMallFilteredProducts(activeBrand, activeModel);
    const resultSummary = `${rows.length} 件商品`;
    const cartCount = getUserCartItems().reduce((sum, item) => sum + Number(item.quantity || 0), 0);
    const collectionCount = getUserCollections().length;
    const { brands: brandList } = window.MockData;
    const bannerText = fallback.userBanners[0];
    return `<div class="stack user-mall-page">${state.userFeedback ? `<div class="provider-feedback">${state.userFeedback}</div>` : ""}<section class="user-mall-banner"><div class="mall-banner-visual" data-tone="1"><div class="mall-banner-copy"><div class="mall-banner-overline">本周推荐</div><h2>高端姿态方案</h2><p>${bannerText}</p><a class="btn btn-primary mall-banner-cta" href="user-product-detail.html?sku=PR-8801&name=BBS%20锻造轮毂%2019寸&price=%C2%A5%2018,800&brand=BBS&fitment=宝马%203系%20/%20奥迪%20A4L&mallPage=wheel">立即选购</a></div></div></section><section class="user-mall-brands"><div class="mall-brands-head"><strong>签约品牌</strong><span>${brandList.length}+ 全球改装品牌</span></div><div class="mall-brands-scroll">${brandList.map((b) => `<div class="mall-brand-item"><div class="mall-brand-logo" data-brand="${b.id}"></div><span>${b.name}</span></div>`).join("")}</div></section><section class="user-mall-shell"><div class="user-mall-toolbar"><form class="user-mall-search" data-user-mall-search-form><input class="input user-mall-search-input" name="userMallKeyword" type="text" value="${safe(state.userMall.keyword, "")}" placeholder="搜索改装配件、品牌..." aria-label="搜索改装配件、品牌"><button class="user-mall-search-submit" type="submit" aria-label="搜索">搜索</button></form><div class="user-mall-toolbar-actions"><a class="mall-cart-btn" href="user-app.html?tab=me&meTab=cart"><span class="mall-cart-icon">购物车</span>${cartCount > 0 ? `<span class="mall-cart-badge">${cartCount}</span>` : ""}</a><a class="mall-cart-btn mall-collection-btn" href="user-app.html?tab=me&meTab=collections"><span class="mall-cart-icon">收藏</span>${collectionCount > 0 ? `<span class="mall-cart-badge">${collectionCount}</span>` : ""}</a></div></div><div class="user-mall-filter-row"><select class="input" data-user-mall-filter="brand">${brandOptions.map((item) => `<option value="${item}" ${item === activeBrand ? "selected" : ""}>${item}</option>`).join("")}</select><select class="input" data-user-mall-filter="model">${modelOptions.map((item) => `<option value="${item}" ${item === activeModel ? "selected" : ""}>${item}</option>`).join("")}</select></div><div class="user-mall-layout"><aside class="user-mall-sidebar">${categoryMeta.map((item) => `<button class="user-mall-category ${item.id === "all" ? (!state.userMallPage ? "active" : "") : state.userMallPage === item.id ? "active" : ""}" type="button" data-user-action="user-mall-category" data-user-id="${item.id}">${item.label}</button>`).join("")}</aside><div class="user-mall-results"><div class="user-mall-results-head"><strong>${safe(activeModel !== "全部车型" ? activeModel : selectedVehicle?.model, "当前车型")}</strong><span>${resultSummary}</span></div>${rows.length ? rows.map((item, index) => `<article class="user-mall-card"><a class="user-mall-card-media" href="user-product-detail.html?sku=${encodeURIComponent(item.sku || "")}&name=${encodeURIComponent(safe(item.name, "商品"))}&price=${encodeURIComponent(safe(item.price, "¥0"))}&brand=${encodeURIComponent(safe(item.brand, "-"))}&fitment=${encodeURIComponent(safe(item.fitment || item.description, "适配当前车型"))}&mallPage=${encodeURIComponent(resolveUserMallPageByCategory(item.category))}" data-tone="${(index % 4) + 1}"></a><div class="user-mall-card-body"><h4>${safe(item.name, "商品")}</h4><div class="user-mall-card-meta">${safe(item.brand, "-")} · ${safe(item.category, "-")}</div><div class="user-mall-card-fitment">${safe(item.fitment, "适配当前车型")}</div><div class="user-mall-card-actions"><strong class="user-mall-card-price">${safe(item.price, "-")}</strong><button class="btn btn-secondary btn-sm ${isUserProductCollected(item.sku) ? "active" : ""}" type="button" data-user-action="user-mall-collect" data-user-id="${item.sku}">${isUserProductCollected(item.sku) ? "取消收藏" : "收藏"}</button></div></div></article>`).join("") : `<div class="user-mall-empty">暂无符合条件的商品</div>`}</div></div></section></div>`;
  }

  function renderUserMe() {
    const active = state.subTab.me || "profile";
    return `${subTabs([{ id: "profile", label: "基本信息" }, { id: "orders", label: "历史订单" }, { id: "cart", label: "我的购物车" }, { id: "messages", label: "消息" }, { id: "address", label: "地址管理" }, { id: "credit", label: "金融授信" }])}${active === "profile" ? renderUserProfile() : active === "orders" ? renderUserHistoryOrders() : active === "cart" ? renderUserCart() : active === "messages" ? renderUserMessages() : active === "address" ? renderUserAddress() : renderUserCredit()}`;
  }

  function getUserOrders() {
    return [...getStoredUserOrders(), ...fallback.userHistoryOrders, ...orders.filter((item) => safe(item.user, "") === "当前用户")]
      .slice(0, 8)
      .map((item) => normalizeUserAfterSaleDemoOrder(item));
  }

  function normalizeUserAfterSaleDemoOrder(item) {
    if (!item || item.afterSaleType || item.id !== "UO-240328") return item;
    return {
      ...item,
      status: "售后中",
      afterSaleType: "换货",
      afterSaleMethod: "换货",
      afterSaleReason: "排气尾段包装磕碰，申请更换同型号商品。",
      afterSaleStatus: "处理中",
      afterSaleStep: "待用户寄回",
      afterSaleTime: "2026-04-03 10:30",
      progress: "售后申请已通过，请填写寄回物流。",
      timeline: [
        "2026-04-03 10:30 用户提交换货申请",
        "2026-04-03 11:00 平台审核通过，等待用户填写寄回物流",
        ...(item.timeline || []),
      ],
    };
  }

  function getUserOrderById(id) {
    return getUserOrders().find((item) => item.id === id);
  }

  function getUserCartItems() {
    if (typeof window === "undefined" || !window.localStorage) return [];
    try {
      const raw = window.localStorage.getItem(CART_STORAGE_KEY);
      const rows = JSON.parse(raw || "[]");
      return Array.isArray(rows) ? rows : [];
    } catch (error) {
      return [];
    }
  }

  function setUserCartItems(rows) {
    if (typeof window === "undefined" || !window.localStorage) return;
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(rows));
  }

  function getUserCollections() {
    if (typeof window === "undefined" || !window.localStorage) return [];
    try {
      const raw = window.localStorage.getItem(COLLECTIONS_STORAGE_KEY);
      const rows = JSON.parse(raw || "[]");
      return Array.isArray(rows) ? rows : [];
    } catch (error) {
      return [];
    }
  }

  function setUserCollections(rows) {
    if (typeof window === "undefined" || !window.localStorage) return;
    window.localStorage.setItem(COLLECTIONS_STORAGE_KEY, JSON.stringify(rows));
  }

  function isUserProductCollected(sku) {
    return getUserCollections().some((item) => safe(item.sku, "") === safe(sku, ""));
  }

  function readStorageRows(key) {
    if (typeof window === "undefined" || !window.localStorage) return [];
    try {
      const rows = JSON.parse(window.localStorage.getItem(key) || "[]");
      return Array.isArray(rows) ? rows : [];
    } catch (error) {
      return [];
    }
  }

  function writeStorageRows(key, rows) {
    if (typeof window === "undefined" || !window.localStorage) return;
    window.localStorage.setItem(key, JSON.stringify(rows));
  }

  function getDateKey(date = new Date()) {
    const pad = (value) => String(value).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  }

  function getDefaultUserPointRows() {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return [
      {
        id: "PT-INIT-ORDER",
        type: "order",
        title: "商品付款获得积分",
        points: 188,
        source: "BBS 锻造轮毂 19寸",
        sourceId: "UO-240401",
        time: "2026-04-01 14:30",
        desc: "商品订单支付成功，按每满 100 元获得 1 积分。",
      },
      {
        id: "PT-INIT-SIGN",
        type: "checkin",
        title: "每日签到",
        points: 10,
        source: "我的页面",
        sourceId: getDateKey(yesterday),
        time: `${getDateKey(yesterday)} 09:12`,
        desc: "连续访问用户端并完成签到。",
      },
    ];
  }

  function getUserPointRows() {
    const localRows = readStorageRows(POINTS_STORAGE_KEY);
    const rows = localRows.length ? localRows : getDefaultUserPointRows();
    return rows
      .filter((item) => item && item.id)
      .map((item) => ({ ...item, points: Number(item.points || 0) }))
      .sort((a, b) => new Date(b.time || 0).getTime() - new Date(a.time || 0).getTime());
  }

  function getUserPointTotal(rows = getUserPointRows()) {
    return rows.reduce((sum, item) => sum + Math.max(0, Number(item.points || 0)), 0);
  }

  function hasUserCheckedInToday(rows = getUserPointRows()) {
    const today = getDateKey();
    return rows.some((item) => item.type === "checkin" && (item.sourceId === today || String(item.time || "").startsWith(today)));
  }

  function appendUserPointRow(row) {
    const rows = getUserPointRows();
    if (row.sourceId && rows.some((item) => item.type === row.type && item.sourceId === row.sourceId)) return null;
    const nextRow = {
      id: row.id || `PT-${Date.now().toString().slice(-6)}`,
      type: row.type || "manual",
      title: row.title || "积分获得",
      points: Number(row.points || 0),
      source: row.source || "用户端",
      sourceId: row.sourceId || "",
      time: row.time || getNowStamp(),
      desc: row.desc || "",
    };
    writeStorageRows(POINTS_STORAGE_KEY, [nextRow, ...rows].slice(0, 80));
    return nextRow;
  }

  function calculateOrderPoints(item, quantity = 1) {
    return Math.floor((priceToNumber(item?.price) * Math.max(1, Number(quantity || 1))) / 100);
  }

  function getMallRecommendationRows() {
    const localRows = readStorageRows(MALL_RECOMMENDATION_STORAGE_KEY);
    return localRows.length ? localRows : (window.MockData.mallRecommendations || []);
  }

  function getActiveMallRecommendation() {
    return getMallRecommendationRows()
      .filter((item) => item.status !== "停用")
      .sort((a, b) => Number(a.sort || 0) - Number(b.sort || 0))[0];
  }

  function getMockUserAuth() {
    if (typeof window === "undefined" || !window.localStorage) return null;
    try {
      const value = JSON.parse(window.localStorage.getItem(AUTH_STORAGE_KEY) || "null");
      return value && value.phone ? value : null;
    } catch (error) {
      return null;
    }
  }

  function setMockUserAuth(profile) {
    if (typeof window === "undefined" || !window.localStorage) return;
    window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(profile));
  }

  function getPaymentOptions() {
    return window.MockData.paymentOptions || [
      { id: "alipay", name: "支付宝" },
      { id: "wechat", name: "微信支付" },
      { id: "credit", name: "金融授信" },
    ];
  }

  function getUserInvoices() {
    const current = getMockUserAuth();
    const localRows = readStorageRows(INVOICE_STORAGE_KEY);
    const mockRows = Array.isArray(window.MockData.invoices) ? window.MockData.invoices : [];
    const seen = new Set();
    return [...localRows, ...mockRows]
      .map((item) => ({ ...item, status: normalizeUserInvoiceStatus(item.status), rejectReason: "" }))
      .filter((item) => {
        if (!item?.id || seen.has(item.id)) return false;
        seen.add(item.id);
        return true;
      })
      .filter((item) => !current || !item.phone || item.phone === current.phone)
      .sort((a, b) => getUserInvoiceTimeValue(b) - getUserInvoiceTimeValue(a))
      .slice(0, 20);
  }

  function normalizeUserInvoiceStatus(status) {
    return String(status || "").includes("已开") ? "已开具" : "待开票";
  }

  function getUserInvoiceTimeValue(row) {
    const raw = row.deliveredAt || row.time || row.applyTime || "";
    const parsed = Date.parse(String(raw).replace(/-/g, "/"));
    return Number.isNaN(parsed) ? 0 : parsed;
  }

  function getCurrentInvoiceForOrder(orderId, rows = getUserInvoices()) {
    const matches = rows.filter((item) => safe(item.orderId, "") === safe(orderId, ""));
    return matches.find((item) => normalizeUserInvoiceStatus(item.status) === "已开具") || matches[0] || null;
  }

  function renderUserAuth() {
    const mode = state.userAuthMode;
    const isLogin = mode === "login";
    const isChoice = mode === "registerChoice";
    const isPhone = mode === "registerPhone";
    const isSmsLogin = mode === "smsLogin";
    const isWechat = mode === "registerWechat";
    const wx = state.wechatBindInfo;

    if (isChoice) {
      return `<div class="user-auth-screen"><section class="user-auth-card"><div class="user-auth-kicker">MAN GAI Mock</div><h2>选择注册方式</h2><p>请选择一种方式完成注册，注册后数据仅保存在当前浏览器。</p>${state.userAuthFeedback ? `<div class="provider-feedback">${state.userAuthFeedback}</div>` : ""}<div class="admin-action-row" style="flex-direction:column; gap:12px; margin-top:18px;"><button class="btn btn-primary" type="button" data-user-auth-mode="registerPhone" style="width:100%; justify-content:center; min-height:52px;"><span style="margin-right:8px; font-size:18px;">📱</span>手机号注册</button><button class="btn btn-secondary" type="button" data-user-auth-mode="registerWechat" style="width:100%; justify-content:center; min-height:52px;"><span style="margin-right:8px; font-size:18px;">💬</span>微信注册</button></div><div style="text-align:center; margin-top:16px;"><button type="button" data-user-auth-mode="login" style="background:none; border:none; color:var(--text-muted); font-size:13px; cursor:pointer;">已有账号？去登录</button></div></section></div>`;
    }

    if (isPhone) {
      return `<div class="user-auth-screen" style="display:flex; flex-direction:column; justify-content:center; min-height:100%; padding:24px 20px;"><div style="text-align:center; margin-bottom:32px;"><div style="font-size:72px; line-height:1; margin-bottom:20px; opacity:0.5;">🏎️</div><h2 style="font-size:26px; font-family:var(--font-display); margin:0;">手机号注册</h2></div>${state.userAuthFeedback ? `<div class="provider-feedback">${state.userAuthFeedback}</div>` : ""}<form class="provider-complete-form user-auth-form" data-user-auth-form data-auth-mode="registerPhone" style="margin:0;"><div style="margin-bottom:16px;"><label style="display:block; font-size:13px; color:var(--text-muted); margin-bottom:6px;">手机号</label><input class="input" id="auth-phone" name="phone" type="tel" placeholder="请输入手机号" value="13800138000" required style="width:100%;"></div><div style="margin-bottom:16px;"><label style="display:block; font-size:13px; color:var(--text-muted); margin-bottom:6px;">验证码</label><div style="display:flex; gap:10px;"><input class="input" id="auth-code" name="code" type="text" placeholder="请输入验证码" value="888888" required style="flex:1;"><button class="btn btn-secondary" type="button" style="white-space:nowrap; padding:0 14px; font-size:13px;">获取验证码</button></div></div><div style="margin-bottom:24px;"><label style="display:block; font-size:13px; color:var(--text-muted); margin-bottom:6px;">推荐码</label><input class="input" id="auth-invite" name="inviteCode" type="text" placeholder="可不填" style="width:100%;"></div><div class="admin-action-row" style="margin:0;"><button class="btn btn-primary" type="submit" style="width:100%;">注册并进入</button></div></form><div style="text-align:center; margin-top:20px;"><button type="button" data-user-auth-mode="login" style="background:none; border:none; color:var(--text-muted); font-size:13px; cursor:pointer;">← 返回登录</button></div></div>`;
    }

    if (isSmsLogin) {
      return `<div class="user-auth-screen" style="display:flex; flex-direction:column; justify-content:center; min-height:100%; padding:24px 20px;"><div style="text-align:center; margin-bottom:32px;"><div style="font-size:72px; line-height:1; margin-bottom:20px; opacity:0.5;">🏎️</div><h2 style="font-size:26px; font-family:var(--font-display); margin:0;">手机短信登录</h2></div>${state.userAuthFeedback ? `<div class="provider-feedback">${state.userAuthFeedback}</div>` : ""}<form class="provider-complete-form user-auth-form" data-user-auth-form data-auth-mode="smsLogin" style="margin:0;"><div style="margin-bottom:16px;"><label style="display:block; font-size:13px; color:var(--text-muted); margin-bottom:6px;">手机号</label><input class="input" id="auth-phone" name="phone" type="tel" placeholder="请输入手机号" value="13800138000" required style="width:100%;"></div><div style="margin-bottom:24px;"><label style="display:block; font-size:13px; color:var(--text-muted); margin-bottom:6px;">验证码</label><div style="display:flex; gap:10px;"><input class="input" id="auth-code" name="code" type="text" placeholder="请输入验证码" value="888888" required style="flex:1;"><button class="btn btn-secondary" type="button" style="white-space:nowrap; padding:0 14px; font-size:13px;">获取验证码</button></div></div><div class="admin-action-row" style="margin:0;"><button class="btn btn-primary" type="submit" style="width:100%;">登录</button></div></form><div style="text-align:center; margin-top:20px;"><button type="button" data-user-auth-mode="login" style="background:none; border:none; color:var(--text-muted); font-size:13px; cursor:pointer;">← 返回密码登录</button></div></div>`;
    }

    if (isWechat) {
      const wxBindHtml = wx ? `<div style="display:flex; flex-direction:column; align-items:center; gap:10px; padding:18px 14px; border-radius:14px; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); margin-bottom:14px;"><div style="width:72px; height:72px; border-radius:50%; background:linear-gradient(135deg, #07c160, #05a350); display:flex; align-items:center; justify-content:center; font-size:36px; box-shadow:0 4px 12px rgba(7,193,96,0.25);">🌿</div><strong style="font-size:17px;">${safe(wx.nickname, "微信用户")}</strong><div style="font-size:12px; color:var(--text-muted);">已获取微信头像和昵称</div><button class="btn btn-secondary btn-sm" type="button" data-user-action="user-wechat-unbind">重新获取</button></div>` : `<button class="btn btn-secondary" type="button" data-user-action="user-wechat-bind" style="width:100%; margin-bottom:14px; min-height:48px;"><span style="margin-right:6px;">💬</span>点击获取微信头像和昵称</button>`;
      return `<div class="user-auth-screen"><section class="user-auth-card"><div class="user-auth-kicker">MAN GAI Mock</div><h2>微信注册</h2><p>授权微信后将自动获取头像和昵称，补充手机号即可完成注册。</p>${state.userAuthFeedback ? `<div class="provider-feedback">${state.userAuthFeedback}</div>` : ""}${wxBindHtml}<form class="provider-complete-form user-auth-form" data-user-auth-form data-auth-mode="registerWechat"><div class="form-grid"><div class="field-group"><label class="field-label" for="auth-phone">手机号</label><input class="input" id="auth-phone" name="phone" type="tel" value="13800138000" required></div><div class="field-group"><label class="field-label" for="auth-invite">推荐码</label><input class="input" id="auth-invite" name="inviteCode" type="text" placeholder="可不填，如 YC2026"></div><div class="field-group"><label class="field-label" for="auth-password">密码</label><input class="input" id="auth-password" name="password" type="password" value="mock1234" required></div></div><div class="admin-action-row"><button class="btn btn-primary" type="submit">注册并进入</button></div></form><div style="text-align:center; margin-top:14px;"><button type="button" data-user-auth-mode="login" style="background:none; border:none; color:var(--text-muted); font-size:13px; cursor:pointer;">← 返回登录</button></div></section></div>`;
    }

    return `<div class="user-auth-screen" style="display:flex; flex-direction:column; justify-content:center; min-height:100%; padding:24px 20px;"><div style="text-align:center; margin-bottom:32px;"><div style="font-size:72px; line-height:1; margin-bottom:20px; opacity:0.5;">🏎️</div><div style="font-size:14px; color:var(--text-muted); margin-bottom:6px;">欢迎来到</div><h2 style="font-size:26px; font-family:var(--font-display); margin:0 0 10px;">满改汽车改装平台</h2><p style="font-size:13px; color:var(--text-muted); margin:0;">高端汽车改装服务入口</p></div>${state.userAuthFeedback ? `<div class="provider-feedback">${state.userAuthFeedback}</div>` : ""}<form class="provider-complete-form user-auth-form" data-user-auth-form data-auth-mode="login" style="margin:0;"><div style="margin-bottom:16px;"><label style="display:block; font-size:13px; color:var(--text-muted); margin-bottom:6px;">手机号</label><input class="input" id="auth-phone" name="phone" type="tel" placeholder="请输入手机号" value="13800138000" required style="width:100%;"></div><div style="margin-bottom:24px;"><label style="display:block; font-size:13px; color:var(--text-muted); margin-bottom:6px;">密码</label><input class="input" id="auth-password" name="password" type="password" placeholder="请输入密码" value="mock1234" required style="width:100%;"></div><div class="admin-action-row" style="margin:0;"><button class="btn btn-primary" type="submit" style="width:100%;">登录</button></div></form><div style="display:flex; align-items:center; gap:12px; margin:24px 0;"><div style="flex:1; height:1px; background:rgba(255,255,255,0.1);"></div><span style="font-size:12px; color:var(--text-muted);">其他登录方式</span><div style="flex:1; height:1px; background:rgba(255,255,255,0.1);"></div></div><div style="text-align:center; display:flex; justify-content:center; gap:32px;"><div style="display:flex; flex-direction:column; align-items:center; gap:6px;"><button type="button" data-user-auth-mode="registerPhone" style="width:48px; height:48px; border-radius:50%; background:#07c160; color:#fff; border:none; font-size:24px; cursor:pointer; display:inline-flex; align-items:center; justify-content:center;">💬</button><span style="font-size:11px; color:var(--text-muted);">微信</span></div><div style="display:flex; flex-direction:column; align-items:center; gap:6px;"><button type="button" data-user-auth-mode="smsLogin" style="width:48px; height:48px; border-radius:50%; background:#2b7de1; color:#fff; border:none; font-size:24px; cursor:pointer; display:inline-flex; align-items:center; justify-content:center;">📱</button><span style="font-size:11px; color:var(--text-muted);">手机短信</span></div></div><div style="text-align:center; margin-top:20px;"><button type="button" data-user-auth-mode="registerPhone" style="background:none; border:none; color:var(--text-muted); font-size:13px; cursor:pointer;">还没有账号？去注册 →</button></div></div>`;
  }

  function getVehicleHistoryEntries(vehicle) {
    return String(vehicle?.history || "暂无改装记录")
      .split(/[\/；;。]/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  function getVehicleIntentProviders(vehicle) {
    const currentModel = safe(vehicle?.model, "");
    return Array.from(
      new Set(
        getUserOrders()
          .filter((item) => safe(item.vehicle, "") === currentModel)
          .map((item) => safe(item.provider || item.intention, ""))
          .filter(Boolean)
      )
    );
  }

  function getGarageLocationSummary() {
    return [state.userGarage.locationProvince, state.userGarage.locationCity, state.userGarage.locationCounty].filter(Boolean).join(" / ");
  }

  function renderUserHomeLocationPicker() {
    const provinceList = Object.keys(locationOptions);
    const cityList = Array.from(new Set(Object.values(locationOptions).flatMap((cityMap) => Object.keys(cityMap))));
    const countyList = Array.from(new Set(Object.values(locationOptions).flatMap((cityMap) => Object.values(cityMap).flat())));
    return `<div class="user-home-location-picker"><div class="user-home-location-grid"><div class="field-group"><label class="field-label" for="home-location-province">省</label><select class="input" id="home-location-province" name="locationProvince">${provinceList.map((item) => `<option value="${item}" ${item === state.userGarage.locationProvince ? "selected" : ""}>${item}</option>`).join("")}</select></div><div class="field-group"><label class="field-label" for="home-location-city">市</label><select class="input" id="home-location-city" name="locationCity">${cityList.map((item) => `<option value="${item}" ${item === state.userGarage.locationCity ? "selected" : ""}>${item}</option>`).join("")}</select></div><div class="field-group user-home-location-county"><label class="field-label" for="home-location-county">区县</label><select class="input" id="home-location-county" name="locationCounty">${countyList.map((item) => `<option value="${item}" ${item === state.userGarage.locationCounty ? "selected" : ""}>${item}</option>`).join("")}</select></div></div><div class="admin-action-row"><button class="btn btn-primary" type="button" data-user-action="user-location-save">保存定位</button><button class="btn btn-secondary" type="button" data-user-action="user-location-cancel">取消</button></div></div>`;
  }

  function getUserMallCategoryMeta() {
    return [
      { id: "all", label: "全部", category: "" },
      { id: "exterior", label: "车衣", category: "车衣" },
      { id: "wheel", label: "轮毂", category: "轮毂" },
      { id: "exhaust", label: "排气", category: "排气" },
      { id: "brake", label: "制动", category: "制动" },
      { id: "interior", label: "动力", category: "动力" },
    ];
  }

  function resolveUserMallPageByCategory(category) {
    return getUserMallCategoryMeta().find((item) => item.category === category)?.id || "exterior";
  }

  function getUserMallBrandOptions() {
    return ["全部品牌", ...Array.from(new Set(vehicles.map((item) => getVehicleBrandLabel(item.model)).filter(Boolean)))];
  }

  function getUserMallModelOptions(brand) {
    const rows = Array.from(new Set(vehicles.map((item) => safe(item.model, "")).filter(Boolean)));
    const filtered = brand && brand !== "全部品牌" ? rows.filter((item) => getVehicleBrandLabel(item) === brand) : rows;
    return ["全部车型", ...filtered];
  }

  function getUserMallFilteredProducts(activeBrand, activeModel) {
    const keyword = String(state.userMall.keyword || "").trim().toLowerCase();
    const activeCategory = getUserMallCategoryMeta().find((item) => item.id === state.userMallPage)?.category || "";
    const modelTokens = String(activeModel || "")
      .split(/\s+/)
      .map((item) => item.trim())
      .filter(Boolean);
    const fitmentBrand = activeBrand && activeBrand !== "全部品牌" ? activeBrand : "";
    return products.filter((item) => {
      const haystack = [item.name, item.brand, item.category, item.fitment, item.description].join(" ").toLowerCase();
      if (keyword && !haystack.includes(keyword)) return false;
      if (activeCategory && safe(item.category, "") !== activeCategory) return false;
      if (fitmentBrand) {
        const fitmentText = String(item.fitment || "");
        if (!fitmentText.includes(fitmentBrand) && !fitmentText.includes("全车型") && !fitmentText.includes("高端性能轿车")) return false;
      }
      if (activeModel && activeModel !== "全部车型") {
        const fitmentText = String(item.fitment || "");
        const matched = modelTokens.slice(1).some((token) => token && fitmentText.includes(token));
        if (!matched && fitmentBrand && !fitmentText.includes(fitmentBrand) && !fitmentText.includes("全车型") && !fitmentText.includes("高端性能轿车")) return false;
      }
      return true;
    });
  }

  function getUserPreferredProviders() {
    const selectedVehicle = getSelectedUserVehicle();
    const historyProviders = getVehicleIntentProviders(selectedVehicle);
    if (historyProviders.length) {
      return historyProviders
        .map((name) => providers.find((item) => item.name === name))
        .filter(Boolean);
    }
    return providers.filter((item) => nAudit(item.auditStatus) === "已通过").slice(0, 3);
  }

  function getUserActiveOrders(vehicle) {
    const currentModel = safe(vehicle?.model, "");
    return getUserOrders()
      .filter((item) => safe(item.vehicle, "") === currentModel)
      .filter((item) => nOrder(item.status) !== "已完成")
      .sort((a, b) => String(b.appointment || "").localeCompare(String(a.appointment || "")));
  }

  function getUserDefaultAddress() {
    const target = fallback.userAddresses.find((item) => String(item.tag || "").includes("默认")) || fallback.userAddresses[0];
    return safe(target?.address, "上海市徐汇区虹桥路 188 号 3 单元 1201");
  }

  function getUserDefaultReceiver() {
    const target = fallback.userAddresses.find((item) => String(item.tag || "").includes("默认")) || fallback.userAddresses[0];
    return safe(target?.name, "当前用户");
  }

  function getStoredUserOrders() {
    if (typeof window === "undefined") return [];
    try {
      const raw = window.localStorage.getItem(ORDER_STORAGE_KEY);
      const rows = JSON.parse(raw || "[]");
      return Array.isArray(rows) ? rows : [];
    } catch (error) {
      return [];
    }
  }

  function setStoredUserOrders(rows) {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(ORDER_STORAGE_KEY, JSON.stringify(rows));
  }

  function buildUserGoodsOrderLink(item, quantity = 1) {
    return `user-order-create.html?sku=${encodeURIComponent(item.sku || "")}&variantSku=${encodeURIComponent(item.variantSku || "")}&specSummary=${encodeURIComponent(item.specSummary || "")}&name=${encodeURIComponent(safe(item.name, "商品"))}&price=${encodeURIComponent(safe(item.price, "¥0"))}&brand=${encodeURIComponent(safe(item.brand, "-"))}&fitment=${encodeURIComponent(safe(item.fitment || item.description, "适配当前车型"))}&mallPage=${encodeURIComponent(resolveUserMallPageByCategory(item.category) || "exterior")}&quantity=${encodeURIComponent(String(quantity || 1))}`;
  }

  function renderUserProfile() {
    return `<div class="stack"><section class="admin-detail-card"><div class="eyebrow">User Profile</div><h3>用户基本信息</h3><div class="admin-kv-list"><div><span>昵称</span><strong>当前用户</strong></div><div><span>手机号</span><strong>13800138000</strong></div><div><span>常用城市</span><strong>${state.userGarage.locationCity.replace("市", "")}</strong></div><div><span>默认爱车</span><strong>${safe(getSelectedUserVehicle()?.model, "未绑定车辆")}</strong></div><div><span>当前定位</span><strong>${getGarageLocationSummary()}</strong></div><div><span>账号状态</span><strong>正常</strong></div></div></section></div>`;
  }

  function renderUserCart() {
    const rows = getUserCartItems();
    const totalAmount = rows.reduce((sum, item) => sum + (priceToNumber(item.price) * Number(item.quantity || 0)), 0);
    if (!rows.length) {
      return `<div class="stack"><section class="admin-detail-card"><div class="eyebrow">Cart</div><h3>我的购物车</h3><div class="admin-timeline"><div>当前购物车为空</div><div>去商城挑选商品后，可以把心仪商品先加入购物车。</div></div><div class="admin-action-row"><button class="btn btn-primary" type="button" data-tab="mall">去商城</button></div></section></div>`;
    }
    return `<div class="stack"><section class="admin-detail-card"><div class="eyebrow">Cart</div><h3>我的购物车</h3><div class="admin-kv-list"><div><span>商品数量</span><strong>${rows.length}</strong></div><div><span>商品总件数</span><strong>${rows.reduce((sum, item) => sum + Number(item.quantity || 0), 0)}</strong></div><div><span>合计金额</span><strong>${formatCurrency(totalAmount)}</strong></div><div><span>状态</span><strong>可继续下单</strong></div></div><div class="admin-action-row"><button class="btn btn-secondary" type="button" data-tab="mall">继续逛商城</button><button class="btn btn-danger" type="button" data-user-action="user-cart-clear">清空购物车</button></div></section><div class="mobile-list">${rows.map((item) => `<section class="admin-detail-card"><h3>${safe(item.name, "商品")}</h3><div class="admin-kv-list"><div><span>品牌</span><strong>${safe(item.brand, "-")}</strong></div>${item.specSummary ? `<div><span>已选规格</span><strong>${safe(item.specSummary, "-")}</strong></div>` : ""}<div><span>适配车型</span><strong>${safe(item.fitment, "-")}</strong></div><div><span>单价</span><strong>${safe(item.price, "-")}</strong></div><div><span>数量</span><strong>${Number(item.quantity || 0)}</strong></div><div><span>小计</span><strong>${formatCurrency(priceToNumber(item.price) * Number(item.quantity || 0))}</strong></div><div><span>下单状态</span><strong>待提交</strong></div></div><div class="admin-action-row"><button class="btn btn-secondary" type="button" data-user-action="user-cart-remove" data-user-id="${safe(item.variantSku || item.sku, "")}">移除</button><a class="btn btn-primary" href="${buildUserGoodsOrderLink(item, Number(item.quantity || 1))}&from=cart">去下单</a></div></section>`).join("")}</div></div>`;
  }

  function renderUserHistoryOrders() {
    const rows = getUserOrders();
    const selected = rows.find((item) => item.id === state.userMe.selectedOrder) || rows[0];
    return `<div class="mobile-list">${rows.map((item) => {
      const orderStatus = item.userVisibleStatus || (item.rejectReason ? "待接单" : nOrder(item.status));
      const orderProgress = item.userVisibleProgress || safe(item.progress, "处理中");
      return `<div class="admin-inline-block"><button class="mobile-item admin-pick-card ${selected?.id === item.id ? "active" : ""}" type="button" data-user-action="user-order-pick" data-user-id="${item.id}"><strong>${item.id}</strong><div class="muted" style="margin-top:8px;">${safe(item.vehicle, "车型")} / ${safe(item.appointment, "-")}</div><div style="margin-top:8px;">${safe(item.service, "服务")}</div><div class="muted" style="margin-top:8px;">${orderProgress}</div><div style="margin-top:10px; display:flex; gap:10px; flex-wrap:wrap;"><span class="pill">${safe(item.quote, "-")}</span>${tag(orderStatus)}</div></button>${selected?.id === item.id ? renderUserHistoryOrderDetailV2(item) : ""}</div>`;
    }).join("") || `<article class="mobile-item"><strong>暂无历史订单</strong></article>`}</div>`;
  }

  function renderUserCoupons() {
    const activeFilter = state.userMe.couponFilter || "available";
    const coupons = [
      { id: "C001", name: "新用户专享券", type: "discount", value: "¥200", threshold: "满¥2,000可用", validity: "2026.05.28 - 2026.06.28", status: "available", desc: "限商城轮毂、车衣类目" },
      { id: "C002", name: "618改装节", type: "percent", value: "9折", threshold: "满¥5,000可用", validity: "2026.06.01 - 2026.06.18", status: "available", desc: "全平台通用" },
      { id: "C003", name: "服务工时券", type: "discount", value: "¥500", threshold: "满¥3,000可用", validity: "2026.04.01 - 2026.05.01", status: "expired", desc: "限指定服务商门店" },
      { id: "C004", name: "BBS品牌券", type: "discount", value: "¥1,000", threshold: "满¥10,000可用", validity: "2026.05.01 - 2026.07.01", status: "used", desc: "限BBS锻造轮毂" },
      { id: "C005", name: "满减券", type: "discount", value: "¥300", threshold: "满¥1,500可用", validity: "2026.05.20 - 2026.06.20", status: "available", desc: "限排气、避震类目" },
    ];
    const filtered = coupons.filter((c) => activeFilter === "all" ? true : c.status === activeFilter);
    const filterTabs = [
      { id: "available", label: "已领取" },
      { id: "used", label: "已使用" },
      { id: "expired", label: "已过期" },
    ];
    const listHtml = filtered.length ? `<div class="user-coupon-list">${filtered.map((c) => `<article class="user-coupon-card ${c.status}"><div class="user-coupon-main"><strong>${c.value}</strong><span>${c.name}</span><small>${c.desc}</small></div><div class="user-coupon-meta"><span>${c.threshold}</span><span>${c.validity}</span></div>${c.status === "available" ? `<button class="btn btn-primary btn-sm" type="button" data-tab="mall">去使用</button>` : c.status === "used" ? `<span class="pill">已使用</span>` : `<span class="pill muted">已过期</span>`}</article>`).join("")}</div>` : `<section class="user-me-panel user-me-empty"><strong>暂无优惠券</strong><span>领取优惠券后，会在这里集中查看。</span></section>`;
    return `<div class="stack user-coupon-page">${state.userFeedback ? `<div class="provider-feedback">${state.userFeedback}</div>` : ""}<section class="user-coupon-head"><div><span>Coupons</span><strong>优惠券管理</strong></div><small>${coupons.filter((c) => c.status === "available").length} 张可用</small></section><section class="user-coupon-filter">${filterTabs.map((t) => `<button class="${activeFilter === t.id ? "active" : ""}" type="button" data-user-action="user-coupon-filter" data-user-id="${t.id}">${t.label}</button>`).join("")}</section>${listHtml}</div>`;
  }

  function renderUserMessages() {
    const rows = fallback.providerMessages.filter((item) => item.messages.some((message) => message.from === "user" || message.from === "provider" || message.from === "platform"));
    const selected = rows.find((item) => item.id === state.userMe.selectedMessage) || rows[0];
    return `<div class="stack">${state.userFeedback ? `<div class="provider-feedback">${state.userFeedback}</div>` : ""}<section class="provider-chat-shell"><div class="provider-chat-list">${rows.map((item) => `<div class="admin-inline-block"><button class="provider-chat-thread ${selected?.id === item.id ? "active" : ""}" type="button" data-user-action="user-message-pick" data-user-id="${item.id}"><div class="provider-chat-thread-head"><strong>${safe(item.title, "消息")}</strong><span>${safe(item.time, "刚刚")}</span></div><div class="provider-chat-thread-preview">${safe(item.preview, "暂无消息内容")}</div><div class="provider-chat-thread-meta">${tag(safe(item.status, "正常"))}</div></button>${selected?.id === item.id ? `<section class="provider-chat-panel"><header class="provider-chat-header"><div><div class="eyebrow">Realtime Chat</div><h3>${safe(item.title, "即时对话")}</h3></div>${tag(safe(item.status, "正常"))}</header><div class="provider-chat-body">${item.messages.map((message) => `<article class="provider-chat-bubble ${message.from === "user" ? "is-self" : ""}"><div class="provider-chat-bubble-role">${message.from === "user" ? "我" : "服务商"}</div><p>${message.text}</p><time>${message.time}</time></article>`).join("")}</div><form class="provider-chat-composer" data-user-chat-form data-user-id="${item.id}"><input class="input" name="userChatMessage" type="text" placeholder="输入消息并实时发送" autocomplete="off" required><button class="btn btn-primary" type="submit">发送</button></form></section>` : ""}</div>`).join("")}</div></section></div>`;
  }

  function renderUserAddress() {
    const rows = fallback.userAddresses;
    return `<div class="stack"><div class="admin-action-row"><button class="btn btn-primary" type="button" data-user-action="${state.userMe.addressCreateOpen ? "user-address-cancel" : "user-address-add"}">${state.userMe.addressCreateOpen ? "收起新增地址" : "新增地址"}</button></div>${state.userMe.addressCreateOpen ? renderUserAddressForm() : ""}<div class="mobile-list">${rows.map((item) => `<section class="mobile-item"><strong>${item.name} / ${item.phone}</strong><div class="muted" style="margin-top:8px;">${item.address}</div><div style="margin-top:10px; display:flex; justify-content:space-between; gap:12px; align-items:center;"><span class="pill">${item.tag}</span><button class="btn btn-danger" type="button" data-user-action="user-address-delete" data-user-id="${item.id}">删除</button></div></section>`).join("")}</div></div>`;
  }

  function renderUserAddressForm() {
    return `<form class="provider-complete-form" data-user-address-form><div class="form-grid"><div class="field-group"><label class="field-label" for="address-name-new">收件人</label><input class="input" id="address-name-new" name="addressName" type="text" value="周恺" required></div><div class="field-group"><label class="field-label" for="address-phone-new">联系电话</label><input class="input" id="address-phone-new" name="addressPhone" type="text" value="13800138000" required></div><div class="field-group"><label class="field-label" for="address-detail-new">详细地址</label><input class="input" id="address-detail-new" name="addressDetail" type="text" value="上海市徐汇区虹桥路 188 号 3 单元 1201" required></div></div><div class="admin-action-row"><button class="btn btn-primary" type="submit">保存地址</button><button class="btn btn-secondary" type="button" data-user-action="user-address-cancel">取消</button></div></form>`;
  }

  function renderUserCredit() {
    return `<div class="stack"><section class="admin-detail-card"><div class="eyebrow">Credit Service</div><h3>金融授信</h3><div class="admin-kv-list"><div><span>授信状态</span><strong>已开通</strong></div><div><span>可用额度</span><strong>¥80,000</strong></div><div><span>已使用额度</span><strong>¥12,600</strong></div><div><span>最近还款日</span><strong>2026-04-10</strong></div></div><div class="admin-timeline"><div>支持商品分期、改装施工分期与门店联合金融方案。</div><div>如需提升额度，可直接提交授信申请资料。</div></div></section>${state.userMe.creditApplyOpen ? renderUserCreditApplyForm() : ""}</div>`;
  }

  function renderUserCreditApplyForm() {
    return `<form class="provider-complete-form" data-user-credit-form><div class="form-grid"><div class="field-group"><label class="field-label" for="credit-name">姓名</label><input class="input" id="credit-name" name="creditName" type="text" value="周恺" required></div><div class="field-group"><label class="field-label" for="credit-phone">手机号</label><input class="input" id="credit-phone" name="creditPhone" type="text" value="13800138000" required></div><div class="field-group"><label class="field-label" for="credit-idno">身份证号</label><input class="input" id="credit-idno" name="creditIdNo" type="text" value="310101199409100011" required></div><div class="field-group"><label class="field-label" for="credit-city">所在城市</label><input class="input" id="credit-city" name="creditCity" type="text" value="${state.userGarage.locationCity}" required></div><div class="field-group"><label class="field-label" for="credit-amount">申请额度</label><input class="input" id="credit-amount" name="creditAmount" type="text" value="¥ 120,000" required></div><div class="field-group field-group-full"><label class="field-label" for="credit-purpose">用途说明</label><textarea class="textarea" id="credit-purpose" name="creditPurpose" required>用于轮组升级、制动套件和后续精品内饰升级。</textarea></div></div><div class="admin-action-row"><button class="btn btn-primary" type="submit">提交申请</button><button class="btn btn-secondary" type="button" data-user-action="user-credit-cancel">取消</button></div></form>`;
  }

  function renderInlineInvoiceForm(order) {
    return `<form class="user-me-form light user-invoice-inline-form" data-user-invoice-form><input type="hidden" name="orderId" value="${safe(order.id, "")}"><div class="user-me-form-row"><label><span>发票类型</span><select class="input" name="invoiceType"><option value="普票">普票</option><option value="专票">专票</option></select></label><label><span>发票抬头</span><input class="input" name="title" type="text" value="${safe(getMockUserAuth()?.nickname, "顾铭")}" required></label></div><label><span>税号</span><input class="input" name="taxNo" type="text" placeholder="专票必填"></label><label><span>接收邮箱</span><input class="input" name="email" type="email" value="user@example.com" required></label><label><span>联系电话</span><input class="input" name="phone" type="tel" value="${safe(getMockUserAuth()?.phone, "13800138000")}" required></label><label><span>注册地址</span><input class="input" name="address" type="text" value="${getUserDefaultAddress()}" required></label><label><span>开户行</span><input class="input" name="bankName" type="text" placeholder="专票填写开户行"></label><label><span>账号</span><input class="input" name="bankAccount" type="text" placeholder="专票填写账号"></label><div class="user-invoice-form-actions"><button class="btn btn-secondary" type="button" data-user-action="user-invoice-cancel">取消</button><button class="btn btn-primary" type="submit">提交申请</button></div></form>`;
  }

  function renderInvoiceRecordRow(item) {
    const status = normalizeUserInvoiceStatus(item.status);
    const attachment = item.attachmentName ? `<span>附件 ${safe(item.attachmentName, "-")}</span>` : "";
    const deliveredAt = item.deliveredAt ? `<span>回传时间：${safe(item.deliveredAt, "-")}</span>` : "";
    const actionButtons = status === "已开具" ? `<button class="user-invoice-apply-btn" type="button" data-user-action="user-invoice-view" data-user-id="${safe(item.id, "")}">查看</button><button class="user-invoice-apply-btn" type="button" data-user-action="user-invoice-download" data-user-id="${safe(item.id, "")}">下载</button><button class="user-invoice-apply-btn" type="button" data-user-action="user-invoice-share" data-user-id="${safe(item.id, "")}">分享</button>` : "";
    return `<article><div><strong>${safe(item.id, "发票申请")}</strong><span>订单 ${safe(item.orderId, "-")} / ${safe(item.type || item.invoiceType, "普票")}</span>${attachment}${deliveredAt}</div><div class="user-invoice-order-side">${tag(status)}${actionButtons}</div></article>`;
  }

  function renderUserInvoices() {
    const orderRows = getUserOrders();
    const invoiceRows = getUserInvoices();
    const hasDirectInvoiceMatch = invoiceRows.some((invoice) => orderRows.some((order) => safe(order.id, "") === safe(invoice.orderId, "")));
    const selectedOrder = orderRows.find((item) => safe(item.id, "") === state.userMe.invoiceOrderId);
    return `<div class="user-me-light-subpage user-invoice-list-page"><section class="user-me-white-block"><div class="user-me-block-head"><strong>电子凭证</strong><span>${orderRows.length} 条订单</span></div><div class="user-me-record-list light user-invoice-order-list">${orderRows.map((order) => {
      const invoice = invoiceRows.find((item) => safe(item.orderId, "") === safe(order.id, "")) || (!hasDirectInvoiceMatch ? invoiceRows[orderRows.indexOf(order)] : null);
      const hasInvoice = Boolean(invoice);
      const amount = safe(order.quote || order.amount, "-");
      const orderName = safe(order.service || order.product || order.name, "订单");
      return `<article class="user-invoice-order-row"><div class="user-invoice-order-main"><div><strong>${safe(order.id, "订单")}</strong><span>${orderName} / ${amount}</span><span>${safe(order.vehicle || order.car || order.model, "宝马 G20 330i")} / ${safe(order.status || order.payment, "已支付")}</span></div><div class="user-invoice-order-side">${tag(hasInvoice ? "有发票" : "无发票")}${hasInvoice ? `<span>${safe(invoice.id, "发票")} / ${safe(invoice.status, "待开票")}</span>` : `<button class="user-invoice-apply-btn" type="button" data-user-action="user-invoice-apply" data-user-id="${safe(order.id, "")}">申请发票</button>`}</div></div>${selectedOrder && safe(selectedOrder.id, "") === safe(order.id, "") && !hasInvoice ? renderInlineInvoiceForm(order) : ""}</article>`;
    }).join("") || `<article><div><strong>暂无可用订单</strong><span>已支付或已完成订单会出现在这里。</span></div></article>`}</div></section><section class="user-me-white-block"><div class="user-me-block-head"><strong>发票记录</strong><span>${invoiceRows.length} 条</span></div><div class="user-me-record-list light">${invoiceRows.map((item) => renderInvoiceRecordRow(item)).join("") || `<article><div><strong>暂无发票记录</strong><span>无发票订单申请后会保存在这里。</span></div></article>`}</div></section></div>`;
  }

  function renderUserForumCreateForm() {
    const boardOptions = (forumBoards || []).filter((b) => b.status === "启用").map((b) => `<option value="${b.id}">${b.name}</option>`).join("");
    return `<form class="topic-create-form" data-user-forum-form style="margin:0 16px 16px;"><div class="field-group"><label class="field-label" for="forum-title">帖子标题</label><input class="input" id="forum-title" name="forumTitle" type="text" placeholder="输入帖子标题" required></div><div class="field-group"><label class="field-label" for="forum-board">发布版面</label><select class="input" id="forum-board" name="forumBoard" required><option value="" disabled selected>请选择发布版面</option>${boardOptions || '<option value="" disabled>暂无可用版面</option>'}</select></div><div class="field-group"><label class="field-label">帖子内容</label><div class="rich-editor-shell"><div class="rich-editor-toolbar"><button type="button" data-rich-cmd="bold" title="加粗"><b>B</b></button><button type="button" data-rich-cmd="italic" title="斜体"><i>I</i></button><button type="button" data-rich-cmd="underline" title="下划线"><u>U</u></button><button type="button" data-rich-cmd="formatBlock" data-rich-val="H2" title="小标题">H2</button><button type="button" data-rich-cmd="formatBlock" data-rich-val="BLOCKQUOTE" title="引用">“</button><button type="button" data-rich-cmd="createLink" title="插入链接">🔗</button><button type="button" data-rich-cmd="insertHorizontalRule" title="分隔线">—</button></div><div class="rich-editor-area" id="forumRichEditor" contenteditable="true" data-placeholder="分享你的改装心得..."></div><input type="hidden" name="forumContent" id="forumContentHidden" /></div></div><div class="field-group"><label class="field-label" for="forum-tags">标签</label><input class="input" id="forum-tags" name="forumTags" type="text" placeholder="#轮毂 #排气 #车衣，多个标签用空格分隔"></div><div class="field-group"><label class="field-label" for="forum-media">上传图片或视频</label><label class="upload-panel" for="forum-media"><input id="forum-media" class="upload-input" name="forumMedia" type="file" accept="image/*,video/*" multiple><span class="upload-illustration"></span><strong>上传帖子素材</strong><small>支持上传图片或短视频，最多选择 9 个文件</small></label></div><div class="topic-create-actions"><button class="btn btn-secondary" type="button" data-user-action="user-forum-cancel">取消</button><button class="btn btn-primary" type="submit">发布帖子</button></div></form>`;
  }

  function isUserOwnComment(comment) {
    const profile = getMockUserAuth() || {};
    const author = safe(comment.author, "");
    return comment.owner === "current" || author === "当前用户" || author === safe(profile.nickname, "");
  }

  function renderUserForumEditForm(item) {
    return `<form class="provider-complete-form" data-user-forum-edit-form data-user-id="${item.id}"><div class="field-group field-group-full"><label class="field-label" for="forum-edit-title-${item.id}">标题</label><input class="input" id="forum-edit-title-${item.id}" name="forumEditTitle" type="text" value="${safe(item.title, "")}" required></div><div class="field-group field-group-full"><label class="field-label" for="forum-edit-content-${item.id}">正文</label><textarea class="textarea" id="forum-edit-content-${item.id}" name="forumEditContent" rows="6" required>${safe(item.content || item.preview || "", "")}</textarea></div><div class="admin-action-row"><button class="btn btn-primary" type="submit">保存修改</button><button class="btn btn-secondary" type="button" data-user-action="user-forum-edit-cancel" data-user-id="${item.id}">取消</button></div></form>`;
  }

  function renderUserForumDetail(item) {
    const replyOpen = state.userForum.replyPostId === item.id;
    const editing = state.userForum.editingPostId === item.id;
    const related = comments.filter((comment) => comment.post === item.id && nForum(comment.status) !== "已删除");
    const mine = safe(item.author, "") === "当前用户";
    if (editing) {
      return `<section class="admin-detail-card"><div class="eyebrow">Edit Post</div><h3>编辑帖子</h3>${renderUserForumEditForm(item)}</section>`;
    }
    const boardName = (forumBoards || []).find((b) => b.id === item.board)?.name || "-";
    return `<section class="admin-detail-card"><div style="display:flex; align-items:center; gap:10px; margin-bottom:10px;"><button class="btn btn-secondary btn-sm" type="button" data-user-action="user-forum-back" style="padding:6px 12px;">‹ 返回列表</button><div class="eyebrow">Forum Detail</div></div><h3>${safe(item.title, "帖子详情")}</h3><div class="admin-kv-list"><div><span>作者</span><strong>${safe(item.author, "-")}</strong></div><div><span>版面</span><strong>${safe(boardName, "-")}</strong></div><div><span>发布时间</span><strong>${safe(item.time, "-")}</strong></div><div><span>互动数据</span><strong>回复 ${item.replies || 0} / 点赞 ${item.likes || 0}</strong></div><div><span>状态</span><strong>${nForum(item.status)}</strong></div></div>${item.content ? `<div class="rich-editor-area" style="margin:12px 0; padding:12px 14px; border:1px solid rgba(255,255,255,0.06); border-radius:12px; background:rgba(255,255,255,0.02);">${item.content}</div>` : ""}<div class="admin-comment-block"><strong>评论区</strong><div class="admin-comment-list">${related.length ? related.map((comment) => `<div class="admin-comment-item"><div class="admin-comment-head"><strong>${safe(comment.author, "评论用户")}</strong><span class="muted">${safe(comment.time, "刚刚")}</span>${isUserOwnComment(comment) ? `<button class="btn btn-danger btn-sm user-comment-delete-btn" type="button" data-user-action="user-forum-comment-delete" data-user-id="${comment.id}">删除</button>` : ""}</div><p>${safe(comment.content, "评论内容")}</p></div>`).join("") : `<div class="muted">当前暂无评论</div>`}</div></div><div class="admin-action-row forum-action-bar"><button class="btn btn-primary" type="button" data-user-action="user-forum-like" data-user-id="${item.id}">点赞</button><button class="btn btn-secondary" type="button" data-user-action="${replyOpen ? "user-forum-reply-cancel" : "user-forum-reply"}" data-user-id="${item.id}">${replyOpen ? "取消回复" : "回复"}</button>${mine ? `<button class="btn btn-secondary" type="button" data-user-action="user-forum-edit" data-user-id="${item.id}">编辑</button><button class="btn btn-danger" type="button" data-user-action="user-forum-delete" data-user-id="${item.id}">删除</button>` : ""}<button class="btn btn-secondary" type="button" data-user-action="user-share-sheet-open" data-user-id="${item.id}" data-user-type="forum">分享</button></div>${replyOpen ? renderUserForumReplyForm(item) : ""}</section>`;
  }

  function renderUserForumReplyForm(item) {
    return `<form class="provider-complete-form" data-user-forum-reply-form data-user-id="${item.id}"><div class="field-group"><label class="field-label" for="forum-reply-${item.id}">回复内容</label><textarea class="textarea" id="forum-reply-${item.id}" name="forumReply" required>这个搭配很顺眼，建议再试试更贴合街道使用场景的胎壁比例。</textarea></div><div class="admin-action-row"><button class="btn btn-primary" type="submit">提交回复</button><button class="btn btn-secondary" type="button" data-user-action="user-forum-reply-cancel" data-user-id="${item.id}">取消</button></div></form>`;
  }

  function renderUserMallDetail(item, active) {
    const itemId = active === "goods" ? item.sku : item.id || item.name;
    const orderOpen = state.userOrderForm.type === active && state.userOrderForm.id === itemId;
    const standardHtml = active === "goods" ? renderProductStandardFacts(item) : "";
    const priceHtml = active === "goods" && item.originalPrice
      ? `<div><span>价格</span><strong>${safe(item.price, "-")} <span style="text-decoration:line-through; color:var(--text-muted); font-size:12px; font-weight:400;">${safe(item.originalPrice, "")}</span></strong></div>${standardHtml}`
      : `<div><span>价格</span><strong>${safe(item.price, "-")}</strong></div>${standardHtml}`;
    const promoHtml = active === "goods" && item.promotion
      ? `<div style="margin-top:8px; padding:8px 12px; border-radius:10px; background:rgba(255,106,0,0.08); border:1px solid rgba(255,106,0,0.15);"><strong style="font-size:13px; color:#ff6a00;">${safe(item.promotion.label, "")} · ${safe(item.promotion.discount, "")}</strong><div style="font-size:12px; color:var(--text-muted); margin-top:2px;">${safe(item.promotion.desc, "")}</div></div>`
      : "";
    return `<section class="admin-detail-card"><div class="eyebrow">${active === "goods" ? "Mall Goods" : "Service Booking"}</div><h3>${safe(item.name, active === "goods" ? "商品详情" : "服务详情")}</h3><div class="admin-kv-list">${active === "goods" ? `<div><span>品牌</span><strong>${safe(item.brand, "-")}</strong></div><div><span>适配车型</span><strong>${safe(item.fitment || item.model, "-")}</strong></div>${priceHtml}<div><span>状态</span><strong>${nProduct(item.status)}</strong></div>` : `<div><span>服务名称</span><strong>${safe(item.name, "-")}</strong></div><div><span>服务说明</span><strong>${safe(item.desc, "-")}</strong></div><div><span>价格参考</span><strong>${safe(item.price, "-")}</strong></div><div><span>预约方式</span><strong>${safe(item.duration, "支持到店预约")}</strong></div>`}</div>${promoHtml}<div class="admin-action-row">${active === "goods" ? `<a class="btn btn-primary" href="${buildUserGoodsOrderLink(item)}">立即下单</a>` : `<button class="btn btn-primary" type="button" data-user-action="${orderOpen ? "user-order-cancel" : "user-order-open"}" data-user-id="${itemId}" data-user-type="${active}">${orderOpen ? "收起下单表单" : "立即下单"}</button>`}<button class="btn btn-secondary" type="button" data-user-action="user-share-sheet-open" data-user-id="${itemId}" data-user-type="mall">分享</button></div>${active !== "goods" && orderOpen ? renderUserOrderForm(item, active) : ""}</section>`;
  }

  function getUserVehicleKey(item) {
    return item.id || item.plate || item.model;
  }

  function getSelectedUserVehicle() {
    return vehicles.find((item) => getUserVehicleKey(item) === state.userGarage.selectedVehicle) || vehicles[0];
  }

  function renderUserGarageVehicles(selectedVehicle) {
    const historyEntries = getVehicleHistoryEntries(selectedVehicle);
    const providerEntries = getVehicleIntentProviders(selectedVehicle);
    return `<div class="stack"><div class="admin-action-row"><button class="btn btn-primary" type="button" data-user-action="${state.userGarage.createOpen ? "user-vehicle-cancel" : "user-vehicle-add"}">${state.userGarage.createOpen ? "收起新增车辆" : "新增车辆"}</button></div>${state.userGarage.createOpen ? renderUserVehicleForm() : ""}<section class="admin-detail-card"><div class="eyebrow">Vehicle Profile</div><h3>${safe(selectedVehicle?.model, "未绑定车辆")}</h3><div class="field-group" style="margin-top:14px;"><label class="field-label" for="garage-vehicle-switch">切换爱车</label><select class="input" id="garage-vehicle-switch" data-user-action="user-vehicle-select">${vehicles.map((item) => `<option value="${getUserVehicleKey(item)}" ${getUserVehicleKey(item) === getUserVehicleKey(selectedVehicle) ? "selected" : ""}>${safe(item.model, "车辆")} / ${safe(item.plate, "-")}</option>`).join("")}</select></div><div style="min-height:200px; border-radius:22px; margin-top:12px; background:linear-gradient(160deg, rgba(14,18,24,0.14), rgba(14,18,24,0.84)), radial-gradient(circle at 22% 24%, rgba(255,106,0,0.26), transparent 26%), linear-gradient(135deg, #1a2028, #414a56);"></div><div class="admin-kv-list" style="margin-top:14px;"><div><span>车牌</span><strong>${safe(selectedVehicle?.plate, "-")}</strong></div><div><span>车主</span><strong>${safe(selectedVehicle?.owner, "-")}</strong></div><div><span>意向服务商</span><strong>${providerEntries.join(" / ") || "暂无历史服务商"}</strong></div></div><div class="admin-comment-block"><strong>改装历史</strong><div class="admin-comment-list">${historyEntries.map((entry) => `<div class="admin-comment-item"><p>${entry}</p></div>`).join("")}</div></div><div class="mobile-grid-2" style="margin-top:14px;"><button class="mobile-item" type="button" data-user-action="user-garage-exterior"><div class="eyebrow">Exterior</div><strong>车身套件</strong><div class="muted" style="margin-top:8px;">外观改装</div></button><button class="mobile-item" type="button" data-user-action="user-garage-wheel"><div class="eyebrow">Wheel</div><strong>轮毂</strong><div class="muted" style="margin-top:8px;">轻量化轮组升级</div></button><button class="mobile-item" type="button" data-user-action="user-garage-exhaust"><div class="eyebrow">Exhaust</div><strong>排气</strong><div class="muted" style="margin-top:8px;">声浪与流量优化</div></button><button class="mobile-item" type="button" data-user-action="user-garage-interior"><div class="eyebrow">Interior</div><strong>内饰定制</strong><div class="muted" style="margin-top:8px;">座舱氛围与材质升级</div></button></div></section></div>`;
  }

  function renderUserVehicleForm() {
    const modelOptions = ["保时捷 718 Cayman", "宝马 M4 Coupe", "奔驰 AMG C63", "奥迪 RS5 Sportback", "日产 GT-R R35"];
    return `<form class="provider-complete-form" data-user-vehicle-form><div class="form-grid"><div class="field-group"><label class="field-label" for="garage-model-new">车辆型号</label><select class="input" id="garage-model-new" name="garageModel" required>${modelOptions.map((item, index) => `<option value="${item}" ${index === 0 ? "selected" : ""}>${item}</option>`).join("")}</select></div><div class="field-group"><label class="field-label" for="garage-plate-new">车牌号</label><input class="input" id="garage-plate-new" name="garagePlate" type="text" value="沪A 718CM" placeholder="请输入车牌号" required></div><div class="field-group"><label class="field-label" for="garage-image-new">车辆图片</label><label class="upload-panel" for="garage-image-new"><input id="garage-image-new" class="upload-input" name="garageImage" type="file" accept="image/*"><span class="upload-illustration"></span><strong>上传车辆图片</strong><small>支持上传 1 张车辆外观图，用于爱车档案封面展示</small></label></div><div class="field-group"><label class="field-label" for="garage-owner-new">车主</label><input class="input" id="garage-owner-new" name="garageOwner" type="text" value="当前用户" required></div></div><div class="admin-timeline"><div>保存后会自动建立车辆档案，后续订单和施工记录会沉淀到这辆车名下。</div></div><div class="admin-action-row"><button class="btn btn-primary" type="submit">保存车辆</button><button class="btn btn-secondary" type="button" data-user-action="user-vehicle-cancel">取消</button></div></form>`;
  }

  function renderUserGarageVehicles(selectedVehicle) {
    const historyEntries = getVehicleHistoryEntries(selectedVehicle);
    const plateText = safe(selectedVehicle?.plate, "-");
    const codeSeed = plateText.replace(/[^A-Za-z0-9]/g, "").toUpperCase() || "G20330I";
    const vehicleVin = safe(selectedVehicle?.vin, `LSV${codeSeed.padEnd(8, "0").slice(0, 8)}${String((selectedVehicle?.model || "330I").replace(/[^A-Za-z0-9]/g, "")).toUpperCase().padEnd(9, "X").slice(0, 9)}`);
    const engineNo = safe(selectedVehicle?.engineNo, `ENG${codeSeed.padEnd(8, "0").slice(-8)}`);
    const registerDate = safe(selectedVehicle?.registerDate, "2023-05-18");
    return `<div class="stack"><div class="admin-action-row user-garage-toolbar"><div class="user-garage-switch-field"><span class="user-garage-switch-label">切换爱车</span><select class="input" id="garage-vehicle-switch" data-user-action="user-vehicle-select">${vehicles.map((item) => `<option value="${getUserVehicleKey(item)}" ${getUserVehicleKey(item) === getUserVehicleKey(selectedVehicle) ? "selected" : ""}>${safe(item.model, "车辆")} / ${safe(item.plate, "-")}</option>`).join("")}</select></div><button class="btn btn-primary user-garage-add-btn" type="button" data-user-action="${state.userGarage.createOpen ? "user-vehicle-cancel" : "user-vehicle-add"}">${state.userGarage.createOpen ? "收起新增" : "新增车辆"}</button></div>${state.userGarage.createOpen ? renderUserVehicleForm() : ""}<section class="admin-detail-card"><div class="eyebrow">Vehicle Profile</div><h3>${safe(selectedVehicle?.model, "未绑定车辆")}</h3><div style="min-height:200px; border-radius:22px; margin-top:12px; background:linear-gradient(160deg, rgba(14,18,24,0.14), rgba(14,18,24,0.84)), radial-gradient(circle at 22% 24%, rgba(255,106,0,0.26), transparent 26%), linear-gradient(135deg, #1a2028, #414a56);"></div><div class="admin-kv-list" style="margin-top:14px;"><div><span>车牌号</span><strong>${plateText}</strong></div><div><span>车辆识别代码</span><strong>${vehicleVin}</strong></div><div><span>发动机号码</span><strong>${engineNo}</strong></div><div><span>注册日期</span><strong>${registerDate}</strong></div></div><div class="admin-comment-block"><strong>改装历史</strong><div class="admin-comment-list">${historyEntries.map((entry) => `<div class="admin-comment-item"><p>${entry}</p></div>`).join("")}</div></div></section></div>`;
  }

  function renderUserMallCategoryPage() {
    return renderUserMallHome();
  }

  function renderUserVehicleDetail(item) {
    return `<section class="admin-detail-card"><div class="eyebrow">Vehicle Profile</div><h3>${safe(item.model, "车辆详情")}</h3><div class="admin-kv-list"><div><span>车型</span><strong>${safe(item.model, "-")}</strong></div><div><span>车牌</span><strong>${safe(item.plate, "-")}</strong></div><div><span>车主</span><strong>${safe(item.owner, "-")}</strong></div><div><span>当前状态</span><strong>已绑定</strong></div></div><div class="admin-action-row"><button class="btn btn-danger" type="button" data-user-action="user-vehicle-delete" data-user-id="${getUserVehicleKey(item)}">删除车辆</button></div><div class="admin-comment-block"><strong>改装历史记录</strong><div class="admin-comment-list">${String(item.history || "暂无改装记录").split(/[；;。]/).filter(Boolean).map((entry) => `<div class="admin-comment-item"><p>${entry.trim()}</p></div>`).join("") || `<div class="muted">暂无改装历史记录</div>`}</div></div></section>`;
  }

  function renderUserGarageRender(selectedVehicle) {
    const { materials } = window.MockData;
    const vehicleColors = (materials?.vehicles || []).flatMap((v) => (v.colors || []).map((c) => ({ vehicleId: v.vehicleId || `${v.brand}-${v.series || ""}-${v.model}`, colorName: c.name, colorValue: c.value })));
    const wheelStyles = (materials?.wheels || []).map((w) => ({ name: w.name, brand: w.brand, size: w.size, color: w.wheelColor || w.color, price: w.price, vehicles: w.vehicles || [] }));
    const currentVehicle = selectedVehicle?.model || "宝马 G20 330i";
    const matchedColors = vehicleColors.filter((v) => currentVehicle.includes(v.vehicleId?.split("-")[0])) || fallback.colors;
    const matchedWheels = wheelStyles.filter((w) => w.vehicles?.some((v) => currentVehicle.includes(v.split("-")[0]))) || fallback.wheels;
    const styleTags = ["黑武士街道风", "赛道性能风", "豪华夜幕风", "低趴姿态风", "原厂升级风"];
    const relatedProducts = products.slice(0, 3);
    return `<section class="garage-preview"><div class="eyebrow">Render Lab</div><strong style="display:block; margin-top:10px; font-size:22px;">${safe(selectedVehicle?.model, "宝马 G20 330i")} 外观预览</strong><div class="muted" style="margin-top:6px;">选择车身颜色与轮毂样式，预览改装效果，下方推荐可直接下单。</div><div class="garage-3d-stage"><div class="garage-3d-car" id="garage3dCar"><div class="garage-3d-wheel left"></div><div class="garage-3d-wheel right"></div><div class="garage-3d-body"></div></div></div><div class="garage-style-tags">${styleTags.map((s) => `<span class="garage-style-tag">${s}</span>`).join("")}</div><div class="swatch-row">${matchedColors.map((i, idx) => `<button class="swatch ${idx === state.garageColor ? "active" : ""}" style="background:${i.colorValue || i.value};" type="button" title="${i.colorName || i.name}" data-color-index="${idx}"></button>`).join("")}</div></section><section class="mobile-list garage-wheel-list">${matchedWheels.map((i, idx) => `<button class="wheel-option ${idx === state.garageWheel ? "active" : ""}" type="button" data-wheel-index="${idx}"><span><strong>${i.name}</strong><div class="muted" style="margin-top:6px;">${i.size || i.spokes + " 辐设计"} / ${i.brand || "高端改装"} / ${i.price || ""}</div></span><span class="wheel-badge" data-tone="${idx === 0 ? "gold" : idx === 1 ? "grey" : "silver"}"></span></button>`).join("")}</section><section class="garage-related-section"><div class="eyebrow">Recommended</div><h3 style="margin:10px 0 14px;">适配推荐</h3><div class="garage-related-grid">${relatedProducts.map((item) => `<a class="garage-related-card" href="user-product-detail.html?sku=${encodeURIComponent(item.sku || "")}&name=${encodeURIComponent(safe(item.name, "商品"))}&price=${encodeURIComponent(safe(item.price, "¥0"))}&brand=${encodeURIComponent(safe(item.brand, "-"))}&fitment=${encodeURIComponent(safe(item.fitment, "适配当前车型"))}&mallPage=exterior"><div class="garage-related-media" data-tone="${(item.sku || "").length % 4 + 1}"></div><strong>${safe(item.name, "商品")}</strong><div class="muted" style="margin-top:6px; font-size:12px;">${safe(item.brand, "-")}</div><div class="garage-related-price">${safe(item.price, "-")}</div></a>`).join("")}</div></section>`;
  }

  function renderUserGarageActions() {
    return `<section class="mobile-grid-2" style="margin-top:14px;"><button class="mobile-item" type="button" data-user-action="user-garage-exterior"><div class="eyebrow">Exterior</div><strong>车身套件</strong><div class="muted" style="margin-top:8px;">外观改装</div></button><button class="mobile-item" type="button" data-user-action="user-garage-wheel"><div class="eyebrow">Wheel</div><strong>轮毂</strong><div class="muted" style="margin-top:8px;">轻量化轮组升级</div></button><button class="mobile-item" type="button" data-user-action="user-garage-exhaust"><div class="eyebrow">Exhaust</div><strong>排气</strong><div class="muted" style="margin-top:8px;">声浪与流量优化</div></button><button class="mobile-item" type="button" data-user-action="user-garage-interior"><div class="eyebrow">Interior</div><strong>内饰定制</strong><div class="muted" style="margin-top:8px;">座舱氛围与材质升级</div></button></section>`;
  }

  function renderUserOrderForm(item, active) {
    const itemId = active === "goods" ? item.sku : item.id || item.name;
    return `<form class="provider-complete-form" data-user-order-form data-user-type="${active}" data-user-id="${itemId}"><div class="form-grid"><div class="field-group"><label class="field-label" for="user-vehicle-${itemId}">车辆信息</label><input class="input" id="user-vehicle-${itemId}" name="userVehicle" type="text" value="${getSelectedUserVehicle()?.model || "宝马 G20 330i"}" required></div><div class="field-group"><label class="field-label" for="user-phone-${itemId}">联系电话</label><input class="input" id="user-phone-${itemId}" name="userPhone" type="text" value="13800138000" required></div>${active === "goods" ? `<div class="field-group field-group-full"><label class="field-label" for="user-address-${itemId}">收货地址</label><textarea class="textarea" id="user-address-${itemId}" name="userAddress" required>${getUserDefaultAddress()}</textarea></div>` : `<div class="field-group"><label class="field-label" for="user-time-${itemId}">预约安装时间</label><input class="input" id="user-time-${itemId}" name="userTime" type="text" value="2026-04-03 14:30" required></div>`}<div class="field-group"><label class="field-label" for="user-qty-${itemId}">${active === "goods" ? "数量" : "服务数量"}</label><input class="input" id="user-qty-${itemId}" name="userQuantity" type="number" min="1" max="9" value="1" required></div><div class="field-group"><label class="field-label" for="user-note-${itemId}">备注</label><textarea class="textarea" id="user-note-${itemId}" name="userNote" required>${active === "goods" ? "发货后请按物流信息签收快递。" : "请优先安排周末到店。"} </textarea></div></div><div class="admin-action-row"><button class="btn btn-primary" type="submit">提交订单</button><button class="btn btn-secondary" type="button" data-user-action="user-order-cancel" data-user-id="${itemId}" data-user-type="${active}">取消</button></div></form>`;
  }

  function handleUserAction(button) {
    const action = button.dataset.userAction;
    const id = button.dataset.userId || "";
    const type = button.dataset.userType || "";
    if (action === "user-logout") {
      if (typeof window !== "undefined" && window.localStorage) window.localStorage.removeItem(AUTH_STORAGE_KEY);
      state.userFeedback = "";
      state.userAuthFeedback = "已退出登录。";
      render();
      return;
    }
    if (action === "user-profile-detail") {
      state.tab = "me";
      state.subTab.me = "profileDetail";
      state.userFeedback = "";
      render();
      return;
    }
    if (action === "user-collection-remove") {
      setUserCollections(getUserCollections().filter((item) => safe(item.sku, "") !== id));
      state.userFeedback = "收藏商品已移除。";
      render();
      return;
    }
    if (action === "user-invoice-apply") {
      state.userMe.invoiceOrderId = id;
      state.userFeedback = "";
      render();
      return;
    }
    if (action === "user-invoice-cancel") {
      state.userMe.invoiceOrderId = "";
      state.userFeedback = "";
      render();
      return;
    }
    if (action === "user-invoice-view") {
      const invoice = getUserInvoices().find((item) => safe(item.id, "") === id);
      if (invoice) {
        state.userDialog = { type: "invoice-view", invoiceId: id };
      }
      state.userFeedback = "";
      render();
      return;
    }
    if (action === "user-invoice-download") {
      const invoice = getUserInvoices().find((item) => safe(item.id, "") === id);
      if (invoice?.attachmentName) {
        const blob = new Blob([`发票编号：${invoice.id}\n订单号：${invoice.orderId}\n类型：${invoice.type}\n金额：${invoice.amount}\n状态：${invoice.status}\n开具时间：${invoice.deliveredAt || invoice.time || "-"}`], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = invoice.attachmentName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        state.userFeedback = `${safe(invoice.attachmentName, "发票")} 已下载到本地。`;
      } else {
        state.userFeedback = "发票附件暂未生成。";
      }
      render();
      return;
    }
    if (action === "user-invoice-share") {
      const invoice = getUserInvoices().find((item) => safe(item.id, "") === id);
      if (invoice) {
        const shareText = `我在满改平台开具了电子发票\n发票编号：${invoice.id}\n订单号：${invoice.orderId}\n金额：${invoice.amount}\n类型：${invoice.type}`;
        if (navigator.share) {
          navigator.share({ title: "电子发票", text: shareText }).catch(() => {});
        } else if (navigator.clipboard) {
          navigator.clipboard.writeText(shareText).catch(() => {});
        }
        state.userFeedback = `发票 ${invoice.id} 已生成分享内容，可粘贴到微信发送。`;
      } else {
        state.userFeedback = "发票信息未找到。";
      }
      render();
      return;
    }
    if (action === "user-vehicle-add") {
      state.userGarage.createOpen = true;
      state.userFeedback = "";
      state.userDialog = { type: "vehicle-create", orderId: "", sourceName: "", rating: 0 };
      render();
      return;
    }
    if (action === "user-vehicle-cancel") {
      state.userGarage.createOpen = false;
      state.userDialog = { type: "", orderId: "", sourceName: "", rating: 0 };
      render();
      return;
    }
    if (action === "user-vehicle-select") {
      state.userGarage.selectedVehicle = button.value;
      state.userGarage.detailOpen = false;
      render();
      return;
    }
    if (action === "user-garage-detail-toggle") {
      state.userGarage.detailOpen = !state.userGarage.detailOpen;
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
    if (action === "user-mall-back") {
      state.userMallPage = "";
      render();
      return;
    }
    if (action === "user-mall-category") {
      state.userMallPage = id === "all" ? "" : id;
      render();
      return;
    }
    if (action === "user-mall-reset") {
      state.userMallPage = "";
      state.userMall.keyword = "";
      state.userMall.brand = "全部品牌";
      state.userMall.model = "全部车型";
      render();
      return;
    }
    if (action === "user-cart-remove") {
      const nextRows = getUserCartItems().filter((item) => safe(item.variantSku || item.sku, "") !== id);
      setUserCartItems(nextRows);
      state.userFeedback = "商品已从购物车移除。";
      render();
      return;
    }
    if (action === "user-cart-clear") {
      setUserCartItems([]);
      state.userFeedback = "购物车已清空。";
      render();
      return;
    }
    if (action === "user-cart-order") {
      const target = getUserCartItems().find((item) => safe(item.variantSku || item.sku, "") === id);
      if (!target) return;
      window.location.href = `${buildUserGoodsOrderLink(target, Number(target.quantity || 1))}&from=cart`;
      return;
    }
    if (action === "user-coupon-filter") {
      state.userMe.couponFilter = id;
      state.userFeedback = "";
      render();
      return;
    }
    if (action === "user-points-checkin") {
      if (hasUserCheckedInToday()) {
        state.userFeedback = "今日已签到，明天再来继续获得积分。";
      } else {
        const row = appendUserPointRow({
          type: "checkin",
          title: "每日签到",
          points: 10,
          source: "我的页面",
          sourceId: getDateKey(),
          desc: "每日签到获得 10 积分。",
        });
        state.userFeedback = row ? "签到成功，获得 10 积分。" : "今日已签到，明天再来继续获得积分。";
      }
      render();
      return;
    }
    if (action === "user-credit-apply") {
      state.userMe.creditApplyOpen = true;
      render();
      return;
    }
    if (action === "user-credit-cancel") {
      state.userMe.creditApplyOpen = false;
      render();
      return;
    }
    if (action === "user-home-orders") {
      state.tab = "me";
      state.subTab.me = "orders";
      render();
      return;
    }
    if (action === "user-home-order-detail") {
      state.tab = "me";
      state.subTab.me = "orders";
      state.userMe.selectedOrder = id;
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
      if (type === "goods") {
        const target = products.find((item) => item.sku === id);
        if (!target) return;
        window.location.href = buildUserGoodsOrderLink(target);
        return;
      }
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
    if (action === "user-order-contact") {
      state.tab = "me";
      state.subTab.me = "messages";
      state.userMe.selectedMessage = fallback.providerMessages.find((item) => item.id === "msg-2")?.id || fallback.providerMessages[0]?.id || "";
      render();
      return;
    }
    if (action === "user-order-acceptance") {
      const target = getUserOrderById(id);
      if (!target) return;
      state.userDialog = { type: "order-acceptance", orderId: id, sourceName: safe(target.service, "服务订单"), rating: Number(target.rating || 0) };
      render();
      return;
    }
    if (action === "user-order-cancel") {
      state.userOrderForm = { type: "", id: "" };
      render();
      return;
    }
    if (action === "user-after-sale-open") {
      state.userMe.afterSaleOrderId = id;
      render();
      return;
    }
    if (action === "user-after-sale-cancel") {
      state.userMe.afterSaleOrderId = "";
      render();
      return;
    }
    if (action === "user-review-open") {
      state.userMe.reviewOrderId = id;
      state.userMe.afterSaleOrderId = "";
      render();
      return;
    }
    if (action === "user-review-cancel") {
      state.userMe.reviewOrderId = "";
      render();
      return;
    }
    if (action === "user-message-pick") {
      state.userMe.selectedMessage = id;
      render();
      return;
    }
    if (action === "user-message-back") {
      state.userMe.selectedMessage = "";
      render();
      return;
    }
    if (action === "user-wechat-bind") {
      const mockWxNames = ["满改车友_330i", "性能控_A4L", "碳纤控", "赛道日玩家", "改装小白", "姿态党", "JDM信仰", "德系性能控"];
      const mockWxName = mockWxNames[Math.floor(Math.random() * mockWxNames.length)];
      state.wechatBindInfo = { openid: `wx_${Date.now().toString(36)}`, nickname: mockWxName, avatar: "", bindAt: getNowStamp() };
      render();
      return;
    }
    if (action === "user-wechat-unbind") {
      state.wechatBindInfo = null;
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
    if (action === "user-forum-back") {
      state.userForum.selectedPost = "";
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
    if (action === "user-forum-comment-delete") {
      const target = comments.find((item) => item.id === id);
      if (!target || !isUserOwnComment(target)) return;
      target.status = "已删除";
      const post = posts.find((item) => item.id === target.post);
      if (post) post.replies = Math.max(0, Number(post.replies || 0) - 1);
      state.userFeedback = "评论已删除。";
      render();
      return;
    }
    if (action === "user-forum-edit") {
      state.userForum.editingPostId = id;
      state.userForum.replyPostId = "";
      state.userFeedback = "";
      render();
      return;
    }
    if (action === "user-forum-edit-cancel") {
      state.userForum.editingPostId = "";
      state.userFeedback = "";
      render();
      return;
    }
    if (action === "user-forum-delete") {
      const target = posts.find((item) => item.id === id);
      if (!target) return;
      target.status = "已删除";
      state.userFeedback = `${safe(target.title, "帖子")} 已删除。`;
      state.userForum.replyPostId = "";
      state.userForum.editingPostId = "";
      render();
      return;
    }
    function doShare(channel) {
      const shareType = state.userShareSheet.type || type || "forum";
      const shareId = state.userShareSheet.id || id;
      let shareTitle = "";
      let shareLink = "";
      if (shareType === "forum") {
        const target = posts.find((item) => item.id === shareId);
        shareTitle = target ? safe(target.title, "帖子") : "精选帖子";
        shareLink = `${window.location.origin}${window.location.pathname}?tab=forum&openPost=${shareId}`;
      } else {
        const target = products.find((item) => item.sku === shareId);
        shareTitle = target ? safe(target.name, "商品") : "精选商品";
        shareLink = `${window.location.origin}/pages/user-product-detail.html?sku=${encodeURIComponent(shareId)}`;
      }
      if (typeof navigator !== "undefined" && navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(`${shareTitle} — ${shareLink}`).catch(() => {});
      }
      const channelText = { wechat: "微信", moments: "朋友圈", douyin: "抖音", copy: "", platform: "" };
      if (channel === "platform") {
        state.userFeedback = `「${shareTitle}」已推荐给平台用户。`;
      } else if (channel === "copy") {
        state.userFeedback = `「${shareTitle}」链接已复制到剪贴板。`;
      } else {
        state.userFeedback = `「${shareTitle}」链接已复制，快去${channelText[channel] || "微信"}粘贴分享吧。`;
      }
      state.userShareSheet.open = false;
      render();
    }
    if (action === "user-share-sheet-open") {
      state.userShareSheet = { open: true, id, type: type || "forum" };
      render();
      return;
    }
    if (action === "user-share-sheet-close") {
      state.userShareSheet.open = false;
      render();
      return;
    }
    if (action === "user-share-wechat") { doShare("wechat"); return; }
    if (action === "user-share-moments") { doShare("moments"); return; }
    if (action === "user-share-douyin") { doShare("douyin"); return; }
    if (action === "user-share-copy") { doShare("copy"); return; }
    if (action === "user-share-platform") { doShare("platform"); return; }
    if (action === "user-forum-category") {
      state.userForum.category = id;
      render();
      return;
    }
    if (action === "user-forum-filter") {
      state.userForum.filter = id;
      render();
      return;
    }
    if (action === "user-mall-collect") {
      const collections = getUserCollections();
      const target = products.find((item) => item.sku === id);
      if (!target) return;
      const exists = collections.find((c) => c.sku === id);
      if (exists) {
        setUserCollections(collections.filter((item) => safe(item.sku, "") !== id));
        state.userFeedback = `${safe(target.name, "商品")} 已取消收藏。`;
      } else {
        collections.push({
          sku: target.sku,
          name: target.name,
          price: target.price,
          brand: target.brand,
          fitment: target.fitment,
          mallPage: resolveUserMallPageByCategory(target.category),
          status: target.status || "上架",
          collectedAt: new Date().toISOString(),
        });
        setUserCollections(collections);
        state.userFeedback = `${safe(target.name, "商品")} 已加入收藏。`;
      }
      render();
      return;
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
    vehicles.unshift({ id, model, plate, owner, color: "珍珠白", history: "2026-04 已创建车辆档案并绑定当前账号 / 2026-04 已录入基础车况与交付照片 / 待补充首次改装项目与施工记录", location: getGarageLocationSummary() });
    state.userGarage.selectedVehicle = id;
    state.userGarage.createOpen = false;
    state.userDialog = { type: "", orderId: "", sourceName: "" };
    state.userFeedback = `${model} 已添加到爱车列表。`;
    render();
  }

  function handleUserMallSearchSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    state.userMall.keyword = String(formData.get("userMallKeyword") || "").trim();
    render();
  }

  function updateGarageChoice(type, index) {
    const scrollTarget = screenEl.querySelector(".screen-content") || screenEl;
    const scrollTop = scrollTarget.scrollTop;
    if (type === "color") state.garageColor = state.garageColor === index ? -1 : index;
    if (type === "wheel") state.garageWheel = state.garageWheel === index ? -1 : index;
    if (type === "film") state.garageFilm = state.garageFilm === index ? -1 : index;
    render();
    requestAnimationFrame(() => {
      const nextScrollTarget = screenEl.querySelector(".screen-content") || screenEl;
      nextScrollTarget.scrollTop = scrollTop;
    });
  }

  function handleUserMallFilterChange(select) {
    const type = select.dataset.userMallFilter || "";
    if (type === "brand") {
      state.userMall.brand = select.value;
      const nextModels = getUserMallModelOptions(state.userMall.brand);
      state.userMall.model = nextModels.includes(state.userMall.model) ? state.userMall.model : nextModels[0] || "";
    }
    if (type === "model") {
      state.userMall.model = select.value;
      if (select.value && select.value !== "全部车型") {
        state.userMall.brand = getVehicleBrandLabel(select.value);
      }
    }
    render();
  }

  function handleUserForumSubmit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const editor = form.querySelector("#forumRichEditor");
    const hidden = form.querySelector("#forumContentHidden");
    if (editor && hidden) hidden.value = editor.innerHTML;
    const formData = new FormData(form);
    const title = String(formData.get("forumTitle") || "").trim();
    const content = String(formData.get("forumContent") || "").trim();
    const rawTags = String(formData.get("forumTags") || "").trim();
    const postTags = rawTags ? rawTags.split(/\s+/).filter((t) => t.startsWith("#")).map((t) => t.slice(1)).filter(Boolean) : [];
    const mediaCount = form.querySelector('input[name="forumMedia"]')?.files?.length || 0;
    const boardId = String(formData.get("forumBoard") || "").trim();
    const board = (forumBoards || []).find((b) => b.id === boardId);
    if (!title || !content || !board) return;
    const id = `POST-${Date.now().toString().slice(-6)}`;
    const linkedProducts = productUrl ? [productUrl] : [];
    const metaParts = [board.name];
    if (postTags.length) metaParts.push(postTags.join(" / "));
    posts.unshift({
      id,
      title,
      author: "当前用户",
      time: "刚刚",
      replies: 0,
      likes: 0,
      status: "正常",
      type: "discussion",
      board: board.id,
      tags: postTags,
      meta: metaParts.join(" / "),
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
      owner: "current",
      time: "刚刚",
      content: text,
      status: "正常",
    });
    target.replies = (target.replies || 0) + 1;
    state.userForum.replyPostId = "";
    state.userFeedback = `${safe(target.title, "帖子")} 已回复。`;
    render();
  }

  function handleUserForumEditSubmit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const id = form.dataset.userId || "";
    const target = posts.find((item) => item.id === id);
    if (!target) return;
    const title = String(new FormData(form).get("forumEditTitle") || "").trim();
    const content = String(new FormData(form).get("forumEditContent") || "").trim();
    if (!title || !content) return;
    target.title = title;
    target.content = content;
    target.preview = content.slice(0, 80);
    state.userForum.editingPostId = "";
    state.userFeedback = "帖子已更新。";
    render();
  }

  function handleUserChatSubmit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const id = form.dataset.userId || "";
    const target = fallback.providerMessages.find((item) => item.id === id);
    if (!target) return;
    const text = String(new FormData(form).get("userChatMessage") || "").trim();
    const files = Array.from(form.querySelector('input[name="userChatAttachment"]')?.files || []);
    if (!text && !files.length) return;
    const now = new Date();
    const time = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    const attachmentText = files.length ? `附件：${files.map((file) => file.name).slice(0, 3).join("、")}${files.length > 3 ? ` 等 ${files.length} 个文件` : ""}` : "";
    const messageText = [text, attachmentText].filter(Boolean).join("\n");
    target.messages.push({ from: "user", text: messageText, time });
    target.preview = text || attachmentText;
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

  function handleUserCreditSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const requiredFields = ["creditName", "creditPhone", "creditIdNo", "creditCity", "creditAmount", "creditPurpose"];
    const isValid = requiredFields.every((field) => String(formData.get(field) || "").trim());
    if (!isValid) return;
    state.userMe.creditApplyOpen = false;
    state.userFeedback = `授信申请已提交，预计 2 小时内完成初审，申请城市为 ${String(formData.get("creditCity") || "").trim()}。`;
    render();
  }

  function readUserAvatarFile(file) {
    return new Promise((resolve) => {
      if (!file) {
        resolve("");
        return;
      }
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ""));
      reader.onerror = () => resolve("");
      reader.readAsDataURL(file);
    });
  }

  function handleUserAvatarChange(event) {
    const input = event.target;
    const fileName = input.files?.[0]?.name || "未选择任何文件";
    const nameEl = input.closest(".user-avatar-file-wrap")?.querySelector(".user-avatar-file-name");
    if (nameEl) nameEl.textContent = fileName;
  }

  async function handleUserProfileSubmit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const current = getMockUserAuth() || {};
    const nickname = String(formData.get("profileNickname") || "").trim();
    const phone = String(formData.get("profilePhone") || "").trim();
    if (!nickname || !phone) return;
    const avatarFile = form.querySelector('input[name="profileAvatar"]')?.files?.[0] || null;
    const uploadedAvatar = await readUserAvatarFile(avatarFile);
    const avatarUrl = formData.get("profileAvatarReset") === "on" ? "" : (uploadedAvatar || current.avatarUrl || "");
    setMockUserAuth({
      ...current,
      id: getUserDisplayId(current),
      nickname,
      phone,
      avatarUrl,
      inviteProviderName: String(formData.get("profileInviteProviderName") || "").trim() || "自然流量",
      updatedAt: getNowStamp(),
    });
    state.subTab.me = "profile";
    state.userFeedback = "个人信息已保存。";
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
    const address = String(formData.get("userAddress") || "").trim();
    const time = String(formData.get("userTime") || "").trim();
    const quantity = Math.max(1, Number(formData.get("userQuantity") || 1));
    const note = String(formData.get("userNote") || "").trim();
    const paymentMethod = String(formData.get("userPaymentMethod") || "alipay");
    const paymentLabel = getPaymentOptions().find((item) => item.id === paymentMethod)?.name || "支付宝";
    const intentionProviderId = type !== "goods" ? String(formData.get("userIntentionProvider") || "").trim() : "";
    const selectedProvider = intentionProviderId ? providers.find((p) => p.id === intentionProviderId) : null;
    if (!vehicle || !phone || !note) return;
    if (type === "goods" && !address) return;
    if (type !== "goods" && !time) return;
    const source = (type === "goods" ? products.find((item) => item.sku === id) : services.find((item) => String(item.id || item.name) === id));
    if (!source) return;
    const orderId = `UO-${Date.now().toString().slice(-6)}`;
    const preferredProvider = getUserPreferredProviders()[0] || providers[0];
    const isAssignedByUser = !!selectedProvider;
    const newOrder = {
      id: orderId,
      type: type === "goods" ? "商品订单" : "服务订单",
      displayType: type === "goods" ? "快递配送" : "改装服务",
      user: "当前用户",
      vehicle,
      service: `${safe(source.name, "下单项目")} x${quantity}`,
      sku: type === "goods" ? safe(source.sku, "") : "",
      provider: type === "goods" ? "平台仓" : safe(selectedProvider?.name, "待分配"),
      city: type === "goods" ? state.userGarage.locationCity : safe(selectedProvider?.city, safe(preferredProvider?.city, "上海")),
      quote: safe(source.price, "待确认"),
      payment: type === "goods" ? "已支付" : "线下结算",
      paymentMethod: type === "goods" ? paymentLabel : "线下结算",
      status: type === "goods" ? "待发货" : (isAssignedByUser ? "待接单" : "待分配"),
      progress: `${type === "goods" ? `商品已付款，等待平台发货，快递将配送至 ${address}` : (isAssignedByUser ? `用户指定意向服务商：${selectedProvider.name}，等待服务商接单` : "服务预约已提交，等待平台指派服务商")}，备注：${note}`,
      appointment: type === "goods" ? "等待发货" : time,
      intention: type === "goods" ? "无" : safe(selectedProvider?.name, "未指定"),
      address: type === "goods" ? address : "",
      recipient: type === "goods" ? getUserDefaultReceiver() : "",
      phone,
      timeline: [`${getNowStamp()} ${type === "goods" ? "用户提交商品订单，等待平台发货" : (isAssignedByUser ? `用户提交服务预约并指定意向服务商：${selectedProvider.name}` : "用户提交服务预约，等待平台指派服务商")}`],
    };
    orders.unshift(newOrder);
    setStoredUserOrders([newOrder, ...getStoredUserOrders()].slice(0, 20));
    state.userOrderForm = { type: "", id: "" };
    if (type === "goods") {
      const points = calculateOrderPoints(source, quantity);
      appendUserPointRow({
        type: "order",
        title: "商品付款获得积分",
        points,
        source: safe(source.name, "商品"),
        sourceId: orderId,
        desc: `商品订单支付成功，按每满 100 元获得 1 积分，共 ${points} 积分。`,
      });
      state.userFeedback = `${safe(source.name, "订单")} 已提交，获得 ${points} 积分。`;
      state.userDialog = { type: "service-upsell", orderId, sourceName: safe(source.name, "商品"), rating: 0 };
      state.tab = "mall";
    } else {
      state.userFeedback = `${safe(source.name, "订单")} 已提交，下单编号 ${orderId}。`;
      state.tab = "me";
    }
    render();
  }

  function handleUserDialogAction(button) {
    const action = button.dataset.userDialogAction;
    const { orderId, sourceName, rating } = state.userDialog;
    if (action === "confirm-acceptance") {
      const target = getUserOrderById(orderId);
      if (!target) return;
      target.status = "已完成";
      target.rating = Number(rating || 0);
      target.progress = target.rating > 0 ? `用户已完成验收，服务评分 ${target.rating} 分。` : "用户已完成验收，订单已归档。";
      appendOrderTimeline(target, target.rating > 0 ? `用户确认验收，服务评分 ${target.rating} 分` : "用户确认验收，订单归档");
      state.userDialog = { type: "", orderId: "", sourceName: "", rating: 0 };
      state.userFeedback = target.rating > 0 ? `${orderId} 已确认验收，评分 ${target.rating} 分。` : `${orderId} 已确认验收。`;
      render();
      return;
    }
    if (action === "close") {
      state.userDialog = { type: "", orderId: "", sourceName: "", rating: 0 };
      render();
      return;
    }
    if (action === "acceptance-contact") {
      state.userDialog = { type: "", orderId: "", sourceName: "", rating: 0 };
      state.tab = "me";
      state.subTab.me = "messages";
      state.userMe.selectedMessage = fallback.providerMessages.find((item) => item.id === "msg-2")?.id || fallback.providerMessages[0]?.id || "";
      state.userFeedback = `${orderId} 已切换到服务商会话，请先确认完工细节。`;
      render();
      return;
    }
    if (action === "confirm-acceptance") {
      const target = getUserOrderById(orderId);
      if (!target) return;
      target.status = "已完成";
      target.progress = "用户已完成验收，订单已归档。";
      appendOrderTimeline(target, "用户确认验收，订单归档");
      state.userDialog = { type: "", orderId: "", sourceName: "" };
      state.userFeedback = `${orderId} 已确认验收。`;
      render();
      return;
    }
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

  function renderUserMe() {
    const active = state.subTab.me || "profile";
    const tabs = [
      { id: "profile", label: "基本信息" },
      { id: "orders", label: "历史订单" },
      { id: "cart", label: "我的购物车" },
      { id: "collections", label: "我的收藏" },
      { id: "invoices", label: "发票申请" },
      { id: "messages", label: "消息" },
      { id: "address", label: "地址管理" },
      { id: "credit", label: "金融授信" },
    ];
    return `${subTabs(tabs)}${active === "profile" ? renderUserProfile() : active === "orders" ? renderUserHistoryOrders() : active === "cart" ? renderUserCart() : active === "collections" ? renderUserCollections() : active === "invoices" ? renderUserInvoices() : active === "messages" ? renderUserMessages() : active === "address" ? renderUserAddress() : renderUserCredit()}`;
  }

  function renderUserProfile() {
    const profile = getMockUserAuth() || {};
    const source = profile.inviteProviderName || "自然流量";
    return `<div class="stack">${state.userFeedback ? `<div class="provider-feedback">${state.userFeedback}</div>` : ""}<section class="admin-detail-card"><div class="eyebrow">User Profile</div><h3>用户基本信息</h3><div class="admin-kv-list"><div><span>昵称</span><strong>${safe(profile.nickname, "当前用户")}</strong></div><div><span>手机号</span><strong>${safe(profile.phone, "13800138000")}</strong></div><div><span>绑定来源</span><strong>${safe(source, "自然流量")}</strong></div><div><span>推荐码</span><strong>${safe(profile.inviteCode, "未填写")}</strong></div><div><span>常用城市</span><strong>${String(state.userGarage.locationCity || "上海").replace("市", "")}</strong></div><div><span>默认爱车</span><strong>${safe(getSelectedUserVehicle()?.model, "未绑定车辆")}</strong></div><div><span>账号状态</span><strong>正常</strong></div></div><div class="admin-action-row"><button class="btn btn-secondary" type="button" data-user-action="user-logout">退出登录</button></div></section></div>`;
  }

  function renderUserOrderForm(item, active) {
    const itemId = active === "goods" ? item.sku : item.id || item.name;
    return `<form class="provider-complete-form" data-user-order-form data-user-type="${active}" data-user-id="${itemId}"><div class="form-grid"><div class="field-group"><label class="field-label" for="user-vehicle-${itemId}">车辆信息</label><input class="input" id="user-vehicle-${itemId}" name="userVehicle" type="text" value="${getSelectedUserVehicle()?.model || "宝马 G20 330i"}" required></div><div class="field-group"><label class="field-label" for="user-phone-${itemId}">联系电话</label><input class="input" id="user-phone-${itemId}" name="userPhone" type="text" value="${safe(getMockUserAuth()?.phone, "13800138000")}" required></div>${active === "goods" ? `<div class="field-group field-group-full"><label class="field-label" for="user-address-${itemId}">收货地址</label><textarea class="textarea" id="user-address-${itemId}" name="userAddress" required>${getUserDefaultAddress()}</textarea></div>` : `<div class="field-group"><label class="field-label" for="user-time-${itemId}">预约安装时间</label><input class="input" id="user-time-${itemId}" name="userTime" type="text" value="2026-04-03 14:30" required></div><div class="field-group"><label class="field-label" for="user-intention-${itemId}">意向服务商</label><select class="input" id="user-intention-${itemId}" name="userIntentionProvider"><option value="">由平台指派</option>${getUserPreferredProviders().map((p) => `<option value="${p.id}">${safe(p.name, "服务商")} / ${safe(p.city, "")}</option>`).join("")}</select></div>`}${active === "goods" ? `<div class="field-group"><label class="field-label" for="user-pay-${itemId}">支付方式</label><select class="input" id="user-pay-${itemId}" name="userPaymentMethod">${getPaymentOptions().map((option) => `<option value="${option.id}">${option.name}</option>`).join("")}</select></div>` : `<div class="field-group"><label class="field-label">支付方式</label><div class="input" style="display:flex;align-items:center;background:rgba(255,255,255,0.04);color:var(--text-muted);">线下结算（到店支付）</div></div>`}<div class="field-group"><label class="field-label" for="user-qty-${itemId}">${active === "goods" ? "数量" : "服务数量"}</label><input class="input" id="user-qty-${itemId}" name="userQuantity" type="number" min="1" max="9" value="1" required></div><div class="field-group field-group-full"><label class="field-label" for="user-note-${itemId}">备注</label><textarea class="textarea" id="user-note-${itemId}" name="userNote" required>${active === "goods" ? "发货后请按物流信息签收快递。" : "请优先安排周末到店。"}</textarea></div></div><div class="admin-action-row"><button class="btn btn-primary" type="submit">提交订单</button><button class="btn btn-secondary" type="button" data-user-action="user-order-cancel" data-user-id="${itemId}" data-user-type="${active}">取消</button></div></form>`;
  }

  function renderUserCollections() {
    const rows = getUserCollections();
    if (!rows.length) {
      return `<div class="stack">${state.userFeedback ? `<div class="provider-feedback">${state.userFeedback}</div>` : ""}<section class="admin-detail-card"><div class="eyebrow">Collections</div><h3>我的收藏</h3><div class="admin-timeline"><div>当前暂无收藏商品。</div><div>在商城商品卡片点击收藏后，会在这里集中查看。</div></div><div class="admin-action-row"><button class="btn btn-primary" type="button" data-tab="mall">去商城</button></div></section></div>`;
    }
    return `<div class="stack">${state.userFeedback ? `<div class="provider-feedback">${state.userFeedback}</div>` : ""}<section class="admin-detail-card"><div class="eyebrow">Collections</div><h3>我的收藏</h3><div class="admin-kv-list"><div><span>收藏商品</span><strong>${rows.length}</strong></div><div><span>可下单商品</span><strong>${rows.filter((item) => safe(item.status, "上架") !== "缺货").length}</strong></div></div></section><div class="mobile-list">${rows.map((item) => `<section class="admin-detail-card"><h3>${safe(item.name, "收藏商品")}</h3><div class="admin-kv-list"><div><span>品牌</span><strong>${safe(item.brand, "-")}</strong></div><div><span>价格</span><strong>${safe(item.price, "-")}</strong></div><div><span>适配车型</span><strong>${safe(item.fitment, "-")}</strong></div><div><span>收藏时间</span><strong>${safe(item.collectedAt, "-")}</strong></div></div><div class="admin-action-row"><button class="btn btn-secondary" type="button" data-user-action="user-collection-remove" data-user-id="${safe(item.sku, "")}">移除收藏</button><a class="btn btn-secondary" href="user-product-detail.html?sku=${encodeURIComponent(safe(item.sku, ""))}&name=${encodeURIComponent(safe(item.name, "商品"))}&price=${encodeURIComponent(safe(item.price, "¥0"))}&brand=${encodeURIComponent(safe(item.brand, "-"))}&fitment=${encodeURIComponent(safe(item.fitment, "适配当前车型"))}&mallPage=${encodeURIComponent(safe(item.mallPage, "exterior"))}">商品详情</a><a class="btn btn-primary" href="user-order-create.html?sku=${encodeURIComponent(safe(item.sku, ""))}&name=${encodeURIComponent(safe(item.name, "商品"))}&price=${encodeURIComponent(safe(item.price, "¥0"))}&brand=${encodeURIComponent(safe(item.brand, "-"))}&fitment=${encodeURIComponent(safe(item.fitment, "适配当前车型"))}&mallPage=${encodeURIComponent(safe(item.mallPage, "exterior"))}&quantity=1">立即下单</a></div></section>`).join("")}</div></div>`;
  }

  function renderUserInvoices() {
    const orderRows = getUserOrders().filter((item) => ["已支付", "已完成", "待验收", "待发货", "施工中"].some((status) => nOrder(item.status).includes(status) || safe(item.payment, "").includes("已")));
    const invoiceRows = getUserInvoices();
    return `<div class="stack">${state.userFeedback ? `<div class="provider-feedback">${state.userFeedback}</div>` : ""}<section class="admin-detail-card"><div class="eyebrow">Invoice</div><h3>发票申请</h3><form class="provider-complete-form" data-user-invoice-form><div class="form-grid"><div class="field-group field-group-full"><label class="field-label" for="invoice-order">选择订单</label><select class="input" id="invoice-order" name="orderId" required>${orderRows.map((item) => `<option value="${item.id}">${item.id} / ${safe(item.service, "订单")} / ${safe(item.quote, "-")}</option>`).join("")}</select></div><div class="field-group"><label class="field-label" for="invoice-type">发票类型</label><select class="input" id="invoice-type" name="invoiceType"><option value="普票">普票</option><option value="专票">专票</option></select></div><div class="field-group"><label class="field-label" for="invoice-title">发票抬头</label><input class="input" id="invoice-title" name="title" type="text" value="顾铭" required></div><div class="field-group"><label class="field-label" for="invoice-tax">税号</label><input class="input" id="invoice-tax" name="taxNo" type="text" placeholder="专票必填"></div><div class="field-group"><label class="field-label" for="invoice-email">接收邮箱</label><input class="input" id="invoice-email" name="email" type="email" value="user@example.com" required></div><div class="field-group"><label class="field-label" for="invoice-phone">联系电话</label><input class="input" id="invoice-phone" name="phone" type="tel" value="${safe(getMockUserAuth()?.phone, "13800138000")}" required></div><div class="field-group field-group-full"><label class="field-label" for="invoice-address">注册地址</label><input class="input" id="invoice-address" name="address" type="text" value="${getUserDefaultAddress()}" required></div><div class="field-group"><label class="field-label" for="invoice-bank-name">开户行</label><input class="input" id="invoice-bank-name" name="bankName" type="text" placeholder="专票填写开户行"></div><div class="field-group"><label class="field-label" for="invoice-bank-account">账号</label><input class="input" id="invoice-bank-account" name="bankAccount" type="text" placeholder="专票填写账号"></div></div><div class="admin-action-row"><button class="btn btn-primary" type="submit">提交申请</button></div></form></section><div class="mobile-list">${invoiceRows.map((item) => `<section class="mobile-item"><strong>${safe(item.id, "发票申请")}</strong><div class="muted" style="margin-top:8px;">订单 ${safe(item.orderId, "-")} / ${safe(item.type || item.invoiceType, "普票")} / ${safe(item.amount, "-")}</div><div class="muted" style="margin-top:8px;">${safe(item.title, "个人")} / ${safe(item.email, "-")}</div><div style="margin-top:10px;">${tag(safe(item.status, "待开票"))}</div></section>`).join("") || `<article class="mobile-item"><strong>暂无发票申请</strong><div class="muted" style="margin-top:8px;">提交后会保存到当前浏览器的 mock 数据。</div></article>`}</div></div>`;
  }

  function renderUserHistoryOrderDetail(item) {
    const canAccept = nOrder(item.status).includes("待验收");
    const isGoodsOrder = safe(item.type, "").includes("商品") || ["自提", "快递配送", "平台自提"].some((label) => safe(item.displayType, "").includes(label));
    const visibleProgress = item.userVisibleProgress || safe(item.progress, "-");
    const visibleTimeline = item.userVisibleProgress ? ["订单已提交", item.userVisibleProgress] : getOrderTimeline(item);
    const canAfterSale = isGoodsOrder && (nOrder(item.status) === "已完成" || item.status === "售后中");
    const afterSaleOpen = state.userMe.afterSaleOrderId === item.id;
    const canReview = isGoodsOrder && nOrder(item.status) === "已完成" && item.sku && !(window.MockData.productReviews || []).some((r) => r.orderId === item.id);
    const reviewOpen = state.userMe.reviewOrderId === item.id;
    return `<section class="admin-detail-card"><div class="eyebrow">Order Detail</div><h3>${item.id}</h3><div class="admin-kv-list"><div><span>车辆</span><strong>${safe(item.vehicle, "-")}</strong></div><div><span>${isGoodsOrder ? "商品" : "服务"}</span><strong>${safe(item.service, "-")}</strong></div>${isGoodsOrder ? `<div><span>收货人</span><strong>${safe(item.recipient, getUserDefaultReceiver())}</strong></div><div><span>收货地址</span><strong>${safe(item.address, getUserDefaultAddress())}</strong></div>` : `<div><span>预约安装时间</span><strong>${safe(item.appointment, "-")}</strong></div>`}<div><span>订单金额</span><strong>${safe(item.quote, "-")}</strong></div><div><span>支付方式</span><strong>${safe(item.paymentMethod, "线上支付")}</strong></div><div><span>支付状态</span><strong>${safe(item.payment, "mock 已记录")}</strong></div><div><span>当前进度</span><strong>${visibleProgress}</strong></div>${item.afterSaleType ? `<div><span>售后类型</span><strong>${safe(item.afterSaleType, "-")}</strong></div><div><span>售后状态</span><strong>${safe(item.afterSaleStatus, "处理中")}</strong></div>` : ""}</div>${afterSaleOpen ? renderUserAfterSaleForm(item) : ""}${reviewOpen ? renderUserReviewForm(item) : ""}<div class="admin-action-row">${canAccept ? `<button class="btn btn-secondary" type="button" data-user-action="user-order-contact" data-user-id="${item.id}">联系服务商</button><button class="btn btn-primary" type="button" data-user-action="user-order-acceptance" data-user-id="${item.id}">确认验收</button>` : canReview ? `<button class="btn btn-secondary" type="button" data-user-action="user-order-contact" data-user-id="${item.id}">联系客服</button><button class="btn btn-primary" type="button" data-user-action="${reviewOpen ? "user-review-cancel" : "user-review-open"}" data-user-id="${item.id}">${reviewOpen ? "收起评价" : "去评价"}</button>${item.afterSaleType ? `<button class="btn btn-danger" type="button" data-user-action="${afterSaleOpen ? "user-after-sale-cancel" : "user-after-sale-open"}" data-user-id="${item.id}">${afterSaleOpen ? "收起售后申请" : "查看售后进度"}</button>` : `<button class="btn btn-danger" type="button" data-user-action="${afterSaleOpen ? "user-after-sale-cancel" : "user-after-sale-open"}" data-user-id="${item.id}">${afterSaleOpen ? "收起售后申请" : "申请售后"}</button>`}` : canAfterSale ? `<button class="btn btn-secondary" type="button" data-user-action="user-order-contact" data-user-id="${item.id}">联系客服</button><button class="btn btn-danger" type="button" data-user-action="${afterSaleOpen ? "user-after-sale-cancel" : "user-after-sale-open"}" data-user-id="${item.id}">${afterSaleOpen ? "收起售后申请" : item.afterSaleType ? "查看售后进度" : "申请售后"}</button>` : `<button class="btn btn-secondary" type="button" disabled>当前无需验收</button>`}</div></section>`;
  }

  function getUserAfterSaleStageLabel(item) {
    const step = item.afterSaleStep || item.afterSaleStatus || "待平台审核";
    const map = {
      "待平台审核": "待平台审核",
      "待确认退款金额": "平台核定退款金额中",
      "待平台退款": "等待平台提交退款",
      "待退款到账": "退款处理中",
      "待用户寄回": "待填写寄回物流",
      "待服务商收货": "等待商家确认收货",
      "待重新发货": "等待商家重新发货",
      "待用户收货": "待确认收货",
      "售后完成": "售后已完成",
      "售后关闭": "售后已关闭",
    };
    if (item.afterSaleStatus === "已驳回") return "申请已驳回";
    if (item.afterSaleStatus === "已关闭") return "售后已关闭";
    return map[step] || safe(step, "处理中");
  }

  function renderUserAfterSaleProgress(item) {
    const method = item.afterSaleMethod || (String(item.afterSaleType || "").includes("换货") ? "换货" : "退款");
    const stage = getUserAfterSaleStageLabel(item);
    const refundRows = method === "退款" ? `
      <div><span>退款金额</span><strong>${safe(item.refundAmount, "待平台核定")}</strong></div>
      <div><span>退款状态</span><strong>${safe(item.refundStatus, stage)}</strong></div>
    ` : "";
    const exchangeRows = method === "换货" ? `
      <div><span>寄回物流</span><strong>${item.returnShippingNo ? `${safe(item.returnShippingCompany, "物流")} ${safe(item.returnShippingNo, "-")}` : "待填写"}</strong></div>
      <div><span>换货物流</span><strong>${item.exchangeShippingNo ? `${safe(item.exchangeShippingCompany, "物流")} ${safe(item.exchangeShippingNo, "-")}` : "待商家发货"}</strong></div>
    ` : "";
    return `<section class="provider-complete-form"><div class="eyebrow">After Sale</div><h3>售后进度</h3><div class="admin-kv-list"><div><span>售后类型</span><strong>${safe(item.afterSaleType, "-")}</strong></div><div><span>处理方式</span><strong>${safe(method, "待平台审核")}</strong></div><div><span>当前进度</span><strong>${stage}</strong></div><div><span>申请时间</span><strong>${safe(item.afterSaleTime, "-")}</strong></div>${refundRows}${exchangeRows}<div><span>问题描述</span><strong>${safe(item.afterSaleReason, "-")}</strong></div></div>${renderUserAfterSaleNextAction(item)}<div class="admin-timeline">${getOrderTimeline(item).filter((line) => String(line).includes("售后") || String(line).includes("退款") || String(line).includes("换货") || String(line).includes("物流") || String(line).includes("寄回")).slice(0, 6).map((line) => `<div>${line}</div>`).join("") || `<div>售后申请已提交，等待平台处理。</div>`}</div></section>`;
  }

  function renderUserAfterSaleNextAction(item) {
    const step = item.afterSaleStep || item.afterSaleStatus || "待平台审核";
    if (step === "待用户寄回") {
      return `<form class="provider-complete-form" data-user-after-sale-return-form data-order-id="${item.id}" style="margin-top:12px;"><div class="form-grid"><div class="field-group"><label class="field-label">物流公司</label><input class="input" name="returnShippingCompany" value="${safe(item.returnShippingCompany, "顺丰速运")}" required></div><div class="field-group"><label class="field-label">物流单号</label><input class="input" name="returnShippingNo" value="${safe(item.returnShippingNo, "SF900123456789")}" required></div><div class="field-group field-group-full"><label class="field-label">寄回说明</label><textarea class="textarea" name="returnShippingNote">已按平台要求寄回商品，请商家查收。</textarea></div></div><div class="admin-action-row"><button class="btn btn-primary" type="submit">提交寄回物流</button></div></form>`;
    }
    if (step === "待用户收货") {
      return `<div class="admin-action-row" style="margin-top:12px;"><button class="btn btn-primary" type="button" data-user-after-sale-action="confirm-receive" data-order-id="${item.id}">确认已收到换货商品</button></div>`;
    }
    if (step === "待退款到账") {
      return `<div class="admin-action-row" style="margin-top:12px;"><button class="btn btn-primary" type="button" data-user-after-sale-action="confirm-refund" data-order-id="${item.id}">确认退款已到账</button></div>`;
    }
    return "";
  }

  function renderUserHistoryOrderDetailV2(item) {
    const canAccept = nOrder(item.status).includes("待验收");
    const isGoodsOrder = safe(item.type, "").includes("商品") || ["自提", "快递配送", "平台自提"].some((label) => safe(item.displayType, "").includes(label));
    const visibleProgress = item.userVisibleProgress || safe(item.progress, "-");
    const canAfterSale = isGoodsOrder && (nOrder(item.status) === "已完成" || nOrder(item.status) === "售后中" || item.afterSaleType);
    const afterSaleOpen = state.userMe.afterSaleOrderId === item.id;
    const canReview = isGoodsOrder && nOrder(item.status) === "已完成" && item.sku && !(window.MockData.productReviews || []).some((r) => r.orderId === item.id);
    const reviewOpen = state.userMe.reviewOrderId === item.id;
    const afterSalePanel = afterSaleOpen ? (item.afterSaleType ? renderUserAfterSaleProgress(item) : renderUserAfterSaleForm(item)) : "";
    const afterSaleButtonLabel = afterSaleOpen ? "收起售后" : item.afterSaleType ? "查看售后进度" : "申请售后";
    const afterSaleRows = item.afterSaleType ? `<div><span>售后类型</span><strong>${safe(item.afterSaleType, "-")}</strong></div><div><span>售后进度</span><strong>${getUserAfterSaleStageLabel(item)}</strong></div>` : "";
    const actionButtons = canAccept
      ? `<button class="btn btn-secondary" type="button" data-user-action="user-order-contact" data-user-id="${item.id}">联系服务商</button><button class="btn btn-primary" type="button" data-user-action="user-order-acceptance" data-user-id="${item.id}">确认验收</button>`
      : canReview
        ? `<button class="btn btn-secondary" type="button" data-user-action="user-order-contact" data-user-id="${item.id}">联系客服</button><button class="btn btn-primary" type="button" data-user-action="${reviewOpen ? "user-review-cancel" : "user-review-open"}" data-user-id="${item.id}">${reviewOpen ? "收起评价" : "去评价"}</button><button class="btn btn-danger" type="button" data-user-action="${afterSaleOpen ? "user-after-sale-cancel" : "user-after-sale-open"}" data-user-id="${item.id}">${afterSaleButtonLabel}</button>`
        : canAfterSale
          ? `<button class="btn btn-secondary" type="button" data-user-action="user-order-contact" data-user-id="${item.id}">联系客服</button><button class="btn btn-danger" type="button" data-user-action="${afterSaleOpen ? "user-after-sale-cancel" : "user-after-sale-open"}" data-user-id="${item.id}">${afterSaleButtonLabel}</button>`
          : `<button class="btn btn-secondary" type="button" disabled>当前无需处理</button>`;
    return `<section class="admin-detail-card"><div class="eyebrow">Order Detail</div><h3>${item.id}</h3><div class="admin-kv-list"><div><span>车辆</span><strong>${safe(item.vehicle, "-")}</strong></div><div><span>${isGoodsOrder ? "商品" : "服务"}</span><strong>${safe(item.service, "-")}</strong></div>${isGoodsOrder ? `<div><span>收货人</span><strong>${safe(item.recipient, getUserDefaultReceiver())}</strong></div><div><span>收货地址</span><strong>${safe(item.address, getUserDefaultAddress())}</strong></div>` : `<div><span>预约安装时间</span><strong>${safe(item.appointment, "-")}</strong></div>`}<div><span>订单金额</span><strong>${safe(item.quote, "-")}</strong></div><div><span>支付方式</span><strong>${safe(item.paymentMethod, "线上支付")}</strong></div><div><span>支付状态</span><strong>${safe(item.payment, "mock 已记录")}</strong></div><div><span>当前进度</span><strong>${visibleProgress}</strong></div>${afterSaleRows}</div>${afterSalePanel}${reviewOpen ? renderUserReviewForm(item) : ""}<div class="admin-action-row">${actionButtons}</div></section>`;
  }

  function renderUserAfterSaleForm(item) {
    const types = ["退款", "换货"];
    return `<form class="provider-complete-form" data-user-after-sale-form data-order-id="${item.id}"><div class="form-grid"><div class="field-group"><label class="field-label">售后类型</label><select class="input" name="afterSaleType" required>${types.map((t) => `<option value="${t}">${t}</option>`).join("")}</select></div><div class="field-group"><label class="field-label">问题描述</label><textarea class="textarea" name="afterSaleReason" placeholder="请简述售后原因" required>商品存在问题，申请平台售后处理。</textarea></div></div><div class="admin-action-row"><button class="btn btn-primary" type="submit">提交申请</button><button class="btn btn-secondary" type="button" data-user-action="user-after-sale-cancel" data-user-id="${item.id}">取消</button></div></form>`;
  }

  function handleUserAfterSaleSubmit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const orderId = form.dataset.orderId || "";
    const target = getUserOrderById(orderId);
    if (!target) return;
    const formData = new FormData(form);
    const afterSaleType = String(formData.get("afterSaleType") || "").trim();
    const afterSaleReason = String(formData.get("afterSaleReason") || "").trim();
    if (!afterSaleType || !afterSaleReason) return;
    target.status = "售后中";
    target.afterSaleType = afterSaleType;
    target.afterSaleReason = afterSaleReason;
    target.afterSaleStatus = "待平台审核";
    target.afterSaleStep = "待平台审核";
    target.afterSaleMethod = String(afterSaleType).includes("换货") ? "换货" : "退款";
    target.afterSaleTime = getNowStamp();
    appendOrderTimeline(target, `用户提交售后申请：${afterSaleType}`);
    persistUserOrderState(target);
    state.userMe.afterSaleOrderId = "";
    state.userFeedback = `${orderId} 售后申请已提交，平台将在 1-2 个工作日内处理。`;
    render();
  }

  function persistUserOrderState(order) {
    if (!order) return;
    const stored = getStoredUserOrders();
    const index = stored.findIndex((item) => item.id === order.id);
    if (index >= 0) {
      stored[index] = { ...stored[index], ...order };
      setStoredUserOrders(stored);
    } else {
      setStoredUserOrders([{ ...order }, ...stored].slice(0, 20));
    }
  }

  function handleUserAfterSaleReturnSubmit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const orderId = form.dataset.orderId || "";
    const target = getUserOrderById(orderId);
    if (!target) return;
    const formData = new FormData(form);
    const company = String(formData.get("returnShippingCompany") || "").trim();
    const shippingNo = String(formData.get("returnShippingNo") || "").trim();
    const note = String(formData.get("returnShippingNote") || "").trim();
    if (!company || !shippingNo) {
      state.userFeedback = "请填写物流公司和物流单号。";
      render();
      return;
    }
    target.returnShippingCompany = company;
    target.returnShippingNo = shippingNo;
    target.returnShippingNote = note;
    target.afterSaleStatus = "处理中";
    target.afterSaleStep = "待服务商收货";
    target.progress = "换货商品已寄回，等待商家确认收货。";
    appendOrderTimeline(target, `用户提交寄回物流：${company} ${shippingNo}`);
    persistUserOrderState(target);
    state.userFeedback = `${orderId} 寄回物流已提交，等待商家确认收货。`;
    render();
  }

  function handleUserAfterSaleAction(button) {
    const orderId = button.dataset.orderId || "";
    const action = button.dataset.userAfterSaleAction;
    const target = getUserOrderById(orderId);
    if (!target) return;
    if (action === "confirm-receive") {
      target.afterSaleStatus = "已完成";
      target.afterSaleStep = "售后完成";
      target.progress = "换货商品已确认收货，售后完成。";
      appendOrderTimeline(target, "用户确认收到换货商品，售后完成");
      persistUserOrderState(target);
      state.userFeedback = `${orderId} 已确认收到换货商品。`;
      render();
      return;
    }
    if (action === "confirm-refund") {
      target.afterSaleStatus = "已完成";
      target.afterSaleStep = "售后完成";
      target.refundStatus = "已到账";
      target.progress = "退款已到账，售后完成。";
      appendOrderTimeline(target, "用户确认退款到账，售后完成");
      persistUserOrderState(target);
      state.userFeedback = `${orderId} 已确认退款到账。`;
      render();
    }
  }

  function renderUserReviewForm(item) {
    return `<form class="provider-complete-form" data-user-review-form data-order-id="${item.id}" data-order-sku="${item.sku || ""}"><div class="form-grid"><div class="field-group"><label class="field-label">评分</label><select class="input" name="reviewRating" required><option value="5">★★★★★ 非常满意</option><option value="4">★★★★☆ 满意</option><option value="3">★★★☆☆ 一般</option><option value="2">★★☆☆☆ 不满意</option><option value="1">★☆☆☆☆ 非常不满意</option></select></div><div class="field-group field-group-full"><label class="field-label">评价内容</label><textarea class="textarea" name="reviewContent" placeholder="分享你的使用体验，帮助其他车主做选择" required>商品品质不错，安装效果符合预期，值得推荐。</textarea></div><div class="field-group field-group-full"><label class="field-label">图片 / 视频</label><label class="upload-panel" for="review-media-${item.id}" style="min-height:100px;"><input id="review-media-${item.id}" class="upload-input" type="file" accept="image/*,video/*" multiple data-user-review-media data-order-id="${item.id}"><span class="upload-illustration" style="height:44px;"></span><strong>点击上传图片或视频</strong><small>支持多张图片或单个视频，用于展示安装效果或使用体验</small></label><div class="review-media-preview" data-review-preview="${item.id}" style="display:flex; flex-wrap:wrap; gap:8px; margin-top:10px;"></div></div></div><div class="admin-action-row"><button class="btn btn-primary" type="submit">提交评价</button><button class="btn btn-secondary" type="button" data-user-action="user-review-cancel" data-user-id="${item.id}">取消</button></div></form>`;
  }

  function handleUserReviewMediaChange(event) {
    const input = event.currentTarget;
    const orderId = input.dataset.orderId || "";
    const previewEl = document.querySelector(`[data-review-preview="${orderId}"]`);
    if (!previewEl) return;
    const files = Array.from(input.files || []);
    if (!files.length) return;
    const existing = previewEl.dataset.media ? JSON.parse(previewEl.dataset.media) : [];
    const newItems = files.map((file) => ({
      type: file.type.startsWith("video") ? "video" : "image",
      url: URL.createObjectURL(file),
      name: file.name,
    }));
    const combined = [...existing, ...newItems].slice(0, 9);
    previewEl.dataset.media = JSON.stringify(combined);
    previewEl.innerHTML = combined.map((m, idx) => `
      <div style="position:relative; width:72px; height:72px; border-radius:10px; overflow:hidden; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.06);">
        ${m.type === "video" ? `<video src="${m.url}" style="width:100%; height:100%; object-fit:cover;" muted playsinline></video><span style="position:absolute; bottom:2px; right:2px; font-size:10px; background:rgba(0,0,0,0.6); color:#fff; padding:1px 4px; border-radius:4px;">视频</span>` : `<img src="${m.url}" style="width:100%; height:100%; object-fit:cover;" alt="">`}
        <button type="button" data-review-media-remove="${idx}" style="position:absolute; top:2px; right:2px; width:18px; height:18px; border-radius:50%; background:rgba(0,0,0,0.6); color:#fff; border:none; font-size:11px; cursor:pointer; line-height:1;">×</button>
      </div>
    `).join("");
    function bindRemove() {
      previewEl.querySelectorAll("[data-review-media-remove]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const idx = Number(btn.dataset.reviewMediaRemove);
          const mediaArr = JSON.parse(previewEl.dataset.media || "[]");
          mediaArr.splice(idx, 1);
          previewEl.dataset.media = JSON.stringify(mediaArr);
          previewEl.innerHTML = mediaArr.map((m, i) => `
            <div style="position:relative; width:72px; height:72px; border-radius:10px; overflow:hidden; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.06);">
              ${m.type === "video" ? `<video src="${m.url}" style="width:100%; height:100%; object-fit:cover;" muted playsinline></video><span style="position:absolute; bottom:2px; right:2px; font-size:10px; background:rgba(0,0,0,0.6); color:#fff; padding:1px 4px; border-radius:4px;">视频</span>` : `<img src="${m.url}" style="width:100%; height:100%; object-fit:cover;" alt="">`}
              <button type="button" data-review-media-remove="${i}" style="position:absolute; top:2px; right:2px; width:18px; height:18px; border-radius:50%; background:rgba(0,0,0,0.6); color:#fff; border:none; font-size:11px; cursor:pointer; line-height:1;">×</button>
            </div>
          `).join("");
          bindRemove();
        });
      });
    }
    bindRemove();
  }

  function handleUserReviewSubmit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const orderId = form.dataset.orderId || "";
    const sku = form.dataset.orderSku || "";
    const target = getUserOrderById(orderId);
    if (!target || !sku) return;
    const formData = new FormData(form);
    const rating = Math.max(1, Math.min(5, Number(formData.get("reviewRating") || 5)));
    const content = String(formData.get("reviewContent") || "").trim();
    if (!content) return;
    const previewEl = document.querySelector(`[data-review-preview="${orderId}"]`);
    const media = previewEl ? JSON.parse(previewEl.dataset.media || "[]") : [];
    const profile = getMockUserAuth() || {};
    const newReview = {
      id: `RV-${Date.now().toString().slice(-4)}`,
      sku,
      orderId,
      user: profile.nickname || "当前用户",
      avatar: "",
      rating,
      content,
      tags: [],
      images: media.map((m) => m.url),
      vehicle: target.vehicle || "",
      time: getNowStamp(),
      likes: 0,
      auditStatus: "待审核",
    };
    window.MockData.productReviews = window.MockData.productReviews || [];
    window.MockData.productReviews.unshift(newReview);
    state.userMe.reviewOrderId = "";
    state.userFeedback = `${orderId} 评价已提交，经平台审核通过后将展示在商品详情页。`;
    render();
  }

  function handleUserAuthSubmit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const mode = form.dataset.authMode || "login";
    const phone = String(formData.get("phone") || "").trim();
    const password = String(formData.get("password") || "").trim();
    if (!phone) return;
    if (mode !== "smsLogin" && !password) return;
    if (mode === "registerPhone" || mode === "registerWechat") {
      const inviteCode = String(formData.get("inviteCode") || "").trim();
      const invite = inviteCode ? (window.MockData.providerInvites || []).find((item) => item.code === inviteCode) : null;
      if (inviteCode && !invite) {
        state.userAuthFeedback = "推荐码无效，请确认后再注册。";
        render();
        return;
      }
      const wx = state.wechatBindInfo;
      const nickname = mode === "registerWechat" && wx
        ? wx.nickname
        : String(formData.get("nickname") || "新用户").trim();
      if (mode === "registerWechat" && !wx) {
        state.userAuthFeedback = "请先获取微信头像和昵称。";
        render();
        return;
      }
      setMockUserAuth({ id: `U-${Date.now().toString().slice(-5)}`, phone, nickname, inviteCode, inviteProviderName: invite ? invite.providerName : "自然流量", wechatOpenid: wx?.openid || "", wechatNickname: wx?.nickname || "", createdAt: getNowStamp() });
      state.wechatBindInfo = null;
    } else if (mode === "smsLogin") {
      const account = (window.MockData.userAccounts || []).find((item) => item.phone === phone);
      setMockUserAuth({ id: account?.id || window.MockData.creditInfo?.userId || "U-20311", phone, nickname: account?.nickname || "顾铭", inviteCode: account?.inviteCode || "", inviteProviderName: account?.inviteProviderName || "自然流量", loginAt: getNowStamp() });
    } else {
      const account = (window.MockData.userAccounts || []).find((item) => item.phone === phone);
      setMockUserAuth({ id: account?.id || window.MockData.creditInfo?.userId || "U-20311", phone, nickname: account?.nickname || "顾铭", inviteCode: account?.inviteCode || "", inviteProviderName: account?.inviteProviderName || "自然流量", loginAt: getNowStamp() });
    }
    state.userAuthFeedback = "";
    state.userFeedback = "已进入用户 App。";
    state.tab = "forum";
    state.userForum.category = "all";
    state.userForum.selectedPost = "";
    state.userForum.createOpen = false;
    render();
  }

  function handleUserInvoiceSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const order = getUserOrderById(String(formData.get("orderId") || ""));
    if (!order) return;
    const existingInvoice = getCurrentInvoiceForOrder(order.id);
    if (existingInvoice) {
      state.userMe.invoiceOrderId = "";
      state.userFeedback = normalizeUserInvoiceStatus(existingInvoice.status) === "已开具" ? "该订单已开具发票，不能再次申请。" : "该订单发票正在处理中，请勿重复提交。";
      render();
      return;
    }
    const profile = getMockUserAuth() || {};
    const row = {
      id: `INV-${Date.now().toString().slice(-6)}`,
      orderId: order.id,
      user: safe(profile.nickname, "当前用户"),
      phone: safe(profile.phone, ""),
      type: String(formData.get("invoiceType") || "普票"),
      title: String(formData.get("title") || "").trim(),
      taxNo: String(formData.get("taxNo") || "").trim(),
      email: String(formData.get("email") || "").trim(),
      address: String(formData.get("address") || "").trim(),
      phoneNumber: String(formData.get("phone") || "").trim(),
      bank: String(formData.get("bank") || "").trim(),
      amount: safe(order.quote, "-"),
      status: "待开票",
      method: "电子发票",
      time: getNowStamp(),
    };
    writeStorageRows(INVOICE_STORAGE_KEY, [row, ...readStorageRows(INVOICE_STORAGE_KEY)].slice(0, 30));
    state.userMe.invoiceOrderId = "";
    state.userFeedback = `${row.id} 已提交，状态为待开票。`;
    render();
  }

  function renderUserMe() {
    const active = state.subTab.me || "profile";
    const tabs = [
      { id: "profile", label: "基本信息" },
      { id: "orders", label: "历史订单" },
      { id: "cart", label: "购物车" },
      { id: "collections", label: "收藏" },
      { id: "invoices", label: "发票" },
      { id: "messages", label: "消息" },
      { id: "address", label: "地址" },
      { id: "credit", label: "授信" },
    ];
    const titleMap = {
      profile: "我的",
      orders: "历史订单",
      cart: "我的购物车",
      collections: "我的收藏",
      invoices: "发票申请",
      messages: "我的消息",
      address: "地址管理",
      credit: "金融授信",
    };
    const profile = getMockUserAuth() || {};
    const collectionsCount = getUserCollections().length;
    const invoiceCount = getUserInvoices().length;
    const orderCount = getUserOrders().length;
    const content = active === "profile" ? renderUserProfile() : active === "orders" ? renderUserHistoryOrders() : active === "cart" ? renderUserCart() : active === "collections" ? renderUserCollections() : active === "invoices" ? renderUserInvoices() : active === "messages" ? renderUserMessages() : active === "address" ? renderUserAddress() : renderUserCredit();
    return `<div class="user-me-page">${state.userFeedback ? `<div class="provider-feedback user-me-feedback">${state.userFeedback}</div>` : ""}<section class="user-me-hero"><div class="user-me-avatar">${safe(profile.nickname, "顾铭").slice(0, 1)}</div><div class="user-me-hero-copy"><span>当前账号</span><strong>${safe(profile.nickname, "顾铭")}</strong><small>${safe(profile.phone, "13800138000")} / ${safe(profile.inviteProviderName, "自然流量")}</small></div></section><section class="user-me-stats"><article><span>订单</span><strong>${orderCount}</strong></article><article><span>收藏</span><strong>${collectionsCount}</strong></article><article><span>发票</span><strong>${invoiceCount}</strong></article></section><div class="user-me-tabs">${subTabs(tabs)}</div><div class="user-me-title"><span>MY CENTER</span><strong>${titleMap[active] || "我的"}</strong></div>${content}</div>`;
  }

  function renderUserProfile() {
    const profile = getMockUserAuth() || {};
    const source = profile.inviteProviderName || "自然流量";
    return `<section class="user-me-panel"><div class="user-me-list"><div><span>昵称</span><strong>${safe(profile.nickname, "顾铭")}</strong></div><div><span>手机号</span><strong>${safe(profile.phone, "13800138000")}</strong></div><div><span>绑定来源</span><strong>${safe(source, "自然流量")}</strong></div><div><span>服务商推荐码</span><strong>${safe(profile.inviteCode, "未填写")}</strong></div><div><span>默认爱车</span><strong>${safe(getSelectedUserVehicle()?.model, "未绑定车辆")}</strong></div><div><span>当前定位</span><strong>${getGarageLocationSummary()}</strong></div></div><button class="btn btn-secondary user-me-full-btn" type="button" data-user-action="user-logout">退出登录</button></section>`;
  }

  function renderUserCollections() {
    const rows = getUserCollections();
    if (!rows.length) {
      return `<section class="user-me-panel user-me-empty"><strong>还没有收藏商品</strong><span>在商城里收藏轮毂、排气、车衣等商品后，会在这里集中查看。</span><button class="btn btn-primary user-me-full-btn" type="button" data-tab="mall">去商城看看</button></section>`;
    }
    return `<div class="user-me-card-list">${rows.map((item) => `<section class="user-me-product-card"><div class="user-me-product-thumb"></div><div class="user-me-product-body"><strong>${safe(item.name, "收藏商品")}</strong><span>${safe(item.brand, "-")} / ${safe(item.fitment, "适配当前车型")}</span><b>${safe(item.price, "-")}</b></div><div class="user-me-card-actions"><button class="btn btn-secondary btn-sm" type="button" data-user-action="user-collection-remove" data-user-id="${safe(item.sku, "")}">移除</button><a class="btn btn-primary btn-sm" href="user-order-create.html?sku=${encodeURIComponent(safe(item.sku, ""))}&name=${encodeURIComponent(safe(item.name, "商品"))}&price=${encodeURIComponent(safe(item.price, "¥0"))}&brand=${encodeURIComponent(safe(item.brand, "-"))}&fitment=${encodeURIComponent(safe(item.fitment, "适配当前车型"))}&mallPage=${encodeURIComponent(safe(item.mallPage, "exterior"))}&quantity=1">下单</a></div></section>`).join("")}</div>`;
  }

  function renderUserInvoices() {
    const orderRows = getUserOrders().filter((item) => ["已支付", "已完成", "待验收", "待发货", "施工中"].some((status) => nOrder(item.status).includes(status) || safe(item.payment, "").includes("已")));
    const invoiceRows = getUserInvoices();
    return `<div class="user-me-invoice-page"><section class="user-me-panel user-me-invoice-summary"><div><span>可申请订单</span><strong>${orderRows.length}</strong></div><div><span>已提交申请</span><strong>${invoiceRows.length}</strong></div></section><section class="user-me-panel"><form class="user-me-form" data-user-invoice-form><label><span>选择订单</span><select class="input" name="orderId" required>${orderRows.map((item) => `<option value="${item.id}">${item.id} / ${safe(item.service, "订单")} / ${safe(item.quote, "-")}</option>`).join("")}</select></label><div class="user-me-form-row"><label><span>发票类型</span><select class="input" name="invoiceType"><option value="普票">普票</option><option value="专票">专票</option></select></label><label><span>发票抬头</span><input class="input" name="title" type="text" value="${safe(getMockUserAuth()?.nickname, "顾铭")}" required></label></div><label><span>税号</span><input class="input" name="taxNo" type="text" placeholder="专票必填"></label><label><span>接收邮箱</span><input class="input" name="email" type="email" value="user@example.com" required></label><label><span>联系电话</span><input class="input" name="phone" type="tel" value="${safe(getMockUserAuth()?.phone, "13800138000")}" required></label><label><span>注册地址</span><input class="input" name="address" type="text" value="${getUserDefaultAddress()}" required></label><label><span>开户行</span><input class="input" name="bankName" type="text" placeholder="专票填写开户行"></label><label><span>账号</span><input class="input" name="bankAccount" type="text" placeholder="专票填写账号"></label><button class="btn btn-primary user-me-full-btn" type="submit">提交发票申请</button></form></section><section class="user-me-panel"><div class="user-me-section-head"><strong>申请记录</strong><span>${invoiceRows.length} 条</span></div><div class="user-me-record-list">${invoiceRows.map((item) => renderInvoiceRecordRow(item)).join("") || `<article><div><strong>暂无发票申请</strong><span>提交后会保存在当前浏览器的 mock 数据中。</span></div></article>`}</div></section></div>`;
  }

  function renderUserPoints() {
    const rows = getUserPointRows();
    const total = getUserPointTotal(rows);
    const checkedIn = hasUserCheckedInToday(rows);
    const totalEarned = total;
    return `<div class="user-me-light-subpage"><section class="user-me-white-block"><div style="display:flex; justify-content:space-between; align-items:center; padding:16px 0 12px;"><div><span style="color:var(--text-muted); font-size:13px;">当前积分</span><strong style="display:block; font-size:32px; font-weight:500; color:var(--text);">${total.toLocaleString("zh-CN")}</strong></div><button class="btn btn-primary" type="button" data-user-action="user-points-checkin" ${checkedIn ? "disabled" : ""} style="min-height:40px; padding:0 16px; font-size:13px; border-radius:20px;">${checkedIn ? "今日已签到" : "每日签到 +10"}</button></div><div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; padding-bottom:6px;"><div><span style="color:var(--text-muted); font-size:12px;">累计获得</span><strong style="display:block; font-size:16px; color:var(--text);">${totalEarned.toLocaleString("zh-CN")}</strong></div><div><span style="color:var(--text-muted); font-size:12px;">今日签到</span><strong style="display:block; font-size:16px; color:var(--text);">${checkedIn ? "已完成" : "未签到"}</strong></div></div></section><section class="user-me-white-block" style="margin-top:10px;"><div class="user-me-block-head"><strong>积分账单</strong><span>${rows.length} 条记录</span></div><div class="user-me-record-list light">${rows.length ? rows.map((item) => `<article><div><strong>${safe(item.title, "积分记录")}</strong><span>${safe(item.source, "-")} · ${safe(item.time, "-")}</span><span>${safe(item.desc, "")}</span></div><span style="color:#ff8b48; font-weight:500; font-size:15px; white-space:nowrap;">+${Number(item.points || 0)}</span></article>`).join("") : `<article><div><strong>暂无积分记录</strong><span>完成签到或商品付款后生成积分记录。</span></div></article>`}</div></section></div>`;
  }

  function renderUserMe() {
    const active = state.subTab.me || "profile";
    const profile = getMockUserAuth() || {};
    const titleMap = {
      profile: "个人中心",
      orders: "我的订单",
      cart: "购物车",
      collections: "我的收藏",
      invoices: "电子凭证",
      coupons: "优惠券管理",
      address: "收货地址",
      credit: "金融授信",
      profileDetail: "个人信息",
      following: "我的关注",
      postCollections: "帖子收藏",
      followers: "我的粉丝",
      points: "积分管理",
    };
    const content = active === "profile" ? renderUserProfile() : active === "profileDetail" ? renderUserProfileDetail() : active === "orders" ? renderUserHistoryOrders() : active === "cart" ? renderUserCart() : active === "collections" ? renderUserCollections() : active === "invoices" ? renderUserInvoices() : active === "coupons" ? renderUserCoupons() : active === "address" ? renderUserAddress() : active === "following" ? renderUserFollowing() : active === "postCollections" ? renderUserPostCollections() : active === "followers" ? renderUserFollowers() : active === "points" ? renderUserPoints() : renderUserCredit();
    return `<div class="user-me-page user-me-page-light"><header class="user-me-top"><strong>${titleMap[active] || "个人中心"}</strong>${active !== "profile" ? `<button type="button" data-sub-tab="profile">返回</button>` : ""}</header>${state.userFeedback ? `<div class="provider-feedback user-me-feedback">${state.userFeedback}</div>` : ""}${content}</div>`;
  }

  function renderUserPortrait(profile = getMockUserAuth() || {}, className = "") {
    const avatarUrl = safe(profile.avatarUrl, "");
    const fallbackText = safe(profile.nickname, "顾").slice(0, 1);
    if (profile.wechatNickname && !avatarUrl) {
      return `<div class="user-me-portrait ${className}" style="background:linear-gradient(135deg, #07c160, #05a350); color:#fff; font-size:18px; display:flex; align-items:center; justify-content:center;">🌿</div>`;
    }
    return `<div class="user-me-portrait ${className}">${avatarUrl ? `<img src="${avatarUrl}" alt="avatar">` : fallbackText}</div>`;
  }

  function renderUserMeProfileHero(profile = getMockUserAuth() || {}) {
    const availableLimit = safe(window.MockData.creditInfo?.availableLimit, "¥ 80,000");
    const userId = getUserDisplayId(profile);
    return `<a class="user-me-red-hero compact user-me-profile-entry" href="user-app.html?tab=me&meTab=profileDetail" aria-label="编辑个人信息">${renderUserPortrait(profile)}<div class="user-me-red-copy"><div class="user-me-name-stack"><strong>${safe(profile.nickname, "未设置昵称")}</strong><small>用户ID ${userId}</small></div><span class="user-me-credit-limit">可用额度 ${availableLimit}</span></div><b>›</b></a>`;
  }

  function getUserDisplayId(profile = getMockUserAuth() || {}) {
    const account = (window.MockData.userAccounts || []).find((item) => item.phone === profile.phone);
    return safe(profile.id || account?.id || window.MockData.creditInfo?.userId, "U-20311");
  }

  function renderUserProfile() {
    const profile = getMockUserAuth() || {};
    const socialStats = { following: 3, postCollections: 6, followers: 128 };
    const pointRows = getUserPointRows();
    const pointTotal = getUserPointTotal(pointRows);
    const checkedIn = hasUserCheckedInToday(pointRows);
    const orderRows = [
      { label: "待付款", value: "0", tone: "pay" },
      { label: "待发货", value: String(getUserOrders().filter((item) => nOrder(item.status).includes("待发货")).length), tone: "box" },
      { label: "待收货", value: "0", tone: "truck" },
      { label: "待评价", value: String(getUserOrders().filter((item) => nOrder(item.status).includes("待验收")).length), tone: "card" },
      { label: "售后", value: "0", tone: "refund" },
    ];
    const menuRows = [
      { label: "积分管理", sub: "points", icon: "✦" },
      { label: "我的收藏", sub: "collections", icon: "☆" },
      { label: "电子凭证", sub: "invoices", icon: "▭" },
      { label: "我的购物车", sub: "cart", icon: "□" },
      { label: "金融授信", sub: "credit", icon: "¥" },
      { label: "收货地址", sub: "address", icon: "⌖" },
      { label: "优惠券管理", sub: "coupons", icon: "🎫" },
      { label: "退出登录", action: "user-logout", icon: "↧" },
    ];
    return `<div class="user-me-light-home">${renderUserMeProfileHero(profile)}<section class="user-me-red-metrics"><button type="button" data-sub-tab="following"><strong>${socialStats.following}</strong><span>关注</span></button><button type="button" data-sub-tab="postCollections"><strong>${socialStats.postCollections}</strong><span>收藏</span></button><button type="button" data-sub-tab="followers"><strong>${socialStats.followers}</strong><span>粉丝</span></button></section><section class="user-me-white-block"><div style="display:flex; justify-content:space-between; align-items:center; padding:16px 0;"><div><span style="color:var(--text-muted); font-size:13px;">当前积分</span><strong style="display:block; font-size:28px; font-weight:500; color:var(--text);">${pointTotal.toLocaleString("zh-CN")}</strong></div><button class="btn btn-primary" type="button" data-user-action="user-points-checkin" ${checkedIn ? "disabled" : ""} style="min-height:38px; padding:0 14px; font-size:13px; border-radius:20px;">${checkedIn ? "今日已签到" : "每日签到 +10"}</button></div></section><section class="user-me-white-block"><div class="user-me-block-head"><strong>我的订单</strong><button type="button" data-sub-tab="orders">全部订单</button></div><div class="user-me-order-icons">${orderRows.map((item) => `<button type="button" data-sub-tab="orders"><i data-tone="${item.tone}">${item.value}</i><span>${item.label}</span></button>`).join("")}</div></section><section class="user-me-menu-grid">${menuRows.map((item) => item.action ? `<button class="user-me-menu-tile" type="button" data-user-action="${item.action}"><i>${item.icon}</i><span>${item.label}</span></button>` : `<button class="user-me-menu-tile" type="button" data-sub-tab="${item.sub}"><i>${item.icon}</i><span>${item.label}</span></button>`).join("")}</section></div>`;
  }

  function renderUserProfileDetail() {
    const profile = getMockUserAuth() || {};
    const userId = getUserDisplayId(profile);
    const avatarHelp = profile.avatarUrl ? "已上传头像，保存时不选择新图片会继续保留。" : "未上传头像时，个人中心自动显示用户名第一个字。";
    const wechatHtml = profile.wechatNickname ? `<label><span>微信绑定</span><div style="display:flex; align-items:center; gap:10px; padding:8px 12px; border-radius:10px; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08);"><div style="width:32px; height:32px; border-radius:50%; background:linear-gradient(135deg, #07c160, #05a350); display:flex; align-items:center; justify-content:center; font-size:14px;">🌿</div><div style="flex:1; min-width:0;"><strong style="font-size:13px;">${safe(profile.wechatNickname, "微信用户")}</strong><div style="font-size:11px; color:var(--text-muted);">已绑定微信</div></div></div></label>` : "";
    return `<div class="user-me-light-subpage"><section class="user-me-white-block user-profile-edit-card"><div class="user-profile-edit-head">${renderUserPortrait(profile, "large")}<div><strong>${safe(profile.nickname, "顾铭")}</strong><span>用户ID ${userId}</span></div></div><form class="user-me-form light" data-user-profile-form><label><span>用户名</span><input class="input" name="profileNickname" type="text" value="${safe(profile.nickname, "顾铭")}" required></label><label class="user-avatar-upload"><span>头像图片</span><div class="user-avatar-file-wrap"><input class="input" name="profileAvatar" type="file" accept="image/*" data-user-avatar-input><div class="user-avatar-file-trigger"><span>⬆</span><span>点击选择图片</span></div><span class="user-avatar-file-name">未选择任何文件</span></div><small>${avatarHelp}</small></label>${profile.avatarUrl ? `<label class="user-avatar-reset"><input name="profileAvatarReset" type="checkbox"> <span>清除头像，改用用户名首字</span></label>` : ""}<label><span>手机号</span><input class="input" name="profilePhone" type="tel" value="${safe(profile.phone, "13800138000")}" required></label><label><span>设置密码</span><input class="input" name="profilePassword" type="password" placeholder="请输入新密码，不填则不修改"></label>${wechatHtml}<button class="btn btn-primary user-me-full-btn" type="submit">保存个人信息</button></form></section></div>`;
  }

  function renderUserSocialList(title, rows, total = rows.length) {
    return `<div class="user-me-light-subpage"><section class="user-me-white-block"><div class="user-me-block-head"><strong>${title}</strong><span>${total} 条</span></div><div class="user-me-record-list light">${rows.map((item) => `<article><div><strong>${safe(item.name, "-")}</strong>${item.userId ? `<small class="user-me-list-id">用户ID ${safe(item.userId, "-")}</small>` : ""}<span>${safe(item.desc, "-")}</span></div><span>${safe(item.meta, "")}</span></article>`).join("")}</div></section></div>`;
  }

  function renderUserFollowing() {
    return renderUserSocialList("我关注的发帖用户", [
      { userId: "U-20872", name: "RWB_Akira", desc: "宽体 / JDM / 近期发布 3 篇", meta: "已关注" },
      { userId: "U-19645", name: "BoostLife", desc: "动力 / 排气 / 近期发布 5 篇", meta: "已关注" },
      { userId: "U-20312", name: "NightRunner", desc: "姿态 / 街拍 / 近期发布 2 篇", meta: "已关注" },
    ]);
  }

  function renderUserPostCollections() {
    return renderUserSocialList("我收藏的帖子", [
      { name: "宝马 G20 升级 19 寸轮毂后需要重新做四轮定位吗？", desc: "顾铭收藏 / 轮毂 / 定位", meta: "今天" },
      { name: "这套定制宽体终于落地了，碳纤维纹路完美对齐。", desc: "Carbon_King / 宽体 / JDM", meta: "昨天" },
      { name: "全段钛合金排气，这个声浪谁受得了？", desc: "Turbo_Tom / 排气 / 声浪", meta: "3 天前" },
      { name: "隐形车衣怎么选？XPEL LUX PLUS 深度解析", desc: "满改官方 / 科普 / 车衣", meta: "本周" },
      { name: "上海夜晚的街道，才是这台车的归宿。", desc: "Night_Owl / 姿态 / 街拍", meta: "本周" },
      { name: "内饰全 Alcantara 包覆，战斗感直接拉满。", desc: "Craft_Master / 内饰 / 包覆", meta: "本月" },
    ]);
  }

  function renderUserFollowers() {
    return renderUserSocialList("关注我的用户", [
      { userId: "U-18856", name: "Turbo_Tom", desc: "已关注你", meta: "2 小时前" },
      { userId: "U-22501", name: "Night_Owl", desc: "已关注你", meta: "今天" },
      { userId: "U-21740", name: "Craft_Master", desc: "已关注你", meta: "昨天" },
      { userId: "U-23008", name: "EV_Addict", desc: "已关注你", meta: "本周" },
      { userId: "U-21437", name: "Carbon_King", desc: "已关注你", meta: "本周" },
    ], 128);
  }

  function renderUserCollections() {
    const rows = getUserCollections();
    if (!rows.length) {
      return `<section class="user-me-white-block user-me-light-empty"><strong>暂无收藏</strong><span>在商城收藏商品后，可在这里查看和继续下单。</span><button class="btn btn-primary user-me-full-btn" type="button" data-tab="mall">去商城</button></section>`;
    }
    return `<div class="user-me-card-list light">${rows.map((item) => `<section class="user-me-light-product"><div class="user-me-product-thumb"></div><div><strong>${safe(item.name, "收藏商品")}</strong><span>${safe(item.brand, "-")} / ${safe(item.fitment, "适配当前车型")}</span><b>${safe(item.price, "-")}</b></div><button type="button" data-user-action="user-collection-remove" data-user-id="${safe(item.sku, "")}">移除</button></section>`).join("")}</div>`;
  }

  function renderUserInvoices() {
    const orderRows = getUserOrders().filter((item) => ["已支付", "已完成", "待验收", "待发货", "施工中"].some((status) => nOrder(item.status).includes(status) || safe(item.payment, "").includes("已")));
    const invoiceRows = getUserInvoices();
    return `<div class="user-me-light-subpage"><section class="user-me-white-block"><div class="user-me-block-head"><strong>发票申请</strong><span>${invoiceRows.length} 条记录</span></div><form class="user-me-form light" data-user-invoice-form><label><span>选择订单</span><select class="input" name="orderId" required>${orderRows.map((item) => `<option value="${item.id}">${item.id} / ${safe(item.service, "订单")} / ${safe(item.quote, "-")}</option>`).join("")}</select></label><div class="user-me-form-row"><label><span>发票类型</span><select class="input" name="invoiceType"><option value="普票">普票</option><option value="专票">专票</option></select></label><label><span>发票抬头</span><input class="input" name="title" type="text" value="${safe(getMockUserAuth()?.nickname, "顾铭")}" required></label></div><label><span>税号</span><input class="input" name="taxNo" type="text" placeholder="专票必填"></label><label><span>接收邮箱</span><input class="input" name="email" type="email" value="user@example.com" required></label><label><span>联系电话</span><input class="input" name="phone" type="tel" value="${safe(getMockUserAuth()?.phone, "13800138000")}" required></label><label><span>注册地址</span><input class="input" name="address" type="text" value="${getUserDefaultAddress()}" required></label><label><span>开户行</span><input class="input" name="bankName" type="text" placeholder="专票填写开户行"></label><label><span>账号</span><input class="input" name="bankAccount" type="text" placeholder="专票填写账号"></label><button class="btn btn-primary user-me-full-btn" type="submit">提交申请</button></form></section><section class="user-me-white-block"><div class="user-me-block-head"><strong>申请记录</strong><span>${invoiceRows.length}</span></div><div class="user-me-record-list light">${invoiceRows.map((item) => renderInvoiceRecordRow(item)).join("") || `<article><div><strong>暂无发票申请</strong><span>提交后会保存在当前浏览器。</span></div></article>`}</div></section></div>`;
  }

  function renderUserForum() {
    if (state.userForum.createOpen) {
      return `<div class="forum-home-feed"><section class="forum-home-nav"><button class="active" type="button">新建内容</button></section>${renderUserForumCreateForm()}</div><button class="forum-fab" type="button" data-user-action="user-forum-create" aria-label="发帖">＋</button>`;
    }
    const selectedPost = posts.find((p) => p.id === state.userForum.selectedPost);
    if (selectedPost) return renderUserForumDetail(selectedPost);
    const activeFilter = state.userForum.filter || "hot";
    const activeCategory = state.userForum.category || "all";
    const cards = [
      { title: "这套定制宽体终于落地了，碳纤维纹路完美对齐。", author: "Carbon_King", meta: "宽体 / JDM", heat: "1.2k", tone: "cyan", badge: "精选", type: "discussion" },
      { title: "【818活动】BBS轮毂限时85折，适配G20/001FR", author: "满改官方", meta: "活动 / 轮毂", heat: "3.5k", tone: "brand", badge: "官方", type: "official", link: "user-topic-detail.html?topic=818-bbs&product=PR-8801" },
      { title: "G20 330i 升级全段排气 + 锻造轮毂，声浪与姿态兼得", author: "御驰 Performance Studio", meta: "排气 / 轮毂 / 案例", heat: "3.2k", tone: "brand", badge: "热门", type: "case", link: "user-case-detail.html?id=CA-240402-007" },
      { title: "718 Cayman 赛道化改造，从街车到圈速机器", author: "Racing One Atelier", meta: "赛道 / 性能 / 案例", heat: "2.8k", tone: "cyan", badge: "精选", type: "case", link: "user-case-detail.html?id=CA-240401-011" },
      { title: "全段钛合金排气，这个声浪谁受得了？", author: "Turbo_Tom", meta: "排气 / 声浪", heat: "856", tone: "steel", badge: "", type: "discussion" },
      { title: "隐形车衣怎么选？XPEL LUX PLUS深度解析", author: "满改官方", meta: "科普 / 车衣", heat: "2.1k", tone: "brand", badge: "官方", type: "official", link: "user-topic-detail.html?topic=xpel-guide&product=PR-8804" },
      { title: "Model 3P 制动升级 + 底盘调校，赛道日稳了", author: "凌速 High Spec Garage", meta: "制动 / 底盘 / 案例", heat: "1.9k", tone: "steel", badge: "", type: "case", link: "user-case-detail.html?id=CA-240401-011" },
      { title: "上海夜晚的街道，才是这台车的归宿。", author: "Night_Owl", meta: "姿态 / 街拍", heat: "2.4k", tone: "violet", badge: "热门", type: "discussion" },
      { title: "内饰全 Alcantara 包覆，战斗感直接拉满。", author: "Craft_Master", meta: "内饰 / 包覆", heat: "412", tone: "graphite", badge: "", type: "discussion" },
      { title: "电车改装也有春天，这姿态你给几分？", author: "EV_Addict", meta: "电车 / 姿态", heat: "670", tone: "teal", badge: "", type: "discussion" },
    ];
    const postCards = posts.map((p) => {
      const board = (forumBoards || []).find((b) => b.id === p.board);
      return {
        id: p.id,
        title: p.title,
        author: p.author,
        meta: p.meta || "",
        heat: `${(p.replies || 0) + (p.likes || 0)}`,
        tone: "brand",
        badge: board ? board.name : "",
        type: p.type || "discussion",
        isPost: true,
      };
    });
    let rows = [...postCards, ...cards];
    if (activeCategory === "official") rows = rows.filter((item) => item.type === "official");
    if (activeCategory === "discussion") rows = rows.filter((item) => item.type === "discussion");
    if (activeCategory === "case") rows = rows.filter((item) => item.type === "case");
    if (activeCategory === "mine") rows = rows.filter((item) => item.author === "当前用户");
    const featured = rows[0] || cards[0];
    const navTabs = [
      { id: "all", label: "推荐" },
      { id: "official", label: "官方资讯" },
      { id: "discussion", label: "玩家讨论" },
      { id: "case", label: "精选案例" },
      { id: "mine", label: "我的" },
    ];
    const sortTabs = [
      { id: "hot", label: "热门" },
      { id: "latest", label: "最新" },
    ];
    return `<div class="forum-home-feed"><section class="forum-home-nav">${navTabs.map((item) => `<button class="${activeCategory === item.id ? "active" : ""}" type="button" data-user-action="user-forum-category" data-user-id="${item.id}">${item.label}</button>`).join("")}</section><section class="forum-home-topbar"><form class="forum-home-search" data-user-mall-search-form><span>⌕</span><input name="userMallKeyword" value="${safe(state.userMall.keyword, "")}" placeholder="搜索改装案例、品牌、车型" aria-label="搜索改装案例、品牌、车型"></form></section>${activeCategory !== "mine" ? `<section class="forum-sort-row">${sortTabs.map((item) => `<button class="${activeFilter === item.id ? "active" : ""}" type="button" data-user-action="user-forum-filter" data-user-id="${item.id}">${item.label}</button>`).join("")}</section>` : ""}${featured && activeCategory !== "mine" ? `<a class="forum-home-banner" href="${featured.link || "user-topic-detail.html"}"><div class="forum-home-banner-art" data-tone="${featured.tone}"></div><div class="forum-home-banner-copy"><span>${featured.type === "official" ? "官方推荐" : featured.type === "case" ? "精选案例" : "社区精选"}${featured.badge ? ` / ${featured.badge}` : ""}</span><strong>${featured.title}</strong><small>${featured.meta} / ${featured.author}</small></div><div class="forum-home-dots"><i></i><i></i><i></i></div></a>` : ""}<section class="forum-waterfall">${(activeCategory === "mine" ? rows : rows.slice(1)).map((item, index) => item.isPost ? `<button class="forum-waterfall-card ${index % 3 === 1 ? "tall" : ""}" type="button" data-user-action="user-forum-pick" data-user-id="${item.id}"><div class="forum-waterfall-art" data-tone="${item.tone}"></div><div class="forum-waterfall-body"><strong>${item.title}</strong><p>${item.author}${item.meta ? ` / ${item.meta}` : ""}</p><div><span>热度 ${item.heat}</span></div></div></button>` : `<a class="forum-waterfall-card ${index % 3 === 1 ? "tall" : ""}" href="${item.link || "user-topic-detail.html"}"><div class="forum-waterfall-art" data-tone="${item.tone}">${item.linkedProducts?.length ? `<span style="position:absolute;bottom:6px;right:6px;background:rgba(255,106,0,0.9);color:#fff;font-size:11px;padding:2px 8px;border-radius:999px;">已挂商品</span>` : ""}</div><div class="forum-waterfall-body"><strong>${item.title}</strong><p>${item.author}${item.meta ? ` / ${item.meta}` : ""}</p><div><span>热度 ${item.heat}</span>${item.type === "official" ? `<em>查看帖子</em>` : ""}</div></div></a>`).join("")}</section></div><button class="forum-fab" type="button" data-user-action="user-forum-create" aria-label="发帖">＋</button>`;
  }

  function renderUserMessages() {
    const rows = fallback.providerMessages.filter((item) => item.messages.some((message) => message.from === "user" || message.from === "provider" || message.from === "platform"));
    const notifications = getNotificationsForRole("user");
    const selected = rows.find((item) => item.id === state.userMe.selectedMessage);
    markNotificationsRead("user");
    if (!selected) {
      return `<div class="stack user-message-page">${state.userFeedback ? `<div class="provider-feedback">${state.userFeedback}</div>` : ""}<section class="user-message-head"><div><span>Messages</span><strong>消息</strong></div><small>${rows.length} 个会话${notifications.length ? ` / ${notifications.length} 条通知` : ""}</small></section>${notifications.length ? `<section class="mobile-list" style="margin-bottom:12px;">${notifications.map((n) => `<article class="mobile-item" style="background:rgba(255,106,0,0.06); border-left:3px solid #ff6a00;"><div style="display:flex; justify-content:space-between; gap:12px; align-items:flex-start;"><strong>${safe(n.title, "系统通知")}</strong><span style="font-size:11px; color:var(--text-muted);">${safe(n.time, "刚刚")}</span></div><div class="muted" style="margin-top:6px;">${safe(n.content, "")}</div></article>`).join("")}</section>` : ""}<section class="provider-chat-shell user-message-list-shell"><div class="provider-chat-list user-message-list">${rows.map((item) => `<button class="provider-chat-thread user-message-thread" type="button" data-user-action="user-message-pick" data-user-id="${item.id}"><div class="provider-chat-thread-head"><strong>${safe(item.title, "消息")}</strong><span>${safe(item.time, "刚刚")}</span></div><div class="provider-chat-thread-preview">${safe(item.preview, "暂无消息内容")}</div><div class="provider-chat-thread-meta">${tag(safe(item.status, "正常"))}</div></button>`).join("")}</div></section></div>`;
    }
    return `<div class="stack user-message-page">${state.userFeedback ? `<div class="provider-feedback">${state.userFeedback}</div>` : ""}<section class="provider-chat-panel user-message-detail"><header class="provider-chat-header"><button class="user-message-back" type="button" data-user-action="user-message-back">返回</button><div><div class="eyebrow">Realtime Chat</div><h3>${safe(selected.title, "即时对话")}</h3></div>${tag(safe(selected.status, "正常"))}</header><div class="provider-chat-body">${selected.messages.map((message) => `<article class="provider-chat-bubble ${message.from === "user" ? "is-self" : ""}"><div class="provider-chat-bubble-role">${message.from === "user" ? "我" : "服务商"}</div><p>${message.text}</p><time>${message.time}</time></article>`).join("")}</div><form class="provider-chat-composer user-message-composer" data-user-chat-form data-user-id="${selected.id}"><label class="user-message-attach" title="添加附件"><input name="userChatAttachment" type="file" accept="image/*,video/*,.pdf,.doc,.docx" multiple><span>＋</span></label><input class="input" name="userChatMessage" type="text" placeholder="输入消息并实时发送" autocomplete="off"><button class="btn btn-primary" type="submit">发送</button></form></section></div>`;
  }

  function renderUserHistoryOrders() {
    const rows = getUserOrders();
    const selected = rows.find((item) => item.id === state.userMe.selectedOrder);
    return `<div class="mobile-list">${rows.map((item) => {
      const orderStatus = item.userVisibleStatus || (item.rejectReason ? "待接单" : nOrder(item.status));
      const orderProgress = item.userVisibleProgress || safe(item.progress, "处理中");
      return `<div class="admin-inline-block"><button class="mobile-item admin-pick-card ${selected?.id === item.id ? "active" : ""}" type="button" data-user-action="user-order-pick" data-user-id="${item.id}"><strong>${item.id}</strong><div class="muted" style="margin-top:8px;">${safe(item.vehicle, "车型")} / ${safe(item.appointment, "-")}</div><div style="margin-top:8px;">${safe(item.service, "服务")}</div><div class="muted" style="margin-top:8px;">${orderProgress}</div><div style="margin-top:10px; display:flex; gap:10px; flex-wrap:wrap;"><span class="pill">${safe(item.quote, "-")}</span>${tag(orderStatus)}</div></button>${selected?.id === item.id ? renderUserHistoryOrderDetailV2(item) : ""}</div>`;
    }).join("") || `<article class="mobile-item"><strong>暂无历史订单</strong></article>`}</div>`;
  }

  function renderUserGarageVehicles(selectedVehicle) {
    const historyEntries = getVehicleHistoryEntries(selectedVehicle);
    const plateText = safe(selectedVehicle?.plate, "-");
    const codeSeed = plateText.replace(/[^A-Za-z0-9]/g, "").toUpperCase() || "G20330I";
    const vehicleVin = safe(selectedVehicle?.vin, `LSV${codeSeed.padEnd(8, "0").slice(0, 8)}${String((selectedVehicle?.model || "330I").replace(/[^A-Za-z0-9]/g, "")).toUpperCase().padEnd(9, "X").slice(0, 9)}`);
    const engineNo = safe(selectedVehicle?.engineNo, `ENG${codeSeed.padEnd(8, "0").slice(-8)}`);
    const registerDate = safe(selectedVehicle?.registerDate, "2023-05-18");
    const expanded = state.userGarage.detailOpen;
    return `<div class="stack"><div class="admin-action-row user-garage-toolbar"><div class="user-garage-switch-field"><span class="user-garage-switch-label">切换爱车</span><select class="input" id="garage-vehicle-switch" data-user-action="user-vehicle-select">${vehicles.map((item) => `<option value="${getUserVehicleKey(item)}" ${getUserVehicleKey(item) === getUserVehicleKey(selectedVehicle) ? "selected" : ""}>${safe(item.model, "车辆")} / ${safe(item.plate, "-")}</option>`).join("")}</select></div><button class="btn btn-primary user-garage-add-btn" type="button" data-user-action="${state.userGarage.createOpen ? "user-vehicle-cancel" : "user-vehicle-add"}">${state.userGarage.createOpen ? "收起新增" : "新增车辆"}</button></div>${state.userGarage.createOpen ? renderUserVehicleForm() : ""}<button class="admin-detail-card user-garage-profile-card ${expanded ? "expanded" : ""}" type="button" data-user-action="user-garage-detail-toggle" aria-expanded="${expanded ? "true" : "false"}"><div class="eyebrow">Vehicle Profile</div><h3>${safe(selectedVehicle?.model, "未绑定车辆")}</h3><div class="user-garage-photo"></div><div class="user-garage-profile-hint">${expanded ? "点击收起车辆资料" : "点击查看车辆资料"}</div>${expanded ? `<div class="admin-kv-list user-garage-expanded-info"><div><span>车牌号</span><strong>${plateText}</strong></div><div><span>车辆识别代码</span><strong>${vehicleVin}</strong></div><div><span>发动机号码</span><strong>${engineNo}</strong></div><div><span>注册日期</span><strong>${registerDate}</strong></div></div><div class="admin-comment-block user-garage-history"><strong>改装历史</strong><div class="admin-comment-list">${historyEntries.map((entry) => `<div class="admin-comment-item"><p>${entry}</p></div>`).join("")}</div></div>` : ""}</button></div>`;
  }

  function renderUserGarageRender(selectedVehicle) {
    const { materials } = window.MockData;
    const vehicleColors = (materials?.vehicles || []).flatMap((v) => (v.colors || []).map((c) => ({ vehicleId: v.vehicleId || `${v.brand}-${v.series || ""}-${v.model}`, colorName: c.name, colorValue: c.value })));
    const wheelStyles = (materials?.wheels || []).map((w) => ({ name: w.name, brand: w.brand, size: w.size, color: w.wheelColor || w.color, price: w.price, vehicles: w.vehicles || [] }));
    const currentVehicle = selectedVehicle?.model || "宝马 G20 330i";
    const colorRows = vehicleColors.filter((item) => currentVehicle.includes(String(item.vehicleId || "").split("-")[0]));
    const wheelRows = wheelStyles.filter((item) => (item.vehicles || []).some((vehicle) => currentVehicle.includes(String(vehicle || "").split("-")[0])));
    const matchedColors = colorRows.length ? colorRows : fallback.colors;
    const matchedWheels = wheelRows.length ? wheelRows : fallback.wheels;
    const activeColor = matchedColors[state.garageColor] || matchedColors[0] || fallback.colors[0];
    const activeWheel = matchedWheels[state.garageWheel] || matchedWheels[0] || fallback.wheels[0];
    const colorValue = activeColor?.colorValue || activeColor?.value || "#0d0f12";
    const wheelColor = activeWheel?.color || "#c78a47";
    const wheelBrand = safe(activeWheel?.brand, "");
    const relatedProducts = [...products]
      .sort((a, b) => {
        const aScore = (safe(a.brand, "") === wheelBrand ? 3 : 0) + (safe(a.category, "").includes("轮") || safe(a.category, "").includes("杞") ? 1 : 0);
        const bScore = (safe(b.brand, "") === wheelBrand ? 3 : 0) + (safe(b.category, "").includes("轮") || safe(b.category, "").includes("杞") ? 1 : 0);
        return bScore - aScore;
      })
      .slice(0, 3);
    const styleTags = ["黑武士街道风", "赛道性能风", "豪华夜幕风", "低趴姿态风", "原厂升级风"];
    return `<section class="garage-preview"><div class="eyebrow">Render Lab</div><strong style="display:block; margin-top:10px; font-size:22px;">${safe(selectedVehicle?.model, "宝马 G20 330i")} 外观预览</strong><div class="muted" style="margin-top:6px;">颜色和轮毂可手动切换，预览与下方适配商品会自动联动。</div><div class="garage-3d-stage"><div class="garage-3d-car" id="garage3dCar"><div class="garage-3d-wheel left" style="background:radial-gradient(circle, #a3a9b3 0 10%, ${shade(wheelColor, -30)} 12% 44%, #0a0d11 46% 100%);"></div><div class="garage-3d-wheel right" style="background:radial-gradient(circle, #a3a9b3 0 10%, ${shade(wheelColor, -30)} 12% 44%, #0a0d11 46% 100%);"></div><div class="garage-3d-body" style="background:linear-gradient(145deg, ${shade(colorValue, -18)}, ${colorValue});"></div></div></div><div class="garage-style-tags">${styleTags.map((item) => `<span class="garage-style-tag">${item}</span>`).join("")}</div><div class="swatch-row">${matchedColors.map((item, index) => `<button class="swatch ${index === state.garageColor ? "active" : ""}" style="background:${item.colorValue || item.value};" type="button" title="${safe(item.colorName || item.name, "车身颜色")}" data-color-index="${index}"></button>`).join("")}</div></section><section class="mobile-list garage-wheel-list">${matchedWheels.map((item, index) => `<button class="wheel-option ${index === state.garageWheel ? "active" : ""}" type="button" data-wheel-index="${index}"><span><strong>${safe(item.name, "轮毂样式")}</strong><div class="muted" style="margin-top:6px;">${safe(item.size || item.spokes, "-")} / ${safe(item.brand, "高端改装")} / ${safe(item.price, "")}</div></span><span class="wheel-badge" style="background:${item.color || "#c78a47"};"></span></button>`).join("")}</section><section class="garage-related-section"><div class="eyebrow">Recommended</div><h3 style="margin:10px 0 14px;">适配推荐</h3><div class="garage-related-grid">${relatedProducts.map((item) => `<a class="garage-related-card" href="user-product-detail.html?sku=${encodeURIComponent(item.sku || "")}&name=${encodeURIComponent(safe(item.name, "商品"))}&price=${encodeURIComponent(safe(item.price, "¥0"))}&brand=${encodeURIComponent(safe(item.brand, "-"))}&fitment=${encodeURIComponent(safe(item.fitment, "适配当前车型"))}&mallPage=exterior"><div class="garage-related-media" data-tone="${(item.sku || "").length % 4 + 1}"></div><strong>${safe(item.name, "商品")}</strong><div class="muted" style="margin-top:6px; font-size:12px;">${safe(item.brand, "-")}</div><div class="garage-related-price">${safe(item.price, "-")}</div></a>`).join("")}</div></section>`;
  }

  function renderUserMallHome() {
    const categoryMeta = getUserMallCategoryMeta();
    const activeBrand = state.userMall.brand || getUserMallBrandOptions()[0];
    const activeModel = state.userMall.model || getSelectedUserVehicle()?.model || getUserMallModelOptions(activeBrand)[0];
    const rows = getUserMallFilteredProducts(activeBrand, activeModel);
    const cartCount = getUserCartItems().reduce((sum, item) => sum + Number(item.quantity || 0), 0);
    const collectionCount = getUserCollections().length;
    const brandList = [
      ...(window.MockData.brands || []),
      { id: "kw", name: "KW" },
      { id: "hks", name: "HKS" },
      { id: "recaro", name: "RECARO" },
    ].slice(0, 9);
    const duplicatedBrands = [...brandList, ...brandList];
    const categoryRows = categoryMeta.filter((item) => item.id !== "all");
    const activeCategory = state.userMallPage || "all";
    const recommendation = getActiveMallRecommendation();
    const promoProduct = products.find((item) => item.sku === recommendation?.sku) || rows[0] || products[0];
    const promoLabel = recommendation?.label || "本周推荐";
    const promoTitle = recommendation?.title || promoProduct?.name || "精选商品";
    const promoDescription = recommendation?.description || promoProduct?.description || "平台精选商品，适合当前车型与改装偏好。";
    return `<div class="user-mall-v3">${state.userFeedback ? `<div class="provider-feedback">${state.userFeedback}</div>` : ""}<section class="user-mall-v3-top"><div><span>商城</span><strong>改装严选</strong></div><form class="user-mall-v3-search" data-user-mall-search-form><span>⌕</span><input name="userMallKeyword" type="text" value="${safe(state.userMall.keyword, "")}" placeholder="搜索配件、品牌、车型" aria-label="搜索配件、品牌、车型"></form><div class="user-mall-v3-actions"><a class="user-mall-v3-cart" href="user-app.html?tab=me&meTab=cart" aria-label="购物车">购物车${cartCount > 0 ? `<i>${cartCount}</i>` : ""}</a><a class="user-mall-v3-cart user-mall-v3-collections" href="user-app.html?tab=me&meTab=collections" aria-label="收藏列表">收藏${collectionCount > 0 ? `<i>${collectionCount}</i>` : ""}</a></div></section><section class="user-mall-v3-brands" aria-label="品牌方"><div class="mall-brands-scroll">${duplicatedBrands.map((b) => `<div class="mall-brand-item"><div class="mall-brand-logo" data-brand="${b.id}"></div><span>${b.name}</span></div>`).join("")}</div></section><section class="user-mall-v3-tabs"><button class="${activeCategory === "all" ? "active" : ""}" type="button" data-user-action="user-mall-category" data-user-id="all">推荐</button>${categoryRows.map((item) => `<button class="${activeCategory === item.id ? "active" : ""}" type="button" data-user-action="user-mall-category" data-user-id="${item.id}">${item.label}</button>`).join("")}</section><section class="user-mall-v3-hero"><a class="user-mall-v3-hero-art" href="user-product-detail.html?sku=${encodeURIComponent(promoProduct?.sku || "")}&name=${encodeURIComponent(safe(promoProduct?.name, "精选商品"))}&price=${encodeURIComponent(safe(promoProduct?.price, "¥0"))}&brand=${encodeURIComponent(safe(promoProduct?.brand, "-"))}&fitment=${encodeURIComponent(safe(promoProduct?.fitment || promoProduct?.description, "适配当前车型"))}&mallPage=${encodeURIComponent(resolveUserMallPageByCategory(promoProduct?.category))}"><div><span>${safe(promoLabel, "本周推荐")}</span><strong>${safe(promoTitle, "精选商品")}</strong><small>${safe(promoDescription, "平台精选商品，适合当前车型与改装偏好。")}</small></div></a><div class="user-mall-v3-dots"><i></i><i></i><i></i></div></section><section class="user-mall-v3-products"><div class="user-mall-v3-section-head"><strong>${safe(activeModel !== "全部车型" ? activeModel : getSelectedUserVehicle()?.model, "当前车型")}</strong><span>${rows.length} 件商品</span></div><div class="user-mall-v3-grid">${rows.length ? rows.map((item, index) => `<article class="user-mall-v3-card"><a class="user-mall-v3-card-art" href="user-product-detail.html?sku=${encodeURIComponent(item.sku || "")}&name=${encodeURIComponent(safe(item.name, "商品"))}&price=${encodeURIComponent(safe(item.price, "¥0"))}&brand=${encodeURIComponent(safe(item.brand, "-"))}&fitment=${encodeURIComponent(safe(item.fitment || item.description, "适配当前车型"))}&mallPage=${encodeURIComponent(resolveUserMallPageByCategory(item.category))}" data-tone="${(index % 4) + 1}"></a><div class="user-mall-v3-card-body"><strong>${safe(item.name, "商品")}</strong><span>${safe(item.brand, "-")} / ${safe(item.category, "-")}</span><p>${safe(item.fitment, "适配当前车型")}</p><div><b>${safe(item.price, "-")}</b><button class="${isUserProductCollected(item.sku) ? "active" : ""}" type="button" data-user-action="user-mall-collect" data-user-id="${item.sku}">${isUserProductCollected(item.sku) ? "取消收藏" : "收藏"}</button></div></div></article>`).join("") : `<div class="user-mall-empty">暂无符合条件的商品</div>`}</div></section></div>`;
  }

  function renderInvoiceOrderApplyForm(order) {
    return `<form class="user-me-form light user-invoice-inline-form" data-user-invoice-form><input type="hidden" name="orderId" value="${safe(order.id, "")}"><div class="user-me-form-row"><label><span>发票类型</span><select class="input" name="invoiceType"><option value="普票">普票</option><option value="专票">专票</option></select></label><label><span>发票抬头</span><input class="input" name="title" type="text" value="${safe(getMockUserAuth()?.nickname, "顾铭")}" required></label></div><label><span>税号</span><input class="input" name="taxNo" type="text" placeholder="专票必填"></label><label><span>接收邮箱</span><input class="input" name="email" type="email" value="user@example.com" required></label><label><span>联系电话</span><input class="input" name="phone" type="tel" value="${safe(getMockUserAuth()?.phone, "13800138000")}" required></label><label><span>注册地址</span><input class="input" name="address" type="text" value="${getUserDefaultAddress()}" required></label><label><span>开户行</span><input class="input" name="bankName" type="text" placeholder="专票填写开户行"></label><label><span>账号</span><input class="input" name="bankAccount" type="text" placeholder="专票填写账号"></label><div class="user-invoice-form-actions"><button class="btn btn-secondary" type="button" data-user-action="user-invoice-cancel">取消</button><button class="btn btn-primary" type="submit">提交申请</button></div></form>`;
  }

  function renderUserInvoices() {
    const orderRows = getUserOrders();
    const invoiceRows = getUserInvoices();
    const selectedOrder = orderRows.find((item) => safe(item.id, "") === state.userMe.invoiceOrderId);
    return `<div class="user-me-light-subpage user-invoice-list-page"><section class="user-me-white-block"><div class="user-me-block-head"><strong>电子凭证</strong><span>${orderRows.length} 条订单</span></div><div class="user-me-record-list light user-invoice-order-list">${orderRows.map((order) => {
      const invoice = getCurrentInvoiceForOrder(order.id, invoiceRows);
      const hasInvoice = Boolean(invoice);
      const invoiceStatus = hasInvoice ? normalizeUserInvoiceStatus(invoice.status) : "";
      const amount = safe(order.quote || order.amount, "-");
      const orderName = safe(order.service || order.product || order.name, "订单");
      return `<article class="user-invoice-order-row"><div class="user-invoice-order-main"><div><strong>${safe(order.id, "订单")}</strong><span>${orderName} / ${amount}</span><span>${safe(order.vehicle || order.car || order.model, "宝马 G20 330i")} / ${safe(order.status || order.payment, "已支付")}</span></div><div class="user-invoice-order-side">${tag(hasInvoice ? invoiceStatus : "未申请")}${hasInvoice ? `<span>${safe(invoice.id, "发票")} / ${invoiceStatus}${invoice.attachmentName ? ` / ${safe(invoice.attachmentName, "-")}` : ""}</span>` : `<button class="user-invoice-apply-btn" type="button" data-user-action="user-invoice-apply" data-user-id="${safe(order.id, "")}">申请发票</button>`}</div></div>${selectedOrder && safe(selectedOrder.id, "") === safe(order.id, "") && !hasInvoice ? renderInvoiceOrderApplyForm(order) : ""}</article>`;
    }).join("") || `<article><div><strong>暂无可用订单</strong><span>已支付或已完成订单会出现在这里。</span></div></article>`}</div></section><section class="user-me-white-block"><div class="user-me-block-head"><strong>发票记录</strong><span>${invoiceRows.length} 条</span></div><div class="user-me-record-list light">${invoiceRows.map((item) => renderInvoiceRecordRow(item)).join("") || `<article><div><strong>暂无发票记录</strong><span>无发票订单申请后会保存在这里。</span></div></article>`}</div></section></div>`;
  }

  function buildGarageComboOrderLink(vehicle, items) {
    const total = items.reduce((sum, item) => sum + priceToNumber(item.price), 0);
    const name = items.map((item) => item.name).join(" + ");
    const brand = [...new Set(items.map((item) => item.brand).filter(Boolean))].join(" / ");
    const fitment = `${safe(vehicle?.model, "宝马 G20 330i")} 组合改装方案`;
    return `user-order-create.html?sku=${encodeURIComponent("GARAGE-COMBO")}&name=${encodeURIComponent(name)}&price=${encodeURIComponent(formatCurrency(total))}&brand=${encodeURIComponent(brand || "满改严选")}&fitment=${encodeURIComponent(fitment)}&mallPage=garage&quantity=1`;
  }

  function renderUserGarageRender(selectedVehicle) {
    const { materials } = window.MockData;
    const vehicleColors = (materials?.vehicles || []).flatMap((v) => (v.colors || []).map((c) => ({ vehicleId: v.vehicleId || `${v.brand}-${v.series || ""}-${v.model}`, colorName: c.name, colorValue: c.value })));
    const wheelStyles = (materials?.wheels || []).map((w) => ({ name: w.name, brand: w.brand, size: w.size, color: w.wheelColor || w.color, price: w.price, vehicles: w.vehicles || [] }));
    const currentVehicle = selectedVehicle?.model || "宝马 G20 330i";
    const colorRows = vehicleColors.filter((item) => currentVehicle.includes(String(item.vehicleId || "").split("-")[0]));
    const wheelRows = wheelStyles.filter((item) => (item.vehicles || []).some((vehicle) => currentVehicle.includes(String(vehicle || "").split("-")[0])));
    const matchedColors = colorRows.length ? colorRows : fallback.colors;
    const matchedWheels = wheelRows.length ? wheelRows : fallback.wheels;
    const filmRows = [
      { id: "FILM-001", name: "XPEL LUX PLUS 亮面车衣", brand: "XPEL", price: "¥ 12,800", tone: "#dfe9ef", sku: "PR-8804" },
      { id: "FILM-002", name: "XPEL STEALTH 哑光车衣", brand: "XPEL", price: "¥ 15,600", tone: "#7e8790", sku: "PR-8804" },
      { id: "FILM-003", name: "3M 双色改色膜", brand: "3M", price: "¥ 9,800", tone: "#9a6a4a", sku: "PR-8804" },
    ];
    const activeColor = matchedColors[state.garageColor] || matchedColors[0] || fallback.colors[0];
    const activeWheel = matchedWheels[state.garageWheel] || matchedWheels[0] || fallback.wheels[0];
    const activeFilm = state.garageFilm >= 0 ? (filmRows[state.garageFilm] || filmRows[0]) : null;
    const wheelProduct = products.find((item) => item.sku === "PR-8801") || products[0] || {};
    const filmProduct = products.find((item) => item.sku === "PR-8804") || {};
    const colorValue = activeColor?.colorValue || activeColor?.value || "#0d0f12";
    const wheelColor = activeWheel?.color || "#c78a47";
    const colorName = safe(activeColor?.colorName || activeColor?.name, "车身颜色");
    const colorItem = { name: `${colorName} 车身色彩方案`, brand: "满改色彩实验室", price: "¥ 3,800" };
    const wheelItem = {
      name: safe(activeWheel?.name || wheelProduct.name, "轮毂升级"),
      brand: safe(activeWheel?.brand || wheelProduct.brand, "BBS"),
      price: safe(activeWheel?.price || wheelProduct.price, "¥ 18,800"),
    };
    const filmItem = {
      name: safe(activeFilm?.name || filmProduct.name, "车衣方案"),
      brand: safe(activeFilm?.brand || filmProduct.brand, "XPEL"),
      price: safe(activeFilm?.price || filmProduct.price, "¥ 12,800"),
    };
    const comboItems = [
      state.garageWheel >= 0 ? wheelItem : null,
      state.garageFilm >= 0 ? filmItem : null,
      state.garageColor >= 0 ? colorItem : null,
    ].filter(Boolean);
    const comboTotal = comboItems.reduce((sum, item) => sum + priceToNumber(item.price), 0);
    const comboLink = comboItems.length ? buildGarageComboOrderLink(selectedVehicle, comboItems) : "";
    return `<section class="garage-preview garage-config-preview"><div class="eyebrow">Render Lab</div><strong style="display:block; margin-top:10px; font-size:22px;">${safe(selectedVehicle?.model, "宝马 G20 330i")} 外观预览</strong><div class="muted" style="margin-top:6px;">点击选择轮毂、车衣和颜色，点击已选项可取消选择。</div><div class="garage-3d-stage"><div class="garage-3d-car" id="garage3dCar"><div class="garage-3d-wheel left" style="background:radial-gradient(circle, #a3a9b3 0 10%, ${shade(wheelColor, -30)} 12% 44%, #0a0d11 46% 100%);"></div><div class="garage-3d-wheel right" style="background:radial-gradient(circle, #a3a9b3 0 10%, ${shade(wheelColor, -30)} 12% 44%, #0a0d11 46% 100%);"></div><div class="garage-3d-body" style="background:linear-gradient(145deg, ${shade(colorValue, -18)}, ${colorValue}); box-shadow: inset 0 0 0 999px ${activeFilm?.tone ? "rgba(255,255,255,0.04)" : "transparent"};"></div></div></div><div class="garage-config-group"><div class="garage-config-head"><strong>车身颜色</strong><span>${state.garageColor >= 0 ? colorName : "未选择"}</span></div><div class="swatch-row">${matchedColors.map((item, index) => `<button class="swatch ${index === state.garageColor ? "active" : ""}" style="background:${item.colorValue || item.value};" type="button" title="${safe(item.colorName || item.name, "车身颜色")}" data-color-index="${index}"></button>`).join("")}</div></div></section><section class="garage-config-section"><div class="garage-config-head"><strong>轮毂</strong><span>${state.garageWheel >= 0 ? `${wheelItem.brand} / ${wheelItem.price}` : "未选择"}</span></div><div class="garage-choice-list">${matchedWheels.map((item, index) => `<button class="wheel-option ${index === state.garageWheel ? "active" : ""}" type="button" data-wheel-index="${index}"><span><strong>${safe(item.name, "轮毂样式")}</strong><div class="muted" style="margin-top:6px;">${safe(item.size || item.spokes, "-")} / ${safe(item.brand, "高端改装")} / ${safe(item.price, "")}</div></span><span class="wheel-badge" style="background:${item.color || "#c78a47"};"></span></button>`).join("")}</div></section><section class="garage-config-section"><div class="garage-config-head"><strong>车衣</strong><span>${state.garageFilm >= 0 ? `${filmItem.brand} / ${filmItem.price}` : "未选择"}</span></div><div class="garage-choice-list">${filmRows.map((item, index) => `<button class="wheel-option garage-film-option ${index === state.garageFilm ? "active" : ""}" type="button" data-film-index="${index}"><span><strong>${safe(item.name, "车衣方案")}</strong><div class="muted" style="margin-top:6px;">${safe(item.brand, "-")} / ${safe(item.price, "-")}</div></span><span class="wheel-badge" style="background:${item.tone};"></span></button>`).join("")}</div></section><section class="garage-combo-panel"><div class="garage-config-head"><strong>组合方案</strong><span>${formatCurrency(comboTotal)}</span></div><div class="garage-combo-list">${comboItems.length ? comboItems.map((item) => `<article><span>${item.name}</span><strong>${item.brand}</strong><b>${item.price}</b></article>`).join("") : `<article class="muted" style="text-align:center; padding:12px 0;">请在上方选择至少一项</article>`}</div>${comboItems.length ? `<a class="btn btn-primary user-me-full-btn" href="${comboLink}">组合方案下单</a>` : `<button class="btn btn-primary user-me-full-btn" type="button" disabled style="opacity:0.45;">组合方案下单</button>`}</section>`;
  }

  render();
  updateGarageRender();
})();
