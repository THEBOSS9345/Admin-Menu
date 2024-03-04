import { world, Player } from "@minecraft/server";
import { ActionFormData } from "@minecraft/server-ui";
import AdminMenu from "../index.js";
/**
 * 
 * @param {Player} player 
 */
export default function Kick(player, rank) {
    const players = world.getPlayers().filter((v) => v !== player)
    const form = new ActionFormData()
        .title('§bKICK MENU')
        .body(`§l§fWelcome To The Kick Menu, \n${players.length === 0 ? '§cNo Players Online' : `§aPlayers Online - ${players.length}`}`);
    players.forEach((v) => form.button(`§l§fKick ${v.name}`, "textures/ui/speed_effect"));
    form.button('§cBack', "textures/ui/cancel")
        .show(player).then(async ({ canceled, selection }) => {
            if (canceled) return player.sendMessage('§cYou Have Left The Kick Menu')
            if (selection === players.length) return AdminMenu(player) 
            const Target = players[selection]
            await player.runCommandAsync(`kick "${Target.name}" §cYou Have Been Kicked By ${player.name} - ${rank[0]}`)
           await player.sendMessage(`§aYou Have Kicked ${Target.name}`)
        })
}