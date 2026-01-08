import { For } from 'solid-js';
import type { ScoreResult } from '../utils/scoring';

interface ResultsProps {
  result: ScoreResult;
  onTryAgain: () => void;
  onHome: () => void;
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
            {props.result.sequenceMatchCount}/{props.result.totalWords}
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

      {/* Visual comparison */}
      <div class="space-y-2 text-sm">
        <div class="flex flex-wrap gap-2 justify-center">
          <For each={props.result.comparison}>
            {(item) => (
              <div class="text-center">
                <div style={{ color: 'var(--text-muted)' }}>
                  {item.original || '\u00A0'}
                </div>
                <div style={{
                  color: item.correct ? '#22c55e' : '#ef4444'
                }}>
                  {item.user || (item.original ? '—' : '\u00A0')}
                </div>
              </div>
            )}
          </For>
        </div>
      </div>

      <div class="flex gap-4">
        <button
          onClick={props.onHome}
          class="flex-1 py-3 font-medium transition-opacity hover:opacity-70"
          style={{ color: 'var(--text-muted)', border: '1px solid var(--text-muted)' }}
        >
          home
        </button>
        <button
          onClick={props.onTryAgain}
          class="flex-1 py-3 font-medium transition-opacity hover:opacity-70"
          style={{ color: 'var(--text)', border: '1px solid var(--text-muted)' }}
        >
          try again
        </button>
      </div>
    </div>
  );
}
