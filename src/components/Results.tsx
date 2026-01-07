import type { ScoreResult } from '../utils/scoring';

interface ResultsProps {
  result: ScoreResult;
  onTryAgain: () => void;
}

export function Results(props: ResultsProps) {
  const accuracyColor = () => {
    const acc = props.result.accuracy;
    if (acc >= 80) return 'text-green-400';
    if (acc >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div class="bg-gray-800 rounded-lg p-6 space-y-6">
      <h2 class="text-2xl font-bold text-white text-center">Results</h2>

      <div class="grid grid-cols-2 gap-4">
        <div class="bg-gray-700 rounded-lg p-4 text-center">
          <div class={`text-4xl font-bold ${accuracyColor()}`}>
            {props.result.accuracy.toFixed(1)}%
          </div>
          <div class="text-sm text-gray-400 mt-1">Accuracy</div>
        </div>

        <div class="bg-gray-700 rounded-lg p-4 text-center">
          <div class="text-4xl font-bold text-blue-400">
            {props.result.wordsPerMinute.toFixed(0)}
          </div>
          <div class="text-sm text-gray-400 mt-1">Words/min</div>
        </div>

        <div class="bg-gray-700 rounded-lg p-4 text-center">
          <div class="text-4xl font-bold text-white">
            {props.result.correctWords}
          </div>
          <div class="text-sm text-gray-400 mt-1">Correct Words</div>
        </div>

        <div class="bg-gray-700 rounded-lg p-4 text-center">
          <div class="text-4xl font-bold text-gray-400">
            {props.result.totalWords}
          </div>
          <div class="text-sm text-gray-400 mt-1">Total Words</div>
        </div>
      </div>

      <button
        onClick={props.onTryAgain}
        class="w-full px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
      >
        Try Again
      </button>
    </div>
  );
}
