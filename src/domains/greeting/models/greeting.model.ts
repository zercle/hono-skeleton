import { BaseEntity } from '../../../shared/base/entities/base.entity';

export interface Greeting extends BaseEntity {
  message: string;
}
