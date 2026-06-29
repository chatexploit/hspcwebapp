import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { query } from '@/lib/db';

export async function POST(req) {
  try {
    const { name, email, password, phone } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if user exists
    const userCheck = await query('SELECT id FROM Users WHERE email = $1', [email]);
    if (userCheck.rows.length > 0) {
      return NextResponse.json({ error: 'User already exists' }, { status: 409 });
    }

    // Check if any user already exists
    const anyUserCheck = await query('SELECT id FROM Users LIMIT 1');
    if (anyUserCheck.rows.length > 0) {
       return NextResponse.json({ error: 'Initial setup already complete. Only Admins can create new users.' }, { status: 403 });
    }

    // Since this is the first user, ensure Super Admin role exists
    let roleRes = await query('SELECT id FROM Roles WHERE name = $1', ['Super Admin']);
    let roleId;

    if (roleRes.rows.length === 0) {
       const insertRoleRes = await query(
         'INSERT INTO Roles (name, permissions) VALUES ($1, $2) RETURNING id',
         ['Super Admin', JSON.stringify({ all: true })]
       );
       roleId = insertRoleRes.rows[0].id;
    } else {
       roleId = roleRes.rows[0].id;
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const result = await query(
      'INSERT INTO Users (role_id, name, email, password_hash, phone) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email',
      [roleId, name, email, password_hash, phone]
    );

    return NextResponse.json({ user: result.rows[0] }, { status: 201 });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
