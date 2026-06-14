import { createClient } from '@libsql/client';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load .env.local safely
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function syncDb() {
  const remoteUrl = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (!remoteUrl || !authToken) {
    console.error('❌ TURSO_DATABASE_URL or TURSO_AUTH_TOKEN missing in environment variables.');
    process.exit(1);
  }

  const localPath = path.resolve('mppsc_local_dev.db');
  
  // Backup existing local database before overwriting
  if (fs.existsSync(localPath)) {
    const backupDir = path.resolve('backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir);
    }
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(backupDir, `local_backup_${timestamp}.db`);
    fs.copyFileSync(localPath, backupPath);
    console.log(`📦 Saved backup of old local database to ${backupPath}`);
    fs.unlinkSync(localPath); // Delete old so sync works perfectly
  }

  // Always clean up libSQL metadata files to prevent "Unauthorized/InvalidLocalState" error
  if (fs.existsSync(`${localPath}-info`)) fs.unlinkSync(`${localPath}-info`);
  if (fs.existsSync(`${localPath}-shm`)) fs.unlinkSync(`${localPath}-shm`);
  if (fs.existsSync(`${localPath}-wal`)) fs.unlinkSync(`${localPath}-wal`);

  console.log(`⏳ Downloading production database from Turso...`);
  console.log(`🌐 Target: ${remoteUrl}`);

  // Create an embedded replica to pull all data
  const client = createClient({
    url: `file:${localPath}`,
    syncUrl: remoteUrl,
    authToken: authToken,
  });

  try {
    await client.sync();
    console.log('✅ Success! Production database perfectly copied to local mppsc_local_dev.db');
    
    // Calculate file size
    const stats = fs.statSync(localPath);
    const sizeInMb = (stats.size / (1024 * 1024)).toFixed(2);
    
    // Get table count
    const tableRes = await client.execute("SELECT COUNT(*) as count FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'");
    
    // Get user count
    const userRes = await client.execute('SELECT COUNT(*) as count FROM mppsc_users');
    
    console.log('\n📊 DATABASE PULL SUMMARY:');
    console.log(`   • Size:   ${sizeInMb} MB`);
    console.log(`   • Tables: ${tableRes.rows[0].count} tables loaded`);
    console.log(`   • Users:  ${userRes.rows[0].count} registered users`);
    console.log('\n💡 Tip: Backup saved to backups/ folder. You can safely delete old backups to save disk space.');
  } catch (error) {
    console.error('❌ Failed to download database:', error);
  } finally {
    client.close();
  }
}

syncDb().catch(console.error);
