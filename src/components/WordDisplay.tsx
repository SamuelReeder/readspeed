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

  // Shift entire word so middle letter's center aligns with screen center
  // Formula: (wordLength / 2) - middleIndex - 0.5
  const shift = createMemo(() => {
    const len = props.word.length;
    const mid = middleIndex();
    return (len / 2) - mid - 0.5;
  });

  const showWord = () => !props.isFinished && props.word;

  return (
    <div class="flex flex-col items-center justify-center h-40">
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
        {/* Top bar - fixed at center */}
        <div
          class="w-1 h-4 mb-2"
          style={{ background: 'var(--text-muted)' }}
        />

        {/* Word - shifted so middle letter's center is at screen center */}
        <span
          class="text-6xl md:text-7xl font-bold"
          style={{
            color: 'var(--text)',
            transform: `translateX(${shift()}ch)`
          }}
        >
          <span>{before()}</span>
          <span style={{ color: 'var(--accent)' }}>{middle()}</span>
          <span>{after()}</span>
        </span>

        {/* Bottom bar - fixed at center */}
        <div
          class="w-1 h-4 mt-2"
          style={{ background: 'var(--text-muted)' }}
        />
      </Show>
    </div>
  );
}
