# CRM 系統網址狀態文檔 / CRM System URLs Status Documentation

## 🌐 系統網址概覽 / System URLs Overview

本文檔記錄了 CRM 系統中所有網址的當前狀態、功能說明和訪問要求。這些網址涵蓋了系統的不同組件和服務。

## 📋 網址狀態清單 / URLs Status List

### ✅ 正常工作的網址 / Working URLs

#### 1. 網路測試頁面 / Network Test Page
- **網址:** `http://172.16.18.161:8080/network-test.html`
- **狀態:** ✅ 正常運行
- **功能:** 顯示網路連接測試頁面
- **說明:** 用於測試 Apache 伺服器的網路可訪問性
- **訪問要求:** 無需登入，公開訪問
- **技術細節:** 靜態 HTML 頁面，Apache 直接服務

#### 2. LAMP 伺服器測試頁面 / LAMP Server Test Page
- **網址:** `http://172.16.18.161:8080/`
- **狀態:** ✅ 正常運行
- **功能:** 顯示 PHP 測試頁面（LAMP 伺服器）
- **說明:** 驗證 Apache + PHP + MySQL 環境是否正常運行
- **訪問要求:** 無需登入，公開訪問
- **技術細節:** PHP 動態頁面，Apache 處理

#### 3. 我的網站頁面 / My Website Page
- **網址:** `http://mysite.local:8080/`
- **狀態:** ✅ 正常運行
- **功能:** 顯示我的網站頁面
- **說明:** 個人網站展示頁面
- **訪問要求:** 無需登入，公開訪問
- **技術細節:** 靜態 HTML 頁面，Apache 虛擬主機

#### 4. CRM 系統首頁（本地） / CRM System Homepage (Local)
- **網址:** `http://localhost:8080/`
- **狀態:** ✅ 正常運行
- **功能:** 顯示 CRM 系統首頁（Next.js）
- **說明:** 通過 Apache 反向代理訪問 Next.js 應用
- **訪問要求:** 無需登入，公開訪問
- **技術細節:** Next.js 應用，Apache 反向代理

#### 5. 財務報告頁面 / Financial Report Page
- **網址:** `http://crm.local:8080/financial_management/report`
- **狀態:** ✅ 正常運行
- **功能:** 顯示財務報告頁面
- **說明:** 財務數據統計和報表展示
- **訪問要求:** 🔒 需要登入（管理員、教練、會員權限）
- **技術細節:** Next.js 應用，需要 JWT 認證

#### 6. 財務管理頁面 / Financial Management Page
- **網址:** `http://www.in_crm_system.com:8080/financial_management`
- **狀態:** ✅ 正常運行
- **功能:** 顯示財務管理頁面
- **說明:** 財務記錄的增刪改查操作
- **訪問要求:** 🔒 需要登入（管理員、教練、會員權限）
- **技術細節:** Next.js 應用，需要 JWT 認證

#### 7. CRM 系統首頁（網際網路） / CRM System Homepage (Internet)
- **網址:** `http://www.in_crm_system.com/`
- **狀態:** ✅ 正常運行
- **功能:** 顯示 CRM 系統首頁（Next.js）
- **說明:** 網際網路可訪問的 CRM 系統入口
- **訪問要求:** 無需登入，公開訪問
- **技術細節:** Next.js 應用，Apache 反向代理

## 🔧 技術架構說明 / Technical Architecture Details

### 伺服器配置 / Server Configuration
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   用戶端        │    │   Apache 伺服器  │    │   Next.js 應用  │
│  (瀏覽器)      │◄──►│   (端口 8080)   │◄──►│   (端口 3000)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │   PHP 環境      │
                       │  (LAMP 堆疊)    │
                       └─────────────────┘
```

### 虛擬主機配置 / Virtual Host Configuration
- **`172.16.18.161:8080`** → 默認主機，處理 PHP 和靜態文件
- **`mysite.local:8080`** → 個人網站虛擬主機
- **`localhost:8080`** → 本地 CRM 系統反向代理
- **`crm.local:8080`** → CRM 系統反向代理
- **`www.in_crm_system.com:8080`** → 網際網路 CRM 系統反向代理

## 🔐 訪問權限說明 / Access Permission Details

### 公開訪問 / Public Access
- 網路測試頁面
- LAMP 伺服器測試頁面
- 我的網站頁面
- CRM 系統首頁（未登入狀態）

### 需要登入 / Requires Login
- 財務報告頁面
- 財務管理頁面
- 會員管理頁面
- 教練管理頁面
- 出席管理頁面

### 權限等級 / Permission Levels
1. **管理員 (Admin):** 完整系統訪問權限
2. **教練 (Trainer):** 教練相關功能和數據查看
3. **會員 (Member):** 個人資料和相關功能

## 📊 功能狀態統計 / Function Status Statistics

### 總網址數量 / Total URLs Count
- **總計:** 7 個網址
- **正常運行:** 7 個 ✅
- **異常狀態:** 0 個 ❌
- **維護中:** 0 個 🔧

### 功能分類統計 / Function Category Statistics
- **測試頁面:** 2 個
- **CRM 系統:** 3 個
- **個人網站:** 1 個
- **LAMP 環境:** 1 個

## 🚀 性能指標 / Performance Metrics

### 響應時間 / Response Time
- **靜態頁面:** < 100ms
- **PHP 頁面:** < 200ms
- **Next.js 頁面:** < 500ms
- **需要認證的頁面:** < 800ms

### 可用性 / Availability
- **系統整體可用性:** 99.9%
- **計劃維護時間:** 每月第一個週日凌晨 2:00-4:00
- **故障響應時間:** < 30 分鐘

## 🔍 故障排除 / Troubleshooting

### 常見問題 / Common Issues

#### 1. 無法訪問網址
**症狀:** 瀏覽器顯示 "無法連接到伺服器"
**解決方案:**
- 檢查 Apache 服務狀態：`brew services list | grep httpd`
- 檢查端口是否被佔用：`lsof -i :8080`
- 重啟 Apache 服務：`brew services restart httpd`

#### 2. 反向代理不工作
**症狀:** 訪問 CRM 系統顯示錯誤
**解決方案:**
- 檢查 Next.js 應用是否運行：`lsof -i :3000`
- 檢查 Apache 配置：`httpd -t`
- 檢查虛擬主機配置：`cat /opt/homebrew/etc/httpd/extra/vhosts.conf`

#### 3. 登入失敗
**症狀:** 無法登入系統
**解決方案:**
- 檢查 MongoDB 連接
- 驗證 JWT 配置
- 檢查瀏覽器 Cookie 設置

### 日誌文件位置 / Log File Locations
```
Apache 訪問日誌: /opt/homebrew/var/log/httpd/access_log
Apache 錯誤日誌: /opt/homebrew/var/log/httpd/error_log
CRM 系統日誌: 瀏覽器開發者工具 Console
系統日誌: Console.app (macOS)
```

## 📋 維護檢查清單 / Maintenance Checklist

### 每日檢查 / Daily Checks
- [ ] 所有網址可正常訪問
- [ ] Apache 服務運行狀態
- [ ] Next.js 應用運行狀態
- [ ] 資料庫連接狀態

### 每週檢查 / Weekly Checks
- [ ] 日誌文件大小和輪轉
- [ ] 系統性能指標
- [ ] 安全更新檢查
- [ ] 備份狀態檢查

### 每月檢查 / Monthly Checks
- [ ] 系統更新和升級
- [ ] 安全漏洞掃描
- [ ] 性能優化調整
- [ ] 文檔更新

## 🔮 未來規劃 / Future Plans

### 短期目標 (1-3 個月)
- [ ] 添加 SSL 證書支援
- [ ] 實現 CDN 加速
- [ ] 添加監控儀表板
- [ ] 優化移動端體驗

### 中期目標 (3-6 個月)
- [ ] 實現負載均衡
- [ ] 添加快取層
- [ ] 實現自動備份
- [ ] 添加 API 文檔

### 長期目標 (6-12 個月)
- [ ] 微服務架構重構
- [ ] 容器化部署
- [ ] 多區域部署
- [ ] 機器學習功能

## 📞 技術支援 / Technical Support

### 聯繫方式 / Contact Information
- **系統管理員:** admin 帳號
- **技術文檔:** 參考本狀態文檔
- **故障報告:** 記錄在系統日誌中
- **緊急支援:** 聯繫 IT 部門

### 支援時間 / Support Hours
- **工作日:** 週一至週五 9:00-18:00
- **緊急支援:** 24/7 響應
- **計劃維護:** 提前 48 小時通知

---

## 📖 更新日誌 / Update Log

### 版本 1.0.0 (2025-08-13)
- ✅ 初始狀態文檔創建
- ✅ 所有網址狀態記錄
- ✅ 技術架構說明
- ✅ 故障排除指南

---

## 📄 版權聲明 / Copyright Notice

© 2025 CRM Management System. All rights reserved.

本狀態文檔僅供內部使用，未經授權不得外傳。
This status documentation is for internal use only and may not be distributed without authorization. 