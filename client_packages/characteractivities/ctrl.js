mp.keys.bind(0x11, true, function() { // 0x11 is the virtual key code for 'Ctrl'
    let player = mp.players.local;

    if (player.isInAnyVehicle(false)) return; // Prevent crouching in vehicles

    if (!player.crouching) {
        player.taskPlayAnim("move_crouch_proto", "idle", 8.0, 1, -1, 49, 0, false, false, false);
        player.crouching = true;
    } else {
        player.stopAnimTask("move_crouch_proto", "idle", 3.0);
        player.crouching = false;
    }
});