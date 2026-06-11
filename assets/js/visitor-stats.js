(function () {
  const STATS_KEY = "mangai_visitor_stats";

  function ensureMockData() {
    if (typeof window === "undefined") return null;
    if (!window.MockData) window.MockData = {};
    if (!window.MockData.visitorStats) {
      window.MockData.visitorStats = {
        pageViews: {},
        productViews: {},
        productCollections: {},
        postViews: {},
        postLikes: {},
        postCollections: {},
        caseViews: {},
        providerViews: {},
        totalVisits: 0,
        todayVisits: 0,
      };
    }
    return window.MockData.visitorStats;
  }

  function getStats() {
    return ensureMockData();
  }

  window.trackPageView = function (pageKey) {
    const stats = getStats();
    if (!stats || !pageKey) return;
    stats.pageViews = stats.pageViews || {};
    stats.pageViews[pageKey] = (stats.pageViews[pageKey] || 0) + 1;
    stats.totalVisits = (stats.totalVisits || 0) + 1;
    const today = new Date().toISOString().slice(0, 10);
    if (stats._lastVisitDate !== today) {
      stats._lastVisitDate = today;
      stats.todayVisits = 0;
    }
    stats.todayVisits = (stats.todayVisits || 0) + 1;
  };

  window.trackAction = function (action, targetId) {
    const stats = getStats();
    if (!stats || !action || !targetId) return;
    const map = {
      productView: "productViews",
      productCollection: "productCollections",
      postView: "postViews",
      postLike: "postLikes",
      postCollection: "postCollections",
      caseView: "caseViews",
      providerView: "providerViews",
    };
    const key = map[action];
    if (!key) return;
    stats[key] = stats[key] || {};
    stats[key][targetId] = (stats[key][targetId] || 0) + 1;
  };

  window.getActionCountLabel = function (action, targetId) {
    const stats = getStats();
    if (!stats || !action || !targetId) return "0";
    const map = {
      productView: "productViews",
      productCollection: "productCollections",
      postView: "postViews",
      postLike: "postLikes",
      postCollection: "postCollections",
      caseView: "caseViews",
      providerView: "providerViews",
    };
    const count = stats[map[action]]?.[targetId] || 0;
    if (count >= 10000) return (count / 10000).toFixed(1) + "w";
    if (count >= 1000) return (count / 1000).toFixed(1) + "k";
    return String(count);
  };
})();
