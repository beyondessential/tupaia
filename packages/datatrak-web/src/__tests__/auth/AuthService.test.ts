import { AuthService } from '../../auth/AuthService';
import { DatatrakWebModelRegistry } from '../../types';

jest.mock('../../api', () => ({
  post: jest.fn().mockResolvedValue({
    user: {
      id: 'user-123',
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      accessPolicy: {},
    },
  }),
}));

jest.mock('../../auth/hash', () => ({
  hashPassword: jest.fn().mockResolvedValue('hashedPassword123'),
  verifyPassword: jest.fn().mockResolvedValue(true),
}));

// Mock localStorage
const localStorageMock = {
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

Object.defineProperty(window.navigator, 'onLine', {
  writable: true,
  value: true,
});

Object.defineProperty(window.navigator, 'userAgent', {
  writable: true,
  value: 'Mozilla/5.0 (Test Browser)',
});

const MOCKED_TRANSFORMED_USER = {
  id: 'user-123',
  email: 'test@example.com',
  first_name: 'Test',
  last_name: 'User',
  access_policy: {},
};

class NetworkError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'NetworkError';
    this.status = status;
  }
}

describe('AuthService', () => {
  let authService: AuthService;

  beforeEach(async () => {
    jest.clearAllMocks();
    localStorageMock.setItem.mockClear();
  });

  it('login remotely if internet is available', async () => {
    const models = {
      user: {
        update: jest.fn(),
        findOne: jest.fn().mockResolvedValue(null),
        create: jest.fn(),
        transformUserData: jest.fn().mockResolvedValue(MOCKED_TRANSFORMED_USER),
      },
      localSystemFact: {
        set: jest.fn(),
      },
    } as unknown as DatatrakWebModelRegistry;

    authService = new AuthService(models);

    await authService.signIn({
      email: 'test@example.com',
      password: 'password123',
    });

    expect(models.user.create).toHaveBeenCalledWith({
      id: 'user-123',
      email: 'test@example.com',
      first_name: 'Test',
      last_name: 'User',
      access_policy: {},
    });
  });

  it('login locally if internet is not available', async () => {
    Object.defineProperty(window.navigator, 'onLine', {
      writable: true,
      value: false,
    });

    const models = {
      user: {
        update: jest.fn(),
        findOne: jest.fn().mockResolvedValue({
          id: 'user-123',
          email: 'test@example.com',
          password_hash: 'password123',
        }),
        create: jest.fn(),
        transformUserData: jest.fn().mockResolvedValue(MOCKED_TRANSFORMED_USER),
      },
      localSystemFact: {
        set: jest.fn(),
      },
    } as unknown as DatatrakWebModelRegistry;

    authService = new AuthService(models);

    const user = await authService.signIn({
      email: 'test@example.com',
      password: 'password123',
    });

    expect(user).toEqual(MOCKED_TRANSFORMED_USER);
  });

  it('login locally if remote login fails', async () => {
    Object.defineProperty(window.navigator, 'onLine', {
      writable: true,
      value: true,
    });

    const models = {
      user: {
        update: jest.fn(),
        findOne: jest.fn().mockResolvedValue({
          id: 'user-123',
          email: 'test@example.com',
          password_hash: 'password123',
        }),
        create: jest.fn(),
          transformUserData: jest.fn().mockResolvedValue(MOCKED_TRANSFORMED_USER),
      },
      localSystemFact: {
        set: jest.fn(),
      },
    } as unknown as DatatrakWebModelRegistry;

    authService = new AuthService(models);
    authService.remoteSignIn = jest
      .fn()
      .mockRejectedValue(new NetworkError('Remote login failed', 500));

    const user = await authService.signIn({
      email: 'test@example.com',
      password: 'password123',
    });

    expect(user).toEqual(MOCKED_TRANSFORMED_USER);
  });

  it('throws an error if there is no internet connection and user has never logged in', async () => {
    Object.defineProperty(window.navigator, 'onLine', {
      writable: true,
      value: false,
    });

    const models = {
      user: {
        update: jest.fn(),
        findOne: jest.fn().mockResolvedValue({
          id: 'user-123',
          email: 'test@example.com',
        }),
        create: jest.fn(),
      },
      localSystemFact: {
        set: jest.fn(),
      },
    } as unknown as DatatrakWebModelRegistry;

    authService = new AuthService(models);

    await expect(
      authService.signIn({
        email: 'test@example.com',
        password: 'password123',
      }),
    ).rejects.toThrow(
      'Before using DataTrak offline, please log in once while connected to the internet',
    );
  });
});
