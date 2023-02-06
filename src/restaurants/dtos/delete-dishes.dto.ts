import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';
import { CoreOutPutDto } from 'src/common/dtos/core.dto';

@InputType()
export class DeleteDishesInput {
  @Field((type) => Int)
  dishId: number;
}

@ObjectType()
export class DeleteDishesOutput extends CoreOutPutDto {}
