
let mongoose = require("mongoose");
const User = require('../../src/models/user.model');
let chai = require('chai');
let chaiHttp = require('chai-http');
let { app } = require('../../src/index');
let should = chai.should();
chai.use(chaiHttp);

/*Some tests for authentication*/


describe('Users', () => {
    beforeEach((done) => {
        User.remove({}, (err) => {
            done();
        });
    });

    describe('/POST user', () => {
        it('it should not create a user without email address', (done) => {
            let user = {
                firstName: "John",
                lastName: "Doe",
                password: "ffffffff"
            }
            chai.request(app)
                .post('/api/register')
                .send(user)
                .end((err, res) => {
                    res.should.have.status(400);
                    res.body.should.be.a('object');
                    res.body.should.have.property('message').eql('some fields are mandatory');
                    done();
                });
        });

        it('it should create a user ', (done) => {
            let user = {
                firstName: "John",
                lastName: "Doe",
                email: "doe@email.com",
                password: "ffffffff"
            }
            chai.request(app)
                .post('/api/register')
                .send(user)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('message').eql('User was registered successfully! Please check your email');
                    res.body.user.should.have.property('firstName');
                    res.body.user.should.have.property('lastName');
                    res.body.user.should.have.property('email');
                    done();
                });
        });
    });


    describe('/PUT/:id user', () => {
        it('it should update a user given an id', (done) => {
            let user = new User({ firstName: "John", lastName: "Doe", email: "doe@email.com", password: "ffffffff" })
            user.save((err, user) => {
                chai.request(app)
                    .put('/api/update/' + user.id)
                    .send({ firstName: "Sissa", lastName: "Doe", email: "john@email.com", password: "ffffffff" })
                    .end((err, res) => {
                        res.should.have.status(201);
                        res.body.should.be.a('object');
                        res.body.should.have.property('message').eql('User updated successfully!');
                        
                        done();
                    });
            });
        });
    });

    describe('/DELETE/:id user', () => {
        it('it should delete a user given an id', (done) => {
            let user = new User({ firstName: "Sissa", lastName: "Doe", email: "john@email.com", password: "ffffffff" })
            user.save((err, user) => {
                chai.request(app)
                    .delete('/api/deleteuser/' + user.id)
                    .end((err, res) => {
                        res.should.have.status(200);
                        res.body.should.be.a('object');
                        res.body.should.have.property('message').eql('Deleted!');
                        done();
                    });
            });
        });
    });
});
