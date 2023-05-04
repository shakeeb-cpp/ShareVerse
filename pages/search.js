import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import Layout from '@/components/Layout';
import { UserContext } from "../contexts/UserContext";
import PostCard from '@/components/PostCard';
import PostFomCard from '@/components/PostFomCard';
import Avatar from '@/components/Avatar';
import Link from 'next/link';

export default function SearchResults() {
    const router = useRouter();
    const { q } = router.query;
    const [posts, setPosts] = useState([]);
    const [profile, setProfile] = useState(null);
    const [profiles, setProfiles] = useState(null);
    const [error, setError] = useState(false);

    const supabase = useSupabaseClient();
    const session = useSession();

    useEffect(() => {
        if (!session?.user?.id) {
            return;
        }

        supabase.from('profiles').select().eq('id', session?.user?.id)
            .then(result => {
                if (result?.data?.length) {
                    setProfile(result?.data[0])
                }
            })

        // const searchTags = q.startsWith('#') ? `#${q}` : q
        async function fetchSearchResults() {
            const { data, error } = await supabase
                .from('posts')
                .select('id, content, author, created_at, photos, video, moods, emoji, tag, profiles(id, avatar, name)')
                .textSearch('content,tag', q, {
                    type: 'websearch',
                    config: 'english'
                })
            // .filter(
            //     'content, tag',
            //     'ilike',
            //     `%${q}%`
            // )

            if (error) console.error(error);
            setPosts(data || []);
            console.log('search', data)
            if (data?.length === 0) {
                // setError(true)
            }

            supabase
                .from('profiles')
                .select('*')
                .filter(
                    'name,place,about',
                    'ilike',
                    `%${q}%`
                )
                .then(result => {
                    if (result.data.length > 0) {
                        setProfiles(result.data);
                        console.log('data', result.data)
                    }
                    if (result.data?.length === 0) {
                        setError(true)
                    }
                })

        }

        if (q) fetchSearchResults();
    }, [q]);


    const fetchPosts = () => {
        supabase.from('posts')
            .select('id,content,author,created_at,photos,video,moods,emoji,tag, profiles(id,avatar,name)')
            .is('parent', null)
            .order('created_at', { ascending: false })
            .then(result => {
                console.log(result.error)
                setPosts(result.data)
            })
    }

    return (
        <Layout>
            <div className='my-3 h-screen '>
                {
                    error ? (
                        <div className='flex justify-center'>
                            <h2 className=''>No search results found !</h2>
                        </div>
                    ) : <h1 className='md:text-2xl text-xl text-gray-500 md:ml-4 ml-2 mb-4'>Search results for "{q}"</h1>
                }

                {profiles?.length > 0 && (
                    <div className={`grid md:grid-cols-2 px-4 py-2 bg-[${posts?.length > 0 ? '#0a0a0a':'#000'}] `}>
                        {profiles?.map(profile => (
                            <div className='flex items-start gap-3 my-2 pr-6'>
                                <div>
                                    <Link href={'profile/' + profile.id}>
                                        <Avatar url={profile.avatar} />
                                    </Link>
                                </div>
                                <div className=''>
                                    <h1 className="md:text-xl text-lg  font-semibold">
                                        <Link href={'profile/' + profile.id} className='cursor-pointer hover:underline underline-offset-2'>
                                            {profile?.name || 'No Username'}
                                        </Link>
                                    </h1>
                                    <div className="text-gray-500 text-[15px] leading-[19px] ">
                                        {profile?.about || profile?.place}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <UserContext.Provider value={{ profile }}>
                    {/* <PostFomCard onPost={fetchPosts} /> */}
                    {posts?.length > 0 && posts.map(post => (
                        <PostCard key={post.id} {...post} fetchPosts={fetchPosts} posts={posts} />
                    ))}
                </UserContext.Provider>
            </div>
        </Layout>
    );
}