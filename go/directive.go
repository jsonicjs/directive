/* Copyright (c) 2021-2025 Richard Rodger and other contributors, MIT License */

package directive

import (
	jsonic "github.com/jsonicjs/jsonic/go"
)

// Action is called when a directive is processed.
// It receives the directive rule and parse context. The rule's Child.Node
// contains the parsed content between open (and optional close) tokens.
// Set rule.Node to the directive's result value.
type Action func(rule *jsonic.Rule, ctx *jsonic.Context)

// RuleMod configures how a directive integrates with an existing grammar rule.
type RuleMod struct {
	// C is an optional condition that must be true for the directive to match
	// within this rule.
	C jsonic.AltCond
}

// RulesOption configures which grammar rules are modified by the directive.
// Open rules detect the directive open token and push to the directive rule.
// Close rules detect the close token (if any) to end sibling parsing.
type RulesOption struct {
	Open  map[string]*RuleMod
	Close map[string]*RuleMod
}

// CustomFunc allows additional customization of the jsonic instance
// after the directive rule is created.
type CustomFunc func(j *jsonic.Jsonic, config DirectiveConfig)

// DirectiveConfig holds the resolved token Tins for a directive,
// passed to CustomFunc callbacks.
type DirectiveConfig struct {
	OPEN  jsonic.Tin
	CLOSE jsonic.Tin // -1 if no close token
	Name  string
}

// DirectiveOptions configures the Directive plugin.
type DirectiveOptions struct {
	// Name is the directive name, used as the rule name and token prefix.
	Name string

	// Open is the character sequence that starts the directive.
	// Must be unique (not already a registered fixed token).
	Open string

	// Close is the optional character sequence that ends the directive.
	// If empty, the directive consumes a single value after the open token.
	Close string

	// Action is called when the directive content has been parsed.
	Action Action

	// Rules controls which existing grammar rules are modified.
	// nil means use defaults: open="val", close="list,elem,map,pair".
	// Set to &RulesOption{} to override defaults with no rules.
	Rules *RulesOption

	// Custom allows additional jsonic customization after directive setup.
	Custom CustomFunc
}

// Apply registers a Directive plugin on the given jsonic instance.
// Returns the jsonic instance for chaining.
func Apply(j *jsonic.Jsonic, opts DirectiveOptions) *jsonic.Jsonic {
	pluginMap := map[string]any{"_opts": &opts}
	j.Use(Directive, pluginMap)
	return j
}

// defaultRules returns the default rules configuration.
func defaultRules() *RulesOption {
	return &RulesOption{
		Open: map[string]*RuleMod{
			"val": {},
		},
		Close: map[string]*RuleMod{
			"list": {},
			"elem": {},
			"map":  {},
			"pair": {},
		},
	}
}

// resolveRules normalizes a rules map, ensuring no nil entries.
func resolveRules(rules map[string]*RuleMod) map[string]*RuleMod {
	if rules == nil {
		return map[string]*RuleMod{}
	}
	result := make(map[string]*RuleMod, len(rules))
	for k, v := range rules {
		if v == nil {
			v = &RuleMod{}
		}
		result[k] = v
	}
	return result
}

// extractOptions retrieves DirectiveOptions from the plugin options map.
func extractOptions(m map[string]any) *DirectiveOptions {
	if m != nil {
		if opts, ok := m["_opts"].(*DirectiveOptions); ok {
			return opts
		}
	}
	return &DirectiveOptions{}
}
