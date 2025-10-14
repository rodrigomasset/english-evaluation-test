export const LEVELS = [
  'basico1','basico2','intermediario1','intermediario2','avancado1','avancado2','expert'
] as const
export type Level = typeof LEVELS[number]
export function levelIndex(l: Level){ return LEVELS.indexOf(l) }
export function nextLevel(l: Level){ return LEVELS[Math.min(levelIndex(l)+1, LEVELS.length-1)] }
export function prevLevel(l: Level){ return LEVELS[Math.max(levelIndex(l)-1, 0)] }
