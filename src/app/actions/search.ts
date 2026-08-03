'use server';

import { searchService, SearchParams } from '@/services/searchService';

export async function searchEventsAction(params: SearchParams) {
  return await searchService.searchEvents(params);
}
