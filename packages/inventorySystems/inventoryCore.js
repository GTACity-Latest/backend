//GTACity Inventory System V0.0.1
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
                       (`id: ${inven.id},
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

mp.events.add({
    'esyaver:server': async (player, itemId) => {
        let nearestPlayer = findNearestPlayer(player);
        if (nearestPlayer && player.dist(nearestPlayer.position) <= 5) {
            const { inventory_items } = require('../models');
            inventory_items.findOne({ where: { id: itemId, OwnerId: player.characterId } })
                .then((item) => {
                    if (item) {
                        inventory_items.update({ OwnerId: nearestPlayer.characterId }, { where: { id: itemId } })
                            .then((result) => {
                                if (result[0] > 0) {
                                    player.call('requestBrowser', [`gui.notify.showNotification("Başarıyla ${nearestPlayer.name} kişisine transfer ettin.", false, true, 2000, 'fa-solid fa-triangle-exclamation')`])
                                    nearestPlayer.outputChatBox(`${player.name} kişisi sana bir eşya verdi.`);
                                } else {
                                    player.call('requestBrowser', [`gui.notify.showNotification("Transfer edilirken bir hata oluştu, yöneticiye ulaşın.", false, true, 2000, 'fa-solid fa-triangle-exclamation')`])
                                }
                            })
                            .catch((error) => {
                                console.error("Oyuncu eşyayı veremedi:", error);
                                player.call('requestBrowser', [`gui.notify.showNotification("Transfer edilirken bir hata oluştu, yöneticiye ulaşın.", false, true, 2000, 'fa-solid fa-triangle-exclamation')`])
                            });
                    } else {
                        player.call('requestBrowser', [`gui.notify.showNotification("Bu eşyaya sahip değilsin.", false, true, 2000, 'fa-solid fa-triangle-exclamation')`])
                    }
                })
                .catch((error) => {
                    console.error("Sahipliği kontrol ederken hata:", error);
                    player.call('requestBrowser', [`gui.notify.showNotification("Bu eşyaya sahip değilsin ya da farklı bir hata oluştu.", false, true, 2000, 'fa-solid fa-triangle-exclamation')`])
                });
        } else {
            player.call('requestBrowser', [`gui.notify.showNotification("Yakınında eşyayı verebileceğin bir oyuncu yok.", false, true, 2000, 'fa-solid fa-triangle-exclamation')`])
        }
    }
});

function findNearestPlayer(player) {
    let nearestPlayer = null;
    let minDistance = Infinity;

    mp.players.forEach((p) => {
        if (p !== player) {
            let distance = player.dist(p.position);
            if (distance < minDistance) {
                minDistance = distance;
                nearestPlayer = p;
            }
        }
    });

    return nearestPlayer;
}


        mp.log(`Tüm ${Object.keys(inventoryItems.items).length} envanter eşyaları şu şekilde yüklendi: `)
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
                    mp.chat.info(player, `bunlar var envanterinde al kullan ${itemName} (x${count})`);
                });
            } else {
                mp.chat.info(player, `Envanterin bomboş.`);
            }
        } catch (error) {
            mp.log(error);
            mp.chat.err(player, `Sorun oluştu.`);
        }
});


        mp.cmds.add(['esyaver'], async(player, fullText, id, targetId) => {
            if (!id || !targetId) return mp.chat.info(player, `Kullanım: /transferitem [EsyaID] [KisiID]`);

            const sourcePlayer = player;
            const targetPlayer = mp.players.at(parseInt(targetId));

            if (!targetPlayer) return mp.chat.err(player, `Kişi bulunamadı.`);

            const distance = sourcePlayer.dist(targetPlayer.position);

            if (distance > 5) return mp.chat.err(player, `Kişi çok uzakta.`);

            const { inventory_items } = require('../models');
            const item = await inventory_items.findOne({ where: { OwnerId: sourcePlayer.characterId, id: parseInt(id) } });

            if (!item) return mp.chat.err(player, `Envanterinde bu eşya bulunamadı.`);

            item.update({ OwnerId: targetPlayer.characterId })
                .then(() => {
                    mp.chat.info(player, `Eşya ${item.itemName} (ID: ${item.id}) ${targetPlayer.name} kişisine transfer edildi.`);
                    mp.chat.info(targetPlayer, `${sourcePlayer.characterName} kişisinden bir eşya aldın. ${item.itemName} (ID: ${item.id})`);
                }).catch((err) => {
                    mp.chat.err(player, `Transfer edilirken bir hata oluştu: ${err.message}`);
                });
		});


         mp.cmds.add(['esyasil'], async(player, fullText, id) => {
            if (!id) return mp.chat.info(player, `Kullanım: /esyasil [ItemID]`);
            
            const sourcePlayer = player;
            
            const { inventory_items } = require('../models');
            
            const item = await inventory_items.findOne({ where: { OwnerId: sourcePlayer.characterId, id: parseInt(id) } });

            if (!item) return mp.chat.err(player, `Eşya envanterinizde bulunamadı.`);

            item.destroy()
                .then(() => {
                    mp.chat.info(player, `Eşya ${item.itemName} (ID: ${item.id}) başarıyla silindi.`);
                })
                .catch((err) => {
                    mp.chat.err(player, `Bir hata oluştu, bu hatayı yönetime iletin: ${err.message}`);
                });
            });
    }
}


new inventorySystem()