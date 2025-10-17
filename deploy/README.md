# 部署文件说明

本目录包含了所有用于服务器部署的配置文件和脚本。

## 📁 文件清单

### 配置文件

| 文件名 | 用途 | 说明 |
|--------|------|------|
| `gunicorn_config.py` | Gunicorn 配置 | 生产环境 WSGI 服务器配置 |
| `requirements-prod.txt` | Python 依赖 | 生产环境所需的 Python 包 |
| `golf-cart.service` | Systemd 服务 | 系统服务配置，实现开机自启 |
| `nginx.conf` | Nginx 配置 | Web 服务器和反向代理配置 |
| `docker-compose.yml` | Docker 编排 | 容器化部署配置 |
| `nginx-docker.conf` | Docker Nginx | Docker 环境的 Nginx 配置 |

### 脚本文件

| 文件名 | 用途 | 使用方法 |
|--------|------|----------|
| `install.sh` | 自动安装 | `chmod +x install.sh && ./install.sh` |
| `start.sh` | 手动启动 | `chmod +x start.sh && ./start.sh` |

### 文档文件

| 文件名 | 内容 |
|--------|------|
| `DEPLOY.md` | 完整的服务器部署指南（传统方式） |
| `DOCKER.md` | Docker 容器化部署指南 |
| `README.md` | 本文件，部署文件说明 |

## 🚀 快速开始

### 选项 A：自动化部署（推荐新手）

```bash
# 1. 上传整个项目到服务器
# 2. 进入部署目录
cd deploy

# 3. 运行安装脚本
chmod +x install.sh
./install.sh

# 4. 手动启动（测试用）
./start.sh

# 5. 配置系统服务（生产环境）
# 参考 DEPLOY.md 第四步
```

### 选项 B：Docker 部署（推荐有经验者）

```bash
cd deploy
docker-compose up -d
```

## 📖 详细文档

- **完整部署教程**: 查看 [DEPLOY.md](DEPLOY.md)
- **Docker 部署**: 查看 [DOCKER.md](DOCKER.md)
- **项目说明**: 查看根目录的 [README.md](../README.md)

## ⚙️ 配置说明

### Gunicorn 配置 (gunicorn_config.py)

```python
bind = "0.0.0.0:5000"  # 监听地址
workers = 4            # 工作进程数
threads = 2            # 每进程线程数
timeout = 120          # 超时时间
```

**调优建议**：
- workers = CPU核心数 × 2 + 1
- 1GB 内存约支持 4 个 worker
- 2GB+ 内存可设置 6-8 个 worker

### Nginx 配置 (nginx.conf)

关键配置点：
- `server_name`: 修改为你的域名或 IP
- `root`: 前端文件路径
- `proxy_pass`: 后端代理地址
- `client_max_body_size`: 上传限制（默认 50MB）

### Systemd 服务 (golf-cart.service)

需要修改的配置：
- `WorkingDirectory`: 项目路径
- `Environment PATH`: 虚拟环境路径
- `ExecStart`: 启动命令路径
- `User/Group`: 运行用户

## 🔍 部署方式对比

| 特性 | 传统部署 | Docker 部署 |
|------|---------|------------|
| 易用性 | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| 性能 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| 隔离性 | ⭐⭐ | ⭐⭐⭐⭐⭐ |
| 资源占用 | 低 | 中等 |
| 适用场景 | 生产环境 | 快速部署/测试 |

## 🆘 获取帮助

遇到问题？按以下步骤：

1. 查看 [DEPLOY.md](DEPLOY.md) 的"常见问题"章节
2. 检查日志文件：
   ```bash
   # 应用日志
   tail -f ../backend/logs/error.log

   # 系统服务日志
   sudo journalctl -u golf-cart -n 50

   # Nginx 日志
   tail -f /var/log/nginx/error.log
   ```
3. 确认服务状态：
   ```bash
   sudo systemctl status golf-cart
   sudo systemctl status nginx
   ```

## ✅ 部署检查清单

- [ ] 服务器系统满足要求（Ubuntu/CentOS/Debian）
- [ ] Python 3.7+ 已安装
- [ ] 项目文件已上传到服务器
- [ ] 运行了 install.sh 安装脚本
- [ ] 修改了 systemd 服务文件中的路径
- [ ] 修改了 nginx.conf 中的 server_name
- [ ] 服务已启动并设置开机自启
- [ ] 防火墙已开放 80/443 端口
- [ ] 可以通过 IP/域名访问系统
- [ ] 修改了默认管理员密码

## 📞 支持

- 📖 查看完整文档
- 🐛 提交 Issue
- 💬 社区讨论
