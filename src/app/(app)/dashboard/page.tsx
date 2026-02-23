'use client'
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Separator } from '@/components/ui/separator';
import { User } from 'next-auth';

const page = () => {
    const { data: session, status } = useSession();  // ✅ status added
    const router = useRouter();

    useEffect(() => {
        if (status === "authenticated" && session?.user?.isNewUser === true) {
            router.replace("/info");
        }
    }, [session, status]);

    if (status === "loading") {
        return <div>Loading...</div>
    }

    if (!session || !session.user) {
        return <div>Please Login</div>
    }

    const { username } = session?.user as User;

    return (
        <div className="my-8 lg:mx-auto p-6 bg-white rounded w-full max-w-6xl">
            <h1 className="text-4xl font-bold mb-4">My Dashboard</h1>
            <p className="mb-4">Welcome, {username}</p>
            <Separator />
            <div>
                {/* your dashboard content here */}
            </div>
        </div>
    )
}

export default page;