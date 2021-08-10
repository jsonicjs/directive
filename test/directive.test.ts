/* Copyright (c) 2021 Richard Rodger and other contributors, MIT License */


import { Jsonic, Rule, Context } from 'jsonic'
import { Directive } from '../directive'





describe('directive', () => {

  test('happy', () => {
    const j = Jsonic.make().use(Directive, {
      name: '#DR',
      src: '@',
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

  test('foo', () => {
  })

})


