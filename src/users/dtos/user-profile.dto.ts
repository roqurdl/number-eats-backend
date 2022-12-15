import { ArgsType, Field, ObjectType } from '@nestjs/graphql';
import { CoreOutPutDto } from 'src/common/dtos/core.dto';
import { Users } from '../entities/users.entity';

@ArgsType()
export class UserProfileInput {
  @Field((type) => Number)
  userId: number;
}

@ObjectType()
export class UserProfileOutput extends CoreOutPutDto {
  @Field((type) => Users, { nullable: true })
  user?: Users;
}
