import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    job: {
      type: String,
      required: true,
      trim: true,
      validate(value) {
        if (value.length < 2) throw new Error("Invalid job.");
      },
    },
  },
  { collection: "users_list" }
);

const User = mongoose.model("User", UserSchema);

export default UserSchema;
