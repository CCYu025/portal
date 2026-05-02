# portal — CLAUDE.md

## 專案定位

**工程系統入口頁**，以 GitHub Pages 靜態網站形式部署，作為內部系統與文件的統一導覽入口。抽象化命名，不綁定特定公司代號。

---

## 部署資訊

| 項目 | 內容 |
|------|------|
| 托管平台 | GitHub Pages（Public repo） |
| 部署方式 | `main` branch 根目錄 `index.html` |
| 網址格式 | `https://<GitHub帳號>.github.io/portal/` |

---

## 檔案結構

```
portal/
├── index.html       ← 唯一主要檔案，所有樣式與結構皆內嵌
└── .claude/
    └── CLAUDE.md    ← 本文件
```

---

## 技術規格

- **純靜態 HTML**：無框架、無 Node.js、無建置步驟
- **CSS 全內嵌**：所有樣式寫在 `<style>` 標籤內，不依賴外部 CSS
- **深色主題**：背景 `#0f172a`（slate-900），卡片 `#1e293b`（slate-800）
- **響應式格線**：`repeat(auto-fit, minmax(260px, 1fr))`，3 斷點覆蓋所有裝置

---

## 響應式斷點

| 斷點 | 裝置 | Grid 欄數 |
|------|------|---------|
| `>768px` | 桌機、平板橫向 | auto-fit（依寬度） |
| `≤768px` | 平板直向 | auto-fit，minmax 220px |
| `≤599px` | 手機橫向 | 強制 2 欄 |
| `≤480px` | 手機直向 | 強制 1 欄，按鈕 ≥48px |

---

## 頁面結構

```
<header>        → 頁面標題 + 全域 VPN 提示欄
<main>
  <section>     → 分類區塊（可無限新增）
    <div.grid>  → 卡片格線
      <div.card>→ 單一系統/工具卡片
```

### 卡片欄位說明

| 欄位 | HTML 元素 | 說明 |
|------|-----------|------|
| icon | `.card-icon` | emoji，32px |
| badge | `.badge` | `.badge-blue`（需公司 VPN）/ `.badge-green`（雲端/公開） |
| title | `h3` | 系統名稱，18px |
| desc | `p` | 一行說明，15px |
| button | `a.btn` | 連結按鈕，16px |

---

## 現有分類與卡片

### 生產監控系統
| 卡片 | Badge | URL | 開啟方式 |
|------|-------|-----|---------|
| MES System V2 — 機械手臂生產監控系統 | 需公司 VPN (blue) | `http://100.125.194.119:8000` | 新分頁 |

### 專案紀錄
| 卡片 | Badge | URL | 開啟方式 |
|------|-------|-----|---------|
| 毅豐專案紀錄 — 專案進度追蹤與紀錄平台 | 公開存取 (green) | https://ccyu025.github.io/ProjectRecords/ | 新分頁 |

### 公司文檔
| 卡片 | Badge | URL | 開啟方式 |
|------|-------|-----|---------|
| 公司文件庫 — 公司內部文件索引入口 | 需公司 VPN (blue) | `http://100.125.194.119:8000/doc/文件導覽.html` | 新分頁 |

---

## Tailscale 連線資訊

- MES System V2 透過 Tailscale VPN 存取（頁面顯示為「需公司 VPN」）
- 地端主機 Tailscale IP：`100.125.194.119`
- MES 服務 Port：`8000`
- 存取 URL：`http://100.125.194.119:8000`

> GitHub Pages 強制 HTTPS，無法對 HTTP 端點做 JavaScript 健康檢查（Mixed Content 限制）。
> 如未來需要連線狀態偵測，需先為 MES 主機申請 Tailscale HTTPS 憑證（`tailscale cert`）。

---

## 新增卡片方式

在對應 `<section>` 的 `.grid` 內插入：

```html
<div class="card">
  <div class="card-icon">🔧</div>
  <span class="badge badge-green">公開存取</span>
  <h3>工具名稱</h3>
  <p>一行說明</p>
  <a class="btn" href="URL" target="_blank" rel="noopener">開啟</a>
</div>
```

## 新增分類方式

在 `<main>` 內加入：

```html
<section class="category">
  <h2 class="category-title">分類名稱</h2>
  <div class="grid">
    <!-- 卡片放這裡 -->
  </div>
</section>
```

---

## Session 變更紀錄

| 日期 | 變更內容 |
|------|---------|
| 2026-05-01 | 建立初版 index.html，單一 MES 連結卡片 |
| 2026-05-01 | 副標題改為「機械手臂生產監控系統」 |
| 2026-05-01 | 重構為多分類入口頁（YF 工程系統入口）；新增公司文檔分區（Google Drive） |
| 2026-05-01 | 建立 .claude/CLAUDE.md |
| 2026-05-02 | 新增「專案紀錄」分類；加入毅豐專案紀錄卡片（ccyu025.github.io/ProjectRecords） |
| 2026-05-02 | 全面排版改善：修正 badge flex 拉伸 bug、auto-fit grid、3 段響應式斷點（768/599/480px）、高齡友善字體放大、術語去技術化（Tailscale→公司VPN）、觸控 active 回饋、hover 限滑鼠裝置 |
| 2026-05-02 | 資料夾由 mes-portal → yf-portal → portal（抽象化，移除公司代號） |
| 2026-05-02 | 公司文件庫卡片改為連結至 MES 伺服器 /doc/文件導覽.html；badge 改為需公司 VPN（藍色） |
| 2026-05-02 | 標題改為「YU FENG 技術部系統入口」 |
| 2026-05-02 | 全面視覺改善：favicon（藍底YF）、雙層標題（YU FENG 品牌色 + 副標）、accent line、Badge 移至標題右側同行、公開系統改綠色按鈕、VPN 提示欄移至 main 頂部 |
