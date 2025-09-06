import { BaseEntity } from '../entities/base.entity';

export interface Greeting extends BaseEntity {
  message: string;
}
