export interface SRSResult {
  status: "new" | "learning" | "review";
  interval: number;
  easeFactor: number;
  repetitionCount: number;
}

export const calculateNextReview = (
  grade: number,
  oldInterval: number,
  oldEaseFactor: number,
  status: "new" | "learning" | "review",
  repetitionCount: number
): SRSResult => {
  // Delta theo Anki cho grade: 1(Again), 2(Hard), 3(Good), 4(Easy)
  let deltaEase = 0;
  if (grade === 1) deltaEase = -0.2;
  else if (grade === 2) deltaEase = -0.15;
  else if (grade === 3) deltaEase = 0;
  else if (grade === 4) deltaEase = 0.15;

  const newEaseFactor = Math.max(1.3, oldEaseFactor + deltaEase);

  let newStatus: "new" | "learning" | "review" = status;
  let newInterval = oldInterval;
  let newRepetitionCount = repetitionCount;

  if (status === "new" || status === "learning") {
    // 1-step graduation
    if (grade === 1) {
      newStatus = "learning";
      newInterval = 0;
      newRepetitionCount = 0;
    } else if (grade === 2) {
      newStatus = "review"; // Graduate
      newInterval = 1;
      newRepetitionCount = 1;
    } else if (grade === 3) {
      newStatus = "review"; // Graduate
      newInterval = 3;
      newRepetitionCount = 1;
    } else if (grade === 4) {
      newStatus = "review"; // Graduate
      newInterval = 5;
      newRepetitionCount = 1;
    }
  } else if (status === "review") {
    if (grade === 1) {
      newStatus = "learning"; // Rớt hạng
      newInterval = 0;
      newRepetitionCount = 0;
    } else if (grade === 2) {
      newInterval = Math.max(oldInterval + 1, Math.round(oldInterval * 1.2));
      newRepetitionCount++;
    } else if (grade === 3) {
      newInterval = Math.max(oldInterval + 1, Math.round(oldInterval * oldEaseFactor));
      newRepetitionCount++;
    } else if (grade === 4) {
      newInterval = Math.max(oldInterval + 1, Math.round(oldInterval * oldEaseFactor * 1.3));
      newRepetitionCount++;
    }
  }

  return {
    status: newStatus,
    interval: newInterval,
    easeFactor: newEaseFactor,
    repetitionCount: newRepetitionCount,
  };
};
