import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getReviews, getUserProfile, addReview, deleteReview, updateReview } from '../services/db';
import { Review, UserProfile } from '../types';

export const useProductDetail = (productId: string, artesanoId: string, currentUserId?: string) => {
  const queryClient = useQueryClient();

  // Fetch Reviews
  const { data: reviews = [], isLoading: isLoadingReviews } = useQuery<Review[]>({
    queryKey: ['reviews', productId],
    queryFn: async () => {
      const res = await getReviews(productId);
      return (res.data || []) as Review[];
    },
    enabled: !!productId,
  });

  // Fetch Artesano Info
  const { data: artesanoInfo, isLoading: isLoadingArtesano } = useQuery<UserProfile>({
    queryKey: ['userProfile', artesanoId],
    queryFn: async () => {
      const res = await getUserProfile(artesanoId);
      return res.data as UserProfile;
    },
    enabled: !!artesanoId,
  });

  const myReview = currentUserId 
    ? reviews.find(r => r.userId === currentUserId) 
    : undefined;

  // Add Review Mutation
  const addReviewMutation = useMutation({
    mutationFn: async (newReview: { userId: string; userName: string; userFoto?: string; rating: number; comment: string; fotos?: string[] }) => {
      const res = await addReview(productId, newReview);
      if (!res.success) throw new Error('Error al añadir reseña');
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', productId] });
    },
  });

  // Delete Review Mutation
  const deleteReviewMutation = useMutation({
    mutationFn: async (reviewId: string) => {
      const res = await deleteReview(reviewId);
      if (!res.success) throw new Error('Error al eliminar reseña');
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', productId] });
    },
  });

  // Update Review Mutation
  const updateReviewMutation = useMutation({
    mutationFn: async ({ reviewId, data }: { reviewId: string; data: any }) => {
      const res = await updateReview(reviewId, data);
      if (!res.success) throw new Error('Error al actualizar reseña');
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', productId] });
    },
  });

  return {
    reviews,
    isLoadingReviews,
    artesanoInfo,
    isLoadingArtesano,
    myReview,
    addReview: addReviewMutation.mutateAsync,
    isSubmittingReview: addReviewMutation.isPending || updateReviewMutation.isPending,
    deleteReview: deleteReviewMutation.mutateAsync,
    updateReview: updateReviewMutation.mutateAsync,
  };
};
