(window["webpackJsonp"]=window["webpackJsonp"]||[]).push([["chunk-2d21e73c"],{d62f:function(e,n,t){"use strict";t.r(n),
// @license © 2020 Google LLC. Licensed under the Apache License, Version 2.0.
n["default"]=async(e={})=>new Promise((n,t)=>{const o=document.createElement("input");o.type="file";const i=[...e.mimeTypes?e.mimeTypes:[],e.extensions?e.extensions:[]].join();let s;o.multiple=e.multiple||!1,o.accept=i||"";const r=()=>s(t);e.setupLegacyCleanupAndRejection?s=e.setupLegacyCleanupAndRejection(r):(s=e=>{window.removeEventListener("pointermove",r),window.removeEventListener("pointerdown",r),window.removeEventListener("keydown",r),e&&e(new DOMException("The user aborted a request.","AbortError"))},window.addEventListener("pointermove",r),window.addEventListener("pointerdown",r),window.addEventListener("keydown",r)),o.addEventListener("change",()=>{s(),n(o.multiple?Array.from(o.files):o.files[0])}),o.click()})}}]);
//# sourceMappingURL=chunk-2d21e73c.ebc0ead4.js.map