#!/bin/bash
# 快速启动脚本 - 用于手动启动应用

# 获取脚本所在目录
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

echo "📦 高尔夫球车选配系统 - 启动脚本"
echo "================================"

# 检查虚拟环境
if [ ! -d "$PROJECT_DIR/venv" ]; then
    echo "❌ 未找到虚拟环境，请先运行安装脚本"
    exit 1
fi

# 激活虚拟环境
source "$PROJECT_DIR/venv/bin/activate"

# 进入后端目录
cd "$PROJECT_DIR/backend"

# 创建日志目录
mkdir -p logs

# 启动应用
echo "🚀 正在启动应用..."
echo "📍 访问地址: http://localhost:5000"
echo "⏹️  按 Ctrl+C 停止服务"
echo ""

gunicorn -c "$PROJECT_DIR/deploy/gunicorn_config.py" app:app
