import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/domain/entities/user';
import { LOG_MESSAGES } from 'src/config/logMessages';
import { UserRepository } from 'src/infrastructure/repositories/userRepository';

describe('UserRepository', () => {
  let userRepository: UserRepository;
  let userRepo: Repository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserRepository,
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
      ],
    }).compile();

    userRepository = module.get<UserRepository>(UserRepository);
    userRepo = module.get<Repository<User>>(getRepositoryToken(User));
  });

  describe('getUsersByPrefectures', () => {
    it('should return users by prefectures', async () => {
      const prefectures = [1, 2];
      const users = [
        { user_id: '1', prefecture: 1 },
        { user_id: '2', prefecture: 2 },
      ];
      jest.spyOn(userRepo, 'find').mockResolvedValue(users as User[]);

      expect(await userRepository.getUsersByPrefectures(prefectures)).toEqual(
        users,
      );
    });

    it('should log and throw an error if find fails', async () => {
      const prefectures = [1, 2];
      const error = new Error('find failed');
      jest.spyOn(userRepo, 'find').mockRejectedValue(error);
      jest.spyOn(userRepository['logger'], 'error');

      await expect(
        userRepository.getUsersByPrefectures(prefectures),
      ).rejects.toThrow(error);
      expect(userRepository['logger'].error).toHaveBeenCalledWith(
        `${LOG_MESSAGES.GET_USERS_FAILED}: ${prefectures}`,
        error.stack,
      );
    });
  });

  describe('isUserIdExists', () => {
    it('should return true if user id exists', async () => {
      const userId = '1';
      const user = { user_id: userId };
      jest.spyOn(userRepo, 'findOne').mockResolvedValue(user as User);

      expect(await userRepository.isUserIdExists(userId)).toBe(true);
    });

    it('should return false if user id does not exist', async () => {
      const userId = '1';
      jest.spyOn(userRepo, 'findOne').mockResolvedValue(null);

      expect(await userRepository.isUserIdExists(userId)).toBe(false);
    });

    it('should log and throw an error if findOne fails', async () => {
      const userId = '1';
      const error = new Error('findOne failed');
      jest.spyOn(userRepo, 'findOne').mockRejectedValue(error);
      jest.spyOn(userRepository['logger'], 'error');

      await expect(userRepository.isUserIdExists(userId)).rejects.toThrow(
        error,
      );
      expect(userRepository['logger'].error).toHaveBeenCalledWith(
        `${LOG_MESSAGES.CHECK_USER_ID_FAILED}: ${userId}`,
        error.stack,
      );
    });
  });

  describe('putUserId', () => {
    it('should insert user id', async () => {
      const userId = '1';
      jest.spyOn(userRepo, 'insert').mockResolvedValue(undefined);

      await expect(userRepository.putUserId(userId)).resolves.toBeUndefined();
    });

    it('should log and throw an error if insert fails', async () => {
      const userId = '1';
      const error = new Error('insert failed');
      jest.spyOn(userRepo, 'insert').mockRejectedValue(error);
      jest.spyOn(userRepository['logger'], 'error');

      await expect(userRepository.putUserId(userId)).rejects.toThrow(error);
      expect(userRepository['logger'].error).toHaveBeenCalledWith(
        `${LOG_MESSAGES.PUT_USER_ID_FAILED}: ${userId}`,
        error.stack,
      );
    });
  });

  describe('deleteUser', () => {
    it('should delete user', async () => {
      const userId = '1';
      jest.spyOn(userRepo, 'delete').mockResolvedValue(undefined);

      await expect(userRepository.deleteUser(userId)).resolves.toBeUndefined();
    });

    it('should log and throw an error if delete fails', async () => {
      const userId = '1';
      const error = new Error('delete failed');
      jest.spyOn(userRepo, 'delete').mockRejectedValue(error);
      jest.spyOn(userRepository['logger'], 'error');

      await expect(userRepository.deleteUser(userId)).rejects.toThrow(error);
      expect(userRepository['logger'].error).toHaveBeenCalledWith(
        `${LOG_MESSAGES.DELETE_USER_FAILED}: ${userId}`,
        error.stack,
      );
    });
  });

  describe('updateUserPrefecture', () => {
    it('should update user prefecture', async () => {
      const userId = '1';
      const prefecture = 1;
      jest.spyOn(userRepo, 'update').mockResolvedValue(undefined);

      await expect(
        userRepository.updateUserPrefecture(userId, prefecture),
      ).resolves.toBeUndefined();
    });

    it('should log and throw an error if update fails', async () => {
      const userId = '1';
      const prefecture = 1;
      const error = new Error('update failed');
      jest.spyOn(userRepo, 'update').mockRejectedValue(error);
      jest.spyOn(userRepository['logger'], 'error');

      await expect(
        userRepository.updateUserPrefecture(userId, prefecture),
      ).rejects.toThrow(error);
      expect(userRepository['logger'].error).toHaveBeenCalledWith(
        `${LOG_MESSAGES.UPDATE_USER_PREFECTURE_FAILED}: ${userId}`,
        error.stack,
      );
    });
  });

  describe('updateUserSeismicIntensity', () => {
    it('should update user seismic intensity', async () => {
      const userId = '1';
      const seismicIntensity = 5;
      jest.spyOn(userRepo, 'update').mockResolvedValue(undefined);

      await expect(
        userRepository.updateUserSeismicIntensity(userId, seismicIntensity),
      ).resolves.toBeUndefined();
    });

    it('should log and throw an error if update fails', async () => {
      const userId = '1';
      const seismicIntensity = 5;
      const error = new Error('update failed');
      jest.spyOn(userRepo, 'update').mockRejectedValue(error);
      jest.spyOn(userRepository['logger'], 'error');

      await expect(
        userRepository.updateUserSeismicIntensity(userId, seismicIntensity),
      ).rejects.toThrow(error);
      expect(userRepository['logger'].error).toHaveBeenCalledWith(
        `${LOG_MESSAGES.UPDATE_USER_THRESHOLD_SEISMIC_INTENSITY_FAILED}: ${userId}`,
        error.stack,
      );
    });
  });
});
