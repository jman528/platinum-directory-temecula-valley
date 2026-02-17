import type { SchemaTypeDefinition } from "sanity";
import { blockContent } from "./schemas/blockContent";
import { business } from "./schemas/business";
import { category } from "./schemas/category";
import { giveaway } from "./schemas/giveaway";
import { giveawayEntry } from "./schemas/giveawayEntry";
import { lead } from "./schemas/lead";
import { review } from "./schemas/review";
import { subcategory } from "./schemas/subcategory";

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [business, category, subcategory, review, lead, giveaway, giveawayEntry, blockContent],
};
