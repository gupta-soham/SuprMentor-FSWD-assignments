# Data Modeler — Assignment 30 Mar 2026

MongoDB schema design for a **blogging platform**.

## Entities & relationships

| Collection                   | Purpose                                                                    |
| ---------------------------- | -------------------------------------------------------------------------- |
| `users`                      | Authors and readers; optional profile + role                               |
| `posts`                      | Blog articles; references `users` as author                                |
| `comments`                   | Threaded comments on posts; references `users` and `posts`                 |
| `tags`                       | Normalized tags; many-to-many with posts via `post_tags` or embedded slugs |
| `sessions` or refresh tokens | Optional; often replaced by JWT only                                       |

## Recommended indexes

- `posts`: `{ authorId: 1, createdAt: -1 }`, `{ slug: 1 }` unique, text index on `title` + `body`
- `comments`: `{ postId: 1, createdAt: 1 }`
- `users`: `{ email: 1 }` unique

## Embedding vs referencing

- **Embed** short author snapshot on `posts` (`authorName`, `authorAvatar`) for read-heavy listing (denormalize carefully).
- **Reference** `authorId` as ObjectId for source of truth.
- **Comments**: reference `postId` + `userId`; optional `parentCommentId` for nesting.

See `schemas/blog.schemas.js` for Mongoose-style definitions.
