"use strict";
/* Copyright (c) 2021 Richard Rodger and other contributors, MIT License */
Object.defineProperty(exports, "__esModule", { value: true });
const jsonic_1 = require("jsonic");
const directive_1 = require("../directive");
describe('directive', () => {
    test('happy', () => {
        const j = jsonic_1.Jsonic.make().use(directive_1.Directive, {
            name: 'happy',
            open: '@',
            action: (rule) => {
                var _a;
                let from = (_a = rule.parent) === null || _a === void 0 ? void 0 : _a.name;
                if ('val' === from) {
                    rule.node = from + ':' + JSON.stringify(rule.child.node).toUpperCase();
                    // console.log('D', rule.node, ctx.rs.length)
                    // TODO: if obj insert at top level
                    // TODO: rule.depth
                }
                else if ('pair' === from) {
                    if (rule.parent) {
                        rule.parent.node.pair$ = rule.child.node;
                    }
                }
                else if ('elem' === from) {
                    rule.node = '<' + rule.child.node + '>';
                }
            }
        });
        expect(j('@t')).toEqual('val:"T"');
        expect(j('{"a":1}')).toEqual({ a: 1 });
        expect(j('{"a":@ a}')).toEqual({ a: 'val:"A"' });
        expect(j('{"a":@{x:1}}')).toEqual({ a: 'val:{"X":1}' });
        expect(j('{"a":@@a}')).toEqual({ a: 'val:"VAL:\\"A\\""' });
        expect(j('{"a":1,@b}')).toEqual({ a: 1, pair$: 'b' });
        expect(j('{"a":1,@[2]}')).toEqual({ a: 1, pair$: [2] });
        expect(j('{"a":[1,@b]}')).toEqual({ a: [1, '<b>'] });
    });
    test('close', () => {
        const j = jsonic_1.Jsonic.make().use(directive_1.Directive, {
            name: 'foo',
            open: 'foo<',
            close: '>',
            action: (rule) => rule.node = 'FOO',
            rules: ['val', 'pair', 'elem']
        });
        // expect(() => j('>', { xlog: -1 })).toThrow(/foo_close/)
        expect(j('foo<t>')).toEqual('FOO');
        expect(j('{"a":1}')).toEqual({ a: 1 });
        expect(j('{"a":foo< a >}')).toEqual({ a: 'FOO' });
        expect(j('{"a":foo<{x:1}>}')).toEqual({ a: 'FOO' });
        expect(j('{"a":foo<foo<a>>}')).toEqual({ a: 'FOO' });
        expect(j('{"a":1,b:foo<b>}')).toEqual({ a: 1, b: 'FOO' });
        expect(j('{"a":1,b:foo<[2]>}')).toEqual({ a: 1, b: 'FOO' });
        expect(j('{"a":[1,foo<b>]}')).toEqual({ a: [1, 'FOO'] });
        expect(j('a:foo<y:2,>', { xlog: -1 })).toEqual({ a: 'FOO' });
        expect(() => j('>')).toThrow(/foo_close/);
        expect(() => j('a:>', { xlog: -1 })).toThrow(/foo_close/);
        const k = j.use(directive_1.Directive, {
            name: 'bar',
            open: 'bar<',
            close: '>',
            action: (rule) => rule.node = 'BAR'
        });
        expect(k('{"a":1}')).toEqual({ a: 1 });
        expect(k('{"a":bar< a >}')).toEqual({ a: 'BAR' });
        expect(k('{"a":bar<{x:1}>}')).toEqual({ a: 'BAR' });
        expect(k('{"a":bar<bar<a>>}')).toEqual({ a: 'BAR' });
        expect(k('{"a":1,b:bar<b>}')).toEqual({ a: 1, b: 'BAR' });
        expect(k('{"a":1,b:bar<[2]>}')).toEqual({ a: 1, b: 'BAR' });
        expect(k('{"a":[1,bar<b>]}')).toEqual({ a: [1, 'BAR'] });
        expect(k('{"a":1}')).toEqual({ a: 1 });
        expect(k('{"a":foo< a >}')).toEqual({ a: 'FOO' });
        expect(k('{"a":foo<{x:1}>}')).toEqual({ a: 'FOO' });
        expect(k('{"a":foo<foo<a>>}')).toEqual({ a: 'FOO' });
        expect(k('{"a":1,b:foo<b>}')).toEqual({ a: 1, b: 'FOO' });
        expect(k('{"a":1,b:foo<[2]>}')).toEqual({ a: 1, b: 'FOO' });
        expect(k('{"a":[1,foo<b>]}')).toEqual({ a: [1, 'FOO'] });
        expect(k('{"a":foo< a >, b:bar<>}')).toEqual({ a: 'FOO', b: 'BAR' });
        expect(() => j.use(directive_1.Directive, {
            name: 'bar',
            open: 'bar<',
            action: () => null
        })).toThrow(/bar</);
    });
    test('inject', () => {
        const j = jsonic_1.Jsonic.make().use(directive_1.Directive, {
            name: 'inject',
            open: '<',
            close: '>',
            action: (rule) => {
                // console.log('Pn',rule.parent.node)
                // console.log('Sn',rule.node)
                // console.log('Cn',rule.child.node)
                var _a, _b;
                let from = rule.parent && rule.parent.name;
                if ('pair' === from) {
                    jsonic_1.Jsonic.util.deep(rule.node, rule.child.node);
                    if ((_a = rule.parent) === null || _a === void 0 ? void 0 : _a.node) {
                        rule.parent.node.$ = rule.child.node;
                    }
                }
                else if ('elem' === from) {
                    rule.node = undefined;
                    (_b = rule.parent) === null || _b === void 0 ? void 0 : _b.node.push(rule.child.node);
                }
            }
        });
        expect(j('x:10,<{y:2}>,z:3')).toEqual({ x: 10, '$': { y: 2 }, z: 3 });
        expect(j('{x:20,<{y:2}>,z:3}')).toEqual({ x: 20, '$': { y: 2 }, z: 3 });
        expect(j('{x:30,<y:3>,z:4}')).toEqual({ x: 30, '$': { y: 3 }, z: 4 });
        expect(j('{x:40,<{y:2,z:3}>,k:5}')).toEqual({ x: 40, '$': { y: 2, z: 3 }, k: 5 });
        expect(j('{x:50,<{y:2,z:3,q:4}>,k:5}')).toEqual({ x: 50, '$': { y: 2, z: 3, q: 4 }, k: 5 });
        expect(j('{x:40,<{y:2,z:q:3,w:6}>,k:5}')).toEqual({ x: 40, '$': { y: 2, z: { q: 3 }, w: 6 }, k: 5 });
        expect(j('{x:60,<y:3,z:4>,k:5}')).toEqual({ x: 60, '$': { y: 3, z: 4 }, k: 5 });
        expect(j('{x:70,<y:3,z:q:4,w:6>,k:5}')).toEqual({ x: 70, '$': { y: 3, z: { q: 4 }, w: 6 }, k: 5 });
        expect(j('x:80,<{y:2,}>,z:3')).toEqual({ x: 80, '$': { y: 2 }, z: 3 });
        expect(j('x:90,<y:2,>,z:3')).toEqual({ x: 90, '$': { y: 2 }, z: 3 });
        expect(j('100,<2>,99')).toEqual([100, 2, 99]);
        expect(j('110,<[2]>,99')).toEqual([110, [2], 99]);
        expect(j('120,<[2,3]>,99')).toEqual([120, [2, 3], 99]);
        expect(j('130,<[2,3,4]>,99')).toEqual([130, [2, 3, 4], 99]);
        expect(j('140,<[2,3,4,5]>,99')).toEqual([140, [2, 3, 4, 5], 99]);
        expect(j('150,<[2,3,4,5,]>,99')).toEqual([150, [2, 3, 4, 5], 99]);
        expect(j('160,<[,2,3,4,5,]>,99')).toEqual([160, [null, 2, 3, 4, 5], 99]);
        expect(j('170,<2,3>,99')).toEqual([170, [2, 3], 99]);
        expect(j('180,<2,3,4>,99')).toEqual([180, [2, 3, 4], 99]);
        expect(j('190,<2,>,99')).toEqual([190, [2], 99]);
        expect(j('200,<2,3,4,>,99')).toEqual([200, [2, 3, 4], 99]);
        expect(j('210,<,2,3,4>,99')).toEqual([210, [null, 2, 3, 4], 99]);
    });
    test('adder', () => {
        const j = jsonic_1.Jsonic.make().use(directive_1.Directive, {
            name: 'adder',
            open: 'add<',
            close: '>',
            action: (rule) => {
                let out = 0;
                if (Array.isArray(rule.child.node)) {
                    out = rule.child.node.reduce((a, v) => a + v);
                }
                rule.node = out;
            }
        });
        expect(j('add<1,2>')).toEqual(3);
        expect(j('a:add<1,2>')).toEqual({ a: 3 });
        expect(j('[add<a,b>]')).toEqual(['ab']);
        const k = j.use(directive_1.Directive, {
            name: 'multiplier',
            open: 'mul<',
            close: '>',
            action: (rule) => {
                let out = 0;
                if (Array.isArray(rule.child.node)) {
                    out = rule.child.node.reduce((a, v) => a * v);
                }
                rule.node = out;
            }
        });
        expect(k('mul<2,3>')).toEqual(6);
        expect(k('a:mul<2,3>')).toEqual({ a: 6 });
        expect(k('[mul<a,1>]')).toEqual([NaN]);
        expect(j('add<1,2>')).toEqual(3);
        expect(j('a:add<1,2>')).toEqual({ a: 3 });
        expect(j('[add<a,b>]')).toEqual(['ab']);
    });
    test('edges', () => {
        jsonic_1.Jsonic.make().use(directive_1.Directive, {
            name: 'none',
            open: '@',
            action: () => null,
            rules: null,
        });
    });
});
//# sourceMappingURL=directive.test.js.map