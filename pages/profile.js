import Layout from "../components/Layout";
import Card from "../components/Card";
import Avatar from "../components/Avatar";
import { useRouter } from "next/router";
import { useEffect, useId, useState } from "react";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import Cover from "../components/Cover";
import ProfileTabs from "../components/ProfileTabs";
import ProfileContent from "../components/ProfileContent";
import { UserContextProvider } from "../contexts/UserContext";
import Preloader from "@/components/Preloader";
import Link from "next/link";
import millify from 'millify';

export default function ProfilePage() {

    const [profile, setProfile] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [name, setName] = useState('');
    const [place, setPlace] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [isFollow, setIsFollow] = useState(false);
    const [following, setFollowing] = useState([]);
    const [follower, setFollower] = useState([]);
    const [about, setAbout] = useState('');


    const router = useRouter();
    const tab = router?.query?.tab?.[0] || 'posts';
    const session = useSession();
    const userId = router.query.id;

    const supabase = useSupabaseClient();




    useEffect(() => {
        if (!userId) {
            return;
        }

        fetchUser();

        fetchFollowers()
        fetchFollowing()

        // check isfollowed
        supabase
            .from('follows')
            .select()
            .eq('my_id', session?.user?.id)
            .eq('user_idf', userId)
            .then(result => {
                if (result?.data?.length > 0) {
                    setIsFollow(true);
                }
                if (result?.data?.length === 0) {
                    setIsFollow(false);
                }

            })

    }, [userId]);



    function fetchUser() {
        setIsUploading(true)
        supabase.from('profiles')
            .select()
            .eq('id', userId)
            .then(result => {
                if (result.error) {
                    throw result.error;
                }
                if (result.data) {
                    setProfile(result.data[0]);
                    setIsUploading(false)
                }
            });
    }

    function saveProfile() {
        supabase.from('profiles')
            .update({
                name,
                place,
                about,
            })
            .eq('id', session?.user?.id)
            .then(result => {
                if (!result.error) {
                    setProfile(prev => ({ ...prev, name, place, about }));
                }
                setEditMode(false);
            });
    }


    function toggleFollow() {

        if (isFollow) {
            supabase.from('follower')
                .delete()
                .eq('follower_id', session.user.id)
                .eq('user_id', userId)
                .then(result => {
                    setIsFollow(false);
                    fetchFollowers()
                    fetchFollowing()
                });
            supabase.from('follows')
                .delete()
                .eq('my_id', session?.user?.id)
                .eq('user_idf', userId)
                .then(result => {
                    setIsFollow(false);
                    fetchFollowers()
                    fetchFollowing()
                });
        }
        if (!isFollow) {
            supabase.from('follower').insert({
                follower_id: session?.user?.id,
                user_id: userId,
            }).then(result => {
                console.log( result)
            });
            // note follows mean following
            supabase.from('follows').insert({
                user_idf: profile?.id,
                my_id: session?.user?.id,
            }).then(result => {
                setIsFollow(true);

            });
        }
    }

    function fetchFollowing() {
        try {
            supabase
                .from('follows')
                .select()
                .eq('my_id', userId)
                .then(result => {
                    const postsIds = result?.data?.map(item => item.user_idf);
                    if (postsIds) {
                        supabase
                            .from('profiles')
                            .select().in('id', postsIds)
                            // .eq('id', postsIds)
                            .then(result => {
                                setFollowing(result.data)
                            })
                    }


                });
        } catch (error) {
            return true;
        }

    }


    function fetchFollowers() {
        supabase
            .from('follower')
            .select()
            .eq('user_id', userId)
            .then(result => {
                const postsIdf = result?.data?.map(item => item.follower_id);
                if (postsIdf) {
                    supabase
                        .from('profiles')
                        .select().in('id', postsIdf)
                        .then(result => {
                            setFollower(result.data)
                        });
                }

            });
    }





    const isMyUser = userId === session?.user?.id;

    return (
        <Layout>

            <UserContextProvider>
                <Card noPadding={true}>
                    {isUploading && (
                        <div className="flex  justify-center h-screen items-center z-20 bg-[#000000f5]">
                            <Preloader size={40} />
                        </div>
                    )}
                    {!isUploading && (
                        <div className="relative overflow-hidden rounded-md">
                            <Cover url={profile?.cover} editable={isMyUser} onChange={fetchUser} />
                            {/* followings */}
                            {!isMyUser && (
                                <div className=" absolute right-0 font-semibold md:my-3 my-2 flex mr-2">
                                    <button onClick={toggleFollow} className='followButton text-black bg-gray-50 hover:bg-gray-300 p-1 rounded-3xl rounded- text-[14px] font-semibold px-4 cursor-pointer flex items-center'>
                                        {isFollow ? (
                                            <div className="flex items-center gap-1">
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-red-700">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M22 10.5h-6m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
                                                </svg>
                                                Following
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-1">
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-red-700">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
                                                </svg>
                                                Follow
                                            </div>
                                        )}
                                    </button>
                                </div>
                            )}

                            <div className="absolute md:top-[64px] top-24 left-4  z-10">
                                {profile && (
                                    <Avatar url={profile.avatar} size={'lg'} editable={isMyUser} onChange={fetchUser} />
                                )}
                            </div>

                            <div className="p-0 md:mt-[51px] mt-[50px]">
                                <div className="flex md:justify-between justify-start text-start  relative">
                                    <div className="md:px-[20px] px-[17px] mt-3">
                                        {/* name */}
                                        {editMode && (
                                            <div className="bg-black">
                                                <input type="text"
                                                    className="border py-2 text-black px-3 rounded-md outline-none"
                                                    placeholder={'Add your name'}
                                                    onChange={ev => setName(ev.target.value)}
                                                    value={name} />
                                            </div>
                                        )}
                                        {!editMode && (
                                            <h1 className="md:text-3xl text-2xl font-bold">
                                                {profile?.name || 'No Username'}
                                            </h1>
                                        )}

                                        {/* name and location */}
                                        {editMode && (
                                            <div className="bg-black">
                                                <input type="text"
                                                    className="border text-black py-2 px-3 rounded-md mt-1 outline-none"
                                                    placeholder={'Add your location'}
                                                    onChange={ev => setPlace(ev.target.value)}
                                                    value={place} />
                                            </div>
                                        )}
                                        {!editMode && (
                                            <div className="text-gray-500 leading-5">
                                                {profile?.place || 'No Location'}
                                            </div>
                                        )}

                                        {/* about */}
                                        {editMode && (
                                            <div className="bg-black">
                                                <input type="text"
                                                    className="border py-2 px-3 text-black rounded-md w-full mt-1 outline-none"
                                                    placeholder={'Add your Bio !'}
                                                    onChange={ev => setAbout(ev.target.value)}
                                                    value={about} />
                                            </div>
                                        )}
                                        {!editMode && (
                                            <p className="text-base mt-3 flex flex-wrap md:w-[80%] w-[90%]">
                                                {isMyUser && !profile?.about &&
                                                    <span>Add your Bio !</span>
                                                }
                                                {profile?.about || !isMyUser && ''}
                                            </p>
                                        )}

                                        {/* following and followers btn */}
                                        <div className="inline-flex mt-5 mb-2 items-center font-semibold gap-2">
                                            <Link href={'/follows/' + userId}>{millify(following?.length === 0 ? '0' : following?.length)}<span className=" text-gray-500 ml-[2px] font-normal hover:underline underline-offset-2">Following</span></Link>

                                            <Link href={'/followers/' + userId}>{millify(follower?.length === 0 ? '0' : follower.length)}<span className=" text-gray-500 ml-[2px] font-normal hover:underline underline-offset-2">Followers</span></Link>
                                        </div>

                                    </div>
                                </div>

                                {/* edit profile */}
                                <div className="flex mt-1 relative justify-end p-0 mb-0">
                                    <div className="md:text-right ">
                                        {isMyUser && !editMode && (
                                            <button
                                                onClick={() => {
                                                    setEditMode(true);
                                                    setName(profile?.name);
                                                    setPlace(profile?.place);
                                                    setAbout(profile?.about)
                                                }}
                                                className="inline-flex mx-1 gap-1 bg-red-500 hover:bg-red-600 text-white rounded-md  py-1 px-2 mr-3">
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                                                </svg>
                                                <span className="md:block hidden">Edit Profile</span>
                                            </button>
                                        )}
                                        {isMyUser && editMode && (
                                            <button onClick={saveProfile} className="inline-flex mx-1 gap-1 bg-red-500 hover:bg-red-600 text-white rounded-md  py-1 px-2">
                                                Save profile
                                            </button>
                                        )}
                                        {isMyUser && editMode && (
                                            <button onClick={() => setEditMode(false)} className="inline-flex mx-1 gap-1 bg-red-500 hover:bg-red-600 text-white rounded-md  py-1 px-2">
                                                Cancel
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <ProfileTabs active={tab} userId={profile?.id} />
                            </div>
                        </div>
                    )}
                </Card>
                <ProfileContent activeTab={tab} userId={userId} />
            </UserContextProvider>
        </Layout>
    );
}


