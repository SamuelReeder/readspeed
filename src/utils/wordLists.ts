import { generateSentence } from './markov';

export function getRandomText(wordCount: number = 10, startWord?: string): string {
  return generateSentence(wordCount, startWord);
}

export function splitIntoWords(text: string): string[] {
  return text.split(/\s+/).filter(word => word.length > 0);
}
