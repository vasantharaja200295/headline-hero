import { HEADLINE_CONFIG } from "./constants";

export const calculateReadingTime = (text) => {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const minutesRaw = words / 225;

  if (minutesRaw < 1) {
    return minutesRaw <= 0.2 ? "< 1" : 1;
  }

  return Math.round(minutesRaw);
};

export const countWords = (text) => {
  return text.split(/\s+/).filter(Boolean).length;
};

export const calculateCost = (numHeadlines) => {
  const { baseCost, min, additionalCostPerHeadline } = HEADLINE_CONFIG;
  const additionalHeadlines = Math.max(0, numHeadlines - min);
  const cost = baseCost + additionalHeadlines * additionalCostPerHeadline;
  return Math.ceil(cost);
};
