import { Field, InputType, Int, ObjectType, PickType } from '@nestjs/graphql';
import { CoreOutPutDto } from 'src/common/dtos/core.dto';
import { Dish } from '../entities/dish.entity';

@InputType()
export class CreateDishesInput extends PickType(Dish, [
  `name`,
  `price`,
  `description`,
  `options`,
]) {
  @Field((type) => Int)
  restaurantId: number;
}

@ObjectType()
export class CreateDishesOutput extends CoreOutPutDto {}
