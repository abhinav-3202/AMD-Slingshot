import dbConnect from "@/src/lib/dbConnect";
import UserModel from "@/src/models/User";
import SlotModel from "@/src/models/Slot";
import AppointmentModel from "@/src/models/Appointment";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/[...nextauth]/options";

export async function PUT(request:Request){
    try {
        await dbConnect();
        const session = await getServerSession(authOptions);
        if(!session || !session.user){
            return Response.json({
                success:false,
                message:"Unauthorized. Please sign in first."
            }, {status:401})
        }

        if(session.user.role !== "doctor"){
            return Response.json({
                success:false,
                message:"Only doctors can update appointment status."
            }, {status:403})
        }

        const { appointmentId, status } = await request.json();

        if(!appointmentId || !status){
            return Response.json({
                success:false,
                message:"Appointment ID and new status are required."
            }, {status:400})
        }

        const allowedStatus = ["confirmed" , "cancelled", "completed"];
        if(!allowedStatus.includes(status)){
            return Response.json({
                success:false,
                message:"Invalid status value. Allowed values are: confirmed, cancelled, completed."
            }, {status:400})
        }

        const appointment = await AppointmentModel.findById(appointmentId);
        if(!appointment){
            return Response.json({
                success:false,
                message:"Appointment not found."
            }, {status:404})
        }

        if(status === "cancelled"){
            await SlotModel.findByIdAndUpdate(appointment.slotId, 
                {status:"available"});
        }

        // iff not cancelled then update what the status is given 

        const updatedAppointment = await AppointmentModel.findByIdAndUpdate(
            appointmentId,
            {status},
            {new : true}  // return the updated document
        )

        return Response.json({
            success:true,
            message:"Appointment ${status} updated successfully.",
            appointment:updatedAppointment
        }, {status:200})

    } catch (error) {
        return Response.json({
            success:false,
            message:"An error occurred while updating appointment status."
        }, {status:500});
    }
}