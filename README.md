# Virtual Store API – Final Project (MongoDB)

**Name:** David Gazit

REST API for managing a virtual store, built with Node.js, Express, MongoDB, Mongoose and Zod.

## Running

```bash
npm install
cp .env.example .env   # then fill in your MongoDB connection string
npm start              # or: npm run dev (nodemon)
```

## Collections

| Collection | Fields | Relations |
|---|---|---|
| `categories` | `name` (unique) | – |
| `users` | `name`, `email` (unique) | – |
| `products` | `name`, `price`, `stock`, `category` | `category` → Category |
| `orders` | `user`, `products[] { product, quantity, price }`, `totalPrice`, timestamps | `user` → User, `products.product` → Product |

## Endpoints (base: `/api`)

| Method | Path | Description |
|---|---|---|
| POST | `/categories` | Create category |
| GET | `/categories` | List categories |
| GET | `/categories/products/count` | Number of products in each category |
| GET | `/categories/:id/products/count` | Number of products in one category |
| POST | `/users` | Create user (Zod) |
| GET | `/users` | List users |
| GET | `/users/:id` | Get user |
| POST | `/products` | Create product (Zod) |
| GET | `/products` | List products (`?category=<id>` to filter by category) |
| GET | `/products/:id` | Get product |
| PUT | `/products/:id` | Update product (Zod) |
| DELETE | `/products/:id` | Delete product |
| POST | `/orders` | Create order (Zod) – checks stock, calculates price, updates stock |
| GET | `/orders/:id` | Get order with user and products (populate) |
| GET | `/orders/user/:userId` | All orders of a user |

## Postman

Import `postman/virtual_store.postman_collection.json` and run it with the Collection Runner.
Created IDs are saved automatically into collection variables, so the requests can run in order.
