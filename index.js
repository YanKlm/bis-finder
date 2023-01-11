module.exports = function bisfinder(mod) {
	mod.game.initialize("inventory");		
	let bis_enable = false;
	let debug_mode = false;

	const batteredOathTokenBIS = [480004, 480104, 480204,480304] //power stats
	const batteredOathIDs = [88958,88959,88960,88961,88962,88963,88964,88965,88966,88967,88968,88969,88970,88971,88972,88973,88974,88975,88976,88977,88978,88979]
	const armor = { //BIS is phys or mag crit for hands, and phys or mag ampl. for body and foot; IDs only include 3-stat Annihilation/DL gear. 
		"mag":{
		  "ID":[89660,89652,89644,89636,89628,89620,89684,89676,89668],
		  "BIS":[5005768, 5006314, 5006860, 5005769, 5006315, 5006861, 5005702, 5006248, 5006794, 5005703, 5006249, 5006795, 5005786, 5006332, 5006878, 5005787, 5006333, 5006879]
		},
		"phys":{
		  "ID":[89648, 89640, 89624, 89616, 89672, 89664, 90878],
		  "BIS":[5005762, 5006308, 5006854, 5005763, 5006309, 5006855, 5005696, 5006242, 5006788, 5005697, 5006243, 5006789, 5005780, 5006326, 5006872, 5005781, 5006327, 5006873]
		}
	  };
	  	
	class Gearlist{
		list = new Set();
		#raidmsg =(msg)=>{
			mod.send("S_CHAT", mod.majorPatchVersion >= 108 ? 4 : 3, {
				"channel": 25,
				"message": msg
			});
		};
		constructor(mod) {
			this.mod = mod;
		}
		ins(item){
			if (!this.list.has(item.dbid)){
			this.list.add(item.dbid)
			this.#raidmsg(`BIS ${item.data.name} found at slot ${item.slot+1} `);
		}}
	 };

	let gears = new Gearlist();
	let tokens = new Gearlist();

	  function filterBisGear(list)  {
		return list.reduce((acc, cur)=>{
			if(armor.mag.ID.includes(cur.id) && cur.passivitySets[0].passivities.filter(passiv=>armor.mag.BIS.includes(passiv)).length==3  ||
			armor.phys.ID.includes(cur.id) && cur.passivitySets[0].passivities.filter(passiv=>armor.phys.BIS.includes(passiv)).length==3) acc.push(cur);
			return acc;
		}, []);
	}

	/*
	function filterBisGear(list){
		let bis = [];
		for (const item of list){
			let passivities = item?.passivitySets[0].passivities;
			if(armor.mag.ID.includes(item.id)){ 
				let match = passivities.filter(passiv=>armor.mag.BIS.includes(passiv)).length;
				if (match==3) bis.push(item);
			}
			if(armor.phys.ID.includes(item.id)){
				let match = passivities.filter(passiv=>armor.phys.BIS.includes(passiv)).length;
				if (match==3) bis.push(item);
			}
		}
		return bis
	}
	*/

	function filterBisOathTokens(list)  {
		return list.filter(el=>batteredOathIDs.includes(el.id)).filter(item=> item.passivitySets[0].passivities.filter(el=> batteredOathTokenBIS.includes(el)).length >=3)
	}    


	mod.command.add("bis", (arg) => {
		if (arg==null) {
		bis_enable = !bis_enable;
		if (!bis_enable) debug_mode = false;
		mod.command.message(`BIS ${bis_enable ? "enabled" : "disabled"}`);
		return;
		};
		if (arg!="debug") {
			mod.command.message("BIS: Unknown argument")
			return;
		};
		bis_enable = true;
		debug_mode= !debug_mode;
		mod.command.message(`BIS debug mode ${bis_enable ? "enabled" : "disabled"}`);
	});

	mod.game.inventory.on('update', () => {
		if(!bis_enable) return;
		let bagItems=mod.game.inventory.bagItems;
		if (typeof(bagItems)!=='object' || bagItems.length<1) return;

		let OathTokens = filterBisOathTokens(bagItems)
		if (OathTokens) OathTokens.forEach(item=> tokens.ins(item));

		let BISGear = filterBisGear(bagItems)
		if (BISGear) BISGear.forEach(item => gears.ins(item));
		
		if (debug_mode){
			bagItems.forEach(item => {
			mod.log(`Slot ${item.slot+1}: ${item.data.name} ID: ${item.id} UniqueID: ${item.dbid} Passivities: ${item.passivitySets[0].passivities}`);
			});  
		}
     })
	
}