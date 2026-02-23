import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";

export async function POST(request:Request){
    try {
        const session = await getServerSession(authOptions);
        if(!session || !session.user){
            return Response.json({
                success: false,
                message: "Unauthorized. Please sign in first."
            }, { status: 401 })
        }

        const {message} = await request.json();

        if(!message){
            return Response.json({
                success: false,
                message: "Message is required."
            }, { status: 400 })
        }

        const botResponse = await fetch(process.env.RAILWAY_ENDPOINT!,{
            method: "POST",
            headers:{
                "Content-Type": "application/json"
            },
            body:JSON.stringify({message})
        });
        
        const botData = await botResponse.json();

        return Response.json({
            success: true,
            response:botData.message,  // extracting the string response from the bot's JSON response
        },{status: 200})
        
    } catch (error) {
        return Response.json({
            success: false,
            message: "Error processing the request."
        }, { status: 500 })
    }
}