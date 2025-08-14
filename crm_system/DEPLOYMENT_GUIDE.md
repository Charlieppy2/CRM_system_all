# CRM 系統部署指南 / CRM System Deployment Guide

## 🚀 部署概覽 / Deployment Overview

本指南將幫助你完成 CRM 系統的完整部署，包括開發環境設置、生產環境配置和網路訪問配置。

## 📋 前置需求 / Prerequisites

### 系統要求 / System Requirements
- **作業系統:** macOS 13+ (推薦) 或 Linux
- **記憶體:** 最少 4GB RAM，推薦 8GB+
- **磁碟空間:** 最少 10GB 可用空間
- **網路:** 穩定的網路連接

### 軟體需求 / Software Requirements
- **Node.js:** 18.0.0 或更高版本
- **npm:** 9.0.0 或更高版本
- **Git:** 最新版本
- **Homebrew:** 最新版本 (macOS)

## 🛠️ 開發環境設置 / Development Environment Setup

### 1. 安裝 Node.js 和 npm
```bash
# 使用 Homebrew 安裝
brew install node

# 驗證安裝
node --version
npm --version
```

### 2. 克隆專案
```bash
git clone <your-repository-url>
cd CRM_system_all/crm_system
```

### 3. 安裝依賴
```bash
npm install
```

### 4. 環境變數配置
創建 `.env.local` 文件：
```bash
# 資料庫連接
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/crm-system

# JWT 密鑰
JWT_SECRET=your-secret-key-here

# 應用配置
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret
```

### 5. 啟動開發伺服器
```bash
npm run dev
```

## 🌐 網路配置 / Network Configuration

### 1. 配置 hosts 文件
編輯 `/etc/hosts` 文件：
```bash
sudo nano /etc/hosts
```

添加以下條目：
```
127.0.0.1       crm.local
127.0.0.1       mysite.local
127.0.0.1       www.in_crm_system.com
```

### 2. 安裝和配置 Apache
```bash
# 安裝 Apache
brew install httpd

# 啟動 Apache 服務
brew services start httpd

# 檢查狀態
brew services list | grep httpd
```

### 3. 配置 Apache 虛擬主機
編輯 `/opt/homebrew/etc/httpd/extra/vhosts.conf`：
```apache
# CRM 系統虛擬主機
<VirtualHost *:8080>
    ServerName crm.local
    ServerAlias www.crm.local
    
    ProxyPreserveHost On
    ProxyPass / http://127.0.0.1:3000/
    ProxyPassReverse / http://127.0.0.1:3000/
    
    ErrorLog "/opt/homebrew/var/log/httpd/crm_error.log"
    CustomLog "/opt/homebrew/var/log/httpd/crm_access.log" combined
</VirtualHost>

# 網際網路 CRM 系統
<VirtualHost *:8080>
    ServerName www.in_crm_system.com
    ServerAlias in_crm_system.com
    
    ProxyPreserveHost On
    ProxyPass / http://127.0.0.1:3000/
    ProxyPassReverse / http://127.0.0.1:3000/
    
    ErrorLog "/opt/homebrew/var/log/httpd/in_crm_system_error.log"
    CustomLog "/opt/homebrew/var/log/httpd/in_crm_system_access.log" combined
</VirtualHost>
```

### 4. 啟用必要的 Apache 模組
編輯 `/opt/homebrew/etc/httpd/httpd.conf`：
```apache
# 啟用代理模組
LoadModule proxy_module lib/httpd/modules/mod_proxy.so
LoadModule proxy_http_module lib/httpd/modules/mod_proxy_http.so

# 包含虛擬主機配置
Include /opt/homebrew/etc/httpd/extra/vhosts.conf

# 監聽所有網路介面
Listen 0.0.0.0:8080
```

### 5. 重啟 Apache 服務
```bash
brew services restart httpd
```

## 🗄️ 資料庫配置 / Database Configuration

### 1. MongoDB Atlas 設置
1. 登入 [MongoDB Atlas](https://cloud.mongodb.com)
2. 創建新集群
3. 創建資料庫用戶
4. 獲取連接字符串

### 2. 初始化資料庫
```bash
# 運行管理員帳號初始化腳本
node scripts/init-admin.js

# 運行測試帳號初始化腳本
node scripts/init-test-accounts.js
```

### 3. 驗證資料庫連接
```bash
# 測試資料庫連接
curl -X GET "http://localhost:3000/api/auth/me" \
  -H "Cookie: auth_token=your-token-here"
```

## 🔐 安全配置 / Security Configuration

### 1. JWT 配置
確保 JWT_SECRET 是強密碼：
```bash
# 生成強密碼
openssl rand -base64 32
```

### 2. CORS 配置
在 `next.config.ts` 中配置 CORS：
```typescript
const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,DELETE,OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
        ],
      },
    ];
  },
};
```

### 3. 環境變數安全
確保生產環境的敏感資訊不會暴露：
```bash
# 生產環境變數
NODE_ENV=production
MONGODB_URI=your-production-mongodb-uri
JWT_SECRET=your-production-jwt-secret
```

## 🚀 生產環境部署 / Production Deployment

### 1. 建置生產版本
```bash
# 建置應用
npm run build

# 啟動生產伺服器
npm start
```

### 2. 使用 PM2 管理進程
```bash
# 安裝 PM2
npm install -g pm2

# 啟動應用
pm2 start npm --name "crm-system" -- start

# 設置開機自啟
pm2 startup
pm2 save
```

### 3. 配置反向代理
確保 Apache 正確代理到生產端口：
```apache
<VirtualHost *:8080>
    ServerName www.in_crm_system.com
    
    ProxyPreserveHost On
    ProxyPass / http://127.0.0.1:3000/
    ProxyPassReverse / http://127.0.0.1:3000/
    
    # 生產環境日誌
    ErrorLog "/opt/homebrew/var/log/httpd/production_error.log"
    CustomLog "/opt/homebrew/var/log/httpd/production_access.log" combined
</VirtualHost>
```

## 🌍 外部訪問配置 / External Access Configuration

### 1. 動態 DNS 配置
1. 註冊 [No-IP](https://www.noip.com) 帳號
2. 創建主機名 (例如: cam.ddns.net)
3. 配置路由器端口轉發
4. 設置 DDNS 客戶端

### 2. 路由器配置
- 登入路由器管理介面
- 配置端口轉發 (8080 → 8080)
- 設置 DMZ 或防火牆規則

### 3. 防火牆配置
```bash
# 檢查防火牆狀態
sudo ufw status

# 允許 8080 端口
sudo ufw allow 8080

# 允許 SSH 連接
sudo ufw allow ssh
```

## 📊 監控和維護 / Monitoring and Maintenance

### 1. 日誌監控
```bash
# 查看 Apache 訪問日誌
tail -f /opt/homebrew/var/log/httpd/access_log

# 查看錯誤日誌
tail -f /opt/homebrew/var/log/httpd/error_log

# 查看 Next.js 日誌
pm2 logs crm-system
```

### 2. 性能監控
```bash
# 檢查系統資源
htop

# 檢查磁碟使用
df -h

# 檢查記憶體使用
free -h
```

### 3. 備份策略
```bash
# 創建備份腳本
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backup/crm-system"

# 備份配置文件
tar -czf "$BACKUP_DIR/config_$DATE.tar.gz" \
  /opt/homebrew/etc/httpd/ \
  /etc/hosts \
  .env.local

# 備份代碼
tar -czf "$BACKUP_DIR/code_$DATE.tar.gz" \
  --exclude=node_modules \
  --exclude=.next \
  .

echo "備份完成: $DATE"
```

## 🔧 故障排除 / Troubleshooting

### 常見問題 / Common Issues

#### 1. 端口被佔用
```bash
# 檢查端口使用情況
lsof -i :8080
lsof -i :3000

# 殺死佔用進程
sudo kill -9 <PID>
```

#### 2. Apache 無法啟動
```bash
# 檢查配置語法
httpd -t

# 查看錯誤日誌
tail -f /opt/homebrew/var/log/httpd/error_log
```

#### 3. 資料庫連接失敗
```bash
# 測試 MongoDB 連接
mongosh "your-connection-string"

# 檢查網路連接
ping cluster.mongodb.net
```

#### 4. 域名無法解析
```bash
# 測試 DNS 解析
nslookup crm.local
dig crm.local

# 檢查 hosts 文件
cat /etc/hosts | grep crm
```

## 📋 部署檢查清單 / Deployment Checklist

### 開發環境 / Development Environment
- [ ] Node.js 和 npm 安裝完成
- [ ] 專案依賴安裝完成
- [ ] 環境變數配置完成
- [ ] 開發伺服器正常運行
- [ ] 資料庫連接正常

### 網路配置 / Network Configuration
- [ ] hosts 文件配置完成
- [ ] Apache 安裝和配置完成
- [ ] 虛擬主機配置完成
- [ ] 反向代理正常工作
- [ ] 端口轉發配置完成

### 安全配置 / Security Configuration
- [ ] JWT 密鑰配置完成
- [ ] CORS 配置完成
- [ ] 環境變數安全配置
- [ ] 防火牆規則配置
- [ ] SSL 證書配置 (可選)

### 生產部署 / Production Deployment
- [ ] 應用建置完成
- [ ] PM2 進程管理配置
- [ ] 生產環境變數配置
- [ ] 日誌配置完成
- [ ] 備份策略實施

### 外部訪問 / External Access
- [ ] 動態 DNS 配置完成
- [ ] 路由器端口轉發配置
- [ ] 防火牆規則配置
- [ ] 外部訪問測試成功
- [ ] 移動設備訪問測試

## 📞 技術支援 / Technical Support

### 聯繫方式 / Contact Information
- **系統管理員:** admin 帳號
- **技術文檔:** 參考本部署指南
- **故障排除:** 查看故障排除章節
- **緊急支援:** 聯繫 IT 部門

---

## 📖 更新日誌 / Update Log

### 版本 1.0.0 (2025-08-13)
- ✅ 初始部署指南創建
- ✅ 完整部署流程文檔
- ✅ 故障排除指南
- ✅ 安全配置說明

---

## 📄 版權聲明 / Copyright Notice

© 2025 CRM Management System. All rights reserved.

本部署指南僅供內部使用，未經授權不得外傳。
This deployment guide is for internal use only and may not be distributed without authorization. 