import { useSupabaseClient } from '@supabase/auth-helpers-react';
import Link from 'next/link';
import React, { useEffect, useState } from 'react'
import ReactTimeAgo from 'react-time-ago';
import Avatar from './Avatar';
import Preloader from './Preloader';
import millify from 'millify'

const Comments = ({ comment, fetchComments, isCommentbyme, myProfile, id, authorProfile }) => {

    const [isDelete, setIsDelete] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [commentlike, setCommentLike] = useState([]);

    const supabase = useSupabaseClient();


    useEffect(() => {
        fetchComments()

        fetchCommentLikes();

    }, [myProfile?.id]);


    function fetchCommentLikes() {
        supabase.from('commentlikes').select().eq('post_idc', id).eq('comment_id', comment.id)
            .then(result => setCommentLike(result.data));
    }

    function deleteComment(ev) {
        ev.stopPropagation()
        setIsDelete(false)
        setIsUploading(true)
        if (isCommentbyme) {
            supabase.from('posts').delete()
                .eq('parent', id)
                .eq('id', comment.id)
                .eq('author', myProfile.id)
                .then(result => {
                    console.log('fetch comments', result);
                    fetchComments();
                    setIsUploading(false)
                })

        }

    }

    const isLikedByMeComment = !!commentlike?.find(likec => likec.user_idc === myProfile?.id);

    function toggleCommentLike(ev) {

        // console.log('isLikedByMeComment',comment.id)

        if (isLikedByMeComment) {
            supabase.from('commentlikes').delete()
                .eq('post_idc', id)
                .eq('comment_id', comment.id)
                .eq('user_idc', myProfile.id)
                .then((result) => {
                    fetchCommentLikes();
                });
            return;
        }
        supabase.from('commentlikes')
            .insert({
                post_idc: id,
                comment_id: comment.id,
                user_idc: myProfile.id,
            })
            .then(result => {
                fetchCommentLikes();
            })

    }



    return (
        <div>
            <div key={comment.id} onClick={(e) => { e.stopPropagation(); setIsDelete(false) }} className=" flex gap-2 mb-3 items-center relative px-2 bg-[#131313] text-white" >
                {isUploading && (
                    <div className='absolute  z-20 flex justify-center bg-[#131313] rounded-3xl items-center h-full w-96'>
                        <Preloader size={40} />
                    </div>
                )}
                <Avatar url={comment?.profiles?.avatar} />
                <div className=" py-1 px-[6px] rounded-3xl relative w-full">
                    <div className='relative p-0'>
                        <Link href={'/profile/' + comment?.profiles?.id}>
                            <span className="hover:underline font-semibold text-base text-white mr-[6px]">
                                {comment?.profiles?.name}
                            </span>
                        </Link>
                        <span className="text-sm text-gray-400">
                            <ReactTimeAgo timeStyle={'twitter'} date={comment?.created_at} />
                        </span>
                        {comment?.profiles?.id === myProfile?.id && (
                            <div className=' inline-block'>
                                <button onClick={(e) => { e.stopPropagation(); setIsDelete(!isDelete) }} className='p-0 absolute hover:font-semibold hover:text-gray-400 text-gray-100 right-0 top-0'>
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z" />
                                    </svg>
                                </button>
                            </div>
                        )}

                        {isDelete && (
                            <div className='absolute top-7 right-0 border  z-20 bg-black px-1 py-2 rounded-md '>
                                <button onClick={deleteComment} className='p-1 flex gap-1 hover:text-black hover:bg-socialBlue rounded-md text-white text-sm items-center '>
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                    </svg>
                                    delete</button>
                            </div>
                        )}
                        <p className="text-[16px] font-[400] mb-[30px] py-0 mt-0 leading-5">{comment?.content}</p>
                    </div>

                    {/* likes */}

                    <button className='absolute bottom-1 flex gap-1 items-center' onClick={toggleCommentLike}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={"w-5 h-5 " + (isLikedByMeComment ? 'fill-red-400 text-red-500 border-0' : '')}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6.633 10.5c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 012.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 00.322-1.672V3a.75.75 0 01.75-.75A2.25 2.25 0 0116.5 4.5c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 01-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 00-1.423-.23H5.904M14.25 9h2.25M5.904 18.75c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 01-.521-3.507c0-1.553.295-3.036.831-4.398C3.387 10.203 4.167 9.75 5 9.75h1.053c.472 0 .745.556.5.96a8.958 8.958 0 00-1.302 4.665c0 1.194.232 2.333.654 3.375z" />
                        </svg>
                        {commentlike?.length === 0 ? '' : millify(commentlike?.length)}
                    </button>
                </div>
            </div>

        </div>
    )
}

export default Comments
