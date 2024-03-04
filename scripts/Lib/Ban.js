import { world, system, Player, World } from "@minecraft/server";
import { ActionFormData, ModalFormData, MessageFormData } from "@minecraft/server-ui";
import { setTimer, getTime, hasTimerReachedEnd } from "../Extensions/time.js";
import AdminMenu from "../index.js";
/**
 * 
 * @param {Player} player 
 * @param {[string, {}]} role 
 */
export default function BanMenu(player) {
    new ActionFormData()
        .title('§cBan Menu')
        .body(`§cWelcome Ban Menu: §7${player.name}§c\n What you like to do`)
        .button('§cBan Player')
        .button(`§cUnBan`)
        .button('§cGet Ban')
        .button('§cBack')
        .show(player).then(({ canceled, selection }) => {
            if (canceled) return player.sendMessage('§cYou Have Left The Ban Menu')
            switch (selection) {
                case 0: return BanPlayer(player)

                case 1: return UnBan(player)

                case 2: return GetBan(player)

                default: return AdminMenu(player)
            }
        })
}

/**
 * 
 * @param {Player} player 
 */
function BanPlayer(player) {
    const players = world.getPlayers().filter((p) => p !== player);
    const times = ['1 Day', '2 Days', '3 Days', '7 Days', '14 Days', '30 Days', '60 Days', 'Forever'];
    new ModalFormData()
        .title('§cBan Player Menu')
        .dropdown('§cLive Player', ['Pick User', ...players.map(p => p.name)])
        .textField('§cOffline Player Name', '')
        .dropdown('§cBan Time', times)
        .textField('§c[Optional] Ban Reason', '')
        .toggle('§cAre you sure you have the rigths to do this?', false)
        .show(player).then(async ({ canceled, formValues: [LivePlayerindex, OfflinePlayerName, BanTimeIndex, Reason, Confirmed] }) => {
            if (canceled || !Confirmed) return player.sendMessage('§cYou Have Left The Ban Menu')
            const targetName = LivePlayerindex === 0 ? OfflinePlayerName : players[LivePlayerindex - 1].name;
            if (LivePlayerindex === 0 && OfflinePlayerName.length === 0) return player.sendMessage('§cPlease select a player or enter a name');
            const bannedTarget = Database.entries().filter((v) => v[0].startsWith('Banned:')).map((v) => v[1]).find((v) => LivePlayerindex === 0 ? v.target === OfflinePlayerName : v.targetId === players[LivePlayerindex - 1].id)
            if (bannedTarget) return player.sendMessage(`§c${targetName} Is Already Banned`);
            const time = (BanTimeIndex === times.length - 1) ? null : setTimer(parseInt(times[BanTimeIndex].replace(' Days', '')), 'days');
            const reason = Reason.length === 0 ? 'No Reason Provided' : Reason;
            if (Reason.length > 0 && Reason.length < 5) return player.sendMessage('§cPlease provide a reason with at least 5 letters');
            Database.set(`Banned:${targetName}`, {
                target: targetName,
                targetId: LivePlayerindex > 0 ? players[LivePlayerindex - 1].id : null,
                time: time,
                reason: reason,
                banner: player.name
            });

            await world.sendMessage(`§c§7${targetName} Is Banned 
§cUser Id: §7${LivePlayerindex > 0 ? players[LivePlayerindex - 1].id : 'Offline'}
§cTime: §7${time === null ? 'Forever' : `${getTime(time).days}D, ${getTime(time).hours}H, ${getTime(time).minutes}M, ${getTime(time).seconds} Seconds`}
§cReason: §7${reason}`);
        })
}

/**
 * 
 * @param {Player} player 
 */
function UnBan(player) {
    const bannedPlayers = Database.entries().filter((v) => v[0].startsWith('Banned:') && (v[1].time === null || !hasTimerReachedEnd(v[1].time.targetDate))).map((v) => v[1]);
    const form = new ActionFormData()
        .title('§cUnBan Menu')
        .body(`§cWelcome UnBan Menu: §7${player.name}§c\n${bannedPlayers.length === 0 ? '§cNo Players Banned' : `§aPlayers Banned - ${bannedPlayers.length}`}`);
    bannedPlayers.map((b, i) => form.button(`${i + 1} - §4${b.target}`))
    form.button('§cBack')
    form.show(player).then(async ({ canceled, selection }) => {
        if (canceled) return player.sendMessage('§cYou Have Left The UnBan Menu');
        if (selection === bannedPlayers.length) return BanMenu(player);
        const ban = bannedPlayers[selection];
        const time = ban.time === null ? 'Forever' : `${getTime(ban.time).days > 0 ? `${getTime(ban.time).days} Days` : ''} ${getTime(ban.time).hours > 0 ? `${getTime(ban.time).hours} Hours` : ''} ${getTime(ban.time).minutes > 0 ? `${getTime(ban.time).minutes} Minutes` : ''} ${getTime(ban.time).seconds > 0 ? `${getTime(ban.time).seconds} Seconds` : ''}`;
        new MessageFormData()
            .title(`§cUnBan Menu - ${ban.target}`)
            .body(`§cAre you sure you want to unban - §7${ban.target}
§cUser Id: §7${ban.targetId === null ? 'Offline' : ban.targetId}
§cTime: §7${time}.
§cReason: §7${ban.reason}
§cBanner: §7${ban.banner}`)
            .button2('§cYes')
            .button1('§cBack')
            .show(player).then(async ({ canceled, selection }) => {
                if (canceled) return player.sendMessage('§cYou Have Left The UnBan Menu');
                if (selection === 0) return BanMenu(player);
                const bannedTarget = Database.entries().filter((v) => v[0].startsWith('Banned:')).map((v) => v[1]).find((v) => ban.targetId === null ? v.target === ban.target : v.targetId === ban.targetId);
                if (!bannedTarget) return player.sendMessage(`§c${ban.target} Is Not Banned`);
                Database.delete(`Banned:${bannedTarget.target}`);
                await player.sendMessage(`§aYou Have UnBanned ${bannedTarget.target}`);
            })
    })
}


/**
 * 
 * @param {Player} player 
 */
function GetBan(player) {
    const bannedPlayers = Database.entries().filter((v) => v[0].startsWith('Banned:') && !hasTimerReachedEnd(v[1].time.targetDate)).map((v) => v[1]);
    const form = new ActionFormData()
        .title('§cGet Ban Menu')
        .body(`§cWelcome Get Ban Menu: §7${player.name}§c\n${bannedPlayers.length === 0 ? '§cNo Players Banned' : `§aPlayers Banned - ${bannedPlayers.length}`}`);
    bannedPlayers.map((b, i) => form.button(`${i + 1} - §4${b.target}`))
    form.button('§cBack')
    form.show(player).then(async ({ canceled, selection }) => {
        if (canceled) return player.sendMessage('§cYou Have Left The Get Ban Menu');
        if (selection === bannedPlayers.length) return BanMenu(player);
        const ban = bannedPlayers[selection];
        const time = ban.time === null ? 'Forever' : `${getTime(ban.time).days > 0 ? `${getTime(ban.time).days} Days` : ''} ${getTime(ban.time).hours > 0 ? `${getTime(ban.time).hours} Hours` : ''} ${getTime(ban.time).minutes > 0 ? `${getTime(ban.time).minutes} Minutes` : ''} ${getTime(ban.time).seconds > 0 ? `${getTime(ban.time).seconds} Seconds` : ''}`;
        new MessageFormData()
            .title(`§cGet Ban Menu - ${ban.target}`)
            .body(`§cBan Info - §7${ban.target}
§cUser Id: §7${ban.targetId === null ? 'Offline' : ban.targetId}
§cTime: §7${time.replace('', '')}
§cReason: §7${ban.reason}
§cBanner: §7${ban.banner}`)
            .button2('§cBack')
            .button1('§cBack')
            .show(player).then(async ({ canceled }) => {
                if (canceled) return player.sendMessage('§cYou Have Left The Get Ban Menu');
                return BanMenu(player);
            })
    })
}

system.runInterval(() => {
    world.getPlayers().forEach((player) => {
        Database.entries().filter((v) => v[0].startsWith('Banned:')).map((v) => v[1]).forEach(async (v) => {
            if (v.target === player.name && v.targetId === null) Database.set(`Banned:${v.target}`, Object.assign(v, { targetId: player.id }));
            if (v.time !== null && hasTimerReachedEnd(v.time.targetDate)) Database.delete(`Banned:${v.target}`);
            if ((v.targetId !== null && v.targetId === player.id) && v.target === player.name) {
                const time = v.time === null ? 'Forever' : `${getTime(v.time).days > 0 ? `${getTime(v.time).days} Days` : ''} ${getTime(v.time).hours > 0 ? `${getTime(v.time).hours} Hours` : ''} ${getTime(v.time).minutes > 0 ? `${getTime(v.time).minutes} Minutes` : ''} ${getTime(v.time).seconds > 0 ? `${getTime(v.time).seconds} Seconds` : ''}`;
                const reason = v.reason === null ? 'No Reason Provided' : v.reason;
                const banner = v.banner === null ? 'Unknown' : v.banner;
                await player.runCommandAsync(`kick "${player.name}"\n\n§cBanned Info
    §cTime: §7${time}.
    §cReason: §7${reason}
    §cBanner: §7${banner}`);
            }
        })
    })
})