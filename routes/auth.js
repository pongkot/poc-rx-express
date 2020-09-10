const { Router } = require('express')
const _ = require('lodash')
const { from } = require('rxjs')
const { tap, map } = require('rxjs/operators')
const router = Router()

router.post('/', (req, res) => {
    const user = _.get(req, 'body.user')
    const password = _.get(req, 'body.password')

    // Assume query from database
    const mockUserRepo = new Promise(resolve => {
        resolve({
            "foo": {
                id: 1,
                username: "foo",
                email: "foo@mail.cc",
                suspend: false,
                password: "P@ssw0rd"
            },
            "bar": {
                id: 2,
                username: "bar",
                email: "bar@mail.cc",
                suspend: true,
                password: "P@ssw0rd"
            }
        })
    })

    const cursor = mockUserRepo.then(r => _.get(r, user))

    from(cursor)
        .pipe(
            tap(u => {
                // validate user exist
                if (_.isNil(u)) {
                    throw new Error('user does not exist')
                }

                // validate user suspend
                if (_.eq(true, _.get(u, 'suspend'))) {
                    throw new Error('user suspended')
                }
            }),
            map(i => {
                let result = false

                // verify password
                if (_.eq(password, _.get(i, 'password'))) {
                    result = true
                }

                return result
            }),
            tap(s => {
                // validate password valid
                if (!(s)) {
                    throw new Error('password invalid')
                }
            })
        ).subscribe({
            next(e) {
                if (e) {
                    res.send('login success')
                }
            },
            error(err) {
                console.log(`${new Date()} ${err.message}`)
                res.sendStatus(401)
            }
        })
})

module.exports = router