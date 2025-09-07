import 'reflect-metadata';
import { describe, it, expect, beforeEach } from 'bun:test';
import { uuidv7 } from 'uuidv7';
import { DeletePostUseCase } from '../usecases/delete-post';
import { MockPostRepository } from '../mocks/mock-post-repository';
import { Post } from '../entities/post';

describe('DeletePostUseCase', () => {
  let deletePostUseCase: DeletePostUseCase;
  let mockPostRepository: MockPostRepository;
  let existingPost: Post;
  let authorId: string;

  beforeEach(async () => {
    mockPostRepository = new MockPostRepository();
    deletePostUseCase = new DeletePostUseCase(mockPostRepository);
    authorId = uuidv7();

    // Create an existing post for testing
    existingPost = await mockPostRepository.create({
      title: 'Post to Delete',
      content: 'This post will be deleted',
      authorId,
      published: true,
    });
  });

  it('should delete an existing post', async () => {
    // Arrange
    const input = {
      id: existingPost.id,
      authorId,
    };

    // Act
    const result = await deletePostUseCase.execute(input);

    // Assert
    expect(result.success).toBe(true);
    expect(mockPostRepository.count()).toBe(0);
    
    // Verify post is actually deleted
    const deletedPost = await mockPostRepository.findById(existingPost.id);
    expect(deletedPost).toBe(null);
  });

  it('should throw error for non-existent post', async () => {
    // Arrange
    const input = {
      id: uuidv7(),
      authorId,
    };

    // Act & Assert
    expect(async () => {
      await deletePostUseCase.execute(input);
    }).toThrow('Post not found');
  });

  it('should enforce author authorization', async () => {
    // Arrange
    const differentAuthorId = uuidv7();
    const input = {
      id: existingPost.id,
      authorId: differentAuthorId,
    };

    // Act & Assert
    expect(async () => {
      await deletePostUseCase.execute(input);
    }).toThrow('Unauthorized to delete this post');
  });

  it('should allow deletion without authorization check', async () => {
    // Arrange
    const input = {
      id: existingPost.id,
      // No authorId provided - should skip authorization
    };

    // Act
    const result = await deletePostUseCase.execute(input);

    // Assert
    expect(result.success).toBe(true);
    expect(mockPostRepository.count()).toBe(0);
  });

  it('should allow same author to delete', async () => {
    // Arrange
    const input = {
      id: existingPost.id,
      authorId, // Same as existing post
    };

    // Act
    const result = await deletePostUseCase.execute(input);

    // Assert
    expect(result.success).toBe(true);
    expect(mockPostRepository.count()).toBe(0);
  });

  it('should not affect other posts', async () => {
    // Arrange
    const anotherAuthorId = uuidv7();
    const anotherPost = await mockPostRepository.create({
      title: 'Another Post',
      content: 'This should remain',
      authorId: anotherAuthorId,
      published: false,
    });

    const input = {
      id: existingPost.id,
      authorId,
    };

    // Act
    const result = await deletePostUseCase.execute(input);

    // Assert
    expect(result.success).toBe(true);
    expect(mockPostRepository.count()).toBe(1);
    
    // Verify the other post still exists
    const remainingPost = await mockPostRepository.findById(anotherPost.id);
    expect(remainingPost).toBeDefined();
    expect(remainingPost?.title).toBe('Another Post');
  });
});