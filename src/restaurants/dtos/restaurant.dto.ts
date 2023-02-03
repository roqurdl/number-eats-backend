import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';
import { CoreOutPutDto } from 'src/common/dtos/core.dto';
import { Restaurant } from '../entities/restarant.entity';

@InputType()
export class RestaurantInput {
  @Field((type) => Int)
  restaurantId: number;
}

@ObjectType()
export class RestaurantOutput extends CoreOutPutDto {
  @Field((type) => Restaurant, { nullable: true })
  restaurant?: Restaurant;
}
