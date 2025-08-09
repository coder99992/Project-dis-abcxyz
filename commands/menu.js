const { SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("menu")
        .setDescription("Hiển thị danh sách các lệnh có sẵn"),
    async execute(interaction) {
        const commandFiles = fs.readdirSync(path.join(__dirname, "."))
            .filter(file => file.endsWith(".js") && file !== "menu.js");

        const options = commandFiles.map(file => {
            const commandName = file.replace(".js", "");
            return { label: commandName, value: commandName };
        });

        if (options.length === 0) {
            await interaction.reply({ content: "Không có lệnh nào để hiển thị.", ephemeral: true });
            return;
        }

        const menu = new StringSelectMenuBuilder()
            .setCustomId("command_menu")
            .setPlaceholder("Chọn một lệnh...")
            .addOptions(options);

        const row = new ActionRowBuilder().addComponents(menu);
        await interaction.reply({ content: "📋 Danh sách các lệnh:", components: [row] });
    },
};


