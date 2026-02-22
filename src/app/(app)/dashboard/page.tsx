// (app) likhne se wo route nhi banega

// the switch which we are using of Accept Messages , it is also a <Form> component
// If we thought of managing it in a useState , then it would be the inconsistency in the code  , like everywhere in our application we have
// used react-hook-form and then for this switch we are using useState , so it would be the inconsistency in the code , so we will manage it in the react-hook-form itself 
// So everywhere we should use react-hook form only 
// in React-hook form study of the <> watch event
// watch ->> this method will watch specified input and return their values . It is useful to render input value and for determining what to render by condition . 
// Like on the basis of the value we will make API calls , so that's the reason behind watch
// setValue -->> This function allows u to dynamically set the value of a registered field and have the options to validate and update the form state . At the same time , it tries to avoid unnecessary rerender .
'use client'
import { Separator } from '@/components/ui/separator';
// import { Switch } from '@/components/ui/switch';
// import MessageCard from '@/src/components/MessageCard';
import { Button } from '@/components/ui/button';
// import { Message } from '@/src/models/User';
// import { acceptMessageSchema } from '@/src/schemas/acceptMessageSchema';
import { ApiResponse } from '@/src/types/ApiResponse';
import { zodResolver } from '@hookform/resolvers/zod';
import axios, { AxiosError } from 'axios';
import { Loader2, RefreshCcw } from 'lucide-react';
// import { Loader2 } from 'lucide-react';
import { useSession } from 'next-auth/react';
import React, { useCallback, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { User } from 'next-auth';

const page = () => {
  //  const [messages , setMessages] = useState<Message[]>([]);  // get-messages se data fetch hoga , will push into it 
   const [isLoading , setIsLoading] = useState(false); 
  //  const [isSwitchLoading , setIsSwitchLoading] = useState(false);

    const {data : session } = useSession(); // this is the session of the currently logged in user , we will need it to get the token for authentication and authorization purpose

    // const form = useForm({
    //   resolver : zodResolver(acceptMessageSchema)
    // }) 

    // const {register , watch , setValue } = form;
    
    // const acceptMessages = watch('acceptMessages') 

    // const fetchAcceptMessage = useCallback(async () => {
    //   setIsSwitchLoading(true)
    //   try {
    //     const response = await axios.get<ApiResponse>('/api/accept-messages')
    //     setValue('acceptMessages' , response.data.isAcceptingMessage ?? false)
    //   } catch (error) {
    //     const axiosError = error as AxiosError<ApiResponse>
    //     toast.error(axiosError.message, {
    //       description: "Failed to fetch accept messages status"
    //     })
    //   }finally{
    //     setIsSwitchLoading(false)
    //   }
    // },[setValue])

    // const fetchMessages = useCallback(async(refresh: boolean = false)=>{
    //   setIsLoading(true);
    //   setIsSwitchLoading(false);
    //   try {
    //     const response = await axios.get<ApiResponse>('/api/get-messages')
    //     setMessages(response.data.messages || [])
    //     if(refresh){
    //       toast.message("Messages refreshed successfully")
    //     }
    //   } catch (error) {
    //     const axiosError = error as AxiosError<ApiResponse>
    //     toast.error(axiosError.message, {
    //       description: "Failed to fetch messages"
    //     })
    //   }finally{
    //     setIsLoading(false)
    //     setIsSwitchLoading(false)
    //   }
    // },[setIsLoading,setMessages,setIsSwitchLoading])
  
    // useEffect(()=>{
    //   if(!session || !session.user) return ;
    //   fetchMessages();
    //   fetchAcceptMessage();
    // },[session , setValue , fetchAcceptMessage , fetchMessages])

    // handle switch change

    // const handleSwitchChange = async() =>{
    //   try {
    //     const response = await axios.post<ApiResponse>('/api/accept-messages',{
    //       acceptMessages : !acceptMessages
    //     })
    //     setValue('acceptMessages' , !acceptMessages) // to update the switch value in the UI
    //     toast.success(response.data.message)
    //   } catch (error) {
    //     const axiosError = error as AxiosError<ApiResponse>
    //     toast.error(axiosError.message, {
    //       description: "Failed to update accept messages status"
    //     })
    //   }
    // }

    if(!session || !session.user){  //  why haven't we used this above as in starting only we can return the user tp login ...check
      return <div>Please Login</div>
    }

    const {username} = session?.user as User
    // TODO : do more research on base url finding techniques in next js 
    // const baseUrl = `${window.location.protocol}//${window.location.host}`
    // const profileUrl = `${baseUrl}/u/${username}`

    // const copyToClipboard = ()=>{
    //   navigator.clipboard.writeText(profileUrl)
    //   toast.success("Profile URL copied to clipboard")
    // }

      return (
        <div className="my-8 lg:mx-auto p-6 bg-white rounded w-full max-w-6xl">
            <h1 className="text-4xl font-bold mb-4">My Dashboard</h1>
            <div className="mb-4">
                <h2 className="text-lg font-semibold mb-2">Copy Your Unique Link</h2>{" "}     
            </div>
            <Separator/>
            <div>

            </div>
            
        </div>
    )
}


export default page