import { Show } from 'solid-js';

interface WordDisplayProps {
  word: string;
  isRunning: boolean;
  isFinished: boolean;
}

export function WordDisplay(props: WordDisplayProps) {
  return (
    <div class="flex items-center justify-center h-32">
      <Show
        when={props.isRunning}
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
          style={{ color: 'var(--text)' }}
        >
          {props.word}
        </span>
      </Show>
    </div>
  );
}
