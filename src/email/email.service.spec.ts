import { Test } from '@nestjs/testing';
import { CONFIG_OPTION } from 'src/common/common.constant';
import { EmailService } from './email.service';

jest.mock(`got`, () => {});
jest.mock(`form-data`, () => {
  return {
    append: jest.fn(),
  };
});

const TEST_VALUE = {
  apiKey: `Test-ApiKey`,
  domain: `Test-Domain`,
  fromEmail: `Test-FromEmail`,
};

describe(`EmailService`, () => {
  let service: EmailService;
  beforeEach(async () => {
    const modules = await Test.createTestingModule({
      providers: [
        EmailService,
        {
          provide: CONFIG_OPTION,
          useValue: TEST_VALUE,
        },
      ],
    }).compile();
    service = modules.get<EmailService>(EmailService);
  });
  it(`should be defined`, () => {
    expect(service).toBeDefined();
  });

  it.todo('sendEmail');
  it.todo('sendVerificationEmail');
});
