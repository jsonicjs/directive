
const { Jsonic, Debug } = require('@jsonic/jsonic-next')
const { Directive } = require('..')


const j = Jsonic.make().use(Debug,{trace:true}).use(Directive, {
  name: 'inject',
  open: '<',
  close: '>',
  action: (rule) => {
    // console.log('Pn',rule.parent.node)
    // console.log('Sn',rule.node)
    // console.log('Cn',rule.child.node)
    

    let from = rule.parent && rule.parent.name
    console.log('FROM', from)
    
    
    if ('pair' === from) {
      Jsonic.util.deep(rule.node, rule.child.node)
      // rule.parent.node = rule.parent.node || {}

      rule.parent.node.$ = rule.child.node
    }
    else if ('elem' === from) {
      // rule.node = undefined
      // rule.parent?.node.push(rule.child.node)
      rule.parent.node.unshift(rule.child.node)
      rule.parent.use.done = true
    }
    else if('val' === from) {
      console.log('VAL', rule)

      Jsonic.util.deep(rule.node, rule.child.node)
      rule.parent.node = rule.parent.node || {}
      rule.parent.node.$ = rule.child.node
    }
  }
})

// console.log(j('{<a:1>,b:2}'))
console.log(j('[<a:1>]'))
console.log(j('[2,<a:1>]'))

