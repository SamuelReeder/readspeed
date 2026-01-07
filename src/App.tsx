import { createSignal, createMemo, Show } from 'solid-js';
import { WordDisplay } from './components/WordDisplay';
import { Settings } from './components/Settings';
import { InputForm } from './components/InputForm';
import { Results } from './components/Results';
import { Stats } from './components/Stats';
import { createWordTimer } from './primitives/createTimer';
import { createStats } from './primitives/createStats';
import { getRandomText, splitIntoWords } from './utils/wordLists';
import { calculateScore, type ScoreResult } from './utils/scoring';

type GameState = 'idle' | 'running' | 'input' | 'results';

function App() {
  const [gameState, setGameState] = createSignal<GameState>('idle');
  const [intervalMs, setIntervalMs] = createSignal(500);
  const [currentText, setCurrentText] = createSignal('');
  const [userInput, setUserInput] = createSignal('');
  const [result, setResult] = createSignal<ScoreResult | null>(null);

  const words = createMemo(() => splitIntoWords(currentText()));
  const stats = createStats();

  const timer = createWordTimer(words, intervalMs);

  const currentWord = createMemo(() => {
    const w = words();
    const idx = timer.currentIndex();
    return w[idx] || '';
  });

  const handleStart = () => {
    const text = getRandomText();
    setCurrentText(text);
    setUserInput('');
    setResult(null);
    setGameState('running');

    // Small delay to ensure state is updated before starting timer
    setTimeout(() => {
      timer.reset();
      timer.start();
    }, 50);
  };

  // Watch for timer finishing
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
    setCurrentText('');
    setUserInput('');
    setResult(null);
  };

  return (
    <div class="min-h-screen bg-gray-900 text-white p-4">
      <div class="max-w-2xl mx-auto space-y-6">
        <header class="text-center py-6">
          <h1 class="text-4xl font-bold mb-2">ReadSpeed</h1>
          <p class="text-gray-400">Test your reading speed and memory</p>
        </header>

        <WordDisplay
          word={currentWord()}
          isRunning={gameState() === 'running'}
          isFinished={gameState() === 'input' || gameState() === 'results'}
        />

        <Show when={gameState() === 'idle'}>
          <Settings
            intervalMs={intervalMs()}
            onIntervalChange={setIntervalMs}
            disabled={gameState() !== 'idle'}
          />

          <button
            onClick={handleStart}
            class="w-full px-6 py-4 bg-blue-600 text-white text-xl font-bold rounded-lg hover:bg-blue-700 transition-colors"
          >
            Start Test
          </button>
        </Show>

        <Show when={gameState() === 'running'}>
          <div class="text-center">
            <p class="text-gray-400">
              Word {timer.currentIndex() + 1} of {words().length}
            </p>
            <div class="w-full bg-gray-700 rounded-full h-2 mt-2">
              <div
                class="bg-blue-600 h-2 rounded-full transition-all duration-100"
                style={{ width: `${((timer.currentIndex() + 1) / words().length) * 100}%` }}
              />
            </div>
          </div>
        </Show>

        <Show when={gameState() === 'input'}>
          <InputForm
            value={userInput()}
            onInput={setUserInput}
            onSubmit={handleSubmit}
            disabled={false}
            placeholder="Type the words you remember from the passage..."
          />
        </Show>

        <Show when={gameState() === 'results' && result()}>
          <Results result={result()!} onTryAgain={handleTryAgain} />
        </Show>

        <Stats
          sessions={stats.sessions()}
          averageAccuracy={stats.getAverageAccuracy()}
          bestAccuracy={stats.getBestAccuracy()}
          onClear={stats.clearStats}
        />
      </div>
    </div>
  );
}

export default App;
