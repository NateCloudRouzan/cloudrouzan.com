import links from "./data/video-links.json" with { type: "json" };
export const videoLinks = links;
const videoDrinkIds = new Set(links.map(video => video.drinkId));
export const hasVideo = (drinkId: string) => videoDrinkIds.has(drinkId);
