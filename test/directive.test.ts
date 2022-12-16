/* Copyright (c) 2021-2022 Richard Rodger and other contributors, MIT License */


import { Jsonic, Rule } from '@jsonic/jsonic-next'
// import { Debug } from '@jsonic/jsonic-next'
import { Directive } from '../directive'



const clone = (x: any) => JSON.parse(JSON.stringify(x))


describe('directive', () => {

  test('happy', () => {
    const j = Jsonic.make()
      // .use(Debug, { trace: true })
      .use(Directive, {
        name: 'upper',
        open: '@',
        action: (rule: Rule) => rule.node = ('' + rule.child.node).toUpperCase()
      })

    expect(j.token.OD_upper).toBeDefined()
    expect(j.rule('upper')).toBeDefined()

    expect(j('@a')).toEqual('A')

    expect(j('[]')).toEqual([])
    expect(j('[1]')).toEqual([1])
    expect(j('[1, 2]')).toEqual([1, 2])
    expect(j('[1, 2, 3]')).toEqual([1, 2, 3])
    expect(j('[@a]')).toEqual(['A'])
    expect(j('[1, @a]')).toEqual([1, 'A'])
    expect(j('[1, 2, @a]')).toEqual([1, 2, 'A'])
    expect(j('[1, @a, 2]')).toEqual([1, 'A', 2])
    expect(j('[@a, 2]')).toEqual(['A', 2])
    expect(j('[@a, 2, 1]')).toEqual(['A', 2, 1])
    expect(j('[@a, @b]')).toEqual(['A', 'B'])
    expect(j('[@a, @b, @c]')).toEqual(['A', 'B', 'C'])
    expect(j('[1, @a, @b]')).toEqual([1, 'A', 'B'])
    expect(j('[1, @a, 2, @b]')).toEqual([1, 'A', 2, 'B'])
    expect(j('[1, @a, 2, @b, 3]')).toEqual([1, 'A', 2, 'B', 3])

    expect(j('[1 2]')).toEqual([1, 2])
    expect(j('[1 2 3]')).toEqual([1, 2, 3])
    expect(j('[@a]')).toEqual(['A'])
    expect(j('[1 @a]')).toEqual([1, 'A'])
    expect(j('[1 2 @a]')).toEqual([1, 2, 'A'])
    expect(j('[1 @a 2]')).toEqual([1, 'A', 2])
    expect(j('[@a 2]')).toEqual(['A', 2])
    expect(j('[@a 2 1]')).toEqual(['A', 2, 1])
    expect(j('[@a @b]')).toEqual(['A', 'B'])
    expect(j('[@a @b @c]')).toEqual(['A', 'B', 'C'])
    expect(j('[1 @a @b]')).toEqual([1, 'A', 'B'])
    expect(j('[1 @a 2 @b]')).toEqual([1, 'A', 2, 'B'])
    expect(j('[1 @a 2 @b 3]')).toEqual([1, 'A', 2, 'B', 3])

    expect(j('{}')).toEqual({})

    expect(j('{x:1}')).toEqual({ x: 1 })
    expect(j('{x:1, y:2}')).toEqual({ x: 1, y: 2 })
    expect(j('{x:1, y:2, z:3}')).toEqual({ x: 1, y: 2, z: 3 })
    expect(j('{x:@a}')).toEqual({ x: 'A' })
    expect(j('{y:1, x:@a}')).toEqual({ y: 1, x: 'A' })
    expect(j('{y:1, z: 2, x:@a}')).toEqual({ y: 1, z: 2, x: 'A' })
    expect(j('{y:1, x:@a, z:2}')).toEqual({ y: 1, x: 'A', z: 2 })
    expect(j('{x:@a, y:1, z: 2}')).toEqual({ x: 'A', y: 1, z: 2 })
    expect(j('{x:@a, z:2}')).toEqual({ x: 'A', z: 2 })
    expect(j('{x:@a, y:@b}')).toEqual({ x: 'A', y: 'B' })
    expect(j('{a:1, x:@a, y:@b}')).toEqual({ a: 1, x: 'A', y: 'B' })
    expect(j('{a:1, x:@a, b:2, y:@b}')).toEqual({ a: 1, x: 'A', b: 2, y: 'B' })
    expect(j('{a:1, x:@a, b:2, y:@b, c: 3}'))
      .toEqual({ a: 1, x: 'A', b: 2, y: 'B', c: 3 })

    expect(j('{x:1}')).toEqual({ x: 1 })
    expect(j('{x:1 y:2}')).toEqual({ x: 1, y: 2 })
    expect(j('{x:1 y:2 z:3}')).toEqual({ x: 1, y: 2, z: 3 })
    expect(j('{x:@a}')).toEqual({ x: 'A' })
    expect(j('{y:1 x:@a}')).toEqual({ y: 1, x: 'A' })
    expect(j('{y:1 z: 2 x:@a}')).toEqual({ y: 1, z: 2, x: 'A' })
    expect(j('{y:1 x:@a z:2}')).toEqual({ y: 1, x: 'A', z: 2 })
    expect(j('{x:@a y:1 z: 2}')).toEqual({ x: 'A', y: 1, z: 2 })
    expect(j('{x:@a z:2}')).toEqual({ x: 'A', z: 2 })
    expect(j('{x:@a y:@b}')).toEqual({ x: 'A', y: 'B' })
    expect(j('{a:1 x:@a y:@b}')).toEqual({ a: 1, x: 'A', y: 'B' })
    expect(j('{a:1 x:@a b:2 y:@b}')).toEqual({ a: 1, x: 'A', b: 2, y: 'B' })
    expect(j('{a:1 x:@a b:2 y:@b c: 3}'))
      .toEqual({ a: 1, x: 'A', b: 2, y: 'B', c: 3 })

    expect(j('1, @a')).toEqual([1, 'A'])
    expect(j('1, 2, @a')).toEqual([1, 2, 'A'])
    expect(j('@a, 1')).toEqual(['A', 1])
    expect(j('@a, 1, 2')).toEqual(['A', 1, 2])
    expect(j('1, @a, 2')).toEqual([1, 'A', 2])

    expect(j('1 @a')).toEqual([1, 'A'])
    expect(j('1 2 @a')).toEqual([1, 2, 'A'])
    expect(j('@a 1')).toEqual(['A', 1])
    expect(j('@a 1 2')).toEqual(['A', 1, 2])
    expect(j('1 @a 2')).toEqual([1, 'A', 2])

    expect(j('1, @a, @b')).toEqual([1, 'A', 'B'])
    expect(j('1, 2, @a, @b')).toEqual([1, 2, 'A', 'B'])
    expect(j('@a, @b, 1')).toEqual(['A', 'B', 1])
    expect(j('@a, @b, 1, 2')).toEqual(['A', 'B', 1, 2])
    expect(j('1, @a, @b, 2')).toEqual([1, 'A', 'B', 2])

    expect(j('1 @a @b')).toEqual([1, 'A', 'B'])
    expect(j('1 2 @a @b')).toEqual([1, 2, 'A', 'B'])
    expect(j('@a @b 1')).toEqual(['A', 'B', 1])
    expect(j('@a @b 1 2')).toEqual(['A', 'B', 1, 2])
    expect(j('1 @a @b 2')).toEqual([1, 'A', 'B', 2])

    // NOTE: does not handle pairs - must be a value
    expect(() => j('a:1, @a')).toThrow('unexpected')
    expect(() => j('{a:1, @a}')).toThrow('unexpected')
    expect(() => j('a:1 @a')).toThrow('unexpected')
    expect(() => j('{a:1 @a}')).toThrow('unexpected')

    expect(clone(j('1, @a, b:2'))).toEqual([1, 'A'])
    expect(j('1, @a, b:2').b).toEqual(2)
  })




  test('action-option-prop', () => {
    const j0 = Jsonic.make()
      .use(Directive, {
        name: 'constant',
        open: '@',
        action: 'custom.x'
      })
    j0.options({ custom: { x: 11 } })

    expect(j0('@')).toEqual(11)
  })



  test('close', () => {
    const j = Jsonic.make().use(Directive, {
      name: 'foo',
      open: 'foo<',
      close: '>',
      action: (rule: Rule) => rule.node = 'FOO',
    })

    expect(j('foo<t>')).toEqual('FOO')
    expect(j('foo<>')).toEqual('FOO')

    expect(j('{"a":1}')).toEqual({ a: 1 })
    expect(j('{"a":foo< a >}')).toEqual({ a: 'FOO' })
    expect(j('{"a":foo<{x:1}>}')).toEqual({ a: 'FOO' })
    expect(j('{"a":foo<foo<a>>}')).toEqual({ a: 'FOO' })

    expect(j('{"a":1,b:foo<b>}')).toEqual({ a: 1, b: 'FOO' })
    expect(j('{"a":1,b:foo<[2]>}')).toEqual({ a: 1, b: 'FOO' })

    expect(j('{"a":[1,foo<b>]}')).toEqual({ a: [1, 'FOO'] })


    expect(j('a:foo<y:2,>', { xlog: -1 })).toEqual({ a: 'FOO' })
    // expect(() => j('>')).toThrow(/foo_close/)
    expect(() => j('>')).toThrow(/unexpected/)
    // expect(() => j('a:>', { xlog: -1 })).toThrow(/foo_close/)
    expect(() => j('a:>', { xlog: -1 })).toThrow(/unexpected/)


    const k = j.use(Directive, {
      name: 'bar',
      open: 'bar<',
      close: '>',
      action: (rule: Rule) => rule.node = 'BAR'
    })

    expect(k('{"a":1}')).toEqual({ a: 1 })
    expect(k('{"a":bar< a >}')).toEqual({ a: 'BAR' })
    expect(k('{"a":bar<{x:1}>}')).toEqual({ a: 'BAR' })
    expect(k('{"a":bar<bar<a>>}')).toEqual({ a: 'BAR' })

    expect(k('{"a":1,b:bar<b>}')).toEqual({ a: 1, b: 'BAR' })
    expect(k('{"a":1,b:bar<[2]>}')).toEqual({ a: 1, b: 'BAR' })

    expect(k('{"a":[1,bar<b>]}')).toEqual({ a: [1, 'BAR'] })


    expect(k('{"a":1}')).toEqual({ a: 1 })
    expect(k('{"a":foo< a >}')).toEqual({ a: 'FOO' })
    expect(k('{"a":foo<{x:1}>}')).toEqual({ a: 'FOO' })
    expect(k('{"a":foo<foo<a>>}')).toEqual({ a: 'FOO' })

    expect(k('{"a":1,b:foo<b>}')).toEqual({ a: 1, b: 'FOO' })
    expect(k('{"a":1,b:foo<[2]>}')).toEqual({ a: 1, b: 'FOO' })

    expect(k('{"a":[1,foo<b>]}')).toEqual({ a: [1, 'FOO'] })


    expect(k('{"a":foo< a >, b:bar<>}')).toEqual({ a: 'FOO', b: 'BAR' })


    expect(() =>
      j.use(Directive, {
        name: 'bar',
        open: 'bar<',
        action: () => null
      })
    ).toThrow(/bar</)

  })



  test('inject', () => {

    const SRC: any = {
      a: 'A',
      b: { b: 1 },
      bb: { bb: 1 },
      c: [2, 3],
    }

    const j = Jsonic.make().use(Directive, {
      name: 'inject',
      open: '@',
      rules: {
        open: 'val,pair'
      },
      action: (rule: Rule) => {
        let srcname = '' + rule.child.node
        let src = SRC[srcname]
        let from = rule.parent.name

        if ('pair' === from) {
          Object.assign(rule.parent.node, src)
        }
        else {
          rule.node = src
        }
      },
      custom: (jsonic: Jsonic, { OPEN, name }: any) => {

        // Handle special case of @foo first token - assume a map
        jsonic
          .rule('val', (rs) => {
            rs.open({
              s: [OPEN],
              c: (r) => 0 === r.d,
              p: 'map',
              b: 1,
              n: { [name + '_top']: 1 }
            })
          })

        jsonic
          .rule('map', (rs) => {
            rs.open({
              s: [OPEN],
              c: (r) => (1 === r.d && 1 === r.n[name + '_top']),
              p: 'pair',
              b: 1,
            })
          })
      }

    })


    expect(j('a:@z')).toEqual({ a: null })

    expect(j('a:@a')).toEqual({ a: 'A' })
    expect(j('a:b:@a')).toEqual({ a: { b: 'A' } })

    expect(j('b:@b')).toEqual({ b: { b: 1 } })
    expect(j('b:a:@b')).toEqual({ b: { a: { b: 1 } } })

    expect(j('c:@c')).toEqual({ c: [2, 3] })
    expect(j('c:b:@c')).toEqual({ c: { b: [2, 3] } })

    expect(j('a:1 @b')).toEqual({ a: 1, b: 1 })
    expect(j('a:1 @b c:2')).toEqual({ a: 1, b: 1, c: 2 })
    expect(j('a:@a @b c:@c')).toEqual({ a: 'A', b: 1, c: [2, 3] })

    // NOTE: assumes map at top level
    expect(j('@a')).toEqual({ 0: 'A' })
    expect(j('@b')).toEqual({ b: 1 })
    expect(j('@c')).toEqual({ 0: 2, 1: 3 })

    expect(j('@b x:1')).toEqual({ b: 1, x: 1 })
    expect(j('@b x:1 @bb')).toEqual({ b: 1, x: 1, bb: 1 })
  })


  test('adder', () => {
    const j = Jsonic.make().use(Directive, {
      name: 'adder',
      open: 'add<',
      close: '>',
      action: (rule: Rule) => {
        let out = 0
        if (Array.isArray(rule.child.node)) {
          out = rule.child.node.reduce((a, v) => a + v)
        }
        rule.node = out
      }
    })

    expect(j('add<1,2>')).toEqual(3)
    expect(j('a:add<1,2>')).toEqual({ a: 3 })
    expect(j('[add<a,b>]')).toEqual(['ab'])


    const k = j.use(Directive, {
      name: 'multiplier',
      open: 'mul<',
      close: '>',
      action: (rule: Rule) => {
        let out = 0
        if (Array.isArray(rule.child.node)) {
          out = rule.child.node.reduce((a, v) => a * v)
        }
        rule.node = out
      }
    })

    expect(k('mul<2,3>')).toEqual(6)
    expect(k('a:mul<2,3>')).toEqual({ a: 6 })
    expect(k('[mul<a,1>]')).toEqual([NaN])

    expect(j('add<1,2>')).toEqual(3)
    expect(j('a:add<1,2>')).toEqual({ a: 3 })
    expect(j('[add<a,b>]')).toEqual(['ab'])

  })


  test('edges', () => {
    let j = Jsonic.make().use(Directive, {
      name: 'none',
      open: '@',
      action: () => null,
      rules: null,
    })
    expect(() => j('a:@x')).toThrow('unexpected')
  })


  test('error', () => {
    let j = Jsonic.make().use(Directive, {
      name: 'bad',
      open: '@',
      action: (rule: Rule) => {
        return rule.parent?.o0.bad('bad')
      }
    })
    expect(() => j('a:@x')).toThrow(/bad.*:1:3/s)
  })


})


