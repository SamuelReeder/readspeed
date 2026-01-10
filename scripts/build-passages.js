/**
 * Fetch reading passages from Open Library API for comprehension mode.
 * Run with: node scripts/build-passages.js
 */

import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outputPath = join(__dirname, '../src/data/passages.ts');

// Subjects to fetch from (variety of topics)
const subjects = [
  'fiction',
  'classic_literature',
  'science',
  'history',
  'philosophy',
  'biography',
  'adventure',
  'mystery'
];

// Rate limiting helper
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Fetch with retry
async function fetchWithRetry(url, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      return await response.json();
    } catch (err) {
      if (i === retries - 1) throw err;
      console.log(`Retry ${i + 1}/${retries} for ${url}`);
      await sleep(1000 * (i + 1));
    }
  }
}

// Get works from a subject
async function getWorksFromSubject(subject, limit = 50) {
  const url = `https://openlibrary.org/subjects/${subject}.json?limit=${limit}`;
  console.log(`Fetching ${subject}...`);
  const data = await fetchWithRetry(url);
  return data.works || [];
}

// Get detailed work info including description
async function getWorkDetails(workKey) {
  const url = `https://openlibrary.org${workKey}.json`;
  const data = await fetchWithRetry(url);
  return data;
}

// Extract description text from work
function extractDescription(work) {
  if (!work.description) return null;

  // Description can be a string or an object with 'value' key
  if (typeof work.description === 'string') {
    return work.description;
  }
  if (work.description.value) {
    return work.description.value;
  }
  return null;
}

// Clean and validate passage text
function cleanText(text) {
  if (!text) return null;

  // Remove HTML tags
  let cleaned = text.replace(/<[^>]+>/g, '');

  // Remove markdown-style formatting
  cleaned = cleaned.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
  cleaned = cleaned.replace(/\*+/g, '');

  // Normalize whitespace
  cleaned = cleaned.replace(/\s+/g, ' ').trim();

  // Remove common prefixes
  cleaned = cleaned.replace(/^(Description:|Synopsis:|Summary:)\s*/i, '');

  return cleaned;
}

// Check if passage is suitable for reading practice
function isGoodPassage(text) {
  if (!text) return false;

  const words = text.split(/\s+/);
  const wordCount = words.length;

  // Want 50-150 words
  if (wordCount < 50 || wordCount > 150) return false;

  // Should end with proper punctuation
  if (!/[.!?]$/.test(text)) return false;

  // No excessive special characters
  const specialCount = (text.match(/[^\w\s.,!?;:'"()-]/g) || []).length;
  if (specialCount > 5) return false;

  // No URLs
  if (/https?:\/\/|www\./i.test(text)) return false;

  // No disclaimers or meta text
  if (/\b(copyright|isbn|edition|published|amazon|kindle)\b/i.test(text)) return false;

  return true;
}

// Generate questions from passage text
function generateQuestions(text, title, author) {
  const questions = [];

  // Always ask about the main topic/subject
  questions.push({
    question: "What is the main subject or topic of this passage?",
    expectedAnswer: `This passage is about "${title}"${author ? ` by ${author}` : ''}.`
  });

  // Extract key elements for more questions
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 20);

  if (sentences.length >= 2) {
    // Ask about something mentioned in the passage
    const firstSentence = sentences[0].trim();
    questions.push({
      question: "What is introduced or mentioned at the beginning of the passage?",
      expectedAnswer: firstSentence + '.'
    });
  }

  // Ask about the overall tone or purpose
  questions.push({
    question: "What type of writing is this (descriptive, narrative, informative)?",
    expectedAnswer: "This appears to be a descriptive/informative passage about a literary work."
  });

  return questions.slice(0, 3); // Max 3 questions
}

// Main fetch and process function
async function fetchPassages() {
  const passages = [];
  const seenIds = new Set();

  for (const subject of subjects) {
    try {
      const works = await getWorksFromSubject(subject, 30);
      console.log(`  Found ${works.length} works in ${subject}`);

      for (const work of works) {
        if (seenIds.has(work.key)) continue;
        seenIds.add(work.key);

        // Rate limit
        await sleep(100);

        try {
          const details = await getWorkDetails(work.key);
          const description = extractDescription(details);
          const cleaned = cleanText(description);

          if (isGoodPassage(cleaned)) {
            const author = work.authors?.[0]?.name || null;

            passages.push({
              id: work.key.replace('/works/', ''),
              text: cleaned,
              source: `"${work.title}"${author ? ` by ${author}` : ''} (Open Library)`,
              questions: generateQuestions(cleaned, work.title, author)
            });

            console.log(`    + Added: ${work.title} (${cleaned.split(/\s+/).length} words)`);

            // Stop if we have enough
            if (passages.length >= 100) break;
          }
        } catch (err) {
          // Skip works that fail to fetch
        }
      }

      if (passages.length >= 100) break;

    } catch (err) {
      console.error(`Error fetching ${subject}:`, err.message);
    }
  }

  console.log(`\nCollected ${passages.length} passages`);
  return passages;
}

// Generate TypeScript output
function generateOutput(passages) {
  // Escape strings for TypeScript
  const escape = (str) => str
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/\n/g, '\\n');

  const passagesJson = passages.map(p => `  {
    id: '${escape(p.id)}',
    text: '${escape(p.text)}',
    source: '${escape(p.source)}',
    questions: [
${p.questions.map(q => `      {
        question: '${escape(q.question)}',
        expectedAnswer: '${escape(q.expectedAnswer)}'
      }`).join(',\n')}
    ]
  }`).join(',\n');

  const output = `// Reading comprehension passages from Open Library
// Generated by: node scripts/build-passages.js
// Do not edit manually - regenerate to update

export interface PassageQuestion {
  question: string;
  expectedAnswer: string;
}

export interface Passage {
  id: string;
  text: string;
  source: string;
  questions: PassageQuestion[];
}

export const passages: Passage[] = [
${passagesJson}
];

// Get a random passage, optionally excluding already-seen IDs
export function getRandomPassage(excludeIds: string[] = []): Passage {
  const available = passages.filter(p => !excludeIds.includes(p.id));
  if (available.length === 0) {
    // If all seen, reset and pick any
    return passages[Math.floor(Math.random() * passages.length)];
  }
  return available[Math.floor(Math.random() * available.length)];
}
`;

  writeFileSync(outputPath, output, 'utf-8');
  const sizeKB = Math.round(output.length / 1024);
  console.log(`Written to ${outputPath} (${sizeKB}KB)`);
}

// Main
async function main() {
  console.log('Fetching passages from Open Library...\n');
  const passages = await fetchPassages();

  if (passages.length < 20) {
    console.error('Warning: Only collected ' + passages.length + ' passages');
  }

  generateOutput(passages);
  console.log('Done!');
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
