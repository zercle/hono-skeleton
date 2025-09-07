import { injectable, inject } from 'tsyringe';
import { type Post } from '../entities/post';
import { type IPostRepository } from '../repositories/post-repository';
import { UpdatePostInputSchema, type UpdatePostInput } from '../models/schemas';
import { PostRepositoryToken } from '@zercle/shared/container/tokens';

interface UpdatePostUseCaseInput extends UpdatePostInput {
  id: string;
  authorId?: string; // Optional for authorization checks
}

interface UpdatePostUseCaseOutput extends Post {}

@injectable()
export class UpdatePostUseCase {
  constructor(
    @inject(PostRepositoryToken) private postRepository: IPostRepository
  ) {}

  async execute(input: UpdatePostUseCaseInput): Promise<UpdatePostUseCaseOutput | null> {
    // Validate input using Zod schema
    const validatedInput = UpdatePostInputSchema.parse(input);

    // Check if post exists
    const existingPost = await this.postRepository.findById(input.id);
    if (!existingPost) {
      return null;
    }

    // Optional: Check if user is authorized to update this post
    if (input.authorId && existingPost.authorId !== input.authorId) {
      throw new Error('Unauthorized to update this post');
    }

    // Update post
    const updatedPost = await this.postRepository.update(input.id, validatedInput);
    
    return updatedPost;
  }
}