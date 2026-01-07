import { Show, For } from 'solid-js';
import type { SessionRecord } from '../primitives/createStats';

interface StatsProps {
  sessions: SessionRecord[];
  averageAccuracy: number;
  bestAccuracy: number;
  onClear: () => void;
}

export function Stats(props: StatsProps) {
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div class="bg-gray-800 rounded-lg p-6 space-y-4">
      <div class="flex items-center justify-between">
        <h2 class="text-xl font-bold text-white">Statistics</h2>
        <Show when={props.sessions.length > 0}>
          <button
            onClick={props.onClear}
            class="text-sm text-red-400 hover:text-red-300"
          >
            Clear All
          </button>
        </Show>
      </div>

      <Show
        when={props.sessions.length > 0}
        fallback={
          <p class="text-gray-500 text-center py-4">No sessions yet</p>
        }
      >
        <div class="grid grid-cols-2 gap-4 mb-4">
          <div class="bg-gray-700 rounded p-3 text-center">
            <div class="text-2xl font-bold text-green-400">
              {props.averageAccuracy.toFixed(1)}%
            </div>
            <div class="text-xs text-gray-400">Avg Accuracy</div>
          </div>
          <div class="bg-gray-700 rounded p-3 text-center">
            <div class="text-2xl font-bold text-yellow-400">
              {props.bestAccuracy.toFixed(1)}%
            </div>
            <div class="text-xs text-gray-400">Best Score</div>
          </div>
        </div>

        <div class="space-y-2 max-h-64 overflow-y-auto">
          <For each={props.sessions.slice(0, 10)}>
            {(session) => (
              <div class="flex items-center justify-between bg-gray-700 rounded px-3 py-2 text-sm">
                <span class="text-gray-400">{formatDate(session.timestamp)}</span>
                <span class="text-white font-medium">
                  {session.accuracy.toFixed(1)}% @ {session.intervalMs}ms
                </span>
              </div>
            )}
          </For>
        </div>
      </Show>
    </div>
  );
}
