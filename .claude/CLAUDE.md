# portal — CLAUDE.md

## 專案定位

**工程系統入口頁**，以 GitHub Pages 靜態網站形式部署，作為內部系統與文件的統一導覽入口。

---

## 部署資訊

| 項目 | 內容 |
|------|------|
| 托管平台 | GitHub Pages（Public repo） |
| 部署方式 | `main` branch 根目錄 `index.html` |
| 網址 | `https://ccyu025.github.io/portal/` |

---

## 檔案結構

```
portal/
├── index.html           ← 主入口，僅保留 HTML 骨架（無 inline CSS/JS）
├── logo.png             ← Header Logo 圖片
├── assets/
│   ├── styles.css       ← 外部樣式表（從 inline <style> 抽出）
│   └── app.js           ← ES module：動態渲染 + ⌘K 搜尋 + 互動邏輯
├── data/
│   └── systems.js       ← 系統清單資料（CATEGORIES + SYSTEMS 陣列）
├── 404.html             ← GitHub Pages 自訂 404 頁
├── offline.html         ← 離線 fallback 頁
├── README.md            ← 維運說明（如何新增系統）
├── proposal.html        ← Opus 4.7 資深顧問評估計畫書（參考用）
└── .claude/
    └── CLAUDE.md        ← 本文件
```

---

## 技術規格

- **純靜態 HTML**：無框架、無 Node.js、無建置步驟，直接 GitHub Pages 相容
- **CSS**：`assets/styles.css`（外部檔，原 inline `<style>` 已移除）
- **JS**：`assets/app.js`（ES module，vanilla JS，`<script type="module">`）
- **資料層**：`data/systems.js`（`export const CATEGORIES / SYSTEMS`，動態渲染）
- **字型**：Fira Sans（Google Fonts CDN），fallback `"Segoe UI", system-ui`
- **深色主題**：背景 `#0f172a`，卡片 `#1e293b`；`color-scheme: dark` 已宣告
- **響應式格線**：`repeat(auto-fit, minmax(260px, 1fr))`
- **新功能**：⌘K 命令面板搜尋、sidebar 分類篩選、VPN 健康狀態偵測（fetch no-cors）、localStorage 釘選 + 使用頻率個人化

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
<header>          → Logo（logo.png）+ 副標「技術部系統入口」
<main>
  <div.vpn-notice>  → 全域 VPN 提示欄（main 頂部）
  <section.category> → 分類區塊（可無限新增）
    <div.grid>       → 卡片格線
      <div.card>     → 單一系統卡片
```

### 卡片欄位說明

| 欄位 | HTML 元素 | 說明 |
|------|-----------|------|
| icon | `.card-icon` | 內嵌 SVG，32px，`aria-hidden="true"` |
| title + badge | `.card-header` > `h3` + `.badge` | 標題與存取標籤同行 |
| desc | `p` | 一行說明，15px |
| button | `a.btn` / `a.btn.btn-green` | VPN 系統藍色，公開系統綠色 |

> **圖示規範**：一律使用內嵌 SVG（Lucide 風格，stroke-width 1.75），**禁用 emoji 作為圖示**。

---

## 現有分類與卡片

### 生產監控系統
| 卡片 | Badge | 按鈕色 | URL |
|------|-------|--------|-----|
| MES System V2 — 機械手臂生產監控系統 | 需公司 VPN | 藍 | `http://100.82.186.54:8000` |

### 公司文檔
| 卡片 | Badge | 按鈕色 | URL |
|------|-------|--------|-----|
| 公司文件庫 — 公司內部文件索引入口 | 需公司 VPN | 藍 | `http://100.82.186.54:8000/doc/文件導覽.html` |

### 專案紀錄
| 卡片 | Badge | 按鈕色 | URL |
|------|-------|--------|-----|
| 毅豐專案紀錄 — 專案進度追蹤與紀錄平台 | 公開存取 | 綠 | `https://ccyu025.github.io/ProjectRecords/` |

---

## Tailscale 連線資訊

- 地端主機 Tailscale IP：`100.82.186.54`，MES 服務 Port：`8000`
- 頁面顯示「需公司 VPN」，Tailscale 連線後方可存取

> GitHub Pages 強制 HTTPS，無法對 HTTP 端點做 JS 健康檢查（Mixed Content 限制）。
> 如需連線狀態偵測，需為 MES 主機申請 Tailscale HTTPS 憑證（`tailscale cert`）。

---

## 新增系統方式

**只需編輯 `data/systems.js`**，在 `SYSTEMS` 陣列新增一個物件：

```js
{
  id: 'unique-id',          // 唯一識別碼（kebab-case）
  categoryId: 'production', // 對應 CATEGORIES 中的 id
  name: '系統名稱',
  desc: '一行說明',
  url: 'http://...',
  icon: 'cpu',              // 圖示名稱（見 app.js ICONS 對映）
  vpn: true,                // true = 需公司 VPN（藍色 badge）
  healthCheck: true,        // true = 啟用 fetch 健康檢查
}
```

公開系統：`vpn: false`、`healthCheck: false`。

## 新增分類方式

在 `data/systems.js` 的 `CATEGORIES` 陣列新增：

```js
{ id: 'new-cat', label: '分類名稱', icon: 'folder' }
```

---

## Session 變更紀錄

| 日期 | 變更內容 |
|------|---------|
| 2026-05-01 | 建立初版：單一 MES 卡片入口頁 |
| 2026-05-02 | 重構為多分類入口頁；新增公司文檔、專案紀錄分類 |
| 2026-05-02 | 全面排版與視覺改善：響應式斷點、favicon、badge 配色、按鈕分色、VPN 提示欄位置 |
| 2026-05-02 | Logo 圖片替換文字標題；公司文件庫連結改為 MES /doc/文件導覽.html |
| 2026-05-22 | UI/UX 改善：emoji 圖示全部換為內嵌 SVG；新增 focus-visible、cursor:pointer、prefers-reduced-motion、color-scheme:dark；字型升級為 Fira Sans；body 改用 100dvh；卡片 hover 加 box-shadow glow |
| 2026-05-28 | 大型重構：CSS/JS 外移至 assets/；系統清單抽離至 data/systems.js；新增 ⌘K 搜尋、sidebar 導覽、VPN 健康偵測、釘選個人化；新增 404/offline/README；建立 proposal.html（Opus 4.7 資深顧問評估）|
