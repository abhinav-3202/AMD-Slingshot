'use client'
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const DoctorDashboard = () => {
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (status === "authenticated" && session?.user?.isNewUser === true) {
            router.replace("/info");
        }
        if (status === "unauthenticated") {
            router.replace("/signIn");
        }
    }, [session, status]);

    if (status === "loading") return <div className="flex justify-center items-center min-h-screen"><Loader2 className="animate-spin" /></div>
    if (!session) return null;

    return (
        <div className="my-8 lg:mx-auto p-6 bg-white rounded w-full max-w-6xl">
            <h1 className="text-4xl font-bold mb-2">Doctor Dashboard</h1>
            <p className="text-gray-500 mb-4">Welcome, Dr. {session.user.username}</p>
            <Separator />

            {/* Profile Info */}
            <div className="mt-6 p-4 border rounded-lg bg-gray-50">
                <h2 className="text-xl font-semibold mb-2">Your Profile</h2>
                <p><span className="font-medium">Name:</span> {session.user.username}</p>
                <p><span className="font-medium">Role:</span> Doctor</p>
                <p><span className="font-medium">Specialization:</span> {session.user.specialization}</p>  {/* 👈 add this */}
            </div>  

            {/* Patients section */}
            <div className="mt-6">
                <h2 className="text-xl font-semibold mb-4">Your Patients</h2>
                <p className="text-gray-400">No patients yet.</p>
            </div>
        </div>
    )
}

export default DoctorDashboard;