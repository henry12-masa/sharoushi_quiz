const params = new URLSearchParams(location.search);
const type = params.get("type") || "roukihou";

const quizInfo = {
  roukihou: {
    title: "労働基準法",
    desc: "労働条件・労働時間・休日・賃金"
  },
  anzen: {
    title: "労働安全衛生法",
    desc: "安全管理・衛生管理・健康診断"
  },
  rousai: {
    title: "労災保険法",
    desc: "業務災害・通勤災害・給付"
  },
  koyou: {
    title: "雇用保険法",
    desc: "基本手当・被保険者・給付"
  },
  kenpo: {
    title: "健康保険法",
    desc: "被保険者・保険給付・傷病手当金"
  },
  kousei: {
    title: "厚生年金保険法",
    desc: "老齢厚生年金・障害厚生年金・遺族厚生年金"
  },
  kokunen: {
    title: "国民年金法",
    desc: "基礎年金・保険料・免除"
  },
  practice: {
    title: "総合演習",
    desc: "社会保険労務士試験の総合問題"
  }
};

const info = quizInfo[type] || quizInfo.roukihou;

document.title = info.title;
document.getElementById("pageTitle").textContent = info.title;
document.getElementById("pageDesc").textContent = info.desc;

document.getElementById("quizList").innerHTML = Object.keys(quizInfo).map(key => `
  <a href="?type=${key}" class="${key === type ? "active" : ""}">
    ${quizInfo[key].title}
  </a>
`).join("");

function normalizeQuestion(q) {
  return {
    question: q.question || q.q,
    choices: q.choices || q.c,
    answer: q.answer || q.a,
    explanation: q.explanation || q.e || ""
  };
}

function shuffle(array) {
  return [...array].sort(() => Math.random() - 0.5);
}

const rawQuestions = window.quizData[type] || window.quizData.roukihou || [];
let questions = shuffle(rawQuestions.map(normalizeQuestion)).slice(0, 50);

let current = 0;
let score = 0;
let answered = false;

const counter = document.getElementById("counter");
const scoreEl = document.getElementById("score");
const questionEl = document.getElementById("question");
const choicesEl = document.getElementById("choices");
const resultEl = document.getElementById("result");
const progressBar = document.getElementById("progressBar");

function showQuestion() {
  if (questions.length === 0) {
    counter.textContent = "0 / 0";
    questionEl.textContent = "問題データが読み込めません";
    choicesEl.innerHTML = "";
    resultEl.textContent = `window.quizData.${type} がありません`;
    return;
  }

  if (current >= questions.length) {
    finishQuiz();
    return;
  }

  answered = false;
  const q = questions[current];

  counter.textContent = `${current + 1} / ${questions.length}`;
  scoreEl.textContent = `スコア: ${score}`;
  questionEl.textContent = q.question;
  resultEl.textContent = "";
  progressBar.style.width = `${(current / questions.length) * 100}%`;

  choicesEl.innerHTML = "";

  shuffle(q.choices).forEach(choice => {
    const button = document.createElement("button");
    button.textContent = choice;
    button.onclick = () => checkAnswer(button, choice);
    choicesEl.appendChild(button);
  });
}

function checkAnswer(button, choice) {
  if (answered) return;
  answered = true;

  const q = questions[current];

  document.querySelectorAll("#choices button").forEach(btn => {
    btn.disabled = true;
    if (btn.textContent === q.answer) {
      btn.classList.add("correct");
    }
  });

  if (choice === q.answer) {
    score++;
    button.classList.add("correct");
    resultEl.textContent = q.explanation ? `正解！ ${q.explanation}` : "正解！";
  } else {
    button.classList.add("wrong");
    resultEl.textContent = q.explanation
      ? `不正解！ 正解は「${q.answer}」 ${q.explanation}`
      : `不正解！ 正解は「${q.answer}」`;
  }

  scoreEl.textContent = `スコア: ${score}`;

  setTimeout(() => {
    current++;
    showQuestion();
  }, 1700);
}

function finishQuiz() {
  counter.textContent = "終了";
  progressBar.style.width = "100%";
  questionEl.textContent = "結果発表";

  choicesEl.innerHTML = `
    <div class="finish">
      <p>${questions.length}問中 ${score}問正解！</p>
      <button onclick="location.reload()">もう一度挑戦</button>
      <a class="home-btn" href="./">ジャンル選択へ戻る</a>
    </div>
  `;

  resultEl.textContent = "";
}

showQuestion();