
import { Jsonic, RuleSpec, Rule, Plugin } from 'jsonic'


type DirectiveOptions = {
  name: string
  src: string
  action: (from?: string, rule?: Rule) => any
}

const Directive: Plugin = (jsonic: Jsonic, options: DirectiveOptions) => {
  let name = options.name
  let src = options.src
  let action = options.action

  jsonic.options({
    fixed: {
      token: {
        [name]: src
      }
    }
  })

  let { DR } = jsonic.token

  // TODO: .rule could accept a single match, unshifting to open? like lex?
  jsonic.rule('val', (rs: RuleSpec) => {
    rs.def.open.unshift({
      s: [DR], p: 'directive'
    })
    return rs
  })

  jsonic.rule('pair', (rs: RuleSpec) => {
    rs.def.open.unshift({
      s: [DR], p: 'directive'
    })
    return rs
  })

  jsonic.rule('elem', (rs: RuleSpec) => {
    rs.def.open.unshift({
      s: [DR], p: 'directive'
    })
    return rs
  })

  jsonic.rule('directive', () => {
    return new RuleSpec({
      open: [{ p: 'val' }],
      bc: (...all: any[]) => action(...all)
    })
  })


}

export {
  Directive,
}

export type {
  DirectiveOptions,
}
