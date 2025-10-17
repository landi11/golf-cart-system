# Vercel 部署指南

本指南将帮助你将高尔夫球车选配系统部署到 Vercel 云平台（免费）。

## ✨ Vercel 优势

- 🆓 **完全免费**（有一定使用限额）
- 🚀 **自动部署**（Git 推送后自动更新）
- 🌍 **全球 CDN**（访问速度快）
- 🔒 **免费 HTTPS**（自动配置 SSL）
- 📊 **无需服务器管理**

## 📋 准备工作

### 1. 注册账号

访问 [Vercel 官网](https://vercel.com) 并注册：
- 推荐使用 GitHub 账号登录
- 完全免费，无需信用卡

### 2. 安装 Vercel CLI（可选）

```bash
# 全局安装 Vercel CLI
npm install -g vercel

# 或使用 pnpm
pnpm install -g vercel

# 或使用 yarn
yarn global add vercel
```

## 🚀 部署方式

### 方式一：通过 GitHub 部署（推荐）

#### 步骤 1：创建 GitHub 仓库

```bash
# 在项目目录初始化 Git
cd "c:\Users\ASUS\Desktop\高尔夫球车"
git init

# 添加所有文件
git add .

# 创建提交
git commit -m "Initial commit"

# 在 GitHub 上创建新仓库，然后推送
git remote add origin https://github.com/your-username/golf-cart.git
git branch -M main
git push -u origin main
```

#### 步骤 2：导入到 Vercel

1. 登录 [Vercel Dashboard](https://vercel.com/dashboard)
2. 点击 **"Add New Project"**
3. 点击 **"Import Git Repository"**
4. 选择你的 GitHub 仓库
5. 配置项目：
   - **Framework Preset**: Other
   - **Root Directory**: `./` (保持默认)
   - **Build Command**: 留空
   - **Output Directory**: `frontend`
6. 点击 **"Deploy"**

#### 步骤 3：等待部署完成

部署通常需要 1-3 分钟，完成后你会得到：
- 一个 `.vercel.app` 域名
- 自动配置的 HTTPS

### 方式二：通过 Vercel CLI 部署

```bash
# 登录 Vercel
vercel login

# 进入项目目录
cd "c:\Users\ASUS\Desktop\高尔夫球车"

# 部署到生产环境
vercel --prod

# 按照提示操作：
# - Set up and deploy: Y
# - Which scope: 选择你的账号
# - Link to existing project: N
# - Project name: golf-cart-system
# - In which directory is your code located: ./
```

### 方式三：拖拽部署（最简单）

1. 将整个项目文件夹压缩为 ZIP
2. 访问 [Vercel Dashboard](https://vercel.com/dashboard)
3. 拖拽 ZIP 文件到页面
4. 等待部署完成

## ⚙️ 重要配置说明

### 已创建的配置文件

#### 1. vercel.json
项目根目录的配置文件，定义了：
- Python 后端构建
- 路由规则（API 和静态文件）
- 输出目录

#### 2. api/index.py
Vercel Serverless Function 入口点，连接 Flask 后端。

#### 3. requirements.txt
Python 依赖列表，Vercel 会自动安装。

#### 4. .vercelignore
忽略不需要部署的文件。

### 环境变量配置（可选）

如果需要配置环境变量：

1. 在 Vercel Dashboard 进入项目
2. 点击 **Settings** → **Environment Variables**
3. 添加变量（例如数据库连接）

## 🌐 访问部署的网站

部署完成后，Vercel 会提供一个地址：
```
https://your-project-name.vercel.app
```

访问页面：
- 用户端：`https://your-project-name.vercel.app/index.html`
- 管理后台：`https://your-project-name.vercel.app/admin.html`
- 登录页面：`https://your-project-name.vercel.app/login.html`

## 🔄 更新部署

### 通过 GitHub（自动）
```bash
# 修改代码后
git add .
git commit -m "更新内容"
git push

# Vercel 会自动检测并重新部署
```

### 通过 CLI
```bash
vercel --prod
```

## ⚠️ 重要限制和注意事项

### Vercel 免费版限制

- **Serverless Function 执行时间**: 最长 10 秒
- **部署数量**: 每月 100 次
- **带宽**: 100GB/月
- **构建时间**: 6000 分钟/月

### 数据持久化问题

**重要**：Vercel 的 Serverless 环境是**无状态**的，这意味着：

❌ **不支持**：
- localStorage 在服务器端不可用
- 文件上传后无法持久保存
- 数据库需要使用外部服务

✅ **解决方案**：

#### 方案 1：使用外部数据库（推荐）

集成免费数据库服务：

**MongoDB Atlas（推荐）**
```bash
# 1. 注册 MongoDB Atlas: https://www.mongodb.com/cloud/atlas
# 2. 创建免费集群
# 3. 在 Vercel 添加环境变量 MONGODB_URI
# 4. 修改 backend/app.py 使用 MongoDB
```

**Supabase（推荐）**
```bash
# 1. 注册 Supabase: https://supabase.com
# 2. 创建项目
# 3. 使用 PostgreSQL 数据库
# 4. 在 Vercel 配置数据库连接
```

**Vercel Postgres（推荐）**
```bash
# 1. 在 Vercel Dashboard 点击 Storage
# 2. 创建 Postgres 数据库
# 3. 自动配置环境变量
```

#### 方案 2：使用 Vercel KV（键值存储）

```bash
# 1. 在 Vercel Dashboard 创建 KV 存储
# 2. 自动获得环境变量
# 3. 修改代码使用 KV API
```

#### 方案 3：保持文件系统（仅读取）

如果只需要读取初始数据：
- 将 `backend/data/products.json` 打包到部署中
- 只读模式，不保存修改

## 🔧 配置自定义域名（可选）

### 步骤：

1. 在 Vercel Dashboard 进入项目
2. 点击 **Settings** → **Domains**
3. 添加你的域名
4. 在域名注册商配置 DNS：
   ```
   类型: CNAME
   名称: @（或 www）
   值: cname.vercel-dns.com
   ```
5. 等待 DNS 生效（可能需要几分钟到几小时）

## 📊 监控和日志

### 查看部署日志

1. 进入 [Vercel Dashboard](https://vercel.com/dashboard)
2. 选择项目
3. 点击 **Deployments**
4. 点击某次部署查看日志

### 查看运行时日志

1. 点击 **Functions**
2. 选择函数查看执行日志
3. 查看错误和性能指标

## 🐛 常见问题

### 问题 1：部署失败 - Python 依赖错误

**解决**：
```bash
# 确保 requirements.txt 在根目录
# 检查依赖版本是否兼容
```

### 问题 2：API 返回 404

**解决**：
- 检查 `vercel.json` 的路由配置
- 确保 API 路径以 `/api/` 开头
- 查看部署日志定位问题

### 问题 3：静态文件无法加载

**解决**：
- 检查文件路径是否正确
- 确保文件在 `frontend/` 目录下
- 检查 `vercel.json` 的路由规则

### 问题 4：数据无法保存

**原因**：Vercel Serverless 是无状态的

**解决**：使用外部数据库（见上文"数据持久化问题"）

### 问题 5：函数超时

**原因**：免费版函数最长执行 10 秒

**解决**：
- 优化代码性能
- 减少外部 API 调用
- 考虑升级到付费版

## 💡 优化建议

### 1. 性能优化

```json
// vercel.json 添加缓存配置
{
  "headers": [
    {
      "source": "/(.*\\.(css|js|png|jpg|jpeg|gif|svg))",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

### 2. 安全配置

```json
// vercel.json 添加安全头
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ]
}
```

## 📞 获取帮助

- 📖 [Vercel 官方文档](https://vercel.com/docs)
- 💬 [Vercel 社区论坛](https://github.com/vercel/vercel/discussions)
- 🎓 [Python on Vercel 指南](https://vercel.com/docs/functions/serverless-functions/runtimes/python)

## ✅ 部署检查清单

- [ ] 已创建 Vercel 账号
- [ ] 项目已推送到 GitHub（如果使用 Git 部署）
- [ ] `vercel.json` 配置正确
- [ ] `requirements.txt` 在根目录
- [ ] `api/index.py` 入口文件已创建
- [ ] 已导入项目到 Vercel
- [ ] 部署成功并可以访问
- [ ] 测试所有页面功能
- [ ] 配置数据库（如需持久化）
- [ ] 修改默认管理员密码

## 🎯 下一步

1. ✅ 部署到 Vercel
2. 🗄️ 配置外部数据库（如需数据持久化）
3. 🌐 绑定自定义域名（可选）
4. 📊 设置监控和告警
5. 🔒 配置安全策略

---

**提示**：Vercel 非常适合快速部署和测试，但如果需要完整的数据库支持和文件上传功能，建议使用传统服务器部署（见 DEPLOY.md）或集成外部数据库服务。
