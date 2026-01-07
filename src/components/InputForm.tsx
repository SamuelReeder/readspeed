interface InputFormProps {
  value: string;
  onInput: (value: string) => void;
  onSubmit: () => void;
  disabled: boolean;
  placeholder?: string;
}

export function InputForm(props: InputFormProps) {
  const handleSubmit = (e: Event) => {
    e.preventDefault();
    props.onSubmit();
  };

  return (
    <form onSubmit={handleSubmit} class="space-y-4">
      <label class="block text-sm font-medium text-gray-300">
        Type what you remember
      </label>
      <textarea
        value={props.value}
        onInput={(e) => props.onInput(e.currentTarget.value)}
        disabled={props.disabled}
        placeholder={props.placeholder || 'Type the words you saw...'}
        rows={4}
        class="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none disabled:opacity-50"
      />
      <button
        type="submit"
        disabled={props.disabled || !props.value.trim()}
        class="w-full px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Submit Answer
      </button>
    </form>
  );
}
