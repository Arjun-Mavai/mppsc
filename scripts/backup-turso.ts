import { createClient } from '@libsql/client';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load .env.local safely
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function backupTurso() {
  const remoteUrl = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (!remoteUrl || !authToken) {
    console.error('❌ TURSO_DATABASE_URL or TURSO_AUTH_TOKEN missing in environment variables.');
    process.exit(1);
  }

  const backupDir = path.resolve('backups');
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = path.join(backupDir, `remote_prod_backup_${timestamp}.db`);

  console.log(`⏳ Downloading production backup from Turso...`);
  console.log(`🌐 Source: ${remoteUrl}`);
  console.log(`📍 Destination: ${backupPath}`);

  // Create client pointing directly to the backup file to sync into it
  const client = createClient({
    url: `file:${backupPath}`,
    syncUrl: remoteUrl,
    authToken: authToken,
  });

  try {
    await client.sync();
    console.log('✅ Success! Remote database backup completed successfully.');

    // Calculate file size
    const stats = fs.statSync(backupPath);
    const sizeInMb = (stats.size / (1024 * 1024)).toFixed(2);

    console.log('\n📊 BACKUP SUMMARY:');
    console.log(`   • File:  ${path.basename(backupPath)}`);
    console.log(`   • Size:  ${sizeInMb} MB`);
  } catch (error) {
    console.error('❌ Failed to create remote backup:', error);
    // Cleanup incomplete files on failure
    if (fs.existsSync(backupPath)) fs.unlinkSync(backupPath);
    if (fs.existsSync(`${backupPath}-info`)) fs.unlinkSync(`${backupPath}-info`);
    if (fs.existsSync(`${backupPath}-shm`)) fs.unlinkSync(`${backupPath}-shm`);
    if (fs.existsSync(`${backupPath}-wal`)) fs.unlinkSync(`${backupPath}-wal`);
  } finally {
    client.close();
  }
}

backupTurso().catch(console.error);
