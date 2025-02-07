// グローバル変数：シミュレーションの requestAnimationFrame のID
let simulationRequestId;

// 物理シミュレーション用の配列
let movingButtons = [];

// シミュレーションループを停止する関数
function stopSimulation() {
  if (simulationRequestId) {
    cancelAnimationFrame(simulationRequestId);
    simulationRequestId = null;
  }
}

// 物理シミュレーションの更新処理
function simulateButtons() {
  const container = document.getElementById("game-container");
  const contRect = container.getBoundingClientRect();
  
  movingButtons.forEach((btnObj, index) => {
    // 更新位置
    btnObj.x += btnObj.vx;
    btnObj.y += btnObj.vy;
    
    // ボタンサイズ（通常変わらない前提）
    btnObj.width = btnObj.element.offsetWidth;
    btnObj.height = btnObj.element.offsetHeight;
    
    // 画面端との衝突判定
    if (btnObj.x < 0) {
      btnObj.x = 0;
      btnObj.vx = -btnObj.vx;
    } else if (btnObj.x + btnObj.width > contRect.width) {
      btnObj.x = contRect.width - btnObj.width;
      btnObj.vx = -btnObj.vx;
    }
    
    if (btnObj.y < 0) {
      btnObj.y = 0;
      btnObj.vy = -btnObj.vy;
    } else if (btnObj.y + btnObj.height > contRect.height) {
      btnObj.y = contRect.height - btnObj.height;
      btnObj.vy = -btnObj.vy;
    }
    
    // 他のボタンとの衝突判定（シンプルな矩形判定）
    for (let j = 0; j < movingButtons.length; j++) {
      if (j === index) continue;
      let other = movingButtons[j];
      if (rectsOverlap(btnObj, other)) {
        // 衝突時は両者の速度を反転（簡易的な処理）
        btnObj.vx = -btnObj.vx;
        btnObj.vy = -btnObj.vy;
        other.vx = -other.vx;
        other.vy = -other.vy;
      }
    }
    
    // 更新された位置を適用
    btnObj.element.style.left = btnObj.x + "px";
    btnObj.element.style.top = btnObj.y + "px";
  });
  
  // 次フレームの更新
  simulationRequestId = requestAnimationFrame(simulateButtons);
}

// 矩形同士の重なり判定（簡易版）
function rectsOverlap(a, b) {
  return !( a.x + a.width < b.x ||
            a.x > b.x + b.width ||
            a.y + a.height < b.y ||
            a.y > b.y + b.height );
}

// タイピングエフェクト用の関数（各文字フェードイン）
function typeWriterSmooth(element, text, charDelay, callback) {
  element.innerHTML = "";  // 初期状態は空にする
  const spans = [];
  for (let char of text) {
    const span = document.createElement("span");
    span.textContent = char;
    span.classList.add("char");
    element.appendChild(span);
    spans.push(span);
  }
  
  let i = 0;
  function showNext() {
    if (i < spans.length) {
      spans[i].classList.add("visible");
      i++;
      setTimeout(showNext, charDelay);
    } else if (callback) {
      callback();
    }
  }
  showNext();
}

// 現在のシーンを表示する関数
function displayNode(nodeId) {
  const node = storyData[nodeId];
  if (!node) {
    console.error("ノードが見つかりません: " + nodeId);
    return;
  }
  
  // 前シーンのシミュレーションを停止
  stopSimulation();
  
  // ストーリーテキストの要素を取得しクリア
  const storyElement = document.getElementById("story");
  storyElement.innerHTML = "";
  
  // 選択肢コンテナ (#choices) の内容をクリアし、物理シミュレーション用の配列もリセット
  const choicesContainer = document.getElementById("choices");
  choicesContainer.innerHTML = "";
  movingButtons = [];
  
  // タイピングエフェクトでストーリーテキストを表示
  const paragraph = document.createElement("p");
  storyElement.appendChild(paragraph);
  typeWriterSmooth(paragraph, node.text, 50, function() {
    // テキスト表示完了後、選択肢ボタンを生成
    if (node.choices.length > 0) {
      node.choices.forEach(choice => {
        const button = document.createElement("button");
        button.textContent = choice.text;
        button.classList.add("choice-button");
        // クリック時の処理（シーン切替）
        button.addEventListener("click", () => {
          displayNode(choice.next);
        });
        // 選択肢コンテナ (#choices) に追加
        choicesContainer.appendChild(button);
        // 初期位置をコンテナ内でランダムに設定
        const contRect = document.getElementById("game-container").getBoundingClientRect();
        let initX = Math.random() * (contRect.width - 50);
        let initY = Math.random() * (contRect.height - 50);
        button.style.left = initX + "px";
        button.style.top = initY + "px";
  
        // ランダムな初期方向と速度を設定
        let angle = Math.random() * 2 * Math.PI;
        let speed = 1 + Math.random() * 2; // 1～3 px/frame 程度
        movingButtons.push({
          element: button,
          x: initX,
          y: initY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          width: button.offsetWidth,
          height: button.offsetHeight
        });
      });
      // シミュレーション開始
      simulationRequestId = requestAnimationFrame(simulateButtons);
    } else {
      // 選択肢がない場合（エンディング）は再スタートボタンを生成
      const restartButton = document.createElement("button");
      restartButton.textContent = "再スタート";
      restartButton.classList.add("choice-button");
      restartButton.addEventListener("click", () => {
        displayNode("start");
      });
      choicesContainer.appendChild(restartButton);
      
      // 再スタートボタンも物理シミュレーションの対象にする
      const contRect = document.getElementById("game-container").getBoundingClientRect();
      let initX = Math.random() * (contRect.width - 50);
      let initY = Math.random() * (contRect.height - 50);
      restartButton.style.left = initX + "px";
      restartButton.style.top = initY + "px";
      let angle = Math.random() * 2 * Math.PI;
      let speed = 1 + Math.random() * 2;
      movingButtons.push({
          element: restartButton,
          x: initX,
          y: initY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          width: restartButton.offsetWidth,
          height: restartButton.offsetHeight
      });
      simulationRequestId = requestAnimationFrame(simulateButtons);
    }
  });
}

// ゲーム内の各シーン（ノード）の定義
const storyData = {
  start: {
    text: "あなたは暗い森の中にいます。前方に2つの道が分かれています。どちらを進みますか？",
    choices: [
      { text: "左の道", next: "leftPath" },
      { text: "右の道", next: "rightPath" }
    ]
  },
  leftPath: {
    text: "左の道を進むと、穏やかな川にたどり着きました。どうしますか？",
    choices: [
      { text: "川を渡る", next: "acrossRiver" },
      { text: "川沿いを歩く", next: "followRiver" }
    ]
  },
  rightPath: {
    text: "右の道を進むと、急な坂道に出会いました。どうしますか？",
    choices: [
      { text: "坂を登る", next: "climbHill" },
      { text: "別の道を探す", next: "findAlternatePath" }
    ]
  },
  acrossRiver: {
    text: "川を渡ると、素晴らしい景色が広がっていました。あなたは冒険に成功しました！",
    choices: []
  },
  followRiver: {
    text: "川沿いを歩いていると、野生動物に遭遇しました。危険な状況に陥りました…",
    choices: []
  },
  climbHill: {
    text: "坂を登ると、頂上で美しい夕日を眺めることができました。心が癒されました。",
    choices: []
  },
  findAlternatePath: {
    text: "別の道を探しているうちに、迷子になってしまいました。ゲームオーバーです。",
    choices: []
  }
};

// ページ読み込み後に初期シーンを表示
document.addEventListener("DOMContentLoaded", function() {
  displayNode("start");
});
