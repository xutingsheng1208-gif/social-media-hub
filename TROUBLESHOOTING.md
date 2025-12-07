# 故障排除指南

## 常见问题解决

### 1. 无法启动应用

#### 问题：前端的package.json缺失
**症状**:
```
cd frontend
npm install
# 错误：ENOENT: no such file or directory, open 'package.json'
```

**解决方案**:
```bash
# 重新创建package.json
cd social-media-hub/frontend
npm init -y
# 然后手动安装依赖
npm install react@18.2.0 react-dom@18.2.0 react-scripts@5.0.1 typescript antd axios
```

#### 问题：Node.js版本过低
**症状**:
```
ERROR: Node.js version 16.x.x is required. Current version: 14.x.x
```

**解决方案**:
- 下载并安装最新的Node.js LTS版本: https://nodejs.org/

### 2. 后端启动失败

#### 问题：端口3001被占用
**症状**:
```
Error: listen EADDRINUSE :::3001
```

**解决方案**:
```bash
# Windows
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:3001 | xargs kill -9

# 或者修改端口
# 编辑 backend/.env 文件，将 PORT=3001 改为 PORT=3002
```

#### 问题：数据库连接失败
**症状**:
```
Error: Can't reach database server
```

**解决方案**:
```bash
cd backend
npx prisma generate
npx prisma migrate dev --name init
```

#### 问题：Puppeteer安装失败
**症状**:
```
Error: Chromium download failed
```

**解决方案**:
```bash
# 手动安装Chromium
npm install puppeteer --ignore-scripts
```

### 3. 前端启动失败

#### 问题：端口3000被占用
**症状**:
```
Something is already running on port 3000
```

**解决方案**:
- 方案1: 关闭占用端口的应用
- 方案2: 自动使用其他端口
```bash
npm start -- --port=3001
```

#### 问题：依赖安装失败
**症状**:
```
npm ERR! code ERESOLVE
```

**解决方案**:
```bash
# 清除缓存
npm cache clean --force
# 删除node_modules
rm -rf node_modules package-lock.json
# 重新安装
npm install
```

### 4. 内容提取失败

#### 问题：无法访问抖音/小红书
**症状**:
```
Error: net::ERR_CONNECTION_REFUSED
```

**解决方案**:
1. 检查网络连接
2. 尝试使用VPN
3. 检查链接格式是否正确

#### 问题：内容提取超时
**症状**:
```
Error: Timeout exceeded
```

**解决方案**:
1. 增加超时时间（修改extractor中的timeout设置）
2. 检查网络稳定性
3. 尝试重新提取

### 5. 数据问题

#### 问题：数据库损坏
**症状**:
```
Error: database disk image is malformed
```

**解决方案**:
```bash
cd backend/prisma
rm dev.db
npx prisma migrate dev --name init
```

#### 问题：文件丢失
**症状**:
```
Error: ENOENT: no such file or directory
```

**解决方案**:
1. 检查uploads目录是否存在
2. 确保文件路径正确
3. 检查文件权限

### 6. 性能问题

#### 问题：应用启动缓慢
**解决方案**:
1. 清理不必要的文件
2. 增加内存分配
3. 检查磁盘空间

#### 问题：内容加载慢
**解决方案**:
1. 启用分页加载
2. 压缩图片和视频
3. 使用CDN

## 重新安装步骤

如果问题严重，建议完全重新安装：

```bash
# 1. 删除项目目录
rm -rf social-media-hub

# 2. 重新创建项目
mkdir social-media-hub
cd social-media-hub

# 3. 运行安装脚本
# Windows
start.bat

# macOS/Linux
chmod +x start.sh
./start.sh
```

## 获取帮助

如果以上解决方案无法解决问题：

1. 检查控制台错误信息
2. 查看日志文件
3. 确认系统要求满足
4. 重新安装Node.js和npm

## 系统要求

- **Node.js**: 16.0 或更高版本
- **npm**: 8.0 或更高版本
- **操作系统**: Windows 10+, macOS 10.15+, Ubuntu 18.04+
- **内存**: 至少 4GB RAM
- **磁盘空间**: 至少 2GB 可用空间