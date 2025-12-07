@echo off
echo ========================================
echo 社交媒体资源库 - 快速启动脚本
echo ========================================

echo.
echo 正在检查Node.js是否安装...
node --version
if %errorlevel% neq 0 (
    echo 错误: Node.js未安装，请先安装Node.js
    pause
    exit /b 1
)

echo.
echo 正在安装后端依赖...
cd backend
npm install
if %errorlevel% neq 0 (
    echo 后端依赖安装失败
    pause
    exit /b 1
)

echo.
echo 正在初始化数据库...
npx prisma generate
if %errorlevel% neq 0 (
    echo 数据库生成失败
    pause
    exit /b 1
)

npx prisma migrate dev --name init
if %errorlevel% neq 0 (
    echo 数据库迁移失败，尝试创建新数据库...
    npx prisma migrate dev --name init --force
)

echo.
echo 正在安装前端依赖...
cd ../frontend
npm install
if %errorlevel% neq 0 (
    echo 前端依赖安装失败
    pause
    exit /b 1
)

echo.
echo ========================================
echo 安装完成！
echo ========================================
echo.
echo 启动说明：
echo 1. 启动后端：在 backend 目录下运行 npm run dev
echo 2. 启动前端：在 frontend 目录下运行 npm start
echo 3. 访问地址：http://localhost:3000
echo.
echo 按任意键退出...
pause >nul