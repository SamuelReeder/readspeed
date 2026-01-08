export interface ComparisonItem {
  original: string;
  user: string | null;
  correct: boolean;
}

export interface ScoreResult {
  wordMatchCount: number;
  positionMatchCount: number;
  sequenceMatchCount: number;
  totalWords: number;
  accuracy: number;
  wordsPerMinute: number;
  comparison: ComparisonItem[];
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

// Compute LCS (Longest Common Subsequence) and return the matched indices
function computeLCS(original: string[], user: string[]): number[][] {
  const m = original.length;
  const n = user.length;

  const normalizedOrig = original.map(normalizeWord);
  const normalizedUser = user.map(normalizeWord);

  // Build LCS table
  const dp: number[][] = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (normalizedOrig[i - 1] === normalizedUser[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  // Backtrack to find matched pairs [origIndex, userIndex]
  const matches: number[][] = [];
  let i = m, j = n;
  while (i > 0 && j > 0) {
    if (normalizedOrig[i - 1] === normalizedUser[j - 1]) {
      matches.unshift([i - 1, j - 1]);
      i--;
      j--;
    } else if (dp[i - 1][j] > dp[i][j - 1]) {
      i--;
    } else {
      j--;
    }
  }

  return matches;
}

// Build comparison array from LCS matches
function buildComparison(original: string[], user: string[], lcsMatches: number[][]): ComparisonItem[] {
  const comparison: ComparisonItem[] = [];
  const matchedOrigIndices = new Set(lcsMatches.map(m => m[0]));
  const matchedUserIndices = new Set(lcsMatches.map(m => m[1]));

  let matchIdx = 0;
  let userIdx = 0;

  for (let origIdx = 0; origIdx < original.length; origIdx++) {
    if (matchedOrigIndices.has(origIdx)) {
      // This original word was matched
      const [, userMatchIdx] = lcsMatches[matchIdx];

      // Add any unmatched user words before this match as incorrect
      while (userIdx < userMatchIdx) {
        if (!matchedUserIndices.has(userIdx)) {
          comparison.push({
            original: '',
            user: user[userIdx],
            correct: false
          });
        }
        userIdx++;
      }

      comparison.push({
        original: original[origIdx],
        user: user[userMatchIdx],
        correct: true
      });
      userIdx = userMatchIdx + 1;
      matchIdx++;
    } else {
      // This original word was missed
      comparison.push({
        original: original[origIdx],
        user: null,
        correct: false
      });
    }
  }

  // Add any remaining unmatched user words
  while (userIdx < user.length) {
    if (!matchedUserIndices.has(userIdx)) {
      comparison.push({
        original: '',
        user: user[userIdx],
        correct: false
      });
    }
    userIdx++;
  }

  return comparison;
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
      sequenceMatchCount: 0,
      totalWords: 0,
      accuracy: 0,
      wordsPerMinute: 0,
      comparison: [],
    };
  }

  const wordMatchCount = countWordMatches(originalWords, userWords);
  const positionMatchCount = countPositionMatches(originalWords, userWords);

  // Use LCS for sequence matching - counts ALL matched words in sequence
  const lcsMatches = computeLCS(originalWords, userWords);
  const sequenceMatchCount = lcsMatches.length;

  // Build comparison for display
  const comparison = buildComparison(originalWords, userWords, lcsMatches);

  // Calculate weighted accuracy (50% sequences, 25% word match, 25% position)
  const sequenceScore = sequenceMatchCount / totalWords;
  const wordMatchScore = Math.min(wordMatchCount / totalWords, 1);
  const positionScore = positionMatchCount / totalWords;

  const accuracy = (sequenceScore * 0.5 + wordMatchScore * 0.25 + positionScore * 0.25) * 100;

  const durationMinutes = durationMs / 60000;
  const wordsPerMinute = durationMinutes > 0 ? totalWords / durationMinutes : 0;

  return {
    wordMatchCount,
    positionMatchCount,
    sequenceMatchCount,
    totalWords,
    accuracy,
    wordsPerMinute,
    comparison,
  };
}
