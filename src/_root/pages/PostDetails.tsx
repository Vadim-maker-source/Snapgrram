import Loader from "@/components/shared/Loader";
import PostStats from "@/components/shared/PostStats";
import { Button } from "@/components/ui/button";
import { useUserContext } from "@/context/AuthContext";
import { useDeletePost, useGetPostById, useAddComment, useGetComments, useDeleteComment } from "@/lib/react-query/queriesAndMutations";
import { multiFormatDateString } from "@/lib/utils";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { Textarea } from "@/components/ui/textarea";

const PostDetails = () => {
    const { id } = useParams();
    const { data: post, isPending, isError } = useGetPostById(id || '');
    const { user } = useUserContext();
    const { mutate: deletePost } = useDeletePost();
    const navigate = useNavigate();

    const { mutate: deleteComment } = useDeleteComment();

    const [newComment, setNewComment] = useState("");
    const { mutate: addComment } = useAddComment(id || '', user.id);
    const { data: comments, isLoading: isCommentsLoading } = useGetComments(id || '');

    const commentsRef = useRef<HTMLUListElement | null>(null);

    useEffect(() => {
        if (commentsRef.current) {
            commentsRef.current.scrollTop = commentsRef.current.scrollHeight;
        }
    }, [comments]);

    const handleDeletePost = () => {
        if (post && id) {
            deletePost({ postId: id, imageId: post.imageId });
            navigate(-1);
        }
    };

    const handleAddComment = () => {
        if (newComment.trim()) {
            addComment({ userId: user.id, textComment: newComment });
            setNewComment("");
        }
    };

    const handleDeleteComment = (commentId: string) => {
        if (confirm("Вы уверены, что хотите удалить этот комментарий?")) {
            deleteComment(commentId);
        }
    };

    if (isPending) return <Loader />;
    if (isError || !post) return <div>Ошибка: публикация не найдена</div>;

    const sortedComments = comments ? [...comments].reverse() : [];

    return (
        <div className="post_details-container grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6">
            {/* Левая часть: Информация о посте + Картинка */}
            <div className="flex flex-col gap-4">
                <div className="post_details-info">
                    {/* Информация о пользователе */}
                    <div className="flex-between w-full">
                        <Link to={`/profile/${post.creator?.$id || ''}`} className="flex items-center gap-3">
                            <img
                                src={post.creator?.imageUrl || '/assets/icons/profile-placeholder.svg'}
                                alt="creator"
                                className="rounded-full w-8 h-8 lg:w-12 lg:h-12"
                            />
                            <div className="flex flex-col">
                                <p className="base-medium lg:body-bold text-light-1">{post.creator?.name || 'Неизвестен'}</p>
                                <div className="flex-center gap-2 text-light-3">
                                    <p className="subtle-semibold lg:small-regular">
                                        {multiFormatDateString(post.$createdAt)}
                                    </p>
                                    <p className="subtle-semibold lg:small-regular">{post.location}</p>
                                </div>
                            </div>
                        </Link>

                        {user.id === post.creator?.$id && (
                            <div className="flex-center">
                                <Link to={`/update-post/${post.$id}`}>
                                    <img src="/assets/icons/edit.svg" width={24} height={24} alt="Edit" />
                                </Link>
                                <Button onClick={handleDeletePost} variant="ghost" className="ghost_details-delete_btn">
                                    <img src="/assets/icons/delete.svg" alt="Delete" width={24} height={24} />
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* Картинка поста */}
                    <div className="mt-4 rounded-lg overflow-hidden mx-auto 
                        max-w-[350px] max-h-[300px] 
                        sm:max-w-[450px] sm:max-h-[400px] 
                        lg:max-w-[550px] lg:max-h-[500px]">
                        <img 
                            src={post.imageUrl} 
                            alt="Post" 
                            className="w-full h-auto object-cover rounded-lg" 
                        />
                    </div>

                    <hr className="border w-full border-dark-4/80 mt-4" />

                    {/* Описание поста */}
                    <div className="flex flex-col flex-1 w-full small-medium lg:base-regular">
                        <p>{post.caption}</p>
                        <ul className="flex gap-1 mt-2">
                            {post.tags?.map((tag: string) => (
                                <li key={tag} className="text-light-3">
                                    #{tag}
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="w-full">
                        <PostStats post={post} userId={user.id} />
                    </div>

                    {/* Контейнер с комментариями и формой для добавления комментариев */}
                    <div className="mt-4 w-full px-4">
                        {/* Форма для добавления комментариев */}
                        <Textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Добавьте комментарий..."
                            className="shad-textarea custom-scrollbar"
                        />
                        <Button onClick={handleAddComment} disabled={!newComment.trim()} className="mt-2 w-full">
                            Добавить комментарий
                        </Button>

                        {/* Список комментариев */}
                        <div className="overflow-hidden mt-4">
                            <h3 className="text-lg font-semibold">Комментарии</h3>
                            {isCommentsLoading ? (
                                <Loader />
                            ) : (
                                <ul
                                    ref={commentsRef}
                                    className="mt-2 flex flex-col max-h-[350px] overflow-y-auto pr-2 custom-scrollbar"
                                >
                                    {sortedComments?.map((comment: any) => (
                                        <li key={comment.$id} className="py-4 flex items-start gap-4">
                                            <Link to={`/profile/${comment.user?.$id}`}>
                                                <img
                                                    src={comment.user?.imageUrl || '/assets/icons/profile-placeholder.svg'}
                                                    alt="creator"
                                                    className="rounded-full w-10 h-10 shrink-0"
                                                />
                                            </Link>
                                            <div className="flex flex-col w-full">
                                                <div className="flex justify-between items-start gap-4">
                                                    <p className="text-sm flex-1 break-words">
                                                        <strong>{comment.user?.name}:</strong> {comment.comment}
                                                    </p>
                                                    {comment.user?.$id === user.id && (
                                                        <Button
                                                            onClick={() => handleDeleteComment(comment.$id)}
                                                            variant="ghost"
                                                            className="ghost_details-delete_btn shrink-0"
                                                        >
                                                            <img src="/assets/icons/delete.svg" alt="Delete" width={24} height={24} />
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PostDetails;
