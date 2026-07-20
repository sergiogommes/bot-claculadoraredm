const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder } = require('discord.js');
const http = require('http');
require('dotenv').config();

// Servidor HTTP simples para o Render não desligar o bot (Keep-Alive)
const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Bot do RedM esta online!\n');
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Servidor web rodando na porta ${PORT}`);
});

// Configuração do cliente do bot
const client = new Client({
    intents: [GatewayIntentBits.Guilds]
});

// Valor fixo pago por cada unidade colhida (ex: 0.15)
const VALOR_POR_UNIDADE = 0.15;

client.once('ready', async () => {
    console.log(`Bot online como ${client.user.tag}!`);

    const commands = [
        new SlashCommandBuilder()
            .setName('colheita')
            .setDescription('Calcula o valor total da sua colheita no RedM.')
            .addIntegerOption(option =>
                option.setName('quantidade')
                    .setDescription('Quantidade de itens que você colheu')
                    .setRequired(true)
            )
    ];

    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

    try {
        console.log('Atualizando comandos de barra do bot...');
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

    if (interaction.commandName === 'colheita') {
        const quantidade = interaction.options.getInteger('quantidade');

        if (quantidade <= 0) {
            return await interaction.reply({ content: 'A quantidade precisa ser maior que zero!', ephemeral: true });
        }

        const total = quantidade * VALOR_POR_UNIDADE;

        await interaction.reply(
            `🌾 **Cálculo de Colheita**\n` +
            `• Quantidade colhida: **${quantidade}** unidades\n` +
            `• Valor unitário: **R$ ${VALOR_POR_UNIDADE.toFixed(2)}**\n` +
            `• Total a receber: **R$ ${total.toFixed(2)}**`
        );
    }
});

client.login(process.env.DISCORD_TOKEN);