const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

class Gameserver {
    constructor(id, token) {
        this.id = id;
        this.token = token;
    }

    async ping() {
        return await this.request("/gameservers/", "GET");
    }

    async restart() {
        return await this.request("/gameservers/restart", "POST");
    }

    async stop() {
        return await this.request("/gameservers/stop", "POST");
    }

    async getStatus() {
        const response = await this.request("/gameservers", "GET");
        return response.data.gameserver.status;
    }

    async getPlayers() {
        const response = await this.request("/gameservers/games/players", "GET");
        return response.data.players;
    }

    async getOnlinePlayers() {
        const players = await this.getPlayers();
        return players.filter(player => player.online);
    }

    async request(path, method, data) {
        const response = await fetch(`https://api.nitrado.net/services/${this.id}${path}`, {
            method: method,
            headers: {
                Accept: 'application/json',
                'Authorization': `Bearer ${this.token}`, 
                'Content-Type': 'application/json' 
            },
            body: data ? JSON.stringify(data) : undefined
        });

        if (response.ok) {
            return await response.json();
        }

        const errorBody = await response.text(); 
        throw new Error(`Request failed with status ${response.status}: ${response.statusText} - ${errorBody}`);
    }
}

module.exports = { Gameserver };
