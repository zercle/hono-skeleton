import 'reflect-metadata';
import { describe, it, expect, beforeEach } from 'bun:test';
import { CreatePostUseCase } from '../usecases/create-post';
import { MockPostRepository } from '../mocks/mock-post-repository';

describe('CreatePostUseCase', () => {
  let createPostUseCase: CreatePostUseCase;
  let mockPostRepository: MockPostRepository;

  beforeEach(() => {
    mockPostRepository = new MockPostRepository();
    createPostUseCase = new CreatePostUseCase(mockPostRepository);
  });

  it('should create a post with all required fields', async () => {
    // Arrange
    const input = {
      title: 'Test Post',
      content: 'This is a test post content',
      excerpt: 'Test excerpt',
      published: false,
      authorId: 'author-123',
    };

    // Act
    const result = await createPostUseCase.execute(input);

    // Assert
    expect(result).toBeDefined();
    expect(result.title).toBe(input.title);
    expect(result.content).toBe(input.content);
    expect(result.excerpt).toBe(input.excerpt);
    expect(result.published).toBe(false);
    expect(result.authorId).toBe(input.authorId);
    expect(result.id).toBeDefined();
    expect(result.createdAt).toBeInstanceOf(Date);
    expect(result.updatedAt).toBeInstanceOf(Date);
  });

  it('should create a post with default published status', async () => {
    // Arrange
    const input = {
      title: 'Test Post',
      content: 'This is a test post content',
      authorId: 'author-123',
    };

    // Act
    const result = await createPostUseCase.execute(input);

    // Assert
    expect(result.published).toBe(false);
    expect(result.excerpt).toBe(null);
  });

  it('should create a published post', async () => {
    // Arrange
    const input = {
      title: 'Published Post',
      content: 'This is a published post',
      published: true,
      authorId: 'author-123',
    };

    // Act
    const result = await createPostUseCase.execute(input);

    // Assert
    expect(result.published).toBe(true);
  });

  it('should validate input schema', async () => {
    // Arrange
    const invalidInput = {
      title: '', // Empty title should fail validation
      content: 'Content',
      authorId: 'author-123',
    };

    // Act & Assert
    expect(async () => {
      await createPostUseCase.execute(invalidInput);
    }).toThrow();
  });

  it('should persist the post to repository', async () => {
    // Arrange
    const input = {
      title: 'Test Post',
      content: 'This is a test post content',
      authorId: 'author-123',
    };

    // Act
    await createPostUseCase.execute(input);

    // Assert
    expect(mockPostRepository.count()).toBe(1);
    const posts = mockPostRepository.getAll();
    expect(posts[0]?.title).toBe(input.title);
  });
});