interface ModeToggleProps {
  mode: 'speed' | 'comprehension';
  onModeChange: (mode: 'speed' | 'comprehension') => void;
  disabled: boolean;
}

export function ModeToggle(props: ModeToggleProps) {
  return (
    <div class="flex justify-center gap-1 p-1" style={{ border: '1px solid var(--text-muted)' }}>
      <button
        type="button"
        class="px-4 py-2 text-sm font-medium transition-all"
        style={{
          background: props.mode === 'speed' ? 'var(--text)' : 'transparent',
          color: props.mode === 'speed' ? 'var(--bg)' : 'var(--text-muted)'
        }}
        onClick={() => props.onModeChange('speed')}
        disabled={props.disabled}
      >
        speed test
      </button>
      <button
        type="button"
        class="px-4 py-2 text-sm font-medium transition-all"
        style={{
          background: props.mode === 'comprehension' ? 'var(--text)' : 'transparent',
          color: props.mode === 'comprehension' ? 'var(--bg)' : 'var(--text-muted)'
        }}
        onClick={() => props.onModeChange('comprehension')}
        disabled={props.disabled}
      >
        comprehension
      </button>
    </div>
  );
}
