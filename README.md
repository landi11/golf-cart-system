# 高尔夫球车选配系统

这是一个功能完整的高尔夫球车配置选购和报价管理系统，包含用户端选配界面和后台管理系统。

## 目录

- [系统特点](#-系统特点)
- [快速启动](#-快速启动)
- [功能介绍](#-功能介绍)
- [部署方式](#-部署方式)
  - [本地开发](#本地开发)
  - [服务器部署](#服务器部署)
  - [Vercel部署](#vercel部署免费)
  - [Docker部署](#docker部署)
- [技术栈](#-技术栈)
- [项目结构](#-项目结构)
- [安全说明](#-安全说明)

## 🌟 系统特点

- **用户友好**：直观的产品浏览和选配界面
- **实时计算**：自动计算价格、税费和优惠
- **灵活导出**：支持PDF和PNG格式导出报价单
- **完整管理**：产品、价格、订单、报价单全流程管理
- **响应式设计**：适配各种屏幕尺寸
- **多种部署**：支持本地、传统服务器、Vercel云平台、Docker容器

## 🚀 快速启动

### 本地开发

#### 环境要求
- Python 3.7+
- 现代浏览器（Chrome、Firefox、Edge等）

#### 安装依赖

```bash
cd backend
pip install -r requirements.txt
```

#### 启动后端服务

```bash
cd backend
python app.py
```

后端服务将在 http://localhost:5000 启动

#### 访问前端

**方式一：直接打开HTML文件**
1. 用户端：双击 `frontend/index.html`
2. 管理后台：双击 `frontend/admin.html`

**方式二：使用Live Server（推荐）**
1. 安装VSCode的Live Server插件
2. 右键HTML文件选择"Open with Live Server"

#### 默认管理员账号
- 用户名：admin
- 密码：admin123

## 📝 功能介绍

### 工作流程

#### 1. 用户端流程
1. 浏览产品分类和配置项
2. 选择所需配置添加到购物车
3. 点击"生成报价单"查看初始报价
4. 点击"提交报价单"发送到后台审核
5. 通过订单预览页面查看提交状态

#### 2. 管理员流程
1. 登录后台管理系统
2. 在"报价单管理"查看待审核报价单
3. 编辑价格、优惠、备注等信息
4. 审核通过报价单
5. 导出最终版报价单（PDF/PNG）

### 用户端功能
- ✅ 产品浏览和分类筛选
- ✅ 产品详情查看
- ✅ 购物车管理
- ✅ 实时价格计算
- ✅ 报价单预览
- ✅ 提交报价单到后台
- ✅ 订单状态查看

### 后台管理功能

#### 仪表盘
- 产品统计概览
- 分类统计
- 价格分析

#### 配置项管理
- 产品CRUD操作
- 图片上传和管理
- 分类筛选
- 产品搜索

#### 价格管理
- 单个价格修改
- 批量价格调整
- 价格表导出（CSV）

#### 图片管理
- 图片上传（支持拖拽）
- 图片库管理
- 图片编辑（名称、描述、标签）
- 图片删除

#### 模板管理
- 公司信息设置
- 报价单有效期设置
- 模板样式配置

#### 订单历史
- 订单列表查看
- 订单详情查看
- 订单搜索和过滤
- 多选批量删除
- 一键清空所有订单
- 订单导出（CSV）
- 订单重新导出（PDF/PNG）

#### 报价单管理
- 待审核报价单列表
- 报价单详情查看
- 报价单编辑（价格、优惠、备注）
- 报价单审核
- 报价单导出（PDF/PNG）
- 按状态筛选
- 报价单删除

### 导出功能

系统支持将报价单导出为两种格式：

#### PNG图片导出
- 高清图片格式
- 适合分享和预览
- 文件较小，易于传输

#### PDF文档导出
- 专业文档格式
- 适合打印和存档
- A4标准尺寸

## 🌐 部署方式

### 服务器部署

适合需要完整功能和数据持久化的生产环境。

#### 快速部署（5步完成）

**第一步：上传项目文件**

```bash
# 使用 scp 命令
scp -r "高尔夫球车" root@your-server-ip:/var/www/golf-cart

# 或使用 FTP 工具（FileZilla、WinSCP）
```

**第二步：安装系统依赖**

```bash
# Ubuntu/Debian 系统
sudo apt update
sudo apt install -y python3 python3-pip python3-venv nginx

# CentOS 系统
sudo yum update
sudo yum install -y python3 python3-pip nginx
```

**第三步：安装 Python 依赖**

```bash
cd /var/www/golf-cart
python3 -m venv venv
source venv/bin/activate
pip install -r deploy/requirements-prod.txt
mkdir -p backend/logs
```

**第四步：配置自动启动**

```bash
# 复制 systemd 服务文件
sudo cp deploy/golf-cart.service /etc/systemd/system/

# 编辑服务文件，修改路径
sudo nano /etc/systemd/system/golf-cart.service

# 启动服务
sudo systemctl daemon-reload
sudo systemctl start golf-cart
sudo systemctl enable golf-cart
```

**第五步：配置 Nginx**

```bash
# 复制配置文件
sudo cp deploy/nginx.conf /etc/nginx/sites-available/golf-cart

# 编辑配置，修改域名或IP
sudo nano /etc/nginx/sites-available/golf-cart

# 创建软链接并重启
sudo ln -s /etc/nginx/sites-available/golf-cart /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
sudo systemctl enable nginx
```

#### 访问系统

- 用户端：`http://your-server-ip/index.html`
- 管理后台：`http://your-server-ip/admin.html`

#### 常用管理命令

```bash
# 查看服务状态
sudo systemctl status golf-cart

# 重启服务
sudo systemctl restart golf-cart

# 查看日志
sudo journalctl -u golf-cart -f
tail -f /var/www/golf-cart/backend/logs/error.log
```

#### HTTPS配置（推荐）

```bash
# 安装 Certbot
sudo apt install certbot python3-certbot-nginx

# 获取 SSL 证书
sudo certbot --nginx -d your-domain.com

# 自动续期
sudo certbot renew --dry-run
```

### Vercel部署（免费）

适合快速部署和演示，无需管理服务器。

#### 优势
- 🆓 完全免费（有使用限额）
- 🚀 自动部署（Git推送后自动更新）
- 🌍 全球CDN（访问速度快）
- 🔒 免费HTTPS
- 📊 无需服务器管理

#### 部署步骤

**方式一：通过GitHub部署（推荐）**

1. 创建GitHub仓库并推送代码

```bash
cd "高尔夫球车"
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/your-username/golf-cart.git
git push -u origin main
```

2. 登录 [Vercel Dashboard](https://vercel.com/dashboard)
3. 点击 "Add New Project"
4. 导入你的GitHub仓库
5. 配置项目：
   - Framework Preset: Other
   - Root Directory: ./
   - Build Command: 留空
   - Output Directory: frontend
6. 点击 "Deploy"

**方式二：通过Vercel CLI**

```bash
# 安装 Vercel CLI
npm install -g vercel

# 登录并部署
vercel login
vercel --prod
```

#### 访问部署的网站

```
https://your-project-name.vercel.app
```

#### 更新部署

推送代码到GitHub后，Vercel会自动重新部署：

```bash
git add .
git commit -m "更新内容"
git push
```

#### 重要限制

Vercel是Serverless环境，有以下限制：
- Serverless Function执行时间：最长10秒
- 数据需要使用外部数据库（MongoDB Atlas、Supabase等）
- 文件上传需要外部存储服务

#### 推荐数据库方案

1. **MongoDB Atlas**（推荐）
   - 免费512MB存储
   - 全球分布式
   - 易于集成

2. **Supabase**（推荐）
   - 免费PostgreSQL数据库
   - 内置认证
   - 实时订阅

3. **Vercel Postgres**
   - Vercel原生集成
   - 配置简单

### Docker部署

适合需要环境隔离的快速部署。

#### 前提条件

```bash
# 安装 Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# 安装 Docker Compose
sudo apt install docker-compose

# 启动 Docker 服务
sudo systemctl start docker
sudo systemctl enable docker
```

#### 快速启动

```bash
cd deploy
docker-compose up -d
```

#### 常用命令

```bash
# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f

# 重启服务
docker-compose restart

# 停止服务
docker-compose down
```

#### 访问系统

- 前端：`http://your-server-ip`
- 管理后台：`http://your-server-ip/admin.html`

详细配置请查看 [deploy/DOCKER.md](deploy/DOCKER.md)

## 🛠 技术栈

### 前端
- HTML5 + CSS3
- 原生JavaScript (ES6+)
- html2canvas（HTML转图片）
- jsPDF（PDF生成）
- localStorage（本地存储）

### 后端
- Python 3
- Flask（Web框架）
- Flask-CORS（跨域支持）
- Gunicorn（WSGI服务器，生产环境）

### 部署
- Nginx（Web服务器 + 反向代理）
- Systemd（服务管理）
- Docker（容器化）
- Vercel（Serverless平台）

## 📁 项目结构

```
高尔夫球车/
├── README.md                    # 项目文档（本文件）
├── requirements.txt             # Python依赖
├── vercel.json                  # Vercel配置
├── .gitignore                   # Git忽略规则
│
├── frontend/                    # 前端代码
│   ├── index.html               # 用户端
│   ├── admin.html               # 管理后台
│   ├── quote.html               # 报价单
│   ├── quote-preview.html       # 订单预览
│   ├── login.html               # 登录页
│   ├── app.js                   # 用户端逻辑
│   ├── admin.js                 # 后台管理逻辑
│   ├── quote.js                 # 报价单逻辑
│   ├── quote-preview.js         # 订单预览逻辑
│   ├── login.js                 # 登录逻辑
│   ├── style.css                # 用户端样式
│   ├── admin-style.css          # 后台管理样式
│   ├── quote-style.css          # 报价单样式
│   ├── login-style.css          # 登录页面样式
│   ├── reset-data.html          # 数据重置页面
│   └── data/
│       └── products.json        # 前端数据（Vercel）
│
├── backend/                     # 后端代码
│   ├── app.py                   # Flask应用
│   ├── requirements.txt         # 后端依赖
│   └── data/
│       ├── products.json        # 产品数据
│       └── quotes.json          # 报价数据
│
├── deploy/                      # 部署配置
│   ├── README.md                # 部署文件说明
│   ├── DOCKER.md                # Docker指南
│   ├── docker-compose.yml       # Docker编排
│   ├── Dockerfile               # Docker镜像
│   ├── gunicorn_config.py       # Gunicorn配置
│   ├── nginx.conf               # Nginx配置
│   ├── nginx-docker.conf        # Docker Nginx配置
│   ├── golf-cart.service        # Systemd服务
│   ├── requirements-prod.txt    # 生产环境依赖
│   ├── install.sh               # 安装脚本
│   └── start.sh                 # 启动脚本
│
├── api/                         # Vercel API
│   └── index.py                 # Serverless入口
│
└── public/                      # 公共资源
    └── images/                  # 产品图片
```

## 🔒 安全说明

### 当前实现（演示用途）
- 前端使用localStorage存储登录状态
- JSON文件存储数据
- 简单的密码验证

### 生产环境建议
- ✅ 实现真实的用户认证系统（JWT、Session）
- ✅ 使用数据库存储数据（MySQL、PostgreSQL、MongoDB）
- ✅ 添加HTTPS加密
- ✅ 实现权限控制和RBAC
- ✅ 添加输入验证和XSS防护
- ✅ 使用环境变量管理敏感配置
- ✅ 定期备份数据
- ✅ 修改默认管理员密码

## 💡 开发说明

### 数据持久化
- 后台修改的产品数据保存在localStorage的`productsData`
- 订单历史保存在localStorage的`ordersHistory`
- 报价单通过后端API管理

### Toast通知系统
系统内置Toast通知，显示操作结果：
- 成功 ✅ - 绿色
- 错误 ❌ - 红色
- 警告 ⚠️ - 橙色
- 提示 ℹ️ - 蓝色

### 确认弹窗系统
重要操作使用Promise-based确认弹窗：
```javascript
const confirmed = await showConfirm({
    icon: '🗑️',
    title: '删除订单',
    message: '确定要删除吗？',
    type: 'danger'
});
```

## 🐛 常见问题

### 后端无法启动
- 检查Python版本（需要3.7+）
- 确认已安装依赖：`pip install -r requirements.txt`
- 检查5000端口是否被占用

### 前端无法加载数据
- 确认后端服务已启动
- 检查浏览器控制台错误
- 清除localStorage缓存

### 图片无法显示
- 确认图片路径正确
- 检查图片文件是否存在
- 使用图片管理功能上传图片

### Vercel部署后数据无法保存
- Vercel是Serverless环境，不支持文件持久化
- 需要集成外部数据库（MongoDB Atlas、Supabase等）

### 服务器部署后无法访问
- 检查防火墙是否开放80/443端口
- 检查Nginx和后端服务是否正常运行
- 查看日志文件定位问题

## 📊 部署方式对比

| 特性 | 本地开发 | 传统服务器 | Vercel | Docker |
|------|---------|----------|--------|--------|
| 成本 | 免费 | 付费 | 免费/付费 | 免费（服务器需付费） |
| 易用性 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| 性能 | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| 数据持久化 | ✅ | ✅ | ❌（需外部数据库） | ✅ |
| HTTPS | ❌ | ✅（需配置） | ✅（自动） | ✅（需配置） |
| 自动部署 | ❌ | ❌ | ✅ | ❌ |
| 适用场景 | 开发测试 | 生产环境 | 快速演示 | 快速部署/测试 |

## 📞 支持与反馈

如有问题或建议，请通过以下方式联系：
- 项目Issues
- 邮件反馈

## 📄 许可证

本项目仅供学习和演示使用。
