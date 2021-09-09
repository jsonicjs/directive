"use strict";
/* Copyright (c) 2021 Richard Rodger, MIT License */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Directive = void 0;
const Directive = (jsonic, options) => {
    let rules = ('string' == typeof options.rules
        ? options.rules.split(/\s*,\s*/)
        : options.rules || []).filter((rulename) => '' !== rulename);
    let name = options.name;
    let open = options.open;
    let close = options.close;
    let action = options.action;
    if ('string' === typeof action) {
        let path = action;
        action = (rule) => (rule.node = jsonic.util.prop(jsonic.options, path));
    }
    let token = {};
    let openTN = '#D_open_' + name;
    let closeTN = '#D_close_' + name;
    let OPEN = jsonic.fixed(open);
    let CLOSE = null == close ? null : jsonic.fixed(close);
    // OPEN must be unique
    if (null != OPEN) {
        throw new Error('Directive open token already in use: ' + open);
    }
    else {
        token[openTN] = open;
    }
    // Only create CLOSE if not already defined as a fixed token
    if (null == CLOSE && null != close) {
        token[closeTN] = close;
    }
    jsonic.options({
        fixed: {
            token,
        },
        error: {
            [name + '_close']: null == close
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
            [name + '_close']: null == close
                ? null
                : `
The ${name} directive must start with the characters "${open}" and end
with the characters "${close}". The end characters "${close}" may not
appear without the start characters "${open}" appearing first:
"${open}...${close}".
`,
        },
    });
    let CA = jsonic.token.CA;
    OPEN = jsonic.fixed(open);
    CLOSE = null == close ? null : jsonic.fixed(close);
    // NOTE: RuleSpec.open|close refers to Rule state, whereas
    // OPEN|CLOSE refers to opening and closing tokens for the directive.
    rules.forEach((rulename) => {
        jsonic.rule(rulename, (rs) => {
            rs.open({ s: [OPEN], p: name, n: { dr: 1 } });
            if (null != close) {
                rs.open([
                    {
                        s: [CLOSE],
                        c: { n: { dr: 0 } },
                        e: (_r, ctx) => ctx.t0.bad(name + '_close'),
                    },
                    // <2,> case
                    {
                        s: [CLOSE],
                        b: 1,
                    },
                ]);
                rs.close({ s: [CLOSE], b: 1 });
            }
            return rs;
        });
    });
    jsonic.rule(name, (rs) => rs
        .clear()
        .bo((rule) => (rule.node = {}))
        .open([
        {
            p: 'val',
            // Only accept implicits when there is a CLOSE token,
            // otherwise we'll eat all following siblings.
            n: null == close ? {} : { pk: -1, il: 0 },
        },
    ])
        .bc((...all) => action(...all))
        .close(null != close ? [{ s: [CLOSE] }, { s: [CA, CLOSE] }] : []));
};
exports.Directive = Directive;
Directive.defaults = {
    rules: 'val,pair,elem',
};
//# sourceMappingURL=directive.js.map