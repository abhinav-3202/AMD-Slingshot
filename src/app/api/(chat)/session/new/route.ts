import dbConnect from "@/src/lib/dbConnect";
import UserModel from "@/src/models/User";
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/app/api/auth/[...nextauth]/options";

export async function POST(request: Request) {
    try {
        await dbConnect();

        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return Response.json({
                success: false,
                message: "Unauthorized. Please sign in first."
            }, { status: 401 })
        }

        // call HF server to create new session
        const hfResponse = await fetch(`${process.env.HF_ENDPOINT}/session/new`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
        });

        if (!hfResponse.ok) {
            return Response.json({
                success: false,
                message: "Failed to create session on bot server."
            }, { status: 500 })
        }

        const hfData = await hfResponse.json();
        const sessionId = hfData.session_id;

        // save sessionId to MongoDB under logged in user
        const user = await UserModel.findById(session.user._id);
        if (!user) {
            return Response.json({
                success: false,
                message: "User not found."
            }, { status: 404 })
        }

        const chatNumber = user.sessions.length + 1;

        user.sessions.push({
            sessionId,
            title: `Chat ${chatNumber}`,
            createdAt: new Date(),
        })

        await user.save();

        return Response.json({
            success: true,
            message: "Session created successfully.",
            sessionId,
        }, { status: 200 })

    } catch (error) {
        console.error("Error creating session:", error);
        return Response.json({
            success: false,
            message: "An error occurred while creating session."
        }, { status: 500 })
    }
}