let quizData = null;
let username = "";
let selectedCategory = "";
let current = 0;
let score = 0;
let unanswered = 0;
let timer = null;
let timerValue = 10;
let answered = false;

const screens = {
	welcome: document.getElementById('welcome-screen'),
	quiz: document.getElementById('quiz-screen'),
	result: document.getElementById('result-screen')
};
const progressBar = document.getElementById('progress-bar');
const timerSpan = document.getElementById('timer');
const questionArea = document.getElementById('question-area');
const answersList = document.getElementById('answers-list');
const nextQuestionBtn = document.getElementById('next-question');
const skipQuestionBtn = document.getElementById('skip-question');
const scoreDetails = document.getElementById('score-details');
const scoreMessage = document.getElementById('score-message');

fetch('questions.json')
	.then(response => response.json())
	.then(data => {
		quizData = data;
		setupCategorySelection();
	})
	.catch(e => console.error("Failed to load quiz data:", e));

function setupCategorySelection() {
	const categoryListDiv = document.getElementById('category-list');
	categoryListDiv.innerHTML = '';
	quizData.categories.forEach(cat => {
		const label = document.createElement('label');
		label.innerHTML = `<input type="radio" name="category" value="${cat.id}"><span>${cat.name}</span>`;
		categoryListDiv.appendChild(label);
	});
	validateForm();
}

// Enable Start button only if name and category chosen
function validateForm() {
	const usernameInput = document.getElementById('username');
	const startBtn = document.querySelector('button[type=submit]');
	const catChecked = document.querySelector('input[name=category]:checked');
	startBtn.disabled = !(usernameInput.value.trim() && catChecked);
}

document.getElementById('username').addEventListener('input', validateForm);
document.getElementById('category-list').addEventListener('change', validateForm);

function showScreen(name) {
	Object.values(screens).forEach(s => s.style.display = 'none');
	screens[name].style.display = 'block';
}

// Start quiz
document.getElementById('start-form').onsubmit = e => {
	e.preventDefault();
	const rulesModal = document.getElementById('rules-modal');
	const overlay = document.getElementById('overlay');
	overlay.style.display = 'block';
	rulesModal.style.display = 'block';
  
	username = document.getElementById('username').value.trim();
	selectedCategory = document.querySelector('input[name=category]:checked').value;
  
	document.getElementById('close-rules').onclick = () => {
	  
	  overlay.style.display = 'none';
	  rulesModal.style.display = 'none';
  
	  current = 0;
	  score = 0;
	  unanswered = 0;
	  loadQuestion();
	  showScreen('quiz');
	};
  };

function loadQuestion() {
	timerValue = 10;
	answered = false;
	nextQuestionBtn.disabled = true;

	const category = quizData.categories.find(c => c.id === selectedCategory);
	const q = category.questions[current];

	progressBar.innerHTML = `<span class="current-question">${current + 1}</span> / <span class="total-questions">${category.questions.length}</span>`;
	timerSpan.textContent = `0:${timerValue < 10 ? '0' : ''}${timerValue}`;

	questionArea.textContent = q.question;
	answersList.innerHTML = '';

	q.options.forEach((opt, idx) => {
		// Create a label with a radio input for each option
		const label = document.createElement('label');
		label.setAttribute('class', 'radio-label');
		const radio = document.createElement('input');
		radio.type = 'radio';
		radio.name = 'answer';
		radio.value = idx;
		radio.disabled = answered;
		radio.onclick = () => selectAnswer(idx);
		label.appendChild(radio);
		label.appendChild(document.createTextNode(opt));
		answersList.appendChild(label);
	});

	clearInterval(timer);
	timer = setInterval(() => {
		timerValue--;
		timerSpan.textContent = `0:${timerValue < 10 ? '0' : ''}${timerValue}`;
		if (timerValue <= 0) {
			clearInterval(timer);
			if (!answered) {
				answered = true;
				if (current + 1 < category.questions.length) {
					current++;
					loadQuestion();
				} else {
					showResult();
				}
			}
		}
	}, 1000);
}


function selectAnswer(idx) {
    if (answered) return;
    answered = true;
    clearInterval(timer);

    const category = quizData.categories.find(c => c.id === selectedCategory);
    const q = category.questions[current];
    const correctIndex = q.correctAnswer.charCodeAt(0) - 65;

    // Add scoring here:
    if (idx === correctIndex) {
        score++;
    }

    const labels = answersList.querySelectorAll('label');
    labels.forEach((label, i) => {
        label.classList.remove('answer-correct', 'answer-incorrect');
        if (i === idx) {
            label.classList.add(idx === correctIndex ? 'answer-correct' : 'answer-incorrect');
        }
        label.querySelector('input[type="radio"]').disabled = true;
    });
    nextQuestionBtn.disabled = false;
}

  

function highlightCorrectAnswer() {
	const category = quizData.categories.find(c => c.id === selectedCategory);
	const q = category.questions[current];
	const correctIndex = q.correctAnswer.charCodeAt(0) - 65;
	const btns = answersList.querySelectorAll('button');
	btns.forEach((btn, i) => {
		btn.disabled = true;
		if (i === correctIndex) btn.classList.add('correct');
	});
}

nextQuestionBtn.onclick = () => {
	const category = quizData.categories.find(c => c.id === selectedCategory);
	if (current + 1 < category.questions.length) {
		current++;
		loadQuestion();
	} else {
		showResult();
	}
};

skipQuestionBtn.onclick = () => {

    if (answered) return;
    clearInterval(timer);
    unanswered++;
    answered = true;
    const category = quizData.categories.find(c => c.id === selectedCategory);
    if (current + 1 < category.questions.length) {
        current++;
        loadQuestion();
    } else {
        showResult();
    }
};




nextQuestionBtn.onclick = () => {
	const category = quizData.categories.find(c => c.id === selectedCategory);
	if (current + 1 < category.questions.length) {
		current++;
		loadQuestion();
	} else {
		showResult();
	}
};

function showResult() {
	showScreen('result');
	const category = quizData.categories.find(c => c.id === selectedCategory);
	const percent = Math.round((score / category.questions.length) * 100);
	let message = "Great job!";
	if (percent < 60) message = "Keep practicing!";
	else if (percent < 80) message = "Well done!";
	scoreDetails.textContent = `Correct: ${score}, Unanswered: ${unanswered}, Total: ${category.questions.length}`;
	scoreMessage.textContent = message;
}

const showRulesBtn = document.getElementById('show-rules');
const rulesModal = document.getElementById('rules-modal');
const overlay = document.getElementById('overlay');
const closeRulesBtn = document.getElementById('close-rules');

showRulesBtn.onclick = function (e) {
	e.preventDefault();
	overlay.style.display = 'block';
	rulesModal.style.display = 'block';
};

closeRulesBtn.onclick = function () {
	overlay.style.display = 'none';
	rulesModal.style.display = 'none';
};

