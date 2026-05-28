const fs = require('fs');

const file = 'assets/js/mobile-app.js';
const content = fs.readFileSync(file, 'utf-8');
const lines = content.split('\n');

// Find all renderUserGarageRender function starts
const starts = [];
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('function renderUserGarageRender(')) {
    starts.push(i);
  }
}

console.log('Found', starts.length, 'renderUserGarageRender() definitions at lines:', starts.map(s => s + 1));

// Find the end of each function
const ends = [];
for (const s of starts) {
  let braceCount = 0;
  let foundOpen = false;
  for (let j = s; j < lines.length; j++) {
    for (const ch of lines[j]) {
      if (ch === '{') { braceCount++; foundOpen = true; }
      else if (ch === '}') { braceCount--; }
    }
    if (foundOpen && braceCount === 0) { ends.push(j); break; }
  }
}

console.log('Function ends at lines:', ends.map(e => e + 1));

const newFunc = `  function renderUserGarageRender(selectedVehicle) {
    const { renderAssets } = window.MockData;
    const vehicleColors = renderAssets?.vehicleColors || [];
    const wheelStyles = renderAssets?.wheelStyles || [];
    const currentVehicle = selectedVehicle?.model || "宝马 G20 330i";
    const matchedColors = vehicleColors.filter((v) => currentVehicle.includes(v.vehicleId?.split("-")[0])) || fallback.colors;
    const matchedWheels = wheelStyles.filter((w) => w.vehicles?.some((v) => currentVehicle.includes(v.split("-")[0]))) || fallback.wheels;
    const styleTags = ["黑武士街道风", "赛道性能风", "豪华夜幕风", "低趴姿态风", "原厂升级风"];
    const relatedProducts = products.slice(0, 3);
    return \`<section class="garage-preview"><div class="eyebrow">Render Lab</div><strong style="display:block; margin-top:10px; font-size:22px;">\${safe(selectedVehicle?.model, "宝马 G20 330i")} 外观预览</strong><div class="muted" style="margin-top:6px;">选择车身颜色与轮毂样式，预览改装效果，下方推荐可直接下单。</div><div class="garage-3d-stage"><div class="garage-3d-car" id="garage3dCar"><div class="garage-3d-wheel left"></div><div class="garage-3d-wheel right"></div><div class="garage-3d-body"></div></div></div><div class="garage-style-tags">\${styleTags.map((s) => \`<span class="garage-style-tag">\${s}</span>\`).join("")}</div><div class="swatch-row">\${matchedColors.map((i, idx) => \`<button class="swatch \${idx === state.garageColor ? "active" : ""}" style="background:\${i.colorValue || i.value};" type="button" title="\${i.colorName || i.name}" data-color-index="\${idx}"></button>\`).join("")}</div></section><section class="mobile-list garage-wheel-list">\${matchedWheels.map((i, idx) => \`<button class="wheel-option \${idx === state.garageWheel ? "active" : ""}" type="button" data-wheel-index="\${idx}"><span><strong>\${i.name}</strong><div class="muted" style="margin-top:6px;">\${i.size || i.spokes + " 辐设计"} / \${i.brand || "高端改装"} / \${i.price || ""}</div></span><span class="wheel-badge" data-tone="\${idx === 0 ? "gold" : idx === 1 ? "grey" : "silver"}"></span></button>\`).join("")}</section><section class="garage-related-section"><div class="eyebrow">Recommended</div><h3 style="margin:10px 0 14px;">适配推荐</h3><div class="garage-related-grid">\${relatedProducts.map((item) => \`<a class="garage-related-card" href="user-product-detail.html?sku=\${encodeURIComponent(item.sku || "")}&name=\${encodeURIComponent(safe(item.name, "商品"))}&price=\${encodeURIComponent(safe(item.price, "¥0"))}&brand=\${encodeURIComponent(safe(item.brand, "-"))}&fitment=\${encodeURIComponent(safe(item.fitment, "适配当前车型"))}&mallPage=exterior"><div class="garage-related-media" data-tone="\${(item.sku || "").length % 4 + 1}"></div><strong>\${safe(item.name, "商品")}</strong><div class="muted" style="margin-top:6px; font-size:12px;">\${safe(item.brand, "-")}</div><div class="garage-related-price">\${safe(item.price, "-")}</div></a>\`).join("")}</div></section>\`;
  }`;

const before = lines.slice(0, starts[0]);
const after = lines.slice(ends[ends.length - 1] + 1);
const newLines = [...before, newFunc, ...after];

fs.writeFileSync(file, newLines.join('\n'), 'utf-8');
console.log('Done. Replaced renderUserGarageRender().');
