const express = require('express')
const crypto = require('crypto')
const router = express.Router()
const { v4: uuidv4 } = require('uuid')
const db = require('../db/dbSetup')

const DOTPAY_MERCHANT_ID = process.env.DOTPAY_MERCHANT_ID
const DOTPAY_SECRET = process.env.DOTPAY_SECRET
const DOTPAY_RETURN_URL = process.env.DOTPAY_RETURN_URL
const DOTPAY_CALLBACK_URL = process.env.DOTPAY_CALLBACK_URL
const DOTPAY_TEST_URL = 'https://ssl.dotpay.pl/test_payment/'
const DOTPAY_PAYMENT_URL = DOTPAY_TEST_URL

function generateDotpayChk(dotpayPin, paramsObj) {
  const params = { ...paramsObj }
  const sortedKeys = Object.keys(params).sort()
  const paramsList = sortedKeys.join(';')
  params['paramsList'] = paramsList
  const sortedParams = {}
  Object.keys(params)
    .sort()
    .forEach((key) => {
      sortedParams[key] = params[key]
    })
  const json = JSON.stringify(sortedParams)
  return crypto
    .createHmac('sha256', dotpayPin)
    .update(json, 'utf8')
    .digest('hex')
}

router.get('/create-payment', (req, res) => {
  const amount = req.query.amount || '20.00'
  const currency = req.query.currency || 'PLN'
  const description = req.query.description || 'Testowa'
  const control = uuidv4()

  const params = {
    id: DOTPAY_MERCHANT_ID,
    amount: amount,
    currency: currency,
    description: description,
    control: control,
    url: DOTPAY_RETURN_URL,
    urlc: DOTPAY_CALLBACK_URL,
    lang: 'pl',
    type: '0',
    firstname: 'Jan',
    lastname: 'Kowalski',
    email: 'jan.kowalski@example.com',
  }

  const chk = generateDotpayChk(DOTPAY_SECRET, params)
  params.chk = chk

  let formHTML = `<html><body><form id="dotpayForm" action="${DOTPAY_PAYMENT_URL}" method="POST">`
  for (const key in params) {
    formHTML += `<input type="hidden" name="${key}" value="${params[key]}" />`
  }
  formHTML += `</form><script type="text/javascript">document.getElementById('dotpayForm').submit();</script></body></html>`
  res.send(formHTML)
})

router.post('/payment-return', (req, res) => {
  res.send('Dziękujemy, płatność została przetworzona.')
})

router.post('/dotpay/callback', (req, res) => {
  const params = req.body
  const expectedParams = {
    id: params.id,
    amount: params.amount,
    currency: params.currency,
    description: params.description,
    control: params.control,
    url: params.url,
    urlc: params.urlc,
    type: params.type,
    firstname: params.firstname,
    lastname: params.lastname,
    email: params.email,
  }
  const computedChk = generateDotpayChk(DOTPAY_SECRET, expectedParams)
  if (computedChk !== params.chk) {
    console.error('Błędny chk w callbacku Dotpay:', {
      computedChk,
      provided: params.chk,
      params,
    })
    return res.status(400).send('Błędny chk')
  }
  console.log('Otrzymano callback od Dotpay:', params)
  res.send('OKI')
})

module.exports = router
