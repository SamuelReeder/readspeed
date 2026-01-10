import { For, Show } from 'solid-js';
import type { PassageQuestion } from '../data/passages';

interface ComprehensionReviewProps {
  source: string;
  wpm: number;
  wordsRead: number;
  questions: PassageQuestion[];
  userAnswers: string[];
  onTryAnother: () => void;
  onHome: () => void;
}

export function ComprehensionReview(props: ComprehensionReviewProps) {
  return (
    <div class="space-y-6">
      {/* Stats */}
      <div class="text-center space-y-2">
        <div class="text-3xl font-bold" style={{ color: 'var(--text)' }}>
          {props.wpm} wpm
        </div>
        <div class="text-sm" style={{ color: 'var(--text-muted)' }}>
          {props.wordsRead} words read
        </div>
        <div class="text-xs" style={{ color: 'var(--text-muted)' }}>
          {props.source}
        </div>
      </div>

      {/* Questions & Answers Review */}
      <div class="space-y-4">
        <div class="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
          Self-assessment
        </div>

        <For each={props.questions}>
          {(question, i) => (
            <div class="p-4 space-y-3" style={{ border: '1px solid var(--text-muted)' }}>
              <div class="text-sm font-medium" style={{ color: 'var(--text)' }}>
                {question.question}
              </div>

              <Show when={props.userAnswers[i()]} fallback={
                <div class="text-sm italic" style={{ color: 'var(--text-muted)' }}>
                  (skipped)
                </div>
              }>
                <div>
                  <div class="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>
                    Your answer:
                  </div>
                  <div class="text-sm" style={{ color: 'var(--text)' }}>
                    {props.userAnswers[i()]}
                  </div>
                </div>
              </Show>

              <div class="pt-2" style={{ 'border-top': '1px solid var(--text-muted)' }}>
                <div class="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>
                  Expected answer:
                </div>
                <div class="text-sm" style={{ color: 'var(--accent, var(--text))' }}>
                  {question.expectedAnswer}
                </div>
              </div>
            </div>
          )}
        </For>
      </div>

      {/* Actions */}
      <div class="flex gap-4">
        <button
          onClick={props.onHome}
          class="flex-1 py-3 font-medium transition-opacity hover:opacity-70"
          style={{ color: 'var(--text-muted)', border: '1px solid var(--text-muted)' }}
        >
          home
        </button>
        <button
          onClick={props.onTryAnother}
          class="flex-1 py-3 font-medium transition-opacity hover:opacity-70"
          style={{ color: 'var(--text)', border: '1px solid var(--text-muted)' }}
        >
          try another
        </button>
      </div>
    </div>
  );
}
