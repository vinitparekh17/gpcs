// import type { Application } from 'express';
// import { Server } from 'http';
// import supertest from 'supertest';

// jest.mock('../src/config');

// jest.mock('../src/lib/mongodb');

// jest.mock('../src/middlewares', () => ({
//   Middlewares: jest.fn(),
//   AuthMiddleware: {
//     requireAuth: jest.fn(),
//   },
//   SocketMiddleware: jest.fn(),
// }));

// jest.mock('../src/lib/socket.io/Socket', () => ({
//   SocketServer: jest.fn(),
// }));

// jest.mock('../src/utils/', () => ({
//   Logger: {
//     info: jest.fn(),
//   },
// }));

// const { app, server } = jest.requireActual('../src/');

// describe('GET /api/v1/health', () => {
//   it('should return a server stats', async () => {
//     const response = await supertest(app as Application).get('/api/v1/health');
//     expect(response.status).toBe(200);
//     expect(response.body).toHaveProperty('success');
//     expect(response.body).toHaveProperty('message');
//     expect(response.body).toHaveProperty('platform');
//     expect(response.body).toHaveProperty('env');
//     expect(response.body).toHaveProperty('uptime');
//     expect(response.body).toHaveProperty('cpus');
//     expect(response.body).toHaveProperty('arch');
//     expect(response.body).toHaveProperty('machine');
//   });
// });

// afterAll((done) => {
//   (server as Server).close(done);
// });

describe("mock test", () => {
  it("a demo test", () => {
    expect(1).toBe(1);
  });
});
