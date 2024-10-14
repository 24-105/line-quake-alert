import { Module } from '@nestjs/common';
import { UserService } from 'src/application/services/userService';
import { UserRepository } from 'src/infrastructure/repositories/userRepository';
import { EncryptModule } from './encryptionModule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/domain/entities/user';

/**
 * User module
 */
@Module({
  imports: [EncryptModule, TypeOrmModule.forFeature([User])],
  providers: [UserService, UserRepository],
  exports: [UserService],
})
export class UserModule {}
