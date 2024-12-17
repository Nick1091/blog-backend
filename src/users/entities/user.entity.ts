import { Role } from '@prisma/client';
import { Exclude, Expose } from 'class-transformer';

export class UserEntity {
  @Expose()
  uid: string;

  @Expose()
  email: string;

  @Expose()
  roles: Role[];

  @Expose()
  createdAt: Date | null;

  @Expose()
  updatedAt: Date | null;

  @Exclude()
  password: string;

  constructor(partial: Partial<UserEntity>) {
    Object.assign(this, partial);
  }
}
