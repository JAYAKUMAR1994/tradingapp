import { getJournalAnalytics } from '../services/analyticsService.js';

const journal = [];

export function listJournal(_req, res) {
  res.json(journal);
}

export function createJournal(req, res) {
  const entry = { id: String(Date.now()), ...req.body, createdAt: new Date().toISOString() };
  journal.unshift(entry);
  res.status(201).json(entry);
}

export function journalAnalytics(_req, res) {
  res.json(getJournalAnalytics(journal));
}
