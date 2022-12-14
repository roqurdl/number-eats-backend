import { InputType, ObjectType, PickType } from '@nestjs/graphql';
import { CoreOutPutDto } from 'src/common/dtos/core.dto';
import { Users } from '../entities/users.entity';

@InputType()
export class CreateAccountInput extends PickType(Users, [
  'email',
  'password',
  'role',
]) {}

@ObjectType()
export class CreateAccountOutput extends CoreOutPutDto {}
