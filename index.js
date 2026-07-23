const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder } = require('discord.js');
const http = require('http');

// Cria um servidor HTTP simples para satisfazer a exigência de porta do Render
const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Bot online!\n');
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});

// Configuração do Bot do Discord
const client = new Client({
    intents: [GatewayIntentBits.Guilds]
});

client.once('ready', async () => {
    console.log(`Bot online como ${client.user.tag}!`);

    const commands = [
        new SlashCommandBuilder()
            .setName('calcular')
            .setDescription('Calcula o valor total de um produto ou receita')
            .addStringOption(option =>
                option.setName('produto')
                    .setDescription('Nome ou descrição do produto')
                    .setRequired(true))
            .addIntegerOption(option =>
                option.setName('quantidade')
                    .setDescription('Quantidade do item')
                    .setRequired(true))
            .addNumberOption(option =>
                option.setName('valor_unitario')
                    .setDescription('Valor unitário do item')
                    .setRequired(true))
    ].map(command => command.toJSON());

    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

    try {
        console.log('Registrando comandos de barra...');
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
        const quantidade = interaction.options.getInteger('quantidade');
        const valorUnitario = interaction.options.getNumber('valor_unitario');

        const total = quantidade * valorUnitario;

        await interaction.reply(`Calculadora:\n- Produto: **${produto}**\n- Quantidade: **${quantidade}**\n- Valor Unitário: **R$ ${valorUnitario.toFixed(2)}**\n- **Total Final: R$ ${total.toFixed(2)}**`);
    }
});

client.login(process.env.DISCORD_TOKEN);
