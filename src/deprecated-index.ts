// import { GatewayDispatchEvents } from "@discordjs/core";
// import { createNotionPage } from "./notion";
// import { peopleOptions } from "./people";
// import { client, config, gateway } from "./config";
// import cron from "node-cron";

// // cron job to update sprints and people
// cron.schedule("30 * * * *", () => {
//   console.log("updating people and sprints");
//   config.initPeopleAndSprints();
// });
// // Listen for events triggered after selecting an item from a menu
// client.on(
//   GatewayDispatchEvents.InteractionCreate,
//   async ({ data: interaction, api }) => {
//     switch (config.currentTicketCreationStep) {
//       case 1:
//         //@ts-ignore
//         config.currentTicket?.setSprintName(interaction.data?.values[0]);
//         config.incrementStep();
//         await api.channels.createMessage(interaction.channel?.id!, {
//           content: "What is the ticket title?",
//         });
//         break;
//       case 4:
//         //@ts-ignore
//         config.currentTicket?.setOwner(interaction?.data?.values[0]);
//         config.incrementStep();
//         await api.channels.createMessage(interaction.channel?.id!, {
//           content: "Who is the assignee?",
//           components: [
//             {
//               type: 1,
//               components: [
//                 {
//                   type: 3,
//                   custom_id: "select_assignee",
//                   options: peopleOptions(config.currentPeople),
//                   placeholder: "Choose an assignee",
//                   min_values: 1,
//                   max_values: 1,
//                 },
//               ],
//             },
//           ],
//         });
//         break;
//       case 5:
//         //@ts-ignore
//         config.currentTicket?.setAssignee(interaction?.data?.values[0]);
//         config.incrementStep();
//         await api.channels.createMessage(interaction.channel?.id!, {
//           content: `Do you confirm these information (yes/no)?\n\t sprint name: ${config.currentTicket?.sprintName}\n\t ticket title: ${config.currentTicket?.title}\n\t ticket description: ${config.currentTicket?.description}\n\t owner: ${config.currentTicket?.owner}\n\t assignee: ${config.currentTicket?.assignee}`,
//         });
//         break;
//     }
//     api.interactions.updateMessage(interaction.id, interaction.token, {
//       //@ts-ignore
//       components: [
//         {
//           type: 1,
//           components: [
//             {
//               type: 3,
//               custom_id: "default value",
//               options: [
//                 {
//                   label: "some label",
//                   value: "some value",
//                 },
//               ],
//               //@ts-ignore
//               placeholder: interaction?.data?.values[0],
//               min_values: 1,
//               max_values: 1,
//             },
//           ],
//         },
//       ],
//     });
//   }
// );
// // Listen for input events
// client.on(
//   GatewayDispatchEvents.MessageCreate,
//   async ({ data: interaction, api }) => {
//     if (!interaction.author.bot) {
//       if (
//         config.currentTicketAuthor &&
//         interaction.author.username !== config.currentTicketAuthor
//       ) {
//         await api.channels.createMessage(interaction.channel_id, {
//           content:
//             "Another user is already creating a ticket, please stay in queue !",
//         });
//       } else {
//         if (
//           interaction.content === "EXIT" &&
//           interaction.author.username === config.currentTicketAuthor
//         ) {
//           config.resetTicketCreation();
//         }
//         switch (config.currentTicketCreationStep) {
//           case 0:
//             if (interaction.content === "TICKET") {
//               console.log(
//                 `starting to create a new ticket with the author: ${interaction.author.username}`
//               );
//               await api.channels.createMessage(interaction.channel_id, {
//                 content: "What is the sprint name?",
//                 components: [
//                   {
//                     type: 1,
//                     components: [
//                       {
//                         type: 3,
//                         custom_id: "class_select_1",
//                         options: config.currentSprints
//                           .slice(-25)
//                           .map((title) => {
//                             return {
//                               label: title,
//                               value: title,
//                             };
//                           }),
//                         placeholder: "Choose a sprint",
//                         min_values: 1,
//                         max_values: 1,
//                       },
//                     ],
//                   },
//                 ],
//               });
//               config.incrementStep();
//               config.initTicket(interaction.author.username);
//             } else {
//               await api.channels.createMessage(interaction.channel_id, {
//                 content: 'Type "TICKET" to start ticket creation process',
//               });
//             }
//             break;
//           case 2:
//             config.currentTicket?.setTitle(interaction.content);
//             config.incrementStep();
//             await api.channels.createMessage(interaction.channel_id, {
//               content: "What is the ticket description?",
//             });
//             break;
//           case 3:
//             config.currentTicket?.setDescription(interaction.content);
//             config.incrementStep();
//             await api.channels.createMessage(interaction.channel_id, {
//               content: "Who is the owner?",
//               components: [
//                 {
//                   type: 1,
//                   components: [
//                     {
//                       type: 3,
//                       custom_id: "owner_select_option",
//                       options: peopleOptions(config.currentPeople),
//                       placeholder: "Choose a person",
//                       min_values: 1,
//                       max_values: 1,
//                     },
//                   ],
//                 },
//               ],
//             });
//             break;
//           case 6:
//             if (interaction.content.toLowerCase() === "yes") {
//               console.log("ticket created");
//               const url = await createNotionPage(config.currentTicket);
//               await api.channels.createMessage(interaction.channel_id, {
//                 content: `new ticket created go check it, ${url}`,
//               });
//             }
//             config.resetTicketCreation();
//             await api.channels.createMessage(interaction.channel_id, {
//               content: 'Type "TICKET" to start ticket creation process',
//             });
//             break;
//           default:
//             await api.channels.createMessage(interaction.channel_id, {
//               content: 'Ticket creation in process, type "EXIT" to restart',
//             });
//         }
//       }
//     }
//   }
// );

// // Listen for the ready event
// client.once(GatewayDispatchEvents.Ready, () => {
//   console.log("Ready!");
//   config.initPeopleAndSprints();
// });

// // Start the WebSocket connection.
// gateway.connect();
