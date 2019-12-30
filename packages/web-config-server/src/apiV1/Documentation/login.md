## login

Authenticate user

* ###### URL

 `/login`

* ###### METHOD

  `POST`

* ###### DATA PARAMS

  ```
  {
    user: ${username},
    password: ${userpassword},
  }
  ```

* ###### ON SUCCESS
  * code:  `200`
  * content: `{ authenticated: true, defaultOrganistionUnit: ${users default orgUnit id} }`

* ###### ON FAIL
 * common responses as per `./Index.md`


* ###### NOTES

  On success user will be given an encrypted session cookie, it will last `${x}` amount of seconds and will refresh/extend to `${y}` amount of seconds as defined in .env
