# 服务器部署指南

本指南将帮助你在 Linux 服务器上部署高尔夫球车选配系统，**无需修改任何代码**。

## 📋 服务器要求

- **操作系统**: Ubuntu 20.04+ / CentOS 7+ / Debian 10+
- **Python**: 3.7 或更高版本
- **内存**: 最低 1GB RAM（推荐 2GB+）
- **硬盘**: 最低 10GB 可用空间
- **权限**: root 或 sudo 权限

## 🚀 快速部署（5步完成）

### 第一步：上传项目文件

将整个项目文件夹上传到服务器：

```bash
# 方式1：使用 scp 命令（从本地电脑执行）
scp -r "c:\Users\ASUS\Desktop\高尔夫球车" root@your-server-ip:/var/www/golf-cart

# 方式2：使用 FTP 工具（推荐新手）
# 使用 FileZilla 或 WinSCP 将整个文件夹上传到 /var/www/golf-cart
```

### 第二步：安装系统依赖

SSH 连接到服务器后执行：

```bash
# Ubuntu/Debian 系统
sudo apt update
sudo apt install -y python3 python3-pip python3-venv nginx

# CentOS 系统
sudo yum update
sudo yum install -y python3 python3-pip nginx
```

### 第三步：安装 Python 依赖

```bash
# 进入项目目录
cd /var/www/golf-cart

# 创建虚拟环境
python3 -m venv venv

# 激活虚拟环境
source venv/bin/activate

# 安装生产环境依赖
pip install -r deploy/requirements-prod.txt

# 创建日志目录
mkdir -p backend/logs
```

### 第四步：配置自动启动

```bash
# 复制 systemd 服务文件
sudo cp deploy/golf-cart.service /etc/systemd/system/

# 编辑服务文件，修改路径和用户名
sudo nano /etc/systemd/system/golf-cart.service
# 需要修改的内容：
# - WorkingDirectory: 改为你的实际项目路径
# - Environment PATH: 改为你的虚拟环境路径
# - ExecStart: 改为你的虚拟环境路径
# - User 和 Group: 改为你的用户名（或保持 www-data）

# 重新加载 systemd
sudo systemctl daemon-reload

# 启动服务
sudo systemctl start golf-cart

# 设置开机自启
sudo systemctl enable golf-cart

# 查看服务状态
sudo systemctl status golf-cart
```

### 第五步：配置 Nginx

```bash
# 复制 Nginx 配置文件
sudo cp deploy/nginx.conf /etc/nginx/sites-available/golf-cart

# 编辑配置文件，修改域名或IP
sudo nano /etc/nginx/sites-available/golf-cart
# 修改 server_name 为你的域名或服务器IP

# 创建软链接
sudo ln -s /etc/nginx/sites-available/golf-cart /etc/nginx/sites-enabled/

# 测试配置
sudo nginx -t

# 重启 Nginx
sudo systemctl restart nginx

# 设置 Nginx 开机自启
sudo systemctl enable nginx
```

## ✅ 部署完成

现在你可以通过以下方式访问系统：

- **用户端**: `http://your-server-ip/index.html`
- **管理后台**: `http://your-server-ip/admin.html`
- **登录页面**: `http://your-server-ip/login.html`

默认管理员账号：
- 用户名: admin
- 密码: admin123

## 🔧 常用管理命令

### 服务管理

```bash
# 查看服务状态
sudo systemctl status golf-cart

# 启动服务
sudo systemctl start golf-cart

# 停止服务
sudo systemctl stop golf-cart

# 重启服务
sudo systemctl restart golf-cart

# 查看服务日志
sudo journalctl -u golf-cart -f
```

### 应用日志

```bash
# 查看访问日志
tail -f /var/www/golf-cart/backend/logs/access.log

# 查看错误日志
tail -f /var/www/golf-cart/backend/logs/error.log
```

### Nginx 管理

```bash
# 测试配置
sudo nginx -t

# 重启 Nginx
sudo systemctl restart nginx

# 查看 Nginx 状态
sudo systemctl status nginx

# 查看 Nginx 日志
tail -f /var/log/nginx/golf-cart-access.log
tail -f /var/log/nginx/golf-cart-error.log
```

## 🔒 安全加固（推荐）

### 1. 配置防火墙

```bash
# Ubuntu/Debian (ufw)
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 22/tcp
sudo ufw enable

# CentOS (firewalld)
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --permanent --add-service=ssh
sudo firewall-cmd --reload
```

### 2. 配置 HTTPS（推荐使用免费的 Let's Encrypt）

```bash
# 安装 Certbot
sudo apt install certbot python3-certbot-nginx  # Ubuntu/Debian
# 或
sudo yum install certbot python3-certbot-nginx  # CentOS

# 获取 SSL 证书（自动配置 Nginx）
sudo certbot --nginx -d your-domain.com

# 设置自动续期
sudo certbot renew --dry-run
```

### 3. 修改默认管理员密码

部署完成后，请立即在管理后台修改默认密码。

### 4. 限制上传文件大小

编辑 Nginx 配置，已默认设置为 50MB：
```nginx
client_max_body_size 50M;
```

## 📊 性能优化

### 1. 调整 Gunicorn 工作进程数

编辑 `deploy/gunicorn_config.py`：

```python
# 根据服务器 CPU 核心数调整
# 建议值：CPU 核心数 * 2 + 1
workers = 4  # 修改这个值
```

修改后重启服务：
```bash
sudo systemctl restart golf-cart
```

### 2. 开启 Gzip 压缩

已在 Nginx 配置中启用，可加快页面加载速度。

### 3. 配置静态文件缓存

已在 Nginx 配置中启用，图片、CSS、JS 等静态文件缓存 30 天。

## 🐛 常见问题排查

### 问题1：无法访问网站

**检查步骤**：
```bash
# 1. 检查服务是否运行
sudo systemctl status golf-cart
sudo systemctl status nginx

# 2. 检查端口是否监听
sudo netstat -tulnp | grep :80
sudo netstat -tulnp | grep :5000

# 3. 检查防火墙
sudo ufw status  # Ubuntu/Debian
sudo firewall-cmd --list-all  # CentOS

# 4. 查看日志
sudo journalctl -u golf-cart -n 50
tail -f /var/log/nginx/error.log
```

### 问题2：500 内部服务器错误

```bash
# 查看后端日志
tail -f /var/www/golf-cart/backend/logs/error.log

# 检查文件权限
sudo chown -R www-data:www-data /var/www/golf-cart
sudo chmod -R 755 /var/www/golf-cart
```

### 问题3：API 请求失败

```bash
# 检查后端是否正常运行
curl http://127.0.0.1:5000/api/quotes

# 检查 Nginx 代理配置
sudo nginx -t
```

### 问题4：静态文件无法加载

```bash
# 检查文件权限
ls -la /var/www/golf-cart/frontend/

# 确保 Nginx 可以读取文件
sudo chmod -R 755 /var/www/golf-cart/frontend/
```

## 🔄 更新部署

当有代码更新时：

```bash
# 1. 上传新文件到服务器（覆盖旧文件）

# 2. 重启服务
sudo systemctl restart golf-cart
sudo systemctl restart nginx

# 3. 清除浏览器缓存
# Ctrl + F5 强制刷新页面
```

## 📱 域名绑定（可选）

### 1. 购买域名

从域名注册商（如阿里云、腾讯云、GoDaddy）购买域名。

### 2. 配置 DNS 解析

在域名管理后台添加 A 记录：
- 记录类型: A
- 主机记录: @ 或 www
- 记录值: 你的服务器IP地址
- TTL: 600

### 3. 修改 Nginx 配置

```bash
sudo nano /etc/nginx/sites-available/golf-cart
# 将 server_name 改为你的域名
# server_name example.com www.example.com;

sudo systemctl restart nginx
```

### 4. 配置 HTTPS

```bash
sudo certbot --nginx -d example.com -d www.example.com
```

## 📞 技术支持

如遇到部署问题：
1. 查看日志文件定位问题
2. 检查防火墙和端口配置
3. 确认文件权限正确
4. 参考常见问题排查章节

## 🎯 推荐部署流程图

```
1. 上传文件到服务器 (/var/www/golf-cart)
   ↓
2. 安装系统依赖 (Python3, Nginx)
   ↓
3. 创建虚拟环境并安装 Python 包
   ↓
4. 配置 systemd 服务（后台自动运行）
   ↓
5. 配置 Nginx（Web服务器 + 反向代理）
   ↓
6. 启动服务并测试
   ↓
7. 配置防火墙和 HTTPS（可选）
   ↓
8. 绑定域名（可选）
```

---

**重要提示**：
- 本部署方案不需要修改任何源代码
- 所有配置都通过配置文件完成
- 适合中小型项目的生产环境部署
- 建议定期备份数据和配置文件
