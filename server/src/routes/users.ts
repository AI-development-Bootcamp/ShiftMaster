import { Router } from 'express';
import { isAuthenticated, isAdmin } from '../middleware/auth.js';
import {
  createUser,
  listUsers,
  getCurrentUser,
  getUser,
  updateUser,
  deleteUser,
} from '../controllers/usersController.js';

const router = Router();

/**
 * @swagger
 * /api/v1/users:
 *   post:
 *     summary: Create a new user
 *     description: Admin-only endpoint to create a new user with role and credentials
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - full_name
 *               - email
 *               - password
 *               - role
 *             properties:
 *               full_name:
 *                 type: string
 *                 description: User's full name
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address (must be unique)
 *                 example: john@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *                 description: User's password (will be hashed)
 *                 example: SecurePassword123!
 *               role:
 *                 type: string
 *                 enum: [admin, regular]
 *                 description: User's role
 *                 example: regular
 *               job_title:
 *                 type: string
 *                 description: User's job title (optional)
 *                 example: Software Engineer
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                       properties:
 *                         user_id:
 *                           type: integer
 *                           example: 1
 *                         full_name:
 *                           type: string
 *                           example: John Doe
 *                         email:
 *                           type: string
 *                           example: john@example.com
 *                         role:
 *                           type: string
 *                           enum: [admin, regular]
 *                           example: regular
 *                         job_title:
 *                           type: string
 *                           nullable: true
 *                           example: Software Engineer
 *                         active:
 *                           type: boolean
 *                           example: true
 *                         created_at:
 *                           type: string
 *                           format: date-time
 *                           example: 2024-01-01T00:00:00Z
 *       400:
 *         description: Validation error or duplicate email
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: User with email john@example.com already exists
 *                     code:
 *                       type: string
 *                       example: DUPLICATE_EMAIL
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *       403:
 *         description: Forbidden - Admin access required
 *       500:
 *         description: Internal server error
 */
router.post('/', isAuthenticated, isAdmin, createUser);

/**
 * @swagger
 * /api/v1/users:
 *   get:
 *     summary: List all users with pagination
 *     description: Admin-only endpoint to retrieve a paginated list of all users
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *         example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Number of users per page
 *         example: 20
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     users:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           user_id:
 *                             type: integer
 *                             example: 1
 *                           full_name:
 *                             type: string
 *                             example: John Doe
 *                           email:
 *                             type: string
 *                             example: john@example.com
 *                           role:
 *                             type: string
 *                             enum: [admin, regular]
 *                             example: regular
 *                           job_title:
 *                             type: string
 *                             nullable: true
 *                             example: Software Engineer
 *                           active:
 *                             type: boolean
 *                             example: true
 *                           created_at:
 *                             type: string
 *                             format: date-time
 *                             example: 2024-01-01T00:00:00Z
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                           description: Total number of users
 *                           example: 42
 *                         page:
 *                           type: integer
 *                           description: Current page number
 *                           example: 1
 *                         limit:
 *                           type: integer
 *                           description: Number of users per page
 *                           example: 20
 *                         totalPages:
 *                           type: integer
 *                           description: Total number of pages
 *                           example: 3
 *       400:
 *         description: Validation error (invalid page or limit)
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *       403:
 *         description: Forbidden - Admin access required
 *       500:
 *         description: Internal server error
 */
router.get('/', isAuthenticated, isAdmin, listUsers);

/**
 * @swagger
 * /api/v1/users/me:
 *   get:
 *     summary: Get current user's information
 *     description: Returns the authenticated user's own profile information
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                       properties:
 *                         user_id:
 *                           type: string
 *                           example: "550e8400-e29b-41d4-a716-446655440000"
 *                         full_name:
 *                           type: string
 *                           example: John Doe
 *                         email:
 *                           type: string
 *                           example: john@example.com
 *                         role:
 *                           type: string
 *                           enum: [admin, regular]
 *                           example: regular
 *                         job_title:
 *                           type: string
 *                           nullable: true
 *                           example: Software Engineer
 *                         active:
 *                           type: boolean
 *                           example: true
 *                         created_at:
 *                           type: string
 *                           format: date-time
 *                           example: 2024-01-01T00:00:00Z
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *       500:
 *         description: Internal server error
 */
router.get('/me', isAuthenticated, getCurrentUser);

/**
 * @swagger
 * /api/v1/users/{id}:
 *   get:
 *     summary: Get a single user by ID
 *     description: Admin-only endpoint to retrieve user details
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *         example: 1
 *     responses:
 *       200:
 *         description: User retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                       properties:
 *                         user_id:
 *                           type: integer
 *                           example: 1
 *                         full_name:
 *                           type: string
 *                           example: John Doe
 *                         email:
 *                           type: string
 *                           example: john@example.com
 *                         role:
 *                           type: string
 *                           enum: [admin, regular]
 *                           example: regular
 *                         job_title:
 *                           type: string
 *                           nullable: true
 *                           example: Software Engineer
 *                         active:
 *                           type: boolean
 *                           example: true
 *                         created_at:
 *                           type: string
 *                           format: date-time
 *                           example: 2024-01-01T00:00:00Z
 *       400:
 *         description: Validation error (invalid user ID)
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: User with ID 999 not found
 *                     code:
 *                       type: string
 *                       example: USER_NOT_FOUND
 *       500:
 *         description: Internal server error
 */
router.get('/:id', isAuthenticated, isAdmin, getUser);

/**
 * @swagger
 * /api/v1/users/{id}:
 *   patch:
 *     summary: Update user details
 *     description: Admin-only endpoint to update user information
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               full_name:
 *                 type: string
 *                 description: User's full name
 *                 example: Jane Doe
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address (must be unique)
 *                 example: jane@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *                 description: New password (will be hashed)
 *                 example: NewSecurePassword456!
 *               role:
 *                 type: string
 *                 enum: [admin, regular]
 *                 description: User's role
 *                 example: admin
 *               job_title:
 *                 type: string
 *                 description: User's job title
 *                 example: Senior Software Engineer
 *               active:
 *                 type: boolean
 *                 description: User's active status
 *                 example: true
 *     responses:
 *       200:
 *         description: User updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                       properties:
 *                         user_id:
 *                           type: integer
 *                           example: 1
 *                         full_name:
 *                           type: string
 *                           example: Jane Doe
 *                         email:
 *                           type: string
 *                           example: jane@example.com
 *                         role:
 *                           type: string
 *                           enum: [admin, regular]
 *                           example: admin
 *                         job_title:
 *                           type: string
 *                           nullable: true
 *                           example: Senior Software Engineer
 *                         active:
 *                           type: boolean
 *                           example: true
 *                         created_at:
 *                           type: string
 *                           format: date-time
 *                           example: 2024-01-01T00:00:00Z
 *       400:
 *         description: Validation error or duplicate email
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.patch('/:id', isAuthenticated, isAdmin, updateUser);

/**
 * @swagger
 * /api/v1/users/{id}:
 *   delete:
 *     summary: Soft delete a user
 *     description: Admin-only endpoint to deactivate a user (soft delete)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *         example: 1
 *     responses:
 *       200:
 *         description: User deleted (deactivated) successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     success:
 *                       type: boolean
 *                       example: true
 *                     message:
 *                       type: string
 *                       example: User 1 has been deactivated
 *       400:
 *         description: Validation error (invalid user ID)
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', isAuthenticated, isAdmin, deleteUser);

export default router;
