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
    const [profiles, setProfiles] = useState(null);
    const [error, setError] = useState(false);
    const [isFollow, setIsFollow] = useState(false);

    const supabase = useSupabaseClient();
    const session = useSession();

    useEffect(() => {
        if (!session?.user?.id) {
            return;
        }

        // const searchTags = q.startsWith('#') ? `#${q}` : q
        async function fetchSearchResults() {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .filter(
                    'name,place,about',
                    'ilike',
                    `%${q}%`
                );
            if (data.length > 0) {
                setProfiles(data);
                console.log(data)

            }
            if (data?.length === 0) {
                setError(true)
            }
        }

        if (q) fetchSearchResults();
    }, [q]);






    return (
        <Layout>
            <div className=' h-screen px-2'>
                {
                    error ? (
                        <div className='flex justify-center'>
                            <h2>No search results found !</h2>
                        </div>
                    ) : <h1 className='md:text-3xl text-xl text-gray-500 my-3 mb-4'>Search results for "{q}"</h1>
                }

                <div className='grid md:grid-cols-2 gap-3 md:px-0 px-3'>
                    {session?.user?.id && profiles?.map((profile, index) => (
                        <Link href={'profile/' + profile.id} key={profile.id} className='pl-3 pt-2 my-1 rounded-3xl p-0 bg-[#131313] text-white hover:bg-[#202020] cursor-pointer'>
                            <div className='flex justify-center'>
                                <Link href={'profile/' + profile.id}>
                                    <Avatar size={'md'} url={profile.avatar} />
                                </Link>
                            </div>
                            <div className='flex justify-center'>
                                <h1 className="md:text-xl text-lg  font-semibold">
                                    <Link href={'profile/' + profile.id} className='cursor-pointer hover:underline underline-offset-2 '>
                                        {profile?.name || 'No Username'}
                                    </Link>
                                </h1>
                            </div>
                            <div className='flex justify-center'>
                                <p className="text-gray-500 leading-4 ">
                                    {profile?.place || 'No Location'}
                                </p>
                            </div>
                            <p className="text-gray-500 py-2 pt-3 text-base px-2 text-center">
                                {profile?.about || 'No bio'}
                            </p>
                        </Link>
                    ))}
                </div>

            </div>

        </Layout>
    );
}