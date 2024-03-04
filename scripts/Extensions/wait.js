import { system } from '@minecraft/server';

export function wait(time) {
    return new Promise((resolve) => {
        const waitTimeout = system.runTimeout(() => {
            system.clearRun(waitTimeout);
            resolve();
        }, time);
    });
}