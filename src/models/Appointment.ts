import mongoose,{Schema} from "mongoose";

const appointmentSchema = new Schema({
    patientId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true,
    },
    doctorId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true,
    },
    date:{
        type:Date,
        required:true,
    },
    timeSlot:{
        type:String,
        required:true,
    },
    slotId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Slot",
        required:true,
    },
    typeOfAppointment:{
        type:String,
        enum:["video","chat"],
        required:true,
    },
    status:{
        type:String,
        enum:["pending","confirmed","completed","cancelled"],
        default:"pending",
    },
    createdAt:{
        type:Date,
        default:Date.now,
    }
})

const AppointmentModel = mongoose.models.Appointment || mongoose.model("Appointment", appointmentSchema);

export default AppointmentModel;