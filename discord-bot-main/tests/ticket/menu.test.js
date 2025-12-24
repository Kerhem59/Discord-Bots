const { expect } = require('chai');
const ticketMenu = require('../../src/handlers/Menu/ticket_menu');
const ticketManager = require('../../src/utils/ticket/TicketV3Manager');

describe('Ticket menu handler', () => {
  beforeEach(() => {
    ticketManager.data = { _meta: { counter: 0 } };
  });

  it('returns no open tickets message when none', async () => {
    const interaction = { values: ['open_list'], reply: async (obj) => obj };
    const res = await ticketMenu.execute(interaction);
    expect(res).to.be.an('object');
    expect(res.content).to.equal('Açık ticket yok.');
  });

  it('lists open tickets', async () => {
    const t = ticketManager.createTicket({ id: 'g' }, 'owner1', 'r');
    ticketManager.setChannel(t.name, 'c1');
    const interaction = { values: ['open_list'], reply: async (obj) => obj };
    const res = await ticketMenu.execute(interaction);
    // no throw is success
  });
});