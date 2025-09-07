import 'reflect-metadata';
import { describe, it, expect, beforeEach } from 'bun:test';
import { uuidv7 } from 'uuidv7';
import { UpdatePostUseCase } from '../usecases/update-post';
import { MockPostRepository } from '../mocks/mock-post-repository';
import { Post } from '../entities/post';

describe('UpdatePostUseCase', () => {
  let updatePostUseCase: UpdatePostUseCase;
  let mockPostRepository: MockPostRepository;
  let existingPost: Post;
  let authorId: string;

  beforeEach(async () => {
    mockPostRepository = new MockPostRepository();
    updatePostUseCase = new UpdatePostUseCase(mockPostRepository);
    authorId = uuidv7();

    // Create an existing post for testing
    existingPost = await mockPostRepository.create({
      title: 'Original Title',
      content: 'Original Content',
      excerpt: 'Original Excerpt',
      published: false,
      authorId,
    });
  });

  it('should update post fields', async () => {
    // Arrange
    const originalUpdatedAt = existingPost.updatedAt.getTime();
    // Add a small delay to ensure timestamp difference
    await new Promise(resolve => setTimeout(resolve, 10));
    
    const updateData = {
      id: existingPost.id,
      title: 'Updated Title',
      content: 'Updated Content',
      published: true,
    };

    // Act
    const result = await updatePostUseCase.execute(updateData);

    // Assert
    expect(result).toBeDefined();
    expect(result?.title).toBe('Updated Title');
    expect(result?.content).toBe('Updated Content');
    expect(result?.published).toBe(true);
    expect(result?.excerpt).toBe('Original Excerpt'); // Unchanged
    expect(result?.authorId).toBe(authorId); // Unchanged
    expect(result?.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt);
  });

  it('should update only specified fields', async () => {
    // Arrange
    const updateData = {
      id: existingPost.id,
      title: 'New Title Only',
    };

    // Act
    const result = await updatePostUseCase.execute(updateData);

    // Assert
    expect(result).toBeDefined();
    expect(result?.title).toBe('New Title Only');
    expect(result?.content).toBe('Original Content'); // Unchanged
    expect(result?.excerpt).toBe('Original Excerpt'); // Unchanged
    expect(result?.published).toBe(false); // Unchanged
  });

  it('should return null for non-existent post', async () => {
    // Arrange
    const updateData = {
      id: 'non-existent-id',
      title: 'Updated Title',
    };

    // Act
    const result = await updatePostUseCase.execute(updateData);

    // Assert
    expect(result).toBe(null);
  });

  it('should enforce author authorization', async () => {
    // Arrange
    const differentAuthorId = uuidv7();
    const updateData = {
      id: existingPost.id,
      title: 'Updated Title',
      authorId: differentAuthorId,
    };

    // Act & Assert
    expect(async () => {
      await updatePostUseCase.execute(updateData);
    }).toThrow('Unauthorized to update this post');
  });

  it('should allow update without authorization check', async () => {
    // Arrange
    const updateData = {
      id: existingPost.id,
      title: 'Updated Title',
      // No authorId provided - should skip authorization
    };

    // Act
    const result = await updatePostUseCase.execute(updateData);

    // Assert
    expect(result).toBeDefined();
    expect(result?.title).toBe('Updated Title');
  });

  it('should allow same author to update', async () => {
    // Arrange
    const updateData = {
      id: existingPost.id,
      title: 'Updated by Same Author',
      authorId: authorId, // Same as existing post
    };

    // Act
    const result = await updatePostUseCase.execute(updateData);

    // Assert
    expect(result).toBeDefined();
    expect(result?.title).toBe('Updated by Same Author');
  });

  it('should validate input schema', async () => {
    // Arrange
    const invalidUpdateData = {
      id: existingPost.id,
      title: '', // Empty title should fail validation
    };

    // Act & Assert
    expect(async () => {
      await updatePostUseCase.execute(invalidUpdateData);
    }).toThrow();
  });
});