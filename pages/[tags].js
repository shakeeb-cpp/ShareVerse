import Card from '@/components/Card'
import Layout from '@/components/Layout'
import PostCard from '@/components/PostCard'
import { UserContext } from '@/contexts/UserContext'
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react'
import millify from 'millify'
import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'


const Tagposts = () => {
  const router = useRouter()
  const { tags } = router.query
  const [posts, setPosts] = useState([]);
  const [profile, setProfile] = useState(null);
  const [lengths, setLengths] = useState([]);

  const supabase = useSupabaseClient();
  const session = useSession();

  useEffect(() => {
    if (!session?.user?.id) {
      return;
    }

    supabase.from('profiles').select().eq('id', session?.user?.id)
      .then(result => {
        if (result?.data?.length) {
          setProfile(result?.data[0])
        }
      })

    supabase.from('posts')
      .select('id,content,created_at,photos,video,moods,emoji,tag, profiles(id,avatar,name)')
      .order('created_at', { ascending: false })
      .is('parent', null)
      .match({ 'tag->>0': tags })
      .then(result => {
        console.log('result.data.length', result)
        setLengths(result.data)

      })

    fetchPosts()
  }, [session?.user?.id, tags]);

  const fetchPosts = () => {
    supabase.from('posts')
      .select('id,content,created_at,photos,video,moods,emoji,tag, profiles(id,avatar,name)')
      .order('created_at', { ascending: false })
      .is('parent', null)
      .then(result => {
        setPosts(result.data)

      })
  }

  // console.log(tags)

  const capitalize = (word) => {
    const lower = word?.toLowerCase();
    return lower?.charAt(0)?.toUpperCase() + lower?.slice(1);
  }

  return (
    <Layout>
      <div className='my-3 md:mb-8 mb-10 md:mx-4 mx-2 relative w-[fit-content]'>
        <h2 className=' md:text-3xl text-xl'><span className='text-sky-600 font-semibold'>#{capitalize(tags)}</span></h2>
        <div className='flex justify-start '>
          <p className=' text-gray-400 absolute right-0'>{millify(lengths.length === 0 ? '1': lengths.length+1)} posts</p>
        </div>
      </div>
      {/* (tags !== post.tag ? null : (
      console.log(post.content)
      )) */}

      <div>
        <UserContext.Provider value={{ profile }}>
          {posts?.map((post, idx) =>
            post.tag?.map(item => (
              (tags !== item ? null : (
                <PostCard key={post.id} {...post} fetchPosts={fetchPosts} posts={posts} />
              ))
            ))
          )}
        </UserContext.Provider>
      </div>
    </Layout >
  )
}

export default Tagposts
