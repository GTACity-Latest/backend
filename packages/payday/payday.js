const db = require("../models");


// varsayılan payday
mp.gtacitypayday = 700;

setInterval(async function () {
    mp.players.forEach(async (ps) => {
        var islogged = ps.getVariable("loggedIn");
        if (!islogged) return;

        if (ps.playTime !== undefined) {
            const prevPlayTime = ps.playTime;
            ps.playTime = ps.playTime + 60;

            if (ps.playTime === prevPlayTime + 60) {
                ps.moneyAmount = (ps.moneyAmount || 0) + mp.gtacitypayday;
                const { characters } = require('../models');
                await characters.update({
                    moneyAmount: ps.moneyAmount
                }, { where: { id: ps.characterId } });
				
				
				mp.chat.server(ps, `!{orange}[Payday]!{white} Maaş: !{#94ffa6}$${mp.gtacitypayday}!`);
            }
        }
    });
}, 3600000);

mp.cmds.add(['payday'], (player, fullText, amount) => {
    if (player.isAdmin > 6 && player.adminDuty || player.isAdmin > 7) {
        if (isNaN(amount)) return mp.chat.err(player, `Bilinmeyen numara.`);

        const yeniyiz = parseInt(amount);
		if (yeniyiz > 2000) return mp.chat.err(player, `$2000 fiyatından fazla olamaz.`);

        mp.gtacitypayday = yeniyiz;
        mp.chat.aPush(player, `!{white}Payday artık !{#94ffa6}$${yeniyiz}.`);

    } else {
        mp.chat.err(player, `${CONFIG.noauth}`);
    }
});
