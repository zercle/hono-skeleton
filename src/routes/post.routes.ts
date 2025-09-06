import { Hono } from 'hono';
import { container } from '../infrastructure/container/di.container';
import { PostHandler } from '../handler/post.handler';
import { authMiddleware } from '../infrastructure/middleware/auth.middleware';

const postRoutes = new Hono();

// Resolve handler from DI container
const postHandler = container.resolve(PostHandler);

// Public routes
postRoutes.get('/', postHandler.getAllPosts);
postRoutes.get('/:id', postHandler.getPostById);
postRoutes.get('/author/:authorId', postHandler.getPostsByAuthor);

// Protected routes (require authentication)
postRoutes.use('/*', authMiddleware);
postRoutes.post('/', postHandler.createPost);
postRoutes.put('/:id', postHandler.updatePost);
postRoutes.delete('/:id', postHandler.deletePost);

export { postRoutes };