import { uuidv7 } from 'uuidv7';
import { injectable, inject } from 'tsyringe';
import { type Post } from '../entities/post';
import { type IPostRepository } from '../repositories/post-repository';
import { CreatePostInputSchema, type CreatePostInput } from '../models/schemas';
import { PostRepositoryToken } from '@zercle/shared/container/tokens';

interface CreatePostUseCaseInput extends CreatePostInput {
  authorId: string;
}

interface CreatePostUseCaseOutput extends Omit<Post, 'authorId'> {
  authorId: string;
}

@injectable()
export class CreatePostUseCase {
  constructor(
    @inject(PostRepositoryToken) private postRepository: IPostRepository
  ) {}

  async execute(input: CreatePostUseCaseInput): Promise<CreatePostUseCaseOutput> {
    // Validate input using Zod schema
    const validatedInput = CreatePostInputSchema.parse(input);

    // Create post data with UUIDv7 ID
    const postData = {
      ...validatedInput,
      authorId: input.authorId,
      published: validatedInput.published ?? false,
      excerpt: validatedInput.excerpt ?? null,
    };

    // Save post
    const savedPost = await this.postRepository.create(postData);

    return savedPost;
  }
}