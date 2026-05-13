import{Dt as e,Ht as t,It as n,Wt as r,bt as i,hn as a,jt as o,t as s,wt as c}from"./style-BdYyaGzF.js";import{r as l,t as u}from"./basecomponent-CT4HvVKT.js";var d=s.extend({name:`skeleton`,style:`
    .p-skeleton {
        display: block;
        overflow: hidden;
        background: dt('skeleton.background');
        border-radius: dt('skeleton.border.radius');
    }

    .p-skeleton::after {
        content: '';
        animation: p-skeleton-animation 1.2s infinite;
        height: 100%;
        left: 0;
        position: absolute;
        right: 0;
        top: 0;
        transform: translateX(-100%);
        z-index: 1;
        background: linear-gradient(90deg, rgba(255, 255, 255, 0), dt('skeleton.animation.background'), rgba(255, 255, 255, 0));
    }

    [dir='rtl'] .p-skeleton::after {
        animation-name: p-skeleton-animation-rtl;
    }

    .p-skeleton-circle {
        border-radius: 50%;
    }

    .p-skeleton-animation-none::after {
        animation: none;
    }

    @keyframes p-skeleton-animation {
        from {
            transform: translateX(-100%);
        }
        to {
            transform: translateX(100%);
        }
    }

    @keyframes p-skeleton-animation-rtl {
        from {
            transform: translateX(100%);
        }
        to {
            transform: translateX(-100%);
        }
    }
`,classes:{root:function(e){var t=e.props;return[`p-skeleton p-component`,{"p-skeleton-circle":t.shape===`circle`,"p-skeleton-animation-none":t.animation===`none`}]}},inlineStyles:{root:{position:`relative`}}}),f={name:`BaseSkeleton`,extends:u,props:{shape:{type:String,default:`rectangle`},size:{type:String,default:null},width:{type:String,default:`100%`},height:{type:String,default:`1rem`},borderRadius:{type:String,default:null},animation:{type:String,default:`wave`}},style:d,provide:function(){return{$pcSkeleton:this,$parentInstance:this}}};function p(e){"@babel/helpers - typeof";return p=typeof Symbol==`function`&&typeof Symbol.iterator==`symbol`?function(e){return typeof e}:function(e){return e&&typeof Symbol==`function`&&e.constructor===Symbol&&e!==Symbol.prototype?`symbol`:typeof e},p(e)}function m(e,t,n){return(t=h(t))in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function h(e){var t=g(e,`string`);return p(t)==`symbol`?t:t+``}function g(e,t){if(p(e)!=`object`||!e)return e;var n=e[Symbol.toPrimitive];if(n!==void 0){var r=n.call(e,t);if(p(r)!=`object`)return r;throw TypeError(`@@toPrimitive must return a primitive value.`)}return(t===`string`?String:Number)(e)}var _={name:`Skeleton`,extends:f,inheritAttrs:!1,computed:{containerStyle:function(){return this.size?{width:this.size,height:this.size,borderRadius:this.borderRadius}:{width:this.width,height:this.height,borderRadius:this.borderRadius}},dataP:function(){return l(m({},this.shape,this.shape))}}},v=[`data-p`];function y(r,i,a,o,s,c){return t(),e(`div`,n({class:r.cx(`root`),style:[r.sx(`root`),c.containerStyle],"aria-hidden":`true`},r.ptmi(`root`),{"data-p":c.dataP}),null,16,v)}_.render=y;var b={class:`p-6`},x={__name:`SettingsView`,setup(n){return(n,s)=>(t(),e(`div`,b,[s[0]||=c(`h1`,{class:`text-xl font-semibold mb-6 text-gray-900`},`Settings`,-1),c(`div`,null,[(t(),e(i,null,r(6,e=>c(`div`,{key:e,class:`flex justify-between py-3 border-b border-gray-100`},[o(a(_),{width:`140px`,height:`1rem`}),o(a(_),{width:`200px`,height:`1rem`})])),64))])]))}};export{x as default};