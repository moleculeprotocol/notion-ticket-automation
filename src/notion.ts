import { Client } from "@notionhq/client";
import { PartialBlockObjectResponse } from "@notionhq/client/build/src/api-endpoints";
import { BlockObjectResponse } from "@notionhq/client/build/src/api-endpoints";
import dotenv from "dotenv";
import { NotionTicket } from "./notionTicket";

dotenv.config();

const DB_ID = "797426cd-3842-4680-854a-007392c9e138";

const notion = new Client({ auth: process.env.MOLECULE_NOTION_TOKEN });

const fetchSprintOptions = async (sprintName: string) => {
  const dbResponse = await notion.databases.retrieve({ database_id: DB_ID });

  const sprintOptions =
    //@ts-ignore
    dbResponse.properties["(optional) Sprint"].multi_select.options;

  return sprintOptions.filter(
    (option: { id: string; name: string; color: string }) =>
      sprintName === option.name.toLowerCase() ||
      option.name.toLowerCase() === "backlog"
  );
};

const fetchPeople = async (name: string) => {
  const response = await notion.users.list({ page_size: 50 });
  return response.results.filter(
    (person) => person.name?.toLowerCase() === name.toLowerCase()
  );
};

const fetchChildrenBlocksById = async (id: string) => {
  const response = await notion.blocks.children.list({
    block_id: id,
    page_size: 50,
  });
  const currentSprints = response.results
    .map((result: BlockObjectResponse | PartialBlockObjectResponse) => {
      //@ts-ignore
      if (result.child_page) {
        //@ts-ignore
        return { title: result.child_page.title.toLowerCase(), id: result.id };
      }
    })
    .filter((sprintName) => !!sprintName);
  return currentSprints;
};

export const sprintExistsCheck = async (
  sprintTitle: string
): Promise<{ exists: boolean; sprintId?: string }> => {
  const sprintsList = await fetchChildrenBlocksById(
    "8059c723-7d0d-4673-b6e9-279666b7f4d0"
  );
  const sprintDetails = sprintsList.filter((sprint) =>
    sprint?.title.includes(sprintTitle)
  );
  const sprint = await notion.pages.retrieve({
    page_id: "e80a1504-0578-4543-933c-94c8a48b78a2",
  });
  return sprintDetails.length
    ? { exists: true, sprintId: sprintDetails[0]?.id }
    : { exists: false };
};

export const createNotionPage = async (pageDetails?: NotionTicket | null) => {
  if (pageDetails) {
    const [owner, assignee, currentSprint] = await Promise.all([fetchPeople(pageDetails.owner!), fetchPeople(pageDetails.assignee!), fetchSprintOptions(
      pageDetails.sprintName!
    )]);
    
    const response = await notion.pages.create({
      parent: {
        type: "database_id",
        database_id: DB_ID,
      },
      properties: {
        Name: {
          title: [
            {
              text: {
                content: pageDetails.title!,
              },
            },
          ],
        },
        Status: {
          id: "%3CS%3AD",
          status: {
            id: "273960f7-dc1f-44fb-acfb-f0b260164063",
            name: "Not started",
            color: "gray",
          },
        },
        "(optional) Sprint": {
          id: pageDetails.sprintId,
          multi_select: currentSprint,
        },
        "Owner": {
          id: 'ZR%5Bk',
          people: owner
        },
        Squad: {
          id: 'oQOQ',
          people: assignee
        }
      },
      children: [
        {
          object: "block",
          heading_2: {
            rich_text: [
              {
                text: {
                  content: pageDetails.description!,
                },
              },
            ],
          },
        },
      ],
    });

    //@ts-ignore
    return response.url;
  }
};

const test = async () => {
  const notionTicket = new NotionTicket("author");
  notionTicket.setSprintName('sprint 36');
  notionTicket.setAssignee('nour karoui');
  notionTicket.setOwner('nour karoui');
  notionTicket.setDescription('some description');
  notionTicket.setTitle('hello wotld');
  notionTicket.setSprintId(
    '7e06887b-3855-470e-9822-cb1a0a330eea'
  )
  const result = await createNotionPage(notionTicket);
};