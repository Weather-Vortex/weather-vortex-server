var nodemailer = require("nodemailer");
const User = require("../../src/models/user.model");
let chai = require("chai");
let chaiHttp = require("chai-http");
let { app } = require("../../src/index");
chai.use(chaiHttp);

describe("forgotPassword", () => {
  it("it should send an email and create a token", (done) => {
    let user = new User({
      firstName: "John",
      lastName: "Doe",
      email: "doe@email.com",
      password: "ffffffff",
      emailToken: "544354323",
    });
    user.save((err, user) => {
      if (err) {
        done(err);
      }

      user.generateToken((err, userWithToken) => {
        if (err) {
          done(err);
        }
        chai
          .request(app)
          .put("/auth/forgotPassword")
          .set("Cookie", `auth=${userWithToken.token}`)

          .end((err, res) => {
            if (err) {
              done(err);
            }
            res.should.have.status(200);
            res.body.should.be.a("object");
            res.body.should.have
              .property("message")
              .eql("Email has been sent, kindly follow the instructions!");

            done();
          });
      });
    });
  });
});

/*Stub transport is useful for testing the email before actually sending email. It does not actually send an email, it convert mail object to a single buffer and return it with a send mail callback.

In the below code, I have stubbed send method of nodemailer, using sinon module.*/
const sinon = require("sinon");

describe("Forgot password and Reset Password testing email", () => {
  let { app } = require("../../src/index");
  const baseUrl = "/auth/forgotPassword";
  let nm = "";
  let transport = "";
  beforeEach((cb) => {
    transport = {
      name: "testsend",
      version: "1",
      send: function send(data, callback) {
        callback();
      },
      logger: false,
    };
    nm = nodemailer.createTransport(transport);
    cb();
  });
  context("when user exist in database", () => {
    it("repond with 200 request with correct code that exist and changed password", function test(done) {
      this.timeout(15000);
      sinon.stub(transport, "send").yields(null, "test");
      nm.sendMail(
        {
          subject: "test",
        },
        (err, info) => {
          transport.send.restore();
          done();
        }
      );
      request(app)
        .post(`${baseUrl}/resetPassword`)
        .send({
          password: "Leonella9",
        })
        .set("Accept", "application/json")
        .expect("Content-Type", /json/)
        .expect(httpConstants.STATUS_OK_200, {
          message: "Your password has be changed",
        })
        .end(done);
    });
  });
});
