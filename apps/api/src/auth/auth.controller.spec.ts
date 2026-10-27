import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service'; // Import AuthService
import { JwtService } from '@nestjs/jwt'; // Import JwtService if AuthService depends on it
import { UsersService } from '../users/users.service'; // Import UsersService if AuthService depends on it


describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        AuthService, // Add AuthService to the providers array
        JwtService, // Add JwtService if AuthService depends on it
        UsersService, // Add UsersService if AuthService depends on it
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
