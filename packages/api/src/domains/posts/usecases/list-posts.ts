import { injectable, inject } from 'tsyringe';
import { type IPostRepository, type PostListResult } from '../repositories/post-repository';
import { InternalPostQuerySchema, type InternalPostQuery } from '../models/schemas';
import { PostRepositoryToken } from '@zercle/shared/container/tokens';

interface ListPostsUseCaseOutput extends PostListResult {}

@injectable()
export class ListPostsUseCase {
  constructor(
    @inject(PostRepositoryToken) private postRepository: IPostRepository
  ) {}

  async execute(input: InternalPostQuery): Promise<ListPostsUseCaseOutput> {
    // Validate input using Zod schema
    const validatedInput = InternalPostQuerySchema.parse(input);

    // Fetch posts with pagination and filtering
    const result = await this.postRepository.findAll(validatedInput);

    return result;
  }
}