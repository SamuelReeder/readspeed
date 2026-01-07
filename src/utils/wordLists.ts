export const sampleTexts = [
  `The quick brown fox jumps over the lazy dog. This sentence contains every letter of the alphabet and is commonly used for typing practice.`,
  `Reading is to the mind what exercise is to the body. As by the one health is preserved, strengthened, and invigorated: by the other virtue, which is the health of the mind, is kept alive, cherished, and confirmed.`,
  `The sun was setting behind the mountains, casting long shadows across the valley below. Birds flew home to their nests, and the world grew quiet as night approached.`,
  `Technology has transformed the way we communicate and access information. The internet connects billions of people around the world, enabling instant communication across vast distances.`,
  `Music has the power to evoke emotions and memories in ways that words alone cannot. A single melody can transport us back in time, reminding us of people and places long forgotten.`,
];

export function getRandomText(): string {
  return sampleTexts[Math.floor(Math.random() * sampleTexts.length)];
}

export function splitIntoWords(text: string): string[] {
  return text.split(/\s+/).filter(word => word.length > 0);
}
