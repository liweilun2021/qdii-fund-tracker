# QDII 基金限额查询

实时查询所有 QDII 基金的申购状态、限购金额、净值涨跌和前十大持仓，支持按投资区域、资产类型、基金名称和持仓股票多维度筛选。

## 功能

- 覆盖全市场 500+ 只 QDII 基金，数据来源天天基金
- 申购状态与限购金额实时展示，支持排序
- 按投资区域筛选（美股 / 港股 / 日本 / 印度 / 欧洲 / 全球等）
- 按资产类型筛选（股票指数 / 债券 / 黄金 / 原油 / REITs 等）
- 按持仓股票筛选（如输入 NVDA，列出所有持有英伟达的基金）
- 持仓占比列动态插入，支持排序
- 展开行查看基金前十大持仓明细
- 多条件组合筛选，支持一键清除
- 本地文件缓存，重启秒加载

## 技术栈

- **前端**: React 18 + TypeScript + Ant Design 5 + Vite 6
- **后端**: Node.js + Express + TypeScript
- **数据**: 爬取天天基金（eastmoney.com）多个 API
- **项目结构**: npm workspaces monorepo

## 环境要求

- Node.js >= 18
- npm >= 8（需支持 workspaces）

## 快速开始

```bash
# 1. 克隆项目
git clone <repo-url>
cd fund

# 2. 安装依赖（会同时安装 client / server / shared 三个 workspace）
npm install

# 3. 启动开发模式（前端 + 后端同时启动）
npm run dev
```

启动后访问 http://localhost:5173

- 前端开发服务器：`localhost:5173`（Vite，自动代理 `/api` 到后端）
- 后端 API 服务器：`localhost:3001`

首次启动会自动爬取数据，基金列表几秒内可用，申购状态和持仓数据在后台逐步补充（约 3-5 分钟全部完成）。

## 使用 pm2 常驻运行

```bash
# 安装 pm2（全局）
npm install -g pm2

# 启动
pm2 start ecosystem.config.cjs

# 查看状态
pm2 status

# 查看日志
pm2 logs

# 停止
pm2 stop all

# 重启
pm2 restart all
```

## 生产部署

```bash
# 构建前端静态文件
npm run build

# 生产模式启动（后端同时托管前端静态文件）
NODE_ENV=production npm start
```

生产模式下只需 `localhost:3001` 一个端口，后端自动托管 `client/dist` 静态资源。

## 项目结构

```
fund/
├── client/                  # 前端 React 应用
│   ├── src/
│   │   ├── api/             # API 请求封装
│   │   ├── components/      # UI 组件
│   │   │   ├── FilterBar    #   区域/类型标签筛选
│   │   │   ├── SearchBar    #   基金名称/代码搜索
│   │   │   ├── HoldingFilter#   持仓股票筛选
│   │   │   ├── FundTable    #   基金列表表格
│   │   │   ├── StatsOverview#   统计概览卡片
│   │   │   └── StatusTag    #   申购状态标签
│   │   ├── hooks/           # 数据请求 Hook
│   │   └── styles/          # 全局样式
│   └── vite.config.ts
├── server/                  # 后端 Node.js 服务
│   ├── src/
│   │   ├── config/          # 端口、缓存 TTL 等配置
│   │   ├── routes/          # API 路由
│   │   ├── services/
│   │   │   ├── crawlerService   # 爬虫调度
│   │   │   ├── rankCrawler      # 基金列表 + 净值爬取
│   │   │   ├── detailCrawler    # 申购状态爬取
│   │   │   ├── holdingsCrawler  # 持仓数据爬取
│   │   │   └── cacheService     # 内存 + 文件缓存
│   │   └── utils/           # HTML/数据解析工具
│   └── data/                # 缓存文件（自动生成，已 gitignore）
├── shared/                  # 前后端共享类型定义
│   └── types.ts
├── ecosystem.config.cjs     # pm2 配置
└── package.json             # workspaces 根配置
```

## API

| 接口 | 说明 |
|------|------|
| `GET /api/funds` | 基金列表，支持查询参数 `region` `assetType` `search` `status` `holdingStock` |
| `GET /api/funds/categories` | 区域/类型分类及数量 |
| `GET /api/holdings/stocks` | 所有持仓股票列表（用于搜索建议） |
| `POST /api/funds/refresh` | 手动触发数据刷新 |

## 配置

编辑 `server/src/config/index.ts`：

| 配置项 | 默认值 | 说明 |
|--------|--------|------|
| `port` | 3001 | 后端服务端口 |
| `cacheTTL` | 30 分钟 | 缓存过期时间，过期后下次请求自动刷新 |
| `crawl.detailConcurrency` | 3 | 详情页爬取并发数 |
| `crawl.detailDelay` | 300ms | 请求间隔，避免被限频 |
| `crawl.retryCount` | 3 | 失败重试次数 |

## 数据更新机制

- 内存缓存 30 分钟有效，过期后下次请求触发后台刷新（旧数据立即返回，不阻塞）
- 爬取结果持久化到 `server/data/cache.json`，进程重启秒加载
- 页面右上角「刷新数据」按钮可手动触发更新
