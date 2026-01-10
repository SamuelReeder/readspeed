import { createSignal, createMemo, Show } from 'solid-js';
import { WordDisplay } from './components/WordDisplay';
import { Settings } from './components/Settings';
import { InputForm } from './components/InputForm';
import { Results } from './components/Results';
import { ModeToggle } from './components/ModeToggle';
import { ComprehensionQuestions } from './components/ComprehensionQuestions';
import { ComprehensionReview } from './components/ComprehensionReview';
// import { Stats } from './components/Stats';
import { createWordTimer } from './primitives/createTimer';
import { createStats } from './primitives/createStats';
import { createTheme } from './primitives/createTheme';
import { getRandomText, splitIntoWords } from './utils/wordLists';
import { calculateScore, type ScoreResult } from './utils/scoring';
import { getRandomPassage, type Passage } from './data/passages';

type GameState = 'idle' | 'running' | 'practicing' | 'input' | 'results'
  | 'comprehension_reading' | 'comprehension_questions' | 'comprehension_review';

function App() {
  const [gameState, setGameState] = createSignal<GameState>('idle');
  const [intervalMs, setIntervalMs] = createSignal(200);
  const [wordCount, setWordCount] = createSignal(10);
  const [currentText, setCurrentText] = createSignal(getRandomText(10));
  const [userInput, setUserInput] = createSignal('');
  const [result, setResult] = createSignal<ScoreResult | null>(null);

  // Mode toggle (speed test vs comprehension)
  const [mode, setMode] = createSignal<'speed' | 'comprehension'>('speed');

  // Comprehension mode state
  const [currentPassage, setCurrentPassage] = createSignal<Passage | null>(null);
  const [comprehensionAnswers, setComprehensionAnswers] = createSignal<string[]>([]);
  const [readingStartTime, setReadingStartTime] = createSignal(0);
  const [wordsRead, setWordsRead] = createSignal(0);
  const [seenPassageIds, setSeenPassageIds] = createSignal<string[]>([]);
  const [loopCount, setLoopCount] = createSignal(0);

  const handleWordCountChange = (count: number) => {
    setWordCount(count);
    // Preserve the first word (preview word) when changing word count
    const currentFirstWord = words()[0];
    setCurrentText(getRandomText(count, currentFirstWord));
  };

  const words = createMemo(() => splitIntoWords(currentText()));
  const stats = createStats();
  const theme = createTheme();

  const timer = createWordTimer(words, intervalMs);

  const currentWord = createMemo(() => {
    const w = words();
    // In idle state, always show first word; otherwise use timer index
    const state = gameState();
    const idx = state === 'idle' ? 0 : timer.currentIndex();
    return w[idx] || '';
  });

  const handleStart = () => {
    // Don't regenerate text - use the preview text as the test
    setUserInput('');
    setResult(null);
    setGameState('running');

    setTimeout(() => {
      timer.reset();
      timer.start();
    }, 50);
  };

  createMemo(() => {
    if (timer.isFinished() && gameState() === 'running') {
      setGameState('input');
    }
  });

  const handleSubmit = () => {
    const elapsedTime = timer.getElapsedTime();
    const scoreResult = calculateScore(words(), userInput(), elapsedTime);
    setResult(scoreResult);
    stats.addSession(scoreResult, intervalMs());
    setGameState('results');
  };

  const handleTryAgain = () => {
    timer.reset();
    setGameState('idle');
    setCurrentText(getRandomText(wordCount()));
    setUserInput('');
    setResult(null);
  };

  const handleGoHome = () => {
    timer.reset();
    setGameState('idle');
    setCurrentText(getRandomText(wordCount()));
    setUserInput('');
    setResult(null);
  };

  const handleStartPractice = () => {
    setGameState('practicing');
    setTimeout(() => {
      timer.reset();
      timer.start();
    }, 50);
  };

  const handleStopPractice = () => {
    timer.reset();
    setGameState('idle');
    setCurrentText(getRandomText(wordCount()));
  };

  // Loop practice mode when words finish
  createMemo(() => {
    if (timer.isFinished() && gameState() === 'practicing') {
      setCurrentText(getRandomText(wordCount()));
      setTimeout(() => {
        timer.reset();
        timer.start();
      }, 50);
    }
  });

  // Comprehension mode handlers
  const handleStartComprehension = () => {
    const passage = getRandomPassage(seenPassageIds());
    setCurrentPassage(passage);
    setSeenPassageIds(ids => [...ids, passage.id]);
    setCurrentText(passage.text);
    setComprehensionAnswers([]);
    setReadingStartTime(Date.now());
    setWordsRead(0);
    setLoopCount(0);
    setGameState('comprehension_reading');

    setTimeout(() => {
      timer.reset();
      timer.start();
    }, 50);
  };

  const handleStopComprehension = () => {
    const passageWords = splitIntoWords(currentPassage()?.text || '').length;
    // Total words = completed loops * passage length + current position
    const totalWords = loopCount() * passageWords + timer.currentIndex();
    setWordsRead(totalWords);

    timer.reset();
    setGameState('comprehension_questions');
  };

  const handleComprehensionComplete = (answers: string[]) => {
    setComprehensionAnswers(answers);
    setGameState('comprehension_review');
  };

  const handleComprehensionTryAnother = () => {
    handleStartComprehension();
  };

  const handleComprehensionHome = () => {
    timer.reset();
    setGameState('idle');
    setCurrentPassage(null);
    setCurrentText(getRandomText(wordCount()));
  };

  // Calculate comprehension WPM
  const comprehensionWpm = createMemo(() => {
    if (wordsRead() === 0 || readingStartTime() === 0) return 0;
    const elapsed = Date.now() - readingStartTime();
    return Math.round((wordsRead() / elapsed) * 60000);
  });

  // Loop comprehension reading mode when passage finishes (infinite reading)
  createMemo(() => {
    if (timer.isFinished() && gameState() === 'comprehension_reading') {
      // Increment loop counter before resetting
      setLoopCount(c => c + 1);
      setTimeout(() => {
        timer.reset();
        timer.start();
      }, 50);
    }
  });

  return (
    <div class="min-h-screen flex flex-col" style={{ background: 'var(--bg)', color: 'var(--text)' }}>
      {/* Header */}
      <header class="flex items-center justify-between px-6 py-4">
        <button
          onClick={theme.toggle}
          class="w-10 h-10 flex items-center justify-center rounded-lg transition-colors hover:opacity-70"
          style={{ color: 'var(--text-muted)' }}
          aria-label="Toggle theme"
        >
          <Show when={theme.isDark()} fallback={
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="4"/>
              <path d="M12 2v2"/>
              <path d="M12 20v2"/>
              <path d="m4.93 4.93 1.41 1.41"/>
              <path d="m17.66 17.66 1.41 1.41"/>
              <path d="M2 12h2"/>
              <path d="M20 12h2"/>
              <path d="m6.34 17.66-1.41 1.41"/>
              <path d="m19.07 4.93-1.41 1.41"/>
            </svg>
          }>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>
            </svg>
          </Show>
        </button>

        <h1 class="text-xl font-medium tracking-tight" style={{ color: 'var(--text-muted)' }}>
          readspeed
        </h1>

        <div class="w-10" /> {/* Spacer for balance */}
      </header>

      {/* Main Content - Centered */}
      <main class="flex-1 flex flex-col items-center justify-center px-6">
        <div class="w-full max-w-xl">
          {/* Word Display - Always visible, takes center stage */}
          <Show when={gameState() !== 'comprehension_questions' && gameState() !== 'comprehension_review'}>
            <div class="mb-16">
              <WordDisplay
                word={currentWord()}
                isRunning={gameState() === 'running' || gameState() === 'practicing' || gameState() === 'comprehension_reading'}
                isFinished={gameState() === 'input' || gameState() === 'results'}
              />
            </div>
          </Show>

          {/* Controls below word display */}
          <Show when={gameState() === 'idle'}>
            <div class="space-y-8">
              {/* Mode Toggle */}
              <ModeToggle
                mode={mode()}
                onModeChange={setMode}
                disabled={false}
              />

              {/* Speed Test Mode UI */}
              <Show when={mode() === 'speed'}>
                <Settings
                  intervalMs={intervalMs()}
                  onIntervalChange={setIntervalMs}
                  wordCount={wordCount()}
                  onWordCountChange={handleWordCountChange}
                  disabled={false}
                />

                <div class="flex gap-4">
                  <button
                    onClick={handleStartPractice}
                    class="flex-1 py-3 font-medium transition-opacity hover:opacity-70"
                    style={{ color: 'var(--text)', border: '1px solid var(--text-muted)' }}
                  >
                    practice
                  </button>
                  <button
                    onClick={handleStart}
                    class="flex-1 py-3 font-medium transition-opacity hover:opacity-70"
                    style={{ color: 'var(--text)', border: '1px solid var(--text-muted)' }}
                  >
                    start
                  </button>
                </div>
              </Show>

              {/* Comprehension Mode UI */}
              <Show when={mode() === 'comprehension'}>
                <Settings
                  intervalMs={intervalMs()}
                  onIntervalChange={setIntervalMs}
                  wordCount={wordCount()}
                  onWordCountChange={handleWordCountChange}
                  disabled={false}
                />

                <div class="text-center text-sm" style={{ color: 'var(--text-muted)' }}>
                  Read the passage, then answer questions to test comprehension.
                </div>

                <button
                  onClick={handleStartComprehension}
                  class="w-full py-3 font-medium transition-opacity hover:opacity-70"
                  style={{ color: 'var(--text)', border: '1px solid var(--text-muted)' }}
                >
                  start
                </button>
              </Show>
            </div>
          </Show>

          <Show when={gameState() === 'running'}>
            {/* Minimal progress indicator - just a thin line */}
            <div class="w-full h-px" style={{ background: 'var(--text-muted)' }}>
              <div
                class="h-full transition-all duration-100"
                style={{
                  width: `${((timer.currentIndex() + 1) / words().length) * 100}%`,
                  background: 'var(--text)'
                }}
              />
            </div>
          </Show>

          <Show when={gameState() === 'practicing'}>
            <button
              onClick={handleStopPractice}
              class="w-full py-3 font-medium transition-opacity hover:opacity-70"
              style={{ color: 'var(--text)', border: '1px solid var(--text-muted)' }}
            >
              stop
            </button>
          </Show>

          <Show when={gameState() === 'input'}>
            <InputForm
              value={userInput()}
              onInput={setUserInput}
              onSubmit={handleSubmit}
              onHome={handleGoHome}
              disabled={false}
            />
          </Show>

          <Show when={gameState() === 'results' && result()}>
            <Results result={result()!} onTryAgain={handleTryAgain} onHome={handleGoHome} />
          </Show>

          {/* Comprehension Reading Mode */}
          <Show when={gameState() === 'comprehension_reading'}>
            <div class="space-y-4">
              <div class="text-center text-sm" style={{ color: 'var(--text-muted)' }}>
                Reading... Click stop when ready to answer questions.
              </div>
              <button
                onClick={handleStopComprehension}
                class="w-full py-3 font-medium transition-opacity hover:opacity-70"
                style={{ color: 'var(--text)', border: '1px solid var(--text-muted)' }}
              >
                stop
              </button>
            </div>
          </Show>

          {/* Comprehension Questions */}
          <Show when={gameState() === 'comprehension_questions' && currentPassage()}>
            <ComprehensionQuestions
              questions={currentPassage()!.questions}
              onComplete={handleComprehensionComplete}
            />
          </Show>

          {/* Comprehension Review */}
          <Show when={gameState() === 'comprehension_review' && currentPassage()}>
            <ComprehensionReview
              source={currentPassage()!.source}
              wpm={comprehensionWpm()}
              wordsRead={wordsRead()}
              questions={currentPassage()!.questions}
              userAnswers={comprehensionAnswers()}
              onTryAnother={handleComprehensionTryAnother}
              onHome={handleComprehensionHome}
            />
          </Show>
        </div>
      </main>

      {/* Stats section - commented out for now
      <Stats
        sessions={stats.sessions()}
        averageAccuracy={stats.getAverageAccuracy()}
        bestAccuracy={stats.getBestAccuracy()}
        onClear={stats.clearStats}
      />
      */}

      {/* Footer */}
      <footer class="px-6 py-4 text-center">
        <a
          href="https://youtu.be/NdKcDPBQ-Lw?si=jKcvbZzYNTeVG80N"
          target="_blank"
          rel="noopener noreferrer"
          class="text-xs underline transition-opacity hover:opacity-70"
          style={{ color: 'var(--text-muted)' }}
        >
          inspired by this video
        </a>
      </footer>
    </div>
  );
}

export default App;
