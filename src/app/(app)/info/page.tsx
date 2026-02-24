'use client';
import { useState , useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useSession } from 'next-auth/react';
import * as z from "zod";
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { FormField, FormControl, Form, FormItem, FormMessage, FormLabel } from '@/components/ui/form';
import { toast } from "sonner";
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { infoSchema } from '@/src/schemas/infoSchema';
import axios, { AxiosError } from 'axios';
import { ApiResponse } from '@/src/types/ApiResponse';
const infopage = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();
     const { data: session, status ,update } = useSession();

    const form = useForm<z.infer<typeof infoSchema>>({
        resolver: zodResolver(infoSchema),
        defaultValues: {
            name: "",
            age: undefined,
            weight: undefined,
            gender: "male" as const,
        }
    })
    
    useEffect(() => {
        if (status === "unauthenticated") {
            router.replace("/signIn");
        }
    }, [status]);

    if (status === "loading") return <div>Loading...</div>  
    if (!session) return null;

   const onSubmit = async (data: z.infer<typeof infoSchema>) => {
    setIsSubmitting(true);
    try {
        const response = await axios.post('/api/info', data);
        toast.success("Success", { description: response.data.message });
        await update({ isNewUser: false });
        router.replace("/dashboard");
    } catch (error) {
        const axiosError = error as AxiosError<ApiResponse>;
        toast.error("Failed", { description: axiosError.response?.data.message });
    } finally {
        setIsSubmitting(false);
    }
}

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100">
            <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
                <div className="text-center">
                    <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6">
                        Your Information
                    </h1>
                    <p className="mb-4">Fill in your details to get started</p>
                </div>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}
                     className="space-y-6">

                        <FormField
                            name="name"
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Name</FormLabel>
                                    <FormControl>
                                        <Input {...field} placeholder="Enter your name" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            name="age"
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Age</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            placeholder="Enter your age"
                                            value={field.value ?? ""}
                                            onChange={(e) => field.onChange(e.target.value === "" ? undefined : Number(e.target.value))}  // 👈 manual conversion
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            name="weight"
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Weight (kg)</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            placeholder="Enter your weight"
                                            value={field.value ?? ""}
                                            onChange={(e) => field.onChange(e.target.value === "" ? undefined : Number(e.target.value))}  // 👈 manual conversion
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            name="gender"
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Gender</FormLabel>
                                    <FormControl>
                                        <select
                                            {...field}
                                            className="w-full border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                                        >
                                            <option value="male">Male</option>
                                            <option value="female">Female</option>
                                            <option value="others">Others</option>
                                        </select>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Please wait
                                </>
                            ) : ("Submit")}
                        </Button>

                    </form>
                </Form>
            </div>
        </div>
    )
}

export default infopage;