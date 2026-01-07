export interface ScoreResult {
  wordMatchCount: number;
  positionMatchCount: number;
  longestSequence: number;
  totalWords: number;
  accuracy: number;
  wordsPerMinute: number;
}

function normalizeWord(word: string): string {
  return word.toLowerCase().replace(/[^a-z0-9]/g, '');
}

// Count words that appear in both inputs (using multiset for duplicates)
function countWordMatches(original: string[], user: string[]): number {
  const originalCounts = new Map<string, number>();
  for (const word of original) {
    const normalized = normalizeWord(word);
    originalCounts.set(normalized, (originalCounts.get(normalized) || 0) + 1);
  }

  let matches = 0;
  for (const word of user) {
    const normalized = normalizeWord(word);
    const count = originalCounts.get(normalized) || 0;
    if (count > 0) {
      matches++;
      originalCounts.set(normalized, count - 1);
    }
  }

  return matches;
}

// Count words at exact same index
function countPositionMatches(original: string[], user: string[]): number {
  let matches = 0;
  const minLen = Math.min(original.length, user.length);

  for (let i = 0; i < minLen; i++) {
    if (normalizeWord(original[i]) === normalizeWord(user[i])) {
      matches++;
    }
  }

  return matches;
}

// Find longest consecutive matching sequence
function findLongestSequence(original: string[], user: string[]): number {
  if (user.length === 0 || original.length === 0) return 0;

  const normalizedOriginal = original.map(normalizeWord);
  const normalizedUser = user.map(normalizeWord);

  let longest = 0;

  // For each starting position in user input
  for (let userStart = 0; userStart < normalizedUser.length; userStart++) {
    // Try to find this sequence starting anywhere in original
    for (let origStart = 0; origStart < normalizedOriginal.length; origStart++) {
      let length = 0;
      let u = userStart;
      let o = origStart;

      // Count consecutive matches
      while (
        u < normalizedUser.length &&
        o < normalizedOriginal.length &&
        normalizedUser[u] === normalizedOriginal[o]
      ) {
        length++;
        u++;
        o++;
      }

      longest = Math.max(longest, length);
    }
  }

  return longest;
}

export function calculateScore(
  originalWords: string[],
  userInput: string,
  durationMs: number
): ScoreResult {
  const userWords = userInput.split(/\s+/).filter(w => w.length > 0);
  const totalWords = originalWords.length;

  if (totalWords === 0) {
    return {
      wordMatchCount: 0,
      positionMatchCount: 0,
      longestSequence: 0,
      totalWords: 0,
      accuracy: 0,
      wordsPerMinute: 0,
    };
  }

  const wordMatchCount = countWordMatches(originalWords, userWords);
  const positionMatchCount = countPositionMatches(originalWords, userWords);
  const longestSequence = findLongestSequence(originalWords, userWords);

  // Calculate weighted accuracy (50% sequences, 25% word match, 25% position)
  const sequenceScore = longestSequence / totalWords;
  const wordMatchScore = Math.min(wordMatchCount / totalWords, 1);
  const positionScore = positionMatchCount / totalWords;

  const accuracy = (sequenceScore * 0.5 + wordMatchScore * 0.25 + positionScore * 0.25) * 100;

  const durationMinutes = durationMs / 60000;
  const wordsPerMinute = durationMinutes > 0 ? totalWords / durationMinutes : 0;

  return {
    wordMatchCount,
    positionMatchCount,
    longestSequence,
    totalWords,
    accuracy,
    wordsPerMinute,
  };
}
