export const PROGRESS_KEY = 'formpath-prestudy-progress';

export function emptyProgress() {
  return {
    version: 1,
    completedModuleIds: [],
    quizAttempts: {},
    lastVisitedSlug: null,
    codeDrafts: {},
  };
}

export function loadProgress(storage) {
  try {
    const raw = storage.getItem(PROGRESS_KEY);
    if (!raw) return emptyProgress();
    const value = JSON.parse(raw);
    if (!value || value.version !== 1 || !Array.isArray(value.completedModuleIds)) return emptyProgress();
    return {
      ...emptyProgress(),
      ...value,
      quizAttempts: value.quizAttempts && typeof value.quizAttempts === 'object' ? value.quizAttempts : {},
      codeDrafts: value.codeDrafts && typeof value.codeDrafts === 'object' ? value.codeDrafts : {},
    };
  } catch {
    return emptyProgress();
  }
}

export function saveProgress(storage, state) {
  storage.setItem(PROGRESS_KEY, JSON.stringify(state));
}

export function markComplete(state, moduleId) {
  if (state.completedModuleIds.includes(moduleId)) return state;
  return { ...state, completedModuleIds: [...state.completedModuleIds, moduleId] };
}

export function recordQuizAttempt(state, quizId, score, total, attemptedAt = new Date().toISOString()) {
  return {
    ...state,
    quizAttempts: {
      ...state.quizAttempts,
      [quizId]: { score, total, attemptedAt },
    },
  };
}

export function setLastVisited(state, slug) {
  return { ...state, lastVisitedSlug: slug };
}

export function setCodeDraft(state, labId, code) {
  return { ...state, codeDrafts: { ...state.codeDrafts, [labId]: code } };
}
