// app/lib/levels.ts

// Slugs usados no banco/rotas
export type LevelSlug =
  | 'basic1'
  | 'basic2'
  | 'intermediate1'
  | 'intermediate2'
  | 'advanced1'
  | 'advanced2'
  | 'expert'

// Alias de tipo para compatibilidade com imports existentes
export type Level = LevelSlug

// Ordem do mais fácil ao mais difícil
export const LEVEL_ORDER: LevelSlug[] = [
  'basic1',
  'basic2',
  'intermediate1',
  'intermediate2',
  'advanced1',
  'advanced2',
  'expert',
]

// Rótulos em português (para exibir/enviar por email)
export const LEVEL_LABELS: Record<LevelSlug, string> = {
  basic1: 'básico 1',
  basic2: 'básico 2',
  intermediate1: 'intermediário 1',
  intermediate2: 'intermediário 2',
  advanced1: 'avançado 1',
  advanced2: 'avançado 2',
  expert: 'expert',
}

// Aliases para evitar erro se o código importar outros nomes
export const levels = LEVEL_ORDER
export const labels = LEVEL_LABELS

export function initialLevel(): LevelSlug {
  return 'basic1'
}

/**
 * Regras adaptativas:
 * - Overload 1 (simples): nextLevel(level) -> sobe 1 nível (com limite superior)
 * - Overload 2 (avançado): nextLevel(current, correct, streakUp, streakDown) -> usa streaks e retorna objeto
 */
export function nextLevel(current: LevelSlug): LevelSlug
export function nextLevel(
  current: LevelSlug,
  correct: boolean,
  streakUp: number,
  streakDown: number
): { level: LevelSlug; streakUp: number; streakDown: number }
export function nextLevel(
  current: LevelSlug,
  correct?: boolean,
  streakUp?: number,
  streakDown?: number
): any {
  // Modo simples: chamado como nextLevel(level) → retorna apenas o LevelSlug (sobe 1)
  if (typeof correct === 'undefined') {
    const idx = LEVEL_ORDER.indexOf(current)
    return LEVEL_ORDER[Math.min(idx + 1, LEVEL_ORDER.length - 1)]
  }

  // Modo avançado: adaptativo com streaks
  let up = correct ? (streakUp ?? 0) + 1 : 0
  let down = correct ? 0 : (streakDown ?? 0) + 1

  const idx = LEVEL_ORDER.indexOf(current)
  let newIdx = idx

  if (up >= 2 && idx < LEVEL_ORDER.length - 1) {
    newIdx = idx + 1
    up = 0
    down = 0
  } else if (down >= 2 && idx > 0) {
    newIdx = idx - 1
    up = 0
    down = 0
  }

  return { level: LEVEL_ORDER[newIdx], streakUp: up, streakDown: down }
}

// Aliases comuns (caso o código use esses nomes)
export const chooseNextLevel = nextLevel
export const getNextLevel = nextLevel

// === Compat c/ imports existentes nas rotas ===

// Alias pedido pelas rotas (equivalente à ordem de níveis)
export const LEVELS = LEVEL_ORDER

// Nível anterior na ordem (com bound no início)
export function prevLevel(level: LevelSlug): LevelSlug {
  const idx = LEVEL_ORDER.indexOf(level)
  return LEVEL_ORDER[Math.max(0, idx - 1)]
}

// Dado o histórico de {level, correct} das 15 perguntas,
// calcula o nível final priorizando o último nível alcançado,
// com ajuste leve por desempenho geral
export function finalizeLevelFromAnswers(
  history: { level: LevelSlug; correct: boolean }[]
): LevelSlug {
  if (!history || history.length === 0) return initialLevel()

  // último nível alcançado durante o fluxo
  const lastLevel = history[history.length - 1].level

  // taxa de acertos
  const correctRate = history.filter(h => h.correct).length / history.length

  // pequeno ajuste: se taxa >= 0.8 e não está no topo, sobe 1
  // se taxa <= 0.3 e não está na base, desce 1
  let idx = LEVEL_ORDER.indexOf(lastLevel)
  if (correctRate >= 0.8 && idx < LEVEL_ORDER.length - 1) idx += 1
  else if (correctRate <= 0.3 && idx > 0) idx -= 1

  return LEVEL_ORDER[idx]
}

// Outro alias comum
export const classify = finalizeLevelFromAnswers
export function labelForLevel(level: LevelSlug): string {
  return LEVEL_LABELS[level]
}

// Export default opcional com os principais membros
const exported = {
  LEVEL_ORDER,
  LEVEL_LABELS,
  levels: LEVEL_ORDER,
  labels: LEVEL_LABELS,
  initialLevel,
  nextLevel,
  chooseNextLevel,
  getNextLevel,
  finalizeLevelFromAnswers,
  classify,
  labelForLevel,
  LEVELS,
  prevLevel,
}

export default exported
