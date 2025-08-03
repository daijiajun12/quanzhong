// 监听内容脚本的消息
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === "domainChanged") {
    // 可以在这里处理域名变化事件
    console.log("检测到域名变化:", request.domain);
    
    // 更新浏览器图标上的角标（可选）
    chrome.action.setBadgeText({ text: "NEW", tabId: sender.tab.id });
    setTimeout(() => {
      chrome.action.setBadgeText({ text: "", tabId: sender.tab.id });
    }, 3000);
  }
});

// 监听弹出窗口打开事件
chrome.action.onClicked.addListener(function(tab) {
  // 可以在这里添加点击图标时的默认行为
});