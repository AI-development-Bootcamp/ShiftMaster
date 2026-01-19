import { Router } from 'express';
import { login } from '../controllers/authController.js';

const router = Router();

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     summary: User login
 *     description: Authenticate user with email and password, returns JWT token and user data
 *     tags: [Authentication]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address
 *                 example: john@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 description: User's password
 *                 example: SecurePassword123!
 *     responses:
 *       200:
 *         description: Login successful
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
 *                     token:
 *                       type: string
 *                       description: JWT authentication token
 *                       example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                     user:
 *                       type: object
 *                       properties:
 *                         user_id:
 *                           type: string
 *                           format: uuid
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
 *       400:
 *         description: Validation error
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
 *                       example: Validation error
 *                     code:
 *                       type: string
 *                       example: VALIDATION_ERROR
 *                     details:
 *                       type: object
 *                       description: Field-level validation errors
 *                       example:
 *                         email: ["Invalid email format"]
 *                         password: ["Password is required"]
 *       401:
 *         description: Invalid credentials
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
 *                       example: Invalid credentials
 *                     code:
 *                       type: string
 *                       example: INVALID_CREDENTIALS
 *       500:
 *         description: Internal server error
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
 *                       example: Internal server error
 *                     code:
 *                       type: string
 *                       example: INTERNAL_SERVER_ERROR
 */
router.post('/login', login);

export default router;
