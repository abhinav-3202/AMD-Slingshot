'use client'
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useDebounceCallback } from 'usehooks-ts'
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { signUpSchema } from "@/src/schemas/signUpSchema"
import axios,{AxiosError} from "axios"
import { ApiResponse } from "@/src/types/ApiResponse"
import { Form, FormField ,FormItem,FormControl , FormLabel , FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { signIn } from "next-auth/react"


// if we check username availability on every keystroke, it will make too many API calls and can cause performance issues. So we will use debounce to limit the number of API calls made while checking username availability.
//  Debounce will delay the API call until the user has stopped typing for a certain amount of time (e.g., 500 milliseconds). This way, we can check username availability only when the user has finished typing, rather than on every keystroke.
const page = () => {
  const [username , setUsername] = useState(""); //  By default username is empty string
  const [usernameMessage , setUsernameMessage] = useState("") // state to store message related to username available or not 
  const [isCheckingUsername , setIsCheckingUsername] = useState(false) // state to indicate whether we are currently checking username availability
  const [isSubmitting , setIsSubmitting] = useState(false) // state to indicate whether the form is currently being submitted

  const debounced = useDebounceCallback(setUsername ,300)  // 300 is the dealy time of cheking 
  const router = useRouter();

  // zod implementation for form validation

  const form = useForm<z.infer<typeof signUpSchema>>({
    resolver :zodResolver(signUpSchema ), // validation schema for form validation using zod
    defaultValues:{
      username:"",
      email:"",
      password:"",
    }
  })

  useEffect(()=>{
    const checkUsernameUnique = async () => {
      if(username.trim() !== ""){
        setIsCheckingUsername(true);
        setUsernameMessage("");
        try {
          const response = await axios.get(`/api/check-username-unique?username=${username}`);
          console.log("checking response", response);
          //let message = response.data.message;  and give this message to setUsernameMessage
          setUsernameMessage(response.data.message)
        } catch (error) {
          const axiosError = error as AxiosError<ApiResponse>;
          setUsernameMessage(
            axiosError.response?.data.message ?? "Error checking username"
          )
        }finally{
          setIsCheckingUsername(false);
        }
      }
    }
    checkUsernameUnique();
  }, [username]) // username ke change hone pe hi checkUsernameUnique function call hoga

  const onSubmit = async (data:z.infer<typeof signUpSchema>) =>{  // onSubmit me data milta h jo handleSubmit se aata h form se
    setIsSubmitting(true);
    console.log("form data", data);
    try {
      const response = await axios.post('/api/signUp',{
        ...data,
        authProvider: "credentials" // kyuki hum credentials ke through signup kar rahe hai, google ke through nhi kar rahe hai isliye authProvider me credentials pass karna hoga taki backend me pata chal sake ki user kis tarah se signup kar raha hai
      });
      // response check karna padega ki hua bhi hai ya nhi 
      // console.log("response", response);
      toast.success(
        "Success", // sucess optionally check karna chahiye thaa ki success hai ya nahi response se
        {description: response.data.message},
      )
      router.replace(`/verify/${data.username}`) // ek new page bana ke us page pe redirect karna hai jaha pe user apna email verify kar sake, url se username le lenge 
      setIsSubmitting(false);
    } catch (error) {
      console.error("Error in sig nup of user" ,error);
      const axiosError = error as AxiosError<ApiResponse>;
      let errorMessage = axiosError.response?.data.message
      toast.error(
        "Signup failed",
        {description :errorMessage},
        // {variant: "destructive"}
      )
      setIsSubmitting(false);
    }
  }


  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6">
            Sign Up to MedAssist
          </h1>
          <p className="mb-4">Signup to start your journey with MedAssist</p>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-6">
            <FormField
              name="username"
              control={form.control}
              render={({ field }) => (
              <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>  
                  <Input {...field} placeholder='username'
                    onChange={(e)=>{
                      field.onChange(e); // react hook form ke field onChange ko call karna hoga taki form state update ho sake
                      debounced(e.target.value);
                    }}
                  /> 
                  </FormControl>
                  {
                    isCheckingUsername && <Loader2 className="animate-spin"/>
                  }
                  <p className={`text-sm ${usernameMessage === "Username is available" ? 'text-green-500' : 'text-red-500'} `}>test {usernameMessage}</p>
                  <FormMessage />
              </FormItem>
                )}
            />

            <FormField
              name="email"
              control={form.control}
              render={({ field }) => (
              <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>  
                  <Input {...field} placeholder='email'  // username me liya tha becasue we want to check username availability but email me aisa nhi hai isliye email placeholder me email likha h
                  /> 
                  </FormControl>
                  <p className='text-muted text-gray-600 text-sm'>We will send you a verification code</p>
                  <FormMessage />
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
                  <p className='text-muted text-gray-600 text-sm'>We will send you a verification code</p>
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
                ) : ("SignUp")
              }
            </Button>
          </form>
        </Form>
        <div className="text-center mt-4">
              <p>
                Already a member?{" "}
                <Link href='/signIn' className="text-blue-500 hover:underline">
                  Sign In
                </Link>
              </p>
        </div>
        <div>
          <button
              type="button"
              onClick={() => signIn("google",{
                callbackUrl:'/dashboard'
              })}
              className="w-full bg-red-500 text-white py-2 rounded mt-4"
            >
              Sign up with Google
            </button>

        </div>
      </div>
    </div>
  )
}

export default page