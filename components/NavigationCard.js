import React, { useEffect, useState } from 'react'
import Link from "next/link";
import Card from './Card'
import { useRouter } from "next/router";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";

const NavigationCard = () => {
    const router = useRouter();

    const { asPath: pathname } = router;


    const [notify, setNotify] = useState([]);
    const [isFollow, setIsFollow] = useState([]);
    const [receivedMessage, setReceivedMessage] = useState([]);
    const [reports, setReports] = useState([]);


    const supabase = useSupabaseClient();
    const session = useSession();

    useEffect(() => {
        if (!session?.user?.id) {
            return;
        }
        // fetchNotifications();

        // real-time subscription for notifications
        const notificationss = supabase.channel('notifications')
            .on('postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'notifications',
                }, payload => {
                    setNotify(prevNotifications => [...prevNotifications, payload.new]);
                }).subscribe();

        // real-time subscription for receiveMessages
        const messages = supabase.channel('receivedmessages')
            .on('postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'receivedmessages',
                }, payload => {
                    setReceivedMessage(prevMessage => [...prevMessage, payload.new]);
                }).subscribe();

        fetchReprts()

        return () => {
            notificationss.unsubscribe();
            messages.unsubscribe();
        };

    }, [session?.user?.id]);


    useEffect(() => {
        fetchNotifications()
        fetchReceivedMessage()
    }, [notify, receivedMessage]);

    const activeElement = 'flex md:gap-3 gap-0 md:py-3 py-2 md:mt-1 mt-8 my-1 bg-socialBlue text-black md:-mx-7 -mx-0 m-0 md:px-7 px-4 rounded-md relative';
    const nonActiveElement = 'flex md:gap-3 gap-0 md:py-3 py-2  md:mt-1 mt-8  my-1 hover:bg-socialBlue hover:bg-opacity-30 md:-mx-6 -mx-0 m-0 md:px-6 px-4 rounded-md transition-all hover:scale-105 relative';



    async function logout() {
        await supabase.auth.signOut()
    }


    const fetchNotifications = () => {

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
                            }
                        });
                }


            });

        if (isFollow) {
            supabase
                .from('notifications')
                .select()
                .eq('user_id', session?.user?.id)
                .order('created_at', { ascending: false })
                .then(result => {
                    setNotify(result.data)
                });
        }
    }


    const fetchReceivedMessage = () => {
        supabase
            .from('receivedmessages')
            .select()
            .eq('user_id', session?.user?.id)
            .neq('my_id', session?.user?.id)
            .then(result => {
                setReceivedMessage(result?.data)
            });

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
    // https://cdn-icons-png.flaticon.com/128/8810/8810276.png

    return (
        <Card noPadding={true}>
            <div className="fixed md:top-0 md:w-[280px] md:h-screen w-full  md:border-b-0 border-b-2 border-b-slate-200  top-0 z-20 md:block flex md:px-8 px-0 py-2 pt-3 items-center justify-center bg-[#000] text-white">
                <Link href={'/'} className=" text-socialBlue mb-3 flex items-center gap-1"> <img className='w-7' src="https://img.icons8.com/external-tanah-basah-glyph-tanah-basah/48/FFFFFF/external-social-digital-marketing-tanah-basah-glyph-tanah-basah.png" alt='' /> <span className='md:block hidden text-2xl font-semibold'>ShareVerse</span></Link>
                <Link href={'/'} className=" text-socialBlue mb-3 text-2xl font-semibold absolute left-1 top-1 flex items-center gap-1"><img className='w-8 md:hidden block ' src="https://img.icons8.com/external-tanah-basah-glyph-tanah-basah/48/FFFFFF/external-social-digital-marketing-tanah-basah-glyph-tanah-basah.png" alt='' /><span className='md:hidden block '>ShareVerse</span></Link>
                <div className='md:block flex justify-between md:px-0 px-3'>
                    <Link href="/" className={pathname === '/' ? activeElement : nonActiveElement}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="md:w-8 md:h-8 w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                        </svg>
                        <span className='md:block hidden text-xl'>Home</span>
                    </Link>


                    <Link href={'/followers/' + session?.user?.id} className={pathname === '/followers/' + session?.user?.id ? activeElement : nonActiveElement}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="md:w-8 md:h-8 w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                        </svg>
                        <span className='md:block hidden text-xl'>Followers</span>
                    </Link>


                    <Link href="/saved" className={pathname === '/saved' ? activeElement : nonActiveElement}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="md:w-8 md:h-8 w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
                        </svg>
                        <span className='md:block hidden text-xl'>Saved Posts</span>
                    </Link>




                    <Link href={'/messages/' + session?.user?.id} className={pathname === '/messages/' + session?.user?.id ? activeElement : nonActiveElement}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="md:w-8 md:h-8 w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                        </svg>
                        <span className='md:block hidden text-xl'>Messages</span>
                    </Link>

                    <Link href={'/inbox/' + session?.user?.id} className={pathname === '/inbox/' + session?.user?.id ? activeElement : nonActiveElement}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="md:w-8 md:h-8 w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                        </svg>
                        <span className='md:block hidden text-xl'>Inbox</span>
                        {
                            pathname !== "/inbox/" + session?.user?.id && (
                                receivedMessage?.length === 0 ? '' : (
                                    <span className='absolute md:left-[45px] border-2 border-black left-7 md:top-[10px] top-1 bg-red-500 text-white rounded-3xl hover:border-socialBlue  p-0 px-1 text-[9px]'>{receivedMessage?.length}</span>
                                )
                            )
                        }
                    </Link>


                    <Link href={"/notifications/" + session?.user?.id} className={pathname === "/notifications/" + session?.user?.id ? activeElement : nonActiveElement}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="md:w-8 md:h-8 w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                        </svg>
                        <span className='md:block hidden text-xl'>Notifications</span>

                        {pathname !== "/notifications/" + session?.user?.id && (
                            notify?.length > 0 || reports?.length > 0 ?
                                (
                                    notify?.map(profile => (
                                        isFollow?.map(follow => (
                                            follow?.id === profile?.my_id && (
                                                <span key={follow.id} className='absolute md:left-[41px]  border-2 border-black left-7 md:top-[9px] top-1 bg-red-500 text-white rounded-3xl p-0 px-1 text-[9px]'>{notify?.length + reports?.length}</span>
                                            )
                                        ))

                                    ))
                                )
                                :
                                ''
                        )
                        }

                    </Link>

                    <button onClick={logout} className="md:w-full -my-2">
                        <span className={nonActiveElement}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="md:w-8 md:h-8 w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                            </svg>
                            <span className="hidden md:block text-xl">Logout</span>
                        </span>
                    </button>
                </div>
            </div>
        </Card >
    )
}

export default NavigationCard
