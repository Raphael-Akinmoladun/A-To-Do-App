const request = require('supertest');
const app = require('../app');
const dbSetup = require('./dbSetup');
const User = require('../models/User');

// Setup and Teardown
beforeAll(async () => await dbSetup.connect());
afterEach(async () => await dbSetup.clearDatabase());
afterAll(async () => await dbSetup.closeDatabase());

describe('Auth Endpoints', () => {
    const testUser = {
        username: 'testuser123',
        password: 'password123'
    };

    it('should load the signup page', async () => {
        const res = await request(app).get('/auth/signup');
        expect(res.statusCode).toEqual(200);
        expect(res.text).toContain('<form'); // Basic check to ensure EJS rendered a form
    });

    it('should successfully register a new user', async () => {
        const res = await request(app)
            .post('/auth/signup')
            .send(testUser);

        // Should redirect to login upon success
        expect(res.statusCode).toEqual(302); 
        expect(res.header.location).toBe('/auth/login');

        // Verify the user was actually saved in the DB
        const userInDb = await User.findOne({ username: testUser.username });
        expect(userInDb).toBeTruthy();
    });

    it('should fail to login with wrong credentials', async () => {
        // First, create the user
        await request(app).post('/auth/signup').send(testUser);

        // Then, try to login with a wrong password
        const res = await request(app)
            .post('/auth/login')
            .send({ username: 'testuser123', password: 'wrongpassword' });

        // Should render the login page again (status 200, not a redirect)
        expect(res.statusCode).toEqual(200);
    });
});