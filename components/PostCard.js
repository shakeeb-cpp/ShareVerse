import React, { useContext, useEffect, useState } from 'react'
import Avatar from './Avatar'
import Card from './Card'
import Link from 'next/link'
import ReactTimeAgo from 'react-time-ago'
import { UserContext } from '@/contexts/UserContext'
import ReactPlayer from 'react-player'
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react'
import Comments from './Comments'
import { Tooltip as ReactTooltip } from "react-tooltip";
import millify from 'millify'


const PostCard = ({ id, content, profiles: authorProfile, created_at, photos, video, moods, emoji, tag, fetchPosts, posts, shared_avatar, shared_name, shared_content, sharedposting, shared_id, sharedLength }) => {

    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [likes, setLikes] = useState([]);
    const [comments, setComments] = useState([]);
    const [commentText, setCommentText] = useState('');
    const [showcomment, setShowComment] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [isreport, setisreport] = useState(false);
    const [isreport2, setisreport2] = useState(false);
    const [messages, setMessages] = useState('');
    const [isShare, setIsShare] = useState(false);
    const [shareContent, setShareContent] = useState('');
    const [showScrollButton, setShowScrollButton] = useState(false);

    const [newPostCount, setNewPostCount] = useState(0);

    const { profile: myProfile } = useContext(UserContext);

    const supabase = useSupabaseClient();


    function fetchLikes() {
        setIsUploading(true)
        supabase.from('likes').select().eq('post_id', id)
            .then(result => {
                setLikes(result.data);
                setIsUploading(false)
            });

    }

    useEffect(() => {

        //real-time updates for likes
        const likeChannel = supabase
            .channel('table-db-changes')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'likes',
                },
                payload => {
                    setLikes(prevLikes => [...prevLikes, payload.new]);
                }
            )
            .subscribe();

        // real-time updates for posts
        const postChannel = supabase.channel('posts')
            .on('postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'posts',
                }, payload => {
                    // fetchPosts()
                    if (payload.eventType === 'INSERT' && payload.new.parent === null) {
                        setNewPostCount(count => count + 1);
                    }
                    if (payload.new.parent === id) {
                        setNewPostCount(0);
                        fetchComments()
                    }
                }).subscribe();


        fetchComments();

        window.addEventListener('scroll', handleScroll);

        if (myProfile?.id) fetchIsSaved();

        return () => {
            likeChannel.unsubscribe();
            postChannel.unsubscribe();
            window.removeEventListener('scroll', handleScroll);
            // commentSubscription.unsubscribe();
        };
    }, [myProfile?.id]);


    useEffect(() => {
        fetchLikes();
    }, [likes]);

    const handleScroll = () => {
        const scrollPercentage = window.scrollY / (document.body.scrollHeight - window.innerHeight);
        setShowScrollButton(scrollPercentage >= 0.1);
    }


    const handleScrollToTop = () => {
        fetchPosts()
        setNewPostCount(0);
        setShowScrollButton(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };


    useEffect(() => {
        let timeoutId;
        if (newPostCount > 0) {
            timeoutId = setTimeout(() => {
                setNewPostCount(0);
            }, 7000);
        }
        return () => {
            clearTimeout(timeoutId);
        };
    }, [newPostCount]);

    function fetchIsSaved() {
        supabase
            .from('saved_posts')
            .select()
            .eq('post_id', id)
            .eq('user_id', myProfile?.id)
            .then(result => {
                if (result?.data?.length > 0) {
                    setIsSaved(true);
                } else {
                    setIsSaved(false);
                }
            })
    }





    function fetchComments() {
        supabase.from('posts')
            .select('*, profiles(*)')
            .eq('parent', id)
            .then(result => setComments(result.data));
    }


    // This is for image displaying
    function showUp(imgs) {
        imgs.stopPropagation();
        let expandImg = document.getElementById("expandedImg");
        let imgText = document.getElementById("imgtext");
        expandImg.src = imgs.target.src
        imgText.innerHTML = imgs.target.alt;
        expandImg.parentElement.style.display = "block";
        document.getElementById("container").style.backgroundColor = 'rgb(2 2 2 / 95%)'
    }
    const handleClick = (e) => {
        let expandImg = document.getElementById("expandedImg");
        expandImg.parentElement.style.display = "none";
    }


    function toggleSave() {
        if (isSaved) {
            supabase.from('saved_posts')
                .delete()
                .eq('post_id', id)
                .eq('user_id', myProfile?.id)
                .then(result => {
                    setIsSaved(false);
                    setDropdownOpen(false);
                });
        }
        if (!isSaved) {
            supabase.from('saved_posts').insert({
                user_id: myProfile.id,
                post_id: id,
            }).then(result => {
                setIsSaved(true);
                setDropdownOpen(false);
            });
        }
    }


    const isLikedByMe = !!likes?.find(like => like.user_id === myProfile?.id);

    const isCommentbyme = !!comments?.map(comment => comment.author === myProfile?.id);



    function toggleLike() {
        if (isLikedByMe) {
            supabase.from('likes').delete()
                .eq('post_id', id)
                .eq('user_id', myProfile.id)
                .then((result) => {
                    console.log('result deleted', result)
                    setLikes(prevLikes => prevLikes.filter(like => like.user_id !== myProfile.id));
                });
            return;
        }
        supabase.from('likes')
            .insert({
                post_id: id,
                user_id: myProfile.id,
            })
            .then(result => {
                console.log('result like', result);
                const newLike = result.data && result.data.length > 0 ? result.data[0] : null;
                if (newLike) {
                    setLikes(prevLikes => [...prevLikes, newLike]);
                }
            })


    }



    function postComment(ev) {
        ev.preventDefault();
        setShowComment(true)
        setIsUploading(true)
        supabase.from('posts')
            .insert({
                content: commentText,
                author: myProfile.id,
                parent: id,
            })
            .then(result => {
                // console.log(result)
                fetchComments();
                setCommentText('');
                setIsUploading(false)
            })
    }

    function addReport() {
        supabase.from('reports').insert({
            user_id: authorProfile.id,
            name: myProfile.name,
            avatar: myProfile.avatar,
            message: messages,
            my_id: myProfile?.id
        }).then(result => {
            console.log('addReport', result)
        });

        setisreport(false);
        setisreport2(false);
    }



    function deletePost(photo, vid) {
        if (authorProfile?.id === myProfile?.id) {
            supabase.from('posts').delete()
                .eq('id', id)
                .eq('author', authorProfile.id)
                .then(result => {
                    console.log('delete', result)
                    fetchPosts();
                })

        }
        if (photo && !shared_id) {
            for (const url of photo) {
                const path = url.replace(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/photos/`, '');

                supabase.storage
                    .from('photos')
                    .remove(path)
                    .then(result => console.log('photo', result))
            }
        }

        if (vid) {
            for (const url of vid) {
                const path = url.replace(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/video/`, '');
                supabase.storage
                    .from('video')
                    .remove(path)
                    .then(result => console.log('video', result))

            }
        }




    }


    function sharedPost(postId, post, author_id) {
        post.map(item => (
            postId === item.id && (
                supabase.from('posts').insert({
                    author: myProfile.id,
                    content: item.content,
                    photos: item.photos,
                    video: item.video,
                    tag: item.tag,
                    shared_avatar: authorProfile.avatar,
                    shared_name: authorProfile.name,
                    shared_content: shareContent,
                    sharedposting: true,
                    shared_id: author_id
                }).then(response => {
                    console.log('shared', response)
                    setShareContent('')
                    setIsShare(false)
                    fetchPosts()
                })
            )
        ))
        // push notifications
        const notifications = posts.reduce((acc, post) => {
            if (myProfile.id !== post?.profiles?.id) {
                if (!acc.seenIds.includes(post?.profiles?.id)) {
                    acc.seenIds.push(post?.profiles?.id);
                    acc.data.push({
                        user_id: post?.profiles?.id,
                        name: myProfile.name,
                        avatar: myProfile.avatar,
                        username: post?.profiles?.name,
                        my_id: myProfile.id,
                        message: shareContent
                    });
                }
            }
            return acc;
        }, { data: [], seenIds: [] }).data;


        supabase.from('notifications').insert(notifications).then(result => {
            console.log('notifications', result)
        });
    }


    async function downloadPost(photo, vid) {
        if (photo) {
            for (const url of photo) {
                const downloadUrl = url.replace(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/photos/`, '');

                const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/photos/${downloadUrl}`, {
                    headers: {
                        Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
                    },
                });

                const blob = await response.blob();

                const link = document.createElement('a');
                link.href = window.URL.createObjectURL(blob);
                link.download = downloadUrl;
                link.click();
                setDropdownOpen(false)
            }
        }
        if (vid) {
            for (const url of vid) {
                const dwonloadVid = url.replace(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/video/`, '');

                const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/video//${dwonloadVid}`, {
                    headers: {
                        Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
                    },
                });

                const blob = await response.blob();

                const link = document.createElement('a');
                link.href = window.URL.createObjectURL(blob);
                link.download = dwonloadVid;
                link.click();
                setDropdownOpen(false)
            }
        }
    }

    return (
        <div className=' border-x-0 border-y border-[#1b1b1b]' onClick={(e) => { e.stopPropagation(); setDropdownOpen(false) }}>
            <Card>
                {showScrollButton && newPostCount > 0 &&
                    <div className=' flex justify-center relative'>
                        <button className=' flex items-center gap-1 bg-red-500 py-[3px] fixed top-3 rounded-3xl shadow-md shadow-[#141414b7] z-20 px-6 text-white ' onClick={handleScrollToTop}>
                            <span className=' text-[17px]'>&#8593;</span>
                            See New Post{newPostCount > 1 && 's'}
                        </button>
                    </div>
                }

                <div className="flex gap-3" >
                    <div>
                        <Link href={'profile/' + authorProfile?.id} className='cursor-pointer'>
                            <Avatar url={!authorProfile?.avatar ? 'https://cdn-icons-png.flaticon.com/128/3135/3135715.png' : authorProfile?.avatar} />
                        </Link>
                    </div>

                    <div className='grow'>
                        <p><Link href={'profile/' + authorProfile?.id} className=" cursor-pointer font-semibold hover:underline underline-offset-2">{authorProfile?.name}</Link> shared a <span className=" text-socialBlue">{photos?.length > 0 ? 'Photo' : (video?.length > 0 ? 'Video' : 'Post')}</span></p>
                        <div className=' flex gap-2'>
                            <p className=" text-gray-400 text-sm"><ReactTimeAgo date={created_at} /></p>
                            <p className=" text-gray-400 text-sm font-semibold">{moods}{emoji}</p>
                        </div>

                    </div>

                    <div className=''>
                        <button className={"flex text-gray-200 hover:text-gray-400 hover:font-bold"} onClick={(e) => { e.stopPropagation(); setDropdownOpen(!dropdownOpen) }}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM12.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM18.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                            </svg>
                        </button>
                        <div className=' relative z-20 my-3 '>
                            {dropdownOpen && (
                                <div className='absolute md:-right-6 right-2 bg-black  p-3 rounded-md border border-gray-100 w-52'>
                                    <button onClick={toggleSave} className="w-full -my-2 p-0 ">
                                        <span className="flex gap-3 w-full py-3  my-1 hover:bg-socialBlue hover:text-black rounded-md transition-all  ">
                                            {isSaved && (
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l1.664 1.664M21 21l-1.5-1.5m-5.485-1.242L12 17.25 4.5 21V8.742m.164-4.078a2.15 2.15 0 011.743-1.342 48.507 48.507 0 0111.186 0c1.1.128 1.907 1.077 1.907 2.185V19.5M4.664 4.664L19.5 19.5" />
                                                </svg>
                                            )}
                                            {!isSaved && (
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
                                                </svg>
                                            )}
                                            {isSaved ? 'Remove from saved' : 'Save post'}
                                        </span>
                                    </button>

                                    {/* post deleting */}
                                    {authorProfile?.id === myProfile?.id && (
                                        <button onClick={() => deletePost(photos, video)} className='flex gap-3 w-full py-3  my-1 hover:bg-socialBlue hover:text-black -mx-1 px-1 rounded-md transition-all  '><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                        </svg>
                                            Delete
                                        </button>
                                    )}

                                    {/* download */}
                                    {photos?.length > 0 || video?.length > 0 ? (
                                        <button onClick={() => downloadPost(photos, video)} className='flex gap-3 w-full py-3  my-1 hover:bg-socialBlue hover:text-black -mx-1 px-1 rounded-md transition-all  '><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                                        </svg>
                                            Download
                                        </button>
                                    ) : null}

                                    {authorProfile?.id !== myProfile?.id && (
                                        !isreport2 && (
                                            <button onClick={() => { setisreport2(false); setisreport(true) }} className='flex gap-3 w-full py-3  my-1 hover:bg-socialBlue hover:text-black -mx-1 px-1 rounded-md transition-all  '><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                                            </svg>
                                                Report
                                            </button>
                                        )
                                    )}
                                </div>
                            )}
                        </div>

                    </div>
                </div>




                {/* shared post */}
                {sharedposting && (
                    <>
                        <div>
                            <p className='my-4 pl-[2px] text-base'>{shared_content}</p>
                        </div>

                        <div className='flex gap-3 items-center bg-[#131313] rounded-t-xl px-3 pt-3'>
                            <div>
                                <Link href={'profile/' + shared_id} className='cursor-pointer'>
                                    <Avatar url={shared_avatar} />
                                </Link>
                            </div>

                            <div className='grow'>
                                <p><Link href={'profile/' + shared_id} className=" cursor-pointer font-semibold hover:underline underline-offset-2">{shared_name}</Link></p>
                            </div>
                        </div>
                    </>
                )}


                <div className={sharedposting ? 'bg-[#131313] rounded-b-xl px-3 pb-3 pt-3 mt-0' : ''}>
                    <div>
                        <p className={sharedposting ? 'my-3 mt-0 pl-[2px] pr-10 text-base' : 'my-3 mt-4 pl-[2px] md:pr-10 pr-4 text-base'}>{content}</p>

                        {/* tags */}
                        <div className='flex gap-2 mb-2'>
                            {tag?.length > 0 && tag?.map((tags,idx) => (
                                <Link key={idx} href={tags} className=' text-socialBlue hover:text-blue-700  cursor-pointer'>{`#${tags} `}</Link>
                            ))}</div>

                        {photos?.length > 0 && (
                            <div div className='grid grid-cols-2 md:gap-3 gap-2'>
                                {photos?.length > 1 && photos.map((photo, index) => (
                                    <div key={index} className='flex items-center '>
                                        <img onClick={showUp} className='rounded-md object-cover  cursor-pointer w-full h-full blur-none' src={photo} alt="Image" />
                                    </div>
                                ))}
                            </div>
                        )}

                        {photos?.length > 0 && (
                            <div className='grid grid-cols-1 md:gap-3 gap-2'>
                                {photos?.length <= 1 && photos.map((photo, index) => (
                                    <div key={index} className='flex items-center '>
                                        <img onClick={showUp} className='rounded-md object-cover  cursor-pointer w-full h-full blur-none' src={photo} alt="Image" />
                                    </div>
                                ))}
                            </div>
                        )}

                        {video?.length > 0 && (
                            <div className="flex justify-center gap-2">
                                {video.map((vid, index) => (
                                    <div key={index} className='flex items-center justify-center rounded-md overflow-hidden'>
                                        <ReactPlayer playing={true} muted={true} url={vid} width='100%' height='100%' controls={true} />
                                    </div>
                                ))}
                            </div>
                        )}

                    </div>
                </div>

                {/* like */}
                <div className='mt-5 flex gap-6'>
                    <button className='flex gap-1 items-center' onClick={toggleLike}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={"w-6 h-6 " + (isLikedByMe ? 'fill-red-400 text-red-500 border-0' : '')}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                        </svg>
                        {likes?.length === 0 ? '' : millify(likes?.length)}
                    </button>

                    {/* comments */}
                    <button onClick={() => setShowComment(!showcomment)} className="flex gap-1 items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.76c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.076-4.076a1.526 1.526 0 011.037-.443 48.282 48.282 0 005.68-.494c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                        </svg>
                        {comments?.length === 0 ? '' : millify(comments?.length)}
                    </button>

                    {/* share */}
                    {!sharedposting && (
                        <button className="flex gap-1 items-center" onClick={() => setIsShare(!isShare)}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
                            </svg>
                        </button>
                    )}
                </div>
                {/*adding comment section*/}
                <div className="flex mt-4 gap-3">
                    <div>
                        <Avatar url={myProfile?.avatar} />
                    </div>
                    <div className="bg-black text-black grow rounded-full relative">
                        <form className='relative' onSubmit={postComment}>
                            <button className='py-[10px] rounded-r-3xl px-3 pl-4 absolute right-0 bg-blue-500 z-10 hover:bg-blue-600 text-white ' onClick={postComment}>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                                </svg>
                            </button>
                            <input
                                value={commentText}
                                onChange={ev => setCommentText(ev.target.value)}
                                className="block w-full py-2 px-4 overflow-hidden h-11 rounded-full outline-none" placeholder="Leave a comment" />
                        </form>
                        <button className="absolute top-3 right-3 text-gray-400">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* comments */}
                <div className='flex justify-start items-center relative'>
                    <button onClick={() => setShowComment(!showcomment)} className='my-2 mt-3 text-slate-100 font-[400] '>{showcomment ? (
                        <div className='flex items-end gap-[5px]'>
                            <span className=' text-[16px] text-gray-400'>Comments</span>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-[20px] h-[20px] hover:text-slate-300 hover:font-bold">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </div>
                    ) : (
                        <div id='comments' className='flex items-center gap-[5px]'>
                            <span className=' text-[16px] text-gray-400'>Comments</span>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-[20px] h-[20px] hover:text-slate-300 hover:font-semibold">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                            </svg>
                        </div>
                    )}</button>
                </div>
                {
                    showcomment && (
                        <div className='rounded-2xl p-0 py-[10px] bg-[#131313]'>
                            {comments?.length > 0 && comments.map(comment => (
                                <Comments key={comment} comments={comments} comment={comment} fetchComments={fetchComments} isCommentbyme={isCommentbyme} myProfile={myProfile} id={id} authorProfile={authorProfile} />
                            ))}
                            {comments?.length === 0 && (
                                <div className='rounded-3xl py-2 px-2 bg-[#131313] flex justify-center'>
                                    <h1>No comments yet !</h1>
                                </div>
                            )}

                            {/* {comments?.length > 0 && (
                            isUploading && (
                                <div className='flex justify-center bg-[#131313]  rounded-3xl items-center h-16'>
                                    <Preloader size={40} />
                                </div>
                            )
                        )} */}

                        </div>


                    )
                }



                {/* report */}
                {
                    isreport && (
                        <div className=' fixed h-60 md:w-[46%] w-full md:left-[26%] md:top-[170px] top-72  left-0 rounded-md  bg-blue-600 z-20 grid grid-cols-1 grid-rows-3 justify-center items-center p-4 gap-0'>
                            {isreport && (
                                <>
                                    <button onClick={() => { setisreport(false); setisreport2(false) }} className="bg-blue-600 text-3xl font-semibold leading-4 absolute right-0 top-0 py-1 px-2 text-gray-900 hover:text-black">
                                        x
                                    </button>
                                    <h2 className='text-lg text-center font-semibold'>Report on this Post !</h2>
                                    <div className='relative mt-0 flex justify-center items-center w-full'>
                                        <label className='flex cursor-pointer w-[inherit] text-black'>
                                            <input type="text" value={messages} onChange={e => setMessages(e.target.value)} className='border w-full rounded-3xl px-2 outline-none py-2' placeholder='Report ...' />
                                        </label>

                                    </div>
                                </>
                            )}
                            <div className=' inline '>
                                {isreport && (
                                    <div className=' flex justify-end items-center '>
                                        <button onClick={addReport} className=' text-white  bg-blue-800 hover:bg-blue-700 rounded-md px-4 py-1'>Report</button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )
                }


                {/* share */}
                {
                    isShare && (
                        <div className=' fixed h-60 md:w-[46%] w-full md:left-[26%] md:top-[170px] top-72  left-0 rounded-md  bg-blue-600 z-20 grid grid-cols-1 grid-rows-3 justify-center items-center p-4 gap-0'>
                            {isShare && (
                                <>
                                    <button onClick={() => setIsShare(false)} className="bg-blue-600 text-3xl font-semibold leading-4 absolute right-0 top-0 py-1 px-2 text-gray-900 hover:text-black">
                                        x
                                    </button>
                                    <h2 className='text-lg text-center font-semibold'>Say something about this !</h2>
                                    <div className='relative mt-0 flex justify-center items-center w-full'>
                                        <label className='flex cursor-pointer w-[inherit] text-black'>
                                            <input type="text" value={shareContent} onChange={e => setShareContent(e.target.value)} className='border w-full rounded-3xl px-2 outline-none py-2' placeholder='Whats on your mind ...' />
                                        </label>

                                    </div>
                                </>
                            )}
                            <div className=' inline '>
                                {isShare && (
                                    <div className=' flex justify-end items-center '>
                                        <button onClick={() => sharedPost(id, posts, authorProfile.id)} className=' text-white  bg-blue-800 hover:bg-blue-700 rounded-md px-4 py-1'>Share</button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )
                }

                <ReactTooltip
                    anchorId="comments"
                    place="bottom"
                    variant="info"
                    content="show comments"
                />

            </Card >

            {/* // This div is for image displaying */}
            < div id='container' onClick={handleClick} className=" w-full h-full md:py-10 px-4 bg-[#000000d2] z-20 fixed flex inset-0 cursor-pointer justify-center items-center " style={{ display: 'none' }}>
                <div onClick={handleClick} className=' absolute left-4 top-4 bg-gray-100 hover:bg-gray-300 rounded-full px-[9px] text-black text-center pb-[3px] text-base font-semibold'>x</div>
                <img id="expandedImg" className=' w-full h-full object-contain' />
                <div id="imgtext" className=' absolute left-4 bottom-4 text-white text-2xl'></div>
            </div >
        </div >

    )


}

export default PostCard
