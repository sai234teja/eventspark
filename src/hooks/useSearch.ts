import { useQuery } from '@tanstack/react-query';
import { SearchParams } from '@/services/searchService';

export const useSearch = (params: SearchParams) => {
  const query = useQuery({
    queryKey: ['search', params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params.keyword) searchParams.set('q', params.keyword);
      if (params.location) searchParams.set('city', params.location);
      if (params.category) searchParams.set('category', params.category.toString());

      const res = await fetch(`/api/search?${searchParams.toString()}`);
      if (!res.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await res.json();
      return {
        events: data,
        total: data.length,
        totalPages: 1 // Simplified for this stage
      };
    },
    staleTime: 5000, 
  });

  return {
    events: query.data?.events || [],
    total: query.data?.total || 0,
    totalPages: query.data?.totalPages || 1,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error
  };
};
