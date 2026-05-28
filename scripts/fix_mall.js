const fs = require('fs');

const file = 'assets/js/mobile-app.js';
let content = fs.readFileSync(file, 'utf-8');
const lines = content.split('\n');

// Find renderUserMallHome
const startIdx = lines.findIndex(l => l.includes('function renderUserMallHome()'));
if (startIdx === -1) { console.log('renderUserMallHome not found'); process.exit(1); }

// Find end
let braceCount = 0;
let foundOpen = false;
let endIdx = startIdx;
for (let j = startIdx; j < lines.length; j++) {
  for (const ch of lines[j]) {
    if (ch === '{') { braceCount++; foundOpen = true; }
    else if (ch === '}') { braceCount--; }
  }
  if (foundOpen && braceCount === 0) { endIdx = j; break; }
}

console.log(`renderUserMallHome at lines ${startIdx+1}-${endIdx+1}`);

const newFunc = `  function renderUserMallHome() {
    const selectedVehicle = getSelectedUserVehicle();
    const categoryMeta = getUserMallCategoryMeta();
    const brandOptions = getUserMallBrandOptions();
    const activeBrand = state.userMall.brand && brandOptions.includes(state.userMall.brand) ? state.userMall.brand : brandOptions[0] || "";
    const modelOptions = getUserMallModelOptions(activeBrand);
    const activeModel = state.userMall.model && modelOptions.includes(state.userMall.model) ? state.userMall.model : modelOptions[0] || "";
    const rows = getUserMallFilteredProducts(activeBrand, activeModel);
    const resultSummary = \`\${rows.length} 件商品\`;
    const cartCount = getUserCartItems().reduce((sum, item) => sum + Number(item.quantity || 0), 0);
    const { brands: brandList } = window.MockData;
    const bannerText = fallback.userBanners[0];
    return \`<div class="stack user-mall-page">\${state.userFeedback ? \`<div class="provider-feedback">\${state.userFeedback}</div>\` : ""}<section class="user-mall-banner"><div class="mall-banner-visual" data-tone="1"><div class="mall-banner-copy"><div class="mall-banner-overline">本周推荐</div><h2>高端姿态方案</h2><p>\${bannerText}</p><a class="btn btn-primary mall-banner-cta" href="user-product-detail.html?sku=PR-8801&name=BBS%20锻造轮毂%2019寸&price=%C2%A5%2018,800&brand=BBS&fitment=宝马%203系%20/%20奥迪%20A4L&mallPage=wheel">立即选购</a></div></div></section><section class="user-mall-brands"><div class="mall-brands-head"><strong>签约品牌</strong><span>\${brandList.length}+ 全球改装品牌</span></div><div class="mall-brands-scroll">\${brandList.map((b) => \`<div class="mall-brand-item"><div class="mall-brand-logo" data-brand="\${b.id}"></div><span>\${b.name}</span></div>\`).join("")}</div></section><section class="user-mall-shell"><div class="user-mall-toolbar"><form class="user-mall-search" data-user-mall-search-form><input class="input user-mall-search-input" name="userMallKeyword" type="text" value="\${safe(state.userMall.keyword, "")}" placeholder="搜索改装配件、品牌..." aria-label="搜索改装配件、品牌"><button class="user-mall-search-submit" type="submit" aria-label="搜索">搜索</button></form><a class="mall-cart-btn" href="user-app.html?tab=me&meTab=cart"><span class="mall-cart-icon">购物车</span>\${cartCount > 0 ? \`<span class="mall-cart-badge">\${cartCount}</span>\` : ""}</a></div><div class="user-mall-filter-row"><select class="input" data-user-mall-filter="brand">\${brandOptions.map((item) => \`<option value="\${item}" \${item === activeBrand ? "selected" : ""}>\${item}</option>\`).join("")}</select><select class="input" data-user-mall-filter="model">\${modelOptions.map((item) => \`<option value="\${item}" \${item === activeModel ? "selected" : ""}>\${item}</option>\`).join("")}</select></div><div class="user-mall-layout"><aside class="user-mall-sidebar">\${categoryMeta.map((item) => \`<button class="user-mall-category \${item.id === "all" ? (!state.userMallPage ? "active" : "") : state.userMallPage === item.id ? "active" : ""}" type="button" data-user-action="user-mall-category" data-user-id="\${item.id}">\${item.label}</button>\`).join("")}</aside><div class="user-mall-results"><div class="user-mall-results-head"><strong>\${safe(activeModel !== "全部车型" ? activeModel : selectedVehicle?.model, "当前车型")}</strong><span>\${resultSummary}</span></div>\${rows.length ? rows.map((item, index) => \`<article class="user-mall-card"><a class="user-mall-card-media" href="user-product-detail.html?sku=\${encodeURIComponent(item.sku || "")}&name=\${encodeURIComponent(safe(item.name, "商品"))}&price=\${encodeURIComponent(safe(item.price, "¥0"))}&brand=\${encodeURIComponent(safe(item.brand, "-"))}&fitment=\${encodeURIComponent(safe(item.fitment || item.description, "适配当前车型"))}&mallPage=\${encodeURIComponent(resolveUserMallPageByCategory(item.category))}" data-tone="\${(index % 4) + 1}"></a><div class="user-mall-card-body"><h4>\${safe(item.name, "商品")}</h4><div class="user-mall-card-meta">\${safe(item.brand, "-")} · \${safe(item.category, "-")}</div><div class="user-mall-card-fitment">\${safe(item.fitment, "适配当前车型")}</div><div class="user-mall-card-actions"><strong class="user-mall-card-price">\${safe(item.price, "-")}</strong><button class="btn btn-secondary btn-sm" type="button" data-user-action="user-mall-collect" data-user-id="\${item.sku}">收藏</button></div></div></article>\`).join("") : \`<div class="user-mall-empty">暂无符合条件的商品</div>\`}</div></div></section></div>\`;
  }`;

const before = lines.slice(0, startIdx);
const after = lines.slice(endIdx + 1);
const newLines = [...before, newFunc, ...after];

fs.writeFileSync(file, newLines.join('\n'), 'utf-8');
console.log('Done. Replaced renderUserMallHome().');
