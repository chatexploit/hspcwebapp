// Mock NextResponse to avoid the edge-runtime cookie bug in basic jsdom jest environment
jest.mock('next/server', () => {
  return {
    NextResponse: {
      json: jest.fn((body, init) => ({
        status: init?.status || 200,
        json: async () => body
      }))
    }
  };
});

jest.mock('@/lib/db', () => ({
  query: jest.fn()
}));

jest.mock('@/lib/auth', () => ({
  verifyToken: jest.fn()
}));

import { GET } from './route';
import { query } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

describe('Staff API - GET', () => {
  it('should return 401 if unauthorized', async () => {
    const req = {
      headers: { get: () => null }
    };

    verifyToken.mockReturnValue(null);

    const res = await GET(req);
    expect(res.status).toBe(401);
  });

  it('should return staff and roles if authorized', async () => {
    const req = {
      headers: { get: () => 'Bearer fake-token' }
    };

    verifyToken.mockReturnValue({ id: 1, role_id: 1 });

    query
      .mockResolvedValueOnce({ rows: [{ id: 1, name: 'Admin', role_name: 'Super Admin' }] }) // Staff query
      .mockResolvedValueOnce({ rows: [{ id: 1, name: 'Super Admin' }] }); // Roles query

    const res = await GET(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.staff.length).toBe(1);
    expect(data.roles.length).toBe(1);
  });
});
