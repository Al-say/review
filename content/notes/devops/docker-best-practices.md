---
title: Docker 容器化最佳实践
topic: DevOps
tags: docker, container, devops
updated: 2026-01-27
---

# Docker 容器化最佳实践

Docker 已成为现代软件开发和部署的标准工具。本文总结了使用 Docker 时的最佳实践，帮助你构建更安全、高效的容器化应用。

## 1. Dockerfile 优化

### 使用多阶段构建

```dockerfile
# 构建阶段
FROM node:16-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# 生产阶段
FROM node:16-alpine
RUN apk add --no-cache dumb-init
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY . .
USER node
EXPOSE 3000
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "server.js"]
```

### 层缓存优化

```dockerfile
FROM ubuntu:20.04

# 先复制依赖文件，利用缓存
COPY requirements.txt .
RUN pip install -r requirements.txt

# 再复制源代码
COPY . .
```

## 2. 安全最佳实践

### 非 root 用户运行

```dockerfile
FROM node:16-alpine
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001
USER nextjs
```

### 最小化攻击面

```dockerfile
FROM alpine:latest
RUN apk add --no-cache ca-certificates
COPY myapp /myapp
USER nobody
ENTRYPOINT ["/myapp"]
```

### 扫描镜像漏洞

```bash
# 使用 Trivy 扫描
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
  aquasecurity/trivy:latest image myimage:latest

# 使用 Clair
docker run --rm -p 6060:6060 quay.io/coreos/clair:latest
```

## 3. 镜像大小优化

### 使用 .dockerignore

```
node_modules
npm-debug.log
.git
.gitignore
README.md
.env
.nyc_output
coverage
```

### 链式 RUN 命令

```dockerfile
RUN apt-get update && apt-get install -y \
    package1 \
    package2 \
    package3 \
 && rm -rf /var/lib/apt/lists/*
```

### 使用 distroless 镜像

```dockerfile
FROM golang:1.17 AS build
WORKDIR /go/src/app
COPY . .
RUN go build -o myapp .

FROM gcr.io/distroless/base
COPY --from=build /go/src/app/myapp /
CMD ["/myapp"]
```

## 4. 容器编排

### Docker Compose 配置

```yaml
version: '3.8'
services:
  web:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    depends_on:
      - db
    networks:
      - webnet

  db:
    image: postgres:13
    environment:
      - POSTGRES_PASSWORD=mysecretpassword
    volumes:
      - db-data:/var/lib/postgresql/data
    networks:
      - webnet

volumes:
  db-data:

networks:
  webnet:
```

### 健康检查

```dockerfile
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1
```

## 5. 开发环境优化

### 开发用 Dockerfile

```dockerfile
FROM node:16-alpine

# 安装开发依赖
RUN apk add --no-cache git

# 设置工作目录
WORKDIR /app

# 复制 package.json 并安装依赖
COPY package*.json ./
RUN npm install

# 复制源代码
COPY . .

# 暴露端口
EXPOSE 3000

# 启动命令
CMD ["npm", "run", "dev"]
```

### 使用 bind mounts 进行热重载

```bash
docker run -v $(pwd):/app -p 3000:3000 myapp
```

## 6. 性能优化

### 资源限制

```yaml
services:
  web:
    deploy:
      resources:
        limits:
          cpus: '0.50'
          memory: 512M
        reservations:
          cpus: '0.25'
          memory: 256M
```

### 使用合适的基础镜像

```dockerfile
# 选择合适的基础镜像
FROM python:3.9-slim  # 而不是 python:3.9

# 或者使用 Alpine
FROM python:3.9-alpine
```

## 7. 日志管理

### 结构化日志

```javascript
// 使用 JSON 格式日志
console.log(JSON.stringify({
  level: 'info',
  message: 'User logged in',
  userId: user.id,
  timestamp: new Date().toISOString()
}));
```

### 日志轮转

```dockerfile
# 使用 logrotate
RUN apt-get update && apt-get install -y logrotate
COPY logrotate.conf /etc/logrotate.d/app
```

## 8. 数据持久化

### 命名卷

```yaml
services:
  db:
    image: postgres:13
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

### 备份策略

```bash
# 备份卷
docker run --rm -v postgres_data:/data -v $(pwd):/backup \
  alpine tar czf /backup/backup.tar.gz -C /data .
```

## 9. 网络配置

### 使用用户定义网络

```yaml
networks:
  mynetwork:
    driver: bridge
    ipam:
      config:
        - subnet: 172.20.0.0/16
```

### 端口映射策略

```yaml
# 开发环境
ports:
  - "3000:3000"

# 生产环境（使用反向代理）
# 不暴露端口，直接通过网络连接
```

## 10. CI/CD 集成

### 多阶段构建在 CI/CD 中的应用

```yaml
stages:
  - build
  - test
  - deploy

build:
  stage: build
  script:
    - docker build --target builder -t myapp:build .
    - docker build --target production -t myapp:latest .

test:
  stage: test
  script:
    - docker run myapp:latest npm test

deploy:
  stage: deploy
  script:
    - docker push myapp:latest
```

## 总结

Docker 容器化带来了诸多好处，但要充分发挥其潜力需要遵循最佳实践：

1. **安全第一**：使用非 root 用户、最小化镜像
2. **性能优化**：多阶段构建、层缓存、资源限制
3. **可维护性**：结构化日志、健康检查、文档化
4. **开发体验**：热重载、开发环境优化
5. **生产就绪**：编排、监控、备份策略

通过这些实践，你可以构建出更安全、更高效、更易维护的容器化应用。

#docker #container #devops #best-practices