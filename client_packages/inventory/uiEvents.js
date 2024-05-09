class uiEvents {
    constructor() {
        mp.events.add('esyaver:client', (itemId) => {
            mp.events.callRemote('esyaver:server', itemId);
        });

        mp.events.add('esyasil:client', (itemId) => {
            mp.events.callRemote('esyasil:server', itemId);
        });
    }
}

new uiEvents();
