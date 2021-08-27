const nodemailer = require("nodemailer");
const secretvar = require("./config").get(process.env.NODE_ENV);

//email sender details
var transport = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: secretvar.USEREMAIL,
    pass: secretvar.PWD,
  },
  tls: {
    rejectUnauthorized: false,
  },
});
//confirmationCode-> emailToken
module.exports.sendConfirmationEmail = (name, email, confirmationCode) => {
  console.log("Check");
  transport
    .sendMail({
      from: ' "Verify your email" <${secretvar.USEREMAIL}>',
      to: email,
      subject: "Please confirm your account - Weather Vortex",
      html: `<h1>Email Confirmation</h1>
          <h2>Hello ${name}</h2>
          <p>Thank you for subscribing. Please confirm your email by clicking on the following link</p>
          <a href='${process.env.CLIENT_URL}/#/user/confirm?name=${confirmationCode}'> Click here
          </div>`,
    })
    .catch((err) => console.log(err));
};
