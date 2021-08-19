import { Rule, Plugin } from 'jsonic';
declare type DirectiveOptions = {
    name: string;
    open: string;
    action: (from?: string, rule?: Rule) => any;
    close?: string;
    rules?: string | string[];
};
declare const Directive: Plugin;
export { Directive, };
export type { DirectiveOptions, };
