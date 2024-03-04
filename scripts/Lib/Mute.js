import { world, system, Player } from "@minecraft/server";
import { ActionFormData, ModalFormData, MessageFormData } from "@minecraft/server-ui";
import { setTimer, getTime, hasTimerReachedEnd } from "../Extensions/time.js";
import AdminMenu from "../index.js";


export default function MuteMenu(player) {
    new ActionFormData()
        .title('§cMute Menu')
        .body(`§cWelcome Mute Menu: §7${player.name}§c\n What you like to do`)
        .button('§cMute Player')
        .button(`§cUnMute`)
        .button('§cGet Mute')
        .button('§cBack')
        .show(player).then(({ canceled, selection }) => {
            if (canceled) return player.sendMessage('§cYou Have Left The Mute Menu')
            switch (selection) {
                case 0: return MutePlayer(player)
                case 1: return UnMute(player)
                case 2: return GetMute(player)
                default: return AdminMenu(player)
            }
        })
}


/**
 * 
 * @param {Player} player 
 */
function MutePlayer(player) {
    const players = world.getPlayers().filter((p) => p !== player && !Database.entries().filter((v) => v[0].startsWith('Muted:')).map((v) => v[1]).find((v) => v.targetId === p.id || v.target === p.name));
    const times = ['1 Day', '2 Days', '3 Days', '7 Days', '14 Days', '30 Days', '60 Days', 'Forever'];
    new ModalFormData()
        .title('§cMute Player Menu')
        .dropdown('§cLive Player', ['Pick User', ...players.map(p => p.name)])
        .textField('§cOffline Player Name', '')
        .dropdown('§cMute Time', times)
        .textField('§c[Optional] Mute Reason', '')
        .toggle('§cAre you sure you have the rigths to do this?', false)
        .show(player).then(async ({ canceled, formValues: [LivePlayerindex, OfflinePlayerName, MuteTimeIndex, Reason, Confirmed] }) => {
            if (canceled || !Confirmed) return player.sendMessage('§cYou Have Left The Mute Menu')
            const targetName = LivePlayerindex === 0 ? OfflinePlayerName : players[LivePlayerindex - 1].name;
            if (LivePlayerindex === 0 && OfflinePlayerName.length === 0) return player.sendMessage('§cPlease select a player or enter a name');
            const MutedTarget = Database.entries().filter((v) => v[0].startsWith('Muted:')).map((v) => v[1]).find((v) => LivePlayerindex === 0 ? v.target === OfflinePlayerName : v.targetId === players[LivePlayerindex - 1].id)
            if (MutedTarget) return player.sendMessage(`§c${targetName} is already muted`);
            const time = MuteTimeIndex === 7 ? null : setTimer(parseInt(times[MuteTimeIndex].replace(' Days', '')), 'days');
            const reason = Reason.length === 0 ? null : Reason;
            Database.set(`Muted:${targetName}`, {
                target: targetName,
                targetId: LivePlayerindex === 0 ? null : players[LivePlayerindex - 1].id,
                mutedBy: player.name,
                time: time,
                reason: reason
            });
            const formatTime = time === null ? 'Forever' : `${getTime(time).days > 0 ? `${getTime(time).days} Days` : ''} ${getTime(time).hours > 0 ? `${getTime(time).hours} Hours` : ''} ${getTime(time).minutes > 0 ? `${getTime(time).minutes} Minutes` : ''} ${getTime(time).seconds > 0 ? `${getTime(time).seconds} Seconds` : ''}`;
            player.sendMessage(`§cYou Have Muted §6(§r${targetName}§6)§c,\nTime§7: ${formatTime}\n§cReason§7: ${reason ?? 'No Reason Provided'}`);
            const target = world.getPlayers({ name: targetName })[0]
            if (target) target.sendMessage(`§cYou Have Been Muted by §6(§r${player.name}§6)§c,\nTime§7: ${formatTime}\n§cReason§7: ${reason ?? 'No Reason Provided'}`);
        })
}

/**
 * 
 * @param {Player} player 
 */
function UnMute(player) {
    const players = Database.entries().filter((v) => v[0].startsWith('Muted:') && (v[1].time === null || !hasTimerReachedEnd(v[1].time.targetDate))).map((v) => v[1]);
    const form = new ActionFormData()
        .title('§cUnMute Player Menu')
        .body(`§cWelcome UnMute Menu: §7${player.name}§c\n${players.length === 0 ? '§cNo Players Muted' : `§aPlayers Muted - ${players.length}`}`);
    players.map((v, i) => form.button(`${i + 1} - §4${v.target}`))
    form.button('§cBack')
    form.show(player).then(({ canceled, selection }) => {
        if (canceled) return player.sendMessage('§cYou Have Left The UnMute Menu')
        if (selection === players.length) return player.sendMessage('§cYou Have Left The UnMute Menu')
        const target = players[selection]
        const time = target.time === null ? 'Forever' : `${getTime(target.time).days > 0 ? `${getTime(target.time).days} Days` : ''} ${getTime(target.time).hours > 0 ? `${getTime(target.time).hours} Hours` : ''} ${getTime(target.time).minutes > 0 ? `${getTime(target.time).minutes} Minutes` : ''} ${getTime(target.time).seconds > 0 ? `${getTime(target.time).seconds} Seconds` : ''}`;
        new MessageFormData()
            .title('§cUnMute Player')
            .body(`§cAre you sure you want to UnMute - §6(§r${target.target}§6)§c?\n§cTime§7: ${time}\n§cReason§7: ${target.reason ?? 'No Reason Provided'}`)
            .button2('§cYes')
            .button1('§cNo')
            .show(player).then(async ({ canceled, selection }) => {
                if (canceled) return player.sendMessage('§cYou Have Left The UnMute Menu')
                if (selection === 0) return MuteMenu(player)
                Database.delete(`Muted:${target.target}`);
                player.sendMessage(`§aYou Have UnMuted ${target.target}`);
                const targetPlayer = world.getPlayers({ name: target.target })[0]
                if (targetPlayer) targetPlayer.sendMessage(`§aYou Have Been UnMuted by ${player.name}`);
            })
    })
}

/**
 * 
 * @param {Player} player 
 */
function GetMute(player) {
    const players = Database.entries().filter((v) => v[0].startsWith('Muted:') && (v[1].time === null || !hasTimerReachedEnd(v[1].time.targetDate))).map((v) => v[1]);
    const form = new ActionFormData()
        .title('§cGet Mute Menu')
        .body(`§cWelcome Get Mute Menu: §7${player.name}§c\n${players.length === 0 ? '§cNo Players Muted' : `§aPlayers Muted - ${players.length}`}`);
    players.map((v, i) => form.button(`${i + 1} - §4${v.target}`))
    form.button('§cBack')
    form.show(player).then(({ canceled, selection }) => {
        if (canceled) return player.sendMessage('§cYou Have Left The Get Mute Menu')
        if (selection === players.length) return MuteMenu(player)
        const target = players[selection]
        const time = target.time === null ? 'Forever' : `${getTime(target.time).days > 0 ? `${getTime(target.time).days} Days` : ''} ${getTime(target.time).hours > 0 ? `${getTime(target.time).hours} Hours` : ''} ${getTime(target.time).minutes > 0 ? `${getTime(target.time).minutes} Minutes` : ''} ${getTime(target.time).seconds > 0 ? `${getTime(target.time).seconds} Seconds` : ''}`;
        new MessageFormData()
            .title('§cGet Mute Menu')
            .body(`§cMute Info - §7${target.target}
§cUser Id: §7${target.targetId === null ? 'Offline' : target.targetId}
§cTime: §7${time}.
§cReason: §7${target.reason ?? 'No Reason Provided'}
§cMuted By: §7${target.mutedBy}`)
            .button2('§cBack')
            .show(player).then(({ canceled }) => {
                if (canceled) return player.sendMessage('§cYou Have Left The Get Mute Menu')
                return GetMute(player)
            })
    })
}

world.beforeEvents.chatSend.subscribe((data) => {
    const { sender: player } = data;
    const muted = Database.entries().filter((v) => v[0].startsWith('Muted:')).map((v) => v[1]).find((v) => v.targetId === player.id || v.target === player.name)
    if (!muted || hasTimerReachedEnd(muted.time)) return;
    data.cancel = true;
    const time = muted.time === null ? 'Forever' : `${getTime(muted.time).days > 0 ? `${getTime(muted.time).days} Days` : ''} ${getTime(muted.time).hours > 0 ? `${getTime(muted.time).hours} Hours` : ''} ${getTime(muted.time).minutes > 0 ? `${getTime(muted.time).minutes} Minutes` : ''} ${getTime(muted.time).seconds > 0 ? `${getTime(muted.time).seconds} Seconds` : ''}`;
    player.sendMessage(`§cYou Have Been Muted\nFor§7:${time},\n§cReason§7: ${muted.reason ?? 'No Reason Provided'}\n§cMuted By§7: ${muted.mutedBy}`);
})

system.runInterval(() => {
    world.getPlayers().forEach((player) => {
        Database.entries().filter((v) => v[0].startsWith('Muted:')).map((v) => v[1]).forEach(async (v) => {
            if (v.target === player.name || v.targetId === null) Database.set(`Muted:${player.name}`, Object.assign(v, { targetId: player.id }))
            if (v.time !== null && hasTimerReachedEnd(v.time.targetDate)) Database.delete(`Muted:${v.target}`);
        })
    })
})