const { expect } = require('chai');
const fs = require('fs');
const path = require('path');
const ticketCreateModal = require('../../src/handlers/Modal/ticket_create_modal');
const ticketCreateHandler = require('../../src/handlers/Modal/ticket_create_modal');
const ticketCloseButton = require('../../src/handlers/Button/ticket_close');
const ticketAddModal = require('../../src/handlers/Modal/ticket_add_modal');
const ticketRemoveModal = require('../../src/handlers/Modal/ticket_remove_modal');
const ticketManager = require('../../src/utils/ticket/TicketV3Manager');

const TICKETS_PATH = path.resolve(__dirname, '..', '..', 'Database', 'db', 'tickets', 'tickets.json');
const TRANSCRIPTS_DIR = path.resolve(__dirname, '..', '..', 'Database', 'db', 'tickets', 'transcripts');

function backupTickets() {
  const backupPath = TICKETS_PATH + '.testbackup';
  if (fs.existsSync(TICKETS_PATH)) fs.copyFileSync(TICKETS_PATH, backupPath);
  return backupPath;
}

function restoreTickets(backupPath) {
  if (backupPath && fs.existsSync(backupPath)) fs.copyFileSync(backupPath, TICKETS_PATH);
  if (fs.existsSync(backupPath)) fs.unlinkSync(backupPath);
}

function makeFakeChannel(id, messages = []) {
  let deleted = false;
  const channel = {
    id,
    send: async (obj) => { channel._sent = obj; return obj; },
    permissionOverwrites: {
      edit: async () => { channel._permEdited = true; }
    },
    delete: async () => { deleted = true; channel._deleted = true; },
    messages: {
      fetch: async ({ limit, before } = {}) => {
        const fakeCollection = {
          size: messages.length,
          forEach(fn) { messages.forEach(fn); },
          last() { return messages[messages.length - 1]; }
        };
        return fakeCollection;
      }
    }
  };
  return channel;
}

function makeFakeGuild() {
  return {
    roles: { everyone: { id: 'everyone' } },
    channels: {
      create: async (opts) => {
        const ch = makeFakeChannel(opts.name + '-chan');
        ch.name = opts.name;
        return ch;
      }
    },
    members: {
      fetch: async (id) => ({ id, user: { tag: `User#${id}` } })
    }
  };
}

function makeFakeInteraction({ userId = 'u1', guild = null, channel = null } = {}) {
  const fields = new Map();
  return {
    user: { id: userId },
    member: { roles: { cache: new Map() }, permissions: { has: () => false } },
    guild,
    channel,
    fields: {
      getTextInputValue: (k) => fields.get(k)
    },
    showModal: async (modal) => { /* noop for tests */ },
    reply: async (obj) => { return obj; }
  };
}

describe('Ticket handlers', () => {
  let backupPath;

  beforeEach(() => {
    backupPath = backupTickets();
    // ensure fresh clean copy
    fs.writeFileSync(TICKETS_PATH, JSON.stringify({ _meta: { counter: 0 } }, null, 2));
    // reset in-memory manager state
    ticketManager.data = { _meta: { counter: 0 } };
    if (!fs.existsSync(TRANSCRIPTS_DIR)) fs.mkdirSync(TRANSCRIPTS_DIR, { recursive: true });
  });

  afterEach(() => {
    // clean transcripts matches
    const files = fs.readdirSync(TRANSCRIPTS_DIR).filter(f => f.includes('testtrans') || f.includes('ticket-'));
    for (const f of files) {
      try { fs.unlinkSync(path.join(TRANSCRIPTS_DIR, f)); } catch (e) {}
    }
    restoreTickets(backupPath);
  });

  it('creates a ticket and channel via modal', async () => {
    const guild = makeFakeGuild();
    const interaction = makeFakeInteraction({ userId: 'owner1', guild });
    // set modal field
    interaction.fields.getTextInputValue = (k) => (k === 'reason' ? 'Test reason' : '');

    await ticketCreateModal.execute(interaction);

    // find the created ticket by scanning data
    const data = ticketManager.data;
    const keys = Object.keys(data).filter(k => k !== '_meta');
    expect(keys.length).to.equal(1);
    const ticket = data[keys[0]];
    expect(ticket.ownerId).to.equal('owner1');
    expect(ticket.reason).to.equal('Test reason');
    // ensure created channel set
    expect(ticket.channelId).to.be.a('string');
  });

  it('closes a ticket and saves transcript', async () => {
    // prepare ticket entry
    const { name } = ticketManager.createTicket({ id: 'g' }, 'owner1', 'close test');
    const ch = makeFakeChannel('close-chan', [
      { id: 'm1', author: { tag: 'User#1', id: 'u1' }, createdAt: new Date(), content: 'hello', attachments: [] }
    ]);
    ticketManager.setChannel(name, ch.id);

    const interaction = makeFakeInteraction({ userId: 'owner1', channel: ch });
    await ticketCloseButton.execute(interaction);

    const rec = ticketManager.getByChannel(ch.id);
    expect(rec.ticket.status).to.equal('closed');
    // transcript saved
    expect(rec.ticket.transcript).to.be.a('string');
    expect(fs.existsSync(rec.ticket.transcript)).to.be.true;
    // cleanup file
    fs.unlinkSync(rec.ticket.transcript);
  });

  it('adds and removes participant via modals', async () => {
    const { name } = ticketManager.createTicket({ id: 'g' }, 'owner1', 'add/remove test');
    const ch = makeFakeChannel('addremove-chan');
    ticketManager.setChannel(name, ch.id);

    const guild = makeFakeGuild();
    guild.members.fetch = async (id) => ({ id, user: { tag: `User#${id}` } });

    const addInteraction = makeFakeInteraction({ channel: ch, guild });
    addInteraction.fields.getTextInputValue = (k) => (k === 'user' ? '<@!999999999999999999>' : '');
    await ticketAddModal.execute(addInteraction);

    let rec = ticketManager.getByChannel(ch.id);
    expect(rec.ticket.participants).to.include('999999999999999999');

    const removeInteraction = makeFakeInteraction({ channel: ch, guild });
    removeInteraction.fields.getTextInputValue = (k) => (k === 'user' ? '<@!999999999999999999>' : '');
    await ticketRemoveModal.execute(removeInteraction);

    rec = ticketManager.getByChannel(ch.id);
    expect(rec.ticket.participants).to.not.include('999999999999999999');
  });
});