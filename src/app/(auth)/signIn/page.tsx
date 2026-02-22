'use client'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import * as z from "zod";
import { zodResolver } from '@hookform/resolvers/zod'
import { signInSchema } from '@/src/schemas/signInSchema'
import { useRouter } from 'next/navigation';
import axios, { AxiosError } from 'axios';
import { FormField,FormControl,Form , FormItem , FormMessage, FormLabel } from '@/components/ui/form';
import { toast } from "sonner"
// import { ApiResponse } from '@/src/types/ApiResponse';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { signIn } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
// import { useRouter } from 'next/router';

const page = () => {
  // const [username , setUsername] = useState(""); //  By default username is empty string
  const [isSubmitting ,setIsSubmitting] = useState(false) // state to indicate whether the form is currently being submitted

  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(()=>{
    const error = searchParams.get("error");
    console.log("error from URL:", error);
    if (error) {
        setTimeout(() => {
            toast.error(decodeURIComponent(error));
        }, 100);  
    }
  },[searchParams]);

  const form = useForm<z.infer<typeof signInSchema>>({
    resolver:zodResolver(signInSchema),
    defaultValues:{
      identifier:"",
      password:""
    }
  })

  const onSubmit = async (data: z.infer<typeof signInSchema>) => {
  setIsSubmitting(true);

  try {
        const result = await signIn("credentials", {
        redirect: false,
        identifier: data.identifier,
        password: data.password,
        callbackUrl:"/dashboard"
        });

        if (result?.error) {
        toast.error(result.error, { description: "Login Error" });
        return;
        }

        if (result?.ok) {
        router.replace("/dashboard");
        }
    } 
    catch (error) {
        toast.error("Something went wrong");
    } finally {
    setIsSubmitting(false);
  }
};


  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
    <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
      <div className="text-center">
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6">
          Sign In to MedAssist
        </h1>
        <p className="mb-4">Sign in to start your journey with MedAssist</p>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6">
          <FormField
            name="identifier"
            control={form.control}
            render={({ field }) => (
            <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>  
                <Input {...field} placeholder='username/email'
                /> 
                </FormControl>
            </FormItem>
              )}
          />

          <FormField
            name="password"
            control={form.control}
            render={({ field }) => (
            <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>  
                <Input {...field} placeholder='password' type='password'  // username me liya tha becasue we want to check username availability but email me aisa nhi hai isliye email placeholder me email likha h
                /> 
                </FormControl>
                <FormMessage />
            </FormItem>
              )}
          />

          <Button type="submit" disabled={isSubmitting}>
            {
              isSubmitting? (
                <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin"/> Please wait
                </>
              ) : ("SignIn")
            }
          </Button>
        </form>
      </Form>
      <div className="text-center mt-4">
            <p>
              Not a member?{" "}
              <Link href='/signUp' className="text-blue-500 hover:underline">
                Sign Up
              </Link>
            </p>
      </div>
      <div className="text-center mt-4">
        <Button onClick={()=>signIn("google" , {
          callbackUrl:"/dashboard"
        })}>
          Continue with Google
        </Button>
      </div>
    </div>
  </div>
  )
}

export default page