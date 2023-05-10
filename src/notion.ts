import { Client } from "@notionhq/client";
import {
  PartialBlockObjectResponse,
  UserObjectResponse,
} from "@notionhq/client/build/src/api-endpoints";
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
      sprintName.split(" ").slice(0, 2).join(" ").toLowerCase() ===
        option.name.toLowerCase() || option.name.toLowerCase() === "backlog"
  );
};

export const fetchPeople = async (): Promise<UserObjectResponse[]> => {
  return (await notion.users.list({ page_size: 50 })).results;
};

const fetchPerson = async (name: string) => {
  const response = await fetchPeople();
  return response.filter(
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

export const fetchSprintList = async (): Promise<string[]> => {
  return (
    await fetchChildrenBlocksById("8059c723-7d0d-4673-b6e9-279666b7f4d0")
  ).map((sprint) => sprint?.title);
};

export const sprintExistsCheck = async (
  sprintTitle: string
): Promise<{ exists: boolean; sprintId?: string }> => {
  const sprintsList = await fetchSprintList();
  const sprintDetails = sprintsList.filter((title) =>
    title?.includes(sprintTitle.toLowerCase())
  );
  return sprintDetails.length ? { exists: true } : { exists: false };
};

export const createNotionPage = async (pageDetails?: NotionTicket | null) => {
  if (pageDetails) {
    const [owner, assignee, currentSprint] = await Promise.all([
      fetchPerson(pageDetails.owner!),
      fetchPerson(pageDetails.assignee!),
      fetchSprintOptions(pageDetails.sprintName!),
    ]);

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
          id: "7e06887b-3855-470e-9822-cb1a0a330eea",
          multi_select: currentSprint,
        },
        Owner: {
          id: "ZR%5Bk",
          people: owner,
        },
        Squad: {
          id: "oQOQ",
          people: assignee,
        },
        "Working Group(s)": {
          id: "ay%7Bk",
          multi_select: [
            {
              id: "dd3ff22c-02eb-47aa-b2b7-212691929850",
              name: "Product",
              color: "orange",
            },
          ],
        },
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
  // const result = await notion.pages.retrieve({page_id: '8d5f20cb-54fb-4b20-a3cc-12df0a652af2'})
  const result = await fetchPeople();
  console.log(result);
};
