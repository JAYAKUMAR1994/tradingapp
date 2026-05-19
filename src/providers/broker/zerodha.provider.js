export function createZerodhaProvider() {
  return {
    async getInstruments() {
      throw new Error('Zerodha Kite Connect is not configured yet');
    },
    async subscribeTicks() {
      throw new Error('Zerodha WebSocket integration is reserved for live-data phase');
    }
  };
}
