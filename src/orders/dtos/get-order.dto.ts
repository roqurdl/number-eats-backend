import { Field, InputType, ObjectType, PickType } from '@nestjs/graphql';
import { CoreOutPutDto } from 'src/common/dtos/core.dto';

import { Order } from '../entities/order.entity';

@InputType()
export class GetOrderInput extends PickType(Order, ['id']) {}

@ObjectType()
export class GetOrderOutput extends CoreOutPutDto {
  @Field((type) => Order, { nullable: true })
  order?: Order;
}
