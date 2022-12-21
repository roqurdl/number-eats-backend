import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EmailService } from 'src/email/email.service';
import { JwtService } from 'src/jwt/jwt.service';
import { Users } from './entities/users.entity';
import { Verification } from './entities/verification.entity';
import { UserService } from './users.service';

const usersRepository = {
  findOne: jest.fn(),
  findOneBy: jest.fn(),
  save: jest.fn(),
  create: jest.fn(),
};
const verfiRepository = {
  findOne: jest.fn(),
  delete: jest.fn(),
  save: jest.fn(),
  create: jest.fn(),
};
const jwtRepository = {
  sign: jest.fn(),
  verifyToken: jest.fn(),
};
const emailRepository = {
  sendVerificationEmail: jest.fn(),
};

describe(`UserService`, () => {
  let service: UserService;

  beforeAll(async () => {
    const modules = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(Users),
          useValue: usersRepository,
        },
        {
          provide: getRepositoryToken(Verification),
          useValue: verfiRepository,
        },
        {
          provide: JwtService,
          useValue: jwtRepository,
        },
        {
          provide: EmailService,
          useValue: emailRepository,
        },
      ],
    }).compile();
    service = modules.get<UserService>(UserService);
  });

  it(`should be defined`, () => {
    expect(service).toBeDefined();
  });

  it.todo(`createAccount`);
  it.todo(`login`);
  it.todo(`findById`);
  it.todo(`editProfile`);
  it.todo(`verifyEmail`);
});
