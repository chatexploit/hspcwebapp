export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import bcrypt from 'bcryptjs';

// Helper to authenticate request
function authenticate(req) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  const token = authHeader.split(' ')[1];
  return verifyToken(token);
}

export async function GET(req) {
  try {
    const user = authenticate(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const result = await query(`
      SELECT u.id, u.name, u.email, u.phone, u.base_salary, r.name as role_name
      FROM Users u
      LEFT JOIN Roles r ON u.role_id = r.id
      ORDER BY u.id
    `);

    // Also fetch roles so the frontend can populate a dropdown
    const rolesResult = await query('SELECT id, name FROM Roles ORDER BY id');

    return NextResponse.json({
      staff: result.rows,
      roles: rolesResult.rows
    }, { status: 200 });
  } catch (error) {
    console.error('Staff GET error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const user = authenticate(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { name, email, password, phone, base_salary, role_id } = body;

    if (!name || !email || !password || !role_id) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const result = await query(
      'INSERT INTO Users (role_id, name, email, password_hash, phone, base_salary) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, name, email, phone, base_salary',
      [role_id, name, email, password_hash, phone, base_salary]
    );

    return NextResponse.json({ staff: result.rows[0] }, { status: 201 });
  } catch (error) {
    console.error('Staff POST error:', error);
    if (error.code === '23505') { // Unique constraint violation (e.g., email)
       return NextResponse.json({ error: 'User with this email already exists' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
