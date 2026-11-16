import { ConflictException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import bcrypt from 'bcryptjs';
import { Types } from 'mongoose';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UsersService } from '../users/users.service.js';
import { AuthService } from './auth.service.js';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: {
    create: ReturnType<typeof vi.fn>;
    findByEmail: ReturnType<typeof vi.fn>;
    findById: ReturnType<typeof vi.fn>;
  };
  let jwtService: {
    signAsync: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    usersService = {
      create: vi.fn(),
      findByEmail: vi.fn(),
      findById: vi.fn(),
    };

    jwtService = {
      signAsync: vi.fn().mockResolvedValue('mocked_jwt_token'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: usersService,
        },
        {
          provide: JwtService,
          useValue: jwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('registers a new user and returns JWT token and user info', async () => {
    usersService.findByEmail.mockResolvedValue(null);
    const mockUser = {
      _id: new Types.ObjectId(),
      name: 'Adrian Rocha',
      email: 'adriancamrochac@gmail.com',
    };
    usersService.create.mockResolvedValue(mockUser);

    const result = await service.register({
      name: 'Adrian Rocha',
      email: 'adriancamrochac@gmail.com',
      password: 'password123',
    });

    expect(usersService.findByEmail).toHaveBeenCalledWith('adriancamrochac@gmail.com');
    expect(usersService.create).toHaveBeenCalled();
    expect(result.accessToken).toBe('mocked_jwt_token');
    expect(result.user.email).toBe('adriancamrochac@gmail.com');
    expect(result.user.name).toBe('Adrian Rocha');
  });

  it('throws ConflictException when registering with an existing email', async () => {
    usersService.findByEmail.mockResolvedValue({
      _id: new Types.ObjectId(),
      email: 'adriancamrochac@gmail.com',
    });

    await expect(
      service.register({
        name: 'Adrian Rocha',
        email: 'adriancamrochac@gmail.com',
        password: 'password123',
      }),
    ).rejects.toThrow(ConflictException);
  });

  it('logs in successfully with valid credentials', async () => {
    const passwordHash = await bcrypt.hash('secretPass', 10);
    usersService.findByEmail.mockResolvedValue({
      _id: new Types.ObjectId(),
      name: 'Adrian Rocha',
      email: 'adriancamrochac@gmail.com',
      password: passwordHash,
    });

    const result = await service.login({
      email: 'adriancamrochac@gmail.com',
      password: 'secretPass',
    });

    expect(result.accessToken).toBe('mocked_jwt_token');
    expect(result.user.email).toBe('adriancamrochac@gmail.com');
  });

  it('throws UnauthorizedException when logging in with invalid password', async () => {
    const passwordHash = await bcrypt.hash('realPassword', 10);
    usersService.findByEmail.mockResolvedValue({
      _id: new Types.ObjectId(),
      name: 'Adrian Rocha',
      email: 'adriancamrochac@gmail.com',
      password: passwordHash,
    });

    await expect(
      service.login({
        email: 'adriancamrochac@gmail.com',
        password: 'wrongPassword',
      }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('throws NotFoundException when profile user is not found', async () => {
    usersService.findById.mockResolvedValue(null);

    await expect(service.getProfile(new Types.ObjectId().toString())).rejects.toThrow(
      NotFoundException,
    );
  });
});
