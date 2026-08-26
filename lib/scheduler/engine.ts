import { resolveJuzRange } from '../quran/resolver';
import { GeneratedSchedule, MemberAssignment, MemberConfig, ScheduleInput, WeekSchedule } from './types';
import { validateGeneratedSchedule, validateScheduleInput } from './validator';

interface MemberState {
  member: MemberConfig;
  index: number;
  assignedHistory: Array<{ start: number; end: number }>;
}

/**
 * Calculates overlap between two closed intervals [a, b] and [c, d].
 */
function calculateOverlap(a: number, b: number, c: number, d: number): number {
  const overlap = Math.min(b, d) - Math.max(a, c) + 1;
  return Math.max(0, overlap);
}

/**
 * Finds all valid permutations of members for a single week that partition Juz 1..30
 * and respect each member's knowledge bounds.
 */
function solveWeekPermutation(
  members: MemberState[],
  weekIndex: number,
  preferredOffset: number
): MemberState[] | null {
  const n = members.length;
  const used = new Array(n).fill(false);
  let bestPermutation: MemberState[] | null = null;
  let bestScore = Infinity;

  // Domain sort: prioritize members that are most constrained (smallest knowledge range)
  const candidateIndices = Array.from({ length: n }, (_, i) => (i + preferredOffset) % n);

  function backtrack(currentPosition: number, currentPerm: MemberState[], currentScore: number) {
    if (currentPerm.length === n) {
      if (currentPosition === 31) {
        if (currentScore < bestScore) {
          bestScore = currentScore;
          bestPermutation = [...currentPerm];
        }
      }
      return;
    }

    // Prune if current score is already worse than best found
    if (currentScore >= bestScore) {
      return;
    }

    for (const idx of candidateIndices) {
      if (used[idx]) continue;

      const m = members[idx];
      const startJuz = currentPosition;
      const endJuz = startJuz + m.member.weeklyAmount - 1;

      if (endJuz > 30) continue;

      // Check knowledge constraint
      if (startJuz < m.member.startJuz || endJuz > m.member.endJuz) {
        continue;
      }

      // Calculate repetition penalty with previous weeks
      let penalty = 0;
      for (let prevWeek = 0; prevWeek < m.assignedHistory.length; prevWeek++) {
        const prev = m.assignedHistory[prevWeek];
        const overlap = calculateOverlap(startJuz, endJuz, prev.start, prev.end);
        // Exponential decay so most recent weeks have highest penalty
        const recencyWeight = Math.pow(4, prevWeek);
        penalty += overlap * recencyWeight;
      }

      used[idx] = true;
      currentPerm.push(m);
      backtrack(endJuz + 1, currentPerm, currentScore + penalty);
      currentPerm.pop();
      used[idx] = false;

      // If we found a zero-penalty solution for week > 0, we can stop early
      if (bestScore === 0) {
        return;
      }
    }
  }

  backtrack(1, [], 0);
  return bestPermutation;
}

/**
 * Pure scheduling engine that generates a multi-week rotating Quran completion schedule.
 */
export function generateQuranSchedule(input: ScheduleInput): GeneratedSchedule {
  const inputValidation = validateScheduleInput(input);
  if (!inputValidation.isValid) {
    const firstError = inputValidation.errors[0];
    throw new Error(firstError.messageEn || 'Invalid schedule input');
  }

  const { group, members } = input;
  const weeksCount = group.weeksCount;

  const memberStates: MemberState[] = members.map((m, i) => ({
    member: m,
    index: i,
    assignedHistory: [],
  }));

  const weeks: WeekSchedule[] = [];

  for (let weekNum = 1; weekNum <= weeksCount; weekNum++) {
    // Offset provides cyclic permutation preference for rotation
    const preferredOffset = (weekNum - 1) % members.length;
    const permutation = solveWeekPermutation(memberStates, weekNum - 1, preferredOffset);

    if (!permutation) {
      throw new Error(
        `Unable to generate a valid partition for Week ${weekNum} respecting knowledge constraints. Please adjust member ranges or amounts.`
      );
    }

    let currentJuz = 1;
    const assignments: MemberAssignment[] = [];

    for (const mState of permutation) {
      const startJuz = currentJuz;
      const endJuz = startJuz + mState.member.weeklyAmount - 1;

      const exactRange = resolveJuzRange(startJuz, endJuz);

      assignments.push({
        memberId: mState.member.id,
        memberName: mState.member.name,
        weeklyAmount: mState.member.weeklyAmount,
        startJuz,
        endJuz,
        startAyah: exactRange.startAyah,
        endAyah: exactRange.endAyah,
        startLocation: exactRange.startLocation,
        endLocation: exactRange.endLocation,
      });

      mState.assignedHistory.push({ start: startJuz, end: endJuz });
      currentJuz = endJuz + 1;
    }

    // Sort assignments according to original member order or reading sequence
    // Let's keep reading sequence (Juz 1 to 30) for clear schedule flow
    assignments.sort((a, b) => a.startJuz - b.startJuz);

    weeks.push({
      weekNumber: weekNum,
      assignments,
      totalJuz: 30,
    });
  }

  const schedule: GeneratedSchedule = {
    id: `wirddy-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
    createdAt: new Date().toISOString(),
    groupName: group.name.trim(),
    weeksCount,
    weeks,
    members,
  };

  // Perform post-generation validation check
  const postValidation = validateGeneratedSchedule(schedule, input);
  if (!postValidation.isValid) {
    throw new Error(`Schedule validation failed: ${postValidation.errors.map((e) => e.messageEn).join(', ')}`);
  }

  return schedule;
}
