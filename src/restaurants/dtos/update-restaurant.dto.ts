import { Field, InputType, PartialType } from '@nestjs/graphql';
import { createRestaurantDto } from './create-restaurant.dto';

@InputType()
class updateRestaurantForm extends PartialType(createRestaurantDto) {}

@InputType()
export class updateRestaurantDto {
  @Field((type) => Number)
  id: number;
  @Field((type) => updateRestaurantForm)
  data: updateRestaurantForm;
}
