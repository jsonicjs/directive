import { StateAction, Plugin } from '@jsonic/jsonic-next';
type DirectiveOptions = {
    name: string;
    open: string;
    action: StateAction | string;
    close?: string;
    rules?: {
        open?: string | string[];
        close?: string | string[];
    };
};
declare const Directive: Plugin;
export { Directive };
export type { DirectiveOptions };
