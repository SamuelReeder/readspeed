import { Show, createMemo } from 'solid-js';

interface WordDisplayProps {
  word: string;
  isRunning: boolean;
  isFinished: boolean;
}

export function WordDisplay(props: WordDisplayProps) {
  // Calculate middle index - for even length words, choose the earlier letter
  const middleIndex = createMemo(() => Math.floor((props.word.length - 1) / 2));

  const before = createMemo(() => props.word.slice(0, middleIndex()));
  const middle = createMemo(() => props.word[middleIndex()] || '');
  const after = createMemo(() => props.word.slice(middleIndex() + 1));

  // Calculate shift to keep middle letter centered
  // Positive value shifts right, negative shifts left
  const shift = createMemo(() => {
    const beforeLen = before().length;
    const afterLen = after().length;
    return (afterLen - beforeLen) * 0.5;
  });

  const showWord = () => !props.isFinished && props.word;

  return (
    <div class="flex items-center justify-center h-32">
      <Show
        when={showWord()}
        fallback={
          <span
            class="text-2xl"
            style={{ color: 'var(--text-muted)' }}
          >
            {props.isFinished ? 'done' : ''}
          </span>
        }
      >
        <span
          class="text-5xl md:text-6xl font-bold"
          style={{
            color: 'var(--text)',
            transform: `translateX(${shift()}ch)`
          }}
        >
          <span>{before()}</span>
          <span style={{ color: 'var(--accent)' }}>{middle()}</span>
          <span>{after()}</span>
        </span>
      </Show>
    </div>
  );
}
