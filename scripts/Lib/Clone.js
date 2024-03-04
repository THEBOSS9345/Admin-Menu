import { world } from "@minecraft/server";
import { ModalFormData } from "@minecraft/server-ui";
import { wait } from "../Extensions/wait";

/**
 * 
 * @param {Player} player 
 */
export default async function Clone(player) {
    const players = world.getPlayers().filter((v) => v !== player)
    if (players.length === 0) return player.sendMessage('§cThere Are Certainly Zero Active Players')
    new ModalFormData()
        .title(`§cClone Inventory`)
        .dropdown("§cWelcome To The Clone Inventory Menu\n§7Select A Player To Clone", players.map((v) => v.name))
        .show(player).then(async ({ canceled, formValues: [selplayer] }) => {
            if (canceled) return;
            const findplayer = world.getPlayers({ name: players[selplayer].name })[0]
            if (!findplayer) return player.sendMessage(`§c${players[selplayer].name} is no longer is in game`);
            player.runCommandAsync('clear @s')
            await wait(10)
            const [items, armor] = await clonePlayerStuff(findplayer);
            const playerInv = player.getComponent('inventory').container;
            for (const [item, slot] of items) playerInv.setItem(slot, item)
            const playereq = player.getComponent(`equippable`)
            for (const [item, eq] of armor) playereq.setEquipment(eq, item)
            player.sendMessage('§aYou Have Cloned The Inventory And Armor')
        })
}



/**
 * 
 * @param {Player} player 
 */
function clonePlayerStuff(player) {
    return new Promise((resolve, reject) => {
        const items = []
        const playerInv = player.getComponent('inventory').container;
        for (let i = 0; i < playerInv.size; i++) {
            const item = playerInv.getItem(i)
            if (!item) continue;
            items.push([item, i])
        }
        const armor = []
        const playereq = player.getComponent(`equippable`)
        for (const eq of ['Chest', 'Feet', 'Head', 'Legs', 'Mainhand', 'Offhand']) {
            const item = playereq.getEquipment(eq)
            if (!item) continue
            armor.push([item, eq])
        }
        resolve([items, armor])
    })
}