const JsonManager = require('../../../Database/SuperCore/JsonManager');
const json = new JsonManager();

class TicketManagerV2_Backup {
  constructor() {
    this.id = 'tickets/data';
    this.data = json.readJson(this.id) || {};
  }
  // Backup copy of v2 implementation
}

module.exports = TicketManagerV2_Backup;