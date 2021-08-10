"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Directive = void 0;
const jsonic_1 = require("jsonic");
const Directive = (jsonic, options) => {
    let name = options.name;
    let src = options.src;
    let action = options.action;
    jsonic.options({
        fixed: {
            token: {
                [name]: src
            }
        }
    });
    let { DR } = jsonic.token;
    // TODO: .rule could accept a single match, unshifting to open? like lex?
    jsonic.rule('val', (rs) => {
        rs.def.open.unshift({
            s: [DR], p: 'directive'
        });
        return rs;
    });
    jsonic.rule('pair', (rs) => {
        rs.def.open.unshift({
            s: [DR], p: 'directive'
        });
        return rs;
    });
    jsonic.rule('elem', (rs) => {
        rs.def.open.unshift({
            s: [DR], p: 'directive'
        });
        return rs;
    });
    jsonic.rule('directive', () => {
        return new jsonic_1.RuleSpec({
            open: [{ p: 'val' }],
            bc: (...all) => action(...all)
        });
    });
};
exports.Directive = Directive;
//# sourceMappingURL=directive.js.map