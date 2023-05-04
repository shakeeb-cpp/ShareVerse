import Layout from "../components/Layout";
import Card from "../components/Card";
import Link from "next/link";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { useEffect, useState } from "react";

export default function LoginPage() {


    const supabase = useSupabaseClient();


    async function loginWithGoogle() {
        await supabase.auth.signInWithOAuth({
            provider: 'google',
        });


    }


    return (
        <Layout hideNavigation={true}>
            <h1 className="text-6xl mb-5 text-socialBlue text-center md:mt-10">Welcome to ShareVerse</h1>
            <p className=" text-base text-gray-300 text-center md:mx-52 mx-2">This is a social media platform where you can share the posts, photos, videos and much more! so lets connected with different people and try to explore more fun. </p>
            <img className=" absolute -z-10 w-full h-full object-cover  brightness-50 blur-sm opacity-40 top-0" src="https://cdn.pixabay.com/photo/2017/11/06/08/42/personal-2923048__340.jpg" alt="" />
            <div className="flex items-center">
                <div className="max-w-xs mx-auto grow md:mt-24 mt-16">
                    <h1 className="text-6xl mb-5 text-gray-300 text-center">Login</h1>
                    <Card noPadding={true}>
                        <div className="rounded-md overflow-hidden">
                            <button onClick={loginWithGoogle} className="flex w-full gap-4 items-center justify-center p-4 overflow-hidden hover:bg-socialBlue text-[#ffffff]  bg-blue-600 hover:text-black hover:border-b-socialBlue  transition-all hover:scale-110">
                                <svg className="h-8 fill-current " xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512"><path d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z" /></svg>
                                Login with Google
                            </button>
                        </div>
                    </Card>
                </div>
            </div>
        </Layout>
    );
}
