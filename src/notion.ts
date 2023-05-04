import { Client } from "@notionhq/client";
import { PartialBlockObjectResponse } from "@notionhq/client/build/src/api-endpoints";
import { BlockObjectResponse } from "@notionhq/client/build/src/api-endpoints";
import dotenv from "dotenv";
import { NotionTicket } from "./notionTicket";

dotenv.config();
const notion = new Client({ auth: process.env.NOTION_TOKEN });
const fetchPageBlocksById = async (id: string) => {
  const response = await notion.blocks.children.list({
    block_id: id,
    page_size: 50,
  });
  const currentSprints = response.results
    .map((result: BlockObjectResponse | PartialBlockObjectResponse) => {
      // TO DO: fix this ts-ignore
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
  const sprintsList = await fetchPageBlocksById(
    "d4aad8ee-d60c-4a15-8a6a-a161d6362e59"
  );
  const sprintDetails = sprintsList.filter(
    (sprint) => sprint?.title === sprintTitle
  );
  return sprintDetails.length
    ? { exists: true, sprintId: sprintDetails[0]?.id }
    : { exists: false };
};

export const createNotionPage = async (pageDetails?: NotionTicket | null) => {
  if (pageDetails) {
    const parentPageId = pageDetails.sprintId || "";

    // The title of the subpage
    const subpageTitle = pageDetails.title;

    // The content of the subpage
    const subpageContent = {
      title: [
        {
          text: {
            content: subpageTitle || "",
          },
        },
      ]
    };

    // Create the subpage
    const { id: subpageId } = await notion.pages.create({
      parent: { page_id: parentPageId},
      properties: subpageContent,
      children: [],
    });
    await notion.blocks.children.append({
      block_id: subpageId,
      children: [
        {
          "paragraph": {
            "rich_text": [
              {
                "text": {
                  "content": pageDetails.description || '',
                }
              }
            ]
          }
        }
      ],
    });
    await notion.pages.update({
      page_id: subpageId,
      properties: {
        'In stock': {
          checkbox: true,
        },
      },
    });
    return subpageId;
  }
};

// sprints page id in Molecule Notion
// fetchPageById("f5a5f95a-ea20-4c4d-b5fe-0ed0f205cb4a");

const test = async () => {
  const result = await sprintExistsCheck("sprint 36".toLowerCase());
  console.log(result);
};

test();
