import Avatar from '@/components/Avatar';
import Card from '@/components/Card';
import Layout from '@/components/Layout'
import Preloader from '@/components/Preloader';
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react'

const Followers = () => {

    const [profiles, setprofiles] = useState([]);
    const [isUploading, setIsUploading] = useState(false);

    const router = useRouter();
    const { asPath: pathname } = router;

    const userId = router.query.id;

    const session = useSession();
    const supabase = useSupabaseClient();
    useEffect(() => {
        if (!session?.user?.id) {
            return;
        }
        setIsUploading(true)
        supabase
            .from('follower')
            .select()
            // .eq('user_id', userId)

            .eq('user_id', userId)
            // .eq('follower_id',session.user.id)
            .then(result => {
                const postsIds = result?.data?.map(item => item.follower_id);

                if (postsIds) {
                    setIsUploading(true)
                    supabase
                        .from('profiles')
                        .select().in('id', postsIds)
                        .then(result => {
                            setprofiles(result.data)
                            setIsUploading(false)
                        });
                }

            });

        // console.log('pathname',pathname.replace('followers','profile'))
    }, [userId]);


    const handleSearch = (e) => {
        e.preventDefault();

        const searchQuery = e.target.search.value.trim();
        router.push(`/searchUser?q=${encodeURIComponent(searchQuery)}`);

    };

    return (
        <Layout>

            <Card>

                <div className={profiles?.length > 0 ? ' h-full' : ' h-screen'}>
                    <form className=' md:hidden flex items-center justify-end relative mb-0 bg-black text-black rounded-t-md pt-[2px]' onSubmit={handleSearch}>
                        <input
                            className='border rounded-3xl px-2 py-1 outline-none md:w-64 '
                            type="text"
                            name="search"
                            placeholder="Search users ..."
                        />
                        <button type='submit' className='py-[5px] rounded-r-3xl md:px-3 md:pl-4 px-2 absolute right-0 text-white bg-blue-500 z-10 md:hover:bg-blue-600 '>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                            </svg>
                        </button>
                    </form>

                    <h1 className="md:text-5xl text-4xl mb-6 text-gray-300">Followers</h1>

                    <div className="grid md:grid-cols-2  ">
                        {!isUploading && profiles?.length > 0 && profiles?.map(profile => (
                            <div key={profile.id} className='flex items-start gap-3 pr-6 my-2  rounded-full'>
                                <div>
                                    <Link href={`${pathname.replace('followers/' + userId, 'profile/' + profile.id)}`}>
                                        <Avatar url={profile.avatar} />
                                    </Link>
                                </div>
                                <div className=''>
                                    <Link href={`${pathname.replace('followers/' + userId, 'profile/' + profile.id)}`} className='cursor-pointer hover:underline underline-offset-2 md:text-md leading-6 text-lg  font-semibold'>
                                        {profile?.name || 'No Username'}
                                    </Link>

                                    <div className="text-gray-500 text-[15px] leading-[19px] ">
                                        {profile?.about || profile?.place}
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* {profiles.length === 0 && (
                            <div className='flex justify-center'>
                                <h2>No followers !</h2>
                            </div>
                        )} */}
                    </div>

                    {isUploading && (
                        <div className="flex justify-center h-screen items-center z-20 bg-[#000000f5]">
                            <Preloader size={40} />
                        </div>
                    )}

                    {!isUploading && profiles.length === 0 && (
                        <div className='flex justify-center'>
                            <h2>No followers !</h2>
                        </div>
                    )}
                </div>
            </Card>
        </Layout >
    )
}

export default Followers