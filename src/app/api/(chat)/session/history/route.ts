import { getServerSession } from "next-auth";
import { authOptions } from "@/src/app/api/auth/[...nextauth]/options";

export async function GET(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return Response.json({
                success: false,
                message: "Unauthorized. Please sign in first."
            }, { status: 401 })
        }

        // get sessionId from query params
        const { searchParams } = new URL(request.url);
        const sessionId = searchParams.get("sessionId");

        if (!sessionId) {
            return Response.json({
                success: false,
                message: "Session ID is required."
            }, { status: 400 })
        }

        // fetch chat history from HF server
        const hfResponse = await fetch(
            `${process.env.HF_ENDPOINT}/session/${sessionId}/history`,
            {
                method: "GET",
                headers: { "Content-Type": "application/json" },
            }
        );

        if (!hfResponse.ok) {
            return Response.json({
                success: false,
                message: "Failed to fetch history from bot server."
            }, { status: 500 })
        }

        const hfData = await hfResponse.json();

        return Response.json({
            success: true,
            message: "History fetched successfully.",
            history: hfData,
        }, { status: 200 })

    } catch (error) {
        console.error("Error fetching history:", error);
        return Response.json({
            success: false,
            message: "An error occurred while fetching history."
        }, { status: 500 })
    }
}