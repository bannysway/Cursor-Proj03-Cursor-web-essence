# Coze 工作流 URL 内容提炼器

这是一个Chrome浏览器扩展，用于调用 Coze 工作流 API 来提炼和总结网页内容。

## 功能特点

- 通过浏览器扩展界面获取用户输入的 URL 或使用当前页面的 URL
- 调用 Coze 工作流 API 进行内容分析
- 显示 API 返回的结果或错误信息
- 完整的错误处理和日志记录
- 支持异步操作
- 美观的用户界面

## 技术栈

- HTML/CSS/JavaScript
- Chrome Extension API
- Fetch API (HTTP 请求)

## 安装方法

1. 下载或克隆本仓库到本地
2. 打开 Chrome 浏览器，进入扩展管理页面 (chrome://extensions/)
3. 开启"开发者模式"
4. 点击"加载已解压的扩展程序"
5. 选择本项目文件夹

## 使用方法

1. 点击 Chrome 工具栏中的扩展图标
2. 在弹出窗口中输入要分析的 URL，或点击"使用当前页面"按钮
3. 点击"分析内容"按钮
4. 等待分析完成，查看结果

## 文件结构

- `manifest.json`: 扩展配置文件
- `popup.html`: 扩展弹出窗口界面
- `popup.css`: 界面样式
- `popup.js`: 扩展功能实现
- `images/`: 图标文件夹

## 错误处理

扩展会处理以下类型的错误：
- 网络连接错误
- API 调用错误
- 无效的 URL 输入
- 编码相关错误

## 注意事项

- API 调用需要有效的 Bearer Token
- URL 必须是有效的网址格式
- 支持中文内容处理

## 命令行版本

本项目还提供了命令行版本，位于 `cli` 目录下：

```bash
# 安装依赖
npm install

# 运行命令行版本
node cli/index.js
``` 