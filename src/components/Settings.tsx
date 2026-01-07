interface SettingsProps {
  intervalMs: number;
  onIntervalChange: (ms: number) => void;
  wordCount: number;
  onWordCountChange: (count: number) => void;
  disabled: boolean;
}

const presets = [
  { label: '300ms', wpm: 200, value: 300 },
  { label: '200ms', wpm: 300, value: 200 },
  { label: '100ms', wpm: 600, value: 100 },
  { label: '67ms', wpm: 900, value: 67 },
];

export function Settings(props: SettingsProps) {
  return (
    <div class="space-y-6">
      <div class="flex justify-center gap-4">
        {presets.map(preset => (
          <button
            type="button"
            class="px-3 py-1 text-sm whitespace-nowrap transition-opacity hover:opacity-70"
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

      <div class="flex items-center justify-center gap-8">
        <div class="flex items-center gap-2">
          <input
            type="range"
            min="50"
            max="500"
            step="1"
            value={props.intervalMs}
            onInput={(e) => props.onIntervalChange(parseInt(e.currentTarget.value))}
            disabled={props.disabled}
            class="w-32 h-px appearance-none cursor-pointer"
            style={{ background: 'var(--text-muted)', direction: 'rtl' }}
          />
          <span class="text-sm whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>
            {props.intervalMs}ms · {Math.round(60000 / props.intervalMs)} wpm
          </span>
        </div>

        <div class="flex items-center gap-2">
          <input
            type="range"
            min="5"
            max="20"
            step="1"
            value={props.wordCount}
            onInput={(e) => props.onWordCountChange(parseInt(e.currentTarget.value))}
            disabled={props.disabled}
            class="w-24 h-px appearance-none cursor-pointer"
            style={{ background: 'var(--text-muted)' }}
          />
          <span class="text-sm whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>
            {props.wordCount} words
          </span>
        </div>
      </div>
    </div>
  );
}
