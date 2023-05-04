
import Avatar from '@/components/Avatar';
import Card from '@/components/Card';
import Layout from '@/components/Layout';
import Preloader from '@/components/Preloader';
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react';
import Link from 'next/link';
import React, { useEffect, useState } from 'react'
import ReactTimeAgo from 'react-time-ago';

const messages = () => {

    const [myProfile, setMyProfile] = useState(null);
    const [sendMessage, setSendMessage] = useState('');
    const [profiles, setprofiles] = useState([]);
    const [authorProfile, setAuthorProfile] = useState([]);
    const [isSend, setIsSend] = useState(false);
    const [isReceiver, setIsReceiver] = useState(false);
    const [name, setName] = useState([]);
    const [avatar, setAvatar] = useState([]);
    const [showMessage, setShowMessage] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [error, setError] = useState(false);
    const [isUploading, setIsUploading] = useState(false);


    const supabase = useSupabaseClient();
    const session = useSession();

    useEffect(() => {



        if (!session?.user?.id) {
            return;
        }
        // setIsUploading(true)
        fetchProfiles()

        supabase
            .from('follows')
            .select()
            .eq('my_id', session?.user?.id)
            .then(result => {
                const postsIds = result?.data?.map(item => item.user_idf);
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

            });
        fetchMyMessage()

    }, [session?.user?.id]);


    function getUserid(id, name, avatar) {
        setAuthorProfile(id)
        setIsSend(true)
        setIsReceiver(true)
        setName(name)
        setAvatar(avatar)
    }


    function fetchProfiles() {
        supabase.from('profiles').select().eq('id', session?.user?.id)
            .then(result => {
                if (result?.data?.length) {
                    setMyProfile(result?.data[0])
                }
            })
    }

    function sendMessages(e) {
        e.preventDefault();
        supabase.from('sendmessages').insert({
            user_id: authorProfile,
            name: myProfile.name,
            avatar: myProfile.avatar,
            message: sendMessage,
            my_id: myProfile?.id
        }).then(result => {
            setSendMessage('')
            fetchMyMessage()

        });

        supabase.from('receivedmessages').insert({
            user_id: authorProfile,
            name: myProfile.name,
            avatar: myProfile.avatar,
            message: sendMessage,
            my_id: myProfile?.id
        }).then(result => {
            setSendMessage('')
            fetchMyMessage()

        });

    }

    function fetchMyMessage() {
        supabase
            .from('sendmessages')
            .select()
            .eq('my_id', session?.user?.id)
            .then(result => {
                console.log("my.messages", result.data)
                setShowMessage(result.data)
            });
    }

    function deleteMyMessage() {
        supabase.from('sendmessages')
            .delete()
            .eq('user_id', authorProfile)
            .eq('my_id', session?.user?.id)
            .then(result => {
                fetchMyMessage()
            })
    }

    const handleSearch = async (e) => {
        e.preventDefault();
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .filter(
                'name,place,about',
                'ilike',
                `%${searchQuery}%`
            );
        if (data.length > 0) {
            setprofiles(data);
            setSearchQuery('')
            console.log(data)

        }
        if (data.length === 0) {
            fetchProfiles()
            setError(true)
            setTimeout(() => {
                setError(false)
            }, 3000);
        }


    };



    return (
        <Layout>
            <div className='bg-black text-white rounded-md mb-5 pt-[7px] md:px-4 px-2 h-screen relative'>
                {isUploading && (
                    <div className="flex items-center justify-center bg-[#000000f5]">
                        <div className=" absolute md:top-40 top-60 ">
                            <Preloader size={40} />
                        </div>
                    </div>
                )}
                {/* followings */}
                {!isReceiver && (
                    <div className=' h-[100%] overflow-y-auto'>
                        <div className="md:flex justify-between flex-wrap-reverse">
                            {/* search bar */}
                            <form className='mr-2 flex items-center justify-end text-black relative ' onSubmit={handleSearch}>
                                <input
                                    className='border rounded-3xl px-2 py-1 outline-none md:w-72'
                                    type="text"
                                    placeholder="Search user to chat ..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                                <button type='submit' className='py-[5px] rounded-r-3xl md:px-3 md:pl-4 px-2 absolute -right-1 bg-blue-500 z-10 md:hover:bg-blue-600 text-white '>
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                                    </svg>
                                </button>
                            </form>
                        </div>
                        <h2 className=' text-center text-xl text-gray-500 my-3'>Select the user to start conversation !</h2>
                        <div className='grid md:grid-cols-2 md:gap-3'>
                            {session?.user?.id && profiles?.map((profile, index) => (
                                <div key={profile.id} className='flex items-start gap-3 my-2 mb-3 rounded-3xl p-0 bg-[#131313] hover:bg-[#1d1d1d] cursor-pointer' onClick={() => getUserid(profile.id, profile.name, profile.avatar)}>
                                    <div>
                                        <div>
                                            <Avatar url={profile.avatar} />
                                        </div>
                                    </div>
                                    <div className=''>
                                        <h1 className="md:text-lg  text-lg  font-semibold">
                                            <p className='cursor-pointer leading-[27px] '>
                                                {profile?.name || 'No Username'}
                                            </p>
                                        </h1>
                                        <div className="text-gray-500 leading-[16px] ">
                                            {profile?.place || 'No Location'}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {/* {profiles.length == 0 && (
                                <div className='flex justify-center'>
                                    <h2>No following !</h2>
                                </div>
                            )} */}
                            {error && (
                                <div className='flex justify-center'>
                                    <h2>No search results found !</h2>
                                </div>
                            )}

                        </div>

                    </div>
                )}



                {isReceiver && (
                    <div className='flex justify-between items-center'>
                        <div className=' md:w-44   p-0 grid'>
                            <button onClick={() => { setIsReceiver(false); setIsSend(false) }} className='hover:bg-red-600  font-semibold bg-red-500 p-1 mb-1 md:px-4 px-3 rounded-3xl'>back</button>
                            <button onClick={deleteMyMessage} className='  hover:bg-red-600 mb-2 font-semibold bg-red-500 p-1 md:px-4 px-3 rounded-3xl'>clear chat</button>
                        </div>
                        <div className='flex items-center gap-1 my-2 mb-3 rounded-full p-0 bg-[#131313] text-white cursor-pointer w-[215px] flex-wrap relative '>
                            <div>
                                <Link href={'profile/' + authorProfile} >
                                    <Avatar url={avatar} />
                                </Link>
                            </div>
                            <div className=''>
                                <h1 className="md:text-lg  text-lg text-white font-semibold">
                                    <Link href={'profile/' + authorProfile} className='cursor-pointer hover:underline underline-offset-2'>
                                        {name || 'No Username'}
                                    </Link>
                                </h1>
                            </div>
                        </div>

                    </div>
                )}


                {/* show messages */}
                {isReceiver && (
                    <div className='h-[78%] bg-[#131313]  rounded-3xl p-3 md:px-10'>
                        {showMessage?.map(message => (
                            authorProfile === message.user_id && (
                                <>
                                    <div className='flex items-center gap-3 mb-4 cursor-pointer bg-[#202020] text-white rounded-full w-full relative' >
                                        <div>
                                            <div>
                                                <Avatar url={message.avatar} />
                                            </div>
                                        </div>
                                        <p className="text-sm text-gray-400 absolute top-1 right-3">
                                            <ReactTimeAgo timeStyle={'twitter'} date={message.created_at} />
                                        </p>
                                        <div className=' flex items-center gap-2 mr-6'>
                                            <p className='cursor-pointer text-base'>
                                                <span className=' font-semibold'>You : </span> {message?.message}
                                            </p>
                                        </div>

                                    </div>
                                </>
                            )

                        ))}
                    </div>
                )}

                {/* send messages */}
                {isSend && (
                    <form onSubmit={sendMessages} className='relative mt-3 bg-black text-black flex justify-center items-center w-full'>
                        <button type='submit' className='py-[10px] rounded-r-3xl px-3 pl-4 absolute right-0 bg-blue-500 text-white z-10 hover:bg-blue-600 ' onClick={sendMessages}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                            </svg>
                        </button>
                        <label className='flex cursor-pointer w-[inherit]'>
                            <input type="text" value={sendMessage} onChange={e => setSendMessage(e.target.value)} className='border w-full rounded-3xl px-3 outline-none py-2' placeholder='Type message ...' />
                        </label>

                    </form>
                )}
            </div>
        </Layout>
    )
}

export default messages
