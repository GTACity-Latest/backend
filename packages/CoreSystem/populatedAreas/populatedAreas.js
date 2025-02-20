// Populated Areas script
const areas = [
    mrpd = mp.colshapes.newRectangle(462.3, -990.6, 150, 100),
    legionParking = mp.colshapes.newRectangle(230.2, -790, 200, 100),
    lsc = mp.colshapes.newRectangle(-363.4, -116.6, 200, 100),
    insurance = mp.colshapes.newRectangle(-841.1, -256.8, 300, 200)
];

mp.events.add({
    "playerEnterColshape": (player, shape) => {
        var islogged = player.getVariable('loggedIn');
        areas.forEach((asa) => {
            if(shape == asa && islogged) {
                player.setVariable('protectedArea', true);
                player.call('requestBrowser', [`appSys.commit('areadProtect', true)`]);
                player.call('requestBrowser', [`gui.notify.clearAll();`]);
                player.call('requestBrowser', [`gui.notify.showNotification("Güvenli bölgeye giriş sağladın.", false, true, 5000, 'fa-solid fa-circle-info')`]);
            }
            else {
                return;
            }
        })
    },
    'playerExitColshape': (player, shape) => {
        var islogged = player.getVariable('loggedIn');
        areas.forEach((asa) => {
            if(shape == asa && islogged) {
                player.setVariable('protectedArea', null);
                player.call('requestBrowser', [`appSys.commit('areadProtect', false)`]);
                player.call('requestBrowser', [`gui.notify.clearAll();`]);
                player.call('requestBrowser', [`gui.notify.showNotification("Güvenli bölgeden çıkış yaptın.", false, true, 5000, 'fa-solid fa-circle-info')`]);
            }
            else {
                return;
            }
        })
    }
});

// Set interval to check if player is in colshape
setInterval(() => {
    mp.players.forEach((ps) => {
        areas.forEach((asa) => {
            if(asa.isPointWithin(ps.position)) {
                ps.call('show:populatedArea');
            }
        })
    })
}, 2000);
