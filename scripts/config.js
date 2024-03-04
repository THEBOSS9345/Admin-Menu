/**
 * Configuration object for the Admin Menu.
 * @typedef {Object} Config
 * @property {Object} AdminTags - Defines the roles and their corresponding permissions.
 * @property {Object} AdminTags.Owner - Defines the permissions for the Owner role.
 * @property {boolean} AdminTags.Owner.Ban - Specifies if the Owner role can ban users.
 * @property {boolean} AdminTags.Owner.Kick - Specifies if the Owner role can kick users.
 * @property {boolean} AdminTags.Owner.Mute - Specifies if the Owner role can mute users.
 * @property {boolean} AdminTags.Owner.CloneInventory - Specifies if the Owner role can clone inventories.
 * @property {boolean} AdminTags.Owner.Clears - Specifies if the Owner role can perform clears.
 * @property {boolean} AdminTags.Owner.Gamemodes - Specifies if the Owner role can change gamemodes.
 * @property {Object} AdminTags.Admin - Defines the permissions for the Admin role.
 * @property {boolean} AdminTags.Admin.Ban - Specifies if the Admin role can ban users.
 * @property {string} ItemId - Specifies the ID of the item.
 * @property {Object} AdminMenu - Defines the options for the Admin Menu.
 * @property {Array<Array<string>>} AdminMenu.Options - Specifies the options for the Admin Menu.
 * Each option is represented as an array with three elements: [label, description, icon].
 */
export default {
    AdminTags: { // Define the roles and their corresponding permissions
        Owner: { // Define the permissions for the Owner role
            Ban: true, 
            Kick: true,
            Mute: true,
            CloneInventory: true,
            Clears: true,
            Gamemodes: true, 
        },
        Admin: { // Define the permissions for the Admin role
            Ban: true,
        }
    },
    ItemId: 'minecraft:diamond', // Specify the ID of the item
    AdminMenu: {
        Options: [
            ['Ban', '§l§fBan Menu', 'textures/ui/anvil_icon'],
            ['Kick', '§l§fKick Player', 'textures/ui/speed_effect'],
            ['Mute', '§l§fMute menu', 'textures/items/map_filled'],
            ['CloneInventory', '§l§fClone Inventory', 'textures/items/brush'],
            ['Clears', '§l§fClears', 'textures/blocks/barrier'],
            ['Gamemodes', '§l§fGamemodes', 'textures/ui/absorption_heart']
        ]
    }
}