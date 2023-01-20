import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { DataSource, DataSourceOptions, Repository } from 'typeorm';
import { Users } from 'src/users/entities/users.entity';
import { Verification } from 'src/users/entities/verification.entity';
import { getRepositoryToken } from '@nestjs/typeorm';

jest.mock('got', () => {
  return {
    post: jest.fn(),
  };
});

const GRAPHQL_ENDPOINT = '/graphql';
const TEST_USER = {
  email: 'test@email.com',
  password: `12345`,
};
describe('UserModule (e2e)', () => {
  let app: INestApplication;
  let jwtToken: string;
  let usersRepository: Repository<Users>;
  let verificationsRepository: Repository<Verification>;

  const baseTest = () => request(app.getHttpServer()).post(GRAPHQL_ENDPOINT);
  const publicTest = (query: string) => baseTest().send({ query });
  const privateTest = (query: string) =>
    baseTest().set('X-JWT', jwtToken).send({ query });

  jest.setTimeout(30000);
  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = module.createNestApplication();
    usersRepository = module.get<Repository<Users>>(getRepositoryToken(Users));
    verificationsRepository = module.get<Repository<Verification>>(
      getRepositoryToken(Verification),
    );
    await app.init();
  });

  afterAll(async () => {
    const options: DataSourceOptions = {
      type: 'postgres',
      database: 'number-eats-test',
      host: `172.28.144.1`,
      port: 5432,
      username: `rolph`,
      password: `381858`,
      entities: [Users, Verification],
    };
    const dataSource = new DataSource(options);
    await dataSource.initialize();
    await dataSource.driver.connect();
    await new Promise((resolve) => setTimeout(() => resolve({}), 10000));
    await dataSource.dropDatabase();
    await dataSource.destroy();
    await app.close();
  });

  describe('createAccount', () => {
    it('should create account', () => {
      return publicTest(
        `mutation {
            createAccount(input: {
              email:"${TEST_USER.email}",
              password:"${TEST_USER.password}",
              role:Owner
            }) {
              ok
              error
            }
          }
          `,
      )
        .expect(200)
        .expect((res) => {
          const {
            body: {
              data: { createAccount },
            },
          } = res;
          expect(createAccount.ok).toBe(true);
          expect(createAccount.error).toBe(null);
        });
    });

    it('should fail if account already exists', () => {
      return publicTest(
        `
          mutation {
            createAccount(input: {
              email:"${TEST_USER.email}",
              password:"${TEST_USER.password}",
              role:Owner
            }) {
              ok
              error
            }
          }
        `,
      )
        .expect(200)
        .expect((res) => {
          const {
            body: {
              data: { createAccount },
            },
          } = res;
          expect(createAccount.ok).toBe(false);
          expect(createAccount.error).toBe('This email already used.');
        });
    });
  });

  describe('login', () => {
    it(`should login with correct Account`, () => {
      return publicTest(
        `
          mutation {
            login(input:{
              email:"${TEST_USER.email}",
              password:"${TEST_USER.password}",
            }) {
              ok
              error
              token
            }
          }
        `,
      )
        .expect(200)
        .expect((res) => {
          const {
            body: {
              data: { login },
            },
          } = res;
          expect(login.ok).toBe(true);
          expect(login.error).toBe(null);
          expect(login.token).toEqual(expect.any(String));
          jwtToken = login.token;
        });
    });
    it(`should fail to login because of wrong user info`, () => {
      return publicTest(
        `
        mutation {
          login(input:{
            email:"${TEST_USER.email}",
            password:"xxxx",
          }) {
            ok
            error
            token
          }
        }
      `,
      )
        .expect(200)
        .expect((res) => {
          const {
            body: {
              data: { login },
            },
          } = res;
          expect(login.ok).toBe(false);
          expect(login.error).toBe('You enter the Wrong Password');
          expect(login.token).toBe(null);
        });
    });
  });

  describe('userProfile', () => {
    let userId: number;
    beforeAll(async () => {
      const [user] = await usersRepository.find();
      userId = user.id;
    });
    it(`should see a user profile`, () => {
      return privateTest(`
      {
        userProfile(userId:${userId}){
          ok
          error
          user{
            id
          }
        }
      }
      `)
        .expect(200)
        .expect((res) => {
          const {
            body: {
              data: {
                userProfile: {
                  ok,
                  error,
                  user: { id },
                },
              },
            },
          } = res;
          expect(ok).toBe(true);
          expect(error).toBe(null);
          expect(id).toBe(userId);
        });
    });
  });

  describe('me', () => {
    it('should find my profile', () => {
      return privateTest(`
          {
            me {
              email
            }
          }
        `)
        .expect(200)
        .expect((res) => {
          const {
            body: {
              data: {
                me: { email },
              },
            },
          } = res;
          expect(email).toBe(TEST_USER.email);
        });
    });
    it('should reject not login user', () => {
      return publicTest(
        `
          {
            me {
              email
            }
          }
        `,
      )
        .expect(200)
        .expect((res) => {
          const {
            body: { errors },
          } = res;
          const [error] = errors;
          expect(error.message).toBe('Forbidden resource');
        });
    });
  });
  describe('editProfile', () => {
    const NEW_EMAIL = 'test@new.com';
    it('should change email', () => {
      return privateTest(`
            mutation {
              editProfile(input:{
                email: "${NEW_EMAIL}"
              }) {
                ok
                error
              }
            }
        `)
        .expect(200)
        .expect((res) => {
          const {
            body: {
              data: {
                editProfile: { ok, error },
              },
            },
          } = res;
          expect(ok).toBe(true);
          expect(error).toBe(null);
        });
    });
    it('should have new email', () => {
      return privateTest(`
          {
            me {
              email
            }
          }
        `)
        .expect(200)
        .expect((res) => {
          const {
            body: {
              data: {
                me: { email },
              },
            },
          } = res;
          expect(email).toBe(NEW_EMAIL);
        });
    });
  });
  describe('verifyEmail', () => {
    let verificationCode: string;
    beforeAll(async () => {
      const [verification] = await verificationsRepository.find();
      verificationCode = verification.code;
    });
    it('should verify email', () => {
      return publicTest(
        `
          mutation {
            verifyEmail(input:{
              code:"${verificationCode}"
            }){
              ok
              error
            }
          }
        `,
      )
        .expect(200)
        .expect((res) => {
          const {
            body: {
              data: {
                verifyEmail: { ok, error },
              },
            },
          } = res;
          expect(ok).toBe(true);
          expect(error).toBe(null);
        });
    });
    it('should fail on verification code not found', () => {
      return publicTest(
        `
          mutation {
            verifyEmail(input:{
              code:"xxxxx"
            }){
              ok
              error
            }
          }
        `,
      )
        .expect(200)
        .expect((res) => {
          const {
            body: {
              data: {
                verifyEmail: { ok, error },
              },
            },
          } = res;
          expect(ok).toBe(false);
          expect(error).toBe('Verification not found.');
        });
    });
  });
});
