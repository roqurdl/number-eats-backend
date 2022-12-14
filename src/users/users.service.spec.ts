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
  findOneOrFail: jest.fn(),
  delete: jest.fn(),
});
const mockJwtService = {
  sign: jest.fn(() => `signed-token`),
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
  let jwtService: JwtService;

  beforeEach(async () => {
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
    jwtService = modules.get<JwtService>(JwtService);
    usersRepository = modules.get(getRepositoryToken(Users));
    verfiRepository = modules.get(getRepositoryToken(Verification));
  });

  it(`should be defined`, () => {
    expect(service).toBeDefined();
  });

  describe('createAccount', () => {
    const createAccountArgs = {
      email: 'test@email.com',
      password: 'test.password',
      role: 0,
    };

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

    it('should fail on exception', async () => {
      usersRepository.findOne.mockRejectedValue(new Error());
      const result = await service.createAccount(createAccountArgs);
      expect(result).toEqual({ ok: false, error: `Couldn't create Account.` });
    });
  });

  describe(`login`, () => {
    const loginArgs = {
      email: 'test@email.com',
      password: 'test.password',
    };
    it(`should fail if user is not exist`, async () => {
      usersRepository.findOne.mockResolvedValue(null);
      const result = await service.login(loginArgs);

      expect(usersRepository.findOne).toHaveBeenCalledTimes(1);
      expect(usersRepository.findOne).toHaveBeenCalledWith(expect.any(Object));
      expect(result).toEqual({ ok: false, error: `User is not found.` });
    });

    it(`should fail if the password is wrong`, async () => {
      const mockedUser = {
        hashCheck: jest.fn(() => Promise.resolve(false)),
      };
      usersRepository.findOne.mockResolvedValue(mockedUser);
      const result = await service.login(loginArgs);
      expect(result).toEqual({
        ok: false,
        error: `You enter the Wrong Password`,
      });
    });

    it(`should return token If the password is correct`, async () => {
      const mockedUser = {
        id: 1,
        hashCheck: jest.fn(() => Promise.resolve(true)),
      };
      usersRepository.findOne.mockResolvedValue(mockedUser);
      const result = await service.login(loginArgs);
      expect(jwtService.sign).toHaveBeenCalledTimes(1);
      expect(jwtService.sign).toHaveBeenCalledWith({ id: mockedUser.id });
      expect(result).toEqual({ ok: true, token: `signed-token` });
    });

    it('should fail on exception', async () => {
      usersRepository.findOne.mockRejectedValue(new Error());
      const result = await service.login(loginArgs);
      expect(result).toEqual({ ok: false, error: `Could not login` });
    });
  });

  describe(`findById`, () => {
    const findByIdArgs = { id: 1 };
    it('should find an existing user', async () => {
      usersRepository.findOneOrFail.mockResolvedValue(findByIdArgs);
      const result = await service.findById(1);
      expect(result).toEqual({ ok: true, user: findByIdArgs });
    });

    it('should fail if no user is found', async () => {
      usersRepository.findOneOrFail.mockRejectedValue(new Error());
      const result = await service.findById(1);
      expect(result).toEqual({
        ok: false,
        error: `There is no User Id: ${findByIdArgs.id}`,
      });
    });
  });

  describe('editProfile', () => {
    it('should change email', async () => {
      const oldUser = {
        email: 'test@old.com',
        verified: true,
      };
      const editProfileArgs = {
        userId: { where: { id: 1 } },
        input: { email: 'test@new.com' },
      };
      const newVerification = {
        code: 'code',
      };
      const newUser = {
        verified: false,
        email: editProfileArgs.input.email,
      };

      usersRepository.findOne.mockResolvedValue(oldUser);
      verfiRepository.create.mockReturnValue(newVerification);
      verfiRepository.save.mockResolvedValue(newVerification);

      await service.editProfile(
        editProfileArgs.userId.where.id,
        editProfileArgs.input,
      );

      expect(usersRepository.findOne).toHaveBeenCalledTimes(1);
      expect(usersRepository.findOne).toHaveBeenCalledWith(
        editProfileArgs.userId,
      );

      expect(verfiRepository.create).toHaveBeenCalledWith({
        user: newUser,
      });
      expect(verfiRepository.save).toHaveBeenCalledWith(newVerification);

      expect(emailService.sendVerificationEmail).toHaveBeenCalledTimes(2);
      expect(emailService.sendVerificationEmail).toHaveBeenCalledWith(
        newUser.email,
        newVerification.code,
      );
    });

    it('should change password', async () => {
      const editProfileArgs = {
        userId: 1,
        input: { password: 'new.password' },
      };
      usersRepository.findOne.mockResolvedValue({ password: 'old' });
      const result = await service.editProfile(
        editProfileArgs.userId,
        editProfileArgs.input,
      );
      expect(usersRepository.save).toHaveBeenCalledTimes(1);
      expect(usersRepository.save).toHaveBeenCalledWith(editProfileArgs.input);
      expect(result).toEqual({ ok: true });
    });

    it('should fail on exception', async () => {
      usersRepository.findOne.mockResolvedValue(new Error());
      const result = await service.editProfile(1, { email: `123` });
      expect(result).toEqual({ ok: false, error: 'Could not update profile.' });
    });
  });

  describe(`verifyEmail`, () => {
    it(`should verifiy the email`, async () => {
      const mockedVerifi = {
        user: {
          verified: false,
        },
        id: 6,
      };
      verfiRepository.findOne.mockResolvedValue(mockedVerifi);
      const result = await service.verifyEmail('');

      expect(verfiRepository.findOne).toHaveBeenCalledTimes(1);
      expect(verfiRepository.findOne).toHaveBeenCalledWith({
        relations: expect.any(Object),
        where: expect.any(Object),
      });

      expect(usersRepository.save).toHaveBeenCalledTimes(1);
      expect(usersRepository.save).toHaveBeenCalledWith({ verified: true });

      expect(verfiRepository.delete).toHaveBeenCalledTimes(1);
      expect(verfiRepository.delete).toHaveBeenCalledWith(mockedVerifi.id);

      expect(result).toEqual({ ok: true });
    });
    it(`should fail verification`, async () => {
      verfiRepository.findOne.mockResolvedValue(undefined);
      const result = await service.verifyEmail('');
      expect(result).toEqual({ ok: false, error: 'Verification not found.' });
    });
    it('should fail on exception', async () => {
      verfiRepository.findOne.mockResolvedValue(new Error());
      const result = await service.verifyEmail(``);
      expect(result).toEqual({
        ok: false,
        error: `Could not verify email`,
      });
    });
  });
});
