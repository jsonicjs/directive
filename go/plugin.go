/* Copyright (c) 2021-2025 Richard Rodger and other contributors, MIT License */

package directive

import (
	"fmt"

	jsonic "github.com/jsonicjs/jsonic/go"
)

// Directive is a jsonic plugin that adds directive syntax support.
// A directive defines a custom token sequence (open and optional close)
// that triggers an action callback to transform the parsed content.
func Directive(j *jsonic.Jsonic, pluginOpts map[string]any) error {
	opts := extractOptions(pluginOpts)

	// Resolve rules: nil means use defaults.
	var openRules, closeRules map[string]*RuleMod
	if opts.Rules == nil {
		defaults := defaultRules()
		openRules = resolveRules(defaults.Open)
		closeRules = resolveRules(defaults.Close)
	} else {
		openRules = resolveRules(opts.Rules.Open)
		closeRules = resolveRules(opts.Rules.Close)
	}

	name := opts.Name
	open := opts.Open
	close_ := opts.Close
	action := opts.Action
	custom := opts.Custom
	hasClose := close_ != ""

	// The open token must not already be registered.
	cfg := j.Config()
	if _, exists := cfg.FixedTokens[open]; exists {
		panic(fmt.Sprintf("Directive open token already in use: %s", open))
	}

	// Register the open fixed token.
	openTN := "#OD_" + name
	OPEN := j.Token(openTN, open)

	// Register or look up the close fixed token.
	var CLOSE jsonic.Tin = -1
	if hasClose {
		closeTN := "#CD_" + name
		if existing, exists := cfg.FixedTokens[close_]; exists {
			CLOSE = existing
		} else {
			CLOSE = j.Token(closeTN, close_)
		}
	}

	// Look up the comma token for close-with-comma alternatives.
	CA := j.Token("#CA")

	// ---- Modify existing rules for OPEN token detection ----

	for rulename, rulemod := range openRules {
		rm := rulemod
		dn := name
		j.Rule(rulename, func(rs *jsonic.RuleSpec) {
			// Match OPEN token → push to directive rule.
			openAlt := &jsonic.AltSpec{
				S: [][]jsonic.Tin{{OPEN}},
				P: dn,
				N: map[string]int{"dr_" + dn: 1},
				G: "start",
			}
			if rm.C != nil {
				openAlt.C = rm.C
			}

			if hasClose {
				// Also match OPEN+CLOSE (empty directive).
				emptyAlt := &jsonic.AltSpec{
					S: [][]jsonic.Tin{{OPEN}, {CLOSE}},
					B: 1,
					P: dn,
					N: map[string]int{"dr_" + dn: 1},
					G: "start,end",
				}

				// Prepend close detection to this rule.
				closeAlt := &jsonic.AltSpec{
					S: [][]jsonic.Tin{{CLOSE}},
					B: 1,
					G: "end",
				}

				// OPEN+CLOSE must be checked before OPEN alone.
				rs.PrependOpen(openAlt)
				rs.PrependOpen(emptyAlt)
				rs.PrependClose(closeAlt)
			} else {
				rs.PrependOpen(openAlt)
			}
		})
	}

	// ---- Modify existing rules for CLOSE token detection ----

	if hasClose {
		for rulename, rulemod := range closeRules {
			rm := rulemod
			dn := name
			j.Rule(rulename, func(rs *jsonic.RuleSpec) {
				// CLOSE token ends the directive content.
				closeAlt := &jsonic.AltSpec{
					S: [][]jsonic.Tin{{CLOSE}},
					C: func(r *jsonic.Rule, ctx *jsonic.Context) bool {
						if r.N["dr_"+dn] != 1 {
							return false
						}
						if rm.C != nil {
							return rm.C(r, ctx)
						}
						return true
					},
					B: 1,
					G: "end",
				}

				// COMMA + CLOSE also ends the directive.
				commaCloseAlt := &jsonic.AltSpec{
					S: [][]jsonic.Tin{{CA}, {CLOSE}},
					C: func(r *jsonic.Rule, ctx *jsonic.Context) bool {
						return r.N["dr_"+dn] == 1
					},
					B: 1,
					G: "end,comma",
				}

				rs.PrependClose(closeAlt, commaCloseAlt)
			})
		}
	}

	// ---- Create the directive rule ----

	j.Rule(name, func(rs *jsonic.RuleSpec) {
		rs.Clear()

		// Before open: initialize node as empty map.
		rs.AddBO(func(r *jsonic.Rule, ctx *jsonic.Context) {
			r.Node = make(map[string]any)
		})

		// Open alternatives.
		openAlts := make([]*jsonic.AltSpec, 0, 2)

		// If close token exists, check for immediate close (empty directive).
		if hasClose {
			openAlts = append(openAlts, &jsonic.AltSpec{
				S: [][]jsonic.Tin{{CLOSE}},
				B: 1,
			})
		}

		// Push to val rule to parse directive content.
		// Counter settings control implicit list/map creation:
		//   With close: reset counters (allow implicits within boundaries)
		//   Without close: increment counters (prevent implicits consuming siblings)
		counters := map[string]int{}
		if hasClose {
			counters["dlist"] = 0
			counters["dmap"] = 0
		} else {
			counters["dlist"] = 1
			counters["dmap"] = 1
		}
		openAlts = append(openAlts, &jsonic.AltSpec{
			P: "val",
			N: counters,
		})

		rs.Open = openAlts

		// Before close: resolve the child node and invoke the action.
		rs.AddBC(func(r *jsonic.Rule, ctx *jsonic.Context) {
			// Follow the replacement chain to get the final child node.
			// When a val rule is replaced by a list rule (implicit list),
			// the original child's Node may be stale in Go because slice
			// append can reallocate. Walk the Prev-linked replacement
			// chain to find the last replacement and adopt its Node.
			if r.Child != nil && r.Child != jsonic.NoRule {
				final := r.Child
				for final.Next != nil && final.Next != jsonic.NoRule &&
					final.Next.Prev == final {
					final = final.Next
				}
				if final != r.Child {
					r.Child.Node = final.Node
				}
			}
			if action != nil {
				action(r, ctx)
			}
		})

		// Close alternatives (only if close token exists).
		if hasClose {
			rs.Close = []*jsonic.AltSpec{
				{S: [][]jsonic.Tin{{CLOSE}}},
				{S: [][]jsonic.Tin{{CA}, {CLOSE}}},
			}
		}
	})

	// ---- Custom callback ----

	if custom != nil {
		closeTin := jsonic.Tin(-1)
		if hasClose {
			closeTin = CLOSE
		}
		custom(j, DirectiveConfig{
			OPEN:  OPEN,
			CLOSE: closeTin,
			Name:  name,
		})
	}

	return nil
}
