export interface ScoreResult {
  correctWords: number;
  totalWords: number;
  accuracy: number;
  wordsPerMinute: number;
}

function normalizeWord(word: string): string {
  return word.toLowerCase().replace(/[^a-z0-9]/g, '');
}

export function calculateScore(
  originalWords: string[],
  userInput: string,
  durationMs: number
): ScoreResult {
  const userWords = userInput.split(/\s+/).filter(w => w.length > 0);

  let correctWords = 0;
  const totalWords = originalWords.length;

  // Compare word by word, allowing for some flexibility
  for (let i = 0; i < Math.min(userWords.length, originalWords.length); i++) {
    const original = normalizeWord(originalWords[i]);
    const user = normalizeWord(userWords[i]);

    if (original === user) {
      correctWords++;
    }
  }

  const accuracy = totalWords > 0 ? (correctWords / totalWords) * 100 : 0;
  const durationMinutes = durationMs / 60000;
  const wordsPerMinute = durationMinutes > 0 ? totalWords / durationMinutes : 0;

  return {
    correctWords,
    totalWords,
    accuracy,
    wordsPerMinute,
  };
}
