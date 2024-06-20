#Below is LLD of the flow

Components and Modules

    User Module:
        Models:
            User: Represents user data including name, mobile number, email, password, followers, and following lists.
        Controllers:
            userController: Handles user-related operations such as signup, login, follow, unfollow, and search.
        Routes:
            /signup: Handles user registration.
            /login: Handles user authentication.
            /:id/follow: Handles following a user.
            /:id/unfollow: Handles unfollowing a user.
            /search: Searches users based on name.
        Middlewares:
            auth: Middleware to authenticate users using JWT.

    Post Module:
        Models:
            Post: Represents a post with text, image, hashtags, likes, comments, views, and createdBy fields.
        Controllers:
            postController: Handles creating, updating, deleting, viewing, liking, and unliking posts.
        Routes:
            /posts: Handles creating a post.
            /posts/:id: Handles updating or deleting a post.
            /posts/:id/view: Increments the view count of a post.
            /posts/:id/like: Likes a post.
            /posts/:id/unlike: Unlikes a post.

    Comment Module:
        Models:
            Comment: Represents a comment with text, createdBy, postId, likes, and createdAt fields.
        Controllers:
            commentController: Handles creating, updating, deleting, and liking comments.
        Routes:
            /comments: Handles creating a comment.
            /comments/:id: Handles updating or deleting a comment.
            /comments/:id/like: Likes a comment.
            /comments/:id/unlike: Unlikes a comment.

    Search Module:
        Controllers:
            searchController: Handles searching posts and users.
        Routes:
            /search/posts: Searches posts based on hashtags or text.
            /search/users: Searches users based on name.

    Middlewares:
        auth: Authenticates users using JWT.
        errorHandler: Global error handler to catch and respond to errors consistently.

Data Flow

    User Registration and Login:
        Signup:
            User sends a POST request to /signup with name, mobile number, email, and password.
            userController.signup hashes the password, saves the user, and generates a JWT.
            Response includes the user data and JWT.
        Login:
            User sends a POST request to /login with email and password.
            userController.login verifies credentials, generates a JWT, and responds with user data and JWT.

    User Actions (Follow/Unfollow/Search):
        Follow/Unfollow:
            Authenticated user sends a POST request to /:id/follow or /:id/unfollow.
            userController.follow or userController.unfollow updates the followers and following lists.
            Response includes the updated user data.
        Search Users:
            User sends a GET request to /search with a query parameter for the name.
            userController.search finds matching users and responds with user data.

    Post Actions:
        Create Post:
            Authenticated user sends a POST request to /posts with text, optional image, and hashtags.
            postController.create saves the post and responds with the post data.
        Update/Delete Post:
            Authenticated user sends a PATCH/DELETE request to /posts/:id.
            postController.update or postController.delete updates or deletes the post.
            Response includes the updated or confirmation of deletion.
        View Post:
            User sends a POST request to /posts/:id/view.
            postController.view increments the view count and responds with the updated post.
        Like/Unlike Post:
            Authenticated user sends a POST request to /posts/:id/like or /posts/:id/unlike.
            postController.like or postController.unlike updates the likes array and responds with the updated post.

    Comment Actions:
        Create Comment:
            Authenticated user sends a POST request to /comments with text and postId.
            commentController.create saves the comment and responds with the comment data.
        Update/Delete Comment:
            Authenticated user sends a PATCH/DELETE request to /comments/:id.
            commentController.update or commentController.delete updates or deletes the comment.
            Response includes the updated or confirmation of deletion.
        Like/Unlike Comment:
            Authenticated user sends a POST request to /comments/:id/like or /comments/:id/unlike.
            commentController.like or commentController.unlike updates the likes array and responds with the updated comment.

    Search Posts:
        User sends a GET request to /search/posts with query parameters for hashtags or text.
        searchController.searchPosts finds matching posts and responds with post data.
