import data from "./data/shared-bar.json" with { type: "json" };
import { parseProfile, type Profile } from "./model.ts";
const validated = parseProfile({
  version: 3,
  items: data.items,
  tools: data.tools,
  shopping: [],
  reviews: [],
});
export const sharedBar = {
  ...data,
  items: validated.items,
  tools: validated.tools,
};
export function withSharedBar(personal: Profile): Profile {
  return { ...personal, items: sharedBar.items, tools: sharedBar.tools };
}
