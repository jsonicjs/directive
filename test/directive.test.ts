/* Copyright (c) 2021 Richard Rodger and other contributors, MIT License */


import { Jsonic, Rule, Context } from 'jsonic'
import { Directive } from '../directive'





describe('directive', () => {

  test('happy', () => {
    const j = Jsonic.make().use(Directive, {
      name: 'happy',
      open: '@',
      action: (rule: Rule, ctx: Context) => {
        let from = rule.parent?.name
        if ('val' === from) {
          rule.node = from + ':' + JSON.stringify(rule.child.node).toUpperCase()
          // console.log('D', rule.node, ctx.rs.length)
          // TODO: if obj insert at top level
          // TODO: rule.depth
        }
        else if ('pair' === from) {
          if (rule.parent) {
            rule.parent.node.pair$ = rule.child.node
          }
        }
        else if ('elem' === from) {
          rule.node = '<' + rule.child.node + '>'
        }
      }
    })

    expect(j('@t')).toEqual('val:"T"')

    expect(j('{"a":1}')).toEqual({ a: 1 })
    expect(j('{"a":@ a}')).toEqual({ a: 'val:"A"' })
    expect(j('{"a":@{x:1}}')).toEqual({ a: 'val:{"X":1}' })
    expect(j('{"a":@@a}')).toEqual({ a: 'val:"VAL:\\"A\\""' })

    expect(j('{"a":1,@b}')).toEqual({ a: 1, pair$: 'b' })
    expect(j('{"a":1,@[2]}')).toEqual({ a: 1, pair$: [2] })

    expect(j('{"a":[1,@b]}')).toEqual({ a: [1, '<b>'] })
  })


  test('inject', () => {

    const j = Jsonic.make().use(Directive, {
      name: 'inject',
      open: '<',
      close: '>',
      action: (rule: Rule) => {
        // console.log('Pn',rule.parent.node)
        // console.log('Sn',rule.node)
        // console.log('Cn',rule.child.node)


        let from = rule.parent && rule.parent.name

        if ('pair' === from) {
          Jsonic.util.deep(rule.node, rule.child.node)
          if (rule.parent?.node) {
            rule.parent.node.$ = rule.child.node
          }
        }
        else if ('elem' === from) {
          rule.node = undefined
          rule.parent?.node.push(rule.child.node)
        }
      }
    })


    expect(j('x:10,<{y:2}>,z:3')).toEqual({ x: 10, '$': { y: 2 }, z: 3 })
    expect(j('{x:20,<{y:2}>,z:3}')).toEqual({ x: 20, '$': { y: 2 }, z: 3 })
    expect(j('{x:30,<y:3>,z:4}')).toEqual({ x: 30, '$': { y: 3 }, z: 4 })
    expect(j('{x:40,<{y:2,z:3}>,k:5}')).toEqual({ x: 40, '$': { y: 2, z: 3 }, k: 5 })
    expect(j('{x:50,<{y:2,z:3,q:4}>,k:5}')).toEqual({ x: 50, '$': { y: 2, z: 3, q: 4 }, k: 5 })
    expect(j('{x:40,<{y:2,z:q:3,w:6}>,k:5}')).toEqual({ x: 40, '$': { y: 2, z: { q: 3 }, w: 6 }, k: 5 })
    expect(j('{x:60,<y:3,z:4>,k:5}')).toEqual({ x: 60, '$': { y: 3, z: 4 }, k: 5 })
    expect(j('{x:70,<y:3,z:q:4,w:6>,k:5}')).toEqual({ x: 70, '$': { y: 3, z: { q: 4 }, w: 6 }, k: 5 })
    expect(j('x:80,<{y:2,}>,z:3')).toEqual({ x: 80, '$': { y: 2 }, z: 3 })
    expect(j('x:90,<y:2,>,z:3')).toEqual({ x: 90, '$': { y: 2 }, z: 3 })
    expect(j('100,<2>,99')).toEqual([100, 2, 99])
    expect(j('110,<[2]>,99')).toEqual([110, [2], 99])
    expect(j('120,<[2,3]>,99')).toEqual([120, [2, 3], 99])
    expect(j('130,<[2,3,4]>,99')).toEqual([130, [2, 3, 4], 99])
    expect(j('140,<[2,3,4,5]>,99')).toEqual([140, [2, 3, 4, 5], 99])
    expect(j('150,<[2,3,4,5,]>,99')).toEqual([150, [2, 3, 4, 5], 99])
    expect(j('160,<[,2,3,4,5,]>,99')).toEqual([160, [null, 2, 3, 4, 5], 99])
    expect(j('170,<2,3>,99')).toEqual([170, [2, 3], 99])
    expect(j('180,<2,3,4>,99')).toEqual([180, [2, 3, 4], 99])
    expect(j('190,<2,>,99')).toEqual([190, [2], 99])
    expect(j('200,<2,3,4,>,99')).toEqual([200, [2, 3, 4], 99])
    expect(j('210,<,2,3,4>,99')).toEqual([210, [null, 2, 3, 4], 99])


  })

})


