export type PollOptionResult = { optionId: string; count: number; percent: number };

export function calculatePollResults(counts: readonly { optionId: string; count: number }[]): {
  results: PollOptionResult[];
  total: number;
} {
  const total = counts.reduce((sum, item) => sum + item.count, 0);
  return {
    total,
    results: counts.map(({ optionId, count }) => ({
      optionId,
      count,
      percent: total ? Math.round((count / total) * 100) : 0,
    })),
  };
}
