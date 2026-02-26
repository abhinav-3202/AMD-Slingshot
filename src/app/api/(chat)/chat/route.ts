import { getServerSession } from "next-auth";
import { authOptions } from "@/src/app/api/auth/[...nextauth]/options";

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return Response.json({
                success: false,
                message: "Unauthorized. Please sign in first."
            }, { status: 401 })
        }

        const { sessionId, message } = await request.json();

        if (!sessionId || !message) {
            return Response.json({
                success: false,
                message: "Session ID and message are required."
            }, { status: 400 })
        }

        // forward message to HF server
        const hfResponse = await fetch(`${process.env.HF_ENDPOINT}/chat`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                session_id: sessionId,  // HF expects session_id not sessionId
                message,
            })
        });

        if (!hfResponse.ok) {
            return Response.json({
                success: false,
                message: "Failed to get response from bot."
            }, { status: 500 })
        }

        const hfData = await hfResponse.json();

        return Response.json({
            success: true,
            message: "Message sent successfully.",
            response: hfData.response,      // bot's response text
            phase: hfData.phase,            // phase from HF
            topCandidates: hfData.top_candidates,  // candidates from HF
        }, { status: 200 })

    } catch (error) {
        console.error("Error sending message:", error);
        return Response.json({
            success: false,
            message: "An error occurred while sending message."
        }, { status: 500 })
    }
}
