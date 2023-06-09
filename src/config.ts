import { REST } from "@discordjs/rest";
import dotenv from "dotenv";
import { NotionTicket } from "./notionTicket";
import { UserObjectResponse } from "@notionhq/client/build/src/api-endpoints";
import { fetchPeople, fetchSprintList } from "./notion";
import { Client, Events, GatewayIntentBits, Routes } from "discord.js";
import cron from "node-cron";

dotenv.config();
const DISCORD_TOKEN = process.env.DISCORD_TOKEN as string;
const DISCORD_CLIENT_ID = process.env.CLIENT_ID as string;
const DISCORD_SERVER_ID = process.env.SERVER_ID as string;
export const client = new Client({ intents: [GatewayIntentBits.Guilds] });
const commands = [
  {
    name: "notion-ticket",
    description: "create a new notion ticket",
  },
];
export class Config {
  public currentSprints: string[] = [];
  public currentTicketCreationStep = 0;
  public currentTicketAuthor: string | null = null;
  public currentChannel: string | null = null;
  public currentTicket: NotionTicket | null = null;
  public currentPeople: UserObjectResponse[] = [];

  incrementStep() {
    this.currentTicketCreationStep += 1;
  }

  async initPeopleAndSprints() {
    [this.currentSprints, this.currentPeople] = await Promise.all([
      fetchSprintList(),
      fetchPeople(),
    ]);
  }

  initTicket(ticketAuthor: string, channel: string) {
    this.currentTicketAuthor = ticketAuthor;
    this.currentChannel = channel;
    this.currentTicket = new NotionTicket(this.currentTicketAuthor);
  }

  resetTicketCreation() {
    this.currentTicket = null;
    this.currentTicketAuthor = null;
    this.currentTicketCreationStep = 0;
  }
}

export const config = new Config();
const rest = new REST().setToken(DISCORD_TOKEN);
// Prepare and deploy the new command to the discord server
(async () => {
  try {
    console.log(
      `Started refreshing ${commands.length} application (/) commands.`
    );

    // The put method is used to fully refresh all commands in the guild with the current set
    const data: any = await rest.put(
      Routes.applicationGuildCommands(DISCORD_CLIENT_ID, DISCORD_SERVER_ID),
      { body: commands }
    );

    console.log(
      `Successfully reloaded ${data.length} application (/) commands.`
    );
  } catch (error) {
    // And of course, make sure you catch and log any errors!
    console.error(error);
  }
})();

client.once(Events.ClientReady, (c) => {
  console.log(`Ready! Logged in as ${c.user.tag}`);
  config.initPeopleAndSprints();
});

// Log in to Discord with your client's token
client.login(DISCORD_TOKEN);

// cron job to update sprints and people
cron.schedule("30 * * * *", () => {
  console.log("updating people and sprints");
  config.initPeopleAndSprints();
});
