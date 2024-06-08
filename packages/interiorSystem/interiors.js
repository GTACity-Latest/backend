const db = require('../models');
const cooldownMap = new Map();
const enterCooldownMap = new Map();
const exitCooldownMap = new Map();
const oldPositionMap = new Map();

mp.events.addCommand('interiorolustur', async (player, interiorId, name, ownerId) => {
    if (!interiorId || !name || !ownerId) {
        return player.outputChatBox(`Kullanım: /interiorolustur [InteriorID] [İsim] [Sahip ID]`);
    }

    if (player.isAdmin > 7) {
        try {
            const { x, y, z } = player.position;

            const latestInterior = await db.InteriorFix.findOne({
                order: [['dimension', 'DESC']],
            });

            let newDimension = 1;
            if (latestInterior) {
                newDimension = latestInterior.dimension + 1;
            }

            const newInterior = await db.InteriorFix.create({
                ownerId: parseInt(ownerId, 10),
                name: name,
                x: x,
                y: y,
                z: z,
                interiorType: parseInt(interiorId, 10),
                dimension: newDimension,
                kilitdurumu: false,
                anahtarId: null,
                rentStatus: false,
                saleStatus: false,
                salePrice: null,
                rentPrice: null,
            });

            player.outputChatBox(`!{yellow}Interior !{orange}[${name}] !{yellow}burada oluşturuldu (${x}, ${y}, ${z}) dünya ${newDimension}`);
            player.outputChatBox(`'Y' tuşuna basarak girebilirsin.`);
        } catch (err) {
            console.error(err);
            player.outputChatBox("Interior oluşturulurken bir hata oluştu.");
        }
    } else {
        player.outputChatBox("Yetkin yok.");
    }
});

mp.events.add('gir', async (player) => {
    try {
        if (enterCooldownMap.has(player)) {
            return;
        }

        const interiorFixes = await db.InteriorFix.findAll();

        if (interiorFixes.length > 0) {
            let allahbelaniziversin = null;
            let tamammi = Number.MAX_VALUE;

            interiorFixes.forEach((interiorFix) => {
                const distance = Math.sqrt(
                    Math.pow(interiorFix.x - player.position.x, 2) +
                    Math.pow(interiorFix.y - player.position.y, 2) +
                    Math.pow(interiorFix.z - player.position.z, 2)
                );

                if (distance < tamammi) {
                    tamammi = distance;
                    allahbelaniziversin = interiorFix;
                }
            });

            if (allahbelaniziversin && tamammi <= 10) {
                if (allahbelaniziversin.interiorType) {
                    const interior = await db.Interior.findByPk(allahbelaniziversin.interiorType);
                    if (interior) {
                        player.dimension = allahbelaniziversin.dimension;
                        player.position = new mp.Vector3(interior.x, interior.y, interior.z);
                        return mp.chat.info(player, `Hoşgeldin.`);
                    } else {
                        return;
                    }
                } else {
                    player.dimension = allahbelaniziversin.dimension;
                    player.position = new mp.Vector3(allahbelaniziversin.x, allahbelaniziversin.y, allahbelaniziversin.z);
                    return mp.chat.info(player, `Hoşgeldin.`);
                }
            } else {
                
            }
        } else {
            
        }

        enterCooldownMap.set(player, true);
        setTimeout(() => {
            enterCooldownMap.delete(player);
        }, 2000); 
    } catch (err) {
        console.error(err);
        return;
    }
});


mp.events.add('cik', async (player) => {
    try {
        if (exitCooldownMap.has(player)) {
            return;
        }

        const interiors = await db.Interior.findAll();

        if (interiors.length > 0) {
            //öyle tekrar tanımlayasım geldi.
            //oyuncuları bu şekilde alıştıran kim varsa anasını sikeyim her seferinde db fetchliyorum amına koyim bu ne.
            let allahbelaniziversin = null;
            let tamammi = Number.MAX_VALUE;

            interiors.forEach((interior) => {
                const distance = Math.sqrt(
                    Math.pow(interior.x - player.position.x, 2) +
                    Math.pow(interior.y - player.position.y, 2) +
                    Math.pow(interior.z - player.position.z, 2)
                );

                if (distance < tamammi) {
                    tamammi = distance;
                    allahbelaniziversin = interior;
                }
            });

            if (allahbelaniziversin && tamammi <= 10) {
                const interiorFix = await db.InteriorFix.findOne({
                    where: {
                        dimension: player.dimension,
                    },
                    order: [['createdAt', 'DESC']],
                });

                if (interiorFix) {
                    const distance = Math.sqrt(
                        Math.pow(allahbelaniziversin.x - player.position.x, 2) +
                        Math.pow(allahbelaniziversin.y - player.position.y, 2) +
                        Math.pow(allahbelaniziversin.z - player.position.z, 2)
                    );

                    if (distance <= 10 && player.dimension === interiorFix.dimension) {
                        player.dimension = 0;
                        player.position = new mp.Vector3(interiorFix.x, interiorFix.y, interiorFix.z);
                        return mp.chat.info(player, `Görüşürüz, kendine iyi bak.`);
                    } else {
                       //uzaksa veya dimension tutmazsa.
                    }
                } else {
                    //çıkılacak interior bulunamazsa
                }
            } else {
                // çıkma noktasına çok uzaksa
            }
        } else {
            // interior hiç bulunamadıysa.
        }

        exitCooldownMap.set(player, true);
        setTimeout(() => {
            exitCooldownMap.delete(player);
        }, 2000);
    } catch (err) {
        
    }
});

mp.events.add('intisimdegisla', async (player, interiorId, newName) => {
    try {
        if (!interiorId || !newName) {
            return player.outputChatBox(`[InteriorID] [Yeni İsim]`);
        }

        const interior = await db.InteriorFix.findByPk(interiorId);

        if (!interior) {
            return player.outputChatBox("Interior bulunamadı.");
        }

        if (player.isAdmin > 7 || interior.ownerId === player.characterId) {
            interior.name = newName;
            await interior.save();

            player.outputChatBox(`Interior ismi başarıyla değiştirildi: ${newName}`);
        } else {
            player.outputChatBox("Bu interior'u değiştirmek için yetkiniz yok.");
        }
    } catch (err) {
        console.error(err);
        player.outputChatBox("Interior ismi değiştirilirken bir hata oluştu.");
    }
});

mp.events.add({
    'interiorbilgileri': async(player) => {
        const currentRoute = await player.callProc('proc:getRoute');
        if (currentRoute == 'property' || currentRoute !== '/') { return; }
        if (player.getVariable('loggedIn')) {
            try {
                const playerDimension = player.dimension;

                const interiors = await db.InteriorFix.findAll({ where: { dimension: playerDimension } });

                if (interiors.length > 0) {
                    console.log('Database Annesinin Data:');
                    console.log(interiors);

                    player.call('requestBrowser', [`appSys.commit('gimmeinterior')`]);
                    player.call('requestRoute', ['property', true, true]);
                    interiors.forEach((interior) => {
                        console.log('ahmet kayanin annesinin data cikti:');
                        console.log(interior);

                        player.call('requestBrowser', [`appSys.commit('ahmetkaya', {
                            id: ${interior.id},
                            sahibi: '${interior.ownerId}',
                            kilidi: ${interior.kilitdurumu},
                            anahtari: '${interior.anahtarId}',
                            tipi: '${interior.interiorType}',
                            adi: '${interior.name}',
                            kiracisi: '${interior.rentStatus}',
                            saticisi: '${interior.saleStatus}',
                            kirafiyatcisi: '${interior.rentPrice}',
                            satisfiyatcisi: '${interior.salePrice}',
                            guncelleyicisi: '${interior.updatedAt}'
                        })`]);
                    });
                }
            } catch (err) {
                console.error(err);
            }
        }
    }
});




