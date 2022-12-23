import { Test } from '@nestjs/testing';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from 'src/jwt/jwt.service';
import { Users } from './entities/users.entity';
import { Verification } from './entities/verification.entity';
import { UserService } from './users.service';
import { EmailService } from 'src/email/email.service';

const mockRepository = () => ({
  findOne: jest.fn(),
  save: jest.fn(),
  create: jest.fn(),
});
const mockJwtService = {
  sign: jest.fn(),
  verify: jest.fn(),
};
const mockMailService = {
  sendVerificationEmail: jest.fn(),
};

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

describe(`UserService`, () => {
  let service: UserService;
  let usersRepository: MockRepository<Users>;
  let verfiRepository: MockRepository<Verification>;
  let emailService: EmailService;

  beforeAll(async () => {
    const modules = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(Users),
          useValue: mockRepository(),
        },
        {
          provide: getRepositoryToken(Verification),
          useValue: mockRepository(),
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: EmailService,
          useValue: mockMailService,
        },
      ],
    }).compile();
    service = modules.get<UserService>(UserService);
    emailService = modules.get<EmailService>(EmailService);
    usersRepository = modules.get(getRepositoryToken(Users));
    verfiRepository = modules.get(getRepositoryToken(Verification));
  });

  it(`should be defined`, () => {
    expect(service).toBeDefined();
  });

  describe('createAccount', () => {
    it('should fail if user exists', async () => {
      usersRepository.findOne.mockResolvedValue({
        id: 1,
        email: `test@please.work`,
      });
      const result = await service.createAccount(createAccountArgs);
      expect(result).toMatchObject({
        ok: false,
        error: `This email already used.`,
      });
    });

    const createAccountArgs = {
      email: 'test@email.com',
      password: 'test.password',
      role: 0,
    };

    it(`should creat new user`, async () => {
      usersRepository.findOne.mockResolvedValue(undefined);

      usersRepository.create.mockReturnValue(createAccountArgs);
      usersRepository.save.mockResolvedValue(createAccountArgs);

      verfiRepository.create.mockReturnValue({ user: createAccountArgs });
      verfiRepository.save.mockResolvedValue({ code: `test` });

      const result = await service.createAccount(createAccountArgs);

      expect(usersRepository.create).toHaveBeenCalledTimes(1);
      expect(usersRepository.create).toHaveBeenCalledWith(createAccountArgs);

      expect(usersRepository.save).toHaveBeenCalled();
      expect(usersRepository.save).toHaveBeenCalledWith(createAccountArgs);

      expect(verfiRepository.create).toHaveBeenCalledTimes(1);
      expect(verfiRepository.create).toHaveBeenCalledWith({
        user: createAccountArgs,
      });

      expect(verfiRepository.save).toHaveBeenCalled();
      expect(verfiRepository.save).toHaveBeenCalledWith({
        user: createAccountArgs,
      });

      expect(emailService.sendVerificationEmail).toHaveBeenCalledTimes(1);
      expect(emailService.sendVerificationEmail).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
      );
      expect(result).toEqual({ ok: true });
    });
  });

  it.todo(`login`);
  it.todo(`findById`);
  it.todo(`editProfile`);
  it.todo(`verifyEmail`);
});
