# CPA 监控面板 Chrome 插件

一个基于 `Vue 3 + Vite + Pinia + Tailwind CSS + Element Plus + daisyUI` 构建的 Chrome 插件，用于聚合查看本地或远端 CPA 服务的运行状态、认证账号和常用入口。

项目同时提供两种使用形态：

- **Popup 快捷面板**：点击浏览器扩展图标后显示的小窗口，适合快速查看当前成功率、当前小时请求、Token 消耗、问题账号数，以及跳转到常用页面。
- **完整管理页面**：用于查看完整监控面板、账号管理页和设置中心。

## 项目特性

- 支持多个 CPA 接入配置并行管理
- 支持 `Bearer / API Key / Basic / Custom Header` 多种鉴权方式
- 支持测试链接、保存配置、本地持久化
- 提供首页监控面板：
  - 服务健康监测
  - 请求数量图表监控
  - Token 消耗图表监控
  - 当前小时与 24 小时摘要指标
- 提供账号管理页：
  - 认证账号列表
  - 启用 / 停用账号
  - 删除账号
  - 批量操作
  - 搜索、筛选、分页
- 提供设置中心：
  - CPA 接入管理
  - 注册机面板链接配置
- 支持日间 / 夜间模式
- 支持从插件底部快捷入口跳转到：
  - CPA 管理面板
  - 注册机面板
  - 账号页
  - 设置页

## 页面说明

### 1. Popup 快捷面板

点击浏览器扩展图标后打开，用于展示高频摘要信息：

- 当前接入状态
- 当前成功率
- 当前小时请求
- 当前小时 Tokens
- 最近 24 小时 Tokens
- 问题账号数
- 活跃账号数
- 快捷跳转按钮

### 2. 完整页面

完整页面基于 `index.html + Vue Router(Hash)` 运行，包含以下路由：

- `/`：运营面板
- `/accounts`：账号管理
- `/settings`：设置中心

## 后端接口

当前前端已接入以下 CPA 管理接口：

| 方法 | 路径 | 用途 |
| --- | --- | --- |
| `GET` | `/v0/management/config` | 测试当前接入配置是否可访问 |
| `GET` | `/v0/management/auth-files` | 获取认证账号列表 |
| `PATCH` | `/v0/management/auth-files/status` | 启用 / 停用账号 |
| `DELETE` | `/v0/management/auth-files` | 删除账号 |
| `GET` | `/v0/management/usage` | 获取请求、Token 与模型使用数据 |

说明：

- `前往 CPA` 会基于当前接入地址自动拼接 `management.html`
- 账号启用 / 停用 / 删除操作成功后会自动刷新列表
- 浏览器环境下如果接口未正确配置 `CORS（跨域资源共享）`，请求可能会被浏览器拦截

## 技术栈

- `Vue 3`
- `Vite`
- `Vue Router`
- `Pinia`
- `Tailwind CSS`
- `daisyUI`
- `Element Plus`
- `Axios`

## 本地开发

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

默认开发地址：

- Web 调试页：`http://localhost:5173`

### 构建产物

```bash
npm run build
```

构建完成后会生成：

- `dist/`：Chrome 插件未解压目录
- `dist/index.html`：完整页面入口
- `dist/popup.html`：Popup 入口
- `dist/manifest.json`：Chrome 插件清单

## 在 Chrome 中加载插件

### 方式一：开发调试推荐

1. 打开 `chrome://extensions/`
2. 打开右上角“开发者模式”
3. 点击“加载已解压的扩展程序”
4. 选择仓库中的 `dist/` 目录

### 方式二：打包分发

如果你使用浏览器的“打包扩展程序”功能，通常会得到：

- `dist.crx`：扩展安装包
- `dist.pem`：扩展私钥

注意：

- `dist.pem` 非常重要，不要公开，不要提交到 Git 仓库
- 如果私钥丢失，后续重新打包时扩展 ID 可能变化，无法平滑升级

## 配置存储

项目优先使用 `chrome.storage.local` 存储设置；如果当前不是扩展环境，则回退到浏览器 `localStorage`。

当前保存的数据包括：

- CPA 接入列表
- 当前各接入的名称、地址、密钥、鉴权方式、超时时间、启用状态
- 注册机面板链接
- 主题模式

## 项目结构

```text
.
├── public/
│   ├── cpa_logo.png
│   └── manifest.json
├── src/
│   ├── api/                 # CPA 管理接口封装
│   ├── components/
│   │   ├── account/         # 账号管理相关组件
│   │   ├── common/          # 通用组件
│   │   ├── dashboard/       # 面板相关组件
│   │   └── settings/        # 设置页相关组件
│   ├── composables/         # 业务组合式逻辑
│   ├── constants/           # 常量
│   ├── popup/               # Chrome 插件 Popup 入口
│   ├── router/              # 路由
│   ├── store/               # Pinia 状态管理
│   ├── utils/               # 工具函数
│   ├── views/               # 完整页面视图
│   ├── App.vue
│   ├── main.js
│   └── style.css
├── index.html               # 完整页面入口
├── popup.html               # Popup 页面入口
├── vite.config.js
└── package.json
```

## 开发约定

- 使用 Vue 3 Composition API
- 使用 `<script setup>`
- 组件按业务域拆分，避免单文件过大
- 样式优先使用 Tailwind CSS
- 需要和现有视觉保持一致：
  - 轻玻璃感
  - 胶囊按钮
  - 日夜间模式统一
- 所有会影响真实后端状态的操作都应尽量提供明确反馈

## 常见问题

### 1. 为什么接口请求失败并提示 CORS？

这是因为浏览器插件 / Web 页面直接请求 CPA 服务时，会受到浏览器跨域策略限制。需要后端正确放行：

- `Origin`
- `Authorization`
- `OPTIONS` 预检请求

### 2. 为什么保存设置后重新打开扩展看不到配置？

当前版本已经优先写入 `chrome.storage.local`，并在保存前对配置做 JSON 序列化。如果仍然出现问题，请先重新保存一次，再刷新扩展重试。

### 3. 为什么不能直接把 `dist/` 拖进浏览器安装？

`dist/` 是未解压扩展目录，正确方式是通过 `chrome://extensions/` 里的“加载已解压的扩展程序”加载。

## 开源建议

如果你准备正式公开这个仓库，建议在发布前再检查一次：

- 是否仍然包含内部服务地址
- 是否误提交了调试用密钥
- 是否误提交了 `.pem` 私钥
- 是否已经补充 License
- 是否已经写明接口依赖与 CORS 要求

## 贡献与安全

- 贡献指南见 [CONTRIBUTING.md](./CONTRIBUTING.md)
- 安全说明见 [SECURITY.md](./SECURITY.md)

## License

本项目采用 [Apache License 2.0](./LICENSE)。

这意味着你可以在遵守许可证文本、保留必要版权与变更说明的前提下，进行使用、修改、分发和商用。
