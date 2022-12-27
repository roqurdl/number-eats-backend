import { Test } from '@nestjs/testing';
import got from 'got';
import * as FormData from 'form-data';
import { CONFIG_OPTION } from 'src/common/common.constant';
import { EmailService } from './email.service';

jest.mock(`got`);
jest.mock(`form-data`);

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

  describe('sendVerificationEmail', () => {
    it(`should call sendEmail`, () => {
      const sendVerifiEmailArgs = {
        email: 'test-email',
        code: 'test-code',
      };
      jest.spyOn(service, 'sendEmail').mockImplementation(async () => {
        return true;
      });
      service.sendVerificationEmail(
        sendVerifiEmailArgs.email,
        sendVerifiEmailArgs.code,
      );
      expect(service.sendEmail).toHaveBeenCalledTimes(1);
      expect(service.sendEmail).toHaveBeenCalledWith(
        'Verify Your Email',
        'verify-email',
        [
          { key: 'code', value: sendVerifiEmailArgs.code },
          { key: 'username', value: sendVerifiEmailArgs.email },
        ],
      );
    });
  });

  describe('sendEmail', () => {
    it(`should to send Email`, async () => {
      const pass = await service.sendEmail('', '', [
        { key: 'attr', value: 'attrValue' },
      ]);
      const formSpy = jest.spyOn(FormData.prototype, `append`);
      expect(formSpy).toHaveBeenCalled();

      expect(got.post).toHaveBeenCalledTimes(1);
      expect(got.post).toHaveBeenCalledWith(
        `https://api.mailgun.net/v3/${TEST_VALUE.domain}/messages`,
        expect.any(Object),
      );
      expect(pass).toEqual(true);
    });
    it(`shoul fail to send Email`, async () => {
      jest.spyOn(got, `post`).mockImplementation(() => {
        throw new Error();
      });
      const pass = await service.sendEmail('', '', []);
      expect(pass).toEqual(false);
    });
  });
});
