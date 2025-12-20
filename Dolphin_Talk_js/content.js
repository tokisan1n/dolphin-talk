(function () {
	// 既にイルカが存在する場合は何もしない
	if (document.getElementById("dolphin-talk")) return;

	// イルカの状態管理
	let dolphinState = {
		isVisible: false,
		nextAppearTime: null,
		conversationHistory: []
	};

	// ストレージから前回の状態を読み込む
	chrome.storage.local.get(['dolphinNextAppear'], (data) => {
		if (data.dolphinNextAppear) {
			dolphinState.nextAppearTime = new Date(data.dolphinNextAppear);
		} else {
			// 初回起動時は2〜5分後に設定
			scheduleNextAppearance();
		}
		checkAndShowDolphin();
	});

	const wrap = document.createElement("div");
	wrap.id = "dolphin-talk";
	wrap.style.display = "none"; // 初期状態は非表示

	// dolphin.pngのURLを取得
	const dolphinImageUrl = chrome.runtime.getURL("dolphin.png");

	wrap.innerHTML = `
		<div id="dolphin-close-btn">×</div>
		<img id="dolphin-sprite" src="${dolphinImageUrl}" style="width:150px;cursor:pointer;">
		<div id="dolphin-bubble"></div>
		<div id="dolphin-input-area" style="display:none;">
			<input type="text" id="dolphin-user-input" placeholder="返事を入力...">
			<button id="dolphin-send-btn">送信</button>
		</div>
	`;

	document.body.appendChild(wrap);

	const sprite = document.getElementById("dolphin-sprite");
	const bubble = document.getElementById("dolphin-bubble");
	const closeBtn = document.getElementById("dolphin-close-btn");
	const inputArea = document.getElementById("dolphin-input-area");
	const userInput = document.getElementById("dolphin-user-input");
	const sendBtn = document.getElementById("dolphin-send-btn");

	// イルカ画像エラー処理
	sprite.onerror = () => {
		bubble.textContent = "イルカが迷子になってるよ…🐬💦";
	};

	// 次回出現時刻をスケジュール (2〜5分後のランダム)
	function scheduleNextAppearance() {
		const minMinutes = 2;
		const maxMinutes = 5;
		const randomMinutes = Math.random() * (maxMinutes - minMinutes) + minMinutes;
		const nextTime = new Date(Date.now() + randomMinutes * 60 * 1000);

		dolphinState.nextAppearTime = nextTime;
		chrome.storage.local.set({
			dolphinNextAppear: nextTime.toISOString()
		});

		console.log(`🐬 次のイルカ出現予定: ${nextTime.toLocaleString()}`);
	}

	// イルカを表示する
	function showDolphin() {
		if (dolphinState.isVisible) return;

		dolphinState.isVisible = true;
		wrap.style.display = "block";

		// ランダムな質問を表示
		const question = getRandomQuestion();
		bubble.textContent = question;
		inputArea.style.display = "flex";

		// 入力欄にフォーカス
		setTimeout(() => userInput.focus(), 300);
	}

	// イルカを非表示にする
	function hideDolphin() {
		dolphinState.isVisible = false;
		wrap.style.display = "none";
		inputArea.style.display = "none";
		userInput.value = "";

		// 次回出現をスケジュール
		scheduleNextAppearance();
	}

	// 時刻チェックしてイルカを表示
	function checkAndShowDolphin() {
		if (!dolphinState.nextAppearTime) return;

		const now = new Date();
		if (now >= dolphinState.nextAppearTime && !dolphinState.isVisible) {
			showDolphin();
		}
	}

	// ユーザーの入力に応答
	function respondToUser() {
		const input = userInput.value.trim();
		if (!input) return;

		// ユーザーの入力を会話履歴に追加
		dolphinState.conversationHistory.push({
			type: 'user',
			text: input,
			time: new Date()
		});

		// イルカの応答を取得
		const response = getDolphinResponse(input);

		// イルカの応答を会話履歴に追加
		dolphinState.conversationHistory.push({
			type: 'dolphin',
			text: response,
			time: new Date()
		});

		// 応答を表示
		bubble.textContent = response;
		userInput.value = "";

		// 3秒後に自動で非表示
		setTimeout(() => {
			hideDolphin();
		}, 3000);
	}

	// イベントリスナー設定
	closeBtn.addEventListener("click", () => {
		hideDolphin();
	});

	sendBtn.addEventListener("click", () => {
		respondToUser();
	});

	userInput.addEventListener("keypress", (e) => {
		if (e.key === "Enter") {
			respondToUser();
		}
	});

	// イルカ画像クリックで会話履歴を表示
	sprite.addEventListener("click", () => {
		if (dolphinState.conversationHistory.length > 0) {
			const lastConv = dolphinState.conversationHistory[dolphinState.conversationHistory.length - 1];
			bubble.textContent = lastConv.text;
		}
	});

	// 定期的に時刻をチェック (30秒ごと)
	setInterval(checkAndShowDolphin, 30000);

	// 初回チェック
	checkAndShowDolphin();
})();
