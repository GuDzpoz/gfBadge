(window["webpackJsonp"]=window["webpackJsonp"]||[]).push([["chunk-2d0dd0dd"],{"806e":function(e,i,t){"use strict";t.r(i),
// @license © 2020 Google LLC. Licensed under the Apache License, Version 2.0.
i["default"]=async(e,i={},t=null,a=!1)=>{i.fileName=i.fileName||"Untitled";const s={};if(i.mimeTypes?(i.mimeTypes.push(e.type),i.mimeTypes.map(e=>{s[e]=i.extensions||[]})):s[e.type]=i.extensions||[],t)try{await t.getFile()}catch(e){if(t=null,a)throw e}const n=t||await window.showSaveFilePicker({suggestedName:i.fileName,types:[{description:i.description||"",accept:s}]}),c=await n.createWritable();return await c.write(e),await c.close(),n}}}]);
//# sourceMappingURL=chunk-2d0dd0dd.adf7b482.js.map