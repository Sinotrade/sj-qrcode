# SJ QR Code 生成器

SJ QR Code 生成器是一個前端工具網站，協助團隊快速輸入 `NAME`、`SJ_API_KEY` 與 `SJ_SEC_KEY` 後，產出對應的 JSON 字串與 QR code，方便在不同裝置間安全地交換認證資訊。

> ⚠️ 部署網址：<https://sinotrade.github.io/sj-qrcode/> — 請確認使用此頁面操作，以確保資訊顯示與部署環境一致。

## ✨ 特色
- **即時生成**：送出表單後立即取得格式化 JSON 與 QR code。
- **輸入驗證**：使用 Zod + React Hook Form 確保欄位符合要求並提供即時提示。
- **複製與下載**：一鍵複製 JSON，或下載 QR code 圖片以供備份。
- **現代化 UI**：整合 Tailwind CSS 與 shadcn/ui，提供亮／暗模式友善的操作體驗。
- **行動裝置優化**：響應式版面，於手機、平板及桌面裝置皆可輕鬆使用。

## 🛠 技術棧
- [Vite](https://vitejs.dev/) + [React](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/) & [shadcn/ui](https://ui.shadcn.com/)
- [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/) 進行表單驗證
- [qrcode](https://github.com/soldair/node-qrcode) 生成 QR code
- [sonner](https://sonner.emilkowal.ski/) 產生通知提示

## 🚀 快速開始
```bash
pnpm install
pnpm dev
```
啟動後預設會在 <http://localhost:5173> 提供開發伺服器。

## 📦 常用指令
| 指令 | 說明 |
| --- | --- |
| `pnpm dev` | 啟動開發伺服器（含 HMR）。 |
| `pnpm build` | 建置產線版本，輸出於 `dist/`。 |
| `pnpm preview` | 預覽產線建置結果。 |
| `pnpm lint` | 執行 ESLint 檢查。 |
| `pnpm format` | 使用 Prettier 套用程式碼格式。 |

## 🧩 專案結構
```
├── src/
│   ├── components/      # shadcn/ui 及自訂組件
│   ├── lib/             # 共用工具函式
│   ├── main.tsx         # React 入口文件
│   └── App.tsx          # 主畫面與表單邏輯
├── public/              # 靜態資源
├── index.html
└── vite.config.ts       # Vite 設定，含 GitHub Pages base path
```

## 🌐 GitHub Pages 部署
已於 `.github/workflows/deploy.yml` 設定 GitHub Actions：
1. 當推送到 `main` 分支或手動觸發 workflow 時，自動安裝依賴並建置專案。
2. 以 `BASE_PATH=/<repository>/` 編譯 Vite，確保資源路徑正確。
3. 透過 `actions/deploy-pages` 發佈到 `gh-pages`。

如需自訂路徑，可修改 GitHub Actions 中的 `BASE_PATH` 或在本機建置時指定：
```bash
BASE_PATH=/sj-qrcode/ pnpm build
```

## 🧪 驗證建議
- 執行 `pnpm lint` 確保程式碼維持一致風格與品質。
- 使用 `pnpm build && pnpm preview` 手動檢查打包結果的 QR code 功能是否正常。
- 部署後，於 GitHub Pages 實際掃描 QR code 並驗證 JSON 資料正確性。

## 📄 授權
本專案採用 MIT License，可自由於個人或商業專案中使用與修改。
