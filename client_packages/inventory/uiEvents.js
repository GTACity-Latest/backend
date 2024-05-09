class uiEvents {
    constructor() {

        mp.events.add({
            'esyaver:client': (itemId) => {
                mp.events.callRemote('esyaver:server', itemId)
            }
        })
    }
}
new uiEvents()