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
    caseIndex: 0,
  };

  const showcaseServices = services
    .filter((item) => item.status !== "停用")
    .slice(0, 4)
    .map((item, index) => ({
      title: item.name,
      desc: item.desc,
      price: item.basePrice || item.price || `¥ ${(index + 1) * 3600}`,
    }));

  function tagType(text) {
    if (!text) return "neutral";
    if (["正常营业", "已通过", "启用", "上架", "正常", "已完成", "已签收", "生效中", "首页展示", "正常展示"].includes(text)) return "success";
    if (["待审核", "待分配", "待发货", "待签收", "待处理", "审核中", "施工中", "运输中"].includes(text)) return "warning";
    if (["已驳回", "已拒单", "停用", "暂停接单", "异常签收", "已删除", "缺货", "未展示"].includes(text)) return "danger";
    if (["已支付", "平台账号", "服务商账号", "定位信息", "可导航"].includes(text)) return "info";
    return "neutral";
  }

  function formatTag(text) {
    return `<span class="tag ${tagType(text)}">${text}</span>`;
  }

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

  function getActiveManageCase() {
    const rows = getStoreCases();
    if (!rows.length) return null;
    if (state.caseIndex >= rows.length) state.caseIndex = 0;
    return rows[state.caseIndex];
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

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
    return text || "";
  }

  function renderCaseRichContent(content) {
    const html = normalizeCaseRichContent(content);
    return html ? `<div class="case-rich-content">${html}</div>` : `<div class="case-rich-content"></div>`;
  }

  function getCaseImageMeta(image, imagePreview = "") {
    if (image && typeof image === "object") {
      return {
        name: image.name || "",
        preview: image.url || imagePreview || "",
      };
    }
    return {
      name: image || "",
      preview: imagePreview || "",
    };
  }

  function renderCaseCoverPreview(image, title, compact = false, imagePreview = "") {
    const safeTitle = title || "";
    const imageMeta = getCaseImageMeta(image, imagePreview);
    const safeImage = imageMeta.name;
    return `
      <div class="case-cover-preview ${compact ? "case-cover-preview-compact" : ""} ${imageMeta.preview ? "has-image" : ""}" ${imageMeta.preview ? `style="background-image:linear-gradient(180deg, rgba(10,12,16,0.14), rgba(10,12,16,0.82)), url('${imageMeta.preview}');"` : ""}>
        <strong>${safeTitle}</strong>
        ${safeImage ? `<small>${safeImage}</small>` : ""}
      </div>
    `;
  }

  function renderProviderCaseDetailPanel(row) {
    return `
      <div class="panel-header">
        <div>
          <h2 class="section-title">${row.title}</h2>
        </div>
      </div>
      <div style="display:flex; gap:10px; flex-wrap:wrap; margin-bottom:18px;">
        ${[row.audit, row.display, row.provider].filter(Boolean).map((item) => formatTag(item)).join("")}
      </div>
      <div class="case-detail-shell">
        ${renderCaseCoverPreview(row.image, row.title, false, row.imagePreview || "")}
        <div class="case-detail-metrics">
          ${[
            ["案例编号", row.id],
            ["服务商", row.provider],
            ["车型", row.model],
            ["风格", row.style],
            ["费用", row.cost],
            ["审核状态", row.audit],
            ["展示状态", row.display],
          ]
            .map(
              ([label, value]) => `
                <div class="case-detail-card">
                  <span>${label}</span>
                  <strong>${value || "-"}</strong>
                </div>
              `
            )
            .join("")}
        </div>
        <div class="case-detail-section">
          <h3>案例说明</h3>
          ${renderCaseRichContent(row.content)}
        </div>
        <div class="case-detail-section">
          <h3>处理轨迹</h3>
          <div class="timeline">
            ${(row.timeline || ["暂无处理轨迹"]).map((item) => `<div class="timeline-item">${item}</div>`).join("")}
          </div>
        </div>
        <div style="display:flex; gap:10px; flex-wrap:wrap;">
          <button class="btn btn-secondary" type="button" data-provider-case-detail="edit">编辑案例</button>
          <button class="btn btn-danger" type="button" data-provider-case-detail="delete">删除案例</button>
        </div>
      </div>
    `;
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
          <h1>服务商入驻申请</h1>
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
              <h2 class="section-title">门店资质</h2>
            </div>
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
    const featuredCerts = store.certifications.slice(0, 3);
    const showcaseStats = store.stats.slice(0, 4);

    contentEl.innerHTML = `
      <section class="stack">
        <section class="showcase-hero">
          <article class="panel showcase-cover showcase-cover-premium" style="min-height:520px;">
            <div class="showcase-store-head">
              <div>
                <h1 class="showcase-store-title">${store.name}</h1>
                <p class="provider-display-slogan showcase-store-subtitle">${store.city} / ${store.slogan}</p>
              </div>
              <div class="showcase-store-badges">
                ${featuredCerts.map((item) => `<span class="pill">${item}</span>`).join("")}
              </div>
            </div>
            <div class="showcase-meta-chips">
              <span class="showcase-meta-chip">合同 ${store.contractNo}</span>
              <span class="showcase-meta-chip">状态 ${store.contractStatus}</span>
              <span class="showcase-meta-chip">${store.address}</span>
            </div>
            <div class="showcase-overview">
              <div class="showcase-store-visual">
                <span class="pill">门店主视觉</span>
                <strong>${store.slogan}</strong>
                <small>${store.city} / 高端性能升级与精品姿态改装</small>
              </div>
              <div class="showcase-stat-grid">
                ${showcaseStats
                  .map(
                    (item) => `
                      <div class="showcase-stat-card">
                        <span>${item.label}</span>
                        <strong>${item.value}</strong>
                      </div>
                    `
                  )
                  .join("")}
              </div>
            </div>
          </article>
          <article class="panel showcase-side showcase-case-panel">
            <div class="panel-header showcase-case-head">
              <div>
                <h2 class="section-title">案例滚动展示</h2>
              </div>
              <div class="showcase-case-nav">
                <button class="btn btn-secondary" type="button" data-showcase-nav="prev">上一条</button>
                <button class="btn btn-primary" type="button" data-showcase-nav="next">下一条</button>
              </div>
            </div>
            ${
              activeCase
                ? `
                  <div class="showcase-case-stage">
                    <div class="showcase-case-visual">
                      <strong>${activeCase.title}</strong>
                    </div>
                  </div>
                `
                : `<div class="muted">当前暂无案例数据。</div>`
            }
          </article>
        </section>

        <section class="provider-display-grid provider-display-grid-premium">
          <article class="panel provider-display-panel">
            <div class="panel-header">
              <div>
                <h2 class="section-title">主推服务</h2>
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
              </div>
            </div>
            <div class="showcase-location-card">
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
              </div>
            </div>
            <div class="provider-ad-cta showcase-contact-card">
              <strong>服务热线 ${store.hotline}</strong>
              <p>支持预约到店看车、案例讲解、实车方案报价。</p>
              <div class="showcase-contact-tags">
                ${store.certifications.map((item) => `<span class="pill">${item}</span>`).join("")}
              </div>
            </div>
            <div class="showcase-contact-actions">
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
    const selected = getActiveManageCase();

    contentEl.innerHTML = `
      <section class="page-heading">
        <h1>案例维护</h1>
      </section>
      <section class="table-layout case-layout" style="margin-top:22px;">
        <article class="panel table-card case-board">
          <div class="toolbar">
            <div class="toolbar-left">
              <span class="pill">共 ${rows.length} 条案例</span>
            </div>
            <div class="toolbar-right">
              <button class="btn btn-secondary" type="button" data-provider-case-toolbar="create">新增案例</button>
              <button class="btn btn-primary" type="button" data-provider-case-toolbar="edit" ${selected ? "" : "disabled"}>编辑案例</button>
              <button class="btn btn-danger" type="button" data-provider-case-toolbar="delete" ${selected ? "" : "disabled"}>删除案例</button>
            </div>
          </div>
          <div class="case-feed">
            ${rows
              .map(
                (item, index) => `
                  <article class="case-card ${index === state.caseIndex ? "active" : ""}" data-provider-case-pick="${index}">
                    ${renderCaseCoverPreview(item.image, item.title, true, item.imagePreview || "")}
                    <div class="case-card-body">
                      <div class="case-card-top">
                        <div>
                          <h3>${item.title}</h3>
                          <div class="case-card-meta">
                            <span>${item.provider}</span>
                            <span>${item.model}</span>
                          </div>
                        </div>
                        ${formatTag(item.display || "正常展示")}
                      </div>
                      <div class="case-card-tags">
                        ${formatTag(item.audit || "待审核")}
                        <span class="pill">${item.style}</span>
                        <span class="pill">${item.cost}</span>
                      </div>
                      <p>${getCaseContentSummary(item.content)}</p>
                    </div>
                  </article>
                `
              )
              .join("")}
          </div>
        </article>
        <aside class="panel drawer-card">
          ${
            selected
              ? `
                ${renderProviderCaseDetailPanel(selected)}
              `
              : `<div class="muted">当前暂无案例数据，请先新增。</div>`
          }
        </aside>
      </section>
    `;

    contentEl.querySelector("[data-provider-case-toolbar='create']")?.addEventListener("click", () => {
      openCaseEditorModal("create");
    });
    contentEl.querySelector("[data-provider-case-toolbar='edit']")?.addEventListener("click", () => {
      if (selected) openCaseEditorModal("edit", selected);
    });
    contentEl.querySelector("[data-provider-case-toolbar='delete']")?.addEventListener("click", () => {
      if (selected) openCaseDeleteModal(selected);
    });
    contentEl.querySelectorAll("[data-provider-case-pick]").forEach((button) => {
      button.addEventListener("click", () => {
        state.caseIndex = Number(button.dataset.providerCasePick) || 0;
        renderContent();
      });
    });
    contentEl.querySelectorAll("[data-provider-case-detail]").forEach((button) => {
      button.addEventListener("click", () => {
        if (!selected) return;
        if (button.dataset.providerCaseDetail === "edit") {
          openCaseEditorModal("edit", selected);
          return;
        }
        openCaseDeleteModal(selected);
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
      imagePreview: "",
      content: "",
      display: "未展示",
      audit: "待审核",
      provider: store.name,
    };
    modalCardEl.innerHTML = `
      <div class="case-editor-modal" data-provider-case-editor data-audit="${source.audit || "待审核"}" data-display="${source.display || "未展示"}">
        <div class="panel-header">
          <div>
            <h2 class="section-title">${isEdit ? "编辑案例" : "新增案例"}</h2>
            <p class="section-subtitle">${source.id}</p>
          </div>
        </div>
        <div class="case-editor-preview" data-provider-case-editor-preview>
          ${renderCaseCoverPreview(source.image, source.title || "", false, source.imagePreview || "")}
          <div class="case-editor-preview-copy">
            <div class="case-card-tags" data-provider-case-editor-tags>
              ${formatTag(source.audit || "待审核")}
              ${formatTag(source.display || "未展示")}
              <span class="pill">${store.name}</span>
            </div>
            <h3 data-provider-case-preview-title>${source.title || ""}</h3>
            <p data-provider-case-preview-summary>${getCaseContentSummary(source.content)}</p>
            <div class="case-editor-preview-meta">
              <span data-provider-case-preview-model>${source.model}</span>
              <span data-provider-case-preview-style>${source.style}</span>
              <span data-provider-case-preview-cost>${source.cost}</span>
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
              <input class="input" data-provider-case-field="title" placeholder="请输入案例标题" value="${source.title}" />
            </div>
            <div class="field-group">
              <div class="field-label">适配车型</div>
              <input class="input" data-provider-case-field="model" placeholder="请输入车型" value="${source.model}" />
            </div>
            <div class="field-group">
              <div class="field-label">改装风格</div>
              <input class="input" data-provider-case-field="style" placeholder="请输入改装风格" value="${source.style}" />
            </div>
            <div class="field-group">
              <div class="field-label">案例费用</div>
              <input class="input" data-provider-case-field="cost" placeholder="例如 ¥ 26,800" value="${source.cost}" />
            </div>
          </div>
        </div>
        <div class="case-editor-section">
          <div class="case-editor-section-head">
            <h3>展示状态</h3>
            <span>${source.display || "未展示"}</span>
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
              <input type="hidden" data-provider-case-field="imagePreview" value="${source.imagePreview || ""}" />
              <label class="upload-panel case-upload-panel">
                <input class="upload-input" data-provider-case-upload type="file" accept="image/*" />
                <span class="upload-illustration"></span>
                <strong>上传封面</strong>
                <small>选择图片后自动回填文件名，并同步更新右侧预览。</small>
              </label>
              <input class="input" data-provider-case-field="image" placeholder="上传后自动回填封面图名称" value="${typeof source.image === "object" ? source.image.name || "" : source.image || ""}" readonly />
            </div>
            <div class="field-group field-group-full">
              <div class="field-label">案例说明</div>
              <div class="case-rich-toolbar">
                <button class="btn btn-secondary" type="button" data-provider-case-rich-command="paragraph">正文</button>
                <button class="btn btn-secondary" type="button" data-provider-case-rich-command="heading">标题</button>
                <button class="btn btn-secondary" type="button" data-provider-case-rich-command="bold">加粗</button>
                <label class="btn btn-secondary case-rich-upload">
                  <input class="upload-input" data-provider-case-rich-image type="file" accept="image/*" />
                  插入图片
                </label>
                <label class="btn btn-secondary case-rich-upload">
                  <input class="upload-input" data-provider-case-rich-video type="file" accept="video/*" />
                  插入视频
                </label>
              </div>
              <input type="hidden" data-provider-case-field="content" value="${escapeHtml(normalizeCaseRichContent(source.content || ""))}" />
              <div class="case-rich-editor" data-provider-case-rich-editor contenteditable="true">${normalizeCaseRichContent(source.content || "")}</div>
            </div>
          </div>
        </div>
        <div style="display:flex; gap:12px; margin-top:18px;">
          <button class="btn btn-primary" type="button" data-provider-case-save data-mode="${mode}" data-case-id="${source.id}">${isEdit ? "保存修改" : "确认新增"}</button>
          <button class="btn btn-secondary" type="button" data-provider-case-close>取消</button>
        </div>
      </div>
    `;
    modalEl.classList.add("visible");

    modalCardEl.querySelector("[data-provider-case-close]")?.addEventListener("click", closeModal);
    modalCardEl.querySelector("[data-provider-case-save]")?.addEventListener("click", () => {
      saveProviderCase(mode, source.id);
    });
    bindProviderCaseEditorEvents();
  }
  function saveProviderCase(mode, caseId) {
    const getValue = (field) => modalCardEl.querySelector(`[data-provider-case-field="${field}"]`)?.value.trim() || "";
    const currentTarget = cases.find((item) => item.id === caseId);
    const payload = {
      id: caseId,
      title: getValue("title"),
      model: getValue("model"),
      style: getValue("style"),
      cost: getValue("cost"),
      image: getValue("image"),
      imagePreview: getValue("imagePreview"),
      content: getValue("content"),
      display: mode === "edit" ? currentTarget?.display || "未展示" : "未展示",
      audit: "待审核",
      provider: store.name,
      timeline: [`${new Date().toISOString().slice(0, 16).replace("T", " ")} 服务商${mode === "edit" ? "更新" : "新增"}案例：${getValue("title")}`],
    };
    if (!payload.title || !payload.model || !payload.style || !payload.cost || !payload.image || !payload.content) {
      openFeedbackModal("信息不完整", "请填写案例标题、适配车型、改装风格、案例费用、封面图和案例说明。");
      return;
    }
    if (mode === "edit") {
      const target = currentTarget;
      if (target) {
        Object.assign(target, payload, { audit: target.audit, timeline: target.timeline || [] });
        target.timeline.unshift(`${new Date().toISOString().slice(0, 16).replace("T", " ")} 服务商更新案例信息：${target.title}`);
      }
      closeModal();
      openFeedbackModal("案例已更新", `${payload.title} 的案例资料已保存。`);
      return;
    }
    cases.unshift(payload);
    state.caseIndex = 0;
    state.showcaseIndex = 0;
    closeModal();
    openFeedbackModal("案例已新增", `${payload.title} 已加入案例维护列表。`);
  }
  function syncProviderCaseEditorPreview() {
    const getValue = (field) => modalCardEl.querySelector(`[data-provider-case-field="${field}"]`)?.value.trim() || "";
    const editorRoot = modalCardEl.querySelector("[data-provider-case-editor]");
    const audit = editorRoot?.dataset.audit || "待审核";
    const title = getValue("title") || "";
    const model = getValue("model") || "";
    const style = getValue("style") || "";
    const cost = getValue("cost") || "";
    const image = getValue("image") || "";
    const imagePreview = getValue("imagePreview");
    const display = editorRoot?.dataset.display || "未展示";
    const contentSummary = getCaseContentSummary(getValue("content"));

    const previewEl = modalCardEl.querySelector("[data-provider-case-editor-preview]");
    if (previewEl) {
      previewEl.querySelector(".case-cover-preview")?.replaceWith(
        (() => {
          const wrapper = document.createElement("div");
          wrapper.innerHTML = renderCaseCoverPreview(image, title, false, imagePreview);
          return wrapper.firstElementChild;
        })()
      );
    }

    modalCardEl.querySelector("[data-provider-case-preview-title]")?.replaceChildren(title);
    modalCardEl.querySelector("[data-provider-case-preview-summary]")?.replaceChildren(contentSummary);
    modalCardEl.querySelector("[data-provider-case-preview-model]")?.replaceChildren(model);
    modalCardEl.querySelector("[data-provider-case-preview-style]")?.replaceChildren(style);
    modalCardEl.querySelector("[data-provider-case-preview-cost]")?.replaceChildren(cost);

    const tagsEl = modalCardEl.querySelector("[data-provider-case-editor-tags]");
    if (tagsEl) {
      tagsEl.innerHTML = `${formatTag(audit)}${formatTag(display)}<span class="pill">${store.name}</span>`;
    }
  }
  function syncProviderCaseRichEditorField() {
    const editor = modalCardEl.querySelector("[data-provider-case-rich-editor]");
    const contentField = modalCardEl.querySelector('[data-provider-case-field="content"]');
    if (!editor || !contentField) return;
    contentField.value = editor.innerHTML.trim();
    syncProviderCaseEditorPreview();
  }

  function appendProviderCaseRichMedia(type, file) {
    const editor = modalCardEl.querySelector("[data-provider-case-rich-editor]");
    if (!editor || !file) return;
    const mediaUrl = URL.createObjectURL(file);
    const safeName = escapeHtml(file.name || (type === "video" ? "视频素材" : "图片素材"));
    const block =
      type === "video"
        ? `<figure class="case-rich-media"><video controls src="${mediaUrl}"></video><figcaption>${safeName}</figcaption></figure>`
        : `<figure class="case-rich-media"><img src="${mediaUrl}" alt="${safeName}" /><figcaption>${safeName}</figcaption></figure>`;
    editor.insertAdjacentHTML("beforeend", block);
    syncProviderCaseRichEditorField();
  }

  function bindProviderCaseEditorEvents() {
    modalCardEl.querySelectorAll("[data-provider-case-field]").forEach((field) => {
      const eventName = field.tagName === "SELECT" ? "change" : "input";
      field.addEventListener(eventName, syncProviderCaseEditorPreview);
    });

    const richEditor = modalCardEl.querySelector("[data-provider-case-rich-editor]");
    if (richEditor) {
      richEditor.addEventListener("input", syncProviderCaseRichEditorField);
    }

    modalCardEl.querySelectorAll("[data-provider-case-rich-command]").forEach((button) => {
      button.addEventListener("click", () => {
        const editor = modalCardEl.querySelector("[data-provider-case-rich-editor]");
        if (!editor) return;
        editor.focus();
        const command = button.dataset.providerCaseRichCommand;
        if (command === "heading") document.execCommand("formatBlock", false, "h3");
        if (command === "paragraph") document.execCommand("formatBlock", false, "p");
        if (command === "bold") document.execCommand("bold");
        syncProviderCaseRichEditorField();
      });
    });

    const imageInput = modalCardEl.querySelector("[data-provider-case-rich-image]");
    if (imageInput) {
      imageInput.addEventListener("change", () => {
        const file = imageInput.files?.[0];
        if (!file) return;
        appendProviderCaseRichMedia("image", file);
        imageInput.value = "";
      });
    }

    const videoInput = modalCardEl.querySelector("[data-provider-case-rich-video]");
    if (videoInput) {
      videoInput.addEventListener("change", () => {
        const file = videoInput.files?.[0];
        if (!file) return;
        appendProviderCaseRichMedia("video", file);
        videoInput.value = "";
      });
    }

    const caseUploadInput = modalCardEl.querySelector("[data-provider-case-upload]");
    if (caseUploadInput) {
      caseUploadInput.addEventListener("change", () => {
        const file = caseUploadInput.files?.[0];
        if (!file) return;
        const imageField = modalCardEl.querySelector('[data-provider-case-field="image"]');
        const imagePreviewField = modalCardEl.querySelector('[data-provider-case-field="imagePreview"]');
        if (imageField) imageField.value = file.name;
        if (imagePreviewField) imagePreviewField.value = URL.createObjectURL(file);
        syncProviderCaseEditorPreview();
      });
    }

    syncProviderCaseRichEditorField();
    syncProviderCaseEditorPreview();
  }
  function openCaseDeleteModal(row) {
    modalCardEl.innerHTML = `
      <div class="panel-header">
        <div>
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
