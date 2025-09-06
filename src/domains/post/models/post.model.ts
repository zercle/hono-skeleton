import { BaseEntity } from '../../../shared/base/entities/base.entity';

export interface Post extends BaseEntity {
  title: string;
  content?: string;
  authorId: string;
}