import { describe, expect, it, vi } from 'vitest';

import { LoginService } from '../../src/modules/auth/application/services/LoginService.js';

describe('LoginService', () => {
  it('returns a token and sanitized user for valid credentials', async () => {
    const user = {
      id: 1,
      name: 'Anggota Test',
      email: 'anggota@example.com',
      passwordHash: 'hash',
      phone: null,
      role: 'ANGGOTA',
      isActive: true,
      member: { id: 5, memberCode: 'MEM-1', status: 'ACTIVE' }
    };
    const userRepository = {
      findByEmail: vi.fn().mockResolvedValue(user),
      updateLastLogin: vi.fn().mockResolvedValue(user)
    };
    const passwordService = { compare: vi.fn().mockResolvedValue(true) };
    const tokenService = { sign: vi.fn().mockReturnValue('token') };
    const service = new LoginService({ userRepository, passwordService, tokenService });

    const result = await service.execute({ email: ' ANGGOTA@example.com ', password: 'password' });

    expect(result.token).toBe('token');
    expect(result.user.passwordHash).toBeUndefined();
    expect(userRepository.updateLastLogin).toHaveBeenCalledWith(1);
  });

  it('rejects invalid credentials', async () => {
    const userRepository = { findByEmail: vi.fn().mockResolvedValue(null) };
    const service = new LoginService({
      userRepository,
      passwordService: { compare: vi.fn() },
      tokenService: { sign: vi.fn() }
    });

    await expect(service.execute({ email: 'wrong@example.com', password: 'password' })).rejects.toMatchObject({
      statusCode: 401,
      code: 'INVALID_CREDENTIALS'
    });
  });
});
