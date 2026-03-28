import { disputeService } from '@/services/disputeService';

jest.mock('@/utils/storage', () => ({
  storageGet: jest.fn().mockResolvedValue('test-token'),
}));

describe('disputeService.getMyDisputes', () => {
  it('returns an array of disputes', async () => {
    const disputes = await disputeService.getMyDisputes();
    expect(Array.isArray(disputes)).toBe(true);
    expect(disputes[0]).toHaveProperty('id', 'dispute-1');
  });

  it('passes status filter as query param', async () => {
    let capturedUrl = '';
    const { server } = require('../mocks/server');
    const { http, HttpResponse } = require('msw');
    server.use(
      http.get(
        'https://backend-brown-theta-94.vercel.app/api/v1/disputes',
        ({ request }) => {
          capturedUrl = request.url;
          return HttpResponse.json({ data: { disputes: [] } });
        }
      )
    );
    await disputeService.getMyDisputes('open');
    expect(capturedUrl).toContain('status=open');
  });

  it('returns empty array when disputes is missing', async () => {
    const { server } = require('../mocks/server');
    const { http, HttpResponse } = require('msw');
    server.use(
      http.get(
        'https://backend-brown-theta-94.vercel.app/api/v1/disputes',
        () => HttpResponse.json({ data: {} })
      )
    );
    const result = await disputeService.getMyDisputes();
    expect(result).toEqual([]);
  });
});

describe('disputeService.getDisputeById', () => {
  it('returns the dispute for the given id', async () => {
    const dispute = await disputeService.getDisputeById('dispute-42');
    expect(dispute).toHaveProperty('id', 'dispute-42');
  });
});

describe('disputeService.createDispute', () => {
  it('creates a dispute and returns it', async () => {
    const dispute = await disputeService.createDispute({
      projectId: 'proj-1',
      reason: 'quality_issues',
      description: 'Work was not delivered',
      amount: 150,
    });
    expect(dispute).toHaveProperty('id', 'dispute-new');
    expect(dispute).toHaveProperty('projectId', 'proj-1');
  });
});

describe('disputeService.updateDisputeStatus', () => {
  it('updates dispute status and returns updated dispute', async () => {
    const dispute = await disputeService.updateDisputeStatus('dispute-1', 'resolved');
    expect(dispute).toHaveProperty('id', 'dispute-1');
    expect(dispute).toHaveProperty('status', 'resolved');
  });
});

describe('disputeService.getMessages', () => {
  it('returns empty array when no messages', async () => {
    const { server } = require('../mocks/server');
    const { http, HttpResponse } = require('msw');
    server.use(
      http.get(
        'https://backend-brown-theta-94.vercel.app/api/v1/disputes/:id/messages',
        () => HttpResponse.json({ data: { messages: [] } })
      )
    );
    const messages = await disputeService.getMessages('dispute-1');
    expect(messages).toEqual([]);
  });
});

describe('disputeService.sendMessage', () => {
  it('sends a message and returns it', async () => {
    const { server } = require('../mocks/server');
    const { http, HttpResponse } = require('msw');
    server.use(
      http.post(
        'https://backend-brown-theta-94.vercel.app/api/v1/disputes/:id/messages',
        () => HttpResponse.json({ data: { message: { id: 'msg-1', content: 'Hello' } } })
      )
    );
    const message = await disputeService.sendMessage('dispute-1', 'Hello');
    expect(message).toHaveProperty('id', 'msg-1');
    expect(message).toHaveProperty('content', 'Hello');
  });
});
