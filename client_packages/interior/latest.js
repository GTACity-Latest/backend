mp.keys.bind(0x59, true, () => { 
    const player = mp.players.local;
    const pos = player.position;

    mp.events.callRemote('gir', pos.x, pos.y, pos.z);
});

mp.keys.bind(69, true, () => { 
    const player = mp.players.local;
    const pos = player.position;

    mp.events.callRemote('cik', pos.x, pos.y, pos.z);
});
