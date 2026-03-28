import { server } from './mocks/server';

// Start the MSW server before all tests in every suite
beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));

// Reset any runtime handlers added during a test
afterEach(() => server.resetHandlers());

// Clean up when all tests in the suite finish
afterAll(() => server.close());
