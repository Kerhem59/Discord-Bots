// Archived copy of the old v2 throwing stub for historical/reference purposes.
// This file was created during cleanup to preserve the original behavior that
// used to throw when old code attempted to use TicketManager v2.

module.exports = new (class TicketManagerStub {
  constructor() {}
  _throw() { throw new Error('TicketManager v2 has been migrated to TicketV3Manager. Use TicketV3Manager.'); }
  createTicket() { this._throw(); }
  setChannel() { this._throw(); }
  closeByChannel() { this._throw(); }
  getByChannel() { this._throw(); }
  claimByChannel() { this._throw(); }
  addParticipantByChannel() { this._throw(); }
  removeParticipantByChannel() { this._throw(); }
})();
