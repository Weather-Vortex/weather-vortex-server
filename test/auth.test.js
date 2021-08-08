/*testato tutto su Postman*/ 
//test da far funzionare

/*const request = require("supertest");
const chai = require("chai");
const chaiHttp = require("chai-http");
const app = require("../src/index");

chai.use(chaiHttp);
const expect = chai.expect;
describe('POST /api/register', () => {
    it('should create a user', (done) => {
        var firstName = "silvia";
        var lastName = "zandoli";
        var email = "silviadolomiti@gmail.com";
        var password = "ciaociao";

        request(app)
            .post('/api/register')
            .send({ firstName, lastName, email, password })
            .expect((res) => {
                expect(res.headers['x-auth']).not.toBeNull();
                expect(res.body.firstName).not.toBeNull();
                expect(res.body.email).toBeNull(email);

            })
            .end((err) => {
                if (err) return done(err);

                User.findOne({ email }).then((user) => {
                    expect(user).not.toBeNull();
                    expect(user.password).not.toBeNull(password);
                    done();
                });
            });
    });
    it('should return validation errors if request is invaild', (done) => {
        request(app)
          .post('/api/register')
          .send({
            firstName: "silvia",
            lastName:"zandoli",
            email: "silviadolomiti@gmail.com",
            password: "ciaociao"
          })
          .expect(400)
          .end(done);
      });
    
      it('should not create user if email in use', (done) => {
        request(app)
          .post('/api/register')
          .send({
            email: user[0].email,
            password: "ciaociao"
          })
          .expect(400)
          .end(done);
      });
    });*/

