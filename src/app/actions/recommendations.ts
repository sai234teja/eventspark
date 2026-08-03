'use server';

import { recommendationService } from '@/services/recommendationService';

export async function getTrendingEventsAction(limit: number = 5) {
  return await recommendationService.getTrendingEvents(limit);
}

export async function getPopularEventsAction(limit: number = 5) {
  return await recommendationService.getPopularEvents(limit);
}

export async function getNearYouAction(location: string, limit: number = 5) {
  return await recommendationService.getNearYou(location, limit);
}

export async function getSimilarEventsAction(categoryId: number, excludeEventId: number, limit: number = 5) {
  return await recommendationService.getSimilarEvents(categoryId, excludeEventId, limit);
}

export async function getRecommendedForUserAction(userId: string, limit: number = 5) {
  return await recommendationService.getRecommendedForUser(userId, limit);
}
