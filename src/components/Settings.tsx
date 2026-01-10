import { Show } from 'solid-js';

interface SettingsProps {
  intervalMs: number;
  onIntervalChange: (ms: number) => void;
  wordCount: number;
  onWordCountChange: (count: number) => void;
  disabled: boolean;
  showWordCount?: boolean;
}

const presets = [
  { label: '300ms', wpm: 200, value: 300 },
  { label: '200ms', wpm: 300, value: 200 },
  { label: '100ms', wpm: 600, value: 100 },
];

export function Settings(props: SettingsProps) {
  return (
    <div class="space-y-4">
      {/* Speed presets */}
      <div class="flex justify-center gap-4">
        {presets.map(preset => (
          <button
            type="button"
            class="text-sm transition-opacity hover:opacity-70"
            style={{
              color: props.intervalMs === preset.value ? 'var(--text)' : 'var(--text-muted)',
              'border-bottom': props.intervalMs === preset.value ? '1px solid var(--text)' : '1px solid transparent'
            }}
            onClick={() => props.onIntervalChange(preset.value)}
            disabled={props.disabled}
          >
            {preset.label} · {preset.wpm} wpm
          </button>
        ))}
      </div>

      {/* Sliders row */}
      <div class="flex items-center justify-center gap-6">
        {/* Speed slider */}
        <div class="flex items-center gap-2">
          <input
            type="range"
            min="50"
            max="500"
            step="1"
            value={props.intervalMs}
            onInput={(e) => props.onIntervalChange(parseInt(e.currentTarget.value))}
            disabled={props.disabled}
            class="w-24 h-px appearance-none cursor-pointer"
            style={{ background: 'var(--text-muted)', direction: 'rtl' }}
          />
          <span class="text-xs whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>
            {Math.round(60000 / props.intervalMs)} wpm
          </span>
        </div>

        {/* Word count slider - hidden for passages mode */}
        <Show when={props.showWordCount !== false}>
          <div class="flex items-center gap-2">
            <input
              type="range"
              min="5"
              max="20"
              step="1"
              value={props.wordCount}
              onInput={(e) => props.onWordCountChange(parseInt(e.currentTarget.value))}
              disabled={props.disabled}
              class="w-20 h-px appearance-none cursor-pointer"
              style={{ background: 'var(--text-muted)' }}
            />
            <span class="text-xs whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>
              {props.wordCount} words
            </span>
          </div>
        </Show>
      </div>
    </div>
  );
}
