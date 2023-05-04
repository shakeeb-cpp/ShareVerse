import Avatar from '@/components/Avatar'
import Card from '@/components/Card'
import Layout from '@/components/Layout'
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import ReactTimeAgo from 'react-time-ago'

// import Preloader from "@/components/Preloader";
import { useRouter } from 'next/router'
import Preloader from '@/components/Preloader'


const Notifications = () => {

    const [notify, setNotify] = useState([]);
    const [reports, setReports] = useState([]);
    const [isUploading, setIsUploading] = useState(false);
    const [isFollow, setIsFollow] = useState([]);


    const supabase = useSupabaseClient();

    const session = useSession();

    const router = useRouter();
    const { asPath: pathname } = router;

    const userId = router.query.id;

    useEffect(() => {
        if (!session?.user?.id) {
            return;
        }
        fetchNotifications()
        supabase
            .from('follower')
            .select()
            .eq('user_id', session?.user?.id)
            .then(result => {
                const postsIds = result?.data?.map(item => item.follower_id);
                if (postsIds) {
                    supabase
                        .from('profiles')
                        .select().in('id', postsIds)
                        .then(result => {
                            if (result?.data?.length > 0) {
                                setIsFollow(result?.data);
                                console.log('notify follower', result.data)
                            }
                        });
                }

            });


        fetchReprts()


    }, [session?.user?.id]);


    const fetchNotifications = () => {
        setIsUploading(true)

        supabase
            .from('notifications')
            .select()
            .eq('user_id', session?.user?.id)
            .order('created_at', { ascending: false })
            .then(result => {
                console.log('result notify', result);
                setNotify(result.data)
                setIsUploading(false)
            });

    }


    function deleteNotify(notifyId) {
        supabase.from('notifications')
            .delete()
            .eq('user_id', session?.user?.id)
            .eq('id', notifyId)
            .then(result => {
                console.log('deleted result', result)
                fetchNotifications()
            })

    }

    function deleteNotifyALL() {
        supabase.from('notifications')
            .delete()
            .eq('user_id', session?.user?.id)
            .then(result => {
                console.log('deleted result', result)
                fetchNotifications()
            })

    }



    const fetchReprts = () => {
        supabase
            .from('reports')
            .select()
            .eq('user_id', session?.user?.id)
            .neq('my_id', session?.user?.id)
            .then(result => {
                setReports(result.data)
            });

    }

    function deleteReport(notifyId) {
        supabase.from('reports')
            .delete()
            .eq('user_id', session?.user?.id)
            .neq('my_id', session?.user?.id)
            .eq('id', notifyId)
            .then(result => {
                console.log('reports', result)
                fetchReprts()
            })
    }


    return (
        <Layout>
            <Card>
                <div className={notify?.length > 0 ? ' h-full relative' : ' h-screen relative'}>
                    <h1 className=' text-5xl mb-4 text-gray-300'>Notifications</h1>
                    {notify?.length > 0 && (
                        <div className='flex justify-end'>
                            <button className='hover:bg-red-600 mb-2 font-semibold bg-red-500 p-1 px-4 rounded-3xl ' onClick={deleteNotifyALL}>Clear All</button>
                        </div>
                    )}
                    {isUploading && (
                        <div className="flex items-center justify-center bg-[#000000f5]">
                            <div className=" absolute md:top-40 top-60 z-30 ">
                                <Preloader size={40} />
                            </div>
                        </div>
                    )}
                    {!isUploading &&
                        notify?.length > 0 ?
                        (<>
                            {notify?.map(profile => (
                                isFollow.map(follow => (
                                    follow.id === profile.my_id && (
                                        <div key={profile.my_id} className=' relative'>
                                            <div className='absolute md:top-[4px] top-[3px] right-6 z-10'>
                                                <button className=' hover:bg-slate-700 bg-gray-500 rounded-full text-white text-sm py-0 px-[6px] ' onClick={() => deleteNotify(profile.id)}>X</button>
                                            </div>
                                            <div className='flex items-center gap-3 my-4 cursor-pointer bg-[#131313]  rounded-full  relative' >
                                                <div>
                                                    <Link href={`${pathname.replace('notifications/' + userId, 'profile/' + profile.my_id)}`} >
                                                        <Avatar url={profile.avatar} size={'md'} />
                                                    </Link>
                                                </div>
                                                <div className=''>
                                                    <div className=' flex items-center gap-2'>
                                                        <Link href={`${pathname.replace('notifications/' + userId, 'profile/' + profile.my_id)}`} className='cursor-pointer hover:underline underline-offset-2 md:text-lg leading-[26px] text-lg  font-semibold'>
                                                            {profile?.name || 'No Username'}
                                                        </Link>
                                                        <p className="text-sm text-gray-400">
                                                            <ReactTimeAgo timeStyle={'twitter'} date={profile.created_at} />
                                                        </p>
                                                    </div>
                                                    <div className='flex gap-2 items-center'>
                                                        <p className='text-base font-semibold'>upload a new post: <span className='text-base font-normal text-gray-300'>{profile.message?.slice(0, 16)} ...</span></p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                ))

                            ))}
                        </>)
                        :
                        ''
                    }
                    {/* report */}

                    {reports?.map(profile => (
                        <>
                            <div className='flex items-center gap-3 mb-4 cursor-pointer bg-[#181111] rounded-full relative' >
                                <div className='absolute md:top-[4px] top-[3px] right-6 z-10'>
                                    <button className=' hover:bg-slate-700 bg-gray-500 rounded-full text-white text-sm py-0 px-[6px] ' onClick={() => deleteReport(profile.id)}>X</button>
                                </div>

                                <div>
                                    <div>
                                        <Avatar url={profile.avatar} size={'md'} />
                                    </div>
                                </div>
                                <div className=''>
                                    <div className=' flex items-center gap-2'>
                                        <p className='cursor-pointer md:text-lg leading-[26px] text-lg font-semibold'>
                                            {profile?.name || 'No Username'}
                                        </p>
                                        <p className="text-sm text-gray-400">
                                            <ReactTimeAgo timeStyle={'twitter'} date={profile.created_at} />
                                        </p>
                                    </div>
                                    <div className='flex gap-2 items-center'>
                                        <p className='text-base font-normal'><span className=' font-semibold'>Report on your Post : </span>{profile?.message}</p>
                                    </div>
                                </div>
                            </div>
                        </>
                    ))}
                </div>
            </Card>
        </Layout >
    )
}

export default Notifications
