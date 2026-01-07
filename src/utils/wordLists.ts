import { generateSentence } from './markov';

export function getRandomText(wordCount: number = 10): string {
  return generateSentence(wordCount);
}

export function splitIntoWords(text: string): string[] {
  return text.split(/\s+/).filter(word => word.length > 0);
}
