import { REST } from "@discordjs/rest";
import { WebSocketManager } from "@discordjs/ws";
import { GatewayIntentBits, Client } from "@discordjs/core";
import dotenv from "dotenv";
import { NotionTicket } from "./notionTicket";
import { UserObjectResponse } from "@notionhq/client/build/src/api-endpoints";
import { fetchPeople, fetchSprintList } from "./notion";

dotenv.config();
const token = process.env.DISCORD_TOKEN!;
const rest = new REST({ version: "10" }).setToken(token);

export class Config {
  public currentSprints: string[] = [];
  public currentTicketCreationStep = 0;
  public currentTicketAuthor: string | null = null;
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

  initTicket(ticketAuthor: string) {
    this.currentTicketAuthor = ticketAuthor;
    this.currentTicket = new NotionTicket(this.currentTicketAuthor);
  }

  resetTicketCreation() {
    this.currentTicket = null;
    this.currentTicketAuthor = null;
    this.currentTicketCreationStep = 0;
  }
}

export const gateway = new WebSocketManager({
  token,
  intents: GatewayIntentBits.GuildMessages | GatewayIntentBits.MessageContent,
  rest,
});

export const client = new Client({ rest, ws: gateway });

export const config = new Config();