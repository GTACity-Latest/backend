ignoreWeapons = {
	911657153: "Stun Gun",
},
damageWeapons = {
	3249783761: { // weaponHash
		max: 90,
		min: 85
	},
},
damageWeaponGroups = {
	2685387236: {	// weaponGroupHash
		name: "melee",
		max: 80,
		min: 40
	},
	416676503: {
		name: "handguns",
		max: 6,
		min: 6
	},
	3337201093: {
		name: "submachine gun",
		max: 10,
		min: 5
	},
	860033945: {
		name: "shotgun",
		max: 80,
		min: 40
	},
	970310034: {
		name: "Assault Rifle",
		max: 80,
		min: 40
	},
	1159398588: {
		name: "Light Machine Gun",
		max: 80,
		min: 40
	},
	3082541095: {
		name: "Sniper",
		max: 80,
		min: 40
	},
	2725924767: {
		name: "Heavy Weapon",
		max: 80,
		min: 40
	},
	1548507267: {
		name: "Throwables",
		max: 80,
		min: 40
	},
	4257178988: {
		name: "Misc",
		max: 80,
		min: 40
	}
}
const defaultPercent = {
	max: 85,
	min: 60
}

const randomInt = (min, max) => Math.random() * (max - min) + min;

mp.events.add("incomingDamage", (sourceEntity, sourcePlayer, targetEntity, weapon, boneIndex, damage) => {
	if (targetEntity.type === "player" && sourcePlayer && !(weapon in ignoreWeapons)) {
		if (targetEntity.getVariable('adminDuty'))  {
			return true;
		}

		let max = defaultPercent.max;
		let min = defaultPercent.max;

		const weaponGroupHash = mp.game.weapon.getWeapontypeGroup(weapon);
		if (weapon in damageWeapons) {
			max = damageWeapons[weapon].max;
			min = damageWeapons[weapon].min;
		}
		else if (weaponGroupHash in damageWeaponGroups) {
			max = damageWeaponGroups[weaponGroupHash].max;
			min = damageWeaponGroups[weaponGroupHash].min;
		}

		const percent = randomInt(min, max) / 100;
		let customDamage = damage - (damage * percent);

		if (boneIndex === 20) {
			customDamage /= 10;
		}

		targetEntity.applyDamageTo(parseInt(customDamage), true);

		const currentHealth = targetEntity.getHealth();
		if (currentHealth > 0) {
			return true;
		}
	}
})