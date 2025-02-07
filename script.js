// script.js

// ゲーム内の各シーン（ノード）を定義
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
  
  // 各文字に対してフェードインアニメーションを実現する関数
  function typeWriterSmooth(element, text, charDelay, callback) {
    element.innerHTML = "";  // 初期状態は空にする
    const spans = [];
  
    // テキストを1文字ずつ <span> 要素にラップして追加
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
        spans[i].classList.add("visible");  // CSS アニメーションが発動
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
    
    // 要素の取得
    const storyElement = document.getElementById("story");
    const choicesElement = document.getElementById("choices");
    
    // 既存の内容をクリア
    storyElement.innerHTML = "";
    choicesElement.innerHTML = "";
    
    // ストーリーテキストの表示用に段落要素を作成
    const paragraph = document.createElement("p");
    storyElement.appendChild(paragraph);
    
    // 文字送りのアニメーションでテキストを表示（文字ごとにフェードイン）
    // charDelay の値は調整可能（ここでは 50ms を指定）
    typeWriterSmooth(paragraph, node.text, 50, function() {
      // アニメーション完了後、選択肢を表示
      if (node.choices.length > 0) {
        node.choices.forEach(choice => {
          const button = document.createElement("button");
          button.textContent = choice.text;
          button.classList.add("choice-button");
          button.addEventListener("click", () => {
            displayNode(choice.next);
          });
          choicesElement.appendChild(button);
        });
      } else {
        // 選択肢がない場合（エンディング）には、再スタート用のボタンを表示
        const restartButton = document.createElement("button");
        restartButton.textContent = "再スタート";
        restartButton.classList.add("choice-button");
        restartButton.addEventListener("click", () => {
          displayNode("start");
        });
        choicesElement.appendChild(restartButton);
      }
    });
  }
  
  // ページ読み込み後に初期シーンを表示
  document.addEventListener("DOMContentLoaded", function() {
    displayNode("start");
  });
  