import { Rule, Plugin } from 'jsonic';
declare type DirectiveOptions = {
    name: string;
    src: string;
    action: (from?: string, rule?: Rule) => any;
};
declare const Directive: Plugin;
export { Directive, };
export type { DirectiveOptions, };
