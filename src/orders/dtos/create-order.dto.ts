import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';
import { CoreOutPutDto } from 'src/common/dtos/core.dto';

import { OrderItemOption } from '../entities/order-items.entity';

@InputType()
class CreateOrderItemInput {
  @Field((type) => Int)
  dishId: number;

  @Field((type) => OrderItemOption, { nullable: true })
  options?: OrderItemOption[];
}

@InputType()
export class CreateOrderInput {
  @Field((type) => Int)
  restaurantId: number;

  @Field((type) => [CreateOrderItemInput])
  items: CreateOrderItemInput[];
}

@ObjectType()
export class CreateOrderOutput extends CoreOutPutDto {}
