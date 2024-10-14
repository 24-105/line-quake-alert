/**
 * Quake batch job interface
 */
export interface IQuakeBatchJob {
  processQuakeHistoryBatch(): Promise<void>;
}
