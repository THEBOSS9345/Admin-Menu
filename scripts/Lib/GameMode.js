import { ActionFormData } from "@minecraft/server-ui";
import AdminMenu from "../index.js";
/**
 * 
 * @param {Player} player 
 */
export default function PlayerGamemode(player) {
    const gamemodes = ['Creative', 'Survival', 'Spectator', 'Adventure']
   const form =  new ActionFormData()
        .title('§cGAMEMODES')
        gamemodes.map((v) => form.button(`§4${v}`))
       form.button('§cBack')
        .show(player).then(({ canceled, selection }) => {
            if (canceled) return;
            const gamemode = gamemodes[selection]
            if (!gamemode) return AdminMenu(player)
            player.runCommandAsync(`gamemode ${gamemode}`)
            player.sendMessage(`§aYour Gamemode is changed to ${gamemode}`)
        })
}