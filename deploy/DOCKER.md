# Docker 部署指南

使用 Docker 可以更简单地部署应用，无需手动配置环境。

## 🐳 前提条件

- 安装 Docker
- 安装 Docker Compose

### 安装 Docker（Ubuntu）

```bash
# 安装 Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# 安装 Docker Compose
sudo apt install docker-compose

# 启动 Docker 服务
sudo systemctl start docker
sudo systemctl enable docker

# 将当前用户加入 docker 组（可选）
sudo usermod -aG docker $USER
```

## 🚀 快速部署

### 1. 上传项目到服务器

```bash
# 将项目上传到服务器的 /var/www/golf-cart 目录
```

### 2. 启动容器

```bash
cd /var/www/golf-cart/deploy

# 启动所有服务（后台运行）
docker-compose up -d

# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f
```

### 3. 访问系统

- **前端**: http://your-server-ip
- **管理后台**: http://your-server-ip/admin.html

## 📋 常用命令

```bash
# 启动服务
docker-compose up -d

# 停止服务
docker-compose down

# 重启服务
docker-compose restart

# 查看日志
docker-compose logs -f backend
docker-compose logs -f nginx

# 进入容器
docker-compose exec backend bash
docker-compose exec nginx sh

# 更新应用
docker-compose down
docker-compose up -d --build
```

## 🔧 配置说明

### 端口映射

- 前端（Nginx）: 80 端口
- 后端（Flask）: 5000 端口（内部使用）

如需修改端口，编辑 `docker-compose.yml`:

```yaml
services:
  nginx:
    ports:
      - "8080:80"  # 将前端映射到 8080 端口
```

### 数据持久化

项目文件通过 volume 挂载，修改会立即生效：

```yaml
volumes:
  - ..:/app  # 项目目录挂载到容器
```

## 🛑 停止和清理

```bash
# 停止并删除容器
docker-compose down

# 停止并删除容器、网络、镜像
docker-compose down --rmi all

# 清理未使用的镜像
docker system prune -a
```

## ⚠️ 注意事项

1. **防火墙**: 确保服务器 80 端口已开放
2. **数据备份**: 定期备份 `backend/data` 目录
3. **内存限制**: 可在 docker-compose.yml 中设置内存限制

## 🔐 生产环境建议

1. 使用环境变量管理配置
2. 配置 HTTPS（使用 Let's Encrypt）
3. 设置容器资源限制
4. 配置日志轮转
