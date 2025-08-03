// 监听来自后台的请求
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === "getCurrentDomain") {
    try {
      const url = new URL(window.location.href);
      sendResponse({ domain: url.hostname });
    } catch (e) {
      sendResponse({ error: "无法解析当前域名" });
    }
    return true; // 保持消息通道开放以进行异步响应
  }
});

// 自动检测域名变化（适用于SPA应用）
let lastUrl = location.href;
new MutationObserver(() => {
  const currentUrl = location.href;
  if (currentUrl !== lastUrl) {
    lastUrl = currentUrl;
    try {
      const url = new URL(currentUrl);
      chrome.runtime.sendMessage({
        action: "domainChanged",
        domain: url.hostname
      });
    } catch (e) {
      console.error("域名解析错误:", e);
    }
  }
}).observe(document, { subtree: true, childList: true });