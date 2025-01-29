import { useUserContext } from '@/context/AuthContext';
import { Models } from 'appwrite';
import { Link } from 'react-router-dom';
import PostStats from './PostStats';

type GridPostListProps = {
    posts: Models.Document[];
    showUser?: boolean;
    showStats?: boolean;
}

const GridPostList = ({ posts, showUser = true, showStats = true }: GridPostListProps) => {
    const { user } = useUserContext();

    return (
        <ul className="grid-container ">
            {posts.map((post) => (
                <li key={post.$id} className="relative min-w-80 h-80">
                    <Link to={`/posts/${post.$id}`} className="grid-post_link">
                        {post.imageUrl ? (
                            <img
                                src={post.imageUrl}
                                alt="Post"
                                className="h-full w-full object-cover"
                            />
                        ) : (
                            <div className="h-full w-full bg-gray-200 flex items-center justify-center">
                                <span>Нет фотографии</span>
                            </div>
                        )}
                    </Link>

                    <div className="grid-post_user">
                        {showUser && post.creator && (
                            <div className="flex items-center justify-start gap-1">
                                {post.creator.imageUrl ? (
                                    <img
                                        src={post.creator.imageUrl}
                                        alt="Создатель"
                                        className="h-8 w-8 rounded-full"
                                    />
                                ) : (
                                    <div className="h-8 w-8 bg-gray-300 rounded-full"></div>
                                )}
                                <p>{post.creator.name || 'Неизвестен'}</p>
                            </div>
                        )}
                        {showStats && <PostStats post={post} userId={user.id} />}
                    </div>
                </li>
            ))}
        </ul>
    );
};

export default GridPostList;