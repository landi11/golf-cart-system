#!/bin/bash
# 自动安装脚本 - 简化部署流程

set -e  # 遇到错误立即退出

# 获取脚本所在目录
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

echo "📦 高尔夫球车选配系统 - 自动安装脚本"
echo "===================================="
echo ""

# 检查 Python3
if ! command -v python3 &> /dev/null; then
    echo "❌ 未找到 Python3，请先安装 Python 3.7+"
    exit 1
fi

echo "✅ Python 版本: $(python3 --version)"

# 创建虚拟环境
if [ ! -d "$PROJECT_DIR/venv" ]; then
    echo "📦 创建 Python 虚拟环境..."
    python3 -m venv "$PROJECT_DIR/venv"
    echo "✅ 虚拟环境创建成功"
else
    echo "✅ 虚拟环境已存在"
fi

# 激活虚拟环境
source "$PROJECT_DIR/venv/bin/activate"

# 安装依赖
echo "📦 安装 Python 依赖包..."
pip install --upgrade pip
pip install -r "$PROJECT_DIR/deploy/requirements-prod.txt"
echo "✅ 依赖包安装成功"

# 创建必要的目录
echo "📁 创建必要目录..."
mkdir -p "$PROJECT_DIR/backend/logs"
mkdir -p "$PROJECT_DIR/backend/data"
echo "✅ 目录创建成功"

# 设置权限
echo "🔐 设置文件权限..."
chmod +x "$SCRIPT_DIR/start.sh"
chmod +x "$SCRIPT_DIR/install.sh"
echo "✅ 权限设置成功"

echo ""
echo "🎉 安装完成！"
echo ""
echo "📝 下一步操作："
echo "   1. 手动启动: cd deploy && ./start.sh"
echo "   2. 系统服务: 参考 DEPLOY.md 配置 systemd"
echo "   3. Web服务器: 参考 DEPLOY.md 配置 Nginx"
echo ""
echo "📍 访问地址: http://localhost:5000"
echo "👤 管理员账号: admin / admin123"
