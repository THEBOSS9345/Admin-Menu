import { world, system, Player } from "@minecraft/server";
import { ActionFormData } from "@minecraft/server-ui";
import Database from "./Database.js";
import Kick from "./Lib/Kick.js";
import BanMenu from "./Lib/Ban.js";
import Clone from "./Lib/Clone.js";
import ClearInventory from "./Lib/Clear.js";
import PlayerGamemode from "./Lib/GameMode.js";
import MuteMenu from "./Lib/Mute.js";
import config from "./config";

world.afterEvents.itemUse.subscribe(({ itemStack: item, source: player }) => {
    if (player instanceof Player && item.typeId === config.ItemId && Object.keys(config.AdminTags).some((v) => player.hasTag(v))) return AdminMenu(player)
})

/**
 * 
 * @param {Player} player 
 */
export default function AdminMenu(player) {
    const findRole = Object.entries(config.AdminTags).find((v) => player.hasTag(v[0]))
    if (!findRole) return player.sendMessage('§cYou Do Not Have Permission To Use This Item')
    findRole.sort((a, b) => a[1] - b[1]);
    const buttons = config.AdminMenu.Options.filter((v) => config.AdminTags[findRole[0]][v[0]])
    const form = new ActionFormData()
        .title('§bADMIN MENU')
        .body(`§l§fWelcome To The Admin Menu, ${player.name} - ${findRole[0]}`);
    buttons.map((v) => form.button(v[1], v[2])) // Add Buttons
    form.button('§cExit', "textures/ui/cancel") // Exit Button
    form.show(player).then(({ canceled, selection }) => {
        if (canceled) return player.sendMessage('§cYou Have Left The Admin Menu')
        if (selection === buttons.length) return player.sendMessage('§cYou Have Left The Admin Menu')
        switch (buttons[selection][0]) {
            case 'Ban':
                BanMenu(player, findRole)
                break;
            case 'Kick':
                Kick(player, findRole)
                break;
            case 'Mute':
                MuteMenu(player)
                break;
            case 'CloneInventory':
                Clone(player)
                break;
            case 'Clears':
                ClearInventory(player)
                break;
            case 'Gamemodes':
               PlayerGamemode(player)
                break;
            default: player.sendMessage('§cYou Have Left The Admin Menu'); break;
        }
    })
}


console.warn('Admin Menu Is Loaded Created By (the_boss9345)')