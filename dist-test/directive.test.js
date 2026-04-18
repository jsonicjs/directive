"use strict";
/* Copyright (c) 2021-2025 Richard Rodger and other contributors, MIT License */
Object.defineProperty(exports, "__esModule", { value: true });
const node_test_1 = require("node:test");
const code_1 = require("@hapi/code");
const jsonic_1 = require("jsonic");
const directive_1 = require("../dist/directive");
const clone = (x) => JSON.parse(JSON.stringify(x));
(0, node_test_1.describe)('directive', () => {
    (0, node_test_1.test)('happy', () => {
        const j = jsonic_1.Jsonic.make()
            // .use(Debug, { trace: true })
            .use(directive_1.Directive, {
            name: 'upper',
            open: '@',
            action: (rule) => rule.node = ('' + rule.child.node).toUpperCase()
        });
        (0, code_1.expect)(j.token.OD_upper).exist();
        (0, code_1.expect)(j.rule('upper')).exist();
        (0, code_1.expect)(j('@a')).equal('A');
        (0, code_1.expect)(j('[]')).equal([]);
        (0, code_1.expect)(j('[1]')).equal([1]);
        (0, code_1.expect)(j('[1, 2]')).equal([1, 2]);
        (0, code_1.expect)(j('[1, 2, 3]')).equal([1, 2, 3]);
        (0, code_1.expect)(j('[@a]')).equal(['A']);
        (0, code_1.expect)(j('[1, @a]')).equal([1, 'A']);
        (0, code_1.expect)(j('[1, 2, @a]')).equal([1, 2, 'A']);
        (0, code_1.expect)(j('[1, @a, 2]')).equal([1, 'A', 2]);
        (0, code_1.expect)(j('[@a, 2]')).equal(['A', 2]);
        (0, code_1.expect)(j('[@a, 2, 1]')).equal(['A', 2, 1]);
        (0, code_1.expect)(j('[@a, @b]')).equal(['A', 'B']);
        (0, code_1.expect)(j('[@a, @b, @c]')).equal(['A', 'B', 'C']);
        (0, code_1.expect)(j('[1, @a, @b]')).equal([1, 'A', 'B']);
        (0, code_1.expect)(j('[1, @a, 2, @b]')).equal([1, 'A', 2, 'B']);
        (0, code_1.expect)(j('[1, @a, 2, @b, 3]')).equal([1, 'A', 2, 'B', 3]);
        (0, code_1.expect)(j('[1 2]')).equal([1, 2]);
        (0, code_1.expect)(j('[1 2 3]')).equal([1, 2, 3]);
        (0, code_1.expect)(j('[@a]')).equal(['A']);
        (0, code_1.expect)(j('[1 @a]')).equal([1, 'A']);
        (0, code_1.expect)(j('[1 2 @a]')).equal([1, 2, 'A']);
        (0, code_1.expect)(j('[1 @a 2]')).equal([1, 'A', 2]);
        (0, code_1.expect)(j('[@a 2]')).equal(['A', 2]);
        (0, code_1.expect)(j('[@a 2 1]')).equal(['A', 2, 1]);
        (0, code_1.expect)(j('[@a @b]')).equal(['A', 'B']);
        (0, code_1.expect)(j('[@a @b @c]')).equal(['A', 'B', 'C']);
        (0, code_1.expect)(j('[1 @a @b]')).equal([1, 'A', 'B']);
        (0, code_1.expect)(j('[1 @a 2 @b]')).equal([1, 'A', 2, 'B']);
        (0, code_1.expect)(j('[1 @a 2 @b 3]')).equal([1, 'A', 2, 'B', 3]);
        (0, code_1.expect)(j('{}')).equal({});
        (0, code_1.expect)(j('{x:1}')).equal({ x: 1 });
        (0, code_1.expect)(j('{x:1, y:2}')).equal({ x: 1, y: 2 });
        (0, code_1.expect)(j('{x:1, y:2, z:3}')).equal({ x: 1, y: 2, z: 3 });
        (0, code_1.expect)(j('{x:@a}')).equal({ x: 'A' });
        (0, code_1.expect)(j('{y:1, x:@a}')).equal({ y: 1, x: 'A' });
        (0, code_1.expect)(j('{y:1, z: 2, x:@a}')).equal({ y: 1, z: 2, x: 'A' });
        (0, code_1.expect)(j('{y:1, x:@a, z:2}')).equal({ y: 1, x: 'A', z: 2 });
        (0, code_1.expect)(j('{x:@a, y:1, z: 2}')).equal({ x: 'A', y: 1, z: 2 });
        (0, code_1.expect)(j('{x:@a, z:2}')).equal({ x: 'A', z: 2 });
        (0, code_1.expect)(j('{x:@a, y:@b}')).equal({ x: 'A', y: 'B' });
        (0, code_1.expect)(j('{a:1, x:@a, y:@b}')).equal({ a: 1, x: 'A', y: 'B' });
        (0, code_1.expect)(j('{a:1, x:@a, b:2, y:@b}')).equal({ a: 1, x: 'A', b: 2, y: 'B' });
        (0, code_1.expect)(j('{a:1, x:@a, b:2, y:@b, c: 3}'))
            .equal({ a: 1, x: 'A', b: 2, y: 'B', c: 3 });
        (0, code_1.expect)(j('{x:1}')).equal({ x: 1 });
        (0, code_1.expect)(j('{x:1 y:2}')).equal({ x: 1, y: 2 });
        (0, code_1.expect)(j('{x:1 y:2 z:3}')).equal({ x: 1, y: 2, z: 3 });
        (0, code_1.expect)(j('{x:@a}')).equal({ x: 'A' });
        (0, code_1.expect)(j('{y:1 x:@a}')).equal({ y: 1, x: 'A' });
        (0, code_1.expect)(j('{y:1 z: 2 x:@a}')).equal({ y: 1, z: 2, x: 'A' });
        (0, code_1.expect)(j('{y:1 x:@a z:2}')).equal({ y: 1, x: 'A', z: 2 });
        (0, code_1.expect)(j('{x:@a y:1 z: 2}')).equal({ x: 'A', y: 1, z: 2 });
        (0, code_1.expect)(j('{x:@a z:2}')).equal({ x: 'A', z: 2 });
        (0, code_1.expect)(j('{x:@a y:@b}')).equal({ x: 'A', y: 'B' });
        (0, code_1.expect)(j('{a:1 x:@a y:@b}')).equal({ a: 1, x: 'A', y: 'B' });
        (0, code_1.expect)(j('{a:1 x:@a b:2 y:@b}')).equal({ a: 1, x: 'A', b: 2, y: 'B' });
        (0, code_1.expect)(j('{a:1 x:@a b:2 y:@b c: 3}'))
            .equal({ a: 1, x: 'A', b: 2, y: 'B', c: 3 });
        (0, code_1.expect)(j('1, @a')).equal([1, 'A']);
        (0, code_1.expect)(j('1, 2, @a')).equal([1, 2, 'A']);
        (0, code_1.expect)(j('@a, 1')).equal(['A', 1]);
        (0, code_1.expect)(j('@a, 1, 2')).equal(['A', 1, 2]);
        (0, code_1.expect)(j('1, @a, 2')).equal([1, 'A', 2]);
        (0, code_1.expect)(j('1 @a')).equal([1, 'A']);
        (0, code_1.expect)(j('1 2 @a')).equal([1, 2, 'A']);
        (0, code_1.expect)(j('@a 1')).equal(['A', 1]);
        (0, code_1.expect)(j('@a 1 2')).equal(['A', 1, 2]);
        (0, code_1.expect)(j('1 @a 2')).equal([1, 'A', 2]);
        (0, code_1.expect)(j('1, @a, @b')).equal([1, 'A', 'B']);
        (0, code_1.expect)(j('1, 2, @a, @b')).equal([1, 2, 'A', 'B']);
        (0, code_1.expect)(j('@a, @b, 1')).equal(['A', 'B', 1]);
        (0, code_1.expect)(j('@a, @b, 1, 2')).equal(['A', 'B', 1, 2]);
        (0, code_1.expect)(j('1, @a, @b, 2')).equal([1, 'A', 'B', 2]);
        (0, code_1.expect)(j('1 @a @b')).equal([1, 'A', 'B']);
        (0, code_1.expect)(j('1 2 @a @b')).equal([1, 2, 'A', 'B']);
        (0, code_1.expect)(j('@a @b 1')).equal(['A', 'B', 1]);
        (0, code_1.expect)(j('@a @b 1 2')).equal(['A', 'B', 1, 2]);
        (0, code_1.expect)(j('1 @a @b 2')).equal([1, 'A', 'B', 2]);
        // NOTE: does not handle pairs - must be a value
        (0, code_1.expect)(() => j('a:1, @a')).throws(/unexpected/);
        (0, code_1.expect)(() => j('{a:1, @a}')).throws(/unexpected/);
        (0, code_1.expect)(() => j('a:1 @a')).throws(/unexpected/);
        (0, code_1.expect)(() => j('{a:1 @a}')).throws(/unexpected/);
        (0, code_1.expect)(clone(j('1, @a, b:2'))).equal([1, 'A']);
        (0, code_1.expect)(j('1, @a, b:2').b).equal(2);
    });
    (0, node_test_1.test)('subobj', () => {
        const { deep } = jsonic_1.Jsonic.util;
        const j = jsonic_1.Jsonic.make()
            // .use(Debug, { trace: true })
            .use(directive_1.Directive, {
            name: 'subobj',
            open: '@',
            rules: {
                open: {
                    val: {},
                    pair: {
                        c: (r) => r.lte('pk')
                    },
                },
            },
            action: (rule) => {
                // let from = rule.parent.name
                let res = { [rule.child.node]: rule.child.node.toUpperCase() };
                // console.log('FROM', from)
                // console.log('PARENT', rule.parent)
                rule.parent.parent.node = deep(rule.parent.parent.node, res);
                return undefined;
            },
            custom: (jsonic, { OPEN, name }) => {
                // Handle special case of @foo first token - assume a map
                jsonic.rule('val', (rs) => {
                    rs.open([
                        {
                            s: [OPEN],
                            c: (r) => 0 < r.n.pk,
                            b: 1,
                            g: name + '-undive',
                        },
                        {
                            s: [OPEN],
                            c: (r) => 0 === r.d,
                            p: 'map',
                            b: 1,
                            n: { [name + '_top']: 1 },
                            g: name + '-top',
                        }
                    ]);
                });
                jsonic.rule('map', (rs) => {
                    rs.open({
                        s: [OPEN],
                        c: (r) => 1 === r.d && 1 === r.n[name + '_top'],
                        p: 'pair',
                        b: 1,
                        g: name + '-top',
                    }).close({
                        s: [OPEN],
                        c: (r) => 0 < r.n.pk,
                        b: 1,
                        g: name + '-undive',
                    });
                });
                jsonic.rule('pair', (rs) => {
                    rs.close({
                        s: [OPEN],
                        c: (r) => 0 < r.n.pk,
                        b: 1,
                        g: name + '-undive',
                    });
                });
            }
        });
        (0, code_1.expect)(j('@a')).equal({ a: 'A' });
        (0, code_1.expect)(j('{@a}')).equal({ a: 'A' });
        (0, code_1.expect)(j('{@a @b}')).equal({ a: 'A', b: 'B' });
        (0, code_1.expect)(j('{x:1 @a @b}')).equal({ x: 1, a: 'A', b: 'B' });
        (0, code_1.expect)(j('{@a x:1 @b}')).equal({ x: 1, a: 'A', b: 'B' });
        (0, code_1.expect)(j('{@a @b x:1 }')).equal({ x: 1, a: 'A', b: 'B' });
        (0, code_1.expect)(j('{x:1 @a y:2 @b}')).equal({ x: 1, y: 2, a: 'A', b: 'B' });
        (0, code_1.expect)(j('{@a x:1 @b y:2 }')).equal({ x: 1, y: 2, a: 'A', b: 'B' });
        (0, code_1.expect)(j('{@a @b x:1 y:2 }')).equal({ x: 1, y: 2, a: 'A', b: 'B' });
        (0, code_1.expect)(j('{x:1 @a y:2 @b z:3}')).equal({ x: 1, y: 2, z: 3, a: 'A', b: 'B' });
        (0, code_1.expect)(j('{@a x:1 @b y:2 z:3}')).equal({ x: 1, y: 2, z: 3, a: 'A', b: 'B' });
        (0, code_1.expect)(j('{@a @b x:1 y:2 z:3}')).equal({ x: 1, y: 2, z: 3, a: 'A', b: 'B' });
        (0, code_1.expect)(j('{@a q:1}')).equal({ a: 'A', q: 1 });
        (0, code_1.expect)(j('@a q:1')).equal({ a: 'A', q: 1 });
        (0, code_1.expect)(j('{q:1 @a}')).equal({ q: 1, a: 'A' });
        (0, code_1.expect)(j('q:1 @a')).equal({ q: 1, a: 'A' });
        (0, code_1.expect)(j('{q:1 @a w:2}')).equal({ q: 1, a: 'A', w: 2 });
        (0, code_1.expect)(j('q:1 @a w:2')).equal({ q: 1, a: 'A', w: 2 });
        (0, code_1.expect)(j('@a @b')).equal({ a: 'A', b: 'B' });
        (0, code_1.expect)(j('q:1 @a @b')).equal({ q: 1, a: 'A', b: 'B' });
        (0, code_1.expect)(j('@a q:1 @b')).equal({ q: 1, a: 'A', b: 'B' });
        (0, code_1.expect)(j('@a @b q:1')).equal({ q: 1, a: 'A', b: 'B' });
        (0, code_1.expect)(j('q:1 @a w:2 @b')).equal({ q: 1, a: 'A', w: 2, b: 'B' });
        (0, code_1.expect)(j('q:1 @a @b w:2')).equal({ q: 1, a: 'A', w: 2, b: 'B' });
        (0, code_1.expect)(j('q:1 @a w:2 @b v:3')).equal({ q: 1, a: 'A', w: 2, b: 'B', v: 3 });
        (0, code_1.expect)(j('x:[] @a')).equal({ x: [], a: 'A' });
        (0, code_1.expect)(j('@a x:[]')).equal({ x: [], a: 'A' });
        (0, code_1.expect)(j('x:[] @a y:{}')).equal({ x: [], a: 'A', y: {} });
        (0, code_1.expect)(j('x:{} @a')).equal({ x: {}, a: 'A' });
        (0, code_1.expect)(j('@a x:{}')).equal({ x: {}, a: 'A' });
        (0, code_1.expect)(j('x:{} @a y:{}')).equal({ x: {}, a: 'A', y: {} });
        (0, code_1.expect)(j('x:[] @a @b')).equal({ x: [], a: 'A', b: 'B' });
        (0, code_1.expect)(j('@a @b x:[]')).equal({ x: [], a: 'A', b: 'B' });
        (0, code_1.expect)(j('x:[] @a @b y:{}')).equal({ x: [], a: 'A', b: 'B', y: {} });
        (0, code_1.expect)(j('x:{} @a @b')).equal({ x: {}, a: 'A', b: 'B' });
        (0, code_1.expect)(j('@a @b x:{}')).equal({ x: {}, a: 'A', b: 'B' });
        (0, code_1.expect)(j('x:{} @a @b y:{}')).equal({ x: {}, a: 'A', b: 'B', y: {} });
        (0, code_1.expect)(j('x:[] @a y:{} @b')).equal({ x: [], a: 'A', b: 'B', y: {} });
        (0, code_1.expect)(j('@a y:{} @b x:[]')).equal({ x: [], a: 'A', b: 'B', y: {} });
        (0, code_1.expect)(j('x:[] @a z:[] @b y:{}')).equal({ x: [], a: 'A', b: 'B', z: [], y: {} });
        (0, code_1.expect)(j('x:{} @a y:[] @b')).equal({ x: {}, a: 'A', b: 'B', y: [] });
        (0, code_1.expect)(j('@a y:[] @b x:{}')).equal({ x: {}, a: 'A', b: 'B', y: [] });
        (0, code_1.expect)(j('x:{} @a z:[] @b y:{}')).equal({ x: {}, a: 'A', b: 'B', y: {}, z: [] });
        (0, code_1.expect)(j('x:y:1 z:2')).equal({ x: { y: 1 }, z: 2 });
        (0, code_1.expect)(j('x:y:1 z:2 @a')).equal({ x: { y: 1 }, z: 2, a: 'A' });
        (0, code_1.expect)(j('@a x:y:1 z:2')).equal({ x: { y: 1 }, z: 2, a: 'A' });
        (0, code_1.expect)(j('x:y:1 @a')).equal({ x: { y: 1 }, a: 'A' });
        (0, code_1.expect)(j('x:y:{} @a')).equal({ x: { y: {} }, a: 'A' });
        (0, code_1.expect)(j('x:y:{} @a z:1')).equal({ x: { y: {} }, a: 'A', z: 1 });
        (0, code_1.expect)(j('x:y:{} @a z:k:1')).equal({ x: { y: {} }, a: 'A', z: { k: 1 } });
        (0, code_1.expect)(j('x:y:2 @a z:k:1')).equal({ x: { y: 2 }, a: 'A', z: { k: 1 } });
        (0, code_1.expect)(j('x:2 @a z:k:1')).equal({ x: 2, a: 'A', z: { k: 1 } });
        (0, code_1.expect)(j('@a x:y:{}')).equal({ x: { y: {} }, a: 'A' });
        (0, code_1.expect)(j('@a x:y:{} z:1')).equal({ x: { y: {} }, a: 'A', z: 1 });
        (0, code_1.expect)(j('@a x:y:{} z:k:1')).equal({ x: { y: {} }, a: 'A', z: { k: 1 } });
        (0, code_1.expect)(j('@a @b x:y:{}')).equal({ x: { y: {} }, a: 'A', b: 'B' });
        (0, code_1.expect)(j('@a @b x:y:{} z:1')).equal({ x: { y: {} }, a: 'A', b: 'B', z: 1 });
        (0, code_1.expect)(j('@a @b x:y:{} z:k:1')).equal({ x: { y: {} }, a: 'A', b: 'B', z: { k: 1 } });
        (0, code_1.expect)(j('x:y:{} @a @b')).equal({ x: { y: {} }, a: 'A', b: 'B' });
        (0, code_1.expect)(j('@a x:y:{} @b')).equal({ x: { y: {} }, a: 'A', b: 'B' });
    });
    (0, node_test_1.test)('action-option-prop', () => {
        const j0 = jsonic_1.Jsonic.make()
            .use(directive_1.Directive, {
            name: 'constant',
            open: '@',
            action: 'custom.x'
        });
        j0.options({ custom: { x: 11 } });
        (0, code_1.expect)(j0('@')).equal(11);
    });
    (0, node_test_1.test)('close', () => {
        const j = jsonic_1.Jsonic.make().use(directive_1.Directive, {
            name: 'foo',
            open: 'foo<',
            close: '>',
            action: (rule) => rule.node = 'FOO',
        });
        (0, code_1.expect)(j('foo<t>')).equal('FOO');
        (0, code_1.expect)(j('foo<>')).equal('FOO');
        (0, code_1.expect)(j('{"a":1}')).equal({ a: 1 });
        (0, code_1.expect)(j('{"a":foo< a >}')).equal({ a: 'FOO' });
        (0, code_1.expect)(j('{"a":foo<{x:1}>}')).equal({ a: 'FOO' });
        (0, code_1.expect)(j('{"a":foo<foo<a>>}')).equal({ a: 'FOO' });
        (0, code_1.expect)(j('{"a":1,b:foo<b>}')).equal({ a: 1, b: 'FOO' });
        (0, code_1.expect)(j('{"a":1,b:foo<[2]>}')).equal({ a: 1, b: 'FOO' });
        (0, code_1.expect)(j('{"a":[1,foo<b>]}')).equal({ a: [1, 'FOO'] });
        (0, code_1.expect)(j('a:foo<y:2,>', { xlog: -1 })).equal({ a: 'FOO' });
        // expect(() => j('>')).throws(/foo_close/)
        (0, code_1.expect)(() => j('>')).throws(/unexpected/);
        // expect(() => j('a:>', { xlog: -1 })).throws(/foo_close/)
        (0, code_1.expect)(() => j('a:>', { xlog: -1 })).throws(/unexpected/);
        const k = j.use(directive_1.Directive, {
            name: 'bar',
            open: 'bar<',
            close: '>',
            action: (rule) => rule.node = 'BAR'
        });
        (0, code_1.expect)(k('{"a":1}')).equal({ a: 1 });
        (0, code_1.expect)(k('{"a":bar< a >}')).equal({ a: 'BAR' });
        (0, code_1.expect)(k('{"a":bar<{x:1}>}')).equal({ a: 'BAR' });
        (0, code_1.expect)(k('{"a":bar<bar<a>>}')).equal({ a: 'BAR' });
        (0, code_1.expect)(k('{"a":1,b:bar<b>}')).equal({ a: 1, b: 'BAR' });
        (0, code_1.expect)(k('{"a":1,b:bar<[2]>}')).equal({ a: 1, b: 'BAR' });
        (0, code_1.expect)(k('{"a":[1,bar<b>]}')).equal({ a: [1, 'BAR'] });
        (0, code_1.expect)(k('{"a":1}')).equal({ a: 1 });
        (0, code_1.expect)(k('{"a":foo< a >}')).equal({ a: 'FOO' });
        (0, code_1.expect)(k('{"a":foo<{x:1}>}')).equal({ a: 'FOO' });
        (0, code_1.expect)(k('{"a":foo<foo<a>>}')).equal({ a: 'FOO' });
        (0, code_1.expect)(k('{"a":1,b:foo<b>}')).equal({ a: 1, b: 'FOO' });
        (0, code_1.expect)(k('{"a":1,b:foo<[2]>}')).equal({ a: 1, b: 'FOO' });
        (0, code_1.expect)(k('{"a":[1,foo<b>]}')).equal({ a: [1, 'FOO'] });
        (0, code_1.expect)(k('{"a":foo< a >, b:bar<>}')).equal({ a: 'FOO', b: 'BAR' });
        (0, code_1.expect)(() => j.use(directive_1.Directive, {
            name: 'bar',
            open: 'bar<',
            action: () => null
        })).throws(/bar</);
    });
    (0, node_test_1.test)('inject', () => {
        const SRC = {
            a: 'A',
            b: { b: 1 },
            bb: { bb: 1 },
            c: [2, 3],
        };
        const j = jsonic_1.Jsonic.make().use(directive_1.Directive, {
            name: 'inject',
            open: '@',
            rules: {
                open: 'val,pair'
            },
            action: (rule) => {
                let srcname = '' + rule.child.node;
                let src = SRC[srcname];
                let from = rule.parent.name;
                if ('pair' === from) {
                    Object.assign(rule.parent.node, src);
                }
                else {
                    rule.node = src;
                }
            },
            custom: (jsonic, { OPEN, name }) => {
                // Handle special case of @foo first token - assume a map
                jsonic
                    .rule('val', (rs) => {
                    rs.open({
                        s: [OPEN],
                        c: (r) => 0 === r.d,
                        p: 'map',
                        b: 1,
                        n: { [name + '_top']: 1 }
                    });
                });
                jsonic
                    .rule('map', (rs) => {
                    rs.open({
                        s: [OPEN],
                        c: (r) => (1 === r.d && 1 === r.n[name + '_top']),
                        p: 'pair',
                        b: 1,
                    });
                });
            }
        });
        (0, code_1.expect)(j('a:@z')).equal({ a: null });
        (0, code_1.expect)(j('a:@a')).equal({ a: 'A' });
        (0, code_1.expect)(j('a:b:@a')).equal({ a: { b: 'A' } });
        (0, code_1.expect)(j('b:@b')).equal({ b: { b: 1 } });
        (0, code_1.expect)(j('b:a:@b')).equal({ b: { a: { b: 1 } } });
        (0, code_1.expect)(j('c:@c')).equal({ c: [2, 3] });
        (0, code_1.expect)(j('c:b:@c')).equal({ c: { b: [2, 3] } });
        (0, code_1.expect)(j('a:1 @b')).equal({ a: 1, b: 1 });
        (0, code_1.expect)(j('a:1 @b c:2')).equal({ a: 1, b: 1, c: 2 });
        (0, code_1.expect)(j('a:@a @b c:@c')).equal({ a: 'A', b: 1, c: [2, 3] });
        // NOTE: assumes map at top level
        (0, code_1.expect)(j('@a')).equal({ 0: 'A' });
        (0, code_1.expect)(j('@b')).equal({ b: 1 });
        (0, code_1.expect)(j('@c')).equal({ 0: 2, 1: 3 });
        (0, code_1.expect)(j('@b x:1')).equal({ b: 1, x: 1 });
        (0, code_1.expect)(j('@b x:1 @bb')).equal({ b: 1, x: 1, bb: 1 });
    });
    (0, node_test_1.test)('adder', () => {
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
        (0, code_1.expect)(j('add<1,2>')).equal(3);
        (0, code_1.expect)(j('a:add<1,2>')).equal({ a: 3 });
        (0, code_1.expect)(j('[add<a,b>]')).equal(['ab']);
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
        (0, code_1.expect)(k('mul<2,3>')).equal(6);
        (0, code_1.expect)(k('a:mul<2,3>')).equal({ a: 6 });
        (0, code_1.expect)(k('[mul<a,1>]')).equal([NaN]);
        (0, code_1.expect)(j('add<1,2>')).equal(3);
        (0, code_1.expect)(j('a:add<1,2>')).equal({ a: 3 });
        (0, code_1.expect)(j('[add<a,b>]')).equal(['ab']);
    });
    (0, node_test_1.test)('edges', () => {
        let j = jsonic_1.Jsonic.make().use(directive_1.Directive, {
            name: 'none',
            open: '@',
            action: () => null,
            rules: null,
        });
        (0, code_1.expect)(() => j('a:@x')).throws(/unexpected/);
    });
    (0, node_test_1.test)('error', () => {
        let j = jsonic_1.Jsonic.make().use(directive_1.Directive, {
            name: 'bad',
            open: '@',
            action: (rule) => {
                return rule.parent?.o0.bad('bad');
            }
        });
        (0, code_1.expect)(() => j('a:@x')).throws(/bad.*:1:3/s);
    });
    (0, node_test_1.test)('annotate', () => {
        let j = jsonic_1.Jsonic.make().use(directive_1.Directive, {
            name: 'annotate',
            open: '@',
            rules: {
                // annotate is a child of val
                open: 'val'
            },
            action: (rule) => {
                // Set use.note on parent val
                rule.parent.u.note = '<' + rule.child.node + '>';
            },
            custom: (jsonic) => {
                jsonic
                    // Replace annotation rule with following actual val rule
                    .rule('annotate', (rs) => {
                    rs
                        .close([
                        {
                            r: 'val',
                            g: 'replace',
                        }
                    ])
                        .ac((rule, _ctx, next) => {
                        // annotate was the child, make following val the child
                        // of the parent val (which will adopt node of of a child val)
                        rule.parent.child = next;
                    });
                });
                jsonic
                    .rule('val', (rs) => {
                    rs.bc((r) => {
                        if (r.u.note) {
                            r.node['@'] = r.u.note;
                        }
                    });
                });
            }
        });
        (0, code_1.expect)(j('[@a {x:1}]')).equal([{ x: 1, '@': '<a>' }]);
        (0, code_1.expect)(j('[{y:2}, @a {x:1}]')).equal([{ y: 2 }, { x: 1, '@': '<a>' }]);
        (0, code_1.expect)(j('[{y:2}, @a {x:1}, {z:3}]'))
            .equal([{ y: 2 }, { x: 1, '@': '<a>' }, { z: 3 }]);
        (0, code_1.expect)(j('{a: @a {x:1}}')).equal({ a: { x: 1, '@': '<a>' } });
        (0, code_1.expect)(j('{b:{y:1},a: @a {x:1}}'))
            .equal({ b: { y: 1 }, a: { x: 1, '@': '<a>' } });
        (0, code_1.expect)(j('{b:{y:1},a: @a {x:1},c:{z:1}}'))
            .equal({ b: { y: 1 }, a: { x: 1, '@': '<a>' }, c: { z: 1 } });
        (0, code_1.expect)(j('{a:b: @a {x:1}}')).equal({ a: { b: { x: 1, '@': '<a>' } } });
    });
});
//# sourceMappingURL=directive.test.js.map