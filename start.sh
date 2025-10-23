#!/bin/bash

echo "🚀 启动林龍香大米商城 Vue3版本"
echo "=================================="

# 检查Node.js版本
if ! command -v node &> /dev/null; then
    echo "❌ 请先安装 Node.js 16.0+"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    echo "❌ Node.js 版本过低，请升级到 16.0+"
    exit 1
fi

echo "✅ Node.js 版本检查通过: $(node -v)"

# 安装依赖
echo "📦 安装依赖..."
echo "   - Vue3 + Vite 构建工具"
echo "   - Element Plus UI组件库"
echo "   - Sass 样式预处理器"
echo "   - Pinia 状态管理"
npm install

if [ $? -ne 0 ]; then
    echo "❌ 依赖安装失败"
    exit 1
fi

echo "✅ 依赖安装完成"

# 启动开发服务器
echo "🎉 启动开发服务器..."
echo "浏览器将自动打开 http://localhost:3000"
echo "按 Ctrl+C 停止服务器"
echo ""

npm run dev
