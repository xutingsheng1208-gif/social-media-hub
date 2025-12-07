# 部署指南

## 部署到GitHub

### 第一步：创建GitHub仓库

1. 登录 [GitHub](https://github.com)
2. 点击右上角的 "+"，选择 "New repository"
3. 填写仓库信息：
   - **Repository name**: `social-media-hub`
   - **Description**: `个人社交媒体资源库 - 提取、保存、搜索和编辑抖音小红书内容`
   - **Public/Private**: 选择 Public 或 Private
4. 点击 "Create repository"

### 第二步：上传代码到GitHub

```bash
# 进入项目目录
cd social-media-hub

# 配置Git用户信息（如果还没有配置）
git config --global user.name "你的GitHub用户名"
git config --global user.email "你的GitHub邮箱"

# 添加远程仓库
git remote add origin https://github.com/你的用户名/social-media-hub.git

# 添加所有文件到暂存区
git add .

# 提交文件
git commit -m "Initial commit: 完整的社交媒体资源库应用"

# 推送到GitHub
git branch -M main
git push -u origin main
```

### 第三步：部署到GitHub Pages（前端）

1. **更新前端package.json**:
```json
{
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d build"
  },
  "homepage": "https://你的用户名.github.io/social-media-hub"
}
```

2. **安装部署工具**:
```bash
cd frontend
npm install --save-dev gh-pages
```

3. **部署到GitHub Pages**:
```bash
npm run deploy
```

4. **在GitHub仓库中启用GitHub Pages**:
   - 进入仓库 Settings
   - 找到 Pages 部分
   - Source 选择 "Deploy from a branch"
   - Branch 选择 "gh-pages" 和 "/ (root)"
   - 点击 Save

### 第四步：部署后端到GitHub（可选）

GitHub主要用于托管静态网站，后端服务需要其他部署方案：

#### 选项1：Vercel部署（推荐）
1. 访问 [Vercel](https://vercel.com)
2. 导入GitHub仓库
3. 配置环境变量
4. 自动部署

#### 选项2：Railway部署
1. 访问 [Railway](https://railway.app)
2. 连接GitHub仓库
3. 配置部署设置
4. 一键部署

#### 选项3：自己的服务器
```bash
# 在服务器上
git clone https://github.com/你的用户名/social-media-hub.git
cd social-media-hub
cd backend
npm install
npx prisma migrate dev
npm run dev
```

## 部署到云服务器

### 使用Docker部署（最简单）

1. **安装Docker和Docker Compose**:
```bash
# Ubuntu/Debian
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# CentOS/RHEL
sudo yum install -y yum-utils
sudo yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
sudo yum install -y docker-ce docker-ce-cli containerd.io
```

2. **克隆项目并启动**:
```bash
git clone https://github.com/你的用户名/social-media-hub.git
cd social-media-hub
docker-compose up -d
```

3. **配置Nginx反向代理**:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
    }

    location /api {
        proxy_pass http://localhost:3001;
    }
}
```

### 手动部署

1. **安装Node.js**:
```bash
# 使用NodeSource
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 或使用nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 18
nvm use 18
```

2. **安装PM2进程管理器**:
```bash
sudo npm install -g pm2
```

3. **部署后端**:
```bash
git clone https://github.com/你的用户名/social-media-hub.git
cd social-media-hub/backend
npm install
npx prisma migrate dev
pm2 start "npm run dev" --name "social-media-backend"
```

4. **部署前端**:
```bash
cd ../frontend
npm install
npm run build
# 使用serve或nginx托管静态文件
sudo npm install -g serve
serve -s build -l 3000
```

## 环境变量配置

### 后端环境变量
创建 `backend/.env` 文件：
```env
NODE_ENV=production
PORT=3001
FRONTEND_URL=https://your-domain.com
DATABASE_URL="file:./dev.db"
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=50MB
```

### 前端环境变量
创建 `frontend/.env.production` 文件：
```env
REACT_APP_API_URL=https://your-api-domain.com/api
```

## 域名和SSL配置

### 使用Let's Encrypt免费SSL

```bash
# 安装certbot
sudo apt-get install certbot python3-certbot-nginx

# 获取SSL证书
sudo certbot --nginx -d your-domain.com

# 自动续期
sudo crontab -e
# 添加以下行
0 12 * * * /usr/bin/certbot renew --quiet
```

## 监控和维护

### 使用PM2监控
```bash
# 查看状态
pm2 status

# 查看日志
pm2 logs

# 重启应用
pm2 restart social-media-backend

# 开机自启
pm2 startup
pm2 save
```

### 备份数据
```bash
# 创建备份脚本
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
tar -czf backup_$DATE.tar.gz \
    social-media-hub/backend/dev.db \
    social-media-hub/backend/uploads/

# 上传到云存储（可选）
# aws s3 cp backup_$DATE.tar.gz s3://your-backup-bucket/
```

## 性能优化

### 前端优化
1. 启用Gzip压缩
2. 使用CDN加速
3. 代码分割和懒加载
4. 图片优化和懒加载

### 后端优化
1. 数据库索引优化
2. 实现缓存机制
3. 文件压缩和缩略图
4. 使用集群模式

## 故障排除

### 常见问题
1. **端口冲突**: 修改端口配置
2. **权限问题**: 检查文件和目录权限
3. **内存不足**: 增加swap空间或升级服务器
4. **网络问题**: 检查防火墙和网络安全组设置

### 日志查看
```bash
# 应用日志
pm2 logs

# 系统日志
sudo journalctl -u nginx

# Docker日志
docker-compose logs -f
```

现在你的项目已经准备好部署到GitHub了！按照以上步骤操作即可。