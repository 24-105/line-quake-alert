import { convertUser } from 'src/domain/converters/user';
import { User } from 'src/domain/entities/user';
import { UserModel } from 'src/domain/models/user';

describe('convertUser', () => {
  it('should convert User entity to UserModel', () => {
    const mockUser: User = {
      id: 1,
      user_id: '123',
      prefecture: 1,
      threshold_seismic_intensity: 40,
      created_at: new Date('2021-01-01T00:00:00Z'),
      updated_at: new Date('2021-01-02T00:00:00Z'),
    };

    const userModel = convertUser(mockUser);

    expect(userModel).toBeInstanceOf(UserModel);
    expect(userModel.id).toBe(mockUser.id);
    expect(userModel.userId).toBe(mockUser.user_id);
    expect(userModel.prefecture).toBe(mockUser.prefecture);
    expect(userModel.thresholdSeismicIntensity).toBe(
      mockUser.threshold_seismic_intensity,
    );
    expect(userModel.createdAt).toEqual(mockUser.created_at);
    expect(userModel.updatedAt).toEqual(mockUser.updated_at);
  });
});
