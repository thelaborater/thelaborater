# POPUP｜角色圖片顯示修正版

這版針對「網站仍顯示原本替代角色」重新處理：

- 將 app.js 與 styles.css 改成全新檔名，避免瀏覽器或 Netlify 繼續讀取舊快取。
- 角色圖片路徑改成明確的 `./assets/...`。
- 尋人啟事使用帕普家全家福。
- 寇恩、丘洛、哈斗哥使用正式圖片。
- 加入 Netlify 不快取 HTML／JS／CSS 的設定。
- 若角色圖片真的沒有被上傳，圖片位置會顯示紅色外框，方便判斷是資源遺漏而不是程式未切換。

## 上傳時必須注意

請把壓縮檔解壓後的「全部內容」上傳到 GitHub Repository 根目錄，包括：

- `assets` 整個資料夾
- `app-roles-v2.js`
- `styles-roles-v2.css`
- `game-data.js`
- `index.html`
- `netlify.toml`

舊的 `app.js` 和 `styles.css` 可以保留，但新網站會讀取 v2 檔案。
