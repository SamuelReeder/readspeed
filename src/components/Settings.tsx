interface SettingsProps {
  intervalMs: number;
  onIntervalChange: (ms: number) => void;
  disabled: boolean;
}

const presets = [
  { label: '1s', value: 1000 },
  { label: '500ms', value: 500 },
  { label: '300ms', value: 300 },
  { label: '200ms', value: 200 },
  { label: '100ms', value: 100 },
];

export function Settings(props: SettingsProps) {
  return (
    <div class="space-y-6">
      <div class="flex justify-center gap-4">
        {presets.map(preset => (
          <button
            type="button"
            class="px-3 py-1 text-sm transition-opacity hover:opacity-70"
            style={{
              color: props.intervalMs === preset.value ? 'var(--text)' : 'var(--text-muted)',
              'border-bottom': props.intervalMs === preset.value ? '1px solid var(--text)' : '1px solid transparent'
            }}
            onClick={() => props.onIntervalChange(preset.value)}
            disabled={props.disabled}
          >
            {preset.label}
          </button>
        ))}
      </div>

      <div class="flex items-center justify-center gap-4">
        <input
          type="range"
          min="50"
          max="2000"
          step="50"
          value={props.intervalMs}
          onInput={(e) => props.onIntervalChange(parseInt(e.currentTarget.value))}
          disabled={props.disabled}
          class="w-48 h-px appearance-none cursor-pointer"
          style={{ background: 'var(--text-muted)' }}
        />
        <span class="text-sm w-16" style={{ color: 'var(--text-muted)' }}>
          {props.intervalMs}ms
        </span>
      </div>
    </div>
  );
}
