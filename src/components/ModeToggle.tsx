interface ModeToggleProps {
  mode: 'speed' | 'comprehension';
  onModeChange: (mode: 'speed' | 'comprehension') => void;
  disabled: boolean;
}

export function ModeToggle(props: ModeToggleProps) {
  return (
    <div class="flex justify-center items-center gap-3 text-sm">
      <button
        type="button"
        class="transition-opacity hover:opacity-70"
        style={{
          color: props.mode === 'speed' ? 'var(--text)' : 'var(--text-muted)',
          'border-bottom': props.mode === 'speed' ? '1px solid var(--text)' : '1px solid transparent'
        }}
        onClick={() => props.onModeChange('speed')}
        disabled={props.disabled}
      >
        random
      </button>
      <span style={{ color: 'var(--text-muted)' }}>·</span>
      <button
        type="button"
        class="transition-opacity hover:opacity-70"
        style={{
          color: props.mode === 'comprehension' ? 'var(--text)' : 'var(--text-muted)',
          'border-bottom': props.mode === 'comprehension' ? '1px solid var(--text)' : '1px solid transparent'
        }}
        onClick={() => props.onModeChange('comprehension')}
        disabled={props.disabled}
      >
        passages
      </button>
    </div>
  );
}
