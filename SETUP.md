# 社交媒体资源库 - 安装和运行指南

## 项目概述

这是一个可以提取、保存、搜索和编辑抖音、小红书内容的个人专属资源库应用。

## 系统要求

- Node.js 16.0 或更高版本
- npm 或 yarn 包管理器
- 至少 2GB 可用磁盘空间

## 安装步骤

### 1. 克隆项目（如果适用）

```bash
# 如果项目在Git仓库中
git clone [repository-url]
cd social-media-hub
```

### 2. 安装后端依赖

```bash
cd backend
npm install
```

### 3. 初始化数据库

```bash
npx prisma generate
npx prisma migrate dev --name init
```

### 4. 安装前端依赖

```bash
cd ../frontend
npm install
```

## 运行项目

### 启动后端服务

```bash
# 在 backend 目录下
npm run dev
```

后端服务将在 http://localhost:3001 启动

### 启动前端应用

```bash
# 在 frontend 目录下
npm start
```

前端应用将在 http://localhost:3000 启动

## 功能特性

- 🎯 **内容提取**: 支持抖音、小红书链接的内容提取
- 🔍 **搜索功能**: 全文搜索、标签搜索、分类搜索
- ✏️ **内容编辑**: 编辑标题、描述、标签、分类
- 📁 **二级分类**: 支持主分类和子分类的组织结构
- 💾 **本地存储**: 所有数据保存在本地数据库
- 📱 **响应式设计**: 支持桌面和移动设备

## 使用说明

### 提取内容

1. 在抖音或小红书上复制内容链接
2. 打开应用的"提取内容"页面
3. 粘贴链接并点击"检测"
4. 选择分类和标签（可选）
5. 点击"提取并保存"

### 管理内容

1. **浏览内容**: 在"内容管理"页面查看所有内容
2. **搜索内容**: 使用搜索框或筛选条件查找特定内容
3. **编辑内容**: 点击编辑按钮修改内容信息
4. **删除内容**: 单个删除或批量删除不需要的内容

### 分类管理

1. **创建分类**: 在"分类管理"页面新建主分类或子分类
2. **组织内容**: 将内容分配到不同的分类中
3. **二级分类**: 支持最多二级的分类结构

### 标签管理

1. **创建标签**: 为内容添加自定义标签
2. **标签搜索**: 通过标签快速找到相关内容
3. **标签合并**: 合并重复或相似的标签

## 技术架构

### 后端
- **运行时**: Node.js
- **框架**: Express.js
- **数据库**: SQLite + Prisma ORM
- **内容提取**: Puppeteer
- **文件存储**: 本地文件系统

### 前端
- **框架**: React + TypeScript
- **UI组件**: Ant Design
- **状态管理**: Zustand
- **路由**: React Router
- **HTTP客户端**: Axios

## 数据存储

- **数据库**: SQLite (backend/prisma/dev.db)
- **媒体文件**: backend/uploads/
  - videos/: 视频文件
  - images/: 图片文件
  - thumbnails/: 缩略图

## 注意事项

1. **遵守平台条款**: 仅用于个人学习和整理，请遵守各平台的使用条款
2. **数据备份**: 定期备份数据库文件和媒体文件
3. **存储空间**: 大量内容可能占用较多磁盘空间
4. **网络环境**: 内容提取需要稳定的网络连接

## 故障排除

### 常见问题

1. **端口占用**
   - 修改 backend/.env 中的 PORT 配置
   - 或者关闭占用 3001/3000 端口的其他应用

2. **内容提取失败**
   - 检查网络连接
   - 确认链接格式正确
   - 某些内容可能因平台限制无法提取

3. **数据库连接错误**
   - 删除 backend/prisma/dev.db 文件
   - 重新运行 `npx prisma migrate dev`

4. **前端无法连接后端**
   - 确认后端服务正在运行
   - 检查 frontend/.env 中的 API_URL 配置

## 开发说明

### 项目结构

```
social-media-hub/
├── backend/              # 后端服务
│   ├── src/
│   │   ├── controllers/  # 控制器
│   │   ├── services/     # 业务逻辑
│   │   ├── routes/       # 路由定义
│   │   ├── extractors/   # 内容提取器
│   │   └── ...
│   ├── prisma/           # 数据库相关
│   └── uploads/          # 上传文件
└── frontend/             # 前端应用
    ├── src/
    │   ├── components/   # 通用组件
    │   ├── pages/        # 页面组件
    │   ├── stores/       # 状态管理
    │   ├── services/     # API服务
    │   └── ...
    └── public/
```

### 环境变量配置

后端环境变量 (backend/.env):
- PORT: 服务端口
- NODE_ENV: 运行环境
- DATABASE_URL: 数据库连接
- UPLOAD_DIR: 文件上传目录

前端环境变量 (frontend/.env):
- REACT_APP_API_URL: 后端API地址

## 许可证

MIT License - 详见 LICENSE 文件