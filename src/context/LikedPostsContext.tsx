import React, { createContext, useState, useContext, useEffect, ReactNode, useCallback } from 'react';
import { getLikedPosts, updateLikedPosts, incrementPostCounter, getSharedPosts, updateSharedPosts, createNotification } from '../services/db';
import { useAuth } from './AuthContext';

interface LikedPostsContextType {
  likedPosts: string[];
  sharedPosts: string[];
  toggleLike: (postId: string, authorId?: string, postTitle?: string) => Promise<void>;
  registerShare: (postId: string) => Promise<boolean>;
  loading: boolean;
  isLiked: (postId: string) => boolean;
}

const LikedPostsContext = createContext<LikedPostsContextType | undefined>(undefined);

export const LikedPostsProvider = ({ children }: { children: ReactNode }) => {
  const [likedPosts, setLikedPosts] = useState<string[]>([]);
  const [sharedPosts, setSharedPosts] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const { profile } = useAuth();

  useEffect(() => {
    const fetchInteractions = async () => {
      if (profile?.id) {
        setLoading(true);
        const [likesRes, sharesRes] = await Promise.all([
          getLikedPosts(profile.id),
          getSharedPosts(profile.id)
        ]);
        
        if (likesRes.data && likesRes.data.posts) {
          setLikedPosts(likesRes.data.posts);
        } else {
          setLikedPosts([]);
        }

        if (sharesRes.data && sharesRes.data.posts) {
          setSharedPosts(sharesRes.data.posts);
        } else {
          setSharedPosts([]);
        }
        
        setLoading(false);
      } else {
        setLikedPosts([]);
        setSharedPosts([]);
        setLoading(false);
      }
    };

    fetchInteractions();
  }, [profile]);

  const toggleLike = useCallback(async (postId: string, authorId?: string, postTitle?: string) => {
    if (!profile?.id) return;

    setLikedPosts(prev => {
      const isLiking = !prev.includes(postId);
      const newLikedPosts = isLiking
        ? [...prev, postId]
        : prev.filter(id => id !== postId);
        
      updateLikedPosts(profile.id!, { posts: newLikedPosts }).catch(err => 
        console.error("Error actualizando likes:", err)
      );
      
      incrementPostCounter(postId, 'likesCount', isLiking ? 1 : -1).catch(err => 
        console.error("Error actualizando contador de likes:", err)
      );

      // Enviar notificación al autor si es un Like nuevo y no es el propio autor
      if (isLiking && authorId && authorId !== profile.id) {
        createNotification(authorId, {
          type: 'like',
          title: '¡A alguien le gusta tu arte! ❤️',
          message: `${profile.nombre || 'Un artesano'} le dio me gusta a tu publicación "${postTitle || 'sin título'}".`,
          targetId: postId,
          targetType: 'post'
        });
      }
      
      return newLikedPosts;
    });
  }, [profile]);

  const registerShare = useCallback(async (postId: string): Promise<boolean> => {
    if (!profile?.id) return false;

    let wasAdded = false;
    
    setSharedPosts(prev => {
      if (prev.includes(postId)) {
        return prev;
      }

      wasAdded = true;
      const newSharedPosts = [...prev, postId];
      
      updateSharedPosts(profile.id, { posts: newSharedPosts }).catch(err => 
        console.error("Error actualizando compartidos:", err)
      );
      
      incrementPostCounter(postId, 'sharesCount', 1).catch(err => 
        console.error("Error incrementando compartido:", err)
      );

      return newSharedPosts;
    });
    
    return wasAdded;
  }, [profile]);

  const isLiked = useCallback((postId: string) => likedPosts.includes(postId), [likedPosts]);

  return (
    <LikedPostsContext.Provider value={{ likedPosts, sharedPosts, toggleLike, registerShare, loading, isLiked }}>
      {children}
    </LikedPostsContext.Provider>
  );
};

export const useLikedPosts = () => {
  const context = useContext(LikedPostsContext);
  if (context === undefined) {
    throw new Error('useLikedPosts must be used within a LikedPostsProvider');
  }
  return context;
};
