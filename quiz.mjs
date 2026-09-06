export function scoreQuiz(quiz, answers) {
  let score = 0;
  for (const question of quiz.questions) {
    if (answers[question.id] === question.correct) score += 1;
  }
  return { score, total: quiz.questions.length };
}
