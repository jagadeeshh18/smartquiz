/* ═══════════════════════════════════════════════════════════
   Smart Quiz AI — app.js  (v2 — Enhanced)
   Full application logic with Gemini AI integration
═══════════════════════════════════════════════════════════ */

'use strict';

// ══════════════════════════════════════════
// STATE
// ══════════════════════════════════════════
const state = {
  apiKey:         localStorage.getItem('smartquiz_api_key') || '',
  currentTopic:   '',
  questions:      [],
  currentIndex:   0,
  answers:        [],   // { selectedIndex, correct: bool }
  score:          0,
  streak:         0,
  maxStreak:      0,
  startTime:      null,
  timerInterval:  null,
  elapsedSeconds: 0,
};

// ══════════════════════════════════════════
// DEMO DATA
// ══════════════════════════════════════════
const DEMO_DATA = {
  python: {
    topic: 'Python',
    questions: [
      {
        question: 'What is the output of `print(type([]))` in Python?',
        options: ["<class 'list'>", "<class 'array'>", "<class 'tuple'>", "<class 'dict'>"],
        correct: 0,
        explanation: "In Python, `[]` creates a list object. The `type()` function returns the class of an object. Lists are a built-in mutable sequence type, so `type([])` returns `<class 'list'>`."
      },
      {
        question: 'Which keyword is used to define a function in Python?',
        options: ['function', 'def', 'func', 'define'],
        correct: 1,
        explanation: "In Python, the keyword `def` is used to define a function. For example: `def my_function():`. This is unlike languages like JavaScript that use `function`, or C++ that just uses a return type."
      },
      {
        question: 'What does the `len()` function return for an empty dictionary `{}`?',
        options: ['None', '-1', '0', 'Error'],
        correct: 2,
        explanation: "The `len()` function returns the number of items in an object. An empty dictionary `{}` has zero key-value pairs, so `len({})` returns `0`. It does not raise an error for empty containers."
      },
      {
        question: 'Which method adds an element to the end of a Python list?',
        options: ['list.add()', 'list.push()', 'list.insert()', 'list.append()'],
        correct: 3,
        explanation: "`list.append(element)` adds an element to the end of a list. `insert()` adds at a specific index. `add()` and `push()` are not valid Python list methods."
      },
      {
        question: 'What is a Python decorator?',
        options: [
          'A function that wraps another function to extend its behavior',
          'A class that inherits from another class',
          'A special comment used for documentation',
          'A keyword for creating anonymous functions'
        ],
        correct: 0,
        explanation: "A Python decorator is a function that takes another function as an argument, adds some functionality, and returns the modified function. They use the `@decorator_name` syntax and are commonly used for logging, authentication, and caching."
      }
    ]
  },
  dsa: {
    topic: 'Data Structures & Algorithms',
    questions: [
      {
        question: 'What is the time complexity of searching in a balanced Binary Search Tree (BST)?',
        options: ['O(n)', 'O(log n)', 'O(n log n)', 'O(1)'],
        correct: 1,
        explanation: "In a balanced BST, each comparison eliminates half the remaining elements — just like binary search. This gives O(log n) for search, insertion, and deletion. An unbalanced BST can degrade to O(n)."
      },
      {
        question: 'Which data structure follows the LIFO (Last In, First Out) principle?',
        options: ['Queue', 'Linked List', 'Stack', 'Tree'],
        correct: 2,
        explanation: "A Stack follows LIFO — the last element pushed is the first popped. Think of a stack of plates. Queues use FIFO. Stacks power undo operations, function call management, and depth-first search."
      },
      {
        question: 'What is the worst-case time complexity of QuickSort?',
        options: ['O(n log n)', 'O(n²)', 'O(n)', 'O(log n)'],
        correct: 1,
        explanation: "QuickSort's worst case is O(n²), occurring when the pivot is always the smallest or largest element (e.g., already-sorted input with a naive pivot). On average it runs in O(n log n). Randomized pivot selection avoids worst cases."
      },
      {
        question: 'Which Binary Tree traversal visits nodes as: Left → Root → Right?',
        options: ['Pre-order', 'Post-order', 'Level-order', 'In-order'],
        correct: 3,
        explanation: "In-order traversal (Left → Root → Right) visits BST nodes in sorted ascending order. Pre-order is Root→Left→Right, Post-order is Left→Right→Root, and Level-order visits level-by-level (BFS)."
      },
      {
        question: 'Which data structure is used internally to implement BFS (Breadth-First Search)?',
        options: ['Stack', 'Priority Queue', 'Queue', 'Linked List'],
        correct: 2,
        explanation: "BFS uses a Queue (FIFO) to explore nodes level by level — enqueue neighbors when discovered, dequeue for processing. DFS uses a Stack (or the call stack via recursion). Priority Queue is used in Dijkstra's algorithm."
      }
    ]
  },
  oops: {
    topic: 'Object-Oriented Programming',
    questions: [
      {
        question: 'Which OOP principle hides the internal implementation details and shows only the functionality?',
        options: ['Inheritance', 'Polymorphism', 'Abstraction', 'Encapsulation'],
        correct: 2,
        explanation: "Abstraction hides the complex implementation details and exposes only the essential features of an object. It focuses on WHAT an object does rather than HOW it does it. Abstract classes and interfaces are common tools for abstraction."
      },
      {
        question: 'Which of the following best describes Encapsulation in OOP?',
        options: [
          'A class inheriting properties from another class',
          'Bundling data and methods that operate on the data within a single unit',
          'The ability of an object to take many forms',
          'Hiding the implementation of a method entirely'
        ],
        correct: 1,
        explanation: "Encapsulation bundles data (fields) and methods that operate on that data together within a class, and restricts direct external access using access modifiers (private, protected). It protects data integrity and hides internal state."
      },
      {
        question: 'What is method overriding in OOP?',
        options: [
          'Defining multiple methods with the same name but different parameters in the same class',
          'Calling a parent class method from a child class',
          'Providing a new implementation of a parent class method in a child class',
          'Preventing a method from being inherited'
        ],
        correct: 2,
        explanation: "Method overriding (Runtime Polymorphism) allows a child class to provide a specific implementation for a method already defined in the parent class. The overriding method must have the same name, return type, and parameters."
      },
      {
        question: 'Which keyword is used to prevent a class from being inherited in Java?',
        options: ['static', 'abstract', 'private', 'final'],
        correct: 3,
        explanation: "The `final` keyword in Java prevents a class from being subclassed. A `final` method cannot be overridden, and a `final` variable cannot be reassigned. In C++, the equivalent is `final` specifier; in C# it's `sealed`."
      },
      {
        question: 'In OOP, what does the SOLID principle\'s \'D\' (Dependency Inversion) state?',
        options: [
          'High-level modules should not depend on low-level modules; both should depend on abstractions',
          'A class should have only one reason to change',
          'Software entities should be open for extension but closed for modification',
          'Objects should be replaceable with instances of their subtypes'
        ],
        correct: 0,
        explanation: "Dependency Inversion Principle states: High-level modules should not depend on low-level modules — both should depend on abstractions (interfaces), not concretions. This decouples components, making the system more modular and easier to test."
      }
    ]
  },
  javascript: {
    topic: 'JavaScript',
    questions: [
      {
        question: 'What is the output of `typeof null` in JavaScript?',
        options: ['"null"', '"undefined"', '"object"', '"boolean"'],
        correct: 2,
        explanation: "`typeof null` returns `\"object\"` — this is a well-known JavaScript bug dating back to the language's first version. Null is a primitive value, but due to how type tags were implemented in the original engine, it was incorrectly tagged as an object."
      },
      {
        question: 'Which of the following correctly explains JavaScript\'s event loop?',
        options: [
          'It executes all synchronous code, then processes the callback queue when the call stack is empty',
          'It runs asynchronous operations on a separate thread and merges results immediately',
          'It pauses code execution until a Promise resolves',
          'It processes microtasks and macrotasks simultaneously'
        ],
        correct: 0,
        explanation: "JavaScript's event loop runs all synchronous code first (filling the call stack), then processes the microtask queue (Promises), and finally the macrotask/callback queue (setTimeout, setInterval) — each time the call stack is empty. JS is single-threaded."
      },
      {
        question: 'What does the `===` operator check in JavaScript?',
        options: [
          'Value equality only',
          'Reference equality for objects',
          'Value AND type equality (strict equality)',
          'Deep equality of objects'
        ],
        correct: 2,
        explanation: "`===` is the strict equality operator — it checks both value AND type without type coercion. `5 === '5'` is `false` because they differ in type. `==` performs type coercion: `5 == '5'` is `true`. Always prefer `===` to avoid unexpected behavior."
      },
      {
        question: 'What is a closure in JavaScript?',
        options: [
          'A function that has no return value',
          'A way to create private class methods',
          'A function that retains access to its outer scope\'s variables even after the outer function has returned',
          'An immediately invoked function expression (IIFE)'
        ],
        correct: 2,
        explanation: "A closure is a function that \"closes over\" its lexical scope — it retains access to variables from its enclosing scope even after that scope has finished executing. Closures enable data privacy, factory functions, and memoization patterns."
      },
      {
        question: 'What is the difference between `let`, `var`, and `const` regarding block scoping?',
        options: [
          'All three are block-scoped',
          '`var` is function-scoped; `let` and `const` are block-scoped',
          '`let` is function-scoped; `var` and `const` are block-scoped',
          '`const` is global-scoped; `let` and `var` are block-scoped'
        ],
        correct: 1,
        explanation: "`var` is function-scoped (or global if outside a function) and is hoisted to the top of its function. `let` and `const` are block-scoped (confined to the nearest `{}`). `const` additionally prevents reassignment but does not make objects immutable."
      }
    ]
  }
};

// ══════════════════════════════════════════
// DIFFICULTY LEVELS  (index 0-4 → label)
// ══════════════════════════════════════════
const DIFFICULTY = [
  { label: 'Easy',     cls: 'diff-easy'   },
  { label: 'Easy',     cls: 'diff-easy'   },
  { label: 'Medium',   cls: 'diff-medium' },
  { label: 'Hard',     cls: 'diff-hard'   },
  { label: 'Expert',   cls: 'diff-expert' },
];

const CORRECT_MSGS = ['🎉 Brilliant!', '✨ Nailed it!', '🔥 On fire!', '💡 Sharp thinking!', '🌟 Excellent!', '👏 Well done!', '⚡ Perfect!', '🎯 Spot on!'];
const WRONG_MSGS   = ['💪 Keep going!', '📚 Study this one', '🔍 Look it up', '📝 Note this down', '🧠 Learn & grow'];

// ══════════════════════════════════════════
// SCREEN MANAGEMENT
// ══════════════════════════════════════════
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const target = document.getElementById(`screen-${id}`);
  if (target) {
    target.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

// ══════════════════════════════════════════
// HOME SCREEN
// ══════════════════════════════════════════
function setTopic(topic) {
  document.getElementById('topic-input').value = topic;
  document.getElementById('topic-input').focus();
  clearError();
}

function clearError() {
  document.getElementById('input-error').textContent = '';
}

function showError(msg) {
  const el = document.getElementById('input-error');
  el.textContent = msg;
  el.style.color = 'var(--color-red)';
}

function toggleApiInput() {
  const wrapper = document.getElementById('api-input-wrapper');
  const btn     = document.getElementById('api-toggle-btn');
  const isHidden = wrapper.style.display === 'none' || wrapper.style.display === '';
  wrapper.style.display = isHidden ? 'flex' : 'none';
  btn.textContent = isHidden ? 'Hide' : 'Configure';
  if (isHidden && state.apiKey) {
    document.getElementById('api-key-input').value = state.apiKey;
  }
}

function saveApiKey() {
  const key = document.getElementById('api-key-input').value.trim();
  if (!key) { showToast('⚠️ Please enter an API key'); return; }
  state.apiKey = key;
  localStorage.setItem('smartquiz_api_key', key);
  const statusEl = document.getElementById('api-status');
  statusEl.textContent = '✅ API key saved!';
  statusEl.style.color = 'var(--color-green)';
  showToast('✅ Gemini API key saved!');
  setTimeout(() => { statusEl.textContent = ''; }, 3000);
}

// Init API key display
(function initApiStatus() {
  if (state.apiKey) {
    const el = document.getElementById('api-status');
    el.textContent = '✅ API key is configured';
    el.style.color = 'var(--color-green)';
  }
  renderHistory();
})();

// ══════════════════════════════════════════
// QUIZ HISTORY
// ══════════════════════════════════════════
function saveToHistory(topic, score, total, timeSecs) {
  const history = JSON.parse(localStorage.getItem('smartquiz_history') || '[]');
  history.unshift({
    topic,
    score,
    total,
    pct: Math.round((score / total) * 100),
    time: timeSecs,
    date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })
  });
  localStorage.setItem('smartquiz_history', JSON.stringify(history.slice(0, 5)));
}

function renderHistory() {
  const container = document.getElementById('history-section');
  if (!container) return;
  const history = JSON.parse(localStorage.getItem('smartquiz_history') || '[]');
  if (!history.length) { container.style.display = 'none'; return; }
  container.style.display = 'block';
  const list = document.getElementById('history-list');
  list.innerHTML = '';
  history.forEach(h => {
    const color = h.pct >= 80 ? 'var(--color-green)' : h.pct >= 60 ? 'var(--color-primary-2)' : h.pct >= 40 ? 'var(--color-amber)' : 'var(--color-red)';
    const div = document.createElement('div');
    div.className = 'history-item';
    div.innerHTML = `
      <div class="hist-left">
        <div class="hist-topic">${escapeHtml(h.topic)}</div>
        <div class="hist-meta">${h.date} · ${formatTime(h.time)}</div>
      </div>
      <div class="hist-score" style="color:${color}">${h.score}/${h.total} <span class="hist-pct">${h.pct}%</span></div>`;
    list.appendChild(div);
  });
}

// ══════════════════════════════════════════
// START QUIZ (AI)
// ══════════════════════════════════════════
async function startQuiz() {
  const topic = document.getElementById('topic-input').value.trim();
  if (!topic) { showError('Please enter a topic to generate a quiz!'); return; }
  if (topic.length < 2) { showError('Topic must be at least 2 characters.'); return; }
  if (!state.apiKey) {
    showError('No API key found. Configure your Gemini API key below, or use Demo Mode.');
    return;
  }

  state.currentTopic = topic;
  showLoadingScreen(topic);
  showScreen('loading');

  try {
    const questions = await generateQuestionsWithGemini(topic);
    startQuizSession(questions, topic);
  } catch (err) {
    console.error('Generation error:', err);
    showScreen('home');
    showError(`AI Error: ${err.message || 'Failed to generate quiz. Check your API key or try Demo Mode.'}`);
  }
}

// ══════════════════════════════════════════
// DEMO MODE
// ══════════════════════════════════════════
function loadDemo(type) {
  const demo = DEMO_DATA[type];
  if (!demo) return;
  state.currentTopic = demo.topic;
  startQuizSession(JSON.parse(JSON.stringify(demo.questions)), demo.topic);
}

// ══════════════════════════════════════════
// LOADING ANIMATION
// ══════════════════════════════════════════
function showLoadingScreen(topic) {
  document.getElementById('loading-topic-name').textContent = `"${topic}"`;
  [1, 2, 3, 4].forEach(i => {
    const el = document.getElementById(`step-${i}`);
    if (el) {
      el.querySelector('.step-dot').classList.remove('active', 'done');
      el.classList.remove('active-step');
    }
  });
  const delays = [200, 1000, 2000, 2800];
  [1, 2, 3, 4].forEach((stepNum, idx) => {
    setTimeout(() => {
      const stepEl = document.getElementById(`step-${stepNum}`);
      const dotEl  = stepEl?.querySelector('.step-dot');
      if (!dotEl) return;
      // Mark previous as done
      if (idx > 0) {
        const prev = document.getElementById(`step-${stepNum - 1}`)?.querySelector('.step-dot');
        if (prev) { prev.classList.remove('active'); prev.classList.add('done'); }
      }
      dotEl.classList.add('active');
      stepEl.classList.add('active-step');
    }, delays[idx]);
  });
}

// ══════════════════════════════════════════
// GEMINI API CALL
// ══════════════════════════════════════════
async function generateQuestionsWithGemini(topic) {
  const prompt = `You are an expert quiz generator. Generate exactly 5 high-quality multiple-choice questions about "${topic}".

Return ONLY a valid JSON array (no markdown, no extra text) with this exact structure:
[
  {
    "question": "Clear, specific question text",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correct": 0,
    "explanation": "Detailed 2-3 sentence explanation of why the correct answer is right and briefly why the others are wrong."
  }
]

Rules:
- "correct" is the 0-based index of the correct option
- Make questions progressively more challenging (easy → hard)
- All 4 options must be plausible — avoid obvious wrong answers
- Explanations must be educational and insightful
- Return ONLY the raw JSON array — no markdown fences, no extra text`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${state.apiKey}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.75,
        maxOutputTokens: 2048,
        responseMimeType: 'application/json'
      }
    })
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    const msg = errData?.error?.message || `HTTP ${response.status}`;
    if (response.status === 400) throw new Error('Invalid API key or bad request. Please check your Gemini API key.');
    if (response.status === 401) throw new Error('Unauthorized. Please verify your Gemini API key.');
    if (response.status === 429) throw new Error('Rate limit exceeded. Please wait a moment and try again.');
    if (response.status === 403) throw new Error('API access forbidden. Ensure your API key has Gemini access enabled.');
    throw new Error(`Gemini API error: ${msg}`);
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Empty response from Gemini API. Please try again.');

  // Strip any accidental code fences
  const clean = text.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
  let parsed;
  try { parsed = JSON.parse(clean); }
  catch { throw new Error('AI returned malformed JSON. Please try again.'); }

  if (!Array.isArray(parsed) || parsed.length === 0) {
    throw new Error('AI did not return valid questions. Please try again.');
  }

  return parsed.slice(0, 5).map((q, i) => ({
    question:    q.question    || `Question ${i + 1}`,
    options:     Array.isArray(q.options) && q.options.length === 4 ? q.options : ['Option A', 'Option B', 'Option C', 'Option D'],
    correct:     typeof q.correct === 'number' ? Math.min(3, Math.max(0, q.correct)) : 0,
    explanation: q.explanation || 'The selected answer is correct based on the topic knowledge.'
  }));
}

// ══════════════════════════════════════════
// QUIZ SESSION
// ══════════════════════════════════════════
function startQuizSession(questions, topic) {
  state.questions      = questions;
  state.currentIndex   = 0;
  state.answers        = [];
  state.score          = 0;
  state.streak         = 0;
  state.maxStreak      = 0;
  state.startTime      = Date.now();
  state.elapsedSeconds = 0;

  // Build progress dots
  const dotsContainer = document.getElementById('progress-dots');
  dotsContainer.innerHTML = '';
  questions.forEach((_, i) => {
    const dot = document.createElement('div');
    dot.className = `pdot${i === 0 ? ' current' : ''}`;
    dot.id = `pdot-${i}`;
    dotsContainer.appendChild(dot);
  });

  document.getElementById('quiz-topic-badge').textContent = topic;
  document.getElementById('score-denom').textContent = `/ ${questions.length}`;
  document.getElementById('streak-display').textContent = '🔥 0';

  // Start timer
  clearInterval(state.timerInterval);
  state.timerInterval = setInterval(() => {
    state.elapsedSeconds++;
    const el = document.getElementById('timer-val');
    if (el) el.textContent = state.elapsedSeconds;
  }, 1000);

  showScreen('quiz');
  renderQuestion(0);
}

// ══════════════════════════════════════════
// RENDER QUESTION
// ══════════════════════════════════════════
function renderQuestion(index) {
  const q     = state.questions[index];
  const total = state.questions.length;

  document.getElementById('q-counter').textContent     = `Question ${index + 1} of ${total}`;
  document.getElementById('q-score-live').textContent  = `Score: ${state.score}`;
  document.getElementById('q-number-badge').textContent = `Q${index + 1}`;
  document.getElementById('question-text').textContent  = q.question;

  // Difficulty badge
  const diff = DIFFICULTY[Math.min(index, DIFFICULTY.length - 1)];
  const diffBadge = document.getElementById('q-difficulty-badge');
  if (diffBadge) {
    diffBadge.textContent = diff.label;
    diffBadge.className   = `q-difficulty-badge ${diff.cls}`;
  }

  // Progress bar
  document.getElementById('progress-bar').style.width = `${((index + 1) / total) * 100}%`;

  // Progress dots
  for (let i = 0; i < total; i++) {
    const dot = document.getElementById(`pdot-${i}`);
    if (!dot) continue;
    dot.className = 'pdot';
    if (i < index) {
      dot.classList.add(state.answers[i]?.correct ? 'answered' : 'wrong-answered');
    } else if (i === index) {
      dot.classList.add('current');
    }
  }

  // Options
  const grid    = document.getElementById('options-grid');
  grid.innerHTML = '';
  const letters = ['A', 'B', 'C', 'D'];
  q.options.forEach((opt, i) => {
    const btn = document.createElement('button');
    btn.className = 'option-btn';
    btn.id        = `opt-${i}`;
    btn.innerHTML = `<span class="option-letter">${letters[i]}</span><span class="option-text">${escapeHtml(opt)}</span>`;
    btn.onclick   = () => selectAnswer(i);
    grid.appendChild(btn);
  });

  // Hide feedback
  const feedbackEl = document.getElementById('answer-feedback');
  feedbackEl.style.display = 'none';
  feedbackEl.className     = 'answer-feedback';

  // Reset next button
  const nextBtn = document.getElementById('next-btn');
  nextBtn.disabled = true;
  document.getElementById('next-btn-text').textContent =
    index === total - 1 ? 'See Results' : 'Next Question';

  document.getElementById('nav-hint').textContent = 'Choose an answer to continue';
  document.getElementById('keyboard-hint').textContent = 'Tip: Press A/B/C/D or 1/2/3/4 to select';

  // Animate card in
  const card = document.getElementById('question-card');
  card.style.animation = 'none';
  card.offsetHeight;
  card.style.animation = 'cardSlideIn 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards';
}

// ══════════════════════════════════════════
// SELECT ANSWER
// ══════════════════════════════════════════
function selectAnswer(selectedIndex) {
  const q         = state.questions[state.currentIndex];
  const isCorrect = selectedIndex === q.correct;

  // Disable all options
  document.querySelectorAll('.option-btn').forEach(b => { b.disabled = true; });

  const selectedBtn = document.getElementById(`opt-${selectedIndex}`);
  const correctBtn  = document.getElementById(`opt-${q.correct}`);

  if (isCorrect) {
    selectedBtn.classList.add('correct');
    state.streak++;
    state.maxStreak = Math.max(state.maxStreak, state.streak);
  } else {
    selectedBtn.classList.add('incorrect');
    correctBtn.classList.add('correct');
    state.streak = 0;
  }

  state.answers[state.currentIndex] = { selectedIndex, correct: isCorrect };
  if (isCorrect) state.score++;

  document.getElementById('q-score-live').textContent = `Score: ${state.score}`;
  document.getElementById('streak-display').textContent = `🔥 ${state.streak}`;

  showAnswerFeedback(isCorrect, q);

  document.getElementById('next-btn').disabled = false;
  document.getElementById('nav-hint').textContent     = '';
  document.getElementById('keyboard-hint').textContent = 'Press Enter or → for next';

  const dot = document.getElementById(`pdot-${state.currentIndex}`);
  if (dot) dot.className = `pdot ${isCorrect ? 'answered' : 'wrong-answered'}`;
}

// ══════════════════════════════════════════
// ANSWER FEEDBACK
// ══════════════════════════════════════════
function showAnswerFeedback(isCorrect, q) {
  const feedbackEl = document.getElementById('answer-feedback');
  const iconEl     = document.getElementById('feedback-icon');
  const textEl     = document.getElementById('feedback-text');

  feedbackEl.className = `answer-feedback ${isCorrect ? 'correct-feedback' : 'wrong-feedback'}`;
  iconEl.textContent   = isCorrect ? '✅' : '❌';

  const msg = isCorrect
    ? CORRECT_MSGS[Math.floor(Math.random() * CORRECT_MSGS.length)]
    : WRONG_MSGS[Math.floor(Math.random() * WRONG_MSGS.length)];

  if (isCorrect) {
    textEl.innerHTML = `<strong>${msg}</strong>`;
  } else {
    textEl.innerHTML = `<strong>${msg}</strong>Correct: <em>"${escapeHtml(q.options[q.correct])}"</em>`;
  }

  feedbackEl.style.display = 'flex';
}

function nextQuestion() {
  const total = state.questions.length;
  if (state.currentIndex < total - 1) {
    state.currentIndex++;
    renderQuestion(state.currentIndex);
  } else {
    showResults();
  }
}

// ══════════════════════════════════════════
// RESULTS
// ══════════════════════════════════════════
function showResults() {
  clearInterval(state.timerInterval);
  const totalTime = state.elapsedSeconds;
  const total     = state.questions.length;
  const score     = state.score;
  const pct       = Math.round((score / total) * 100);

  saveToHistory(state.currentTopic, score, total, totalTime);

  const gradeConfig = getGradeConfig(pct);

  // Score ring setup
  const circumference = 2 * Math.PI * 50;
  const offset        = circumference - (pct / 100) * circumference;

  // Update or create SVG gradient
  const svg  = document.querySelector('.score-ring');
  let defs   = svg.querySelector('defs');
  if (!defs) {
    defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    svg.prepend(defs);
  }
  defs.innerHTML = `
    <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%"   stop-color="${gradeConfig.color1}" />
      <stop offset="100%" stop-color="${gradeConfig.color2}" />
    </linearGradient>`;

  const ringProgress = document.getElementById('score-ring-progress');
  ringProgress.setAttribute('stroke', 'url(#scoreGrad)');
  ringProgress.style.strokeDashoffset = circumference;

  showScreen('result');

  // Animate
  setTimeout(() => {
    animateNumber('score-num', 0, score, 1200);
    animateNumber('pct-num', 0, pct, 1200);
    ringProgress.style.strokeDashoffset = offset;
  }, 300);

  document.getElementById('correct-count').textContent   = score;
  document.getElementById('incorrect-count').textContent = total - score;
  document.getElementById('time-taken').textContent      = formatTime(totalTime);
  document.getElementById('max-streak').textContent      = state.maxStreak;
  document.getElementById('result-grade').textContent    = gradeConfig.grade;
  document.getElementById('result-message').textContent  = gradeConfig.message;

  // Confetti for high scores
  if (pct >= 80) launchConfetti(pct === 100 ? 200 : 100);

  // Build review list
  buildReviewList();
}

// ══════════════════════════════════════════
// REVIEW LIST
// ══════════════════════════════════════════
function buildReviewList() {
  const reviewList  = document.getElementById('review-list');
  reviewList.innerHTML = '';

  state.questions.forEach((q, i) => {
    const ans       = state.answers[i] || { selectedIndex: -1, correct: false };
    const isCorrect = ans.correct;
    const userAns   = ans.selectedIndex >= 0 ? escapeHtml(q.options[ans.selectedIndex]) : 'Not answered';
    const corrAns   = escapeHtml(q.options[q.correct]);

    const item = document.createElement('div');
    item.className          = `review-item ${isCorrect ? 'correct-item' : 'wrong-item'}`;
    item.style.animationDelay = `${i * 0.08}s`;

    item.innerHTML = `
      <div class="review-item-header" onclick="toggleReview(this)">
        <div class="review-num">${i + 1}</div>
        <div class="review-q-text">${escapeHtml(q.question)}</div>
        <div class="review-chevron">${isCorrect ? '✅' : '❌'} <span class="chevron-icon">▾</span></div>
      </div>
      <div class="review-body">
        <div class="review-answers">
          <div class="review-answer-row">
            <span class="ra-label">Your Answer:</span>
            <span class="ra-value ${isCorrect ? 'correct-val' : 'wrong-val'}">${userAns}</span>
          </div>
          ${!isCorrect ? `
          <div class="review-answer-row">
            <span class="ra-label">Correct:</span>
            <span class="ra-value correct-val">${corrAns}</span>
          </div>` : ''}
          <div class="review-explanation">
            <strong>💡 Explanation</strong>
            ${escapeHtml(q.explanation)}
          </div>
        </div>
      </div>`;

    reviewList.appendChild(item);

    // Auto-expand wrong answers
    if (!isCorrect) {
      const body = item.querySelector('.review-body');
      body.classList.add('open');
    }
  });
}

function toggleReview(headerEl) {
  const body    = headerEl.nextElementSibling;
  const chevron = headerEl.querySelector('.chevron-icon');
  const isOpen  = body.classList.contains('open');
  body.classList.toggle('open', !isOpen);
  if (chevron) chevron.textContent = isOpen ? '▾' : '▴';
}

// ══════════════════════════════════════════
// GRADE CONFIG
// ══════════════════════════════════════════
function getGradeConfig(pct) {
  if (pct === 100) return { grade: '🏆 Perfect Score!',     message: 'Outstanding! You aced every question. You truly master this topic!',            color1: '#fbbf24', color2: '#f59e0b' };
  if (pct >= 80)  return { grade: '🌟 Excellent!',          message: 'Great performance! You have a strong command of this topic.',                    color1: '#34d399', color2: '#059669' };
  if (pct >= 60)  return { grade: '👍 Good Job!',           message: 'Solid effort! Review the incorrect answers to sharpen your understanding.',     color1: '#7c6aff', color2: '#a78bfa' };
  if (pct >= 40)  return { grade: '📚 Keep Studying',       message: "You're making progress. Study the explanations carefully and try again.",        color1: '#f59e0b', color2: '#fbbf24' };
  return             { grade: '💪 Keep Practicing',         message: "Don't give up! Every expert was once a beginner. Review and retry!",            color1: '#f87171', color2: '#dc2626' };
}

// ══════════════════════════════════════════
// CONFETTI
// ══════════════════════════════════════════
function launchConfetti(count = 100) {
  const container = document.getElementById('confetti-container');
  container.innerHTML = '';
  const colors = ['#7c6aff','#a78bfa','#34d399','#fbbf24','#f472b6','#06b6d4','#f87171','#fff'];

  for (let i = 0; i < count; i++) {
    const piece = document.createElement('div');
    piece.className = 'confetti-piece';
    const size    = Math.random() * 10 + 6;
    const color   = colors[Math.floor(Math.random() * colors.length)];
    const left    = Math.random() * 100;
    const delay   = Math.random() * 2;
    const dur     = Math.random() * 2 + 2;
    const isRect  = Math.random() > 0.5;

    piece.style.cssText = `
      width: ${size}px; height: ${isRect ? size * 0.5 : size}px;
      background: ${color};
      left: ${left}%;
      animation-delay: ${delay}s;
      animation-duration: ${dur}s;
      border-radius: ${isRect ? '2px' : '50%'};
      transform: rotate(${Math.random() * 360}deg);
    `;
    container.appendChild(piece);
  }

  // Clear after animation
  setTimeout(() => { container.innerHTML = ''; }, 5000);
}

// ══════════════════════════════════════════
// SHARE SCORE
// ══════════════════════════════════════════
async function shareScore() {
  const score = state.score;
  const total = state.questions.length;
  const pct   = Math.round((score / total) * 100);
  const topic = state.currentTopic;
  const text  = `🧠 I scored ${score}/${total} (${pct}%) on a "${topic}" quiz on Smart Quiz AI! Can you beat my score? ⚡`;

  if (navigator.share) {
    try {
      await navigator.share({ title: 'Smart Quiz AI', text, url: window.location.href });
      showToast('📤 Shared successfully!');
      return;
    } catch { /* fall through to clipboard */ }
  }
  try {
    await navigator.clipboard.writeText(text);
    showToast('📋 Score copied to clipboard!');
  } catch {
    showToast('💡 Copy: ' + text.slice(0, 60) + '...');
  }
}

// ══════════════════════════════════════════
// NAVIGATION
// ══════════════════════════════════════════
function goHome() {
  clearInterval(state.timerInterval);
  Object.assign(state, { questions: [], answers: [], score: 0, currentIndex: 0, streak: 0 });
  document.getElementById('topic-input').value = '';
  clearError();
  renderHistory();
  showScreen('home');
}

function retakeQuiz() {
  startQuizSession(JSON.parse(JSON.stringify(state.questions)), state.currentTopic);
}

// ══════════════════════════════════════════
// UTILITIES
// ══════════════════════════════════════════
function escapeHtml(text) {
  const d = document.createElement('div');
  d.appendChild(document.createTextNode(String(text)));
  return d.innerHTML;
}

function formatTime(seconds) {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60), s = seconds % 60;
  return `${m}m ${s < 10 ? '0' : ''}${s}s`;
}

function animateNumber(elementId, from, to, duration) {
  const el = document.getElementById(elementId);
  if (!el) return;
  const start = performance.now();
  const range = to - from;
  (function update(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased    = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(from + range * eased);
    if (progress < 1) requestAnimationFrame(update);
  })(performance.now());
}

let toastTimer;
function showToast(message, duration = 3200) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), duration);
}

// ══════════════════════════════════════════
// KEYBOARD SHORTCUTS
// ══════════════════════════════════════════
document.addEventListener('keydown', e => {
  const quizActive = document.getElementById('screen-quiz').classList.contains('active');
  const homeActive = document.getElementById('screen-home').classList.contains('active');

  if (homeActive && e.key === 'Enter') { startQuiz(); return; }

  if (quizActive) {
    const map = { '1': 0, '2': 1, '3': 2, '4': 3, 'a': 0, 'b': 1, 'c': 2, 'd': 3 };
    const idx = map[e.key.toLowerCase()];
    if (idx !== undefined) {
      const btn = document.getElementById(`opt-${idx}`);
      if (btn && !btn.disabled) btn.click();
    }
    if ((e.key === 'Enter' || e.key === 'ArrowRight')) {
      const nextBtn = document.getElementById('next-btn');
      if (!nextBtn.disabled) nextQuestion();
    }
  }
});

document.getElementById('topic-input').addEventListener('input', clearError);

// ══════════════════════════════════════════
// INIT
// ══════════════════════════════════════════
showScreen('home');
