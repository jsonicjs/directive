/* Copyright (c) 2021-2022 Richard Rodger, MIT License */

import {
  Jsonic,
  Rule,
  RuleSpec,
  StateAction,
  Plugin,
  Context,
  Token,
  Tin,
} from '@jsonic/jsonic-next'

type DirectiveOptions = {
  name: string
  open: string
  action: StateAction | string
  close?: string
  rules?: {
    open?: string | string[]
    close?: string | string[]
  }
  custom?: (
    jsonic: Jsonic,
    config: { OPEN: Tin; CLOSE: Tin | null | undefined; name: string },
  ) => void
}

const parseList = (list: undefined | string | string[]): string[] =>
  ('string' == typeof list ? list.split(/\s*,\s*/) : list || []).filter(
    (item) => null != item && '' !== item,
  )

const Directive: Plugin = (jsonic: Jsonic, options: DirectiveOptions) => {
  let rules = {
    open: parseList(options?.rules?.open),
    close: parseList(options?.rules?.close),
  }

  let name = options.name
  let open = options.open
  let close = options.close
  let action: StateAction
  let custom = options.custom

  if ('string' === typeof options.action) {
    let path = options.action
    action = (rule: Rule) =>
      (rule.node = jsonic.util.prop(jsonic.options, path))
  } else {
    action = options.action
  }

  let token: Record<string, string> = {}

  let openTN = '#OD_' + name
  let closeTN = '#CD_' + name

  let OPEN: Tin = jsonic.fixed(open) as Tin
  let CLOSE = null == close ? null : jsonic.fixed(close)

  // OPEN must be unique
  if (null != OPEN) {
    throw new Error('Directive open token already in use: ' + open)
  } else {
    token[openTN] = open
  }

  // Only create CLOSE if not already defined as a fixed token
  if (null == CLOSE && null != close) {
    token[closeTN] = close
  }

  jsonic.options({
    fixed: {
      token,
    },
    error: {
      [name + '_close']:
        null == close
          ? null
          : 'directive ' +
            name +
            ' close "' +
            close +
            '" without open "' +
            open +
            '"',
    },
    hint: {
      [name + '_close']:
        null == close
          ? null
          : `
The {name} directive must start with the characters "{open}" and end
with the characters "{close}". The end characters "{close}" may not
appear without the start characters "{open}" appearing first:
"{open}...{close}".
`,
    },
  })

  let CA = jsonic.token.CA
  OPEN = jsonic.fixed(open) as Tin
  CLOSE = null == close ? null : jsonic.fixed(close)

  // NOTE: RuleSpec.open|close refers to Rule state, whereas
  // OPEN|CLOSE refers to opening and closing tokens for the directive.

  rules.open.forEach((rulename) => {
    jsonic.rule(rulename, (rs: RuleSpec) => {
      rs.open({
        s: [OPEN],
        p: name,
        n: { ['dr_' + name]: 1 },
        g: 'start',
      })

      if (null != close) {
        rs.open({
          s: [OPEN, CLOSE],
          b: 1,
          p: name,
          n: { ['dr_' + name]: 1 },
          g: 'start,end',
        })

        rs.close({
          s: [CLOSE],
          b: 1,
          g: 'end',
        })
      }

      return rs
    })
  })

  if (null != close) {
    rules.close.forEach((rulename) => {
      jsonic.rule(rulename, (rs: RuleSpec) => {
        rs.close([
          {
            s: [CLOSE],
            c: (r) => 1 === r.n['dr_' + name],
            b: 1,
            g: 'end',
          },
          {
            s: [CA, CLOSE],
            c: (r) => 1 === r.n['dr_' + name],
            b: 1,
            g: 'end,comma',
          },
        ])
      })
    })
  }

  jsonic.rule(name, (rs) =>
    rs
      .clear()
      .bo((rule: Rule) => ((rule.node = {}), undefined))
      .open([
        null != close ? { s: [CLOSE], b: 1 } : null,
        {
          p: 'val',

          // Only accept implicits when there is a CLOSE token,
          // otherwise we'll eat all following siblings.
          // n: null == close ? {} : { pk: -1, il: 0 },
          n: null == close ? { dlist: 1, dmap: 1 } : { dlist: 0, dmap: 0 },
        },
      ])
      .bc(function (
        this: RuleSpec,
        rule: Rule,
        ctx: Context,
        next: Rule,
        tkn?: Token | void,
      ) {
        let out = action.call(this, rule, ctx, next, tkn)
        if (out?.isToken) {
          return out
        }
      })
      .close(null != close ? [{ s: [CLOSE] }, { s: [CA, CLOSE] }] : []),
  )

  if (custom) {
    custom(jsonic, { OPEN, CLOSE, name })
  }
}

Directive.defaults = {
  rules: {
    // By default, directives only operate where vals occur.
    open: 'val',
    close: 'list,elem,map,pair',
  },
} as DirectiveOptions

export { Directive }

export type { DirectiveOptions }
