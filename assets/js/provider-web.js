(function () {
  if (document.body.dataset.page !== "provider-web") return;

  const { providerWeb = {}, services = [], cases = [] } = window.MockData;
  const tabsEl = document.getElementById("providerWebTabs");
  const contentEl = document.getElementById("providerWebContent");
  const modalEl = document.getElementById("providerModal");
  const modalCardEl = document.getElementById("providerModalCard");

  const store = {
    name: providerWeb.store?.name || "御驰 Performance Studio",
    city: providerWeb.store?.city || "上海闵行",
    slogan: providerWeb.store?.slogan || "高端改装展示中心",
    intro:
      providerWeb.store?.intro ||
      "专注高端性能车外观、底盘、制动与精品内饰升级，提供从方案咨询到施工交付的一体化服务。",
    address: providerWeb.store?.location || "上海市闵行区申长路 1688 号改装产业园 A2-301",
    hotline: providerWeb.store?.hotline || "400-908-6608",
    hours: providerWeb.store?.hours || "09:30 - 21:00",
    contractNo: providerWeb.store?.contractNo || "HT-2026-0218",
    contractStatus: providerWeb.store?.contractStatus || "履约中",
    stats: providerWeb.store?.stats || [],
    services: providerWeb.store?.services || [],
    certifications: providerWeb.store?.certifications || [],
  };

  const state = {
    activeTab: "join",
    showcaseIndex: 0,
  };

  const showcaseServices = services
    .filter((item) => item.status !== "停用")
    .slice(0, 4)
    .map((item, index) => ({
      title: item.name,
      desc: item.desc,
      price: item.basePrice || item.price || `¥ ${(index + 1) * 3600}`,
    }));

  function getStoreCases() {
    const rows = cases.filter((item) => item.provider === store.name);
    if (rows.length) return rows;
    return (providerWeb.store?.cases || []).map((item, index) => ({
      id: item.id || `PCASE-${String(index + 1).padStart(2, "0")}`,
      title: item.title,
      provider: store.name,
      model: item.model,
      style: item.style,
      cost: item.cost,
      audit: item.audit || "已通过",
      display: item.display || "正常展示",
      image: item.cover || `showcase-cover-${index + 1}.jpg`,
      content: item.summary || "展示门店精品案例的核心卖点、施工内容和交付效果。",
    }));
  }

  function getActiveCase() {
    const rows = getStoreCases();
    if (!rows.length) return null;
    if (state.showcaseIndex >= rows.length) state.showcaseIndex = 0;
    return rows[state.showcaseIndex];
  }

  function renderTabs() {
    const tabs = [
      { id: "join", label: "入驻申请" },
      { id: "showcase", label: "门店展示" },
      { id: "cases", label: "案例维护" },
    ];
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
    contentEl.innerHTML = `
      <section class="provider-join-layout">
        <article class="panel provider-join-main">
          <span class="eyebrow">Provider Join</span>
          <h1>服务商入驻申请</h1>
          <p class="muted provider-join-intro">补齐门店基础信息、合同信息、位置信息和资质资料后，可提交平台审核。</p>
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
              <div class="field-label">门店城市</div>
              <input class="input" value="${store.city}" />
            </div>
            <div class="field-group">
              <div class="field-label">详细地址</div>
              <input class="input" value="${store.address}" />
            </div>
            <div class="field-group">
              <div class="field-label">合同编号</div>
              <input class="input" value="${store.contractNo}" />
            </div>
            <div class="field-group">
              <div class="field-label">合同状态</div>
              <input class="input" value="${store.contractStatus}" />
            </div>
            <div class="field-group field-group-full">
              <div class="field-label">主营能力</div>
              <input class="input" value="${store.services.join(" / ")}" />
            </div>
            <div class="field-group field-group-full">
              <div class="field-label">门店说明</div>
              <textarea class="textarea">${store.intro}</textarea>
            </div>
          </div>
          <section class="provider-upload-board">
            <div class="panel-header">
              <div>
                <h2 class="section-title">资质与合同资料</h2>
                <p class="section-subtitle">所有按钮均可点击，点击后会给出 mock 上传反馈。</p>
              </div>
            </div>
            <div class="provider-upload-grid">
              ${[
                ["营业执照", "营业执照副本及统一社会信用代码"],
                ["门店位置图", "门店外景、周边地标和停车入口"],
                ["合同扫描件", "入驻合同首页、盖章页和附件页"],
                ["施工环境照", "施工区域、工具墙、交付区和接待区"],
                ["品牌授权书", "轮毂、制动、车衣等授权文件"],
                ["案例素材包", "近期案例主图、细节图和完工图"],
              ]
                .map(
                  ([title, desc]) => `
                    <div class="provider-upload-card">
                      <div>
                        <strong>${title}</strong>
                        <p>${desc}</p>
                      </div>
                      <button class="btn btn-secondary" type="button" data-provider-upload="${title}">上传资料</button>
                    </div>
                  `
                )
                .join("")}
            </div>
          </section>
          <div class="provider-join-actions">
            <button class="btn btn-primary" type="button" data-provider-join-submit>提交入驻申请</button>
            <button class="btn btn-secondary" type="button" data-provider-switch="showcase">查看门店展示页</button>
          </div>
        </article>
        <aside class="panel provider-join-side">
          <div class="panel-header">
            <div>
              <h2 class="section-title">本次补充重点</h2>
              <p class="section-subtitle">按会议纪要补齐合同信息与位置信息。</p>
            </div>
          </div>
          <div class="simple-list">
            <div class="simple-list-item"><strong>合同信息完整</strong><span class="muted">包含合同编号、状态和对应扫描件。</span></div>
            <div class="simple-list-item"><strong>位置可识别</strong><span class="muted">至少能看到门店详细地址、城市和周边定位图。</span></div>
            <div class="simple-list-item"><strong>案例可审核</strong><span class="muted">案例需补充主图、细节图、车型和项目说明。</span></div>
          </div>
          <div class="provider-join-benefits">
            ${store.certifications.map((item) => `<span class="pill">${item}</span>`).join("")}
          </div>
        </aside>
      </section>
    `;

    contentEl.querySelectorAll("[data-provider-upload]").forEach((button) => {
      button.addEventListener("click", () => {
        openFeedbackModal("资料已上传", `${button.dataset.providerUpload} 已加入当前入驻资料列表。`);
      });
    });
    contentEl.querySelector("[data-provider-join-submit]")?.addEventListener("click", () => {
      openFeedbackModal("申请已提交", "门店资料、合同资料和位置信息已提交，当前进入平台待审核列表。");
    });
    contentEl.querySelector("[data-provider-switch='showcase']")?.addEventListener("click", () => {
      state.activeTab = "showcase";
      renderTabs();
      renderContent();
    });
  }

  function renderShowcasePage() {
    const rows = getStoreCases();
    const activeCase = getActiveCase();

    contentEl.innerHTML = `
      <section class="stack">
        <section class="showcase-hero">
          <article class="panel showcase-cover" style="min-height:520px;">
            <span class="eyebrow">Luxury Performance Upgrade</span>
            <h1 style="margin:12px 0 10px; font-size:54px; line-height:0.94; font-family:var(--font-display);">${store.name}</h1>
            <p class="provider-display-slogan" style="font-size:18px; margin:0 0 10px;">${store.city} / ${store.slogan}</p>
            <div style="display:flex; gap:10px; flex-wrap:wrap; margin:16px 0 18px;">
              <span class="pill">合同 ${store.contractNo}</span>
              <span class="pill">状态 ${store.contractStatus}</span>
              <span class="pill">${store.address}</span>
            </div>
            <div style="display:grid; grid-template-columns:1.2fr 0.8fr; gap:18px; margin-top:24px;">
              <div style="border-radius:28px; min-height:280px; padding:20px; display:grid; align-content:end; background:
                linear-gradient(160deg, rgba(14,18,24,0.2), rgba(14,18,24,0.7)),
                radial-gradient(circle at 18% 22%, rgba(255,106,0,0.32), transparent 28%),
                linear-gradient(135deg, #151b22, #313844);">
                <div class="pill" style="width:max-content;">门店主视觉</div>
                <strong style="display:block; margin-top:12px; font-size:28px;">少文字，多图感展示</strong>
                <div class="muted" style="margin-top:8px; line-height:1.7;">当前按会议纪要改为图片感更强的展示结构，强化案例浏览和到店转化。</div>
              </div>
              <div style="display:grid; gap:14px;">
                ${store.stats
                  .map(
                    (item) => `
                      <div class="panel" style="padding:18px; background:rgba(255,255,255,0.04); box-shadow:none;">
                        <div class="muted">${item.label}</div>
                        <strong style="display:block; margin-top:8px; font-size:30px; font-family:var(--font-display);">${item.value}</strong>
                      </div>
                    `
                  )
                  .join("")}
              </div>
            </div>
          </article>
          <article class="panel showcase-side">
            <div class="panel-header">
              <div>
                <span class="eyebrow">Case Carousel</span>
                <h2 class="section-title">案例滚动展示</h2>
                <p class="section-subtitle">点击左右按钮或缩略项切换案例。</p>
              </div>
              <div style="display:flex; gap:8px;">
                <button class="btn btn-secondary" type="button" data-showcase-nav="prev">上一条</button>
                <button class="btn btn-primary" type="button" data-showcase-nav="next">下一条</button>
              </div>
            </div>
            ${
              activeCase
                ? `
                  <div style="display:grid; gap:16px;">
                    <div style="min-height:236px; border-radius:24px; padding:18px; display:grid; align-content:end; background:
                      linear-gradient(160deg, rgba(13,17,23,0.18), rgba(13,17,23,0.82)),
                      radial-gradient(circle at 75% 22%, rgba(88,200,255,0.24), transparent 28%),
                      linear-gradient(140deg, #1c232b, #3b434e);">
                      <span class="pill" style="width:max-content;">${activeCase.model}</span>
                      <strong style="display:block; margin-top:12px; font-size:30px;">${activeCase.title}</strong>
                      <div class="muted" style="margin-top:8px; line-height:1.7;">${activeCase.content || "案例说明待补充"}</div>
                    </div>
                    <div class="provider-display-list">
                      <div class="provider-display-item">
                        <div>
                          <strong>${activeCase.style}</strong>
                          <p>案例风格</p>
                        </div>
                        <span class="tag info">${activeCase.cost}</span>
                      </div>
                      <div class="provider-display-item">
                        <div>
                          <strong>${activeCase.display || "正常展示"}</strong>
                          <p>当前展示状态</p>
                        </div>
                        <span class="tag success">${activeCase.audit || "已通过"}</span>
                      </div>
                    </div>
                    <div style="display:grid; gap:10px;">
                      ${rows
                        .map(
                          (item, index) => `
                            <button class="provider-chat-thread ${index === state.showcaseIndex ? "active" : ""}" type="button" data-showcase-pick="${index}">
                              <div class="provider-chat-thread-head">
                                <strong>${item.title}</strong>
                                <span>${item.cost}</span>
                              </div>
                              <div class="provider-chat-thread-preview">${item.model} / ${item.style}</div>
                            </button>
                          `
                        )
                        .join("")}
                    </div>
                  </div>
                `
                : `<div class="muted">当前暂无案例数据。</div>`
            }
          </article>
        </section>

        <section class="provider-display-grid" style="grid-template-columns:1fr 1fr 1fr;">
          <article class="panel provider-display-panel">
            <div class="panel-header">
              <div>
                <h2 class="section-title">主推服务</h2>
                <p class="section-subtitle">保留服务信息，但减少长段文字。</p>
              </div>
            </div>
            <div class="provider-display-list">
              ${showcaseServices
                .map(
                  (item) => `
                    <div class="provider-display-item">
                      <div>
                        <strong>${item.title}</strong>
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
          <article class="panel provider-display-panel">
            <div class="panel-header">
              <div>
                <h2 class="section-title">门店位置</h2>
                <p class="section-subtitle">补充服务商位置信息展示。</p>
              </div>
            </div>
            <div style="min-height:210px; border-radius:22px; padding:18px; background:
              radial-gradient(circle at 20% 30%, rgba(88,200,255,0.16), transparent 30%),
              linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02));">
              <div class="provider-display-list">
                <div class="provider-display-item"><div><strong>${store.city}</strong><p>门店所在城市</p></div><span class="tag neutral">定位信息</span></div>
                <div class="provider-display-item"><div><strong>${store.address}</strong><p>详细地址</p></div><span class="tag info">可导航</span></div>
                <div class="provider-display-item"><div><strong>${store.hours}</strong><p>营业时间</p></div><span class="tag success">欢迎到店</span></div>
              </div>
            </div>
          </article>
          <article class="panel provider-display-panel">
            <div class="panel-header">
              <div>
                <h2 class="section-title">联系与转化</h2>
                <p class="section-subtitle">强调来电、到店、看案例。</p>
              </div>
            </div>
            <div class="provider-ad-cta">
              <strong>服务热线 ${store.hotline}</strong>
              <p>支持预约到店看车、案例讲解、实车方案报价。</p>
              <div style="display:flex; gap:10px; flex-wrap:wrap; margin-top:12px;">
                ${store.certifications.map((item) => `<span class="pill">${item}</span>`).join("")}
              </div>
            </div>
            <div style="display:flex; gap:10px; margin-top:14px;">
              <button class="btn btn-primary" type="button" data-provider-switch="cases">去维护案例</button>
              <button class="btn btn-secondary" type="button" data-provider-showcase-contact>联系平台</button>
            </div>
          </article>
        </section>
      </section>
    `;

    contentEl.querySelectorAll("[data-showcase-nav]").forEach((button) => {
      button.addEventListener("click", () => {
        const rows = getStoreCases();
        if (!rows.length) return;
        state.showcaseIndex =
          button.dataset.showcaseNav === "prev"
            ? (state.showcaseIndex - 1 + rows.length) % rows.length
            : (state.showcaseIndex + 1) % rows.length;
        renderContent();
      });
    });
    contentEl.querySelectorAll("[data-showcase-pick]").forEach((button) => {
      button.addEventListener("click", () => {
        state.showcaseIndex = Number(button.dataset.showcasePick) || 0;
        renderContent();
      });
    });
    contentEl.querySelectorAll("[data-provider-switch='cases']").forEach((button) => {
      button.addEventListener("click", () => {
        state.activeTab = "cases";
        renderTabs();
        renderContent();
      });
    });
    contentEl.querySelector("[data-provider-showcase-contact]")?.addEventListener("click", () => {
      openFeedbackModal("已发起联系", "平台客服会在 10 分钟内回电，协助门店更新展示素材。");
    });
  }

  function renderCaseManagePage() {
    const rows = getStoreCases();

    contentEl.innerHTML = `
      <section class="page-heading">
        <span class="eyebrow">Case Maintenance</span>
        <h1>案例维护</h1>
        <p class="muted">服务商 Web 新增案例维护页，支持新增、编辑、删除和查看展示状态。</p>
      </section>
      <section class="table-layout" style="margin-top:22px; grid-template-columns:1.05fr 0.95fr;">
        <article class="panel table-card">
          <div class="toolbar">
            <div class="toolbar-left">
              <span class="pill">共 ${rows.length} 条案例</span>
            </div>
            <div class="toolbar-right">
              <button class="btn btn-secondary" type="button" data-provider-case-toolbar="create">新增案例</button>
            </div>
          </div>
          <div class="mobile-list">
            ${rows
              .map(
                (item, index) => `
                  <article class="provider-case-card" style="padding:18px;">
                    <div class="provider-case-image" style="height:140px;"></div>
                    <strong>${item.title}</strong>
                    <p>${item.model} / ${item.style}</p>
                    <div class="provider-case-foot">
                      <span class="tag info">${item.cost}</span>
                      <span class="tag ${item.display === "首页展示" ? "success" : item.display === "未展示" ? "danger" : "neutral"}">${item.display || "正常展示"}</span>
                    </div>
                    <div style="display:flex; gap:10px; margin-top:14px; flex-wrap:wrap;">
                      <button class="btn btn-primary" type="button" data-provider-case-action="edit" data-case-id="${item.id}">编辑</button>
                      <button class="btn btn-secondary" type="button" data-provider-case-action="preview" data-case-id="${item.id}">预览</button>
                      <button class="btn btn-danger" type="button" data-provider-case-action="delete" data-case-id="${item.id}">删除</button>
                    </div>
                  </article>
                `
              )
              .join("")}
          </div>
        </article>
        <aside class="panel drawer-card">
          ${
            rows[0]
              ? `
                <div class="panel-header">
                  <div>
                    <h2 class="section-title">${rows[0].title}</h2>
                    <p class="section-subtitle">当前展示第一条案例的维护概览</p>
                  </div>
                </div>
                <div class="kv-list">
                  <div class="kv-row"><span class="muted">案例编号</span><strong>${rows[0].id}</strong></div>
                  <div class="kv-row"><span class="muted">适配车型</span><strong>${rows[0].model}</strong></div>
                  <div class="kv-row"><span class="muted">改装风格</span><strong>${rows[0].style}</strong></div>
                  <div class="kv-row"><span class="muted">展示状态</span><strong>${rows[0].display || "正常展示"}</strong></div>
                  <div class="kv-row"><span class="muted">案例说明</span><strong>${rows[0].content || "待补充"}</strong></div>
                </div>
              `
              : `<div class="muted">当前暂无案例数据，请先新增。</div>`
          }
        </aside>
      </section>
    `;

    contentEl.querySelector("[data-provider-case-toolbar='create']")?.addEventListener("click", () => {
      openCaseEditorModal("create");
    });
    contentEl.querySelectorAll("[data-provider-case-action]").forEach((button) => {
      button.addEventListener("click", () => {
        const target = cases.find((item) => item.id === button.dataset.caseId) || rows.find((item) => item.id === button.dataset.caseId);
        if (!target) return;
        const action = button.dataset.providerCaseAction;
        if (action === "edit") {
          openCaseEditorModal("edit", target);
          return;
        }
        if (action === "preview") {
          openFeedbackModal("案例预览", `${target.title} / ${target.model} / ${target.content || "案例说明待补充"}`);
          return;
        }
        openCaseDeleteModal(target);
      });
    });
  }

  function openCaseEditorModal(mode, row) {
    const isEdit = mode === "edit";
    const source = row || {
      id: `CA-${Date.now().toString().slice(-6)}`,
      title: "",
      model: "宝马 G20 330i",
      style: "黑武士街道风",
      cost: "¥ 26,800",
      image: "new-case-cover.jpg",
      content: "",
      display: "正常展示",
      audit: "待审核",
      provider: store.name,
    };
    modalCardEl.innerHTML = `
      <div class="panel-header">
        <div>
          <span class="eyebrow">Case Editor</span>
          <h2 class="section-title">${isEdit ? "编辑案例" : "新增案例"}</h2>
          <p class="section-subtitle">${source.id} / ${isEdit ? source.title : "创建新的服务商案例"}</p>
        </div>
      </div>
      <div class="form-grid">
        <div class="field-group">
          <div class="field-label">案例标题</div>
          <input class="input" data-provider-case-field="title" value="${source.title}" />
        </div>
        <div class="field-group">
          <div class="field-label">适配车型</div>
          <input class="input" data-provider-case-field="model" value="${source.model}" />
        </div>
        <div class="field-group">
          <div class="field-label">改装风格</div>
          <input class="input" data-provider-case-field="style" value="${source.style}" />
        </div>
        <div class="field-group">
          <div class="field-label">案例费用</div>
          <input class="input" data-provider-case-field="cost" value="${source.cost}" />
        </div>
        <div class="field-group field-group-full">
          <div class="field-label">封面图</div>
          <input class="input" data-provider-case-field="image" value="${source.image || ""}" />
        </div>
        <div class="field-group field-group-full">
          <div class="field-label">案例简介</div>
          <textarea class="textarea" data-provider-case-field="content">${source.content || ""}</textarea>
        </div>
        <div class="field-group">
          <div class="field-label">展示状态</div>
          <select class="select" data-provider-case-field="display">
            ${["首页展示", "正常展示", "未展示"]
              .map((item) => `<option value="${item}" ${item === source.display ? "selected" : ""}>${item}</option>`)
              .join("")}
          </select>
        </div>
      </div>
      <div style="display:flex; gap:12px; margin-top:18px;">
        <button class="btn btn-primary" type="button" data-provider-case-save data-mode="${mode}" data-case-id="${source.id}">${isEdit ? "保存修改" : "确认新增"}</button>
        <button class="btn btn-secondary" type="button" data-provider-case-close>取消</button>
      </div>
    `;
    modalEl.classList.add("visible");

    modalCardEl.querySelector("[data-provider-case-close]")?.addEventListener("click", closeModal);
    modalCardEl.querySelector("[data-provider-case-save]")?.addEventListener("click", () => {
      saveProviderCase(mode, source.id);
    });
  }

  function saveProviderCase(mode, caseId) {
    const getValue = (field) => modalCardEl.querySelector(`[data-provider-case-field="${field}"]`)?.value.trim() || "";
    const payload = {
      id: caseId,
      title: getValue("title"),
      model: getValue("model"),
      style: getValue("style"),
      cost: getValue("cost"),
      image: getValue("image"),
      content: getValue("content"),
      display: getValue("display"),
      audit: "待审核",
      provider: store.name,
    };
    if (!payload.title || !payload.model || !payload.image || !payload.content) {
      openFeedbackModal("信息不完整", "请填写案例标题、适配车型、封面图和案例简介。");
      return;
    }
    if (mode === "edit") {
      const target = cases.find((item) => item.id === caseId);
      if (target) Object.assign(target, payload);
      closeModal();
      openFeedbackModal("案例已更新", `${payload.title} 的案例资料已保存。`);
      return;
    }
    cases.unshift(payload);
    state.showcaseIndex = 0;
    closeModal();
    openFeedbackModal("案例已新增", `${payload.title} 已加入案例维护列表。`);
  }

  function openCaseDeleteModal(row) {
    modalCardEl.innerHTML = `
      <div class="panel-header">
        <div>
          <span class="eyebrow">Case Delete</span>
          <h2 class="section-title">删除案例</h2>
          <p class="section-subtitle">确认删除案例“${row.title}”吗？</p>
        </div>
      </div>
      <div style="display:flex; gap:12px; margin-top:18px;">
        <button class="btn btn-danger" type="button" data-provider-case-delete="${row.id}">确认删除</button>
        <button class="btn btn-secondary" type="button" data-provider-case-close>取消</button>
      </div>
    `;
    modalEl.classList.add("visible");
    modalCardEl.querySelector("[data-provider-case-close]")?.addEventListener("click", closeModal);
    modalCardEl.querySelector("[data-provider-case-delete]")?.addEventListener("click", () => {
      const index = cases.findIndex((item) => item.id === row.id);
      if (index !== -1) cases.splice(index, 1);
      closeModal();
      openFeedbackModal("案例已删除", `${row.title} 已从案例维护列表移除。`);
    });
  }

  function renderContent() {
    if (state.activeTab === "showcase") {
      renderShowcasePage();
      return;
    }
    if (state.activeTab === "cases") {
      renderCaseManagePage();
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
        <button class="btn btn-primary" type="button" data-provider-case-close>我知道了</button>
      </div>
    `;
    modalEl.classList.add("visible");
    modalCardEl.querySelector("[data-provider-case-close]")?.addEventListener("click", () => {
      closeModal();
      renderContent();
    });
  }

  function closeModal() {
    modalEl.classList.remove("visible");
  }

  modalEl.addEventListener("click", (event) => {
    if (event.target === modalEl) closeModal();
  });

  renderTabs();
  renderContent();
})();
