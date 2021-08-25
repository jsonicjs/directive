import { AltAction, Plugin } from 'jsonic';
declare type DirectiveOptions = {
    name: string;
    open: string;
    action: AltAction;
    close?: string;
    rules?: string | string[];
};
declare const Directive: Plugin;
export { Directive, };
export type { DirectiveOptions, };
