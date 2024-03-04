import { world } from "@minecraft/server";
import { ModalFormData } from "@minecraft/server-ui";

/**
 * 
 * @param {Player} player 
 */
export default function ClearInventory(player) {
    const types = ['Inventory', 'Ender Chest']
    const players = world.getPlayers().filter((v) => v.name !== player.name)
    if (players.length === 0) return player.sendMessage('§cThere Are Certainly Zero Active Players')
    new ModalFormData()
        .title(`§cClear Inventory`)
        .dropdown("§cWelcome To The Clear Inventory Menu\n§7Select A Player To Clear", players.map((v) => v.name))
        .dropdown('§cType', types)
        .show(player).then(async ({ canceled, formValues: [selplayer, type] }) => {
            if (canceled) return;
            const findplayer = world.getPlayers({ name: players[selplayer].name })[0]
            if (!findplayer) return player.sendMessage(`§c${players[selplayer].name} is no longer is in game`);
            if (type === 0) return await findplayer.runCommandAsync('clear @s'), player.sendMessage(`§aYou Have Cleared ${findplayer.name} ${types[type]}`)
            if (type === 1) {
                for (let slot = 0; slot <= 26; slot++) await findplayer.runCommandAsync(`replaceitem entity "${findplayer.name}" slot.enderchest ${slot} air`);
            }
            player.sendMessage(`§aYou Have Cleared ${findplayer.name} ${types[type]}`)
        })
}
