"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Directive = void 0;
const jsonic_1 = require("jsonic");
const Directive = (jsonic, options) => {
    let only = 'string' == typeof options.only ? options.only.split(/\s*,\s*/) :
        (options.only || []);
    let name = options.name;
    let open = options.open;
    let close = options.close;
    let action = options.action;
    let tokens = {};
    let openTN = '#D_open_' + name;
    let closeTN = '#D_close_' + name;
    if (null != open) {
        tokens[openTN] = open;
    }
    if (null != close) {
        tokens[closeTN] = close;
    }
    jsonic.options({
        fixed: {
            token: tokens
        }
    });
    let CA = jsonic.token.CA;
    let OPEN = jsonic.token(openTN);
    let CLOSE = jsonic.token(closeTN);
    // console.log('T', OPEN, CLOSE)
    only.forEach(rulename => {
        if (null != rulename && '' !== rulename) {
            // TODO: .rule could accept a single match, unshifting to open? like lex?
            // console.log('DR', rulename)
            jsonic.rule(rulename, (rs) => {
                rs.def.open.unshift({
                    s: [CLOSE], b: 1
                }, {
                    s: [OPEN], p: 'directive'
                });
                if (null != close) {
                    rs.def.close.unshift({
                        s: [CLOSE], b: 1
                    });
                }
                return rs;
            });
        }
    });
    jsonic.rule('directive', () => {
        return new jsonic_1.RuleSpec({
            bo: () => {
                return { node: {} };
            },
            open: [{ p: 'val', n: { pk: -1, il: 0 } }],
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
    only: 'val,pair,elem'
};
//# sourceMappingURL=directive.js.map