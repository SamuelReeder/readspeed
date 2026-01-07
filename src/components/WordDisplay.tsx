import { Show } from 'solid-js';

interface WordDisplayProps {
  word: string;
  isRunning: boolean;
  isFinished: boolean;
}

export function WordDisplay(props: WordDisplayProps) {
  return (
    <div class="flex items-center justify-center h-48 bg-gray-900 rounded-lg border border-gray-700">
      <Show
        when={props.isRunning}
        fallback={
          <span class="text-gray-500 text-2xl">
            {props.isFinished ? 'Finished!' : 'Press Start to begin'}
          </span>
        }
      >
        <span class="text-6xl font-bold text-white animate-pulse">
          {props.word}
        </span>
      </Show>
    </div>
  );
}
