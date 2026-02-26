import dbConnect from "@/src/lib/dbConnect";
import UserModel from "@/src/models/User";
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/app/api/auth/[...nextauth]/options";

export async function DELETE(request: Request) {
    try {
        await dbConnect();

        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return Response.json({
                success: false,
                message: "Unauthorized. Please sign in first."
            }, { status: 401 })
        }

        const { searchParams } = new URL(request.url);
        const sessionId = searchParams.get("sessionId");

        if (!sessionId) {
            return Response.json({
                success: false,
                message: "Session ID is required."
            }, { status: 400 })
        }

        // delete session from HF server
        const hfResponse = await fetch(
            `${process.env.HF_ENDPOINT}/session/${sessionId}`,
            {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
            }
        );

        if (!hfResponse.ok) {
            return Response.json({
                success: false,
                message: "Failed to delete session from bot server."
            }, { status: 500 })
        }

        // remove sessionId from MongoDB
        const user = await UserModel.findById(session.user._id);
        if (!user) {
            return Response.json({
                success: false,
                message: "User not found."
            }, { status: 404 })
        }

        user.sessions = user.sessions.filter(
            (s: any) => s.sessionId !== sessionId
        )

        await user.save();

        return Response.json({
            success: true,
            message: "Session deleted successfully.",
        }, { status: 200 })

    } catch (error) {
        console.error("Error deleting session:", error);
        return Response.json({
            success: false,
            message: "An error occurred while deleting session."
        }, { status: 500 })
    }
}