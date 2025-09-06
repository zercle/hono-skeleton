import { IRepository } from '../../../../shared/base/interfaces/repository.interface';
import { Post } from '../models/post.model';

export interface IPostRepository extends IRepository<Post> {
  findByAuthorId(authorId: string): Promise<Post[]>;
}