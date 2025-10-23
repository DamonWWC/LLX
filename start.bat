@echo off
chcp 65001 >nul

echo 🚀 启动林龍香大米商城 Vue3版本
echo ==================================

REM 检查Node.js版本
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ 请先安装 Node.js 16.0+
    pause
    exit /b 1
)

echo ✅ Node.js 版本检查通过
node --version

REM 安装依赖
echo 📦 安装依赖...
echo    - Vue3 + Vite 构建工具
echo    - Element Plus UI组件库
echo    - Sass 样式预处理器
echo    - Pinia 状态管理
call npm install

if %errorlevel% neq 0 (
    echo ❌ 依赖安装失败
    pause
    exit /b 1
)

echo ✅ 依赖安装完成

REM 启动开发服务器
echo 🎉 启动开发服务器...
echo 浏览器将自动打开 http://localhost:3000
echo 按 Ctrl+C 停止服务器
echo.

call npm run dev
