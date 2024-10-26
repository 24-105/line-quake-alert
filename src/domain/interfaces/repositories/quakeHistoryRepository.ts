/**
 * quake history repository interface
 */
export interface IQuakeHistoryRepository {
  isQuakeIdExists(quakeId: string): Promise<boolean>;
  putQuakeId(quakeId: string): Promise<void>;
}
