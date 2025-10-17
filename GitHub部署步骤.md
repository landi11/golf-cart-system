# GitHub + Vercel 部署步骤指南

## ✅ 已完成的步骤

- [x] Git 仓库初始化完成
- [x] .gitignore 文件创建完成
- [x] 初始提交完成（40个文件）

---

## 📋 接下来的步骤

### 步骤 1：在 GitHub 创建新仓库

1. **打开浏览器，访问**：https://github.com/new

2. **填写仓库信息**：
   ```
   Repository name: golf-cart-system
   Description: 高尔夫球车选配和报价管理系统
   ```

3. **重要配置**：
   - [x] 选择 **Public**（公开）或 **Private**（私有）
   - [ ] **不要勾选** "Add a README file"
   - [ ] **不要勾选** "Add .gitignore"
   - [ ] **不要勾选** "Choose a license"

4. **点击** "Create repository" 按钮

### 步骤 2：复制仓库 URL

创建完成后，GitHub 会显示仓库地址，看起来像这样：
```
https://github.com/你的用户名/golf-cart-system.git
```

**复制这个地址！**

### 步骤 3：连接远程仓库并推送

**在 PowerShell 中执行以下命令**：

```powershell
# 1. 进入项目目录
cd "c:\Users\ASUS\Desktop\高尔夫球车"

# 2. 添加远程仓库（替换下面的 URL 为你的仓库地址）
git remote add origin https://github.com/你的用户名/golf-cart-system.git

# 3. 重命名分支为 main
git branch -M main

# 4. 推送到 GitHub
git push -u origin main
```

**如果提示登录**：
- 输入你的 GitHub 用户名
- 输入你的 Personal Access Token（不是密码）

**如何获取 Personal Access Token**：
1. 访问：https://github.com/settings/tokens
2. 点击 "Generate new token (classic)"
3. 勾选 "repo" 权限
4. 点击 "Generate token"
5. 复制生成的 token（只显示一次，保存好）

### 步骤 4：在 Vercel 部署

1. **访问 Vercel**：https://vercel.com/new

2. **登录 Vercel**（推荐使用 GitHub 登录）

3. **导入 Git 仓库**：
   - 点击 "Import Git Repository"
   - 如果看不到你的仓库，点击 "Adjust GitHub App Permissions"
   - 选择你刚才创建的 `golf-cart-system` 仓库

4. **配置项目**：
   ```
   Project Name: golf-cart-system
   Framework Preset: Other
   Root Directory: ./
   Build Command: (留空)
   Output Directory: frontend
   ```

5. **点击 "Deploy"** 按钮

6. **等待部署完成**（约 1-3 分钟）

### 步骤 5：访问你的网站

部署完成后，Vercel 会提供一个地址，类似：
```
https://golf-cart-system.vercel.app
```

**访问页面**：
- 用户端：https://your-project.vercel.app/index.html
- 管理后台：https://your-project.vercel.app/admin.html
- 登录页面：https://your-project.vercel.app/login.html

---

## 🔄 以后如何更新

### 修改代码后自动部署

```bash
# 1. 修改代码后，提交更改
git add .
git commit -m "更新功能说明"

# 2. 推送到 GitHub
git push

# 3. Vercel 会自动检测并重新部署（无需任何操作）
```

---

## 📝 快速命令参考

### 添加远程仓库
```bash
git remote add origin https://github.com/你的用户名/golf-cart-system.git
```

### 查看远程仓库
```bash
git remote -v
```

### 推送代码
```bash
git push -u origin main
```

### 以后的推送（简化）
```bash
git push
```

---

## ❓ 常见问题

### Q1: 推送时提示权限错误？

**解决方案**：
```bash
# 使用 Personal Access Token 登录
# 用户名：你的 GitHub 用户名
# 密码：Personal Access Token（不是密码）
```

### Q2: 推送时提示已存在？

**解决方案**：
```bash
# 先拉取远程代码
git pull origin main --allow-unrelated-histories

# 再推送
git push -u origin main
```

### Q3: 如何查看部署日志？

**在 Vercel Dashboard**：
1. 进入项目
2. 点击 "Deployments"
3. 点击最新的部署
4. 查看 "Building" 和 "Functions" 日志

### Q4: 如何绑定自定义域名？

**在 Vercel Dashboard**：
1. 进入项目
2. 点击 "Settings" → "Domains"
3. 添加你的域名
4. 按提示配置 DNS

---

## 🎯 当前进度

- [x] Git 仓库初始化
- [x] 代码提交完成
- [ ] 创建 GitHub 仓库 ← **你现在在这里**
- [ ] 推送到 GitHub
- [ ] 在 Vercel 部署

---

## 📞 需要帮助？

- GitHub 文档：https://docs.github.com
- Vercel 文档：https://vercel.com/docs
- Git 教程：https://git-scm.com/doc

---

## ⚠️ 重要提示

**Vercel 限制**：
- ❌ 数据不持久化（Serverless 环境）
- ❌ 文件上传不支持
- ⏱️ 函数执行最长 10 秒

**如需完整功能，请使用传统服务器部署**（见 DEPLOY.md）

---

**现在开始步骤 1：创建 GitHub 仓库吧！** 🚀
