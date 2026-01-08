import { corpus } from '../data/corpus';

interface MarkovChain {
  [word: string]: string[];
}

// Words that can start a sentence (after period, or at start)
let sentenceStarters: string[] = [];
let chain: MarkovChain = {};
let isBuilt = false;

function normalizeWord(word: string): string {
  return word.toLowerCase().replace(/[^a-z']/g, '');
}

function buildChain(): void {
  if (isBuilt) return;

  const words = corpus.split(/\s+/).filter(w => w.length > 0);
  chain = {};
  sentenceStarters = [];

  let isStartOfSentence = true;

  for (let i = 0; i < words.length - 1; i++) {
    const currentWord = words[i];
    const nextWord = words[i + 1];

    const normalizedCurrent = normalizeWord(currentWord);
    const normalizedNext = normalizeWord(nextWord);

    if (!normalizedCurrent || !normalizedNext) continue;

    // Track sentence starters
    if (isStartOfSentence && normalizedCurrent) {
      sentenceStarters.push(normalizedCurrent);
      isStartOfSentence = false;
    }

    // Check if current word ends a sentence
    if (currentWord.match(/[.!?]$/)) {
      isStartOfSentence = true;
    }

    // Add to chain
    if (!chain[normalizedCurrent]) {
      chain[normalizedCurrent] = [];
    }
    chain[normalizedCurrent].push(normalizedNext);
  }

  // Deduplicate sentence starters but keep frequency weighting
  // (more common starters will appear more often)
  isBuilt = true;
}

function getRandomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function generateSentence(wordCount: number = 20, startWord?: string): string {
  buildChain();

  if (sentenceStarters.length === 0) {
    return 'the quick brown fox jumps over the lazy dog';
  }

  const words: string[] = [];

  // Use provided startWord if it exists in chain, otherwise pick a random starter
  let currentWord: string;
  if (startWord && chain[startWord]) {
    currentWord = startWord;
  } else {
    currentWord = getRandomElement(sentenceStarters);
  }
  words.push(currentWord);

  // Get all words that have transitions (for dead-end recovery)
  const allChainWords = Object.keys(chain);

  for (let i = 1; i < wordCount; i++) {
    const nextOptions = chain[currentWord];

    if (!nextOptions || nextOptions.length === 0) {
      // Dead end - pick any word from chain (not a sentence starter)
      // This maintains flow without semantic "new sentence" breaks
      currentWord = getRandomElement(allChainWords);
    } else {
      currentWord = getRandomElement(nextOptions);
    }

    words.push(currentWord);
  }

  return words.join(' ');
}

// Export for testing
export function getChainStats(): { words: number; starters: number } {
  buildChain();
  return {
    words: Object.keys(chain).length,
    starters: sentenceStarters.length,
  };
}
