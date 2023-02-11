import { Field, ObjectType } from '@nestjs/graphql';
import { CoreOutPutDto } from 'src/common/dtos/core.dto';
import { Payment } from '../entities/payment.entity';

@ObjectType()
export class GetPaymentsOutput extends CoreOutPutDto {
  @Field((type) => [Payment], { nullable: true })
  payments?: Payment[];
}
