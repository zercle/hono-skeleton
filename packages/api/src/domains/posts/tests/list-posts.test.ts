import 'reflect-metadata';
import { describe, it, expect, beforeEach } from 'bun:test';
import { uuidv7 } from 'uuidv7';
import { ListPostsUseCase } from '../usecases/list-posts';
import { MockPostRepository } from '../mocks/mock-post-repository';

describe('ListPostsUseCase', () => {
  let listPostsUseCase: ListPostsUseCase;
  let mockPostRepository: MockPostRepository;
  let author1Id: string;
  let author2Id: string;

  beforeEach(async () => {
    mockPostRepository = new MockPostRepository();
    listPostsUseCase = new ListPostsUseCase(mockPostRepository);

    // Generate valid UUIDs for authors
    author1Id = uuidv7();
    author2Id = uuidv7();

    // Create test posts
    await mockPostRepository.create({
      title: 'Published Post 1',
      content: 'Content 1',
      published: true,
      authorId: author1Id,
    });
    
    await mockPostRepository.create({
      title: 'Draft Post 1',
      content: 'Content 2',
      published: false,
      authorId: author1Id,
    });
    
    await mockPostRepository.create({
      title: 'Published Post 2',
      content: 'Content 3',
      published: true,
      authorId: author2Id,
    });
  });

  it('should return paginated posts', async () => {
    // Arrange
    const query = { page: 1, limit: 2 };

    // Act
    const result = await listPostsUseCase.execute(query);

    // Assert
    expect(result).toBeDefined();
    expect(result.posts).toHaveLength(2);
    expect(result.total).toBe(3);
    expect(result.page).toBe(1);
    expect(result.limit).toBe(2);
    expect(result.totalPages).toBe(2);
  });

  it('should filter by published status', async () => {
    // Arrange
    const query = { published: true };

    // Act
    const result = await listPostsUseCase.execute(query);

    // Assert
    expect(result.posts).toHaveLength(2);
    result.posts.forEach(post => {
      expect(post.published).toBe(true);
    });
  });

  it('should filter by draft status', async () => {
    // Arrange
    const query = { published: false };

    // Act
    const result = await listPostsUseCase.execute(query);

    // Assert
    expect(result.posts).toHaveLength(1);
    expect(result.posts[0]?.published).toBe(false);
    expect(result.posts[0]?.title).toBe('Draft Post 1');
  });

  it('should filter by author ID', async () => {
    // Arrange
    const query = { authorId: author1Id };

    // Act
    const result = await listPostsUseCase.execute(query);

    // Assert
    expect(result.posts).toHaveLength(2);
    result.posts.forEach(post => {
      expect(post.authorId).toBe(author1Id);
    });
  });

  it('should combine filters', async () => {
    // Arrange
    const query = { published: true, authorId: author1Id };

    // Act
    const result = await listPostsUseCase.execute(query);

    // Assert
    expect(result.posts).toHaveLength(1);
    expect(result.posts[0]?.published).toBe(true);
    expect(result.posts[0]?.authorId).toBe(author1Id);
    expect(result.posts[0]?.title).toBe('Published Post 1');
  });

  it('should handle pagination correctly', async () => {
    // Arrange
    const query = { page: 2, limit: 2 };

    // Act
    const result = await listPostsUseCase.execute(query);

    // Assert
    expect(result.posts).toHaveLength(1);
    expect(result.page).toBe(2);
    expect(result.limit).toBe(2);
    expect(result.totalPages).toBe(2);
  });

  it('should use default pagination values', async () => {
    // Arrange
    const query = {};

    // Act
    const result = await listPostsUseCase.execute(query);

    // Assert
    expect(result.page).toBe(1);
    expect(result.limit).toBe(10);
    expect(result.posts).toHaveLength(3);
  });
});