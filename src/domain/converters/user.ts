import { User } from 'src/domain/entities/user';
import { UserModel } from 'src/domain/models/user';

/**
 * Convert user entity to user model
 * @param user user entity
 * @returns user model
 */
export const convertUser = (user: User): UserModel => {
  return new UserModel(
    user.id,
    user.user_id,
    user.prefecture,
    user.threshold_seismic_intensity,
    user.created_at,
    user.updated_at,
  );
};
