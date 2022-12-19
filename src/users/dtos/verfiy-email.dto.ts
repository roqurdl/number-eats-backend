import { InputType, ObjectType, PickType } from '@nestjs/graphql';
import { CoreOutPutDto } from 'src/common/dtos/core.dto';
import { Verification } from '../entities/verification.entity';

@ObjectType()
export class VerifyEmailOutput extends CoreOutPutDto {}

@InputType()
export class VerifyEmailInput extends PickType(Verification, ['code']) {}
