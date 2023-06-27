import { Vote } from '../entities';

export interface IVoteSaveParams {
  voteEntity: Vote;
  userId: string;
  targetUserId: string;
  voteValue: number;
}

export interface IVoteUpdateParams extends Omit<IVoteSaveParams, 'voteEntity'> {
  existingVote: Vote;
}
