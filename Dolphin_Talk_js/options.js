// options.js
document.addEventListener("DOMContentLoaded", () => {
  const apiKeyInput = document.getElementById("api-key");
  const saveButton = document.getElementById("save-button");
  const statusDiv = document.getElementById("status");

  // 保存されているキーを読み込む
  chrome.storage.local.get("geminiApiKey", (data) => {
    if (data.geminiApiKey) {
      apiKeyInput.value = data.geminiApiKey;
    }
  });

  // 保存ボタンのイベントリスナー
  saveButton.addEventListener("click", () => {
    const apiKey = apiKeyInput.value.trim();
    if (apiKey) {
      chrome.storage.local.set({ geminiApiKey: apiKey }, () => {
        statusDiv.textContent = "✅ APIキーを保存しました！";
        statusDiv.style.color = "green";
        setTimeout(() => {
          statusDiv.textContent = "";
        }, 3000);
      });
    } else {
      statusDiv.textContent = "❌ APIキーが空です。";
      statusDiv.style.color = "red";
    }
  });
});
