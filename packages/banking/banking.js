require('../CoreSystem/coreApi');
require('../CoreSystem/timeWeather');
const db = require('../models');
const bcrypt = require('bcryptjs');
const LZString = require('../CoreSystem/compression.js');
const CONFIG = require('../CoreSystem/chatformatconf').CONFIG;

mp.events.add({
    'packagesLoaded': () => {
        db.server_atms.findAll({}).then((atms) => {
            atms.forEach(atm => {
                loadAtm(atm);
            });
        }).catch((err) => { mp.log(err) });

        db.server_banks.findAll({}).then(banks => {
            banks.forEach(bank => {
                loadBank(bank);
            })
        })
    },
    'numPinData': (player, data) => {
        if (!data || !player.getVariable('loggedIn')) return;
        data = LZString.decompress(data);
        db.characters.findAll({ where: { id: player.characterId } }).then(async (char) => {
            if (char.length == 0) return;
            var pin = await bcrypt.compare(data, char[0].pinNum);
            if (pin) {
                player.call('requestBrowser', [`appSys.commit('setAtmInfo', {
                    pinNum: ${data},
                    moneyAmount: ${player.moneyAmount},
                    cashAmount: ${player.cashAmount},
                    salary: 0,
                    taxRate: '0.3'
                })`]);
                return;
            } else {
                player.call('requestBrowser', [`gui.notify.clearAll()`]);
                player.call('requestBrowser', [`appSys.commit('flushAtmData')`]);
                return player.call('requestBrowser', [`gui.notify.showNotification("You entered an invalid pin number", false, true, 8000, 'fa-solid fa-circle-exclamation')`]);
            }
        }).catch((err) => { mp.log(err) });
    },
    'setBankInfo': (player) => {
        if (!player.getVariable('loggedIn') || !player.isByBank) return;
        player.call('requestBrowser', [`appSys.commit('setAtmInfo', {
            pinNum: 0,
            moneyAmount: ${player.moneyAmount},
            cashAmount: ${player.cashAmount},
            salary: 0,
            taxRate: '0.3'
        })`]);
    },
    'withdrawCash': (player, cash) => {
        if (!cash || !player.getVariable('loggedIn')) return;
        cash = LZString.decompress(cash);
        db.characters.findAll({ where: { id: player.characterId } }).then((char) => {
            if (char.length > 0) {
                var calc = player.moneyAmount - cash;
                if (calc < 0) return player.call('requestBrowser', [`gui.notify.showNotification("You do not have enough money to withdraw this amount.", false, true, 8000, 'fa-solid fa-circle-exclamation')`]);
                else {
                    player.moneyAmount = parseInt(calc);
                    player.cashAmount += parseInt(cash);
                    player.setVariable('moneyValue', player.moneyAmount);
                    player.setVariable('cashValue', player.cashAmount);

                    db.characters.update({
                        moneyAmount: player.moneyAmount,
                        cashAmount: player.cashAmount
                    }, { where: { id: player.characterId } }).catch((err) => { mp.log(err) });
                    mp.chat.success(player, `You withdrew $${cash.toLocaleString('en-US')} from your bank account.`);
                    mp.core.addBankingLog(player.characterId, 'ATM Withdrawl', 0, cash);
                    player.call('closeRoute');
                }
            }
        })
    },
    'depositCash': (player, cash) => {
        if (!cash || !player.getVariable('loggedIn')) return;
        cash = LZString.decompress(cash);
        db.characters.findAll({ where: { id: player.characterId } }).then(char => {
            if (char.length > 0) {
                var calc = player.cashAmount - cash;
                if (calc < 0) return mp.core.sendNotif(player, `You do not have enough cash to deposit this amount.`, 8000, 'fa-solid fa-circle-info');
                else {
                    player.cashAmount = parseInt(calc);
                    player.moneyAmount += parseInt(cash);
                    player.setVariable('moneyValue', player.moneyAmount);
                    player.setVariable('cashValue', player.cashAmount);

                    db.characters.update({
                        moneyAmount: player.moneyAmount,
                        cashAmount: player.cashAmount
                    }, { where: { id: player.characterId } }).catch(err => { mp.log(err) });

                    mp.chat.success(player, `You deposited $${cash.toLocaleString('en-US')} into your bank account.`);
                    mp.core.addBankingLog(player.characterId, 'Cash Deposit', 1, cash);
                    player.call('closeRoute');
                }
                return;
            }
        })
    },
    'playerEnterColshape': (player, shape) => {
        if (shape.getVariable('atm')) {
			player.call('requestBrowser', [`gui.notify.clearAll()`]);
            player.call('requestBrowser', [`gui.notify.showNotification(" 'Y' tuşuna basarak ATM ile etkileşime geçebilirsin..", true, false, false, 'fa-solid fa-circle-info')`]);
            player.isByAtm = shape.getVariable('atm'), player.setVariable('byAtm', shape.getVariable('atm'));
        }
        if (shape.getVariable('bank')) {
			player.call('requestBrowser', [`gui.notify.clearAll()`]);
            player.call('requestBrowser', [`gui.notify.showNotification(" 'Y' tuşuna basarak bankacı ile etkileşime geçebilirsin.", true, false, false, 'fa-solid fa-circle-info')`]);
            player.isByBank = shape.getVariable('bank');
            player.setVariable('byBank', shape.getVariable('bank'));
        return;
        } 
    },
    'playerExitColshape': (player, shape) => {
        if (shape.getVariable('atm')) {
            player.isByAtm = null, player.setVariable('byAtm', null);
            mp.core.clearNotifs(player);
        }
        if (shape.getVariable('bank')) {
            player.isByBank = null, player.setVariable('byBank', null);
            mp.core.clearNotifs(player);
        }
    }
})

mp.cmds.add(['addatm'], async (player, name) => {
    if (!name) return mp.chat.info(player, `Use: /addatm [name]`);
    if (player.isAdmin > 7) {
        let atm = await db.server_atms.create({
            OwnerId: player.characterId,
            position: JSON.stringify(player.position),
            name: name,
            lastRobbery: 0
        });

        loadAtm(atm);
        mp.chat.aPush(player, `Created new atm with sqlid: ${atm.id} name: ${atm.name}`);
        return;
    }
    mp.chat.err(player, `${CONFIG.noauth}`);
})

mp.cmds.add(['addbank'], async (player, name) => {
    if (!name) return mp.chat.info(player, `Use: /addbank [name]`);
    if (player.isAdmin > 7) {
        let positions = [
            player.position
        ];

        let bank = await db.server_banks.create({
            OwnerId: player.characterId,
            name: name,
            position: JSON.stringify(player.position),
            pedPositions: positions,
            markerPositions: positions,
            moneyAmount: 123000000,
            lastRobbery: 0
        });

        mp.chat.aPush(player, `Created new bank with ID: ${bank.id} name: ${bank.name}`);
        loadBank(bank);
        return;
    }
    mp.chat.err(player, `${CONFIG.noauth}`);
});

function loadAtm(atm) {
    var pos = JSON.parse(atm.position);
    mp.blips.new(434, new mp.Vector3(pos),
        {
            name: 'ATM',
            color: 43,
            shortRange: true,
        });
    var atmCol = mp.colshapes.newRectangle(pos.x, pos.y, 1, 1);
    atmCol.setVariable('atm', atm.id);
    mp.markers.new(27, new mp.Vector3(pos.x, pos.y, pos.z - 0.95), 0.8,
        {
            direction: 0,
            rotation: 0,
            color: [175, 237, 174, 255],
            visible: true,
            dimension: 0
        });
}

function loadBank(bank) {
    var bankPos = JSON.parse(bank.position);
    var pedPositions = bank.pedPositions;
    var markerPositions = bank.markerPositions;

    mp.blips.new(375, new mp.Vector3(bankPos), {
        name: 'Bank',
        color: 70,
        shortRange: true,
    });

    if (typeof markerPositions === 'string') {
        markerPositions = JSON.parse(markerPositions);
    }
    
    if (Array.isArray(markerPositions)) {
        markerPositions.forEach(mpos => {
            try {
                var bankCol = mp.colshapes.newRectangle(mpos.x, mpos.y, 7, 7);
                if (bankCol) {
                    bankCol.setVariable('bank', bank.id);
                    mp.markers.new(27, new mp.Vector3(mpos.x, mpos.y, mpos.z - 0.95), 0.8, {
                        direction: 0,
                        rotation: 0,
                        color: [240, 203, 88, 255],
                        visible: true,
                        dimension: 0
                    });
                } else {
                    console.error('colshape kismini marker icin olusturamadim, orospu cocuk!:', mpos);
                }
            } catch (error) {
                console.error('colshape olustururken hata olustu otur agla:', error);
            }
        });
    } else {
        console.error('markerPositions netflix dizisi degildir:', markerPositions);
    }

    if (typeof pedPositions === 'string') {
        pedPositions = JSON.parse(pedPositions);
    }
    
    if (Array.isArray(pedPositions)) {
        pedPositions.forEach(ped => {
            try {
                var staticP = mp.peds.new(mp.joaat('ig_andreas'), new mp.Vector3(ped.x, ped.y, ped.z), {
                    dynamic: false,
                    frozen: true,
                    invincible: true
                });
                staticP.rotation = new mp.Vector3(0, 0, ped.heading);
            } catch (error) {
                console.error('ped olustururken hata olustu:', error);
            }
        });
    } else {
        console.error('pedPositions netflix dizisi degildir:', pedPositions);
    }
}




