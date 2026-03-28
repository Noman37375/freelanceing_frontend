import { projectService } from '@/services/projectService';

jest.mock('@/utils/storage', () => ({
  storageGet: jest.fn().mockResolvedValue('test-token'),
}));

describe('projectService.getProjects', () => {
  it('returns an array of projects', async () => {
    const projects = await projectService.getProjects();
    expect(Array.isArray(projects)).toBe(true);
    expect(projects.length).toBeGreaterThan(0);
    expect(projects[0]).toHaveProperty('id', 'proj-1');
  });

  it('returns empty array when API returns no projects', async () => {
    const { server } = require('../mocks/server');
    const { http, HttpResponse } = require('msw');
    server.use(
      http.get(
        'https://backend-brown-theta-94.vercel.app/api/v1/projects',
        () => HttpResponse.json({ data: { projects: [] } })
      )
    );
    const projects = await projectService.getProjects();
    expect(projects).toEqual([]);
  });

  it('passes status filter as query param', async () => {
    let capturedUrl = '';
    const { server } = require('../mocks/server');
    const { http, HttpResponse } = require('msw');
    server.use(
      http.get(
        'https://backend-brown-theta-94.vercel.app/api/v1/projects',
        ({ request }) => {
          capturedUrl = request.url;
          return HttpResponse.json({ data: { projects: [] } });
        }
      )
    );
    await projectService.getProjects({ status: 'COMPLETED' });
    expect(capturedUrl).toContain('status=COMPLETED');
  });

  it('passes search query as query param', async () => {
    let capturedUrl = '';
    const { server } = require('../mocks/server');
    const { http, HttpResponse } = require('msw');
    server.use(
      http.get(
        'https://backend-brown-theta-94.vercel.app/api/v1/projects',
        ({ request }) => {
          capturedUrl = request.url;
          return HttpResponse.json({ data: { projects: [] } });
        }
      )
    );
    await projectService.getProjects({ search: 'react' });
    expect(capturedUrl).toContain('search=react');
  });

  it('throws on network error', async () => {
    const { server } = require('../mocks/server');
    const { http, HttpResponse } = require('msw');
    server.use(
      http.get(
        'https://backend-brown-theta-94.vercel.app/api/v1/projects',
        () => HttpResponse.json({ message: 'Server error' }, { status: 500 })
      )
    );
    await expect(projectService.getProjects()).rejects.toThrow('Server error');
  });
});

describe('projectService.createProject', () => {
  it('creates a project and returns it', async () => {
    const project = await projectService.createProject({
      title: 'New Project',
      description: 'desc',
      budget: 500,
      paymentIntentId: 'pi_abc123',
    });
    expect(project).toHaveProperty('id', 'proj-new');
    expect(project).toHaveProperty('title', 'New Project');
  });

  it('rejects when paymentIntentId is missing', async () => {
    await expect(
      projectService.createProject({
        title: 'No Payment',
        description: 'desc',
        budget: 100,
      })
    ).rejects.toThrow('paymentIntentId is required');
  });
});

describe('projectService.deleteProject', () => {
  it('resolves without throwing on successful delete', async () => {
    await expect(projectService.deleteProject('proj-1')).resolves.toBeUndefined();
  });
});

describe('projectService.getProjectById', () => {
  it('returns the project for the given id', async () => {
    const project = await projectService.getProjectById('proj-42');
    expect(project).toHaveProperty('id', 'proj-42');
  });
});
