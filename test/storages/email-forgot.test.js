/*const mockery = require("mockery");
const should = require("should");
const nodemailerMock = require("../utils/nodemailer-mock");
const { mock } = nodemailerMock;

describe("Mocha + Mockery Test", function () {
  // we need to mock nodemailer *before* we require() any modules that load it
  before(async () => {
    // Enable mockery to mock objects
    mockery.enable({
      warnOnUnregistered: false,
      useCleanCache: true,
    });

    // mock here
    mockery.registerMock("nodemailer", nodemailerMock);
  });

  // run a test
  it("Send an email using the mocked nodemailer", async () => {
    // load the module to test, it will use the mocked nodemailer internally
    const mailer = require("../mailer-test");
    // send the email
    await mailer.send();
    // check the mock for our sent emails
    const sentEmails = mock.getSentMail();
    // there should be one
    should(sentEmails.length).equal(1);
    // and it should match the to address
    should(sentEmails[0].to).equal("justin@to.com");
  });

  //https://github.com/doublesharp/nodemailer-mock/blob/master/test/nodemailer-mock-tests.js
});*/
//https://www.npmjs.com/package/nodemailer-mock-transport
var nodemailer = require("nodemailer");
const mockery = require("mockery");
var mockTransport = require("../index-mock.js");

describe("mock-transport", function () {
  it("should store configuration options so that they can be asserted against", function () {
    var transport = mockTransport({
      foo: "bar",
    });
    transport.options.foo.should.equal("bar");
  });

  it("should store emails sent with nodemailer, so that they can be asserted against", function () {
    var transport = mockTransport({
      foo: "bar",
    });

    var transporter = nodemailer.createTransport(transport);

    transporter.sendMail({
      from: "silviadolomiti@gmail.com",
      to: "silviadolomiti@gmail.com",
      subject: "hello",
      text: "hello world!",
    });

    transport.sentMail.length.should.equal(1);
    transport.sentMail[0].data.to.should.equal("silviadolomiti@gmail.com");
    transport.sentMail[0].message.content.should.equal("hello world!");
  });

  it("should return an error and not send an email if there is no `to` in the mail data object", function () {
    var transport = mockTransport({
      foo: "bar",
    });

    var transporter = nodemailer.createTransport(transport);

    transporter.sendMail({
      from: "silviadolomiti@gmail.com",
      subject: "hello",
      text: "hello world!",
    });

    transport.sentMail.length.should.equal(0);
  });
});
