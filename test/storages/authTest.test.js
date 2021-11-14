/*
    Web server for Weather Vortex project.
    Copyright (C) 2021  Tentoni Daniele, Silvia Zandoli.

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.
    
    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

"use strict";

let mongoose = require("mongoose");
const User = require("../../src/models/user.model");
let chai = require("chai");
let chaiHttp = require("chai-http");
const userUtils = require("../utils/user.utils");
let { app } = require("../../src/index");
let should = chai.should();
chai.use(chaiHttp);

/*Some tests for authentication*/

describe("Users", () => {
  beforeEach(async () => await User.deleteMany({}));

  afterEach(async () => await User.deleteMany({}));

  describe("/POST user", () => {
    it("it should not create a user without email address", async () => {
      const user = {
        firstName: "John",
        lastName: "Doe",
        password: "ffffffff",
      };
      const res = await chai.request(app).post("/auth/register").send(user);
      res.should.have.status(400);
      res.should.have.property("body");
      res.body.should.be.a("object");
      res.body.should.have.property("auth").eql(false);
      res.body.should.have
        .property("message")
        .eql("Missing some fields that are mandatory");
      res.body.should.have.property("fields").eql("email");
    });

    it("should not create a user without some mandatory fields", async () => {
      const user = { firstName: "John", lastName: "Doe" };
      const res = await chai.request(app).post("/auth/register").send(user);
      res.should.have.status(400);
      res.should.have.property("body");
      res.body.should.be.a("object");
      res.body.should.have.property("auth").eql(false);
      res.body.should.have
        .property("message")
        .eql("Missing some fields that are mandatory");
      res.body.should.have.property("fields").eql("email, password");
    });

    it("should not create a user without any mandatory fields", async () => {
      const user = {};
      const res = await chai.request(app).post("/auth/register").send(user);
      res.should.have.status(400);
      res.should.have.property("body");
      res.body.should.be.a("object");
      res.body.should.have.property("auth").eql(false);
      res.body.should.have
        .property("message")
        .eql("Missing some fields that are mandatory");
      res.body.should.have
        .property("fields")
        .eql("firstName, lastName, email, password");
    });

    it("it should create a user ", (done) => {
      let user = {
        firstName: "John",
        lastName: "Doe",
        email: "doe@email.com",
        password: "ffffffff",
      };

      chai
        .request(app)
        .post("/auth/register")
        .send(user)
        .end((err, res) => {
          if (err) {
            done(err);
          }

          res.should.have.status(200);
          res.body.should.be.a("object");
          res.body.should.have
            .property("message")
            .eql("User was registered successfully! Please check your email");
          res.body.user.should.have.property("firstName");
          res.body.user.should.have.property("lastName");
          res.body.user.should.have.property("email");
          done();
        });
    });
  });

  describe("/PUT/:id user", () => {
    it("it should update a user given an id", (done) => {
      const oldPassword = "ffffffff";
      let user = new User({
        firstName: "John",
        lastName: "Doe",
        email: "doe@email.com",
        password: oldPassword,
      });
      user.save((err, user) => {
        if (err) {
          done(err);
        }

        user.generateToken((err, userWithToken) => {
          if (err) {
            done(err);
          }

          const newPassword = oldPassword.concat("1");
          chai
            .request(app)
            .put("/auth/")
            .set("Cookie", `auth=${userWithToken.token}`)
            .send({
              password: newPassword,
              preferred: "Cesena",
            })
            .end((err, res) => {
              if (err) {
                done(err);
              }

              res.should.have.status(201);
              res.body.should.be.a("object");
              res.body.should.have
                .property("message")
                .eql("User was updated successfully!");
              done();
            });
        });
      });
    });
  });

  describe("/DELETE/:id user", () => {
    it("it should delete a user given an id", (done) => {
      let user = new User({
        firstName: "Sissa",
        lastName: "Doe",
        email: "john@email.com",
        password: "ffffffff",
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
            .delete("/auth/")
            .set("Cookie", `auth=${userWithToken.token}`)
            .end((err, res) => {
              if (err) {
                done(err);
              }

              res.should.have.status(200);
              res.body.should.be.a("object");
              res.body.should.have.property("message").eql("Deleted!");
              done();
            });
        });
      });
    });
  });

  describe("Password reset", () => {
    it("should work", async () => {
      const tester = await userUtils.createUser();
      const verified = await userUtils.verifyUser(tester);
      verified.should.have.property("isVerified", true);

      const result = await chai
        .request(app)
        .put("/auth/forgotPassword")
        .send({ email: tester.email });
      result.should.have.status(200);
      result.body.should.have.property(
        "message",
        "Email has been sent, kindly follow the instructions!"
      );

      const userWithLink = await User.findById(tester._id);
      userWithLink.should.have.property("resetLink");

      const newPassword = "newPwd123";
      const resetResult = await chai
        .request(app)
        .put("/auth/resetPassword")
        .send({ resetLink: userWithLink.resetLink, password: newPassword });
      resetResult.should.have.status(200);

      const login = await chai
        .request(app)
        .post("/auth/login")
        .send({ email: userWithLink.email, password: newPassword });
      login.should.have.status(200);
    });
  });
});
