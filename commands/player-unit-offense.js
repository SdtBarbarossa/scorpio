module.exports = async ( client, message ) => {
	
    let embed = {};
	let retMessage = null;

	try {
		
		//Get allycode / discord ID from message
		let { allycode, discordId, rest } = await client.helpers.getId( message );

		/** Get player from swapi cacher */
		let player = allycode ?
			await client.swapi.player(allycode, client.settings.swapi.language) :
			await client.swapi.player(discordId, client.settings.swapi.language);

        let stats = await client.swapi.calcStats( player.allyCode, null, ["includeMods","withModCalc","gameStyle"] );
        
        /** 
		 * REPORT OR PROCEED TO DO STUFF WITH PLAYER OBJECT 
		 * */

        let lim = 25;
		let today = new Date();
		
		embed.title = player.name+' : Top '+lim+' units : Offense';
		embed.description = '`------------------------------`\n';
        
        embed.fields = [];
                
        let offense = [];
        for( let s in stats ) {
            let pu = player.roster.filter(pru => pru.defId === s);
            offense.push({
                unit:pu[0].name,
                physical:{
                    damage:stats[s].stats.final["Physical Damage"],
                    bonus:stats[s].stats.mods["Physical Damage"]
                },
                special:{
                    damage:stats[s].stats.final["Special Damage"],
                    bonus:stats[s].stats.mods["Special Damage"]
                }
            });
        }
        offense.sort((a,b) => (b.physical.damage + b.special.damage) - (a.physical.damage + a.special.damage));

        for( let us of offense ) {
            if( lim === 0 ) break;
            embed.fields.push({
                name:us.unit,
                value:'`'+Math.floor(us.physical.damage)+' (+'+Math.floor(us.physical.bonus)+')` : Physical Damage\n'+'`'+Math.floor(us.special.damage)+' (+'+Math.floor(us.special.bonus)+')` : Special Damage\n' + '`------------------------------`\n',
                inline:true
            });
            --lim;       
        }

		embed.color = 0x936EBB;
		embed.timestamp = today;

		message.channel.send({embed});
		
	} catch(e) {
	    if( e.code === 400 ) {
            if( retMessage ) {
                embed.description += '\n**! There was an error completing this request**';
                retMessage.edit({embed}); 
            }
            message.reply(e.message);
	    } else {
		    throw e;
		}
	}

}
