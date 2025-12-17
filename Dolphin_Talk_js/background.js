// background.js

const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

// メッセージリスナー関数全体を async にします
chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  if (request.action === "askGemini") {
    
    // 1. 保存されたAPIキーを取得（コールバックを使わず、awaitで直接結果を取得）
    // Manifest V3では、このように await で同期的に storage を呼び出せます。
    const data = await chrome.storage.local.get("geminiApiKey");
    const apiKey = data.geminiApiKey;

    if (!apiKey) {
      sendResponse({ answer: "APIキーが設定されていません。拡張機能の設定画面で設定してください！" });
      // 非同期で処理を終えることを示すため return true は必要です
      return true; 
    }

    const userQuestion = request.question;

    try {
      // 2. Gemini APIを呼び出す
      const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: userQuestion }] }],
          // 日本語の応答品質を上げるための設定 (省略可)
          config: {
            temperature: 0.7 
          }
        }),
      });

      const json = await response.json();

      if (!response.ok) {
        // APIからのエラー応答
        console.error("Gemini API Error:", json);
        sendResponse({ answer: "API呼び出しでエラーが発生しました。キーや設定を確認してください。" });
        return true; 
      }

      // 3. 応答のテキストを抽出
      const aiText = json.candidates?.[0]?.content?.parts?.[0]?.text || "応答が生成できませんでした。";
      sendResponse({ answer: aiText });

    } catch (e) {
      console.error("Fetch Error:", e);
      sendResponse({ answer: "ネットワーク接続または予期せぬエラーが発生しました。" });
    }
    
    // メッセージの応答が非同期であることを示すため、最後に必ず true を返します
    return true; 
  }
});
