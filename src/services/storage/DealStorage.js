export class DealStorage {
    constructor() {
        this.channelDeals = {};
    }

    addDeal(channelId, dealId) {
        if (!this.channelDeals[channelId]) {
            this.channelDeals[channelId] = new Set();
        }
        this.channelDeals[channelId].add(dealId);
    }

    hasDeal(channelId, dealId) {
        return this.channelDeals[channelId]?.has(dealId) || false;
    }
}