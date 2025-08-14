# CRM 系統架構文檔 / CRM System Architecture Documentation

## 🏗️ 系統架構概覽 / System Architecture Overview

### 整體架構 / Overall Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   用戶端        │    │   負載均衡器     │    │   Web 伺服器    │
│  (瀏覽器)      │◄──►│   (Apache)      │◄──►│   (Next.js)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │                       │
                                ▼                       ▼
                       ┌─────────────────┐    ┌─────────────────┐
                       │   資料庫        │    │   快取層        │
                       │  (MongoDB)     │    │  (Memory)       │
                       └─────────────────┘    └─────────────────┘
```

## 🔧 技術棧 / Technology Stack

### 前端技術 / Frontend Technologies
- **框架 / Framework:** Next.js 14 (App Router)
- **語言 / Language:** TypeScript
- **樣式 / Styling:** Tailwind CSS
- **狀態管理 / State Management:** React Context API
- **表單處理 / Form Handling:** React Hook Form
- **圖表 / Charts:** Chart.js (可選)

### 後端技術 / Backend Technologies
- **運行時 / Runtime:** Node.js 18+
- **框架 / Framework:** Next.js API Routes
- **資料庫 / Database:** MongoDB (Mongoose)
- **認證 / Authentication:** JWT + bcrypt
- **驗證 / Validation:** Zod

### 伺服器技術 / Server Technologies
- **Web 伺服器 / Web Server:** Apache 2.4 (Reverse Proxy)
- **應用伺服器 / App Server:** Next.js Standalone
- **負載均衡 / Load Balancing:** Apache mod_proxy
- **SSL 終止 / SSL Termination:** Apache mod_ssl

## 🌐 網路架構 / Network Architecture

### 端口配置 / Port Configuration
```
┌─────────────────┬─────────────┬─────────────────────────────────┐
│     服務        │    端口     │           說明                   │
├─────────────────┼─────────────┼─────────────────────────────────┤
│ Next.js App     │    3000     │ 開發和生產環境應用              │
│ Apache HTTP     │    80       │ XAMPP Apache (未啟用)           │
│ Apache HTTP     │    8080     │ Homebrew Apache (啟用)          │
│ MongoDB         │    27017    │ 資料庫連接                      │
└─────────────────┴─────────────┴─────────────────────────────────┘
```

### 域名配置 / Domain Configuration
```
┌─────────────────┬─────────────────────┬─────────────────────────┐
│     域名        │      目標地址       │           說明           │
├─────────────────┼─────────────────────┼─────────────────────────┤
│ localhost       │ 127.0.0.1:8080     │ 本地開發                │
│ crm.local       │ 127.0.0.1:3000     │ CRM 系統                │
│ mysite.local    │ 127.0.0.1:8080     │ 我的網站                │
│ www.in_crm_system.com │ 127.0.0.1:3000 │ 網際網路 CRM            │
│ cam.ddns.net    │ 172.16.18.161:8080 │ 動態 DNS                │
└─────────────────┴─────────────────────┴─────────────────────────┘
```

## 🗄️ 資料庫架構 / Database Architecture

### MongoDB 集合設計 / MongoDB Collection Design

#### 用戶集合 / Users Collection
```typescript
interface User {
  _id: ObjectId;
  username: string;
  password: string; // 加密後
  role: 'admin' | 'trainer' | 'member';
  isActive: boolean;
  profile: {
    displayName: string;
    email: string;
    phone: string;
    avatar?: string;
  };
  permissions: string[];
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
}
```

#### 財務記錄集合 / Financial Records Collection
```typescript
interface FinancialRecord {
  _id: ObjectId;
  recordType: 'income' | 'expense';
  memberName: string;
  item: string;
  details: string;
  location: string;
  unitPrice: number;
  quantity: number;
  totalAmount: number;
  recordDate: Date; // 香港時區
  createdBy: ObjectId;
  createdAt: Date;
  updatedAt: Date;
}
```

#### 出席記錄集合 / Attendance Records Collection
```typescript
interface AttendanceRecord {
  _id: ObjectId;
  memberId: ObjectId;
  activityId: ObjectId;
  attendanceDate: Date;
  status: 'present' | 'absent' | 'late';
  notes?: string;
  recordedBy: ObjectId;
  createdAt: Date;
  updatedAt: Date;
}
```

## 🔐 安全架構 / Security Architecture

### 認證流程 / Authentication Flow
```
1. 用戶輸入憑證
   ↓
2. 前端驗證格式
   ↓
3. API 請求到後端
   ↓
4. 資料庫驗證憑證
   ↓
5. 生成 JWT Token
   ↓
6. 設置 HTTP-Only Cookie
   ↓
7. 返回成功響應
```

### 授權機制 / Authorization Mechanism
- **角色基礎訪問控制 (RBAC):** admin, trainer, member
- **權限檢查:** 每個 API 端點進行權限驗證
- **會話管理:** JWT Token 過期時間設置
- **安全標頭:** CORS, CSP, HSTS 等安全標頭

## 🚀 部署架構 / Deployment Architecture

### 開發環境 / Development Environment
```
┌─────────────────┐
│  開發者機器     │
│  (macOS)       │
├─────────────────┤
│ • Node.js      │
│ • Next.js Dev  │
│ • MongoDB      │
│ • Apache       │
└─────────────────┘
```

### 生產環境 / Production Environment
```
┌─────────────────┐    ┌─────────────────┐
│   用戶端        │    │   生產伺服器    │
│  (瀏覽器)      │◄──►│  (macOS)       │
└─────────────────┘    ├─────────────────┤
                       │ • Apache       │
                       │ • Next.js      │
                       │ • MongoDB      │
                       │ • SSL 證書     │
                       └─────────────────┘
```

## 📊 性能優化 / Performance Optimization

### 前端優化 / Frontend Optimization
- **代碼分割:** Next.js 自動代碼分割
- **圖片優化:** Next.js Image 組件
- **快取策略:** 靜態資源快取
- **懶加載:** 組件和路由懶加載

### 後端優化 / Backend Optimization
- **資料庫索引:** MongoDB 複合索引
- **查詢優化:** 聚合管道優化
- **連接池:** MongoDB 連接池管理
- **快取層:** Redis 快取 (可選)

## 🔍 監控和日誌 / Monitoring and Logging

### 日誌配置 / Logging Configuration
```
┌─────────────────┬─────────────────────────────────────────────┐
│     日誌類型    │                   路徑                     │
├─────────────────┼─────────────────────────────────────────────┤
│ Apache 訪問日誌 │ /opt/homebrew/var/log/httpd/access_log     │
│ Apache 錯誤日誌 │ /opt/homebrew/var/log/httpd/error_log      │
│ Next.js 日誌    │ console.log (開發) / 文件 (生產)            │
│ MongoDB 日誌    │ MongoDB 內建日誌系統                        │
└─────────────────┴─────────────────────────────────────────────┘
```

### 監控指標 / Monitoring Metrics
- **系統性能:** CPU, 記憶體, 磁碟使用率
- **網路性能:** 響應時間, 吞吐量
- **應用性能:** API 響應時間, 錯誤率
- **資料庫性能:** 查詢時間, 連接數

## 🛠️ 維護和備份 / Maintenance and Backup

### 定期維護 / Regular Maintenance
- **日誌輪轉:** 每週清理舊日誌
- **資料庫備份:** 每日 MongoDB 備份
- **系統更新:** 定期更新依賴包
- **安全掃描:** 定期安全漏洞掃描

### 備份策略 / Backup Strategy
- **資料庫備份:** MongoDB 自動備份
- **配置文件備份:** 版本控制系統
- **代碼備份:** Git 遠程倉庫
- **災難恢復:** 完整的恢復流程文檔

## 📋 配置清單 / Configuration Checklist

### Apache 配置 / Apache Configuration
- [ ] 啟用 mod_proxy 模組
- [ ] 啟用 mod_proxy_http 模組
- [ ] 配置虛擬主機
- [ ] 設置反向代理規則
- [ ] 配置 SSL 證書 (生產環境)

### Next.js 配置 / Next.js Configuration
- [ ] 環境變數配置
- [ ] 資料庫連接配置
- [ ] JWT 密鑰配置
- [ ] CORS 配置
- [ ] 快取配置

### MongoDB 配置 / MongoDB Configuration
- [ ] 資料庫連接字符串
- [ ] 用戶認證配置
- [ ] 索引創建
- [ ] 備份配置
- [ ] 安全配置

---

## 📖 更新日誌 / Update Log

### 版本 1.0.0 (2025-08-13)
- ✅ 初始架構設計
- ✅ 基本功能實現
- ✅ 安全機制配置
- ✅ 部署配置完成

---

## 📄 版權聲明 / Copyright Notice

© 2025 CRM Management System. All rights reserved.

本架構文檔僅供內部使用，未經授權不得外傳。
This architecture documentation is for internal use only and may not be distributed without authorization. 