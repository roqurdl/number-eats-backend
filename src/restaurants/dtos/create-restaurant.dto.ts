import { Field, InputType, ObjectType, PickType } from '@nestjs/graphql';
import { CoreOutPutDto } from 'src/common/dtos/core.dto';
import { Restaurant } from '../entities/restarant.entity';

@InputType()
export class createRestaurantInput extends PickType(Restaurant, [
  `name`,
  `coverImg`,
  `address`,
]) {
  @Field((type) => String)
  categoryName: string;
}

@ObjectType()
export class createRestaurantOutput extends CoreOutPutDto {}
