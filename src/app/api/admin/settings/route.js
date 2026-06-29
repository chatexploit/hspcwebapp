export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireSuperAdmin } from '@/lib/auth';

export async function GET(req) {
  try {
    const user = requireSuperAdmin(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const result = await query('SELECT * FROM Settings ORDER BY id LIMIT 1');
    return NextResponse.json({ settings: result.rows[0] || {} }, { status: 200 });
  } catch (error) {
    console.error('Settings GET error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const user = requireSuperAdmin(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      gst_enabled, razorpay_enabled, razorpay_key, razorpay_secret,
      travel_rate_per_km, company_name, company_logo_url, company_address, company_gstin
    } = body;

    // Check if settings exist
    const checkRes = await query('SELECT id FROM Settings ORDER BY id LIMIT 1');

    if (checkRes.rows.length === 0) {
      const insertRes = await query(
        `INSERT INTO Settings (gst_enabled, razorpay_enabled, razorpay_key, razorpay_secret, travel_rate_per_km, company_name, company_logo_url, company_address, company_gstin)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
         [gst_enabled, razorpay_enabled, razorpay_key, razorpay_secret, travel_rate_per_km, company_name, company_logo_url, company_address, company_gstin]
      );
      return NextResponse.json({ settings: insertRes.rows[0] }, { status: 200 });
    } else {
      const id = checkRes.rows[0].id;
      const updateRes = await query(
        `UPDATE Settings SET
           gst_enabled = $1, razorpay_enabled = $2, razorpay_key = $3, razorpay_secret = $4,
           travel_rate_per_km = $5, company_name = $6, company_logo_url = $7, company_address = $8, company_gstin = $9
         WHERE id = $10 RETURNING *`,
         [gst_enabled, razorpay_enabled, razorpay_key, razorpay_secret, travel_rate_per_km, company_name, company_logo_url, company_address, company_gstin, id]
      );
      return NextResponse.json({ settings: updateRes.rows[0] }, { status: 200 });
    }
  } catch (error) {
    console.error('Settings PUT error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
