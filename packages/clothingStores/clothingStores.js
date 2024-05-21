class clothingStores {
    constructor() {
        require('../CoreSystem/coreApi')
        const CONFIG = require('../CoreSystem/chatformatconf').CONFIG
        this.colShapeMngr = []
        const db = require('../models');

        mp.events.add({
            'packagesLoaded': () => {
                const { clothing_stores } = require('../models')
                clothing_stores.findAll({
                    benchmark: true,
                    logging: (sql, timingMs) => mp.log(`${CONFIG.consoleGreen}[CLOTHING SHOPS]${CONFIG.consoleWhite} Loaded all clothing shops into the server [Executed in ${timingMs} ms]`),
                }).then((clothesShops) => {
                    if (clothesShops.length > 0) {
                        clothesShops.forEach((shop) => {

                        })
                    }
                })
            },
            'playerEnterColshape': (player, shape) => {
                this.colShapeMngr.forEach((shop) => {
                    if (shop == shape) {
                        player.setVariable('inClothingStore', true);
                        player.call('requestBrowser', [`gui.notify.showNotification("Press 'Y' to interact with clothing store.", true, false, false, 'fa-solid fa-circle-info')`])
                    }
                })
            },
            'playerExitColshape': async (player, shape) => {
                this.colShapeMngr.forEach(async (shop) => {
                    if (shop == shape) {
                        player.setVariable('inClothingStore', false);
                        if (!player.adminDuty) { mp.events.call('previewCharacter', player, player.characterName) }
                        player.call('requestBrowser', [`gui.notify.clearAll()`])
                        const getRoute = await player.callProc('proc:getRoute')
                        if (getRoute == 'clothing') {
                            mp.events.call('resetClothes:server', player)
                            player.call('closeRoute');
                        }
                    }
                })
            },
            'clothingChange:sync': async (player, cid, draw, texture) => {          
                    mp.players.forEachInRange(player.position, 200,
                        async (ps) => {
                            ps.call('setEntComponents', [player, cid, draw, texture])
                        })     
            },
			'propsChange:sync': async (player, cid, draw, texture) => {          
                    mp.players.forEachInRange(player.position, 200,
                        async (ps) => {
                            ps.call('setPropThings', [player, cid, draw, texture])
                        })     
            },
            'playerBuyClothes:server': (player, componentId, type, texture, torso) => {
              const { player_clothes } = require('../models');

              player_clothes.findOne({ where: { OwnerId: player.characterId } }).then((clothes) => {
              if (clothes) {
              let jsonData = JSON.parse(clothes.data);

              let updatedData = { ...jsonData };

            switch (componentId) {
                case 1:
                    updatedData.mask = parseInt(type);
                    updatedData.maskTexture = texture;
                    break;
                case 3:
                    updatedData.torso = torso;
                    break;
                case 4:
                    updatedData.Leg = type;
                    updatedData.LegTexture = texture;
                    break;
                case 5:
                    updatedData.bags = type;
                    updatedData.bagTexture = texture;
                    break;
                case 6:
                    updatedData.shoes = type;
                    updatedData.shoesTexture = texture;
                    break;
                case 7:
                    updatedData.acess = type;
                    updatedData.acessTexture = texture;
                    break;
                case 8:
                    updatedData.undershirt = type;
                    updatedData.undershirtTexture = texture;
                    break;
                case 11:
                    updatedData.tops = type;
                    updatedData.topsTexture = texture;
                break;
                default:
                    break;
            }

            const updatedDataString = JSON.stringify(updatedData);

            player_clothes.update({ data: updatedDataString }, { where: { OwnerId: player.characterId } }).then(() => {
				player.call('requestBrowser', ['gui.notify.clearAll();']);
                player.call('requestBrowser', [`gui.notify.showNotification("Kıyafetleri başarıyla satın aldın.", false, true, 3000, 'fa-solid fa-circle-info')`]);
                mp.events.call('player:setClothing', player);
            });
        } else {
            console.log("Kullanıcı veritabanında bulunamadı.");
        }
    });
},

'playerBuyProps:server': (player, componentId, type, texture, torso) => {
    const { player_props } = require('../models');

    player_props.findOne({ where: { OwnerId: player.characterId } }).then((props) => {
        if (props) {
            let jsonData = JSON.parse(props.data);

            let updatedData = { ...jsonData };

            switch (componentId) {
                case 0:
                    updatedData.hats = parseInt(type);
                    updatedData.hatsTexture = texture;
                    break;
                case 1:
                    updatedData.glasses = type;
					updatedData.glassesTexture = texture;
                    break;
                case 2:
                    updatedData.ears = type;
                    updatedData.earsTexture = texture;
                    break;
                case 6:
                    updatedData.watches = type;
                    updatedData.watchesTexture = texture;
                    break;
                case 7:
                    updatedData.bracelets = type;
                    updatedData.braceletsTexture = texture;
                    break;
                default:
                    break;
            }

            const updatedDataString = JSON.stringify(updatedData);

            player_props.update({ data: updatedDataString }, { where: { OwnerId: player.characterId } }).then(() => {
                player.call('requestBrowser', ['gui.notify.clearAll();']);
                player.call('requestBrowser', [`gui.notify.showNotification("Kıyafetleri başarıyla satın aldın.", false, true, 3000, 'fa-solid fa-circle-info')`]);
                mp.events.call('player:setClothing', player);
            });
        } else {
            console.log("Player not found in the database.");
        }
    });
},
        })

        mp.cmds.add(['clothing'], async (player, name) => {
            if (!name) return mp.chat.info(player, `Use: /clothing [name]`);
            if (player.isAdmin > 7) {
                let shop = await db.clothing_stores.create({
                    OwnerId: player.characterId,
                    clothingName: name,
                    moneyAmount: 0,
                    items: "[]",
                    lastRobbery: 0,
                    position: JSON.stringify(player.position)
                });

                this.loadShop(shop);
                mp.chat.aPush(player, `Created new clothing store with name ${name} id ${shop.id}`);
            }
        });
    }

    loadShop(shop) {
        mp.labels.new(`~c~'~w~Y~c~'~w~ to interact. Clothing Store: ${shop.clothingName} ID: ${shop.id}`, new mp.Vector3(JSON.parse(shop.position)),
            {
                font: 4,
                drawDistance: 30,
                color: [255, 0, 0, 255],
                dimension: 0
            });
        mp.blips.new(73, new mp.Vector3(JSON.parse(shop.position)),
            {
                name: shop.shopName,
                color: 63,
                shortRange: true,
            });
        let staticPed = mp.peds.new(mp.joaat('csb_anita'), new mp.Vector3(JSON.parse(shop.position)),
            {
                dynamic: false,
                frozen: true,
                invincible: true
            });
        var shopCol = mp.colshapes.newRectangle(JSON.parse(shop.position).x, JSON.parse(shop.position).y, 7, 7, 0)
        this.colShapeMngr.push(shopCol)
    }
}
new clothingStores()