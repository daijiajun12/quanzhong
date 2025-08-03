document.addEventListener('DOMContentLoaded', function() {
  // 获取DOM元素
  const currentDomainEl = document.getElementById('current-domain');
  const weightResultsEl = document.getElementById('weight-results');
  const loadingEl = document.getElementById('loading');
  const errorEl = document.getElementById('error');
  const retryBtn = document.getElementById('retry-btn');
  
  // 显示加载状态
  function showLoading() {
    loadingEl.style.display = 'block';
    weightResultsEl.style.display = 'none';
    errorEl.style.display = 'none';
  }
  
  // 显示结果
  function showResults(data) {
    loadingEl.style.display = 'none';
    weightResultsEl.style.display = 'flex';
    errorEl.style.display = 'none';
    
    // 填充数据
    updateEngineCard('baidu-pc', data.data.baidupc, data.data.baidupc_img);
    updateEngineCard('baidu-mobile', data.data.baidum, data.data.baidum_img);
    updateEngineCard('engine-360', data.data.so360, data.data.so360_img);
    updateEngineCard('engine-shenma', data.data.shenma, data.data.shenma_img);
    updateEngineCard('engine-sougou', data.data.sougou, data.data.sougou_img);
    updateEngineCard('engine-google', data.data.google, data.data.google_img);
  }
  
  // 更新单个引擎卡片
  function updateEngineCard(cardId, weightValue, weightImgUrl) {
    const card = document.getElementById(cardId);
    if (!card) return;
    
    const valueEl = card.querySelector('.weight-value');
    const imgEl = card.querySelector('.weight-img');
    
    valueEl.textContent = weightValue || 'N/A';
    if (weightImgUrl) {
      imgEl.src = weightImgUrl;
      imgEl.style.display = 'block';
    } else {
      imgEl.style.display = 'none';
    }
  }
  
  // 显示错误
  function showError() {
    loadingEl.style.display = 'none';
    weightResultsEl.style.display = 'none';
    errorEl.style.display = 'block';
  }
  
  // 查询权重数据
  function queryWeightData(domain) {
    showLoading();
    currentDomainEl.textContent = domain;
    
    const apiUrl = `https://api.mir6.com/api/bdqz?domain=${encodeURIComponent(domain)}&type=json`;
    
    fetch(apiUrl)
      .then(response => {
        if (!response.ok) {
          throw new Error('网络响应不正常');
        }
        return response.json();
      })
      .then(data => {
        if (data.code === '200') {
          showResults(data);
          // 保存到本地存储
          chrome.storage.local.set({ [domain]: data });
        } else {
          throw new Error(data.msg || '查询失败');
        }
      })
      .catch(error => {
        console.error('查询权重失败:', error);
        showError();
        
        // 尝试从本地存储加载
        chrome.storage.local.get(domain, function(result) {
          if (result[domain]) {
            showResults(result[domain]);
          }
        });
      });
  }
  
  // 重试按钮事件
  retryBtn.addEventListener('click', function() {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      const url = new URL(tabs[0].url);
      const domain = url.hostname;
      queryWeightData(domain);
    });
  });
  
  // 初始化查询
  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    if (tabs && tabs.length > 0) {
      try {
        const url = new URL(tabs[0].url);
        const domain = url.hostname;
        queryWeightData(domain);
      } catch (e) {
        currentDomainEl.textContent = '无法解析当前域名';
        showError();
      }
    } else {
      currentDomainEl.textContent = '无法获取当前标签页';
      showError();
    }
  });
});