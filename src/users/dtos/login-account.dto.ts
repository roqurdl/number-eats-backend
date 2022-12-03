import { Field, InputType, ObjectType, PickType } from '@nestjs/graphql';
import { MutationOutputDto } from 'src/common/dtos/core.dto';
import { Users } from '../entities/users.entity';

@InputType()
export class LoginInput extends PickType(Users, ['email', 'password']) {}

@ObjectType()
export class LoginOutput extends MutationOutputDto {
  @Field((type) => String, { nullable: true })
  token?: string;
}
