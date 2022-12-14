"use strict";
/* Copyright (c) 2021-2022 Richard Rodger, MIT License */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Directive = void 0;
const parseList = (list) => ('string' == typeof list ?
    list.split(/\s*,\s*/) : (list || [])).filter((item) => null != item && '' !== item);
const Directive = (jsonic, options) => {
    var _a, _b;
    let rules = {
        open: parseList((_a = options === null || options === void 0 ? void 0 : options.rules) === null || _a === void 0 ? void 0 : _a.open),
        close: parseList((_b = options === null || options === void 0 ? void 0 : options.rules) === null || _b === void 0 ? void 0 : _b.close),
    };
    let name = options.name;
    let open = options.open;
    let close = options.close;
    let action;
    if ('string' === typeof options.action) {
        let path = options.action;
        action = (rule) => (rule.node = jsonic.util.prop(jsonic.options, path));
    }
    else {
        action = options.action;
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
    rules.open.forEach((rulename) => {
        jsonic.rule(rulename, (rs) => {
            rs.open({
                s: [OPEN],
                p: name,
                n: { dr: 1 },
                g: 'start',
            });
            if (null != close) {
                rs.open([
                    {
                        s: [CLOSE],
                        c: { n: { dr: 0 } },
                        e: (_r, ctx) => ctx.t0.bad(name + '_close'),
                        g: 'end',
                    },
                    // <2,> case
                    {
                        s: [CLOSE],
                        b: 1,
                    },
                ]);
                rs.close({
                    s: [CLOSE],
                    b: 1
                });
            }
            return rs;
        });
    });
    if (null != CLOSE) {
        rules.close.forEach((rulename) => {
            jsonic.rule(rulename, (rs) => {
                rs.close([{
                        s: [CLOSE],
                        b: 1
                    }]);
            });
        });
    }
    jsonic.rule(name, (rs) => rs
        .clear()
        .bo((rule) => ((rule.node = {}), undefined))
        .open([
        {
            p: 'val',
            // Only accept implicits when there is a CLOSE token,
            // otherwise we'll eat all following siblings.
            n: null == close ? {} : { pk: -1, il: 0 },
        },
    ])
        .bc(function (rule, ctx, next, tkn) {
        let out = action.call(this, rule, ctx, next, tkn);
        if (out === null || out === void 0 ? void 0 : out.isToken) {
            return out;
        }
    })
        .close(null != close ? [
        { s: [CLOSE] },
        { s: [CA, CLOSE] },
    ] :
        []));
};
exports.Directive = Directive;
Directive.defaults = {
    rules: {
        open: 'val,pair,elem',
        close: 'map,list',
    }
};
//# sourceMappingURL=directive.js.map