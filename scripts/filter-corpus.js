/**
 * Filter nlp-corpus down to clean prose suitable for reading speed training.
 * Run with: node scripts/filter-corpus.js
 */

import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const corpusDir = join(__dirname, '../node_modules/nlp-corpus/builds');
const outputPath = join(__dirname, '../src/data/corpus.ts');

// Words to filter out (profanity, slurs, etc.)
const badWords = new Set([
  'fuck', 'fucking', 'fucked', 'shit', 'shitty', 'damn', 'damned',
  'ass', 'asshole', 'bitch', 'bastard', 'crap', 'piss', 'dick',
  'cock', 'pussy', 'whore', 'slut', 'nigger', 'faggot', 'retard'
]);

function containsBadWord(sentence) {
  const words = sentence.toLowerCase().split(/\s+/);
  return words.some(w => {
    const cleaned = w.replace(/[^a-z]/g, '');
    return badWords.has(cleaned);
  });
}

function hasExcessiveSpecialChars(sentence) {
  // Count special characters (excluding basic punctuation)
  const specialCount = (sentence.match(/[^\w\s.,!?;:'"()-]/g) || []).length;
  return specialCount > 2;
}

function hasEmoji(sentence) {
  // Basic emoji detection
  return /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u.test(sentence);
}

function isGoodSentence(sentence) {
  if (!sentence || typeof sentence !== 'string') return false;

  const words = sentence.trim().split(/\s+/);
  const wordCount = words.length;

  // Keep sentences with 5-20 words
  if (wordCount < 5 || wordCount > 20) return false;

  // No profanity
  if (containsBadWord(sentence)) return false;

  // No excessive special characters or emoji
  if (hasExcessiveSpecialChars(sentence)) return false;
  if (hasEmoji(sentence)) return false;

  // Skip sentences that look like metadata/headers
  if (/^[A-Z][A-Z\s]+:/.test(sentence)) return false;
  if (/^\d+\./.test(sentence)) return false;
  if (/^\([a-z]\)/.test(sentence)) return false;

  // Skip very short sentences that are likely incomplete
  if (sentence.length < 30) return false;

  // Skip sentences with too many numbers (likely data/statistics)
  const digitCount = (sentence.match(/\d/g) || []).length;
  if (digitCount > 5) return false;

  // Skip sentences with URLs
  if (/https?:\/\/|www\./i.test(sentence)) return false;

  return true;
}

function loadAndFilterCorpus() {
  const files = readdirSync(corpusDir).filter(f => f.endsWith('.json'));
  const allSentences = [];

  console.log(`Loading ${files.length} corpus files...`);

  for (const file of files) {
    try {
      const content = readFileSync(join(corpusDir, file), 'utf-8');
      const sentences = JSON.parse(content);
      allSentences.push(...sentences);
    } catch (err) {
      console.error(`Error loading ${file}:`, err.message);
    }
  }

  console.log(`Loaded ${allSentences.length} total sentences`);

  // Filter sentences
  const filtered = allSentences.filter(isGoodSentence);
  console.log(`Filtered to ${filtered.length} good sentences`);

  // Shuffle for variety
  for (let i = filtered.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [filtered[i], filtered[j]] = [filtered[j], filtered[i]];
  }

  // Take enough to hit our target size (~150KB)
  // Each sentence averages ~80 chars, so ~2000 sentences ≈ 160KB
  const targetSentences = Math.min(filtered.length, 2000);
  const selected = filtered.slice(0, targetSentences);

  console.log(`Selected ${selected.length} sentences for corpus`);

  return selected;
}

function generateCorpusFile(sentences) {
  // Escape backticks and backslashes for template literal safety
  const escapedSentences = sentences.map(s =>
    s.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\${/g, '\\${')
  );
  const corpusText = escapedSentences.join('\n\n');

  const output = `// Training corpus for Markov chain text generation
// Generated from nlp-corpus, filtered for clean prose
// Run \`node scripts/filter-corpus.js\` to regenerate

export const corpus = \`
${corpusText}
\`;
`;

  writeFileSync(outputPath, output, 'utf-8');

  const sizeKB = Math.round(output.length / 1024);
  console.log(`Written to ${outputPath} (${sizeKB}KB)`);
}

// Main
const sentences = loadAndFilterCorpus();
generateCorpusFile(sentences);
console.log('Done!');
