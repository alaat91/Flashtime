const router = require('express').Router()
const bcrypt = require('bcrypt')
const User = require('../models/user.schema')
const Deck = require('../models/deck.schema')
const verifyToken = require('../middlewares/verifyToken')

// consts
const SALT_ROUNDS = 10

router.get('/', verifyToken, (req, res) => {
  const { firstName, lastName, decks, deckCollections } = req.user
  res.json({
    firstName: firstName,
    lastName: lastName,
    decks: decks,
    deckCollections: deckCollections,
  })
})

router.post('/', async (req, res) => {
  try {
    const { firstName, lastName, email } = req.body
    const password = await bcrypt.hash(req.body.password, SALT_ROUNDS)
    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
    })
    await user.save()
    res.status(201).json(user)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
})

router.put('/:id', verifyToken, async (req, res) => {
  const userId = req.params.id
  const firstNameUpdate = req.body.firstName
  const lastNameUpdate = req.body.lastName
  const emailUpdate = req.body.email
  const passwordUpdate = req.body.password
  User.findById(userId)
    .then((userInfo) => {
      userInfo.firstName = firstNameUpdate
      userInfo.lastName = lastNameUpdate
      userInfo.email = emailUpdate
      userInfo.decks.push()
      return userInfo.save()
    })
    .then((result) => {
      res.json(result)
    })
    .catch((err) => {
      res.json({ message: err })
    })
})

router.patch('/password', verifyToken, async (req, res) => {
  const userId = req.user._id
  const currentPassword = req.body.currentPassword

  const isPasswordValid = await bcrypt.compare(
    currentPassword,
    req.user.password
  )
  if (!isPasswordValid) res.json('You typed the wrong password')
  const passwordUpdate = await bcrypt.hash(req.body.newPassword, SALT_ROUNDS)

  User.findById(userId)
    .then((userInfo) => {
      userInfo.password = passwordUpdate
      return userInfo.save()
    })
    .then((result) => {
      res.json(result)
    })
    .catch((err) => {
      res.json({ message: err })
    })
})

router.delete('/:id', verifyToken, async (req, res) => {
  const userId = req.params.id
  const deleteUser = await User.findByIdAndDelete(userId)
  res.json(`User with ${User.firstName} was deleted!`)
})

module.exports = router