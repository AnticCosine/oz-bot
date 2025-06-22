export class ConfigService {
    constructor() {
        this.config = {
            upvoteThreshold: 20,
            timeThreshold: 60,
            categories: [],
            tags: []
        };
    }

    updateConfig(config) {
        this.config = { ...this.config, ...config };
    }

    getConfig() {
        return this.config;
    }
}