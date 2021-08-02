module.exports = function (mongoose) {
  var userSchema = mongoose.Schema({
    firstName: String, // String is shorthand for {type: String}
    lastName: String,
    password: {
      type: String,
      required: true,
    },
    passwordSalt: {
      type: String,
      required: true,
    },
    createdDate: {
      type: Date,
      default: Date.now,
    },
    registrationDate: Date,
    email: {
      type: String,
      required: true,
    },
    emailConfirmationCode: {
      type: String,
      required: true,
    },
    confirmed: Boolean,
    preferred: {
      location: String,
      position: {
        x: Number,
        y: Number,
      },
    },
    // TODO: Add Telegram Id when ready.
  });
  return mongoose.model("User", userSchema);
};
