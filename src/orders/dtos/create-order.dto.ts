import { Field, InputType, Int, ObjectType, PickType } from '@nestjs/graphql';
import { CoreOutPutDto } from 'src/common/dtos/core.dto';

import { Order } from '../entities/order.entity';

@InputType()
export class CreateOrderInput extends PickType(Order, [`items`]) {
  @Field((type) => Int)
  restaurantId: number;
}

@ObjectType()
export class CreateOrderOutput extends CoreOutPutDto {}
