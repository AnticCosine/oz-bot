export class DealStorage {
    constructor() {
        this.deals = new Set();
    }

    addDeal(dealId) {
        this.deals.add(dealId);
    }

    hasDeal(dealId) {
        return this.deals.has(dealId);
    }
}