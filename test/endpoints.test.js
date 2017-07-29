const request = require('supertest')
const assert = require('assert')

describe('loading express', () => {
  let server
  let close

  beforeEach(() => {
    const {app, listener} = require('../server/server')
    server = app
    close = listener.close.bind(listener)
  })
  afterEach(() => {
    close()
  })

  it('responds to /api/framedata', () => {
    const CHARACTER_KEYS = [
      'josie',
      'dragunov',
      'akuma',
      'devil-jin',
      'gigas',
      'kazumi',
      'bryan',
      'claudio',
      'asuka',
      'eliza',
      'kazuya',
      'king',
      'jack-7',
      'hwoarang',
      'feng',
      'katarina',
      'bob',
      'alisa',
      'jin',
      'eddy',
      'leo',
      'ling',
      'lars',
      'heihachi',
      'law',
      'lili',
      'lee',
      'lucky-chloe',
      'nina',
      'miguel',
      'master-raven',
      'shaheen',
      'paul',
      'steve',
      'yoshimitsu'
    ]
    const ALISA_DATA = require('../server/database/json/t7-alisa-1.json')

    return request(server).get('/api/framedata').then(res => {
      assert(Object.keys(res.body), CHARACTER_KEYS)
      assert(res.body.alisa.name, 'Alisa Bosconovich')
      assert(res.body.alisa.label, 'alisa')
      assert(res.body.alisa.data[0], ALISA_DATA.moves[0])
    })
  })

  it('responds to /api/framedata/:id', () => {
    const KAZUMI_DATA = require('../server/database/json/t7-kazumi-1.json')

    return request(server).get(`/api/framedata/6`).then(res => {
      assert(res.body.name, 'Kazumi Mishima')
      assert(res.body.label, 'kazumi')
      assert(res.body.data, KAZUMI_DATA.moves)
    })
  })

  it('responds to /api/metadata', () => {
    const KEYS = [
      'josie',
      'dragunov',
      'akuma',
      'devil-jin',
      'gigas',
      'kazumi',
      'kuma',
      'bryan',
      'claudio',
      'asuka',
      'eliza',
      'kazuya',
      'king',
      'jack-7',
      'hwoarang',
      'feng',
      'katarina',
      'bob',
      'alisa',
      'jin',
      'eddy',
      'leo',
      'ling',
      'lars',
      'heihachi',
      'law',
      'lili',
      'lee',
      'lucky-chloe',
      'nina',
      'miguel',
      'master-raven',
      'shaheen',
      'paul',
      'steve',
      'yoshimitsu',
      'last_updated'
    ]
    const ENTRY_KEYS = [
      'id',
      'name',
      'label',
      'game',
      'last_updated'
    ]

    return request(server).get(`/api/metadata`).then(res => {
      assert(Object.keys(res.body), KEYS)
      KEYS.slice(0,-1).forEach(k => assert(Object.keys(res.body[k]), ENTRY_KEYS))
    })
  })
})