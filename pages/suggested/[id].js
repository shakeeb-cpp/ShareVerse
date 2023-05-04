import Avatar from '@/components/Avatar';
import Card from '@/components/Card'
import Layout from '@/components/Layout'
import Preloader from '@/components/Preloader';
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react'

const suggested = () => {

    const [profiles, setprofiles] = useState([]);
    const [isUploading, setIsUploading] = useState(false);
    const [followedProfiles, setFollowedProfiles] = useState([]);
    const [suggest, setSuggest] = useState([]);

    const router = useRouter();
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
            .select('user_idf')
            .eq('my_id', userId)
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
                    setprofiles([])
                }
            });

    }, [userId]);


    useEffect(() => {
        if (followedProfiles.length > 0) {
            supabase
                .from('profiles')
                .select("*")
                .not('id', 'in', `(${followedProfiles.join(',')})`)
                .neq('id', userId)
                .then(result => {
                    console.log('data lengthsa', result?.data?.length)
                    if (result?.data?.length) {
                        setSuggest(result.data);
                    }


                });
        }

    }, [followedProfiles, userId]);


    return (
        <Layout>

            <Card>
                <div className='h-screen'>
                    <h1 className="md:text-5xl text-4xl mb-6 text-gray-300">Suggested</h1>
                    <div className="grid md:grid-cols-2  ">
                        {!isUploading && session?.user?.id && suggest?.map(profile => (
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

                    {isUploading && (
                        <div className="flex  justify-center h-screen items-center z-20 bg-[#000000f5]">
                            <Preloader size={40} />
                        </div>
                    )}
                </div>
            </Card>
        </Layout>
    )
}

export default suggested
