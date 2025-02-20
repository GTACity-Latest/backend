class playerClothing {
    constructor() {
        this.player = mp.players.local;
        this.torsoType = 0;
		let attach = true;

        mp.events.add({
            'setPlayer:clothes': (cid, drawable, texture) => {
                mp.events.callRemote('clothingChange:sync', cid, drawable, texture)
                mp.players.local.setComponentVariation(parseInt(cid), parseInt(drawable), parseInt(texture), 0);

            },
			'setPlayer:props': (cid, drawable, texture) => {
				mp.events.callRemote('propsChange:sync', cid, drawable, texture)
                mp.players.local.setPropIndex(parseInt(cid), parseInt(drawable), parseInt(texture), attach);
            },
            'entityStreamIn': (entity) => {
                if(entity.type == 'player') {
                    if(entity.getVariable('modelData')) {
                        mp.events.call('setPlayerFace', entity, entity.getVariable('modelData'))
                    }
                    if(entity.getVariable('clothingData')) {
                        mp.events.call('setPlayerClothes', entity, entity.getVariable('clothingData'))
                    }
					if(entity.getVariable('propsData')) {
                        mp.events.call('setPlayerProps', entity, entity.getVariable('propsData'))
                    }
                }
            },
            'setEntComponents': (entity, cid, draw, texture) => {
                entity.setComponentVariation(parseInt(cid), parseInt(draw), parseInt(texture), 0);
            },
			'setPropThings': (entity, cid, draw, texture) => {
                entity.setPropIndex(parseInt(cid), parseInt(draw), parseInt(texture), attach);
            },
            'reset:clothes': () => {
                if(mp.players.local.getVariable('clothingData')) {
                    mp.events.call('setPlayerClothes', mp.players.local, mp.players.local.getVariable('clothingData'))
                }
                mp.events.callRemote('resetClothes:server')
            },
            'playerBuyClothes:client': (cid, type, texture) => {
                mp.events.callRemote('playerBuyClothes:server', cid, type, texture, this.torsoType)
            },
			'playerBuyProps:client': (cid, type, texture) => {
                mp.events.callRemote('playerBuyProps:server', cid, type, texture)
            },
            'setTorso': (targetEntity, cid, type, texture) => {
                if(targetEntity.type == 'player') {
                    targetEntity.setComponentVariation(parseInt(cid), parseInt(type), parseInt(texture), 0);
                    this.torsoType = type;
                }
            },
            'setPlayerRot': (rotation) => {
                //mp.game.invoke('0x8E2530AA8ADA980E', mp.players.local.handle, rotation); // Rotation Native
                mp.players.local.setHeading(parseInt(rotation));
            },
            'setEntityClothes': (targetEntity, cid, drawable, texture) => {
                if(targetEntity.type == 'player') {
                    if(mp.players.local.getVariable('devdebug')) { mp.gui.chat.push(`${targetEntity.remoteId} ${cid} ${drawable} ${texture}`) }
                    targetEntity.setComponentVariation(parseInt(cid), parseInt(drawable), parseInt(texture), 0);
                }
            },
            'setPlayerClothes': (entity, clothes) => {
                if(mp.players.local.getVariable('devdebug')) {
                    mp.gui.chat.push(`${JSON.stringify(clothes)}`)
                }
                entity.setComponentVariation(1, parseInt(clothes.mask), parseInt(clothes.maskTexture), 0)
                entity.setComponentVariation(3, parseInt(clothes.torso), 0, 0)
                entity.setComponentVariation(4, parseInt(clothes.Leg), parseInt(clothes.LegTexture), 0)
                entity.setComponentVariation(5, parseInt(clothes.bags), 0, 0)
                entity.setComponentVariation(6, parseInt(clothes.shoes), parseInt(clothes.shoesTexture), 0)
                entity.setComponentVariation(7, parseInt(clothes.acess), parseInt(clothes.acessTexture), 0)
                entity.setComponentVariation(8, parseInt(clothes.undershirt), parseInt(clothes.undershirtTexture), 0)
                entity.setComponentVariation(9, parseInt(clothes.armor), 0, 0)
                entity.setComponentVariation(10, parseInt(clothes.decals), parseInt(clothes.decalsTexture), 0)
                entity.setComponentVariation(11, parseInt(clothes.tops), parseInt(clothes.topsTexture), 0)
            },
			'setPlayerProps': (entity, props) => {
                if(mp.players.local.getVariable('devdebug')) {
                    mp.gui.chat.push(`${JSON.stringify(props)}`)
                }
                entity.setPropIndex(0, parseInt(props.hats), parseInt(props.hatsTexture), true)
                entity.setPropIndex(1, parseInt(props.glasses), parseInt(props.glassesTexture), true)
                entity.setPropIndex(2, parseInt(props.ears), parseInt(props.earsTexture), true)
                entity.setPropIndex(6, parseInt(props.watches), parseInt(props.watchesTexture), true)
                entity.setPropIndex(7, parseInt(props.bracelets), parseInt(props.braceletsTexture), true)
            },
            'setTat': (ent, lib, sec) => {
                if(ent.type == 'player') {
                    ent.setDecoration(mp.game.joaat(lib), mp.game.joaat(sec));
                }
            }
        })

        /*
        setInterval(() => {
            mp.players.forEachInStreamRange((ps) => {
                if(ps.getVariable('modelData')) {
                    mp.events.call('setPlayerFace', ps, ps.getVariable('modelData'))
                }
            })
        }, 5000);
        */

        mp.keys.bind(89, false, function () { // Y key
            if(mp.game.ui.isPauseMenuActive()) return;
            let istyping = mp.players.local.isTypingInTextChat;
            let islogged = mp.players.local.getVariable('loggedIn');
            if(istyping) return
            if(islogged && !istyping && mp.players.local.getVariable('inClothingStore')) {
                mp.events.call('requestRoute', 'clothing', true, true);
                return;
            }
        })
    }
}
new playerClothing()