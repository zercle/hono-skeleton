import { injectable, inject } from 'tsyringe';
import { type Post } from '../entities/post';
import { type IPostRepository } from '../repositories/post-repository';
import { PostRepositoryToken } from '@zercle/shared/container/tokens';

interface GetPostUseCaseInput {
  id: string;
}

interface GetPostUseCaseOutput extends Post {}

@injectable()
export class GetPostUseCase {
  constructor(
    @inject(PostRepositoryToken) private postRepository: IPostRepository
  ) {}

  async execute(input: GetPostUseCaseInput): Promise<GetPostUseCaseOutput | null> {
    const post = await this.postRepository.findById(input.id);
    
    if (!post) {
      return null;
    }

    return post;
  }
}