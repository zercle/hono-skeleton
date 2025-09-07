import { injectable, inject } from 'tsyringe';
import { type IPostRepository } from '../repositories/post-repository';
import { PostRepositoryToken } from '@zercle/shared/container/tokens';

interface DeletePostUseCaseInput {
  id: string;
  authorId?: string; // Optional for authorization checks
}

interface DeletePostUseCaseOutput {
  success: boolean;
}

@injectable()
export class DeletePostUseCase {
  constructor(
    @inject(PostRepositoryToken) private postRepository: IPostRepository
  ) {}

  async execute(input: DeletePostUseCaseInput): Promise<DeletePostUseCaseOutput> {
    // Check if post exists
    const existingPost = await this.postRepository.findById(input.id);
    if (!existingPost) {
      throw new Error('Post not found');
    }

    // Optional: Check if user is authorized to delete this post
    if (input.authorId && existingPost.authorId !== input.authorId) {
      throw new Error('Unauthorized to delete this post');
    }

    // Delete post
    const success = await this.postRepository.delete(input.id);
    
    return { success };
  }
}