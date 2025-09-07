import 'reflect-metadata';
import { describe, it, expect, beforeEach } from 'bun:test';
import { GetPostUseCase } from '../usecases/get-post';
import { MockPostRepository } from '../mocks/mock-post-repository';
import { Post } from '../entities/post';

describe('GetPostUseCase', () => {
  let getPostUseCase: GetPostUseCase;
  let mockPostRepository: MockPostRepository;

  beforeEach(() => {
    mockPostRepository = new MockPostRepository();
    getPostUseCase = new GetPostUseCase(mockPostRepository);
  });

  it('should return a post by ID', async () => {
    // Arrange
    const createdPost = await mockPostRepository.create({
      title: 'Test Post',
      content: 'Test content',
      authorId: 'author-123',
      published: true,
    });

    // Act
    const result = await getPostUseCase.execute({ id: createdPost.id });

    // Assert
    expect(result).toBeDefined();
    expect(result?.id).toBe(createdPost.id);
    expect(result?.title).toBe('Test Post');
    expect(result?.content).toBe('Test content');
    expect(result?.authorId).toBe('author-123');
    expect(result?.published).toBe(true);
  });

  it('should return null for non-existent post', async () => {
    // Arrange
    const nonExistentId = 'non-existent-id';

    // Act
    const result = await getPostUseCase.execute({ id: nonExistentId });

    // Assert
    expect(result).toBe(null);
  });

  it('should return post with all fields', async () => {
    // Arrange
    const postData = {
      title: 'Complete Post',
      content: 'Complete content',
      excerpt: 'Complete excerpt',
      published: false,
      authorId: 'author-456',
    };
    const createdPost = await mockPostRepository.create(postData);

    // Act
    const result = await getPostUseCase.execute({ id: createdPost.id });

    // Assert
    expect(result).toBeDefined();
    expect(result?.title).toBe(postData.title);
    expect(result?.content).toBe(postData.content);
    expect(result?.excerpt).toBe(postData.excerpt);
    expect(result?.published).toBe(postData.published);
    expect(result?.authorId).toBe(postData.authorId);
    expect(result?.createdAt).toBeInstanceOf(Date);
    expect(result?.updatedAt).toBeInstanceOf(Date);
  });
});