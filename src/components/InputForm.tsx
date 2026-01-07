interface InputFormProps {
  value: string;
  onInput: (value: string) => void;
  onSubmit: () => void;
  disabled: boolean;
}

export function InputForm(props: InputFormProps) {
  const handleSubmit = (e: Event) => {
    e.preventDefault();
    props.onSubmit();
  };

  return (
    <form onSubmit={handleSubmit} class="space-y-6">
      <textarea
        value={props.value}
        onInput={(e) => props.onInput(e.currentTarget.value)}
        disabled={props.disabled}
        placeholder="type what you remember..."
        rows={4}
        class="w-full px-4 py-3 bg-transparent resize-none focus:outline-none"
        style={{
          color: 'var(--text)',
          border: '1px solid var(--text-muted)'
        }}
        autofocus
      />
      <button
        type="submit"
        disabled={props.disabled || !props.value.trim()}
        class="w-full py-3 font-medium transition-opacity hover:opacity-70 disabled:opacity-30 disabled:cursor-not-allowed"
        style={{ color: 'var(--text)', border: '1px solid var(--text-muted)' }}
      >
        submit
      </button>
    </form>
  );
}
