"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Directive = void 0;
const jsonic_1 = require("jsonic");
const Directive = (jsonic, options) => {
    let rules = ('string' == typeof options.rules ? options.rules.split(/\s*,\s*/) :
        (options.rules || [])).filter(rulename => '' !== rulename);
    let name = options.name;
    let open = options.open;
    let close = options.close;
    let action = options.action;
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
    jsonic.options({ fixed: { token } });
    let CA = jsonic.token.CA;
    OPEN = jsonic.fixed(open);
    CLOSE = null == close ? null : jsonic.fixed(close);
    rules.forEach(rulename => {
        jsonic.rule(rulename, (rs) => {
            rs.open({ s: [OPEN], p: name, n: { dr: 1 } });
            if (null != close) {
                rs.open([
                    {
                        s: [CLOSE],
                        c: { n: { dr: 0 } },
                        // TODO: make this easier - custom error example
                        e: (r, ctx) => (ctx.t0.err = name + '_close', ctx.t0)
                    },
                    // <2,> case
                    {
                        s: [CLOSE], b: 1,
                    },
                ]);
                rs.close({ s: [CLOSE], b: 1 });
            }
            return rs;
        });
    });
    jsonic.rule(name, () => {
        return new jsonic_1.RuleSpec({
            bo: () => {
                return { node: {} };
            },
            open: [
                { p: 'val', n: { pk: -1, il: 0 } },
            ],
            close: null != close ? [
                { s: [CLOSE] },
                { s: [CA, CLOSE] },
            ] : null,
            bc: (...all) => action(...all)
        });
    });
};
exports.Directive = Directive;
Directive.defaults = {
    rules: 'val,pair,elem'
};
//# sourceMappingURL=directive.js.map