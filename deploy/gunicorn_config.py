# Gunicorn 配置文件
# 用于在生产环境运行 Flask 应用

# 监听地址和端口
bind = "0.0.0.0:5000"

# 工作进程数（建议设置为 CPU 核心数 * 2 + 1）
workers = 4

# 每个工作进程的线程数
threads = 2

# 工作模式
worker_class = "sync"

# 超时时间（秒）
timeout = 120

# 保持连接时间（秒）
keepalive = 5

# 访问日志
accesslog = "logs/access.log"

# 错误日志
errorlog = "logs/error.log"

# 日志级别
loglevel = "info"

# 进程名称
proc_name = "golf_cart_system"

# 守护进程模式（后台运行）
daemon = False

# PID 文件
pidfile = "logs/gunicorn.pid"

# 优雅重启超时时间
graceful_timeout = 30

# 最大请求数，超过后重启工作进程（防止内存泄漏）
max_requests = 1000
max_requests_jitter = 50
