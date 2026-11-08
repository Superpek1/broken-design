import bcrypt from 'bcrypt';
import { db } from '../config/db';
import { env } from '../config/env';

/**
 * สคริปต์สำหรับสร้างหรืออัปเดตบัญชีผู้ใช้เริ่มต้น (Seed Initial Accounts)
 * โดยเฉพาะบัญชี Admin ซึ่งตามสเปก "ตั้งในฐานข้อมูลเท่านั้น สมัครเองไม่ได้"
 */
async function seedAdmin() {
  console.log('--- [Broken Design] Seeding Initial Accounts ---');

  if (!env.databaseUrl) {
    console.error('❌ Error: DATABASE_URL is not configured in .env');
    process.exit(1);
  }

  try {
    // 1. Initial Admin Account
    const adminEmail = process.env.ADMIN_SEED_EMAIL || 'admin@brokendesign.com';
    const adminPassword = process.env.ADMIN_SEED_PASSWORD || 'Admin@BrokenDesign2026!';
    const adminName = 'Platform Admin';

    const adminHash = await bcrypt.hash(adminPassword, 10);

    const adminResult = await db.query(
      `INSERT INTO users (email, password_hash, display_name, role, is_seller)
       VALUES ($1, $2, $3, 'admin', false)
       ON CONFLICT (email) DO UPDATE
       SET password_hash = EXCLUDED.password_hash,
           role = 'admin',
           suspended_at = NULL
       RETURNING id, email, display_name, role, is_seller, created_at;`,
      [adminEmail, adminHash, adminName]
    );

    console.log('✅ Admin Account Ready:');
    console.log(`   - Email: ${adminResult.rows[0].email}`);
    console.log(`   - Role: ${adminResult.rows[0].role}`);
    console.log(`   - Password: ${adminPassword}`);
    console.log(`   - User ID: ${adminResult.rows[0].id}`);

    // 2. Initial Sample Creator Account
    const creatorEmail = process.env.CREATOR_SEED_EMAIL || 'creator@brokendesign.com';
    const creatorPassword = process.env.CREATOR_SEED_PASSWORD || 'Creator@BrokenDesign2026!';
    const creatorName = 'Demo Creator';

    const creatorHash = await bcrypt.hash(creatorPassword, 10);

    const creatorResult = await db.query(
      `INSERT INTO users (email, password_hash, display_name, role, is_seller)
       VALUES ($1, $2, $3, 'creator', true)
       ON CONFLICT (email) DO UPDATE
       SET password_hash = EXCLUDED.password_hash,
           role = 'creator',
           is_seller = true,
           suspended_at = NULL
       RETURNING id, email, display_name, role, is_seller, created_at;`,
      [creatorEmail, creatorHash, creatorName]
    );

    console.log('\n✅ Creator Account Ready:');
    console.log(`   - Email: ${creatorResult.rows[0].email}`);
    console.log(`   - Role: ${creatorResult.rows[0].role}`);
    console.log(`   - Is Seller: ${creatorResult.rows[0].is_seller}`);
    console.log(`   - Password: ${creatorPassword}`);
    console.log(`   - User ID: ${creatorResult.rows[0].id}`);

    console.log('\n🎉 All initial seed accounts successfully configured!');
  } catch (err: any) {
    console.error('❌ Failed to seed accounts:', err?.message || err);
  } finally {
    await db.end();
  }
}

seedAdmin();

