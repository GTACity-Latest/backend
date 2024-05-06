class inventorySystem {
    constructor() {
        let inventoryItems = require('./inventoryItems.json')

mp.events.add({
    'server:getPlayerInventory': async(player) => {
        const currentRoute = await player.callProc('proc:getRoute');
        if (currentRoute == 'inventory' || currentRoute !== '/') { return; }
        if (player.getVariable('loggedIn')) {
            const { inventory_items } = require('../models');
            inventory_items.findAll({ where: { OwnerId: player.characterId } }).then((inventory) => {
                if (inventory.length > 0) {
                    player.call('requestBrowser', [`appSys.commit('clearInventory')`]);
                    player.call('requestRoute', ['inventory', true, true]);
                    inventory.forEach((inven) => {
                        console.log(`id: ${inven.id},
						cityitemid: ${inven.itemId},
                        name: '${inven.itemName}',
                        img: '${inventoryItems.items[inven.itemId].img}'`);
                        player.call('requestBrowser', [`appSys.commit('addInventoryItem', {
                            id: ${inven.id},
							cityitemid: ${inven.itemId},
                            name: '${inven.itemName}',
                            img: '${inventoryItems.items[inven.itemId].img}',
                            equipped: 0
                        })`]);
                    });
                }
            });
        }
    }
});


        mp.log(`All ${Object.keys(inventoryItems.items).length} inventory items where loaded: `)
        for(var x = 1; x <= Object.keys(inventoryItems.items).length; x++) {
            mp.log(`ID: ${x}. ${JSON.stringify(inventoryItems.items[x])}`)
        }

        mp.cmds.add(['giveitem'], async(player, fullText, id, itemId) => {
            if(!id || !itemId) return mp.chat.info(player, `Use: /giveitem [Name/ID] [itemId]`)
            if(player.isAdmin > 7) {
                var targetPlayer = mp.core.idOrName(player, id)
                if(targetPlayer) {
                    if(inventoryItems.items[parseInt(itemId)]) {
                        const { inventory_items } = require('../models')
                        inventory_items.create({
                            OwnerId: targetPlayer.characterId,
                            itemId: parseInt(itemId),
                            itemName: inventoryItems.items[parseInt(itemId)].name,
                            equipped: 0
                        }).then(() => {
                            mp.chat.aPush(player, `You gave player ${targetPlayer.characterName} [${targetPlayer.id}] item ${inventoryItems.items[parseInt(itemId)].name} ID: ${parseInt(itemId)}`)
                            mp.chat.aPush(player, `You were given a ${inventoryItems.items[parseInt(itemId)].name} by admin ${player.adminName}`)
                        })
                    }
                    else { return mp.chat.err(player, `Enter a valid inventory item index.`) }
                    return
                }
                else return mp.chat.err(player, `No player was found.`)

            }
        }),

        mp.cmds.add(['getitems'], (player, arg) => {
            if(arg != null) return mp.chat.info(player, `Use: /getitems`)
            if(player.isAdmin > 7) {
                for(var x = 1; x <= Object.keys(inventoryItems.items).length; x++) {
                    mp.chat.aPush(player, `ID: ${x} ${JSON.stringify(inventoryItems.items[x])}`)
                }
            }
        })
		
mp.cmds.add(['envanter'], async (player, arg) => {
    if (arg != null) return mp.chat.info(player, `Kullanım: /envanter`);
        try {
            const { characters, inventory_items } = require('../models');

            const character = await characters.findOne({ where: { id: player.characterId } });

            if (!character) return mp.chat.err(player, `Karakter bulunamadı.`);

            const items = await inventory_items.findAll({ 
                where: { OwnerId: character.id },
                attributes: ['itemName'],
                raw: true
            });

            const itemsayma = {};
            items.forEach((item) => {
                if (item.itemName in itemsayma) {
                    itemsayma[item.itemName]++;
                } else {
                    itemsayma[item.itemName] = 1;
                }
            });

            if (Object.keys(itemsayma).length > 0) {
                Object.entries(itemsayma).forEach(([itemName, count]) => {
                    mp.chat.aPush(player, `bunlar var envanterinde al kullan ${itemName} (x${count})`);
                });
            } else {
                mp.chat.aPush(player, `Envanterin bomboş.`);
            }
        } catch (error) {
            mp.log(error);
            mp.chat.err(player, `Sorun oluştu.`);
        }
});


    }
}
new inventorySystem()