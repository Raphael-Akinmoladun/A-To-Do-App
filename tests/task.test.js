// tests/task.test.js
const request = require('supertest');
const app = require('../app');
const dbSetup = require('./dbSetup');
const Task = require('../models/Task');

// Setup and Teardown
beforeAll(async () => await dbSetup.connect());
afterEach(async () => await dbSetup.clearDatabase());
afterAll(async () => await dbSetup.closeDatabase());

describe('Task Endpoints', () => {
    let sessionCookie;

    // Before running task tests, we need to create a user and log them in
    beforeEach(async () => {
        const testUser = { username: 'taskuser', password: 'password123' };
        
        // 1. Sign up
        await request(app).post('/auth/signup').send(testUser);
        
        // 2. Log in and capture the session cookie
        const loginRes = await request(app).post('/auth/login').send(testUser);
        sessionCookie = loginRes.headers['set-cookie'];
    });

    it('should redirect unauthenticated users to login page', async () => {
        const res = await request(app).get('/tasks');
        // Because we aren't sending the sessionCookie here, it should block us
        expect(res.statusCode).toEqual(302);
        expect(res.header.location).toBe('/auth/login');
    });

    it('should allow authenticated users to view tasks', async () => {
        const res = await request(app)
            .get('/tasks')
            .set('Cookie', sessionCookie); // Attach the session cookie

        expect(res.statusCode).toEqual(200);
    });

    it('should create a new task', async () => {
        const res = await request(app)
            .post('/tasks')
            .set('Cookie', sessionCookie)
            .send({ title: 'Learn Backend Testing' });

        expect(res.statusCode).toEqual(302); // Should redirect back to /tasks after creation

        // Verify task is in DB
        const tasks = await Task.find();
        expect(tasks.length).toBe(1);
        expect(tasks[0].title).toBe('Learn Backend Testing');
        expect(tasks[0].status).toBe('pending');
    });
});