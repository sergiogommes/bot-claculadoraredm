const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder } = require('discord.js');
const http = require('http');
require('dotenv').config();

const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Bot online!\n');
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});

const client = new Client({
    intents: [GatewayIntentBits.Guilds]
});

client.once('ready', async () => {
    console.log(`Bot online como ${client.user.tag}!`);

    const commands = [
        new SlashCommandBuilder()
            .setName('calcular')
            .setDescription('Calcula o valor total de um produto ou colheita.')
            .addStringOption(option =>
                option.setName('produto')
                    .setDescription('Nome ou descrição do produto')
                    .setRequired(true))
            .addStringOption(option =>
                option.setName('quantidade')
                    .setDescription('Quantidade ou soma (ex: 1+1+10)')
                    .setRequired(true))
            .addNumberOption(option =>
                option.setName('valor_unitario')
                    .setDescription('O valor de cada unidade')
                    .setRequired(true))
    ];

    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

    try {
        await rest.put(
            Routes.applicationCommands(client.user.id),
            { body: commands },
        );
        console.log('Comandos registrados com sucesso!');
    } catch (error) {
        console.error(error);
    }
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === 'calcular') {
        const produto = interaction.options.getString('produto');
        const qtdTexto = interaction.options.getString('quantidade');
        const valor_unitario = interaction.options.getNumber('valor_unitario');

        let quantidade = 0;
        try {
            const partes = qtdTexto.split('+').map(num => parseFloat(num.trim()));
            if (partes.some(isNaN)) throw new Error();
            quantidade = partes.reduce((soma, atual) => soma + atual, 0);
        } catch (e) {
            return await interaction.reply({ content: 'Use apenas números somados com mais (ex: 1+1+10).', ephemeral: true });
        }

        if (isNaN(quantidade) || quantidade <= 0 || valor_unitario <= 0) {
            return await interaction.reply({ content: 'A quantidade e o valor unitário precisam ser maiores que zero!', ephemeral: true });
        }

        const total = quantidade * valor_unitario;

        await interaction.reply(
            `📊 **Cálculo de Venda**\n` +
            `• Produto: **${produto}**\n` +
            `• Quantidade: **${quantidade}** (${qtdTexto})\n` +
            `• Valor unitário: **R$ ${valor_unitario.toFixed(2)}**\n` +
            `• Total a receber: **R$ ${total.toFixed(2)}**`
        );
    }
});

client.login(process.env.DISCORD_TOKEN);
