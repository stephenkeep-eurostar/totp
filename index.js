require('dotenv').config()
const otplib = require('otplib')
const qrcode = require('qrcode')
const express = require('express')
const bodyParser = require('body-parser')
const app = express()

const users = {}

const getSecretForUser = (userId) => {
    return users[userId]
}

const setSecretForUser = (userId) => {
    return users[userId] = otplib.authenticator.generateSecret()
}

app.use(bodyParser.json())

app.post('/generate', function (req, res) {
    const {userId} = req.body
    res.send(setSecretForUser(userId))
})

app.post('/qrcode', function (req, res) {
    const { userId } = req.body
    const secret = getSecretForUser(userId)
    const otpauth = otplib.authenticator.keyuri(userId, 'eurostar', secret)
    qrcode.toDataURL(otpauth, (err, imageUrl) => {
        if (err) return res.status(500)
        
        res.send({
            imageUrl,
            secret
        })
    })
})

app.post('/verify', function (req, res) {
    const {userId, token} = req.body
    const secret = getSecretForUser(userId)
    const isValid = otplib.authenticator.verify({token, secret})
    res.status(isValid ? 200 : 401).send(isValid)
})

app.listen(3000)