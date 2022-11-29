"use strict";

//  Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyBb8rsPI_kzh35YH8OJCHN9lMipuTk-AK8",
  authDomain: "trivia-quiz-application.firebaseapp.com",
  projectId: "trivia-quiz-application",
  storageBucket: "trivia-quiz-application.appspot.com",
  messagingSenderId: "479969580649",
  appId: "1:479969580649:web:37923465ac979d04bbb4f8",
  measurementId: "G-NT36BY3J85",
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

//selecting all required elements
const input = document.getElementById("input");
const submit = document.getElementById("submit");
const container = document.querySelector(".container");
const quizBox = document.querySelector(".quiz-box");
const question = document.querySelector(".que_text");
const options_List = document.querySelector(".option_list");
const timerSec = document.getElementById("counter");
const timeLine = document.querySelector(".time_line");
const textWrapper = document.querySelector(".ml6 .letters ");
const nextBtnEl = document.querySelector(".next_btn");
const timeOffEl = document.querySelector(".time-off");
const scoreEl = document.getElementById("score");
const dashboardEl = document.getElementById("dashboard-container");
const playerDashboardName = document.getElementById("player-name");
const playerDashboardScore = document.getElementById("player-score");
const restartBtn = document.getElementById("restart-game");
const scoreBoardBtn = document.querySelectorAll(".dashboard");

//Global Variables Declarations
let index = 0;
let correctAnswer;
let playerName;
let startGame = false;
let score = 0;
let tickIconTag = '<div class="icon tick"><i class="fas fa-check"></i></div>';
let crossIconTag = '<div class="icon cross"><i class="fas fa-times"></i></div>';
let counter;
let counterLine;

//All App Functions

//1-Fetch the data from the API function
const getQuiz = async () => {
  const url = "https://opentdb.com/api.php?amount=20&difficulty=medium";
  const res = await fetch(url);
  const data = await res.json();
  const quiz = data.results;

  question.textContent = quiz[index].question.replace(
    /&#039|&|&quot|quot|;/g,
    " "
  );

  correctAnswer = quiz[index].correct_answer;
  const incorrectAnswers = quiz[index].incorrect_answers;
  const optionsArray = incorrectAnswers.concat(correctAnswer);

  let correctAnswerIndex = optionsArray.indexOf(correctAnswer);
  let randomNumber = Math.trunc(Math.random() * optionsArray.length);
  swapPositions(optionsArray, correctAnswerIndex, randomNumber);

  options_List.innerHTML = `${optionsArray
    .map((el) => {
      return `<div class="option" id=${el}>${el}</div>`;
    })
    .join("")} `;

  container.innerHTML = quizBox.innerHTML;
  quizBox.style.display = "block";

  const nextBtnEl = document.querySelector(".next_btn");

  nextBtnEl.addEventListener("click", () => {
    if (startGame) {
      index++;
      getQuiz();
    } else return;
  });

  startGame = true;
  const option = document.querySelectorAll(".option");
  for (let i = 0; i < option.length; i++) {
    option[i].addEventListener("click", () => optionSelected(option[i]));
  }
};

//2-Option Selection Function
function optionSelected(answer) {
  let userAnswer = answer.textContent;
  const option_list = document.querySelector(".option_list");

  const allOptions = option_list.children.length;
  if (userAnswer === correctAnswer) {
    //if user selected option is equal to correct answer
    answer.classList.add("correct");
    answer.insertAdjacentHTML("beforeend", tickIconTag);
    score += 1;
  } else {
    answer.classList.add("incorrect");
    answer.insertAdjacentHTML("beforeend", crossIconTag);
    console.log("Wrong Answer");
    for (let i = 0; i < allOptions; i++) {
      if (option_list.children[i].textContent === correctAnswer) {
        //if there is an option which is matched to correct answer
        option_list.children[i].setAttribute("class", "option correct");
        option_list.children[i].insertAdjacentHTML("beforeend", tickIconTag);
        console.log("Auto selected correct answer.");
      }
    }
  }
  for (let i = 0; i < allOptions; i++) {
    option_list.children[i].classList.add("disabled");
  }
  setTimeout(getQuiz, 300);
}

//3-Start Timer Function
function startTimer(time) {
  counter = setInterval(timer, 1000);
  async function timer() {
    const timerSec = document.getElementById("counter");
    timerSec.textContent = time;
    time--;
    if (time < 9) {
      let addZero = timerSec.textContent;
      timerSec.textContent = "0" + addZero;
    }
    if (time < 0) {
      clearInterval(counter);
      startGame = false;
      const timeText = document.querySelector(".time_left_txt");
      timeText.textContent = "Time Over";
      const option_list = document.querySelector(".option_list");
      const allOptions = option_list.children.length;
      for (let i = 0; i < allOptions.length; i++) {
        if (option_list.children[i].textContent === correctAnswer) {
          option_list.children[i].setAttribute("class", "option correct");
          option_list.children[i].insertAdjacentHTML("beforeend", tickIconTag);
        }
      }
      for (let i = 0; i < allOptions; i++) {
        option_list.children[i].classList.add("disabled");
      }
      const nextBtnEl = document.querySelector(".next_btn");
      nextBtnEl.classList.add("hidden");

      const timeOffEl = document.querySelector(".time-off");
      timeOffEl.classList.add("show");
      quizBox.style.display = "none";
      scoreEl.textContent = score;
      await db.collection("scores").add({
        name: playerName,
        score: score,
      });
    }
  }
}

//4-Time Line Control Function
function TimeLineControl(time) {
  counterLine = setInterval(timer, 150);
  function timer() {
    time += 1;
    const timeLine = document.querySelector(".time_line");
    timeLine.style.width = time + "px";
    if (time > (container.offsetWidth / 4) * 3) {
      timeLine.style.backgroundColor = "red";
    }
    if (time > container.offsetWidth - 2) {
      clearInterval(counterLine);
    }
  }
}

//5- Save Scores To Firebase Database

async function saveScores() {
  await db.collection("scores").get();
}

//6-Options Array Swap Positions Function

function swapPositions(array, a, b) {
  [array[a], array[b]] = [array[b], array[a]];
}

//Render Scores Function

async function renderScores() {
  const playerScore = await db.collection("scores").get();
  const currentPlayer = playerScore.docs;
  const timeOffEl = document.querySelector(".time-off");
  timeOffEl.classList.remove("show");
  container.style.justifyContent = "flex-start";
  container.style.alignItems = "start";

  container.innerHTML = `  <div id="dashboard-container" class="show">
  <div class=list-title>Score Board </div>
  <table id="score-list">
  <th>Rank</th>
    <th>Player Name</th>
    <th>Player Score</th>
  </tr>
  
  </table>
  <button class='btn quit-btn' id="back"> Quit </button>

  </div>`;

  const backBtn = document.getElementById("back");
  const scoreList = document.getElementById("score-list");

  backBtn.addEventListener("click", () => location.reload());
  const arr = [];
  currentPlayer.map((score) => {
    arr.push(score.data());
  });
  arr.sort((a, b) => {
    a.score - b.score;
  });
  console.log(
    "sort:",
    arr.sort((a, b) => {
      return b.score - a.score;
    })
  );

  arr.splice(10);
  arr.sort((a, b) => {
    a.score - b.score;
  });
  let rank = 1;
  arr.forEach((el) => {
    scoreList.innerHTML += `
    <tr>
    <td class="list-rank-el">${rank}.</td> 
    <td class="list-name-el">${el.name.toUpperCase()}</td> 
    <td class="list-score-el">${el.score}</td> 
    </tr>
    `;
    rank++;
  });
}

//First Page Animation element

textWrapper.innerHTML = textWrapper.textContent.replace(
  /\S/g,
  "<span class='letter'>$&</span>"
);

anime
  .timeline({ loop: false })
  .add({
    targets: ".ml6 .letter  ",
    translateY: ["1.1em", 0],
    translateZ: 0,
    opacity: 1,
    duration: 750,
    delay: (el, i) => 50 * i,
  })
  .add({
    targets: ".ml6 ",
    opacity: 1,
    duration: 1000,
    easing: "easeOutExpo",
    delay: 1000,
  });

anime.timeline({ loop: false }).add({
  targets: "input ",
  opacity: 1,
  duration: 1000,
  scale: [0, 2],
  easing: "easeOutExpo",
  delay: 4000,
});

//Add Name Handler and Check

submit.addEventListener("click", () => {
  playerName = input.value;

  if (playerName.trim() === "") {
    alert("enter name");
  } else {
    container.innerHTML = ` 
<div class="welcome-header">Welcome <span class="welcome-name"> ${playerName.toUpperCase()} </span></div>
   <div class="info_box">
       <div class="info-title"><span>Some Rules of this Quiz</span></div>
       <div class="info-list">
           <div class="info">1. You will have only <span>120 seconds</span> to answer as much questions as possible.</div>
           <div class="info">2. Once you select your answer, it can't be undone.</div>
           <div class="info">3. You can't select any option once time goes off.</div>
           <div class="info">4. You can't exit from the Quiz while you're playing.</div>
           <div class="info">5. You'll get points on the basis of your correct answers.</div>
           <div class="info">6. You need to be on top <span>10</span> to be added to the Score board list .</div>
                  
       </div>
       <h2>Enjoy Your Game</h2> 
       <div class="buttons">
       <button class='btn' id="start-game">Start Game</button>
       </div>
   </div>`;
  }
  //Start Button Handler
  const start = document.getElementById("start-game");
  start.addEventListener("click", async () => {
    startGame = true;
    await getQuiz();
    startTimer(120);
    TimeLineControl(0);
  });
});

//Show Score board Button Handler
scoreBoardBtn.forEach((btn) => btn.addEventListener("click", renderScores));

//Restart Game Button Handler

restartBtn.addEventListener("click", () => {
  location.reload();
});
