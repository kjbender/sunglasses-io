const chai = require("chai");
const chaiHTTP = require("chai-http");
const server = require("../app/server");

const expect = chai.expect;
const assert = chai.assert;

chai.use(chaiHTTP);

// NOTE: some tests rely on pre-set acess tokens in server.js & carts of users in the json file 

// GET BRANDS
describe("/GET brands", () => {
  it.only("should GET all brands", done => {
    chai
      .request(server)
      .get("/api/brands")
      .end((err, res) => {
        assert.isNotNull(res.body);
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        expect("Content-Type", "application/json");
        expect(res.body).to.be.an("array");
        expect(res.body).to.have.lengthOf(5); // Should return all 5 brands 
        done();
      });
  }); 
  // Excluding this test; it works but can't be done at the same time as the others 
  it("should fail as expected when no brands are found", done => {
    chai
      .request(server)
      .get("/api/brands")
      .end((err, res) => {
        expect(res).to.have.status(404);
        done();
      });
  });
});

// GET PRODUCTS BY BRAND
describe("/GET products by brand", () => {
  // User brand id 1 
  it.only("should GET all products of a given brand with valid id", done => {
    chai
      .request(server)
      .get("/api/brands/1/products")
      .end((err, res) => {
        assert.isNotNull(res.body);
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        expect("Content-Type", "application/json");
        expect(res.body).to.be.an("array");
        expect(res.body).to.have.lengthOf(3); // Should return 3 products 
        done();
      });
  });
  // Use brand id 6 (DNE)
  it.only("should fail as expected when no brand matches given id", done => {
    chai
      .request(server)
      .get("/api/brands/6/products")
      .end((err, res) => {
        expect(res).to.have.status(404);
        done();
      });
  });
});

// GET PRODUCTS
describe("/GET products", () => {
  it.only("should GET all products", done => {
    chai
      .request(server)
      .get("/api/products")
      .end((err, res) => {
        assert.isNotNull(res.body);
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        expect("Content-Type", "application/json");
        expect(res.body).to.be.an("array");
        expect(res.body).to.have.lengthOf(11); // Should return all 11 products 
        done();
      });
  });
  // Search for 'best glasses' 
  it.only("should limit results to those with a query string", done => {
    chai
      .request(server)
      .get("/api/products?query=best+glasses")
      .end((err, res) => {
        assert.isNotNull(res.body);
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        expect("Content-Type", "application/json");
        expect(res.body).to.be.an("array");
        expect(res.body).to.have.lengthOf(4); // Should return 4 products 
        done();
      });
  });
  // Search for 'sunGlasses' (two products contain 'Sunglasses' in name/description)
  it.only("should provide case-insensitive results", done => {
    chai
      .request(server)
      .get("/api/products?query=sunGlasses")
      .end((err, res) => {
        assert.isNotNull(res.body);
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        expect("Content-Type", "application/json");
        expect(res.body).to.be.an("array");
        expect(res.body).to.have.lengthOf(2); // Should return 2 products 
        done();
      });
  });
  it.only("should return all products if query is missing", done => {
    chai
      .request(server)
      .get("/api/products?query=")
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        expect("Content-Type", "application/json");
        expect(res.body).to.be.an("array");
        expect(res.body).to.have.lengthOf(11); // Should return all 11 products 
        done();
      });
  }); 
  // No name/description contains 'blue' 
  it.only("should fail as expected when no products match query", done => {
    chai
      .request(server)
      .get("/api/products?query=blue")
      .end((err, res) => {
        expect(res).to.have.status(404);
        done();
      });
  });
});

// LOGIN 
describe("/POST login", () => { 
  // Chain operations (login/get cart) to confirm functionality 
  it.only("should POST user login with valid username, return token, and give cart access", done => {
    let credentials = {
      username: 'yellowleopard753',
      password: 'jonjon'
    }
    chai
      .request(server)
      .post("/api/login")
      .send(credentials)
      .end((err, res) => {
        assert.isNotNull(res.body);
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        expect("Content-Type", "application/json");
        expect(res.body).to.be.a("string");
        expect(res.body).to.have.length(16);
        let token = res.body;
        // Use token in response to access cart 
        chai.request(server)
          .get(`/api/me/cart?accessToken=${token}`)
          .end((err, res) => {
            expect(res).to.have.status(200);
            expect("Content-Type", "application/json");
            expect(res.body).to.be.an("array");
            done();
          });
      });
  });
  // Check that email/password combination also works (key structure of request object follows API)
  it.only("should POST user login with valid email, return token, and give cart access", done => {
    let credentials = {
      username: 'salvador.jordan@example.com',
      password: 'tucker'
    }
    chai
      .request(server)
      .post("/api/login")
      .send(credentials)
      .end((err, res) => {
        assert.isNotNull(res.body);
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        expect("Content-Type", "application/json");
        expect(res.body).to.be.a("string");
        expect(res.body).to.have.length(16);
        let token = res.body;
        chai.request(server)
          .get(`/api/me/cart?accessToken=${token}`)
          .end((err, res) => {
            expect(res).to.have.status(200);
            expect("Content-Type", "application/json");
            expect(res.body).to.be.an("array");
            done();
          });
      });
  });
  it.only("should fail as expected when password or username is missing", done => {
    let credentials = {
      username: 'yellowleopard753',
      password: ''
    }
    chai
      .request(server)
      .post("/api/login")
      .send(credentials)
      .end((err, res) => {
        expect(res).to.have.status(400);
        done();
      });
  });
  it.only("should fail as expected when password or username is invalid", done => {
    let credentials = {
      username: 'yellowleopard753',
      password: 'jon'
    }
    chai
      .request(server)
      .post("/api/login")
      .send(credentials)
      .end((err, res) => {
        expect(res).to.have.status(401);
        done();
      });
  });
});

// GET CART
describe("/GET cart", () => {
  it.only("should GET cart for signed-in user", done => {
    let token = 'kjKQZ2QHG1eFCfmT';
    chai.request(server)
      .get(`/api/me/cart?accessToken=${token}`)
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect("Content-Type", "application/json");
        expect(res.body).to.be.an("array");
        done();
      });
  });
  it.only("should fail as expected when a user is not logged in", done => {
    chai
      .request(server)
      .get("/api/me/cart")
      .end((err, res) => {
        expect(res).to.have.status(401);
        done();
      });
  });
});

// POST CART (add) 
// note: using deep equals here since cart items are constructed by endpoint handlers (more room for error) 
describe("/POST cart (add)", () => {
  it.only("should POST addition of item to cart", done => {
    let token = 'kjKQZ2QHG1eFCfmT';
    let productId = '1'; // Send productId as query 
    chai
      .request(server)
      .post(`/api/me/cart?productId=${productId}&accessToken=${token}`)
      .end((err, res) => {
        assert.isNotNull(res.body);
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        expect("Content-Type", "application/json");
        expect(res.body).to.be.an("array");
        expect(res.body).to.have.length(1);
        expect(res.body).to.deep.equal([{ productId: '1', quantity: 1 }]); // Check with deep equals 
        done();
      });
  }); 
  // Send request without token 
  it.only("should fail as expected when a user is not logged in", done => {
    let productId = '2';
    chai
      .request(server)
      .post(`/api/me/cart?productId=${productId}`)
      .end((err, res) => {
        expect(res).to.have.status(401);
        done();
      });
  });
  it.only("should fail as expected when no product matches given id", done => {
    let token = 'kjKQZ2QHG1eFCfmT';
    let productId = '12'; // Product DNE 
    chai
      .request(server)
      .post(`/api/me/cart?productId=${productId}&accessToken=${token}`)
      .end((err, res) => {
        expect(res).to.have.status(404);
        done();
      });
  });
  it.only("should increment the item quantity if it exists in the cart already", done => {
    let token = 'kjKQZ2QHG1eFCfmT';
    let productId = '1';
    chai
      .request(server)
      .post(`/api/me/cart?productId=${productId}&accessToken=${token}`)
      .end((err, res) => {
        assert.isNotNull(res.body);
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        expect("Content-Type", "application/json");
        expect(res.body).to.be.an("array");
        expect(res.body).to.have.length(1);
        expect(res.body).to.deep.equal([{ productId: '1', quantity: 2 }]); // Check with deep equals 
        done();
      });
  });
});

// DELETE CART 
describe("/DELETE cart", () => {
  it.only("should DELETE item from cart", done => {
    let token = 'hEoJFuix38uedAf0';
    chai
      .request(server)
      .delete(`/api/me/cart/3?accessToken=${token}`)
      .end((err, res) => {
        assert.isNotNull(res.body);
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        expect("Content-Type", "application/json");
        expect(res.body).to.be.an("array");
        expect(res.body).to.have.length(1); // One item should still be left in cart (see users.json) 
        done();
      });
  });
  it.only("should fail as expected when a user is not logged in", done => {
    chai
      .request(server)
      .delete(`/api/me/cart/3`)
      .end((err, res) => {
        expect(res).to.have.status(401);
        done();
      });
  });
  it.only("should fail as expected when no cart item matches given id", done => {
    let token = 'hEoJFuix38uedAf0';
    let productId = '5'; // Product exists but isn't an item in the user's cart 
    chai
      .request(server)
      .delete(`/api/me/cart/${productId}?accessToken=${token}`)
      .end((err, res) => {
        expect(res).to.have.status(404);
        done();
      });
  });
});

// POST CART (edit)
describe("/POST cart (edit)", () => {
  it.only("should POST changes to item quantity in cart", done => {
    let token = 'hEoJFuix38uedAf0';
    chai
      .request(server)
      .post(`/api/me/cart/4?quantity=3&accessToken=${token}`)
      .end((err, res) => {
        assert.isNotNull(res.body);
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        expect("Content-Type", "application/json");
        expect(res.body).to.be.an("array");
        expect(res.body).to.have.length(1);
        done();
      });
  });
  it.only("should fail as expected when a user is not logged in", done => {
    chai
      .request(server)
      .post("/api/me/cart/4?quantity=3")
      .end((err, res) => {
        expect(res).to.have.status(401);
        done();
      });
  });
  it.only("should fail as expected when no cart item matches given id", done => {
    let token = 'hEoJFuix38uedAf0';
    let productId = '5'; // Product exists but isn't an item in the user's cart 
    chai
      .request(server)
      .post(`/api/me/cart/${productId}?quantity=3&accessToken=${token}`)
      .end((err, res) => {
        expect(res).to.have.status(404);
        done();
      });
  });
  it.only("should fail as expected when quantity is less than one", done => {
    let token = 'hEoJFuix38uedAf0';
    let productId = '4';
    let quantity = 0;
    chai
      .request(server)
      .post(`/api/me/cart/${productId}?quantity=${quantity}&accessToken=${token}`)
      .end((err, res) => {
        expect(res).to.have.status(400);
        done();
      });
  });
  it.only("should fail as expected when quantity is not an integer", done => {
    let token = 'hEoJFuix38uedAf0';
    let productId = '4';
    let quantity = 1.5;
    chai
      .request(server)
      .post(`/api/me/cart/${productId}?quantity=${quantity}&accessToken=${token}`)
      .end((err, res) => {
        expect(res).to.have.status(400);
        done();
      });
  });
}); 