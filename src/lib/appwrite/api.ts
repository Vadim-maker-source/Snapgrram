import { ID, ImageGravity, Query } from "appwrite";

import { appwriteConfig, account, databases, storage, avatars } from "./config";
import { IUpdatePost, INewPost, INewUser, IUpdateUser, INewComment } from "@/types";
import { useNavigate } from "react-router-dom";

// ============================================================
// AUTH
// ============================================================

// ============================== SIGN UP
export async function createUserAccount(user: INewUser) {
  try {
    const newAccount = await account.create(
      ID.unique(),
      user.email,
      user.password,
      user.name
    );

    if (!newAccount) throw Error;

    const avatarUrl = avatars.getInitials(user.name);

    const newUser = await saveUserToDB({
      accountId: newAccount.$id,
      name: newAccount.name,
      email: newAccount.email,
      username: user.username,
      imageUrl: avatarUrl,
    });

    return newUser;
  } catch (error) {
    console.log(error);
    return error;
  }
}

// ============================== SAVE USER TO DB
export async function saveUserToDB(user: {
  accountId: string;
  email: string;
  name: string;
  imageUrl: string;
  username?: string;
}) {
  try {
    const newUser = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      ID.unique(),
      user
    );

    return newUser;
  } catch (error) {
    console.log(error);
  }
}

// ============================== SIGN IN
export async function signInAccount(user: { email: string; password: string; }) {
  try {
    const session = await account.createEmailPasswordSession(user.email, user.password);
    console.log("Session:", session);
    return session;
  } catch (error) {
    console.log(error);
  }
}

// ============================== GET ACCOUNT
export async function getCurrentUser() {
  try {
    const currentAccount = await account.get();

    if (!currentAccount) throw Error;

    const currentUser = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      [Query.equal('accountId', currentAccount.$id)]
    );

    if (!currentUser) throw Error;
    if (!currentAccount) signOutAccount();

    return currentUser.documents[0];
  } catch (error) {
    console.log(error);
  }
}

export async function handleAuthError(error: any) {
  const navigate = useNavigate();

  if (error?.code === 401) {
    try {
      await account.deleteSession("current"); // Удаляем текущую сессию
      navigate("/sign-in"); // Перенаправляем на страницу входа
    } catch (err) {
      console.error("Ошибка при удалении сессии:", err);
    }
  }
}

export async function signOutAccount() {
  try {
    const session = await account.deleteSession("current");

    return session;
  } catch (error) {
    console.log(error);
  }
}

export async function uploadFile(file: File){
  try {
    const uploadedFile = await storage.createFile(
      appwriteConfig.storageId,
      ID.unique(),
      file
    );

    return uploadedFile;
  } catch (error) {
    console.log(error);
  }
}

export function getFilePreview(fileId: string){
  try {
    const fileUrl = storage.getFilePreview(
      appwriteConfig.storageId,
      fileId,
      2000,
      2000,
      ImageGravity.Top,
      100
    );

    return fileUrl;
  } catch (error) {
    console.log(error);
  }
}

export async function deleteFile(fileId: string){
  try {
    await storage.deleteFile(appwriteConfig.storageId, fileId);

    return { status: 'ok' }
  } catch (error) {
    console.log(error);
  }
}

export async function likePost(postId: string, likesArray: string[]){
  try {
    const updatedPost = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      postId,
      {
        likes: likesArray
      }
    )

    if(!updatedPost) throw Error;

    return updatedPost
  } catch (error) {
    console.log(error)
  }
}

export async function createPost(post: INewPost) {
  try {
    const uploadedFile = await uploadFile(post.file[0]);
    if (!uploadedFile) throw new Error('File upload failed');

    const fileUrl = new URL(await storage.getFileView(
      appwriteConfig.storageId,
      uploadedFile.$id
    ));
    if (!fileUrl || fileUrl.href.length > 2000) {
      await deleteFile(uploadedFile.$id);
      throw new Error('Invalid file URL');
    }

    const tags = post.tags?.replace(/ /g, '').split(',') || [];

    const newPostData = {
      creator: post.userId,
      caption: post.caption,
      imageUrl: fileUrl.href,
      imageId: uploadedFile.$id,
      location: post.location,
      tags: tags,
    };

    // Debugging: Log the data to be sent
    console.log("Data to be sent:", newPostData);

    const newPost = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      ID.unique(),
      newPostData
    );

    if (!newPost) {
      await deleteFile(uploadedFile.$id);
      throw new Error('Document creation failed');
    }

    return newPost;
  } catch (error) {
    console.error("Error in createPost:", error);
    throw error;
  }
}

export async function addComment(postId: string, userId: string, comment: INewComment) {
  try {

    const newComment = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.commentsCollectionId,
      ID.unique(),  // ID уникального комментария
      {
        comment: comment.textComment,
        post: postId,
        user: userId,
        creator: comment.userId
      }
    );

    if (!newComment) throw Error('Failed to add comment');

    return newComment;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function deleteComment(commentId: string) {
  try {
    const deletedComment = await databases.deleteDocument(
      appwriteConfig.databaseId,
      appwriteConfig.commentsCollectionId,
      commentId
    );

    if (!deletedComment) throw Error('Failed to delete comment');

    return deletedComment;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function getRecentPosts(){
  const posts = await databases.listDocuments(
    appwriteConfig.databaseId,
    appwriteConfig.postCollectionId,
    [Query.orderDesc('$createdAt'), Query.limit(20)]
  )

  if(!posts) throw Error;

  return posts;
}

export async function getComments(postId: string) {
  try {
    const comments = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.commentsCollectionId,
      [Query.equal('post', postId)] // Добавляем фильтр для postId
    );

    if (!comments || comments.documents.length === 0) {
      throw new Error('No comments found for this post');
    }

    return comments.documents;
  } catch (error) {
    console.error('Error fetching comments:', error);
    throw error;
  }
}

export async function savePost(postId: string, userId: string){
  try {
    const updatedPost = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.savesCollectionId,
      ID.unique(),
      {
        user: userId,
        post: postId,
      }
    )

    if(!updatedPost) throw Error;

    return updatedPost
  } catch (error) {
    console.log(error)
  }
}

export async function deleteSavedPost(savedRecordId: string) {
  try {
    const statusCode = await databases.deleteDocument(
      appwriteConfig.databaseId,
      appwriteConfig.savesCollectionId,
      savedRecordId
    );

    if (!statusCode) throw Error;

    return { status: "Ok" };
  } catch (error) {
    console.log(error);
  }
}

export async function getPostById(postId: string) {
  try {
    const post = await databases.getDocument(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      postId
    );

    return post;
  } catch (error) {
    console.error("Error fetching post:", error);
    return null; // Return null to ensure the query result is never undefined
  }
}

export async function updatePost(post: IUpdatePost) {
  const hasFileToUpdate = post.file.length > 0;

  try {
    let image = {
      imageUrl: post.imageUrl,
      imageId: post.imageId,
    }

    if (hasFileToUpdate) {
      const uploadedFile = await uploadFile(post.file[0]);

      if (!uploadedFile) throw Error;

      // Преобразуем полученную строку в объект URL
      const fileUrl = new URL(await storage.getFileView(
        appwriteConfig.storageId,
        uploadedFile.$id
      ));

      if (!fileUrl || fileUrl.href.length > 2000) {
        await deleteFile(uploadedFile.$id);
        throw new Error('Invalid file URL');
      }

      // Присваиваем правильный тип
      image = { ...image, imageUrl: fileUrl, imageId: uploadedFile.$id };
    }

    const tags = post.tags?.replace(/ /g, '').split(',') || [];

    const updatedPost = {
      caption: post.caption,
      imageUrl: image.imageUrl.href, // Теперь используем href, чтобы получить строку URL
      imageId: image.imageId,
      location: post.location,
      tags: tags,
    };

    const newPost = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      post.postId,
      updatedPost
    );

    if (!newPost) {
      await deleteFile(post.imageId);
      throw new Error('Document creation failed');
    }

    return newPost;
  } catch (error) {
    console.error("Error in updatePost:", error);
    throw error;
  }
}

export async function deletePost(postId: string, imageId: string){
  if(!postId || !imageId) throw Error;

  try {
    await databases.deleteDocument(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      postId
    )

    return { status: 'ok' }
  } catch (error) {
    console.log(error);
  }
}

export async function getInfinitePosts({ pageParam }: { pageParam: number }) {
  const limit = 9; // Количество постов на странице
  const offset = pageParam ? (pageParam - 1) * limit : 0; // Рассчитываем смещение

  const queries: any[] = [
    Query.orderDesc('$updatedAt'),
    Query.limit(limit), // Ограничиваем количество постов на страницу
    Query.offset(offset) // Указываем смещение для пагинации
  ];

  try {
    const posts = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      queries
    );

    if (!posts || posts.documents.length === 0) {
      throw new Error('No posts found');
    }

    return posts;
  } catch (error) {
    console.error('Error fetching posts:', error);
    throw error;
  }
}

export async function searchPosts(searchTerm: string){
  try {
    const posts = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      [Query.search('caption', searchTerm)]
    )

    if(!posts) throw Error;

    return posts;
  } catch (error) {
    console.log(error)
  }
}

export async function getUserById(userId: string) {
  try {
    const user = await databases.getDocument(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      userId
    );

    if (!user) throw Error;

    return user;
  } catch (error) {
    console.log(error);
  }
}

export async function updateUser(user: IUpdateUser) {
  const hasFileToUpdate = user.file.length > 0;
  try {
    let image = {
      imageUrl: user.imageUrl,
      imageId: user.imageId,
    };

    if (hasFileToUpdate) {
      // Upload new file to appwrite storage
      const uploadedFile = await uploadFile(user.file[0]);
      if (!uploadedFile) throw Error;

      // Get new file url
      const fileUrl = getFilePreview(uploadedFile.$id);
      if (!fileUrl) {
        await deleteFile(uploadedFile.$id);
        throw Error;
      }

      image = { ...image, imageUrl: fileUrl, imageId: uploadedFile.$id };
    }

    //  Update user
    const updatedUser = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      user.userId,
      {
        name: user.name,
        bio: user.bio,
        imageUrl: image.imageUrl,
        imageId: image.imageId,
      }
    );

    // Failed to update
    if (!updatedUser) {
      // Delete new file that has been recently uploaded
      if (hasFileToUpdate) {
        await deleteFile(image.imageId);
      }
      // If no new file uploaded, just throw error
      throw Error;
    }

    // Safely delete old file after successful update
    if (user.imageId && hasFileToUpdate) {
      await deleteFile(user.imageId);
    }

    return updatedUser;
  } catch (error) {
    console.log(error);
  }
}

export async function getUsers(limit?: number) {
  const queries: any[] = [Query.orderDesc("$createdAt")];

  if (limit) {
    queries.push(Query.limit(limit));
  }

  try {
    const users = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      queries
    );

    if (!users) throw Error;

    return users;
  } catch (error) {
    console.log(error);
  }
}