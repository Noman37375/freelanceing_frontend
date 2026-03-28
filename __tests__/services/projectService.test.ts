/**
 * projectService.test.ts
 *
 * Tests for projectService — covers filtering, error handling, and the
 * clientId filter that ensures clients only see their own projects.
 */

import { http, HttpResponse } from 'msw';
import { server } from '../mocks/server';
import { projectService } from '@/services/projectService';
import { mockProject } from '../mocks/handlers';

jest.mock('@/utils/storage', () => ({
  storageGet: jest.fn().mockResolvedValue('test-token'),
}));

const API = 'https://backend-brown-theta-94.vercel.app';

// ─── getProjects ──────────────────────────────────────────────────────────────

describe('projectService.getProjects', () => {
  it('returns an array of projects', async () => {
    const projects = await projectService.getProjects();
    expect(Array.isArray(projects)).toBe(true);
    expect(projects.length).toBeGreaterThan(0);
  });

  it('passes clientId filter as a query param', async () => {
    let capturedUrl = '';
    server.use(
      http.get(`${API}/api/v1/projects`, ({ request }) => {
        capturedUrl = request.url;
        return HttpResponse.json({ data: { projects: [mockProject] } });
      })
    );

    await projectService.getProjects({ clientId: 'client-1' });

    expect(capturedUrl).toContain('clientId=client-1');
  });

  it('passes status filter as a query param', async () => {
    let capturedUrl = '';
    server.use(
      http.get(`${API}/api/v1/projects`, ({ request }) => {
        capturedUrl = request.url;
        return HttpResponse.json({ data: { projects: [] } });
      })
    );

    await projectService.getProjects({ status: 'COMPLETED' });

    expect(capturedUrl).toContain('status=COMPLETED');
  });

  it('passes search filter as a query param', async () => {
    let capturedUrl = '';
    server.use(
      http.get(`${API}/api/v1/projects`, ({ request }) => {
        capturedUrl = request.url;
        return HttpResponse.json({ data: { projects: [] } });
      })
    );

    await projectService.getProjects({ search: 'mobile app' });

    expect(capturedUrl).toContain('search=mobile+app');
  });

  it('returns empty array when API returns empty projects', async () => {
    server.use(
      http.get(`${API}/api/v1/projects`, () =>
        HttpResponse.json({ data: { projects: [] } })
      )
    );

    const projects = await projectService.getProjects();
    expect(projects).toEqual([]);
  });

  it('returns empty array when projects key is missing in response', async () => {
    server.use(
      http.get(`${API}/api/v1/projects`, () =>
        HttpResponse.json({ data: {} })
      )
    );

    const projects = await projectService.getProjects();
    expect(projects).toEqual([]);
  });

  it('throws a network error message when fetch fails', async () => {
    server.use(
      http.get(`${API}/api/v1/projects`, () => HttpResponse.error())
    );

    await expect(projectService.getProjects()).rejects.toThrow(/Network error/);
  });

  it('throws on non-JSON response', async () => {
    server.use(
      http.get(`${API}/api/v1/projects`, () =>
        new HttpResponse('<html>error</html>', {
          status: 500,
          headers: { 'content-type': 'text/html' },
        })
      )
    );

    await expect(projectService.getProjects()).rejects.toThrow(/non-JSON/);
  });
});

// ─── getProjectById ───────────────────────────────────────────────────────────

describe('projectService.getProjectById', () => {
  it('returns a single project by ID', async () => {
    const project = await projectService.getProjectById('proj-1');
    expect(project.id).toBe('proj-1');
    expect(project.title).toBe(mockProject.title);
  });

  it('throws when project is not found (404)', async () => {
    server.use(
      http.get(`${API}/api/v1/projects/:id`, () =>
        HttpResponse.json({ message: 'Project not found' }, { status: 404 })
      )
    );

    await expect(projectService.getProjectById('does-not-exist')).rejects.toThrow(
      'Project not found'
    );
  });
});

// ─── createProject ────────────────────────────────────────────────────────────

describe('projectService.createProject', () => {
  it('creates a project and returns it', async () => {
    const project = await projectService.createProject({
      title: 'New App',
      description: 'A new mobile app',
      budget: 3000,
    });

    expect(project.id).toBeDefined();
    expect(project.title).toBe('New App');
  });

  it('includes paymentIntentId in the request body', async () => {
    let capturedBody: any;
    server.use(
      http.post(`${API}/api/v1/projects`, async ({ request }) => {
        capturedBody = await request.json();
        return HttpResponse.json({
          data: { project: { ...mockProject, id: 'proj-paid' } },
        }, { status: 201 });
      })
    );

    await projectService.createProject({
      title: 'Paid Project',
      description: 'Test',
      budget: 500,
      paymentIntentId: 'pi_test_50000',
    });

    expect(capturedBody.paymentIntentId).toBe('pi_test_50000');
  });

  it('throws when creation fails', async () => {
    server.use(
      http.post(`${API}/api/v1/projects`, () =>
        HttpResponse.json({ message: 'Unauthorized' }, { status: 401 })
      )
    );

    await expect(
      projectService.createProject({ title: 'X', description: 'Y', budget: 100 })
    ).rejects.toThrow('Unauthorized');
  });
});

// ─── deleteProject ────────────────────────────────────────────────────────────

describe('projectService.deleteProject', () => {
  it('resolves without error on success', async () => {
    await expect(projectService.deleteProject('proj-1')).resolves.toBeUndefined();
  });

  it('throws on error response', async () => {
    server.use(
      http.delete(`${API}/api/v1/projects/:id`, () =>
        HttpResponse.json({ message: 'Forbidden' }, { status: 403 })
      )
    );

    await expect(projectService.deleteProject('proj-1')).rejects.toThrow('Forbidden');
  });
});
