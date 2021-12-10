import { Test } from '@nestjs/testing';

import { User } from './user.entity';
import { AuthService } from './auth.service';
import { UsersService } from './users.service';

describe('AuthService', () => {
  let service: AuthService;
  let fakeUsersService: Partial<UsersService>;

  beforeEach(async () => {
    const users: User[] = [];
    fakeUsersService = {
      find: (email: string) => {
        const filteredUsers = users.filter((user) => user.email === email);
        return Promise.resolve(filteredUsers);
      },
      create: (email: string, password: string) => {
        const user = { id: Math.floor(Math.random() * 99999), email, password };
        users.push(user);
        return Promise.resolve(user);
      },
    };

    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: fakeUsersService },
      ],
    }).compile();
    service = module.get(AuthService);
  });

  it('can create a instance of auth service', async () => {
    expect(service).toBeDefined();
  });

  it('creates a new user with salted & hashed password', async () => {
    const user = await service.signUp('test@test.com', 'asdf');
    expect(user.password).not.toEqual('asdf');
    const [salt, hash] = user.password.split('.');
    expect(salt).toBeDefined();
    expect(hash).toBeDefined();
  });

  it('throws error if email already in use', async () => {
    await service.signUp('test@test.com', 'asdf');
    await expect(service.signUp('test@test.com', 'asdf')).rejects.toThrow(
      'Email already in use.',
    );
  });

  it('throws error if sigin is called with unused email', async () => {
    await expect(service.signIn('test@test.com', 'asdf')).rejects.toThrow(
      'User not found',
    );
  });

  it('throws error if sigin is called with incorrect password', async () => {
    await service.signUp('test@test.com', 'correct');
    await expect(service.signIn('test@test.com', 'wrong')).rejects.toThrow(
      'Invalid credentials',
    );
  });

  it('returns user with correct password', async () => {
    await service.signUp('test@test.com', 'correct');
    const user = await service.signIn('test@test.com', 'correct');
    expect(user).toBeDefined();
  });
});
