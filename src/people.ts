import { UserObjectResponse } from "@notionhq/client/build/src/api-endpoints";

declare type WgTech =
  | "Jonas"
  | "Dorian Wilhelm"
  | "Johannes Weniger"
  | "Benji Leibowitz"
  | "Stefan Adolf"
  | "María Sanmartín"
  | "Daniel Breyer"
  | "Nour Karoui";

const isWgTech = (str: string): str is WgTech => {
  return (
    str === "Jonas" ||
    str === "Dorian Wilhelm" ||
    str === "Johannes Weniger" ||
    str === "Benji Leibowitz" ||
    str === "Stefan Adolf" ||
    str === "María Sanmartín" ||
    str === "Daniel Breyer" ||
    str === "Nour Karoui"
  );
};

export const peopleOptions = (currentPeople: UserObjectResponse[]) => {
  const uniquePeople = currentPeople?.reduce(
    (
      acc: { label: string; value: string }[],
      currentItem: UserObjectResponse
    ) => {
      const exists = acc.indexOf({
        label: currentItem.name!,
        value: currentItem.name!,
      });
      if (exists === -1 && isWgTech(currentItem.name!)) {
        acc.push({
          label: currentItem.name!,
          value: currentItem.name!,
        });
      }
      return acc;
    },
    [{ label: "test", value: "test" }]
  );
  uniquePeople.shift();
  return uniquePeople;
};
