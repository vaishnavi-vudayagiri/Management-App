import {Schema,model,mongoose} from 'mongoose'

const ListSchema=new Schema({
    title:{
        type:String,
        required:[true,"title required"],
        trim:true,
    },

    //which boardthis lst belongs
    boardId:{
        type:Schema.Types.ObjectId,
        ref:"BoardModel",
        required:true,
    },
     //position of list
    order:{
        type:Number,
        default:0
    },

},
{timestamps:true}
);

const ListModel =
 mongoose.models.ListModel ||
  mongoose.model("ListModel", ListSchema);

export default ListModel;