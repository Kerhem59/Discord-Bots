// Sample ticket v3 schema and a tiny validator

const schema = {
  id: 'number',
  name: 'string',
  ownerId: 'string',
  channelId: 'string',
  status: 'string', // open|closed
  claimedBy: 'string|null',
  participants: 'array',
  createdAt: 'string', // ISO
  reason: 'string',
  transcript: 'string|null',
  metadata: 'object'
};

function validate(ticket) {
  if (!ticket) return false;
  if (typeof ticket.id !== 'number') return false;
  if (!ticket.name || typeof ticket.name !== 'string') return false;
  if (!ticket.ownerId || typeof ticket.ownerId !== 'string') return false;
  if (!ticket.channelId || typeof ticket.channelId !== 'string') return false;
  if (!['open', 'closed'].includes(ticket.status)) return false;
  if (!Array.isArray(ticket.participants)) return false;
  return true;
}

module.exports = { schema, validate };