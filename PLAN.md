# SJ QR Code 生成器網站開發計劃

## 1. 專案初始化
- 使用 Vite + React + TypeScript 創建新專案
- 配置 pnpm 作為包管理器
- 設置基礎專案結構

## 2. UI 框架設置
- 安裝和配置 shadcn/ui
- 設置 Tailwind CSS
- 配置主題和基礎樣式

## 3. 核心功能開發
- 創建輸入表單組件（NAME, SJ_API_KEY, SJ_SEC_KEY）
- 安裝 QR code 生成庫 (qrcode.js)
- 實現 JSON 格式化和 QR code 生成功能
- 添加輸入驗證和錯誤處理

## 4. UI/UX 優化
- 使用 shadcn/ui 組件美化界面
- 添加複製功能和下載 QR code 功能
- 響應式設計適配

## 5. GitHub Pages 部署配置
- 配置 Vite 靜態網站打包
- 設置 GitHub Actions 自動部署
- 配置 `gh-pages` 分支和部署流程

## 6. 專案完善
- 添加 README.md 說明文檔
- 設置 ESLint 和 Prettier
- 最終測試和提交

這個計劃將創建一個功能完整的靜態網站，用戶可以輸入三個欄位並生成包含 JSON 資料的 QR code。