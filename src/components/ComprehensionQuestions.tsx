import { createSignal, Show, For } from 'solid-js';
import type { PassageQuestion } from '../data/passages';

interface ComprehensionQuestionsProps {
  questions: PassageQuestion[];
  onComplete: (answers: string[]) => void;
}

export function ComprehensionQuestions(props: ComprehensionQuestionsProps) {
  const [currentIndex, setCurrentIndex] = createSignal(0);
  const [answers, setAnswers] = createSignal<string[]>(props.questions.map(() => ''));
  const [currentAnswer, setCurrentAnswer] = createSignal('');

  const currentQuestion = () => props.questions[currentIndex()];
  const isLastQuestion = () => currentIndex() === props.questions.length - 1;

  const handleNext = () => {
    // Save current answer
    const newAnswers = [...answers()];
    newAnswers[currentIndex()] = currentAnswer();
    setAnswers(newAnswers);

    if (isLastQuestion()) {
      props.onComplete(newAnswers);
    } else {
      setCurrentIndex(i => i + 1);
      setCurrentAnswer(answers()[currentIndex() + 1] || '');
    }
  };

  const handleSkip = () => {
    // Save empty answer and move on
    const newAnswers = [...answers()];
    newAnswers[currentIndex()] = '';
    setAnswers(newAnswers);

    if (isLastQuestion()) {
      props.onComplete(newAnswers);
    } else {
      setCurrentIndex(i => i + 1);
      setCurrentAnswer(answers()[currentIndex() + 1] || '');
    }
  };

  return (
    <div class="space-y-6">
      <div class="text-center">
        <span class="text-xs" style={{ color: 'var(--text-muted)' }}>
          Question {currentIndex() + 1} of {props.questions.length}
        </span>
      </div>

      <Show when={currentQuestion()}>
        <div class="space-y-4">
          <p class="text-lg font-medium" style={{ color: 'var(--text)' }}>
            {currentQuestion()?.question}
          </p>

          <textarea
            value={currentAnswer()}
            onInput={(e) => setCurrentAnswer(e.currentTarget.value)}
            placeholder="Type your answer..."
            rows={3}
            class="w-full p-3 text-base resize-none focus:outline-none"
            style={{
              background: 'transparent',
              color: 'var(--text)',
              border: '1px solid var(--text-muted)'
            }}
            autofocus
          />

          <div class="flex gap-4">
            <button
              onClick={handleSkip}
              class="flex-1 py-3 font-medium transition-opacity hover:opacity-70"
              style={{ color: 'var(--text-muted)', border: '1px solid var(--text-muted)' }}
            >
              skip
            </button>
            <button
              onClick={handleNext}
              class="flex-1 py-3 font-medium transition-opacity hover:opacity-70"
              style={{ color: 'var(--text)', border: '1px solid var(--text-muted)' }}
            >
              {isLastQuestion() ? 'done' : 'next'}
            </button>
          </div>
        </div>
      </Show>

      {/* Progress dots */}
      <div class="flex justify-center gap-2">
        <For each={props.questions}>
          {(_, i) => (
            <div
              class="w-2 h-2 rounded-full transition-all"
              style={{
                background: i() <= currentIndex() ? 'var(--text)' : 'var(--text-muted)',
                opacity: i() === currentIndex() ? 1 : 0.5
              }}
            />
          )}
        </For>
      </div>
    </div>
  );
}
