import Layout from "@/components/Layout";
import PostCard from "@/components/PostCard";
import PostFomCard from "@/components/PostFomCard";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { useEffect, useState } from "react";
import LoginPage from "./login";
import { UserContext } from "../contexts/UserContext";
import Preloader from "@/components/Preloader";
import { ToastContainer, toast } from 'react-toastify';
import { useRouter } from "next/router";

export default function Home() {

  const [posts, setPosts] = useState([]);
  const [profile, setProfile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  // const [error, setError] = useState(false);    
  const [sharedLength, setSharedLength] = useState('');

  const router = useRouter();


  const supabase = useSupabaseClient();
  const session = useSession();


  useEffect(() => {
    if (!session?.user?.id) {
      return;
    }

    const postChannel = supabase.channel('posts')
      .on('postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'posts',
        }, payload => {
          setPosts(prevPosts => [...prevPosts, payload.new]);
        }).subscribe();

    supabase.from('profiles').select().eq('id', session?.user?.id)
      .then(result => {
        if (result?.data?.length) {
          setProfile(result?.data[0])
        }
      })

    return () => {
      postChannel.unsubscribe();
    };
  }, [session?.user?.id]);


  useEffect(() => {
    fetchPosts()
    // fetchSharedPosts()
  }, []);

  const fetchPosts = () => {
    // setIsUploading(true)
    supabase.from('posts')
      .select('id,content,author,created_at,photos,video,moods,emoji,tag,shared_avatar,shared_name,shared_content,sharedposting,shared_id, profiles(id,avatar,name)')
      .is('parent', null)
      .order('created_at', { ascending: false })
      .then(result => {
        console.log(result.error)
        setPosts(result.data)
        // setIsUploading(false)
        if (result.error) {
          setIsUploading(true)
          setPosts([])
          setProfile([])
        }
      })
  }







  const handleSearch = (e) => {
    e.preventDefault();
    const searchQuery = e.target.search.value.trim();
    router.push(`/search?q=${encodeURIComponent(searchQuery)}`);

  };


  if (!session) {
    return <LoginPage />
  }

  return (
    <Layout>
      <UserContext.Provider value={{ profile }}>
        {/* searchbar */}
        <form className=' flex items-center justify-end mb-0  bg-[#000] text-black rounded-t-md pt-1  md:pr-8 md:relative fixed top-1 z-20 md:right-0 right-1' onSubmit={handleSearch}>
          <input
            className='border rounded-3xl px-2 md:py-1 outline-none md:w-72 bg-[#FBFBF5]'
            type="text"
            name="search"
            placeholder="Search ..."
          />
          <button type='submit' className='md:py-[5px] py-[3px] rounded-r-3xl md:px-3 md:pl-4 px-2 absolute md:right-4 right-0 bg-blue-500 z-10 md:hover:bg-blue-600 text-white '>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="md:w-6 md:h-6 h-5 w-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
          </button>
        </form>

        <PostFomCard onPost={fetchPosts} posts={posts} setPosts={setPosts} />

        {posts?.length > 0 && posts?.map(post => (
          <PostCard key={post.id} {...post} fetchPosts={fetchPosts} posts={posts} sharedLength={sharedLength} />
        ))}

        {isUploading && (
          <div className="  h-screen bg-[#000000f5] mt-2">
            <div className="flex justify-center">
              <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" className="r-1bwzh9t r-4qtqp9 r-yyyyoo r-1ui5ee8 r-1xvli5t r-dnmrzs r-bnwqim r-1plcrui r-lrvibr"><g><path d="M3.707 21.71l17-17-1.414-1.42-2.555 2.56C15.492 4.7 13.828 4 12 4 9.142 4 6.686 5.71 5.598 8.16 2.96 8.8 1 11.17 1 14c0 2.06 1.04 3.88 2.625 4.96l-1.332 1.33 1.414 1.42zm1.37-4.2C3.839 16.83 3 15.51 3 14c0-2.03 1.506-3.7 3.459-3.96l.611-.09.201-.58C7.947 7.41 9.811 6 12 6c1.275 0 2.438.48 3.322 1.26L5.077 17.51zM8.243 20l2-2H18c1.657 0 3-1.34 3-3s-1.343-3-3-3v-2c2.761 0 5 2.24 5 5s-2.239 5-5 5H8.243z"></path></g></svg>
            </div>
            <h1 className=" text-gray-500 text-center my-4 mx-2">Looks like you lost your connection. Please check it and try again.</h1>
            <div className="flex items-start justify-center mt-1">
              <button onClick={() => window.location.reload()} className=" bg-socialBlue hover:bg-blue-600 px-4 py-1 rounded-3xl flex items-center  gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                </svg>
                <span className="font-semibold">Retry</span>
              </button>
            </div>
          </div>
        )}

        {posts.length === 0 && !isUploading && (
          <div className=" flex items-center h-screen z-30 bg-[#000000f5]">
            <div className="inline-block mx-auto">
              <Preloader size={40} />
            </div>
          </div>
        )}
      </UserContext.Provider>
    </Layout>
  );
}
