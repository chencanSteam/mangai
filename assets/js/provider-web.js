(function () {
  if (document.body.dataset.page !== "provider-web") return;

  const { services = [], cases = [] } = window.MockData;
  const tabsEl = document.getElementById("providerWebTabs");
  const contentEl = document.getElementById("providerWebContent");
  const modalEl = document.getElementById("providerModal");
  const modalCardEl = document.getElementById("providerModalCard");
  const pageShellEl = document.querySelector(".provider-site");

  const store = {
    name: "德驭 Performance Studio",
    city: "上海市 闵行区",
    slogan: "高端改装展示中心",
    intro: "专注宝马、奔驰、奥迪、保时捷与新能源高端车型的姿态升级、轮毂锻造、制动系统、精品车衣与内饰定制，强调精品施工、可视化交付和高端客户体验。",
    address: "上海市闵行区申虹路 888 号 A2 栋",
    hotline: "400-908-6608",
    hours: "09:30 - 21:00",
    stats: [
      { label: "年度施工", value: "1,286+" },
      { label: "五星好评率", value: "97.6%" },
      { label: "认证技师", value: "12" },
      { label: "交付工位", value: "6" },
    ],
    sellingPoints: ["高性能制动升级", "精品轮毂锻造", "新能源姿态方案", "VIP 交付体验"],
    certifications: ["营业执照齐全", "品牌授权安装资质", "高性能制动施工授权", "平台认证高端改装门店"],
    adWords: ["更快交付", "更稳施工", "更强质感", "更懂性能车"],
  };

  const fallbackServices = [
    { name: "高端隐形车衣", desc: "进口 TPU 车衣方案，强调漆面保护与细节包边处理。", price: "¥ 9,800 起" },
    { name: "轮毂锻造升级", desc: "支持 BBS、HRE、Vossen 等高端轮组改装与数据适配。", price: "¥ 13,800 起" },
    { name: "制动套件升级", desc: "适配高性能制动套件与街道、赛道双场景制动方案。", price: "¥ 19,800 起" },
    { name: "内饰包覆与氛围灯", desc: "围绕豪华车内饰质感与夜间氛围视觉做精品升级。", price: "¥ 6,800 起" },
  ];

  const fallbackCases = [
    { title: "宝马 G20 330i Brembo 制动 + BBS 锻造轮毂", model: "宝马 G20 330i", style: "赛道街道双用", cost: "¥ 42,600" },
    { title: "奔驰 C260L 精品氛围灯 + 内饰包覆", model: "奔驰 C260L", style: "豪华精致升级", cost: "¥ 15,800" },
    { title: "极氪 001 FR 猎装姿态 + 低风阻轮组", model: "极氪 001 FR", style: "新能源性能风", cost: "¥ 36,400" },
    { title: "奥迪 A4L 哑光深灰车衣 + RS 风格轮毂", model: "奥迪 A4L", style: "运动外观强化", cost: "¥ 21,300" },
  ];

  const displayServices = services
    .map((item, index) => ({
      name: item.name || fallbackServices[index % fallbackServices.length].name,
      desc: item.desc || fallbackServices[index % fallbackServices.length].desc,
      price: item.basePrice || item.price || fallbackServices[index % fallbackServices.length].price,
      status: item.status || "启用",
    }))
    .filter((item) => item.status === "启用")
    .slice(0, 4);

  const displayCases = cases
    .map((item, index) => ({
      title: item.title || fallbackCases[index % fallbackCases.length].title,
      model: item.model || fallbackCases[index % fallbackCases.length].model,
      style: item.style || fallbackCases[index % fallbackCases.length].style,
      cost: item.cost || fallbackCases[index % fallbackCases.length].cost,
    }))
    .slice(0, 4);

  const tabs = [
    { id: "join", label: "入驻申请" },
    { id: "showcase", label: "门店展示" },
  ];

  const state = { activeTab: "join" };

  function renderTabs() {
    tabsEl.innerHTML = tabs
      .map(
        (tab) => `
          <button class="site-nav-link ${state.activeTab === tab.id ? "active" : ""}" data-tab="${tab.id}" type="button">
            ${tab.label}
          </button>
        `
      )
      .join("");

    tabsEl.querySelectorAll("[data-tab]").forEach((button) => {
      button.addEventListener("click", () => {
        state.activeTab = button.dataset.tab;
        renderTabs();
        renderContent();
      });
    });
  }

  function renderJoinPage() {
    document.body.classList.remove("provider-screen-mode");
    pageShellEl.classList.remove("provider-showcase-mode");

    contentEl.innerHTML = `
      <section class="provider-join-layout">
        <article class="panel provider-join-main">
          <span class="eyebrow">Provider Join</span>
          <h1>服务商入驻申请</h1>
          <p class="muted provider-join-intro">面向高端改装、轮毂锻造、制动升级、精品车衣、内饰升级等门店开放入驻。平台会审核门店资质、施工能力、案例内容和经营资料后开通展示与订单协同能力。</p>
          <div class="provider-join-form">
            <div class="field-group">
              <div class="field-label">门店名称</div>
              <input class="input" value="${store.name}" />
            </div>
            <div class="field-group">
              <div class="field-label">联系人</div>
              <input class="input" value="陈骁 / 138****9088" />
            </div>
            <div class="field-group">
              <div class="field-label">所在城市</div>
              <input class="input" value="${store.city}" />
            </div>
            <div class="field-group">
              <div class="field-label">门店地址</div>
              <input class="input" value="${store.address}" />
            </div>
            <div class="field-group field-group-full">
              <div class="field-label">主营能力</div>
              <input class="input" value="轮毂锻造 / 制动升级 / 隐形车衣 / 精品内饰 / 氛围灯升级" />
            </div>
            <div class="field-group field-group-full">
              <div class="field-label">经营说明</div>
              <textarea class="textarea">近 12 个月累计交付 400+ 高端改装订单，具备精品交付区、车衣无尘施工位和品牌授权安装资质。</textarea>
            </div>
          </div>
          <section class="provider-upload-board">
            <div class="panel-header">
              <div>
                <h2 class="section-title">资质资料上传</h2>
                <p class="section-subtitle">上传营业执照、门头照、施工环境、品牌授权和案例资料，用于平台审核。</p>
              </div>
            </div>
            <div class="provider-upload-grid">
              ${[
                ["营业执照", "营业执照副本 / 统一社会信用代码清晰可见"],
                ["门店门头照", "展示门店品牌招牌与门头外观"],
                ["施工环境照", "工位、工具墙、车衣区、交付区等现场环境"],
                ["品牌授权资料", "轮毂、制动、车衣等合作品牌授权文件"],
                ["案例图片包", "近 3 个月代表性案例 before / after 图片"],
                ["负责人身份证明", "联系人身份证或门店负责人身份证明"],
              ]
                .map(
                  ([title, desc]) => `
                    <div class="provider-upload-card">
                      <div>
                        <strong>${title}</strong>
                        <p>${desc}</p>
                      </div>
                      <button class="btn btn-secondary" type="button">上传资料</button>
                    </div>
                  `
                )
                .join("")}
            </div>
          </section>
          <div class="provider-join-actions">
            <button class="btn btn-primary" type="button" id="providerJoinSubmitBtn">提交入驻申请</button>
            <button class="btn btn-secondary" type="button" id="providerJoinShowcaseBtn">查看门店展示页</button>
          </div>
        </article>
        <aside class="panel provider-join-side">
          <div class="panel-header">
            <div>
              <h2 class="section-title">入驻要求</h2>
              <p class="section-subtitle">平台优先接纳具备稳定案例产出、规范施工环境和高端客户接待能力的门店。</p>
            </div>
          </div>
          <div class="simple-list">
            <div class="simple-list-item"><strong>基础资质完整</strong><span class="muted">营业执照、联系人信息、门店地址与经营信息需完整一致。</span></div>
            <div class="simple-list-item"><strong>施工环境规范</strong><span class="muted">需要提供工位、设备、交付区与品牌展示环境资料。</span></div>
            <div class="simple-list-item"><strong>案例内容真实</strong><span class="muted">提交案例须可体现车型、项目内容、改装风格与交付效果。</span></div>
            <div class="simple-list-item"><strong>高端服务能力</strong><span class="muted">具备接待、方案讲解、施工交付与售后反馈能力。</span></div>
          </div>
          <div class="provider-join-benefits">
            ${store.certifications.map((item) => `<span class="pill">${item}</span>`).join("")}
          </div>
        </aside>
      </section>
    `;

    document.getElementById("providerJoinSubmitBtn").addEventListener("click", () => {
      openFeedbackModal("申请已提交", "门店资料与上传资质已进入平台审核队列，预计 2 小时内完成初审。");
    });

    document.getElementById("providerJoinShowcaseBtn").addEventListener("click", () => {
      state.activeTab = "showcase";
      renderTabs();
      renderContent();
    });
  }

  function renderShowcasePage() {
    document.body.classList.add("provider-screen-mode");
    pageShellEl.classList.add("provider-showcase-mode");

    contentEl.innerHTML = `
      <section class="provider-display-board provider-ad-board">
        <header class="panel provider-display-hero provider-ad-hero">
          <div class="provider-display-copy">
            <span class="eyebrow">Luxury Performance Upgrade</span>
            <h1>${store.name}</h1>
            <p class="provider-display-slogan">${store.city} / ${store.slogan}</p>
            <p class="provider-display-intro">${store.intro}</p>
            <div class="provider-ad-keywords">
              ${store.adWords.map((item) => `<span>${item}</span>`).join("")}
            </div>
            <div class="provider-display-contact">
              <span class="pill">${store.address}</span>
              <span class="pill">服务热线 ${store.hotline}</span>
              <span class="pill">营业时间 ${store.hours}</span>
            </div>
          </div>
          <div class="provider-display-visual provider-ad-visual">
            <div class="provider-car-silhouette"></div>
            <div class="provider-ad-badge">高端改装<br />门店展示屏</div>
          </div>
        </header>

        <section class="provider-display-grid provider-ad-grid">
          <article class="panel provider-display-panel provider-ad-panel">
            <div class="panel-header">
              <div>
                <h2 class="section-title">主推服务</h2>
                <p class="section-subtitle">用广告化表达突出门店最强成交项目</p>
              </div>
            </div>
            <div class="provider-display-list">
              ${displayServices
                .map(
                  (item) => `
                    <div class="provider-display-item provider-ad-item">
                      <div>
                        <strong>${item.name}</strong>
                        <p>${item.desc}</p>
                      </div>
                      <div class="provider-display-side">
                        <span class="tag warning">${item.price}</span>
                      </div>
                    </div>
                  `
                )
                .join("")}
            </div>
          </article>

          <article class="panel provider-display-panel provider-ad-panel">
            <div class="panel-header">
              <div>
                <h2 class="section-title">精品案例</h2>
                <p class="section-subtitle">用案例氛围与车型风格刺激现场咨询转化</p>
              </div>
            </div>
            <div class="provider-case-grid">
              ${displayCases
                .map(
                  (item) => `
                    <article class="provider-case-card provider-ad-case">
                      <div class="provider-case-image"></div>
                      <strong>${item.title}</strong>
                      <p>${item.model} / ${item.style}</p>
                      <div class="provider-case-foot">
                        <span class="tag info">${item.cost}</span>
                      </div>
                    </article>
                  `
                )
                .join("")}
            </div>
          </article>

          <article class="panel provider-display-panel provider-ad-panel">
            <div class="panel-header">
              <div>
                <h2 class="section-title">门店卖点</h2>
                <p class="section-subtitle">广告页思维下的信任增强区</p>
              </div>
            </div>
            <div class="provider-display-stats">
              ${store.stats
                .map(
                  (item) => `
                    <div class="provider-stat-card">
                      <div class="muted">${item.label}</div>
                      <strong>${item.value}</strong>
                    </div>
                  `
                )
                .join("")}
            </div>
            <div class="provider-display-tags">
              ${store.sellingPoints.map((item) => `<span class="tag success">${item}</span>`).join("")}
            </div>
            <div class="provider-ad-cta">
              <div>
                <strong>到店沟通 / 现场看车 / 方案报价</strong>
                <p>欢迎到店查看施工环境、实车案例与品牌样件展示。</p>
              </div>
              <div class="provider-ad-phone">${store.hotline}</div>
            </div>
          </article>
        </section>
      </section>
    `;
  }

  function renderContent() {
    if (state.activeTab === "showcase") {
      renderShowcasePage();
      return;
    }
    renderJoinPage();
  }

  function openFeedbackModal(title, message) {
    modalCardEl.innerHTML = `
      <div class="panel-header">
        <div>
          <span class="eyebrow">Provider Web</span>
          <h2 class="section-title">${title}</h2>
          <p class="section-subtitle">${message}</p>
        </div>
      </div>
      <div style="display:flex; gap:12px; margin-top:18px;">
        <button class="btn btn-primary" type="button" id="providerModalCloseBtn">我知道了</button>
      </div>
    `;
    modalEl.classList.add("visible");
    document.getElementById("providerModalCloseBtn")?.addEventListener("click", () => modalEl.classList.remove("visible"));
  }

  modalEl.addEventListener("click", (event) => {
    if (event.target === modalEl) modalEl.classList.remove("visible");
  });

  renderTabs();
  renderContent();
})();
