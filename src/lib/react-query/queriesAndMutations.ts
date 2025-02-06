import {
    useQuery,
    useMutation,
    useQueryClient,
    useInfiniteQuery,
    //useInfiniteQuery,
} from '@tanstack/react-query'
import { INewComment, INewPost, INewUser, IUpdatePost, IUpdateUser } from '@/types'
import { addComment, createPost, createUserAccount, deleteComment, deletePost, deleteSavedPost, getComments, getCurrentUser, getInfinitePosts, /*getInfinitePosts,*/ getPostById, getRecentPosts, getUserById, getUsers, likePost, savePost, searchPosts, signInAccount, signOutAccount, updatePost, updateUser } from '../appwrite/api'
import { QUERY_KEYS } from './queryKeys'

export const useCreateUserAccount = () => {
    return useMutation({
        mutationFn: (user: INewUser) => createUserAccount(user),
    })
}

export const useSignInAccount = () => {
    return useMutation({
        mutationFn: (user: { email: string; password: string }) => signInAccount(user),
    })
}

export const useSignOutAccount = () => {
    return useMutation({
        mutationFn: signOutAccount
    })
}

export const useCreatePost = () => {
    const queryClient = useQueryClient();
    return useMutation ({
        mutationFn: (post: INewPost) => createPost(post),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.GET_RECENT_POSTS]
            })
        }
    })
}

export const useGetRecentPosts = () => {
    return useQuery({
        queryKey: [QUERY_KEYS.GET_RECENT_POSTS],
        queryFn: getRecentPosts,
    })
}

export const useGetComments = (postId: string) => {
    return useQuery({
      queryKey: [QUERY_KEYS.GET_COMMENTS, postId], // Ключ запроса для получения комментариев
      queryFn: () => getComments(postId), // Исправленная функция получения комментариев
      enabled: !!postId, // Запрос выполняется только если postId не пустое
    });
  };  

  export const useAddComment = (postId: string, userId: string) => {
    const queryClient = useQueryClient();
  
    return useMutation({
      mutationFn: (comment: INewComment) => addComment(postId, userId, comment), // Исправленный порядок аргументов
      onSuccess: () => {
        // Инвалидируем запросы, чтобы обновить комментарии
        queryClient.invalidateQueries({
          queryKey: [QUERY_KEYS.GET_COMMENTS, postId], // Обновляем комментарии для данного поста
        });
      },
      onError: (error) => {
        console.error('Error adding comment:', error);
      },
    });
  };

  export const useDeleteComment = () => {
    const queryClient = useQueryClient();
  
    return useMutation({
      mutationFn: (commentId: string) => deleteComment(commentId),
      onSuccess: () => {
        // Инвалидируем запросы, чтобы обновить список комментариев
        queryClient.invalidateQueries({
          queryKey: [QUERY_KEYS.GET_COMMENTS], // Обновляем все комментарии
        });
      },
      onError: (error) => {
        console.error('Error deleting comment:', error);
      },
    });
  };

export const useLikePost = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ postId, likesArray }: { postId: string; likesArray: string[] }) => likePost(postId, likesArray),
        onSuccess: (data) => {
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.GET_POST_BY_ID, data?.$id]
            })
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.GET_RECENT_POSTS]
            })
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.GET_POSTS]
            })
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.GET_CURRENT_USER]
            })
        }
    })
}

export const useSavePost = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ postId, userId }: { postId: string; userId: string }) => savePost(postId, userId),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.GET_RECENT_POSTS]
            })
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.GET_POSTS]
            })
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.GET_CURRENT_USER]
            })
        }
    })
}

export const useDeleteSavedPost = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (savedRecordId: string) => deleteSavedPost(savedRecordId),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.GET_RECENT_POSTS]
            })
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.GET_POSTS]
            })
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.GET_CURRENT_USER]
            })
        }
    })
}

export const useGetCurrentUser = () => {
    return useQuery({
        queryKey: [QUERY_KEYS.GET_CURRENT_USER],
        queryFn: getCurrentUser,
    })
}

export const useGetPostById = (postId: string) => {
    return useQuery({
        queryKey: [QUERY_KEYS.GET_POST_BY_ID, postId],
        queryFn: () => getPostById(postId),
        enabled: !!postId
    })
}

export const useUpdatePost = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (post: IUpdatePost) => updatePost(post),
        onSuccess: (data) => {
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.GET_POST_BY_ID, data?.$id]
            })
        }
    })
}

export const useDeletePost = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ postId, imageId }: { postId: string, imageId: string }) => deletePost(postId, imageId),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.GET_RECENT_POSTS]
            })
        }
    })
}

export const useGetPosts = () => {
    return useInfiniteQuery({
      queryKey: [QUERY_KEYS.GET_INFINITE_POSTS],
      queryFn: ({ pageParam = 1 }) => getInfinitePosts({ pageParam }), // Начинаем с первой страницы
      getNextPageParam: (lastPage, allPages) => {
        // Если на последней странице меньше, чем limit, значит больше страниц нет
        if (!lastPage || lastPage.documents.length < 9) return null;
  
        // Получаем номер текущей страницы из allPages (все страницы, включая текущую)
        const currentPage = allPages.length;
  
        // Переходим к следующей странице
        return currentPage + 1; // Увеличиваем номер страницы на 1
      },
      initialPageParam: 1 // Начинаем с первой страницы
    });
  }
  
export const useSearchPosts = (searchTerm: string) => {
    return useQuery({
        queryKey: [QUERY_KEYS.SEARCH_POSTS, searchTerm],
        queryFn: () => searchPosts(searchTerm),
        enabled: !!searchTerm
    });
}

export const useGetUserById = (userId: string) => {
    return useQuery({
      queryKey: [QUERY_KEYS.GET_USER_BY_ID, userId],
      queryFn: () => getUserById(userId),
      enabled: !!userId,
    });
}

export const useUpdateUser = () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: (user: IUpdateUser) => updateUser(user),
      onSuccess: (data) => {
        queryClient.invalidateQueries({
          queryKey: [QUERY_KEYS.GET_CURRENT_USER],
        });
        queryClient.invalidateQueries({
          queryKey: [QUERY_KEYS.GET_USER_BY_ID, data?.$id],
        });
      },
    });
}

export const useGetUsers = (limit?: number) => {
    return useQuery({
      queryKey: [QUERY_KEYS.GET_USERS],
      queryFn: () => getUsers(limit),
    });
}

