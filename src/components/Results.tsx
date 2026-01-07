import type { ScoreResult } from '../utils/scoring';

interface ResultsProps {
  result: ScoreResult;
  onTryAgain: () => void;
}

export function Results(props: ResultsProps) {
  return (
    <div class="space-y-8">
      <div class="flex justify-center gap-8">
        <div class="text-center">
          <div class="text-4xl font-bold" style={{ color: 'var(--text)' }}>
            {props.result.accuracy.toFixed(0)}%
          </div>
          <div class="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            accuracy
          </div>
        </div>

        <div class="text-center">
          <div class="text-4xl font-bold" style={{ color: 'var(--text)' }}>
            {props.result.longestSequence}/{props.result.totalWords}
          </div>
          <div class="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            sequence
          </div>
        </div>

        <div class="text-center">
          <div class="text-4xl font-bold" style={{ color: 'var(--text)' }}>
            {props.result.wordMatchCount}/{props.result.totalWords}
          </div>
          <div class="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            words
          </div>
        </div>

        <div class="text-center">
          <div class="text-4xl font-bold" style={{ color: 'var(--text)' }}>
            {props.result.positionMatchCount}/{props.result.totalWords}
          </div>
          <div class="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            position
          </div>
        </div>
      </div>

      <button
        onClick={props.onTryAgain}
        class="w-full py-3 font-medium transition-opacity hover:opacity-70"
        style={{ color: 'var(--text)', border: '1px solid var(--text-muted)' }}
      >
        try again
      </button>
    </div>
  );
}
