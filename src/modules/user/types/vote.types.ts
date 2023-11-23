export const VoteValues = [-1, 0, 1] as const;

export type VoteType = (typeof VoteValues)[number];
