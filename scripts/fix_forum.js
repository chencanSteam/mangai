const fs = require('fs');

const file = 'assets/js/mobile-app.js';
let content = fs.readFileSync(file, 'utf-8');
const lines = content.split('\n');

// Find all renderUserForum() function starts (not Form/Detail/ReplyForm)
const starts = [];
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('function renderUserForum()') && !lines[i].includes('Form') && !lines[i].includes('Detail') && !lines[i].includes('Reply')) {
    starts.push(i);
  }
}

console.log('Found', starts.length, 'renderUserForum() definitions at lines:', starts.map(s => s + 1));

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
    if (foundOpen && braceCount === 0) {
      ends.push(j);
      break;
    }
  }
}

console.log('Function ends at lines:', ends.map(e => e + 1));

const newFunc = `  function renderUserForum() {
    const forumCards = [
      { title: "这套定制宽体终于落地了，碳纤维纹路完美对齐。", author: "Carbon_King", meta: "宽体 / JDM", heat: "1.2k", tone: "cyan", badge: "精选", type: "discussion" },
      { title: "【818活动】BBS轮毂限时85折，适配G20/001FR", author: "满改官方", meta: "活动 / 轮毂", heat: "3.5k", tone: "brand", badge: "置顶", type: "official", link: "user-product-detail.html?sku=PR-8801" },
      { title: "内饰大功告成，全 Alcantara 包覆，战斗感拉满。", author: "Craft_Master", meta: "内饰 / 包覆", heat: "412", tone: "graphite", badge: "", type: "discussion" },
      { title: "全段钛合金排气，这音浪谁受得了？", author: "Turbo_Tom", meta: "排气 / 声浪", heat: "856", tone: "steel", badge: "", type: "discussion" },
      { title: "【科普】隐形车衣怎么选？XPEL LUX PLUS深度解析", author: "满改官方", meta: "科普 / 车衣", heat: "2.1k", tone: "brand", badge: "置顶", type: "official", link: "user-product-detail.html?sku=PR-8804" },
      { title: "周末聚会大合照，老伙计们都到齐了。", author: "Retro_Vibe", meta: "聚会 / 赛道日", heat: "1.8k", tone: "amber", badge: "", type: "discussion" },
      { title: "上海夜晚的街道，才是这台车的归宿。", author: "Night_Owl", meta: "姿态 / 街拍", heat: "2.4k", tone: "violet", badge: "热门", type: "discussion" },
      { title: "电车改装也有春天，这姿态你给几分？", author: "EV_Addict", meta: "电车 / 姿态", heat: "670", tone: "teal", badge: "", type: "discussion" },
    ];
    const activeFilter = state.userForum.filter || "hot";
    const activeCategory = state.userForum.category || "all";
    let displayCards = forumCards;
    if (activeCategory === "official") displayCards = forumCards.filter((c) => c.type === "official");
    if (activeCategory === "discussion") displayCards = forumCards.filter((c) => c.type === "discussion");
    const featured = displayCards[0];
    const secondary = displayCards.slice(1, 3);
    const feed = displayCards.slice(3);
    const followed = [
      { label: "我", name: "我的动态", tone: "self" },
      { label: "A", name: "RWB_Akira", tone: "brand" },
      { label: "B", name: "BoostLife", tone: "accent" },
      { label: "N", name: "NightRunner", tone: "brand" },
    ];
    const categoryTabs = [
      { id: "all", label: "全部" },
      { id: "official", label: "官方资讯" },
      { id: "discussion", label: "玩家讨论" },
    ];
    const filterTabs = [
      { id: "hot", label: "热门" },
      { id: "latest", label: "最新" },
      { id: "top", label: "最热" },
    ];
    return \`<div class="stack forum-home-shell"><section class="forum-home-hero"><div class="forum-home-category-row">\${categoryTabs.map((t) => \`<button class="pill forum-category-pill \${activeCategory === t.id ? "active" : ""}" type="button" data-user-action="user-forum-category" data-user-id="\${t.id}">\${t.label}</button>\`).join("")}</div><div class="forum-home-filter-row">\${filterTabs.map((t) => \`<button class="pill forum-filter-pill \${activeFilter === t.id ? "active" : ""}" type="button" data-user-action="user-forum-filter" data-user-id="\${t.id}">\${t.label}</button>\`).join("")}</div>\${featured ? \`<a class="forum-hero-card" href="\${featured.link || "user-topic-detail.html"}"><div class="forum-hero-copy"><div class="forum-overline">\${featured.type === "official" ? "官方资讯" : "社区精选"}\${featured.badge ? \` · \${featured.badge}\` : ""}</div><h3>\${featured.title}</h3><p>\${featured.meta} / \${featured.author}</p><div class="forum-hero-metrics"><span>\${featured.type === "official" && featured.link ? "查看商品" : "热度 " + featured.heat}</span><span>立即查看</span></div></div><div class="forum-hero-art" data-tone="\${featured.tone}"></div></a>\` : ""}<div class="forum-hero-side">\${secondary.map((item) => \`<a class="forum-side-card" href="\${item.link || "user-topic-detail.html"}"><div class="forum-side-art" data-tone="\${item.tone}"></div><div><div class="forum-overline">\${item.meta}\${item.type === "official" ? " · 官方" : ""}</div><strong>\${item.title}</strong><small>\${item.author} / \${item.type === "official" && item.link ? "查看商品" : "热度 " + item.heat}</small></div></a>\`).join("")}</div></section><section class="forum-follow-section"><div class="forum-section-head"><div><div class="forum-overline">关注更新</div><h3>我关注的</h3></div><a class="forum-section-link" href="user-topic-detail.html">查看全部</a></div><div class="forum-follow-grid">\${followed.map((item) => \`<a class="forum-follow-item" href="user-topic-detail.html"><div class="forum-follow-avatar" data-tone="\${item.tone}">\${item.label}</div><div class="forum-follow-name">\${item.name}</div></a>\`).join("")}</div></section><section class="forum-feed-section"><div class="forum-section-head"><div><div class="forum-overline">灵感流</div><h3>\${activeCategory === "official" ? "官方推荐" : activeCategory === "discussion" ? "玩家热帖" : "今日热帖"}</h3></div><a class="btn btn-secondary forum-create-inline" href="user-topic-create.html">发布帖子</a></div><div class="forum-feed-list">\${feed.map((item) => \`<a class="forum-feed-card" href="\${item.link || "user-topic-detail.html"}"><div class="forum-feed-art" data-tone="\${item.tone}">\${item.badge ? \`<span class="forum-feed-badge">\${item.badge}</span>\` : ""}\${item.type === "official" ? \`<span class="forum-feed-badge official">官方</span>\` : ""}</div><div class="forum-feed-body"><div class="forum-feed-meta"><strong>\${item.author}</strong><span>\${item.meta}</span></div><h4>\${item.title}</h4><div class="forum-feed-metrics"><span>热度 \${item.heat}</span>\${item.type === "official" && item.link ? \`<span class="forum-feed-link">查看商品 →</span>\` : ""}</div></div></a>\`).join("")}</div></section></div>\`;
  }

`;

// Rebuild: before first start, new func, after last end
const before = lines.slice(0, starts[0]);
const after = lines.slice(ends[ends.length - 1] + 1);
const newLines = [...before, newFunc, ...after];

fs.writeFileSync(file, newLines.join('\n'), 'utf-8');
console.log('Done. Replaced', starts.length, 'duplicates with new renderUserForum().');
