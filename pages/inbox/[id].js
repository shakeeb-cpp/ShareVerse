import Avatar from '@/components/Avatar';
import Card from '@/components/Card'
import Layout from '@/components/Layout';
import Preloader from '@/components/Preloader';
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react'
import ReactTimeAgo from 'react-time-ago';

const Inbox = () => {

    const [myProfile, setMyProfile] = useState(null);
    const [sendMessage, setSendMessage] = useState('');
    const [profiles, setprofiles] = useState([]);
    const [authorProfile, setAuthorProfile] = useState([]);
    const [isSend, setIsSend] = useState({});
    const [isReceiver, setIsReceiver] = useState(false);
    const [name, setName] = useState([]);
    const [avatar, setAvatar] = useState([]);
    const [showMessage, setShowMessage] = useState([]);
    const [receivedMessage, setReceivedMessage] = useState([]);
    const [receivedMessage2, setReceivedMessage2] = useState([]);
    const [isUploading, setIsUploading] = useState(false);
    const [isselect, setIsSelect] = useState(false);

    const supabase = useSupabaseClient();
    const session = useSession();

    const router = useRouter();
    const { asPath: pathname } = router;
    const userId = router.query.id;


    useEffect(() => {
        if (!session?.user?.id) {
            return;
        }

        supabase.from('profiles').select().eq('id', session?.user?.id)
            .then(result => {
                if (result?.data?.length) {
                    setMyProfile(result?.data[0])
                }
            })

        fetchReceivedMessage()
        fetchMyMessage()
    }, [session?.user?.id]);


    const fetchReceivedMessage = () => {
        setIsUploading(true)
        supabase
            .from('receivedmessages')
            .select()
            .eq('user_id', session?.user?.id)
            .neq('my_id', session?.user?.id)
            .then(result => {

                console.log('recivemessasge', result)
                setReceivedMessage2(result?.data)
                setIsUploading(false)
                const postsIds = result?.data?.map(item => item.my_id);
                if (postsIds) {
                    supabase
                        .from('profiles')
                        .select().in('id', postsIds)
                        .then(result => {
                            console.log('resulit', result)
                            setprofiles(result.data)
                        });
                }
            });


    }

    function deleteReceivedMessage() {
        supabase.from('receivedmessages')
            .delete()
            .eq('user_id', session?.user?.id)
            .neq('my_id', session?.user?.id)
            .then(result => {
                console.log('delted received', result)
                fetchReceivedMessage()
            })
    }




    function getUserid(id, user_id, name, avatar) {
        setAuthorProfile(user_id)
        // setIsSend(!isSend)
        setIsReceiver(true)
        setName(name)
        setAvatar(avatar)
        setIsSend(prevState => ({ ...prevState, [id]: !prevState[id] }))
    }


    function sendMessages(replymessage) {
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
            my_id: myProfile?.id,
            reply: replymessage,
        }).then(result => {
            setSendMessage('')
            fetchMyMessage()
        });
        setIsSend(false)
    }


    function fetchMyMessage() {
        supabase
            .from('sendmessages')
            .select()
            // .neq('user_id', session?.user?.id)
            .eq('my_id', session?.user?.id)
            .then(result => {
                console.log("my.messages", result.data)
                setShowMessage(result.data)
            });
    }

    function getUserMessage(userid, name) {
        console.log('userid', userid)
        console.log('name', name)
        setIsSelect(true)
        supabase
            .from('receivedmessages')
            .select()
            .eq('user_id', session?.user?.id)
            .eq('my_id', userid)
            .then(result => {
                // setReports(result.data)
                console.log('recivemessasge', result)
                setReceivedMessage(result?.data)
                setIsUploading(false)
            });
    }

    // AND (my_id <> auth.uid())) 79fdc42a-9c1a-417a-9ee0-3f09c2d17c73 


    return (
        <Layout>
            <Card roundedbottom={true}>
                <h1 className=' text-5xl mb-4 text-gray-300'>Inbox</h1>
                {isselect && (
                    <div className='flex justify-end gap-2'>
                        <button className='hover:bg-red-600 mb-2 font-semibold bg-red-500 p-1 px-4 rounded-3xl' onClick={deleteReceivedMessage}>Clear</button>
                        <button className='hover:bg-red-600 mb-2 font-semibold bg-red-500 p-1 px-4 rounded-3xl' onClick={() => setIsSelect(!isselect)}>Back</button>
                    </div>
                )}
                {isUploading && (
                    <div className="flex items-center justify-center bg-[#000000f5]">
                        <div className=" absolute md:top-40 top-60 ">
                            <Preloader size={40} />
                        </div>
                    </div>
                )}

                <div className='grid grid-cols-1 md:grid-cols-2 relative '>
                    {!isselect > 0 && profiles?.map((profile, index) => {
                        const messagesForProfile = receivedMessage2?.filter(
                            (message) => message.my_id === profile.id
                        );
                        return (
                            <div key={index} className='flex gap-3 my-2 mb-3 rounded-3xl p-0 bg-[#131313] hover:bg-[#1d1d1d] cursor-pointer items-center w-[fit-content] pr-3' onClick={() => getUserMessage(profile.id, profile.name)}>
                                <div>
                                    <div>
                                        <Avatar url={profile.avatar} />
                                    </div>
                                </div>
                                <h1 className="md:text-lg  text-lg  font-semibold">
                                    <p className='cursor-pointer leading-[27px] '>
                                        {profile?.name || 'No Username'}
                                    </p>
                                </h1>
                                <div className=' flex items-center justify-end'>
                                    <span className=' bg-red-500 text-white rounded-3xl hover:border-socialBlue  p-0 px-[6px] text-[13px]' >{messagesForProfile?.length}</span>
                                </div>
                            </div>
                        )
                    })}
                </div>

                <div className={receivedMessage?.length > 0 ? ' h-full overflow-auto' : ' h-screen overflow-auto'}>
                    {isselect && receivedMessage?.map(profile => (
                        <div key={profile.id} className=''>
                            {profile?.reply?.length > 0 && (
                                <div className='flex gap-2 items-center ml-10 bg-[#222222] w-[fit-content] px-2 py-1 rounded-t-2xl border-t-2 border-blue-500'>
                                    <p className=' text-gray-300'><span className=' font-semibold text-gray-50'>Reply to : </span>{profile?.reply}</p>
                                </div>
                            )}
                            <div className='flex items-center gap-3 mb-3 cursor-pointer bg-[#131313] rounded-full relative' >
                                <div>
                                    <Link href={`${pathname.replace('inbox/' + userId, 'messages/' + session?.user?.id)}`}>
                                        <Avatar url={profile.avatar} size={'md'} />
                                    </Link>
                                </div>
                                <div className='relative'>
                                    <div className=' flex items-center gap-2'>
                                        <Link href={`${pathname.replace('inbox/' + userId, 'messages/' + session?.user?.id)}`} className='cursor-pointer hover:underline underline-offset-2 md:text-lg text-lg  font-semibold'>
                                            {profile?.name || 'No Username'}
                                        </Link>

                                        <p className="text-sm text-gray-400">
                                            <ReactTimeAgo timeStyle={'twitter'} date={profile.created_at} />
                                        </p>
                                    </div>
                                    <div className='flex gap-2 items-center mb-1'>
                                        <p className='text-base text-gray-200 font-normal'>
                                            {profile?.message}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex justify-end  w-full absolute bottom-[8px] right-6">
                                    <button className=' font-semibold text-gray-300 hover:text-gray-500' onClick={() => getUserid(profile.id, profile.my_id, profile.name, profile.avatar)}>Reply</button>
                                </div>
                            </div>
                            {isSend[profile.id] && (
                                <div key={profile?.id} className='relative mb-2 flex bg-black text-black justify-end items-center w-full '>
                                    <button className='py-[10px] rounded-r-3xl px-3 pl-4 absolute right-0 bg-blue-500 text-white z-10 hover:bg-blue-600 ' onClick={() => sendMessages(profile?.message)}>
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                                        </svg>
                                    </button>
                                    <label className='flex cursor-pointer md:w-[300px] w-[inherit] justify-end'>
                                        <input type="text" value={sendMessage} onChange={e => setSendMessage(e.target.value)} className='border w-full rounded-3xl px-3 outline-none py-2' placeholder='Reply ...' />
                                    </label>

                                </div>
                            )}
                        </div>
                    ))}

                    {isselect && !isUploading && receivedMessage?.length === 0 && (
                        <div className="flex justify-center">
                            <h2 className="text-gray-500 text-xl text-center">No messages found !</h2>
                        </div>
                    )}
                </div>


            </Card>
        </Layout>
    )
}

export default Inbox
