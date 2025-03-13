/**
 * Coze URL 内容提炼器 - 侧边栏版
 * 
 * 这个扩展使用Coze工作流API来分析和提炼网页内容。
 * 用户可以输入URL或使用当前页面的URL进行分析。
 */

// Coze API 配置
const COZE_API_CONFIG = {
  url: 'https://api.coze.cn/v1/workflow/run',
  token: 'pat_NwLkhb1OBCha4xMO7XytX1rOr1qo9B6rAGpPETbCDThM3Ay6QNFkuiKozrtdrSL5',
  workflowId: '7481300830357864488'
};

// DOM元素
const urlInput = document.getElementById('urlInput');
const useCurrentBtn = document.getElementById('useCurrentBtn');
const analyzeBtn = document.getElementById('analyzeBtn');
const loadingSection = document.getElementById('loadingSection');
const resultSection = document.getElementById('resultSection');
const resultContent = document.getElementById('resultContent');
const errorSection = document.getElementById('errorSection');
const errorContent = document.getElementById('errorContent');

/**
 * 初始化扩展
 */
function initExtension() {
  // 绑定按钮事件
  useCurrentBtn.addEventListener('click', useCurrentUrl);
  analyzeBtn.addEventListener('click', analyzeUrl);
  
  // 尝试从存储中恢复上次的URL和结果
  chrome.storage.local.get(['lastUrl', 'lastResult'], function(data) {
    if (data.lastUrl) {
      urlInput.value = data.lastUrl;
    }
    
    if (data.lastResult) {
      showResult(data.lastResult);
    }
  });
}

/**
 * 使用当前页面的URL
 */
function useCurrentUrl() {
  // 获取当前活动标签页的URL
  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    if (tabs && tabs[0] && tabs[0].url) {
      urlInput.value = tabs[0].url;
    } else {
      showError('无法获取当前页面URL');
    }
  });
}

/**
 * 验证URL格式是否有效
 * @param {string} url - 要验证的URL
 * @returns {boolean} URL是否有效
 */
function isValidUrl(url) {
  try {
    new URL(url);
    return true;
  } catch (err) {
    return false;
  }
}

/**
 * 分析URL内容
 */
function analyzeUrl() {
  // 获取输入的URL
  const url = urlInput.value.trim();
  
  // 验证URL
  if (!url) {
    showError('请输入URL或使用当前页面');
    return;
  }
  
  if (!isValidUrl(url)) {
    showError('无效的URL格式，请输入正确的网址');
    return;
  }
  
  // 保存URL到本地存储
  chrome.storage.local.set({ 'lastUrl': url });
  
  // 显示加载状态
  showLoading();
  
  // 调用Coze API
  callCozeApi(url)
    .then(result => {
      // 保存结果到本地存储
      chrome.storage.local.set({ 'lastResult': result });
      // 显示结果
      showResult(result);
    })
    .catch(error => {
      // 显示错误
      showError(error.message || '分析过程中发生错误');
    });
}

/**
 * 调用Coze工作流API
 * @param {string} userInput - 用户输入的URL
 * @returns {Promise<Object>} API响应数据
 */
async function callCozeApi(userInput) {
  try {
    const response = await fetch(COZE_API_CONFIG.url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${COZE_API_CONFIG.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        workflow_id: COZE_API_CONFIG.workflowId,
        parameters: {
          user_id: "12345",
          user_name: "George",
          USER_INPUT: userInput
        }
      })
    });
    
    if (!response.ok) {
      await handleApiError(response);
    }
    
    const result = await response.json();
    if (result.code !== 0) {
      throw new Error(result.msg || '调用API失败');
    }
    
    return result;
  } catch (error) {
    console.error('API调用错误:', error);
    throw new Error('调用Coze API时发生错误: ' + error.message);
  }
}

/**
 * 处理API错误
 * @param {Object} response - API响应对象
 */
async function handleApiError(response) {
  let errorMessage = '未知错误';
  try {
    const errorData = await response.json();
    errorMessage = errorData.msg || `HTTP错误 ${response.status}`;
  } catch (e) {
    errorMessage = `HTTP错误 ${response.status}`;
  }
  throw new Error(errorMessage);
}

/**
 * 显示加载状态
 */
function showLoading() {
  loadingSection.style.display = 'flex';
  resultSection.style.display = 'none';
  errorSection.style.display = 'none';
}

/**
 * 显示分析结果
 * @param {Object} result - API返回的结果
 */
function showResult(result) {
  loadingSection.style.display = 'none';
  errorSection.style.display = 'none';
  resultSection.style.display = 'flex';
  
  try {
    // 检查API返回的状态
    if (result.code === 0) {
      // 尝试解析data字段中的JSON字符串
      let parsedData = JSON.parse(result.data);
      
      // 提取实际的内容
      let content = '';
      if (parsedData.data) {
        content = parsedData.data;
        
        // 简单的Markdown格式处理
        // 将Markdown标题转换为HTML标题
        content = content.replace(/^# (.*$)/gm, '<h1>$1</h1>');
        content = content.replace(/^## (.*$)/gm, '<h2>$1</h2>');
        content = content.replace(/^### (.*$)/gm, '<h3>$1</h3>');
        
        // 处理列表
        content = content.replace(/^\d+\. (.*$)/gm, '<li>$1</li>');
        content = content.replace(/^- (.*$)/gm, '<li>$1</li>');
        
        // 处理段落
        content = content.replace(/\n\n/g, '</p><p>');
        
        // 包装在段落标签中
        content = `<p>${content}</p>`;
        
        // 将连续的列表项包装在有序或无序列表中
        content = content.replace(/<li>.*?<\/li>(\s*<li>.*?<\/li>)+/g, function(match) {
          return `<ul>${match}</ul>`;
        });
      } else {
        content = '无法解析返回的内容';
      }
      
      // 显示格式化的内容
      resultContent.innerHTML = content;
    } else {
      // 如果API返回错误
      showError(`API错误: ${result.msg}`);
    }
  } catch (error) {
    console.error('解析结果时出错:', error);
    // 如果解析失败，显示原始JSON
    resultContent.innerHTML = `<pre>${escapeHtml(JSON.stringify(result, null, 2))}</pre>`;
  }
}

/**
 * 显示错误信息
 * @param {string} message - 错误信息
 */
function showError(message) {
  loadingSection.style.display = 'none';
  resultSection.style.display = 'none';
  errorSection.style.display = 'flex';
  
  errorContent.textContent = message;
}

/**
 * 转义HTML特殊字符，防止XSS攻击
 * @param {string} text - 要转义的文本
 * @returns {string} 转义后的文本
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// 初始化扩展
document.addEventListener('DOMContentLoaded', initExtension); 