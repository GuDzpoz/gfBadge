(window["webpackJsonp"]=window["webpackJsonp"]||[]).push([["chunk-2d0ac5fd"],{"18ee":function(e,n,s){"use strict";s.r(n);
// @license © 2020 Google LLC. Licensed under the Apache License, Version 2.0.
const i=async e=>{const n=await e.getFile();return n.handle=e,n};n["default"]=async(e={})=>{const n=await window.chooseFileSystemEntries({accepts:[{description:e.description||"",mimeTypes:e.mimeTypes||["*/*"],extensions:e.extensions||[""]}],multiple:e.multiple||!1});return e.multiple?Promise.all(n.map(i)):i(n)}}}]);
//# sourceMappingURL=chunk-2d0ac5fd.5e50c31b.js.map