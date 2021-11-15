(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.module = {}));
})(this, (function (exports) { 'use strict';

    function noop() { }
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function update_slot_base(slot, slot_definition, ctx, $$scope, slot_changes, get_slot_context_fn) {
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }
    function get_all_dirty_from_scope($$scope) {
        if ($$scope.ctx.length > 32) {
            const dirty = [];
            const length = $$scope.ctx.length / 32;
            for (let i = 0; i < length; i++) {
                dirty[i] = -1;
            }
            return dirty;
        }
        return -1;
    }
    function null_to_empty(value) {
        return value == null ? '' : value;
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function prevent_default(fn) {
        return function (event) {
            event.preventDefault();
            // @ts-ignore
            return fn.call(this, event);
        };
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function to_number(value) {
        return value === '' ? null : +value;
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function select_option(select, value) {
        for (let i = 0; i < select.options.length; i += 1) {
            const option = select.options[i];
            if (option.__value === value) {
                option.selected = true;
                return;
            }
        }
        select.selectedIndex = -1; // no option should be selected
    }
    function select_value(select) {
        const selected_option = select.querySelector(':checked') || select.options[0];
        return selected_option && selected_option.__value;
    }
    // unfortunately this can't be a constant as that wouldn't be tree-shakeable
    // so we cache the result instead
    let crossorigin;
    function is_crossorigin() {
        if (crossorigin === undefined) {
            crossorigin = false;
            try {
                if (typeof window !== 'undefined' && window.parent) {
                    void window.parent.document;
                }
            }
            catch (error) {
                crossorigin = true;
            }
        }
        return crossorigin;
    }
    function add_resize_listener(node, fn) {
        const computed_style = getComputedStyle(node);
        if (computed_style.position === 'static') {
            node.style.position = 'relative';
        }
        const iframe = element('iframe');
        iframe.setAttribute('style', 'display: block; position: absolute; top: 0; left: 0; width: 100%; height: 100%; ' +
            'overflow: hidden; border: 0; opacity: 0; pointer-events: none; z-index: -1;');
        iframe.setAttribute('aria-hidden', 'true');
        iframe.tabIndex = -1;
        const crossorigin = is_crossorigin();
        let unsubscribe;
        if (crossorigin) {
            iframe.src = "data:text/html,<script>onresize=function(){parent.postMessage(0,'*')}</script>";
            unsubscribe = listen(window, 'message', (event) => {
                if (event.source === iframe.contentWindow)
                    fn();
            });
        }
        else {
            iframe.src = 'about:blank';
            iframe.onload = () => {
                unsubscribe = listen(iframe.contentWindow, 'resize', fn);
            };
        }
        append(node, iframe);
        return () => {
            if (crossorigin) {
                unsubscribe();
            }
            else if (unsubscribe && iframe.contentWindow) {
                unsubscribe();
            }
            detach(iframe);
        };
    }
    function custom_event(type, detail, bubbles = false) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail);
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
            }
        };
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function add_flush_callback(fn) {
        flush_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);

    function bind(component, name, callback) {
        const index = component.$$.props[name];
        if (index !== undefined) {
            component.$$.bound[index] = callback;
            callback(component.$$.ctx[index]);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.44.0' }, detail), true));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /* src/components/Day.svelte generated by Svelte v3.44.0 */
    const file$6 = "src/components/Day.svelte";

    function get_each_context$4(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[11] = list[i];
    	return child_ctx;
    }

    // (92:12) {#if weekday}
    function create_if_block_1$2(ctx) {
    	const block = { c: noop, m: noop, d: noop };

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$2.name,
    		type: "if",
    		source: "(92:12) {#if weekday}",
    		ctx
    	});

    	return block;
    }

    // (98:12) {#if events.length}
    function create_if_block$4(ctx) {
    	let ul;
    	let each_value = /*events*/ ctx[6];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$4(get_each_context$4(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			ul = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(ul, "class", "svelte-xx1ta3");
    			add_location(ul, file$6, 98, 12, 2226);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, ul, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*events*/ 64) {
    				each_value = /*events*/ ctx[6];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$4(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$4(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(ul, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(ul);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$4.name,
    		type: "if",
    		source: "(98:12) {#if events.length}",
    		ctx
    	});

    	return block;
    }

    // (100:12) {#each events as event}
    function create_each_block$4(ctx) {
    	let li;
    	let div;
    	let t0_value = /*event*/ ctx[11].name + "";
    	let t0;
    	let t1;

    	const block = {
    		c: function create() {
    			li = element("li");
    			div = element("div");
    			t0 = text(t0_value);
    			t1 = space();
    			attr_dev(div, "class", "event svelte-xx1ta3");
    			add_location(div, file$6, 101, 20, 2308);
    			attr_dev(li, "class", "svelte-xx1ta3");
    			add_location(li, file$6, 100, 16, 2283);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, div);
    			append_dev(div, t0);
    			append_dev(li, t1);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*events*/ 64 && t0_value !== (t0_value = /*event*/ ctx[11].name + "")) set_data_dev(t0, t0_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$4.name,
    		type: "each",
    		source: "(100:12) {#each events as event}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$6(ctx) {
    	let div3;
    	let div2;
    	let div0;
    	let span;
    	let t0;
    	let t1;
    	let t2;
    	let div1;
    	let div3_class_value;
    	let mounted;
    	let dispose;
    	let if_block0 = /*weekday*/ ctx[3] && create_if_block_1$2(ctx);
    	let if_block1 = /*events*/ ctx[6].length && create_if_block$4(ctx);

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			div2 = element("div");
    			div0 = element("div");
    			span = element("span");
    			t0 = text(/*day*/ ctx[0]);
    			t1 = space();
    			if (if_block0) if_block0.c();
    			t2 = space();
    			div1 = element("div");
    			if (if_block1) if_block1.c();
    			add_location(span, file$6, 90, 12, 1981);
    			attr_dev(div0, "class", "description svelte-xx1ta3");
    			add_location(div0, file$6, 89, 8, 1943);
    			attr_dev(div1, "class", "events svelte-xx1ta3");
    			add_location(div1, file$6, 96, 8, 2161);
    			attr_dev(div2, "class", "svelte-xx1ta3");
    			add_location(div2, file$6, 88, 4, 1929);
    			attr_dev(div3, "class", div3_class_value = "day " + (/*inactive*/ ctx[4] ? "inactive" : "") + " " + (/*holiday*/ ctx[5] ? "holiday" : "") + " svelte-xx1ta3");
    			attr_dev(div3, "data-day", /*day*/ ctx[0]);
    			attr_dev(div3, "data-month", /*month*/ ctx[1]);
    			attr_dev(div3, "data-year", /*year*/ ctx[2]);
    			add_location(div3, file$6, 83, 0, 1775);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div2);
    			append_dev(div2, div0);
    			append_dev(div0, span);
    			append_dev(span, t0);
    			append_dev(div0, t1);
    			if (if_block0) if_block0.m(div0, null);
    			append_dev(div2, t2);
    			append_dev(div2, div1);
    			if (if_block1) if_block1.m(div1, null);

    			if (!mounted) {
    				dispose = listen_dev(div3, "click", /*click*/ ctx[7], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*day*/ 1) set_data_dev(t0, /*day*/ ctx[0]);

    			if (/*weekday*/ ctx[3]) {
    				if (if_block0) ; else {
    					if_block0 = create_if_block_1$2(ctx);
    					if_block0.c();
    					if_block0.m(div0, null);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*events*/ ctx[6].length) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block$4(ctx);
    					if_block1.c();
    					if_block1.m(div1, null);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (dirty & /*inactive, holiday*/ 48 && div3_class_value !== (div3_class_value = "day " + (/*inactive*/ ctx[4] ? "inactive" : "") + " " + (/*holiday*/ ctx[5] ? "holiday" : "") + " svelte-xx1ta3")) {
    				attr_dev(div3, "class", div3_class_value);
    			}

    			if (dirty & /*day*/ 1) {
    				attr_dev(div3, "data-day", /*day*/ ctx[0]);
    			}

    			if (dirty & /*month*/ 2) {
    				attr_dev(div3, "data-month", /*month*/ ctx[1]);
    			}

    			if (dirty & /*year*/ 4) {
    				attr_dev(div3, "data-year", /*year*/ ctx[2]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Day', slots, []);
    	let { day = 1 } = $$props;
    	let { month = 1 } = $$props;
    	let { year = 1970 } = $$props;
    	let { weekday = "" } = $$props;
    	let { inactive = false } = $$props;
    	let { holiday = false } = $$props;
    	let { events = [] } = $$props;
    	let { unixValue = false } = $$props;
    	const date = new Date(year, month - 1, day);
    	const dispatch = createEventDispatcher();

    	const click = () => {
    		if (unixValue) {
    			dispatch('day-click', date.getTime() / 1000);
    		} else {
    			dispatch('day-click', date);
    		}
    	};

    	const writable_props = [
    		'day',
    		'month',
    		'year',
    		'weekday',
    		'inactive',
    		'holiday',
    		'events',
    		'unixValue'
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Day> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('day' in $$props) $$invalidate(0, day = $$props.day);
    		if ('month' in $$props) $$invalidate(1, month = $$props.month);
    		if ('year' in $$props) $$invalidate(2, year = $$props.year);
    		if ('weekday' in $$props) $$invalidate(3, weekday = $$props.weekday);
    		if ('inactive' in $$props) $$invalidate(4, inactive = $$props.inactive);
    		if ('holiday' in $$props) $$invalidate(5, holiday = $$props.holiday);
    		if ('events' in $$props) $$invalidate(6, events = $$props.events);
    		if ('unixValue' in $$props) $$invalidate(8, unixValue = $$props.unixValue);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		day,
    		month,
    		year,
    		weekday,
    		inactive,
    		holiday,
    		events,
    		unixValue,
    		date,
    		dispatch,
    		click
    	});

    	$$self.$inject_state = $$props => {
    		if ('day' in $$props) $$invalidate(0, day = $$props.day);
    		if ('month' in $$props) $$invalidate(1, month = $$props.month);
    		if ('year' in $$props) $$invalidate(2, year = $$props.year);
    		if ('weekday' in $$props) $$invalidate(3, weekday = $$props.weekday);
    		if ('inactive' in $$props) $$invalidate(4, inactive = $$props.inactive);
    		if ('holiday' in $$props) $$invalidate(5, holiday = $$props.holiday);
    		if ('events' in $$props) $$invalidate(6, events = $$props.events);
    		if ('unixValue' in $$props) $$invalidate(8, unixValue = $$props.unixValue);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [day, month, year, weekday, inactive, holiday, events, click, unixValue];
    }

    class Day extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {
    			day: 0,
    			month: 1,
    			year: 2,
    			weekday: 3,
    			inactive: 4,
    			holiday: 5,
    			events: 6,
    			unixValue: 8
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Day",
    			options,
    			id: create_fragment$6.name
    		});
    	}

    	get day() {
    		throw new Error("<Day>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set day(value) {
    		throw new Error("<Day>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get month() {
    		throw new Error("<Day>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set month(value) {
    		throw new Error("<Day>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get year() {
    		throw new Error("<Day>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set year(value) {
    		throw new Error("<Day>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get weekday() {
    		throw new Error("<Day>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set weekday(value) {
    		throw new Error("<Day>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get inactive() {
    		throw new Error("<Day>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set inactive(value) {
    		throw new Error("<Day>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get holiday() {
    		throw new Error("<Day>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set holiday(value) {
    		throw new Error("<Day>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get events() {
    		throw new Error("<Day>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set events(value) {
    		throw new Error("<Day>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get unixValue() {
    		throw new Error("<Day>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set unixValue(value) {
    		throw new Error("<Day>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/Month.svelte generated by Svelte v3.44.0 */
    const file$5 = "src/components/Month.svelte";

    function get_each_context$3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[18] = list[i];
    	return child_ctx;
    }

    function get_each_context_1$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[18] = list[i];
    	return child_ctx;
    }

    // (219:12) {:else}
    function create_else_block$1(ctx) {
    	let div;
    	let t_value = /*day*/ ctx[18].name + "";
    	let t;
    	let div_title_value;
    	let div_data_index_value;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text(t_value);
    			attr_dev(div, "class", "day-header svelte-nj22ov");
    			attr_dev(div, "title", div_title_value = /*day*/ ctx[18].name);
    			attr_dev(div, "data-index", div_data_index_value = /*day*/ ctx[18].index);
    			add_location(div, file$5, 219, 12, 6294);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*dayHeaders*/ 4 && t_value !== (t_value = /*day*/ ctx[18].name + "")) set_data_dev(t, t_value);

    			if (dirty & /*dayHeaders*/ 4 && div_title_value !== (div_title_value = /*day*/ ctx[18].name)) {
    				attr_dev(div, "title", div_title_value);
    			}

    			if (dirty & /*dayHeaders*/ 4 && div_data_index_value !== (div_data_index_value = /*day*/ ctx[18].index)) {
    				attr_dev(div, "data-index", div_data_index_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(219:12) {:else}",
    		ctx
    	});

    	return block;
    }

    // (217:12) {#if clientWidth < 720}
    function create_if_block_1$1(ctx) {
    	let div;
    	let t_value = /*day*/ ctx[18].name.charAt(0) + "";
    	let t;
    	let div_title_value;
    	let div_data_index_value;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text(t_value);
    			attr_dev(div, "class", "day-header svelte-nj22ov");
    			attr_dev(div, "title", div_title_value = /*day*/ ctx[18].name);
    			attr_dev(div, "data-index", div_data_index_value = /*day*/ ctx[18].index);
    			add_location(div, file$5, 217, 12, 6169);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*dayHeaders*/ 4 && t_value !== (t_value = /*day*/ ctx[18].name.charAt(0) + "")) set_data_dev(t, t_value);

    			if (dirty & /*dayHeaders*/ 4 && div_title_value !== (div_title_value = /*day*/ ctx[18].name)) {
    				attr_dev(div, "title", div_title_value);
    			}

    			if (dirty & /*dayHeaders*/ 4 && div_data_index_value !== (div_data_index_value = /*day*/ ctx[18].index)) {
    				attr_dev(div, "data-index", div_data_index_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(217:12) {#if clientWidth < 720}",
    		ctx
    	});

    	return block;
    }

    // (216:8) {#each dayHeaders as day}
    function create_each_block_1$1(ctx) {
    	let if_block_anchor;

    	function select_block_type(ctx, dirty) {
    		if (/*clientWidth*/ ctx[3] < 720) return create_if_block_1$1;
    		return create_else_block$1;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			}
    		},
    		d: function destroy(detaching) {
    			if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1$1.name,
    		type: "each",
    		source: "(216:8) {#each dayHeaders as day}",
    		ctx
    	});

    	return block;
    }

    // (225:8) {#if days.length}
    function create_if_block$3(ctx) {
    	let each_1_anchor;
    	let current;
    	let each_value = /*days*/ ctx[1];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$3(get_each_context$3(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*days, unixValue, dayClicked*/ 19) {
    				each_value = /*days*/ ctx[1];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$3(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$3(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(225:8) {#if days.length}",
    		ctx
    	});

    	return block;
    }

    // (226:12) {#each days as day}
    function create_each_block$3(ctx) {
    	let day;
    	let current;

    	day = new Day({
    			props: {
    				day: /*day*/ ctx[18].day,
    				month: /*day*/ ctx[18].month,
    				year: /*day*/ ctx[18].year,
    				weekday: /*day*/ ctx[18].weekday,
    				inactive: /*day*/ ctx[18].inactive,
    				holiday: /*day*/ ctx[18].holiday,
    				unixValue: /*unixValue*/ ctx[0]
    			},
    			$$inline: true
    		});

    	day.$on("day-click", /*day_click_handler*/ ctx[10]);

    	const block = {
    		c: function create() {
    			create_component(day.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(day, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const day_changes = {};
    			if (dirty & /*days*/ 2) day_changes.day = /*day*/ ctx[18].day;
    			if (dirty & /*days*/ 2) day_changes.month = /*day*/ ctx[18].month;
    			if (dirty & /*days*/ 2) day_changes.year = /*day*/ ctx[18].year;
    			if (dirty & /*days*/ 2) day_changes.weekday = /*day*/ ctx[18].weekday;
    			if (dirty & /*days*/ 2) day_changes.inactive = /*day*/ ctx[18].inactive;
    			if (dirty & /*days*/ 2) day_changes.holiday = /*day*/ ctx[18].holiday;
    			if (dirty & /*unixValue*/ 1) day_changes.unixValue = /*unixValue*/ ctx[0];
    			day.$set(day_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(day.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(day.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(day, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$3.name,
    		type: "each",
    		source: "(226:12) {#each days as day}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
    	let div2;
    	let div0;
    	let t;
    	let div1;
    	let div2_resize_listener;
    	let current;
    	let each_value_1 = /*dayHeaders*/ ctx[2];
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1$1(get_each_context_1$1(ctx, each_value_1, i));
    	}

    	let if_block = /*days*/ ctx[1].length && create_if_block$3(ctx);

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t = space();
    			div1 = element("div");
    			if (if_block) if_block.c();
    			attr_dev(div0, "class", "days svelte-nj22ov");
    			add_location(div0, file$5, 214, 4, 6068);
    			attr_dev(div1, "class", "days svelte-nj22ov");
    			add_location(div1, file$5, 223, 4, 6426);
    			attr_dev(div2, "class", "month svelte-nj22ov");
    			add_render_callback(() => /*div2_elementresize_handler*/ ctx[11].call(div2));
    			add_location(div2, file$5, 213, 0, 6013);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div0, null);
    			}

    			append_dev(div2, t);
    			append_dev(div2, div1);
    			if (if_block) if_block.m(div1, null);
    			div2_resize_listener = add_resize_listener(div2, /*div2_elementresize_handler*/ ctx[11].bind(div2));
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*dayHeaders, clientWidth*/ 12) {
    				each_value_1 = /*dayHeaders*/ ctx[2];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1$1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_1$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div0, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_1.length;
    			}

    			if (/*days*/ ctx[1].length) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*days*/ 2) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$3(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(div1, null);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			destroy_each(each_blocks, detaching);
    			if (if_block) if_block.d();
    			div2_resize_listener();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const dateIncrementDay = date => {
    	date.setDate(date.getDate() + 1);
    };

    const dateDecrementDay = date => {
    	date.setDate(date.getDate() - 1);
    };

    const dateIncrementMonth = date => {
    	date.setMonth(date.getMonth() + 1, 1);
    };

    const dateDecrementMonth = date => {
    	date.setMonth(date.getMonth() - 1, 1);
    };

    const dateIsNextMonth = (year1, month1, year2, month2) => {
    	if (month1 === 12) {
    		let yearDiff = year2 - year1;

    		if (yearDiff === 1 && month2 === 1) {
    			return true;
    		}

    		return false;
    	}

    	let monthDiff = month2 - month1;

    	if (year1 === year2 && monthDiff === 1) {
    		return true;
    	}

    	return false;
    };

    const dateIsPreviousMonth = (year1, month1, year2, month2) => {
    	if (month1 === 1) {
    		let yearDiff = year2 - year1;

    		if (yearDiff === -1 && month2 === 12) {
    			return true;
    		}

    		return false;
    	}

    	let monthDiff = month2 - month1;

    	if (year1 === year2 && monthDiff === -1) {
    		return true;
    	}

    	return false;
    };

    function instance$5($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Month', slots, []);
    	let { month = 1 } = $$props;
    	let { year = 1970 } = $$props;
    	let { firstDayOrder = 1 } = $$props;
    	let { value = 0 } = $$props;
    	let { unixValue = false } = $$props;
    	const dispatch = createEventDispatcher();
    	let days = [];
    	let dayHeaders = [];

    	// Ensure numbers;
    	month = month - 0;

    	year = year - 0;
    	firstDayOrder = firstDayOrder - 0;

    	let { i18n = {
    		monthsToDisplay: [
    			"January",
    			"February",
    			"March",
    			"April",
    			"May",
    			"June",
    			"July",
    			"August",
    			"September",
    			"October",
    			"November",
    			"December"
    		],
    		weekdays: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
    	} } = $$props;

    	const currentDate = new Date(1970, 0, 1);

    	const getDate = () => {
    		return currentDate;
    	};

    	const setDate = (year, month, day = 1) => {
    		currentDate.setYear(year);
    		currentDate.setMonth(month - 1, day);
    	};

    	// Set on last day of month.
    	setDate(year, month + 1, 0);

    	const dayClicked = date => {
    		if (typeof date !== 'undefined') {
    			if (unixValue) {
    				$$invalidate(8, value = date);
    				dispatch('day-click', date);
    			} else {
    				$$invalidate(8, value = Math.round(date.get / 1000));
    				dispatch('day-click', date);
    			}
    		}
    	};

    	const fillDayHeaders = () => {
    		let orderIndex = firstDayOrder;
    		$$invalidate(2, dayHeaders = []);

    		for (let i = 0; i < 7; i++) {
    			let weekDayIndex = (orderIndex + i) % 7;

    			dayHeaders.push({
    				index: orderIndex,
    				name: i18n.weekdays[weekDayIndex]
    			});
    		}

    		$$invalidate(2, dayHeaders = [...dayHeaders]);
    	};

    	const fillDays = () => {
    		const numDays = getDate().getDate();
    		let monthDays = [];

    		// Get first date day index; 0 == Sunday.
    		const firstMonthDay = new Date(year, getDate().getMonth(), 1);

    		for (let i = 1; i <= numDays; i++) {
    			let dayDate = new Date(getDate().getFullYear(), getDate().getMonth(), i);
    			let isHoliday = false;

    			if (dayDate.getDay() === 0 || dayDate.getDay() === 6) {
    				// Saturday or sunday
    				isHoliday = true;
    			}

    			monthDays.push({
    				day: dayDate.getDate(),
    				month: dayDate.getMonth() + 1,
    				year: dayDate.getFullYear(),
    				weekday: dayDate.getDay(),
    				inactive: false,
    				holiday: isHoliday
    			});
    		}

    		let orderDiff = firstMonthDay.getDay() - firstDayOrder;

    		if (orderDiff < 0) {
    			orderDiff = orderDiff + 7;
    		}

    		for (let i = orderDiff; i > 0; i--) {
    			dateDecrementDay(firstMonthDay);

    			monthDays = [
    				{
    					day: firstMonthDay.getDate(),
    					month: firstMonthDay.getMonth() + 1,
    					year: firstMonthDay.getFullYear(),
    					weekday: firstMonthDay.getDay(),
    					inactive: true,
    					holiday: false
    				},
    				...monthDays
    			];
    		}

    		let nextMonthDiff = 7 - monthDays.length % 7;

    		if (nextMonthDiff === 7) {
    			nextMonthDiff = 0;
    		}

    		firstMonthDay.setFullYear(year);
    		firstMonthDay.setMonth(getDate().getMonth(), 1);
    		dateIncrementMonth(firstMonthDay);

    		for (let i = 0; i < nextMonthDiff; i++) {
    			monthDays.push({
    				day: firstMonthDay.getDate() + i,
    				month: firstMonthDay.getMonth() + 1,
    				year: firstMonthDay.getFullYear(),
    				weekday: firstMonthDay.getDay(),
    				inactive: true,
    				holiday: false
    			});
    		}

    		$$invalidate(1, days = monthDays);
    	};

    	fillDayHeaders();
    	fillDays();
    	let clientWidth = 0;

    	onMount(() => {
    		
    	}); // clientWidth = 

    	const writable_props = ['month', 'year', 'firstDayOrder', 'value', 'unixValue', 'i18n'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Month> was created with unknown prop '${key}'`);
    	});

    	const day_click_handler = e => dayClicked(e.detail);

    	function div2_elementresize_handler() {
    		clientWidth = this.clientWidth;
    		$$invalidate(3, clientWidth);
    	}

    	$$self.$$set = $$props => {
    		if ('month' in $$props) $$invalidate(5, month = $$props.month);
    		if ('year' in $$props) $$invalidate(6, year = $$props.year);
    		if ('firstDayOrder' in $$props) $$invalidate(7, firstDayOrder = $$props.firstDayOrder);
    		if ('value' in $$props) $$invalidate(8, value = $$props.value);
    		if ('unixValue' in $$props) $$invalidate(0, unixValue = $$props.unixValue);
    		if ('i18n' in $$props) $$invalidate(9, i18n = $$props.i18n);
    	};

    	$$self.$capture_state = () => ({
    		dateIncrementDay,
    		dateDecrementDay,
    		dateIncrementMonth,
    		dateDecrementMonth,
    		dateIsNextMonth,
    		dateIsPreviousMonth,
    		Day,
    		createEventDispatcher,
    		onMount,
    		month,
    		year,
    		firstDayOrder,
    		value,
    		unixValue,
    		dispatch,
    		days,
    		dayHeaders,
    		i18n,
    		currentDate,
    		getDate,
    		setDate,
    		dayClicked,
    		fillDayHeaders,
    		fillDays,
    		clientWidth
    	});

    	$$self.$inject_state = $$props => {
    		if ('month' in $$props) $$invalidate(5, month = $$props.month);
    		if ('year' in $$props) $$invalidate(6, year = $$props.year);
    		if ('firstDayOrder' in $$props) $$invalidate(7, firstDayOrder = $$props.firstDayOrder);
    		if ('value' in $$props) $$invalidate(8, value = $$props.value);
    		if ('unixValue' in $$props) $$invalidate(0, unixValue = $$props.unixValue);
    		if ('days' in $$props) $$invalidate(1, days = $$props.days);
    		if ('dayHeaders' in $$props) $$invalidate(2, dayHeaders = $$props.dayHeaders);
    		if ('i18n' in $$props) $$invalidate(9, i18n = $$props.i18n);
    		if ('clientWidth' in $$props) $$invalidate(3, clientWidth = $$props.clientWidth);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		unixValue,
    		days,
    		dayHeaders,
    		clientWidth,
    		dayClicked,
    		month,
    		year,
    		firstDayOrder,
    		value,
    		i18n,
    		day_click_handler,
    		div2_elementresize_handler
    	];
    }

    class Month extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {
    			month: 5,
    			year: 6,
    			firstDayOrder: 7,
    			value: 8,
    			unixValue: 0,
    			i18n: 9
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Month",
    			options,
    			id: create_fragment$5.name
    		});
    	}

    	get month() {
    		throw new Error("<Month>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set month(value) {
    		throw new Error("<Month>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get year() {
    		throw new Error("<Month>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set year(value) {
    		throw new Error("<Month>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get firstDayOrder() {
    		throw new Error("<Month>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set firstDayOrder(value) {
    		throw new Error("<Month>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get value() {
    		throw new Error("<Month>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<Month>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get unixValue() {
    		throw new Error("<Month>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set unixValue(value) {
    		throw new Error("<Month>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get i18n() {
    		throw new Error("<Month>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set i18n(value) {
    		throw new Error("<Month>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/Select.svelte generated by Svelte v3.44.0 */
    const file$4 = "src/components/Select.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[25] = list[i];
    	return child_ctx;
    }

    // (145:4) {#if showOptions}
    function create_if_block$2(ctx) {
    	let div;
    	let each_value = /*optionsArr*/ ctx[5];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div, "class", "select-items svelte-1jmadi5");
    			add_location(div, file$4, 145, 4, 4275);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*optionsArr, selectedElement, optionSelect*/ 296) {
    				each_value = /*optionsArr*/ ctx[5];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(145:4) {#if showOptions}",
    		ctx
    	});

    	return block;
    }

    // (147:8) {#each optionsArr as option}
    function create_each_block$2(ctx) {
    	let div;
    	let t0_value = /*option*/ ctx[25].text + "";
    	let t0;
    	let t1;
    	let div_data_value_value;
    	let div_data_index_value;
    	let div_class_value;
    	let mounted;
    	let dispose;

    	function click_handler_1(...args) {
    		return /*click_handler_1*/ ctx[15](/*option*/ ctx[25], ...args);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			t0 = text(t0_value);
    			t1 = space();
    			attr_dev(div, "data-value", div_data_value_value = /*option*/ ctx[25].value);
    			attr_dev(div, "data-index", div_data_index_value = /*option*/ ctx[25].index);

    			attr_dev(div, "class", div_class_value = "" + (null_to_empty(/*option*/ ctx[25].index === /*selectedElement*/ ctx[3].dataset.index
    			? "same-as-selected selected"
    			: "") + " svelte-1jmadi5"));

    			add_location(div, file$4, 147, 8, 4347);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t0);
    			append_dev(div, t1);

    			if (!mounted) {
    				dispose = listen_dev(div, "click", prevent_default(click_handler_1), false, true, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*optionsArr*/ 32 && t0_value !== (t0_value = /*option*/ ctx[25].text + "")) set_data_dev(t0, t0_value);

    			if (dirty & /*optionsArr*/ 32 && div_data_value_value !== (div_data_value_value = /*option*/ ctx[25].value)) {
    				attr_dev(div, "data-value", div_data_value_value);
    			}

    			if (dirty & /*optionsArr*/ 32 && div_data_index_value !== (div_data_index_value = /*option*/ ctx[25].index)) {
    				attr_dev(div, "data-index", div_data_index_value);
    			}

    			if (dirty & /*optionsArr, selectedElement*/ 40 && div_class_value !== (div_class_value = "" + (null_to_empty(/*option*/ ctx[25].index === /*selectedElement*/ ctx[3].dataset.index
    			? "same-as-selected selected"
    			: "") + " svelte-1jmadi5"))) {
    				attr_dev(div, "class", div_class_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(147:8) {#each optionsArr as option}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let div1;
    	let select;
    	let t0;
    	let div0;
    	let t1_value = /*selectedOption*/ ctx[4].text + "";
    	let t1;
    	let div0_style_value;
    	let t2;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[10].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[9], null);
    	let if_block = /*showOptions*/ ctx[6] && create_if_block$2(ctx);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			select = element("select");
    			if (default_slot) default_slot.c();
    			t0 = space();
    			div0 = element("div");
    			t1 = text(t1_value);
    			t2 = space();
    			if (if_block) if_block.c();
    			set_style(select, "display", "none");
    			attr_dev(select, "class", "svelte-1jmadi5");
    			if (/*value*/ ctx[0] === void 0) add_render_callback(() => /*select_change_handler*/ ctx[11].call(select));
    			add_location(select, file$4, 135, 4, 3918);
    			attr_dev(div0, "class", "select-selected svelte-1jmadi5");
    			attr_dev(div0, "style", div0_style_value = /*showOptions*/ ctx[6] ? "visibility:hidden;" : "");
    			add_location(div0, file$4, 138, 4, 4028);
    			attr_dev(div1, "class", "select-container svelte-1jmadi5");
    			add_location(div1, file$4, 134, 0, 3861);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, select);

    			if (default_slot) {
    				default_slot.m(select, null);
    			}

    			select_option(select, /*value*/ ctx[0]);
    			/*select_binding*/ ctx[12](select);
    			append_dev(div1, t0);
    			append_dev(div1, div0);
    			append_dev(div0, t1);
    			/*div0_binding*/ ctx[13](div0);
    			append_dev(div1, t2);
    			if (if_block) if_block.m(div1, null);
    			/*div1_binding*/ ctx[16](div1);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(select, "change", /*select_change_handler*/ ctx[11]),
    					listen_dev(div0, "click", prevent_default(/*click_handler*/ ctx[14]), false, true, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 512)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[9],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[9])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[9], dirty, null),
    						null
    					);
    				}
    			}

    			if (dirty & /*value*/ 1) {
    				select_option(select, /*value*/ ctx[0]);
    			}

    			if ((!current || dirty & /*selectedOption*/ 16) && t1_value !== (t1_value = /*selectedOption*/ ctx[4].text + "")) set_data_dev(t1, t1_value);

    			if (!current || dirty & /*showOptions*/ 64 && div0_style_value !== (div0_style_value = /*showOptions*/ ctx[6] ? "visibility:hidden;" : "")) {
    				attr_dev(div0, "style", div0_style_value);
    			}

    			if (/*showOptions*/ ctx[6]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$2(ctx);
    					if_block.c();
    					if_block.m(div1, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if (default_slot) default_slot.d(detaching);
    			/*select_binding*/ ctx[12](null);
    			/*div0_binding*/ ctx[13](null);
    			if (if_block) if_block.d();
    			/*div1_binding*/ ctx[16](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Select', slots, ['default']);
    	let { value = 0 } = $$props;
    	let selectedText = "";
    	let selectedIndex = -1;
    	let container;
    	let selectElement;
    	let selectedElement;

    	let selectedOption = {
    		text: " ",
    		index: -1,
    		value: 0,
    		selected: true
    	};

    	let optionsArr = [];
    	const dispatch = createEventDispatcher();
    	let showOptions = false;

    	const showAllSelect = () => {
    		$$invalidate(6, showOptions = true);
    	};

    	const closeAllSelect = e => {
    		e.stopPropagation();
    		$$invalidate(6, showOptions = false);
    		setCloseListener(false);
    	};

    	const setCloseListener = (active = true) => {
    		if (active) {
    			document.addEventListener("click", closeAllSelect);
    		} else {
    			document.removeEventListener("click", closeAllSelect);
    		}
    	};

    	const selectClick = e => {
    		e.stopPropagation();
    		$$invalidate(6, showOptions = showOptions ^ true);
    		selectedElement.classList.toggle("select-arrow-active");
    		setCloseListener(true);
    	};

    	const optionSelect = (e, { text, value, index }) => {
    		e.stopPropagation();
    		(selectedElement.innerHTML, selectedText = text);
    		$$invalidate(3, selectedElement.dataset.value = value, selectedElement);
    		$$invalidate(3, selectedElement.dataset.index = index, selectedElement);
    		$$invalidate(2, selectElement.selectedIndex = index, selectElement);
    		setSelectedOption(value);
    		closeAllSelect(e);
    		dispatch("change", value);
    	};

    	const setSelectedOption = value => {
    		let foundSelected = false;

    		for (let i = 0; i < optionsArr.length; i++) {
    			if (optionsArr[i].value == value) {
    				$$invalidate(5, optionsArr[i].selected = true, optionsArr);
    				$$invalidate(4, selectedOption = optionsArr[i]);
    				foundSelected = true;
    			} else {
    				$$invalidate(5, optionsArr[i].selected = false, optionsArr);
    			}
    		}

    		if (!foundSelected && optionsArr.length > 0) {
    			$$invalidate(4, selectedOption = optionsArr[0]);
    		}

    		$$invalidate(5, optionsArr);
    	};

    	const setOptionsArray = () => {
    		let selectElementLength = selectElement.length;
    		$$invalidate(5, optionsArr = []);

    		for (let i = 0; i < selectElementLength; i++) {
    			let optionElementValue = selectElement.options[i].value;
    			let selected = false;

    			if (optionElementValue === value) {
    				selected = true;
    			}

    			let optionElementText = selectElement.options[i].innerHTML;

    			$$invalidate(5, optionsArr = [
    				...optionsArr,
    				{
    					text: optionElementText,
    					value: optionElementValue,
    					index: i,
    					selected
    				}
    			]);
    		}

    		setSelectedOption(value);
    	};

    	onMount(() => {
    		if (selectElement.selectedIndex < 0) {
    			$$invalidate(2, selectElement.selectedIndex = 0, selectElement);
    		}

    		setOptionsArray();
    	});

    	const writable_props = ['value'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Select> was created with unknown prop '${key}'`);
    	});

    	function select_change_handler() {
    		value = select_value(this);
    		$$invalidate(0, value);
    	}

    	function select_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			selectElement = $$value;
    			$$invalidate(2, selectElement);
    		});
    	}

    	function div0_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			selectedElement = $$value;
    			$$invalidate(3, selectedElement);
    		});
    	}

    	const click_handler = e => selectClick(e);
    	const click_handler_1 = (option, e) => optionSelect(e, option);

    	function div1_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			container = $$value;
    			$$invalidate(1, container);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ('value' in $$props) $$invalidate(0, value = $$props.value);
    		if ('$$scope' in $$props) $$invalidate(9, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		onMount,
    		value,
    		selectedText,
    		selectedIndex,
    		container,
    		selectElement,
    		selectedElement,
    		selectedOption,
    		optionsArr,
    		dispatch,
    		showOptions,
    		showAllSelect,
    		closeAllSelect,
    		setCloseListener,
    		selectClick,
    		optionSelect,
    		setSelectedOption,
    		setOptionsArray
    	});

    	$$self.$inject_state = $$props => {
    		if ('value' in $$props) $$invalidate(0, value = $$props.value);
    		if ('selectedText' in $$props) selectedText = $$props.selectedText;
    		if ('selectedIndex' in $$props) selectedIndex = $$props.selectedIndex;
    		if ('container' in $$props) $$invalidate(1, container = $$props.container);
    		if ('selectElement' in $$props) $$invalidate(2, selectElement = $$props.selectElement);
    		if ('selectedElement' in $$props) $$invalidate(3, selectedElement = $$props.selectedElement);
    		if ('selectedOption' in $$props) $$invalidate(4, selectedOption = $$props.selectedOption);
    		if ('optionsArr' in $$props) $$invalidate(5, optionsArr = $$props.optionsArr);
    		if ('showOptions' in $$props) $$invalidate(6, showOptions = $$props.showOptions);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		value,
    		container,
    		selectElement,
    		selectedElement,
    		selectedOption,
    		optionsArr,
    		showOptions,
    		selectClick,
    		optionSelect,
    		$$scope,
    		slots,
    		select_change_handler,
    		select_binding,
    		div0_binding,
    		click_handler,
    		click_handler_1,
    		div1_binding
    	];
    }

    class Select extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, { value: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Select",
    			options,
    			id: create_fragment$4.name
    		});
    	}

    	get value() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/SelectNumber.svelte generated by Svelte v3.44.0 */
    const file$3 = "src/components/SelectNumber.svelte";

    // (169:4) {#if showOptions}
    function create_if_block_2(ctx) {
    	let div;
    	let span;
    	let div_style_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			span = element("span");
    			attr_dev(span, "class", "triangle tr-up tr-inc-dec-trigger svelte-x97pym");
    			add_location(span, file$3, 173, 8, 4249);
    			attr_dev(div, "class", "increment tr-inc-dec-trigger svelte-x97pym");
    			attr_dev(div, "style", div_style_value = !/*showOptions*/ ctx[1] ? "visibility:hidden;" : "");
    			add_location(div, file$3, 169, 4, 4074);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, span);

    			if (!mounted) {
    				dispose = listen_dev(div, "click", prevent_default(/*click_handler*/ ctx[6]), false, true, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*showOptions*/ 2 && div_style_value !== (div_style_value = !/*showOptions*/ ctx[1] ? "visibility:hidden;" : "")) {
    				attr_dev(div, "style", div_style_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(169:4) {#if showOptions}",
    		ctx
    	});

    	return block;
    }

    // (183:8) {:else}
    function create_else_block(ctx) {
    	let p;
    	let t;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t = text(/*value*/ ctx[0]);
    			attr_dev(p, "class", "svelte-x97pym");
    			add_location(p, file$3, 183, 8, 4595);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*value*/ 1) set_data_dev(t, /*value*/ ctx[0]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(183:8) {:else}",
    		ctx
    	});

    	return block;
    }

    // (179:8) {#if showOptions}
    function create_if_block_1(ctx) {
    	let input;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			input = element("input");
    			attr_dev(input, "class", "number svelte-x97pym");
    			attr_dev(input, "type", "number");
    			add_location(input, file$3, 179, 8, 4445);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, input, anchor);
    			set_input_value(input, /*value*/ ctx[0]);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "input", /*input_input_handler*/ ctx[7]),
    					listen_dev(input, "change", prevent_default(/*change_handler*/ ctx[8]), false, true, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*value*/ 1 && to_number(input.value) !== /*value*/ ctx[0]) {
    				set_input_value(input, /*value*/ ctx[0]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(179:8) {#if showOptions}",
    		ctx
    	});

    	return block;
    }

    // (187:4) {#if showOptions}
    function create_if_block$1(ctx) {
    	let div;
    	let span;
    	let div_style_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			span = element("span");
    			attr_dev(span, "class", "triangle tr-down tr-inc-dec-trigger svelte-x97pym");
    			add_location(span, file$3, 191, 8, 4836);
    			attr_dev(div, "class", "decrement tr-inc-dec-trigger svelte-x97pym");
    			attr_dev(div, "style", div_style_value = !/*showOptions*/ ctx[1] ? "visibility:hidden;" : "");
    			add_location(div, file$3, 187, 4, 4661);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, span);

    			if (!mounted) {
    				dispose = listen_dev(div, "click", prevent_default(/*click_handler_2*/ ctx[10]), false, true, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*showOptions*/ 2 && div_style_value !== (div_style_value = !/*showOptions*/ ctx[1] ? "visibility:hidden;" : "")) {
    				attr_dev(div, "style", div_style_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(187:4) {#if showOptions}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let div1;
    	let t0;
    	let div0;
    	let t1;
    	let mounted;
    	let dispose;
    	let if_block0 = /*showOptions*/ ctx[1] && create_if_block_2(ctx);

    	function select_block_type(ctx, dirty) {
    		if (/*showOptions*/ ctx[1]) return create_if_block_1;
    		return create_else_block;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block1 = current_block_type(ctx);
    	let if_block2 = /*showOptions*/ ctx[1] && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			if (if_block0) if_block0.c();
    			t0 = space();
    			div0 = element("div");
    			if_block1.c();
    			t1 = space();
    			if (if_block2) if_block2.c();
    			attr_dev(div0, "class", "selected svelte-x97pym");
    			add_location(div0, file$3, 176, 4, 4330);
    			attr_dev(div1, "class", "select-number-container svelte-x97pym");
    			add_location(div1, file$3, 167, 0, 4010);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			if (if_block0) if_block0.m(div1, null);
    			append_dev(div1, t0);
    			append_dev(div1, div0);
    			if_block1.m(div0, null);
    			append_dev(div1, t1);
    			if (if_block2) if_block2.m(div1, null);

    			if (!mounted) {
    				dispose = listen_dev(div0, "click", prevent_default(/*click_handler_1*/ ctx[9]), false, true, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*showOptions*/ ctx[1]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_2(ctx);
    					if_block0.c();
    					if_block0.m(div1, t0);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block1) {
    				if_block1.p(ctx, dirty);
    			} else {
    				if_block1.d(1);
    				if_block1 = current_block_type(ctx);

    				if (if_block1) {
    					if_block1.c();
    					if_block1.m(div0, null);
    				}
    			}

    			if (/*showOptions*/ ctx[1]) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);
    				} else {
    					if_block2 = create_if_block$1(ctx);
    					if_block2.c();
    					if_block2.m(div1, null);
    				}
    			} else if (if_block2) {
    				if_block2.d(1);
    				if_block2 = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if (if_block0) if_block0.d();
    			if_block1.d();
    			if (if_block2) if_block2.d();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('SelectNumber', slots, []);
    	let { value = 2000 } = $$props;
    	const dispatch = createEventDispatcher();
    	let { showOptions = false } = $$props;

    	const incrementValue = () => {
    		$$invalidate(0, value = value + 1);
    		emitChange();
    	};

    	const decrementValue = () => {
    		$$invalidate(0, value = value - 1);
    		emitChange();
    	};

    	const emitChange = e => {
    		dispatch("change", value);
    		$$invalidate(1, showOptions = true);
    	};

    	const showAllSelect = e => {
    		e.stopPropagation();
    		setCloseListener(true);
    		$$invalidate(1, showOptions = true);
    	};

    	const closeAllSelect = e => {
    		e.stopPropagation();

    		if (e.target.classList.contains("tr-inc-dec-trigger")) {
    			return;
    		}

    		// let closest = e.target.closest("div[data-calendartarget='calendar']");
    		// if(closest !== null) {
    		//     return;
    		// }
    		$$invalidate(1, showOptions = false);

    		setCloseListener(false);
    	};

    	const setCloseListener = (active = true) => {
    		if (active) {
    			document.addEventListener("click", closeAllSelect);
    		} else {
    			document.removeEventListener("click", closeAllSelect);
    		}
    	};

    	if (showOptions) {
    		setCloseListener(true);
    	}

    	const writable_props = ['value', 'showOptions'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<SelectNumber> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => incrementValue();

    	function input_input_handler() {
    		value = to_number(this.value);
    		$$invalidate(0, value);
    	}

    	const change_handler = e => emitChange(e);
    	const click_handler_1 = e => showAllSelect(e);
    	const click_handler_2 = () => decrementValue();

    	$$self.$$set = $$props => {
    		if ('value' in $$props) $$invalidate(0, value = $$props.value);
    		if ('showOptions' in $$props) $$invalidate(1, showOptions = $$props.showOptions);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		value,
    		dispatch,
    		showOptions,
    		incrementValue,
    		decrementValue,
    		emitChange,
    		showAllSelect,
    		closeAllSelect,
    		setCloseListener
    	});

    	$$self.$inject_state = $$props => {
    		if ('value' in $$props) $$invalidate(0, value = $$props.value);
    		if ('showOptions' in $$props) $$invalidate(1, showOptions = $$props.showOptions);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		value,
    		showOptions,
    		incrementValue,
    		decrementValue,
    		emitChange,
    		showAllSelect,
    		click_handler,
    		input_input_handler,
    		change_handler,
    		click_handler_1,
    		click_handler_2
    	];
    }

    class SelectNumber extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, { value: 0, showOptions: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SelectNumber",
    			options,
    			id: create_fragment$3.name
    		});
    	}

    	get value() {
    		throw new Error("<SelectNumber>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<SelectNumber>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get showOptions() {
    		throw new Error("<SelectNumber>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set showOptions(value) {
    		throw new Error("<SelectNumber>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/views/MonthView.svelte generated by Svelte v3.44.0 */
    const file$2 = "src/views/MonthView.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[25] = list[i];
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[28] = list[i];
    	child_ctx[30] = i;
    	return child_ctx;
    }

    // (172:4) {#if aMonth.status&STATUS_ACTIVE}
    function create_if_block(ctx) {
    	let div2;
    	let span0;
    	let div0;
    	let t0;
    	let span1;
    	let select;
    	let t1;
    	let span2;
    	let selectnumber;
    	let t2;
    	let span3;
    	let div1;
    	let t3;
    	let div4;
    	let div3;
    	let month_1;
    	let updating_value;
    	let t4;
    	let div4_resize_listener;
    	let current;
    	let mounted;
    	let dispose;

    	select = new Select({
    			props: {
    				value: /*aMonth*/ ctx[25].month,
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	select.$on("change", /*change_handler*/ ctx[15]);

    	selectnumber = new SelectNumber({
    			props: {
    				showOptions: /*showYearSelector*/ ctx[6],
    				value: /*aMonth*/ ctx[25].year
    			},
    			$$inline: true
    		});

    	selectnumber.$on("change", /*change_handler_1*/ ctx[16]);

    	function month_1_value_binding(value) {
    		/*month_1_value_binding*/ ctx[18](value);
    	}

    	let month_1_props = {
    		year: /*aMonth*/ ctx[25].year,
    		month: /*aMonth*/ ctx[25].month,
    		firstDayOrder: /*firstDayOrder*/ ctx[1],
    		unixValue: /*unixValue*/ ctx[3],
    		i18n: /*i18n*/ ctx[2]
    	};

    	if (/*value*/ ctx[0] !== void 0) {
    		month_1_props.value = /*value*/ ctx[0];
    	}

    	month_1 = new Month({ props: month_1_props, $$inline: true });
    	binding_callbacks.push(() => bind(month_1, 'value', month_1_value_binding));
    	month_1.$on("day-click", /*day_click_handler*/ ctx[19]);

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			span0 = element("span");
    			div0 = element("div");
    			t0 = space();
    			span1 = element("span");
    			create_component(select.$$.fragment);
    			t1 = space();
    			span2 = element("span");
    			create_component(selectnumber.$$.fragment);
    			t2 = space();
    			span3 = element("span");
    			div1 = element("div");
    			t3 = space();
    			div4 = element("div");
    			div3 = element("div");
    			create_component(month_1.$$.fragment);
    			t4 = space();
    			attr_dev(div0, "class", "triangle tr-left svelte-z9locf");
    			add_location(div0, file$2, 173, 14, 4423);
    			attr_dev(span0, "class", "svelte-z9locf");
    			add_location(span0, file$2, 173, 8, 4417);
    			attr_dev(span1, "class", "svelte-z9locf");
    			add_location(span1, file$2, 175, 8, 4514);
    			attr_dev(span2, "class", "svelte-z9locf");
    			add_location(span2, file$2, 184, 8, 4829);
    			attr_dev(div1, "class", "triangle tr-right svelte-z9locf");
    			add_location(div1, file$2, 190, 14, 5031);
    			attr_dev(span3, "class", "svelte-z9locf");
    			add_location(span3, file$2, 190, 8, 5025);
    			attr_dev(div2, "class", "description svelte-z9locf");
    			add_location(div2, file$2, 172, 4, 4383);
    			add_location(div3, file$2, 194, 8, 5191);
    			attr_dev(div4, "class", "months svelte-z9locf");
    			add_render_callback(() => /*div4_elementresize_handler*/ ctx[20].call(div4));
    			add_location(div4, file$2, 193, 4, 5131);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, span0);
    			append_dev(span0, div0);
    			append_dev(div2, t0);
    			append_dev(div2, span1);
    			mount_component(select, span1, null);
    			append_dev(div2, t1);
    			append_dev(div2, span2);
    			mount_component(selectnumber, span2, null);
    			append_dev(div2, t2);
    			append_dev(div2, span3);
    			append_dev(span3, div1);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, div4, anchor);
    			append_dev(div4, div3);
    			mount_component(month_1, div3, null);
    			append_dev(div4, t4);
    			div4_resize_listener = add_resize_listener(div4, /*div4_elementresize_handler*/ ctx[20].bind(div4));
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(div0, "click", /*click_handler*/ ctx[14], false, false, false),
    					listen_dev(div1, "click", /*click_handler_1*/ ctx[17], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			const select_changes = {};
    			if (dirty[0] & /*monthsArr*/ 32) select_changes.value = /*aMonth*/ ctx[25].month;

    			if (dirty[0] & /*i18n*/ 4 | dirty[1] & /*$$scope*/ 1) {
    				select_changes.$$scope = { dirty, ctx };
    			}

    			select.$set(select_changes);
    			const selectnumber_changes = {};
    			if (dirty[0] & /*showYearSelector*/ 64) selectnumber_changes.showOptions = /*showYearSelector*/ ctx[6];
    			if (dirty[0] & /*monthsArr*/ 32) selectnumber_changes.value = /*aMonth*/ ctx[25].year;
    			selectnumber.$set(selectnumber_changes);
    			const month_1_changes = {};
    			if (dirty[0] & /*monthsArr*/ 32) month_1_changes.year = /*aMonth*/ ctx[25].year;
    			if (dirty[0] & /*monthsArr*/ 32) month_1_changes.month = /*aMonth*/ ctx[25].month;
    			if (dirty[0] & /*firstDayOrder*/ 2) month_1_changes.firstDayOrder = /*firstDayOrder*/ ctx[1];
    			if (dirty[0] & /*unixValue*/ 8) month_1_changes.unixValue = /*unixValue*/ ctx[3];
    			if (dirty[0] & /*i18n*/ 4) month_1_changes.i18n = /*i18n*/ ctx[2];

    			if (!updating_value && dirty[0] & /*value*/ 1) {
    				updating_value = true;
    				month_1_changes.value = /*value*/ ctx[0];
    				add_flush_callback(() => updating_value = false);
    			}

    			month_1.$set(month_1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(select.$$.fragment, local);
    			transition_in(selectnumber.$$.fragment, local);
    			transition_in(month_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(select.$$.fragment, local);
    			transition_out(selectnumber.$$.fragment, local);
    			transition_out(month_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			destroy_component(select);
    			destroy_component(selectnumber);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(div4);
    			destroy_component(month_1);
    			div4_resize_listener();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(172:4) {#if aMonth.status&STATUS_ACTIVE}",
    		ctx
    	});

    	return block;
    }

    // (180:16) {#each i18n.monthsToDisplay as monthOption, index}
    function create_each_block_1(ctx) {
    	let option;
    	let t_value = /*monthOption*/ ctx[28] + "";
    	let t;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t = text(t_value);
    			option.__value = /*index*/ ctx[30] + 1;
    			option.value = option.__value;
    			add_location(option, file$2, 180, 16, 4712);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*i18n*/ 4 && t_value !== (t_value = /*monthOption*/ ctx[28] + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(180:16) {#each i18n.monthsToDisplay as monthOption, index}",
    		ctx
    	});

    	return block;
    }

    // (177:12) <Select                 value={aMonth.month}                 on:change={(e) => monthChange(e)}>
    function create_default_slot(ctx) {
    	let each_1_anchor;
    	let each_value_1 = /*i18n*/ ctx[2].monthsToDisplay;
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*i18n*/ 4) {
    				each_value_1 = /*i18n*/ ctx[2].monthsToDisplay;
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_1.length;
    			}
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(177:12) <Select                 value={aMonth.month}                 on:change={(e) => monthChange(e)}>",
    		ctx
    	});

    	return block;
    }

    // (171:4) {#each monthsArr as aMonth}
    function create_each_block$1(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*aMonth*/ ctx[25].status & STATUS_ACTIVE && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (/*aMonth*/ ctx[25].status & STATUS_ACTIVE) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty[0] & /*monthsArr*/ 32) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(171:4) {#each monthsArr as aMonth}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let div;
    	let current;
    	let each_value = /*monthsArr*/ ctx[5];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div, "class", "container");
    			add_location(div, file$2, 169, 0, 4285);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*clientWidth, monthsArr, firstDayOrder, unixValue, i18n, value, dayClicked, navRight, showYearSelector, yearChange, monthChange, navLeft*/ 4095) {
    				each_value = /*monthsArr*/ ctx[5];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const STATUS_LEFT = 0b00000100;
    const STATUS_ACTIVE = 0b00000010;
    const STATUS_RIGHT = 0b00000001;

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('MonthView', slots, []);
    	const dispatch = createEventDispatcher();
    	let { year = 0 } = $$props;
    	let { month = 0 } = $$props;
    	let { firstDayOrder = 1 } = $$props;
    	let { value = 0 } = $$props;

    	let { i18n = {
    		monthsToDisplay: [
    			"January",
    			"February",
    			"March",
    			"April",
    			"May",
    			"June",
    			"July",
    			"August",
    			"September",
    			"October",
    			"November",
    			"December"
    		],
    		weekdays: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
    	} } = $$props;

    	let { unixValue = false } = $$props;

    	if (year === 0 || month === 0) {
    		let currentDate = new Date();

    		if (year === 0) {
    			year = currentDate.getFullYear();
    		}

    		if (month === 0) {
    			month = currentDate.getMonth() + 1;
    		}
    	}

    	let navigation = STATUS_ACTIVE;
    	let clientWidth;
    	let monthsArr = [];
    	let dateActive;

    	const setActive = (year, month) => {
    		let index = -1;
    		month = parseInt(month);

    		for (let i = 0; i < monthsArr.length; i++) {
    			$$invalidate(5, monthsArr[i].status = 0, monthsArr);

    			if (monthsArr[i].year == year && monthsArr[i].month == month) {
    				$$invalidate(5, monthsArr[i].status = STATUS_ACTIVE, monthsArr);
    				index = i;
    				dateActive = monthsArr[i];
    			} else {
    				$$invalidate(5, monthsArr[i].status = 0, monthsArr);
    			}
    		}

    		if (index < 0) {
    			dateActive = { year, month, status: STATUS_ACTIVE };
    			monthsArr.push(dateActive);
    		}

    		$$invalidate(5, monthsArr = [...monthsArr]);
    	};

    	setActive(year, month);

    	const navLeft = () => {
    		let newYear = dateActive.year;
    		let newMonth = dateActive.month - 1;

    		if (newMonth < 1) {
    			newYear = newYear - 1;
    			newMonth = 12;
    		}

    		setActive(newYear, newMonth);
    		let navToggle = navigation & 0b10000000;
    		navigation = STATUS_LEFT | navToggle ^ 0b10000000;
    	};

    	const navRight = () => {
    		let newYear = dateActive.year;
    		let newMonth = dateActive.month + 1;

    		if (newMonth > 12) {
    			newYear = newYear + 1;
    			newMonth = 1;
    		}

    		setActive(newYear, newMonth);
    		let navToggle = navigation & 0b10000000;
    		navigation = STATUS_RIGHT | navToggle ^ 0b10000000;
    		navigation = navigation;
    	};

    	let showYearSelector = false;

    	const monthChange = e => {
    		let m = parseInt(e.detail);
    		let y = dateActive.year;

    		if (m === 0) {
    			m = dateActive.month;
    		}

    		$$invalidate(6, showYearSelector = false);
    		setActive(y, m);
    	};

    	const yearChange = event => {
    		if (event) {
    			let y = parseInt(event.detail);
    			let m = dateActive.month;

    			if (y === 0) {
    				y = dateActive.year;
    			}

    			setActive(y, m);
    		}

    		$$invalidate(5, monthsArr = [...monthsArr]);
    		$$invalidate(6, showYearSelector = true);
    	};

    	const dayClicked = e => {
    		dispatch("day-click", e.detail);
    	};

    	const writable_props = ['year', 'month', 'firstDayOrder', 'value', 'i18n', 'unixValue'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<MonthView> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => navLeft();
    	const change_handler = e => monthChange(e);
    	const change_handler_1 = e => yearChange(e);
    	const click_handler_1 = () => navRight();

    	function month_1_value_binding(value$1) {
    		value = value$1;
    		$$invalidate(0, value);
    	}

    	const day_click_handler = e => dayClicked(e);

    	function div4_elementresize_handler() {
    		clientWidth = this.clientWidth;
    		$$invalidate(4, clientWidth);
    	}

    	$$self.$$set = $$props => {
    		if ('year' in $$props) $$invalidate(12, year = $$props.year);
    		if ('month' in $$props) $$invalidate(13, month = $$props.month);
    		if ('firstDayOrder' in $$props) $$invalidate(1, firstDayOrder = $$props.firstDayOrder);
    		if ('value' in $$props) $$invalidate(0, value = $$props.value);
    		if ('i18n' in $$props) $$invalidate(2, i18n = $$props.i18n);
    		if ('unixValue' in $$props) $$invalidate(3, unixValue = $$props.unixValue);
    	};

    	$$self.$capture_state = () => ({
    		Month,
    		Select,
    		SelectNumber,
    		createEventDispatcher,
    		STATUS_LEFT,
    		STATUS_ACTIVE,
    		STATUS_RIGHT,
    		dispatch,
    		year,
    		month,
    		firstDayOrder,
    		value,
    		i18n,
    		unixValue,
    		navigation,
    		clientWidth,
    		monthsArr,
    		dateActive,
    		setActive,
    		navLeft,
    		navRight,
    		showYearSelector,
    		monthChange,
    		yearChange,
    		dayClicked
    	});

    	$$self.$inject_state = $$props => {
    		if ('year' in $$props) $$invalidate(12, year = $$props.year);
    		if ('month' in $$props) $$invalidate(13, month = $$props.month);
    		if ('firstDayOrder' in $$props) $$invalidate(1, firstDayOrder = $$props.firstDayOrder);
    		if ('value' in $$props) $$invalidate(0, value = $$props.value);
    		if ('i18n' in $$props) $$invalidate(2, i18n = $$props.i18n);
    		if ('unixValue' in $$props) $$invalidate(3, unixValue = $$props.unixValue);
    		if ('navigation' in $$props) navigation = $$props.navigation;
    		if ('clientWidth' in $$props) $$invalidate(4, clientWidth = $$props.clientWidth);
    		if ('monthsArr' in $$props) $$invalidate(5, monthsArr = $$props.monthsArr);
    		if ('dateActive' in $$props) dateActive = $$props.dateActive;
    		if ('showYearSelector' in $$props) $$invalidate(6, showYearSelector = $$props.showYearSelector);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		value,
    		firstDayOrder,
    		i18n,
    		unixValue,
    		clientWidth,
    		monthsArr,
    		showYearSelector,
    		navLeft,
    		navRight,
    		monthChange,
    		yearChange,
    		dayClicked,
    		year,
    		month,
    		click_handler,
    		change_handler,
    		change_handler_1,
    		click_handler_1,
    		month_1_value_binding,
    		day_click_handler,
    		div4_elementresize_handler
    	];
    }

    class MonthView extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(
    			this,
    			options,
    			instance$2,
    			create_fragment$2,
    			safe_not_equal,
    			{
    				year: 12,
    				month: 13,
    				firstDayOrder: 1,
    				value: 0,
    				i18n: 2,
    				unixValue: 3
    			},
    			null,
    			[-1, -1]
    		);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "MonthView",
    			options,
    			id: create_fragment$2.name
    		});
    	}

    	get year() {
    		throw new Error("<MonthView>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set year(value) {
    		throw new Error("<MonthView>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get month() {
    		throw new Error("<MonthView>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set month(value) {
    		throw new Error("<MonthView>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get firstDayOrder() {
    		throw new Error("<MonthView>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set firstDayOrder(value) {
    		throw new Error("<MonthView>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get value() {
    		throw new Error("<MonthView>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<MonthView>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get i18n() {
    		throw new Error("<MonthView>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set i18n(value) {
    		throw new Error("<MonthView>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get unixValue() {
    		throw new Error("<MonthView>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set unixValue(value) {
    		throw new Error("<MonthView>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/views/DayView.svelte generated by Svelte v3.44.0 */
    const file$1 = "src/views/DayView.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[7] = list[i];
    	return child_ctx;
    }

    // (59:8) {#each events as event}
    function create_each_block(ctx) {
    	let div;
    	let span;
    	let t0_value = /*event*/ ctx[7].name + "";
    	let t0;
    	let t1;

    	const block = {
    		c: function create() {
    			div = element("div");
    			span = element("span");
    			t0 = text(t0_value);
    			t1 = space();
    			add_location(span, file$1, 60, 12, 1327);
    			add_location(div, file$1, 59, 8, 1309);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, span);
    			append_dev(span, t0);
    			append_dev(div, t1);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*events*/ 1 && t0_value !== (t0_value = /*event*/ ctx[7].name + "")) set_data_dev(t0, t0_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(59:8) {#each events as event}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let div2;
    	let div0;
    	let span0;
    	let i0;
    	let t0;
    	let span1;
    	let t2;
    	let span2;
    	let i1;
    	let t3;
    	let div1;
    	let mounted;
    	let dispose;
    	let each_value = /*events*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			span0 = element("span");
    			i0 = element("i");
    			t0 = space();
    			span1 = element("span");
    			span1.textContent = `${/*date*/ ctx[2].toValue()}`;
    			t2 = space();
    			span2 = element("span");
    			i1 = element("i");
    			t3 = space();
    			div1 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(i0, "class", "arrow left svelte-7jn1p1");
    			add_location(i0, file$1, 53, 14, 1112);
    			attr_dev(span0, "class", "svelte-7jn1p1");
    			add_location(span0, file$1, 53, 8, 1106);
    			attr_dev(span1, "class", "svelte-7jn1p1");
    			add_location(span1, file$1, 54, 8, 1154);
    			attr_dev(i1, "class", "arrow right svelte-7jn1p1");
    			add_location(i1, file$1, 55, 14, 1198);
    			attr_dev(span2, "class", "svelte-7jn1p1");
    			add_location(span2, file$1, 55, 8, 1192);
    			attr_dev(div0, "class", "description svelte-7jn1p1");
    			add_location(div0, file$1, 52, 4, 1072);
    			attr_dev(div1, "class", "events");
    			add_location(div1, file$1, 57, 4, 1248);
    			add_location(div2, file$1, 51, 0, 1043);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div0, span0);
    			append_dev(span0, i0);
    			append_dev(div0, t0);
    			append_dev(div0, span1);
    			append_dev(div0, t2);
    			append_dev(div0, span2);
    			append_dev(span2, i1);
    			append_dev(div2, t3);
    			append_dev(div2, div1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div1, null);
    			}

    			if (!mounted) {
    				dispose = listen_dev(div2, "click", /*click*/ ctx[1](), false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*events*/ 1) {
    				each_value = /*events*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div1, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('DayView', slots, []);
    	let { events = [] } = $$props;
    	let { year = 1970 } = $$props;
    	let { month = 1 } = $$props;
    	let { day = 1 } = $$props;
    	const dispatch = createEventDispatcher();

    	const click = () => {
    		// console.log("Day.svelte: clicked", day, month, year);
    		dispatch('day-click', { day, month, year });
    	};

    	let date = new Date(year, month, day);
    	const writable_props = ['events', 'year', 'month', 'day'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<DayView> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('events' in $$props) $$invalidate(0, events = $$props.events);
    		if ('year' in $$props) $$invalidate(3, year = $$props.year);
    		if ('month' in $$props) $$invalidate(4, month = $$props.month);
    		if ('day' in $$props) $$invalidate(5, day = $$props.day);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		events,
    		year,
    		month,
    		day,
    		dispatch,
    		click,
    		date
    	});

    	$$self.$inject_state = $$props => {
    		if ('events' in $$props) $$invalidate(0, events = $$props.events);
    		if ('year' in $$props) $$invalidate(3, year = $$props.year);
    		if ('month' in $$props) $$invalidate(4, month = $$props.month);
    		if ('day' in $$props) $$invalidate(5, day = $$props.day);
    		if ('date' in $$props) $$invalidate(2, date = $$props.date);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [events, click, date, year, month, day];
    }

    class DayView extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { events: 0, year: 3, month: 4, day: 5 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "DayView",
    			options,
    			id: create_fragment$1.name
    		});
    	}

    	get events() {
    		throw new Error("<DayView>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set events(value) {
    		throw new Error("<DayView>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get year() {
    		throw new Error("<DayView>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set year(value) {
    		throw new Error("<DayView>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get month() {
    		throw new Error("<DayView>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set month(value) {
    		throw new Error("<DayView>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get day() {
    		throw new Error("<DayView>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set day(value) {
    		throw new Error("<DayView>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/views/Calendar.svelte generated by Svelte v3.44.0 */

    const { console: console_1 } = globals;
    const file = "src/views/Calendar.svelte";

    function create_fragment(ctx) {
    	let div;
    	let monthview;
    	let updating_year;
    	let updating_month;
    	let updating_value;
    	let current;

    	function monthview_year_binding(value) {
    		/*monthview_year_binding*/ ctx[10](value);
    	}

    	function monthview_month_binding(value) {
    		/*monthview_month_binding*/ ctx[11](value);
    	}

    	function monthview_value_binding(value) {
    		/*monthview_value_binding*/ ctx[12](value);
    	}

    	let monthview_props = {
    		firstDayOrder: /*firstDayOrder*/ ctx[3],
    		unixValue: /*unixValue*/ ctx[4]
    	};

    	if (/*year*/ ctx[0] !== void 0) {
    		monthview_props.year = /*year*/ ctx[0];
    	}

    	if (/*month*/ ctx[1] !== void 0) {
    		monthview_props.month = /*month*/ ctx[1];
    	}

    	if (/*value*/ ctx[2] !== void 0) {
    		monthview_props.value = /*value*/ ctx[2];
    	}

    	monthview = new MonthView({ props: monthview_props, $$inline: true });
    	binding_callbacks.push(() => bind(monthview, 'year', monthview_year_binding));
    	binding_callbacks.push(() => bind(monthview, 'month', monthview_month_binding));
    	binding_callbacks.push(() => bind(monthview, 'value', monthview_value_binding));
    	monthview.$on("day-click", /*day_click_handler*/ ctx[13]);

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(monthview.$$.fragment);
    			attr_dev(div, "class", "calendar svelte-cdi0k");
    			attr_dev(div, "style", /*getCssVariablesString*/ ctx[5]());
    			attr_dev(div, "data-calendartarget", "calendar");
    			add_location(div, file, 64, 0, 1684);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(monthview, div, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const monthview_changes = {};
    			if (dirty & /*firstDayOrder*/ 8) monthview_changes.firstDayOrder = /*firstDayOrder*/ ctx[3];
    			if (dirty & /*unixValue*/ 16) monthview_changes.unixValue = /*unixValue*/ ctx[4];

    			if (!updating_year && dirty & /*year*/ 1) {
    				updating_year = true;
    				monthview_changes.year = /*year*/ ctx[0];
    				add_flush_callback(() => updating_year = false);
    			}

    			if (!updating_month && dirty & /*month*/ 2) {
    				updating_month = true;
    				monthview_changes.month = /*month*/ ctx[1];
    				add_flush_callback(() => updating_month = false);
    			}

    			if (!updating_value && dirty & /*value*/ 4) {
    				updating_value = true;
    				monthview_changes.value = /*value*/ ctx[2];
    				add_flush_callback(() => updating_value = false);
    			}

    			monthview.$set(monthview_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(monthview.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(monthview.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(monthview);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Calendar', slots, []);
    	let { year = 0 } = $$props;
    	let { month = 0 } = $$props;
    	let { day = 0 } = $$props;

    	let { classes = {
    		colorBg: "#fff",
    		colorBgDisabled: "rgb(133, 151, 161)",
    		colorBgHover: "rgb(185, 209, 224)",
    		colorBgHoliday: "rgba(0, 0, 0, 0.1)"
    	} } = $$props;

    	if (year === 0 || month === 0 || day === 0) {
    		let currentDate = new Date();

    		if (year === 0) {
    			year = currentDate.getFullYear();
    		}

    		if (month === 0) {
    			month = currentDate.getMonth() + 1;
    		}

    		if (day === 0) {
    			day = currentDate.getDate();
    		}
    	}

    	let { value = 0 } = $$props;
    	let { view = 0b00000010 } = $$props;
    	let { firstDayOrder = 3 } = $$props;
    	let { unixValue = false } = $$props;

    	const getCssVariablesString = () => {
    		console.log("Setting css vars");
    		return "--clr-bg:" + classes.colorBg + ";" + "--clr-bg-d:" + classes.colorBgDisabled + ";" + "--clr-bg-h:" + classes.colorBgHover + ";" + "--clr-bg-hol:" + classes.colorBgHoliday;
    	};

    	const setYearView = () => {
    		$$invalidate(8, view = 0b00000001);
    	};

    	const setMonthView = () => {
    		$$invalidate(8, view = 0b00000010);
    	};

    	const setDayView = e => {
    		$$invalidate(8, view = 0b00000100);
    	};

    	const setEventView = () => {
    		$$invalidate(8, view = 0b00000001);
    	};

    	const setDayValue = e => {
    		$$invalidate(2, value = e.detail);
    		console.log(value);
    	};

    	const writable_props = [
    		'year',
    		'month',
    		'day',
    		'classes',
    		'value',
    		'view',
    		'firstDayOrder',
    		'unixValue'
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1.warn(`<Calendar> was created with unknown prop '${key}'`);
    	});

    	function monthview_year_binding(value) {
    		year = value;
    		$$invalidate(0, year);
    	}

    	function monthview_month_binding(value) {
    		month = value;
    		$$invalidate(1, month);
    	}

    	function monthview_value_binding(value$1) {
    		value = value$1;
    		$$invalidate(2, value);
    	}

    	const day_click_handler = e => setDayValue(e);

    	$$self.$$set = $$props => {
    		if ('year' in $$props) $$invalidate(0, year = $$props.year);
    		if ('month' in $$props) $$invalidate(1, month = $$props.month);
    		if ('day' in $$props) $$invalidate(7, day = $$props.day);
    		if ('classes' in $$props) $$invalidate(9, classes = $$props.classes);
    		if ('value' in $$props) $$invalidate(2, value = $$props.value);
    		if ('view' in $$props) $$invalidate(8, view = $$props.view);
    		if ('firstDayOrder' in $$props) $$invalidate(3, firstDayOrder = $$props.firstDayOrder);
    		if ('unixValue' in $$props) $$invalidate(4, unixValue = $$props.unixValue);
    	};

    	$$self.$capture_state = () => ({
    		MonthView,
    		SelectNumber,
    		DayView,
    		year,
    		month,
    		day,
    		classes,
    		value,
    		view,
    		firstDayOrder,
    		unixValue,
    		getCssVariablesString,
    		setYearView,
    		setMonthView,
    		setDayView,
    		setEventView,
    		setDayValue
    	});

    	$$self.$inject_state = $$props => {
    		if ('year' in $$props) $$invalidate(0, year = $$props.year);
    		if ('month' in $$props) $$invalidate(1, month = $$props.month);
    		if ('day' in $$props) $$invalidate(7, day = $$props.day);
    		if ('classes' in $$props) $$invalidate(9, classes = $$props.classes);
    		if ('value' in $$props) $$invalidate(2, value = $$props.value);
    		if ('view' in $$props) $$invalidate(8, view = $$props.view);
    		if ('firstDayOrder' in $$props) $$invalidate(3, firstDayOrder = $$props.firstDayOrder);
    		if ('unixValue' in $$props) $$invalidate(4, unixValue = $$props.unixValue);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		year,
    		month,
    		value,
    		firstDayOrder,
    		unixValue,
    		getCssVariablesString,
    		setDayValue,
    		day,
    		view,
    		classes,
    		monthview_year_binding,
    		monthview_month_binding,
    		monthview_value_binding,
    		day_click_handler
    	];
    }

    class Calendar extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance, create_fragment, safe_not_equal, {
    			year: 0,
    			month: 1,
    			day: 7,
    			classes: 9,
    			value: 2,
    			view: 8,
    			firstDayOrder: 3,
    			unixValue: 4
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Calendar",
    			options,
    			id: create_fragment.name
    		});
    	}

    	get year() {
    		throw new Error("<Calendar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set year(value) {
    		throw new Error("<Calendar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get month() {
    		throw new Error("<Calendar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set month(value) {
    		throw new Error("<Calendar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get day() {
    		throw new Error("<Calendar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set day(value) {
    		throw new Error("<Calendar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get classes() {
    		throw new Error("<Calendar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set classes(value) {
    		throw new Error("<Calendar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get value() {
    		throw new Error("<Calendar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<Calendar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get view() {
    		throw new Error("<Calendar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set view(value) {
    		throw new Error("<Calendar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get firstDayOrder() {
    		throw new Error("<Calendar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set firstDayOrder(value) {
    		throw new Error("<Calendar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get unixValue() {
    		throw new Error("<Calendar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set unixValue(value) {
    		throw new Error("<Calendar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    exports.Calendar = Calendar;
    exports.Day = Day;
    exports.Month = Month;
    exports.MonthView = MonthView;
    exports.Select = Select;
    exports.SelectNumber = SelectNumber;

    Object.defineProperty(exports, '__esModule', { value: true });

}));
//# sourceMappingURL=index.mjs.map
