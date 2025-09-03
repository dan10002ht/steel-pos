# 🚀 Steel POS Deployment Guide

## 📋 Overview

Hướng dẫn deploy Steel POS lên VPS cùng với Drink POS (tiemtra3oclock.online) đang chạy, sử dụng System Nginx để handle multiple domains.

## 🏗️ Architecture

```
System Nginx (Port 80/443)
├── Drink POS (tiemtra3oclock.online)
│   ├── Frontend: Port 8080
│   ├── Backend: Port 8081
│   └── WebSocket: Port 8081
└── Steel POS (steel-pos.com)
    ├── Frontend: Port 8082
    ├── Backend: Port 8083
    └── WebSocket: Port 8084
```

## 🎯 Deployment Summary

### **Phase 1: Preparation**

1. ✅ GitHub Actions workflow đã tạo
2. ✅ Docker files đã tạo
3. ✅ docker-compose.prod.yml đã tạo
4. ✅ env.example đã tạo

### **Phase 2: VPS Setup**

1. Clone Steel POS repository
2. Setup environment variables
3. Setup SSL certificate cho steel-pos.com
4. Update System Nginx config

### **Phase 3: Deployment**

1. Deploy Steel POS containers
2. Test health checks
3. Verify SSL certificates
4. Monitor performance

### **Phase 4: CI/CD Setup**

1. Setup GitHub secrets
2. Test automated deployment
3. Monitor deployment logs

---

## 🎯 Manual vs Automated Tasks

### **🖐️ MANUAL TASKS (Chỉ làm 1 lần duy nhất):**

#### **Setup Phase:**

- [ ] Clone repository trên VPS
- [ ] Setup environment variables (.env file)
- [ ] Generate SSL certificates
- [ ] Configure System Nginx
- [ ] Deploy lần đầu để test

#### **CI/CD Setup:**

- [ ] Add GitHub secrets (VPS_HOST, VPS_USER, SSH_PRIVATE_KEY)
- [ ] Test automated deployment

### **🤖 AUTOMATED TASKS (CI/CD làm tự động mỗi push):**

#### **Build & Deploy:**

- [ ] Build Docker images (Frontend + Backend)
- [ ] Push images to registry (nếu có)
- [ ] SSH vào VPS
- [ ] Pull latest code
- [ ] Build images locally
- [ ] Deploy containers với zero-downtime
- [ ] Health checks
- [ ] Database migrations
- [ ] Database seeding
- [ ] Rollback nếu có lỗi
- [ ] Cleanup old images

#### **Monitoring:**

- [ ] Health check endpoints
- [ ] Container status
- [ ] Deployment logs
- [ ] Error notifications

---

## 🔧 Detailed Steps

### **Step 1: VPS Preparation**

#### **1.1 Clone Steel POS Repository**

```bash
cd /home/root/
git clone https://github.com/your-username/steel-pos.git
cd steel-pos
```

#### **1.2 Setup Environment Variables**

```bash
# Copy environment template
cp env.example .env

# Edit environment variables
nano .env
```

**Required Environment Variables:**

```bash
# Database
POSTGRES_PASSWORD=your_secure_password_here

# JWT
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random

# Domain
DOMAIN_NAME=steel-pos.com
CORS_ORIGIN=https://steel-pos.com

# Frontend API URL
VITE_API_URL=https://steel-pos.com/api
VITE_WS_URL=wss://steel-pos.com/ws

# Cloudinary (optional)
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret
```

### **Step 2: SSL Certificate Setup**

#### **2.1 Setup SSL Certificate**

```bash
# Install certbot if not already installed
sudo apt install certbot python3-certbot-nginx

# Generate SSL certificate
sudo certbot certonly --standalone -d steel-pos.com

# Verify certificate
sudo certbot certificates
```

#### **2.2 Verify SSL Files**

```bash
ls -la /etc/letsencrypt/live/steel-pos.com/
# Should show: cert.pem, fullchain.pem, privkey.pem
```

### **Step 3: System Nginx Configuration**

#### **3.1 Backup Current Nginx Config**

```bash
sudo cp /etc/nginx/sites-available/tiemtra3oclock.online /etc/nginx/sites-available/tiemtra3oclock.online.backup
```

#### **3.2 Create Steel POS Nginx Config**

```bash
sudo nano /etc/nginx/sites-available/steel-pos.com
```

**Nginx Configuration for Steel POS:**

```nginx
# HTTP to HTTPS redirect
server {
    listen 80;
    server_name steel-pos.com;

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        return 301 https://$server_name$request_uri;
    }
}

# HTTPS server
server {
    listen 443 ssl;
    server_name steel-pos.com;

    # SSL configuration
    ssl_certificate /etc/letsencrypt/live/steel-pos.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/steel-pos.com/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    # Let's Encrypt challenge
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    # Frontend (React app)
    location / {
        proxy_pass http://127.0.0.1:8082;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Backend API
    location /api/ {
        proxy_pass http://127.0.0.1:8083;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # WebSocket support
    location /ws {
        proxy_pass http://127.0.0.1:8084;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # WebSocket specific timeouts
        proxy_connect_timeout 7d;
        proxy_send_timeout 7d;
        proxy_read_timeout 7d;

        # Disable buffering for real-time communication
        proxy_buffering off;
        proxy_cache off;
    }

    # Health check
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }

    # Static assets caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        proxy_pass http://127.0.0.1:8082;
        expires 1y;
        add_header Cache-Control "public, immutable";
        add_header Vary Accept-Encoding;
    }
}
```

#### **3.3 Enable Steel POS Site**

```bash
# Create symlink
sudo ln -s /etc/nginx/sites-available/steel-pos.com /etc/nginx/sites-enabled/

# Test nginx configuration
sudo nginx -t

# Reload nginx
sudo systemctl reload nginx
```

### **Step 4: Remove Docker Nginx Config**

#### **4.1 Update Frontend Dockerfile**

```dockerfile
# Remove nginx configuration copy
# COPY nginx.conf /etc/nginx/nginx.conf

# Use default nginx configuration
# The container will serve static files on port 80
```

#### **4.2 Update docker-compose.prod.yml**

```yaml
# Frontend service - remove nginx config dependency
frontend:
  build:
    context: ./frontend
    dockerfile: Dockerfile
  # ... other configurations
```

### **Step 5: Deploy Steel POS**

#### **5.1 Build and Start Containers**

```bash
cd /home/root/steel-pos

# Build images
docker-compose -f docker-compose.prod.yml build

# Start services
docker-compose -f docker-compose.prod.yml up -d
```

#### **5.2 Verify Deployment**

```bash
# Check container status
docker-compose -f docker-compose.prod.yml ps

# Check logs
docker-compose -f docker-compose.prod.yml logs -f

# Test health endpoints
curl http://localhost:8082/health
curl http://localhost:8083/health
```

#### **5.3 Test Domain Access**

```bash
# Test HTTP redirect
curl -I http://steel-pos.com

# Test HTTPS
curl -I https://steel-pos.com

# Test API
curl https://steel-pos.com/api/health
```

### **Step 6: Database Setup**

#### **6.1 Run Migrations**

```bash
# Wait for database to be ready
sleep 15

# Run migrations
docker-compose -f docker-compose.prod.yml exec -T backend ./migrate_db -path=/root/migrations -database="postgresql://postgres:password@postgres:5432/steel_pos?sslmode=disable" up
```

#### **6.2 Seed Database (Optional)**

```bash
# Run seeding
docker-compose -f docker-compose.prod.yml exec -T backend ./seed_db
```

### **Step 7: GitHub Actions Setup**

#### **7.1 Add GitHub Secrets**

Vào GitHub: Repository → Settings → Secrets and variables → Actions

**Required Secrets:**

- `VPS_HOST`: IP của VPS
- `VPS_USER`: Username trên VPS (root)
- `SSH_PRIVATE_KEY`: SSH private key

#### **7.2 Test Automated Deployment**

```bash
# Push code to trigger deployment
git add .
git commit -m "Setup production deployment"
git push origin main
```

### **Step 8: Monitoring and Maintenance**

#### **8.1 Health Check Script**

```bash
#!/bin/bash
# health-check.sh

echo "🔍 Checking Steel POS health..."

# Frontend health
if curl -f http://localhost:8082/health 2>/dev/null; then
    echo "✅ Frontend: Healthy"
else
    echo "❌ Frontend: Unhealthy"
fi

# Backend health
if curl -f http://localhost:8083/health 2>/dev/null; then
    echo "✅ Backend: Healthy"
else
    echo "❌ Backend: Unhealthy"
fi

# Domain health
if curl -f https://steel-pos.com/health 2>/dev/null; then
    echo "✅ Domain: Healthy"
else
    echo "❌ Domain: Unhealthy"
fi
```

#### **8.2 Log Monitoring**

```bash
# View Steel POS logs
docker-compose -f /home/root/steel-pos/docker-compose.prod.yml logs -f

# View Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

---

## 🚨 Troubleshooting

### **Common Issues:**

#### **1. Port Already in Use**

```bash
# Check what's using the port
sudo netstat -tlnp | grep :8082
sudo netstat -tlnp | grep :8083

# Kill process if needed
sudo kill -9 <PID>
```

#### **2. SSL Certificate Issues**

```bash
# Check certificate status
sudo certbot certificates

# Renew certificate
sudo certbot renew

# Force renewal
sudo certbot renew --force-renewal
```

#### **3. Nginx Configuration Errors**

```bash
# Test configuration
sudo nginx -t

# Check syntax
sudo nginx -T | grep steel-pos
```

#### **4. Container Health Issues**

```bash
# Check container logs
docker-compose -f docker-compose.prod.yml logs backend
docker-compose -f docker-compose.prod.yml logs frontend

# Restart containers
docker-compose -f docker-compose.prod.yml restart
```

---

## 📊 Performance Monitoring

### **Resource Usage:**

```bash
# Check container resource usage
docker stats

# Check system resources
htop
df -h
free -h
```

### **Network Monitoring:**

```bash
# Check active connections
sudo netstat -tlnp

# Check nginx status
sudo systemctl status nginx
```

---

## ✅ Deployment Checklist

### **Pre-deployment:**

- [ ] GitHub Actions workflow created
- [ ] Docker files created
- [ ] docker-compose.prod.yml created
- [ ] env.example created
- [ ] Repository cloned on VPS
- [ ] Environment variables configured

### **SSL Setup:**

- [ ] SSL certificate generated
- [ ] Certificate files verified
- [ ] Nginx config created
- [ ] Nginx config tested
- [ ] Nginx reloaded

### **Deployment:**

- [ ] Containers built successfully
- [ ] Containers started successfully
- [ ] Health checks passed
- [ ] Domain accessible
- [ ] SSL working correctly

### **Post-deployment:**

- [ ] Database migrations run
- [ ] Database seeded (if needed)
- [ ] GitHub Actions secrets configured
- [ ] Automated deployment tested
- [ ] Monitoring setup

---

## 🎯 Summary

### **What We've Accomplished:**

1. ✅ **Created all necessary files** for production deployment
2. ✅ **Designed architecture** for multiple projects on 1 VPS
3. ✅ **Planned System Nginx** configuration for multiple domains
4. ✅ **Prepared CI/CD pipeline** with GitHub Actions

### **Next Steps:**

1. **Deploy to VPS** following the detailed steps above
2. **Setup SSL certificates** for steel-pos.com
3. **Configure System Nginx** for multiple domains
4. **Test deployment** and verify functionality
5. **Setup monitoring** and automated deployment

### **Expected Result:**

- **2 projects running** on 1 VPS
- **Independent domains** with SSL certificates
- **Automated deployment** via GitHub Actions
- **Cost savings** compared to 2 separate VPS
- **Easy maintenance** and monitoring

## 🚀 **Workflow sau khi setup xong:**

### **Development Workflow:**

```bash
# Code locally
git add .
git commit -m "New feature"
git push origin main
# → Tự động deploy lên VPS!
```

### **CI/CD Pipeline tự động:**

1. **Build** Docker images
2. **SSH** vào VPS
3. **Pull** latest code
4. **Deploy** containers với zero-downtime
5. **Health check**
6. **Database migrations**
7. **Cleanup** unused images

**Sau khi hoàn thành, bạn sẽ có cả Drink POS và Steel POS chạy trên cùng 1 VPS với domains riêng biệt!** 🚀
