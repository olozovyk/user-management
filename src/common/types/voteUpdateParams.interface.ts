import { Vote } from '../entities';

export interface IVoteUpdateParams {
  existingVote: Vote;
  userId: string;
  targetUserId: string;
  voteValue: number;
}

export interface IVoteSaveParams {
  voteEntity: Vote;
  userId: string;
  targetUserId: string;
  voteValue: number;
}
