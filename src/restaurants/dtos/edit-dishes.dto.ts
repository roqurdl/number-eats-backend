import {
  Field,
  InputType,
  Int,
  ObjectType,
  PartialType,
  PickType,
} from '@nestjs/graphql';
import { CoreOutPutDto } from 'src/common/dtos/core.dto';
import { Dish } from '../entities/dish.entity';

@InputType()
export class EditDishesInput extends PickType(PartialType(Dish), [
  `name`,
  `price`,
  `description`,
  `options`,
]) {
  @Field((type) => Int)
  dishId: number;
}

@ObjectType()
export class EditDishesOutput extends CoreOutPutDto {}
