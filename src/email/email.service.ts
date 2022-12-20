import got from 'got';
import * as FormData from 'form-data';
import { Inject, Injectable } from '@nestjs/common';
import { EmailModuleOptions, EmailVar } from './email.interface';
import { CONFIG_OPTION } from 'src/common/common.constant';

@Injectable()
export class EmailService {
  constructor(
    @Inject(CONFIG_OPTION) private readonly options: EmailModuleOptions,
  ) {}

  private async sendEmail(
    subject: string,
    template: string,
    emailVars: EmailVar[],
  ) {
    const form = new FormData();
    form.append('from', `From Number-Eats <mailgun@${this.options.domain}>`);
    form.append('to', process.env.MAILGUN_TO_EMAIL);
    form.append('subject', subject);
    form.append('text', template);
    emailVars.forEach((eVar) => form.append(`v:${eVar.key}`, eVar.value));
    try {
      await got(`https://api.mailgun.net/v3/${this.options.domain}/messages`, {
        method: 'POST',
        headers: {
          Authorization: `Basic ${Buffer.from(
            `api:${this.options.apiKey}`,
          ).toString('base64')}`,
        },
        body: form,
      });
    } catch (error) {
      console.log(error);
    }
  }
  sendVerificationEmail(email: string, code: string) {
    this.sendEmail('Verify Your Email', 'verify-email', [
      { key: 'code', value: code },
      { key: 'username', value: email },
    ]);
  }
}
