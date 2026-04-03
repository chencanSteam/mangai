(function () {
  const appType = document.body.dataset.mobileApp;
  if (!appType) return;

  const screenEl = document.getElementById("mobileApp");
  const { providers, orders, products, settlements, cases, posts, comments, vehicles, services, mobile } = window.MockData;

  const appConfigs = {
    admin: {
      title: "平台管理端",
      tabs: [
        { id: "home", label: "首页" },
        { id: "providers", label: "服务商" },
        { id: "orders", label: "订单" },
        { id: "operations", label: "运营" },
        { id: "me", label: "我的" },
      ],
    },
    provider: {
      title: "服务商端",
      tabs: [
        { id: "home", label: "首页" },
        { id: "orders", label: "订单" },
        { id: "products", label: "商品" },
        { id: "operations", label: "运营" },
        { id: "me", label: "我的" },
      ],
    },
    user: {
      title: "用户端",
      tabs: [
        { id: "home", label: "首页" },
        { id: "mall", label: "商城" },
        { id: "garage", label: "爱车" },
        { id: "forum", label: "论坛" },
        { id: "me", label: "我的" },
      ],
    },
  };

  const state = {
    tab: appConfigs[appType].tabs[0].id,
    subTab: {},
    garageColor: 0,
    garageWheel: 0,
  };

  function render() {
    const title = getCurrentTitle();
    screenEl.innerHTML = `
      <div class="android-status">
        <span>9:41</span>
        <span>5G 92%</span>
      </div>
      <header class="android-topbar">
        <span class="eyebrow">${appConfigs[appType].title}</span>
        <h2>${title}</h2>
        <div class="muted">${getSubtitle()}</div>
      </header>
      <section class="screen-content">${renderTab()}</section>
      <nav class="bottom-nav">
        ${appConfigs[appType].tabs
          .map(
            (tab) => `
              <button class="${state.tab === tab.id ? "active" : ""}" type="button" data-tab="${tab.id}">
                <span>${tab.label}</span>
              </button>
            `
          )
          .join("")}
      </nav>
    `;

    screenEl.querySelectorAll("[data-tab]").forEach((button) => {
      button.addEventListener("click", () => {
        state.tab = button.dataset.tab;
        render();
      });
    });

    screenEl.querySelectorAll("[data-sub-tab]").forEach((button) => {
      button.addEventListener("click", () => {
        state.subTab[state.tab] = button.dataset.subTab;
        render();
      });
    });

    screenEl.querySelectorAll("[data-color-index]").forEach((swatch) => {
      swatch.addEventListener("click", () => {
        state.garageColor = Number(swatch.dataset.colorIndex);
        updateGarageRender();
      });
    });

    screenEl.querySelectorAll("[data-wheel-index]").forEach((wheel) => {
      wheel.addEventListener("click", () => {
        state.garageWheel = Number(wheel.dataset.wheelIndex);
        updateGarageRender();
      });
    });
  }

  function renderTab() {
    if (appType === "admin") return renderAdmin();
    if (appType === "provider") return renderProvider();
    return renderUser();
  }

  function getCurrentTitle() {
    const tab = appConfigs[appType].tabs.find((item) => item.id === state.tab);
    return tab ? tab.label : appConfigs[appType].title;
  }

  function getSubtitle() {
    if (appType === "admin") return "审批、派单、运营与消息提醒";
    if (appType === "provider") return "门店作业、采购与结算";
    return "案例推荐、服务消费与爱车管理";
  }

  function makeSubTabs(key, labels) {
    const active = state.subTab[state.tab] || labels[0].id;
    return `
      <div class="sub-tabs">
        ${labels
          .map(
            (item) => `
              <button class="sub-tab ${active === item.id ? "active" : ""}" data-sub-tab="${item.id}" type="button">
                ${item.label}
              </button>
            `
          )
          .join("")}
      </div>
    `;
  }

  function renderAdmin() {
    if (state.tab === "home") {
      return `
        <div class="stack">
          <section class="hero-banner">
            <div class="eyebrow">Work Bench</div>
            <h3 style="margin:10px 0 8px; font-size:28px; font-family:var(--font-display);">待办总览</h3>
            <p class="muted">把待审核服务商、待分配订单、待审核案例和待结算申请集中处理。</p>
          </section>
          <section class="mobile-grid-2">
            ${window.MockData.platform.todo
              .map(
                (item) => `
                  <article class="m3-card">
                    <div class="muted">${item.title}</div>
                    <span class="mobile-stat">${item.value}</span>
                    <div class="muted">${item.note}</div>
                  </article>
                `
              )
              .join("")}
          </section>
          <section class="mobile-list">
            ${mobile.admin.messages
              .map(
                (item) => `
                  <article class="mobile-item">
                    <strong>${item.title}</strong>
                    <div class="muted">${item.note}</div>
                    <div style="margin-top:8px;" class="muted">${item.time}</div>
                  </article>
                `
              )
              .join("")}
          </section>
        </div>
      `;
    }

    if (state.tab === "providers") {
      const active = state.subTab.providers || "audit";
      return `
        ${makeSubTabs("providers", [
          { id: "audit", label: "入驻审核" },
          { id: "list", label: "服务商列表" },
        ])}
        <div class="mobile-list">
          ${(active === "audit" ? providers : providers.filter((item) => item.auditStatus === "已通过" || item.status !== "已驳回"))
            .map(
              (item) => `
                <article class="mobile-item">
                  <div style="display:flex; justify-content:space-between; gap:12px;">
                    <strong>${item.name}</strong>
                    <span class="tag ${item.auditStatus === "待审核" ? "warning" : item.auditStatus === "已驳回" ? "danger" : "success"}">${active === "audit" ? item.auditStatus : item.status}</span>
                  </div>
                  <div class="muted" style="margin-top:8px;">${item.city} · ${item.specialties}</div>
                  <div style="margin-top:10px;" class="muted">${item.contact}</div>
                </article>
              `
            )
            .join("")}
        </div>
      `;
    }

    if (state.tab === "orders") {
      const active = state.subTab.orders || "list";
      return `
        ${makeSubTabs("orders", [
          { id: "list", label: "订单列表" },
          { id: "assign", label: "订单分配" },
        ])}
        <div class="mobile-list">
          ${orders
            .filter((item) => (active === "assign" ? item.status === "待分配" || item.status === "施工中" : true))
            .map(
              (item) => `
                <article class="mobile-item">
                  <div style="display:flex; justify-content:space-between; gap:12px;">
                    <strong>${item.id}</strong>
                    <span class="tag ${item.status === "待分配" ? "warning" : item.status === "施工中" ? "info" : item.status === "已完成" ? "success" : "neutral"}">${item.status}</span>
                  </div>
                  <div class="muted" style="margin-top:8px;">${item.user} · ${item.vehicle}</div>
                  <div style="margin-top:8px;">${item.service}</div>
                  <div class="muted" style="margin-top:8px;">${active === "assign" ? `意向：${item.intention}` : item.progress}</div>
                </article>
              `
            )
            .join("")}
        </div>
      `;
    }

    if (state.tab === "operations") {
      const active = state.subTab.operations || "cases";
      return `
        ${makeSubTabs("operations", [
          { id: "cases", label: "案例管理" },
          { id: "forum", label: "论坛管理" },
        ])}
        <div class="mobile-list">
          ${(active === "cases" ? cases : posts)
            .map((item) =>
              active === "cases"
                ? `
                  <article class="mobile-item">
                    <strong>${item.title}</strong>
                    <div class="muted" style="margin-top:8px;">${item.model} · ${item.provider}</div>
                    <div style="margin-top:10px; display:flex; gap:10px; flex-wrap:wrap;">
                      <span class="tag ${item.audit === "已通过" ? "success" : item.audit === "待审核" ? "warning" : "danger"}">${item.audit}</span>
                      <span class="pill">${item.display}</span>
                    </div>
                  </article>
                `
                : `
                  <article class="mobile-item">
                    <strong>${item.title}</strong>
                    <div class="muted" style="margin-top:8px;">${item.author} · ${item.time}</div>
                    <div style="margin-top:10px; display:flex; gap:10px;">
                      <span class="pill">回复 ${item.replies}</span>
                      <span class="tag ${item.status === "待处理" ? "warning" : "success"}">${item.status}</span>
                    </div>
                  </article>
                `
            )
            .join("")}
        </div>
      `;
    }

    return `
      <div class="stack">
        <section class="m3-tonal">
          <strong>消息中心</strong>
          <p class="muted">审核提醒、订单提醒、结算提醒与系统通知统一归口。</p>
        </section>
        <section class="mobile-list">
          <article class="mobile-item"><strong>平台管理员</strong><div class="muted">PA / 审核中心负责人</div></article>
          <article class="mobile-item"><strong>快捷设置</strong><div class="muted">自动验收时长 24 小时，消息模板 V2.8</div></article>
        </section>
      </div>
    `;
  }

  function renderProvider() {
    if (state.tab === "home") {
      return `
        <div class="stack">
          <section class="hero-banner">
            <div class="eyebrow">Store Dashboard</div>
            <h3 style="margin:10px 0 8px; font-size:28px; font-family:var(--font-display);">门店工作台</h3>
            <p class="muted">聚焦待接单、施工进度、待结算与门店经营数据。</p>
          </section>
          <section class="mobile-grid-2">
            ${mobile.provider.tasks
              .map(
                (item) => `
                  <article class="m3-card">
                    <div class="muted">${item.title}</div>
                    <span class="mobile-stat">${item.value}</span>
                  </article>
                `
              )
              .join("")}
          </section>
          <section class="mobile-list">
            <article class="mobile-item">
              <strong>门店数据</strong>
              <div class="muted" style="margin-top:8px;">本月订单 46 单，五星率 97.6%，高端项目成交率 38%。</div>
            </article>
          </section>
        </div>
      `;
    }

    if (state.tab === "orders") {
      const active = state.subTab.orders || "pending";
      return `
        ${makeSubTabs("orders", [
          { id: "pending", label: "待接单" },
          { id: "all", label: "全部订单" },
        ])}
        <div class="mobile-list">
          ${orders
            .filter((item) => (active === "pending" ? item.status === "待分配" || item.status === "施工中" : item.type === "服务订单"))
            .map(
              (item) => `
                <article class="mobile-item">
                  <div style="display:flex; justify-content:space-between; gap:12px;">
                    <strong>${item.vehicle}</strong>
                    <span class="tag ${item.status === "施工中" ? "info" : item.status === "已完成" ? "success" : "warning"}">${active === "pending" ? (item.status === "待分配" ? "待接单" : item.status) : item.status}</span>
                  </div>
                  <div class="muted" style="margin-top:8px;">${item.user} · ${item.service}</div>
                  <div style="margin-top:8px;" class="muted">${item.quote} · ${item.appointment}</div>
                </article>
              `
            )
            .join("")}
        </div>
      `;
    }

    if (state.tab === "products") {
      const active = state.subTab.products || "purchase";
      return `
        ${makeSubTabs("products", [
          { id: "purchase", label: "商品采购" },
          { id: "record", label: "采购记录" },
        ])}
        <div class="mobile-list">
          ${(active === "purchase" ? products : products.slice(0, 3))
            .map(
              (item) => `
                <article class="mobile-item">
                  <div style="display:flex; justify-content:space-between; gap:12px;">
                    <strong>${item.name}</strong>
                    <span class="tag ${item.status === "上架" ? "success" : "danger"}">${active === "purchase" ? item.status : "已采购"}</span>
                  </div>
                  <div class="muted" style="margin-top:8px;">${item.brand} · ${item.category}</div>
                  <div style="margin-top:8px;">${item.price}</div>
                </article>
              `
            )
            .join("")}
        </div>
      `;
    }

    if (state.tab === "operations") {
      const active = state.subTab.operations || "cases";
      return `
        ${makeSubTabs("operations", [
          { id: "cases", label: "案例管理" },
          { id: "forum", label: "论坛管理" },
        ])}
        <div class="mobile-list">
          ${(active === "cases" ? cases : posts.slice(0, 3))
            .map((item) =>
              active === "cases"
                ? `
                  <article class="mobile-item">
                    <strong>${item.title}</strong>
                    <div class="muted" style="margin-top:8px;">${item.model} · ${item.cost}</div>
                    <div style="margin-top:10px; display:flex; gap:10px;">
                      <span class="tag ${item.audit === "已通过" ? "success" : item.audit === "待审核" ? "warning" : "danger"}">${item.audit}</span>
                    </div>
                  </article>
                `
                : `
                  <article class="mobile-item">
                    <strong>${item.title}</strong>
                    <div class="muted" style="margin-top:8px;">回复 ${item.replies} · 点赞 ${item.likes}</div>
                  </article>
                `
            )
            .join("")}
        </div>
      `;
    }

    return `
      <div class="stack">
        <section class="mobile-list">
          ${settlements
            .map(
              (item) => `
                <article class="mobile-item">
                  <strong>${item.provider}</strong>
                  <div class="muted" style="margin-top:8px;">${item.id}</div>
                  <div style="margin-top:8px;">${item.amount}</div>
                  <div style="margin-top:10px;">${item.status === "已通过" ? '<span class="tag success">已通过</span>' : item.status === "审核中" ? '<span class="tag info">审核中</span>' : '<span class="tag warning">待审核</span>'}</div>
                </article>
              `
            )
            .join("")}
          <article class="mobile-item"><strong>个人中心</strong><div class="muted" style="margin-top:8px;">门店信息、账号资料与消息查看入口。</div></article>
        </section>
      </div>
    `;
  }

  function renderUser() {
    if (state.tab === "home") {
      return `
        <div class="stack">
          <section class="hero-banner">
            <div class="eyebrow">Inspiration</div>
            <h3 style="margin:10px 0 8px; font-size:28px; font-family:var(--font-display);">高端改装推荐</h3>
            <p class="muted">${mobile.user.banners[0]}</p>
          </section>
          <section class="mobile-list">
            ${cases
              .map(
                (item) => `
                  <article class="mobile-item">
                    <strong>${item.title}</strong>
                    <div class="muted" style="margin-top:8px;">${item.model} · ${item.style}</div>
                    <div style="margin-top:10px; display:flex; gap:10px;">
                      <span class="pill">${item.cost}</span>
                      <span class="tag success">${item.display}</span>
                    </div>
                  </article>
                `
              )
              .join("")}
          </section>
        </div>
      `;
    }

    if (state.tab === "mall") {
      const active = state.subTab.mall || "goods";
      return `
        ${makeSubTabs("mall", [
          { id: "goods", label: "商品列表" },
          { id: "service", label: "服务下单" },
        ])}
        <div class="mobile-list">
          ${(active === "goods" ? products : services)
            .map((item) =>
              active === "goods"
                ? `
                  <article class="mobile-item">
                    <strong>${item.name}</strong>
                    <div class="muted" style="margin-top:8px;">${item.brand} · ${item.fitment}</div>
                    <div style="margin-top:10px; display:flex; gap:10px;">
                      <span class="pill">${item.price}</span>
                      <span class="tag ${item.status === "上架" ? "success" : "danger"}">${item.status}</span>
                    </div>
                  </article>
                `
                : `
                  <article class="mobile-item">
                    <strong>${item.name}</strong>
                    <div class="muted" style="margin-top:8px;">${item.desc}</div>
                    <div style="margin-top:10px; display:flex; gap:10px;">
                      <span class="pill">${item.price}</span>
                      <span class="pill">${item.duration}</span>
                    </div>
                  </article>
                `
            )
            .join("")}
        </div>
      `;
    }

    if (state.tab === "garage") {
      const active = state.subTab.garage || "render";
      return `
        ${makeSubTabs("garage", [
          { id: "vehicles", label: "我的车辆" },
          { id: "render", label: "渲染展示" },
        ])}
        ${
          active === "vehicles"
            ? `
              <div class="mobile-list">
                ${vehicles
                  .map(
                    (item) => `
                      <article class="mobile-item">
                        <strong>${item.model}</strong>
                        <div class="muted" style="margin-top:8px;">${item.plate} · ${item.owner}</div>
                        <div style="margin-top:8px;">${item.history}</div>
                        <div style="margin-top:10px;">${item.compliance === "正常" ? '<span class="tag success">合规正常</span>' : '<span class="tag warning">需关注</span>'}</div>
                      </article>
                    `
                  )
                  .join("")}
              </div>
            `
            : `
              <div class="stack">
                <section class="garage-preview">
                  <div class="eyebrow">Render Lab</div>
                  <strong style="display:block; margin-top:10px; font-size:22px;">宝马 G20 330i 外观预览</strong>
                  <div class="muted" style="margin-top:6px;">点击切换车身颜色与轮毂样式，当前方案仅做图片式渲染模拟。</div>
                  <div class="car-render">
                    <div class="car-wheel left" id="leftWheel"></div>
                    <div class="car-wheel right" id="rightWheel"></div>
                    <div class="car-render-body" id="carBody"></div>
                  </div>
                  <div class="swatch-row">
                    ${mobile.user.garageColors
                      .map(
                        (item, index) => `
                          <button
                            class="swatch ${index === state.garageColor ? "active" : ""}"
                            style="background:${item.value};"
                            type="button"
                            title="${item.name}"
                            data-color-index="${index}">
                          </button>
                        `
                      )
                      .join("")}
                  </div>
                </section>
                <section class="mobile-list">
                  ${mobile.user.wheels
                    .map(
                      (item, index) => `
                        <button class="wheel-option ${index === state.garageWheel ? "active" : ""}" type="button" data-wheel-index="${index}">
                          <span>
                            <strong>${item.name}</strong>
                            <div class="muted" style="margin-top:6px;">${item.spokes} 辐设计 · 高端改装风格</div>
                          </span>
                          <span class="wheel-badge" data-tone="${index === 0 ? "gold" : index === 1 ? "grey" : "silver"}"></span>
                        </button>
                      `
                    )
                    .join("")}
                </section>
              </div>
            `
        }
      `;
    }

    if (state.tab === "forum") {
      const active = state.subTab.forum || "posts";
      return `
        ${makeSubTabs("forum", [
          { id: "posts", label: "帖子列表" },
          { id: "mine", label: "我的发布" },
        ])}
        <div class="mobile-list">
          ${(active === "posts" ? posts : comments)
            .map((item) =>
              active === "posts"
                ? `
                  <article class="mobile-item">
                    <strong>${item.title}</strong>
                    <div class="muted" style="margin-top:8px;">${item.author} · ${item.time}</div>
                    <div style="margin-top:10px; display:flex; gap:10px;">
                      <span class="pill">回复 ${item.replies}</span>
                      <span class="pill">点赞 ${item.likes}</span>
                    </div>
                  </article>
                `
                : `
                  <article class="mobile-item">
                    <strong>${item.content}</strong>
                    <div class="muted" style="margin-top:8px;">所属 ${item.post} · ${item.time}</div>
                  </article>
                `
            )
            .join("")}
        </div>
      `;
    }

    return `
      <div class="stack">
        <section class="mobile-list">
          ${orders
            .slice(0, 4)
            .map(
              (item) => `
                <article class="mobile-item">
                  <strong>${item.id}</strong>
                  <div class="muted" style="margin-top:8px;">${item.vehicle}</div>
                  <div style="margin-top:8px;">${item.service}</div>
                  <div style="margin-top:10px;">${item.status === "已完成" ? '<span class="tag success">已完成</span>' : item.status === "施工中" ? '<span class="tag info">施工中</span>' : '<span class="tag warning">' + item.status + "</span>"}</div>
                </article>
              `
            )
            .join("")}
          <article class="mobile-item"><strong>我的资料</strong><div class="muted" style="margin-top:8px;">地址管理、消息通知、金融授信与基础设置。</div></article>
        </section>
      </div>
    `;
  }

  function updateGarageRender() {
    const color = mobile.user.garageColors[state.garageColor];
    const wheel = mobile.user.wheels[state.garageWheel];
    const body = document.getElementById("carBody");
    const leftWheel = document.getElementById("leftWheel");
    const rightWheel = document.getElementById("rightWheel");
    if (!body || !leftWheel || !rightWheel) return;

    body.style.background = `linear-gradient(145deg, ${shade(color.value, -18)}, ${color.value})`;
    const wheelGradient = `radial-gradient(circle, #a3a9b3 0 10%, ${shade(wheel.color, -30)} 12% 44%, #0a0d11 46% 100%)`;
    leftWheel.style.background = wheelGradient;
    rightWheel.style.background = wheelGradient;

    screenEl.querySelectorAll("[data-color-index]").forEach((el, index) => {
      el.classList.toggle("active", index === state.garageColor);
    });
    screenEl.querySelectorAll("[data-wheel-index]").forEach((el, index) => {
      el.classList.toggle("active", index === state.garageWheel);
    });
  }

  function shade(hex, amount) {
    const value = hex.replace("#", "");
    const size = value.length === 3 ? 1 : 2;
    const parts = [];
    for (let i = 0; i < 3; i += 1) {
      const start = i * size;
      const channel = size === 1 ? parseInt(value[start] + value[start], 16) : parseInt(value.slice(start, start + 2), 16);
      const next = Math.max(0, Math.min(255, channel + amount));
      parts.push(next.toString(16).padStart(2, "0"));
    }
    return `#${parts.join("")}`;
  }

  render();
  updateGarageRender();
})();
