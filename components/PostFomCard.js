import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react'
import React, { useContext, useEffect, useState } from 'react'
import Avatar from './Avatar'
import Card from './Card'
import Preloader from './Preloader'
import "react-tooltip/dist/react-tooltip.css";
import { Tooltip as ReactTooltip } from "react-tooltip";
import ReactPlayer from 'react-player'
import Picker from '@emoji-mart/react';
import data from '@emoji-mart/data'
import Link from 'next/link'

const PostFomCard = ({ onPost, posts }) => {

    // const { profile } = useContext(UserContext);

    const [content, setContent] = useState('');
    const [moods, setMoods] = useState('');
    const [ismood, setIsMood] = useState(false);
    const [ismood2, setIsMood2] = useState(false);
    const [emoji, setEmoji] = useState(null);
    const [tag, setTag] = useState([]);
    const [isTag, setIsTag] = useState(false);
    const [isTag2, setIsTag2] = useState(false);
    const [cancel, setCancel] = useState('');
    const [cancel2, setCancel2] = useState('');
    const [uploads, setUploads] = useState([]);
    const [isUploading, setIsUploading] = useState(false);
    const [videoFilePath, setVideoFilePath] = useState([]);
    const [profile, setProfile] = useState(null);


    const supabase = useSupabaseClient();
    const session = useSession();


    useEffect(() => {
        if (!session?.user?.id) {
            return;
        }
        supabase.from('profiles')
            .select()
            .eq('id', session.user.id)
            .then(result => {
                setProfile(result.data?.[0]);
            });


    }, [session?.user?.id]);



    const createPost = () => {
        setIsTag2(true);
        setIsTag(true)
        supabase.from('posts').insert({
            author: session.user.id,
            content,
            photos: uploads,
            video: videoFilePath,
            moods,
            emoji,
            tag,

        }).then(response => {
            if (!response.error) {
                setContent('');
                setUploads([]);
                setVideoFilePath([])
                setMoods('')
                setEmoji(null)
                setTag('')
                if (onPost) {
                    onPost()
                }
            }
        })
        setIsTag(false);
        setIsTag2(false);
        setCancel2('x')

        // push notifications
        const notifications = posts.reduce((acc, post) => {
            if (session?.user?.id !== post?.profiles?.id) {
                if (!acc.seenIds.includes(post?.profiles?.id)) {
                    acc.seenIds.push(post?.profiles?.id);
                    acc.data.push({
                        user_id: post?.profiles?.id,
                        name: profile.name,
                        avatar: profile.avatar,
                        username: post?.profiles?.name,
                        my_id: profile.id,
                        message: content
                    });
                }
            }
            return acc;
        }, { data: [], seenIds: [] }).data;


        supabase.from('notifications').insert(notifications).then(result => {
            console.log('notifications', result)
        });
    }



    const cancelPost = (e) => {
        e.stopPropagation();
        setIsTag(false);
        setIsTag2(false);
        setTag('')
        setIsTag(false);
        setIsTag2(false);
        setCancel2('x')
        setContent('')
        return false
    }



    async function addPhotos(ev) {
        ev.stopPropagation();
        const files = ev.target.files;
        if (files.length > 0) {
            setIsUploading(true);
            for (const file of files) {
                const newName = Date.now() + file.name;
                const result = await supabase
                    .storage
                    .from('photos')
                    .upload(newName, file);
                if (result.data) {
                    const url = process.env.NEXT_PUBLIC_SUPABASE_URL + '/storage/v1/object/public/photos/' + result.data.path;
                    setUploads(prevUploads => [...prevUploads, url]);
                } else {
                    console.log(result);
                }
            }
            setIsUploading(false);
        }
    }

    async function addvideo(ev) {
        ev.stopPropagation();
        const files = ev.target.files;
        if (files.length > 0) {
            setIsUploading(true);
            for (const file of files) {
                const newName = Date.now() + file.name;
                const result = await supabase
                    .storage
                    .from('video')
                    .upload(newName, file);
                if (result.data) {
                    const url = process.env.NEXT_PUBLIC_SUPABASE_URL + '/storage/v1/object/public/video/' + result.data.path;
                    setVideoFilePath(prevVideoFilePath => [...prevVideoFilePath, url]);
                } else {
                    console.log(result);
                }
            }
            setIsUploading(false);
        }

    }

    async function cancelPhotos(fileUrl) {
        for (const url of fileUrl) {
            const path = url.replace(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/photos/`, '');

            const { data, error } = await supabase.storage
                .from('photos')
                .remove(path);
            setUploads([]);

            if (error) {
                console.error(error);
            }
        }
    }


    async function deletedVideo(videoUrl) {
        for (const url of videoUrl) {
            const path = url.replace(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/video/`, '');

            const { data, error } = await supabase.storage
                .from('video')
                .remove(path);
            setVideoFilePath([])

            if (error) {
                console.error(error);
            } else {
                console.log(`File ${path} has been deleted from storage`);
            }
        }
    }



    return (
        <Card roundedbottom={true}>
            <div className='flex gap-2 mb-1 md:mt-1 mt-2 items-center text-black'>
                <Link href={'profile/' + profile?.id} className=''>
                    <Avatar url={profile?.avatar} />
                </Link>
                {profile && (
                    <textarea value={content} onChange={e => setContent(e.target.value)} className='grow p-3 bg-black outline-none rounded-3xl overflow-y-auto h-[52px] text-white text-lg  overflow-hidden' placeholder={`What's on your mind?`} />
                )}
            </div>

            {/* PHOTO UPLODAING AND VIDEO UPLOADING */}
            <div className='flex flex-wrap gap-[13px] my-1 mt-2 items-start '>
                {uploads.length > 0 && (
                    <div className="flex gap-2 relative  items-end">
                        {uploads.map((upload,idx) => (
                            <div key={idx} className="" >
                                <img src={upload} alt="" className="w-auto h-20 rounded-md" />
                            </div>
                        ))}
                    </div>

                )}
                {
                    uploads.length > 0 && (
                        <div className="flex justify-end mb-0 p-0 relative">
                            <button onClick={() => cancelPhotos(uploads)} className=' absolute -top-4 p-0 right-[1px] text-base font-semibold text-gray-300 z-10 hover:text-gray-500'>x</button>
                        </div>
                    )
                }

                {videoFilePath.length > 0 && (
                    <div className="flex relative items-start">
                        {videoFilePath.map((video,idx) => (
                            <div key={idx} className=' rounded-md overflow-hidden'>
                                <ReactPlayer url={video} width='auto' height='90px' controls={true} />
                            </div>
                        ))}
                    </div>
                )}
                {
                    videoFilePath.length > 0 && (
                        <div className="flex justify-end gap-0 mb-0 p-0 relative">
                            <button onClick={() => deletedVideo(videoFilePath)} className=' absolute -top-4 p-0 right-[1px] text-base font-semibold text-red-200 hover:text-gray-500'>x</button>
                        </div>
                    )
                }

                {isUploading && (
                    <div className='h-[92px] mt-2 w-24  inset-0 bg-[#2b2b2b36] bg-opacity-10 rounded-md z-10 flex justify-center items-center relative mx-1'>
                        <Preloader size={40} />
                    </div>
                )}
            </div>
            <div className=' md:hidden items-center flex-nowrap ml-2 pt-1 flex justify-center relative'>
                <h1 className=' text-center text-socialBlue mb-1'>{!emoji ? "" : moods} {emoji}</h1>
                <div>
                    <button onClick={() => { setIsMood(ismood); setMoods(''); setEmoji(null); setCancel('') }} className=" -top-[5px] absolute text-base font-semibold px-2 bg-transparent text-gray-300  hover:text-gray-500">
                        {cancel}
                    </button>
                </div>
            </div>
            <div className='flex md:gap-3 gap-3 items-center mt-2 relative'>
                <div id='photo_upload'>
                    <label className='flex md:gap-1 gap-[2px] cursor-pointer hover:text-blue-400 '>
                        <input type="file" accept='image/*' className='hidden' multiple onChange={addPhotos} />
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                        </svg>
                        <span className='md:block hidden'>Photos</span>
                    </label>
                </div>
                <div id='video_upload'>
                    <label className='flex md:gap-1 gap-[2px] cursor-pointer hover:text-blue-400 '>
                        <input type="file" accept='video/*' className='hidden' multiple onChange={addvideo} />
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5h1.5C5.496 19.5 6 18.996 6 18.375m-3.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-1.5A1.125 1.125 0 0118 18.375M20.625 4.5H3.375m17.25 0c.621 0 1.125.504 1.125 1.125M20.625 4.5h-1.5C18.504 4.5 18 5.004 18 5.625m3.75 0v1.5c0 .621-.504 1.125-1.125 1.125M3.375 4.5c-.621 0-1.125.504-1.125 1.125M3.375 4.5h1.5C5.496 4.5 6 5.004 6 5.625m-3.75 0v1.5c0 .621.504 1.125 1.125 1.125m0 0h1.5m-1.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125m1.5-3.75C5.496 8.25 6 7.746 6 7.125v-1.5M4.875 8.25C5.496 8.25 6 8.754 6 9.375v1.5m0-5.25v5.25m0-5.25C6 5.004 6.504 4.5 7.125 4.5h9.75c.621 0 1.125.504 1.125 1.125m1.125 2.625h1.5m-1.5 0A1.125 1.125 0 0118 7.125v-1.5m1.125 2.625c-.621 0-1.125.504-1.125 1.125v1.5m2.625-2.625c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125M18 5.625v5.25M7.125 12h9.75m-9.75 0A1.125 1.125 0 016 10.875M7.125 12C6.504 12 6 12.504 6 13.125m0-2.25C6 11.496 5.496 12 4.875 12M18 10.875c0 .621-.504 1.125-1.125 1.125M18 10.875c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125m-12 5.25v-5.25m0 5.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125m-12 0v-1.5c0-.621-.504-1.125-1.125-1.125M18 18.375v-5.25m0 5.25v-1.5c0-.621.504-1.125 1.125-1.125M18 13.125v1.5c0 .621.504 1.125 1.125 1.125M18 13.125c0-.621.504-1.125 1.125-1.125M6 13.125v1.5c0 .621-.504 1.125-1.125 1.125M6 13.125C6 12.504 5.496 12 4.875 12m-1.5 0h1.5m-1.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125M19.125 12h1.5m0 0c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h1.5m14.25 0h1.5" />
                        </svg>
                        <span className='md:block hidden'>Video</span>
                    </label>
                </div>

                <div className='flex'>
                    {ismood && (
                        <div className=' relative'>
                            <label className='flex md:gap-1 gap-[2px] cursor-pointer bg-black text-black'>
                                <input type="text" value={moods} className='border rounded-3xl px-2 outline-none py-1 md:w-full w-[187px]' placeholder='feeling happy !' onChange={e => setMoods(e.target.value)} />
                            </label>
                            <div className=' absolute top-11 z-10 -right-[100px]'>
                                <Picker data={data} previewPosition="none" onEmojiSelect={(e) => { setEmoji(e.native); setIsMood(false); setIsMood2(true); setCancel('x') }} />
                            </div>
                        </div>
                    )}
                    {!ismood2 && (
                        <button id='moods_id' onClick={() => { setIsMood2(true); setIsMood(true) }} className='flex gap-[2px] items-center hover:text-blue-400 '>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z" />
                            </svg>
                            <span className='md:flex hidden'>Mood</span>
                        </button>
                    )}
                    {ismood && (
                        <button onClick={() => { setIsMood(false); setIsMood2(false); setMoods(''); setEmoji(null) }} className="inline-flex  bg-black py-1 px-1 text-gray-300 hover:text-gray-500">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    )}

                    <div className=' md:inline-flex items-center flex-nowrap mx-2 pt-1 hidden  relative'>
                        <h1 className=' text-center text-socialBlue mb-1'>{!emoji ? "" : moods} {emoji}</h1>
                        <button onClick={() => { setIsMood(ismood); setIsMood2(false); setMoods(''); setEmoji(null); setCancel('') }} className="-right-[18px] -top-[5px] absolute text-base font-semibold px-2 bg-transparent text-gray-300  hover:text-gray-500">
                            {cancel}
                        </button>
                    </div>

                </div>


                <div className='grow text-right'>
                    {!isTag2 && (
                        <button onClick={() => { setIsTag2(false); setIsTag(true) }} className='bg-blue-500 hover:bg-blue-600 text-white md:px-6 px-3 py-1 rounded-md'>Share</button>
                    )}
                </div>
            </div>

            {/* tag */}
            {isTag && (
                <div className=' fixed md:h-60 h-44 md:w-[46%] w-full md:left-[26%] md:top-[170px] top-72  left-0 rounded-md shadow-lg shadow-gray-800 bg-blue-600 z-20 grid grid-cols-1 grid-rows-3 justify-center items-center md:p-4 p-3 gap-0'>
                    {isTag && (
                        <>
                            <button onClick={cancelPost} className="bg-red-600 text-3xl font-semibold leading-4 absolute right-0 top-0 md:py-2 py-3 px-2 text-gray-900 hover:text-gray-500">
                                x
                            </button>
                            <h2 className='text-lg text-center font-semibold'>Do you want to add some tags !</h2>
                            <div className='relative mt-0 flex justify-center items-center w-full'>
                                <button className='bg-blue-800 text-white absolute right-0 top-0 py-[9px] rounded-r-3xl px-3 hover:bg-blue-700 font-semibold' onClick={(e) => { e.stopPropagation(); setIsTag(true); setIsTag2(false); setCancel2('x') }} >Add</button>
                                <label className='flex cursor-pointer w-[inherit] text-black'>
                                    <input type="text" value={tag} className='border w-full rounded-3xl px-2 outline-none py-2' placeholder='Add tags e.g social,personal,photos' onChange={e => setTag(e.target.value.split(','))} />
                                </label>

                            </div>
                        </>
                    )}

                    <div className={`${cancel2 ? 'md:inline-flex relative max-w-max ' : 'hidden'} items-center flex-nowrap ml-2 pt-1 hidden  relative`}>
                        <h1 className=' text-center text-white mb-1'>{!tag ? '' : `${`#${tag}`}`}</h1>
                        <button onClick={() => { setIsTag(isTag); setIsTag2(false); setTag(''); setCancel2('') }} className=" -right-5 -top-[6px] absolute text-base font-semibold px-2 bg-transparent text-gray-300  hover:text-gray-500">
                            {cancel2}
                        </button>
                    </div>

                    <div className=' inline '>
                        {isTag && (
                            <div className=' flex justify-end items-center '>
                                <button className=' z text-white  bg-blue-800  hover:bg-blue-700 rounded-md px-4 py-1' onClick={createPost}>Post</button>
                            </div>
                        )}
                    </div>
                </div>
            )}


            <ReactTooltip
                anchorId="video_upload"
                place="bottom"
                variant="info"
                content="Share your videos"
                style={{ zIndex: '30' }}
            />
            <ReactTooltip
                anchorId="photo_upload"
                place="bottom"
                variant="info"
                content="Share your photos"
                style={{ zIndex: '30' }}
            />
            <ReactTooltip
                anchorId="moods_id"
                place="bottom"
                variant="info"
                content="Share your mood"
                style={{ zIndex: '30' }}
            />
        </Card>
    )
}

export default PostFomCard
