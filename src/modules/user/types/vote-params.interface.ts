import { Vote } from '@modules/user/entities';
import { VoteType } from '@modules/user/types/vote.types';

export interface IVoteSaveParams {
  voteEntity: Vote;
  userId: string;
  targetUserId: string;
  voteValue: VoteType;
}

export interface IVoteUpdateParams extends Omit<IVoteSaveParams, 'voteEntity'> {
  existingVote: Vote;
}
