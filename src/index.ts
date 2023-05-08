import { REST } from "@discordjs/rest";
import { WebSocketManager } from "@discordjs/ws";
import {
  GatewayDispatchEvents,
  GatewayIntentBits,
  Client,
} from "@discordjs/core";
import dotenv from "dotenv";
import { NotionTicket } from "./notionTicket";
import { createNotionPage, sprintExistsCheck } from "./notion";

dotenv.config();
const token = process.env.DISCORD_TOKEN;
const rest = new REST({ version: "10" }).setToken(token!);
let currentTicketAuthor: string | null = null;
let currentTicketCreationStep = 0;
let currentTicket: NotionTicket | null = null;

const resetTicketCreation = () => {
  currentTicket = null;
  currentTicketAuthor = null;
  currentTicketCreationStep = 0;
};
const gateway = new WebSocketManager({
  token: token || "",
  intents: GatewayIntentBits.GuildMessages | GatewayIntentBits.MessageContent,
  rest,
});

// Create a client to emit relevant events.
const client = new Client({ rest, ws: gateway });

client.on(
  GatewayDispatchEvents.MessageCreate,
  async ({ data: interaction, api }) => {
    if (!interaction.author.bot) {
      if(currentTicketAuthor && interaction.author.username !== currentTicketAuthor) {
        await api.channels.createMessage(interaction.channel_id, {
          content: "Another user is already creating a ticket, please stay in queue !",
        });
      } else {
        if (
          interaction.content === "EXIT" &&
          interaction.author.username === currentTicketAuthor
        ) {
          resetTicketCreation();
        }
        switch (currentTicketCreationStep) {
          case 0:
            if (interaction.content === "TICKET") {
              console.log(
                `starting to create a new ticket with the author: ${interaction.author.username}`
              );
              await api.channels.createMessage(interaction.channel_id, {
                content: "What is the sprint name?",
              });
              currentTicketCreationStep += 1;
              currentTicketAuthor = interaction.author.username;
              currentTicket = new NotionTicket(currentTicketAuthor);
            } else {
              await api.channels.createMessage(interaction.channel_id, {
                content: 'Type "TICKET" to start ticket creation process',
              });
            }
            break;
          case 1:
            const sprintExists = await sprintExistsCheck(interaction.content);
            if (sprintExists.exists) {
              currentTicket?.setSprintName(interaction.content);
              currentTicket?.setSprintId(sprintExists.sprintId!);
              currentTicketCreationStep += 1;
              await api.channels.createMessage(interaction.channel_id, {
                content: "What is the ticket title?",
              });
            } else {
              await api.channels.createMessage(interaction.channel_id, {
                content: "Sprint Not Found, What is the sprint name?",
              });
            }
            break;
          case 2:
            currentTicket?.setTitle(interaction.content);
            currentTicketCreationStep += 1;
            await api.channels.createMessage(interaction.channel_id, {
              content: "What is the ticket description?",
            });
            break;
          case 3:
            currentTicket?.setDescription(interaction.content);
            currentTicketCreationStep += 1;
            await api.channels.createMessage(interaction.channel_id, {
              content: "Who is the owner?",
            });
            break;
          case 4:
            currentTicket?.setOwner(interaction.content);
            currentTicketCreationStep += 1;
            await api.channels.createMessage(interaction.channel_id, {
              content: "Who is the assignee?",
            });
            break;
          case 5:
            currentTicket?.setAssignee(interaction.content);
            currentTicketCreationStep += 1;
            await api.channels.createMessage(interaction.channel_id, {
              content: `Do you confirm these information (yes/no)?\n\t sprint name: ${currentTicket?.sprintName}\n\t ticket title: ${currentTicket?.title}\n\t ticket description: ${currentTicket?.description}\n\t owner: ${currentTicket?.owner}\n\t assignee: ${currentTicket?.assignee}`,
            });
            break;
          case 6:
            if (interaction.content.toLowerCase() === "yes") {
              console.log("ticket created");
              const url = await createNotionPage(currentTicket);
              await api.channels.createMessage(interaction.channel_id, {
                content: `new ticket created go check it, ${url}`,
              });
            }
            resetTicketCreation();
            await api.channels.createMessage(interaction.channel_id, {
              content: 'Type "TICKET" to start ticket creation process',
            });
            break;
          default:
            await api.channels.createMessage(interaction.channel_id, {
              content: 'Ticket creation in process, type "EXIT" to restart',
            });
        }
      }
      
    }
  }
);

// Listen for the ready event
client.once(GatewayDispatchEvents.Ready, () => console.log("Ready!"));

// Start the WebSocket connection.
gateway.connect();
