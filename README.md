# 个人社交媒体资源库

一个可以提取、保存、搜索和编辑抖音、小红书内容的个人专属资源库应用。

## 功能特性

- 🎯 支持抖音、小红书内容提取和保存
- 🔍 强大的搜索功能（全文、标签、分类）
- ✏️ 内容编辑和管理
- 📁 二级分类整理系统
- 💾 本地数据存储
- 📱 响应式界面设计

## 技术栈

### 前端
- React + TypeScript
- Ant Design
- Zustand (状态管理)
- React Router

### 后端
- Node.js + Express
- SQLite + Prisma
- Puppeteer (内容提取)

## 快速开始

### 安装依赖
```bash
# 安装后端依赖
cd backend
npm install

# 安装前端依赖
cd ../frontend
npm install
```

### 运行项目
```bash
# 启动后端服务 (端口: 3001)
cd backend
npm run dev

# 启动前端应用 (端口: 3000)
cd frontend
npm start
```

访问 http://localhost:3000 使用应用。

## 项目结构

```
social-media-hub/
├── frontend/     # React前端应用
├── backend/      # Express后端服务
└── README.md     # 项目说明
```

## 开发说明

### 数据库
使用SQLite作为本地数据库，首次运行会自动创建数据库文件。

### 文件存储
提取的媒体文件存储在 `backend/uploads/` 目录下。

### 内容提取
通过Puppeteer模拟浏览器操作，从平台提取公开内容。
请遵守各平台的使用条款。

## 许可证

MIT License