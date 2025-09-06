import { BaseEntity } from '../entities/base.entity';

export interface Post extends BaseEntity {
  title: string;
  content?: string;
  authorId: string;
}