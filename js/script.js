const app = {
  allSurahs: [],
  curSurah: "",
  ayahs: [],
};

const session = {
  score: 0,
  start: false,
  end: false,
  quizDuration: 0,
  questions: [{ q: "", opt: "" }],
  correctAnswers: [],
  userAnswers: [],
  ansGottenCorrectly: [],
  quesGottenCorrectly: [],
};

let answerPickedByUser;
let answerDivPickedByUser;

const form = document.querySelector("form");
const selectForm = document.querySelector(".selectForm");

const surahSelectOptions = document.querySelector("#surahs__options");
const numOfQuestionSelectOptions = document.querySelector("#NumberOfQuestions");
const numOfQuesAnswered = document.querySelector(".num__answerd");
const totalQuestionNum = document.querySelector(".total__ques");
const progressBar = document.querySelector(".progress__bar");
const correctCount = document.querySelector(".correct__count");
const wrongCount = document.querySelector(".wrong__count");
const quizBriefSurah = document.querySelector(".quiz__brief__surah");
const quizBriefQuesNum = document.querySelector(".quiz__brief__questnum");
const quesTion = document.querySelector(".ques__ayah");
const timeDur = document.querySelector(".dur_min");
const minLabel = document.querySelector(".min__label");
const secLabel = document.querySelector(".sec__label");

const prevBtn = document.querySelector(".prev__ques__btn");
const nextBtn = document.querySelector(".next__ques__btn");
const submitBtn = document.querySelector(".submit__btn");
const restartBtn = document.querySelector(".restart__btn");
const newQuizBtn = document.querySelector(".new__quiz__btn");
const authBtn = document.querySelector('.auth__btn');

const quizNavigator = document.querySelector(".navigator");
const errorText = document.querySelector(".error__text");

const startPage = document.querySelector(".start__page");
const quizPage = document.querySelector(".quiz__page");
const resultPage = document.querySelector(".result__page");
const gradeSummary = document.querySelector(".grade__summary");
const questionOptionsContainer = document.querySelector(".options");
const questionReviewContainer = document.querySelector(".question__review__container");

//MODEL - HTTPS LIBRARY 

async function allTheSurahs() {
  try {
    let data = await fetch(
      "https://api.qurani.ai/gw/qh/v1/surah?limit=2000&offset=0",
    );
    let res = await data.json();
    app.allSurahs = res.data.map((surah) => `${surah.englishName}`);
    addAllSurahToSelectOption(app.allSurahs);
    form.querySelector("button").disabled = false;
  } catch (e) {
    console.error(e.message, "while fetching all surahs");
    errorText.classList.remove("hidden");
    errorText.innerHTML = `${e.message}  <i class="uil uil-exclamation-triangle"></i>`;
  }
}

allTheSurahs();

let CurNum = 1;
let numOfQuestionsSelected;

async function getQuranFromAPI(indexOfSurah) {
  try {
    renderSpimner(questionOptionsContainer);
    let res = await fetch(
      `https://api.qurani.ai/gw/qh/v1/surah/${indexOfSurah}/quran-uthmani?limit=2000&offset=0`,
    );

    let chapter = await res.json();
    // app.curSurah = chapter.data.englishName;
    chapter.data.ayahs.forEach((ayah) => {
      app.ayahs.push(ayah.text);
    });

    setRandomQuestions(numOfQuestionsSelected);
    startQuiz();
  } catch (e) {
    console.error(e.message, "while fetching all ayah");

    errorText.classList.remove("hidden");
    errorText.innerHTML = 'Connect to Internet <i class="uil uil-wifi"></i>';
  }
}

// getQuranFromAPI();

function renderSpimner(parentEl) {
  const markup = `<svg class="spinner">
        <use href="./images/icons.svg#icon-spinner" ></use>
      </svg>
      `;
  parentEl.innerHTML = "";
  parentEl.insertAdjacentHTML("afterbegin", markup);
}





function rndNumber(max, min = 1) {
  return Math.floor(Math.random() * (max - min) + min);
}




function addAllSurahToSelectOption(allSurahs) {
  allSurahs.forEach((surah) => {
    const html = `<option value="${surah}">${surah}</option>`;
    surahSelectOptions.insertAdjacentHTML("beforeend", html);
  });
}

function changeTheme(isDark) {
  console.log(isDark)
let theme = isDark ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', theme )
}

const themeInput = document.querySelector('.themeInput');
const box = document.querySelector('.box');
let isDark = false;

themeInput.addEventListener('input', ()=>{
  
  box.classList.toggle('shift')
  isDark= !isDark;
  changeTheme(isDark)
})

// BUSINESS LOGIC

form.addEventListener("submit", (e) => {
  e.preventDefault();
  form.querySelector("button").disabled = true;

  startPage.classList.add("hidden");
  quizPage.classList.remove("hidden");

  document.querySelector(".quiz__tittle").innerHTML =
    `Surah ${surahSelectOptions.value}`;
  numOfQuestionsSelected = +numOfQuestionSelectOptions.value;

  app.curSurah = surahSelectOptions.value;
  session.quizDuration = timeDur.innerHTML;

  let indexOfSurah = app.allSurahs.findIndex((s) => s === app.curSurah) + 1;
  getQuranFromAPI(indexOfSurah);
  storeDataToLocalStorage();
});

function startQuiz() {
  render(CurNum - 1);
  session.start = true;
  unDisableBtns([submitBtn, nextBtn, prevBtn]);
  counter(session.quizDuration);
  updateProgress();
}



function submitQuiz() {
  updateScore();
  session.end = true;
  storeDataToLocalStorage();
  quizPage.classList.add("hidden");
  resultPage.classList.remove("hidden");
  calcResult();
  updateResultPageBrief();
  addQuestionReview(session.correctAnswers);
  showNotification(app.curSurah, session.score, session.questions.length);

}

function PrevQuestion() {
  if (CurNum === 1) return;
  if (CurNum === 2) prevBtn.classList.add("btn__disabled");
  nextBtn.classList.remove("btn__disabled");
  CurNum--;
  questionOptionsContainer.innerHTML = "";

  updateProgress(CurNum);
  render(CurNum - 1);
  displayNavBtn();
  storeDataToLocalStorage();

  const alreadyPickedAnswer = session.userAnswers[CurNum - 1];

  if (!alreadyPickedAnswer) return;

  addIndicatorToAnswerdQues(alreadyPickedAnswer);
}

function NextQuestion() {
  // if (!alreadyPickedAnswer) {
  if (CurNum === +session.questions.length) return;
  if (CurNum === +session.questions.length - 1)
    nextBtn.classList.add("btn__disabled");
  answerPickedByUser = "";
  answerDivPickedByUser = "";
  updateScore();
  CurNum++;
  prevBtn.classList.remove("btn__disabled");
  updateProgress(CurNum);
  questionOptionsContainer.innerHTML = "";
  render(CurNum - 1);
  displayNavBtn();
  storeDataToLocalStorage('curSession', session);
  storeDataToLocalStorage('appData', app);
  // }

  const alreadyPickedAnswer = session.userAnswers[CurNum - 1];

  if (!alreadyPickedAnswer) return;

  addIndicatorToAnswerdQues(alreadyPickedAnswer);
}

function updateProgress(curQuesNum = 1) {
  numOfQuesAnswered.innerHTML = curQuesNum;
  const totalQues = +session.totalQuestionsNum;
  let progressPercentage = (curQuesNum / totalQues) * 100;
  progressBar.style.width = `${progressPercentage}%`;
}

function updateScore() {
  session.score = getAnswerGotten();
}

function updateResultPageBrief() {
  quizBriefSurah.innerHTML = `Surah ${app.curSurah}`;
  quizBriefQuesNum.innerHTML = `${session.questions.length} questions`;
  
  const result = {
    score: app.curSurah,
    numOfQuizQues: session.questions.length,
    time: Date.now()
  }
  quizResults[quizResults.length] = result
  storeDataToLocalStorage('quizResults', quizResults)
}

function calcResult() {
  correctCount.innerHTML = session.ansGottenCorrectly.length;
  wrongCount.innerHTML = session.questions.length - correctCount.innerHTML;
  
  const percentCount = document.querySelector(".percent__count");
  let resultPercent = Math.round(
    (session.score / session.questions.length) * 100,
  );
  percentCount.innerHTML = `${resultPercent}%`;
  const quizSummaryCont = document.querySelector(".quiz__summary");
  switch (session.end) {
    case resultPercent >= 70:
      gradeSummary.innerHTML = "Excellent";
      break;
    case resultPercent <= 70 && resultPercent >= 50:
      gradeSummary.innerHTML = "Fair";
      quizSummaryCont.classList.add("fair__background");
      break;
      
    case resultPercent >= 30 && resultPercent <= 50:
      gradeSummary.innerHTML = "Poor";
      quizSummaryCont.classList.add("poor__background");
      
      break;
      
    case resultPercent >= 0 && resultPercent <= 30:
      gradeSummary.innerHTML = "Very Poor";
      quizSummaryCont.classList.add("poor__background");
      
      break;
  }
}


// APPLICATION LOGIC


quizNavigator.addEventListener("click", (e) => {
  if (
    e.target.classList.contains("next__ques__btn") ||
    e.target.classList.contains("uil-arrow-right")
  ) {
    if (!answerDivPickedByUser && session.userAnswers[CurNum - 1] === null) {
      session.userAnswers[CurNum - 1] = null;
    }
    NextQuestion();
  }

  if (
    e.target.classList.contains("prev__ques__btn") ||
    e.target.classList.contains("uil-arrow-left")
  )
    PrevQuestion();
});

submitBtn.addEventListener("click", () => {
  if (!answerDivPickedByUser && session.userAnswers[CurNum - 1] === null) {
    session.userAnswers[CurNum - 1] = null;
  }
  submitQuiz();
});

function displayNavBtn() {
  if (CurNum > 1 && CurNum < +session.questions.length) {
    prevBtn.classList.remove("invisible");
    nextBtn.classList.remove("hidden");
  }
}


function addIndicatorToAnswerdQues(answer) {
  questionOptionsContainer.childNodes.forEach((opt) => {
    if (opt.querySelector("span").innerHTML === answer) {
      addCorrectIndicator(opt);
    }
  });
}

function setRandomQuestions(numOfQues) {
  let questiions = [];
  // 1. GET all the number possible questions from the array of all ayahs
  const possibleQuestions = app.ayahs.slice(0, -1);

  // 2. check if all the possible question matches the number of questions given
  const maxQuestions = possibleQuestions.length;
  const actualNumOfQues = Math.min(maxQuestions, numOfQues);
  // 3. Shuffle the array of ayahs
  shuffleArray(possibleQuestions);
  // 4. slice from the ayah array, beginning from 0 and stopping at the number of possible questions
  questiions = possibleQuestions.slice(0, actualNumOfQues);
  console.log(questiions);

  questiions.forEach((q, i) => {
    session.questions[i] = { q: q };
  });

  session.questions.forEach((ques, i) => {
    getCorrectAnswer(ques.q, i);
    setOptions(i);
  });

  session.totalQuestionsNum = session.questions.length;
} //what this function does is that: it get random questions and stores it inside the session.questions array

function getCorrectAnswer(ques, index) {
  console.log(ques, index)
  const indexOfAnswer = app.ayahs.indexOf(ques) + 1;
  let correctAnswer = app.ayahs[indexOfAnswer];
  session.questions[index].ans = indexOfAnswer;

  session.correctAnswers.push(correctAnswer);
}

const MAX_OPT_NUM = 4;

function setOptions(quesNum) {
  let options = [];
  const curQues = session.questions[quesNum].q;
  const curAns = session.correctAnswers[quesNum];

  let i = 0;
  let availableOpt = app.ayahs.filter((a) => a !== curQues && a !== curAns);
  do {
    let rd = rndNumber(availableOpt.length);
    options[i] = availableOpt[rd];
    availableOpt = availableOpt.filter((a) => a !== options[i]);
    i++;
  } while (options[i] !== session.questions[quesNum] && i < MAX_OPT_NUM - 1);

  options = [curAns, ...options];
  shuffleArray(options);
  session.questions[quesNum].opt = options;
}

function renderQuestion(curQuesNum) {
  if (!session.questions[curQuesNum]) return;
  let curQues = session.questions[curQuesNum].q;
  quesTion.innerHTML = curQues;
}



questionOptionsContainer.addEventListener("click", (e) => {
  if (e.target.classList.contains("option__div") || e.target.matches("span")) {
    getUserAnswer(e);
  }
});

function renderOptions(curQuesNum, optionText = ["A", "B", "C", "D"]) {
  if (!session.questions[curQuesNum]) return;
  let curQuesOpts = session.questions[curQuesNum].opt;
  curQuesOpts.forEach((opt, i) => {
    if (!opt) return;
    const optionDiv = document.createElement("div");
    optionDiv.className = "option__div";
    optionDiv.innerHTML = `
   <span>${curQuesOpts[i]}</span>`;
    questionOptionsContainer.append(optionDiv);
  });
}

function render(curQuesNum) {
  totalQuestionNum.innerHTML = session.questions.length;
  questionOptionsContainer.innerHTML = "";
  renderQuestion(curQuesNum);
  renderOptions(curQuesNum);
}

function addCorrectIndicator(answerPickedByUser) {
  // parmater required is the div of the answeypicked by user

  const allOptionDivs = document.querySelectorAll(".option__div");

  allOptionDivs.forEach((opt) => {
    opt.classList.remove("answer__picked__indicator");
  });

  answerPickedByUser.classList.add("answer__picked__indicator");
}

function getUserAnswer(e) {
  answerDivPickedByUser = e.target.closest(".option__div");

  answerPickedByUser = answerDivPickedByUser.querySelector("span").innerHTML;
  session.userAnswers[CurNum - 1] = answerPickedByUser;
  addCorrectIndicator(answerDivPickedByUser);
}

function getAnswerGotten() {
  session.ansGottenCorrectly = session.correctAnswers.filter(
    (a, i) => a === session.userAnswers[i],
  );
  return session.ansGottenCorrectly.length;
}



restartBtn.addEventListener("click", () => {
  CurNum = 1;
  updateProgress(CurNum);
  shuffleArray(session.questions);
  questionReviewContainer.innerHTML = "";
  render(CurNum - 1);
  counter(session.quizDuration);
  session.userAnswers = [];
  session.score = 0;
  session.start = true;
  session.end = false;
  nextBtn.classList.remove("btn__disabled");
  quizPage.classList.remove("hidden");
resultPage.classList.add("hidden");
});

newQuizBtn.addEventListener("click", () => {
  location.reload();
  addAllSurahToSelectOption(app.allSurahs);
});



document.querySelector(".incr__dura").addEventListener("click", (e) => {
  if (+timeDur.innerHTML === 20) return;
  timeDur.innerHTML = +timeDur.innerHTML + 5;
});

document.querySelector(".decr__dura").addEventListener("click", (e) => {
  if (+timeDur.innerHTML === 5) return;
  timeDur.innerHTML = +timeDur.innerHTML - 5;
});


function counter(quizMinute) {
  let totalQuizMunite = +quizMinute;

  let totalSeconds = totalQuizMunite * 60;

  let min;
  let sec;

  const timer = setInterval(() => {
    totalSeconds--;

    min = Math.floor(totalSeconds / 60);
    sec = totalSeconds % 60;

    minLabel.innerHTML = `${min}`.padStart(2, 0);
    secLabel.innerHTML = `${sec}`.padStart(2, 0);

    if (totalSeconds === 0) {
      clearInterval(timer);
      submitQuiz();
    }
    if (session.end) clearInterval(timer);
  }, 1000);
}

setInterval(() => {
  storeDataToLocalStorage('curSession', session);
}, 10000);

function addQuestionReview(questions) {
  questions.forEach((ques, i) => {
    let quesStatus;
    if (!session.userAnswers[i]) quesStatus = "skipped";
    if (ques === session.userAnswers[i]) quesStatus = "correct";
    if (session.userAnswers[i] && ques !== session.userAnswers[i])
      quesStatus = "wrong";

    const html = `
        <div class="question__review ${quesStatus}__answer">
              <div class="review__top">
                <h3>Question ${i + 1}</h3>
                <svg class='chevron' width='24', height='24px'>
              <use href="./images/icons.svg#icon-chevron-down"></use>
            </svg>              </div>
              
              <div class="review__wrapper hidden">
                <p>Q: <span class="question">${session.questions[i].q}</span> </p>
                <p>A: <span class="answer">${session.correctAnswers[i]}</span></p> 
                <p>Your Answer: <span class="question">${!session.userAnswers[i] ? "No answer picked" : session.userAnswers[i]}</span> </p>
            </div>

            </div>`;

    questionReviewContainer.insertAdjacentHTML("beforeend", html);
  });
}

questionReviewContainer.addEventListener("click", (e) => {
  if (!e.target.closest(".question__review")) return;

  e.target
    .closest(".question__review")
    .querySelector(".review__wrapper")
    .classList.toggle("hidden");

  e.target
    .closest(".question__review")
    .querySelector(".chevron")
    .classList.toggle("rotate__chevron");
});

// HELPER FUNCTIONS 

function shuffleArray(arr) {
  let curIndex = arr.length;

  while (curIndex != 0) {
    const rndIndex = rndNumber(arr.length);
    curIndex--;

    [arr[curIndex], arr[rndIndex]] = [arr[rndIndex], arr[curIndex]];
  }
}


function unDisableBtns(btns) {
  btns.forEach((btn) => (btn.disabled = false));
}

function storeDataToLocalStorage(dataName, data) {
  localStorage.setItem(dataName, JSON.stringify(data));
}

function getDataFromLocalStorage(dataName) {
  return JSON.parse(localStorage.getItem(dataName));
}

// KEYBOARD EVENT TO CONTROL QUIZ

document.addEventListener("keydown", (e) => {
  if (e.key.toLowerCase() === "n" || e.key === "ArrowRight") {
    NextQuestion();
  }

  if (e.key.toLowerCase() === "p" || e.key === "ArrowLeft") {
    PrevQuestion();
  }

  if (e.key.toLowerCase() === "s") {
    submitQuiz();
  }
});



let quizResults  = [
  {}
]

window.addEventListener('load',() => {
  quizResults = getDataFromLocalStorage('quizResults') || [];
  
  
//   supabaseClient.auth.onAuthStateChange((e, session) => {
//     console.log(e)
// if (!session) {
    
//     window.location.replace('/auth.html')
//     console.log(authBtn.closest('h4').querySelector('use'))
  
//   }
// })
})

async function checkLogInStatus() {
 const session = await supabaseClient.auth.getSession()
 console.log(session.data)
 if(session.data.session){
  authBtn.innerHTML = 'Logout';
 }
}

checkLogInStatus()

async function signOut() {
const session1 = await supabaseClient.auth.getSession();
console.log(session1);
 await supabaseClient.auth.signOut();
 const session = await supabaseClient.auth.getSession();
 console.log(session);
}

authBtn.addEventListener('click', (e)=>{
  if (e.target.closest('h4').querySelector('.auth__btn').innerHTML !== 'Logout') window.location.replace('/auth.html')
  if (e.target.closest('h4').querySelector('.auth__btn').innerHTML !== 'Logout') return
  e.preventDefault()

  signOut()
  supabaseClient.auth.onAuthStateChange((e, session) => {
    console.log(e)
if (e ==='SIGNED_OUT') {
    authBtn.innerHTML = 'Login / SignUp';
    window.location.replace('/auth.html')
    console.log(authBtn.closest('h4').querySelector('use'))
    authBtn.closest('h4').querySelector('use').href = '/images/icons.svg#icon-logout'
  }
 })
})


// if ("serviceWorker" in navigator) {
//   navigator.serviceWorker.register("/js/sw.js");
// }

async function showNotification(surah, score, totalQues) {
  try {
    if (!('Notification' in window)) {
      alert("This browser doesn't support notifications");
      throw new Error('Notification not available');
      return
    }
    
    const permission = await Notification.requestPermission();
    
    if (permission === 'granted') {
      const notification = new Notification('Quiz Completed', {
        body: `Congratulations, you have just completed a quiz of: ${surah}, Your score is: ${score}/${totalQues}`,
        icon: '/images/book-open.svg', 
        tag: 'quiz-completion'
      })
    }
    
    if (permission === 'denied') throw new Error('Notification not allowed')
  } catch (e) {
    alert(e.message)
  }
}

// window.addEventListener('load', ()=>{
//   document.documentElement.setAttribute('data-theme', 'dark')
// })