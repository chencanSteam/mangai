(function () {
  if (document.body.dataset.page !== "platform-web") return;

  const {
    platform,
    providers,
    users,
    vehicleModels,
    vehicles,
    products,
    categories,
    services,
    orders,
    orderChats,
    serviceChats,
    shipping,
    signing,
    settlements,
    cases,
    posts,
    comments,
    materials,
    system,
  } = window.MockData;
  const providerAccounts = system.providerAccounts || [];

  const sidebarEl = document.getElementById("platformSidebar");
  const contentEl = document.getElementById("platformContent");
  const searchEl = document.getElementById("platformSearch");
  const modalEl = document.getElementById("platformModal");
  const modalCardEl = document.getElementById("platformModalCard");
  const INVOICE_STORAGE_KEY = "mockUserInvoices";
  const MALL_RECOMMENDATION_STORAGE_KEY = "mockMallRecommendations";

  function pushNotification(target, title, content) {
    const list = window.MockData.notifications = window.MockData.notifications || [];
    list.unshift({ id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, target, title, content, time: new Date().toLocaleString("zh-CN", { hour12: false }), read: false });
    while (list.length > 200) list.pop();
    if (typeof window.saveMockData === "function") window.saveMockData();
  }

  const menu = [
    { id: "home", label: "首页" },
    {
      id: "providers",
      label: "服务商管理",
      children: [
        { id: "providerAudit", label: "入驻审核", badge: providers.filter((item) => item.auditStatus === "待审核").length },
        { id: "providerList", label: "服务商列表" },
        { id: "providerAccounts", label: "服务商账号" },
      ],
    },
    {
      id: "users",
      label: "用户管理",
      children: [
        { id: "userList", label: "用户列表" },
        { id: "userVehicles", label: "用户车辆" },
      ],
    },
    {
      id: "products",
      label: "商品管理",
      children: [
        { id: "productList", label: "商品列表" },
        { id: "productCategories", label: "商品分类" },
        { id: "vehicleModelManage", label: "车型管理" },
      ],
    },
    {
      id: "services",
      label: "服务项目管理",
      children: [
        { id: "serviceList", label: "服务项目列表" },
      ],
    },
    {
      id: "orders",
      label: "订单管理",
      children: [
        { id: "orderList", label: "订单列表" },
        { id: "orderAssign", label: "订单分配", badge: orders.filter((item) => item.status === "待分配").length },
        { id: "afterSaleList", label: "售后订单", badge: orders.filter((item) => item.afterSaleStatus === "待平台审核").length },
        { id: "chatRecords", label: "聊天记录", badge: orderChats.length },
        { id: "serviceChat", label: "客服对话", badge: (serviceChats || []).filter((c) => c.unread > 0).length },
      ],
    },
    { id: "logisticsManage", label: "物流管理" },
    { id: "settlements", label: "服务统计" },
    { id: "invoiceManage", label: "发票管理" },
    { id: "promotionManage", label: "活动促销" },
    {
      id: "brands",
      label: "品牌管理",
      children: [
        { id: "brandManage", label: "品牌列表" },
        { id: "brandAccounts", label: "品牌方账号" },
      ],
    },
    { id: "caseManage", label: "案例管理" },
    {
      id: "forum",
      label: "论坛管理",
      children: [
        { id: "forumBoards", label: "版面维护" },
        { id: "forumModerators", label: "版主申请" },
        { id: "forumManage", label: "内容管理" },
      ],
    },
    {
      id: "materials",
      label: "渲染素材管理",
      children: [
        { id: "vehicleMaterials", label: "车型素材" },
        { id: "wheelMaterials", label: "轮毂素材" },
      ],
    },
    {
      id: "system",
      label: "系统管理",
      children: [
        { id: "roles", label: "账号权限" },
        { id: "configs", label: "系统配置" },
      ],
    },
    {
      id: "traffic",
      label: "访客监控",
      children: [
        { id: "visitorMonitor", label: "未登录访客" },
      ],
    },
  ];

  const shortcuts = [
    { page: "providerAudit", title: "入驻审核", desc: "快速处理新提交的服务商资质与门店资料。", icon: "审" },
    { page: "orderAssign", title: "订单分配", desc: "进入待分配服务订单，优先完成派单与改派。", icon: "派" },
    { page: "caseManage", title: "案例管理", desc: "集中审核与维护全平台案例数据。", icon: "案" },
    { page: "settlements", title: "服务统计", desc: "查看服务商服务记录与推荐客户统计。", icon: "统" },
    { page: "invoiceManage", title: "发票管理", desc: "处理用户开票申请与回传。", icon: "票" },
    { page: "promotionManage", title: "活动促销", desc: "配置优惠券与折扣活动。", icon: "促" },
  ];

  const state = {
    activePage: "home",
    activeFilter: "全部",
    selectedIndex: 0,
    search: "",
    serviceChatSelected: null,
    expandedGroups: Object.fromEntries(menu.filter((item) => item.children).map((item) => [item.id, true])),
  };

  const promotionRedemptions = [
    { id: "RC-240401-001", promoId: "PROMO-001", coupon: "SPR-WHEEL-0001", user: "顾铭", orderId: "UO-128674", amount: "¥ 2,820", channel: "用户 App", time: "2026-04-02 10:28", status: "已核销" },
    { id: "RC-240401-002", promoId: "PROMO-001", coupon: "SPR-WHEEL-0002", user: "周恺", orderId: "OD-240401-023", amount: "¥ 2,820", channel: "服务商 Web", time: "2026-04-02 15:46", status: "已核销" },
    { id: "RC-240401-003", promoId: "PROMO-001", coupon: "SPR-WHEEL-0003", user: "沈越", orderId: "OD-240402-011", amount: "¥ 3,375", channel: "用户 App", time: "2026-04-03 09:12", status: "已核销" },
    { id: "RC-240415-001", promoId: "PROMO-002", coupon: "PPF-2000-0001", user: "梁栘", orderId: "UO-240320", amount: "¥ 2,000", channel: "平台录入", time: "待开始", status: "待核销" },
  ];

  const forumBoards = window.MockData.forumBoards || [];


  const forumModerators = [
    { id: "MOD-APPLY-01", account: "御驰 Performance Studio", accountType: "服务商账号", board: "性能改装", reason: "门店长期发布性能升级案例，希望维护板块内容秩序。", status: "待审核" },
    { id: "MOD-APPLY-02", account: "平台巡检", accountType: "平台账号", board: "姿态玩家", reason: "需要协助日常内容审核与活动维护。", status: "已通过" },
    { id: "MOD-APPLY-03", account: "擎速 Motorsport Lab", accountType: "服务商账号", board: "新能源升级", reason: "希望参与新能源案例话题运营与答疑。", status: "已驳回" },
  ];

  const authorizedCommerceAccounts = ["满改官方", "御驰 Performance Studio", "擎速 Motorsport Lab", "平台巡检"];
  const defaultPostGovernance = [
    { top: "置顶", featured: "加精", linkAuth: "已授权", linkedProducts: ["PR-8801"], creatorPinned: "是", creatorHomeRank: 1 },
    { top: "未置顶", featured: "加精", linkAuth: "未授权", linkedProducts: [], creatorPinned: "否", creatorHomeRank: 0 },
    { top: "未置顶", featured: "未加精", linkAuth: "未授权", linkedProducts: [], creatorPinned: "否", creatorHomeRank: 0 },
  ];

  const tagType = (text) => {
    if (!text) return "neutral";
    if (["正常营业", "已通过", "启用", "上架", "正常", "已完成", "已签收", "已结清", "生效中", "首页展示", "正常展示", "已开具", "已支付", "已到账", "置顶", "加精", "已授权", "是"].includes(text)) return "success";
    if (["待审核", "待分配", "待接单", "待发货", "待签收", "待付款", "待确认", "运输中", "关注中", "需复核", "待揽收", "待处理", "待开票", "待到账", "待重派", "未授权"].includes(text)) return "warning";
    if (["已驳回", "驳回修改", "异常签收", "缺货", "暂停接单", "停用", "已停用", "到账异常"].includes(text)) return "danger";
    if (["施工中", "待支付", "部分支付", "已延期"].includes(text)) return "info";
    return "neutral";
  };

  const displayValue = (value, fallback = "-") => {
    if (Array.isArray(value)) return value.length ? value.join(" / ") : fallback;
    return value === undefined || value === null || value === "" ? fallback : value;
  };
  const formatTag = (text) => {
    const value = displayValue(text);
    return `<span class="tag ${tagType(value)}">${value}</span>`;
  };
  const priceToNumber = (value) => Number(String(value || "").replace(/[^\d.]/g, "")) || 0;
  const formatCurrency = (value) => `¥ ${Number(value || 0).toLocaleString("zh-CN")}`;
  const parseFeeRate = (value) => {
    const raw = Number(String(value || "").replace(/[^\d.]/g, "")) || 12;
    return raw > 1 ? raw / 100 : raw;
  };
  const formatFeeRate = (value) => `${Math.round(parseFeeRate(value) * 1000) / 10}%`;
  const normalizeSettlementStatus = (status) => {
    const text = String(status || "");
    if (text.includes("结清") || text.includes("通过")) return "已结清";
    if (text.includes("驳")) return "已驳回";
    if (text.includes("确认") || text.includes("审核中")) return "待确认";
    return "待付款";
  };

  function formatProviderRegion(item) {
    const province = item.locationProvince || "";
    const city = item.locationCity || (item.city ? `${item.city}${item.city.endsWith("市") ? "" : "市"}` : "");
    const county = item.locationCounty || (item.district ? `${item.district}${item.district.endsWith("区") ? "" : "区"}` : "");
    return [province, city && city !== province ? city : "", county].filter(Boolean).join(" / ");
  }

  providers.forEach((item) => {
    item.contractNo = item.contractNo || `HT-2026-${item.id.slice(-4)}`;
    item.contractStatus = item.contractStatus || (item.auditStatus === "已通过" ? "履约中" : "待签约");
    item.contractStart = item.contractStart || "2026-01-01";
    item.contractEnd = item.contractEnd || "2026-12-31";
    item.locationProvince = item.locationProvince || `${item.city}${item.city.endsWith("市") ? "" : "市"}`;
    item.locationCity = item.locationCity || `${item.city}${item.city.endsWith("市") ? "" : "市"}`;
    item.locationCounty = item.locationCounty || `${item.district}${item.district.endsWith("区") ? "" : "区"}`;
    item.locationAddress = item.locationAddress || item.address;
    item.providerRegion = formatProviderRegion(item);
  });

  const orderDeliveryMethodDefaults = {
    "OD-240402-011": "指定地点",
    "OD-240402-008": "自提",
    "OD-240401-023": "自提",
    "OD-240331-017": "指定地点",
    "OD-240329-006": "自提",
  };

  const orderTimelineDefaults = {
    "OD-240402-011": [
      "2026-04-02 09:18 用户提交订单需求",
      "2026-04-02 09:24 平台完成资料校验",
      "2026-04-02 10:28 服务商拒单，订单进入重新分配队列",
    ],
    "OD-240402-008": [
      "2026-04-02 13:42 用户完成支付",
      "2026-04-02 14:00 服务商确认到店排期",
      "2026-04-02 16:30 门店开始施工",
    ],
    "OD-240401-023": [
      "2026-04-01 18:16 用户完成商品下单",
      "2026-04-02 09:10 平台完成库存复核",
      "2026-04-03 09:00 等待录入物流信息",
    ],
    "OD-240331-017": [
      "2026-03-31 17:08 订单完成支付",
      "2026-04-01 11:30 服务商接车并开始施工",
      "2026-04-02 15:40 服务商提交完工验收",
    ],
    "OD-240329-006": [
      "2026-03-29 19:22 用户确认施工方案",
      "2026-03-30 13:00 服务商开始施工",
      "2026-03-31 18:10 用户完成验收并评价",
    ],
  };

  function getNowStamp() {
    const date = new Date();
    const pad = (value) => String(value).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }

  function appendOrderTimeline(order, text) {
    if (!order) return;
    order.timeline = order.timeline || [];
    order.timeline.unshift(`${getNowStamp()} ${text}`);
  }

  posts.forEach((item, index) => {
    const fallback = defaultPostGovernance[index] || defaultPostGovernance[0];
    item.content = item.content || `${item.title} 的正文内容待补充，后台可在发后管理中查看互动和治理记录。`;
    item.topStatus = item.topStatus || fallback.top;
    item.featuredStatus = item.featuredStatus || fallback.featured;
    item.linkAuthStatus = item.linkAuthStatus || (authorizedCommerceAccounts.includes(item.author) ? "已授权" : fallback.linkAuth);
    item.linkedProducts = Array.isArray(item.linkedProducts) ? item.linkedProducts : fallback.linkedProducts.slice();
    item.creatorPinned = item.creatorPinned || fallback.creatorPinned;
    item.creatorHomeRank = Number(item.creatorHomeRank ?? fallback.creatorHomeRank) || 0;
    item.governanceNote = item.governanceNote || "支持置顶、加精、商品链接审核和创作者主页置顶作品。";
    item.timeline = item.timeline || [
      `${item.time || "2026-04-03 10:00"} 帖子发布`,
      `治理状态：${item.topStatus} / ${item.featuredStatus} / 商品链接${item.linkAuthStatus}`,
    ];
  });

  orders.forEach((item) => {
    item.displayType = item.displayType || (item.type === "商品订单" ? "自提" : "改装服务");
    item.paymentMethod = item.paymentMethod || (item.payment === "待支付" ? "微信支付" : "支付宝");
    item.deliveryMethod = item.deliveryMethod || orderDeliveryMethodDefaults[item.id] || "自提";
    item.timeline =
      item.timeline ||
      orderTimelineDefaults[item.id] || [
        `${item.appointment || "2026-04-02 09:00"} 订单创建`,
        `${item.appointment || "2026-04-02 09:00"} 当前进度：${item.progress || "处理中"}`,
      ];
  });

  signing.forEach((item) => {
    item.anomalyPhotos = item.anomalyPhotos || [];
    item.anomalyPhotoCount = item.anomalyPhotos.length ? `${item.anomalyPhotos.length} 张` : "-";
  });

  const serviceRegionOptions = {
    全国: {
      北京市: {
        北京市: ["朝阳区", "海淀区", "通州区"],
      },
      上海市: {
        上海市: ["闵行区", "浦东新区", "徐汇区"],
      },
      浙江省: {
        杭州市: ["余杭区", "西湖区", "滨江区"],
        宁波市: ["鄞州区", "江北区", "海曙区"],
      },
      广东省: {
        深圳市: ["南山区", "福田区", "宝安区"],
        广州市: ["天河区", "番禺区", "黄埔区"],
      },
      四川省: {
        成都市: ["武侯区", "高新区", "锦江区"],
      },
    },
  };

  const normalizedServiceDefaults = [
    { code: "SV-101", name: "高端隐形车衣", regionProvince: "上海市", regionCity: "上海市", regionCounty: "闵行区", basePrice: "¥ 9,800", floatRatio: "12%", status: "启用", desc: "适用于高端轿车、SUV 与新能源车型的隐形车衣施工服务。" },
    { code: "SV-102", name: "轮毂锻造升级", regionProvince: "浙江省", regionCity: "杭州市", regionCounty: "余杭区", basePrice: "¥ 13,800", floatRatio: "15%", status: "启用", desc: "支持多品牌高端轮毂搭配、数据适配与样式咨询。" },
    { code: "SV-103", name: "制动套件升级", regionProvince: "广东省", regionCity: "深圳市", regionCounty: "南山区", basePrice: "¥ 19,800", floatRatio: "18%", status: "启用", desc: "包含适配校核、安装调试与道路测试反馈。" },
    { code: "SV-104", name: "精品氛围灯与内饰包覆", regionProvince: "北京市", regionCity: "北京市", regionCounty: "朝阳区", basePrice: "¥ 6,800", floatRatio: "10%", status: "启用", desc: "偏豪华品牌内饰升级方案，强调质感与整车协调性。" },
    { code: "SV-105", name: "赛道化底盘调校", regionProvince: "四川省", regionCity: "成都市", regionCounty: "武侯区", basePrice: "¥ 5,500", floatRatio: "20%", status: "停用", desc: "适配高性能与赛道取向客户的底盘姿态与设定调校。" },
  ];

  services.splice(
    0,
    services.length,
    ...services.map((item, index) => {
      const fallback = normalizedServiceDefaults[index] || normalizedServiceDefaults[0];
      const regionProvince = item.regionProvince || fallback.regionProvince;
      const regionCity = item.regionCity || fallback.regionCity;
      const regionCounty = item.regionCounty || fallback.regionCounty;
      return {
        code: item.code || fallback.code,
        name: item.name || fallback.name,
        regionProvince,
        regionCity,
        regionCounty,
        area: item.area || `${regionProvince} / ${regionCity} / ${regionCounty}`,
        basePrice: item.basePrice || item.price || fallback.basePrice,
        floatRatio: item.floatRatio || fallback.floatRatio,
        status: item.status || fallback.status,
        desc: item.desc || fallback.desc,
      };
    })
  );

  const normalizedSettlementDefaults = [
    { id: "ST-240402-003", provider: "凌速 High Spec Garage", amount: "¥ 86,300", grossAmount: "¥ 86,300", orders: 4, directOrders: 2, referralOrders: 2, referredUsers: 18, status: "待复核", applyTime: "2026-04-02 09:08", paymentNote: "按服务次数、推荐用户和订单金额统计本期数据。" },
    { id: "ST-240401-005", provider: "擎速 Motorsport Lab", amount: "¥ 128,900", grossAmount: "¥ 128,900", orders: 6, directOrders: 4, referralOrders: 2, referredUsers: 26, status: "待复核", applyTime: "2026-04-01 16:18", paymentNote: "推荐用户转化较高，待运营确认归属。" },
    { id: "ST-240331-004", provider: "御驰 Performance Studio", amount: "¥ 69,500", grossAmount: "¥ 69,500", orders: 3, directOrders: 1, referralOrders: 2, referredUsers: 12, status: "已归档", applyTime: "2026-03-31 13:30", paidAt: "2026-04-01 09:40", paymentNote: "本期服务统计已归档。" },
  ];

  settlements.splice(
    0,
    settlements.length,
    ...settlements.map((item, index) => {
      const fallback = normalizedSettlementDefaults[index] || normalizedSettlementDefaults[0];
      const grossAmount = item.grossAmount || item.amount || fallback.grossAmount || fallback.amount;
      const serviceTimes = Number(item.serviceTimes || item.orders || fallback.orders || 0);
      const directOrders = Number(item.directOrders ?? fallback.directOrders ?? 0);
      const referralOrders = Number(item.referralOrders ?? fallback.referralOrders ?? Math.max(0, serviceTimes - directOrders));
      const referredUsers = Number(item.referredUsers ?? item.referralUsers ?? fallback.referredUsers ?? referralOrders * 6);
      const status = item.status || fallback.status || "待复核";
      return {
        id: item.id || fallback.id,
        provider: item.provider || fallback.provider,
        amount: grossAmount,
        grossAmount,
        orderAmount: grossAmount,
        orders: serviceTimes,
        serviceTimes,
        directOrders,
        referralOrders,
        referredUsers,
        referralUsers: referredUsers,
        applyTime: item.applyTime || fallback.applyTime,
        paidAt: item.paidAt || fallback.paidAt || "",
        get paymentTime() {
          return this.paidAt || this.applyTime || "-";
        },
        status,
        paymentStatus: status,
        paymentNote: item.paymentNote || fallback.paymentNote || "",
        rejectReason: item.rejectReason || "",
        timeline:
          item.timeline ||
          [
            `服务次数：${serviceTimes} 次 / 推荐用户：${referredUsers} 人`,
            `订单金额：${grossAmount}`,
            `统计状态：${status}`,
          ],
      };
    })
  );

  const normalizedCaseDefaults = [
    { id: "CA-240402-007", title: "宝马 G20 曜夜姿态升级", provider: "德驭 Performance Studio", model: "宝马 G20 330i", style: "黑武士街道风", modType: "轮毂改造", cost: "¥ 56,800", audit: "待审核", display: "未展示", content: "整车围绕曜夜黑化、轮毂姿态和车身细节统一做街道性能风升级，突出日常可用与视觉压迫感。", image: "case-bmw-g20-black-style.jpg" },
    { id: "CA-240401-011", title: "极氪 001 FR 赛道化轻改", provider: "Racing One Atelier", model: "极氪 001 FR", style: "赛道性能风", modType: "轮毂改造", cost: "¥ 73,400", audit: "已通过", display: "首页展示", content: "以轻量化轮组、制动强化和姿态微调为核心，构建更偏赛道化的高性能展示案例。", image: "case-zeekr-001fr-track-kit.jpg" },
    { id: "CA-240330-022", title: "奔驰 C260L 豪华氛围内饰", provider: "曜黑 Auto Atelier", model: "奔驰 C260L", style: "豪华夜幕风", modType: "车衣改造", cost: "¥ 18,600", audit: "已驳回", display: "正常展示", content: "围绕车内氛围灯、内饰包覆和细节材质升级，营造夜幕豪华与舒适座舱体验。", image: "case-benz-c260l-luxury-interior.jpg" },
  ];

  cases.splice(
    0,
    cases.length,
    ...cases.map((item, index) => {
      const fallback = normalizedCaseDefaults[index] || normalizedCaseDefaults[0];
      return {
        id: item.id || fallback.id,
        title: item.title || fallback.title,
        provider: item.provider || fallback.provider,
        model: item.model || fallback.model,
        style: item.style || fallback.style,
        modType: item.modType || fallback.modType,
        cost: item.cost || fallback.cost,
        audit: item.audit || fallback.audit,
        display: item.display === "首页推荐" ? "首页展示" : item.display || fallback.display,
        content: item.content || fallback.content,
        image: item.image || fallback.image,
        rejectReason: item.rejectReason || "",
        timeline:
          item.timeline ||
          [
            `案例提交：${item.id || fallback.id}`,
            `所属服务商：${item.provider || fallback.provider}`,
            `当前审核状态：${item.audit || fallback.audit}`,
          ],
      };
    })
  );

  const normalizedPostDefaults = [
    { id: "POST-1182", title: "宝马 G20 升级 19 寸轮毂后需要重新做四轮定位吗？", author: "顾铭", replies: 26, likes: 98, status: "正常", time: "今天 09:24", content: "最近给 G20 换了 19 寸轮毂和新胎，想确认是否一定需要重新做四轮定位，以及街道使用会不会更容易跑偏。", deleteReason: "" },
    { id: "POST-1179", title: "Model 3 Performance 上街道兼顾舒适和支撑的避震怎么选？", author: "陆川", replies: 31, likes: 126, status: "正常", time: "昨天 21:08", content: "想找一套适合日常城市通勤，同时保留一定支撑性的避震方案，预算中高端，欢迎大家分享体验。", deleteReason: "" },
    { id: "POST-1176", title: "某门店案例图带联系方式，是否属于违规导流？", author: "平台巡检", replies: 12, likes: 42, status: "已删除", time: "昨天 18:13", content: "巡检中发现门店案例图存在联系方式与二维码露出，怀疑涉及违规导流，需平台侧做统一处理。", deleteReason: "帖子内容涉及违规导流信息，已按社区规则删除。" },
  ];

  posts.splice(
    0,
    posts.length,
    ...posts.map((item, index) => {
      const fallback = normalizedPostDefaults[index] || normalizedPostDefaults[0];
      return {
        id: item.id || fallback.id,
        title: item.title || fallback.title,
        author: item.author || fallback.author,
        replies: item.replies ?? fallback.replies,
        likes: item.likes ?? fallback.likes,
        status: item.status === "待处理" ? "已删除" : item.status || fallback.status,
        time: item.time || fallback.time,
        content: item.content || fallback.content,
        deleteReason: item.deleteReason || fallback.deleteReason || "",
        timeline:
          item.timeline ||
          [
            `发布时间：${item.time || fallback.time}`,
            `当前状态：${item.status === "待处理" ? "已删除" : item.status || fallback.status}`,
          ],
      };
    })
  );

  const normalizedCommentDefaults = [
    { id: "CM-8823", post: "POST-1179", author: "擎速 Motorsport Lab", content: "如果你更偏日常舒适，建议先避开过硬设定。", status: "正常", time: "今天 10:08", deleteReason: "" },
    { id: "CM-8821", post: "POST-1176", author: "运营审核", content: "属于违规展示，需遮挡并重新提交。", status: "已删除", time: "今天 09:36", deleteReason: "评论涉及违规引导内容，已删除处理。" },
    { id: "CM-8816", post: "POST-1182", author: "德驭 Performance Studio", content: "更换轮毂偏距后建议一定复查定位数据。", status: "正常", time: "昨天 20:15", deleteReason: "" },
  ];

  comments.splice(
    0,
    comments.length,
    ...comments.map((item, index) => {
      const fallback = normalizedCommentDefaults[index] || normalizedCommentDefaults[0];
      return {
        id: item.id || fallback.id,
        post: item.post || fallback.post,
        author: item.author || fallback.author,
        content: item.content || fallback.content,
        status: item.status === "保留留痕" ? "已删除" : item.status || fallback.status,
        time: item.time || fallback.time,
        deleteReason: item.deleteReason || fallback.deleteReason || "",
        timeline:
          item.timeline ||
          [
            `发布时间：${item.time || fallback.time}`,
            `当前状态：${item.status === "保留留痕" ? "已删除" : item.status || fallback.status}`,
          ],
      };
    })
  );

  const normalizedVehicleMaterialDefaults = [
    { id: "VM-001", name: "宝马 G20 330i 侧视素材", brand: "宝马", model: "G20 330i", colorCount: 7, compatibility: "轮毂套装 A/B/C", thumbnail: "material-bmw-g20-side.jpg", source: "3D 扫描重建", updatedAt: "2026-04-01 14:20", status: "启用" },
    { id: "VM-002", name: "奔驰 C260L 夜景素材", brand: "奔驰", model: "C260L", colorCount: 5, compatibility: "豪华轮毂 19 寸", thumbnail: "material-benz-c260l-night.jpg", source: "棚拍修图", updatedAt: "2026-03-29 18:10", status: "启用" },
    { id: "VM-003", name: "极氪 001 FR 猎装素材", brand: "极氪", model: "001 FR", colorCount: 4, compatibility: "性能轮组 P1/P2", thumbnail: "material-zeekr-001fr-hunt.jpg", source: "品牌授权包", updatedAt: "2026-03-26 11:45", status: "启用" },
  ];

  materials.vehicles.splice(
    0,
    materials.vehicles.length,
    ...materials.vehicles.map((item, index) => {
      const fallback = normalizedVehicleMaterialDefaults[index] || normalizedVehicleMaterialDefaults[0];
      return {
        id: item.id || fallback.id,
        name: item.name || fallback.name,
        brand: item.brand || fallback.brand,
        model: item.model || fallback.model,
        colorCount: item.colorCount ?? fallback.colorCount,
        compatibility: item.compatibility || fallback.compatibility,
        thumbnail: item.thumbnail || fallback.thumbnail,
        source: item.source || fallback.source,
        updatedAt: item.updatedAt || fallback.updatedAt,
        status: item.status || fallback.status,
        timeline:
          item.timeline ||
          [
            `素材更新：${item.updatedAt || fallback.updatedAt}`,
            `素材来源：${item.source || fallback.source}`,
            `当前状态：${item.status || fallback.status}`,
          ],
      };
    })
  );

  const normalizedWheelMaterialDefaults = [
    { id: "WM-001", name: "Aurora Blade 19", style: "Y 型锻造", color: "亮黑", size: "19 寸", compatibility: "宝马 G20 / 奔驰 C260L", thumbnail: "wheel-aurora-blade-19.jpg", source: "品牌模型包", updatedAt: "2026-03-30 15:30", status: "启用" },
    { id: "WM-002", name: "RS Track 20", style: "多辐竞技", color: "钛灰", size: "20 寸", compatibility: "极氪 001 FR / Model 3", thumbnail: "wheel-rs-track-20.jpg", source: "建模渲染", updatedAt: "2026-03-28 10:50", status: "启用" },
    { id: "WM-003", name: "Monarch Aero 19", style: "封闭低风阻", color: "雾银", size: "19 寸", compatibility: "新能源轿跑车型", thumbnail: "wheel-monarch-aero-19.jpg", source: "外部采购素材", updatedAt: "2026-03-20 09:15", status: "停用" },
  ];

  materials.wheels.splice(
    0,
    materials.wheels.length,
    ...materials.wheels.map((item, index) => {
      const fallback = normalizedWheelMaterialDefaults[index] || normalizedWheelMaterialDefaults[0];
      return {
        id: item.id || fallback.id,
        name: item.name || fallback.name,
        style: item.style || fallback.style,
        color: item.color || fallback.color,
        size: item.size || fallback.size,
        compatibility: item.compatibility || fallback.compatibility,
        thumbnail: item.thumbnail || fallback.thumbnail,
        source: item.source || fallback.source,
        updatedAt: item.updatedAt || fallback.updatedAt,
        status: item.status || fallback.status,
        timeline:
          item.timeline ||
          [
            `素材更新：${item.updatedAt || fallback.updatedAt}`,
            `素材来源：${item.source || fallback.source}`,
            `当前状态：${item.status || fallback.status}`,
          ],
      };
    })
  );

  const normalizedRoleDefaults = [
    {
      id: "ROLE-001",
      name: "平台管理员",
      scope: "平台 Web + 平台管理端 App",
      members: 12,
      status: "启用",
      description: "负责平台后台的审核、派单、服务统计、案例与系统配置管理。",
      permissions: ["首页总览", "服务商审核", "订单分配", "案例管理", "服务统计", "系统配置"],
      updatedAt: "2026-04-03 11:20",
    },
    {
      id: "ROLE-002",
      name: "服务商运营",
      scope: "服务商 Web + 服务商端 App",
      members: 89,
      status: "启用",
      description: "负责门店经营、案例维护、论坛运营与采购协同。",
      permissions: ["门店经营数据", "案例管理", "论坛互动", "采购记录", "结算查看"],
      updatedAt: "2026-04-02 18:35",
    },
    {
      id: "ROLE-003",
      name: "普通用户",
      scope: "用户 App",
      members: 8602,
      status: "停用",
      description: "平台普通用户账号权限模板，用于约束前台内容与订单能力。",
      permissions: ["案例浏览", "服务下单", "论坛发帖", "爱车渲染", "订单查看"],
      updatedAt: "2026-04-01 09:10",
    },
  ];

  system.roles.splice(
    0,
    system.roles.length,
    ...system.roles.map((item, index) => {
      const fallback = normalizedRoleDefaults[index] || normalizedRoleDefaults[0];
      return {
        id: item.id || fallback.id,
        name: item.name || fallback.name,
        scope: item.scope || fallback.scope,
        members: item.members || fallback.members,
        status: item.status || fallback.status,
        description: item.description || fallback.description,
        permissions: Array.isArray(item.permissions) && item.permissions.length ? item.permissions : fallback.permissions,
        updatedAt: item.updatedAt || fallback.updatedAt,
        timeline:
          item.timeline ||
          [
            `最近更新时间：${item.updatedAt || fallback.updatedAt}`,
            `角色状态：${item.status || fallback.status}`,
            `成员数量：${item.members || fallback.members} 人`,
          ],
      };
    })
  );

  const normalizedConfigDefaults = [
    {
      key: "自动验收时长",
      value: "24 小时",
      scope: "服务订单",
      status: "生效中",
      description: "订单完工后如用户在时限内未确认，系统自动进入验收流程。",
      editor: "平台管理员",
      updatedAt: "2026-04-03 10:20",
    },
    {
      key: "消息模板版本",
      value: "V2.8",
      scope: "订单 / 审核 / 服务统计",
      status: "生效中",
      description: "用于订单流转、审核结果与服务统计通知的统一消息模板版本。",
      editor: "运营中心",
      updatedAt: "2026-04-02 17:45",
    },
    {
      key: "服务统计规则",
      value: "服务次数 + 推荐用户 + 订单金额",
      scope: "服务统计",
      status: "已停用",
      description: "用于配置服务商统计口径，覆盖服务次数、推荐用户与订单金额。",
      editor: "运营中心",
      updatedAt: "2026-04-01 14:15",
    },
  ];

  system.configs.splice(
    0,
    system.configs.length,
    ...system.configs.map((item, index) => {
      const fallback = normalizedConfigDefaults[index] || normalizedConfigDefaults[0];
      return {
        key: item.key || fallback.key,
        value: item.value || fallback.value,
        scope: item.scope || fallback.scope,
        status: item.status || fallback.status,
        description: item.description || fallback.description,
        editor: item.editor || fallback.editor,
        updatedAt: item.updatedAt || fallback.updatedAt,
        timeline:
          item.timeline ||
          [
            `最近修改：${item.updatedAt || fallback.updatedAt}`,
            `修改人：${item.editor || fallback.editor}`,
            `当前状态：${item.status || fallback.status}`,
          ],
      };
    })
  );

  const visitorSessions = [
    {
      id: "VIS-240403-0891",
      fingerprint: "未登录访客 A79F",
      source: "小红书种草页",
      city: "上海",
      device: "iPhone 15 Pro / Safari",
      firstVisit: "今天 10:42",
      lastActive: "2分钟前",
      duration: "12m 48s",
      pageViews: 18,
      currentPage: "高端隐形车衣服务详情",
      pages: ["首页", "服务项目列表", "高端隐形车衣服务详情", "案例：宝马 G20 曜夜姿态升级", "服务商：德驭 Performance Studio"],
      services: ["高端隐形车衣", "精品氛围灯与内饰包覆"],
      products: ["Aurora Blade 19", "陶瓷刹车片套装"],
      casesViewed: ["宝马 G20 曜夜姿态升级", "奔驰 C260L 豪华氛围内饰"],
      postsViewed: ["宝马 G20 升级 19 寸轮毂后需要重新做四轮定位吗？"],
      events: ["10:42 进入首页", "10:45 浏览高端隐形车衣", "10:51 查看宝马 G20 案例", "10:54 进入服务商详情"],
    },
    {
      id: "VIS-240403-0876",
      fingerprint: "未登录访客 C21B",
      source: "百度搜索",
      city: "杭州",
      device: "Windows / Edge",
      firstVisit: "今天 10:16",
      lastActive: "6分钟前",
      duration: "8m 03s",
      pageViews: 11,
      currentPage: "轮毂锻造升级服务",
      pages: ["首页", "商品商城", "轮毂分类", "轮毂锻造升级服务", "论坛：轮毂数据避让"],
      services: ["轮毂锻造升级"],
      products: ["RS Track 20", "Monarch Aero 19"],
      casesViewed: ["极氪 001 FR 赛道化轻改"],
      postsViewed: ["宝马 G20 升级 19 寸轮毂后需要重新做四轮定位吗？", "Model 3 Performance 上街道兼顾舒适和支撑的避震怎么选？"],
      events: ["10:16 搜索落地服务页", "10:18 切换轮毂商品", "10:20 查看论坛帖子", "10:23 二次打开服务详情"],
    },
    {
      id: "VIS-240403-0832",
      fingerprint: "未登录访客 E04D",
      source: "抖音落地页",
      city: "深圳",
      device: "Android / Chrome",
      firstVisit: "今天 09:58",
      lastActive: "12分钟前",
      duration: "5m 19s",
      pageViews: 7,
      currentPage: "案例列表",
      pages: ["首页", "案例列表", "案例：极氪 001 FR 赛道化轻改", "服务项目列表"],
      services: ["制动套件升级"],
      products: ["高性能制动套件"],
      casesViewed: ["极氪 001 FR 赛道化轻改"],
      postsViewed: ["Model 3 Performance 上街道兼顾舒适和支撑的避震怎么选？"],
      events: ["09:58 进入首页", "10:00 打开案例列表", "10:02 查看极氪案例", "10:03 返回服务列表"],
    },
    {
      id: "VIS-240403-0794",
      fingerprint: "未登录访客 B55A",
      source: "自然直接访问",
      city: "北京",
      device: "Mac / Chrome",
      firstVisit: "今天 09:41",
      lastActive: "28分钟前",
      duration: "3m 44s",
      pageViews: 5,
      currentPage: "商品详情",
      pages: ["首页", "商品商城", "商品详情", "论坛首页"],
      services: [],
      products: ["陶瓷刹车片套装"],
      casesViewed: [],
      postsViewed: ["某门店案例图带联系方式，是否属于违规导流？"],
      events: ["09:41 进入首页", "09:42 打开商品详情", "09:44 浏览论坛", "09:45 停止活跃"],
    },
  ];

  const visitorPopularPages = [
    { name: "服务项目列表", views: 286, ratio: 88 },
    { name: "商品商城", views: 243, ratio: 74 },
    { name: "案例列表", views: 198, ratio: 61 },
    { name: "论坛内容", views: 136, ratio: 42 },
  ];

  const visitorHotItems = [
    { type: "服务", name: "高端隐形车衣", views: 92 },
    { type: "商品", name: "RS Track 20", views: 76 },
    { type: "案例", name: "宝马 G20 曜夜姿态升级", views: 68 },
    { type: "帖子", name: "轮毂数据避让", views: 51 },
  ];

  function metric(label, value) {
    return { label, value };
  }

  function makeTableDef(config) {
    return { type: "table", ...config };
  }

  function simpleListDef(title, description, rows, keys, labels) {
    return { type: "simple", title, description, rows, keys, labels };
  }

  function getShippingByOrderId(orderId) {
    return shipping.find((item) => item.orderId === orderId);
  }

  function buildLogisticsRows() {
    const shippingRows = shipping.map((item) => ({
      type: "shipping",
      source: item,
      get logisticsType() {
        return "发货";
      },
      get id() {
        return item.id;
      },
      get orderId() {
        return item.orderId;
      },
      get company() {
        return item.company;
      },
      get number() {
        return item.number;
      },
      get customer() {
        return "-";
      },
      get time() {
        return item.shipTime || "-";
      },
      get status() {
        return item.status;
      },
      get anomalyPhotoCount() {
        return "-";
      },
      get note() {
        return item.note || "-";
      },
    }));
    const signingRows = signing.map((item) => {
      const shippingRecord = getShippingByOrderId(item.orderId);
      return {
        type: "signing",
        source: item,
        get logisticsType() {
          return "签收";
        },
        get id() {
          return item.orderId;
        },
        get orderId() {
          return item.orderId;
        },
        get company() {
          return shippingRecord?.company || item.company || "-";
        },
        get number() {
          return shippingRecord?.number || item.number || "-";
        },
        get customer() {
          return item.customer;
        },
        get time() {
          return item.signTime || "-";
        },
        get status() {
          return item.status;
        },
        get anomalyPhotoCount() {
          return item.anomalyPhotoCount;
        },
        get note() {
          return item.note || "-";
        },
      };
    });
    return [...shippingRows, ...signingRows];
  }

  function getCaseProviderOptions(currentProvider = "") {
    return [...new Set([...providers.map((item) => item.name), ...cases.map((item) => item.provider), currentProvider].filter(Boolean))];
  }

  function getCaseStyleOptions(currentStyle = "") {
    return [...new Set(["黑武士街道风", "赛道性能风", "豪华夜幕风", "轻改姿态风", "质感通勤风", ...cases.map((item) => item.style), currentStyle].filter(Boolean))];
  }

  function getCaseModTypeOptions(currentModType = "") {
    return [...new Set(["车衣改造", "轮毂改造", ...cases.map((item) => item.modType), currentModType].filter(Boolean))];
  }

  function getCaseDisplayHint(display) {
    const hintMap = {
      "首页展示": "会进入首页优先展示位，建议使用更强视觉的标题和封面图。",
      "正常展示": "在案例列表正常展示，适合沉淀标准内容与成交案例。",
      "未展示": "仅保留后台留档，不在前台列表展示。",
    };
    return hintMap[display] || "请选择案例展示状态。";
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
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

  function getMallRecommendationRows() {
    const localRows = readStorageRows(MALL_RECOMMENDATION_STORAGE_KEY);
    return localRows.length ? localRows : (window.MockData.mallRecommendations || []);
  }

  function persistMallRecommendationRows(rows) {
    writeStorageRows(MALL_RECOMMENDATION_STORAGE_KEY, rows);
    window.MockData.mallRecommendations = rows;
  }

  function normalizeInvoiceStatus(status) {
    const text = String(status || "");
    if (text.includes("已开")) return "已开具";
    return "待开票";
  }

  function getInvoiceTimeValue(row) {
    const raw = row.deliveredAt || row.time || row.applyTime || "";
    const parsed = Date.parse(String(raw).replace(/-/g, "/"));
    return Number.isNaN(parsed) ? 0 : parsed;
  }

  function normalizeInvoiceRow(row, index, source = "mock") {
    const order = orders.find((item) => item.id === row.orderId);
    return {
      ...row,
      id: row.id || `INV-MOCK-${String(index + 1).padStart(3, "0")}`,
      orderId: row.orderId || order?.id || "-",
      user: row.user || row.title || "当前用户",
      type: row.type || row.invoiceType || "普票",
      amount: row.amount || order?.quote || "-",
      method: row.method || "电子发票",
      status: normalizeInvoiceStatus(row.status),
      time: row.time || row.applyTime || "",
      title: row.title || row.user || "个人",
      email: row.email || "-",
      phoneNumber: row.phoneNumber || row.phone || "-",
      attachmentName: row.attachmentName || row.fileName || "",
      attachmentType: row.attachmentType || "",
      deliveredAt: row.deliveredAt || "",
      timeline:
        row.timeline ||
        [
          row.time ? `${row.time} 用户提交开票申请` : "用户提交开票申请",
          row.status ? `当前状态：${normalizeInvoiceStatus(row.status)}` : "当前状态：待开票",
        ],
      __invoiceSource: source,
    };
  }

  function getInvoiceRows() {
    const localRows = readStorageRows(INVOICE_STORAGE_KEY).map((row, index) => normalizeInvoiceRow(row, index, "local"));
    const localIds = new Set(localRows.map((row) => row.id));
    const mockRows = (Array.isArray(window.MockData.invoices) ? window.MockData.invoices : [])
      .filter((row) => !localIds.has(row.id))
      .map((row, index) => normalizeInvoiceRow(row, index, "mock"));
    return [...localRows, ...mockRows].sort((a, b) => getInvoiceTimeValue(b) - getInvoiceTimeValue(a));
  }

  const invoiceRows = getInvoiceRows();

  function getInvoiceStatusByOrderId(orderId) {
    const rows = invoiceRows.filter((item) => item.orderId === orderId);
    if (rows.some((item) => normalizeInvoiceStatus(item.status) === "已开具")) return "已开具";
    return rows.length ? "待开票" : "未申请";
  }

  function syncOrderInvoiceStatuses() {
    orders.forEach((order) => {
      order.invoiceStatus = getInvoiceStatusByOrderId(order.id);
    });
  }

  function resolveReceiptStatus(order, paidAmount) {
    if (order.receiptStatus) return order.receiptStatus;
    if ((order.payment || "") === "待支付") return "待到账";
    if (paidAmount <= 0) return "待到账";
    if ((order.paymentMethod || "").includes("对公")) return "待到账";
    return "已到账";
  }

  const orderFinanceDefaults = [
    { originalRate: 1.08, discount: 2600, receiptStatus: "待到账" },
    { originalRate: 1.05, discount: 800, receiptStatus: "已到账" },
    { originalRate: 1.15, discount: 2820, receiptStatus: "已到账" },
    { originalRate: 1.04, discount: 0, receiptStatus: "待到账" },
    { originalRate: 1.12, discount: 1200, receiptStatus: "已到账" },
  ];

  orders.forEach((order, index) => {
    const defaults = orderFinanceDefaults[index % orderFinanceDefaults.length];
    const paidBase = priceToNumber(order.paidAmount || order.userPaidAmount || order.quote);
    const discountAmount = priceToNumber(order.discountAmount) || defaults.discount || 0;
    const originalAmount = priceToNumber(order.originalAmount) || Math.max(paidBase + discountAmount, Math.round(paidBase * defaults.originalRate));
    const paidAmount = order.payment === "待支付" ? 0 : paidBase;
    const receiptStatus = resolveReceiptStatus(order, paidAmount) || defaults.receiptStatus;
    order.originalAmount = formatCurrency(originalAmount);
    order.discountAmount = formatCurrency(discountAmount);
    order.userPaidAmount = formatCurrency(paidAmount);
    order.paymentStatus = order.paymentStatus || order.payment || (paidAmount > 0 ? "已支付" : "待支付");
    order.receiptStatus = receiptStatus;
    order.invoiceStatus = getInvoiceStatusByOrderId(order.id);
    order.transactionNo = order.transactionNo || `TX-${order.id.replace(/[^0-9]/g, "").slice(-8).padStart(8, "0")}-${String(index + 1).padStart(2, "0")}`;
    order.financeTimeline = order.financeTimeline || [
      `${order.appointment || "2026-04-02 09:00"} 订单生成，应收 ${order.originalAmount}`,
      `${order.appointment || "2026-04-02 09:00"} 优惠抵扣 ${order.discountAmount}，用户实付 ${order.userPaidAmount}`,
      `支付状态：${order.paymentStatus} / 到账状态：${order.receiptStatus}`,
    ];
  });

  orders.forEach((order) => {
    const hasProviderReject = Boolean(order.rejectReason || order.rejectedBy || (order.timeline || []).some((item) => String(item).includes("拒单")));
    if (!hasProviderReject) return;
    order.platformInterventionStatus = order.platformInterventionStatus || "待重派";
    order.platformInterventionAction = order.platformInterventionAction || "重派/延期";
    order.userVisibleStatus = order.userVisibleStatus || "待接单";
    order.userVisibleProgress = order.userVisibleProgress || "已提交需求，平台正在安排可接单服务商。";
    order.rejectedBy = order.rejectedBy || order.provider || "服务商";
    order.rejectReason = order.rejectReason || "服务商当前排期或资源不足，无法承接本单。";
    order.delayDeadline = order.delayDeadline || "2026-04-03 18:00";
  });

  syncOrderInvoiceStatuses();

  function getChatTimeRank(value) {
    const text = String(value || "").trim();
    if (!text) return 0;
    if (text === "刚刚") return 1000000;
    const minuteMatch = text.match(/(\d+)\s*分钟(?:前)?/);
    if (minuteMatch) return 1000000 - Number(minuteMatch[1]);
    const todayMatch = text.match(/今天\s*(\d{1,2}):(\d{2})/);
    if (todayMatch) return 900000 + Number(todayMatch[1]) * 60 + Number(todayMatch[2]);
    const yesterdayMatch = text.match(/昨天\s*(\d{1,2}):(\d{2})/);
    if (yesterdayMatch) return 800000 + Number(yesterdayMatch[1]) * 60 + Number(yesterdayMatch[2]);
    const parsed = Date.parse(text.replace(/-/g, "/"));
    return Number.isNaN(parsed) ? 0 : parsed;
  }

  const sortedOrderChats = [...orderChats].sort((a, b) => getChatTimeRank(b.time) - getChatTimeRank(a.time));

  function normalizeCaseRichContent(content) {
    const source = String(content || "").trim();
    if (!source) return "";
    if (/<[a-z][\s\S]*>/i.test(source)) return source;
    return source
      .split(/\n+/)
      .map((item) => item.trim())
      .filter(Boolean)
      .map((item) => `<p>${escapeHtml(item)}</p>`)
      .join("");
  }

  function getCaseContentSummary(content) {
    const wrapper = document.createElement("div");
    wrapper.innerHTML = normalizeCaseRichContent(content);
    const text = wrapper.textContent.replace(/\s+/g, " ").trim();
    return text || "案例说明将显示在这里，建议突出改装亮点、施工重点和最终效果。";
  }

  function renderCaseRichContent(content) {
    const html = normalizeCaseRichContent(content);
    return html ? `<div class="case-rich-content">${html}</div>` : `<div class="case-rich-content"><p>暂无案例说明</p></div>`;
  }

  function getCaseImageMeta(image, imagePreview = "") {
    if (image && typeof image === "object") {
      return {
        name: image.name || "未填写封面图",
        preview: image.url || imagePreview || "",
      };
    }
    return {
      name: image || "未填写封面图",
      preview: imagePreview || "",
    };
  }

  function renderCaseCoverPreview(image, title, compact = false, imagePreview = "") {
    const safeTitle = title || "未填写案例标题";
    const imageMeta = getCaseImageMeta(image, imagePreview);
    const safeImage = imageMeta.name;
    return `
      <div class="case-cover-preview ${compact ? "case-cover-preview-compact" : ""} ${imageMeta.preview ? "has-image" : ""}" ${imageMeta.preview ? `style="background-image:linear-gradient(180deg, rgba(10,12,16,0.14), rgba(10,12,16,0.82)), url('${imageMeta.preview}');"` : ""}>
        <span class="case-cover-preview-tag">${compact ? "CASE" : "案例封面"}</span>
        <strong>${safeTitle}</strong>
        <small>${safeImage}</small>
      </div>
    `;
  }

  function getVehicleModelStats() {
    return [
      metric("车型档案数", String(vehicleModels.length)),
      metric("已启用车型", String(vehicleModels.filter((item) => item.status === "启用").length)),
      metric("待补充车型", String(vehicleModels.filter((item) => item.status === "停用").length)),
      metric("覆盖品牌", String(new Set(vehicleModels.map((item) => item.brand)).size)),
    ];
  }

  function getVehicleModelCode(item) {
    return item?.id || [item?.brand, item?.series, item?.model].filter(Boolean).join("-");
  }

  function parseProductFitmentValue(value) {
    return String(value || "")
      .split("/")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  function getEnabledProductFitmentOptions() {
    return vehicleModels
      .filter((item) => item.status === "启用")
      .map((item) => getVehicleModelCode(item));
  }

  function getProductFitmentSelection(pickerEl) {
    return String(pickerEl?.dataset.selected || "")
      .split("||")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  function renderProductFitmentPickerState(pickerEl) {
    if (!pickerEl) return;
    const options = getEnabledProductFitmentOptions();
    const query = String(pickerEl.querySelector("[data-product-fitment-search]")?.value || "")
      .trim()
      .toLowerCase();
    const selected = getProductFitmentSelection(pickerEl).filter((item) => options.includes(item));
    pickerEl.dataset.selected = selected.join("||");

    const selectedEl = pickerEl.querySelector("[data-product-fitment-selected]");
    const optionsEl = pickerEl.querySelector("[data-product-fitment-options]");
    if (selectedEl) {
      selectedEl.innerHTML = selected.length
        ? selected
            .map(
              (item) => `
                <button class="pill product-fitment-chip" type="button" data-product-fitment-remove="${item}">
                  ${item} ×
                </button>
              `
            )
            .join("")
        : `<div class="muted">请选择适配车型，可多选。</div>`;
    }

    if (optionsEl) {
      const filtered = options.filter((item) => item.toLowerCase().includes(query) && !selected.includes(item));
      optionsEl.innerHTML = filtered.length
        ? filtered
            .map(
              (item) => `
                <button class="product-fitment-option" type="button" data-product-fitment-add="${item}">
                  ${item}
                </button>
              `
            )
            .join("")
        : `<div class="muted">没有可选车型</div>`;
    }
  }

  const defs = {
    home: {
      type: "dashboard",
      title: "首页",
      description: "平台全局总览、待办提醒与关键运营数据。",
    },
    providerAudit: makeTableDef({
      title: "入驻审核",
      description: "查看服务商提交的门店资料、行业资质和门店信息，支持快速审核。",
      filters: ["全部", "待审核", "已通过", "已驳回"],
      stats: [metric("今日新提交", "6"), metric("待补充资料", "4"), metric("驳回重提中", "3"), metric("平均审核时长", "2.1h")],
      columns: [
        { key: "name", label: "服务商" },
        { key: "providerRegion", label: "所在区域" },
        { key: "specialties", label: "主营能力" },
        { key: "auditStatus", label: "审核状态", tag: true },
      ],
      rows: providers,
      filterBy: "auditStatus",
      detail: (row) => ({
        title: row.name,
        badges: [...new Set([row.auditStatus, row.auditStatus === "待审核" ? "" : row.status].filter(Boolean))],
        facts: [
          ["联系人", row.contact],
          ["位置", row.providerRegion],
          ["详细地址", row.locationAddress],
          ["工位数量", `${row.bays} 个`],
          ["营业执照", row.license],
          ["合同编号", row.contractNo],
          ["合同状态", row.contractStatus],
          ["服务能力", row.specialties],
          ["月订单量", `${row.monthOrders} 单`],
        ],
        timeline: row.timeline,
      }),
    }),
    providerList: makeTableDef({
      title: "服务商列表",
      description: "查看已入驻服务商档案、门店状态和历史经营表现。",
      filters: ["全部", "正常营业", "暂停接单"],
      stats: [metric("已入驻门店", "89"), metric("近30日开单率", "81%"), metric("暂停接单", "7"), metric("平均评分", "4.8")],
      columns: [
        { key: "id", label: "编号" },
        { key: "name", label: "门店名称" },
        { key: "providerRegion", label: "所在区域" },
        { key: "monthOrders", label: "月订单" },
        { key: "status", label: "经营状态", tag: true },
      ],
      rows: providers.filter((item) => item.auditStatus === "已通过"),
      filterBy: "status",
      detail: (row) => ({
        title: row.name,
        badges: [row.status, `${row.score} 分`].filter(Boolean),
        facts: [
          ["门店编号", row.id],
          ["地区", row.providerRegion],
          ["门店地址", row.locationAddress],
          ["联系人", row.contact],
          ["合同编号", row.contractNo],
          ["合同状态", row.contractStatus],
          ["擅长", row.specialties],
          ["月订单", `${row.monthOrders} 单`],
          ["营业资质", row.license],
        ],
        timeline: row.timeline,
        businessHistory: [
          ["近30日订单", `${row.monthOrders} 单`],
          ["近90日平均评分", `${row.score} 分`],
          ["近30日客单均值", row.monthOrders >= 35 ? "¥ 18,600" : row.monthOrders >= 25 ? "¥ 15,200" : "¥ 11,800"],
          ["历史状态变化", row.auditStatus === "已驳回" ? "审核未通过，未进入营业状态" : row.status === "暂停接单" ? "3月设备维护后暂停接单" : "持续正常营业"],
        ],
        actions: "providerList",
      }),
    }),
    providerAccounts: makeTableDef({
      title: "服务商账号",
      description: "维护服务商平台账号、角色、状态和最近登录信息。",
      filters: ["全部", "启用", "停用"],
      stats: [
        metric("账号总数", String(providerAccounts.length)),
        metric("启用账号", String(providerAccounts.filter((item) => item.status === "启用").length)),
        metric("停用账号", String(providerAccounts.filter((item) => item.status === "停用").length)),
        metric("覆盖服务商", String(new Set(providerAccounts.map((item) => item.provider)).size)),
      ],
      columns: [
        { key: "provider", label: "所属服务商" },
        { key: "account", label: "登录账号" },
        { key: "name", label: "姓名" },
        { key: "role", label: "角色" },
        { key: "lastLogin", label: "最近登录" },
        { key: "status", label: "账号状态", tag: true },
      ],
      rows: providerAccounts,
      filterBy: "status",
      detail: (row) => ({
        title: row.account,
        badges: [row.status, row.role].filter(Boolean),
        facts: [
          ["所属服务商", row.provider],
          ["登录账号", row.account],
          ["姓名", row.name],
          ["手机号", row.phone],
          ["角色", row.role],
          ["最近登录", row.lastLogin || "-"],
          ["备注", row.note || "-"],
        ],
        timeline: row.timeline || ["暂无处理轨迹"],
        actions: "providerAccounts",
      }),
    }),
    userList: makeTableDef({
      title: "用户列表",
      description: "查看平台注册用户基础信息，支持禁言、封号等处置操作。",
      filters: ["全部", "正常", "禁言", "封号"],
      stats: [metric("平台注册用户", "8,602"), metric("禁言用户", String(window.MockData.users?.filter((u) => u.punish === "禁言").length || 3)), metric("封号用户", String(window.MockData.users?.filter((u) => u.punish === "封号").length || 2)), metric("本月活跃", "2,118"), metric("复购率", "41.7%")],
      columns: [
        { key: "id", label: "用户编号" },
        { key: "account", label: "账号" },
        { key: "name", label: "姓名" },
        { key: "city", label: "城市" },
        { key: "orders", label: "累计订单" },
        { key: "totalSpent", label: "累计消费" },
        { key: "status", label: "账号状态", tag: true },
        { key: "punish", label: "处置状态", tag: true },
        { key: "canLinkProduct", label: "挂链权限", tag: true },
      ],
      rows: users,
      filterBy: "punish",
      detail: (row) => ({
        title: `${row.name} / ${row.favorite}`,
        badges: [row.status, row.punish || "正常", row.canLinkProduct || "未授权"],
        facts: [
          ["用户编号", row.id],
          ["账号", row.account],
          ["城市", row.city],
          ["绑定车辆", `${row.vehicles} 辆`],
          ["累计订单", `${row.orders} 单`],
          ["累计消费", row.totalSpent || "-"],
          ["高频车型", row.favorite],
          ["账号状态", row.status],
          ["处置状态", row.punish || "无"],
          ["挂链权限", row.canLinkProduct || "未授权"],
          ["禁言原因", row.punishReason || "-"],
          ["处置到期", row.punishExpire || "-"],
        ],
        timeline: [
          "最近一次登录：2026-04-02 08:18",
          "最近一次下单：OD-240402-011",
          "最近一次互动：论坛帖子点赞 12 次",
        ],
        actions: "userList",
      }),
    }),
    userVehicles: makeTableDef({
      title: "用户车辆",
      description: "查看用户绑定车辆档案与改装历史资料。",
      filters: ["全部"],
      stats: [metric("已绑定车辆", "12,945"), metric("多车主用户", "19%"), metric("高频改装车型", "宝马 G20"), metric("近30日新增档案", "186")],
      columns: [
        { key: "plate", label: "车牌" },
        { key: "owner", label: "车主" },
        { key: "model", label: "车型" },
        { key: "history", label: "改装历史" },
      ],
      rows: vehicles,
      filterBy: "",
      detail: (row) => ({
        title: row.model,
        badges: [row.color],
        facts: [
          ["车牌", row.plate],
          ["车主", row.owner],
          ["当前车色", row.color],
          ["改装历史", row.history],
        ],
        timeline: [
          "2026-03-28 录入车辆档案",
          "2026-03-30 更新最近施工记录",
          "2026-04-01 追加平台备注",
        ],
        actions: "userVehicles",
      }),
    }),
    visitorMonitor: {
      type: "visitor",
      title: "未登录访客监控",
      description: "追踪未登录访客在服务、商品、案例和论坛内容中的浏览路径。",
      filters: ["全部"],
      filterBy: "",
      stats: [
        metric("今日访客", "1,284"),
        metric("未登录占比", "71%"),
        metric("访客会话", String(visitorSessions.length)),
        metric("平均浏览深度", "7.8页"),
      ],
      rows: visitorSessions,
    },
    productList: makeTableDef({
      title: "商品列表",
      description: "平台统一维护商品信息、价格、库存和适配车型。",
      filters: ["全部", "上架", "缺货"],
      stats: [metric("商品总数", "156"), metric("高端品牌", "24"), metric("在售 SKU", "132"), metric("缺货提醒", "8")],
      columns: [
        { key: "sku", label: "SKU" },
        { key: "name", label: "商品名称" },
        { key: "brand", label: "品牌" },
        { key: "price", label: "价格" },
        { key: "status", label: "状态", tag: true },
      ],
      rows: products,
      filterBy: "status",
      detail: (row) => ({
        title: row.name,
        badges: [row.status, row.category, row.brand],
        image: row.image || "",
        facts: [
          ["类目", row.category],
          ["品牌", row.brand],
          ["原价", row.originalPrice || "-"],
          ["现价", row.price],
          ["库存", `${row.stock}`],
          ["适配车型", row.fitment],
          ["优惠活动", row.promotion ? `${row.promotion.label} · ${row.promotion.discount}` : "暂无活动"],
          ["规格参数", row.spec || "-"],
          ["说明", row.description || "商品说明待补充"],
        ],
        timeline: [
          "2026-03-15 创建商品",
          "2026-03-22 更新适配车型",
          "2026-04-01 同步库存与销售标签",
        ],
        actions: "productList",
        reviews: (window.MockData.productReviews || []).filter((r) => r.sku === row.sku),
      }),
    }),
    productCategories: simpleListDef("商品分类", "商品分类与层级维护。", categories, ["name", "sort", "status"], ["分类名称", "排序", "状态"]),
    vehicleModelManage: makeTableDef({
      title: "车型管理",
      description: "维护商品适配车型档案，补充底盘型号、年份与动力等汽车属性。",
      filters: ["全部", "启用", "停用"],
      stats: getVehicleModelStats(),
      columns: [
        { key: "id", label: "车型编码" },
        { key: "brand", label: "品牌" },
        { key: "series", label: "车系" },
        { key: "model", label: "车型" },
        { key: "chassis", label: "底盘型号" },
        { key: "year", label: "年份" },
        { key: "status", label: "适配状态", tag: true },
      ],
      rows: vehicleModels,
      filterBy: "status",
      detail: (row) => ({
        title: `${row.brand} ${row.series} ${row.model}`,
        badges: [row.status, row.energyType, row.driveType].filter(Boolean),
        facts: [
          ["车型编码", row.id],
          ["品牌", row.brand],
          ["车系", row.series],
          ["车型", row.model],
          ["底盘型号", row.chassis],
          ["年份", row.year],
          ["款型/版本", row.trim || "-"],
          ["能源类型", row.energyType],
          ["驱动形式", row.driveType],
          ["发动机/电机参数", row.powerSpec || "-"],
          ["变速箱", row.transmission || "-"],
          ["车身形式", row.bodyStyle || "-"],
          ["轴距", row.wheelbase || "-"],
        ],
        timeline: row.timeline || ["暂无处理轨迹"],
        actions: "vehicleModelManage",
      }),
    }),
    serviceList: simpleListDef("服务项目列表", "可供用户下单选择的服务项目。", services, ["code", "name", "area", "basePrice", "floatRatio", "desc", "status"], ["编码", "项目名称", "区域", "基准价", "价格浮动比例", "说明", "状态"]),
    orderList: makeTableDef({
      title: "订单列表",
      description: "统一查看商品订单与服务订单的全流程状态、支付入账与发票结果。",
      filters: ["全部", "待分配", "施工中", "待发货", "待签收", "已完成"],
      stats: [
        metric("今日订单", "128"),
        metric("用户实付", formatCurrency(orders.reduce((sum, item) => sum + priceToNumber(item.userPaidAmount), 0))),
        metric("待到账", String(orders.filter((item) => item.receiptStatus !== "已到账").length)),
        metric("待开票", String(orders.filter((item) => item.invoiceStatus === "待开票").length)),
      ],
      columns: [
        { key: "id", label: "订单号" },
        { key: "displayType", label: "订单类型" },
        { key: "user", label: "用户" },
        { key: "originalAmount", label: "订单原价" },
        { key: "discountAmount", label: "优惠" },
        { key: "userPaidAmount", label: "用户实付" },
        { key: "paymentStatus", label: "支付", tag: true },
        { key: "receiptStatus", label: "到账", tag: true },
        { key: "invoiceStatus", label: "发票", tag: true },
        { key: "status", label: "订单状态", tag: true },
      ],
      rows: orders,
      filterBy: "status",
      detail: (row) => ({
        title: row.id,
        badges: [row.status, row.paymentStatus, row.receiptStatus, row.invoiceStatus, row.displayType],
        facts: [
          ["用户", row.user],
          ["车辆", row.vehicle],
          ["项目", row.service],
          ["订单类型", row.displayType],
          ["交货方式", row.deliveryMethod],
          ["支付方式", row.paymentMethod],
          ["服务商", row.provider],
          ["预约安装时间", row.appointment],
          ["订单原价", row.originalAmount],
          ["优惠金额", row.discountAmount],
          ["用户实付", row.userPaidAmount],
          ["支付状态", row.paymentStatus],
          ["到账状态", row.receiptStatus],
          ["发票状态", row.invoiceStatus],
          ["支付流水号", row.transactionNo],
        ],
        timeline: [...(row.financeTimeline || []), ...(row.timeline || [])],
        actions: "orderList",
      }),
    }),
    afterSaleList: makeTableDef({
      title: "售后订单",
      description: "查看用户提交的售后申请，支持审核通过或驳回。",
      filters: ["全部", "待审核", "已通过", "已驳回"],
      stats: [
        metric("待审核", String(orders.filter((item) => item.afterSaleStatus === "待平台审核").length)),
        metric("今日申请", String(orders.filter((item) => item.afterSaleType && item.afterSaleTime && new Date(item.afterSaleTime).toDateString() === new Date().toDateString()).length)),
        metric("已通过", String(orders.filter((item) => item.afterSaleStatus === "已通过").length)),
        metric("已驳回", String(orders.filter((item) => item.afterSaleStatus === "已驳回").length)),
      ],
      columns: [
        { key: "id", label: "订单号" },
        { key: "user", label: "用户" },
        { key: "service", label: "商品/服务" },
        { key: "afterSaleType", label: "售后类型" },
        { key: "afterSaleStatus", label: "售后状态", tag: true },
        { key: "afterSaleTime", label: "申请时间" },
      ],
      rows: orders,
      filterBy: "afterSaleStatus",
      detail: (row) => ({
        title: row.id,
        badges: [row.afterSaleStatus, row.displayType, row.status].filter(Boolean),
        facts: [
          ["用户", row.user],
          ["车辆", row.vehicle],
          ["商品/服务", row.service],
          ["订单类型", row.displayType],
          ["订单金额", row.quote],
          ["支付方式", row.paymentMethod],
          ["售后类型", row.afterSaleType],
          ["售后原因", row.afterSaleReason],
          ["售后状态", row.afterSaleStatus],
          ["申请时间", row.afterSaleTime],
        ],
        timeline: [...(row.timeline || [])],
        actions: "afterSaleList",
      }),
    }),
    orderAssign: makeTableDef({
      title: "订单分配",
      description: "根据用户需求、意向服务商和区域情况进行分配与改派；服务商拒单后可重新派单，用户端仍展示待接单。",
      filters: ["全部", "待分配", "施工中", "已完成"],
      stats: [
        metric("待分配", String(orders.filter((item) => item.status === "待分配").length)),
        metric("待重派", String(orders.filter((item) => item.platformInterventionStatus === "待重派").length)),
        metric("推荐命中率", "88%"),
        metric("派单平均用时", "28 min"),
      ],
      columns: [
        { key: "id", label: "订单号" },
        { key: "user", label: "用户" },
        { key: "service", label: "需求内容" },
        { key: "city", label: "城市" },
        { key: "provider", label: "服务商" },
        { key: "status", label: "状态", tag: true },
      ],
      rows: orders,
      filterBy: "status",
      detail: (row) => ({
        title: `分配建议 / ${row.id}`,
        badges: [row.status, row.city, row.intention].filter(Boolean),
        facts: [
          ["用户", row.user],
          ["车辆", row.vehicle],
          ["项目", row.service],
          ["意向门店", row.intention],
          ["已分配服务商", row.provider],
          ["拒单服务商", row.rejectedBy || "-"],
          ["拒单原因", row.rejectReason || "-"],
          ["建议优先级", row.status === "待分配" ? "高" : "中"],
          ["建议门店", "德驭 / 擎速 / 凌速"],
        ],
        timeline: row.timeline,
        actions: "orderAssign",
      }),
    }),
    chatRecords: makeTableDef({
      title: "聊天记录",
      description: "按订单查看用户与服务商之间的沟通记录，用于纠纷追溯与处理跟进。",
      filters: ["全部"],
      stats: [
        metric("会话总数", String(orderChats.length)),
        metric("最新时间", sortedOrderChats[0]?.time || "-"),
        metric("关联订单", String(new Set(orderChats.map((item) => item.orderId)).size)),
        metric("总消息数", String(orderChats.reduce((sum, item) => sum + (item.messages?.length || 0), 0))),
      ],
      columns: [
        { key: "orderId", label: "订单号" },
        { key: "title", label: "会话" },
        { key: "user", label: "用户" },
        { key: "provider", label: "服务商" },
        { key: "preview", label: "最新消息" },
        { key: "time", label: "最新时间" },
      ],
      rows: sortedOrderChats,
      filterBy: "",
      detail: (row) => ({
        title: row.title,
        badges: [row.orderId, row.time],
        facts: [
          ["订单号", row.orderId],
          ["会话", row.title],
          ["用户", row.user],
          ["服务商", row.provider],
          ["最新消息", row.preview],
          ["更新时间", row.time],
          ["消息条数", `${row.messages?.length || 0} 条`],
        ],
        timeline: row.messages?.map((m) => `${m.time} ${m.from === "user" ? "用户" : m.from === "provider" ? "服务商" : "平台"}: ${m.text}`) || [],
        actions: "chatRecords",
      }),
    }),
    serviceChat: {
      type: "chat",
      title: "客服对话",
      description: "处理用户与服务商向平台客服发起的在线咨询，支持实时回复与状态标记。",
    },
    logisticsManage: simpleListDef(
      "物流管理",
      "统一处理商品订单发货、物流单维护、签收确认和异常签收留证。",
      buildLogisticsRows(),
      ["logisticsType", "id", "orderId", "company", "number", "customer", "time", "status", "anomalyPhotoCount"],
      ["类型", "单据号", "订单号", "物流公司", "物流单号", "签收人", "时间", "状态", "异常照片"]
    ),
    shipping: simpleListDef("发货管理", "商品订单发货信息录入与物流单维护，支持平台和品牌方双录入。", shipping, ["id", "orderId", "company", "number", "entryBy", "status"], ["发货单", "订单号", "物流公司", "物流单号", "录入方", "状态"]),
    signing: simpleListDef("签收管理", "维护订单签收状态、异常备注与异常照片。", signing, ["orderId", "customer", "signTime", "status", "anomalyPhotoCount", "note"], ["订单号", "签收人", "签收时间", "状态", "异常照片", "备注"]),
    settlements: makeTableDef({
      title: "服务统计",
      description: "统计服务商服务次数、推荐用户与订单金额。",
      filters: ["全部"],
      stats: [
        metric("服务商总数", String(providers.filter((p) => p.auditStatus === "已通过").length)),
        metric("服务次数", String(settlements.reduce((sum, item) => sum + Number(item.serviceTimes || item.orders || 0), 0))),
        metric("推荐用户", String(settlements.reduce((sum, item) => sum + Number(item.referredUsers || item.referralUsers || 0), 0))),
        metric("订单金额", formatCurrency(settlements.reduce((sum, item) => sum + priceToNumber(item.orderAmount || item.grossAmount || item.amount), 0))),
      ],
      columns: [
        { key: "name", label: "服务商" },
        { key: "providerRegion", label: "所在区域" },
        { key: "serviceTimes", label: "服务次数" },
        { key: "referredUsers", label: "推荐用户" },
        { key: "orderAmount", label: "订单金额", tag: false },
        { key: "inviteCode", label: "推荐码", tag: false },
      ],
      rows: providers.filter((p) => p.auditStatus === "已通过").map((p) => {
        const record = settlements.find((item) => item.provider === p.name) || {};
        const serviceTimes = Number(record.serviceTimes || record.orders || p.monthOrders || 0);
        const referredUsers = Number(record.referredUsers || record.referralUsers || 0);
        const orderAmount = record.orderAmount || record.grossAmount || p.currentRevenue || "¥ 0";
        const invite = window.MockData.providerInvites?.find((i) => i.providerId === p.id);
        return { ...p, ...record, serviceTimes, referredUsers, orderAmount, inviteCode: invite?.code || "-" };
      }),
      filterBy: "",
      detail: (row) => ({
        title: row.name,
        badges: [`${row.score} 分`].filter(Boolean),
        facts: [
          ["门店编号", row.id],
          ["地区", row.providerRegion],
          ["门店地址", row.locationAddress],
          ["联系人", row.contact],
          ["推荐码", row.inviteCode],
          ["服务次数", `${row.serviceTimes} 次`],
          ["推荐用户", `${row.referredUsers} 人`],
          ["订单金额", row.orderAmount],
          ["营业资质", row.license],
        ],
        timeline: row.timeline || [`服务次数：${row.serviceTimes} 次`, `推荐用户：${row.referredUsers} 人`, `订单金额：${row.orderAmount}`],
        actions: "settlements",
      }),
    }),
    invoiceManage: makeTableDef({
      title: "发票管理",
      description: "处理用户提交的开票申请，支持待开票、上传 PDF/图片与回传用户。",
      filters: ["全部", "待开票", "已开具"],
      stats: [
        metric("待开票", String(invoiceRows.filter((i) => i.status === "待开票").length)),
        metric("已开具", String(invoiceRows.filter((i) => i.status === "已开具").length)),
        metric("本月申请", String(invoiceRows.length)),
      ],
      columns: [
        { key: "id", label: "发票编号" },
        { key: "orderId", label: "关联订单" },
        { key: "user", label: "用户" },
        { key: "type", label: "发票类型" },
        { key: "amount", label: "金额" },
        { key: "method", label: "交付方式" },
        { key: "status", label: "状态", tag: true },
      ],
      rows: invoiceRows,
      filterBy: "status",
      detail: (row) => ({
        title: row.id,
        badges: [row.status, row.type],
        facts: [
          ["发票编号", row.id],
          ["关联订单", row.orderId],
          ["用户", row.user],
          ["发票类型", row.type],
          ["金额", row.amount],
          ["发票抬头", row.title || "-"],
          ["税号", row.taxNo || "-"],
          ["接收邮箱", row.email || "-"],
          ["联系电话", row.phoneNumber || row.phone || "-"],
          ["交付方式", row.method],
          ["附件", row.attachmentName || "未上传"],
          ["状态", row.status],
          ["申请时间", row.time || "-"],
          ["回传时间", row.deliveredAt || "-"],
        ],
        timeline: row.timeline || [row.time ? `${row.time} 用户提交开票申请` : "待开票"],
        actions: "invoiceManage",
      }),
    }),
    promotionManage: makeTableDef({
      title: "活动促销",
      description: "配置优惠券、折扣活动，管理库存与核销比例。",
      filters: ["全部", "进行中", "未开始", "已结束"],
      stats: [
        metric("进行中", String(window.MockData.promotions?.filter((p) => p.status === "进行中").length || 1)),
        metric("未开始", String(window.MockData.promotions?.filter((p) => p.status === "未开始").length || 1)),
        metric("总核销", String(window.MockData.promotions?.reduce((sum, p) => sum + (p.used || 0), 0) || 173)),
      ],
      columns: [
        { key: "id", label: "活动编号" },
        { key: "name", label: "活动名称" },
        { key: "type", label: "类型" },
        { key: "discount", label: "优惠力度" },
        { key: "scope", label: "适用范围" },
        { key: "stock", label: "库存" },
        { key: "used", label: "已核销" },
        { key: "status", label: "状态", tag: true },
      ],
      rows: window.MockData.promotions || [],
      filterBy: "status",
      detail: (row) => ({
        title: row.name,
        badges: [row.status, row.type],
        facts: [
          ["活动编号", row.id],
          ["活动名称", row.name],
          ["优惠类型", row.type],
          ["优惠力度", row.discount],
          ["适用范围", row.scope],
          ["开始时间", row.start],
          ["结束时间", row.end],
          ["发放总量", `${row.stock} 张`],
          ["已核销", `${row.used} 张`],
          ["核销比例", `${Math.round((row.used / row.stock) * 100)}%`],
        ],
        timeline: [`${row.start} 活动创建`, `${row.status === "进行中" ? "当前进行中" : row.status}`],
        redemptions: promotionRedemptions.filter((item) => item.promoId === row.id),
        actions: "promotionManage",
      }),
    }),
    brandManage: makeTableDef({
      title: "品牌列表",
      description: "维护签约品牌信息、Logo、授权文件、销售统计与商品绑定关系。",
      filters: ["全部", "签约", "待签约", "解约"],
      stats: [
        metric("签约品牌", String(window.MockData.brands?.filter((b) => b.status === "签约").length || 6)),
        metric("总销量", String(window.MockData.brands?.reduce((sum, b) => sum + (b.sales || 0), 0) || 7109)),
        metric("授权文件", String(window.MockData.brands?.filter((b) => b.authFile).length || 6)),
        metric("绑定商品", String((window.MockData.products || []).filter((p) => (window.MockData.brands || []).some((b) => b.name === p.brand)).length)),
      ],
      columns: [
        { key: "id", label: "品牌编号" },
        { key: "name", label: "品牌名称" },
        { key: "country", label: "国家" },
        { key: "categories", label: "类目" },
        { key: "sales", label: "平台销量" },
        { key: "status", label: "状态", tag: true },
      ],
      rows: window.MockData.brands || [],
      filterBy: "status",
      detail: (row) => ({
        title: row.name,
        badges: [row.status, row.country],
        facts: [
          ["品牌编号", row.id],
          ["品牌名称", row.name],
          ["品牌简介", row.intro || "-"],
          ["所属国家", row.country],
          ["经营类目", Array.isArray(row.categories) ? row.categories.join(" / ") : row.categories],
          ["平台销量", `${row.sales} 单`],
          ["授权文件", row.authFile || "-"],
          ["合作状态", row.status],
          ["品牌官网", row.website || "-"],
          ["品牌联系人", row.contact || "-"],
          ["入驻时间", row.joinedAt || "-"],
        ],
        timeline: row.salesHistory?.map((h) => `${h.month} 销量 ${h.sales} 单 / 销售额 ${h.amount}`) || ["暂无销售记录"],
        actions: "brandManage",
      }),
    }),
    brandAccounts: makeTableDef({
      title: "品牌方账号",
      description: "管理签约品牌的子账号，支持查看关联订单、录入物流、确认发货。",
      filters: ["全部", "正常", "停用"],
      stats: [
        metric("正常账号", String(window.MockData.brandAccounts?.filter((b) => b.status === "正常").length || 2)),
        metric("关联订单", String(window.MockData.brandAccounts?.reduce((sum, b) => sum + (b.orders || 0), 0) || 210)),
        metric("待发货", String(window.MockData.brandAccounts?.reduce((sum, b) => sum + (b.pending || 0), 0) || 28)),
      ],
      columns: [
        { key: "id", label: "账号编号" },
        { key: "brandName", label: "关联品牌" },
        { key: "account", label: "登录账号" },
        { key: "name", label: "账号名称" },
        { key: "contact", label: "联系方式" },
        { key: "orders", label: "关联订单" },
        { key: "shipped", label: "已发货" },
        { key: "pending", label: "待发货" },
        { key: "status", label: "状态", tag: true },
      ],
      rows: window.MockData.brandAccounts || [],
      filterBy: "status",
      detail: (row) => ({
        title: row.name,
        badges: [row.status, row.brandName],
        facts: [
          ["账号编号", row.id],
          ["关联品牌", row.brandName],
          ["登录账号", row.account],
          ["账号名称", row.name],
          ["联系方式", row.contact],
          ["关联订单", `${row.orders} 单`],
          ["已发货", `${row.shipped} 单`],
          ["待发货", `${row.pending} 单`],
          ["账号状态", row.status],
        ],
        timeline: ["2026-01-01 品牌方账号创建"],
        actions: "brandAccounts",
      }),
    }),
    caseManage: makeTableDef({
      title: "案例管理",
      description: "维护与审核全平台案例数据，支持新增、编辑、删除、审核与展示状态设置。",
      filters: ["全部", "待审核", "已通过", "已驳回", "首页展示", "正常展示", "未展示"],
      stats: [metric("案例总数", String(cases.length)), metric("待审核", String(cases.filter((i) => i.audit === "待审核").length)), metric("首页展示", String(cases.filter((i) => i.display === "首页展示").length)), metric("已驳回", String(cases.filter((i) => i.audit === "已驳回").length))],
      columns: [
        { key: "id", label: "案例编号" },
        { key: "title", label: "案例标题" },
        { key: "provider", label: "服务商" },
        { key: "model", label: "车型" },
        { key: "style", label: "风格" },
        { key: "modType", label: "改装类型" },
        { key: "audit", label: "审核状态", tag: true },
        { key: "display", label: "展示状态", tag: true },
      ],
      rows: cases,
      filterBy: "caseManage",
      detail: (row) => ({
        title: row.title,
        badges: [row.audit, row.display, row.provider],
        facts: [
          ["案例编号", row.id],
          ["案例标题", row.title],
          ["服务商", row.provider],
          ["车型", row.model],
          ["风格", row.style],
          ["改装类型", row.modType],
          ["费用", row.cost],
          ["案例内容", row.content],
          ["图片", row.image],
          ...(row.audit === "已驳回" ? [["驳回原因", row.rejectReason || "无"]] : []),
        ],
        timeline: row.timeline,
        actions: "caseManage",
      }),
    }),
    forumBoards: simpleListDef("版面维护", "维护论坛版面名称、当前版主和状态。", forumBoards, ["name", "currentModerators", "status"], ["版面名称", "当前版主", "状态"]),
    forumModerators: makeTableDef({
      title: "版主申请",
      description: "服务商账号与平台账号可申请成为版主，并对各自板块进行维护。",
      filters: ["全部", "待审核", "已通过", "已驳回"],
      stats: [metric("待审核", "5"), metric("已通过", "12"), metric("平台账号申请", "4"), metric("服务商申请", "9")],
      columns: [
        { key: "id", label: "申请编号" },
        { key: "account", label: "申请账号" },
        { key: "accountType", label: "账号类型" },
        { key: "board", label: "申请版面" },
        { key: "status", label: "审核状态", tag: true },
      ],
      rows: forumModerators,
      filterBy: "status",
      detail: (row) => ({
        title: row.account,
        badges: [row.status, row.accountType, row.board],
        facts: [
          ["申请编号", row.id],
          ["申请账号", row.account],
          ["账号类型", row.accountType],
          ["申请版面", row.board],
          ["申请理由", row.reason],
        ],
        timeline: [`申请提交：${row.id}`, `目标版面：${row.board}`, `当前状态：${row.status}`],
        actions: "forumModerators",
      }),
    }),
    forumManage: makeTableDef({
      title: "论坛内容管理",
      description: "按正常论坛信息流展示帖子内容，支持置顶/加精、禁言封禁、授权商品链接和创作者主页置顶作品。",
      filters: ["全部", "正常", "已删除", "置顶", "加精", "已授权"],
      stats: [
        metric("帖子总数", String(posts.length)),
        metric("置顶", String(posts.filter((item) => item.topStatus === "置顶").length)),
        metric("加精", String(posts.filter((item) => item.featuredStatus === "加精").length)),
        metric("挂商品", String(posts.filter((item) => (item.linkedProducts || []).length).length)),
      ],
      columns: [
        { key: "id", label: "帖子编号" },
        { key: "title", label: "标题" },
        { key: "author", label: "作者" },
        { key: "topStatus", label: "置顶", tag: true },
        { key: "featuredStatus", label: "加精", tag: true },
        { key: "linkAuthStatus", label: "商品链接", tag: true },
        { key: "creatorPinned", label: "主页置顶", tag: true },
        { key: "replies", label: "回复数" },
        { key: "likes", label: "点赞数" },
        { key: "views", label: "浏览数" },
        { key: "status", label: "状态", tag: true },
      ],
      rows: posts,
      filterBy: "forumManage",
      detail: (row) => ({
        title: row.title,
        badges: [row.status, row.topStatus, row.featuredStatus, row.linkAuthStatus, row.creatorPinned === "是" ? "主页置顶" : "", row.author].filter(Boolean),
        facts: [
          ["帖子编号", row.id],
          ["标题", row.title],
          ["作者", row.author],
          ["发布时间", row.time],
          ["置顶状态", row.topStatus],
          ["加精状态", row.featuredStatus],
          ["商品链接授权", row.linkAuthStatus],
          ["已挂商品", (row.linkedProducts || []).length ? row.linkedProducts.map((sku) => products.find((item) => item.sku === sku)?.name || sku).join(" / ") : "未挂商品"],
          ["创作者主页置顶", row.creatorPinned === "是" ? `第 ${row.creatorHomeRank || 1} 位` : "未置顶"],
          ["回复数", `${row.replies}`],
          ["点赞数", `${row.likes}`],
          ["浏览数", `${(row.views || 0).toLocaleString("zh-CN")}`],
          ["正文内容", row.content],
          ["治理备注", row.governanceNote || "-"],
          ...(row.status === "已删除" ? [["删除原因", row.deleteReason || "无"]] : []),
        ],
        timeline: row.timeline,
        comments: comments.filter((item) => item.post === row.id),
        actions: "forumManage",
      }),
    }),
    vehicleMaterials: makeTableDef({
      title: "车型素材",
      description: "维护车型渲染图、颜色素材和适配关系。",
      filters: ["全部", "启用", "停用"],
      stats: [metric("车型素材", "36"), metric("启用中", "28"), metric("关联轮组", "52"), metric("本周更新", "6")],
      columns: [
        { key: "id", label: "素材编号" },
        { key: "name", label: "素材名称" },
        { key: "brand", label: "品牌" },
        { key: "model", label: "车型" },
        { key: "productName", label: "关联商品" },
        { key: "colorCount", label: "颜色数" },
        { key: "status", label: "状态", tag: true },
      ],
      rows: materials.vehicles,
      filterBy: "status",
      detail: (row) => ({
        title: row.name,
        badges: [row.status, row.brand, row.model],
        facts: [
          ["素材编号", row.id],
          ["车型品牌", row.brand],
          ["适配车型", row.model],
          ["关联商品", row.productName ? `${row.productName} (${row.sku})` : "未关联"],
          ["颜色数", `${row.colorCount}`],
          ["适配轮组", row.compatibility],
          ["缩略图", row.thumbnail],
          ["素材来源", row.source],
          ["最近更新", row.updatedAt],
        ],
        timeline: row.timeline,
        actions: "vehicleMaterials",
      }),
    }),
    wheelMaterials: makeTableDef({
      title: "轮毂素材",
      description: "维护轮毂样式与组合素材。",
      filters: ["全部", "启用", "停用"],
      stats: [metric("轮毂素材", "48"), metric("启用中", "34"), metric("适配车型组", "18"), metric("本周更新", "4")],
      columns: [
        { key: "id", label: "素材编号" },
        { key: "name", label: "素材名称" },
        { key: "style", label: "样式" },
        { key: "color", label: "颜色" },
        { key: "productName", label: "关联商品" },
        { key: "size", label: "尺寸" },
        { key: "status", label: "状态", tag: true },
      ],
      rows: materials.wheels,
      filterBy: "status",
      detail: (row) => ({
        title: row.name,
        badges: [row.status, row.style, row.color],
        facts: [
          ["素材编号", row.id],
          ["样式", row.style],
          ["颜色", row.color],
          ["尺寸", row.size],
          ["关联商品", row.productName ? `${row.productName} (${row.sku})` : "未关联"],
          ["适配车型组", row.compatibility],
          ["缩略图", row.thumbnail],
          ["素材来源", row.source],
          ["最近更新", row.updatedAt],
        ],
        timeline: row.timeline,
        actions: "wheelMaterials",
      }),
    }),
    roles: makeTableDef({
      title: "账号权限",
      description: "维护平台各端角色、权限范围与账号启停状态。",
      filters: ["全部", "启用", "停用"],
      stats: [metric("角色总数", "6"), metric("启用角色", "4"), metric("覆盖端口", "5"), metric("权限组", "23")],
      columns: [
        { key: "id", label: "角色编号" },
        { key: "name", label: "角色名称" },
        { key: "scope", label: "访问范围" },
        { key: "members", label: "成员数" },
        { key: "status", label: "状态", tag: true },
      ],
      rows: system.roles,
      filterBy: "status",
      detail: (row) => ({
        title: row.name,
        badges: [row.status, row.scope],
        facts: [
          ["角色编号", row.id],
          ["角色名称", row.name],
          ["访问范围", row.scope],
          ["成员数量", `${row.members} 人`],
          ["角色说明", row.description],
          ["权限菜单", row.permissions.join(" / ")],
          ["最近更新", row.updatedAt],
        ],
        timeline: row.timeline,
        actions: "roles",
      }),
    }),
    configs: makeTableDef({
      title: "系统配置",
      description: "维护业务规则、消息模板和系统级参数配置。",
      filters: ["全部", "生效中", "已停用"],
      stats: [metric("配置总数", "18"), metric("生效配置", "15"), metric("停用配置", "3"), metric("今日修改", "2")],
      columns: [
        { key: "key", label: "配置项" },
        { key: "value", label: "当前值" },
        { key: "scope", label: "作用范围" },
        { key: "editor", label: "修改人" },
        { key: "status", label: "状态", tag: true },
      ],
      rows: system.configs,
      filterBy: "status",
      detail: (row) => ({
        title: row.key,
        badges: [row.status, row.scope],
        facts: [
          ["配置项", row.key],
          ["当前值", row.value],
          ["作用范围", row.scope],
          ["配置说明", row.description],
          ["修改人", row.editor],
          ["最近更新", row.updatedAt],
        ],
        timeline: row.timeline,
        actions: "configs",
      }),
    }),
  };

  function renderSidebar() {
    sidebarEl.innerHTML = menu
      .map((group) => {
        const isLeaf = !group.children || group.children.length === 0;
        const active = isLeaf ? state.activePage === group.id : group.children.some((item) => item.id === state.activePage);

        if (isLeaf) {
          return `
            <div class="nav-group ${active ? "active" : ""}">
              <button class="nav-item ${active ? "active" : ""}" data-page="${group.id}" type="button">
                <span>${group.label}</span>
              </button>
            </div>
          `;
        }

        const expanded = state.expandedGroups[group.id] !== false;
        return `
          <div class="nav-group ${active ? "active" : ""} ${expanded ? "expanded" : "collapsed"}">
            <button class="nav-trigger ${active ? "active" : ""}" type="button" data-group="${group.id}" aria-expanded="${expanded}">
              <span>${group.label}</span>
              <span class="nav-chevron">${expanded ? "▾" : "▸"}</span>
            </button>
            <div class="nav-children-wrap">
              <div class="nav-children">
                ${group.children
                  .map(
                    (item) => `
                      <button class="nav-item nav-sub-item ${state.activePage === item.id ? "active" : ""}" data-page="${item.id}" type="button">
                        <span>${item.label}</span>
                        ${item.badge ? `<span class="nav-badge">${item.badge}</span>` : ""}
                      </button>
                    `
                  )
                  .join("")}
              </div>
            </div>
          </div>
        `;
      })
      .join("");

    sidebarEl.querySelectorAll("[data-page]").forEach((button) => {
      button.addEventListener("click", () => {
        jumpToPage(button.dataset.page);
      });
    });

    sidebarEl.querySelectorAll("[data-group]").forEach((button) => {
      button.addEventListener("click", () => {
        const groupId = button.dataset.group;
        state.expandedGroups[groupId] = !state.expandedGroups[groupId];
        renderSidebar();
      });
    });
  }

  function jumpToPage(pageId) {
    state.activePage = pageId;
    state.activeFilter = "全部";
    state.selectedIndex = 0;
    if (pageId !== "serviceChat") state.serviceChatSelected = null;
    const parentGroup = menu.find((group) => group.children && group.children.some((item) => item.id === pageId));
    if (parentGroup) state.expandedGroups[parentGroup.id] = true;
    renderSidebar();
    renderPage();
  }

  function renderPage() {
    const def = defs[state.activePage];
    if (!def) return;

    if (def.type === "dashboard") {
      contentEl.innerHTML = renderDashboard();
      bindDashboardEvents();
      return;
    }

    if (def.type === "chat") {
      renderServiceChatPage();
      return;
    }

    if (def.type === "table") {
      if (state.activePage === "forumManage") {
        renderForumManagePage(def);
        return;
      }
      renderTablePage(def);
      return;
    }

    if (def.type === "visitor") {
      renderVisitorMonitorPage(def);
      return;
    }

    renderSimplePage(def);
  }

  function renderDashboard() {
    return `
      <section class="page-heading platform-page-heading">
        <h1>首页</h1>
      </section>
      <section class="platform-home-hero">
        <article class="panel platform-home-stage">
          <div class="platform-home-stage-head">
            <div>
              <div class="platform-home-kicker">Control Center</div>
              <h2>平台控制台</h2>
            </div>
            <div class="platform-home-glow"></div>
          </div>
          <div class="platform-home-kpi-grid">
            ${platform.kpis
              .map(
                (item, index) => `
                  <article class="platform-home-kpi" data-tone="${(index % 4) + 1}">
                    <span>${item.label}</span>
                    <strong>${item.value}</strong>
                  </article>
                `
              )
              .join("")}
          </div>
        </article>
      </section>
      <section class="platform-home-command-grid">
        ${shortcuts
          .map(
            (item) => `
              <button class="platform-home-command" type="button" data-shortcut-page="${item.page}">
                <span class="platform-home-command-mark">${item.icon}</span>
                <strong>${item.title}</strong>
              </button>
            `
          )
          .join("")}
      </section>
      <section class="platform-home-grid">
        <article class="panel dashboard-card platform-home-panel">
          <div class="panel-header">
            <div><h2 class="section-title">订单结构</h2></div>
          </div>
          <div class="trend-chart platform-home-chart">
            ${platform.trend
              .map(
                (item) => `
                  <div class="bar-group">
                    <div class="bar-stack">
                      <span class="bar accent" style="height:${item.services * 0.55}px"></span>
                      <span class="bar info" style="height:${item.retail * 1.3}px"></span>
                    </div>
                    <span class="muted">${item.month}</span>
                  </div>
                `
              )
              .join("")}
          </div>
        </article>
        <article class="panel dashboard-card platform-home-panel">
          <div class="panel-header">
            <div><h2 class="section-title">待处理事项</h2></div>
          </div>
          <div class="platform-home-queue">
            ${platform.todo
              .map(
                (item, index) => `
                  <button class="platform-home-queue-item" type="button" data-shortcut-page="${shortcuts[index]?.page || "orderAssign"}">
                    <span>${item.title}</span>
                    <strong>${item.value}</strong>
                  </button>
                `
              )
              .join("")}
          </div>
        </article>
      </section>
      <section class="platform-home-grid">
        <article class="panel dashboard-card platform-home-panel">
          <div class="panel-header">
            <div><h2 class="section-title">重点告警</h2></div>
          </div>
          <table class="alert-table">
            <thead>
              <tr><th>级别</th><th>单据</th><th>原因</th><th>责任模块</th><th>时间</th></tr>
            </thead>
            <tbody>
              ${platform.alerts
                .map(
                  (item) => `
                    <tr>
                      <td>${formatTag(item.level)}</td>
                      <td>${item.item}</td>
                      <td>${item.reason}</td>
                      <td>${item.owner}</td>
                      <td>${item.time}</td>
                    </tr>
                  `
                )
                .join("")}
            </tbody>
          </table>
        </article>
        <article class="panel dashboard-card platform-home-panel">
          <div class="panel-header">
            <div><h2 class="section-title">核心门店</h2></div>
          </div>
          <div class="platform-home-provider-list">
            ${providers
              .slice(0, 4)
              .map(
                (item, index) => `
                  <article class="platform-home-provider">
                    <div class="platform-home-provider-rank">0${index + 1}</div>
                    <div class="platform-home-provider-main">
                      <strong>${item.name}</strong>
                      <div class="platform-home-provider-meta">
                        <span>${item.providerRegion}</span>
                        <span>${item.score}</span>
                        <span>${item.monthOrders}</span>
                      </div>
                    </div>
                  </article>
                `
              )
              .join("")}
          </div>
          <div class="regional-list platform-home-region-list">
            ${platform.regions
              .map(
                (item) => `
                  <div class="regional-item">
                    <strong>${item.name}</strong>
                    <div class="progress"><span style="width:${item.value}%"></span></div>
                    <span class="muted">${item.value}</span>
                  </div>
                `
              )
              .join("")}
          </div>
        </article>
      </section>
    `;
  }

  function bindDashboardEvents() {
    contentEl.querySelectorAll("[data-shortcut-page]").forEach((button) => {
      button.addEventListener("click", () => {
        jumpToPage(button.dataset.shortcutPage);
      });
    });
  }

  function renderServiceChatPage() {
    const chats = serviceChats || [];
    const selectedId = state.serviceChatSelected || (chats[0]?.id || null);
    const selected = chats.find((c) => c.id === selectedId);
    const chatListHtml = chats.map((chat) => {
      const isActive = chat.id === selectedId;
      const roleLabel = String(chat.fromId).startsWith("SP-") ? "服务商" : "用户";
      const statusTag = chat.status === "未处理" ? `<span class="tag warning">未处理</span>` : chat.status === "处理中" ? `<span class="tag info">处理中</span>` : `<span class="tag success">已解决</span>`;
      const unreadBadge = chat.unread > 0 ? `<span class="nav-badge" style="margin-left:auto;">${chat.unread}</span>` : "";
      return `
        <button class="service-chat-thread ${isActive ? "active" : ""}" type="button" data-service-chat-id="${chat.id}">
          <div class="service-chat-avatar">${chat.avatar}</div>
          <div class="service-chat-thread-main">
            <div class="service-chat-thread-head">
              <strong>${chat.fromName}</strong>
              <span class="muted">${chat.time}</span>
            </div>
            <div class="service-chat-thread-title">${roleLabel}</div>
            <div class="service-chat-thread-preview">${chat.preview}</div>
            <div style="margin-top:6px; display:flex; gap:8px; align-items:center;">${statusTag}${unreadBadge}</div>
          </div>
        </button>
      `;
    }).join("");

    const bubblesHtml = selected?.messages?.map((msg) => {
      const isPlatform = msg.from === "platform";
      const alignClass = isPlatform ? "platform-bubble" : msg.from === "user" ? "user-bubble" : "provider-bubble";
      const roleLabel = isPlatform ? "平台客服" : msg.from === "user" ? "用户" : "服务商";
      return `
        <div class="chat-bubble ${alignClass}">
          <div class="chat-bubble-meta">
            <span class="chat-role">${roleLabel}</span>
            <span class="chat-time">${msg.time}</span>
          </div>
          <div class="chat-text">${msg.text}</div>
        </div>
      `;
    }).join("") || '<div class="muted">暂无消息</div>';

    contentEl.innerHTML = `
      <section class="page-heading platform-page-heading">
        <h1>客服对话</h1>
        <p class="muted">处理用户与服务商向平台发起的在线咨询</p>
      </section>
      <section class="service-chat-layout">
        <aside class="service-chat-sidebar">
          <div class="service-chat-sidebar-head">
            <strong>会话列表 (${chats.length})</strong>
            <span class="muted">${chats.filter((c) => c.unread > 0).length} 条未读</span>
          </div>
          <div class="service-chat-list">${chatListHtml}</div>
        </aside>
        <main class="service-chat-main">
          ${selected ? `
            <div class="service-chat-main-head">
              <div>
                <span class="eyebrow">${String(selected.fromId).startsWith("SP-") ? "服务商咨询" : "用户咨询"}</span>
                <h2 class="section-title">${selected.fromName}</h2>
                <p class="section-subtitle">${selected.fromName} · ${selected.status}${selected.orderId ? ` · 关联单号 <a href="#" style="color:#ff6a00;" data-service-chat-goto-order="${selected.orderId}">${selected.orderId}</a>` : ""}</p>
              </div>
              <div style="display:flex; gap:10px; flex-wrap:wrap;">
                ${formatTag(selected.status)}
                ${selected.status === "未处理" ? `<button class="btn btn-success" type="button" data-service-chat-action="mark-processing" data-service-chat-id="${selected.id}">标记处理中</button>` : ""}
                ${selected.status !== "已解决" ? `<button class="btn btn-secondary" type="button" data-service-chat-action="mark-resolved" data-service-chat-id="${selected.id}">标记已解决</button>` : ""}
              </div>
            </div>
            <div class="chat-record-panel service-chat-panel">${bubblesHtml}</div>
            <div class="service-chat-composer">
              <input class="input" type="text" placeholder="输入回复内容，按 Enter 发送" data-service-chat-input data-service-chat-id="${selected.id}">
              <button class="btn btn-primary" type="button" data-service-chat-action="send" data-service-chat-id="${selected.id}">发送</button>
            </div>
          ` : `<div class="muted" style="display:flex; align-items:center; justify-content:center; height:100%;">暂无会话</div>`}
        </main>
      </section>
    `;
    bindServiceChatEvents();
  }

  function bindServiceChatEvents() {
    contentEl.querySelectorAll("[data-service-chat-id]").forEach((button) => {
      button.addEventListener("click", () => {
        const chatId = button.dataset.serviceChatId;
        if (button.dataset.serviceChatAction === "send") {
          const input = contentEl.querySelector(`[data-service-chat-input][data-service-chat-id="${chatId}"]`);
          const text = input?.value.trim();
          if (!text) return;
          const chat = serviceChats.find((c) => c.id === chatId);
          if (!chat) return;
          chat.messages = chat.messages || [];
          chat.messages.push({ from: "platform", text, time: new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit", hour12: false }) });
          chat.preview = text;
          chat.time = "刚刚";
          if (chat.status === "未处理") chat.status = "处理中";
          input.value = "";
          renderServiceChatPage();
          renderSidebar();
          return;
        }
        if (button.dataset.serviceChatAction === "mark-processing") {
          const chat = serviceChats.find((c) => c.id === chatId);
          if (chat) { chat.status = "处理中"; renderServiceChatPage(); renderSidebar(); }
          return;
        }
        if (button.dataset.serviceChatAction === "mark-resolved") {
          const chat = serviceChats.find((c) => c.id === chatId);
          if (chat) { chat.status = "已解决"; renderServiceChatPage(); renderSidebar(); }
          return;
        }
        const chat = serviceChats.find((c) => c.id === chatId);
        if (chat) { chat.unread = 0; }
        state.serviceChatSelected = chatId;
        renderServiceChatPage();
        renderSidebar();
      });
    });
    contentEl.querySelectorAll("[data-service-chat-input]").forEach((input) => {
      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          const chatId = input.dataset.serviceChatId;
          const sendBtn = contentEl.querySelector(`[data-service-chat-action="send"][data-service-chat-id="${chatId}"]`);
          if (sendBtn) sendBtn.click();
        }
      });
    });
  }

  function renderVisitorChips(items, emptyText = "暂无记录") {
    if (!items || !items.length) return `<span class="muted">${emptyText}</span>`;
    return items.map((item) => `<span class="visitor-chip">${item}</span>`).join("");
  }

  function renderVisitorDetail(row) {
    if (!row) {
      return `<div class="page-heading"><h1 style="font-size:24px;">暂无访客详情</h1></div>`;
    }

    return `
      <div class="panel-header">
        <div>
          <h2 class="section-title">${row.fingerprint}</h2>
        </div>
      </div>
      <div class="kv-list visitor-detail-kv">
        <div class="kv-row"><span class="muted">访客编号</span><strong>${row.id}</strong></div>
        <div class="kv-row"><span class="muted">城市</span><strong>${row.city}</strong></div>
        <div class="kv-row"><span class="muted">设备</span><strong>${row.device}</strong></div>
        <div class="kv-row"><span class="muted">首次访问</span><strong>${row.firstVisit}</strong></div>
        <div class="kv-row"><span class="muted">最近活跃</span><strong>${row.lastActive}</strong></div>
      </div>
      <div class="visitor-detail-section">
        <h3>浏览页面</h3>
        <div class="visitor-path">
          ${row.pages.map((item, index) => `<span>${index + 1}. ${item}</span>`).join("")}
        </div>
      </div>
      <div class="visitor-detail-section">
        <h3>已查看内容</h3>
        <div class="visitor-content-groups">
          <div><span>服务</span><div>${renderVisitorChips(row.services, "未查看服务")}</div></div>
          <div><span>商品</span><div>${renderVisitorChips(row.products, "未查看商品")}</div></div>
          <div><span>案例</span><div>${renderVisitorChips(row.casesViewed, "未查看案例")}</div></div>
          <div><span>帖子</span><div>${renderVisitorChips(row.postsViewed, "未查看帖子")}</div></div>
        </div>
      </div>
      <div class="visitor-detail-section">
        <h3>最近行为</h3>
        <div class="timeline">
          ${row.events.map((item) => `<div class="timeline-item">${item}</div>`).join("")}
        </div>
      </div>
    `;
  }

  function renderVisitorMonitorPage(def) {
    const stats = window.MockData?.visitorStats || {};
    const pageViews = stats.pageViews || {};
    const productCollections = stats.productCollections || {};
    const postViews = stats.postViews || {};
    const caseViews = stats.caseViews || {};
    const productViews = stats.productViews || {};

    const totalPageViews = Object.values(pageViews).reduce((a, b) => a + b, 0);
    const totalCollections = Object.values(productCollections).reduce((a, b) => a + b, 0);
    const totalProductViews = Object.values(productViews).reduce((a, b) => a + b, 0);
    const todayVisits = stats.todayVisits || 0;
    const totalVisits = stats.totalVisits || 0;

    const pageRank = Object.entries(pageViews)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([name, views]) => ({ name, views }));
    const maxPageViews = pageRank[0]?.views || 1;

    const productRank = Object.entries(productCollections)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([sku, count]) => {
        const product = window.MockData?.products?.find((p) => p.sku === sku);
        return { name: product?.name || sku, count };
      });

    const postRank = Object.entries(postViews)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([postId, views]) => {
        const post = window.MockData?.posts?.find((p) => p.id === postId);
        return { name: post?.title || postId, views };
      });

    const caseRank = Object.entries(caseViews)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([caseId, views]) => {
        const caseItem = window.MockData?.cases?.find((c) => c.id === caseId);
        return { name: caseItem?.title || caseId, views };
      });

    contentEl.innerHTML = `
      <section class="page-heading">
        <h1>${def.title}</h1>
        <p class="muted">未登录访客不做用户级追踪，仅展示全局访问统计。</p>
      </section>
      <section class="stats-grid">
        <article class="panel stat-card">
          <span class="label">今日访客</span>
          <strong>${todayVisits.toLocaleString("zh-CN")}</strong>
        </article>
        <article class="panel stat-card">
          <span class="label">总访问量</span>
          <strong>${totalVisits.toLocaleString("zh-CN")}</strong>
        </article>
        <article class="panel stat-card">
          <span class="label">页面浏览总数</span>
          <strong>${totalPageViews.toLocaleString("zh-CN")}</strong>
        </article>
        <article class="panel stat-card">
          <span class="label">商品收藏总数</span>
          <strong>${totalCollections.toLocaleString("zh-CN")}</strong>
        </article>
      </section>
      <section class="visitor-monitor-layout visitor-monitor-list-layout">
        <article class="panel table-card visitor-session-panel">
          <div class="toolbar">
            <div class="toolbar-left">
              <span class="filter-chip active">页面浏览排行</span>
            </div>
          </div>
          <div class="visitor-rank-list" style="padding:12px;">
            ${pageRank.length
              ? pageRank.map((item) => `
                  <div class="visitor-rank-item">
                    <div>
                      <strong>${item.name}</strong>
                      <span>${item.views} 次浏览</span>
                    </div>
                    <div class="progress"><span style="width:${Math.round((item.views / maxPageViews) * 100)}%"></span></div>
                  </div>
                `).join("")
              : `<div class="muted">暂无页面浏览数据。</div>`}
          </div>
        </article>
      </section>
      <section class="visitor-insight-grid">
        <article class="panel dashboard-card">
          <div class="panel-header">
            <div><h2 class="section-title">热门商品收藏</h2></div>
          </div>
          <table class="data-table">
            <thead>
              <tr><th>商品</th><th>收藏次数</th></tr>
            </thead>
            <tbody>
              ${productRank.length
                ? productRank.map((item) => `
                    <tr>
                      <td>${item.name}</td>
                      <td>${item.count}</td>
                    </tr>
                  `).join("")
                : `<tr><td colspan="2" class="muted">暂无收藏数据。</td></tr>`}
            </tbody>
          </table>
        </article>
        <article class="panel dashboard-card">
          <div class="panel-header">
            <div><h2 class="section-title">热门内容浏览</h2></div>
          </div>
          <table class="data-table">
            <thead>
              <tr><th>类型</th><th>内容</th><th>浏览</th></tr>
            </thead>
            <tbody>
              ${postRank.length
                ? postRank.map((item) => `
                    <tr>
                      <td>帖子</td>
                      <td>${item.name}</td>
                      <td>${item.views}</td>
                    </tr>
                  `).join("")
                : ``}
              ${caseRank.length
                ? caseRank.map((item) => `
                    <tr>
                      <td>案例</td>
                      <td>${item.name}</td>
                      <td>${item.views}</td>
                    </tr>
                  `).join("")
                : ``}
              ${!postRank.length && !caseRank.length
                ? `<tr><td colspan="3" class="muted">暂无内容浏览数据。</td></tr>`
                : ``}
            </tbody>
          </table>
        </article>
      </section>
    `;
  }

  function bindVisitorMonitorEvents(def) {
    contentEl.querySelectorAll("[data-visitor-filter]").forEach((chip) => {
      chip.addEventListener("click", () => {
        state.activeFilter = chip.dataset.visitorFilter;
        state.selectedIndex = 0;
        renderVisitorMonitorPage(def);
      });
    });

    contentEl.querySelectorAll("[data-visitor-row-index]").forEach((row) => {
      row.addEventListener("click", () => {
        state.selectedIndex = Number(row.dataset.visitorRowIndex);
        renderVisitorMonitorPage(def);
        const currentRows = filterRows(def.rows, def.filterBy);
        const current = currentRows[state.selectedIndex];
        if (current) openPlatformDetailModal(def, current, "visitor");
      });
    });
  }

  function renderTablePage(def) {
    if (state.activePage === "invoiceManage") {
      def.stats = [
        metric("待开票", String(def.rows.filter((i) => i.status === "待开票").length)),
        metric("已开具", String(def.rows.filter((i) => i.status === "已开具").length)),
        metric("本月申请", String(def.rows.length)),
      ];
    }
    const rows = filterRows(def.rows, def.filterBy);
    const selected = rows[state.selectedIndex] || rows[0];
    const toolbarActions =
      state.activePage === "productList"
        ? `
          <button class="btn btn-secondary" type="button" data-product-toolbar="create">新增商品</button>
          <button class="btn btn-primary" type="button" data-product-toolbar="edit" ${selected ? "" : "disabled"}>编辑商品</button>
          <button class="btn btn-secondary" type="button" data-product-toolbar="recommendConfig">推荐位配置</button>
        `
        : state.activePage === "providerAccounts"
          ? `
            <button class="btn btn-secondary" type="button" data-provider-account-toolbar="create">新增账号</button>
          `
        : state.activePage === "vehicleModelManage"
          ? `
            <button class="btn btn-secondary" type="button" data-vehicle-model-toolbar="create">新增车型</button>
          `
        : state.activePage === "caseManage"
          ? `
            <button class="btn btn-secondary" type="button" data-case-toolbar="create">新增案例</button>
          `
        : state.activePage === "roles"
          ? `
            <button class="btn btn-secondary" type="button" data-role-toolbar="create">新增角色</button>
            <button class="btn btn-primary" type="button" data-role-toolbar="edit" ${selected ? "" : "disabled"}>编辑角色</button>
          `
        : state.activePage === "configs"
          ? `
            <button class="btn btn-primary" type="button" data-config-toolbar="edit" ${selected ? "" : "disabled"}>编辑配置</button>
          `
        : state.activePage === "orderAssign"
          ? `
            <button class="btn btn-primary" type="button" data-assign-action="auto" ${selected ? "" : "disabled"}>重新派单</button>
          `
        : state.activePage === "promotionManage"
          ? `
            <button class="btn btn-secondary" type="button" data-promotion-toolbar="create">新增活动</button>
          `
        : state.activePage === "brandManage"
          ? `
            <button class="btn btn-secondary" type="button" data-brand-toolbar="create">新增品牌</button>
            <button class="btn btn-primary" type="button" data-brand-toolbar="edit" ${selected ? "" : "disabled"}>编辑品牌</button>
            <button class="btn btn-secondary" type="button" data-brand-toolbar="toggle" ${selected ? "" : "disabled"}>${selected?.status === "签约" ? "解约" : "签约"}</button>
          `
        : state.activePage === "brandAccounts"
          ? `
            <button class="btn btn-secondary" type="button" data-brand-account-toolbar="create">新增账号</button>
            <button class="btn btn-primary" type="button" data-brand-account-toolbar="enable" ${selected && selected.status === "停用" ? "" : "disabled"}>启用</button>
            <button class="btn btn-secondary" type="button" data-brand-account-toolbar="disable" ${selected && selected.status !== "停用" ? "" : "disabled"}>停用</button>
          `
        : state.activePage === "vehicleMaterials" || state.activePage === "wheelMaterials"
          ? `
            <button class="btn btn-secondary" type="button" data-material-toolbar="create">新增素材</button>
          `
        : "";

    contentEl.innerHTML = `
      <section class="page-heading">
        <h1>${def.title}</h1>
      </section>
      ${
        state.activePage === "productList"
          ? ""
          : `
            <section class="stats-grid">
              ${def.stats
                .map(
                  (item) => `
                    <article class="panel stat-card">
                      <span class="label">${item.label}</span>
                      <strong>${item.value}</strong>
                    </article>
                  `
                )
                .join("")}
            </section>
          `
      }
      <section style="margin-top:22px;">
        <article class="panel table-card">
          <div class="toolbar">
            <div class="toolbar-left">
              ${(def.filters || ["全部"])
                .map(
                  (item) => `
                    <button class="filter-chip ${state.activeFilter === item ? "active" : ""}" type="button" data-filter="${item}">
                      ${item}
                    </button>
                  `
                )
                .join("")}
          </div>
          <div class="toolbar-right">
              ${toolbarActions}
          </div>
        </div>
          <table class="data-table">
            <thead>
              <tr>${def.columns.map((col) => `<th>${col.label}</th>`).join("")}${state.activePage === "promotionManage" || state.activePage === "productList" ? `<th>操作</th>` : ""}</tr>
            </thead>
            <tbody>
              ${
                rows.length
                  ? rows
                      .map(
                        (row, index) => `
                          <tr data-row-index="${index}" style="cursor:pointer; ${index === state.selectedIndex ? "background:rgba(255,255,255,0.04);" : ""}">
                            ${def.columns.map((col) => `<td>${col.tag ? formatTag(row[col.key]) : displayValue(row[col.key])}</td>`).join("")}
                            ${state.activePage === "promotionManage" ? `<td>${renderPromotionRowActions(row, index)}</td>` : state.activePage === "productList" ? `<td style="display:flex; gap:6px; flex-wrap:nowrap;"><button class="btn btn-primary btn-sm" type="button" data-product-row-action="stock" data-row-index="${index}">修改库存</button><button class="btn btn-danger btn-sm" type="button" data-product-row-action="delete" data-row-index="${index}">删除</button></td>` : ""}
                          </tr>
                        `
                      )
                      .join("")
                  : `<tr><td colspan="${def.columns.length + (state.activePage === "promotionManage" || state.activePage === "productList" ? 1 : 0)}" class="muted">没有符合当前筛选条件的数据。</td></tr>`
              }
            </tbody>
          </table>
        </article>
      </section>
    `;

    bindTableEvents(def, selected);
  }

  function renderPromotionRowActions(row, index) {
    const primaryAction = row.status === "进行中" ? "end" : "start";
    const primaryLabel = row.status === "进行中" ? "结束" : row.status === "已结束" ? "重新开始" : "开始";
    return `
      <div class="promotion-row-actions">
        <button class="btn btn-secondary btn-sm" type="button" data-promotion-row-action="detail" data-row-index="${index}">详情</button>
        <button class="btn btn-primary btn-sm" type="button" data-promotion-row-action="${primaryAction}" data-row-index="${index}">${primaryLabel}</button>
      </div>
    `;
  }

  function renderForumManagePage(def) {
    const rows = filterRows(def.rows, def.filterBy);
    const selected = rows[state.selectedIndex] || rows[0];

    contentEl.innerHTML = `
      <section class="page-heading">
        <h1>${def.title}</h1>
      </section>
      <section style="margin-top:22px;">
        <article class="panel table-card forum-card">
          <div class="toolbar">
            <div class="toolbar-left">
              ${(def.filters || ["全部"])
                .map(
                  (item) => `
                    <button class="filter-chip ${state.activeFilter === item ? "active" : ""}" type="button" data-filter="${item}">
                      ${item}
                    </button>
                  `
                )
                .join("")}
            </div>
            <div class="toolbar-right">
            </div>
          </div>
          <div class="forum-feed">
            ${
              rows.length
                ? rows
                    .map(
                      (row, index) => `
                        <article class="forum-thread-card ${index === state.selectedIndex ? "active" : ""}" data-row-index="${index}">
                          <div class="forum-thread-head">
                            <div>
                              <h3>${row.title}</h3>
                            <div class="forum-meta-line">
                              <span>${row.author}</span>
                              <span>${row.time}</span>
                              <span>${row.replies} 回复</span>
                              <span>${row.likes} 点赞</span>
                              <span>${(row.views || 0).toLocaleString("zh-CN")} 浏览</span>
                            </div>
                          </div>
                            <div style="display:flex; gap:8px; flex-wrap:wrap; justify-content:flex-end;">
                              ${[row.topStatus, row.featuredStatus, row.linkAuthStatus, row.creatorPinned === "是" ? "主页置顶" : "", row.status].filter(Boolean).map((item) => formatTag(item)).join("")}
                            </div>
                          </div>
                          <p class="forum-snippet">${row.content}</p>
                          <div class="forum-thread-foot">
                            <span class="pill">${row.id}</span>
                            <span class="pill">${row.author}</span>
                            <span class="pill">商品 ${(row.linkedProducts || []).length}</span>
                          </div>
                        </article>
                      `
                    )
                    .join("")
                : `<div class="page-heading"><h1 style="font-size:24px;">暂无内容</h1></div>`
            }
          </div>
        </article>
      </section>
    `;

    bindTableEvents(def, selected);
  }

  function renderForumDetail(detail) {
    return `
      <div class="panel-header">
        <div>
          <h2 class="section-title">${detail.title}</h2>
        </div>
      </div>
      <div style="display:flex; gap:10px; flex-wrap:wrap; margin-bottom:18px;">
        ${detail.badges.map((item) => formatTag(item)).join("")}
      </div>
      <div class="drawer-meta">
        <div class="kv-list">
          ${detail.facts
            .map(
              ([label, value]) => `
                <div class="kv-row">
                  <span class="muted">${label}</span>
                  <strong style="font-weight:600;">${value}</strong>
                </div>
              `
            )
            .join("")}
        </div>
        <div>
          <div class="panel-header" style="margin-bottom:12px;">
            <div><h3 class="section-title" style="font-size:18px;">评论区</h3></div>
          </div>
          <div class="forum-comment-list">
            ${
              detail.comments.length
                ? detail.comments
                    .map(
                      (item) => `
                        <article class="forum-comment-item">
                          <div class="forum-comment-top">
                            <strong>${item.author}</strong>
                            <div style="display:flex; gap:8px; align-items:center; flex-wrap:wrap;">
                              <span class="muted">${item.time}</span>
                              ${formatTag(item.status)}
                            </div>
                          </div>
                          <p>${item.content}</p>
                          ${item.status === "已删除" ? `<div class="muted">删除原因：${item.deleteReason || "无"}</div>` : ""}
                          <div style="display:flex; gap:8px; margin-top:10px;">
                            <button class="btn btn-secondary" type="button" data-comment-action="manage" data-comment-id="${item.id}">${item.status === "已删除" ? "恢复显示" : "删除评论"}</button>
                          </div>
                        </article>
                      `
                    )
                    .join("")
                : `<div class="muted">当前帖子暂无评论</div>`
            }
          </div>
        </div>
        <div>
          <div class="panel-header" style="margin-bottom:12px;">
            <div><h3 class="section-title" style="font-size:18px;">处理轨迹</h3></div>
          </div>
          <div class="timeline">
            ${detail.timeline.map((item) => `<div class="timeline-item">${item}</div>`).join("")}
          </div>
        </div>
        <div style="display:flex; gap:10px; flex-wrap:wrap;">
          <button class="btn btn-primary" type="button" data-post-action="manage">${detail.badges.includes("已删除") ? "恢复显示" : "删除帖子"}</button>
          <button class="btn btn-secondary" type="button" data-post-action="pin">${detail.badges.includes("置顶") ? "取消置顶" : "置顶"}</button>
          <button class="btn btn-secondary" type="button" data-post-action="feature">${detail.badges.includes("加精") ? "取消加精" : "加精"}</button>
          <button class="btn btn-secondary" type="button" data-post-action="commerce">商品链接</button>
          <button class="btn btn-secondary" type="button" data-post-action="creator-pin">${detail.badges.includes("主页置顶") ? "取消主页置顶" : "主页置顶作品"}</button>
        </div>
      </div>
    `;
  }

  function renderSimplePage(def) {
    const selected = def.rows[state.selectedIndex] || def.rows[0];
    const toolbarActions =
      state.activePage === "productCategories"
        ? `
          <button class="btn btn-secondary" type="button" data-category-toolbar="create">新增</button>
          <button class="btn btn-primary" type="button" data-category-toolbar="edit" ${selected ? "" : "disabled"}>编辑</button>
          <button class="btn btn-danger" type="button" data-category-toolbar="delete" ${selected ? "" : "disabled"}>删除</button>
        `
        : state.activePage === "forumBoards"
          ? `
            <button class="btn btn-secondary" type="button" data-forum-board-toolbar="create">新增</button>
            <button class="btn btn-primary" type="button" data-forum-board-toolbar="edit" ${selected ? "" : "disabled"}>编辑</button>
            <button class="btn btn-danger" type="button" data-forum-board-toolbar="delete" ${selected ? "" : "disabled"}>删除</button>
          `
        : state.activePage === "serviceList"
          ? `
            <button class="btn btn-secondary" type="button" data-service-toolbar="create">新增</button>
            <button class="btn btn-primary" type="button" data-service-toolbar="edit" ${selected ? "" : "disabled"}>编辑</button>
            <button class="btn btn-danger" type="button" data-service-toolbar="delete" ${selected ? "" : "disabled"}>删除</button>
          `
        : state.activePage === "logisticsManage"
          ? selected?.type === "shipping"
            ? `<button class="btn btn-secondary" type="button" data-logistics-toolbar="ship" ${selected ? "" : "disabled"}>发货</button>`
            : ""
        : state.activePage === "shipping"
          ? `
            <button class="btn btn-secondary" type="button" data-shipping-toolbar="ship" ${selected ? "" : "disabled"}>发货</button>
            <button class="btn btn-primary" type="button" data-shipping-toolbar="detail" ${selected ? "" : "disabled"}>查看详情</button>
          `
          : state.activePage === "signing"
            ? `
              <button class="btn btn-secondary" type="button" data-signing-toolbar="confirm" ${selected ? "" : "disabled"}>确认签收</button>
              <button class="btn btn-primary" type="button" data-signing-toolbar="detail" ${selected ? "" : "disabled"}>查看详情</button>
            `
        : `
          <button class="btn btn-secondary" type="button">新增</button>
          <button class="btn btn-primary" type="button">编辑</button>
        `;

    contentEl.innerHTML = `
      <section class="page-heading">
        <h1>${def.title}</h1>
      </section>
      <article class="panel table-card">
        <div class="toolbar">
          <div class="toolbar-left">
          </div>
          <div class="toolbar-right">
            ${toolbarActions}
          </div>
        </div>
        <table class="data-table">
          <thead>
            <tr>${def.labels.map((label) => `<th>${label}</th>`).join("")}</tr>
          </thead>
          <tbody>
            ${def.rows
              .map(
                (row, index) => `
                  <tr data-simple-row-index="${index}" style="cursor:pointer; ${index === state.selectedIndex ? "background:rgba(255,255,255,0.04);" : ""}">
                    ${def.keys
                      .map((key) => {
                        if (state.activePage === "productCategories" && key === "name") {
                          return `<td>${renderCategoryNameCell(row)}</td>`;
                        }
                        return `<td>${isStatus(row[key]) ? formatTag(row[key]) : row[key]}</td>`;
                      })
                      .join("")}
                  </tr>
                `
              )
              .join("")}
          </tbody>
        </table>
      </article>
    `;

    bindSimplePageEvents(def, selected);
  }

  function renderDrawer(detail) {
    const hasValidImage = detail.image && (detail.image.startsWith("data:") || detail.image.startsWith("http"));
    const imageHtml = hasValidImage
      ? `<div class="drawer-image-preview"><img src="${detail.image}" alt="${escapeHtml(detail.title)}" /></div>`
      : detail.title
      ? `<div class="drawer-image-preview"><div class="drawer-image-placeholder">${detail.title.slice(0, 2)}</div></div>`
      : "";
    return `
      <div class="panel-header">
        <div>
          <h2 class="section-title">${detail.title}</h2>
        </div>
      </div>
      <div style="display:flex; gap:10px; flex-wrap:wrap; margin-bottom:18px;">
        ${detail.badges.map((item) => formatTag(item)).join("")}
      </div>
      ${imageHtml}
      <div class="drawer-meta">
        <div class="kv-list">
          ${detail.facts
            .map(
              ([label, value]) => `
                <div class="kv-row">
                  <span class="muted">${label}</span>
                  <strong style="font-weight:600;">${value}</strong>
                </div>
              `
            )
            .join("")}
        </div>
        <div>
          <div class="panel-header" style="margin-bottom:12px;">
            <div><h3 class="section-title" style="font-size:18px;">处理轨迹</h3></div>
          </div>
          <div class="timeline">
            ${detail.timeline.map((item) => `<div class="timeline-item">${item}</div>`).join("")}
          </div>
        </div>
        ${
          detail.businessHistory
            ? `
              <div>
                <div class="panel-header" style="margin-bottom:12px;">
                  <div><h3 class="section-title" style="font-size:18px;">历史经营状况</h3></div>
                </div>
                <div class="kv-list">
                  ${detail.businessHistory
                    .map(
                      ([label, value]) => `
                        <div class="kv-row">
                          <span class="muted">${label}</span>
                          <strong style="font-weight:600;">${value}</strong>
                        </div>
                      `
                    )
                    .join("")}
                </div>
              </div>
            `
            : ""
        }
        ${
          detail.redemptions
            ? `
              <div>
                <div class="panel-header" style="margin-bottom:12px;">
                  <div><h3 class="section-title" style="font-size:18px;">核销详情</h3></div>
                </div>
                <div class="promotion-redemption-list">
                  ${
                    detail.redemptions.length
                      ? detail.redemptions
                          .map(
                            (item) => `
                              <article>
                                <div>
                                  <strong>${item.coupon}</strong>
                                  <span>${item.user} / ${item.orderId} / ${item.channel}</span>
                                </div>
                                <div>
                                  <b>${item.amount}</b>
                                  ${formatTag(item.status)}
                                </div>
                                <small>${item.time}</small>
                              </article>
                            `
                          )
                          .join("")
                      : `<div class="muted">暂无核销记录</div>`
                  }
                </div>
              </div>
            `
            : ""
        }
        ${
          detail.reviews
            ? `
              <div>
                <div class="panel-header" style="margin-bottom:12px;">
                  <div><h3 class="section-title" style="font-size:18px;">商品评价</h3></div>
                </div>
                <div class="promotion-redemption-list">
                  ${
                    detail.reviews.length
                      ? detail.reviews
                          .map(
                            (item) => {
                              const mediaHtml = (item.images || []).map((url) => {
                                const isVideo = String(url).match(/\.(mp4|webm|mov)($|\?)/i) || String(url).startsWith("blob:");
                                return isVideo
                                  ? `<video src="${url}" controls playsinline muted style="width:80px; height:80px; object-fit:cover; border-radius:8px; background:#0d0f12; vertical-align:middle;"></video>`
                                  : `<img src="${url}" style="width:80px; height:80px; object-fit:cover; border-radius:8px; background:#0d0f12; vertical-align:middle;" alt="">`;
                              }).join("");
                              return `
                              <article>
                                <div>
                                  <strong>${item.user || "匿名用户"}</strong>
                                  <span>${"★".repeat(item.rating)}${"☆".repeat(5 - item.rating)} · ${item.vehicle || ""}</span>
                                </div>
                                <div>
                                  ${formatTag(item.auditStatus || "待审核")}
                                </div>
                                <small>${item.time || ""}</small>
                                <p style="margin:6px 0 0; color:var(--text-primary);">${item.content || ""}</p>
                                ${mediaHtml ? `<div style="display:flex; flex-wrap:wrap; gap:6px; margin-top:8px;">${mediaHtml}</div>` : ""}
                                ${item.auditStatus !== "已通过" ? `<div style="display:flex; gap:6px; margin-top:8px;"><button class="btn btn-primary btn-sm" type="button" data-review-action="approve" data-review-id="${item.id}">通过</button><button class="btn btn-danger btn-sm" type="button" data-review-action="reject" data-review-id="${item.id}">驳回</button></div>` : ""}
                              </article>
                            `;
                            }
                          )
                          .join("")
                      : `<div class="muted">暂无评价</div>`
                  }
                </div>
              </div>
            `
            : ""
        }
        <div style="display:flex; gap:10px; flex-wrap:wrap;">
          ${
            state.activePage === "productList"
              ? `
                <button class="btn btn-danger" type="button" data-product-action="delete">删除商品</button>
              `
              : state.activePage === "providerAudit"
                ? `
                  <button class="btn btn-primary" type="button" data-audit-action="approve">审核通过</button>
                  <button class="btn btn-warning" type="button" data-audit-action="supplement">要求补充</button>
                  <button class="btn btn-danger" type="button" data-audit-action="reject">驳回申请</button>
                `
                : detail.actions === "providerList"
                ? `
                  <button class="btn btn-primary" type="button" data-provider-list-action="toggle">${detail.badges.includes("暂停接单") ? "切换为正常营业" : "切换为暂停接单"}</button>
                  <button class="btn btn-secondary" type="button" data-provider-list-action="materials">查看详情</button>
                `
              : detail.actions === "providerAccounts"
                ? `
                  <button class="btn btn-primary" type="button" data-provider-account-action="toggle">${detail.badges.includes("停用") ? "启用账号" : "停用账号"}</button>
                  <button class="btn btn-secondary" type="button" data-provider-account-action="edit">编辑账号</button>
                  <button class="btn btn-danger" type="button" data-provider-account-action="delete">删除账号</button>
                  <button class="btn btn-secondary" type="button" data-provider-account-action="reset">重置密码</button>
                `
              : detail.actions === "userList"
                  ? `
                    <button class="btn btn-primary" type="button" data-user-list-action="toggle">${detail.badges.includes("停用") ? "启用账号" : "停用账号"}</button>
                    <button class="btn btn-danger" type="button" data-user-list-action="mute">${detail.badges.includes("禁言") ? "解除禁言" : "禁言用户"}</button>
                    <button class="btn btn-danger" type="button" data-user-list-action="ban">${detail.badges.includes("封号") ? "解除封号" : "封号用户"}</button>
                    <button class="btn btn-secondary" type="button" data-user-list-action="toggleLinkAuth">${detail.badges.includes("已授权") ? "取消挂链" : "授予挂链"}</button>
                    <button class="btn btn-secondary" type="button" data-user-list-action="materials">查看详情</button>
                  `
              : detail.actions === "userVehicles"
                  ? `
                    <button class="btn btn-secondary" type="button" data-vehicle-action="materials">查看详情</button>
                  `
                : detail.actions === "orderList"
                  ? `
                    <button class="btn btn-secondary" type="button" data-order-action="detail">查看详情</button>
                    <button class="btn btn-primary" type="button" data-order-action="finance">流水/对账</button>
                    <button class="btn btn-secondary" type="button" data-order-action="chat">查看聊天记录</button>
                  `
                : detail.actions === "afterSaleList"
                  ? `
                    <button class="btn btn-secondary" type="button" data-after-sale-action="detail">查看详情</button>
                    <button class="btn btn-primary" type="button" data-after-sale-action="order">跳转订单</button>
                    ${detail.badges.includes("待平台审核") ? `<button class="btn btn-success" type="button" data-after-sale-action="approve">通过申请</button><button class="btn btn-danger" type="button" data-after-sale-action="reject">驳回申请</button>` : `<button class="btn btn-secondary" type="button" disabled>已处理</button>`}
                  `
                : detail.actions === "chatRecords"
                  ? `
                    <button class="btn btn-primary" type="button" data-chat-action="detail">查看完整对话</button>
                  `
                : detail.actions === "orderAssign"
                  ? `
                    <button class="btn btn-primary" type="button" data-assign-action="auto">重新派单</button>
                  `
                : detail.actions === "settlements"
                  ? `
                    <button class="btn btn-primary" type="button" data-settlement-action="audit">统计明细</button>
                  `
                : detail.actions === "caseManage"
                  ? `
                    <button class="btn btn-primary" type="button" data-case-action="audit">审核</button>
                    <button class="btn btn-secondary" type="button" data-case-list-action="edit">编辑案例</button>
                    <button class="btn btn-primary" type="button" data-case-list-action="display">展示设置</button>
                    <button class="btn btn-danger" type="button" data-case-list-action="delete">删除案例</button>
                  `
                : detail.actions === "forumModerators"
                  ? `
                    <button class="btn btn-primary" type="button" data-moderator-action="approve">审核通过</button>
                    <button class="btn btn-danger" type="button" data-moderator-action="reject">驳回申请</button>
                  `
                : detail.actions === "forumManage"
                  ? `
                    <button class="btn btn-primary" type="button" data-post-action="manage">${detail.badges.includes("已删除") ? "恢复显示" : "删除帖子"}</button>
                    <button class="btn btn-secondary" type="button" data-post-action="pin">${detail.badges.includes("置顶") ? "取消置顶" : "置顶"}</button>
                    <button class="btn btn-secondary" type="button" data-post-action="feature">${detail.badges.includes("加精") ? "取消加精" : "加精"}</button>
                    <button class="btn btn-secondary" type="button" data-post-action="commerce">商品链接</button>
                    <button class="btn btn-secondary" type="button" data-post-action="creator-pin">${detail.badges.includes("主页置顶") ? "取消主页置顶" : "主页置顶作品"}</button>
                  `
                : detail.actions === "productList"
                  ? `
                    <button class="btn btn-danger" type="button" data-product-action="delete">删除商品</button>
                  `
                : detail.actions === "vehicleMaterials"
                  ? `
                    <button class="btn btn-primary" type="button" data-material-action="toggle">${detail.badges.includes("停用") ? "启用素材" : "停用素材"}</button>
                    <button class="btn btn-secondary" type="button" data-material-action="preview">预览素材</button>
                    <button class="btn btn-secondary" type="button" data-material-action="edit">编辑素材</button>
                  `
                : detail.actions === "vehicleModelManage"
                  ? `
                    <button class="btn btn-primary" type="button" data-vehicle-model-action="detail">查看详情</button>
                    <button class="btn btn-secondary" type="button" data-vehicle-model-action="edit">编辑车型</button>
                    <button class="btn btn-danger" type="button" data-vehicle-model-action="delete">删除车型</button>
                  `
                : detail.actions === "wheelMaterials"
                  ? `
                    <button class="btn btn-primary" type="button" data-material-action="toggle">${detail.badges.includes("停用") ? "启用素材" : "停用素材"}</button>
                    <button class="btn btn-secondary" type="button" data-material-action="preview">预览素材</button>
                    <button class="btn btn-secondary" type="button" data-material-action="edit">编辑素材</button>
                  `
                : detail.actions === "roles"
                  ? `
                    <button class="btn btn-primary" type="button" data-role-action="toggle">${detail.badges.includes("停用") ? "启用角色" : "停用角色"}</button>
                    <button class="btn btn-secondary" type="button" data-role-action="edit">编辑角色</button>
                  `
                : detail.actions === "invoiceManage"
                  ? `
                    <button class="btn btn-primary" type="button" data-invoice-action="issue" ${detail.badges.includes("已开具") ? "disabled" : ""}>${detail.badges.includes("已开具") ? "已回传" : "上传并回传"}</button>
                  `
                : detail.actions === "promotionManage"
                  ? `
                    <button class="btn btn-primary" type="button" data-promotion-action="toggle">${detail.badges.includes("进行中") ? "暂停活动" : "启动活动"}</button>
                    <button class="btn btn-secondary" type="button" data-promotion-action="redeem">核销详情</button>
                    <button class="btn btn-secondary" type="button" data-promotion-action="edit">编辑活动</button>
                    <button class="btn btn-danger" type="button" data-promotion-action="delete">删除活动</button>
                  `
                : detail.actions === "brandManage"
                  ? `
                    <button class="btn btn-primary" type="button" data-brand-action="toggle">${detail.badges.includes("签约") ? "解约" : "签约"}</button>
                    <button class="btn btn-secondary" type="button" data-brand-action="products">品牌商品</button>
                    <button class="btn btn-secondary" type="button" data-brand-action="sales">销售统计</button>
                    <button class="btn btn-secondary" type="button" data-brand-action="auth">授权文件</button>
                    <button class="btn btn-secondary" type="button" data-brand-action="edit">编辑品牌</button>
                  `
                : detail.actions === "brandAccounts"
                  ? `
                    <button class="btn btn-primary" type="button" data-brand-account-action="toggle">${detail.badges.includes("停用") ? "启用账号" : "停用账号"}</button>
                    <button class="btn btn-secondary" type="button" data-brand-account-action="orders">查看订单</button>
                    <button class="btn btn-secondary" type="button" data-brand-account-action="edit">编辑账号</button>
                  `
                : detail.actions === "configs"
                  ? `
                    <button class="btn btn-primary" type="button" data-config-action="toggle">${detail.badges.includes("已停用") ? "恢复生效" : "停用配置"}</button>
                    <button class="btn btn-secondary" type="button" data-config-action="edit">编辑配置</button>
                  `
              : `
                <button class="btn btn-secondary" type="button" data-detail-action="open">查看详情</button>
              `
          }
        </div>
      </div>
    `;
  }

  function openPlatformDetailModal(def, row, mode = "drawer") {
    const content =
      mode === "forum"
        ? renderForumDetail(def.detail(row))
        : mode === "visitor"
          ? renderVisitorDetail(row)
          : renderDrawer(def.detail(row));

    openModal(`
      <div class="platform-detail-modal">
        ${content}
        <div class="platform-detail-modal-footer">
          <button class="btn btn-secondary" type="button" data-close-modal>关闭</button>
        </div>
      </div>
    `);
    bindDetailModalActions(def, row);
  }

  function bindDetailModalActions(def, selected) {
    if (!selected) return;

    modalCardEl.querySelectorAll("[data-provider-action]").forEach((button) => {
      button.addEventListener("click", () => {
        if (button.dataset.providerAction === "process") {
          openProviderAuditProcessModal(selected);
          return;
        }
        openProviderAuditMaterialsModal(selected);
      });
    });

    modalCardEl.querySelectorAll("[data-provider-list-action]").forEach((button) => {
      button.addEventListener("click", () => {
        if (button.dataset.providerListAction === "materials") {
          openProviderListMaterialsModal(selected);
          return;
        }
        toggleProviderStatus(selected.id);
      });
    });

    modalCardEl.querySelectorAll("[data-provider-account-action]").forEach((button) => {
      button.addEventListener("click", () => {
        const action = button.dataset.providerAccountAction;
        if (action === "edit") {
          openProviderAccountEditorModal("edit", selected);
          return;
        }
        if (action === "delete") {
          openProviderAccountDeleteModal(selected);
          return;
        }
        if (action === "reset") {
          resetProviderAccountPassword(selected.id);
          return;
        }
        toggleProviderAccountStatus(selected.id);
      });
    });

    modalCardEl.querySelectorAll("[data-user-list-action]").forEach((button) => {
      button.addEventListener("click", () => {
        if (button.dataset.userListAction === "materials") {
          openUserMaterialsModal(selected);
          return;
        }
        if (button.dataset.userListAction === "mute") {
          openUserPunishModal(selected, "mute");
          return;
        }
        if (button.dataset.userListAction === "ban") {
          openUserPunishModal(selected, "ban");
          return;
        }
        if (button.dataset.userListAction === "toggleLinkAuth") {
          toggleUserLinkAuth(selected.id);
          return;
        }
        toggleUserStatus(selected.id);
      });
    });

    modalCardEl.querySelectorAll("[data-vehicle-action]").forEach((button) => {
      button.addEventListener("click", () => {
        openVehicleMaterialsModal(selected);
      });
    });

    modalCardEl.querySelectorAll("[data-order-action]").forEach((button) => {
      button.addEventListener("click", () => {
        if (button.dataset.orderAction === "detail") {
          openGenericDetailModal(def.detail(selected));
          return;
        }
        if (button.dataset.orderAction === "finance") {
          openOrderFinanceModal(selected);
          return;
        }
        if (button.dataset.orderAction === "chat") {
          const chat = orderChats.find((c) => c.orderId === selected.id);
          if (chat) {
            openChatRecordModal(chat);
          } else {
            openModal(`
              <div class="panel-header"><div><h2 class="section-title">聊天记录</h2></div></div>
              <div class="muted" style="padding:20px 0;">该订单暂无聊天记录。</div>
              <div style="display:flex; gap:12px; margin-top:18px;"><button class="btn btn-primary" type="button" data-close-modal>关闭</button></div>
            `);
          }
          return;
        }
        openOrderProcessModal(selected);
      });
    });

    modalCardEl.querySelectorAll("[data-chat-action]").forEach((button) => {
      button.addEventListener("click", () => {
        openChatRecordModal(selected);
      });
    });

    modalCardEl.querySelectorAll("[data-assign-action]").forEach((button) => {
      button.addEventListener("click", () => {
        if (button.dataset.assignAction === "detail") {
          openOrderAssignDetailModal(selected);
          return;
        }
        if (button.dataset.assignAction === "delay") {
          openOrderDelayModal(selected);
          return;
        }
        openOrderAssignModal(selected);
      });
    });

    modalCardEl.querySelectorAll("[data-settlement-action]").forEach((button) => {
      button.addEventListener("click", () => {
        openSettlementAuditModal(selected);
      });
    });

    modalCardEl.querySelectorAll("[data-case-action]").forEach((button) => {
      button.addEventListener("click", () => {
        openCaseAuditModal(selected);
      });
    });

    modalCardEl.querySelectorAll("[data-case-list-action]").forEach((button) => {
      button.addEventListener("click", () => {
        const action = button.dataset.caseListAction;
        if (action === "edit") {
          openCaseEditorModal("edit", selected);
          return;
        }
        if (action === "delete") {
          openCaseDeleteModal(selected);
          return;
        }
        openCaseDisplayModal(selected);
      });
    });

    modalCardEl.querySelectorAll("[data-product-action]").forEach((button) => {
      button.addEventListener("click", () => {
        if (button.dataset.productAction === "delete") {
          openProductDeleteModal(selected);
        }
      });
    });

    modalCardEl.querySelectorAll("[data-review-action]").forEach((button) => {
      button.addEventListener("click", () => {
        const reviewId = button.dataset.reviewId;
        const action = button.dataset.reviewAction;
        const review = (window.MockData.productReviews || []).find((r) => r.id === reviewId);
        if (review) openReviewAuditModal(review, action);
      });
    });

    modalCardEl.querySelectorAll("[data-moderator-action]").forEach((button) => {
      button.addEventListener("click", () => {
        submitModeratorApply(selected.id, button.dataset.moderatorAction);
      });
    });

    modalCardEl.querySelectorAll("[data-post-action]").forEach((button) => {
      button.addEventListener("click", () => {
        const action = button.dataset.postAction;
        if (action === "pin") {
          togglePostPin(selected.id);
          return;
        }
        if (action === "feature") {
          togglePostFeature(selected.id);
          return;
        }
        if (action === "commerce") {
          openPostCommerceModal(selected);
          return;
        }
        if (action === "creator-pin") {
          toggleCreatorPinnedPost(selected.id);
          return;
        }
        openPostManageModal(selected);
      });
    });

    modalCardEl.querySelectorAll("[data-comment-action]").forEach((button) => {
      button.addEventListener("click", () => {
        const target = comments.find((item) => item.id === button.dataset.commentId);
        if (target) openCommentManageModal(target);
      });
    });

    modalCardEl.querySelectorAll("[data-material-action]").forEach((button) => {
      button.addEventListener("click", () => {
        const action = button.dataset.materialAction;
        if (action === "toggle") {
          toggleMaterialStatus(state.activePage, selected.id);
          return;
        }
        if (action === "preview") {
          openMaterialPreviewModal(state.activePage, selected);
          return;
        }
        openMaterialEditorModal(state.activePage, selected);
      });
    });

    modalCardEl.querySelectorAll("[data-vehicle-model-action]").forEach((button) => {
      button.addEventListener("click", () => {
        const action = button.dataset.vehicleModelAction;
        if (action === "detail") {
          openGenericDetailModal(def.detail(selected));
          return;
        }
        if (action === "edit") {
          openVehicleModelEditorModal("edit", selected);
          return;
        }
        openVehicleModelDeleteModal(selected);
      });
    });

    modalCardEl.querySelectorAll("[data-role-action]").forEach((button) => {
      button.addEventListener("click", () => {
        if (button.dataset.roleAction === "edit") {
          openRoleEditorModal("edit", selected);
          return;
        }
        toggleRoleStatus(selected.id);
      });
    });

    modalCardEl.querySelectorAll("[data-brand-account-action]").forEach((button) => {
      button.addEventListener("click", () => {
        const action = button.dataset.brandAccountAction;
        if (action === "edit") {
          alert(`编辑品牌方账号: ${selected.id}`);
          return;
        }
        if (action === "orders") {
          alert(`查看品牌方关联订单: ${selected.brandName}，共 ${selected.orders} 单`);
          return;
        }
        toggleBrandAccountStatus(selected.id);
      });
    });

    modalCardEl.querySelectorAll("[data-config-action]").forEach((button) => {
      button.addEventListener("click", () => {
        if (button.dataset.configAction === "edit") {
          openConfigEditorModal(selected);
          return;
        }
        toggleConfigStatus(selected.key);
      });
    });

    modalCardEl.querySelectorAll("[data-invoice-action]").forEach((button) => {
      button.addEventListener("click", () => {
        const action = button.dataset.invoiceAction;
        if (action === "issue") {
          openInvoiceIssueModal(selected);
          return;
        }
      });
    });

    modalCardEl.querySelectorAll("[data-promotion-action]").forEach((button) => {
      button.addEventListener("click", () => {
        const action = button.dataset.promotionAction;
        if (action === "redeem") {
          openPromotionRedemptionModal(selected);
          return;
        }
        if (action === "edit") {
          openPromotionEditorModal("edit", selected);
          return;
        }
        if (action === "delete") {
          alert(`删除活动: ${selected.id}`);
          return;
        }
        alert(`${detail.badges.includes("进行中") ? "暂停" : "启动"}活动: ${selected.id}`);
      });
    });

    modalCardEl.querySelectorAll("[data-brand-action]").forEach((button) => {
      button.addEventListener("click", () => {
        const action = button.dataset.brandAction;
        if (action === "auth") {
          alert(`查看授权文件: ${selected.id}`);
          return;
        }
        if (action === "edit") {
          openBrandEditorModal("edit", selected);
          return;
        }
        if (action === "products") {
          openBrandProductsModal(selected);
          return;
        }
        if (action === "sales") {
          openBrandSalesModal(selected);
          return;
        }
        toggleBrandStatus(selected.id);
      });
    });

    modalCardEl.querySelectorAll("[data-detail-action='open']").forEach((button) => {
      button.addEventListener("click", () => {
        openGenericDetailModal(def.detail(selected));
      });
    });
  }

  function bindTableEvents(def, selected) {
    contentEl.querySelectorAll("[data-filter]").forEach((chip) => {
      chip.addEventListener("click", () => {
        state.activeFilter = chip.dataset.filter;
        state.selectedIndex = 0;
        if (state.activePage === "forumManage") {
          renderForumManagePage(def);
          return;
        }
        renderTablePage(def);
      });
    });

    contentEl.querySelectorAll("[data-row-index]").forEach((row) => {
      row.addEventListener("click", () => {
        state.selectedIndex = Number(row.dataset.rowIndex);
        const currentRows = filterRows(def.rows, def.filterBy);
        const current = currentRows[state.selectedIndex];
        if (state.activePage === "forumManage") {
          renderForumManagePage(def);
          if (current) openPlatformDetailModal(def, current, "forum");
          return;
        }
        renderTablePage(def);
        if (current) openPlatformDetailModal(def, current, "drawer");
      });
    });

    if (state.activePage === "promotionManage") {
      contentEl.querySelectorAll("[data-promotion-row-action]").forEach((button) => {
        button.addEventListener("click", (event) => {
          event.stopPropagation();
          const currentRows = filterRows(def.rows, def.filterBy);
          const rowIndex = Number(button.dataset.rowIndex);
          const current = currentRows[rowIndex];
          if (!current) return;
          state.selectedIndex = rowIndex;
          const action = button.dataset.promotionRowAction;
          if (action === "detail") {
            renderTablePage(def);
            openPlatformDetailModal(def, current, "drawer");
            return;
          }
          current.status = action === "end" ? "已结束" : "进行中";
          renderTablePage(def);
        });
      });
    }

    if (state.activePage === "productList") {
      contentEl.querySelectorAll("[data-product-toolbar]").forEach((button) => {
        button.addEventListener("click", () => {
          if (button.dataset.productToolbar === "create") {
            openProductEditorModal("create");
            return;
          }
          if (button.dataset.productToolbar === "recommendConfig") {
            openMallRecommendationModal(selected);
            return;
          }
          if (selected) openProductEditorModal("edit", selected);
        });
      });
      contentEl.querySelectorAll("[data-product-row-action]").forEach((button) => {
        button.addEventListener("click", (event) => {
          event.stopPropagation();
          const currentRows = filterRows(def.rows, def.filterBy);
          const rowIndex = Number(button.dataset.rowIndex);
          const current = currentRows[rowIndex];
          if (!current) return;
          if (button.dataset.productRowAction === "delete") {
            openProductDeleteModal(current);
            return;
          }
          if (button.dataset.productRowAction === "stock") {
            openProductStockModal(current);
          }
        });
      });
    }

    if (state.activePage === "vehicleModelManage") {
      contentEl.querySelectorAll("[data-vehicle-model-toolbar]").forEach((button) => {
        button.addEventListener("click", () => {
          const action = button.dataset.vehicleModelToolbar;
          if (action === "create") {
            openVehicleModelEditorModal("create");
            return;
          }
          if (!selected) return;
          if (action === "edit") {
            openVehicleModelEditorModal("edit", selected);
            return;
          }
          openVehicleModelDeleteModal(selected);
        });
      });

      if (selected) {
        contentEl.querySelectorAll("[data-vehicle-model-action]").forEach((button) => {
          button.addEventListener("click", () => {
            const action = button.dataset.vehicleModelAction;
            if (action === "detail") {
              openGenericDetailModal(def.detail(selected));
              return;
            }
            if (action === "edit") {
              openVehicleModelEditorModal("edit", selected);
              return;
            }
            openVehicleModelDeleteModal(selected);
          });
        });
      }
    }

    if (state.activePage === "promotionManage") {
      contentEl.querySelectorAll("[data-promotion-toolbar]").forEach((button) => {
        button.addEventListener("click", () => {
          const action = button.dataset.promotionToolbar;
          if (action === "create") {
            openPromotionEditorModal();
            return;
          }
          if (selected) openPromotionRedemptionModal(selected);
        });
      });
    }

    if (state.activePage === "brandManage") {
      contentEl.querySelectorAll("[data-brand-toolbar]").forEach((button) => {
        button.addEventListener("click", () => {
          const action = button.dataset.brandToolbar;
          if (action === "create") {
            openBrandEditorModal("create");
            return;
          }
          if (!selected) return;
          if (action === "edit") {
            openBrandEditorModal("edit", selected);
            return;
          }
          toggleBrandStatus(selected.id);
        });
      });
    }

    if (state.activePage === "brandAccounts") {
      contentEl.querySelectorAll("[data-brand-account-toolbar]").forEach((button) => {
        button.addEventListener("click", () => {
          const action = button.dataset.brandAccountToolbar;
          if (action === "create") {
            openBrandAccountEditorModal();
            return;
          }
          if (!selected) return;
          setBrandAccountStatus(selected.id, action === "enable" ? "正常" : "停用");
        });
      });
    }

    if (state.activePage === "caseManage") {
      contentEl.querySelectorAll("[data-case-toolbar]").forEach((button) => {
        button.addEventListener("click", () => {
          const action = button.dataset.caseToolbar;
          if (action === "create") {
            openCaseEditorModal("create");
            return;
          }
          if (!selected) return;
          if (action === "edit") {
            openCaseEditorModal("edit", selected);
            return;
          }
          openCaseDeleteModal(selected);
        });
      });
    }

    if (state.activePage === "roles") {
      contentEl.querySelectorAll("[data-role-toolbar]").forEach((button) => {
        button.addEventListener("click", () => {
          if (button.dataset.roleToolbar === "create") {
            openRoleEditorModal("create");
            return;
          }
          if (selected) openRoleEditorModal("edit", selected);
        });
      });

      if (selected) {
        contentEl.querySelectorAll("[data-role-action]").forEach((button) => {
          button.addEventListener("click", () => {
            if (button.dataset.roleAction === "edit") {
              openRoleEditorModal("edit", selected);
              return;
            }
            toggleRoleStatus(selected.id);
          });
        });
      }
    }

    if (state.activePage === "configs") {
      contentEl.querySelectorAll("[data-config-toolbar]").forEach((button) => {
        button.addEventListener("click", () => {
          if (selected) openConfigEditorModal(selected);
        });
      });

      if (selected) {
        contentEl.querySelectorAll("[data-config-action]").forEach((button) => {
          button.addEventListener("click", () => {
            if (button.dataset.configAction === "edit") {
              openConfigEditorModal(selected);
              return;
            }
            toggleConfigStatus(selected.key);
          });
        });
      }
    }

    if (state.activePage === "providerAudit" && selected) {
      contentEl.querySelectorAll("[data-provider-action]").forEach((button) => {
        button.addEventListener("click", () => {
          if (button.dataset.providerAction === "process") {
            openProviderAuditProcessModal(selected);
            return;
          }
          openProviderAuditMaterialsModal(selected);
        });
      });
      contentEl.querySelectorAll("[data-audit-action]").forEach((button) => {
        button.addEventListener("click", () => {
          const action = button.dataset.auditAction;
          if (action === "supplement") {
            openSupplementModal(selected);
            return;
          }
          if (action === "reject") {
            openRejectModal(selected);
            return;
          }
          handleAuditDecision(action, selected.id);
          renderPage();
        });
      });
    }

    if (state.activePage === "providerList" && selected) {
      contentEl.querySelectorAll("[data-provider-list-action]").forEach((button) => {
        button.addEventListener("click", () => {
          if (button.dataset.providerListAction === "materials") {
            openProviderListMaterialsModal(selected);
            return;
          }
          toggleProviderStatus(selected.id);
        });
      });
    }

    if (state.activePage === "providerAccounts") {
      contentEl.querySelectorAll("[data-provider-account-toolbar]").forEach((button) => {
        button.addEventListener("click", () => {
          const action = button.dataset.providerAccountToolbar;
          if (action === "create") openProviderAccountEditorModal("create");
        });
      });

      if (selected) {
        contentEl.querySelectorAll("[data-provider-account-action]").forEach((button) => {
          button.addEventListener("click", () => {
            const action = button.dataset.providerAccountAction;
            if (action === "edit") {
              openProviderAccountEditorModal("edit", selected);
              return;
            }
            if (action === "delete") {
              openProviderAccountDeleteModal(selected);
              return;
            }
            if (action === "reset") {
              resetProviderAccountPassword(selected.id);
              return;
            }
            toggleProviderAccountStatus(selected.id);
          });
        });
      }
    }

    if (state.activePage === "userList" && selected) {
      contentEl.querySelectorAll("[data-user-list-action]").forEach((button) => {
        button.addEventListener("click", () => {
          if (button.dataset.userListAction === "materials") {
            openUserMaterialsModal(selected);
            return;
          }
          if (button.dataset.userListAction === "toggleLinkAuth") {
            toggleUserLinkAuth(selected.id);
            return;
          }
          toggleUserStatus(selected.id);
        });
      });
    }

    if (state.activePage === "userVehicles" && selected) {
      contentEl.querySelectorAll("[data-vehicle-action]").forEach((button) => {
        button.addEventListener("click", () => {
          openVehicleMaterialsModal(selected);
        });
      });
    }

    if (state.activePage === "orderList" && selected) {
      contentEl.querySelectorAll("[data-order-action]").forEach((button) => {
        button.addEventListener("click", () => {
          if (button.dataset.orderAction === "detail") {
            openGenericDetailModal(def.detail(selected));
            return;
          }
          if (button.dataset.orderAction === "finance") {
            openOrderFinanceModal(selected);
            return;
          }
          if (button.dataset.orderAction === "chat") {
            const chat = orderChats.find((c) => c.orderId === selected.id);
            if (chat) {
              openChatRecordModal(chat);
            } else {
              openModal(`
                <div class="panel-header"><div><h2 class="section-title">聊天记录</h2></div></div>
                <div class="muted" style="padding:20px 0;">该订单暂无聊天记录。</div>
                <div style="display:flex; gap:12px; margin-top:18px;"><button class="btn btn-primary" type="button" data-close-modal>关闭</button></div>
              `);
            }
            return;
          }
          openOrderProcessModal(selected);
        });
      });
    }

    if (state.activePage === "afterSaleList" && selected) {
      contentEl.querySelectorAll("[data-after-sale-action]").forEach((button) => {
        button.addEventListener("click", () => {
          const action = button.dataset.afterSaleAction;
          if (action === "detail") {
            openGenericDetailModal(def.detail(selected));
            return;
          }
          if (action === "order") {
            state.activePage = "orderList";
            state.activeFilter = "全部";
            const orderRows = filterRows(defs.orderList.rows, defs.orderList.filterBy);
            const idx = orderRows.findIndex((o) => o.id === selected.id);
            state.selectedIndex = idx >= 0 ? idx : 0;
            const parentGroup = menu.find((item) => item.children?.some((c) => c.id === "orderList"));
            if (parentGroup) state.expandedGroups[parentGroup.id] = true;
            renderSidebar();
            renderPage();
            return;
          }
          if (action === "approve") {
            selected.afterSaleStatus = "已通过";
            selected.progress = `售后申请已通过：${selected.afterSaleType}，退款将原路退回至用户支付账户。`;
            selected.refundMethod = "原路退回";
            selected.refundStatus = "退款处理中";
            if (!selected.timeline) selected.timeline = [];
            selected.timeline.push(`平台通过售后申请：${selected.afterSaleType}，退款原路退回 — ${getNowStamp()}`);
            pushNotification("user", "售后申请已通过", `您的售后申请（${selected.afterSaleType}）已通过审核，退款将原路退回至您的支付账户。订单号：${selected.id}。`);
            renderPage();
            return;
          }
          if (action === "reject") {
            selected.afterSaleStatus = "已驳回";
            selected.progress = `售后申请已驳回：${selected.afterSaleType}，如有疑问请联系平台客服。`;
            if (!selected.timeline) selected.timeline = [];
            selected.timeline.push(`平台驳回售后申请：${selected.afterSaleType} — ${getNowStamp()}`);
            pushNotification("user", "售后申请被驳回", `您的售后申请（${selected.afterSaleType}）未通过审核。如有疑问请联系平台客服。订单号：${selected.id}。`);
            renderPage();
            return;
          }
        });
      });
    }

    if (state.activePage === "chatRecords" && selected) {
      contentEl.querySelectorAll("[data-chat-action]").forEach((button) => {
        button.addEventListener("click", () => {
          openChatRecordModal(selected);
        });
      });
    }

    if (state.activePage === "orderAssign" && selected) {
      contentEl.querySelectorAll("[data-assign-action]").forEach((button) => {
        button.addEventListener("click", () => {
          if (button.dataset.assignAction === "detail") {
            openOrderAssignDetailModal(selected);
            return;
          }
          if (button.dataset.assignAction === "delay") {
            openOrderDelayModal(selected);
            return;
          }
          openOrderAssignModal(selected);
        });
      });
    }

    if (state.activePage === "shipping" && selected) {
      contentEl.querySelectorAll("[data-simple-row-index]").forEach((row) => {
        row.addEventListener("dblclick", () => openShippingDetailModal(selected));
      });
    }

    if (state.activePage === "signing" && selected) {
      contentEl.querySelectorAll("[data-simple-row-index]").forEach((row) => {
        row.addEventListener("dblclick", () => openSigningDetailModal(selected));
      });
    }

    if (selected) {
      contentEl.querySelectorAll("[data-detail-action='open']").forEach((button) => {
        button.addEventListener("click", () => {
          openGenericDetailModal(def.detail(selected));
        });
      });
    }

    if (state.activePage === "settlements" && selected) {
      contentEl.querySelectorAll("[data-settlement-action]").forEach((button) => {
        button.addEventListener("click", () => {
          openSettlementAuditModal(selected);
        });
      });
    }

    if (state.activePage === "caseManage" && selected) {
      contentEl.querySelectorAll("[data-case-action]").forEach((button) => {
        button.addEventListener("click", () => {
          openCaseAuditModal(selected);
        });
      });
      contentEl.querySelectorAll("[data-case-list-action]").forEach((button) => {
        button.addEventListener("click", () => {
          const action = button.dataset.caseListAction;
          if (action === "edit") {
            openCaseEditorModal("edit", selected);
            return;
          }
          if (action === "delete") {
            openCaseDeleteModal(selected);
            return;
          }
          openCaseDisplayModal(selected);
        });
      });
    }

    if (state.activePage === "forumModerators" && selected) {
      contentEl.querySelectorAll("[data-moderator-action]").forEach((button) => {
        button.addEventListener("click", () => {
          submitModeratorApply(selected.id, button.dataset.moderatorAction);
        });
      });
    }

    if (state.activePage === "forumManage" && selected) {
      contentEl.querySelectorAll("[data-post-action]").forEach((button) => {
        button.addEventListener("click", () => {
          openPostManageModal(selected);
        });
      });
      contentEl.querySelectorAll("[data-comment-action]").forEach((button) => {
        button.addEventListener("click", () => {
          const target = comments.find((item) => item.id === button.dataset.commentId);
          if (target) openCommentManageModal(target);
        });
      });
    }

    if ((state.activePage === "vehicleMaterials" || state.activePage === "wheelMaterials") && selected) {
      contentEl.querySelectorAll("[data-material-toolbar]").forEach((button) => {
        button.addEventListener("click", () => {
          openMaterialEditorModal(state.activePage);
        });
      });
      contentEl.querySelectorAll("[data-material-action]").forEach((button) => {
        button.addEventListener("click", () => {
          const action = button.dataset.materialAction;
          if (action === "toggle") {
            toggleMaterialStatus(state.activePage, selected.id);
            return;
          }
          if (action === "preview") {
            openMaterialPreviewModal(state.activePage, selected);
            return;
          }
          openMaterialEditorModal(state.activePage, selected);
        });
      });
    }
  }

  function bindSimplePageEvents(def, selected) {
    contentEl.querySelectorAll("[data-simple-row-index]").forEach((row) => {
      row.addEventListener("click", () => {
        const rowIndex = Number(row.dataset.simpleRowIndex);
        state.selectedIndex = rowIndex;
        if (state.activePage === "logisticsManage") {
          renderSimplePage(def);
          openLogisticsDetailModal(def.rows[rowIndex]);
          return;
        }
        renderSimplePage(def);
      });
    });

    if (state.activePage === "logisticsManage") {
      contentEl.querySelectorAll("[data-logistics-toolbar='ship']").forEach((button) => {
        button.addEventListener("click", () => {
          if (selected?.type === "shipping") openShippingEditModal(selected.source);
        });
      });
      return;
    }

    if (state.activePage === "productCategories") {
      contentEl.querySelectorAll("[data-category-toolbar]").forEach((button) => {
        button.addEventListener("click", () => {
          const action = button.dataset.categoryToolbar;
          if (action === "create") {
            openCategoryEditorModal("create");
            return;
          }
          if (!selected) return;
          if (action === "edit") {
            openCategoryEditorModal("edit", selected);
            return;
          }
          openCategoryDeleteModal(selected);
        });
      });
    }

    if (state.activePage === "forumBoards") {
      contentEl.querySelectorAll("[data-forum-board-toolbar]").forEach((button) => {
        button.addEventListener("click", () => {
          const action = button.dataset.forumBoardToolbar;
          if (action === "create") {
            openForumBoardEditorModal("create");
            return;
          }
          if (!selected) return;
          if (action === "edit") {
            openForumBoardEditorModal("edit", selected);
            return;
          }
          openForumBoardDeleteModal(selected);
        });
      });
    }

    if (state.activePage === "serviceList") {
      contentEl.querySelectorAll("[data-service-toolbar]").forEach((button) => {
        button.addEventListener("click", () => {
          const action = button.dataset.serviceToolbar;
          if (action === "create") {
            openServiceEditorModal("create");
            return;
          }
          if (!selected) return;
          if (action === "edit") {
            openServiceEditorModal("edit", selected);
            return;
          }
          openServiceDeleteModal(selected);
        });
      });
    }

    if (state.activePage === "shipping") {
      contentEl.querySelectorAll("[data-shipping-toolbar]").forEach((button) => {
        button.addEventListener("click", () => {
          if (!selected) return;
          if (button.dataset.shippingToolbar === "detail") {
            openShippingDetailModal(selected);
            return;
          }
          openShippingEditModal(selected);
        });
      });
    }

    if (state.activePage === "signing") {
      contentEl.querySelectorAll("[data-signing-toolbar]").forEach((button) => {
        button.addEventListener("click", () => {
          if (!selected) return;
          if (button.dataset.signingToolbar === "detail") {
            openSigningDetailModal(selected);
            return;
          }
          openSigningConfirmModal(selected);
        });
      });
    }
  }

  function renderCategoryNameCell(row) {
    const level = Number(row.level) || 0;
    const hasChildren = categories.some((item) => item.parent === row.name);
    const indent = level * 22;
    return `
      <div class="tree-cell" style="padding-left:${indent}px;">
        <span class="tree-branch">${level === 0 ? (hasChildren ? "▾" : "•") : "└"}</span>
        <span>${row.name}</span>
      </div>
    `;
  }

  function openModal(content) {
    modalCardEl.innerHTML = content;
    modalEl.classList.add("visible");
    bindModalEvents();
  }

  function closeModal() {
    modalEl.classList.remove("visible");
  }

  function bindModalEvents() {
    modalCardEl.querySelectorAll("[data-close-modal]").forEach((button) => {
      button.addEventListener("click", closeModal);
    });

    modalCardEl.querySelectorAll("[data-audit-decision]").forEach((button) => {
      button.addEventListener("click", () => {
        if (button.dataset.auditDecision === "supplement") {
          const target = providers.find((item) => item.id === button.dataset.providerId);
          if (target) openSupplementModal(target);
          return;
        }
        if (button.dataset.auditDecision === "reject") {
          const target = providers.find((item) => item.id === button.dataset.providerId);
          if (target) openRejectModal(target);
          return;
        }
        handleAuditDecision(button.dataset.auditDecision, button.dataset.providerId);
      });
    });

    const supplementSubmit = modalCardEl.querySelector("[data-submit-supplement]");
    if (supplementSubmit) {
      supplementSubmit.addEventListener("click", () => {
        const providerId = supplementSubmit.dataset.providerId;
        const selectedItems = Array.from(modalCardEl.querySelectorAll("[data-supplement-item]:checked")).map((input) => input.value);
        const reasonInput = modalCardEl.querySelector("[data-supplement-reason]");
        const reason = reasonInput ? reasonInput.value.trim() : "";
        submitSupplement(providerId, selectedItems, reason);
      });
    }

    const rejectSubmit = modalCardEl.querySelector("[data-submit-reject]");
    if (rejectSubmit) {
      rejectSubmit.addEventListener("click", () => {
        const providerId = rejectSubmit.dataset.providerId;
        const reasonInput = modalCardEl.querySelector("[data-reject-reason]");
        const reason = reasonInput ? reasonInput.value.trim() : "";
        submitReject(providerId, reason);
      });
    }

    const saveCategoryBtn = modalCardEl.querySelector("[data-save-category]");
    if (saveCategoryBtn) {
      saveCategoryBtn.addEventListener("click", () => {
        saveCategory(saveCategoryBtn.dataset.mode, saveCategoryBtn.dataset.name);
      });
    }

    const deleteCategoryBtn = modalCardEl.querySelector("[data-delete-category]");
    if (deleteCategoryBtn) {
      deleteCategoryBtn.addEventListener("click", () => {
        deleteCategory(deleteCategoryBtn.dataset.name);
      });
    }

    const saveForumBoardBtn = modalCardEl.querySelector("[data-save-forum-board]");
    if (saveForumBoardBtn) {
      saveForumBoardBtn.addEventListener("click", () => {
        saveForumBoard(saveForumBoardBtn.dataset.mode, saveForumBoardBtn.dataset.id);
      });
    }

    function updateModeratorHiddenInput() {
      const tagList = modalCardEl.querySelector("#moderatorTagList");
      const hidden = modalCardEl.querySelector('[data-forum-board-field="currentModerators"]');
      if (!tagList || !hidden) return;
      const names = Array.from(tagList.querySelectorAll(".pill")).map((span) => span.childNodes[0].textContent.trim()).filter(Boolean);
      hidden.value = names.join("、");
    }

    modalCardEl.querySelectorAll("[data-delete-moderator]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const pill = btn.closest(".pill");
        if (pill) pill.remove();
        updateModeratorHiddenInput();
      });
    });

    const addModeratorBtn = modalCardEl.querySelector("[data-add-moderator]");
    const newModeratorInput = modalCardEl.querySelector("#newModeratorInput");
    if (addModeratorBtn && newModeratorInput) {
      addModeratorBtn.addEventListener("click", () => {
        const name = newModeratorInput.value.trim();
        if (!name) return;
        const tagList = modalCardEl.querySelector("#moderatorTagList");
        if (!tagList) return;
        const pill = document.createElement("span");
        pill.className = "pill";
        pill.style.cssText = "display:inline-flex; align-items:center; gap:6px;";
        pill.innerHTML = `${name}<button type="button" class="btn btn-danger btn-sm" data-delete-moderator style="padding:2px 6px; font-size:11px; line-height:1;">×</button>`;
        pill.querySelector("[data-delete-moderator]").addEventListener("click", () => {
          pill.remove();
          updateModeratorHiddenInput();
        });
        tagList.appendChild(pill);
        newModeratorInput.value = "";
        updateModeratorHiddenInput();
      });
    }

    const deleteForumBoardBtn = modalCardEl.querySelector("[data-delete-forum-board]");
    if (deleteForumBoardBtn) {
      deleteForumBoardBtn.addEventListener("click", () => {
        deleteForumBoard(deleteForumBoardBtn.dataset.id);
      });
    }

    const saveServiceBtn = modalCardEl.querySelector("[data-save-service]");
    if (saveServiceBtn) {
      saveServiceBtn.addEventListener("click", () => {
        saveService(saveServiceBtn.dataset.mode, saveServiceBtn.dataset.code);
      });
    }

    const serviceProvinceSelect = modalCardEl.querySelector('[data-service-field="province"]');
    const serviceCitySelect = modalCardEl.querySelector('[data-service-field="city"]');
    if (serviceProvinceSelect) {
      serviceProvinceSelect.addEventListener("change", () => {
        syncServiceRegionFields("province");
      });
    }
    if (serviceCitySelect) {
      serviceCitySelect.addEventListener("change", () => {
        syncServiceRegionFields("city");
      });
    }

    const deleteServiceBtn = modalCardEl.querySelector("[data-delete-service]");
    if (deleteServiceBtn) {
      deleteServiceBtn.addEventListener("click", () => {
        deleteService(deleteServiceBtn.dataset.code);
      });
    }

    const savePromotionBtn = modalCardEl.querySelector("[data-save-promotion]");
    if (savePromotionBtn) {
      savePromotionBtn.addEventListener("click", () => {
        savePromotion(savePromotionBtn.dataset.mode || "create", savePromotionBtn.dataset.id || "");
      });
    }

    const saveBrandBtn = modalCardEl.querySelector("[data-save-brand]");
    if (saveBrandBtn) {
      saveBrandBtn.addEventListener("click", () => {
        saveBrand(saveBrandBtn.dataset.mode, saveBrandBtn.dataset.id);
      });
    }

    const saveBrandAccountBtn = modalCardEl.querySelector("[data-save-brand-account]");
    if (saveBrandAccountBtn) {
      saveBrandAccountBtn.addEventListener("click", saveBrandAccount);
    }

    const saveMallRecommendationBtn = modalCardEl.querySelector("[data-save-mall-recommendation]");
    if (saveMallRecommendationBtn) {
      saveMallRecommendationBtn.addEventListener("click", saveMallRecommendation);
    }

    modalCardEl.querySelectorAll("[data-order-process]").forEach((button) => {
      button.addEventListener("click", () => {
        const mode = button.dataset.orderProcess;
        const titleMap = {
          assign: "订单已重新派单",
          progress: "订单进度已更新",
          close: "订单已关闭",
        };
        const messageMap = {
          assign: "已将该订单加入重新派单流程，并记录操作轨迹。",
          progress: "已同步订单当前进度到最新处理状态。",
          close: "已将订单标记为已完成，并归档处理记录。",
        };
        const orderId = modalCardEl.querySelector("[data-order-id]")?.dataset.orderId;
        const target = orders.find((item) => item.id === orderId);
        if (target) {
          if (mode === "assign") {
            target.progress = "等待重新派单";
            appendOrderTimeline(target, "平台将订单加入重新派单流程");
          }
          if (mode === "progress") {
            target.progress = target.status === "待发货" ? "待签收" : "施工中";
            appendOrderTimeline(target, `平台更新订单进度为：${target.progress}`);
          }
          if (mode === "close") {
            target.progress = "已完成";
            target.status = "已完成";
            appendOrderTimeline(target, "平台将订单标记为已完成");
            pushNotification("user", "订单已完成", `您的订单 ${target.id} 已完成，欢迎评价本次服务。`);
            if (target.provider && target.provider !== "平台重派中" && target.provider !== "待分配") {
              pushNotification("provider", "订单已完成", `订单 ${target.id} 已标记为已完成，请确认归档。`);
            }
          }
        }
        openFeedbackModal(titleMap[mode], messageMap[mode]);
      });
    });

    modalCardEl.querySelectorAll("[data-assign-provider]").forEach((button) => {
      button.addEventListener("click", () => {
        const providerId = button.dataset.assignProvider;
        const target = providers.find((item) => item.id === providerId);
        const orderId = modalCardEl.querySelector("[data-order-id]")?.dataset.orderId;
        const order = orders.find((item) => item.id === orderId);
        if (order && target) {
          order.intention = target.name;
          order.provider = target.name;
          order.progress = "已派单";
          order.status = "施工中";
          order.platformInterventionStatus = "";
          order.platformInterventionAction = "";
          order.userVisibleStatus = "已接单";
          order.userVisibleProgress = `平台已重新分配给 ${target.name}`;
          appendOrderTimeline(order, `平台重新派单给 ${target.name}，订单状态更新为施工中`);
          pushNotification("provider", "新订单分配", `您收到一个新订单分配：${order.id}（${order.service || ""}），请尽快确认接单。`);
          pushNotification("user", "订单已分配服务商", `您的订单 ${order.id} 已分配给 ${target.name}，当前状态为施工中。`);
          openFeedbackModal("派单成功", `${order.id} 已分配给 ${target.name}，当前状态已更新为施工中。`);
        }
      });
    });

    const assignDelayBtn = modalCardEl.querySelector("[data-submit-assign-delay]");
    if (assignDelayBtn) {
      assignDelayBtn.addEventListener("click", () => {
        const order = orders.find((item) => item.id === assignDelayBtn.dataset.orderId);
        if (!order) return;
        const deadline = modalCardEl.querySelector('[data-assign-delay-field="deadline"]')?.value || "";
        const note = modalCardEl.querySelector('[data-assign-delay-field="note"]')?.value.trim() || "";
        order.platformInterventionStatus = "已延期";
        order.platformInterventionAction = "延期处理";
        order.userVisibleStatus = "待接单";
        order.userVisibleProgress = "已提交需求，平台正在安排可接单服务商。";
        order.delayDeadline = deadline ? deadline.replace("T", " ") : order.delayDeadline || "2026-04-03 18:00";
        order.progress = "平台延期处理中";
        appendOrderTimeline(order, `平台延期处理至 ${order.delayDeadline}。${note}`);
        openFeedbackModal("延期已记录", `${order.id} 已进入延期处理，用户端仍显示待接单。`);
      });
    }

    modalCardEl.querySelectorAll("[data-settlement-decision]").forEach((button) => {
      button.addEventListener("click", () => {
        const settlementId = button.dataset.settlementId;
        const decision = button.dataset.settlementDecision;
        if (decision === "reject") {
          openSettlementRejectModal(settlementId);
          return;
        }
        submitSettlementAudit(settlementId, "approve");
      });
    });

    const settlementRejectBtn = modalCardEl.querySelector("[data-submit-settlement-reject]");
    if (settlementRejectBtn) {
      settlementRejectBtn.addEventListener("click", () => {
        const settlementId = settlementRejectBtn.dataset.settlementId;
        const reasonInput = modalCardEl.querySelector("[data-settlement-reject-reason]");
        const reason = reasonInput ? reasonInput.value.trim() : "";
        submitSettlementAudit(settlementId, "reject", reason);
      });
    }

    modalCardEl.querySelectorAll("[data-case-decision]").forEach((button) => {
      button.addEventListener("click", () => {
        const caseId = button.dataset.caseId;
        const decision = button.dataset.caseDecision;
        if (decision === "reject") {
          openCaseRejectModal(caseId);
          return;
        }
        submitCaseAudit(caseId, "approve");
      });
    });

    const caseRejectBtn = modalCardEl.querySelector("[data-submit-case-reject]");
    if (caseRejectBtn) {
      caseRejectBtn.addEventListener("click", () => {
        const caseId = caseRejectBtn.dataset.caseId;
        const reasonInput = modalCardEl.querySelector("[data-case-reject-reason]");
        const reason = reasonInput ? reasonInput.value.trim() : "";
        submitCaseAudit(caseId, "reject", reason);
      });
    }

    modalCardEl.querySelectorAll("[data-case-display]").forEach((button) => {
      button.addEventListener("click", () => {
        submitCaseDisplay(button.dataset.caseId, button.dataset.caseDisplay);
      });
    });

    const caseEditorRoot = modalCardEl.querySelector("[data-case-editor]");
    if (caseEditorRoot) {
      modalCardEl.querySelectorAll("[data-case-field]").forEach((field) => {
        const eventName = field.tagName === "SELECT" ? "change" : "input";
        field.addEventListener(eventName, syncCaseEditorPreview);
      });
      const caseRichEditor = modalCardEl.querySelector("[data-case-rich-editor]");
      if (caseRichEditor) {
        caseRichEditor.addEventListener("input", syncCaseRichEditorField);
      }
      modalCardEl.querySelectorAll("[data-case-rich-command]").forEach((button) => {
        button.addEventListener("click", () => {
          const editor = modalCardEl.querySelector("[data-case-rich-editor]");
          if (!editor) return;
          editor.focus();
          const command = button.dataset.caseRichCommand;
          if (command === "heading") {
            document.execCommand("formatBlock", false, "h3");
          } else if (command === "paragraph") {
            document.execCommand("formatBlock", false, "p");
          } else if (command === "bold") {
            document.execCommand("bold");
          }
          syncCaseRichEditorField();
        });
      });
      const caseRichImageInput = modalCardEl.querySelector("[data-case-rich-image]");
      if (caseRichImageInput) {
        caseRichImageInput.addEventListener("change", () => {
          const file = caseRichImageInput.files?.[0];
          if (!file) return;
          appendCaseRichMedia("image", file);
          caseRichImageInput.value = "";
        });
      }
      const caseRichVideoInput = modalCardEl.querySelector("[data-case-rich-video]");
      if (caseRichVideoInput) {
        caseRichVideoInput.addEventListener("change", () => {
          const file = caseRichVideoInput.files?.[0];
          if (!file) return;
          appendCaseRichMedia("video", file);
          caseRichVideoInput.value = "";
        });
      }
      const caseUploadInput = modalCardEl.querySelector("[data-case-upload]");
      if (caseUploadInput) {
        caseUploadInput.addEventListener("change", () => {
          const file = caseUploadInput.files?.[0];
          if (!file) return;
          const imageField = modalCardEl.querySelector('[data-case-field="image"]');
          const imagePreviewField = modalCardEl.querySelector('[data-case-field="imagePreview"]');
          if (imageField) imageField.value = file.name;
          if (imagePreviewField) imagePreviewField.value = URL.createObjectURL(file);
          syncCaseEditorPreview();
        });
      }
      modalCardEl.querySelectorAll("[data-case-display-option]").forEach((button) => {
        button.addEventListener("click", () => {
          const displayInput = modalCardEl.querySelector('[data-case-field="display"]');
          if (displayInput) displayInput.value = button.dataset.caseDisplayOption;
          syncCaseEditorPreview();
        });
      });
      syncCaseRichEditorField();
      syncCaseEditorPreview();
    }

    const saveCaseBtn = modalCardEl.querySelector("[data-save-case]");
    if (saveCaseBtn) {
      saveCaseBtn.addEventListener("click", () => {
        saveCase(saveCaseBtn.dataset.mode, saveCaseBtn.dataset.caseId);
      });
    }

    const deleteCaseBtn = modalCardEl.querySelector("[data-delete-case]");
    if (deleteCaseBtn) {
      deleteCaseBtn.addEventListener("click", () => {
        deleteCase(deleteCaseBtn.dataset.caseId);
      });
    }

    const deleteProductBtn = modalCardEl.querySelector("[data-delete-product]");
    if (deleteProductBtn) {
      deleteProductBtn.addEventListener("click", () => {
        deleteProduct(deleteProductBtn.dataset.productSku);
      });
    }

    const updateStockBtn = modalCardEl.querySelector("[data-update-product-stock]");
    if (updateStockBtn) {
      updateStockBtn.addEventListener("click", () => {
        const input = modalCardEl.querySelector("[data-product-stock-input]");
        updateProductStock(updateStockBtn.dataset.productSku, input ? input.value.trim() : "");
      });
    }

    const submitPostDeleteBtn = modalCardEl.querySelector("[data-submit-post-delete]");
    if (submitPostDeleteBtn) {
      submitPostDeleteBtn.addEventListener("click", () => {
        const reasonInput = modalCardEl.querySelector("[data-post-delete-reason]");
        submitPostManage(submitPostDeleteBtn.dataset.postId, "delete", reasonInput ? reasonInput.value.trim() : "");
      });
    }

    const submitPostRestoreBtn = modalCardEl.querySelector("[data-submit-post-restore]");
    if (submitPostRestoreBtn) {
      submitPostRestoreBtn.addEventListener("click", () => {
        submitPostManage(submitPostRestoreBtn.dataset.postId, "restore");
      });
    }

    const submitCommentDeleteBtn = modalCardEl.querySelector("[data-submit-comment-delete]");
    if (submitCommentDeleteBtn) {
      submitCommentDeleteBtn.addEventListener("click", () => {
        const reasonInput = modalCardEl.querySelector("[data-comment-delete-reason]");
        submitCommentManage(submitCommentDeleteBtn.dataset.commentId, "delete", reasonInput ? reasonInput.value.trim() : "");
      });
    }

    const submitCommentRestoreBtn = modalCardEl.querySelector("[data-submit-comment-restore]");
    if (submitCommentRestoreBtn) {
      submitCommentRestoreBtn.addEventListener("click", () => {
        submitCommentManage(submitCommentRestoreBtn.dataset.commentId, "restore");
      });
    }

    const savePostCommerceBtn = modalCardEl.querySelector("[data-save-post-commerce]");
    if (savePostCommerceBtn) {
      savePostCommerceBtn.addEventListener("click", () => {
        savePostCommerce(savePostCommerceBtn.dataset.postId);
      });
    }

    const submitUserPunishBtn = modalCardEl.querySelector("[data-submit-user-punish]");
    if (submitUserPunishBtn) {
      submitUserPunishBtn.addEventListener("click", () => {
        submitUserPunish(submitUserPunishBtn.dataset.userId, submitUserPunishBtn.dataset.punishType);
      });
    }

    const saveVehicleModelBtn = modalCardEl.querySelector("[data-save-vehicle-model]");
    if (saveVehicleModelBtn) {
      saveVehicleModelBtn.addEventListener("click", () => {
        saveVehicleModel(saveVehicleModelBtn.dataset.mode, saveVehicleModelBtn.dataset.id);
      });
    }

    const deleteVehicleModelBtn = modalCardEl.querySelector("[data-delete-vehicle-model]");
    if (deleteVehicleModelBtn) {
      deleteVehicleModelBtn.addEventListener("click", () => {
        deleteVehicleModel(deleteVehicleModelBtn.dataset.id);
      });
    }

    const saveProviderAccountBtn = modalCardEl.querySelector("[data-save-provider-account]");
    if (saveProviderAccountBtn) {
      saveProviderAccountBtn.addEventListener("click", () => {
        saveProviderAccount(saveProviderAccountBtn.dataset.mode, saveProviderAccountBtn.dataset.id);
      });
    }

    const deleteProviderAccountBtn = modalCardEl.querySelector("[data-delete-provider-account]");
    if (deleteProviderAccountBtn) {
      deleteProviderAccountBtn.addEventListener("click", () => {
        deleteProviderAccount(deleteProviderAccountBtn.dataset.id);
      });
    }

    const fitmentPicker = modalCardEl.querySelector("[data-product-fitment-picker]");
    if (fitmentPicker) {
      renderProductFitmentPickerState(fitmentPicker);
      const searchInput = fitmentPicker.querySelector("[data-product-fitment-search]");
      if (searchInput) {
        searchInput.addEventListener("input", () => {
          renderProductFitmentPickerState(fitmentPicker);
        });
      }
      fitmentPicker.addEventListener("click", (event) => {
        const addBtn = event.target.closest("[data-product-fitment-add]");
        if (addBtn) {
          const selected = new Set(getProductFitmentSelection(fitmentPicker));
          selected.add(addBtn.dataset.productFitmentAdd);
          fitmentPicker.dataset.selected = Array.from(selected).join("||");
          renderProductFitmentPickerState(fitmentPicker);
          return;
        }
        const removeBtn = event.target.closest("[data-product-fitment-remove]");
        if (removeBtn) {
          const selected = getProductFitmentSelection(fitmentPicker).filter((item) => item !== removeBtn.dataset.productFitmentRemove);
          fitmentPicker.dataset.selected = selected.join("||");
          renderProductFitmentPickerState(fitmentPicker);
        }
      });
    }

    const saveMaterialBtn = modalCardEl.querySelector("[data-save-material]");
    if (saveMaterialBtn) {
      saveMaterialBtn.addEventListener("click", () => {
        saveMaterial(saveMaterialBtn.dataset.materialPage, saveMaterialBtn.dataset.materialId, saveMaterialBtn.dataset.materialMode);
      });
    }

    const saveRoleBtn = modalCardEl.querySelector("[data-save-role]");
    if (saveRoleBtn) {
      saveRoleBtn.addEventListener("click", () => {
        saveRole(saveRoleBtn.dataset.mode, saveRoleBtn.dataset.roleId);
      });
    }

    const saveConfigBtn = modalCardEl.querySelector("[data-save-config]");
    if (saveConfigBtn) {
      saveConfigBtn.addEventListener("click", () => {
        saveConfig(saveConfigBtn.dataset.configKey);
      });
    }

    const saveShippingBtn = modalCardEl.querySelector("[data-save-shipping]");
    if (saveShippingBtn) {
      saveShippingBtn.addEventListener("click", () => {
        const id = saveShippingBtn.dataset.id;
        const company = modalCardEl.querySelector("[data-shipping-field=\"company\"]")?.value.trim() || "";
        const number = modalCardEl.querySelector("[data-shipping-field=\"number\"]")?.value.trim() || "";
        const note = modalCardEl.querySelector("[data-shipping-field=\"note\"]")?.value.trim() || "";
        const target = shipping.find((item) => item.id === id);
        if (!target || !company || !number) return;
        target.company = company;
        target.number = number;
        target.note = note;
        target.status = "待签收";
        const order = orders.find((item) => item.id === target.orderId);
        if (order) appendOrderTimeline(order, `${company} 已发货，物流单号：${number}`);
        openFeedbackModal("发货已提交", `${target.id} 的物流信息已保存，状态已更新为待签收。`);
      });
    }

    const saveSigningBtn = modalCardEl.querySelector("[data-save-signing]");
    if (saveSigningBtn) {
      saveSigningBtn.addEventListener("click", () => {
        const orderId = saveSigningBtn.dataset.orderId;
        const status = modalCardEl.querySelector("[data-signing-field=\"status\"]")?.value || "已签收";
        const note = modalCardEl.querySelector("[data-signing-field=\"note\"]")?.value.trim() || "";
        const photoCount = modalCardEl.querySelector("[data-signing-field=\"photos\"]")?.files?.length || 0;
        const target = signing.find((item) => item.orderId === orderId);
        if (!target) return;
        if (status === "异常签收" && (!note || photoCount === 0)) {
          openFeedbackModal("信息不完整", "异常签收必须填写备注并上传异常照片。");
          return;
        }
        target.status = status;
        target.note = note;
        target.anomalyPhotos =
          status === "异常签收"
            ? Array.from({ length: photoCount }, (_, index) => `${orderId}-anomaly-${index + 1}.jpg`)
            : [];
        target.anomalyPhotoCount = target.anomalyPhotos.length ? `${target.anomalyPhotos.length} 张` : "-";
        target.signTime = "2026-04-02 18:15";
        openFeedbackModal("签收已更新", `${target.orderId} 已保存为 ${status}。`);
      });
    }
  }

  function openProviderAuditProcessModal(row) {
    openModal(`
      <div class="panel-header">
        <div>
          <span class="eyebrow">Provider Audit</span>
          <h2 class="section-title">处理入驻审核</h2>
          <p class="section-subtitle">${row.name} / ${row.providerRegion} / ${row.specialties}</p>
        </div>
      </div>
      <div class="action-grid" data-order-id="${row.id}">
        <button class="action-tile" type="button" data-audit-decision="approve" data-provider-id="${row.id}">
          <strong>审核通过</strong>
          <p>将服务商状态更新为正常营业，并进入平台服务商列表。</p>
        </button>
        <button class="action-tile" type="button" data-audit-decision="supplement" data-provider-id="${row.id}">
          <strong>要求补充资料</strong>
          <p>要求补齐门头照、施工位照片或授权资质后再次提交。</p>
        </button>
        <button class="action-tile" type="button" data-audit-decision="reject" data-provider-id="${row.id}">
          <strong>驳回申请</strong>
          <p>本次申请不通过，记录驳回原因并结束当前审核流程。</p>
        </button>
      </div>
      <div style="display:flex; gap:12px; margin-top:18px;">
        <button class="btn btn-secondary" type="button" data-close-modal>取消</button>
      </div>
    `);
  }

  function openProviderAuditMaterialsModal(row) {
    openModal(renderProviderMaterialsModal(row, {
      eyebrow: "Raw Materials",
      subtitle: `${row.name} 提交的门店入驻原始资料`,
    }));
  }

  function openProviderListMaterialsModal(row) {
    openModal(renderProviderMaterialsModal(row, {
      eyebrow: "Provider Profile",
      subtitle: `${row.name} 的平台留档详情`,
    }));
  }

  function openProviderAccountEditorModal(mode, row) {
    const isEdit = mode === "edit";
    const source = isEdit
      ? row
      : {
          provider: providers.find((item) => item.auditStatus === "已通过")?.name || "擎速 Motorsport Lab",
          account: "provider_new_account",
          name: "新账号姓名",
          phone: "138****0000",
          role: "管理员",
          lastLogin: "",
          status: "启用",
          note: "负责服务商后台日常操作。",
        };
    const providerOptions = providers
      .filter((item) => item.auditStatus === "已通过")
      .map((item) => `<option value="${item.name}" ${item.name === source.provider ? "selected" : ""}>${item.name}</option>`)
      .join("");
    openModal(`
      <div class="panel-header">
        <div>
          <span class="eyebrow">Provider Account Editor</span>
          <h2 class="section-title">${isEdit ? "编辑服务商账号" : "新增服务商账号"}</h2>
          <p class="section-subtitle">${isEdit ? `正在编辑 ${row.account}` : "创建新的服务商后台账号"}</p>
        </div>
      </div>
      <div class="form-grid">
        <div class="field-group">
          <div class="field-label">所属服务商</div>
          <select class="select" data-provider-account-field="provider">${providerOptions}</select>
        </div>
        <div class="field-group">
          <div class="field-label">登录账号</div>
          <input class="input" data-provider-account-field="account" value="${source.account}" />
        </div>
        <div class="field-group">
          <div class="field-label">姓名</div>
          <input class="input" data-provider-account-field="name" value="${source.name}" />
        </div>
        <div class="field-group">
          <div class="field-label">手机号</div>
          <input class="input" data-provider-account-field="phone" value="${source.phone}" />
        </div>
        <div class="field-group">
          <div class="field-label">角色</div>
          <select class="select" data-provider-account-field="role">
            ${["管理员", "员工"].map((item) => `<option value="${item}" ${item === source.role ? "selected" : ""}>${item}</option>`).join("")}
          </select>
        </div>
        <div class="field-group">
          <div class="field-label">账号状态</div>
          <select class="select" data-provider-account-field="status">
            ${["启用", "停用"].map((item) => `<option value="${item}" ${item === source.status ? "selected" : ""}>${item}</option>`).join("")}
          </select>
        </div>
        <div class="field-group">
          <div class="field-label">最近登录时间</div>
          <input class="input" data-provider-account-field="lastLogin" value="${source.lastLogin || ""}" placeholder="例如 2026-04-15 09:18" />
        </div>
        <div class="field-group field-group-full">
          <div class="field-label">备注</div>
          <textarea class="textarea" data-provider-account-field="note">${source.note || ""}</textarea>
        </div>
      </div>
      <div style="display:flex; gap:12px; margin-top:18px;">
        <button class="btn btn-primary" type="button" data-save-provider-account data-mode="${mode}" ${isEdit ? `data-id="${row.id}"` : ""}>${isEdit ? "保存修改" : "确认新增"}</button>
        <button class="btn btn-secondary" type="button" data-close-modal>取消</button>
      </div>
    `);
  }

  function openProviderAccountDeleteModal(row) {
    openModal(`
      <div class="panel-header">
        <div>
          <span class="eyebrow">Provider Account Delete</span>
          <h2 class="section-title">删除服务商账号</h2>
          <p class="section-subtitle">确认删除账号“${row.account}”吗？此操作仅影响当前 mock 展示数据。</p>
        </div>
      </div>
      <div style="display:flex; gap:12px; margin-top:18px;">
        <button class="btn btn-danger" type="button" data-delete-provider-account data-id="${row.id}">确认删除</button>
        <button class="btn btn-secondary" type="button" data-close-modal>取消</button>
      </div>
    `);
  }

  function renderProviderMaterialsModal(row, options = {}) {
    const address = row.address || `${row.locationProvince || ""}${row.locationCity || ""}${row.locationCounty || ""}${row.locationAddress || ""}`;
    const gallery = [
      { title: "门头主视图", desc: "展示门店招牌、主入口和停车落客区", tone: "orange" },
      { title: "接待区", desc: "展示接待台、客户休息区和洽谈区", tone: "blue" },
      { title: "施工环境", desc: "展示施工区域、工具墙和作业动线", tone: "teal" },
      { title: "完工交付区", desc: "展示交付车位、灯光和交车氛围", tone: "gold" },
    ];
    const contracts = [
      { title: "合作合同首页", meta: `合同编号 ${row.contractNo}` },
      { title: "盖章签署页", meta: `状态 ${row.contractStatus}` },
      { title: "补充协议附件", meta: `${row.contractStart || "待补充"} 至 ${row.contractEnd || "待补充"}` },
    ];
    const credentials = [
      { title: "营业执照", meta: row.license },
      { title: "品牌授权文件", meta: "轮毂、制动、车衣等合作授权" },
      { title: "技师认证", meta: "高级技师认证 / 施工规范承诺" },
    ];

    return `
      <div class="panel-header">
        <div>
          <span class="eyebrow">${options.eyebrow || "Provider Profile"}</span>
          <h2 class="section-title">查看详情</h2>
          <p class="section-subtitle">${options.subtitle || `${row.name} 的平台留档详情`}</p>
        </div>
      </div>
      <div style="display:flex; gap:10px; flex-wrap:wrap; margin-bottom:18px;">
        ${[...new Set([row.auditStatus, row.auditStatus === "待审核" ? "" : row.status, row.score ? `${row.score} 分` : ""].filter(Boolean))].map((item) => formatTag(item)).join("")}
      </div>
      <div class="provider-material-layout">
        <section class="provider-material-section">
          <div class="panel-header" style="margin-bottom:12px;">
            <div><h3 class="section-title" style="font-size:18px;">基础信息</h3></div>
          </div>
          <div class="provider-material-grid">
            ${[
              ["门店编号", row.id],
              ["门店名称", row.name],
              ["联系人", row.contact],
              ["主营能力", row.specialties],
              ["近30日订单", `${row.monthOrders} 单`],
            ].map(([label, value]) => `<div class="provider-material-card"><span>${label}</span><strong>${value || "-"}</strong></div>`).join("")}
          </div>
        </section>
        <section class="provider-material-section">
          <div class="panel-header" style="margin-bottom:12px;">
            <div><h3 class="section-title" style="font-size:18px;">位置信息</h3></div>
          </div>
          <div class="provider-material-grid provider-material-grid-wide">
            <div class="provider-material-card">
              <span>所在地区</span>
              <strong>${row.providerRegion}</strong>
            </div>
            <div class="provider-material-card">
              <span>详细地址</span>
              <strong>${address}</strong>
            </div>
          </div>
          <div class="provider-material-visual provider-material-map">
            <div class="provider-material-map-pin"></div>
            <div>
              <div class="eyebrow">Location Preview</div>
              <strong>${row.name}</strong>
              <p>${address}</p>
            </div>
          </div>
        </section>
        <section class="provider-material-section">
          <div class="panel-header" style="margin-bottom:12px;">
            <div><h3 class="section-title" style="font-size:18px;">合同信息</h3></div>
          </div>
          <div class="provider-material-grid">
            ${[
              ["合同编号", row.contractNo],
              ["合同状态", row.contractStatus],
              ["合同开始时间", row.contractStart || "待补充"],
              ["合同结束时间", row.contractEnd || "待补充"],
            ].map(([label, value]) => `<div class="provider-material-card"><span>${label}</span><strong>${value || "-"}</strong></div>`).join("")}
          </div>
          <div class="provider-material-doc-grid">
            ${contracts.map((item, index) => `
              <article class="provider-material-doc provider-material-doc-${index + 1}">
                <div class="eyebrow">Contract File</div>
                <strong>${item.title}</strong>
                <p>${item.meta}</p>
              </article>
            `).join("")}
          </div>
        </section>
        <section class="provider-material-section">
          <div class="panel-header" style="margin-bottom:12px;">
            <div><h3 class="section-title" style="font-size:18px;">图片留档</h3></div>
          </div>
          <div class="provider-material-gallery">
            ${gallery.map((item) => `
              <article class="provider-material-shot" data-tone="${item.tone}">
                <div class="provider-material-shot-media">${item.title}</div>
                <strong>${item.title}</strong>
                <p>${item.desc}</p>
              </article>
            `).join("")}
          </div>
        </section>
        <section class="provider-material-section">
          <div class="panel-header" style="margin-bottom:12px;">
            <div><h3 class="section-title" style="font-size:18px;">资质文件</h3></div>
          </div>
          <div class="provider-material-doc-grid">
            ${credentials.map((item, index) => `
              <article class="provider-material-doc provider-material-credential-${index + 1}">
                <div class="eyebrow">Credential</div>
                <strong>${item.title}</strong>
                <p>${item.meta}</p>
              </article>
            `).join("")}
          </div>
        </section>
        <section class="provider-material-section">
          <div class="panel-header" style="margin-bottom:12px;">
            <div><h3 class="section-title" style="font-size:18px;">经营信息</h3></div>
          </div>
          <div class="provider-material-grid">
            ${[
              ["累计订单", `${row.totalOrders || 0} 单`],
              ["本月订单", `${row.monthOrders || 0} 单`],
              ["当前营收", row.currentRevenue || "-"],
              ["门店工位", `${row.bays || 0} 个`],
            ].map(([label, value]) => `<div class="provider-material-card"><span>${label}</span><strong>${value}</strong></div>`).join("")}
          </div>
        </section>
        <section class="provider-material-section">
          <div class="panel-header" style="margin-bottom:12px;">
            <div><h3 class="section-title" style="font-size:18px;">处理轨迹</h3></div>
          </div>
          <div class="timeline">
            ${(row.timeline || []).map((item) => `<div class="timeline-item">${item}</div>`).join("")}
          </div>
        </section>
      </div>
      <div style="display:flex; gap:12px; margin-top:18px;">
        <button class="btn btn-primary" type="button" data-close-modal>关闭</button>
      </div>
    `;
  }

  function openUserMaterialsModal(row) {
    const docs = [
      { title: "用户基础资料", desc: `${row.name} / ${row.id} / ${row.city}` },
      { title: "账号状态", desc: row.status },
      { title: "绑定车辆数", desc: `${row.vehicles} 辆` },
      { title: "累计订单", desc: `${row.orders} 单` },
      { title: "高频车型", desc: row.favorite },
      { title: "平台留档", desc: "注册信息、收货地址、车辆绑定记录、历史订单、风控与消息记录" },
    ];

    openModal(`
      <div class="panel-header">
        <div>
          <span class="eyebrow">User Profile</span>
          <h2 class="section-title">查看详情</h2>
          <p class="section-subtitle">${row.name} 的用户留档原始资料</p>
        </div>
      </div>
      <div class="doc-list">
        ${docs.map((doc) => `<div class="doc-item"><strong>${doc.title}</strong><div class="muted">${doc.desc}</div></div>`).join("")}
      </div>
      <div style="display:flex; gap:12px; margin-top:18px;">
        <button class="btn btn-primary" type="button" data-close-modal>关闭</button>
      </div>
    `);
  }

  function openVehicleMaterialsModal(row) {
    const docs = [
      { title: "车辆基础资料", desc: `${row.model} / ${row.plate} / ${row.color}` },
      { title: "车主信息", desc: row.owner },
      { title: "改装历史", desc: row.history },
      { title: "档案图片", desc: "车辆外观图、轮毂细节图、施工前后对比图、交付照片" },
      { title: "施工留档", desc: "项目清单、施工备注、服务门店、完工时间、回访记录" },
      { title: "平台备注", desc: "该车辆档案仅用于订单分配、服务核对与历史记录查询" },
    ];

    openModal(`
      <div class="panel-header">
        <div>
          <span class="eyebrow">Vehicle Archive</span>
          <h2 class="section-title">查看详情</h2>
          <p class="section-subtitle">${row.model} 的车辆档案原始资料</p>
        </div>
      </div>
      <div class="doc-list">
        ${docs.map((doc) => `<div class="doc-item"><strong>${doc.title}</strong><div class="muted">${doc.desc}</div></div>`).join("")}
      </div>
      <div style="display:flex; gap:12px; margin-top:18px;">
        <button class="btn btn-primary" type="button" data-close-modal>关闭</button>
      </div>
    `);
  }

  function openGenericDetailModal(detail) {
    openModal(`
      <div class="panel-header">
        <div>
          <span class="eyebrow">Detail View</span>
          <h2 class="section-title">查看详情</h2>
          <p class="section-subtitle">${detail.title} 的完整资料信息</p>
        </div>
      </div>
      <div style="display:flex; gap:10px; flex-wrap:wrap; margin-bottom:18px;">
        ${detail.badges.map((item) => formatTag(item)).join("")}
      </div>
      <div class="doc-list">
        ${detail.facts
          .map(
            ([label, value]) => `
              <div class="doc-item">
                <strong>${label}</strong>
                <div class="muted">${value}</div>
              </div>
            `
          )
          .join("")}
      </div>
      <div style="margin-top:18px;">
        <div class="panel-header" style="margin-bottom:12px;">
          <div><h3 class="section-title" style="font-size:18px;">处理轨迹</h3></div>
        </div>
        <div class="timeline">
          ${detail.timeline.map((item) => `<div class="timeline-item">${item}</div>`).join("")}
        </div>
      </div>
      <div style="display:flex; gap:12px; margin-top:18px;">
        <button class="btn btn-primary" type="button" data-close-modal>关闭</button>
      </div>
    `);
  }

  function openOrderProcessModal(row) {
    openModal(`
      <div class="panel-header">
        <div>
          <span class="eyebrow">Order Process</span>
          <h2 class="section-title">处理订单</h2>
          <p class="section-subtitle">${row.id} 路 ${row.user} 路 ${row.vehicle}</p>
        </div>
      </div>
      <div class="action-grid">
        <button class="action-tile" type="button" data-order-process="assign">
          <strong>重新派单</strong>
          <p>将订单重新分配给其他服务商，并记录派单原因。</p>
        </button>
        <button class="action-tile" type="button" data-order-process="progress">
          <strong>更新进度</strong>
          <p>将订单状态更新为施工中、待发货或已完成。</p>
        </button>
        <button class="action-tile" type="button" data-order-process="close">
          <strong>关闭订单</strong>
          <p>将订单标记为已完成并写入处理轨迹。</p>
        </button>
      </div>
      <div style="display:flex; gap:12px; margin-top:18px;">
        <button class="btn btn-secondary" type="button" data-close-modal>取消</button>
      </div>
    `);
  }

  function openOrderAssignModal(row) {
    const recommendations = providers
      .filter((item) => item.status === "正常营业" && item.name !== row.rejectedBy)
      .slice(0, 4);
    openModal(`
      <div class="panel-header">
        <div>
          <span class="eyebrow">Assignment Center</span>
          <h2 class="section-title">重新派单</h2>
          <p class="section-subtitle">${row.id} 路 ${row.user} 路 ${row.service}</p>
        </div>
      </div>
      <div class="doc-list">
        ${recommendations
          .map(
            (item, index) => `
              <div class="doc-item">
                <strong>#${index + 1} ${item.name}</strong>
                <div class="muted">${item.providerRegion} / ${item.specialties}${row.intention === item.name ? " / 客户意向门店" : ""}</div>
                <div style="margin-top:8px; display:flex; gap:8px; flex-wrap:wrap;">
                  ${formatTag(item.status)}
                  <button class="btn btn-primary" type="button" data-assign-provider="${item.id}">派给此门店</button>
                </div>
              </div>
            `
          )
          .join("")}
      </div>
      <div style="display:flex; gap:12px; margin-top:18px;">
        <button class="btn btn-secondary" type="button" data-close-modal>取消</button>
      </div>
    `);
  }

  function openOrderAssignDetailModal(row) {
    openModal(`
      <div class="panel-header">
        <div>
          <span class="eyebrow">Assignment Detail</span>
          <h2 class="section-title">查看推荐</h2>
          <p class="section-subtitle">${row.id} 的推荐分配信息</p>
        </div>
      </div>
      <div class="doc-list">
        <div class="doc-item"><strong>用户</strong><div class="muted">${row.user}</div></div>
        <div class="doc-item"><strong>车辆</strong><div class="muted">${row.vehicle}</div></div>
        <div class="doc-item"><strong>需求</strong><div class="muted">${row.service}</div></div>
        <div class="doc-item"><strong>城市</strong><div class="muted">${row.city}</div></div>
        <div class="doc-item"><strong>意向门店</strong><div class="muted">${row.intention}</div></div>
        <div class="doc-item"><strong>当前进度</strong><div class="muted">${row.progress}</div></div>
        <div class="doc-item"><strong>用户端状态</strong><div class="muted">${row.userVisibleStatus || row.status}</div></div>
        <div class="doc-item"><strong>拒单服务商</strong><div class="muted">${row.rejectedBy || "-"}</div></div>
        <div class="doc-item"><strong>拒单原因</strong><div class="muted">${row.rejectReason || "-"}</div></div>
      </div>
      <div style="margin-top:18px;">
        <div class="panel-header" style="margin-bottom:12px;">
          <div><h3 class="section-title" style="font-size:18px;">处理轨迹</h3></div>
        </div>
        <div class="timeline">
          ${(row.timeline || ["暂无处理轨迹"]).map((item) => `<div class="timeline-item">${item}</div>`).join("")}
        </div>
      </div>
      <div style="display:flex; gap:12px; margin-top:18px;">
        <button class="btn btn-primary" type="button" data-close-modal>关闭</button>
      </div>
    `);
  }

  function openOrderDelayModal(row) {
    openModal(`
      <div class="panel-header">
        <div>
          <span class="eyebrow">Assignment Delay</span>
          <h2 class="section-title">延期处理</h2>
          <p class="section-subtitle">${row.id} / 用户端保持待接单，平台继续介入。</p>
        </div>
      </div>
      <div class="form-grid">
        <div class="field-group">
          <label class="field-label" for="assign-delay-deadline">延期截止时间</label>
          <input class="input" id="assign-delay-deadline" data-assign-delay-field="deadline" type="datetime-local" value="2026-04-03T18:00">
        </div>
        <div class="field-group field-group-full">
          <label class="field-label" for="assign-delay-note">平台备注</label>
          <textarea class="input" id="assign-delay-note" data-assign-delay-field="note" rows="3">服务商拒单后平台介入，继续为用户匹配可接单门店；用户端暂不展示拒单原因。</textarea>
        </div>
      </div>
      <div class="admin-action-row">
        <button class="btn btn-secondary" type="button" data-close-modal>取消</button>
        <button class="btn btn-primary" type="button" data-submit-assign-delay data-order-id="${row.id}">确认延期</button>
      </div>
    `);
  }

  function openCategoryEditorModal(mode, row) {
    const isEdit = mode === "edit";
    const parentOptions = ['<option value="">一级分类</option>']
      .concat(
        categories
          .filter((item) => (item.level || 0) === 0 && (!isEdit || item.name !== row.name))
          .map(
            (item) =>
              `<option value="${item.name}" ${((isEdit ? row.parent : "") || "") === item.name ? "selected" : ""}>${item.name}</option>`
          )
      )
      .join("");
    openModal(`
      <div class="panel-header">
        <div>
          <span class="eyebrow">Category Editor</span>
          <h2 class="section-title">${isEdit ? "编辑分类" : "新增分类"}</h2>
          <p class="section-subtitle">${isEdit ? `正在编辑 ${row.name}` : "创建新的商品分类信息"}</p>
        </div>
      </div>
      <div class="form-grid">
        <div class="field-group">分类名称</div>
          <input class="input" data-category-field="name" placeholder="请输入分类名称" value="${isEdit ? row.name : ""}" />
        </div>
        <div class="field-group">排序</div>
          <input class="input" data-category-field="sort" placeholder="请输入排序值" value="${isEdit ? row.sort : categories.length + 1}" />
        </div>
        <div class="field-group">上级分类</div>
          <select class="select" data-category-field="parent">
            ${parentOptions}
          </select>
        </div>
        <div class="field-group">状态</div>
          <select class="select" data-category-field="status">
            <option value="启用" ${(isEdit ? row.status : "启用") === "启用" ? "selected" : ""}>启用</option>
            <option value="停用" ${(isEdit ? row.status : "启用") === "停用" ? "selected" : ""}>停用</option>
          </select>
        </div>
      </div>
      <div style="display:flex; gap:12px; margin-top:18px;">
        <button class="btn btn-primary" type="button" data-save-category data-mode="${mode}" ${isEdit ? `data-name="${row.name}"` : ""}>${isEdit ? "保存修改" : "确认新增"}</button>
        <button class="btn btn-secondary" type="button" data-close-modal>取消</button>
      </div>
    `);
  }

  function openCategoryDeleteModal(row) {
    openModal(`
      <div class="panel-header">
        <div>
          <span class="eyebrow">Category Delete</span>
          <h2 class="section-title">删除分类</h2>
          <p class="section-subtitle">确认删除商品分类“${row.name}”吗？此操作仅影响当前 mock 展示数据。</p>
        </div>
      </div>
      <div style="display:flex; gap:12px; margin-top:18px;">
        <button class="btn btn-danger" type="button" data-delete-category data-name="${row.name}">确认删除</button>
        <button class="btn btn-secondary" type="button" data-close-modal>取消</button>
      </div>
    `);
  }

  function openForumBoardEditorModal(mode, row) {
    const isEdit = mode === "edit";
    const source = row || { id: `BOARD-${Date.now().toString().slice(-4)}`, name: "", summary: "", currentModerators: "", status: "启用" };
    const moderatorList = String(source.currentModerators || "").split(/[、,]/).map((s) => s.trim()).filter(Boolean);
    openModal(`
      <div class="panel-header">
        <div>
          <span class="eyebrow">Forum Board</span>
          <h2 class="section-title">${isEdit ? "编辑版面" : "新增版面"}</h2>
          <p class="section-subtitle">${source.id} / ${isEdit ? source.name : "创建新的论坛版面"}</p>
        </div>
      </div>
      <div class="form-grid">
        <div class="field-group">
          <div class="field-label">版面名称</div>
          <input class="input" data-forum-board-field="name" value="${source.name}" />
        </div>
        <div class="field-group field-group-full">
          <div class="field-label">当前版主</div>
          <div id="moderatorTagList" style="display:flex; gap:8px; flex-wrap:wrap; margin-bottom:10px;">
            ${moderatorList.map((m) => `<span class="pill" style="display:inline-flex; align-items:center; gap:6px;">${m}<button type="button" class="btn btn-danger btn-sm" data-delete-moderator style="padding:2px 6px; font-size:11px; line-height:1;">×</button></span>`).join("")}
          </div>
          <div style="display:flex; gap:8px;">
            <input class="input" id="newModeratorInput" placeholder="输入版主名称" />
            <button class="btn btn-secondary" type="button" data-add-moderator>添加</button>
          </div>
          <input type="hidden" data-forum-board-field="currentModerators" value="${source.currentModerators || ""}" />
        </div>
        <div class="field-group field-group-full">
          <div class="field-label">版面说明</div>
          <textarea class="textarea" data-forum-board-field="summary">${source.summary || ""}</textarea>
        </div>
        <div class="field-group">
          <div class="field-label">状态</div>
          <select class="select" data-forum-board-field="status">
            ${["启用", "停用"].map((item) => `<option value="${item}" ${item === source.status ? "selected" : ""}>${item}</option>`).join("")}
          </select>
        </div>
      </div>
      <div style="display:flex; gap:12px; margin-top:18px;">
        <button class="btn btn-primary" type="button" data-save-forum-board data-mode="${mode}" data-id="${source.id}">${isEdit ? "保存修改" : "确认新增"}</button>
        <button class="btn btn-secondary" type="button" data-close-modal>取消</button>
      </div>
    `);
  }

  function openForumBoardDeleteModal(row) {
    openModal(`
      <div class="panel-header">
        <div>
          <span class="eyebrow">Forum Board</span>
          <h2 class="section-title">删除版面</h2>
          <p class="section-subtitle">确认删除版面“${row.name}”吗？</p>
        </div>
      </div>
      <div style="display:flex; gap:12px; margin-top:18px;">
        <button class="btn btn-danger" type="button" data-delete-forum-board data-id="${row.id}">确认删除</button>
        <button class="btn btn-secondary" type="button" data-close-modal>取消</button>
      </div>
    `);
  }


  function openServiceEditorModal(mode, row) {
    const isEdit = mode === "edit";
    const source = isEdit
      ? row
      : {
          regionProvince: "上海市",
          regionCity: "上海市",
          regionCounty: "闵行区",
          basePrice: "¥ 9,800",
          floatRatio: "12%",
          status: "启用",
        };
    const provinceOptions = Object.keys(serviceRegionOptions.全国)
      .map(
        (item) => `<option value="${item}" ${source.regionProvince === item ? "selected" : ""}>${item}</option>`
      )
      .join("");
    const cityOptions = Object.keys(serviceRegionOptions.全国[source.regionProvince] || {})
      .map(
        (item) => `<option value="${item}" ${source.regionCity === item ? "selected" : ""}>${item}</option>`
      )
      .join("");
    const countyOptions = (serviceRegionOptions.全国[source.regionProvince]?.[source.regionCity] || [])
      .map(
        (item) => `<option value="${item}" ${source.regionCounty === item ? "selected" : ""}>${item}</option>`
      )
      .join("");
    openModal(`
      <div class="panel-header">
        <div>
          <span class="eyebrow">Service Editor</span>
          <h2 class="section-title">${isEdit ? "编辑服务项目" : "新增服务项目"}</h2>
          <p class="section-subtitle">${isEdit ? `正在编辑 ${row.name}` : "创建新的服务项目资料"}</p>
        </div>
      </div>
      <div class="form-grid">
        <div class="field-group">编码</div>
          <input class="input" data-service-field="code" placeholder="请输入服务编码" value="${isEdit ? row.code : "SV-199"}" />
        </div>
        <div class="field-group">项目名称</div>
          <input class="input" data-service-field="name" placeholder="请输入项目名称" value="${isEdit ? row.name : ""}" />
        </div>
        <div class="field-group">
          <div class="field-label">省</div>
          <select class="select" data-service-field="province">
            ${provinceOptions}
          </select>
        </div>
        <div class="field-group">
          <div class="field-label">市</div>
          <select class="select" data-service-field="city">
            ${cityOptions}
          </select>
        </div>
        <div class="field-group">
          <div class="field-label">县/区</div>
          <select class="select" data-service-field="county">
            ${countyOptions}
          </select>
        </div>
        <div class="field-group">
          <div class="field-label">基准价</div>
          <input class="input" data-service-field="basePrice" placeholder="请输入基准价" value="${source.basePrice}" />
        </div>
        <div class="field-group">
          <div class="field-label">价格浮动比例</div>
          <input class="input" data-service-field="floatRatio" placeholder="请输入价格浮动比例" value="${source.floatRatio}" />
        </div>
        <div class="field-group field-group-full">
          <div class="field-label">说明</div>
          <textarea class="textarea" data-service-field="desc" placeholder="请输入服务说明">${isEdit ? row.desc : ""}</textarea>
        </div>
        <div class="field-group">状态</div>
          <select class="select" data-service-field="status">
            <option value="启用" ${(isEdit ? row.status : "启用") === "启用" ? "selected" : ""}>启用</option>
            <option value="停用" ${(isEdit ? row.status : "启用") === "停用" ? "selected" : ""}>停用</option>
          </select>
        </div>
      </div>
      <div style="display:flex; gap:12px; margin-top:18px;">
        <button class="btn btn-primary" type="button" data-save-service data-mode="${mode}" ${isEdit ? `data-code="${row.code}"` : ""}>${isEdit ? "保存修改" : "确认新增"}</button>
        <button class="btn btn-secondary" type="button" data-close-modal>取消</button>
      </div>
    `);
  }

  function openServiceDeleteModal(row) {
    openModal(`
      <div class="panel-header">
        <div>
          <span class="eyebrow">Service Delete</span>
          <h2 class="section-title">删除服务项目</h2>
          <p class="section-subtitle">确认删除服务项目“${row.name}”吗？此操作仅影响当前 mock 展示数据。</p>
        </div>
      </div>
      <div style="display:flex; gap:12px; margin-top:18px;">
        <button class="btn btn-danger" type="button" data-delete-service data-code="${row.code}">确认删除</button>
        <button class="btn btn-secondary" type="button" data-close-modal>取消</button>
      </div>
    `);
  }

  const promotionScopeOptions = ["轮毂", "车衣", "制动", "排气", "内饰", "底盘", "保养精品"];

  function normalizePromotionRule(row = {}) {
    const type = row.type || "满减";
    if (row.rule && typeof row.rule === "object") {
      return {
        minAmount: Number(row.rule.minAmount || 0),
        reduceAmount: Number(row.rule.reduceAmount || 0),
        discountRate: Number(row.rule.discountRate || 0),
        couponAmount: Number(row.rule.couponAmount || 0),
      };
    }
    const text = String(row.discount || "");
    if (type === "折扣") return { discountRate: Number(text.match(/(\d+(?:\.\d+)?)/)?.[1] || 85) };
    if (type === "优惠券") return { minAmount: Number(text.match(/满(\d+)/)?.[1] || 0), couponAmount: Number(text.match(/减(\d+)|券(\d+)/)?.[1] || text.match(/减(\d+)|券(\d+)/)?.[2] || 0) };
    return { minAmount: Number(text.match(/满(\d+)/)?.[1] || 20000), reduceAmount: Number(text.match(/减(\d+)/)?.[1] || 3000) };
  }

  function normalizePromotionScopes(row = {}) {
    if (Array.isArray(row.scopeCategories) && row.scopeCategories.length) return row.scopeCategories;
    const scope = String(row.scope || "");
    return promotionScopeOptions.filter((item) => scope.includes(item));
  }

  function formatPromotionDiscount(type, rule) {
    if (type === "折扣") return `${Number(rule.discountRate || 0)}折`;
    if (type === "优惠券") return rule.minAmount ? `满${Number(rule.minAmount)}可用，券${Number(rule.couponAmount || 0)}` : `券${Number(rule.couponAmount || 0)}`;
    return `满${Number(rule.minAmount || 0)}减${Number(rule.reduceAmount || 0)}`;
  }

  function formatPromotionScope(scopeCategories) {
    return scopeCategories.length ? scopeCategories.join(" / ") : "全部类目";
  }

  function calculatePromotionDiscount(promotion, amount, category) {
    const rule = normalizePromotionRule(promotion);
    const scopes = normalizePromotionScopes(promotion);
    const amountValue = Number(amount || 0);
    if (scopes.length && category && !scopes.includes(category)) return 0;
    if (promotion.type === "折扣") return Math.max(0, Math.round(amountValue * (1 - Number(rule.discountRate || 100) / 100)));
    if (promotion.type === "优惠券") return amountValue >= Number(rule.minAmount || 0) ? Number(rule.couponAmount || 0) : 0;
    return amountValue >= Number(rule.minAmount || 0) ? Number(rule.reduceAmount || 0) : 0;
  }

  function renderPromotionRuleFields(type, rule = {}) {
    if (type === "折扣") {
      return `
        <div class="field-group">
          <label class="field-label">折扣值</label>
          <input class="input" data-promotion-rule="discountRate" type="number" min="1" max="99" step="0.1" value="${rule.discountRate || 85}" />
          <div class="muted" style="margin-top:6px;">例如 85 表示 85 折。</div>
        </div>
      `;
    }
    if (type === "优惠券") {
      return `
        <div class="field-group">
          <label class="field-label">使用门槛</label>
          <input class="input" data-promotion-rule="minAmount" type="number" min="0" step="100" value="${rule.minAmount || 0}" />
        </div>
        <div class="field-group">
          <label class="field-label">券面金额</label>
          <input class="input" data-promotion-rule="couponAmount" type="number" min="1" step="100" value="${rule.couponAmount || 1000}" />
        </div>
      `;
    }
    return `
      <div class="field-group">
        <label class="field-label">满额门槛</label>
        <input class="input" data-promotion-rule="minAmount" type="number" min="1" step="100" value="${rule.minAmount || 20000}" />
      </div>
      <div class="field-group">
        <label class="field-label">减免金额</label>
        <input class="input" data-promotion-rule="reduceAmount" type="number" min="1" step="100" value="${rule.reduceAmount || 3000}" />
      </div>
    `;
  }

  function refreshPromotionRuleEditor(type) {
    const target = modalCardEl.querySelector("[data-promotion-rule-panel]");
    if (!target) return;
    target.innerHTML = renderPromotionRuleFields(type, normalizePromotionRule({ type }));
  }

  function openPromotionEditorModal(mode = "create", row = {}) {
    const isEdit = mode === "edit";
    const nextId = `PROMO-${String((window.MockData.promotions || []).length + 1).padStart(3, "0")}`;
    const type = row.type || "满减";
    const rule = normalizePromotionRule(row);
    const scopes = normalizePromotionScopes(row);
    openModal(`
      <div class="platform-detail-modal">
        <div class="panel-header">
          <div>
            <span class="eyebrow">Promotion</span>
            <h2 class="section-title">${isEdit ? "编辑活动" : "新增活动"}</h2>
          </div>
          <button class="btn btn-secondary" type="button" data-close-modal>关闭</button>
        </div>
        <div class="form-grid">
          <div class="field-group">
            <label class="field-label">活动编号</label>
            <input class="input" data-promotion-field="id" value="${row.id || nextId}" ${isEdit ? "readonly" : ""} />
          </div>
          <div class="field-group">
            <label class="field-label">活动名称</label>
            <input class="input" data-promotion-field="name" value="${row.name || "夏季改装焕新礼"}" />
          </div>
          <div class="field-group">
            <label class="field-label">活动类型</label>
            <select class="input" data-promotion-field="type">
              ${["满减", "折扣", "优惠券"].map((item) => `<option value="${item}" ${item === type ? "selected" : ""}>${item}</option>`).join("")}
            </select>
          </div>
          <div class="field-group">
            <label class="field-label">库存</label>
            <input class="input" data-promotion-field="stock" type="number" min="1" value="${row.stock || 300}" />
          </div>
          <div class="field-group field-group-full">
            <label class="field-label">优惠规则</label>
            <div class="form-grid" data-promotion-rule-panel>
              ${renderPromotionRuleFields(type, rule)}
            </div>
          </div>
          <div class="field-group field-group-full">
            <label class="field-label">适用范围</label>
            <div class="promotion-scope-grid">
              ${promotionScopeOptions.map((item) => `
                <label class="promotion-scope-option">
                  <input type="checkbox" data-promotion-scope value="${item}" ${scopes.includes(item) ? "checked" : ""} />
                  <span>${item}</span>
                </label>
              `).join("")}
            </div>
          </div>
          <div class="field-group">
            <label class="field-label">开始时间</label>
            <input class="input" data-promotion-field="start" type="date" value="${row.start || "2026-06-01"}" />
          </div>
          <div class="field-group">
            <label class="field-label">结束时间</label>
            <input class="input" data-promotion-field="end" type="date" value="${row.end || "2026-06-30"}" />
          </div>
        </div>
        <div class="platform-detail-modal-footer">
          <button class="btn btn-secondary" type="button" data-close-modal>取消</button>
          <button class="btn btn-primary" type="button" data-save-promotion data-mode="${mode}" data-id="${row.id || ""}">保存活动</button>
        </div>
      </div>
    `);
    modalCardEl.querySelector('[data-promotion-field="type"]')?.addEventListener("change", (event) => {
      refreshPromotionRuleEditor(event.target.value);
    });
  }

  function openPromotionRedemptionModal(row) {
    const rows = promotionRedemptions.filter((item) => item.promoId === row.id);
    openModal(`
      <div class="platform-detail-modal">
        <div class="panel-header">
          <div>
            <span class="eyebrow">Redemption</span>
            <h2 class="section-title">${row.name} 核销详情</h2>
          </div>
          <button class="btn btn-secondary" type="button" data-close-modal>关闭</button>
        </div>
        <section class="promotion-redemption-summary">
          <article><span>已核销</span><strong>${row.used || 0}</strong></article>
          <article><span>发放库存</span><strong>${row.stock || 0}</strong></article>
          <article><span>核销比例</span><strong>${row.stock ? Math.round((row.used / row.stock) * 100) : 0}%</strong></article>
        </section>
        <div class="promotion-redemption-list">
          ${
            rows.length
              ? rows
                  .map(
                    (item) => `
                      <article>
                        <div>
                          <strong>${item.coupon}</strong>
                          <span>${item.user} / ${item.orderId} / ${item.channel}</span>
                        </div>
                        <div>
                          <b>${item.amount}</b>
                          ${formatTag(item.status)}
                        </div>
                        <small>${item.time}</small>
                      </article>
                    `
                  )
                  .join("")
              : `<div class="muted">暂无核销记录</div>`
          }
        </div>
        <div class="platform-detail-modal-footer">
          <button class="btn btn-secondary" type="button" data-close-modal>关闭</button>
        </div>
      </div>
    `);
  }

  function savePromotion(mode = "create", originalId = "") {
    const getValue = (field) => String(modalCardEl.querySelector(`[data-promotion-field="${field}"]`)?.value || "").trim();
    const type = getValue("type");
    const rule = {};
    modalCardEl.querySelectorAll("[data-promotion-rule]").forEach((input) => {
      rule[input.dataset.promotionRule] = Number(input.value || 0);
    });
    const scopeCategories = Array.from(modalCardEl.querySelectorAll("[data-promotion-scope]:checked")).map((input) => input.value);
    const payload = {
      id: getValue("id"),
      name: getValue("name"),
      type,
      rule,
      discount: formatPromotionDiscount(type, rule),
      scopeCategories,
      scope: formatPromotionScope(scopeCategories),
      start: getValue("start"),
      end: getValue("end"),
      stock: Number(getValue("stock") || 0),
      used: mode === "edit" ? Number((window.MockData.promotions || []).find((item) => item.id === originalId)?.used || 0) : 0,
      status: mode === "edit" ? ((window.MockData.promotions || []).find((item) => item.id === originalId)?.status || "未开始") : "未开始",
    };
    if (!payload.id || !payload.name) {
      openFeedbackModal("活动信息不完整", "请填写活动编号和活动名称。");
      return;
    }
    if (payload.stock <= 0) {
      openFeedbackModal("库存不合法", "活动库存必须大于 0。");
      return;
    }
    if (type === "满减" && (!rule.minAmount || !rule.reduceAmount || rule.reduceAmount >= rule.minAmount)) {
      openFeedbackModal("优惠规则不合法", "满减活动需要填写门槛和减免金额，且减免金额必须小于门槛金额。");
      return;
    }
    if (type === "折扣" && (!rule.discountRate || rule.discountRate <= 0 || rule.discountRate >= 100)) {
      openFeedbackModal("优惠规则不合法", "折扣值必须大于 0 且小于 100，例如 85 表示 85 折。");
      return;
    }
    if (type === "优惠券" && !rule.couponAmount) {
      openFeedbackModal("优惠规则不合法", "优惠券必须填写券面金额。");
      return;
    }
    if (mode === "edit") {
      window.MockData.promotions = (window.MockData.promotions || []).map((item) => (item.id === originalId ? payload : item));
    } else {
      window.MockData.promotions = [payload, ...(window.MockData.promotions || [])];
    }
    state.selectedIndex = 0;
    closeModal();
    renderPage();
    openFeedbackModal(mode === "edit" ? "活动已更新" : "活动已新增", `${payload.name} 已保存，系统将按结构化规则识别优惠逻辑。`);
  }

  function openBrandEditorModal(mode = "create", row = {}) {
    const isEdit = mode === "edit";
    const nextId = `BR-${String((window.MockData.brands || []).length + 1).padStart(3, "0")}`;
    const brandCategoryOptions = Array.from(
      new Set([
        "轮毂",
        "轮胎",
        "排气",
        "制动",
        "车衣",
        "改色膜",
        "动力",
        "底盘",
        "内饰",
        ...((window.MockData.products || []).map((item) => item.category).filter(Boolean)),
        ...((window.MockData.brands || []).flatMap((item) => Array.isArray(item.categories) ? item.categories : [item.categories]).filter(Boolean)),
      ])
    );
    const selectedCategories = Array.isArray(row.categories)
      ? row.categories
      : String(row.categories || "轮毂").split(/[、/,，|]/).map((item) => item.trim()).filter(Boolean);
    openModal(`
      <div class="platform-detail-modal">
        <div class="panel-header">
          <div>
            <span class="eyebrow">Brand</span>
            <h2 class="section-title">${isEdit ? "编辑品牌" : "新增品牌"}</h2>
          </div>
          <button class="btn btn-secondary" type="button" data-close-modal>关闭</button>
        </div>
        <div class="form-grid">
          <div class="field-group">
            <label class="field-label">品牌编号</label>
            <input class="input" data-brand-field="id" value="${isEdit ? row.id : nextId}" ${isEdit ? "disabled" : ""} />
          </div>
          <div class="field-group">
            <label class="field-label">品牌名称</label>
            <input class="input" data-brand-field="name" value="${row.name || "Racing Forge"}" />
          </div>
          <div class="field-group">
            <label class="field-label">国家/地区</label>
            <input class="input" data-brand-field="country" value="${row.country || "德国"}" />
          </div>
          <div class="field-group field-group-full">
            <label class="field-label">经营类目</label>
            <div class="promotion-scope-grid">
              ${brandCategoryOptions.map((item) => `
                <label class="promotion-scope-option">
                  <input type="checkbox" data-brand-category value="${item}" ${selectedCategories.includes(item) ? "checked" : ""} />
                  <span>${item}</span>
                </label>
              `).join("")}
            </div>
          </div>
          <div class="field-group">
            <label class="field-label">平台销量</label>
            <div class="readonly-field">${Number(row.sales || 0)} 单</div>
            <div class="muted" style="margin-top:6px;">由订单成交数据统计，不支持手动修改。</div>
          </div>
          <div class="field-group">
            <label class="field-label">授权文件</label>
            <div class="readonly-field">${row.authFile || "未上传"}</div>
            <label class="upload-panel compact-upload" style="margin-top:10px;">
              <input class="upload-input" data-brand-auth-file type="file" accept=".pdf,image/*" />
              <strong>${row.authFile ? "更换授权文件" : "上传授权文件"}</strong>
              <small>支持 PDF 或图片，系统只保存文件名和 MIME 类型。</small>
            </label>
          </div>
          <div class="field-group">
            <label class="field-label">品牌官网</label>
            <input class="input" data-brand-field="website" value="${row.website || ""}" placeholder="https://example.com" />
          </div>
          <div class="field-group">
            <label class="field-label">品牌联系人</label>
            <input class="input" data-brand-field="contact" value="${row.contact || ""}" placeholder="email@example.com" />
          </div>
          <div class="field-group">
            <label class="field-label">入驻时间</label>
            <input class="input" data-brand-field="joinedAt" type="date" value="${row.joinedAt || ""}" />
          </div>
          <div class="field-group" style="grid-column:1/-1">
            <label class="field-label">品牌简介</label>
            <textarea class="input" data-brand-field="intro" rows="3" placeholder="请输入品牌简介">${row.intro || ""}</textarea>
          </div>
          <div class="field-group">
            <label class="field-label">合作状态</label>
            <select class="input" data-brand-field="status">
              <option value="待签约" ${row.status === "待签约" ? "selected" : ""}>待签约</option>
              <option value="签约" ${row.status === "签约" ? "selected" : ""}>签约</option>
              <option value="解约" ${row.status === "解约" ? "selected" : ""}>解约</option>
            </select>
          </div>
        </div>
        <div class="platform-detail-modal-footer">
          <button class="btn btn-secondary" type="button" data-close-modal>取消</button>
          <button class="btn btn-primary" type="button" data-save-brand data-mode="${mode}" data-id="${row.id || ""}">保存品牌</button>
        </div>
      </div>
    `);
  }

  function saveBrand(mode = "create", sourceId = "") {
    const getValue = (field) => String(modalCardEl.querySelector(`[data-brand-field="${field}"]`)?.value || "").trim();
    const name = getValue("name");
    const selectedCategories = Array.from(modalCardEl.querySelectorAll("[data-brand-category]:checked")).map((input) => input.value);
    const existing = (window.MockData.brands || []).find((item) => item.id === sourceId);
    const authFile = modalCardEl.querySelector("[data-brand-auth-file]")?.files?.[0];
    const payload = {
      id: mode === "edit" ? sourceId : getValue("id"),
      name,
      logo: `${name || "brand"}-logo`.toLowerCase().replace(/\s+/g, "-"),
      logoUrl: `https://placehold.co/120x60/1a1a2e/e5e7ea?text=${encodeURIComponent(name || "Brand")}`,
      country: getValue("country"),
      categories: selectedCategories,
      sales: mode === "edit" ? Number((window.MockData.brands || []).find((item) => item.id === sourceId)?.sales || 0) : 0,
      status: getValue("status") || "待签约",
      authFile: authFile?.name || existing?.authFile || "",
      authFileType: authFile?.type || existing?.authFileType || "",
      website: getValue("website"),
      contact: getValue("contact"),
      joinedAt: getValue("joinedAt"),
      intro: getValue("intro"),
    };
    if (!payload.id || !payload.name) {
      openFeedbackModal("品牌信息不完整", "请填写品牌编号和品牌名称。");
      return;
    }
    if (!payload.categories.length) {
      openFeedbackModal("经营类目不完整", "请至少选择一个经营类目。");
      return;
    }
    if (!payload.authFile) {
      openFeedbackModal("缺少授权文件", "请上传品牌授权文件后再保存。");
      return;
    }
    const rows = window.MockData.brands || [];
    if (mode === "edit") {
      const target = rows.find((item) => item.id === sourceId);
      if (!target) return;
      Object.assign(target, payload);
    } else {
      rows.unshift(payload);
      window.MockData.brands = rows;
      state.selectedIndex = 0;
    }
    closeModal();
    renderPage();
    openFeedbackModal(mode === "edit" ? "品牌已更新" : "品牌已新增", `${payload.name} 已保存到品牌列表。`);
  }

  function openBrandProductsModal(brand) {
    const boundProducts = (window.MockData.products || []).filter((p) => p.brand === brand.name);
    openModal(`
      <div class="platform-detail-modal">
        <div class="panel-header">
          <div>
            <span class="eyebrow">Brand Products / ${brand.id}</span>
            <h2 class="section-title">${brand.name} 绑定商品</h2>
            <p class="section-subtitle">共 ${boundProducts.length} 件商品绑定该品牌</p>
          </div>
        </div>
        <div class="brand-products-grid">
          ${boundProducts.length
            ? boundProducts.map((p) => `
              <article class="brand-product-card">
                <div class="brand-product-image">
                  <div class="brand-product-placeholder">${p.name.slice(0, 2)}</div>
                </div>
                <div class="brand-product-info">
                  <strong>${p.name}</strong>
                  <span class="muted">${p.sku}</span>
                  <div class="brand-product-meta">
                    <span>${p.category}</span>
                    <span>${p.price}</span>
                    <span>库存 ${p.stock}</span>
                  </div>
                  <div>${formatTag(p.status)}</div>
                </div>
              </article>
            `).join("")
            : `<div class="muted" style="padding:24px 0;">暂无绑定商品。</div>`
          }
        </div>
        <div style="display:flex; gap:12px; margin-top:18px;">
          <button class="btn btn-primary" type="button" data-close-modal>关闭</button>
        </div>
      </div>
    `);
  }

  function openBrandSalesModal(brand) {
    const history = brand.salesHistory || [];
    const maxSales = Math.max(...history.map((h) => h.sales), 1);
    openModal(`
      <div class="platform-detail-modal">
        <div class="panel-header">
          <div>
            <span class="eyebrow">Brand Sales / ${brand.id}</span>
            <h2 class="section-title">${brand.name} 销售统计</h2>
            <p class="section-subtitle">累计销量 ${brand.sales} 单</p>
          </div>
        </div>
        <div class="brand-sales-chart">
          ${history.map((h) => `
            <div class="brand-sales-bar-group">
              <div class="brand-sales-bar-track">
                <div class="brand-sales-bar" style="height:${Math.max((h.sales / maxSales) * 160, 4)}px"></div>
              </div>
              <span class="brand-sales-bar-label">${h.month}</span>
              <span class="brand-sales-bar-value">${h.sales}</span>
            </div>
          `).join("")}
        </div>
        <div class="brand-sales-table-wrap">
          <table class="data-table brand-sales-table">
            <thead>
              <tr><th>月份</th><th>销量（单）</th><th>销售额</th><th>环比</th></tr>
            </thead>
            <tbody>
              ${history.map((h, i) => {
                const prev = history[i - 1];
                const growth = prev ? `${((h.sales - prev.sales) / prev.sales * 100).toFixed(1)}%` : "-";
                const growthClass = prev && h.sales > prev.sales ? "accent" : prev && h.sales < prev.sales ? "danger" : "muted";
                return `<tr><td>${h.month}</td><td>${h.sales}</td><td>${h.amount}</td><td class="${growthClass}">${growth}</td></tr>`;
              }).join("")}
            </tbody>
          </table>
        </div>
        <div style="display:flex; gap:12px; margin-top:18px;">
          <button class="btn btn-primary" type="button" data-close-modal>关闭</button>
        </div>
      </div>
    `);
  }

  function openBrandAccountEditorModal() {
    const nextId = `BA-${String((window.MockData.brandAccounts || []).length + 1).padStart(3, "0")}`;
    const brandRows = window.MockData.brands || [];
    openModal(`
      <div class="platform-detail-modal">
        <div class="panel-header">
          <div>
            <span class="eyebrow">Brand Account</span>
            <h2 class="section-title">新增品牌方账号</h2>
          </div>
          <button class="btn btn-secondary" type="button" data-close-modal>关闭</button>
        </div>
        <div class="form-grid">
          <div class="field-group">
            <label class="field-label">账号编号</label>
            <input class="input" data-brand-account-field="id" value="${nextId}" />
          </div>
          <div class="field-group">
            <label class="field-label">关联品牌</label>
            <select class="input" data-brand-account-field="brandId">
              ${brandRows.map((item) => `<option value="${item.id}">${item.name}</option>`).join("")}
            </select>
          </div>
          <div class="field-group">
            <label class="field-label">登录账号</label>
            <input class="input" data-brand-account-field="account" value="brand_admin" />
          </div>
          <div class="field-group">
            <label class="field-label">账号名称</label>
            <input class="input" data-brand-account-field="name" value="品牌官方运营" />
          </div>
          <div class="field-group">
            <label class="field-label">联系方式</label>
            <input class="input" data-brand-account-field="contact" value="brand@example.com" />
          </div>
          <div class="field-group">
            <label class="field-label">状态</label>
            <select class="input" data-brand-account-field="status">
              <option value="正常">正常</option>
              <option value="停用">停用</option>
            </select>
          </div>
        </div>
        <div class="platform-detail-modal-footer">
          <button class="btn btn-secondary" type="button" data-close-modal>取消</button>
          <button class="btn btn-primary" type="button" data-save-brand-account>保存账号</button>
        </div>
      </div>
    `);
  }

  function saveBrandAccount() {
    const getValue = (field) => String(modalCardEl.querySelector(`[data-brand-account-field="${field}"]`)?.value || "").trim();
    const brand = (window.MockData.brands || []).find((item) => item.id === getValue("brandId")) || {};
    const payload = {
      id: getValue("id"),
      brandId: getValue("brandId"),
      brandName: brand.name || "品牌方",
      account: getValue("account"),
      name: getValue("name"),
      contact: getValue("contact"),
      status: getValue("status") || "正常",
      orders: 0,
      shipped: 0,
      pending: 0,
    };
    if (!payload.id || !payload.brandId || !payload.account) {
      openFeedbackModal("账号信息不完整", "请填写账号编号、关联品牌和登录账号。");
      return;
    }
    window.MockData.brandAccounts = [payload, ...(window.MockData.brandAccounts || [])];
    state.selectedIndex = 0;
    closeModal();
    renderPage();
    openFeedbackModal("品牌方账号已新增", `${payload.name} 已创建，当前状态：${payload.status}。`);
  }

  function openShippingEditModal(row) {
    openModal(`
      <div class="panel-header">
        <div>
          <span class="eyebrow">Shipping Update</span>
          <h2 class="section-title">发货处理</h2>
          <p class="section-subtitle">${row.id} 路 ${row.orderId}</p>
        </div>
      </div>
      <div class="form-grid">
        <div class="field-group">物流公司</div>
          <input class="input" data-shipping-field="company" value="${row.company}" />
        </div>
        <div class="field-group">物流单号</div>
          <input class="input" data-shipping-field="number" value="${row.number}" />
        </div>
        <div class="field-group field-group-full">
          <div class="field-label">备注</div>
          <textarea class="textarea" data-shipping-field="note">${row.note || ""}</textarea>
        </div>
      </div>
      <div style="display:flex; gap:12px; margin-top:18px;">
        <button class="btn btn-primary" type="button" data-save-shipping data-id="${row.id}">确认发货</button>
        <button class="btn btn-secondary" type="button" data-close-modal>取消</button>
      </div>
    `);
  }

  function openLogisticsDetailModal(row) {
    if (row.type === "signing") {
      openSigningDetailModal(row.source);
      return;
    }
    openShippingDetailModal(row.source);
  }

  function openShippingDetailModal(row) {
    openGenericDetailModal({
      title: row.id,
      badges: [row.status, row.company],
      facts: [
        ["订单号", row.orderId],
        ["物流公司", row.company],
        ["物流单号", row.number],
        ["发货时间", row.shipTime],
        ["备注", row.note],
      ],
      timeline: [
        `发货单：${row.id}`,
        `物流状态：${row.status}`,
        `当前备注：${row.note}`,
      ],
    });
  }

  function renderSigningPhotoPlaceholders(photos) {
    if (!photos?.length) return "无";
    return `
      <div class="signing-photo-list">
        ${photos
          .map(
            (_, index) => `
              <div class="signing-photo-placeholder" aria-label="异常照片 ${index + 1}">
                <span></span>
              </div>
            `
          )
          .join("")}
      </div>
    `;
  }

  function openSigningConfirmModal(row) {
    openModal(`
      <div class="panel-header">
        <div>
          <span class="eyebrow">Signing Update</span>
          <h2 class="section-title">签收处理</h2>
          <p class="section-subtitle">${row.orderId} 路 ${row.customer}</p>
        </div>
      </div>
      <div class="form-grid">
        <div class="field-group field-group-full">
          <div class="field-label">签收备注</div>
          <textarea class="textarea" data-signing-field="note">${row.note || ""}</textarea>
        </div>
        <div class="field-group field-group-full">
          <div class="field-label">异常照片</div>
          <label class="upload-panel">
            <input class="upload-input" data-signing-field="photos" type="file" accept="image/*" multiple />
            <span class="upload-illustration"></span>
            <strong>上传异常签收照片</strong>
            <small>当状态为异常签收时至少上传 1 张异常照片，作为后台留证。</small>
          </label>
        </div>
        <div class="field-group">
          <div class="field-label">状态</div>
          <select class="select" data-signing-field="status">
            <option value="已签收" ${row.status === "已签收" ? "selected" : ""}>已签收</option>
            <option value="异常签收" ${row.status === "异常签收" ? "selected" : ""}>异常签收</option>
          </select>
        </div>
      </div>
      <div style="display:flex; gap:12px; margin-top:18px;">
        <button class="btn btn-primary" type="button" data-save-signing data-order-id="${row.orderId}">确认提交</button>
        <button class="btn btn-secondary" type="button" data-close-modal>取消</button>
      </div>
    `);
  }

  function openSigningDetailModal(row) {
    const shippingRecord = getShippingByOrderId(row.orderId);
    openGenericDetailModal({
      title: row.orderId,
      badges: [row.status],
      facts: [
        ["物流公司", shippingRecord?.company || row.company || "-"],
        ["物流单号", shippingRecord?.number || row.number || "-"],
        ["签收人", row.customer],
        ["签收时间", row.signTime],
        ["异常照片", renderSigningPhotoPlaceholders(row.anomalyPhotos)],
        ["备注", row.note],
      ],
      timeline: [
        `订单号：${row.orderId}`,
        `物流公司：${shippingRecord?.company || row.company || "-"}`,
        `物流单号：${shippingRecord?.number || row.number || "-"}`,
        `签收状态：${row.status}`,
        `异常照片：${row.anomalyPhotos?.length ? `${row.anomalyPhotos.length} 张` : "无"}`,
        `签收备注：${row.note}`,
      ],
    });
  }

  function openMallRecommendationModal(product = null) {
    const rows = getMallRecommendationRows();
    const current = rows.find((item) => item.slot === "mallHero") || rows[0] || {};
    const selectedSku = product?.sku || current.sku || products[0]?.sku || "";
    const selectedProduct = products.find((item) => item.sku === selectedSku) || product || products[0] || {};
    openModal(`
      <div class="platform-detail-modal">
        <div class="panel-header">
          <div>
            <span class="eyebrow">Mall Recommendation</span>
            <h2 class="section-title">商城推荐位配置</h2>
            <p class="section-subtitle">用户 App 商城首页“本周推荐”由这里配置。</p>
          </div>
          <button class="btn btn-secondary" type="button" data-close-modal>关闭</button>
        </div>
        <div class="form-grid">
          <div class="field-group">
            <label class="field-label">推荐商品</label>
            <select class="select" data-mall-recommend-field="sku">
              ${products.map((item) => `<option value="${item.sku}" ${item.sku === selectedSku ? "selected" : ""}>${item.name} / ${item.brand}</option>`).join("")}
            </select>
          </div>
          <div class="field-group">
            <label class="field-label">状态</label>
            <select class="select" data-mall-recommend-field="status">
              ${["启用", "停用"].map((item) => `<option value="${item}" ${(current.status || "启用") === item ? "selected" : ""}>${item}</option>`).join("")}
            </select>
          </div>
          <div class="field-group">
            <label class="field-label">角标</label>
            <input class="input" data-mall-recommend-field="label" value="${current.label || "本周推荐"}" />
          </div>
          <div class="field-group">
            <label class="field-label">排序</label>
            <input class="input" data-mall-recommend-field="sort" type="number" min="1" value="${current.sort || 1}" />
          </div>
          <div class="field-group field-group-full">
            <label class="field-label">推荐标题</label>
            <input class="input" data-mall-recommend-field="title" value="${current.title || selectedProduct.name || "精选商品"}" />
          </div>
          <div class="field-group field-group-full">
            <label class="field-label">推荐文案</label>
            <textarea class="textarea" data-mall-recommend-field="description" rows="3">${current.description || selectedProduct.description || ""}</textarea>
          </div>
        </div>
        <div class="platform-detail-modal-footer">
          <button class="btn btn-secondary" type="button" data-close-modal>取消</button>
          <button class="btn btn-primary" type="button" data-save-mall-recommendation>保存推荐位</button>
        </div>
      </div>
    `);
  }

  function openProductEditorModal(mode, row) {
    const isEdit = mode === "edit";
    const selectedFitments = parseProductFitmentValue(isEdit ? row.fitment : "宝马-3系-330i / 奔驰-C级-C260L");
    const brandRows = window.MockData.brands || [];
    const selectedBrand = isEdit ? row.brand : (brandRows[0]?.name || "");
    const brandOptions = [
      ...brandRows.map((item) => item.name),
      ...(selectedBrand && !brandRows.some((item) => item.name === selectedBrand) ? [selectedBrand] : []),
    ]
      .filter(Boolean)
      .map((name) => `<option value="${name}" ${name === selectedBrand ? "selected" : ""}>${name}</option>`)
      .join("");
    const getBrandCategories = (brandName) => {
      const brand = brandRows.find((item) => item.name === brandName);
      if (Array.isArray(brand?.categories) && brand.categories.length) return brand.categories;
      return categories.filter((item) => item.level === 0).map((item) => item.name);
    };
    const selectedCategory = isEdit ? row.category : (getBrandCategories(selectedBrand)[0] || "");
    const categoryOptions = getBrandCategories(selectedBrand)
      .map((name) => `<option value="${name}" ${selectedCategory === name ? "selected" : ""}>${name}</option>`)
      .join("");
    openModal(`
      <div class="panel-header">
        <div>
          <span class="eyebrow">Product Editor</span>
          <h2 class="section-title">${isEdit ? "编辑商品" : "新增商品"}</h2>
          <p class="section-subtitle">${isEdit ? `正在编辑 ${row.name}` : "创建新的平台商品资料"}</p>
        </div>
      </div>
      <div class="form-grid">
        <div class="field-group">
          <div class="field-label">商品名称</div>
          <input class="input" data-product-field="name" placeholder="请输入商品名称" value="${isEdit ? row.name : "OZ 锻造轮毂 20寸"}" />
        </div>
        <div class="field-group">
          <div class="field-label">品牌</div>
          <select class="select" data-product-field="brand">${brandOptions}</select>
        </div>
        <div class="field-group">
          <div class="field-label">类目</div>
          <select class="select" data-product-field="category">${categoryOptions}</select>
        </div>
        <div class="field-group">
          <div class="field-label">原价</div>
          <input class="input" data-product-field="originalPrice" placeholder="请输入原价" value="${isEdit ? row.originalPrice || "" : ""}" />
        </div>
        <div class="field-group">
          <div class="field-label">现价</div>
          <input class="input" data-product-field="price" placeholder="请输入现价" value="${isEdit ? row.price : "¥ 22,800"}" />
        </div>
        <div class="field-group">
          <div class="field-label">库存</div>
          <input class="input" data-product-field="stock" placeholder="请输入库存数量" value="${isEdit ? row.stock : "12"}" />
        </div>
        <div class="field-group field-group-full">
          <div class="field-label">适配车型</div>
          <div class="product-fitment-picker" data-product-fitment-picker data-selected="${selectedFitments.join("||")}">
            <input class="input" data-product-fitment-search type="search" placeholder="搜索品牌 / 车系 / 车型">
            <div class="product-fitment-selected" data-product-fitment-selected></div>
            <div class="product-fitment-dropdown" data-product-fitment-options></div>
          </div>
        </div>
        <div class="field-group">
          <div class="field-label">状态</div>
          <select class="select" data-product-field="status">
            <option value="上架" ${(isEdit ? row.status : "上架") === "上架" ? "selected" : ""}>上架</option>
            <option value="缺货" ${(isEdit ? row.status : "上架") === "缺货" ? "selected" : ""}>缺货</option>
          </select>
        </div>
        <div class="field-group field-group-full">
          <div class="field-label">图片</div>
          <input type="hidden" data-product-field="image" value="${isEdit ? row.image || "" : ""}" />
          <div class="product-image-upload">
            <div class="product-image-preview" data-product-image-preview>
              ${isEdit && row.image ? `<img src="${row.image}" alt="${escapeHtml(row.name)}" />` : `<div class="product-image-placeholder">${isEdit ? row.name.slice(0, 2) : "商品"}</div>`}
            </div>
            <button class="btn btn-secondary btn-sm" type="button" data-product-image-trigger>选择图片</button>
            <input type="file" accept="image/*" data-product-image-input style="display:none;" />
          </div>
        </div>
        <div class="field-group field-group-full">
          <div class="field-label">优惠活动</div>
          <div class="form-grid" style="grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px;">
            <input class="input" data-product-field="promoType" placeholder="活动类型，如折扣/满减/赠品" value="${isEdit && row.promotion ? row.promotion.type || "" : ""}" />
            <input class="input" data-product-field="promoLabel" placeholder="活动名称" value="${isEdit && row.promotion ? row.promotion.label || "" : ""}" />
            <input class="input" data-product-field="promoDiscount" placeholder="优惠力度，如85折/满减2000" value="${isEdit && row.promotion ? row.promotion.discount || "" : ""}" />
          </div>
          <input class="input" style="margin-top:10px;" data-product-field="promoDesc" placeholder="活动说明" value="${isEdit && row.promotion ? row.promotion.desc || "" : ""}" />
        </div>
        <div class="field-group field-group-full">
          <div class="field-label">说明</div>
          <textarea class="textarea" data-product-field="description" placeholder="请输入商品说明">${isEdit ? row.description || "" : "主图突出商品核心卖点，补充细节图、安装位说明与实车效果展示。"}</textarea>
        </div>
        <div class="field-group field-group-full">
          <div class="field-label">规格参数</div>
          <input class="input" data-product-field="spec" placeholder="例如 19×8.5J ET35 / 5×112 / 单只重量约 8.2kg" value="${isEdit ? row.spec || "" : ""}" />
        </div>
      </div>
      <div style="display:flex; gap:12px; margin-top:18px;">
        <button class="btn btn-primary" type="button" data-save-product data-mode="${mode}" ${isEdit ? `data-sku="${row.sku}"` : ""}>${isEdit ? "保存修改" : "确认新增"}</button>
        <button class="btn btn-secondary" type="button" data-close-modal>取消</button>
      </div>
    `);
    const brandSelect = modalCardEl.querySelector('[data-product-field="brand"]');
    const categorySelect = modalCardEl.querySelector('[data-product-field="category"]');
    brandSelect?.addEventListener("change", () => {
      const options = getBrandCategories(brandSelect.value);
      categorySelect.innerHTML = options.map((name) => `<option value="${name}">${name}</option>`).join("");
    });
    const imageInput = modalCardEl.querySelector('[data-product-image-input]');
    const imageTrigger = modalCardEl.querySelector('[data-product-image-trigger]');
    const imagePreview = modalCardEl.querySelector('[data-product-image-preview]');
    const imageField = modalCardEl.querySelector('[data-product-field="image"]');
    imageTrigger?.addEventListener('click', () => imageInput?.click());
    imageInput?.addEventListener('change', (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        const dataUrl = ev.target.result;
        if (imageField) imageField.value = dataUrl;
        if (imagePreview) imagePreview.innerHTML = `<img src="${dataUrl}" alt="商品预览" />`;
      };
      reader.readAsDataURL(file);
    });
  }

  function openVehicleModelEditorModal(mode, row) {
    const isEdit = mode === "edit";
    const source = isEdit
      ? row
      : {
          id: `CAR-${String(vehicleModels.length + 1001).padStart(4, "0")}`,
          brand: "宝马",
          series: "3系",
          model: "330i",
          chassis: "G20",
          year: "2024",
          trim: "M运动曜夜套装",
          energyType: "燃油",
          driveType: "后驱",
          powerSpec: "2.0T / B48 / 245Ps",
          transmission: "8AT",
          bodyStyle: "四门轿车",
          wheelbase: "2851mm",
          status: "启用",
        };
    openModal(`
      <div class="panel-header">
        <div>
          <span class="eyebrow">Vehicle Model Editor</span>
          <h2 class="section-title">${isEdit ? "编辑车型" : "新增车型"}</h2>
          <p class="section-subtitle">${isEdit ? `正在编辑 ${row.brand} ${row.series} ${row.model}` : "创建新的商品适配车型档案"}</p>
        </div>
      </div>
      <div class="form-grid">
        <div class="field-group">
          <div class="field-label">车型编码</div>
          <input class="input" data-vehicle-model-field="id" value="${source.id}" />
        </div>
        <div class="field-group">
          <div class="field-label">品牌</div>
          <input class="input" data-vehicle-model-field="brand" value="${source.brand}" />
        </div>
        <div class="field-group">
          <div class="field-label">车系</div>
          <input class="input" data-vehicle-model-field="series" value="${source.series}" />
        </div>
        <div class="field-group">
          <div class="field-label">车型</div>
          <input class="input" data-vehicle-model-field="model" value="${source.model}" />
        </div>
        <div class="field-group">
          <div class="field-label">底盘型号</div>
          <input class="input" data-vehicle-model-field="chassis" value="${source.chassis}" />
        </div>
        <div class="field-group">
          <div class="field-label">年份</div>
          <input class="input" data-vehicle-model-field="year" value="${source.year}" />
        </div>
        <div class="field-group">
          <div class="field-label">款型/版本</div>
          <input class="input" data-vehicle-model-field="trim" value="${source.trim || ""}" />
        </div>
        <div class="field-group">
          <div class="field-label">能源类型</div>
          <input class="input" data-vehicle-model-field="energyType" value="${source.energyType}" />
        </div>
        <div class="field-group">
          <div class="field-label">驱动形式</div>
          <input class="input" data-vehicle-model-field="driveType" value="${source.driveType}" />
        </div>
        <div class="field-group">
          <div class="field-label">发动机/电机参数</div>
          <input class="input" data-vehicle-model-field="powerSpec" value="${source.powerSpec || ""}" />
        </div>
        <div class="field-group">
          <div class="field-label">变速箱</div>
          <input class="input" data-vehicle-model-field="transmission" value="${source.transmission || ""}" />
        </div>
        <div class="field-group">
          <div class="field-label">车身形式</div>
          <input class="input" data-vehicle-model-field="bodyStyle" value="${source.bodyStyle || ""}" />
        </div>
        <div class="field-group">
          <div class="field-label">轴距</div>
          <input class="input" data-vehicle-model-field="wheelbase" value="${source.wheelbase || ""}" />
        </div>
        <div class="field-group">
          <div class="field-label">适配状态</div>
          <select class="select" data-vehicle-model-field="status">
            <option value="启用" ${source.status === "启用" ? "selected" : ""}>启用</option>
            <option value="停用" ${source.status === "停用" ? "selected" : ""}>停用</option>
          </select>
        </div>
      </div>
      <div style="display:flex; gap:12px; margin-top:18px;">
        <button class="btn btn-primary" type="button" data-save-vehicle-model data-mode="${mode}" ${isEdit ? `data-id="${row.id}"` : ""}>${isEdit ? "保存修改" : "确认新增"}</button>
        <button class="btn btn-secondary" type="button" data-close-modal>取消</button>
      </div>
    `);
  }

  function openVehicleModelDeleteModal(row) {
    openModal(`
      <div class="panel-header">
        <div>
          <span class="eyebrow">Vehicle Model Delete</span>
          <h2 class="section-title">删除车型</h2>
          <p class="section-subtitle">确认删除车型“${row.brand} ${row.series} ${row.model}”吗？此操作仅影响当前 mock 展示数据。</p>
        </div>
      </div>
      <div style="display:flex; gap:12px; margin-top:18px;">
        <button class="btn btn-danger" type="button" data-delete-vehicle-model data-id="${row.id}">确认删除</button>
        <button class="btn btn-secondary" type="button" data-close-modal>取消</button>
      </div>
    `);
  }

  function openSupplementModal(row) {
    const options = [
      { value: "门头照", desc: "补充清晰门头正面图与夜景图，便于平台核验门店真实性。" },
      { value: "施工位照片", desc: "补充施工工位、设备区与交付区照片，确认施工能力。" },
      { value: "营业执照附件", desc: "补充营业执照扫描件或加盖章版本。" },
      { value: "品牌授权资质", desc: "补充高端改装品牌授权、技师认证或授权安装证明。" },
      { value: "门店联系人信息", desc: "补充联系人身份证明、手机号与岗位信息。" },
      { value: "案例或完工图", desc: "补充过往高端车型施工案例与完工交付图。" },
    ];

    openModal(`
      <div class="panel-header">
        <div>
          <span class="eyebrow">Supplement</span>
          <h2 class="section-title">要求补充资料</h2>
          <p class="section-subtitle">${row.name} / 可多选补充项，并填写补充理由</p>
        </div>
      </div>
      <div class="check-grid">
        ${options
          .map(
            (item, index) => `
              <label class="check-item">
                <input type="checkbox" data-supplement-item value="${item.value}" ${index < 2 ? "checked" : ""} />
                <span>
                  <strong>${item.value}</strong>
                  <span class="muted">${item.desc}</span>
                </span>
              </label>
            `
          )
          .join("")}
      </div>
      <div class="field-group field-group-full" style="margin-top:16px;">
        <div class="field-label">补充理由</div>
        <textarea class="textarea" data-supplement-reason>请补充夜景门头照、施工工位照片，并补传高端改装品牌授权资质，方便平台完成最终审核。</textarea>
      </div>
      <div style="display:flex; gap:12px; margin-top:18px;">
        <button class="btn btn-primary" type="button" data-submit-supplement data-provider-id="${row.id}">提交补充要求</button>
        <button class="btn btn-secondary" type="button" data-close-modal>返回</button>
      </div>
    `);
  }

  function openRejectModal(row) {
    openModal(`
      <div class="panel-header">
        <div>
          <span class="eyebrow">Reject</span>
          <h2 class="section-title">驳回申请</h2>
          <p class="section-subtitle">${row.name} / 请填写明确的驳回理由</p>
        </div>
      </div>
      <div class="field-group field-group-full">
        <div class="field-label">驳回理由</div>
        <textarea class="textarea" data-reject-reason>当前提交资料无法满足平台高端改装服务商入驻标准，请补齐有效资质和完整门店资料后重新申请。</textarea>
      </div>
      <div style="display:flex; gap:12px; margin-top:18px;">
        <button class="btn btn-primary" type="button" data-submit-reject data-provider-id="${row.id}">确认驳回</button>
        <button class="btn btn-secondary" type="button" data-close-modal>返回</button>
      </div>
    `);
  }

  function handleAuditDecision(decision, providerId) {
    const target = providers.find((item) => item.id === providerId);
    if (!target) return;

    if (decision === "approve") {
      target.auditStatus = "已通过";
      target.status = "正常营业";
      target.timeline.unshift("2026-04-02 15:20 平台审核通过，已开通门店能力");
      pushNotification("provider", "入驻审核已通过", `恭喜！${target.name} 的入驻申请已通过审核，已开通门店能力，可参与订单分配。`);
      openFeedbackModal("审核已通过", `${target.name} 已进入正式服务商列表，可参与订单分配。`);
      return;
    }

    if (decision === "supplement") {
      target.auditStatus = "待审核";
      target.timeline.unshift("2026-04-02 15:20 平台要求补充：夜景门头照与品牌授权资质");
      pushNotification("provider", "入驻审核需补充资料", `${target.name} 的入驻审核需要补充资料：夜景门头照与品牌授权资质。`);
      openFeedbackModal("已要求补充资料", `${target.name} 保持待审核状态，并已记录补充要求。`);
      return;
    }

    target.auditStatus = "已驳回";
    target.timeline.unshift("2026-04-02 15:20 平台驳回申请：资料不完整，请修正后重提");
    pushNotification("provider", "入驻审核被驳回", `${target.name} 的入驻审核未通过，原因：资料不完整，请修正后重新提交。`);
    openFeedbackModal("申请已驳回", `${target.name} 已更新为已驳回状态。`);
  }

  function submitSupplement(providerId, selectedItems, reason) {
    const target = providers.find((item) => item.id === providerId);
    if (!target) return;

    if (!selectedItems.length) {
      openFeedbackModal("未选择补充项", "请至少选择一项需要补充的资料后再提交。");
      return;
    }

    if (!reason) {
      openFeedbackModal("请填写补充理由", "需要记录具体补充原因，方便服务商按要求重新提交。");
      return;
    }

    target.auditStatus = "待审核";
    target.timeline.unshift(`2026-04-02 15:20 平台要求补充：${selectedItems.join("、")}。理由：${reason}`);
    pushNotification("provider", "入驻审核需补充资料", `${target.name} 的入驻审核需要补充资料：${selectedItems.join("、")}。理由：${reason}`);
    openFeedbackModal("已发送补充资料要求", `${target.name} 需补充：${selectedItems.join("、")}。`);
  }

  function submitReject(providerId, reason) {
    const target = providers.find((item) => item.id === providerId);
    if (!target) return;

    if (!reason) {
      openFeedbackModal("请填写驳回理由", "驳回申请前需要填写明确原因，方便服务商后续修正并重新提交。");
      return;
    }

    target.auditStatus = "已驳回";
    target.timeline.unshift(`2026-04-02 15:20 平台驳回申请。驳回理由：${reason}`);
    pushNotification("provider", "入驻审核被驳回", `${target.name} 的入驻审核未通过。驳回理由：${reason}`);
    openFeedbackModal("申请已驳回", `${target.name} 已记录驳回理由，并更新为已驳回状态。`);
  }

  function submitSettlementAudit(settlementId, decision, reason = "") {
    const target = settlements.find((item) => item.id === settlementId) || providers.find((item) => item.id === settlementId);
    if (!target) return;

    if (decision === "reject" && !reason) {
      openFeedbackModal("请填写调整原因", "调整统计记录前需要填写明确原因，方便后续复核。");
      return;
    }

    if (decision === "approve") {
      target.status = "已归档";
      target.rejectReason = "";
      target.paymentNote = target.paymentNote || "运营已确认本期服务统计。";
      target.paidAt = target.paidAt || getNowStamp();
      target.timeline = target.timeline || [];
      target.timeline.unshift(`${getNowStamp()} 平台确认服务统计`);
      pushNotification("provider", "服务统计已归档", `${target.id || target.name} 的服务统计记录已确认归档。`);
      openFeedbackModal("统计已归档", `${target.id || target.name} 已更新为已归档。`);
      return;
    }

    target.status = "待复核";
    target.rejectReason = reason;
    target.paymentNote = `统计记录调整：${reason}`;
    target.timeline = target.timeline || [];
    target.timeline.unshift(`${getNowStamp()} 平台调整统计记录。原因：${reason}`);
    pushNotification("provider", "服务统计待复核", `${target.id || target.name} 的服务统计记录已被调整，请复核。调整原因：${reason}`);
    openFeedbackModal("统计记录已调整", `${target.id || target.name} 已记录调整原因。`);
  }

  function submitCaseAudit(caseId, decision, reason = "") {
    const target = cases.find((item) => item.id === caseId);
    if (!target) return;

    if (decision === "reject" && !reason) {
      openFeedbackModal("请填写驳回原因", "驳回案例前需要填写明确原因，方便服务商后续修正并重新提交。");
      return;
    }

    if (decision === "approve") {
      target.audit = "已通过";
      target.rejectReason = "";
      target.timeline.unshift("2026-04-03 15:10 平台审核通过，案例已进入展示池");
      pushNotification("provider", "案例审核已通过", `您提交的案例 ${target.id}（${target.vehicle || ""}）已通过平台审核，已进入展示池。`);
      openFeedbackModal("案例审核已通过", `${target.id} 已审核通过。`);
      return;
    }

    target.audit = "已驳回";
    target.display = "未展示";
    target.rejectReason = reason;
    target.timeline.unshift(`2026-04-03 15:10 平台驳回案例。驳回原因：${reason}`);
    pushNotification("provider", "案例审核被驳回", `您提交的案例 ${target.id}（${target.vehicle || ""}）未通过审核。驳回原因：${reason}`);
    openFeedbackModal("案例已驳回", `${target.id} 已记录驳回原因。`);
  }

  function submitCaseDisplay(caseId, display) {
    const target = cases.find((item) => item.id === caseId);
    if (!target) return;

    if (target.audit !== "已通过" && display !== "未展示") {
      openFeedbackModal("无法设置展示", "只有审核通过的案例才允许设置为首页展示或正常展示。");
      return;
    }

    target.display = display;
    target.timeline.unshift(`2026-04-03 16:10 平台将案例展示状态更新为：${display}`);
    openFeedbackModal("展示状态已更新", `${target.id} 已切换为${display}。`);
  }

  function saveCase(mode, caseId) {
    const getValue = (field) => modalCardEl.querySelector(`[data-case-field="${field}"]`)?.value.trim() || "";
    const payload = {
      id: caseId,
      title: getValue("title"),
      provider: getValue("provider"),
      model: getValue("model"),
      style: getValue("style"),
      modType: getValue("modType"),
      cost: getValue("cost"),
      image: getValue("image"),
      imagePreview: getValue("imagePreview"),
      content: getValue("content"),
      display: getValue("display"),
      audit: "待审核",
      timeline: [`2026-04-03 16:20 平台${mode === "edit" ? "更新" : "新增"}案例：${getValue("title")}`],
    };
    if (!payload.title || !payload.provider || !payload.model || !payload.style || !payload.modType || !payload.cost || !payload.image || !payload.content || !payload.display) {
      openFeedbackModal("信息不完整", "请填写案例标题、服务商、车型、风格、改装类型、费用、封面图、案例说明和展示状态。");
      return;
    }
    if (mode === "edit") {
      const target = cases.find((item) => item.id === caseId);
      if (!target) return;
      Object.assign(target, payload, { audit: target.audit, timeline: target.timeline });
      target.timeline.unshift(`2026-04-03 16:20 平台更新案例信息：${target.title}`);
      openFeedbackModal("案例已更新", `${target.title} 的案例信息已保存。`);
      return;
    }
    cases.unshift(payload);
    state.selectedIndex = 0;
    openFeedbackModal("案例已新增", `${payload.title} 已加入案例维护列表。`);
  }

  function deleteCase(caseId) {
    const index = cases.findIndex((item) => item.id === caseId);
    if (index === -1) return;
    const [removed] = cases.splice(index, 1);
    openFeedbackModal("案例已删除", `${removed.title} 已从案例维护中移除。`);
  }

  function deleteProduct(sku) {
    const index = products.findIndex((item) => item.sku === sku);
    if (index === -1) return;
    const [removed] = products.splice(index, 1);
    openFeedbackModal("商品已删除", `${removed.name} 已从商品列表中移除。`);
    render();
  }

  function updateProductStock(sku, newStockRaw) {
    const product = products.find((item) => item.sku === sku);
    if (!product) return;
    const newStock = Number(newStockRaw);
    if (Number.isNaN(newStock) || newStock < 0) {
      openFeedbackModal("库存输入无效", "请输入大于或等于 0 的整数。");
      return;
    }
    product.stock = newStock;
    openFeedbackModal("库存已更新", `${product.name} 的库存已修改为 ${newStock}。`);
    render();
  }

  function submitModeratorApply(id, decision) {
    const target = forumModerators.find((item) => item.id === id);
    if (!target) return;
    target.status = decision === "approve" ? "已通过" : "已驳回";
    pushNotification("provider", decision === "approve" ? "版主申请已通过" : "版主申请被驳回", `您的版主申请已更新为${target.status}。`);
    openFeedbackModal(decision === "approve" ? "申请已通过" : "申请已驳回", `${target.account} 的版主申请已更新为${target.status}。`);
  }

  function submitPostManage(postId, action, reason = "") {
    const target = posts.find((item) => item.id === postId);
    if (!target) return;

    if (action === "delete") {
      if (!reason) {
        openFeedbackModal("请填写删除原因", "删除帖子前需要填写明确原因，方便后台留痕和后续追溯。");
        return;
      }
      target.status = "已删除";
      target.deleteReason = reason;
      target.timeline.unshift(`2026-04-03 16:40 平台删除帖子。删除原因：${reason}`);
      pushNotification("user", "帖子被平台删除", `您发布的帖子《${target.title || target.id}》已被平台删除。删除原因：${reason}`);
      openFeedbackModal("帖子已删除", `${target.id} 已删除并记录操作原因。`);
      return;
    }

    target.status = "正常";
    target.deleteReason = "";
    target.timeline.unshift("2026-04-03 16:42 平台恢复帖子显示");
    pushNotification("user", "帖子已恢复显示", `您发布的帖子《${target.title || target.id}》已恢复正常显示。`);
    openFeedbackModal("帖子已恢复", `${target.id} 已恢复正常显示。`);
  }

  function togglePostPin(postId) {
    const target = posts.find((item) => item.id === postId);
    if (!target) return;
    target.topStatus = target.topStatus === "置顶" ? "未置顶" : "置顶";
    target.timeline.unshift(`${getNowStamp()} 平台将帖子置顶状态更新为：${target.topStatus}`);
    renderPage();
    openFeedbackModal("置顶状态已更新", `${target.id} 当前为${target.topStatus}。`);
  }

  function togglePostFeature(postId) {
    const target = posts.find((item) => item.id === postId);
    if (!target) return;
    target.featuredStatus = target.featuredStatus === "加精" ? "未加精" : "加精";
    target.timeline.unshift(`${getNowStamp()} 平台将帖子加精状态更新为：${target.featuredStatus}`);
    renderPage();
    openFeedbackModal("加精状态已更新", `${target.id} 当前为${target.featuredStatus}。`);
  }

  function toggleCreatorPinnedPost(postId) {
    const target = posts.find((item) => item.id === postId);
    if (!target) return;
    const nextPinned = target.creatorPinned === "是" ? "否" : "是";
    if (nextPinned === "是") {
      posts
        .filter((item) => item.author === target.author && item.id !== target.id)
        .forEach((item) => {
          item.creatorPinned = "否";
          item.creatorHomeRank = 0;
        });
    }
    target.creatorPinned = nextPinned;
    target.creatorHomeRank = nextPinned === "是" ? 1 : 0;
    target.timeline.unshift(`${getNowStamp()} 平台将创作者主页置顶作品更新为：${target.creatorPinned === "是" ? "已置顶" : "已取消"}`);
    renderPage();
    openFeedbackModal("创作者主页已更新", `${target.author} 的主页置顶作品已${target.creatorPinned === "是" ? "设置" : "取消"}。`);
  }

  function savePostCommerce(postId) {
    const target = posts.find((item) => item.id === postId);
    if (!target) return;
    const selectedProducts = Array.from(modalCardEl.querySelectorAll("[data-post-product]:checked")).map((input) => input.value);
    const authStatus = modalCardEl.querySelector("[data-post-commerce-auth]")?.value || "未授权";
    const note = modalCardEl.querySelector("[data-post-commerce-note]")?.value.trim() || "";
    if (authStatus !== "已授权" && selectedProducts.length) {
      openFeedbackModal("账号未授权", "只有授权账号才允许在帖子内挂载商品链接。");
      return;
    }
    target.linkAuthStatus = authStatus;
    target.linkedProducts = selectedProducts;
    target.governanceNote = note || target.governanceNote;
    target.timeline.unshift(`${getNowStamp()} 平台更新商品链接：${selectedProducts.length ? selectedProducts.join(" / ") : "未挂商品"}，授权状态：${authStatus}`);
    renderPage();
    openFeedbackModal("商品链接已更新", `${target.id} 已保存商品链接与授权状态。`);
  }

  function submitUserPunish(userId, type) {
    const target = users.find((item) => item.id === userId);
    if (!target) return;
    const reason = modalCardEl.querySelector("[data-user-punish-reason]")?.value.trim() || "";
    const duration = modalCardEl.querySelector("[data-user-punish-duration]")?.value || "";
    if (!reason) {
      openFeedbackModal("请填写处理原因", "禁言或封禁前需要填写原因，方便用户申诉与后台追溯。");
      return;
    }
    if (type === "mute") {
      target.punish = "禁言";
      target.punishReason = reason;
      target.punishExpire = duration === "永久" ? "永久" : duration;
      target.timeline = target.timeline || [];
      target.timeline.unshift(`${getNowStamp()} 平台禁言用户，周期：${target.punishExpire}，原因：${reason}`);
      renderPage();
      openFeedbackModal("用户已禁言", `${target.name} 禁言周期：${target.punishExpire}。`);
      return;
    }
    target.punish = "封号";
    target.status = "停用";
    target.punishReason = reason;
    target.punishExpire = "永久";
    target.timeline = target.timeline || [];
    target.timeline.unshift(`${getNowStamp()} 平台封禁用户。原因：${reason}`);
    renderPage();
    openFeedbackModal("用户已封禁", `${target.name} 已封禁并停用账号。`);
  }

  function submitCommentManage(commentId, action, reason = "") {
    const target = comments.find((item) => item.id === commentId);
    if (!target) return;

    if (action === "delete") {
      if (!reason) {
        openFeedbackModal("请填写删除原因", "删除评论前需要填写明确原因，方便后台留痕和后续追溯。");
        return;
      }
      target.status = "已删除";
      target.deleteReason = reason;
      target.timeline.unshift(`2026-04-03 16:45 平台删除评论。删除原因：${reason}`);
      pushNotification("user", "评论被平台删除", `您发布的评论已被平台删除。删除原因：${reason}`);
      openFeedbackModal("评论已删除", `${target.id} 已删除并记录操作原因。`);
      return;
    }

    target.status = "正常";
    target.deleteReason = "";
    target.timeline.unshift("2026-04-03 16:47 平台恢复评论显示");
    pushNotification("user", "评论已恢复显示", `您发布的评论已恢复正常显示。`);
    openFeedbackModal("评论已恢复", `${target.id} 已恢复正常显示。`);
  }

  function toggleMaterialStatus(pageKey, materialId) {
    const source = pageKey === "vehicleMaterials" ? materials.vehicles : materials.wheels;
    const target = source.find((item) => item.id === materialId);
    if (!target) return;

    target.status = target.status === "停用" ? "启用" : "停用";
    target.timeline.unshift(`2026-04-03 17:10 平台切换素材状态为：${target.status}`);
    openFeedbackModal("素材状态已更新", `${target.id} 当前状态：${target.status}。`);
  }

  function toggleRoleStatus(roleId) {
    const target = system.roles.find((item) => item.id === roleId);
    if (!target) return;

    target.status = target.status === "停用" ? "启用" : "停用";
    target.updatedAt = "2026-04-03 17:30";
    target.timeline.unshift(`2026-04-03 17:30 平台将角色状态更新为：${target.status}`);
    openFeedbackModal("角色状态已更新", `${target.name} 当前状态：${target.status}。`);
  }

  function toggleBrandAccountStatus(accountId) {
    const target = (window.MockData.brandAccounts || []).find((item) => item.id === accountId);
    if (!target) return;

    setBrandAccountStatus(accountId, target.status === "停用" ? "正常" : "停用");
  }

  function setBrandAccountStatus(accountId, status) {
    const target = (window.MockData.brandAccounts || []).find((item) => item.id === accountId);
    if (!target) return;

    target.status = status;
    renderPage();
    openFeedbackModal("品牌方账号状态已更新", `${target.name} 当前状态：${target.status}。`);
  }

  function toggleBrandStatus(brandId) {
    const target = (window.MockData.brands || []).find((item) => item.id === brandId);
    if (!target) return;

    target.status = target.status === "签约" ? "解约" : "签约";
    renderPage();
    openFeedbackModal("品牌合作状态已更新", `${target.name} 当前状态：${target.status}。`);
  }

  function toggleConfigStatus(configKey) {
    const target = system.configs.find((item) => item.key === configKey);
    if (!target) return;

    target.status = target.status === "已停用" ? "生效中" : "已停用";
    target.updatedAt = "2026-04-03 17:35";
    target.timeline.unshift(`2026-04-03 17:35 平台将配置状态更新为：${target.status}`);
    openFeedbackModal("配置状态已更新", `${target.key} 当前状态：${target.status}。`);
  }

  function saveMaterial(pageKey, materialId, mode = "edit") {
    const source = pageKey === "vehicleMaterials" ? materials.vehicles : materials.wheels;
    const getValue = (field) => {
      const el = modalCardEl.querySelector(`[data-material-field="${field}"]`);
      return el ? el.value.trim() : "";
    };

    const selectedSku = getValue("sku");
    const linkedProduct = products.find((p) => p.sku === selectedSku);
    const payload = {
      id: materialId,
      name: getValue("name"),
      compatibility: getValue("compatibility"),
      thumbnail: getValue("thumbnail"),
      sku: selectedSku,
      productName: linkedProduct ? linkedProduct.name : "",
      updatedAt: "2026-04-03 17:15",
      status: "停用",
    };

    if (!payload.name || !payload.compatibility) {
      openFeedbackModal("信息不完整", "请填写素材名称和适配关系后再提交。");
      return;
    }

    if (pageKey === "vehicleMaterials") {
      const colorRows = modalCardEl.querySelectorAll(".material-color-row");
      const colors = [];
      colorRows.forEach((row) => {
        const nameEl = row.querySelector("[data-color-name]");
        const valueEl = row.querySelector("[data-color-value]");
        if (nameEl && valueEl && nameEl.value.trim()) {
          colors.push({ name: nameEl.value.trim(), value: valueEl.value });
        }
      });
      Object.assign(payload, {
        brand: getValue("brand"),
        model: getValue("model"),
        colorCount: colors.length,
        colors,
      });
    } else {
      Object.assign(payload, {
        style: getValue("style"),
        color: getValue("color"),
        size: getValue("size"),
      });
    }

    if (mode === "create") {
      payload.timeline = [`2026-04-03 17:15 平台新增素材：${payload.name}`, `当前状态：${payload.status}`];
      source.unshift(payload);
      state.selectedIndex = 0;
      openFeedbackModal("素材已新增", `${payload.id} 已加入素材库，当前状态为停用。`);
      return;
    }

    const target = source.find((item) => item.id === materialId);
    if (!target) return;
    Object.assign(target, payload, { status: target.status });
    target.timeline.unshift(`2026-04-03 17:15 平台更新素材信息：${target.name}`);
    openFeedbackModal("素材已更新", `${target.id} 的素材信息已保存。`);
  }

  function saveRole(mode, roleId) {
    const getValue = (field) => {
      const el = modalCardEl.querySelector(`[data-role-field="${field}"]`);
      return el ? el.value.trim() : "";
    };

    const payload = {
      id: getValue("id"),
      name: getValue("name"),
      scope: getValue("scope"),
      members: Number(getValue("members")) || 0,
      status: getValue("status"),
      description: getValue("description"),
      permissions: getValue("permissions")
        .split(/[、,，/]/)
        .map((item) => item.trim())
        .filter(Boolean),
      updatedAt: "2026-04-03 17:40",
    };

    if (!payload.id || !payload.name || !payload.scope) {
      openFeedbackModal("信息不完整", "请填写角色编号、角色名称和访问范围后再提交。");
      return;
    }

    if (!payload.permissions.length) {
      openFeedbackModal("信息不完整", "请至少填写一个权限菜单后再提交。");
      return;
    }

    if (mode === "create") {
      payload.timeline = [`2026-04-03 17:40 平台新增角色：${payload.name}`, `角色状态：${payload.status}`, `成员数量：${payload.members} 人`];
      system.roles.unshift(payload);
      state.selectedIndex = 0;
      openFeedbackModal("角色已新增", `${payload.name} 已加入账号权限列表。`);
      return;
    }

    const target = system.roles.find((item) => item.id === roleId);
    if (!target) return;
    Object.assign(target, payload);
    target.timeline.unshift(`2026-04-03 17:40 平台更新角色信息：${target.name}`);
    openFeedbackModal("角色已更新", `${target.name} 的角色信息已保存。`);
  }

  function saveConfig(configKey) {
    const getValue = (field) => {
      const el = modalCardEl.querySelector(`[data-config-field="${field}"]`);
      return el ? el.value.trim() : "";
    };

    const target = system.configs.find((item) => item.key === configKey);
    if (!target) return;

    const payload = {
      value: getValue("value"),
      scope: getValue("scope"),
      description: getValue("description"),
      editor: getValue("editor"),
      status: getValue("status"),
      updatedAt: "2026-04-03 17:45",
    };

    if (!payload.value || !payload.scope || !payload.description || !payload.editor) {
      openFeedbackModal("信息不完整", "请填写配置值、作用范围、配置说明和修改人后再提交。");
      return;
    }

    Object.assign(target, payload);
    target.timeline.unshift(`2026-04-03 17:45 ${payload.editor} 更新配置，当前状态：${payload.status}`);
    openFeedbackModal("配置已更新", `${target.key} 的系统配置已保存。`);
  }

  function toggleProviderStatus(providerId) {
    const target = providers.find((item) => item.id === providerId);
    if (!target) return;

    target.status = target.status === "暂停接单" ? "正常营业" : "暂停接单";
    target.timeline.unshift(`2026-04-02 15:20 平台手动切换门店状态为：${target.status}`);
    openFeedbackModal("服务商状态已更新", `${target.name} 当前状态：${target.status}。`);
  }

  function toggleProviderAccountStatus(accountId) {
    const target = providerAccounts.find((item) => item.id === accountId);
    if (!target) return;
    target.status = target.status === "停用" ? "启用" : "停用";
    target.timeline = target.timeline || [];
    target.timeline.unshift(`2026-04-15 10:40 平台更新账号状态为：${target.status}`);
    renderPage();
    openFeedbackModal("账号状态已更新", `${target.account} 当前状态：${target.status}。`);
  }

  function resetProviderAccountPassword(accountId) {
    const target = providerAccounts.find((item) => item.id === accountId);
    if (!target) return;
    target.timeline = target.timeline || [];
    target.timeline.unshift("2026-04-15 10:45 平台执行重置密码操作");
    renderPage();
    openFeedbackModal("密码已重置", `${target.account} 的登录密码已重置为 mock 初始密码。`);
  }

  function toggleUserStatus(userId) {
    const target = users.find((item) => item.id === userId);
    if (!target) return;

    target.status = target.status === "停用" ? "正常" : "停用";
    openFeedbackModal("用户状态已更新", `${target.name} 当前状态：${target.status}。`);
  }

  function toggleUserLinkAuth(userId) {
    const target = users.find((item) => item.id === userId);
    if (!target) return;

    target.canLinkProduct = target.canLinkProduct === "已授权" ? "未授权" : "已授权";
    openFeedbackModal("挂链权限已更新", `${target.name} 当前挂链权限：${target.canLinkProduct}。`);
  }

  function toggleUserPunish(userId, type) {
    const target = users.find((item) => item.id === userId);
    if (!target) return;

    if (type === "mute") {
      if (target.punish === "禁言") {
        target.punish = "";
        target.punishReason = "";
        target.punishExpire = "";
        openFeedbackModal("禁言已解除", `${target.name} 已恢复正常发言权限。`);
      } else {
        target.punish = "禁言";
        target.punishReason = target.punishReason || "多次发布违规内容";
        target.punishExpire = target.punishExpire || "2026-06-25";
        openFeedbackModal("用户已被禁言", `${target.name} 禁言原因：${target.punishReason}，到期时间：${target.punishExpire}。`);
      }
    } else if (type === "ban") {
      if (target.punish === "封号") {
        target.punish = "";
        target.punishReason = "";
        target.punishExpire = "";
        openFeedbackModal("封号已解除", `${target.name} 账号已恢复正常。`);
      } else {
        target.punish = "封号";
        target.punishReason = target.punishReason || "严重违规";
        target.punishExpire = target.punishExpire || "永久";
        openFeedbackModal("用户已被封号", `${target.name} 封号原因：${target.punishReason}。`);
      }
    }
  }

  function saveProduct(mode, sourceSku) {
    const getValue = (field) => {
      const el = modalCardEl.querySelector(`[data-product-field="${field}"]`);
      return el ? el.value.trim() : "";
    };
    const fitment = getProductFitmentSelection(modalCardEl.querySelector("[data-product-fitment-picker]")).join(" / ");

    const promoType = getValue("promoType");
    const payload = {
      name: getValue("name"),
      brand: getValue("brand"),
      category: getValue("category"),
      originalPrice: getValue("originalPrice"),
      price: getValue("price"),
      stock: Number(getValue("stock")) || 0,
      fitment,
      image: getValue("image"),
      description: getValue("description"),
      status: getValue("status"),
      spec: getValue("spec"),
      promotion: promoType ? {
        type: promoType,
        label: getValue("promoLabel"),
        discount: getValue("promoDiscount"),
        desc: getValue("promoDesc"),
      } : null,
    };

    if (!payload.sku || !payload.name || !payload.brand || !payload.category || !payload.fitment) {
      openFeedbackModal("信息不完整", "请至少填写 SKU、商品名称、品牌、类目，并选择一个适配车型后再提交。");
      return;
    }

    if (!(window.MockData.brands || []).some((item) => item.name === payload.brand)) {
      openFeedbackModal("品牌无效", "请选择品牌列表中已维护的品牌。");
      return;
    }

    if (mode === "edit") {
      const target = products.find((item) => item.sku === sourceSku);
      if (!target) return;
      Object.assign(target, payload);
      openFeedbackModal("商品已更新", `${payload.name} 的商品资料已保存。`);
      return;
    }

    products.unshift(payload);
    openFeedbackModal("商品已新增", `${payload.name} 已加入商品列表。`);
  }

  function saveMallRecommendation() {
    const getValue = (field) => String(modalCardEl.querySelector(`[data-mall-recommend-field="${field}"]`)?.value || "").trim();
    const sku = getValue("sku");
    const product = products.find((item) => item.sku === sku);
    if (!product) {
      openFeedbackModal("推荐商品无效", "请选择商品列表中的商品。");
      return;
    }
    const row = {
      id: "MREC-001",
      slot: "mallHero",
      sku,
      label: getValue("label") || "本周推荐",
      title: getValue("title") || product.name,
      description: getValue("description") || product.description || "",
      sort: Number(getValue("sort") || 1),
      status: getValue("status") || "启用",
      updatedAt: getNowStamp(),
    };
    persistMallRecommendationRows([row]);
    closeModal();
    renderPage();
    openFeedbackModal("推荐位已保存", `${product.name} 已配置到用户 App 商城推荐位。`);
  }

  function saveProviderAccount(mode, sourceId) {
    const getValue = (field) => modalCardEl.querySelector(`[data-provider-account-field="${field}"]`)?.value.trim() || "";
    const payload = {
      provider: getValue("provider"),
      account: getValue("account"),
      name: getValue("name"),
      phone: getValue("phone"),
      role: getValue("role"),
      lastLogin: getValue("lastLogin"),
      status: getValue("status"),
      note: getValue("note"),
    };

    if (!payload.provider || !payload.account || !payload.name || !payload.phone || !payload.role || !payload.status) {
      openFeedbackModal("信息不完整", "请填写所属服务商、登录账号、姓名、手机号、角色和账号状态。");
      return;
    }

    if (mode === "edit") {
      const target = providerAccounts.find((item) => item.id === sourceId);
      if (!target) return;
      Object.assign(target, payload);
      target.timeline = target.timeline || [];
      target.timeline.unshift(`2026-04-15 10:30 平台更新服务商账号：${payload.account}`);
      renderPage();
      openFeedbackModal("服务商账号已更新", `${payload.account} 的账号信息已保存。`);
      return;
    }

    payload.id = `PA-${String(providerAccounts.length + 1001).padStart(4, "0")}`;
    payload.timeline = [`2026-04-15 10:30 平台新增服务商账号：${payload.account}`, `账号状态：${payload.status}`];
    providerAccounts.unshift(payload);
    state.selectedIndex = 0;
    renderPage();
    openFeedbackModal("服务商账号已新增", `${payload.account} 已加入服务商账号列表。`);
  }

  function deleteProviderAccount(accountId) {
    const index = providerAccounts.findIndex((item) => item.id === accountId);
    if (index === -1) return;
    const [removed] = providerAccounts.splice(index, 1);
    state.selectedIndex = Math.max(0, state.selectedIndex - (state.selectedIndex >= providerAccounts.length ? 1 : 0));
    renderPage();
    openFeedbackModal("服务商账号已删除", `${removed.account} 已从服务商账号列表中移除。`);
  }

  function saveVehicleModel(mode, sourceId) {
    const getValue = (field) => modalCardEl.querySelector(`[data-vehicle-model-field="${field}"]`)?.value.trim() || "";
    const payload = {
      id: getValue("id"),
      brand: getValue("brand"),
      series: getValue("series"),
      model: getValue("model"),
      chassis: getValue("chassis"),
      year: getValue("year"),
      trim: getValue("trim"),
      energyType: getValue("energyType"),
      driveType: getValue("driveType"),
      powerSpec: getValue("powerSpec"),
      transmission: getValue("transmission"),
      bodyStyle: getValue("bodyStyle"),
      wheelbase: getValue("wheelbase"),
      status: getValue("status"),
    };

    if (!payload.id || !payload.brand || !payload.series || !payload.model || !payload.chassis || !payload.year || !payload.energyType || !payload.driveType || !payload.status) {
      openFeedbackModal("信息不完整", "请填写车型编码、品牌、车系、车型、底盘型号、年份、能源类型、驱动形式和适配状态。");
      return;
    }

    if (mode === "edit") {
      const target = vehicleModels.find((item) => item.id === sourceId);
      if (!target) return;
      Object.assign(target, payload);
      target.timeline = target.timeline || [];
      target.timeline.unshift(`2026-04-15 10:20 平台更新车型档案：${payload.brand} ${payload.series} ${payload.model}`);
      defs.vehicleModelManage.stats = getVehicleModelStats();
      renderPage();
      openFeedbackModal("车型已更新", `${payload.brand} ${payload.series} ${payload.model} 的车型信息已保存。`);
      return;
    }

    payload.timeline = [`2026-04-15 10:20 平台新增车型档案：${payload.brand} ${payload.series} ${payload.model}`, `当前适配状态：${payload.status}`];
    vehicleModels.unshift(payload);
    state.selectedIndex = 0;
    defs.vehicleModelManage.stats = getVehicleModelStats();
    renderPage();
    openFeedbackModal("车型已新增", `${payload.brand} ${payload.series} ${payload.model} 已加入车型管理列表。`);
  }

  function deleteVehicleModel(id) {
    const index = vehicleModels.findIndex((item) => item.id === id);
    if (index === -1) return;
    const [removed] = vehicleModels.splice(index, 1);
    state.selectedIndex = Math.max(0, state.selectedIndex - (state.selectedIndex >= vehicleModels.length ? 1 : 0));
    defs.vehicleModelManage.stats = getVehicleModelStats();
    renderPage();
    openFeedbackModal("车型已删除", `${removed.brand} ${removed.series} ${removed.model} 已从车型管理中移除。`);
  }

  function saveCategory(mode, sourceName) {
    const getValue = (field) => {
      const el = modalCardEl.querySelector(`[data-category-field="${field}"]`);
      return el ? el.value.trim() : "";
    };

    const payload = {
      name: getValue("name"),
      sort: Number(getValue("sort")) || 0,
      parent: getValue("parent"),
      level: getValue("parent") ? 1 : 0,
      status: getValue("status"),
    };

    if (!payload.name) {
      openFeedbackModal("信息不完整", "请填写分类名称后再提交。");
      return;
    }

    if (mode === "edit") {
      const target = categories.find((item) => item.name === sourceName);
      if (!target) return;
      Object.assign(target, payload);
      openFeedbackModal("分类已更新", `${payload.name} 的分类信息已保存。`);
      return;
    }

    categories.unshift(payload);
    state.selectedIndex = 0;
    openFeedbackModal("分类已新增", `${payload.name} 已加入商品分类列表。`);
  }

  function saveForumBoard(mode, sourceId) {
    const getValue = (field) => modalCardEl.querySelector(`[data-forum-board-field="${field}"]`)?.value.trim() || "";
    const payload = {
      id: sourceId,
      name: getValue("name"),
      summary: getValue("summary"),
      currentModerators: getValue("currentModerators"),
      status: getValue("status"),
    };
    if (!payload.name || !payload.summary || !payload.currentModerators) {
      openFeedbackModal("信息不完整", "请填写版面名称、当前版主和版面说明。");
      return;
    }
    if (mode === "edit") {
      const target = forumBoards.find((item) => item.id === sourceId);
      if (!target) return;
      Object.assign(target, payload);
      openFeedbackModal("版面已更新", `${payload.name} 的版面信息已保存。`);
      return;
    }
    forumBoards.unshift(payload);
    state.selectedIndex = 0;
    openFeedbackModal("版面已新增", `${payload.name} 已加入版面维护列表。`);
  }

  function deleteForumBoard(id) {
    const index = forumBoards.findIndex((item) => item.id === id);
    if (index === -1) return;
    const [removed] = forumBoards.splice(index, 1);
    openFeedbackModal("版面已删除", `${removed.name} 已从论坛版面中移除。`);
  }


  function saveService(mode, sourceCode) {
    const getValue = (field) => {
      const el = modalCardEl.querySelector(`[data-service-field="${field}"]`);
      return el ? el.value.trim() : "";
    };

    const province = getValue("province");
    const city = getValue("city");
    const county = getValue("county");

    const payload = {
      code: getValue("code"),
      name: getValue("name"),
      regionProvince: province,
      regionCity: city,
      regionCounty: county,
      area: [province, city, county].filter(Boolean).join(" / "),
      basePrice: getValue("basePrice"),
      floatRatio: getValue("floatRatio"),
      desc: getValue("desc"),
      status: getValue("status"),
    };

    if (!payload.code || !payload.name || !province || !city || !county || !payload.basePrice || !payload.floatRatio) {
      openFeedbackModal("信息不完整", "请填写服务编码、项目名称、区域、基准价和价格浮动比例后再提交。");
      return;
    }

    if (mode === "edit") {
      const target = services.find((item) => item.code === sourceCode);
      if (!target) return;
      Object.assign(target, payload);
      openFeedbackModal("服务项目已更新", `${payload.name} 的服务资料已保存。`);
      return;
    }

    services.unshift(payload);
    state.selectedIndex = 0;
    openFeedbackModal("服务项目已新增", `${payload.name} 已加入服务项目列表。`);
  }

  function getInvitedUserRows(row) {
    const inviteCode = row.inviteCode || window.MockData.providerInvites?.find((item) => item.providerName === (row.name || row.provider))?.code || "-";
    const count = Number(row.referredUsers || row.referralUsers || 0);
    if (!count || inviteCode === "-") return [];
    const existing = (window.MockData.userAccounts || [])
      .filter((item) => item.inviteCode === inviteCode || item.inviteProviderName === (row.name || row.provider))
      .map((item, index) => ({
        id: item.id || `U-${inviteCode}-${index + 1}`,
        nickname: item.nickname || item.name || "用户",
        phone: item.phone || "-",
        registeredAt: item.registeredAt || `2026-04-${String(Math.max(1, 2 - index)).padStart(2, "0")} 10:${String(18 + index).padStart(2, "0")}`,
      }));
    const names = ["周恺", "林澈", "陈予安", "许知行", "赵一鸣", "何嘉宁", "孙若瑜", "吴昊然", "郑亦辰", "唐雨薇", "蒋明哲", "韩沐阳", "宋知夏", "余景行", "方念", "高远", "马亦凡", "罗清越", "叶晨", "丁然", "白予", "江禾", "夏宁", "邹言", "任星", "顾北"];
    const generated = Array.from({ length: Math.max(0, count - existing.length) }, (_, index) => {
      const day = 2 + Math.floor(index / 4);
      const hour = 9 + (index % 8);
      const minute = (index * 7 + 12) % 60;
      return {
        id: `U-${inviteCode}-${String(index + 1).padStart(3, "0")}`,
        nickname: names[index % names.length],
        phone: `13${(600000000 + index * 3791).toString().padStart(9, "0").slice(0, 9)}`,
        registeredAt: `2026-04-${String(day).padStart(2, "0")} ${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`,
      };
    });
    return [...existing, ...generated].slice(0, count);
  }

  function openSettlementAuditModal(row) {
    const invitedUsers = getInvitedUserRows(row);
    openModal(`
      <div class="panel-header">
        <div>
          <span class="eyebrow">Service Stats</span>
          <h2 class="section-title">服务统计明细</h2>
          <p class="section-subtitle">${row.name || row.provider} / 服务 ${row.serviceTimes || row.orders || 0} 次 / 订单金额 ${row.orderAmount || row.grossAmount || row.currentRevenue || "¥ 0"}</p>
        </div>
      </div>
      <div class="detail-grid">
        <div><span>服务次数</span><strong>${row.serviceTimes || row.orders || 0} 次</strong></div>
        <div><span>推荐用户</span><strong>${row.referredUsers || row.referralUsers || 0} 人</strong></div>
        <div><span>订单金额</span><strong>${row.orderAmount || row.grossAmount || row.currentRevenue || "¥ 0"}</strong></div>
        <div><span>推荐码</span><strong>${row.inviteCode || "-"}</strong></div>
      </div>
      <div class="table-card" style="margin-top:18px;">
        <div class="finance-kv-title" style="margin-bottom:12px;">邀请用户列表</div>
        <table class="data-table">
          <thead>
            <tr><th>用户ID</th><th>用户</th><th>手机号</th><th>注册时间</th></tr>
          </thead>
          <tbody>
            ${
              invitedUsers.length
                ? invitedUsers
                    .map(
                      (item) => `
                        <tr>
                          <td>${escapeHtml(item.id)}</td>
                          <td>${escapeHtml(item.nickname)}</td>
                          <td>${escapeHtml(item.phone)}</td>
                          <td>${escapeHtml(item.registeredAt)}</td>
                        </tr>
                      `
                    )
                    .join("")
                : `<tr><td colspan="4" class="muted">暂无邀请用户记录。</td></tr>`
            }
          </tbody>
        </table>
      </div>
      <div style="display:flex; gap:12px; margin-top:18px;">
        <button class="btn btn-primary" type="button" data-close-modal>关闭</button>
      </div>
    `);
  }

  function openSettlementRejectModal(settlementId) {
    const target = settlements.find((item) => item.id === settlementId);
    if (!target) return;
    openModal(`
      <div class="panel-header">
        <div>
          <span class="eyebrow">Stats Adjust</span>
          <h2 class="section-title">调整统计记录</h2>
          <p class="section-subtitle">${target.id} / ${target.provider} / 请填写调整原因</p>
        </div>
      </div>
      <div class="field-group field-group-full">
        <div class="field-label">调整原因</div>
        <textarea class="textarea" data-settlement-reject-reason>服务次数、推荐用户或订单金额需要复核，请运营确认后更新。</textarea>
      </div>
      <div style="display:flex; gap:12px; margin-top:18px;">
        <button class="btn btn-primary" type="button" data-submit-settlement-reject data-settlement-id="${target.id}">确认调整</button>
        <button class="btn btn-secondary" type="button" data-close-modal>返回</button>
      </div>
    `);
  }

  function openCaseAuditModal(row) {
    openModal(`
      <div class="panel-header">
        <div>
          <span class="eyebrow">Case Audit</span>
          <h2 class="section-title">审核案例</h2>
          <p class="section-subtitle">${row.id} / ${row.title} / ${row.provider}</p>
        </div>
      </div>
      <div class="action-grid">
        <button class="action-tile" type="button" data-case-decision="approve" data-case-id="${row.id}">
          <strong>审核通过</strong>
          <p>确认案例内容、图片和车型说明无误，并进入通过状态。</p>
        </button>
        <button class="action-tile" type="button" data-case-decision="reject" data-case-id="${row.id}">
          <strong>审核驳回</strong>
          <p>驳回当前案例内容，并填写驳回原因供服务商修正后重新提交。</p>
        </button>
      </div>
      <div style="display:flex; gap:12px; margin-top:18px;">
        <button class="btn btn-secondary" type="button" data-close-modal>取消</button>
      </div>
    `);
  }

  function openCaseRejectModal(caseId) {
    const target = cases.find((item) => item.id === caseId);
    if (!target) return;
    openModal(`
      <div class="panel-header">
        <div>
          <span class="eyebrow">Case Reject</span>
          <h2 class="section-title">驳回案例</h2>
          <p class="section-subtitle">${target.id} / ${target.title} / 请填写驳回原因</p>
        </div>
      </div>
      <div class="field-group field-group-full">
        <div class="field-label">驳回原因</div>
        <textarea class="textarea" data-case-reject-reason>案例图片不完整或车型说明不足，请补充完整案例素材后重新提交审核。</textarea>
      </div>
      <div style="display:flex; gap:12px; margin-top:18px;">
        <button class="btn btn-primary" type="button" data-submit-case-reject data-case-id="${target.id}">确认驳回</button>
        <button class="btn btn-secondary" type="button" data-close-modal>返回</button>
      </div>
    `);
  }

  function syncCaseEditorPreview() {
    const getValue = (field) => modalCardEl.querySelector(`[data-case-field="${field}"]`)?.value.trim() || "";
    const audit = modalCardEl.querySelector("[data-case-editor]")?.dataset.audit || "待审核";
    const display = getValue("display") || "正常展示";
    const title = getValue("title") || "未填写案例标题";
    const provider = getValue("provider") || "未选择服务商";
    const model = getValue("model") || "未填写车型";
    const style = getValue("style") || "未填写风格";
    const modType = getValue("modType") || "未填写改装类型";
    const cost = getValue("cost") || "未填写费用";
    const image = getValue("image") || "未填写封面图";
    const imagePreview = getValue("imagePreview");
    const content = getValue("content");
    const contentSummary = getCaseContentSummary(content);

    const previewEl = modalCardEl.querySelector("[data-case-editor-preview]");
    if (previewEl) {
      previewEl.querySelector(".case-cover-preview")?.replaceWith(
        (() => {
          const wrapper = document.createElement("div");
          wrapper.innerHTML = renderCaseCoverPreview(image, title, false, imagePreview);
          return wrapper.firstElementChild;
        })()
      );
    }

    const titleEl = modalCardEl.querySelector("[data-case-preview-title]");
    if (titleEl) titleEl.textContent = title;
    const summaryEl = modalCardEl.querySelector("[data-case-preview-summary]");
    if (summaryEl) summaryEl.textContent = contentSummary;
    const modelEl = modalCardEl.querySelector("[data-case-preview-model]");
    if (modelEl) modelEl.textContent = model;
    const styleEl = modalCardEl.querySelector("[data-case-preview-style]");
    if (styleEl) styleEl.textContent = style;
    const modTypeEl = modalCardEl.querySelector("[data-case-preview-modType]");
    if (modTypeEl) modTypeEl.textContent = modType;
    const costEl = modalCardEl.querySelector("[data-case-preview-cost]");
    if (costEl) costEl.textContent = cost;

    const tagsEl = modalCardEl.querySelector("[data-case-editor-tags]");
    if (tagsEl) {
      tagsEl.innerHTML = `
        ${formatTag(audit)}
        ${formatTag(display)}
        <span class="pill">${provider}</span>
      `;
    }

    const hintEl = modalCardEl.querySelector("[data-case-display-hint]");
    if (hintEl) hintEl.textContent = getCaseDisplayHint(display);

    modalCardEl.querySelectorAll("[data-case-display-option]").forEach((button) => {
      button.classList.toggle("active", button.dataset.caseDisplayOption === display);
    });
  }

  function syncCaseRichEditorField() {
    const editor = modalCardEl.querySelector("[data-case-rich-editor]");
    const contentField = modalCardEl.querySelector('[data-case-field="content"]');
    if (!editor || !contentField) return;
    contentField.value = editor.innerHTML.trim();
    syncCaseEditorPreview();
  }

  function appendCaseRichMedia(type, file) {
    const editor = modalCardEl.querySelector("[data-case-rich-editor]");
    if (!editor || !file) return;
    const mediaUrl = URL.createObjectURL(file);
    const safeName = escapeHtml(file.name || (type === "video" ? "视频素材" : "图片素材"));
    const block =
      type === "video"
        ? `
          <figure class="case-rich-media">
            <video controls src="${mediaUrl}"></video>
            <figcaption>${safeName}</figcaption>
          </figure>
        `
        : `
          <figure class="case-rich-media">
            <img src="${mediaUrl}" alt="${safeName}" />
            <figcaption>${safeName}</figcaption>
          </figure>
        `;
    editor.insertAdjacentHTML("beforeend", block);
    syncCaseRichEditorField();
  }

  function openCaseEditorModal(mode, row) {
    const isEdit = mode === "edit";
    const source = row || {
      id: `CA-${Date.now().toString().slice(-6)}`,
      title: "",
      provider: providers.find((item) => item.auditStatus === "已通过")?.name || providers[0]?.name || "御驰 Performance Studio",
      model: "宝马 G20 330i",
      style: "黑武士街道风",
      modType: "车衣改造",
      cost: "¥ 26,800",
      image: "case-new-cover.jpg",
      imagePreview: "",
      content: "",
      display: "正常展示",
      audit: "待审核",
    };
    const providerOptions = getCaseProviderOptions(source.provider)
      .map((item) => `<option value="${item}" ${item === source.provider ? "selected" : ""}>${item}</option>`)
      .join("");
    const styleOptions = getCaseStyleOptions(source.style)
      .map((item) => `<option value="${item}" ${item === source.style ? "selected" : ""}>${item}</option>`)
      .join("");
    const modTypeOptions = getCaseModTypeOptions(source.modType)
      .map((item) => `<option value="${item}" ${item === source.modType ? "selected" : ""}>${item}</option>`)
      .join("");
    openModal(`
      <div class="case-editor-modal" data-case-editor data-audit="${source.audit || "待审核"}">
        <div class="panel-header">
          <div>
            <span class="eyebrow">Case Editor</span>
            <h2 class="section-title">${isEdit ? "编辑案例" : "新增案例"}</h2>
            <p class="section-subtitle">${source.id} / ${isEdit ? source.title : "创建新的平台案例"}</p>
          </div>
        </div>
        <div class="case-editor-preview" data-case-editor-preview>
          ${renderCaseCoverPreview(source.image, source.title || "未填写案例标题", false, source.imagePreview || "")}
          <div class="case-editor-preview-copy">
            <div class="case-card-tags" data-case-editor-tags>
              ${formatTag(source.audit || "待审核")}
              ${formatTag(source.display)}
              <span class="pill">${source.provider}</span>
            </div>
            <h3 data-case-preview-title>${source.title || "未填写案例标题"}</h3>
            <p data-case-preview-summary>${getCaseContentSummary(source.content)}</p>
            <div class="case-editor-preview-meta">
              <span data-case-preview-model>${source.model}</span>
              <span data-case-preview-style>${source.style}</span>
              <span data-case-preview-modType>${source.modType}</span>
              <span data-case-preview-cost>${source.cost}</span>
            </div>
          </div>
        </div>
        <div class="case-editor-section">
          <div class="case-editor-section-head">
            <h3>基础信息</h3>
            <span>${source.id}</span>
          </div>
          <div class="form-grid">
            <div class="field-group field-group-full">
              <div class="field-label">案例标题</div>
              <input class="input" data-case-field="title" placeholder="请输入案例标题" value="${source.title}" />
            </div>
            <div class="field-group">
              <div class="field-label">服务商</div>
              <select class="select" data-case-field="provider">${providerOptions}</select>
            </div>
            <div class="field-group">
              <div class="field-label">车型</div>
              <input class="input" data-case-field="model" placeholder="请输入车型" value="${source.model}" />
            </div>
            <div class="field-group">
              <div class="field-label">风格</div>
              <input class="input" data-case-field="style" placeholder="请输入风格，例如黑武士街道风" value="${source.style}" />
            </div>
            <div class="field-group">
              <div class="field-label">改装类型</div>
              <select class="select" data-case-field="modType">${modTypeOptions}</select>
            </div>
            <div class="field-group">
              <div class="field-label">费用</div>
              <input class="input" data-case-field="cost" placeholder="例如 ¥ 26,800" value="${source.cost}" />
            </div>
          </div>
        </div>
        <div class="case-editor-section">
          <div class="case-editor-section-head">
            <h3>展示设置</h3>
            <span data-case-display-hint>${getCaseDisplayHint(source.display)}</span>
          </div>
          <input type="hidden" data-case-field="display" value="${source.display}" />
          <div class="case-display-toggle">
            ${["首页展示", "正常展示", "未展示"]
              .map(
                (item) => `
                  <button class="case-display-option ${item === source.display ? "active" : ""}" type="button" data-case-display-option="${item}">
                    <strong>${item}</strong>
                    <span>${getCaseDisplayHint(item)}</span>
                  </button>
                `
              )
              .join("")}
          </div>
        </div>
        <div class="case-editor-section">
          <div class="case-editor-section-head">
            <h3>内容素材</h3>
            <span>支持本地上传封面并实时预览</span>
          </div>
          <div class="form-grid">
            <div class="field-group field-group-full">
              <div class="field-label">封面图</div>
              <input type="hidden" data-case-field="imagePreview" value="${source.imagePreview || ""}" />
              <label class="upload-panel case-upload-panel">
                <input class="upload-input" data-case-upload type="file" accept="image/*" />
                <span class="upload-illustration"></span>
                <strong>上传封面</strong>
                <small>选择图片后自动回填文件名，并同步更新右侧预览。</small>
              </label>
              <input class="input" data-case-field="image" placeholder="上传后自动回填封面图名称" value="${typeof source.image === "object" ? source.image.name || "" : source.image || ""}" readonly />
            </div>
            <div class="field-group field-group-full">
              <div class="field-label">案例说明</div>
              <div class="case-rich-toolbar">
                <button class="btn btn-secondary" type="button" data-case-rich-command="paragraph">正文</button>
                <button class="btn btn-secondary" type="button" data-case-rich-command="heading">标题</button>
                <button class="btn btn-secondary" type="button" data-case-rich-command="bold">加粗</button>
                <label class="btn btn-secondary case-rich-upload">
                  <input class="upload-input" data-case-rich-image type="file" accept="image/*" />
                  插入图片
                </label>
                <label class="btn btn-secondary case-rich-upload">
                  <input class="upload-input" data-case-rich-video type="file" accept="video/*" />
                  插入视频
                </label>
              </div>
              <input type="hidden" data-case-field="content" value="${escapeHtml(normalizeCaseRichContent(source.content || ""))}" />
              <div class="case-rich-editor" data-case-rich-editor contenteditable="true">${normalizeCaseRichContent(source.content || "")}</div>
            </div>
          </div>
        </div>
        <div style="display:flex; gap:12px; margin-top:18px;">
          <button class="btn btn-primary" type="button" data-save-case data-mode="${mode}" data-case-id="${source.id}">${isEdit ? "保存修改" : "确认新增"}</button>
          <button class="btn btn-secondary" type="button" data-close-modal>取消</button>
        </div>
      </div>
    `);
  }

  function openCaseDeleteModal(row) {
    openModal(`
      <div class="panel-header">
        <div>
          <span class="eyebrow">Case Delete</span>
          <h2 class="section-title">删除案例</h2>
          <p class="section-subtitle">确认删除案例“${row.title}”吗？</p>
        </div>
      </div>
      <div style="display:flex; gap:12px; margin-top:18px;">
        <button class="btn btn-danger" type="button" data-delete-case data-case-id="${row.id}">确认删除</button>
        <button class="btn btn-secondary" type="button" data-close-modal>取消</button>
      </div>
    `);
  }

  function openProductDeleteModal(row) {
    openModal(`
      <div class="panel-header">
        <div>
          <span class="eyebrow">Product Delete</span>
          <h2 class="section-title">删除商品</h2>
          <p class="section-subtitle">确认删除商品“${row.name}”吗？删除后不可恢复。</p>
        </div>
      </div>
      <div style="display:flex; gap:12px; margin-top:18px;">
        <button class="btn btn-danger" type="button" data-delete-product data-product-sku="${row.sku}">确认删除</button>
        <button class="btn btn-secondary" type="button" data-close-modal>取消</button>
      </div>
    `);
  }

  function openProductStockModal(row) {
    openModal(`
      <div class="panel-header">
        <div>
          <span class="eyebrow">Product Stock</span>
          <h2 class="section-title">修改库存</h2>
          <p class="section-subtitle">${row.name}（SKU：${row.sku}）</p>
        </div>
      </div>
      <div style="margin-top:18px;">
        <label style="display:grid; gap:8px;">
          <span style="color:var(--muted); font-size:13px;">当前库存：${row.stock}</span>
          <input class="input" type="number" min="0" data-product-stock-input value="${row.stock}" placeholder="输入新库存数量" />
        </label>
      </div>
      <div style="display:flex; gap:12px; margin-top:18px;">
        <button class="btn btn-primary" type="button" data-update-product-stock data-product-sku="${row.sku}">保存</button>
        <button class="btn btn-secondary" type="button" data-close-modal>取消</button>
      </div>
    `);
  }

  function openReviewAuditModal(review, action) {
    const isApprove = action === "approve";
    openModal(`
      <div class="panel-header">
        <div>
          <span class="eyebrow">Review Audit</span>
          <h2 class="section-title">${isApprove ? "通过评价" : "驳回评价"}</h2>
          <p class="section-subtitle">${review.user || "匿名用户"} · ${review.vehicle || ""}</p>
        </div>
      </div>
      <div style="margin-top:18px;">
        <div class="kv-row" style="margin-bottom:12px;">
          <span class="muted">评价内容</span>
          <strong style="font-weight:500;">${review.content || "-"}</strong>
        </div>
        <label style="display:grid; gap:8px;">
          <span style="color:var(--muted); font-size:13px;">${isApprove ? "通过后将展示在商品详情页" : "请输入驳回原因"}</span>
          ${isApprove ? "" : `<input class="input" type="text" data-review-reject-reason value="" placeholder="评价内容违规或其他原因" />`}
        </label>
      </div>
      <div style="display:flex; gap:12px; margin-top:18px;">
        <button class="btn ${isApprove ? "btn-primary" : "btn-danger"}" type="button" data-review-audit-submit data-review-id="${review.id}" data-review-action="${action}">${isApprove ? "确认通过" : "确认驳回"}</button>
        <button class="btn btn-secondary" type="button" data-close-modal>取消</button>
      </div>
    `);
    modalCardEl.querySelectorAll("[data-review-audit-submit]").forEach((button) => {
      button.addEventListener("click", () => {
        const target = (window.MockData.productReviews || []).find((r) => r.id === review.id);
        if (target) {
          target.auditStatus = isApprove ? "已通过" : "已驳回";
          if (!isApprove) {
            const reasonInput = modalCardEl.querySelector("[data-review-reject-reason]");
            target.auditRejectReason = reasonInput ? reasonInput.value : "";
          }
          closeModal();
          renderPage();
        }
      });
    });
  }

  function openCaseDisplayModal(row) {
    openModal(`
      <div class="panel-header">
        <div>
          <span class="eyebrow">Case Display</span>
          <h2 class="section-title">设置展示状态</h2>
          <p class="section-subtitle">${row.id} / ${row.title} / 当前展示状态：${row.display}</p>
        </div>
      </div>
      <div class="action-grid">
        <button class="action-tile" type="button" data-case-display="首页展示" data-case-id="${row.id}">
          <strong>首页展示</strong>
          <p>用于首页重点露出，适合高质量、代表性的案例内容。</p>
        </button>
        <button class="action-tile" type="button" data-case-display="正常展示" data-case-id="${row.id}">
          <strong>正常展示</strong>
          <p>在案例列表正常展示，不参与首页重点推荐。</p>
        </button>
        <button class="action-tile" type="button" data-case-display="未展示" data-case-id="${row.id}">
          <strong>未展示</strong>
          <p>从前台展示池移除，仅在后台保留案例数据与审核记录。</p>
        </button>
      </div>
      <div style="display:flex; gap:12px; margin-top:18px;">
        <button class="btn btn-secondary" type="button" data-close-modal>取消</button>
      </div>
    `);
  }

  function openPostManageModal(row) {
    if (row.status === "已删除") {
      openModal(`
        <div class="panel-header">
          <div>
            <span class="eyebrow">Post Restore</span>
            <h2 class="section-title">恢复帖子显示</h2>
            <p class="section-subtitle">${row.id} / ${row.title}</p>
          </div>
        </div>
        <div class="doc-item">
          <strong>当前删除原因</strong>
          <div class="muted">${row.deleteReason || "无"}</div>
        </div>
        <div style="display:flex; gap:12px; margin-top:18px;">
          <button class="btn btn-primary" type="button" data-submit-post-restore data-post-id="${row.id}">确认恢复</button>
          <button class="btn btn-secondary" type="button" data-close-modal>取消</button>
        </div>
      `);
      return;
    }

    openModal(`
      <div class="panel-header">
        <div>
          <span class="eyebrow">Post Delete</span>
          <h2 class="section-title">删除帖子</h2>
          <p class="section-subtitle">${row.id} / ${row.title} / 请填写删除原因</p>
        </div>
      </div>
      <div class="field-group field-group-full">
        <div class="field-label">删除原因</div>
        <textarea class="textarea" data-post-delete-reason>帖子内容涉及违规导流、营销或不符合社区规范的信息，已删除处理。</textarea>
      </div>
      <div style="display:flex; gap:12px; margin-top:18px;">
        <button class="btn btn-primary" type="button" data-submit-post-delete data-post-id="${row.id}">确认删除</button>
        <button class="btn btn-secondary" type="button" data-close-modal>取消</button>
      </div>
    `);
  }

  function openPostCommerceModal(row) {
    const isAuthorized = row.linkAuthStatus === "已授权" || authorizedCommerceAccounts.includes(row.author);
    const selected = new Set(row.linkedProducts || []);
    openModal(`
      <div class="panel-header">
        <div>
          <span class="eyebrow">Commerce Link</span>
          <h2 class="section-title">授权账号挂商品链接</h2>
          <p class="section-subtitle">${row.id} / ${row.author} / 当前状态：${row.linkAuthStatus || "未授权"}</p>
        </div>
      </div>
      <div class="form-grid">
        <div class="field-group">
          <label class="field-label" for="post-commerce-auth">商品链接权限</label>
          <select class="select" id="post-commerce-auth" data-post-commerce-auth>
            <option value="已授权" ${isAuthorized ? "selected" : ""}>已授权</option>
            <option value="未授权" ${isAuthorized ? "" : "selected"}>未授权</option>
          </select>
        </div>
        <div class="field-group">
          <label class="field-label" for="post-commerce-note">治理备注</label>
          <input class="input" id="post-commerce-note" data-post-commerce-note value="${row.governanceNote || ""}" />
        </div>
      </div>
      <div class="doc-list" style="margin-top:16px;">
        ${products.slice(0, 6).map((item) => `
          <label class="doc-item" style="cursor:pointer;">
            <strong><input type="checkbox" data-post-product value="${item.sku}" ${selected.has(item.sku) ? "checked" : ""}> ${item.name}</strong>
            <div class="muted">${item.brand} / ${item.category} / ${item.price}</div>
          </label>
        `).join("")}
      </div>
      <div style="display:flex; gap:12px; margin-top:18px;">
        <button class="btn btn-primary" type="button" data-save-post-commerce data-post-id="${row.id}">保存商品链接</button>
        <button class="btn btn-secondary" type="button" data-close-modal>取消</button>
      </div>
    `);
  }

  function openUserPunishModal(row, type) {
    const isMute = type === "mute";
    if (isMute && row.punish === "禁言") {
      toggleUserPunish(row.id, "mute");
      return;
    }
    if (!isMute && row.punish === "封号") {
      toggleUserPunish(row.id, "ban");
      return;
    }
    openModal(`
      <div class="panel-header">
        <div>
          <span class="eyebrow">Forum Sanction</span>
          <h2 class="section-title">${isMute ? "设置禁言周期" : "封禁用户"}</h2>
          <p class="section-subtitle">${row.id} / ${row.name} / ${isMute ? "选择周期并填写原因" : "封禁后账号将停用"}</p>
        </div>
      </div>
      <div class="form-grid">
        <div class="field-group">
          <label class="field-label" for="user-punish-duration">处理周期</label>
          <select class="select" id="user-punish-duration" data-user-punish-duration ${isMute ? "" : "disabled"}>
            <option value="3 天">3 天</option>
            <option value="7 天" selected>7 天</option>
            <option value="30 天">30 天</option>
            <option value="永久">永久</option>
          </select>
        </div>
        <div class="field-group field-group-full">
          <label class="field-label" for="user-punish-reason">处理原因</label>
          <textarea class="textarea" id="user-punish-reason" data-user-punish-reason>${isMute ? "发布违规导流、攻击性表达或重复刷屏内容，按社区规则禁言处理。" : "严重违反社区规则或规避治理，封禁账号并保留处理记录。"}</textarea>
        </div>
      </div>
      <div style="display:flex; gap:12px; margin-top:18px;">
        <button class="btn btn-primary" type="button" data-submit-user-punish data-user-id="${row.id}" data-punish-type="${type}">${isMute ? "确认禁言" : "确认封禁"}</button>
        <button class="btn btn-secondary" type="button" data-close-modal>取消</button>
      </div>
    `);
  }

  function openCommentManageModal(row) {
    if (row.status === "已删除") {
      openModal(`
        <div class="panel-header">
          <div>
            <span class="eyebrow">Comment Restore</span>
            <h2 class="section-title">恢复评论显示</h2>
            <p class="section-subtitle">${row.id} / ${row.post}</p>
          </div>
        </div>
        <div class="doc-item">
          <strong>当前删除原因</strong>
          <div class="muted">${row.deleteReason || "无"}</div>
        </div>
        <div style="display:flex; gap:12px; margin-top:18px;">
          <button class="btn btn-primary" type="button" data-submit-comment-restore data-comment-id="${row.id}">确认恢复</button>
          <button class="btn btn-secondary" type="button" data-close-modal>取消</button>
        </div>
      `);
      return;
    }

    openModal(`
      <div class="panel-header">
        <div>
          <span class="eyebrow">Comment Delete</span>
          <h2 class="section-title">删除评论</h2>
          <p class="section-subtitle">${row.id} / ${row.post} / 请填写删除原因</p>
        </div>
      </div>
      <div class="field-group field-group-full">
        <div class="field-label">删除原因</div>
        <textarea class="textarea" data-comment-delete-reason>评论内容涉及违规引导、攻击性表达或不符合社区规范，已删除处理。</textarea>
      </div>
      <div style="display:flex; gap:12px; margin-top:18px;">
        <button class="btn btn-primary" type="button" data-submit-comment-delete data-comment-id="${row.id}">确认删除</button>
        <button class="btn btn-secondary" type="button" data-close-modal>取消</button>
      </div>
    `);
  }

  function openMaterialPreviewModal(pageKey, row) {
    openModal(`
      <div class="panel-header">
        <div>
          <span class="eyebrow">Material Preview</span>
          <h2 class="section-title">素材预览</h2>
          <p class="section-subtitle">${row.id} / ${row.name}</p>
        </div>
      </div>
      <div class="material-preview-card">
        <div class="material-preview-thumb">${pageKey === "vehicleMaterials" ? "车型预览" : "轮毂预览"}</div>
        <div class="doc-list">
          <div class="doc-item"><strong>素材名称</strong><div class="muted">${row.name}</div></div>
          <div class="doc-item"><strong>缩略图</strong><div class="muted">${row.thumbnail}</div></div>
          <div class="doc-item"><strong>适配关系</strong><div class="muted">${row.compatibility}</div></div>
        </div>
      </div>
      <div style="display:flex; gap:12px; margin-top:18px;">
        <button class="btn btn-primary" type="button" data-close-modal>关闭</button>
      </div>
    `);
  }

  function updateMaterialModelOptions() {
    const brandSelect = modalCardEl.querySelector("#materialBrandSelect");
    const modelSelect = modalCardEl.querySelector("#materialModelSelect");
    if (!brandSelect || !modelSelect) return;
    const brand = brandSelect.value;
    const models = vehicleModels.filter((v) => v.brand === brand);
    modelSelect.innerHTML = '<option value="">-- 请选择车型 --</option>' + models.map((m) => `<option value="${m.model}">${m.series} ${m.model}</option>`).join("");
  }

  function addMaterialColor() {
    const nameInput = modalCardEl.querySelector("#newColorName");
    const valueInput = modalCardEl.querySelector("#newColorValue");
    const listEl = modalCardEl.querySelector("#materialColorList");
    const countEl = modalCardEl.querySelector("#colorCountDisplay");
    const name = nameInput?.value.trim();
    const value = valueInput?.value || "#0d0f12";
    if (!name) return;
    const idx = listEl?.children.length || 0;
    const row = document.createElement("div");
    row.className = "material-color-row";
    row.setAttribute("data-color-index", idx);
    row.style.cssText = "display:flex;gap:10px;align-items:center;";
    row.innerHTML = `<input class="input" style="flex:1;" data-color-name value="${name}" placeholder="颜色名称" /><input class="input" style="width:100px;" type="color" data-color-value value="${value}" /><span style="display:inline-block;width:28px;height:28px;border-radius:50%;background:${value};border:1px solid rgba(255,255,255,0.2);"></span><button class="btn btn-danger" type="button" onclick="removeMaterialColor(${idx})" style="padding:4px 10px;font-size:12px;">删除</button>`;
    listEl?.appendChild(row);
    if (nameInput) nameInput.value = "";
    if (countEl) countEl.textContent = listEl?.children.length || 0;
  }

  function removeMaterialColor(index) {
    const listEl = modalCardEl.querySelector("#materialColorList");
    const countEl = modalCardEl.querySelector("#colorCountDisplay");
    const row = listEl?.querySelector(`[data-color-index="${index}"]`);
    if (row) row.remove();
    if (countEl) countEl.textContent = listEl?.children.length || 0;
  }

  function openMaterialEditorModal(pageKey, row) {
    const isVehicle = pageKey === "vehicleMaterials";
    const isEdit = Boolean(row);
    const source = row || (
      isVehicle
        ? {
            id: `VM-${String(materials.vehicles.length + 1).padStart(3, "0")}`,
            name: "",
            brand: "",
            model: "",
            colorCount: 1,
            compatibility: "",
            thumbnail: "",
            sku: "",
            productName: "",
          }
        : {
            id: `WM-${String(materials.wheels.length + 1).padStart(3, "0")}`,
            name: "",
            style: "",
            color: "",
            size: "19 寸",
            compatibility: "",
            thumbnail: "",
            sku: "",
            productName: "",
          }
    );
    const brandOptions = isVehicle
      ? [...new Set(vehicleModels.map((v) => v.brand))]
      : [];
    const modelOptions = isVehicle
      ? vehicleModels.filter((v) => v.brand === source.brand).map((v) => ({ value: v.model, label: `${v.series} ${v.model}` }))
      : [];
    openModal(`
      <div class="panel-header">
        <div>
          <span class="eyebrow">Material Editor</span>
          <h2 class="section-title">${isEdit ? "编辑素材" : "新增素材"}</h2>
          <p class="section-subtitle">${source.id} / ${isEdit ? source.name : "创建新的渲染素材"}</p>
        </div>
      </div>
      <div class="form-grid">
        <div class="field-group">
          <div class="field-label">素材名称</div>
          <input class="input" data-material-field="name" value="${source.name}" />
        </div>
        ${isVehicle ? `
          <div class="field-group">
            <div class="field-label">品牌</div>
            <select class="input" data-material-field="brand" id="materialBrandSelect" onchange="updateMaterialModelOptions()">
              <option value="">-- 请选择品牌 --</option>
              ${brandOptions.map((b) => `<option value="${b}" ${source.brand === b ? "selected" : ""}>${b}</option>`).join("")}
            </select>
          </div>
          <div class="field-group">
            <div class="field-label">车型</div>
            <select class="input" data-material-field="model" id="materialModelSelect">
              <option value="">-- 请选择车型 --</option>
              ${modelOptions.map((m) => `<option value="${m.value}" ${source.model === m.value ? "selected" : ""}>${m.label}</option>`).join("")}
            </select>
          </div>
          <div class="field-group field-group-full">
            <div class="field-label">车身颜色配置（共 <span id="colorCountDisplay">${(source.colors || []).length}</span> 种）</div>
            <div id="materialColorList" style="display:flex; flex-direction:column; gap:10px; margin-top:8px;">
              ${(source.colors || []).map((c, idx) => `
                <div class="material-color-row" data-color-index="${idx}">
                  <input class="input" style="flex:1;" data-color-name value="${c.name}" placeholder="颜色名称" />
                  <input class="input" style="width:100px;" type="color" data-color-value value="${c.value}" />
                  <span style="display:inline-block;width:28px;height:28px;border-radius:50%;background:${c.value};border:1px solid rgba(255,255,255,0.2);"></span>
                  <button class="btn btn-danger" type="button" onclick="removeMaterialColor(${idx})" style="padding:4px 10px;font-size:12px;">删除</button>
                </div>
              `).join("")}
            </div>
            <div style="margin-top:10px; display:flex; gap:10px;">
              <input class="input" id="newColorName" style="flex:1;" placeholder="新颜色名称" />
              <input class="input" id="newColorValue" style="width:100px;" type="color" value="#0d0f12" />
              <button class="btn btn-secondary" type="button" onclick="addMaterialColor()">添加颜色</button>
            </div>
          </div>
        ` : `
          <div class="field-group">
            <div class="field-label">样式</div>
            <input class="input" data-material-field="style" value="${source.style}" />
          </div>
          <div class="field-group">
            <div class="field-label">颜色</div>
            <input class="input" data-material-field="color" value="${source.color}" />
          </div>
          <div class="field-group">
            <div class="field-label">尺寸</div>
            <input class="input" data-material-field="size" value="${source.size}" />
          </div>
        `}
        <div class="field-group field-group-full">
          <div class="field-label">关联商品</div>
          <select class="input" data-material-field="sku">
            <option value="">-- 请选择关联商品 --</option>
            ${products.map((p) => `<option value="${p.sku}" ${source.sku === p.sku ? "selected" : ""}>${p.name} (${p.sku})</option>`).join("")}
          </select>
        </div>
        <div class="field-group field-group-full">
          <div class="field-label">适配关系</div>
          <input class="input" data-material-field="compatibility" value="${source.compatibility}" />
        </div>
        <div class="field-group field-group-full">
          <div class="field-label">缩略图</div>
          <label class="input" style="display:flex;align-items:center;gap:10px;cursor:pointer;">
            <input type="file" accept="image/*" data-material-field="thumbnail" style="display:none;" onchange="this.parentElement.querySelector('span').textContent = this.files[0] ? this.files[0].name : '${source.thumbnail || '点击上传图片'}'" />
            <span>${source.thumbnail || '点击上传图片'}</span>
          </label>
        </div>
      </div>

      <div style="display:flex; gap:12px; margin-top:18px;">
        <button class="btn btn-primary" type="button" data-save-material data-material-page="${pageKey}" data-material-id="${source.id}" data-material-mode="${isEdit ? "edit" : "create"}">${isEdit ? "保存修改" : "确认新增"}</button>
        <button class="btn btn-secondary" type="button" data-close-modal>取消</button>
      </div>
    `);
  }

  function openRoleEditorModal(mode, row) {
    const source =
      row || {
        id: `ROLE-${String(system.roles.length + 1).padStart(3, "0")}`,
        name: "",
        scope: "平台 Web",
        members: 0,
        status: "停用",
        description: "",
        permissions: [],
      };

    openModal(`
      <div class="panel-header">
        <div>
          <span class="eyebrow">Role Editor</span>
          <h2 class="section-title">${mode === "edit" ? "编辑角色" : "新增角色"}</h2>
          <p class="section-subtitle">${source.id} / ${mode === "edit" ? source.name : "创建新的账号角色"}</p>
        </div>
      </div>
      <div class="form-grid">
        <div class="field-group">
          <div class="field-label">角色编号</div>
          <input class="input" data-role-field="id" value="${source.id}" ${mode === "edit" ? "readonly" : ""} />
        </div>
        <div class="field-group">
          <div class="field-label">角色名称</div>
          <input class="input" data-role-field="name" value="${source.name}" />
        </div>
        <div class="field-group field-group-full">
          <div class="field-label">访问范围</div>
          <input class="input" data-role-field="scope" value="${source.scope}" />
        </div>
        <div class="field-group">
          <div class="field-label">成员数</div>
          <input class="input" data-role-field="members" value="${source.members}" />
        </div>
        <div class="field-group">
          <div class="field-label">状态</div>
          <select class="select" data-role-field="status">
            ${["启用", "停用"].map((item) => `<option value="${item}" ${item === source.status ? "selected" : ""}>${item}</option>`).join("")}
          </select>
        </div>
        <div class="field-group field-group-full">
          <div class="field-label">角色说明</div>
          <textarea class="textarea" data-role-field="description">${source.description}</textarea>
        </div>
        <div class="field-group field-group-full">
          <div class="field-label">权限菜单</div>
          <textarea class="textarea" data-role-field="permissions">${(source.permissions || []).join("、")}</textarea>
        </div>
      </div>
      <div style="display:flex; gap:12px; margin-top:18px;">
        <button class="btn btn-primary" type="button" data-save-role data-mode="${mode}" data-role-id="${source.id}">${mode === "edit" ? "保存修改" : "确认新增"}</button>
        <button class="btn btn-secondary" type="button" data-close-modal>取消</button>
      </div>
    `);
  }

  function openConfigEditorModal(row) {
    openModal(`
      <div class="panel-header">
        <div>
          <span class="eyebrow">Config Editor</span>
          <h2 class="section-title">编辑系统配置</h2>
          <p class="section-subtitle">${row.key} / ${row.scope}</p>
        </div>
      </div>
      <div class="form-grid">
        <div class="field-group">
          <div class="field-label">配置项</div>
          <input class="input" data-config-field="key" value="${row.key}" readonly />
        </div>
        <div class="field-group">
          <div class="field-label">作用范围</div>
          <input class="input" data-config-field="scope" value="${row.scope}" />
        </div>
        <div class="field-group field-group-full">
          <div class="field-label">当前值</div>
          <input class="input" data-config-field="value" value="${row.value}" />
        </div>
        <div class="field-group field-group-full">
          <div class="field-label">配置说明</div>
          <textarea class="textarea" data-config-field="description">${row.description}</textarea>
        </div>
        <div class="field-group">
          <div class="field-label">修改人</div>
          <input class="input" data-config-field="editor" value="${row.editor}" />
        </div>
        <div class="field-group">
          <div class="field-label">状态</div>
          <select class="select" data-config-field="status">
            ${["生效中", "已停用"].map((item) => `<option value="${item}" ${item === row.status ? "selected" : ""}>${item}</option>`).join("")}
          </select>
        </div>
      </div>
      <div style="display:flex; gap:12px; margin-top:18px;">
        <button class="btn btn-primary" type="button" data-save-config data-config-key="${row.key}">保存配置</button>
        <button class="btn btn-secondary" type="button" data-close-modal>取消</button>
      </div>
    `);
  }

  function syncServiceRegionFields(changedField) {
    const provinceEl = modalCardEl.querySelector('[data-service-field="province"]');
    const cityEl = modalCardEl.querySelector('[data-service-field="city"]');
    const countyEl = modalCardEl.querySelector('[data-service-field="county"]');
    if (!provinceEl || !cityEl || !countyEl) return;

    const province = provinceEl.value;
    const cityMap = serviceRegionOptions.全国[province] || {};
    const cityList = Object.keys(cityMap);
    let city = cityEl.value;

    if (changedField === "province" || !cityList.includes(city)) {
      city = cityList[0] || "";
    }

    cityEl.innerHTML = cityList.map((item) => `<option value="${item}" ${item === city ? "selected" : ""}>${item}</option>`).join("");

    const countyList = cityMap[city] || [];
    let county = countyEl.value;
    if (changedField !== "city" && countyList.includes(county)) {
      countyEl.innerHTML = countyList.map((item) => `<option value="${item}" ${item === county ? "selected" : ""}>${item}</option>`).join("");
      return;
    }

    county = countyList[0] || "";
    countyEl.innerHTML = countyList.map((item) => `<option value="${item}" ${item === county ? "selected" : ""}>${item}</option>`).join("");
  }

  function deleteService(code) {
    const index = services.findIndex((item) => item.code === code);
    if (index === -1) return;
    const [removed] = services.splice(index, 1);
    state.selectedIndex = Math.max(0, state.selectedIndex - (state.selectedIndex >= services.length ? 1 : 0));
    openFeedbackModal("服务项目已删除", `${removed.name} 已从服务项目列表中移除。`);
  }

  function deleteCategory(name) {
    const target = categories.find((item) => item.name === name);
    if (!target) return;
    const removableNames = [name];
    if ((target.level || 0) === 0) {
      categories
        .filter((item) => item.parent === name)
        .forEach((item) => removableNames.push(item.name));
    }
    const removedLabel = removableNames.join("、");
    for (let i = categories.length - 1; i >= 0; i -= 1) {
      if (removableNames.includes(categories[i].name)) categories.splice(i, 1);
    }
    state.selectedIndex = Math.max(0, state.selectedIndex - (state.selectedIndex >= categories.length ? 1 : 0));
    openFeedbackModal("分类已删除", `${removedLabel} 已从商品分类列表中移除。`);
  }

  function persistInvoiceRow(row) {
    const clean = { ...row };
    delete clean.__invoiceSource;
    delete clean.rejectReason;
    const rows = readStorageRows(INVOICE_STORAGE_KEY);
    const index = rows.findIndex((item) => item.id === row.id);
    if (index >= 0) {
      rows[index] = clean;
    } else {
      rows.unshift(clean);
    }
    writeStorageRows(INVOICE_STORAGE_KEY, rows.slice(0, 50));
    row.__invoiceSource = "local";
    syncOrderInvoiceStatuses();
  }

  function pushInvoiceTimeline(row, text) {
    row.timeline = row.timeline || [];
    row.timeline.unshift(`${getNowStamp()} ${text}`);
  }

  function inferInvoiceAttachmentType(file) {
    if (!file) return "";
    if (file.type) return file.type;
    return /\.pdf$/i.test(file.name || "") ? "application/pdf" : "image/*";
  }

  function openInvoiceIssueModal(row) {
    openModal(`
      <div class="panel-header">
        <div>
          <span class="eyebrow">Invoice Delivery</span>
          <h2 class="section-title">上传并回传发票</h2>
          <p class="section-subtitle">${row.id} / ${row.orderId} / ${row.user}</p>
        </div>
      </div>
      <form class="provider-complete-form" data-invoice-issue-form style="margin-top:18px;">
        <div class="form-grid">
          <div class="field-group">
            <label class="field-label" for="invoice-delivery-method">回传方式</label>
            <select class="input" id="invoice-delivery-method" data-invoice-field="method">
              ${["电子发票", "邮箱回传", "站内回传", "二维码"].map((item) => `<option value="${item}" ${item === row.method ? "selected" : ""}>${item}</option>`).join("")}
            </select>
          </div>
          <div class="field-group">
            <label class="field-label" for="invoice-file">发票 PDF / 图片</label>
            <input class="input" id="invoice-file" data-invoice-field="file" type="file" accept="application/pdf,image/*" ${row.attachmentName ? "" : "required"} />
          </div>
          <div class="field-group field-group-full">
            <label class="field-label" for="invoice-note">回传备注</label>
            <textarea class="input" id="invoice-note" data-invoice-field="note" rows="3" placeholder="例如：已发送至用户邮箱，并同步站内消息。">${escapeHtml(row.deliveryNote || "")}</textarea>
          </div>
          <div class="field-group field-group-full">
            <span class="field-label">当前附件</span>
            <div class="muted">${row.attachmentName ? escapeHtml(row.attachmentName) : "未上传"}</div>
          </div>
        </div>
        <div class="admin-action-row">
          <button class="btn btn-secondary" type="button" data-close-modal>取消</button>
          <button class="btn btn-primary" type="submit">确认回传用户</button>
        </div>
      </form>
    `);

    const form = modalCardEl.querySelector("[data-invoice-issue-form]");
    form?.addEventListener("submit", (event) => {
      event.preventDefault();
      const file = modalCardEl.querySelector('[data-invoice-field="file"]')?.files?.[0];
      if (!file && !row.attachmentName) {
        openFeedbackModal("缺少发票附件", "请上传 PDF 或图片后再回传用户。");
        return;
      }
      row.method = modalCardEl.querySelector('[data-invoice-field="method"]')?.value || "电子发票";
      row.deliveryNote = modalCardEl.querySelector('[data-invoice-field="note"]')?.value.trim() || "";
      row.attachmentName = file?.name || row.attachmentName;
      row.attachmentType = inferInvoiceAttachmentType(file) || row.attachmentType;
      row.status = "已开具";
      row.deliveredAt = getNowStamp();
      pushInvoiceTimeline(row, `平台上传发票附件并通过${row.method}回传用户：${row.attachmentName}`);
      persistInvoiceRow(row);
      openFeedbackModal("发票已回传", `${row.id} 已更新为已开具，用户可在用户 App 下载发票。`);
    });
  }

  function openOrderFinanceModal(row) {
    const invoiceId = invoiceRows.find((item) => item.orderId === row.id)?.id || "-";
    openModal(`
      <div class="panel-header">
        <div>
          <span class="eyebrow">Order Finance</span>
          <h2 class="section-title">订单流水</h2>
          <p class="section-subtitle">${row.id} / ${row.user} / ${row.service}</p>
        </div>
      </div>

      <div class="finance-summary">
        <div class="finance-amount-card">
          <div class="finance-amount-label">用户实付</div>
          <div class="finance-amount-value">${escapeHtml(row.userPaidAmount || "¥ 0")}</div>
          <div class="finance-amount-meta">
            ${row.originalAmount ? `<span>原价 ${escapeHtml(row.originalAmount)}</span>` : ""}
            ${row.discountAmount ? `<span>优惠 ${escapeHtml(row.discountAmount)}</span>` : ""}
          </div>
        </div>
        <div class="finance-status-grid">
          <div class="finance-status-item">
            <span class="finance-status-label">支付状态</span>
            ${formatTag(row.paymentStatus)}
          </div>
          <div class="finance-status-item">
            <span class="finance-status-label">到账状态</span>
            ${formatTag(row.receiptStatus)}
          </div>
          <div class="finance-status-item">
            <span class="finance-status-label">发票状态</span>
            ${formatTag(row.invoiceStatus)}
          </div>
        </div>
      </div>

      <div class="finance-kv-section">
        <div class="finance-kv-col">
          <div class="finance-kv-title">支付信息</div>
          <div class="kv-list">
            <div class="kv-row"><span class="muted">支付方式</span><strong>${escapeHtml(row.paymentMethod || "-")}</strong></div>
            <div class="kv-row"><span class="muted">支付流水号</span><strong>${escapeHtml(row.transactionNo || "-")}</strong></div>
            <div class="kv-row"><span class="muted">发票编号</span><strong>${escapeHtml(invoiceId)}</strong></div>
          </div>
        </div>
        <div class="finance-kv-col">
          <div class="finance-kv-title">到账说明</div>
          <div class="finance-note">${escapeHtml(row.receiptStatus === "已到账" ? "渠道清分已入账，资金已到账。" : "等待支付渠道清分或财务入账确认。")}</div>
        </div>
      </div>

      <div class="table-card" style="margin-top:22px;">
        <div class="finance-kv-title" style="margin-bottom:12px;">资金流水明细</div>
        <table class="data-table">
          <thead>
            <tr><th>流水类型</th><th>金额</th><th>状态</th><th>编号/批次</th><th>说明</th></tr>
          </thead>
          <tbody>
            <tr>
              <td>用户支付</td>
              <td>${escapeHtml(row.userPaidAmount)}</td>
              <td>${formatTag(row.paymentStatus)}</td>
              <td>${escapeHtml(row.transactionNo)}</td>
              <td>${escapeHtml(row.paymentMethod || "-")}</td>
            </tr>
            <tr>
              <td>平台到账</td>
              <td>${escapeHtml(row.userPaidAmount)}</td>
              <td>${formatTag(row.receiptStatus)}</td>
              <td>${escapeHtml(row.transactionNo)}</td>
              <td>${escapeHtml(row.receiptStatus === "已到账" ? "渠道清分已入账" : "等待渠道清分或财务确认")}</td>
            </tr>
            <tr>
              <td>发票闭环</td>
              <td>${escapeHtml(row.userPaidAmount)}</td>
              <td>${formatTag(row.invoiceStatus)}</td>
              <td>${escapeHtml(invoiceId)}</td>
              <td>${escapeHtml(row.invoiceStatus === "未申请" ? "用户暂未申请发票" : "发票状态已同步发票管理")}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="timeline" style="margin-top:22px;">
        ${(row.financeTimeline || ["暂无财务轨迹"]).map((item) => `<div class="timeline-item">${escapeHtml(item)}</div>`).join("")}
      </div>

      <div style="display:flex; gap:12px; margin-top:22px;">
        <button class="btn btn-primary" type="button" data-close-modal>关闭</button>
      </div>
    `);
  }

  function openFeedbackModal(title, message) {
    openModal(`
      <div class="panel-header">
        <div>
          <span class="eyebrow">Audit Result</span>
          <h2 class="section-title">${title}</h2>
          <p class="section-subtitle">${message}</p>
        </div>
      </div>
      <div style="display:flex; gap:12px; margin-top:18px;">
        <button class="btn btn-primary" type="button" data-close-modal data-refresh-page>我知道了</button>
      </div>
    `);

    const refreshBtn = modalCardEl.querySelector("[data-refresh-page]");
    if (refreshBtn) {
      refreshBtn.addEventListener("click", () => {
        closeModal();
        renderSidebar();
        renderPage();
      });
    }
  }

  function openChatRecordModal(chat) {
    const order = orders.find((o) => o.id === chat.orderId);
    const bubbles = chat.messages?.map((message) => {
      const isUser = message.from === "user";
      const isProvider = message.from === "provider";
      const roleLabel = isUser ? "用户" : isProvider ? "服务商" : "平台";
      const alignClass = isUser ? "user-bubble" : isProvider ? "provider-bubble" : "platform-bubble";
      return `
        <div class="chat-bubble ${alignClass}">
          <div class="chat-bubble-meta">
            <span class="chat-role">${roleLabel}</span>
            <span class="chat-time">${message.time}</span>
          </div>
          <div class="chat-text">${message.text}</div>
        </div>
      `;
    }).join("") || '<div class="muted">暂无消息</div>';

    openModal(`
      <div class="panel-header">
        <div>
          <span class="eyebrow">Order Chat / ${chat.orderId}</span>
          <h2 class="section-title">${chat.title}</h2>
          <p class="section-subtitle">${chat.user} · ${chat.provider}</p>
        </div>
      </div>
      <div style="display:flex; gap:10px; flex-wrap:wrap; margin-bottom:18px;">
        ${formatTag(chat.orderId)}
        ${formatTag(chat.time)}
      </div>
      <div class="chat-record-panel">
        ${bubbles}
      </div>
      <div style="display:flex; gap:12px; margin-top:18px;">
        <button class="btn btn-primary" type="button" data-close-modal>关闭</button>
        ${order ? `<button class="btn btn-secondary" type="button" data-close-modal data-goto-order="${order.id}">跳转订单</button>` : ""}
      </div>
    `);

    modalCardEl.querySelectorAll("[data-goto-order]").forEach((btn) => {
      btn.addEventListener("click", () => {
        closeModal();
        state.activePage = "orderList";
        state.activeFilter = "全部";
        const orderRows = filterRows(defs.orderList.rows, defs.orderList.filterBy);
        const idx = orderRows.findIndex((o) => o.id === btn.dataset.gotoOrder);
        state.selectedIndex = idx >= 0 ? idx : 0;
        const parentGroup = menu.find((item) => item.children?.some((c) => c.id === "orderList"));
        if (parentGroup) state.expandedGroups[parentGroup.id] = true;
        renderSidebar();
        renderPage();
      });
    });
  }

  function filterRows(rows, filterBy) {
    let result = [...rows];

    if (filterBy && state.activeFilter !== "全部") {
      if (filterBy === "caseManage") {
        const auditFilters = ["待审核", "已通过", "已驳回"];
        const displayFilters = ["首页展示", "正常展示", "未展示"];
        if (auditFilters.includes(state.activeFilter)) {
          result = result.filter((row) => row.audit === state.activeFilter);
        } else if (displayFilters.includes(state.activeFilter)) {
          result = result.filter((row) => row.display === state.activeFilter);
        }
      } else if (filterBy === "afterSaleStatus") {
        result = result.filter((row) => row.afterSaleType);
        const statusMap = { "待审核": "待平台审核", "已通过": "已通过", "已驳回": "已驳回" };
        const mapped = statusMap[state.activeFilter];
        if (mapped) {
          result = result.filter((row) => row.afterSaleStatus === mapped);
        }
      } else if (filterBy === "forumManage") {
        if (["正常", "已删除"].includes(state.activeFilter)) {
          result = result.filter((row) => row.status === state.activeFilter);
        } else if (state.activeFilter === "置顶") {
          result = result.filter((row) => row.topStatus === "置顶");
        } else if (state.activeFilter === "加精") {
          result = result.filter((row) => row.featuredStatus === "加精");
        } else if (state.activeFilter === "已授权") {
          result = result.filter((row) => row.linkAuthStatus === "已授权");
        }
      } else if (filterBy === "punish" && state.activeFilter === "正常") {
        result = result.filter((row) => !row.punish && row.status === "正常");
      } else {
        result = result.filter((row) => row[filterBy] === state.activeFilter);
      }
    }

    if (state.search.trim()) {
      const keyword = state.search.trim().toLowerCase();
      result = result.filter((row) => Object.values(row).some((value) => String(value).toLowerCase().includes(keyword)));
    }

    if (state.selectedIndex >= result.length) {
      state.selectedIndex = 0;
    }

    return result;
  }

  function isStatus(value) {
    if (typeof value !== "string" || value.length > 10) return false;
    return [
      "正常营业",
      "已通过",
      "启用",
      "上架",
      "正常",
      "已完成",
      "已签收",
      "首页展示",
      "正常展示",
      "待审核",
      "待分配",
      "待发货",
      "待签收",
      "运输中",
      "待揽收",
      "已驳回",
      "异常签收",
      "缺货",
      "暂停接单",
      "停用",
      "生效中",
      "已停用",
      "施工中",
      "待支付",
      "置顶",
      "未置顶",
      "加精",
      "未加精",
      "已授权",
      "未授权",
    ].includes(value);
  }

  searchEl.addEventListener("input", (event) => {
    state.search = event.target.value;
    state.selectedIndex = 0;
    renderPage();
  });

  modalEl.addEventListener("click", (event) => {
    if (event.target === modalEl) closeModal();
  });

  modalEl.addEventListener("click", (event) => {
    const saveBtn = event.target.closest("[data-save-product]");
    if (!saveBtn) return;
    saveProduct(saveBtn.dataset.mode, saveBtn.dataset.sku);
  });

  renderSidebar();
  renderPage();
})();
