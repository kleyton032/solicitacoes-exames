import request from 'supertest';
import { app } from '../../app';
import { OracleUsersRepository } from '../../../../../modules/users/repositories/oracle/OracleUsersRepository';
import { compare } from 'bcryptjs';
import { redisClient } from '../../../../../shared/infra/redis';

// Mock OracleUsersRepository
jest.mock('../../../../../modules/users/repositories/oracle/OracleUsersRepository');
// Mock Redis
jest.mock('../../../../../shared/infra/redis', () => ({
    redisClient: {
        set: jest.fn(),
        del: jest.fn(),
    },
}));
// Mock BCrypt
jest.mock('bcryptjs');

describe('Sessions Controller', () => {

    beforeAll(async () => {
        // Setup if needed
    });

    it('should be able to authenticate a user', async () => {
        // Mock Repository Response
        const mockUser = {
            id: 1,
            name: 'Test User',
            email: 'test@example.com',
            password_hash: 'hashed_password',
            roles: ['user'],
            legacy_user_id: 123
        };

        (OracleUsersRepository as jest.Mock).mockImplementation(() => {
            return {
                findByEmail: jest.fn().mockResolvedValue(mockUser),
            };
        });

        (compare as jest.Mock).mockResolvedValue(true);

        const response = await request(app).post('/sessions').send({
            email: 'test@example.com',
            password: 'password123',
        });

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('token');
        expect(response.body.user).toHaveProperty('name', 'Test User');
    });

    it('should not be able to authenticate with incorrect email', async () => {
        // Mock Repository to return null
        (OracleUsersRepository as jest.Mock).mockImplementation(() => {
            return {
                findByEmail: jest.fn().mockResolvedValue(null),
            };
        });

        const response = await request(app).post('/sessions').send({
            email: 'wrong@example.com',
            password: 'password123',
        });

        expect(response.status).toBe(400);
    });

    it('should not be able to authenticate with incorrect password', async () => {
        const mockUser = {
            id: 1,
            name: 'Test User',
            email: 'test@example.com',
            password_hash: 'hashed_password',
        };

        (OracleUsersRepository as jest.Mock).mockImplementation(() => {
            return {
                findByEmail: jest.fn().mockResolvedValue(mockUser),
            };
        });

        (compare as jest.Mock).mockResolvedValue(false);

        const response = await request(app).post('/sessions').send({
            email: 'test@example.com',
            password: 'wrongpassword',
        });

        expect(response.status).toBe(400);
    });
});
