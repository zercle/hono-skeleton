import { IRepository } from '../../domain/interfaces/repository.interface';
import { Post } from '../../domain/models/post.model';

export interface IPostRepository extends IRepository<Post> {
  findByAuthorId(authorId: string): Promise<Post[]>;
}