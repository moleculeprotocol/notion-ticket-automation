import { Events } from "discord.js";
import dotenv from "dotenv";
import { client, config } from "./config";
import { peopleOptions } from "./people";
import { createNotionPage } from "./notion";

dotenv.config();

client.on(Events.InteractionCreate, async (interaction) => {
  if (interaction.isStringSelectMenu()) {
    switch (interaction.customId.toLowerCase()) {
      case "sprint":
        config.currentTicket?.setSprintName(interaction.values[0]);
        config.incrementStep();
        await interaction.reply({
          content: "What is the sprint title?",
        });
        break;
      case "owner":
        config.currentTicket?.setOwner(interaction?.values[0]);
        config.incrementStep();
        await interaction.reply({
          content: "Who is the assignee?",
          components: [
            {
              type: 1,
              components: [
                {
                  type: 3,
                  custom_id: "assignee",
                  options: peopleOptions(config.currentPeople),
                  placeholder: "Choose an assignee",
                  min_values: 1,
                  max_values: 1,
                },
              ],
            },
          ],
        });
        break;
      case "assignee":
        config.currentTicket?.setAssignee(interaction?.values[0]);
        config.incrementStep();
        await interaction.reply({
          content: `Do you confirm these information (yes/no)?\n\t sprint name: ${config.currentTicket?.sprintName}\n\t ticket title: ${config.currentTicket?.title}\n\t ticket description: ${config.currentTicket?.description}\n\t owner: ${config.currentTicket?.owner}\n\t assignee: ${config.currentTicket?.assignee}`,
        });
        break;
    }
  }

  if (interaction.isChatInputCommand()) {
    if (interaction.commandName === "notion-ticket") {
      config.initTicket(interaction.user.username, interaction.channelId);
      await interaction.reply({
        content: "What is the sprint name?",
        components: [
          {
            type: 1,
            components: [
              {
                type: 3,
                custom_id: "sprint",
                options: config.currentSprints.slice(-25).map((title) => {
                  return {
                    label: title,
                    value: title,
                  };
                }),
                placeholder: "Choose a sprint",
                min_values: 1,
                max_values: 1,
              },
            ],
          },
        ],
        ephemeral: true,
      });
    }
  }
});

client.on(Events.MessageCreate, async (interaction) => {
  if (
    interaction.author.username === config.currentTicketAuthor &&
    interaction.channelId === config.currentChannel
  ) {
    if (!config.currentTicket?.title) {
      config.currentTicket?.setTitle(interaction.content);
      await interaction.reply({
        content: "What is the ticket description?",
      });
    } else if (!config.currentTicket?.description) {
      config.currentTicket?.setDescription(interaction.content);
      await interaction.reply({
        content: "Who is the owner?",
        components: [
          {
            type: 1,
            components: [
              {
                type: 3,
                custom_id: "owner",
                options: peopleOptions(config.currentPeople),
                placeholder: "Choose a person",
                min_values: 1,
                max_values: 1,
              },
            ],
          },
        ],
      });
    } else {
      if (interaction.content.toLowerCase() === "yes") {
        console.log("ticket created");
        const url = await createNotionPage(config.currentTicket);
        await interaction.reply({
          content: `new ticket created go check it, ${url}`,
        });
      }
      config.resetTicketCreation();
    }
  }
});
