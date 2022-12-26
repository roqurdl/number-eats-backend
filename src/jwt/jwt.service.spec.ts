import { Test } from '@nestjs/testing';
import * as jwt from 'jsonwebtoken';
import { CONFIG_OPTION } from 'src/common/common.constant';
import { JwtService } from './jwt.service';

const TEST_KEY = `testKey`;
const PAYLOAD = { id: 1 };

jest.mock(`jsonwebtoken`, () => {
  return {
    sign: jest.fn(() => `Test-Token`),
    verify: jest.fn(() => PAYLOAD),
  };
});

describe(`JwtService`, () => {
  let service: JwtService;
  beforeEach(async () => {
    const modules = await Test.createTestingModule({
      providers: [
        JwtService,
        {
          provide: CONFIG_OPTION,
          useValue: { privateKey: TEST_KEY },
        },
      ],
    }).compile();
    service = modules.get<JwtService>(JwtService);
  });
  it(`should be defined`, () => {
    expect(service).toBeDefined();
  });

  describe(`sign`, () => {
    it(`should return a signed token`, () => {
      const token = service.sign(PAYLOAD);

      expect(typeof token).toBe(`string`);

      expect(jwt.sign).toHaveBeenCalledTimes(1);
      expect(jwt.sign).toHaveBeenCalledWith(PAYLOAD, TEST_KEY);
    });
  });

  describe(`verifyToken`, () => {
    it(`should return the decoded token`, () => {
      const TOKEN = `Input-Token`;
      const decodedToken = service.verifyToken(TOKEN);

      expect(decodedToken).toEqual(PAYLOAD);

      expect(jwt.verify).toHaveBeenCalledTimes(1);
      expect(jwt.verify).toHaveBeenCalledWith(TOKEN, TEST_KEY);
    });
  });
});
