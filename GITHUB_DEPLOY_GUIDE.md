# GitHub部署完整指南

## 🚀 一键部署到GitHub

### 准备工作

1. 确保已安装Git
2. 拥有GitHub账号
3. 项目代码已经准备完成

### 第一步：创建GitHub仓库

1. 打开 [GitHub](https://github.com)
2. 点击右上角的 **"+"** → **"New repository"**
3. 填写仓库信息：
   ```
   Repository name: social-media-hub
   Description: 个人社交媒体资源库 - 提取、保存、搜索和编辑抖音小红书内容
   Public: ✅ (选择公开)
   ```
4. **不要**勾选 "Initialize this repository with a README"
5. 点击 **"Create repository"**

### 第二步：上传代码

```bash
# 1. 进入项目目录
cd C:\WINDOWS\system32\social-media-hub

# 2. 配置Git（如果第一次使用）
git config --global user.name "你的GitHub用户名"
git config --global user.email "你的GitHub邮箱"

# 3. 连接到GitHub仓库（将下面的"你的用户名"替换成你的GitHub用户名）
git remote add origin https://github.com/你的用户名/social-media-hub.git

# 4. 提交代码
git commit -m "🚀 初始提交：完整的社交媒体资源库应用

✨ 功能特性：
- 🎯 抖音/小红书内容自动提取
- 🔍 强大的搜索和筛选功能
- 📁 二级分类管理系统
- ✏️ 内容编辑和批量操作
- 💾 本地SQLite数据库存储
- 📱 响应式设计，支持移动端

🛠 技术栈：
- 后端：Node.js + Express + Prisma + SQLite
- 前端：React + TypeScript + Ant Design + Zustand
- 部署：Docker + GitHub Actions"

# 5. 推送到GitHub
git branch -M main
git push -u origin main
```

### 第三步：配置GitHub Pages（自动部署前端）

1. **进入GitHub仓库设置**：
   - 点击仓库顶部的 **"Settings"** 标签

2. **启用GitHub Pages**：
   - 在左侧菜单找到 **"Pages"**
   - Source 选择 **"GitHub Actions"**

3. **GitHub Actions会自动构建和部署**：
   - 每次推送代码到main分支都会自动部署
   - 部署完成后可在Actions页面查看进度

### 第四步：访问你的应用

1. **获取部署URL**：
   - 等待Actions构建完成（通常需要2-5分钟）
   - 在Settings → Pages中可以看到部署链接
   - 格式为：`https://你的用户名.github.io/social-media-hub`

2. **本地测试（可选）**：
   ```bash
   # 启动后端
   cd backend
   npm install
   npx prisma migrate dev --name init
   npm run dev

   # 新开终端启动前端
   cd frontend
   npm install
   npm start
   ```

## 🌐 部署后端到云服务

由于GitHub Pages只能托管静态网站，后端需要部署到云服务：

### 选项1：Vercel（推荐新手）

1. 访问 [Vercel](https://vercel.com)
2. 使用GitHub账号登录
3. 点击 **"New Project"**
4. 选择你的GitHub仓库
5. 配置环境变量：
   ```
   NODE_ENV=production
   PORT=3001
   DATABASE_URL=postgresql://user:pass@host:port/db
   ```
6. 点击 **"Deploy"**

### 选项2：Railway

1. 访问 [Railway](https://railway.app)
2. 登录并连接GitHub账号
3. 点击 **"New Project"** → **"Deploy from GitHub repo"**
4. 选择你的仓库
5. 添加环境变量
6. 点击 **"Deploy Now"**

### 选项3：自建服务器

```bash
# 1. 服务器上安装环境
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 2. 克隆代码
git clone https://github.com/你的用户名/social-media-hub.git
cd social-media-hub/backend

# 3. 安装依赖并启动
npm install
npx prisma migrate dev
npm install -g pm2
pm2 start "npm run dev" --name "social-media-backend"
```

## 🔧 配置说明

### 环境变量配置

**后端环境变量** (在云服务提供商的设置中配置)：
```env
NODE_ENV=production
PORT=3001
FRONTEND_URL=https://你的用户名.github.io/social-media-hub
DATABASE_URL=file:./dev.db
UPLOAD_DIR=./uploads
```

**前端环境变量** (在frontend/.env文件中)：
```env
REACT_APP_API_URL=https://你的后端域名.com/api
```

### 自定义域名（可选）

1. **购买域名**（如阿里云、腾讯云等）
2. **配置DNS**：
   - CNAME记录：www → 你的用户名.github.io
   - A记录：@ → GitHub Pages IP
3. **在GitHub仓库中配置**：
   - Settings → Pages → Custom domain
   - 输入你的域名

## 📊 部署状态检查

### 检查前端部署
1. 访问 `https://你的用户名.github.io/social-media-hub`
2. 检查页面是否正常加载
3. 查看浏览器控制台是否有错误

### 检查后端部署
```bash
# 测试API连接
curl https://你的后端域名.com/health
# 应该返回：{"status":"ok","timestamp":"..."}
```

### 查看部署日志
1. **GitHub Actions日志**：
   - 仓库页面 → Actions → 选择workflow
2. **云服务日志**：
   - Vercel: 项目页面 → Logs
   - Railway: 项目页面 → Logs

## 🆘 常见问题

### 1. 推送失败
```bash
# 如果推送失败，尝试强制推送
git push -f origin main
```

### 2. 部署失败
- 检查代码是否有语法错误
- 查看GitHub Actions的错误日志
- 确认所有依赖都已正确安装

### 3. 页面无法访问
- 等待几分钟让DNS生效
- 检查GitHub Pages是否已启用
- 清除浏览器缓存

### 4. API连接失败
- 检查后端是否正确部署
- 确认环境变量配置正确
- 检查CORS设置

## 📝 维护更新

### 更新代码
```bash
# 1. 修改本地代码
# 2. 提交更改
git add .
git commit -m "更新功能"
git push origin main

# 3. GitHub Actions会自动重新部署
```

### 备份数据
```bash
# 定期备份数据库
cp backend/dev.db backup_$(date +%Y%m%d).db
```

---

## 🎉 完成！

现在你的社交媒体资源库应用已经成功部署到GitHub了！

📱 **访问地址**：`https://你的用户名.github.io/social-media-hub`

🔧 **本地开发**：
- 后端：`cd backend && npm run dev` (端口3001)
- 前端：`cd frontend && npm start` (端口3000)

有任何问题都可以查看 TROUBLESHOOTING.md 文件或创建GitHub Issue。