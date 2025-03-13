/**
 * Coze URL 内容提炼器 - 背景脚本
 * 
 * 这个脚本使用Service Worker实现，符合Chrome扩展Manifest V3规范。
 * 它处理扩展的安装、更新和消息传递。
 */

// 监听扩展安装事件
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    // 首次安装
    console.log('Coze URL 内容提炼器已安装');
    
    // 打开欢迎页面或显示使用说明
    chrome.tabs.create({
      url: 'https://api.coze.cn'
    });
  } else if (details.reason === 'update') {
    // 扩展更新
    console.log('Coze URL 内容提炼器已更新');
  }
});

// 监听扩展图标点击事件
chrome.action.onClicked.addListener((tab) => {
  // 打开侧边栏
  chrome.sidePanel.open({ tabId: tab.id });
});

// 监听来自内容脚本或弹出窗口的消息
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'analyzeUrl') {
    // 处理URL分析请求
    console.log('收到分析请求:', message.url);
    
    // 这里可以添加额外的处理逻辑
    // 例如，在后台进行API调用，而不是在弹出窗口中
    
    // 返回响应
    sendResponse({ status: 'received' });
  }
  
  // 返回true表示将异步发送响应
  return true;
}); 