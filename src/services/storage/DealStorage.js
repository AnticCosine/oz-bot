export class DealStorage {
    constructor() {
        this.channelDeals = {};
    }

    addDeal(channelId, dealId) {
        if (!this.channelDeals[channelId]) {
            this.channelDeals[channelId] = new Set();
        }
        const set = this.channelDeals[channelId];
        set.add(dealId);

        if (set.size > 200) {
            const [first] = set;
            set.delete(first);
        }
    }

    hasDeal(channelId, dealId) {
        return this.channelDeals[channelId]?.has(dealId) || false;
    }
}