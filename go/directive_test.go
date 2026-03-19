/* Copyright (c) 2021-2025 Richard Rodger and other contributors, MIT License */

package directive

import (
	"fmt"
	"reflect"
	"strings"
	"testing"

	jsonic "github.com/jsonicjs/jsonic/go"
)

// assert is a test helper that checks deep equality.
func assert(t *testing.T, name string, got, want any) {
	t.Helper()
	if !reflect.DeepEqual(got, want) {
		t.Errorf("%s:\n  got:  %#v\n  want: %#v", name, got, want)
	}
}

// mustParse parses and fatals on error.
func mustParse(t *testing.T, j *jsonic.Jsonic, src string) any {
	t.Helper()
	result, err := j.Parse(src)
	if err != nil {
		t.Fatalf("Parse(%q) error: %v", src, err)
	}
	return result
}

// mustError parses and expects an error.
func mustError(t *testing.T, j *jsonic.Jsonic, src string) {
	t.Helper()
	_, err := j.Parse(src)
	if err == nil {
		t.Fatalf("Parse(%q) expected error, got nil", src)
	}
}

func TestHappy(t *testing.T) {
	j := jsonic.Make()
	Apply(j, DirectiveOptions{
		Name: "upper",
		Open: "@",
		Action: func(rule *jsonic.Rule, ctx *jsonic.Context) {
			s := fmt.Sprintf("%v", rule.Child.Node)
			rule.Node = strings.ToUpper(s)
		},
	})

	// Single value.
	assert(t, "upper-a", mustParse(t, j, "@a"), "A")

	// In lists (with brackets).
	assert(t, "empty-list", mustParse(t, j, "[]"), []any{})
	assert(t, "list-1", mustParse(t, j, "[1]"), []any{float64(1)})
	assert(t, "list-1-2", mustParse(t, j, "[1, 2]"), []any{float64(1), float64(2)})
	assert(t, "list-1-2-3", mustParse(t, j, "[1, 2, 3]"),
		[]any{float64(1), float64(2), float64(3)})
	assert(t, "list-@a", mustParse(t, j, "[@a]"), []any{"A"})
	assert(t, "list-1-@a", mustParse(t, j, "[1, @a]"),
		[]any{float64(1), "A"})
	assert(t, "list-1-2-@a", mustParse(t, j, "[1, 2, @a]"),
		[]any{float64(1), float64(2), "A"})
	assert(t, "list-1-@a-2", mustParse(t, j, "[1, @a, 2]"),
		[]any{float64(1), "A", float64(2)})
	assert(t, "list-@a-2", mustParse(t, j, "[@a, 2]"),
		[]any{"A", float64(2)})
	assert(t, "list-@a-@b", mustParse(t, j, "[@a, @b]"),
		[]any{"A", "B"})
	assert(t, "list-@a-@b-@c", mustParse(t, j, "[@a, @b, @c]"),
		[]any{"A", "B", "C"})

	// Space-separated lists.
	assert(t, "list-sp-1-2", mustParse(t, j, "[1 2]"),
		[]any{float64(1), float64(2)})
	assert(t, "list-sp-@a", mustParse(t, j, "[@a]"), []any{"A"})
	assert(t, "list-sp-1-@a", mustParse(t, j, "[1 @a]"),
		[]any{float64(1), "A"})
	assert(t, "list-sp-@a-2", mustParse(t, j, "[@a 2]"),
		[]any{"A", float64(2)})
	assert(t, "list-sp-@a-@b", mustParse(t, j, "[@a @b]"),
		[]any{"A", "B"})

	// In maps (with braces).
	assert(t, "empty-map", mustParse(t, j, "{}"), map[string]any{})
	assert(t, "map-x1", mustParse(t, j, "{x:1}"),
		map[string]any{"x": float64(1)})
	assert(t, "map-x1-y2", mustParse(t, j, "{x:1, y:2}"),
		map[string]any{"x": float64(1), "y": float64(2)})
	assert(t, "map-x-@a", mustParse(t, j, "{x:@a}"),
		map[string]any{"x": "A"})
	assert(t, "map-y1-x@a", mustParse(t, j, "{y:1, x:@a}"),
		map[string]any{"y": float64(1), "x": "A"})
	assert(t, "map-y1-x@a-z2", mustParse(t, j, "{y:1, x:@a, z:2}"),
		map[string]any{"y": float64(1), "x": "A", "z": float64(2)})
	assert(t, "map-x@a-y@b", mustParse(t, j, "{x:@a, y:@b}"),
		map[string]any{"x": "A", "y": "B"})

	// Space-separated maps.
	assert(t, "map-sp-x@a", mustParse(t, j, "{x:@a}"),
		map[string]any{"x": "A"})
	assert(t, "map-sp-y1-x@a", mustParse(t, j, "{y:1 x:@a}"),
		map[string]any{"y": float64(1), "x": "A"})
	assert(t, "map-sp-x@a-y@b", mustParse(t, j, "{x:@a y:@b}"),
		map[string]any{"x": "A", "y": "B"})

	// Implicit lists (comma-separated, no brackets).
	assert(t, "imp-1-@a", mustParse(t, j, "1, @a"),
		[]any{float64(1), "A"})
	assert(t, "imp-@a-1", mustParse(t, j, "@a, 1"),
		[]any{"A", float64(1)})
	assert(t, "imp-1-@a-2", mustParse(t, j, "1, @a, 2"),
		[]any{float64(1), "A", float64(2)})

	// Implicit lists (space-separated, no brackets).
	assert(t, "imp-sp-1-@a", mustParse(t, j, "1 @a"),
		[]any{float64(1), "A"})
	assert(t, "imp-sp-@a-1", mustParse(t, j, "@a 1"),
		[]any{"A", float64(1)})
	assert(t, "imp-sp-1-@a-2", mustParse(t, j, "1 @a 2"),
		[]any{float64(1), "A", float64(2)})

	// Multiple directives in implicit lists.
	assert(t, "imp-1-@a-@b", mustParse(t, j, "1, @a, @b"),
		[]any{float64(1), "A", "B"})
	assert(t, "imp-sp-1-@a-@b", mustParse(t, j, "1 @a @b"),
		[]any{float64(1), "A", "B"})
	assert(t, "imp-@a-@b-1", mustParse(t, j, "@a, @b, 1"),
		[]any{"A", "B", float64(1)})
	assert(t, "imp-sp-@a-@b-1", mustParse(t, j, "@a @b 1"),
		[]any{"A", "B", float64(1)})
}

func TestClose(t *testing.T) {
	j := jsonic.Make()
	Apply(j, DirectiveOptions{
		Name:  "foo",
		Open:  "foo<",
		Close: ">",
		Action: func(rule *jsonic.Rule, ctx *jsonic.Context) {
			rule.Node = "FOO"
		},
	})

	assert(t, "foo-t", mustParse(t, j, "foo<t>"), "FOO")
	assert(t, "foo-empty", mustParse(t, j, "foo<>"), "FOO")

	assert(t, "map-a1", mustParse(t, j, `{"a":1}`),
		map[string]any{"a": float64(1)})
	assert(t, "map-a-foo", mustParse(t, j, `{"a":foo< a >}`),
		map[string]any{"a": "FOO"})
	assert(t, "map-a-foo-obj", mustParse(t, j, `{"a":foo<{x:1}>}`),
		map[string]any{"a": "FOO"})
	assert(t, "map-a-foo-nested", mustParse(t, j, `{"a":foo<foo<a>>}`),
		map[string]any{"a": "FOO"})

	assert(t, "map-a1-b-foo", mustParse(t, j, `{"a":1,b:foo<b>}`),
		map[string]any{"a": float64(1), "b": "FOO"})
	assert(t, "map-a1-b-foo-list", mustParse(t, j, `{"a":1,b:foo<[2]>}`),
		map[string]any{"a": float64(1), "b": "FOO"})

	assert(t, "list-1-foo", mustParse(t, j, `{"a":[1,foo<b>]}`),
		map[string]any{"a": []any{float64(1), "FOO"}})

	// Close without open should error.
	mustError(t, j, ">")
	mustError(t, j, "a:>")

	// Second directive sharing the same close token.
	Apply(j, DirectiveOptions{
		Name:  "bar",
		Open:  "bar<",
		Close: ">",
		Action: func(rule *jsonic.Rule, ctx *jsonic.Context) {
			rule.Node = "BAR"
		},
	})

	assert(t, "bar-a", mustParse(t, j, `{"a":bar< a >}`),
		map[string]any{"a": "BAR"})
	assert(t, "bar-obj", mustParse(t, j, `{"a":bar<{x:1}>}`),
		map[string]any{"a": "BAR"})

	assert(t, "foo-after-bar", mustParse(t, j, `{"a":foo< a >}`),
		map[string]any{"a": "FOO"})

	assert(t, "foo-and-bar", mustParse(t, j, `{"a":foo< a >, b:bar<>}`),
		map[string]any{"a": "FOO", "b": "BAR"})

	// Duplicate open token should panic.
	defer func() {
		r := recover()
		if r == nil {
			t.Fatal("expected panic for duplicate open token")
		}
	}()
	Apply(j, DirectiveOptions{
		Name:   "baz",
		Open:   "bar<",
		Action: func(rule *jsonic.Rule, ctx *jsonic.Context) {},
	})
}

func TestAdder(t *testing.T) {
	j := jsonic.Make()
	Apply(j, DirectiveOptions{
		Name:  "adder",
		Open:  "add<",
		Close: ">",
		Action: func(rule *jsonic.Rule, ctx *jsonic.Context) {
			out := float64(0)
			if arr, ok := rule.Child.Node.([]any); ok {
				for _, v := range arr {
					if n, ok := v.(float64); ok {
						out += n
					} else if s, ok := v.(string); ok {
						// String concatenation: treat result as string.
						result := ""
						for _, sv := range arr {
							result += fmt.Sprintf("%v", sv)
						}
						_ = s
						rule.Node = result
						return
					}
				}
			}
			rule.Node = out
		},
	})

	assert(t, "add-1-2", mustParse(t, j, "add<1,2>"), float64(3))
	assert(t, "map-add", mustParse(t, j, "a:add<1,2>"),
		map[string]any{"a": float64(3)})
	assert(t, "list-add-str", mustParse(t, j, "[add<a,b>]"), []any{"ab"})

	// Second directive: multiplier.
	Apply(j, DirectiveOptions{
		Name:  "multiplier",
		Open:  "mul<",
		Close: ">",
		Action: func(rule *jsonic.Rule, ctx *jsonic.Context) {
			out := float64(0)
			if arr, ok := rule.Child.Node.([]any); ok && len(arr) > 0 {
				out = 1
				for _, v := range arr {
					if n, ok := v.(float64); ok {
						out *= n
					}
				}
			}
			rule.Node = out
		},
	})

	assert(t, "mul-2-3", mustParse(t, j, "mul<2,3>"), float64(6))
	assert(t, "map-mul", mustParse(t, j, "a:mul<2,3>"),
		map[string]any{"a": float64(6)})

	// Original adder still works.
	assert(t, "add-after-mul", mustParse(t, j, "add<1,2>"), float64(3))
	assert(t, "map-add-after-mul", mustParse(t, j, "a:add<1,2>"),
		map[string]any{"a": float64(3)})
}

func TestEdges(t *testing.T) {
	j := jsonic.Make()
	Apply(j, DirectiveOptions{
		Name:   "none",
		Open:   "@",
		Action: func(rule *jsonic.Rule, ctx *jsonic.Context) {},
		Rules:  &RulesOption{}, // Empty rules: no existing rules modified.
	})

	// @ is registered as a fixed token but no rule detects it → error.
	mustError(t, j, "a:@x")
}

func TestCustom(t *testing.T) {
	// Test the Custom callback: create a directive that uses custom
	// rule modifications to handle @foo as a map key-value shorthand.
	j := jsonic.Make()
	Apply(j, DirectiveOptions{
		Name: "subobj",
		Open: "@",
		Rules: &RulesOption{
			Open: map[string]*RuleMod{
				"val": {},
				"pair": {
					C: func(r *jsonic.Rule, ctx *jsonic.Context) bool {
						return r.Lte("pk", 0)
					},
				},
			},
		},
		Action: func(rule *jsonic.Rule, ctx *jsonic.Context) {
			key := fmt.Sprintf("%v", rule.Child.Node)
			val := strings.ToUpper(key)
			res := map[string]any{key: val}

			// Merge into grandparent node.
			if rule.Parent != nil && rule.Parent != jsonic.NoRule &&
				rule.Parent.Parent != nil && rule.Parent.Parent != jsonic.NoRule {
				if m, ok := rule.Parent.Parent.Node.(map[string]any); ok {
					for k, v := range res {
						m[k] = v
					}
					return
				}
			}
			rule.Node = res
		},
		Custom: func(j *jsonic.Jsonic, cfg DirectiveConfig) {
			OPEN := cfg.OPEN
			name := cfg.Name

			// Handle @foo at top level: assume a map.
			j.Rule("val", func(rs *jsonic.RuleSpec) {
				rs.PrependOpen(
					&jsonic.AltSpec{
						S: [][]jsonic.Tin{{OPEN}},
						C: func(r *jsonic.Rule, ctx *jsonic.Context) bool {
							return r.N["pk"] > 0
						},
						B: 1,
						G: name + "_undive",
					},
					&jsonic.AltSpec{
						S: [][]jsonic.Tin{{OPEN}},
						C: func(r *jsonic.Rule, ctx *jsonic.Context) bool {
							return r.D == 0
						},
						P: "map",
						B: 1,
						N: map[string]int{name + "_top": 1},
						G: name + "_top",
					},
				)
			})

			j.Rule("map", func(rs *jsonic.RuleSpec) {
				rs.PrependOpen(&jsonic.AltSpec{
					S: [][]jsonic.Tin{{OPEN}},
					C: func(r *jsonic.Rule, ctx *jsonic.Context) bool {
						return r.D == 1 && r.N[name+"_top"] == 1
					},
					P: "pair",
					B: 1,
					G: name + "_top",
				})
				rs.PrependClose(&jsonic.AltSpec{
					S: [][]jsonic.Tin{{OPEN}},
					C: func(r *jsonic.Rule, ctx *jsonic.Context) bool {
						return r.N["pk"] > 0
					},
					B: 1,
					G: name + "_undive",
				})
			})

			j.Rule("pair", func(rs *jsonic.RuleSpec) {
				rs.PrependClose(&jsonic.AltSpec{
					S: [][]jsonic.Tin{{OPEN}},
					C: func(r *jsonic.Rule, ctx *jsonic.Context) bool {
						return r.N["pk"] > 0
					},
					B: 1,
					G: name + "_undive",
				})
			})
		},
	})

	assert(t, "sub-@a", mustParse(t, j, "@a"),
		map[string]any{"a": "A"})
	assert(t, "sub-{@a}", mustParse(t, j, "{@a}"),
		map[string]any{"a": "A"})
	assert(t, "sub-{@a @b}", mustParse(t, j, "{@a @b}"),
		map[string]any{"a": "A", "b": "B"})
	assert(t, "sub-{x:1 @a @b}", mustParse(t, j, "{x:1 @a @b}"),
		map[string]any{"x": float64(1), "a": "A", "b": "B"})
	assert(t, "sub-{@a q:1}", mustParse(t, j, "{@a q:1}"),
		map[string]any{"a": "A", "q": float64(1)})

	assert(t, "sub-@a-q:1", mustParse(t, j, "@a q:1"),
		map[string]any{"a": "A", "q": float64(1)})
	assert(t, "sub-q:1-@a", mustParse(t, j, "q:1 @a"),
		map[string]any{"q": float64(1), "a": "A"})
	assert(t, "sub-q:1-@a-w:2", mustParse(t, j, "q:1 @a w:2"),
		map[string]any{"q": float64(1), "a": "A", "w": float64(2)})

	assert(t, "sub-@a-@b", mustParse(t, j, "@a @b"),
		map[string]any{"a": "A", "b": "B"})
	assert(t, "sub-q:1-@a-@b", mustParse(t, j, "q:1 @a @b"),
		map[string]any{"q": float64(1), "a": "A", "b": "B"})
}
