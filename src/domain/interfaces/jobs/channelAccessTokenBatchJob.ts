/**
 * Channel access token batch job interface
 */
export interface IChannelAccessTokenBatchJob {
  processChannelAccessTokenBatch(): Promise<void>;
}
