export interface ComparisonItem {
  original: string;
  user: string | null;
  correct: boolean;
}

export interface ScoreResult {
  substitutions: number;
  deletions: number;
  insertions: number;
  totalWords: number;
  accuracy: number;
  wordsPerMinute: number;
  comparison: ComparisonItem[];
}

function normalizeWord(word: string): string {
  return word.toLowerCase().replace(/[^a-z0-9]/g, '');
}

// Compute edit distance and return operation counts
function computeEditDistance(original: string[], user: string[]): {
  substitutions: number;
  deletions: number;
  insertions: number;
} {
  const m = original.length;
  const n = user.length;

  const normalizedOrig = original.map(normalizeWord);
  const normalizedUser = user.map(normalizeWord);

  // dp[i][j] = min edits to transform original[0..i-1] to user[0..j-1]
  const dp: number[][] = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));

  // Base cases
  for (let i = 0; i <= m; i++) dp[i][0] = i; // deletions
  for (let j = 0; j <= n; j++) dp[0][j] = j; // insertions

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (normalizedOrig[i - 1] === normalizedUser[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1]; // match, no cost
      } else {
        dp[i][j] = 1 + Math.min(
          dp[i - 1][j - 1], // substitution
          dp[i - 1][j],     // deletion
          dp[i][j - 1]      // insertion
        );
      }
    }
  }

  // Backtrack to count operations
  let substitutions = 0;
  let deletions = 0;
  let insertions = 0;

  let i = m, j = n;
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && normalizedOrig[i - 1] === normalizedUser[j - 1]) {
      // Match
      i--;
      j--;
    } else if (i > 0 && j > 0 && dp[i][j] === dp[i - 1][j - 1] + 1) {
      // Substitution
      substitutions++;
      i--;
      j--;
    } else if (i > 0 && dp[i][j] === dp[i - 1][j] + 1) {
      // Deletion (word in original but not in user)
      deletions++;
      i--;
    } else {
      // Insertion (word in user but not in original)
      insertions++;
      j--;
    }
  }

  return { substitutions, deletions, insertions };
}

// Build comparison using edit distance alignment
// This properly shows substitutions as pairs (original word above, wrong word below)
function buildComparison(original: string[], user: string[]): ComparisonItem[] {
  const m = original.length;
  const n = user.length;

  const normalizedOrig = original.map(normalizeWord);
  const normalizedUser = user.map(normalizeWord);

  // Build edit distance table
  const dp: number[][] = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (normalizedOrig[i - 1] === normalizedUser[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j - 1], dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  // Backtrack to build comparison
  const comparison: ComparisonItem[] = [];
  let i = m, j = n;

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && normalizedOrig[i - 1] === normalizedUser[j - 1]) {
      // Match
      comparison.unshift({
        original: original[i - 1],
        user: user[j - 1],
        correct: true
      });
      i--;
      j--;
    } else if (i > 0 && j > 0 && dp[i][j] === dp[i - 1][j - 1] + 1) {
      // Substitution - show wrong word under original
      comparison.unshift({
        original: original[i - 1],
        user: user[j - 1],
        correct: false
      });
      i--;
      j--;
    } else if (i > 0 && dp[i][j] === dp[i - 1][j] + 1) {
      // Deletion - original word was missed
      comparison.unshift({
        original: original[i - 1],
        user: null,
        correct: false
      });
      i--;
    } else {
      // Insertion - extra word from user
      comparison.unshift({
        original: '',
        user: user[j - 1],
        correct: false
      });
      j--;
    }
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
      substitutions: 0,
      deletions: 0,
      insertions: 0,
      totalWords: 0,
      accuracy: 0,
      wordsPerMinute: 0,
      comparison: [],
    };
  }

  // Compute WER components
  const { substitutions, deletions, insertions } = computeEditDistance(originalWords, userWords);

  // WER-based accuracy (capped at 0-100%)
  const totalErrors = substitutions + deletions + insertions;
  const errorRate = Math.min(1, totalErrors / totalWords);
  const accuracy = (1 - errorRate) * 100;

  // Build comparison for display using edit distance alignment
  const comparison = buildComparison(originalWords, userWords);

  const durationMinutes = durationMs / 60000;
  const wordsPerMinute = durationMinutes > 0 ? totalWords / durationMinutes : 0;

  return {
    substitutions,
    deletions,
    insertions,
    totalWords,
    accuracy,
    wordsPerMinute,
    comparison,
  };
}
