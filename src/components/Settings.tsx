interface SettingsProps {
  intervalMs: number;
  onIntervalChange: (ms: number) => void;
  disabled: boolean;
}

const presets = [
  { label: 'Slow (1s)', value: 1000 },
  { label: 'Medium (500ms)', value: 500 },
  { label: 'Fast (300ms)', value: 300 },
  { label: 'Very Fast (200ms)', value: 200 },
  { label: 'Extreme (100ms)', value: 100 },
];

export function Settings(props: SettingsProps) {
  return (
    <div class="space-y-4">
      <label class="block text-sm font-medium text-gray-300">
        Word Display Speed
      </label>

      <div class="flex flex-wrap gap-2">
        {presets.map(preset => (
          <button
            type="button"
            class={`px-3 py-1.5 rounded text-sm transition-colors ${
              props.intervalMs === preset.value
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            } ${props.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={() => props.onIntervalChange(preset.value)}
            disabled={props.disabled}
          >
            {preset.label}
          </button>
        ))}
      </div>

      <div class="flex items-center gap-4">
        <input
          type="range"
          min="50"
          max="2000"
          step="50"
          value={props.intervalMs}
          onInput={(e) => props.onIntervalChange(parseInt(e.currentTarget.value))}
          disabled={props.disabled}
          class="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
        />
        <span class="text-sm text-gray-400 w-20">{props.intervalMs}ms</span>
      </div>
    </div>
  );
}
