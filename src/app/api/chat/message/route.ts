import dbConnect from "@/src/lib/dbConnect";
import UserModel from "@/src/models/User";
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/app/api/auth/[...nextauth]/options";

export async function POST(request: Request) {
    try {
        await dbConnect();
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return Response.json({ success: false, message: "Unauthorized." }, { status: 401 });
        }

        const { sessionId, message } = await request.json();

        if (!sessionId || !message) {
            return Response.json({ success: false, message: "sessionId and message are required." }, { status: 400 });
        }

        const user = await UserModel.findById(session.user._id);
        if (!user) {
            return Response.json({ success: false, message: "User not found." }, { status: 404 });
        }

        // Derive everything from MongoDB — no trust in frontend
        const userSession = user.sessions.find((s: any) => s.sessionId === sessionId);
        if (!userSession) {
            return Response.json({ success: false, message: "Session not found or does not belong to you." }, { status: 403 });
        }

        const isFirstMessage = userSession.messagesSent === 0;
        const isFirstSession = user.sessions.length === 1;

        const userId = session.user._id!.toString();
        const hfHeaders = {
            "Content-Type": "application/json",
            "x-user-id": userId,
        };

        let hfResponse;

        if (isFirstMessage) {
            hfResponse = await fetch(`${process.env.HF_ENDPOINT}/chat/start`, {
                method: "POST",
                headers: hfHeaders,
                body: JSON.stringify({
                    message,
                    // profile read silently from MongoDB — frontend never touches this
                    patient_name: isFirstSession ? (user.name ?? null) : null,
                    age: isFirstSession ? (user.age ?? null) : null,
                    sex: isFirstSession ? (user.gender ?? null) : null,  // note: your schema uses "gender" not "sex"
                    weight: isFirstSession ? (user.weight ?? null) : null,
                }),
            });
        } else {
            hfResponse = await fetch(`${process.env.HF_ENDPOINT}/chat/continue`, {
                method: "POST",
                headers: hfHeaders,
                body: JSON.stringify({
                    session_id: sessionId,
                    message,
                }),
            });
        }

        if (!hfResponse.ok) {
            const errorText = await hfResponse.text();
            console.error("HF error:", errorText);
            return Response.json({ success: false, message: "Failed to get response from chatbot." }, { status: 500 });
        }

        const hfData = await hfResponse.json();

        // Increment messagesSent only after confirmed success
        userSession.messagesSent = (userSession.messagesSent ?? 0) + 1;
        await user.save();

        return Response.json({
            success: true,
            sessionId: hfData.session_id,
            reply: hfData.message,
            stage: hfData.stage,
            status: hfData.status,
            data: hfData.data ?? null,
        }, { status: 200 });

    } catch (error) {
        console.error("Error sending message:", error);
        return Response.json({ success: false, message: "Internal server error." }, { status: 500 });
    }
}