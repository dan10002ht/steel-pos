# 🚀 Steel POS Deployment Guide

## 📋 Overview

Hướng dẫn deploy Steel POS lên VPS cùng với Drink POS (tiemtra3oclock.online) đang chạy, sử dụng System Nginx để handle multiple domains.

## 🏗️ Architecture

```
System Nginx (Port 80/443)
├── Drink POS (tiemtra3oclock.online)
│   ├── Frontend: Port 8080
│   └── Backend: Port 8081
└── Steel POS (steel-pos.com)
    ├── Frontend: Port 8082
    └── Backend: Port 8083
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
# Server Configuration
SERVER_PORT=8080
SERVER_HOST=0.0.0.0

# Database Configuration
DB_HOST=localhost
DB_PORT=5434
DB_USER=postgres
DB_PASSWORD=your_secure_password_here
DB_NAME=steel_pos
DB_SSLMODE=disable

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random
JWT_ACCESS_TOKEN_EXPIRY=24h
JWT_REFRESH_TOKEN_EXPIRY=720h

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# Log Level
LOG_LEVEL=info

# Domain
DOMAIN_NAME=cuahangkienphuoc.site
CORS_ORIGIN=https://cuahangkienphuoc.site

# Frontend API URL
VITE_API_URL=https://cuahangkienphuoc.site/api

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
docker-compose -f docker-compose.prod.yml exec -T backend ./migrate_db
```

#### **6.2 Seed Database (Optional)**

```bash
# Run seeding
docker-compose -f docker-compose.prod.yml exec -T backend ./seed_db
```

### **Step 7: GitHub Actions Setup**

#### **7.1 Generate SSH Key Pair**

**Có 3 cách để generate SSH key:**

##### **Cách 1: Generate trực tiếp trên VPS (Đơn giản nhất - Khuyến nghị)**

```bash
# SSH vào VPS
ssh root@YOUR_VPS_IP

# Generate SSH key pair trên VPS
ssh-keygen -t ed25519 -C "github-actions-steel-pos" -f ~/.ssh/github_actions_steel_pos

# Hoặc nếu VPS không support ed25519, dùng RSA:
ssh-keygen -t rsa -b 4096 -C "github-actions-steel-pos" -f ~/.ssh/github_actions_steel_pos
```

**Lưu ý:** Khi hỏi passphrase, nhấn Enter để để trống (không set passphrase).

Sau khi generate:
```bash
# Xem public key (để add vào authorized_keys)
cat ~/.ssh/github_actions_steel_pos.pub

# Add public key vào authorized_keys
cat ~/.ssh/github_actions_steel_pos.pub >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys

# Xem private key (để copy vào GitHub Secrets)
cat ~/.ssh/github_actions_steel_pos
```

##### **Cách 2: Generate trên máy local (nếu muốn)**

```bash
# Generate SSH key pair trên máy local
ssh-keygen -t ed25519 -C "github-actions-steel-pos" -f ~/.ssh/github_actions_steel_pos

# Copy public key vào VPS
ssh-copy-id -i ~/.ssh/github_actions_steel_pos.pub root@YOUR_VPS_IP

# Hoặc copy thủ công:
# 1. Xem public key
cat ~/.ssh/github_actions_steel_pos.pub

# 2. SSH vào VPS và thêm vào authorized_keys
ssh root@YOUR_VPS_IP
mkdir -p ~/.ssh
chmod 700 ~/.ssh
echo "PASTE_PUBLIC_KEY_HERE" >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

##### **Cách 3: Dùng key có sẵn trên VPS**

Nếu bạn đã có SSH key trên VPS (ví dụ: key để SSH vào VPS), bạn có thể dùng key đó:

```bash
# SSH vào VPS
ssh root@YOUR_VPS_IP

# Xem private key hiện có (thường ở ~/.ssh/id_rsa hoặc ~/.ssh/id_ed25519)
cat ~/.ssh/id_rsa
# hoặc
cat ~/.ssh/id_ed25519
```

**Lưu ý:** Nếu dùng key hiện có, public key đã có trong `authorized_keys` rồi, không cần thêm lại.

#### **7.2 Add GitHub Secrets**

Vào GitHub: Repository → Settings → Secrets and variables → Actions

**Copy Private Key:**

```bash
# Nếu generate trên VPS (Cách 1):
# SSH vào VPS và chạy:
cat ~/.ssh/github_actions_steel_pos

# Nếu generate trên local (Cách 2):
cat ~/.ssh/github_actions_steel_pos

# Nếu dùng key có sẵn (Cách 3):
cat ~/.ssh/id_rsa
# hoặc
cat ~/.ssh/id_ed25519
```

**Add 3 Secrets:**

1. **`VPS_HOST`**
   - Value: IP của VPS (ví dụ: `161.248.147.161`)

2. **`VPS_USER`**
   - Value: Username trên VPS (thường là `root`)

3. **`SSH_PRIVATE_KEY`**
   - Value: Paste toàn bộ private key (bao gồm `-----BEGIN` và `-----END`)
   - Format phải đúng:
     ```
     -----BEGIN OPENSSH PRIVATE KEY-----
     [key content]
     -----END OPENSSH PRIVATE KEY-----
     ```

#### **7.3 Test SSH Connection (Optional)**

Nếu bạn muốn test SSH connection trước khi setup GitHub Actions:

```bash
# Test SSH từ bất kỳ đâu (local machine, VPS khác, hoặc GitHub Actions runner)
# Với private key đã copy vào GitHub Secrets
ssh -i /path/to/private_key root@YOUR_VPS_IP

# Hoặc test từ chính VPS (nếu generate key trên VPS):
# Vào VPS và test localhost connection
ssh -i ~/.ssh/github_actions_steel_pos root@localhost
```

**Lưu ý:** Test này là optional. GitHub Actions sẽ tự test khi chạy workflow.

#### **7.4 Verify Secrets**

Đảm bảo có đủ 3 secrets trong GitHub:
- ✅ `VPS_HOST`: IP của VPS
- ✅ `VPS_USER`: Username (thường là `root`)
- ✅ `SSH_PRIVATE_KEY`: Private key (toàn bộ, bao gồm BEGIN và END)

#### **7.5 Test Automated Deployment**

```bash
# Push code để trigger deployment
git commit --allow-empty -m "Test CI/CD SSH connection"
git push origin main

# Hoặc
git add .
git commit -m "Setup production deployment"
git push origin main
```

**Kiểm tra deployment:**
- Vào GitHub: Actions tab
- Xem workflow logs
- Nếu thành công, bạn sẽ thấy "✅ Deployment successful!"

#### **7.7 Troubleshooting SSH Issues**

**Nếu gặp lỗi "ssh: handshake failed":**

1. **Kiểm tra SSH key format:**
   ```bash
   # Private key phải có đầy đủ BEGIN và END
   cat ~/.ssh/github_actions_steel_pos | head -1
   # Should show: -----BEGIN OPENSSH PRIVATE KEY----- hoặc -----BEGIN RSA PRIVATE KEY-----
   ```

2. **Kiểm tra public key trên VPS:**
   ```bash
   # SSH vào VPS
   ssh root@YOUR_VPS_IP
   
   # Kiểm tra authorized_keys
   cat ~/.ssh/authorized_keys
   # Phải có public key bạn đã thêm
   ```

3. **Kiểm tra permissions:**
   ```bash
   # Trên VPS
   ls -la ~/.ssh/
   # .ssh should be 700, authorized_keys should be 600
   chmod 700 ~/.ssh
   chmod 600 ~/.ssh/authorized_keys
   ```

4. **Test SSH connection manually:**
   ```bash
   # Test từ VPS (nếu key đã có trên VPS)
   ssh -v -i ~/.ssh/github_actions_steel_pos root@localhost
   
   # Hoặc test từ bất kỳ máy nào có private key
   ssh -v -i /path/to/private_key root@YOUR_VPS_IP
   # -v flag sẽ show chi tiết lỗi
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
