# 高尔夫球车选配系统

这是一个功能完整的高尔夫球车配置选购和报价管理系统，包含用户端选配界面和后台管理系统。

## 🌟 系统特点

- **用户友好**：直观的产品浏览和选配界面
- **实时计算**：自动计算价格、税费和优惠
- **灵活导出**：支持PDF和PNG格式导出报价单
- **完整管理**：产品、价格、订单、报价单全流程管理
- **响应式设计**：适配各种屏幕尺寸

## 📋 系统架构

### 前端 (Frontend)
- **index.html** - 用户产品选配页面
- **quote.html** - 报价单预览页面
- **quote-preview.html** - 订单预览页面
- **admin.html** - 后台管理系统
- **login.html** - 管理员登录页面

### 后端 (Backend)
- **Flask** REST API 服务
- **端口**: 5000
- **数据存储**: JSON文件 + localStorage

## 🔄 工作流程

### 1. 用户端流程
1. 浏览产品分类和配置项
2. 选择所需配置添加到购物车
3. 点击"生成报价单"查看初始报价
4. 点击"提交报价单"发送到后台审核
5. 通过订单预览页面查看提交状态

### 2. 管理员流程
1. 登录后台管理系统
2. 在"报价单管理"查看待审核报价单
3. 编辑价格、优惠、备注等信息
4. 审核通过报价单
5. 导出最终版报价单（PDF/PNG）

## 🚀 快速启动

### 环境要求
- Python 3.7+
- 现代浏览器（Chrome、Firefox、Edge等）

### 安装依赖

```bash
cd backend
pip install -r requirements.txt
```

### 启动后端服务

```bash
cd backend
python app.py
```

后端服务将在 http://localhost:5000 启动

### 访问前端

**方式一：直接打开HTML文件**
1. 用户端：双击 `frontend/index.html`
2. 管理后台：双击 `frontend/admin.html`

**方式二：使用Live Server（推荐）**
1. 安装VSCode的Live Server插件
2. 右键HTML文件选择"Open with Live Server"

### 默认管理员账号
- 用户名：admin
- 密码：admin123

## 🌐 服务器部署

### 快速部署到服务器（无需改代码）

项目提供完整的部署配置，支持多种部署方式：

#### 方式一：传统部署（推荐）
```bash
# 1. 上传项目到服务器
# 2. 运行自动安装脚本
cd deploy
chmod +x install.sh
./install.sh

# 3. 配置 systemd 和 Nginx（开机自启）
# 详见 DEPLOY.md 文档
```

#### 方式二：Docker 部署（最简单）
```bash
cd deploy
docker-compose up -d
```

**详细部署文档**：
- 📖 [完整部署指南 - DEPLOY.md](DEPLOY.md) - 包含 systemd、Nginx、HTTPS 配置
- 🐳 [Docker 部署 - deploy/DOCKER.md](deploy/DOCKER.md) - 一键启动，环境隔离

**部署特点**：
- ✅ 零代码修改
- ✅ 开机自动启动
- ✅ 生产级配置（Gunicorn + Nginx）
- ✅ 支持域名和 HTTPS
- ✅ 完整的日志系统

## 📝 主要功能

### 用户端功能
- ✅ 产品浏览和分类筛选
- ✅ 产品详情查看
- ✅ 购物车管理
- ✅ 实时价格计算
- ✅ 报价单预览
- ✅ 提交报价单到后台
- ✅ 订单状态查看
- ✅ 前端仅可预览（不可导出PDF）

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

## 🎨 导出功能

系统支持将报价单导出为两种格式：

### PNG图片导出
- 高清图片格式
- 适合分享和预览
- 文件较小，易于传输

### PDF文档导出
- 专业文档格式
- 适合打印和存档
- A4标准尺寸

**导出位置：**
- 订单历史：订单详情 → "重新导出" → 选择格式
- 报价单管理：已审核报价单 → "导出报价单" → 选择格式

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
- JSON（数据存储）

## 📁 项目结构

```
高尔夫球车/
├── frontend/                 # 前端文件
│   ├── index.html           # 用户选配页面
│   ├── quote.html           # 报价单页面
│   ├── quote-preview.html   # 订单预览页面
│   ├── admin.html           # 后台管理页面
│   ├── login.html           # 登录页面
│   ├── app.js               # 用户端逻辑
│   ├── quote.js             # 报价单逻辑
│   ├── quote-preview.js     # 订单预览逻辑
│   ├── admin.js             # 后台管理逻辑
│   ├── login.js             # 登录逻辑
│   ├── style.css            # 用户端样式
│   ├── quote-style.css      # 报价单样式
│   ├── admin-style.css      # 后台管理样式
│   └── login-style.css      # 登录页面样式
├── backend/                 # 后端文件
│   ├── app.py              # Flask应用
│   ├── requirements.txt     # Python依赖
│   └── data/               # 数据文件
│       └── products.json    # 产品数据
├── public/                  # 公共资源
│   └── images/             # 产品图片
└── README.md               # 项目文档
```

## 🔒 安全说明

- 前端使用localStorage存储登录状态（仅演示用途）
- 生产环境需要：
  - 实现真实的用户认证系统
  - 使用数据库存储数据
  - 添加HTTPS加密
  - 实现权限控制
  - 添加输入验证和XSS防护

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

## 📞 支持与反馈

如有问题或建议，请通过以下方式联系：
- 项目Issues
- 邮件反馈

## 📄 许可证

本项目仅供学习和演示使用。
