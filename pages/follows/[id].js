import Avatar from '@/components/Avatar';
import Card from '@/components/Card'
import Layout from '@/components/Layout'
import Preloader from '@/components/Preloader';
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react'

const Follows = () => {

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
            .from('follows')
            .select()
            .eq('my_id', userId)
            .then(result => {
                const postsIds = result?.data?.map(item => item.user_idf);

                setIsUploading(true)
                supabase
                    .from('profiles')
                    .select().in('id', postsIds)
                    .then(result => {
                        setprofiles(result.data)
                        setIsUploading(false)
                    });

            });
    }, [userId]);



    const isMyUser = userId === session?.user?.id;

    return (
        <Layout>

            <Card>
                <div className='h-screen'>
                    <h1 className="md:text-5xl text-4xl mb-6 text-gray-300">Followings</h1>
                    <div className="grid md:grid-cols-2  ">
                        {!isUploading && session?.user?.id && profiles?.map(profile => (
                            <div key={profile.id} className='flex items-start gap-3 my-2 pr-6'>
                                <div>
                                    <Link href={`${pathname.replace('follows/' + userId,'profile/' + profile.id)}`}>
                                        <Avatar url={profile.avatar} />
                                    </Link>
                                </div>
                                <div className=''>
                                    <h1 className="md:text-xl text-lg  font-semibold">
                                        <Link href={`${pathname.replace('follows/' + userId,'profile/' + profile.id)}`} className='cursor-pointer hover:underline underline-offset-2'>
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

                    {isUploading && (
                        <div className="flex  justify-center h-screen items-center z-20 bg-[#000000f5]">
                            <Preloader size={40} />
                        </div>
                    )}
                    {!isUploading && profiles.length == 0 && (
                        <div className='flex justify-center'>
                            <h2>No following !</h2>
                        </div>
                    )}
                </div>
            </Card>
        </Layout>
    )
}

export default Follows
