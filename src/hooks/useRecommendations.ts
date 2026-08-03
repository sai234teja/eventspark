import { useQuery } from '@tanstack/react-query';
import { 
  getTrendingEventsAction, 
  getPopularEventsAction, 
  getNearYouAction, 
  getSimilarEventsAction, 
  getRecommendedForUserAction 
} from '@/app/actions/recommendations';

export const useRecommendations = (userId?: string, categoryId?: number, eventId?: number, location?: string) => {
  const trendingQuery = useQuery({
    queryKey: ['recommendations', 'trending'],
    queryFn: () => getTrendingEventsAction(),
  });

  const popularQuery = useQuery({
    queryKey: ['recommendations', 'popular'],
    queryFn: () => getPopularEventsAction(),
  });

  const nearYouQuery = useQuery({
    queryKey: ['recommendations', 'near-you', location],
    queryFn: () => getNearYouAction(location!),
    enabled: !!location,
  });

  const similarQuery = useQuery({
    queryKey: ['recommendations', 'similar', categoryId, eventId],
    queryFn: () => getSimilarEventsAction(categoryId!, eventId!),
    enabled: !!categoryId && !!eventId,
  });

  const personalizedQuery = useQuery({
    queryKey: ['recommendations', 'personalized', userId],
    queryFn: () => getRecommendedForUserAction(userId!),
    enabled: !!userId,
  });

  return {
    trendingEvents: trendingQuery.data || [],
    popularEvents: popularQuery.data || [],
    nearYouEvents: nearYouQuery.data || [],
    similarEvents: similarQuery.data || [],
    recommendedEvents: personalizedQuery.data || [],
    isLoading: 
      trendingQuery.isLoading || 
      popularQuery.isLoading || 
      nearYouQuery.isLoading || 
      similarQuery.isLoading || 
      personalizedQuery.isLoading,
  };
};
