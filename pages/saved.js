import Layout from "../components/Layout";
import PostCard from "../components/PostCard";
import { useEffect, useState } from "react";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { UserContextProvider } from "../contexts/UserContext";
import Preloader from "@/components/Preloader";
import Card from "@/components/Card";

export default function SavedPostsPage() {
  const [posts, setPosts] = useState([]);
  const [isUploading, setIsUploading] = useState(false);

  const session = useSession();
  const supabase = useSupabaseClient();
  useEffect(() => {
    if (!session?.user?.id) {
      return;
    }
    setIsUploading(true)
    supabase
      .from('saved_posts')
      .select('post_id')
      .eq('user_id', session.user.id)
      .then(result => {
        const postsIds = result?.data.map(item => item.post_id);
        if (postsIds) {
          supabase
            .from('posts')
            .select('*, profiles(*)').in('id', postsIds)
            .then(result => setPosts(result.data));
          setIsUploading(false)
        }

      });
  }, [session?.user?.id]);
  return (
    <Layout>

      <UserContextProvider>
        <h1 className="md:text-5xl text-4xl mb-3 ml-3 my-3 text-gray-300">Saved</h1>
        {posts.length > 0 && posts.map(post => (
          <div key={post.id}>
            <PostCard {...post} />
          </div>
        ))}

        {posts.length == 0 && (
          <div className=" flex justify-center h-screen">
            <h1 className=" text-xl py-5">
              No saved posts !
            </h1>
          </div>
        )}
        {isUploading && (
          <div className=" flex items-center h-screen z-30 bg-[#000000f5]">
            <div className="inline-block mx-auto">
              <Preloader size={40} />
            </div>
          </div>
        )}
      </UserContextProvider>

    </Layout>
  );
}
