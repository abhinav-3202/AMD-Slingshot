import dbConnect from "@/src/lib/dbConnect";
import UserModel from "@/src/models/User";
import AppointmentModel from "@/src/models/Appointment";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/[...nextauth]/options";
import SlotModel from "@/src/models/Slot";

export async function POST(request: Request){
    try {
        await dbConnect();
        const session = await getServerSession(authOptions);

        if(!session || !session.user){
            return Response.json({
                success:false,
                message:"Unauthorized. Please sign in first."
            }, {status:401}
            )
        }

        if(session.user.role !== "user"){
            return Response.json({
                success:false,
                message:"Only users can book appointments."
            }, {status:403})
        }

        const {doctorId , slotId, date, timeSlot, typeOfAppointment} = await request.json();

        if(!doctorId || !slotId || !date || !timeSlot || !typeOfAppointment){
            return Response.json({
                success:false,
                message:"All fields are required."
            }, {status:400})
        }

        const doctor = await UserModel.findById(doctorId);
        if(!doctor || doctor.role !== "doctor"){
            return Response.json({
                success:false,
                message:"Invalid doctor ID."
            }, {status:400})
        }

        const slot = await SlotModel.findById(slotId);
        if(!slot){
            return Response.json({
                success:false,
                message:"Invalid slot ID."
            }, {status:400})
        }

        if(slot.doctorId.toString() !== doctorId){
            return Response.json({
                success:false,
                message:"Slot does not belong to the specified doctor."
            }, {status:400})
        }

        if(slot.status !== "available"){
            return Response.json({
                success:false,
                message:"Slot is not available."
            }, {status:400})
        }

        const appointmetnt = new AppointmentModel({
            patientId: session.user._id,
            doctorId,
            slotId,
            date : new Date(date),
            timeSlot,
            typeOfAppointment,
            status:"pending",
        })

        await appointmetnt.save();

        await SlotModel.findByIdAndUpdate(slotId,{
            status:"booked"
        });

        return Response.json({
            success:true,
            message:"Appointment booked successfully and is pending confirmation from the doctor.",
            appointmetnt
        },
        {status:200})
    } catch (error) {
        return Response.json({
            success:false,
            message:"An error occurred while booking the appointment."
        }, {status:500})
    }
}