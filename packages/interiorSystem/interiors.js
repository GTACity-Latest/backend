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

        const interiorFix = await db.InteriorFix.findOne({
            where: {
                ownerId: player.id,
            },
            order: [['createdAt', 'DESC']],
        });

        if (interiorFix) {
            const distance = Math.sqrt(
                Math.pow(interiorFix.x - player.position.x, 2) +
                Math.pow(interiorFix.y - player.position.y, 2) +
                Math.pow(interiorFix.z - player.position.z, 2)
            );

            if (distance <= 3) {
                if (interiorFix.interiorType) {
                    const interior = await db.Interior.findByPk(interiorFix.interiorType);
                    if (interior) {
                        player.dimension = interiorFix.dimension;
                        player.position = new mp.Vector3(interior.x, interior.y, interior.z);
                        return mp.chat.info(player, `Hoşgeldin.`);
                    } else {
                        return;
                    }
                } else {
                    player.dimension = interiorFix.dimension;
                    player.position = new mp.Vector3(interiorFix.x, interiorFix.y, interiorFix.z);
                    return mp.chat.info(player, `Hoşgeldin.}`);
                }
            } else {
                
            }
        } else {
            
        }

        enterCooldownMap.set(player, true);
        setTimeout(() => {
            enterCooldownMap.delete(player);
        }, 1000);
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

        const interiorFix = await db.InteriorFix.findOne({
            where: {
                ownerId: player.id,
            },
            order: [['createdAt', 'DESC']],
        });

        if (interiorFix) {
            const interior = await db.Interior.findByPk(interiorFix.interiorType);

            if (interior) {
                const distance = Math.sqrt(
                    Math.pow(interior.x - player.position.x, 2) +
                    Math.pow(interior.y - player.position.y, 2) +
                    Math.pow(interior.z - player.position.z, 2)
                );

                if (distance <= 3) {
                    player.dimension = 0;
                    player.position = new mp.Vector3(interiorFix.x, interiorFix.y, interiorFix.z);
                    return mp.chat.info(player, `Görüşürüz, kendine iyi bak.`);
                } else {
                    
                }
            } else {
                
            }
        } else {
           
        }

        exitCooldownMap.set(player, true);
        setTimeout(() => {
            exitCooldownMap.delete(player);
        }, 1000);
    } catch (err) {
        return;
    }
});
