/**
 * @name ImageEmotes
 * @author Insanity#6867
 * @description Replaces unusable emotes with images of the emote
 * @version 0.1.1
 */

module.exports = class ImageEmotes {
    load() {
		this.dispatcher = BdApi.findModuleByProps("dispatch")
		this.guildManager = BdApi.findModuleByProps("getGuilds")
		this.q = BdApi.findModuleByProps("enqueue")
		this.currentGuild = BdApi.findModuleByProps("getLastSelectedGuildId")
		
		this.emojis = this.getEmojis()
	} // Optional function. Called when the plugin is loaded in to memory

    start() {
		
		this.unQ = BdApi.monkeyPatch(this.q, "enqueue", {instead: data => {
			let msg = data.methodArguments[0].message.content
			
			if (/<:\S{0,32}:\d{18}>$/g.test(msg)) {
				
				let id = msg.slice(msg.lastIndexOf(":")+1, msg.length-1)
				let guildId = this.currentGuild.getGuildId()
				console.log(guildId)
				
				if ( guildId == null || !this.emojis[guildId].includes(id) ) {
					msg = msg.replace(msg.match(/<:\S{0,32}:\d{18}>$/g)[0], `https://cdn.discordapp.com/emojis/${id}.png?size=64`)
				}
				
			} else if (/<a:\S{0,32}:\d{18}>$/g.test(msg)) {
				
				let id = msg.slice(msg.lastIndexOf(":")+1, msg.length-1)
				msg = msg.replace(msg.match(/<a:\S{0,32}:\d{18}>$/g)[0], `https://cdn.discordapp.com/emojis/${id}.gif?size=64`)
				
			}
			
			data.methodArguments[0].message.content = msg
			data.originalMethod.apply(data.thisObject, data.methodArguments)
		}})
		
		var emojiManager = BdApi.findModuleByProps("isEmojiDisabled")
		this.unDisable = BdApi.monkeyPatch(emojiManager, "isEmojiDisabled", {instead : () => {return false}})
		
	} // Required function. Called when the plugin is activated (including after reloads)
	
    stop() {
		this.unQ()
		this.unDisable()
	} // Required function. Called when the plugin is deactivated

    observer(changes) {} // Optional function. Observer for the `document`. Better documentation than I can provide is found here: <https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver>
	
	onSwitch() {
	}
	
	getEmojis() {
		let emoji = BdApi.findModuleByProps("getDisambiguatedEmojiContext").getDisambiguatedEmojiContext().getGroupedCustomEmoji()
		let emojis = {}
		
		Object.keys(emoji).forEach(g => {
			let gemojis = []
			
			emoji[g].forEach(e => {
				gemojis.push(e.id)
			})
			
			emojis[g] = gemojis
		})
		
		return emojis
	}
}