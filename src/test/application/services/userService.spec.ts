import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from 'src/application/services/userService';
import { UserRepository } from 'src/infrastructure/repositories/userRepository';
import { EncryptionService } from 'src/application/services/encryptionService';
import { User } from 'src/domain/entities/user';
import { convertPrefectureToNumber } from 'src/domain/useCase/prefecture';
import { convertSeismicIntensityToNumber } from 'src/domain/useCase/seismicIntensity';
import { PointsScale } from 'src/domain/enum/quakeHistory/pointsEnum';

describe('UserService', () => {
  let userService: UserService;
  let userRepository: UserRepository;
  let encryptionService: EncryptionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: UserRepository,
          useValue: {
            getUsersByPrefectures: jest.fn(),
            isUserIdExists: jest.fn(),
            putUserId: jest.fn(),
            deleteUser: jest.fn(),
            updateUserPrefecture: jest.fn(),
            updateUserSeismicIntensity: jest.fn(),
          },
        },
        {
          provide: EncryptionService,
          useValue: {
            encrypt: jest.fn(),
          },
        },
      ],
    }).compile();

    userService = module.get<UserService>(UserService);
    userRepository = module.get<UserRepository>(UserRepository);
    encryptionService = module.get<EncryptionService>(EncryptionService);
  });

  it('should get users by prefectures', async () => {
    const prefectures = ['Tokyo', 'Osaka'];
    const users: User[] = [
      {
        id: 1,
        user_id: '123',
        prefecture: 13,
        threshold_seismic_intensity: PointsScale.SCALE40,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ];
    jest
      .spyOn(userRepository, 'getUsersByPrefectures')
      .mockResolvedValue(users);

    const result = await userService.getUsersByPrefectures(prefectures);

    expect(result).toEqual(users);
    expect(userRepository.getUsersByPrefectures).toHaveBeenCalledWith(
      prefectures.map(convertPrefectureToNumber),
    );
  });

  it('should ensure user id exists', async () => {
    const userId = '123';
    const encryptedUserId = 'encrypted123';
    jest.spyOn(encryptionService, 'encrypt').mockResolvedValue(encryptedUserId);
    jest.spyOn(userRepository, 'isUserIdExists').mockResolvedValue(false);
    jest.spyOn(userRepository, 'putUserId').mockResolvedValue(undefined);

    await userService.ensureUserIdExists(userId);

    expect(encryptionService.encrypt).toHaveBeenCalledWith(userId);
    expect(userRepository.isUserIdExists).toHaveBeenCalledWith(encryptedUserId);
    expect(userRepository.putUserId).toHaveBeenCalledWith(encryptedUserId);
  });

  it('should delete user', async () => {
    const userId = '123';
    const encryptedUserId = 'encrypted123';
    jest.spyOn(encryptionService, 'encrypt').mockResolvedValue(encryptedUserId);
    jest.spyOn(userRepository, 'deleteUser').mockResolvedValue(undefined);

    await userService.deleteUser(userId);

    expect(encryptionService.encrypt).toHaveBeenCalledWith(userId);
    expect(userRepository.deleteUser).toHaveBeenCalledWith(encryptedUserId);
  });

  it('should update user prefecture', async () => {
    const userId = '123';
    const prefecture = 'Tokyo';
    const encryptedUserId = 'encrypted123';
    jest.spyOn(encryptionService, 'encrypt').mockResolvedValue(encryptedUserId);
    jest
      .spyOn(userRepository, 'updateUserPrefecture')
      .mockResolvedValue(undefined);

    await userService.updateUserPrefecture(userId, prefecture);

    expect(encryptionService.encrypt).toHaveBeenCalledWith(userId);
    expect(userRepository.updateUserPrefecture).toHaveBeenCalledWith(
      encryptedUserId,
      convertPrefectureToNumber(prefecture),
    );
  });

  it('should update user seismic intensity', async () => {
    const userId = '123';
    const seismicIntensity = '5';
    const encryptedUserId = 'encrypted123';
    jest.spyOn(encryptionService, 'encrypt').mockResolvedValue(encryptedUserId);
    jest
      .spyOn(userRepository, 'updateUserSeismicIntensity')
      .mockResolvedValue(undefined);

    await userService.updateUserSeismicIntensity(userId, seismicIntensity);

    expect(encryptionService.encrypt).toHaveBeenCalledWith(userId);
    expect(userRepository.updateUserSeismicIntensity).toHaveBeenCalledWith(
      encryptedUserId,
      convertSeismicIntensityToNumber(seismicIntensity) ?? PointsScale.SCALE40,
    );
  });
});
