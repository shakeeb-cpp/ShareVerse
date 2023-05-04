import React, { useEffect, useState } from 'react'
import Card from './Card'
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react';
import Avatar from './Avatar';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Preloader from './Preloader';

const RightNavigation = () => {


    const [profiles, setprofiles] = useState([]);
    const [suggest, setSuggest] = useState([]);

    // const [error, setError] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [isUploading2, setIsUploading2] = useState(false);
    const [followedProfiles, setFollowedProfiles] = useState([]);



    const router = useRouter();
    const { asPath: pathname } = router;
    const session = useSession();
    const supabase = useSupabaseClient();

    useEffect(() => {
        if (!session?.user?.id) {
            return;
        }

        setIsUploading(true)
        supabase
            .from('follows')
            .select('user_idf')
            .eq('my_id', session?.user?.id)
            .then(result => {
                const postsIds = result?.data?.map(item => item.user_idf);
                setFollowedProfiles(postsIds || []);
                setIsUploading(true)
                if (postsIds) {
                    supabase
                        .from('profiles')
                        .select().in('id', postsIds)
                        .then(result => {
                            setprofiles(result.data)
                            setIsUploading(false)
                        });
                }
                if (result.error) {
                    setIsUploading2(true)
                    setprofiles([])
                }


            });

    }, [session?.user?.id]);


    useEffect(() => {
        if (followedProfiles.length > 0) {
            supabase
                .from('profiles')
                .select("*")
                .not('id', 'in', `(${followedProfiles.join(',')})`)
                .neq('id', session?.user?.id)
                .then(result => {
                    console.log('data lengthsa', result?.data?.length)
                    if (result?.data?.length) {
                        setSuggest(result.data);
                    }
                });
        }

    }, [followedProfiles, session?.user?.id]);


    // const handleSearch = (e) => {
    //     setIsUploading(true)
    //     e.preventDefault();
    //     supabase
    //         .from('profiles')
    //         .select('*')
    //         .filter(
    //             'name,place,about',
    //             'ilike',
    //             `%${searchQuery}%`
    //         )
    //         .then(result => {
    //             if (result.data.length > 0) {
    //                 setprofiles(result.data);
    //                 console.log('data', result.data)
    //                 setSearchQuery('')
    //                 setError(false)
    //                 setIsUploading(false)
    //             }
    //             if (result.data?.length === 0) {
    //                 setError(true)
    //             }
    //         })

    // };


    return (
        <Card noPadding={true}>
            <div className='fixed hidden md:top-[-2px] md:w-[313px] md:h-screen w-full  top-0 z-10 md:block items-center bg-[#000] text-white p-2'>
                {/* searchbar */}
                {/* <form className=' flex items-center justify-end relative mb-0 bg-[#000] text-black rounded-t-md pt-[2px]' onSubmit={handleSearch}>
                    <input
                        className='border rounded-3xl px-2 py-1 outline-none md:w-64 bg-[#FBFBF5]'
                        type="text"
                        name="search"
                        placeholder="Search users ..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <button type='submit' className='py-[5px] rounded-r-3xl md:px-3 md:pl-4 px-2 absolute right-0 bg-blue-500 z-10 hover:bg-blue-600 text-white '>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                        </svg>
                    </button>
                </form> */}
                {/* {searchQuery && error && (
                    <h1 className=' text-center text-base text-gray-400 my-2 mt-3'>No search result found !</h1>
                )} */}


                <div className={` rounded-2xl p-2 px-3 mt-1 bg-[#131313] relative overflow-y-hidden h-[292px]`}>
                    <h1 className="text-xl mb-3 mt-[2px] text-gray-200 font-bold">Followings</h1>

                    {isUploading2 && (
                        <div className=" bg-[#131313] mt-2 h-[160px]">
                            <div className="flex justify-center">
                                <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" className="r-1bwzh9t r-4qtqp9 r-yyyyoo r-1ui5ee8 r-1xvli5t r-dnmrzs r-bnwqim r-1plcrui r-lrvibr"><g><path d="M3.707 21.71l17-17-1.414-1.42-2.555 2.56C15.492 4.7 13.828 4 12 4 9.142 4 6.686 5.71 5.598 8.16 2.96 8.8 1 11.17 1 14c0 2.06 1.04 3.88 2.625 4.96l-1.332 1.33 1.414 1.42zm1.37-4.2C3.839 16.83 3 15.51 3 14c0-2.03 1.506-3.7 3.459-3.96l.611-.09.201-.58C7.947 7.41 9.811 6 12 6c1.275 0 2.438.48 3.322 1.26L5.077 17.51zM8.243 20l2-2H18c1.657 0 3-1.34 3-3s-1.343-3-3-3v-2c2.761 0 5 2.24 5 5s-2.239 5-5 5H8.243z"></path></g></svg>
                            </div>
                            <h1 className=" text-gray-500 text-center my-4 mx-2">Looks like you lost your connection. Please check it and try again.</h1>
                        </div>
                    )}


                    {isUploading && !isUploading2 && (
                        <div className="flex items-center h-[180px] rounded-2xl z-30 bg-[#131313]">
                            <div className="inline-block mx-auto">
                                <Preloader size={40} />
                            </div>
                        </div>
                    )}

                    {!isUploading && profiles?.map(profile => (
                        <div div key={profile.id} className='flex items-start gap-3 my-[12px] mb-[13px]' >
                            <div className='flex items-center gap-2 grow'>
                                <Link href={'profile/' + profile.id}>
                                    <Avatar url={profile?.avatar} />
                                </Link>
                                <h1 className="text-lg  font-semibold">
                                    <Link href={pathname === '/profile/' + profile.id ? 'profile/' + profile.id : '/profile/' + profile.id} className='cursor-pointer hover:underline underline-offset-2'>
                                        {profile?.name || 'No Username'}
                                    </Link>
                                    <p className="text-gray-500 text-sm font-normal ">
                                        {profile?.place || 'No Location'}
                                    </p>
                                </h1>
                            </div>
                        </div>

                    ))}

                    {!isUploading && profiles?.length > 3 && (
                        <div className='flex absolute bottom-[1px] right-3  justify-start'>
                            <Link className=' text-socialBlue hover:text-blue-700' href={'/follows/' + session?.user?.id}>show more</Link>
                        </div>
                    )}

                    {!isUploading && profiles.length === 0 && (
                        <div className='flex justify-center'>
                            <h2>No followings !</h2>
                        </div>
                    )}
                </div>


                <div className={` rounded-2xl p-2 px-3 mt-5  bg-[#131313] relative  overflow-y-auto h-[292px] `}>
                    <h1 className="text-xl mb-3 mt-[2px] text-gray-200 font-bold">Who to follow</h1>
                    {isUploading2 && (
                        <div className="  h-[160px] bg-[#131313] mt-2">
                            <div className="flex justify-center">
                                <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" className="r-1bwzh9t r-4qtqp9 r-yyyyoo r-1ui5ee8 r-1xvli5t r-dnmrzs r-bnwqim r-1plcrui r-lrvibr"><g><path d="M3.707 21.71l17-17-1.414-1.42-2.555 2.56C15.492 4.7 13.828 4 12 4 9.142 4 6.686 5.71 5.598 8.16 2.96 8.8 1 11.17 1 14c0 2.06 1.04 3.88 2.625 4.96l-1.332 1.33 1.414 1.42zm1.37-4.2C3.839 16.83 3 15.51 3 14c0-2.03 1.506-3.7 3.459-3.96l.611-.09.201-.58C7.947 7.41 9.811 6 12 6c1.275 0 2.438.48 3.322 1.26L5.077 17.51zM8.243 20l2-2H18c1.657 0 3-1.34 3-3s-1.343-3-3-3v-2c2.761 0 5 2.24 5 5s-2.239 5-5 5H8.243z"></path></g></svg>
                            </div>
                            <h1 className=" text-gray-500 text-center my-4 mx-2">Looks like you lost your connection. Please check it and try again.</h1>
                        </div>
                    )}


                    {isUploading && !isUploading2 && (
                        <div className=" flex items-center h-[180px] rounded-2xl z-30 bg-[#131313]">
                            <div className="inline-block mx-auto">
                                <Preloader size={40} />
                            </div>
                        </div>
                    )}

                    {!isUploading && (
                        suggest.map(profile => (
                            <div key={profile.id} className='flex items-center justify-between gap-2 my-3 mb-4'>
                                <div className='flex items-center gap-2 grow'>
                                    <div>
                                        <Avatar url={profile?.avatar} />
                                    </div>
                                    <div>
                                        <h1 className="text-lg  font-semibold">
                                            <p className=''>
                                                {profile?.name || 'No Username'}
                                            </p>
                                            <p className="text-gray-500 text-sm font-normal ">
                                                {profile?.place || 'No Location'}
                                            </p>
                                        </h1>
                                    </div>
                                </div>

                                <Link href={pathname === '/profile/' + profile.id ? 'profile/' + profile.id : '/profile/' + profile.id} className="flex items-center  bg-gray-50 hover:bg-gray-300 rounded-2xl justify-end font-semibold text-black px-3 py-[2px]">
                                    Follow
                                </Link>
                            </div>
                        ))
                    )
                    }

                    {!isUploading && suggest?.length > 0 && (
                        <div className='flex absolute bottom-[1px] right-3  justify-start'>
                            <Link className=' text-socialBlue hover:text-blue-700' href={'/suggested/' + session?.user?.id}>show more</Link>
                        </div>
                    )}

                    {!isUploading && suggest.length === 0 && (
                        <div className='flex justify-center'>
                            <h2>No Suggestions found !</h2>
                        </div>
                    )}
                </div>

            </div>
        </Card >
    )
}

export default RightNavigation
