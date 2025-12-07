# 个人社交媒体资源库

一个可以提取、保存、搜索和编辑抖音、小红书内容的个人专属资源库应用。

## 🚀 快速开始

### 前置要求

- Node.js 16.0 或更高版本
- npm 或 yarn

### 安装步骤

1. **克隆项目**
```bash
git clone https://github.com/your-username/social-media-hub.git
cd social-media-hub
```

2. **后端设置**
```bash
cd backend
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run dev
```

3. **前端设置**
```bash
cd frontend
npm install
npm start
```

4. **访问应用**
- 前端: http://localhost:3000
- 后端API: http://localhost:3001

## 📱 功能特性

- 🎯 **内容提取**: 支持抖音、小红书链接的内容提取
- 🔍 **搜索功能**: 全文搜索、标签搜索、分类搜索
- ✏️ **内容编辑**: 编辑标题、描述、标签、分类
- 📁 **二级分类**: 支持主分类和子分类的组织结构
- 💾 **本地存储**: 所有数据保存在本地数据库
- 📱 **响应式设计**: 支持桌面和移动设备

## 🛠️ 技术栈

### 后端
- Node.js + Express
- SQLite + Prisma ORM
- Puppeteer (内容提取)
- TypeScript

### 前端
- React + TypeScript
- Ant Design
- Zustand (状态管理)
- React Router

## 📁 项目结构

```
social-media-hub/
├── backend/                 # 后端服务
│   ├── src/
│   │   ├── controllers/      # API控制器
│   │   ├── services/         # 业务逻辑
│   │   ├── extractors/       # 内容提取器
│   │   └── routes/           # 路由定义
│   ├── prisma/               # 数据库模型
│   └── uploads/              # 媒体文件存储
├── frontend/                 # 前端应用
│   ├── src/
│   │   ├── components/       # 通用组件
│   │   ├── pages/            # 页面组件
│   │   ├── stores/           # 状态管理
│   │   └── services/         # API服务
│   └── public/               # 静态资源
└── docs/                     # 文档
```

## 📖 使用说明

### 提取内容

1. 复制抖音或小红书的内容链接
2. 在"提取内容"页面粘贴链接
3. 自动识别平台并预览内容
4. 选择分类和标签（可选）
5. 点击"提取并保存"

### 管理内容

- **浏览内容**: 在"内容管理"页面查看所有内容
- **搜索内容**: 使用搜索框或筛选条件查找特定内容
- **编辑内容**: 点击编辑按钮修改内容信息
- **删除内容**: 单个删除或批量删除不需要的内容

### 分类管理

- 创建主分类和子分类
- 将内容分配到不同分类
- 支持二级分类结构

### 标签管理

- 创建自定义标签
- 通过标签快速找到相关内容
- 合并重复或相似的标签

## 🌐 部署选项

### 本地部署
按照上面的快速开始步骤即可。

### Docker部署（推荐）
```bash
# 构建镜像
docker-compose build

# 启动服务
docker-compose up -d
```

### 云服务器部署
1. 准备一台云服务器（推荐 Ubuntu 20.04+）
2. 安装 Node.js 和 npm
3. 克隆项目并安装依赖
4. 使用 PM2 管理进程
5. 配置 Nginx 反向代理

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📝 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## ⚠️ 免责声明

- 本项目仅供学习和个人使用
- 请遵守各平台的使用条款
- 不得用于商业用途
- 使用者需自行承担使用风险

## 🆘 支持

如果你遇到问题或有建议，请：

1. 查看 [故障排除指南](TROUBLESHOOTING.md)
2. 搜索现有的 [Issues](https://github.com/your-username/social-media-hub/issues)
3. 创建新的 Issue 描述你的问题

## 🙏 致谢

感谢以下开源项目：
- [React](https://reactjs.org/)
- [Ant Design](https://ant.design/)
- [Express.js](https://expressjs.com/)
- [Prisma](https://www.prisma.io/)
- [Puppeteer](https://pptr.dev/)