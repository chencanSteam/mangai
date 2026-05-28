(function () {
  const data = window.MockData || {};
  const account = (data.brandAccounts || [])[0] || { brandName: "BBS", name: "品牌运营", account: "brand_admin", status: "正常" };
  const appEl = document.getElementById("brandWebApp");
  const navEl = document.getElementById("brandWebNav");
  const accountEl = document.getElementById("brandWebAccount");
  const SHIPMENT_KEY = "mockBrandShipments";
  const state = { tab: new URLSearchParams(window.location.search).get("tab") || "dashboard", feedback: "" };

  const navItems = [
    { id: "dashboard", label: "工作台" },
    { id: "pending", label: "待发货订单" },
    { id: "shipped", label: "已发货订单" },
    { id: "products", label: "商品概览" },
    { id: "account", label: "账号信息" },
  ];

  function safe(value, fallback = "-") {
    return value === undefined || value === null || value === "" ? fallback : String(value);
  }

  function escapeHtml(value) {
    return safe(value, "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
  }

  function readShipments() {
    try {
      const rows = JSON.parse(localStorage.getItem(SHIPMENT_KEY) || "[]");
      return Array.isArray(rows) ? rows : [];
    } catch (error) {
      return [];
    }
  }

  function writeShipments(rows) {
    localStorage.setItem(SHIPMENT_KEY, JSON.stringify(rows));
  }

  function brandProducts() {
    return (data.products || []).filter((item) => item.brand === account.brandName);
  }

  function baseBrandOrders() {
    const productNames = brandProducts().map((item) => item.name);
    return (data.orders || []).filter((order) => productNames.some((name) => safe(order.service, "").includes(name)) || safe(order.service, "").includes(account.brandName));
  }

  function brandOrders() {
    const shipments = readShipments();
    return baseBrandOrders().map((order) => {
      const shipment = shipments.find((item) => item.orderId === order.id);
      return shipment ? { ...order, status: "已发货", progress: `已发货，物流单号 ${shipment.trackingNo}`, shipment } : order;
    });
  }

  function isShipped(order) {
    return !!order.shipment || safe(order.status, "").includes("已发货");
  }

  function renderNav() {
    navEl.innerHTML = navItems.map((item) => `<button class="${state.tab === item.id ? "active" : ""}" type="button" data-brand-tab="${item.id}">${item.label}</button>`).join("");
    accountEl.innerHTML = `<strong>${escapeHtml(account.brandName)}</strong><span>${escapeHtml(account.account)} / ${escapeHtml(account.status)}</span>`;
  }

  function renderDashboard() {
    const orders = brandOrders();
    const pending = orders.filter((item) => !isShipped(item));
    const shipped = orders.filter(isShipped);
    return `<div class="brand-web-stack">${state.feedback ? `<div class="provider-feedback">${state.feedback}</div>` : ""}<section class="brand-web-metrics"><article><span>当前品牌</span><strong>${escapeHtml(account.brandName)}</strong></article><article><span>待发货订单</span><strong>${pending.length}</strong></article><article><span>已发货订单</span><strong>${shipped.length}</strong></article><article><span>上架商品</span><strong>${brandProducts().length}</strong></article></section><section class="brand-web-panel"><div class="brand-web-section-head"><div><span class="eyebrow">Pending</span><h2>待处理发货</h2></div><button class="btn btn-primary" type="button" data-brand-tab="pending">处理发货</button></div>${renderOrderTable(pending.slice(0, 4), false)}</section></div>`;
  }

  function renderOrderTable(rows, shipped) {
    if (!rows.length) return `<div class="brand-web-empty">暂无${shipped ? "已发货" : "待发货"}订单</div>`;
    return `<div class="brand-web-table">${rows.map((order) => `<article class="brand-web-row"><div><strong>${escapeHtml(order.id)}</strong><span>${escapeHtml(order.service)}</span></div><div><span>用户</span><strong>${escapeHtml(order.user)}</strong></div><div><span>金额</span><strong>${escapeHtml(order.quote)}</strong></div><div><span>状态</span><strong>${escapeHtml(isShipped(order) ? "已发货" : safe(order.status, "待发货"))}</strong></div>${shipped ? `<div><span>物流</span><strong>${escapeHtml(order.shipment?.carrier || order.shippingCompany || "-")} ${escapeHtml(order.shipment?.trackingNo || order.shippingNo || "")}</strong></div>` : `<button class="btn btn-secondary" type="button" data-brand-tab="pending">去发货</button>`}</article>`).join("")}</div>`;
  }

  function renderPending() {
    const rows = brandOrders().filter((item) => !isShipped(item));
    return `<div class="brand-web-stack">${state.feedback ? `<div class="provider-feedback">${state.feedback}</div>` : ""}<section class="brand-web-panel"><div class="brand-web-section-head"><div><span class="eyebrow">Shipment</span><h2>待发货订单</h2></div></div>${rows.map(renderShipmentForm).join("") || `<div class="brand-web-empty">当前品牌没有待发货订单</div>`}</section></div>`;
  }

  function renderShipmentForm(order) {
    return `<form class="brand-web-shipment" data-brand-ship-form data-order-id="${escapeHtml(order.id)}"><div><strong>${escapeHtml(order.id)}</strong><span>${escapeHtml(order.service)} / ${escapeHtml(order.user)} / ${escapeHtml(order.quote)}</span></div><div class="brand-web-form-grid"><input class="input" name="carrier" value="顺丰速运" placeholder="物流公司" required><input class="input" name="trackingNo" value="SF${Date.now().toString().slice(-8)}" placeholder="物流单号" required><input class="input" name="remark" value="品牌仓已出库，预计 2 天送达" placeholder="发货备注"></div><button class="btn btn-primary" type="submit">确认发货</button></form>`;
  }

  function renderShipped() {
    return `<div class="brand-web-stack"><section class="brand-web-panel"><div class="brand-web-section-head"><div><span class="eyebrow">Shipped</span><h2>已发货订单</h2></div></div>${renderOrderTable(brandOrders().filter(isShipped), true)}</section></div>`;
  }

  function renderProducts() {
    const rows = brandProducts();
    return `<div class="brand-web-stack"><section class="brand-web-panel"><div class="brand-web-section-head"><div><span class="eyebrow">Products</span><h2>商品概览</h2></div><span class="pill">仅展示</span></div><div class="brand-web-products">${rows.map((item) => `<article><span>${escapeHtml(item.category)}</span><strong>${escapeHtml(item.name)}</strong><small>${escapeHtml(item.fitment)} / 库存 ${escapeHtml(item.stock)}</small><b>${escapeHtml(item.price)}</b></article>`).join("")}</div></section></div>`;
  }

  function renderAccount() {
    return `<div class="brand-web-stack"><section class="brand-web-panel"><div class="brand-web-section-head"><div><span class="eyebrow">Account</span><h2>账号信息</h2></div></div><div class="admin-kv-list"><div><span>品牌</span><strong>${escapeHtml(account.brandName)}</strong></div><div><span>账号</span><strong>${escapeHtml(account.account)}</strong></div><div><span>运营名称</span><strong>${escapeHtml(account.name)}</strong></div><div><span>联系人</span><strong>${escapeHtml(account.contact)}</strong></div><div><span>状态</span><strong>${escapeHtml(account.status)}</strong></div></div></section></div>`;
  }

  function render() {
    renderNav();
    appEl.innerHTML = state.tab === "pending" ? renderPending() : state.tab === "shipped" ? renderShipped() : state.tab === "products" ? renderProducts() : state.tab === "account" ? renderAccount() : renderDashboard();
    bindEvents();
  }

  function bindEvents() {
    document.querySelectorAll("[data-brand-tab]").forEach((button) => {
      button.addEventListener("click", () => {
        state.tab = button.dataset.brandTab || "dashboard";
        state.feedback = "";
        render();
      });
    });
    document.querySelectorAll("[data-brand-ship-form]").forEach((form) => {
      form.addEventListener("submit", (event) => {
        event.preventDefault();
        const formData = new FormData(form);
        const row = {
          orderId: form.dataset.orderId,
          carrier: String(formData.get("carrier") || "").trim(),
          trackingNo: String(formData.get("trackingNo") || "").trim(),
          remark: String(formData.get("remark") || "").trim(),
          shippedAt: new Date().toLocaleString("zh-CN", { hour12: false }),
        };
        writeShipments([row, ...readShipments().filter((item) => item.orderId !== row.orderId)]);
        state.feedback = `${row.orderId} 已确认发货，物流单号 ${row.trackingNo}。`;
        state.tab = "shipped";
        render();
      });
    });
  }

  render();
})();
