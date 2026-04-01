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
                filterKeywords: [],
                pingRoles: []
            };
        }
        this.channelConfigs[channelId] = { ...this.channelConfigs[channelId], ...config };
    }

    getConfig(channelId) {
        return this.channelConfigs[channelId] || {
            upvoteThreshold: 20,
            timeThreshold: 60,
            categories: [],
            filterKeywords: [],
            pingRoles: []
        };
    }

    getAllConfigs() {
        return this.channelConfigs;
    }

    deleteConfig(channelId) {
        delete this.channelConfigs[channelId];
    }
}