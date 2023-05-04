import PostCard from "./PostCard";
import Card from "./Card";
import FriendInfo from "./FriendInfo";
import { useEffect, useState } from "react";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import ReactPlayer from 'react-player'

export default function ProfileContent({ activeTab, userId }) {
    const [posts, setPosts] = useState([]);
    const [profile, setProfile] = useState(null);

    const supabase = useSupabaseClient();
    const session = useSession();

    useEffect(() => {
        if (!userId) {
            return;
        }
        if (activeTab === 'posts') {
            loadPosts().then(() => { });
        }
    }, [userId, activeTab]);

    async function loadPosts() {
        const posts = await userPosts(userId);
        const profile = await userProfile(userId);
        setPosts(posts);
        setProfile(profile);
    }

    async function userPosts(userId) {
        const { data } = await supabase.from('posts')
            .select('id,content,author,created_at,photos,video,moods,emoji,tag,shared_avatar,shared_name,shared_content,sharedposting,shared_id')
            .eq('author', userId)
            .is('parent', null)
            .order('created_at', { ascending: false })
        return data;
    }

    async function userProfile(userId) {
        const { data } = await supabase.from('profiles')
            .select()
            .eq('id', userId);
        return data?.[0];
    }




    const isMyUser = userId === session?.user?.id;

    return (
        <div>
            {activeTab === 'posts' && (
                <div>
                    {posts?.length > 0 && posts.map(post => (
                        <PostCard key={post.created_at} {...post} profiles={profile} />
                    ))}
                    {posts?.length === 0 && (
                        <div className="flex justify-center items-center my-3">
                            <h1>This user have no Posts !</h1>
                        </div>
                    )}
                </div>
            )}
            {activeTab === 'photos' && (
                <Card>
                    {posts.length > 0 && posts.map(post =>
                        <>
                            <div className="grid md:grid-cols-2 gap-3 ">
                                {post?.photos?.length > 1 && post.photos.map(photo => (
                                    <img className="rounded-md w-full overflow-hidden h-full flex mx-auto shadow-md" src={photo} alt="img" />
                                ))}
                            </div>
                            <div className='grid grid-cols-1 md:gap-3 gap-2'>
                                {post?.photos?.length <= 1 && post.photos.map((photo, index) => (
                                    <div key={index} className='flex items-center '>
                                        <img className='rounded-md object-cover hover:contrast-[1.1] cursor-pointer w-full h-full blur-none' src={photo} alt="Image" />
                                    </div>
                                ))}
                            </div>
                        </>
                    )}

                </Card>
            )}
            {activeTab === 'videos' && (
                <Card>
                    <div className="grid md:grid-cols-1 gap-3">
                        {posts.length > 0 && posts.map(post =>
                            post?.video?.map(vid => (
                                <div className='rounded-md overflow-hidden'>
                                    <ReactPlayer url={vid} width='100%' height='100%' controls={true} />
                                </div>
                            ))
                        )}
                        {posts.map(post =>
                            !isMyUser && post?.video?.length < 1 && (
                                <div className="flex justify-center items-center">
                                    <h1>This user have no videos yet !</h1>
                                </div>
                            )
                        )}
                    </div>
                </Card>
            )}
        </div>
    );
}

