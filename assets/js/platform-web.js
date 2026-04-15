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
    consultationTemplates,
    orders,
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
        { id: "consultationConfig", label: "咨询方案配置" },
      ],
    },
    {
      id: "orders",
      label: "订单管理",
      children: [
        { id: "orderList", label: "订单列表" },
        { id: "orderAssign", label: "订单分配", badge: orders.filter((item) => item.status === "待分配").length },
      ],
    },
    {
      id: "logistics",
      label: "物流管理",
      children: [
        { id: "shipping", label: "发货管理" },
        { id: "signing", label: "签收管理" },
      ],
    },
    { id: "settlements", label: "结算管理" },
    {
      id: "cases",
      label: "案例管理",
      children: [
        { id: "caseAudit", label: "案例审核" },
        { id: "caseList", label: "案例列表" },
      ],
    },
    {
      id: "forum",
      label: "论坛管理",
      children: [
        { id: "forumBoards", label: "版面维护" },
        { id: "forumTopics", label: "话题维护" },
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
  ];

  const shortcuts = [
    { page: "providerAudit", title: "入驻审核", desc: "快速处理新提交的服务商资质与门店资料。", icon: "审" },
    { page: "orderAssign", title: "订单分配", desc: "进入待分配服务订单，优先完成派单与改派。", icon: "派" },
    { page: "caseAudit", title: "案例审核", desc: "集中审核门店上传的案例图片与车型说明。", icon: "案" },
    { page: "settlements", title: "结算管理", desc: "查看结算申请、审核状态与订单汇总信息。", icon: "结" },
  ];

  const state = {
    activePage: "home",
    activeFilter: "全部",
    selectedIndex: 0,
    search: "",
    expandedGroups: Object.fromEntries(menu.filter((item) => item.children).map((item) => [item.id, true])),
  };

  const forumBoards = [
    { id: "BOARD-01", name: "性能改装", summary: "围绕动力、制动、底盘等深度改装内容维护。", moderatorLimit: 3, status: "启用" },
    { id: "BOARD-02", name: "姿态玩家", summary: "围绕轮组、车身姿态和街道风格交流。", moderatorLimit: 2, status: "启用" },
    { id: "BOARD-03", name: "新能源升级", summary: "聚焦新能源车型外观、轮组和精品升级。", moderatorLimit: 2, status: "停用" },
  ];

  const forumTopics = [
    { id: "TOPIC-01", name: "轮毂数据避让", board: "性能改装", sort: 10, cover: "轮毂与制动细节图", status: "启用" },
    { id: "TOPIC-02", name: "城市姿态案例", board: "姿态玩家", sort: 20, cover: "街道夜景案例图", status: "启用" },
    { id: "TOPIC-03", name: "电车低风阻方案", board: "新能源升级", sort: 30, cover: "新能源轮组主图", status: "启用" },
  ];

  const forumModerators = [
    { id: "MOD-APPLY-01", account: "御驰 Performance Studio", accountType: "服务商账号", board: "性能改装", reason: "门店长期发布性能升级案例，希望维护板块内容秩序。", status: "待审核" },
    { id: "MOD-APPLY-02", account: "平台巡检", accountType: "平台账号", board: "姿态玩家", reason: "需要协助日常内容审核与活动维护。", status: "已通过" },
    { id: "MOD-APPLY-03", account: "擎速 Motorsport Lab", accountType: "服务商账号", board: "新能源升级", reason: "希望参与新能源案例话题运营与答疑。", status: "已驳回" },
  ];

  const tagType = (text) => {
    if (!text) return "neutral";
    if (["正常营业", "已通过", "启用", "上架", "正常", "已完成", "已签收", "生效中", "首页展示", "正常展示"].includes(text)) return "success";
    if (["待审核", "待分配", "待发货", "待签收", "运输中", "关注中", "需复核", "待揽收"].includes(text)) return "warning";
    if (["已驳回", "驳回修改", "异常签收", "缺货", "暂停接单", "停用", "已停用"].includes(text)) return "danger";
    if (["施工中", "待支付"].includes(text)) return "info";
    return "neutral";
  };

  const formatTag = (text) => `<span class="tag ${tagType(text)}">${text}</span>`;

  providers.forEach((item) => {
    item.contractNo = item.contractNo || `HT-2026-${item.id.slice(-4)}`;
    item.contractStatus = item.contractStatus || (item.auditStatus === "已通过" ? "履约中" : "待签约");
    item.contractStart = item.contractStart || "2026-01-01";
    item.contractEnd = item.contractEnd || "2026-12-31";
    item.locationProvince = item.locationProvince || `${item.city}${item.city.endsWith("市") ? "" : "市"}`;
    item.locationCity = item.locationCity || `${item.city}${item.city.endsWith("市") ? "" : "市"}`;
    item.locationCounty = item.locationCounty || `${item.district}${item.district.endsWith("区") ? "" : "区"}`;
    item.locationAddress = item.locationAddress || item.address;
  });

  orders.forEach((item) => {
    item.displayType = item.displayType || (item.type === "商品订单" ? "自提" : "改装服务");
    item.paymentMethod = item.paymentMethod || (item.payment === "待支付" ? "微信支付" : "支付宝");
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
    { id: "ST-240402-003", provider: "凌速 High Spec Garage", amount: "¥ 86,300", orders: 4, applyTime: "2026-04-02 09:08", status: "待审核" },
    { id: "ST-240401-005", provider: "擎速 Motorsport Lab", amount: "¥ 128,900", orders: 6, applyTime: "2026-04-01 16:18", status: "待审核" },
    { id: "ST-240331-004", provider: "德驭 Performance Studio", amount: "¥ 69,500", orders: 3, applyTime: "2026-03-31 13:30", status: "已通过" },
  ];

  settlements.splice(
    0,
    settlements.length,
    ...settlements.map((item, index) => {
      const fallback = normalizedSettlementDefaults[index] || normalizedSettlementDefaults[0];
      return {
        id: item.id || fallback.id,
        provider: item.provider || fallback.provider,
        amount: item.amount || fallback.amount,
        orders: item.orders || fallback.orders,
        applyTime: item.applyTime || fallback.applyTime,
        status: item.status || fallback.status,
        rejectReason: item.rejectReason || "",
        timeline:
          item.timeline ||
          [
            `申请提交：${item.applyTime || fallback.applyTime}`,
            `结算订单数：${item.orders || fallback.orders} 单`,
            `当前状态：${item.status || fallback.status}`,
          ],
      };
    })
  );

  const normalizedCaseDefaults = [
    { id: "CA-240402-007", title: "宝马 G20 曜夜姿态升级", provider: "德驭 Performance Studio", model: "宝马 G20 330i", style: "黑武士街道风", cost: "¥ 56,800", audit: "待审核", display: "未展示", content: "整车围绕曜夜黑化、轮毂姿态和车身细节统一做街道性能风升级，突出日常可用与视觉压迫感。", image: "case-bmw-g20-black-style.jpg" },
    { id: "CA-240401-011", title: "极氪 001 FR 赛道化轻改", provider: "Racing One Atelier", model: "极氪 001 FR", style: "赛道性能风", cost: "¥ 73,400", audit: "已通过", display: "首页展示", content: "以轻量化轮组、制动强化和姿态微调为核心，构建更偏赛道化的高性能展示案例。", image: "case-zeekr-001fr-track-kit.jpg" },
    { id: "CA-240330-022", title: "奔驰 C260L 豪华氛围内饰", provider: "曜黑 Auto Atelier", model: "奔驰 C260L", style: "豪华夜幕风", cost: "¥ 18,600", audit: "已驳回", display: "正常展示", content: "围绕车内氛围灯、内饰包覆和细节材质升级，营造夜幕豪华与舒适座舱体验。", image: "case-benz-c260l-luxury-interior.jpg" },
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
      description: "负责平台后台的审核、派单、结算、案例与系统配置管理。",
      permissions: ["首页总览", "服务商审核", "订单分配", "案例审核", "结算审核", "系统配置"],
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
      scope: "订单 / 审核 / 结算",
      status: "生效中",
      description: "用于订单流转、审核结果与结算通知的统一消息模板版本。",
      editor: "运营中心",
      updatedAt: "2026-04-02 17:45",
    },
    {
      key: "结算资料必填项",
      value: "施工照片 + 完工单",
      scope: "结算审核",
      status: "已停用",
      description: "服务商提交结算申请时，需要同时上传的凭证资料说明。",
      editor: "财务审核",
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

  function metric(label, value) {
    return { label, value };
  }

  function makeTableDef(config) {
    return { type: "table", ...config };
  }

  function simpleListDef(title, description, rows, keys, labels) {
    return { type: "simple", title, description, rows, keys, labels };
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
        { key: "city", label: "城市" },
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
          ["位置", `${row.locationProvince} / ${row.locationCity} / ${row.locationCounty}`],
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
        { key: "city", label: "城市" },
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
          ["地区", `${row.locationProvince} / ${row.locationCity} / ${row.locationCounty}`],
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
      description: "查看平台注册用户基础信息和订单情况。",
      filters: ["全部", "正常", "停用"],
      stats: [metric("平台注册用户", "8,602"), metric("停用用户", "21"), metric("本月活跃", "2,118"), metric("复购率", "41.7%")],
      columns: [
        { key: "id", label: "用户编号" },
        { key: "account", label: "账号" },
        { key: "name", label: "姓名" },
        { key: "city", label: "城市" },
        { key: "status", label: "状态", tag: true },
      ],
      rows: users,
      filterBy: "status",
      detail: (row) => ({
        title: `${row.name} / ${row.favorite}`,
        badges: [row.status],
        facts: [
          ["用户编号", row.id],
          ["账号", row.account],
          ["城市", row.city],
          ["绑定车辆", `${row.vehicles} 辆`],
          ["累计订单", `${row.orders} 单`],
          ["高频车型", row.favorite],
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
        facts: [
          ["SKU", row.sku],
          ["类目", row.category],
          ["品牌", row.brand],
          ["价格", row.price],
          ["库存", `${row.stock}`],
          ["适配车型", row.fitment],
          ["图片", row.image || "待补充商品图片"],
          ["说明", row.description || "商品说明待补充"],
        ],
        timeline: [
          "2026-03-15 创建商品",
          "2026-03-22 更新适配车型",
          "2026-04-01 同步库存与销售标签",
        ],
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
    consultationConfig: simpleListDef("咨询方案配置", "用户提交服务订单时的常用需求模板。", consultationTemplates, ["title", "fields", "uses", "status"], ["模板名称", "字段", "使用次数", "状态"]),
    orderList: makeTableDef({
      title: "订单列表",
      description: "统一查看商品订单与服务订单的全流程状态。",
      filters: ["全部", "待分配", "施工中", "待发货", "待签收", "已完成"],
      stats: [metric("今日订单", "128"), metric("服务订单占比", "76%"), metric("平均客单价", "¥ 18,620"), metric("异常订单", "4")],
      columns: [
        { key: "id", label: "订单号" },
        { key: "displayType", label: "订单类型" },
        { key: "user", label: "用户" },
        { key: "vehicle", label: "车辆" },
        { key: "paymentMethod", label: "支付方式" },
        { key: "status", label: "订单状态", tag: true },
      ],
      rows: orders,
      filterBy: "status",
      detail: (row) => ({
        title: row.id,
        badges: [row.status, row.payment, row.displayType],
        facts: [
          ["用户", row.user],
          ["车辆", row.vehicle],
          ["项目", row.service],
          ["订单类型", row.displayType],
          ["支付方式", row.paymentMethod],
          ["服务商", row.provider],
          ["预约时间", row.appointment],
          ["报价", row.quote],
        ],
        timeline: [`下单城市：${row.city}`, `意向门店：${row.intention}`, `当前进度：${row.progress}`],
        actions: "orderList",
      }),
    }),
    orderAssign: makeTableDef({
      title: "订单分配",
      description: "根据用户需求、意向服务商和区域情况进行分配与改派。",
      filters: ["全部", "待分配", "施工中", "已完成"],
      stats: [metric("待分配", "12"), metric("重分配单", "3"), metric("推荐命中率", "88%"), metric("派单平均用时", "28 min")],
      columns: [
        { key: "id", label: "订单号" },
        { key: "user", label: "用户" },
        { key: "service", label: "需求内容" },
        { key: "city", label: "城市" },
        { key: "status", label: "状态", tag: true },
      ],
      rows: orders,
      filterBy: "status",
      detail: (row) => ({
        title: `分配建议 / ${row.id}`,
        badges: [row.status, row.city, row.intention],
        facts: [
          ["用户", row.user],
          ["车辆", row.vehicle],
          ["项目", row.service],
          ["意向门店", row.intention],
          ["建议优先级", row.status === "待分配" ? "高" : "中"],
          ["建议门店", "德驭 / 擎速 / 凌速"],
        ],
        timeline: [
          "算法推荐：根据城市、工位、能力标签匹配",
          "人工建议：优先考虑高端性能项目经验",
          "拒单后策略：自动进入重派队列",
        ],
        actions: "orderAssign",
      }),
    }),
    shipping: simpleListDef("发货管理", "商品订单发货信息录入与物流单维护。", shipping, ["id", "orderId", "company", "number", "status"], ["发货单", "订单号", "物流公司", "物流单号", "状态"]),
    signing: simpleListDef("签收管理", "维护订单签收状态、异常备注与异常照片。", signing, ["orderId", "customer", "signTime", "status", "anomalyPhotoCount", "note"], ["订单号", "签收人", "签收时间", "状态", "异常照片", "备注"]),
    settlements: makeTableDef({
      title: "结算管理",
      description: "统一查看结算申请、审核状态与订单汇总信息。",
      filters: ["全部", "待审核", "已通过", "已驳回"],
      stats: [metric("待审核", "9"), metric("已通过", "18"), metric("本月结算金额", "¥ 386,700"), metric("已驳回", "2")],
      columns: [
        { key: "id", label: "申请单" },
        { key: "provider", label: "服务商" },
        { key: "orders", label: "订单数" },
        { key: "amount", label: "结算金额" },
        { key: "applyTime", label: "申请时间" },
        { key: "status", label: "状态", tag: true },
      ],
      rows: settlements,
      filterBy: "status",
      detail: (row) => ({
        title: row.id,
        badges: [row.status, row.provider],
        facts: [
          ["服务商", row.provider],
          ["订单数", `${row.orders} 单`],
          ["结算金额", row.amount],
          ["申请时间", row.applyTime],
          ...(row.status === "已驳回" ? [["驳回原因", row.rejectReason || "无"]] : []),
        ],
        timeline: row.timeline,
        actions: "settlements",
      }),
    }),
    caseAudit: makeTableDef({
      title: "案例审核",
      description: "审核服务商上传的案例内容与图片。",
      filters: ["全部", "待审核", "已通过", "已驳回"],
      stats: [metric("待审核案例", "8"), metric("已通过", "26"), metric("首页展示", "12"), metric("已驳回", "3")],
      columns: [
        { key: "id", label: "案例编号" },
        { key: "title", label: "案例标题" },
        { key: "provider", label: "服务商" },
        { key: "audit", label: "审核状态", tag: true },
        { key: "display", label: "展示状态", tag: true },
      ],
      rows: cases,
      filterBy: "audit",
      detail: (row) => ({
        title: row.title,
        badges: [row.audit, row.display, row.provider],
        facts: [
          ["案例编号", row.id],
          ["案例标题", row.title],
          ["服务商", row.provider],
          ["车型", row.model],
          ["风格", row.style],
          ["费用", row.cost],
          ["案例内容", row.content],
          ["图片", row.image],
          ...(row.audit === "已驳回" ? [["驳回原因", row.rejectReason || "无"]] : []),
        ],
        timeline: row.timeline,
        actions: "caseAudit",
      }),
    }),
    caseList: makeTableDef({
      title: "案例维护",
      description: "平台侧维护全平台案例数据，支持新增、编辑、删除和展示状态设置。",
      filters: ["全部", "首页展示", "正常展示", "未展示"],
      stats: [metric("案例总数", "68"), metric("首页展示", "12"), metric("待优化内容", "5"), metric("本周新增", "9")],
      columns: [
        { key: "id", label: "案例编号" },
        { key: "title", label: "案例标题" },
        { key: "provider", label: "服务商" },
        { key: "model", label: "车型" },
        { key: "style", label: "风格" },
        { key: "display", label: "展示状态", tag: true },
      ],
      rows: cases,
      filterBy: "display",
      detail: (row) => ({
        title: row.title,
        badges: [row.display, row.provider],
        facts: [
          ["案例编号", row.id],
          ["案例标题", row.title],
          ["服务商", row.provider],
          ["车型", row.model],
          ["风格", row.style],
          ["费用", row.cost],
          ["案例内容", row.content],
          ["图片", row.image],
        ],
        timeline: row.timeline,
        actions: "caseList",
      }),
    }),
    forumBoards: simpleListDef("版面维护", "维护论坛版面名称、说明、状态和版主人数上限。", forumBoards, ["name", "moderatorLimit", "status"], ["版面名称", "版主人数上限", "状态"]),
    forumTopics: simpleListDef("话题维护", "维护论坛话题名称、所属版面、排序和封面说明。", forumTopics, ["name", "board", "sort", "status"], ["话题名称", "所属版面", "排序", "状态"]),
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
      description: "按正常论坛信息流展示帖子内容，点击帖子查看详情与评论，并支持发后管理。",
      filters: ["全部", "正常", "已删除"],
      stats: [metric("帖子总数", "318"), metric("正常展示", "296"), metric("已删除", "22"), metric("今日新增", "18")],
      columns: [
        { key: "id", label: "帖子编号" },
        { key: "title", label: "标题" },
        { key: "author", label: "作者" },
        { key: "replies", label: "回复数" },
        { key: "likes", label: "点赞数" },
        { key: "time", label: "发布时间" },
        { key: "status", label: "状态", tag: true },
      ],
      rows: posts,
      filterBy: "status",
      detail: (row) => ({
        title: row.title,
        badges: [row.status, row.author],
        facts: [
          ["帖子编号", row.id],
          ["标题", row.title],
          ["作者", row.author],
          ["发布时间", row.time],
          ["回复数", `${row.replies}`],
          ["点赞数", `${row.likes}`],
          ["正文内容", row.content],
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

    if (def.type === "table") {
      if (state.activePage === "forumManage") {
        renderForumManagePage(def);
        return;
      }
      renderTablePage(def);
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
                        <span>${item.city}</span>
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

  function renderTablePage(def) {
    const rows = filterRows(def.rows, def.filterBy);
    const selected = rows[state.selectedIndex] || rows[0];
    const toolbarActions =
      state.activePage === "productList"
        ? `
          <button class="btn btn-secondary" type="button" data-product-toolbar="create">新增商品</button>
          <button class="btn btn-primary" type="button" data-product-toolbar="edit" ${selected ? "" : "disabled"}>编辑商品</button>
        `
        : state.activePage === "providerAccounts"
          ? `
            <button class="btn btn-secondary" type="button" data-provider-account-toolbar="create">新增账号</button>
          `
        : state.activePage === "vehicleModelManage"
          ? `
            <button class="btn btn-secondary" type="button" data-vehicle-model-toolbar="create">新增车型</button>
          `
        : state.activePage === "caseList"
          ? `
            <button class="btn btn-secondary" type="button" data-case-toolbar="create">新增案例</button>
            <button class="btn btn-primary" type="button" data-case-toolbar="edit" ${selected ? "" : "disabled"}>编辑案例</button>
            <button class="btn btn-danger" type="button" data-case-toolbar="delete" ${selected ? "" : "disabled"}>删除案例</button>
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
      <section class="table-layout" style="margin-top:22px;">
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
              <tr>${def.columns.map((col) => `<th>${col.label}</th>`).join("")}</tr>
            </thead>
            <tbody>
              ${
                rows.length
                  ? rows
                      .map(
                        (row, index) => `
                          <tr data-row-index="${index}" style="cursor:pointer; ${index === state.selectedIndex ? "background:rgba(255,255,255,0.04);" : ""}">
                            ${def.columns.map((col) => `<td>${col.tag ? formatTag(row[col.key]) : row[col.key]}</td>`).join("")}
                          </tr>
                        `
                      )
                      .join("")
                  : `<tr><td colspan="${def.columns.length}" class="muted">没有符合当前筛选条件的数据。</td></tr>`
              }
            </tbody>
          </table>
        </article>
        <aside class="panel drawer-card">
          ${selected ? renderDrawer(def.detail(selected)) : `<div class="page-heading"><h1 style="font-size:24px;">暂无详情</h1></div>`}
        </aside>
      </section>
    `;

    bindTableEvents(def, selected);
  }

  function renderForumManagePage(def) {
    const rows = filterRows(def.rows, def.filterBy);
    const selected = rows[state.selectedIndex] || rows[0];
    const detail = selected ? def.detail(selected) : null;

    contentEl.innerHTML = `
      <section class="page-heading">
        <h1>${def.title}</h1>
      </section>
      <section class="table-layout forum-layout" style="margin-top:22px;">
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
                              </div>
                            </div>
                            ${formatTag(row.status)}
                          </div>
                          <p class="forum-snippet">${row.content}</p>
                          <div class="forum-thread-foot">
                            <span class="pill">${row.id}</span>
                            <span class="pill">${row.author}</span>
                          </div>
                        </article>
                      `
                    )
                    .join("")
                : `<div class="page-heading"><h1 style="font-size:24px;">暂无内容</h1></div>`
            }
          </div>
        </article>
        <aside class="panel drawer-card">
          ${detail ? renderForumDetail(detail) : `<div class="page-heading"><h1 style="font-size:24px;">暂无详情</h1></div>`}
        </aside>
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
        : state.activePage === "forumTopics"
          ? `
            <button class="btn btn-secondary" type="button" data-forum-topic-toolbar="create">新增</button>
            <button class="btn btn-primary" type="button" data-forum-topic-toolbar="edit" ${selected ? "" : "disabled"}>编辑</button>
            <button class="btn btn-danger" type="button" data-forum-topic-toolbar="delete" ${selected ? "" : "disabled"}>删除</button>
          `
        : state.activePage === "serviceList"
          ? `
            <button class="btn btn-secondary" type="button" data-service-toolbar="create">新增</button>
            <button class="btn btn-primary" type="button" data-service-toolbar="edit" ${selected ? "" : "disabled"}>编辑</button>
            <button class="btn btn-danger" type="button" data-service-toolbar="delete" ${selected ? "" : "disabled"}>删除</button>
          `
          : state.activePage === "consultationConfig"
            ? `
              <button class="btn btn-secondary" type="button" data-template-toolbar="create">新增</button>
              <button class="btn btn-primary" type="button" data-template-toolbar="edit" ${selected ? "" : "disabled"}>编辑</button>
            <button class="btn btn-danger" type="button" data-template-toolbar="delete" ${selected ? "" : "disabled"}>删除</button>
          `
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
        <div style="display:flex; gap:10px; flex-wrap:wrap;">
          ${
            state.activePage === "providerAudit"
              ? `
                <button class="btn btn-secondary" type="button" data-provider-action="materials">查看详情</button>
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
                    <button class="btn btn-primary" type="button" data-user-list-action="toggle">${detail.badges.includes("停用") ? "切换为正常" : "切换为停用"}</button>
                    <button class="btn btn-secondary" type="button" data-user-list-action="materials">查看详情</button>
                  `
              : detail.actions === "userVehicles"
                  ? `
                    <button class="btn btn-secondary" type="button" data-vehicle-action="materials">查看详情</button>
                  `
                : detail.actions === "orderList"
                  ? `
                    <button class="btn btn-secondary" type="button" data-order-action="detail">查看详情</button>
                  `
                : detail.actions === "orderAssign"
                  ? `
                    <button class="btn btn-primary" type="button" data-assign-action="auto">一键派单</button>
                  `
                : detail.actions === "settlements"
                  ? `
                    <button class="btn btn-primary" type="button" data-settlement-action="audit">审核</button>
                  `
                : detail.actions === "caseAudit"
                  ? `
                    <button class="btn btn-primary" type="button" data-case-action="audit">审核</button>
                  `
                : detail.actions === "caseList"
                  ? `
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
        if (state.activePage === "forumManage") {
          renderForumManagePage(def);
          return;
        }
        renderTablePage(def);
      });
    });

    if (state.activePage === "productList") {
      contentEl.querySelectorAll("[data-product-toolbar]").forEach((button) => {
        button.addEventListener("click", () => {
          if (button.dataset.productToolbar === "create") {
            openProductEditorModal("create");
            return;
          }
          if (selected) openProductEditorModal("edit", selected);
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

    if (state.activePage === "caseList") {
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
          openOrderProcessModal(selected);
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

    if (state.activePage === "caseAudit" && selected) {
      contentEl.querySelectorAll("[data-case-action]").forEach((button) => {
        button.addEventListener("click", () => {
          openCaseAuditModal(selected);
        });
      });
    }

    if (state.activePage === "caseList" && selected) {
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
        state.selectedIndex = Number(row.dataset.simpleRowIndex);
        renderSimplePage(def);
      });
    });

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

    if (state.activePage === "forumTopics") {
      contentEl.querySelectorAll("[data-forum-topic-toolbar]").forEach((button) => {
        button.addEventListener("click", () => {
          const action = button.dataset.forumTopicToolbar;
          if (action === "create") {
            openForumTopicEditorModal("create");
            return;
          }
          if (!selected) return;
          if (action === "edit") {
            openForumTopicEditorModal("edit", selected);
            return;
          }
          openForumTopicDeleteModal(selected);
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

    if (state.activePage === "consultationConfig") {
      contentEl.querySelectorAll("[data-template-toolbar]").forEach((button) => {
        button.addEventListener("click", () => {
          const action = button.dataset.templateToolbar;
          if (action === "create") {
            openTemplateEditorModal("create");
            return;
          }
          if (!selected) return;
          if (action === "edit") {
            openTemplateEditorModal("edit", selected);
            return;
          }
          openTemplateDeleteModal(selected);
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

    const deleteForumBoardBtn = modalCardEl.querySelector("[data-delete-forum-board]");
    if (deleteForumBoardBtn) {
      deleteForumBoardBtn.addEventListener("click", () => {
        deleteForumBoard(deleteForumBoardBtn.dataset.id);
      });
    }

    const saveForumTopicBtn = modalCardEl.querySelector("[data-save-forum-topic]");
    if (saveForumTopicBtn) {
      saveForumTopicBtn.addEventListener("click", () => {
        saveForumTopic(saveForumTopicBtn.dataset.mode, saveForumTopicBtn.dataset.id);
      });
    }

    const deleteForumTopicBtn = modalCardEl.querySelector("[data-delete-forum-topic]");
    if (deleteForumTopicBtn) {
      deleteForumTopicBtn.addEventListener("click", () => {
        deleteForumTopic(deleteForumTopicBtn.dataset.id);
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

    const saveTemplateBtn = modalCardEl.querySelector("[data-save-template]");
    if (saveTemplateBtn) {
      saveTemplateBtn.addEventListener("click", () => {
        saveTemplate(saveTemplateBtn.dataset.mode, saveTemplateBtn.dataset.title);
      });
    }

    const deleteTemplateBtn = modalCardEl.querySelector("[data-delete-template]");
    if (deleteTemplateBtn) {
      deleteTemplateBtn.addEventListener("click", () => {
        deleteTemplate(deleteTemplateBtn.dataset.title);
      });
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
          if (mode === "assign") target.progress = "等待重新派单";
          if (mode === "progress") target.progress = target.status === "待发货" ? "待签收" : "施工中";
          if (mode === "close") target.progress = "已完成";
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
          order.progress = "已派单";
          order.status = "施工中";
          openFeedbackModal("派单成功", `${order.id} 已分配给 ${target.name}，当前状态已更新为施工中。`);
        }
      });
    });

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
          <p class="section-subtitle">${row.name} 路 ${row.city} 路 ${row.specialties}</p>
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
              <strong>${[row.locationProvince, row.locationCity, row.locationCounty].filter(Boolean).join(" / ") || `${row.city} / ${row.district}`}</strong>
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
              ["当前营收", row.currentRevenue || "-"],
              ["未结算金额", row.unsettledAmount || "-"],
              ["已结算金额", row.settledAmount || "-"],
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
      .filter((item) => item.status === "正常营业")
      .slice(0, 4);
    openModal(`
      <div class="panel-header">
        <div>
          <span class="eyebrow">Assignment Center</span>
          <h2 class="section-title">一键派单</h2>
          <p class="section-subtitle">${row.id} 路 ${row.user} 路 ${row.service}</p>
        </div>
      </div>
      <div class="doc-list">
        ${recommendations
          .map(
            (item, index) => `
              <div class="doc-item">
                <strong>#${index + 1} ${item.name}</strong>
                <div class="muted">${item.city} 路 ${item.specialties}${row.intention === item.name ? " 路 客户意向门店" : ""}</div>
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
      </div>
      <div style="display:flex; gap:12px; margin-top:18px;">
        <button class="btn btn-primary" type="button" data-close-modal>关闭</button>
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
    const source = row || { id: `BOARD-${Date.now().toString().slice(-4)}`, name: "", summary: "", moderatorLimit: 2, status: "启用" };
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
        <div class="field-group">
          <div class="field-label">版主人数上限</div>
          <input class="input" data-forum-board-field="moderatorLimit" value="${source.moderatorLimit}" />
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

  function openForumTopicEditorModal(mode, row) {
    const isEdit = mode === "edit";
    const source = row || { id: `TOPIC-${Date.now().toString().slice(-4)}`, name: "", board: forumBoards[0]?.name || "", sort: forumTopics.length + 1, cover: "", status: "启用" };
    openModal(`
      <div class="panel-header">
        <div>
          <span class="eyebrow">Forum Topic</span>
          <h2 class="section-title">${isEdit ? "编辑话题" : "新增话题"}</h2>
          <p class="section-subtitle">${source.id} / ${isEdit ? source.name : "创建新的论坛话题"}</p>
        </div>
      </div>
      <div class="form-grid">
        <div class="field-group">
          <div class="field-label">话题名称</div>
          <input class="input" data-forum-topic-field="name" value="${source.name}" />
        </div>
        <div class="field-group">
          <div class="field-label">所属版面</div>
          <select class="select" data-forum-topic-field="board">
            ${forumBoards.map((item) => `<option value="${item.name}" ${item.name === source.board ? "selected" : ""}>${item.name}</option>`).join("")}
          </select>
        </div>
        <div class="field-group">
          <div class="field-label">排序</div>
          <input class="input" data-forum-topic-field="sort" value="${source.sort}" />
        </div>
        <div class="field-group field-group-full">
          <div class="field-label">封面说明</div>
          <input class="input" data-forum-topic-field="cover" value="${source.cover || ""}" />
        </div>
        <div class="field-group">
          <div class="field-label">状态</div>
          <select class="select" data-forum-topic-field="status">
            ${["启用", "停用"].map((item) => `<option value="${item}" ${item === source.status ? "selected" : ""}>${item}</option>`).join("")}
          </select>
        </div>
      </div>
      <div style="display:flex; gap:12px; margin-top:18px;">
        <button class="btn btn-primary" type="button" data-save-forum-topic data-mode="${mode}" data-id="${source.id}">${isEdit ? "保存修改" : "确认新增"}</button>
        <button class="btn btn-secondary" type="button" data-close-modal>取消</button>
      </div>
    `);
  }

  function openForumTopicDeleteModal(row) {
    openModal(`
      <div class="panel-header">
        <div>
          <span class="eyebrow">Forum Topic</span>
          <h2 class="section-title">删除话题</h2>
          <p class="section-subtitle">确认删除话题“${row.name}”吗？</p>
        </div>
      </div>
      <div style="display:flex; gap:12px; margin-top:18px;">
        <button class="btn btn-danger" type="button" data-delete-forum-topic data-id="${row.id}">确认删除</button>
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

  function openTemplateEditorModal(mode, row) {
    const isEdit = mode === "edit";
    openModal(`
      <div class="panel-header">
        <div>
          <span class="eyebrow">Consultation Template</span>
          <h2 class="section-title">${isEdit ? "编辑咨询方案" : "新增咨询方案"}</h2>
          <p class="section-subtitle">${isEdit ? `正在编辑 ${row.title}` : "创建新的咨询方案模板"}</p>
        </div>
      </div>
      <div class="form-grid">
        <div class="field-group">模板名称</div>
          <input class="input" data-template-field="title" placeholder="请输入模板名称" value="${isEdit ? row.title : ""}" />
        </div>
        <div class="field-group field-group-full">
          <div class="field-label">字段配置</div>
          <textarea class="textarea" data-template-field="fields" placeholder="请输入模板字段，使用 / 分隔">${isEdit ? row.fields : ""}</textarea>
        </div>
        <div class="field-group">状态</div>
          <select class="select" data-template-field="status">
            <option value="启用" ${(isEdit ? row.status : "启用") === "启用" ? "selected" : ""}>启用</option>
            <option value="停用" ${(isEdit ? row.status : "启用") === "停用" ? "selected" : ""}>停用</option>
          </select>
        </div>
      </div>
      <div style="display:flex; gap:12px; margin-top:18px;">
        <button class="btn btn-primary" type="button" data-save-template data-mode="${mode}" ${isEdit ? `data-title="${row.title}"` : ""}>${isEdit ? "保存修改" : "确认新增"}</button>
        <button class="btn btn-secondary" type="button" data-close-modal>取消</button>
      </div>
    `);
  }

  function openTemplateDeleteModal(row) {
    openModal(`
      <div class="panel-header">
        <div>
          <span class="eyebrow">Template Delete</span>
          <h2 class="section-title">删除咨询方案</h2>
          <p class="section-subtitle">确认删除咨询方案“${row.title}”吗？此操作仅影响当前 mock 展示数据。</p>
        </div>
      </div>
      <div style="display:flex; gap:12px; margin-top:18px;">
        <button class="btn btn-danger" type="button" data-delete-template data-title="${row.title}">确认删除</button>
        <button class="btn btn-secondary" type="button" data-close-modal>取消</button>
      </div>
    `);
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
    openGenericDetailModal({
      title: row.orderId,
      badges: [row.status],
      facts: [
        ["签收人", row.customer],
        ["签收时间", row.signTime],
        ["异常照片", row.anomalyPhotos?.length ? row.anomalyPhotos.join(" / ") : "无"],
        ["备注", row.note],
      ],
      timeline: [
        `订单号：${row.orderId}`,
        `签收状态：${row.status}`,
        `异常照片：${row.anomalyPhotos?.length ? `${row.anomalyPhotos.length} 张` : "无"}`,
        `签收备注：${row.note}`,
      ],
    });
  }

  function openProductEditorModal(mode, row) {
    const isEdit = mode === "edit";
    const selectedFitments = parseProductFitmentValue(isEdit ? row.fitment : "宝马-3系-330i / 奔驰-C级-C260L");
    const categoryOptions = categories
      .map((item) => {
        const indent = item.level === 1 ? "└ " : "";
        const selected = (isEdit ? row.category : "锻造轮毂") === item.name ? "selected" : "";
        return `<option value="${item.name}" ${selected}>${indent}${item.name}</option>`;
      })
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
          <div class="field-label">SKU</div>
          <input class="input" data-product-field="sku" placeholder="请输入 SKU" value="${isEdit ? row.sku : "PR-9901"}" />
        </div>
        <div class="field-group">
          <div class="field-label">商品名称</div>
          <input class="input" data-product-field="name" placeholder="请输入商品名称" value="${isEdit ? row.name : "OZ 锻造轮毂 20寸"}" />
        </div>
        <div class="field-group">
          <div class="field-label">品牌</div>
          <input class="input" data-product-field="brand" placeholder="请输入品牌" value="${isEdit ? row.brand : "OZ Racing"}" />
        </div>
        <div class="field-group">
          <div class="field-label">类目</div>
          <select class="select" data-product-field="category">${categoryOptions}</select>
        </div>
        <div class="field-group">
          <div class="field-label">价格</div>
          <input class="input" data-product-field="price" placeholder="请输入价格" value="${isEdit ? row.price : "¥ 22,800"}" />
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
          <input class="input" data-product-field="image" placeholder="请输入图片名称或路径" value="${isEdit ? row.image || "" : "product-main-image.jpg"}" />
        </div>
        <div class="field-group field-group-full">
          <div class="field-label">说明</div>
          <textarea class="textarea" data-product-field="description" placeholder="请输入商品说明">${isEdit ? row.description || "" : "主图突出商品核心卖点，补充细节图、安装位说明与实车效果展示。"}</textarea>
        </div>
      </div>
      <div style="display:flex; gap:12px; margin-top:18px;">
        <button class="btn btn-primary" type="button" data-save-product data-mode="${mode}" ${isEdit ? `data-sku="${row.sku}"` : ""}>${isEdit ? "保存修改" : "确认新增"}</button>
        <button class="btn btn-secondary" type="button" data-close-modal>取消</button>
      </div>
    `);
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
      openFeedbackModal("审核已通过", `${target.name} 已进入正式服务商列表，可参与订单分配。`);
      return;
    }

    if (decision === "supplement") {
      target.auditStatus = "待审核";
      target.timeline.unshift("2026-04-02 15:20 平台要求补充：夜景门头照与品牌授权资质");
      openFeedbackModal("已要求补充资料", `${target.name} 保持待审核状态，并已记录补充要求。`);
      return;
    }

    target.auditStatus = "已驳回";
    target.timeline.unshift("2026-04-02 15:20 平台驳回申请：资料不完整，请修正后重提");
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
    openFeedbackModal("申请已驳回", `${target.name} 已记录驳回理由，并更新为已驳回状态。`);
  }

  function submitSettlementAudit(settlementId, decision, reason = "") {
    const target = settlements.find((item) => item.id === settlementId);
    if (!target) return;

    if (decision === "reject" && !reason) {
      openFeedbackModal("请填写驳回原因", "驳回结算申请前需要填写明确原因，方便服务商后续修正。");
      return;
    }

    if (decision === "approve") {
      target.status = "已通过";
      target.rejectReason = "";
      target.timeline.unshift("2026-04-03 14:20 平台审核通过，已进入结算执行流程");
      openFeedbackModal("结算审核已通过", `${target.id} 已审核通过。`);
      return;
    }

    target.status = "已驳回";
    target.rejectReason = reason;
    target.timeline.unshift(`2026-04-03 14:20 平台驳回结算申请。驳回原因：${reason}`);
    openFeedbackModal("结算申请已驳回", `${target.id} 已记录驳回原因。`);
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
      openFeedbackModal("案例审核已通过", `${target.id} 已审核通过。`);
      return;
    }

    target.audit = "已驳回";
    target.display = "未展示";
    target.rejectReason = reason;
    target.timeline.unshift(`2026-04-03 15:10 平台驳回案例。驳回原因：${reason}`);
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
      cost: getValue("cost"),
      image: getValue("image"),
      content: getValue("content"),
      display: getValue("display"),
      audit: "待审核",
      timeline: [`2026-04-03 16:20 平台${mode === "edit" ? "更新" : "新增"}案例：${getValue("title")}`],
    };
    if (!payload.title || !payload.provider || !payload.model || !payload.image || !payload.content) {
      openFeedbackModal("信息不完整", "请填写案例标题、服务商、车型、封面图和案例说明。");
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

  function submitModeratorApply(id, decision) {
    const target = forumModerators.find((item) => item.id === id);
    if (!target) return;
    target.status = decision === "approve" ? "已通过" : "已驳回";
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
      openFeedbackModal("帖子已删除", `${target.id} 已删除并记录操作原因。`);
      return;
    }

    target.status = "正常";
    target.deleteReason = "";
    target.timeline.unshift("2026-04-03 16:42 平台恢复帖子显示");
    openFeedbackModal("帖子已恢复", `${target.id} 已恢复正常显示。`);
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
      openFeedbackModal("评论已删除", `${target.id} 已删除并记录操作原因。`);
      return;
    }

    target.status = "正常";
    target.deleteReason = "";
    target.timeline.unshift("2026-04-03 16:47 平台恢复评论显示");
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

    const payload = {
      id: materialId,
      name: getValue("name"),
      compatibility: getValue("compatibility"),
      thumbnail: getValue("thumbnail"),
      updatedAt: "2026-04-03 17:15",
      status: "停用",
    };

    if (!payload.name || !payload.compatibility) {
      openFeedbackModal("信息不完整", "请填写素材名称和适配关系后再提交。");
      return;
    }

    if (pageKey === "vehicleMaterials") {
      Object.assign(payload, {
        brand: getValue("brand"),
        model: getValue("model"),
        colorCount: Number(getValue("colorCount")) || 1,
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

  function saveProduct(mode, sourceSku) {
    const getValue = (field) => {
      const el = modalCardEl.querySelector(`[data-product-field="${field}"]`);
      return el ? el.value.trim() : "";
    };
    const fitment = getProductFitmentSelection(modalCardEl.querySelector("[data-product-fitment-picker]")).join(" / ");

    const payload = {
      sku: getValue("sku"),
      name: getValue("name"),
      brand: getValue("brand"),
      category: getValue("category"),
      price: getValue("price"),
      stock: Number(getValue("stock")) || 0,
      fitment,
      image: getValue("image"),
      description: getValue("description"),
      status: getValue("status"),
    };

    if (!payload.sku || !payload.name || !payload.brand || !payload.fitment) {
      openFeedbackModal("信息不完整", "请至少填写 SKU、商品名称、品牌，并选择一个适配车型后再提交。");
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
      moderatorLimit: Number(getValue("moderatorLimit")) || 0,
      status: getValue("status"),
    };
    if (!payload.name || !payload.summary || !payload.moderatorLimit) {
      openFeedbackModal("信息不完整", "请填写版面名称、版面说明和版主人数上限。");
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

  function saveForumTopic(mode, sourceId) {
    const getValue = (field) => modalCardEl.querySelector(`[data-forum-topic-field="${field}"]`)?.value.trim() || "";
    const payload = {
      id: sourceId,
      name: getValue("name"),
      board: getValue("board"),
      sort: Number(getValue("sort")) || 0,
      cover: getValue("cover"),
      status: getValue("status"),
    };
    if (!payload.name || !payload.board || !payload.sort) {
      openFeedbackModal("信息不完整", "请填写话题名称、所属版面和排序。");
      return;
    }
    if (mode === "edit") {
      const target = forumTopics.find((item) => item.id === sourceId);
      if (!target) return;
      Object.assign(target, payload);
      openFeedbackModal("话题已更新", `${payload.name} 的话题信息已保存。`);
      return;
    }
    forumTopics.unshift(payload);
    state.selectedIndex = 0;
    openFeedbackModal("话题已新增", `${payload.name} 已加入话题维护列表。`);
  }

  function deleteForumTopic(id) {
    const index = forumTopics.findIndex((item) => item.id === id);
    if (index === -1) return;
    const [removed] = forumTopics.splice(index, 1);
    openFeedbackModal("话题已删除", `${removed.name} 已从话题维护中移除。`);
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

  function openSettlementAuditModal(row) {
    openModal(`
      <div class="panel-header">
        <div>
          <span class="eyebrow">Settlement Audit</span>
          <h2 class="section-title">审核结算申请</h2>
          <p class="section-subtitle">${row.id} / ${row.provider} / ${row.amount}</p>
        </div>
      </div>
      <div class="action-grid">
        <button class="action-tile" type="button" data-settlement-decision="approve" data-settlement-id="${row.id}">
          <strong>审核通过</strong>
          <p>确认结算订单与金额无误，进入通过状态并记录审核轨迹。</p>
        </button>
        <button class="action-tile" type="button" data-settlement-decision="reject" data-settlement-id="${row.id}">
          <strong>审核驳回</strong>
          <p>驳回本次结算申请，并填写明确的驳回原因供服务商修正。</p>
        </button>
      </div>
      <div style="display:flex; gap:12px; margin-top:18px;">
        <button class="btn btn-secondary" type="button" data-close-modal>取消</button>
      </div>
    `);
  }

  function openSettlementRejectModal(settlementId) {
    const target = settlements.find((item) => item.id === settlementId);
    if (!target) return;
    openModal(`
      <div class="panel-header">
        <div>
          <span class="eyebrow">Settlement Reject</span>
          <h2 class="section-title">驳回结算申请</h2>
          <p class="section-subtitle">${target.id} / ${target.provider} / 请填写驳回原因</p>
        </div>
      </div>
      <div class="field-group field-group-full">
        <div class="field-label">驳回原因</div>
        <textarea class="textarea" data-settlement-reject-reason>结算订单与完工资料不一致，请补充完整凭证后重新提交审核。</textarea>
      </div>
      <div style="display:flex; gap:12px; margin-top:18px;">
        <button class="btn btn-primary" type="button" data-submit-settlement-reject data-settlement-id="${target.id}">确认驳回</button>
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

  function openCaseEditorModal(mode, row) {
    const isEdit = mode === "edit";
    const source = row || {
      id: `CA-${Date.now().toString().slice(-6)}`,
      title: "",
      provider: providers[0]?.name || "御驰 Performance Studio",
      model: "宝马 G20 330i",
      style: "黑武士街道风",
      cost: "¥ 26,800",
      image: "case-new-cover.jpg",
      content: "",
      display: "正常展示",
    };
    openModal(`
      <div class="panel-header">
        <div>
          <span class="eyebrow">Case Editor</span>
          <h2 class="section-title">${isEdit ? "编辑案例" : "新增案例"}</h2>
          <p class="section-subtitle">${source.id} / ${isEdit ? source.title : "创建新的平台案例"}</p>
        </div>
      </div>
      <div class="form-grid">
        <div class="field-group">
          <div class="field-label">案例标题</div>
          <input class="input" data-case-field="title" value="${source.title}" />
        </div>
        <div class="field-group">
          <div class="field-label">服务商</div>
          <input class="input" data-case-field="provider" value="${source.provider}" />
        </div>
        <div class="field-group">
          <div class="field-label">车型</div>
          <input class="input" data-case-field="model" value="${source.model}" />
        </div>
        <div class="field-group">
          <div class="field-label">风格</div>
          <input class="input" data-case-field="style" value="${source.style}" />
        </div>
        <div class="field-group">
          <div class="field-label">费用</div>
          <input class="input" data-case-field="cost" value="${source.cost}" />
        </div>
        <div class="field-group">
          <div class="field-label">展示状态</div>
          <select class="select" data-case-field="display">
            ${["首页展示", "正常展示", "未展示"].map((item) => `<option value="${item}" ${item === source.display ? "selected" : ""}>${item}</option>`).join("")}
          </select>
        </div>
        <div class="field-group field-group-full">
          <div class="field-label">封面图</div>
          <input class="input" data-case-field="image" value="${source.image || ""}" />
        </div>
        <div class="field-group field-group-full">
          <div class="field-label">案例说明</div>
          <textarea class="textarea" data-case-field="content">${source.content || ""}</textarea>
        </div>
      </div>
      <div style="display:flex; gap:12px; margin-top:18px;">
        <button class="btn btn-primary" type="button" data-save-case data-mode="${mode}" data-case-id="${source.id}">${isEdit ? "保存修改" : "确认新增"}</button>
        <button class="btn btn-secondary" type="button" data-close-modal>取消</button>
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
          }
        : {
            id: `WM-${String(materials.wheels.length + 1).padStart(3, "0")}`,
            name: "",
            style: "",
            color: "",
            size: "19 寸",
            compatibility: "",
            thumbnail: "",
          }
    );
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
        <div class="field-group">
          <div class="field-label">${isVehicle ? "品牌" : "样式"}</div>
          <input class="input" data-material-field="${isVehicle ? "brand" : "style"}" value="${isVehicle ? source.brand : source.style}" />
        </div>
        <div class="field-group">
          <div class="field-label">${isVehicle ? "车型" : "颜色"}</div>
          <input class="input" data-material-field="${isVehicle ? "model" : "color"}" value="${isVehicle ? source.model : source.color}" />
        </div>
        <div class="field-group">
          <div class="field-label">${isVehicle ? "颜色数" : "尺寸"}</div>
          <input class="input" data-material-field="${isVehicle ? "colorCount" : "size"}" value="${isVehicle ? source.colorCount : source.size}" />
        </div>
        <div class="field-group field-group-full">
          <div class="field-label">适配关系</div>
          <input class="input" data-material-field="compatibility" value="${source.compatibility}" />
        </div>
        <div class="field-group field-group-full">
          <div class="field-label">缩略图</div>
          <input class="input" data-material-field="thumbnail" value="${source.thumbnail}" />
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

  function saveTemplate(mode, sourceTitle) {
    const getValue = (field) => {
      const el = modalCardEl.querySelector(`[data-template-field="${field}"]`);
      return el ? el.value.trim() : "";
    };

    const payload = {
      title: getValue("title"),
      fields: getValue("fields"),
      uses: Number(getValue("uses")) || 0,
      status: getValue("status"),
    };

    if (!payload.title || !payload.fields) {
      openFeedbackModal("信息不完整", "请填写模板名称和字段配置后再提交。");
      return;
    }

    if (mode === "edit") {
      const target = consultationTemplates.find((item) => item.title === sourceTitle);
      if (!target) return;
      Object.assign(target, payload);
      openFeedbackModal("咨询方案已更新", `${payload.title} 的模板信息已保存。`);
      return;
    }

    consultationTemplates.unshift(payload);
    state.selectedIndex = 0;
    openFeedbackModal("咨询方案已新增", `${payload.title} 已加入咨询方案配置列表。`);
  }

  function deleteTemplate(title) {
    const index = consultationTemplates.findIndex((item) => item.title === title);
    if (index === -1) return;
    const [removed] = consultationTemplates.splice(index, 1);
    state.selectedIndex = Math.max(0, state.selectedIndex - (state.selectedIndex >= consultationTemplates.length ? 1 : 0));
    openFeedbackModal("咨询方案已删除", `${removed.title} 已从咨询方案配置中移除。`);
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

  function filterRows(rows, filterBy) {
    let result = [...rows];

    if (filterBy && state.activeFilter !== "全部") {
      result = result.filter((row) => row[filterBy] === state.activeFilter);
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



