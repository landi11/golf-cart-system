# Vercel Serverless Function Entry Point
# 这个文件是 Vercel 部署的入口点

import sys
import os

# 添加 backend 目录到 Python 路径
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

# 导入 Flask 应用
from app import app

# Vercel 需要的 handler
def handler(request, response):
    return app(request, response)
