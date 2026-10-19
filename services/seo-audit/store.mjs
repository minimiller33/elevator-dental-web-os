import { DatabaseSync } from 'node:sqlite';
import { createHash, randomBytes, randomUUID } from 'node:crypto';

export const hash = (value) => createHash('sha256').update(value).digest('hex');
export class Store {
  constructor(path) {
    this.db = new DatabaseSync(path);
    this.db.exec(`PRAGMA journal_mode=WAL;
      CREATE TABLE IF NOT EXISTS jobs (id TEXT PRIMARY KEY, token TEXT UNIQUE, email TEXT, website TEXT, ip TEXT, lead TEXT, created INTEGER, status TEXT, attempts INTEGER DEFAULT 0, next INTEGER DEFAULT 0, report TEXT, mail TEXT, email_id TEXT, crm_done INTEGER DEFAULT 0);
      CREATE INDEX IF NOT EXISTS jobs_created ON jobs(created);
      CREATE TABLE IF NOT EXISTS cache (website TEXT PRIMARY KEY, created INTEGER, report TEXT);`);
    // A single service process owns the queue. Interrupted work resumes after restart.
    this.db.exec("UPDATE jobs SET status='queued' WHERE status='processing'");
    this.db.exec("UPDATE jobs SET status='failed' WHERE status='queued' AND attempts>=3");
  }
  enqueue(lead, ip, limit = 50) {
    const now = Date.now();
    const existing = this.db.prepare('SELECT id FROM jobs WHERE email=? AND website=? AND created>? AND status!=\'failed\'').get(hash(lead.email), lead.website, now - 86_400_000);
    if (existing) return existing.id;
    if (this.db.prepare('SELECT count(*) AS n FROM jobs WHERE created>?').get(now - 86_400_000).n >= limit ||
      this.db.prepare('SELECT count(*) AS n FROM jobs WHERE ip=? AND created>?').get(hash(ip), now - 3_600_000).n >= 3 ||
      this.db.prepare('SELECT count(*) AS n FROM jobs WHERE email=? AND created>?').get(hash(lead.email), now - 86_400_000).n >= 3) throw new Error('rate_limit');
    const id = randomUUID();
    this.db.prepare('INSERT INTO jobs(id,token,email,website,ip,lead,created,status) VALUES(?,?,?,?,?,?,?,?)')
      .run(id, randomBytes(32).toString('hex'), hash(lead.email), lead.website, hash(ip), JSON.stringify(lead), now, 'queued');
    return id;
  }
  next() { return this.db.prepare("SELECT * FROM jobs WHERE status='queued' AND next<=? ORDER BY created LIMIT 1").get(Date.now()); }
  update(id, patch) {
    const allowed = ['status', 'attempts', 'next', 'report', 'mail', 'email_id', 'crm_done'];
    const entries = Object.entries(patch);
    if (entries.some(([key]) => !allowed.includes(key))) throw new Error('invalid_patch');
    this.db.prepare(`UPDATE jobs SET ${entries.map(([key]) => `${key}=?`).join(',')} WHERE id=?`).run(...entries.map(([, value]) => value), id);
  }
  cached(website) { const row = this.db.prepare('SELECT report FROM cache WHERE website=? AND created>?').get(website, Date.now() - 86_400_000); return row ? JSON.parse(row.report) : null; }
  cache(website, report) { this.db.prepare('INSERT OR REPLACE INTO cache VALUES(?,?,?)').run(website, Date.now(), JSON.stringify(report)); }
  report(token) {
    const row = this.db.prepare('SELECT lead,report FROM jobs WHERE token=? AND report IS NOT NULL AND created>?').get(token, Date.now() - 30 * 86_400_000);
    if (!row) return null;
    const lead = JSON.parse(row.lead);
    return { clinic: lead.clinic, city: lead.city, country: lead.country, ...JSON.parse(row.report) };
  }
  prune() {
    this.db.prepare('DELETE FROM jobs WHERE created<?').run(Date.now() - 30 * 86_400_000);
    this.db.prepare('DELETE FROM cache WHERE created<?').run(Date.now() - 86_400_000);
  }
}
