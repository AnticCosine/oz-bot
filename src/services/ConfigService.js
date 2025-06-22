export class ConfigService {
    constructor() {
        this.channelConfigs = {};
    }

    updateConfig(channelId, config) {
        if (!this.channelConfigs[channelId]) {
            this.channelConfigs[channelId] = {
                upvoteThreshold: 20,
                timeThreshold: 60,
                categories: [],
                tags: []
            };
        }
        this.channelConfigs[channelId] = { ...this.channelConfigs[channelId], ...config };
    }

    getConfig(channelId) {
        return this.channelConfigs[channelId] || {
            upvoteThreshold: 20,
            timeThreshold: 60,
            categories: [],
            tags: []
        };
    }
}