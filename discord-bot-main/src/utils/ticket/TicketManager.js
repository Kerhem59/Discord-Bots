// Shim to preserve backward compatibility for old modules that still require `TicketManager`.
// It forwards to `TicketV3Manager` and emits a deprecation warning (non-throwing).

const ticketV3 = require('./TicketV3Manager');

/* eslint-disable no-console */
console.warn('[deprecation][tickets] `TicketManager` (v2) is deprecated — forwarded to `TicketV3Manager`. Remove references to `TicketManager` to avoid this shim.');
/* eslint-enable no-console */

module.exports = ticketV3;
