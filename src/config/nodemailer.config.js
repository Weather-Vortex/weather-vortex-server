const nodemailer=require("nodemailer");

//email sender details
var transport = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'silviadolomiti@gmail.com',
        pass: 'Da mettere'

    },
    tls: {
        rejectUnauthorized: false
    }

})
//confirmationCode-> emailToken
module.exports.sendConfirmationEmail = (name, email, confirmationCode) => {
    console.log("Check");
    transport.sendMail({
      from: ' "Verify your email" <silviadolomiti@gmail.com>',
      to: email,
      subject: "Please confirm your account - Weather Vortex",
      html: `<h1>Email Confirmation</h1>
          <h2>Hello ${name}</h2>
          <p>Thank you for subscribing. Please confirm your email by clicking on the following link</p>
          <a href=http://localhost:12000/api/confirm/${confirmationCode}> Click here</a>
          </div>`,
    }).catch(err => console.log(err));
  };