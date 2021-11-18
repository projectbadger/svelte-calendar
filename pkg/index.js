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
const file$9 = "src/components/Day.svelte";

function get_each_context$4(ctx, list, i) {
	const child_ctx = ctx.slice();
	child_ctx[11] = list[i];
	return child_ctx;
}

// (43:6) {#if weekday}
function create_if_block_1$3(ctx) {
	const block = { c: noop, m: noop, d: noop };

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_if_block_1$3.name,
		type: "if",
		source: "(43:6) {#if weekday}",
		ctx
	});

	return block;
}

// (49:6) {#if events.length}
function create_if_block$5(ctx) {
	let ul;
	let each_value = /*events*/ ctx[3];
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

			attr_dev(ul, "class", "svelte-1et5mzv");
			add_location(ul, file$9, 49, 8, 1230);
		},
		m: function mount(target, anchor) {
			insert_dev(target, ul, anchor);

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].m(ul, null);
			}
		},
		p: function update(ctx, dirty) {
			if (dirty & /*events*/ 8) {
				each_value = /*events*/ ctx[3];
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
		id: create_if_block$5.name,
		type: "if",
		source: "(49:6) {#if events.length}",
		ctx
	});

	return block;
}

// (51:10) {#each events as event}
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
			attr_dev(div, "class", "event svelte-1et5mzv");
			add_location(div, file$9, 52, 14, 1300);
			attr_dev(li, "class", "svelte-1et5mzv");
			add_location(li, file$9, 51, 12, 1281);
		},
		m: function mount(target, anchor) {
			insert_dev(target, li, anchor);
			append_dev(li, div);
			append_dev(div, t0);
			append_dev(li, t1);
		},
		p: function update(ctx, dirty) {
			if (dirty & /*events*/ 8 && t0_value !== (t0_value = /*event*/ ctx[11].name + "")) set_data_dev(t0, t0_value);
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(li);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_each_block$4.name,
		type: "each",
		source: "(51:10) {#each events as event}",
		ctx
	});

	return block;
}

function create_fragment$9(ctx) {
	let div3;
	let div2;
	let div0;
	let span;
	let t1;
	let t2;
	let div1;
	let t3;
	let div3_class_value;
	let current;
	let mounted;
	let dispose;
	let if_block0 = /*weekday*/ ctx[0] && create_if_block_1$3(ctx);
	let if_block1 = /*events*/ ctx[3].length && create_if_block$5(ctx);
	const default_slot_template = /*#slots*/ ctx[9].default;
	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[8], null);

	const block = {
		c: function create() {
			div3 = element("div");
			div2 = element("div");
			div0 = element("div");
			span = element("span");
			span.textContent = `${/*getDate*/ ctx[5]()}`;
			t1 = space();
			if (if_block0) if_block0.c();
			t2 = space();
			div1 = element("div");
			if (if_block1) if_block1.c();
			t3 = space();
			if (default_slot) default_slot.c();
			add_location(span, file$9, 41, 6, 1019);
			attr_dev(div0, "class", "description svelte-1et5mzv");
			add_location(div0, file$9, 40, 4, 987);
			attr_dev(div1, "class", "events svelte-1et5mzv");
			add_location(div1, file$9, 47, 4, 1175);
			attr_dev(div2, "class", "svelte-1et5mzv");
			add_location(div2, file$9, 39, 2, 977);
			attr_dev(div3, "class", div3_class_value = "day " + (/*inactive*/ ctx[1] ? 'inactive' : '') + " " + (/*holiday*/ ctx[2] ? 'holiday' : '') + " svelte-1et5mzv");
			add_location(div3, file$9, 35, 0, 879);
		},
		l: function claim(nodes) {
			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
		},
		m: function mount(target, anchor) {
			insert_dev(target, div3, anchor);
			append_dev(div3, div2);
			append_dev(div2, div0);
			append_dev(div0, span);
			append_dev(div0, t1);
			if (if_block0) if_block0.m(div0, null);
			append_dev(div2, t2);
			append_dev(div2, div1);
			if (if_block1) if_block1.m(div1, null);
			append_dev(div2, t3);

			if (default_slot) {
				default_slot.m(div2, null);
			}

			current = true;

			if (!mounted) {
				dispose = listen_dev(div3, "click", /*click*/ ctx[4], false, false, false);
				mounted = true;
			}
		},
		p: function update(ctx, [dirty]) {
			if (/*weekday*/ ctx[0]) {
				if (if_block0) ; else {
					if_block0 = create_if_block_1$3(ctx);
					if_block0.c();
					if_block0.m(div0, null);
				}
			} else if (if_block0) {
				if_block0.d(1);
				if_block0 = null;
			}

			if (/*events*/ ctx[3].length) {
				if (if_block1) {
					if_block1.p(ctx, dirty);
				} else {
					if_block1 = create_if_block$5(ctx);
					if_block1.c();
					if_block1.m(div1, null);
				}
			} else if (if_block1) {
				if_block1.d(1);
				if_block1 = null;
			}

			if (default_slot) {
				if (default_slot.p && (!current || dirty & /*$$scope*/ 256)) {
					update_slot_base(
						default_slot,
						default_slot_template,
						ctx,
						/*$$scope*/ ctx[8],
						!current
						? get_all_dirty_from_scope(/*$$scope*/ ctx[8])
						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[8], dirty, null),
						null
					);
				}
			}

			if (!current || dirty & /*inactive, holiday*/ 6 && div3_class_value !== (div3_class_value = "day " + (/*inactive*/ ctx[1] ? 'inactive' : '') + " " + (/*holiday*/ ctx[2] ? 'holiday' : '') + " svelte-1et5mzv")) {
				attr_dev(div3, "class", div3_class_value);
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
			if (detaching) detach_dev(div3);
			if (if_block0) if_block0.d();
			if (if_block1) if_block1.d();
			if (default_slot) default_slot.d(detaching);
			mounted = false;
			dispose();
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_fragment$9.name,
		type: "component",
		source: "",
		ctx
	});

	return block;
}

function instance$9($$self, $$props, $$invalidate) {
	let { $$slots: slots = {}, $$scope } = $$props;
	validate_slots('Day', slots, ['default']);
	let { weekday = "" } = $$props;
	let { inactive = false } = $$props;
	let { holiday = false } = $$props;
	let { events = [] } = $$props;
	let { unixValue = false } = $$props;
	let { unixMillis = 0 } = $$props;

	//   const date = new Date(year, month - 1, day);
	const dispatch = createEventDispatcher();

	const click = () => {
		if (unixValue) {
			dispatch("day-click", unixMillis / 1000);
		} else {
			let date = new Date();
			date.setTime(unixMillis);
			dispatch("day-click", date);
		}
	};

	const getDate = () => {
		let date = new Date(unixMillis);
		date.setTime(unixMillis);
		return date.getDate();
	};

	const writable_props = ['weekday', 'inactive', 'holiday', 'events', 'unixValue', 'unixMillis'];

	Object.keys($$props).forEach(key => {
		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Day> was created with unknown prop '${key}'`);
	});

	$$self.$$set = $$props => {
		if ('weekday' in $$props) $$invalidate(0, weekday = $$props.weekday);
		if ('inactive' in $$props) $$invalidate(1, inactive = $$props.inactive);
		if ('holiday' in $$props) $$invalidate(2, holiday = $$props.holiday);
		if ('events' in $$props) $$invalidate(3, events = $$props.events);
		if ('unixValue' in $$props) $$invalidate(6, unixValue = $$props.unixValue);
		if ('unixMillis' in $$props) $$invalidate(7, unixMillis = $$props.unixMillis);
		if ('$$scope' in $$props) $$invalidate(8, $$scope = $$props.$$scope);
	};

	$$self.$capture_state = () => ({
		createEventDispatcher,
		weekday,
		inactive,
		holiday,
		events,
		unixValue,
		unixMillis,
		dispatch,
		click,
		getDate
	});

	$$self.$inject_state = $$props => {
		if ('weekday' in $$props) $$invalidate(0, weekday = $$props.weekday);
		if ('inactive' in $$props) $$invalidate(1, inactive = $$props.inactive);
		if ('holiday' in $$props) $$invalidate(2, holiday = $$props.holiday);
		if ('events' in $$props) $$invalidate(3, events = $$props.events);
		if ('unixValue' in $$props) $$invalidate(6, unixValue = $$props.unixValue);
		if ('unixMillis' in $$props) $$invalidate(7, unixMillis = $$props.unixMillis);
	};

	if ($$props && "$$inject" in $$props) {
		$$self.$inject_state($$props.$$inject);
	}

	return [
		weekday,
		inactive,
		holiday,
		events,
		click,
		getDate,
		unixValue,
		unixMillis,
		$$scope,
		slots
	];
}

class Day extends SvelteComponentDev {
	constructor(options) {
		super(options);

		init(this, options, instance$9, create_fragment$9, safe_not_equal, {
			weekday: 0,
			inactive: 1,
			holiday: 2,
			events: 3,
			unixValue: 6,
			unixMillis: 7
		});

		dispatch_dev("SvelteRegisterComponent", {
			component: this,
			tagName: "Day",
			options,
			id: create_fragment$9.name
		});
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

	get unixMillis() {
		throw new Error("<Day>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set unixMillis(value) {
		throw new Error("<Day>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}
}

/* src/components/Time.svelte generated by Svelte v3.44.0 */

const { console: console_1$3 } = globals;
const file$8 = "src/components/Time.svelte";

function create_fragment$8(ctx) {
	let span6;
	let div2;
	let div0;
	let span0;
	let t0;
	let input0;
	let t1;
	let div1;
	let span1;
	let t2;
	let div3;
	let p0;
	let t4;
	let div6;
	let div4;
	let span2;
	let t5;
	let input1;
	let t6;
	let div5;
	let span3;
	let t7;
	let div7;
	let p1;
	let t9;
	let div10;
	let div8;
	let span4;
	let t10;
	let input2;
	let t11;
	let div9;
	let span5;
	let span6_class_value;
	let mounted;
	let dispose;

	const block = {
		c: function create() {
			span6 = element("span");
			div2 = element("div");
			div0 = element("div");
			span0 = element("span");
			t0 = space();
			input0 = element("input");
			t1 = space();
			div1 = element("div");
			span1 = element("span");
			t2 = space();
			div3 = element("div");
			p0 = element("p");
			p0.textContent = ":";
			t4 = space();
			div6 = element("div");
			div4 = element("div");
			span2 = element("span");
			t5 = space();
			input1 = element("input");
			t6 = space();
			div5 = element("div");
			span3 = element("span");
			t7 = space();
			div7 = element("div");
			p1 = element("p");
			p1.textContent = ":";
			t9 = space();
			div10 = element("div");
			div8 = element("div");
			span4 = element("span");
			t10 = space();
			input2 = element("input");
			t11 = space();
			div9 = element("div");
			span5 = element("span");
			attr_dev(span0, "class", "triangle tr-up tr-inc-dec-trigger svelte-19eog52");
			add_location(span0, file$8, 96, 6, 2533);
			attr_dev(div0, "class", "increment tr-inc-dec-trigger svelte-19eog52");
			add_location(div0, file$8, 92, 4, 2421);
			attr_dev(input0, "class", "number svelte-19eog52");
			attr_dev(input0, "type", "number");
			add_location(input0, file$8, 98, 4, 2599);
			attr_dev(span1, "class", "triangle tr-down tr-inc-dec-trigger svelte-19eog52");
			add_location(span1, file$8, 108, 6, 2849);
			attr_dev(div1, "class", "decrement tr-inc-dec-trigger svelte-19eog52");
			add_location(div1, file$8, 104, 4, 2736);
			attr_dev(div2, "class", "rows hours-container svelte-19eog52");
			add_location(div2, file$8, 91, 2, 2382);
			add_location(p0, file$8, 112, 4, 2934);
			add_location(div3, file$8, 111, 2, 2924);
			attr_dev(span2, "class", "triangle tr-up tr-inc-dec-trigger svelte-19eog52");
			add_location(span2, file$8, 119, 6, 3109);
			attr_dev(div4, "class", "increment tr-inc-dec-trigger svelte-19eog52");
			add_location(div4, file$8, 115, 4, 2995);
			attr_dev(input1, "class", "number svelte-19eog52");
			attr_dev(input1, "type", "number");
			add_location(input1, file$8, 121, 4, 3175);
			attr_dev(span3, "class", "triangle tr-down tr-inc-dec-trigger svelte-19eog52");
			add_location(span3, file$8, 131, 6, 3431);
			attr_dev(div5, "class", "decrement tr-inc-dec-trigger svelte-19eog52");
			add_location(div5, file$8, 127, 4, 3316);
			attr_dev(div6, "class", "rows minutes-container svelte-19eog52");
			add_location(div6, file$8, 114, 2, 2954);
			add_location(p1, file$8, 135, 4, 3516);
			add_location(div7, file$8, 134, 2, 3506);
			attr_dev(span4, "class", "triangle tr-up tr-inc-dec-trigger svelte-19eog52");
			add_location(span4, file$8, 142, 6, 3691);
			attr_dev(div8, "class", "increment tr-inc-dec-trigger svelte-19eog52");
			add_location(div8, file$8, 138, 4, 3577);
			attr_dev(input2, "class", "number svelte-19eog52");
			attr_dev(input2, "type", "number");
			add_location(input2, file$8, 144, 4, 3757);
			attr_dev(span5, "class", "triangle tr-down tr-inc-dec-trigger svelte-19eog52");
			add_location(span5, file$8, 154, 6, 4013);
			attr_dev(div9, "class", "decrement tr-inc-dec-trigger svelte-19eog52");
			add_location(div9, file$8, 150, 4, 3898);
			attr_dev(div10, "class", "rows seconds-container svelte-19eog52");
			add_location(div10, file$8, 137, 2, 3536);
			attr_dev(span6, "class", span6_class_value = "cols time-container " + /*classes*/ ctx[3] + " svelte-19eog52");
			add_location(span6, file$8, 90, 0, 2335);
		},
		l: function claim(nodes) {
			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
		},
		m: function mount(target, anchor) {
			insert_dev(target, span6, anchor);
			append_dev(span6, div2);
			append_dev(div2, div0);
			append_dev(div0, span0);
			append_dev(div2, t0);
			append_dev(div2, input0);
			set_input_value(input0, /*hour*/ ctx[0]);
			append_dev(div2, t1);
			append_dev(div2, div1);
			append_dev(div1, span1);
			append_dev(span6, t2);
			append_dev(span6, div3);
			append_dev(div3, p0);
			append_dev(span6, t4);
			append_dev(span6, div6);
			append_dev(div6, div4);
			append_dev(div4, span2);
			append_dev(div6, t5);
			append_dev(div6, input1);
			set_input_value(input1, /*minute*/ ctx[1]);
			append_dev(div6, t6);
			append_dev(div6, div5);
			append_dev(div5, span3);
			append_dev(span6, t7);
			append_dev(span6, div7);
			append_dev(div7, p1);
			append_dev(span6, t9);
			append_dev(span6, div10);
			append_dev(div10, div8);
			append_dev(div8, span4);
			append_dev(div10, t10);
			append_dev(div10, input2);
			set_input_value(input2, /*second*/ ctx[2]);
			append_dev(div10, t11);
			append_dev(div10, div9);
			append_dev(div9, span5);

			if (!mounted) {
				dispose = [
					listen_dev(div0, "click", prevent_default(/*click_handler*/ ctx[10]), false, true, false),
					listen_dev(input0, "input", /*input0_input_handler*/ ctx[11]),
					listen_dev(input0, "change", prevent_default(/*change_handler*/ ctx[12]), false, true, false),
					listen_dev(div1, "click", prevent_default(/*click_handler_1*/ ctx[13]), false, true, false),
					listen_dev(div4, "click", prevent_default(/*click_handler_2*/ ctx[14]), false, true, false),
					listen_dev(input1, "input", /*input1_input_handler*/ ctx[15]),
					listen_dev(input1, "change", prevent_default(/*change_handler_1*/ ctx[16]), false, true, false),
					listen_dev(div5, "click", prevent_default(/*click_handler_3*/ ctx[17]), false, true, false),
					listen_dev(div8, "click", prevent_default(/*click_handler_4*/ ctx[18]), false, true, false),
					listen_dev(input2, "input", /*input2_input_handler*/ ctx[19]),
					listen_dev(input2, "change", prevent_default(/*change_handler_2*/ ctx[20]), false, true, false),
					listen_dev(div9, "click", prevent_default(/*click_handler_5*/ ctx[21]), false, true, false)
				];

				mounted = true;
			}
		},
		p: function update(ctx, [dirty]) {
			if (dirty & /*hour*/ 1 && to_number(input0.value) !== /*hour*/ ctx[0]) {
				set_input_value(input0, /*hour*/ ctx[0]);
			}

			if (dirty & /*minute*/ 2 && to_number(input1.value) !== /*minute*/ ctx[1]) {
				set_input_value(input1, /*minute*/ ctx[1]);
			}

			if (dirty & /*second*/ 4 && to_number(input2.value) !== /*second*/ ctx[2]) {
				set_input_value(input2, /*second*/ ctx[2]);
			}

			if (dirty & /*classes*/ 8 && span6_class_value !== (span6_class_value = "cols time-container " + /*classes*/ ctx[3] + " svelte-19eog52")) {
				attr_dev(span6, "class", span6_class_value);
			}
		},
		i: noop,
		o: noop,
		d: function destroy(detaching) {
			if (detaching) detach_dev(span6);
			mounted = false;
			run_all(dispose);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_fragment$8.name,
		type: "component",
		source: "",
		ctx
	});

	return block;
}

function instance$8($$self, $$props, $$invalidate) {
	let { $$slots: slots = {}, $$scope } = $$props;
	validate_slots('Time', slots, []);
	let { unix = -1 } = $$props;
	let { hour = -1 } = $$props;
	let { minute = -1 } = $$props;
	let { second = -1 } = $$props;
	let { unixMillis = 0 } = $$props;
	let { classes = "" } = $$props;
	let dateObj;

	onMount(() => {
		dateObj = new Date();

		if (hour < 0) {
			$$invalidate(0, hour = dateObj.getHours());
		} else {
			$$invalidate(0, hour = hour % 24);
			dateObj.setHours(hour);
		}

		if (minute < 0) {
			$$invalidate(1, minute = dateObj.getMinutes());
		} else {
			$$invalidate(1, minute = minute % 60);
			dateObj.setMinutes(minute);
		}

		if (second < 0) {
			$$invalidate(2, second = dateObj.getSeconds());
		} else {
			$$invalidate(2, second = second % 60);
			dateObj.setSeconds(second);
		}

		if (unix <= 0) {
			$$invalidate(7, unix = Math.floor(dateObj.getTime() / 1000));
		} else {
			dateObj.setTime(unix * 1000);
		}

		if (unixMillis <= 0) {
			$$invalidate(7, unix = Math.floor(dateObj.getTime() / 1000));
		} else {
			dateObj.setTime(unixMillis);
		}

		changeSecond(0);
		console.log(dateObj, hour, minute, second, unix);
	});

	const dispatch = createEventDispatcher();
	let { showOptions = false } = $$props;

	const changeHour = factor => {
		$$invalidate(0, hour = hour + factor);
		dateObj.setHours(hour);
		$$invalidate(2, second = dateObj.getSeconds());
		$$invalidate(1, minute = dateObj.getMinutes());
		$$invalidate(0, hour = dateObj.getHours());
		$$invalidate(7, unix = Math.floor(dateObj.getTime() / 1000));
		emitChange();
		$$invalidate(8, unixMillis = unixMillis + 1000 * 60 * 60 * factor);
	};

	const changeMinute = factor => {
		$$invalidate(1, minute = minute + factor);
		dateObj.setMinutes(minute);
		$$invalidate(2, second = dateObj.getSeconds());
		$$invalidate(1, minute = dateObj.getMinutes());
		$$invalidate(0, hour = dateObj.getHours());
		$$invalidate(7, unix = Math.floor(dateObj.getTime() / 1000));
		$$invalidate(8, unixMillis = unixMillis + 1000 * 60 * factor);
		emitChange();
	};

	const changeSecond = factor => {
		$$invalidate(2, second = second + factor);
		dateObj.setSeconds(second);
		$$invalidate(2, second = dateObj.getSeconds());
		$$invalidate(1, minute = dateObj.getMinutes());
		$$invalidate(0, hour = dateObj.getHours());
		$$invalidate(7, unix = Math.floor(dateObj.getTime() / 1000));
		$$invalidate(8, unixMillis = unixMillis + 1000 * factor);
		emitChange();
	};

	const emitChange = e => {
		// dispatch("change", { hour, minute, second });
		dispatch("change", unixMillis);

		let d = new Date();
		d.setTime(unixMillis);
	}; // console.log("Emmitting unix Millis for:", d);
	// showOptions = true;

	const writable_props = ['unix', 'hour', 'minute', 'second', 'unixMillis', 'classes', 'showOptions'];

	Object.keys($$props).forEach(key => {
		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$3.warn(`<Time> was created with unknown prop '${key}'`);
	});

	const click_handler = () => changeHour(1);

	function input0_input_handler() {
		hour = to_number(this.value);
		$$invalidate(0, hour);
	}

	const change_handler = e => changeHour(0);
	const click_handler_1 = () => changeHour(-1);
	const click_handler_2 = () => changeMinute(1);

	function input1_input_handler() {
		minute = to_number(this.value);
		$$invalidate(1, minute);
	}

	const change_handler_1 = e => changeMinute(0);
	const click_handler_3 = () => changeMinute(-1);
	const click_handler_4 = () => changeSecond(1);

	function input2_input_handler() {
		second = to_number(this.value);
		$$invalidate(2, second);
	}

	const change_handler_2 = e => changeSecond(0);
	const click_handler_5 = () => changeSecond(-1);

	$$self.$$set = $$props => {
		if ('unix' in $$props) $$invalidate(7, unix = $$props.unix);
		if ('hour' in $$props) $$invalidate(0, hour = $$props.hour);
		if ('minute' in $$props) $$invalidate(1, minute = $$props.minute);
		if ('second' in $$props) $$invalidate(2, second = $$props.second);
		if ('unixMillis' in $$props) $$invalidate(8, unixMillis = $$props.unixMillis);
		if ('classes' in $$props) $$invalidate(3, classes = $$props.classes);
		if ('showOptions' in $$props) $$invalidate(9, showOptions = $$props.showOptions);
	};

	$$self.$capture_state = () => ({
		createEventDispatcher,
		onMount,
		unix,
		hour,
		minute,
		second,
		unixMillis,
		classes,
		dateObj,
		dispatch,
		showOptions,
		changeHour,
		changeMinute,
		changeSecond,
		emitChange
	});

	$$self.$inject_state = $$props => {
		if ('unix' in $$props) $$invalidate(7, unix = $$props.unix);
		if ('hour' in $$props) $$invalidate(0, hour = $$props.hour);
		if ('minute' in $$props) $$invalidate(1, minute = $$props.minute);
		if ('second' in $$props) $$invalidate(2, second = $$props.second);
		if ('unixMillis' in $$props) $$invalidate(8, unixMillis = $$props.unixMillis);
		if ('classes' in $$props) $$invalidate(3, classes = $$props.classes);
		if ('dateObj' in $$props) dateObj = $$props.dateObj;
		if ('showOptions' in $$props) $$invalidate(9, showOptions = $$props.showOptions);
	};

	if ($$props && "$$inject" in $$props) {
		$$self.$inject_state($$props.$$inject);
	}

	return [
		hour,
		minute,
		second,
		classes,
		changeHour,
		changeMinute,
		changeSecond,
		unix,
		unixMillis,
		showOptions,
		click_handler,
		input0_input_handler,
		change_handler,
		click_handler_1,
		click_handler_2,
		input1_input_handler,
		change_handler_1,
		click_handler_3,
		click_handler_4,
		input2_input_handler,
		change_handler_2,
		click_handler_5
	];
}

class Time extends SvelteComponentDev {
	constructor(options) {
		super(options);

		init(this, options, instance$8, create_fragment$8, safe_not_equal, {
			unix: 7,
			hour: 0,
			minute: 1,
			second: 2,
			unixMillis: 8,
			classes: 3,
			showOptions: 9
		});

		dispatch_dev("SvelteRegisterComponent", {
			component: this,
			tagName: "Time",
			options,
			id: create_fragment$8.name
		});
	}

	get unix() {
		throw new Error("<Time>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set unix(value) {
		throw new Error("<Time>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get hour() {
		throw new Error("<Time>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set hour(value) {
		throw new Error("<Time>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get minute() {
		throw new Error("<Time>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set minute(value) {
		throw new Error("<Time>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get second() {
		throw new Error("<Time>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set second(value) {
		throw new Error("<Time>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get unixMillis() {
		throw new Error("<Time>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set unixMillis(value) {
		throw new Error("<Time>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get classes() {
		throw new Error("<Time>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set classes(value) {
		throw new Error("<Time>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get showOptions() {
		throw new Error("<Time>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set showOptions(value) {
		throw new Error("<Time>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}
}

/* src/components/TimePoint.svelte generated by Svelte v3.44.0 */
const file$7 = "src/components/TimePoint.svelte";

function create_fragment$7(ctx) {
	let div3;
	let div2;
	let div0;
	let time;
	let updating_unix;
	let updating_hour;
	let updating_minute;
	let updating_second;
	let updating_classes;
	let updating_unixMillis;
	let t;
	let div1;
	let div2_style_value;
	let current;

	function time_unix_binding(value) {
		/*time_unix_binding*/ ctx[9](value);
	}

	function time_hour_binding(value) {
		/*time_hour_binding*/ ctx[10](value);
	}

	function time_minute_binding(value) {
		/*time_minute_binding*/ ctx[11](value);
	}

	function time_second_binding(value) {
		/*time_second_binding*/ ctx[12](value);
	}

	function time_classes_binding(value) {
		/*time_classes_binding*/ ctx[13](value);
	}

	function time_unixMillis_binding(value) {
		/*time_unixMillis_binding*/ ctx[14](value);
	}

	let time_props = {};

	if (/*unix*/ ctx[0] !== void 0) {
		time_props.unix = /*unix*/ ctx[0];
	}

	if (/*hour*/ ctx[1] !== void 0) {
		time_props.hour = /*hour*/ ctx[1];
	}

	if (/*minute*/ ctx[2] !== void 0) {
		time_props.minute = /*minute*/ ctx[2];
	}

	if (/*second*/ ctx[3] !== void 0) {
		time_props.second = /*second*/ ctx[3];
	}

	if (/*classes*/ ctx[4] !== void 0) {
		time_props.classes = /*classes*/ ctx[4];
	}

	if (/*unixMillis*/ ctx[5] !== void 0) {
		time_props.unixMillis = /*unixMillis*/ ctx[5];
	}

	time = new Time({ props: time_props, $$inline: true });
	binding_callbacks.push(() => bind(time, 'unix', time_unix_binding));
	binding_callbacks.push(() => bind(time, 'hour', time_hour_binding));
	binding_callbacks.push(() => bind(time, 'minute', time_minute_binding));
	binding_callbacks.push(() => bind(time, 'second', time_second_binding));
	binding_callbacks.push(() => bind(time, 'classes', time_classes_binding));
	binding_callbacks.push(() => bind(time, 'unixMillis', time_unixMillis_binding));
	time.$on("change", /*change_handler*/ ctx[15]);

	const block = {
		c: function create() {
			div3 = element("div");
			div2 = element("div");
			div0 = element("div");
			create_component(time.$$.fragment);
			t = space();
			div1 = element("div");
			attr_dev(div0, "class", "time svelte-184r3hb");
			add_location(div0, file$7, 56, 4, 1402);
			add_location(div1, file$7, 67, 4, 1619);
			attr_dev(div2, "class", "tm-container svelte-184r3hb");

			attr_dev(div2, "style", div2_style_value = "" + (/*positionCss*/ ctx[6] + (/*position*/ ctx[7].top !== ''
			? 'top:' + /*position*/ ctx[7].top + ';'
			: '') + (/*position*/ ctx[7].bottom !== ''
			? 'bottom:' + /*position*/ ctx[7].bottom + ';'
			: '') + (/*position*/ ctx[7].left !== ''
			? 'left:' + /*position*/ ctx[7].left + ';'
			: '') + (/*position*/ ctx[7].right !== ''
			? 'right:' + /*position*/ ctx[7].right + ';'
			: '')));

			add_location(div2, file$7, 46, 2, 1060);
			attr_dev(div3, "class", "tp-container svelte-184r3hb");
			add_location(div3, file$7, 45, 0, 1031);
		},
		l: function claim(nodes) {
			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
		},
		m: function mount(target, anchor) {
			insert_dev(target, div3, anchor);
			append_dev(div3, div2);
			append_dev(div2, div0);
			mount_component(time, div0, null);
			append_dev(div2, t);
			append_dev(div2, div1);
			current = true;
		},
		p: function update(ctx, [dirty]) {
			const time_changes = {};

			if (!updating_unix && dirty & /*unix*/ 1) {
				updating_unix = true;
				time_changes.unix = /*unix*/ ctx[0];
				add_flush_callback(() => updating_unix = false);
			}

			if (!updating_hour && dirty & /*hour*/ 2) {
				updating_hour = true;
				time_changes.hour = /*hour*/ ctx[1];
				add_flush_callback(() => updating_hour = false);
			}

			if (!updating_minute && dirty & /*minute*/ 4) {
				updating_minute = true;
				time_changes.minute = /*minute*/ ctx[2];
				add_flush_callback(() => updating_minute = false);
			}

			if (!updating_second && dirty & /*second*/ 8) {
				updating_second = true;
				time_changes.second = /*second*/ ctx[3];
				add_flush_callback(() => updating_second = false);
			}

			if (!updating_classes && dirty & /*classes*/ 16) {
				updating_classes = true;
				time_changes.classes = /*classes*/ ctx[4];
				add_flush_callback(() => updating_classes = false);
			}

			if (!updating_unixMillis && dirty & /*unixMillis*/ 32) {
				updating_unixMillis = true;
				time_changes.unixMillis = /*unixMillis*/ ctx[5];
				add_flush_callback(() => updating_unixMillis = false);
			}

			time.$set(time_changes);

			if (!current || dirty & /*positionCss, position*/ 192 && div2_style_value !== (div2_style_value = "" + (/*positionCss*/ ctx[6] + (/*position*/ ctx[7].top !== ''
			? 'top:' + /*position*/ ctx[7].top + ';'
			: '') + (/*position*/ ctx[7].bottom !== ''
			? 'bottom:' + /*position*/ ctx[7].bottom + ';'
			: '') + (/*position*/ ctx[7].left !== ''
			? 'left:' + /*position*/ ctx[7].left + ';'
			: '') + (/*position*/ ctx[7].right !== ''
			? 'right:' + /*position*/ ctx[7].right + ';'
			: '')))) {
				attr_dev(div2, "style", div2_style_value);
			}
		},
		i: function intro(local) {
			if (current) return;
			transition_in(time.$$.fragment, local);
			current = true;
		},
		o: function outro(local) {
			transition_out(time.$$.fragment, local);
			current = false;
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(div3);
			destroy_component(time);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_fragment$7.name,
		type: "component",
		source: "",
		ctx
	});

	return block;
}

function instance$7($$self, $$props, $$invalidate) {
	let { $$slots: slots = {}, $$scope } = $$props;
	validate_slots('TimePoint', slots, []);
	const dispatch = createEventDispatcher();
	let { unix = -1 } = $$props;
	let { hour = -1 } = $$props;
	let { minute = -1 } = $$props;
	let { second = -1 } = $$props;
	let { classes = "" } = $$props;
	let { unixMillis = 0 } = $$props;
	let { position = { top: "", bottom: "", left: "", right: "" } } = $$props;
	let left = false;
	let clientWidth;
	let viewX;
	let { positionCss = "" } = $$props;

	const getPositionCss = () => {
		let str = "";

		if (position.top !== "") {
			str += "top:" + position.top + ";";
		}

		if (position.bottom !== "") {
			str += "bottom:" + position.bottom + ";";
		}

		if (position.left !== "") {
			str += "left:" + position.left + ";";
		}

		if (position.right !== "") {
			str += "right:" + position.right + ";";
		}

		$$invalidate(6, positionCss = str);
		return str;
	};

	const emitChange = e => {
		dispatch("change", e.detail);
	};

	onMount(() => {
		getPositionCss();
	});

	const writable_props = [
		'unix',
		'hour',
		'minute',
		'second',
		'classes',
		'unixMillis',
		'position',
		'positionCss'
	];

	Object.keys($$props).forEach(key => {
		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<TimePoint> was created with unknown prop '${key}'`);
	});

	function time_unix_binding(value) {
		unix = value;
		$$invalidate(0, unix);
	}

	function time_hour_binding(value) {
		hour = value;
		$$invalidate(1, hour);
	}

	function time_minute_binding(value) {
		minute = value;
		$$invalidate(2, minute);
	}

	function time_second_binding(value) {
		second = value;
		$$invalidate(3, second);
	}

	function time_classes_binding(value) {
		classes = value;
		$$invalidate(4, classes);
	}

	function time_unixMillis_binding(value) {
		unixMillis = value;
		$$invalidate(5, unixMillis);
	}

	const change_handler = e => emitChange(e);

	$$self.$$set = $$props => {
		if ('unix' in $$props) $$invalidate(0, unix = $$props.unix);
		if ('hour' in $$props) $$invalidate(1, hour = $$props.hour);
		if ('minute' in $$props) $$invalidate(2, minute = $$props.minute);
		if ('second' in $$props) $$invalidate(3, second = $$props.second);
		if ('classes' in $$props) $$invalidate(4, classes = $$props.classes);
		if ('unixMillis' in $$props) $$invalidate(5, unixMillis = $$props.unixMillis);
		if ('position' in $$props) $$invalidate(7, position = $$props.position);
		if ('positionCss' in $$props) $$invalidate(6, positionCss = $$props.positionCss);
	};

	$$self.$capture_state = () => ({
		Time,
		onMount,
		createEventDispatcher,
		dispatch,
		unix,
		hour,
		minute,
		second,
		classes,
		unixMillis,
		position,
		left,
		clientWidth,
		viewX,
		positionCss,
		getPositionCss,
		emitChange
	});

	$$self.$inject_state = $$props => {
		if ('unix' in $$props) $$invalidate(0, unix = $$props.unix);
		if ('hour' in $$props) $$invalidate(1, hour = $$props.hour);
		if ('minute' in $$props) $$invalidate(2, minute = $$props.minute);
		if ('second' in $$props) $$invalidate(3, second = $$props.second);
		if ('classes' in $$props) $$invalidate(4, classes = $$props.classes);
		if ('unixMillis' in $$props) $$invalidate(5, unixMillis = $$props.unixMillis);
		if ('position' in $$props) $$invalidate(7, position = $$props.position);
		if ('left' in $$props) left = $$props.left;
		if ('clientWidth' in $$props) clientWidth = $$props.clientWidth;
		if ('viewX' in $$props) viewX = $$props.viewX;
		if ('positionCss' in $$props) $$invalidate(6, positionCss = $$props.positionCss);
	};

	if ($$props && "$$inject" in $$props) {
		$$self.$inject_state($$props.$$inject);
	}

	return [
		unix,
		hour,
		minute,
		second,
		classes,
		unixMillis,
		positionCss,
		position,
		emitChange,
		time_unix_binding,
		time_hour_binding,
		time_minute_binding,
		time_second_binding,
		time_classes_binding,
		time_unixMillis_binding,
		change_handler
	];
}

class TimePoint extends SvelteComponentDev {
	constructor(options) {
		super(options);

		init(this, options, instance$7, create_fragment$7, safe_not_equal, {
			unix: 0,
			hour: 1,
			minute: 2,
			second: 3,
			classes: 4,
			unixMillis: 5,
			position: 7,
			positionCss: 6
		});

		dispatch_dev("SvelteRegisterComponent", {
			component: this,
			tagName: "TimePoint",
			options,
			id: create_fragment$7.name
		});
	}

	get unix() {
		throw new Error("<TimePoint>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set unix(value) {
		throw new Error("<TimePoint>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get hour() {
		throw new Error("<TimePoint>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set hour(value) {
		throw new Error("<TimePoint>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get minute() {
		throw new Error("<TimePoint>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set minute(value) {
		throw new Error("<TimePoint>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get second() {
		throw new Error("<TimePoint>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set second(value) {
		throw new Error("<TimePoint>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get classes() {
		throw new Error("<TimePoint>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set classes(value) {
		throw new Error("<TimePoint>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get unixMillis() {
		throw new Error("<TimePoint>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set unixMillis(value) {
		throw new Error("<TimePoint>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get position() {
		throw new Error("<TimePoint>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set position(value) {
		throw new Error("<TimePoint>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get positionCss() {
		throw new Error("<TimePoint>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set positionCss(value) {
		throw new Error("<TimePoint>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}
}

/* src/components/DayWithEvent.svelte generated by Svelte v3.44.0 */

const { console: console_1$2 } = globals;
const file$6 = "src/components/DayWithEvent.svelte";

// (116:2) {#if showTime}
function create_if_block$4(ctx) {
	let current_block_type_index;
	let if_block;
	let if_block_anchor;
	let current;
	const if_block_creators = [create_if_block_1$2, create_if_block_2$1];
	const if_blocks = [];

	function select_block_type(ctx, dirty) {
		if (/*displayMask*/ ctx[11] | DISPLAY_LEFT) return 0;
		if (/*displayMask*/ ctx[11] | DISPLAY_RIGHT) return 1;
		return -1;
	}

	if (~(current_block_type_index = select_block_type(ctx))) {
		if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
	}

	const block = {
		c: function create() {
			if (if_block) if_block.c();
			if_block_anchor = empty();
		},
		m: function mount(target, anchor) {
			if (~current_block_type_index) {
				if_blocks[current_block_type_index].m(target, anchor);
			}

			insert_dev(target, if_block_anchor, anchor);
			current = true;
		},
		p: function update(ctx, dirty) {
			let previous_block_index = current_block_type_index;
			current_block_type_index = select_block_type(ctx);

			if (current_block_type_index === previous_block_index) {
				if (~current_block_type_index) {
					if_blocks[current_block_type_index].p(ctx, dirty);
				}
			} else {
				if (if_block) {
					group_outros();

					transition_out(if_blocks[previous_block_index], 1, 1, () => {
						if_blocks[previous_block_index] = null;
					});

					check_outros();
				}

				if (~current_block_type_index) {
					if_block = if_blocks[current_block_type_index];

					if (!if_block) {
						if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
						if_block.c();
					} else {
						if_block.p(ctx, dirty);
					}

					transition_in(if_block, 1);
					if_block.m(if_block_anchor.parentNode, if_block_anchor);
				} else {
					if_block = null;
				}
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
			if (~current_block_type_index) {
				if_blocks[current_block_type_index].d(detaching);
			}

			if (detaching) detach_dev(if_block_anchor);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_if_block$4.name,
		type: "if",
		source: "(116:2) {#if showTime}",
		ctx
	});

	return block;
}

// (128:42) 
function create_if_block_2$1(ctx) {
	let timepoint;
	let updating_hour;
	let updating_minute;
	let updating_second;
	let updating_unixMillis;
	let updating_timePointPosition;
	let updating_unix;
	let current;

	function timepoint_hour_binding_1(value) {
		/*timepoint_hour_binding_1*/ ctx[29](value);
	}

	function timepoint_minute_binding_1(value) {
		/*timepoint_minute_binding_1*/ ctx[30](value);
	}

	function timepoint_second_binding_1(value) {
		/*timepoint_second_binding_1*/ ctx[31](value);
	}

	function timepoint_unixMillis_binding_1(value) {
		/*timepoint_unixMillis_binding_1*/ ctx[32](value);
	}

	function timepoint_timePointPosition_binding_1(value) {
		/*timepoint_timePointPosition_binding_1*/ ctx[33](value);
	}

	function timepoint_unix_binding_1(value) {
		/*timepoint_unix_binding_1*/ ctx[34](value);
	}

	let timepoint_props = { positionCss: "right:0;" };

	if (/*hour*/ ctx[6] !== void 0) {
		timepoint_props.hour = /*hour*/ ctx[6];
	}

	if (/*minute*/ ctx[7] !== void 0) {
		timepoint_props.minute = /*minute*/ ctx[7];
	}

	if (/*second*/ ctx[8] !== void 0) {
		timepoint_props.second = /*second*/ ctx[8];
	}

	if (/*unixMillis*/ ctx[5] !== void 0) {
		timepoint_props.unixMillis = /*unixMillis*/ ctx[5];
	}

	if (/*timePointPosition*/ ctx[12] !== void 0) {
		timepoint_props.timePointPosition = /*timePointPosition*/ ctx[12];
	}

	if (/*unixValue*/ ctx[4] !== void 0) {
		timepoint_props.unix = /*unixValue*/ ctx[4];
	}

	timepoint = new TimePoint({ props: timepoint_props, $$inline: true });
	binding_callbacks.push(() => bind(timepoint, 'hour', timepoint_hour_binding_1));
	binding_callbacks.push(() => bind(timepoint, 'minute', timepoint_minute_binding_1));
	binding_callbacks.push(() => bind(timepoint, 'second', timepoint_second_binding_1));
	binding_callbacks.push(() => bind(timepoint, 'unixMillis', timepoint_unixMillis_binding_1));
	binding_callbacks.push(() => bind(timepoint, 'timePointPosition', timepoint_timePointPosition_binding_1));
	binding_callbacks.push(() => bind(timepoint, 'unix', timepoint_unix_binding_1));
	timepoint.$on("change", /*change_handler_1*/ ctx[35]);

	const block = {
		c: function create() {
			create_component(timepoint.$$.fragment);
		},
		m: function mount(target, anchor) {
			mount_component(timepoint, target, anchor);
			current = true;
		},
		p: function update(ctx, dirty) {
			const timepoint_changes = {};

			if (!updating_hour && dirty[0] & /*hour*/ 64) {
				updating_hour = true;
				timepoint_changes.hour = /*hour*/ ctx[6];
				add_flush_callback(() => updating_hour = false);
			}

			if (!updating_minute && dirty[0] & /*minute*/ 128) {
				updating_minute = true;
				timepoint_changes.minute = /*minute*/ ctx[7];
				add_flush_callback(() => updating_minute = false);
			}

			if (!updating_second && dirty[0] & /*second*/ 256) {
				updating_second = true;
				timepoint_changes.second = /*second*/ ctx[8];
				add_flush_callback(() => updating_second = false);
			}

			if (!updating_unixMillis && dirty[0] & /*unixMillis*/ 32) {
				updating_unixMillis = true;
				timepoint_changes.unixMillis = /*unixMillis*/ ctx[5];
				add_flush_callback(() => updating_unixMillis = false);
			}

			if (!updating_timePointPosition && dirty[0] & /*timePointPosition*/ 4096) {
				updating_timePointPosition = true;
				timepoint_changes.timePointPosition = /*timePointPosition*/ ctx[12];
				add_flush_callback(() => updating_timePointPosition = false);
			}

			if (!updating_unix && dirty[0] & /*unixValue*/ 16) {
				updating_unix = true;
				timepoint_changes.unix = /*unixValue*/ ctx[4];
				add_flush_callback(() => updating_unix = false);
			}

			timepoint.$set(timepoint_changes);
		},
		i: function intro(local) {
			if (current) return;
			transition_in(timepoint.$$.fragment, local);
			current = true;
		},
		o: function outro(local) {
			transition_out(timepoint.$$.fragment, local);
			current = false;
		},
		d: function destroy(detaching) {
			destroy_component(timepoint, detaching);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_if_block_2$1.name,
		type: "if",
		source: "(128:42) ",
		ctx
	});

	return block;
}

// (117:4) {#if displayMask | DISPLAY_LEFT}
function create_if_block_1$2(ctx) {
	let timepoint;
	let updating_hour;
	let updating_minute;
	let updating_second;
	let updating_unixMillis;
	let updating_timePointPosition;
	let updating_unix;
	let current;

	function timepoint_hour_binding(value) {
		/*timepoint_hour_binding*/ ctx[22](value);
	}

	function timepoint_minute_binding(value) {
		/*timepoint_minute_binding*/ ctx[23](value);
	}

	function timepoint_second_binding(value) {
		/*timepoint_second_binding*/ ctx[24](value);
	}

	function timepoint_unixMillis_binding(value) {
		/*timepoint_unixMillis_binding*/ ctx[25](value);
	}

	function timepoint_timePointPosition_binding(value) {
		/*timepoint_timePointPosition_binding*/ ctx[26](value);
	}

	function timepoint_unix_binding(value) {
		/*timepoint_unix_binding*/ ctx[27](value);
	}

	let timepoint_props = { positionCss: "right:100%;" };

	if (/*hour*/ ctx[6] !== void 0) {
		timepoint_props.hour = /*hour*/ ctx[6];
	}

	if (/*minute*/ ctx[7] !== void 0) {
		timepoint_props.minute = /*minute*/ ctx[7];
	}

	if (/*second*/ ctx[8] !== void 0) {
		timepoint_props.second = /*second*/ ctx[8];
	}

	if (/*unixMillis*/ ctx[5] !== void 0) {
		timepoint_props.unixMillis = /*unixMillis*/ ctx[5];
	}

	if (/*timePointPosition*/ ctx[12] !== void 0) {
		timepoint_props.timePointPosition = /*timePointPosition*/ ctx[12];
	}

	if (/*unixValue*/ ctx[4] !== void 0) {
		timepoint_props.unix = /*unixValue*/ ctx[4];
	}

	timepoint = new TimePoint({ props: timepoint_props, $$inline: true });
	binding_callbacks.push(() => bind(timepoint, 'hour', timepoint_hour_binding));
	binding_callbacks.push(() => bind(timepoint, 'minute', timepoint_minute_binding));
	binding_callbacks.push(() => bind(timepoint, 'second', timepoint_second_binding));
	binding_callbacks.push(() => bind(timepoint, 'unixMillis', timepoint_unixMillis_binding));
	binding_callbacks.push(() => bind(timepoint, 'timePointPosition', timepoint_timePointPosition_binding));
	binding_callbacks.push(() => bind(timepoint, 'unix', timepoint_unix_binding));
	timepoint.$on("change", /*change_handler*/ ctx[28]);

	const block = {
		c: function create() {
			create_component(timepoint.$$.fragment);
		},
		m: function mount(target, anchor) {
			mount_component(timepoint, target, anchor);
			current = true;
		},
		p: function update(ctx, dirty) {
			const timepoint_changes = {};

			if (!updating_hour && dirty[0] & /*hour*/ 64) {
				updating_hour = true;
				timepoint_changes.hour = /*hour*/ ctx[6];
				add_flush_callback(() => updating_hour = false);
			}

			if (!updating_minute && dirty[0] & /*minute*/ 128) {
				updating_minute = true;
				timepoint_changes.minute = /*minute*/ ctx[7];
				add_flush_callback(() => updating_minute = false);
			}

			if (!updating_second && dirty[0] & /*second*/ 256) {
				updating_second = true;
				timepoint_changes.second = /*second*/ ctx[8];
				add_flush_callback(() => updating_second = false);
			}

			if (!updating_unixMillis && dirty[0] & /*unixMillis*/ 32) {
				updating_unixMillis = true;
				timepoint_changes.unixMillis = /*unixMillis*/ ctx[5];
				add_flush_callback(() => updating_unixMillis = false);
			}

			if (!updating_timePointPosition && dirty[0] & /*timePointPosition*/ 4096) {
				updating_timePointPosition = true;
				timepoint_changes.timePointPosition = /*timePointPosition*/ ctx[12];
				add_flush_callback(() => updating_timePointPosition = false);
			}

			if (!updating_unix && dirty[0] & /*unixValue*/ 16) {
				updating_unix = true;
				timepoint_changes.unix = /*unixValue*/ ctx[4];
				add_flush_callback(() => updating_unix = false);
			}

			timepoint.$set(timepoint_changes);
		},
		i: function intro(local) {
			if (current) return;
			transition_in(timepoint.$$.fragment, local);
			current = true;
		},
		o: function outro(local) {
			transition_out(timepoint.$$.fragment, local);
			current = false;
		},
		d: function destroy(detaching) {
			destroy_component(timepoint, detaching);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_if_block_1$2.name,
		type: "if",
		source: "(117:4) {#if displayMask | DISPLAY_LEFT}",
		ctx
	});

	return block;
}

function create_fragment$6(ctx) {
	let div;
	let day;
	let updating_weekday;
	let updating_inactive;
	let updating_holiday;
	let updating_events;
	let updating_unixValue;
	let updating_unixMillis;
	let t;
	let current;

	function day_weekday_binding(value) {
		/*day_weekday_binding*/ ctx[15](value);
	}

	function day_inactive_binding(value) {
		/*day_inactive_binding*/ ctx[16](value);
	}

	function day_holiday_binding(value) {
		/*day_holiday_binding*/ ctx[17](value);
	}

	function day_events_binding(value) {
		/*day_events_binding*/ ctx[18](value);
	}

	function day_unixValue_binding(value) {
		/*day_unixValue_binding*/ ctx[19](value);
	}

	function day_unixMillis_binding(value) {
		/*day_unixMillis_binding*/ ctx[20](value);
	}

	let day_props = {};

	if (/*weekday*/ ctx[0] !== void 0) {
		day_props.weekday = /*weekday*/ ctx[0];
	}

	if (/*inactive*/ ctx[1] !== void 0) {
		day_props.inactive = /*inactive*/ ctx[1];
	}

	if (/*holiday*/ ctx[2] !== void 0) {
		day_props.holiday = /*holiday*/ ctx[2];
	}

	if (/*events*/ ctx[3] !== void 0) {
		day_props.events = /*events*/ ctx[3];
	}

	if (/*unixValue*/ ctx[4] !== void 0) {
		day_props.unixValue = /*unixValue*/ ctx[4];
	}

	if (/*unixMillis*/ ctx[5] !== void 0) {
		day_props.unixMillis = /*unixMillis*/ ctx[5];
	}

	day = new Day({ props: day_props, $$inline: true });
	binding_callbacks.push(() => bind(day, 'weekday', day_weekday_binding));
	binding_callbacks.push(() => bind(day, 'inactive', day_inactive_binding));
	binding_callbacks.push(() => bind(day, 'holiday', day_holiday_binding));
	binding_callbacks.push(() => bind(day, 'events', day_events_binding));
	binding_callbacks.push(() => bind(day, 'unixValue', day_unixValue_binding));
	binding_callbacks.push(() => bind(day, 'unixMillis', day_unixMillis_binding));
	day.$on("day-click", /*day_click_handler*/ ctx[21]);
	let if_block = /*showTime*/ ctx[10] && create_if_block$4(ctx);

	const block = {
		c: function create() {
			div = element("div");
			create_component(day.$$.fragment);
			t = space();
			if (if_block) if_block.c();
			add_location(div, file$6, 105, 0, 2809);
		},
		l: function claim(nodes) {
			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
		},
		m: function mount(target, anchor) {
			insert_dev(target, div, anchor);
			mount_component(day, div, null);
			append_dev(div, t);
			if (if_block) if_block.m(div, null);
			/*div_binding*/ ctx[36](div);
			current = true;
		},
		p: function update(ctx, dirty) {
			const day_changes = {};

			if (!updating_weekday && dirty[0] & /*weekday*/ 1) {
				updating_weekday = true;
				day_changes.weekday = /*weekday*/ ctx[0];
				add_flush_callback(() => updating_weekday = false);
			}

			if (!updating_inactive && dirty[0] & /*inactive*/ 2) {
				updating_inactive = true;
				day_changes.inactive = /*inactive*/ ctx[1];
				add_flush_callback(() => updating_inactive = false);
			}

			if (!updating_holiday && dirty[0] & /*holiday*/ 4) {
				updating_holiday = true;
				day_changes.holiday = /*holiday*/ ctx[2];
				add_flush_callback(() => updating_holiday = false);
			}

			if (!updating_events && dirty[0] & /*events*/ 8) {
				updating_events = true;
				day_changes.events = /*events*/ ctx[3];
				add_flush_callback(() => updating_events = false);
			}

			if (!updating_unixValue && dirty[0] & /*unixValue*/ 16) {
				updating_unixValue = true;
				day_changes.unixValue = /*unixValue*/ ctx[4];
				add_flush_callback(() => updating_unixValue = false);
			}

			if (!updating_unixMillis && dirty[0] & /*unixMillis*/ 32) {
				updating_unixMillis = true;
				day_changes.unixMillis = /*unixMillis*/ ctx[5];
				add_flush_callback(() => updating_unixMillis = false);
			}

			day.$set(day_changes);

			if (/*showTime*/ ctx[10]) {
				if (if_block) {
					if_block.p(ctx, dirty);

					if (dirty[0] & /*showTime*/ 1024) {
						transition_in(if_block, 1);
					}
				} else {
					if_block = create_if_block$4(ctx);
					if_block.c();
					transition_in(if_block, 1);
					if_block.m(div, null);
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
			transition_in(day.$$.fragment, local);
			transition_in(if_block);
			current = true;
		},
		o: function outro(local) {
			transition_out(day.$$.fragment, local);
			transition_out(if_block);
			current = false;
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(div);
			destroy_component(day);
			if (if_block) if_block.d();
			/*div_binding*/ ctx[36](null);
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

const DISPLAY_LEFT = 0b00000001;
const DISPLAY_RIGHT = 0b00000010;
const DISPLAY_CENTER = 0b00000100;

function instance$6($$self, $$props, $$invalidate) {
	let { $$slots: slots = {}, $$scope } = $$props;
	validate_slots('DayWithEvent', slots, []);
	let { weekday = "" } = $$props;
	let { inactive = false } = $$props;
	let { holiday = false } = $$props;
	let { events = [] } = $$props;
	let { unixValue = false } = $$props;
	let { unixMillis = 0 } = $$props;
	let { hour = 0 } = $$props;
	let { minute = 0 } = $$props;
	let { second = 0 } = $$props;

	if (hour === 0 && minute === 0 && second === 0) {
		let cDate = new Date();
		hour = cDate.getHours();
		minute = cDate.getMinutes();
		second = cDate.getSeconds();
	}

	let container;
	let showTime = false;
	let displayMask = DISPLAY_CENTER;
	let timePointPosition = { top: "", bottom: "", left: "", right: "" };
	let value = 0;
	let timePositionCss = "";

	const alignNumber = () => {
		let offset = container.getBoundingClientRect();
		let viewX = document.documentElement.clientWidth;
		document.documentElement.clientHeight;

		if (offset.x < viewX / 2) {
			$$invalidate(11, displayMask = DISPLAY_LEFT);
			timePositionCss = "right:100%;";
			$$invalidate(12, timePointPosition.left = "100%", timePointPosition);
			$$invalidate(12, timePointPosition.right = "", timePointPosition);
		} else {
			timePositionCss = "right:0;";
			$$invalidate(12, timePointPosition.left = "0%", timePointPosition);
			$$invalidate(12, timePointPosition.right = "", timePointPosition);
			$$invalidate(11, displayMask = DISPLAY_RIGHT);
		}
	}; // console.log(offset, viewX, viewY);

	const dispatch = createEventDispatcher();

	const dayClicked = event => {
		dispatch("day-click", event.detail);
		console.log("Position: ", timePointPosition);
		$$invalidate(10, showTime = true);
		setCloseListener(true);
	};

	const onTimeChange = e => {
		let newTimeDate = new Date();
		newTimeDate.setTime(e.detail);
		$$invalidate(5, unixMillis = e.detail);
		$$invalidate(6, hour = newTimeDate.getHours());
		$$invalidate(7, minute = newTimeDate.getMinutes());
		$$invalidate(8, second = newTimeDate.getSeconds());

		if (unixValue) {
			dispatch("day-click", e.detail / 1000);
		} else {
			dispatch("day-click", newTimeDate);
		}
	};

	const closeTimePicker = e => {
		e.preventDefault();
		e.stopPropagation();

		if (container.contains(e.target)) {
			return;
		}

		console.log("Closing Time display");

		// if(e.target.contains())
		$$invalidate(10, showTime = false);

		setCloseListener(false);
	};

	const setCloseListener = (active = true) => {
		if (active) {
			document.addEventListener("click", closeTimePicker);
			console.log("Added listener");
		} else {
			document.removeEventListener("click", closeTimePicker);
			console.log("Removed listener");
		}
	};

	onMount(() => {
		alignNumber();
	});

	const writable_props = [
		'weekday',
		'inactive',
		'holiday',
		'events',
		'unixValue',
		'unixMillis',
		'hour',
		'minute',
		'second'
	];

	Object.keys($$props).forEach(key => {
		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$2.warn(`<DayWithEvent> was created with unknown prop '${key}'`);
	});

	function day_weekday_binding(value) {
		weekday = value;
		$$invalidate(0, weekday);
	}

	function day_inactive_binding(value) {
		inactive = value;
		$$invalidate(1, inactive);
	}

	function day_holiday_binding(value) {
		holiday = value;
		$$invalidate(2, holiday);
	}

	function day_events_binding(value) {
		events = value;
		$$invalidate(3, events);
	}

	function day_unixValue_binding(value) {
		unixValue = value;
		$$invalidate(4, unixValue);
	}

	function day_unixMillis_binding(value) {
		unixMillis = value;
		$$invalidate(5, unixMillis);
	}

	const day_click_handler = e => dayClicked(e);

	function timepoint_hour_binding(value) {
		hour = value;
		$$invalidate(6, hour);
	}

	function timepoint_minute_binding(value) {
		minute = value;
		$$invalidate(7, minute);
	}

	function timepoint_second_binding(value) {
		second = value;
		$$invalidate(8, second);
	}

	function timepoint_unixMillis_binding(value) {
		unixMillis = value;
		$$invalidate(5, unixMillis);
	}

	function timepoint_timePointPosition_binding(value) {
		timePointPosition = value;
		$$invalidate(12, timePointPosition);
	}

	function timepoint_unix_binding(value) {
		unixValue = value;
		$$invalidate(4, unixValue);
	}

	const change_handler = e => onTimeChange(e);

	function timepoint_hour_binding_1(value) {
		hour = value;
		$$invalidate(6, hour);
	}

	function timepoint_minute_binding_1(value) {
		minute = value;
		$$invalidate(7, minute);
	}

	function timepoint_second_binding_1(value) {
		second = value;
		$$invalidate(8, second);
	}

	function timepoint_unixMillis_binding_1(value) {
		unixMillis = value;
		$$invalidate(5, unixMillis);
	}

	function timepoint_timePointPosition_binding_1(value) {
		timePointPosition = value;
		$$invalidate(12, timePointPosition);
	}

	function timepoint_unix_binding_1(value) {
		unixValue = value;
		$$invalidate(4, unixValue);
	}

	const change_handler_1 = e => onTimeChange(e);

	function div_binding($$value) {
		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
			container = $$value;
			$$invalidate(9, container);
		});
	}

	$$self.$$set = $$props => {
		if ('weekday' in $$props) $$invalidate(0, weekday = $$props.weekday);
		if ('inactive' in $$props) $$invalidate(1, inactive = $$props.inactive);
		if ('holiday' in $$props) $$invalidate(2, holiday = $$props.holiday);
		if ('events' in $$props) $$invalidate(3, events = $$props.events);
		if ('unixValue' in $$props) $$invalidate(4, unixValue = $$props.unixValue);
		if ('unixMillis' in $$props) $$invalidate(5, unixMillis = $$props.unixMillis);
		if ('hour' in $$props) $$invalidate(6, hour = $$props.hour);
		if ('minute' in $$props) $$invalidate(7, minute = $$props.minute);
		if ('second' in $$props) $$invalidate(8, second = $$props.second);
	};

	$$self.$capture_state = () => ({
		createEventDispatcher,
		onMount,
		Day,
		TimePoint,
		weekday,
		inactive,
		holiday,
		events,
		unixValue,
		unixMillis,
		hour,
		minute,
		second,
		container,
		showTime,
		DISPLAY_LEFT,
		DISPLAY_RIGHT,
		DISPLAY_CENTER,
		displayMask,
		timePointPosition,
		value,
		timePositionCss,
		alignNumber,
		dispatch,
		dayClicked,
		onTimeChange,
		closeTimePicker,
		setCloseListener
	});

	$$self.$inject_state = $$props => {
		if ('weekday' in $$props) $$invalidate(0, weekday = $$props.weekday);
		if ('inactive' in $$props) $$invalidate(1, inactive = $$props.inactive);
		if ('holiday' in $$props) $$invalidate(2, holiday = $$props.holiday);
		if ('events' in $$props) $$invalidate(3, events = $$props.events);
		if ('unixValue' in $$props) $$invalidate(4, unixValue = $$props.unixValue);
		if ('unixMillis' in $$props) $$invalidate(5, unixMillis = $$props.unixMillis);
		if ('hour' in $$props) $$invalidate(6, hour = $$props.hour);
		if ('minute' in $$props) $$invalidate(7, minute = $$props.minute);
		if ('second' in $$props) $$invalidate(8, second = $$props.second);
		if ('container' in $$props) $$invalidate(9, container = $$props.container);
		if ('showTime' in $$props) $$invalidate(10, showTime = $$props.showTime);
		if ('displayMask' in $$props) $$invalidate(11, displayMask = $$props.displayMask);
		if ('timePointPosition' in $$props) $$invalidate(12, timePointPosition = $$props.timePointPosition);
		if ('value' in $$props) value = $$props.value;
		if ('timePositionCss' in $$props) timePositionCss = $$props.timePositionCss;
	};

	if ($$props && "$$inject" in $$props) {
		$$self.$inject_state($$props.$$inject);
	}

	return [
		weekday,
		inactive,
		holiday,
		events,
		unixValue,
		unixMillis,
		hour,
		minute,
		second,
		container,
		showTime,
		displayMask,
		timePointPosition,
		dayClicked,
		onTimeChange,
		day_weekday_binding,
		day_inactive_binding,
		day_holiday_binding,
		day_events_binding,
		day_unixValue_binding,
		day_unixMillis_binding,
		day_click_handler,
		timepoint_hour_binding,
		timepoint_minute_binding,
		timepoint_second_binding,
		timepoint_unixMillis_binding,
		timepoint_timePointPosition_binding,
		timepoint_unix_binding,
		change_handler,
		timepoint_hour_binding_1,
		timepoint_minute_binding_1,
		timepoint_second_binding_1,
		timepoint_unixMillis_binding_1,
		timepoint_timePointPosition_binding_1,
		timepoint_unix_binding_1,
		change_handler_1,
		div_binding
	];
}

class DayWithEvent extends SvelteComponentDev {
	constructor(options) {
		super(options);

		init(
			this,
			options,
			instance$6,
			create_fragment$6,
			safe_not_equal,
			{
				weekday: 0,
				inactive: 1,
				holiday: 2,
				events: 3,
				unixValue: 4,
				unixMillis: 5,
				hour: 6,
				minute: 7,
				second: 8
			},
			null,
			[-1, -1]
		);

		dispatch_dev("SvelteRegisterComponent", {
			component: this,
			tagName: "DayWithEvent",
			options,
			id: create_fragment$6.name
		});
	}

	get weekday() {
		throw new Error("<DayWithEvent>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set weekday(value) {
		throw new Error("<DayWithEvent>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get inactive() {
		throw new Error("<DayWithEvent>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set inactive(value) {
		throw new Error("<DayWithEvent>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get holiday() {
		throw new Error("<DayWithEvent>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set holiday(value) {
		throw new Error("<DayWithEvent>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get events() {
		throw new Error("<DayWithEvent>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set events(value) {
		throw new Error("<DayWithEvent>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get unixValue() {
		throw new Error("<DayWithEvent>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set unixValue(value) {
		throw new Error("<DayWithEvent>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get unixMillis() {
		throw new Error("<DayWithEvent>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set unixMillis(value) {
		throw new Error("<DayWithEvent>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get hour() {
		throw new Error("<DayWithEvent>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set hour(value) {
		throw new Error("<DayWithEvent>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get minute() {
		throw new Error("<DayWithEvent>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set minute(value) {
		throw new Error("<DayWithEvent>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get second() {
		throw new Error("<DayWithEvent>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set second(value) {
		throw new Error("<DayWithEvent>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}
}

/* src/components/Month.svelte generated by Svelte v3.44.0 */

const { console: console_1$1 } = globals;
const file$5 = "src/components/Month.svelte";

function get_each_context$3(ctx, list, i) {
	const child_ctx = ctx.slice();
	child_ctx[17] = list[i];
	return child_ctx;
}

function get_each_context_1$1(ctx, list, i) {
	const child_ctx = ctx.slice();
	child_ctx[17] = list[i];
	return child_ctx;
}

// (244:6) {:else}
function create_else_block$1(ctx) {
	let div;
	let t0_value = /*day*/ ctx[17].name + "";
	let t0;
	let t1;
	let div_title_value;
	let div_data_index_value;

	const block = {
		c: function create() {
			div = element("div");
			t0 = text(t0_value);
			t1 = space();
			attr_dev(div, "class", "day-header svelte-12luhwf");
			attr_dev(div, "title", div_title_value = /*day*/ ctx[17].name);
			attr_dev(div, "data-index", div_data_index_value = /*day*/ ctx[17].index);
			add_location(div, file$5, 244, 8, 6383);
		},
		m: function mount(target, anchor) {
			insert_dev(target, div, anchor);
			append_dev(div, t0);
			append_dev(div, t1);
		},
		p: function update(ctx, dirty) {
			if (dirty & /*dayHeaders*/ 4 && t0_value !== (t0_value = /*day*/ ctx[17].name + "")) set_data_dev(t0, t0_value);

			if (dirty & /*dayHeaders*/ 4 && div_title_value !== (div_title_value = /*day*/ ctx[17].name)) {
				attr_dev(div, "title", div_title_value);
			}

			if (dirty & /*dayHeaders*/ 4 && div_data_index_value !== (div_data_index_value = /*day*/ ctx[17].index)) {
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
		source: "(244:6) {:else}",
		ctx
	});

	return block;
}

// (240:6) {#if clientWidth < 720}
function create_if_block_1$1(ctx) {
	let div;
	let t0_value = /*day*/ ctx[17].name.charAt(0) + "";
	let t0;
	let t1;
	let div_title_value;
	let div_data_index_value;

	const block = {
		c: function create() {
			div = element("div");
			t0 = text(t0_value);
			t1 = space();
			attr_dev(div, "class", "day-header svelte-12luhwf");
			attr_dev(div, "title", div_title_value = /*day*/ ctx[17].name);
			attr_dev(div, "data-index", div_data_index_value = /*day*/ ctx[17].index);
			add_location(div, file$5, 240, 8, 6250);
		},
		m: function mount(target, anchor) {
			insert_dev(target, div, anchor);
			append_dev(div, t0);
			append_dev(div, t1);
		},
		p: function update(ctx, dirty) {
			if (dirty & /*dayHeaders*/ 4 && t0_value !== (t0_value = /*day*/ ctx[17].name.charAt(0) + "")) set_data_dev(t0, t0_value);

			if (dirty & /*dayHeaders*/ 4 && div_title_value !== (div_title_value = /*day*/ ctx[17].name)) {
				attr_dev(div, "title", div_title_value);
			}

			if (dirty & /*dayHeaders*/ 4 && div_data_index_value !== (div_data_index_value = /*day*/ ctx[17].index)) {
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
		source: "(240:6) {#if clientWidth < 720}",
		ctx
	});

	return block;
}

// (239:4) {#each dayHeaders as day}
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
		source: "(239:4) {#each dayHeaders as day}",
		ctx
	});

	return block;
}

// (252:4) {#if days.length}
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
		source: "(252:4) {#if days.length}",
		ctx
	});

	return block;
}

// (253:6) {#each days as day}
function create_each_block$3(ctx) {
	let daywithevent;
	let current;

	daywithevent = new DayWithEvent({
			props: {
				weekday: /*day*/ ctx[17].weekday,
				inactive: /*day*/ ctx[17].inactive,
				holiday: /*day*/ ctx[17].holiday,
				unixMillis: /*day*/ ctx[17].unixMillis,
				unixValue: /*unixValue*/ ctx[0]
			},
			$$inline: true
		});

	daywithevent.$on("day-click", /*day_click_handler*/ ctx[12]);

	const block = {
		c: function create() {
			create_component(daywithevent.$$.fragment);
		},
		m: function mount(target, anchor) {
			mount_component(daywithevent, target, anchor);
			current = true;
		},
		p: function update(ctx, dirty) {
			const daywithevent_changes = {};
			if (dirty & /*days*/ 2) daywithevent_changes.weekday = /*day*/ ctx[17].weekday;
			if (dirty & /*days*/ 2) daywithevent_changes.inactive = /*day*/ ctx[17].inactive;
			if (dirty & /*days*/ 2) daywithevent_changes.holiday = /*day*/ ctx[17].holiday;
			if (dirty & /*days*/ 2) daywithevent_changes.unixMillis = /*day*/ ctx[17].unixMillis;
			if (dirty & /*unixValue*/ 1) daywithevent_changes.unixValue = /*unixValue*/ ctx[0];
			daywithevent.$set(daywithevent_changes);
		},
		i: function intro(local) {
			if (current) return;
			transition_in(daywithevent.$$.fragment, local);
			current = true;
		},
		o: function outro(local) {
			transition_out(daywithevent.$$.fragment, local);
			current = false;
		},
		d: function destroy(detaching) {
			destroy_component(daywithevent, detaching);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_each_block$3.name,
		type: "each",
		source: "(253:6) {#each days as day}",
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
			attr_dev(div0, "class", "days svelte-12luhwf");
			add_location(div0, file$5, 237, 2, 6163);
			attr_dev(div1, "class", "days svelte-12luhwf");
			add_location(div1, file$5, 250, 2, 6519);
			attr_dev(div2, "class", "month svelte-12luhwf");
			add_render_callback(() => /*div2_elementresize_handler*/ ctx[13].call(div2));
			add_location(div2, file$5, 236, 0, 6124);
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
			div2_resize_listener = add_resize_listener(div2, /*div2_elementresize_handler*/ ctx[13].bind(div2));
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

const getDaysInMonth = unixMillis => {
	let date = new Date();
	date.setTime(unixMillis);
	let year = date.getFullYear();
	let month = date.getMonth() + 1;
	date.setFullYear(year, month, 0);
	return date.getDate();
};

const getFirstDayInMonth = unixMillis => {
	let date = new Date();
	date.setTime(unixMillis);
	date.setDate(1);
	return date.getTime();
};

const getWeekDay = unixMillis => {
	let date = new Date();
	date.setTime(unixMillis);
	return date.getDay();
};

const isWeekEnd = unixMillis => {
	let date = new Date();
	date.setTime(unixMillis);
	return date.getDay() === 0 || date.getDay() === 6;
};

const getNextDay = unixMillis => {
	// let date = new Date();
	// date.setTime(unixMillis);
	// date.setFullYear(date.getFullYear(), date.getMonth(), date.getDate() + 1);
	// return date.getTime();
	return unixMillis + millisInDay;
};

const getPreviousDay = unixMillis => {
	// let date = new Date();
	// date.setTime(unixMillis);
	// date.setMonth(date.getMonth(), date.getDate() - 1);
	// return date.getTime();
	return unixMillis - millisInDay;
};

const getNextMonth = unixMillis => {
	let date = new Date();
	date.setTime(unixMillis);
	date.setFullYear(date.getFullYear(), date.getMonth() + 1, 1);
	return date.getTime();
};

const getPreviousMonth = unixMillis => {
	let date = new Date();
	date.setTime(unixMillis);
	date.setFullYear(date.getFullYear(), date.getMonth() - 1, 1);
	return date.getTime();
};

const millisInDay = 86400000;

function instance$5($$self, $$props, $$invalidate) {
	let { $$slots: slots = {}, $$scope } = $$props;
	validate_slots('Month', slots, []);
	let { date = new Date() } = $$props;
	let { month = 1 } = $$props;
	let { year = 1970 } = $$props;
	let { firstDayOrder = 1 } = $$props;
	let { value = 0 } = $$props;
	let { unixValue = false } = $$props;
	let { unixMillis = 0 } = $$props;
	const dispatch = createEventDispatcher();
	let days = [];
	let dayHeaders = [];

	// Ensure numbers;
	month = month - 0;

	year = year - 0;
	firstDayOrder = firstDayOrder - 0;

	if (unixMillis > 0) {
		date.setTime(unixMillis);
		month = date.getMonth() + 1;
		year = date.getFullYear();
		console.log("Set unixMillis in Month", month, year, unixMillis);
	} else {
		date.setFullYear(year, month - 1);
	}

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

	const dayClicked = date => {
		if (date !== null) {
			dispatch("day-click", date);
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

	const setDays = unixMillis => {
		const numDays = getDaysInMonth(unixMillis);
		const firstMonthDay = getFirstDayInMonth(unixMillis);
		let monthDays = [];
		let currentDay = firstMonthDay;
		console.log("current; first; numDays", currentDay, firstMonthDay, numDays);

		for (let i = 1; i <= numDays; i++) {
			monthDays.push({
				weekday: getWeekDay(currentDay),
				inactive: false,
				holiday: isWeekEnd(currentDay),
				// holiday: false,
				unixMillis: currentDay
			});

			currentDay = getNextDay(currentDay);
		}

		let orderDiff = getWeekDay(firstMonthDay) - firstDayOrder;

		if (orderDiff < 0) {
			orderDiff = orderDiff + 7;
		}

		currentDay = firstMonthDay;

		for (let i = orderDiff; i > 0; i--) {
			currentDay = getPreviousDay(currentDay);

			monthDays = [
				{
					weekday: getWeekDay(currentDay),
					inactive: true,
					// holiday: isWeekEnd(currentDay),
					holiday: false,
					unixMillis: currentDay
				},
				...monthDays
			];
		}

		let nextMonthDiff = 7 - monthDays.length % 7;

		if (nextMonthDiff === 7) {
			nextMonthDiff = 0;
		}

		currentDay = getNextMonth(firstMonthDay);

		for (let i = 0; i < nextMonthDiff; i++) {
			monthDays.push({
				weekday: getWeekDay(currentDay),
				inactive: true,
				// holiday: isWeekEnd(currentDay),
				holiday: false,
				unixMillis: currentDay
			});

			currentDay = getNextDay(currentDay);
		}

		$$invalidate(1, days = monthDays);
	};

	fillDayHeaders();
	setDays(unixMillis);
	let clientWidth = 0;

	onMount(() => {
		
	}); // clientWidth =

	const writable_props = [
		'date',
		'month',
		'year',
		'firstDayOrder',
		'value',
		'unixValue',
		'unixMillis',
		'i18n'
	];

	Object.keys($$props).forEach(key => {
		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$1.warn(`<Month> was created with unknown prop '${key}'`);
	});

	const day_click_handler = e => dayClicked(e.detail);

	function div2_elementresize_handler() {
		clientWidth = this.clientWidth;
		$$invalidate(3, clientWidth);
	}

	$$self.$$set = $$props => {
		if ('date' in $$props) $$invalidate(8, date = $$props.date);
		if ('month' in $$props) $$invalidate(5, month = $$props.month);
		if ('year' in $$props) $$invalidate(6, year = $$props.year);
		if ('firstDayOrder' in $$props) $$invalidate(7, firstDayOrder = $$props.firstDayOrder);
		if ('value' in $$props) $$invalidate(9, value = $$props.value);
		if ('unixValue' in $$props) $$invalidate(0, unixValue = $$props.unixValue);
		if ('unixMillis' in $$props) $$invalidate(10, unixMillis = $$props.unixMillis);
		if ('i18n' in $$props) $$invalidate(11, i18n = $$props.i18n);
	};

	$$self.$capture_state = () => ({
		dateIncrementDay,
		dateDecrementDay,
		dateIncrementMonth,
		dateDecrementMonth,
		dateIsNextMonth,
		dateIsPreviousMonth,
		getDaysInMonth,
		getFirstDayInMonth,
		getWeekDay,
		isWeekEnd,
		getNextDay,
		getPreviousDay,
		getNextMonth,
		getPreviousMonth,
		millisInDay,
		DayWithEvent,
		createEventDispatcher,
		onMount,
		date,
		month,
		year,
		firstDayOrder,
		value,
		unixValue,
		unixMillis,
		dispatch,
		days,
		dayHeaders,
		i18n,
		dayClicked,
		fillDayHeaders,
		setDays,
		clientWidth
	});

	$$self.$inject_state = $$props => {
		if ('date' in $$props) $$invalidate(8, date = $$props.date);
		if ('month' in $$props) $$invalidate(5, month = $$props.month);
		if ('year' in $$props) $$invalidate(6, year = $$props.year);
		if ('firstDayOrder' in $$props) $$invalidate(7, firstDayOrder = $$props.firstDayOrder);
		if ('value' in $$props) $$invalidate(9, value = $$props.value);
		if ('unixValue' in $$props) $$invalidate(0, unixValue = $$props.unixValue);
		if ('unixMillis' in $$props) $$invalidate(10, unixMillis = $$props.unixMillis);
		if ('days' in $$props) $$invalidate(1, days = $$props.days);
		if ('dayHeaders' in $$props) $$invalidate(2, dayHeaders = $$props.dayHeaders);
		if ('i18n' in $$props) $$invalidate(11, i18n = $$props.i18n);
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
		date,
		value,
		unixMillis,
		i18n,
		day_click_handler,
		div2_elementresize_handler
	];
}

class Month extends SvelteComponentDev {
	constructor(options) {
		super(options);

		init(this, options, instance$5, create_fragment$5, safe_not_equal, {
			date: 8,
			month: 5,
			year: 6,
			firstDayOrder: 7,
			value: 9,
			unixValue: 0,
			unixMillis: 10,
			i18n: 11
		});

		dispatch_dev("SvelteRegisterComponent", {
			component: this,
			tagName: "Month",
			options,
			id: create_fragment$5.name
		});
	}

	get date() {
		throw new Error("<Month>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set date(value) {
		throw new Error("<Month>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
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

	get unixMillis() {
		throw new Error("<Month>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set unixMillis(value) {
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

// (114:2) {#if showOptions}
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

			attr_dev(div, "class", "select-items svelte-1edw3md");
			add_location(div, file$4, 114, 4, 2942);
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
		source: "(114:2) {#if showOptions}",
		ctx
	});

	return block;
}

// (116:6) {#each optionsArr as option}
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
			: "") + " svelte-1edw3md"));

			add_location(div, file$4, 116, 8, 3012);
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
			: "") + " svelte-1edw3md"))) {
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
		source: "(116:6) {#each optionsArr as option}",
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
			attr_dev(select, "class", "svelte-1edw3md");
			if (/*value*/ ctx[0] === void 0) add_render_callback(() => /*select_change_handler*/ ctx[11].call(select));
			add_location(select, file$4, 102, 2, 2616);
			attr_dev(div0, "class", "select-selected svelte-1edw3md");
			attr_dev(div0, "style", div0_style_value = /*showOptions*/ ctx[6] ? "visibility:hidden;" : "");
			add_location(div0, file$4, 105, 2, 2710);
			attr_dev(div1, "class", "select-container svelte-1edw3md");
			add_location(div1, file$4, 101, 0, 2561);
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

// (52:2) {#if showOptions}
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
			attr_dev(span, "class", "triangle tr-up tr-inc-dec-trigger svelte-1ffma40");
			add_location(span, file$3, 57, 6, 1371);
			attr_dev(div, "class", "increment tr-inc-dec-trigger svelte-1ffma40");
			attr_dev(div, "style", div_style_value = !/*showOptions*/ ctx[1] ? "visibility:hidden;" : "");
			add_location(div, file$3, 52, 4, 1201);
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
		source: "(52:2) {#if showOptions}",
		ctx
	});

	return block;
}

// (69:4) {:else}
function create_else_block(ctx) {
	let p;
	let t;

	const block = {
		c: function create() {
			p = element("p");
			t = text(/*value*/ ctx[0]);
			attr_dev(p, "class", "svelte-1ffma40");
			add_location(p, file$3, 69, 6, 1698);
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
		source: "(69:4) {:else}",
		ctx
	});

	return block;
}

// (62:4) {#if showOptions}
function create_if_block_1(ctx) {
	let input;
	let mounted;
	let dispose;

	const block = {
		c: function create() {
			input = element("input");
			attr_dev(input, "class", "number svelte-1ffma40");
			attr_dev(input, "type", "number");
			add_location(input, file$3, 62, 6, 1544);
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
		source: "(62:4) {#if showOptions}",
		ctx
	});

	return block;
}

// (73:2) {#if showOptions}
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
			attr_dev(span, "class", "triangle tr-down tr-inc-dec-trigger svelte-1ffma40");
			add_location(span, file$3, 78, 6, 1926);
			attr_dev(div, "class", "decrement tr-inc-dec-trigger svelte-1ffma40");
			attr_dev(div, "style", div_style_value = !/*showOptions*/ ctx[1] ? "visibility:hidden;" : "");
			add_location(div, file$3, 73, 4, 1756);
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
		source: "(73:2) {#if showOptions}",
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
			attr_dev(div0, "class", "selected svelte-1ffma40");
			add_location(div0, file$3, 60, 2, 1443);
			attr_dev(div1, "class", "select-number-container svelte-1ffma40");
			add_location(div1, file$3, 50, 0, 1139);
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
	child_ctx[26] = list[i];
	return child_ctx;
}

function get_each_context_1(ctx, list, i) {
	const child_ctx = ctx.slice();
	child_ctx[29] = list[i];
	child_ctx[31] = i;
	return child_ctx;
}

// (147:4) {#if aMonth.status & STATUS_ACTIVE}
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
				value: /*aMonth*/ ctx[26].month,
				$$slots: { default: [create_default_slot] },
				$$scope: { ctx }
			},
			$$inline: true
		});

	select.$on("change", /*change_handler*/ ctx[16]);

	selectnumber = new SelectNumber({
			props: {
				showOptions: /*showYearSelector*/ ctx[6],
				value: /*aMonth*/ ctx[26].year
			},
			$$inline: true
		});

	selectnumber.$on("change", /*change_handler_1*/ ctx[17]);

	function month_1_value_binding(value) {
		/*month_1_value_binding*/ ctx[19](value);
	}

	let month_1_props = {
		year: /*aMonth*/ ctx[26].year,
		month: /*aMonth*/ ctx[26].month,
		unixMillis: /*aMonth*/ ctx[26].unixMillis,
		firstDayOrder: /*firstDayOrder*/ ctx[1],
		unixValue: /*unixValue*/ ctx[3],
		i18n: /*i18n*/ ctx[2]
	};

	if (/*value*/ ctx[0] !== void 0) {
		month_1_props.value = /*value*/ ctx[0];
	}

	month_1 = new Month({ props: month_1_props, $$inline: true });
	binding_callbacks.push(() => bind(month_1, 'value', month_1_value_binding));
	month_1.$on("day-click", /*day_click_handler*/ ctx[20]);

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
			attr_dev(div0, "class", "triangle tr-left svelte-1p0701r");
			add_location(div0, file$2, 148, 14, 3520);
			attr_dev(span0, "class", "svelte-1p0701r");
			add_location(span0, file$2, 148, 8, 3514);
			attr_dev(span1, "class", "svelte-1p0701r");
			add_location(span1, file$2, 149, 8, 3595);
			attr_dev(span2, "class", "svelte-1p0701r");
			add_location(span2, file$2, 156, 8, 3866);
			attr_dev(div1, "class", "triangle tr-right svelte-1p0701r");
			add_location(div1, file$2, 164, 11, 4071);
			attr_dev(span3, "class", "svelte-1p0701r");
			add_location(span3, file$2, 163, 8, 4054);
			attr_dev(div2, "class", "description svelte-1p0701r");
			add_location(div2, file$2, 147, 6, 3480);
			add_location(div3, file$2, 168, 8, 4214);
			attr_dev(div4, "class", "months svelte-1p0701r");
			add_render_callback(() => /*div4_elementresize_handler*/ ctx[21].call(div4));
			add_location(div4, file$2, 167, 6, 4168);
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
			div4_resize_listener = add_resize_listener(div4, /*div4_elementresize_handler*/ ctx[21].bind(div4));
			current = true;

			if (!mounted) {
				dispose = [
					listen_dev(div0, "click", /*click_handler*/ ctx[15], false, false, false),
					listen_dev(div1, "click", /*click_handler_1*/ ctx[18], false, false, false)
				];

				mounted = true;
			}
		},
		p: function update(ctx, dirty) {
			const select_changes = {};
			if (dirty[0] & /*monthsArr*/ 32) select_changes.value = /*aMonth*/ ctx[26].month;

			if (dirty[0] & /*i18n*/ 4 | dirty[1] & /*$$scope*/ 2) {
				select_changes.$$scope = { dirty, ctx };
			}

			select.$set(select_changes);
			const selectnumber_changes = {};
			if (dirty[0] & /*showYearSelector*/ 64) selectnumber_changes.showOptions = /*showYearSelector*/ ctx[6];
			if (dirty[0] & /*monthsArr*/ 32) selectnumber_changes.value = /*aMonth*/ ctx[26].year;
			selectnumber.$set(selectnumber_changes);
			const month_1_changes = {};
			if (dirty[0] & /*monthsArr*/ 32) month_1_changes.year = /*aMonth*/ ctx[26].year;
			if (dirty[0] & /*monthsArr*/ 32) month_1_changes.month = /*aMonth*/ ctx[26].month;
			if (dirty[0] & /*monthsArr*/ 32) month_1_changes.unixMillis = /*aMonth*/ ctx[26].unixMillis;
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
		source: "(147:4) {#if aMonth.status & STATUS_ACTIVE}",
		ctx
	});

	return block;
}

// (152:12) {#each i18n.monthsToDisplay as monthOption, index}
function create_each_block_1(ctx) {
	let option;
	let t_value = /*monthOption*/ ctx[29] + "";
	let t;

	const block = {
		c: function create() {
			option = element("option");
			t = text(t_value);
			option.__value = /*index*/ ctx[31] + 1;
			option.value = option.__value;
			add_location(option, file$2, 152, 14, 3753);
		},
		m: function mount(target, anchor) {
			insert_dev(target, option, anchor);
			append_dev(option, t);
		},
		p: function update(ctx, dirty) {
			if (dirty[0] & /*i18n*/ 4 && t_value !== (t_value = /*monthOption*/ ctx[29] + "")) set_data_dev(t, t_value);
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(option);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_each_block_1.name,
		type: "each",
		source: "(152:12) {#each i18n.monthsToDisplay as monthOption, index}",
		ctx
	});

	return block;
}

// (151:10) <Select value={aMonth.month} on:change={(e) => monthChange(e)}>
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
		source: "(151:10) <Select value={aMonth.month} on:change={(e) => monthChange(e)}>",
		ctx
	});

	return block;
}

// (146:2) {#each monthsArr as aMonth}
function create_each_block$1(ctx) {
	let if_block_anchor;
	let current;
	let if_block = /*aMonth*/ ctx[26].status & STATUS_ACTIVE && create_if_block(ctx);

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
			if (/*aMonth*/ ctx[26].status & STATUS_ACTIVE) {
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
		source: "(146:2) {#each monthsArr as aMonth}",
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
			add_location(div, file$2, 144, 0, 3380);
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
	let { unixMillis = 0 } = $$props;

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

	const setActive = (year, month, unixMillis = -1) => {
		let index = -1;

		if (unixMillis > 0) {
			let mDate = new Date();
			mDate.setTime(unixMillis);
			year = mDate.getFullYear();
			month = mDate.getMonth() + 1;
		}

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
			dateActive = {
				year,
				month,
				unixMillis: new Date(year, month - 1, 1).getTime(),
				status: STATUS_ACTIVE
			};

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

	const writable_props = ['year', 'month', 'firstDayOrder', 'value', 'i18n', 'unixValue', 'unixMillis'];

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
		if ('unixMillis' in $$props) $$invalidate(14, unixMillis = $$props.unixMillis);
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
		unixMillis,
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
		if ('unixMillis' in $$props) $$invalidate(14, unixMillis = $$props.unixMillis);
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
		unixMillis,
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
				unixValue: 3,
				unixMillis: 14
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

	get unixMillis() {
		throw new Error("<MonthView>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set unixMillis(value) {
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

// (25:4) {#each events as event}
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
			add_location(span, file$1, 26, 8, 665);
			add_location(div, file$1, 25, 6, 651);
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
		source: "(25:4) {#each events as event}",
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

			attr_dev(i0, "class", "arrow left svelte-jyoyj9");
			add_location(i0, file$1, 19, 10, 476);
			attr_dev(span0, "class", "svelte-jyoyj9");
			add_location(span0, file$1, 19, 4, 470);
			attr_dev(span1, "class", "svelte-jyoyj9");
			add_location(span1, file$1, 20, 4, 512);
			attr_dev(i1, "class", "arrow right svelte-jyoyj9");
			add_location(i1, file$1, 21, 10, 552);
			attr_dev(span2, "class", "svelte-jyoyj9");
			add_location(span2, file$1, 21, 4, 546);
			attr_dev(div0, "class", "description svelte-jyoyj9");
			add_location(div0, file$1, 18, 2, 440);
			attr_dev(div1, "class", "events");
			add_location(div1, file$1, 23, 2, 596);
			add_location(div2, file$1, 17, 0, 413);
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
		dispatch("day-click", { day, month, year });
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
	let updating_unixMillis;
	let current;

	function monthview_year_binding(value) {
		/*monthview_year_binding*/ ctx[11](value);
	}

	function monthview_month_binding(value) {
		/*monthview_month_binding*/ ctx[12](value);
	}

	function monthview_value_binding(value) {
		/*monthview_value_binding*/ ctx[13](value);
	}

	function monthview_unixMillis_binding(value) {
		/*monthview_unixMillis_binding*/ ctx[14](value);
	}

	let monthview_props = {
		firstDayOrder: /*firstDayOrder*/ ctx[4],
		unixValue: /*unixValue*/ ctx[5]
	};

	if (/*year*/ ctx[0] !== void 0) {
		monthview_props.year = /*year*/ ctx[0];
	}

	if (/*month*/ ctx[1] !== void 0) {
		monthview_props.month = /*month*/ ctx[1];
	}

	if (/*value*/ ctx[3] !== void 0) {
		monthview_props.value = /*value*/ ctx[3];
	}

	if (/*unixMillis*/ ctx[2] !== void 0) {
		monthview_props.unixMillis = /*unixMillis*/ ctx[2];
	}

	monthview = new MonthView({ props: monthview_props, $$inline: true });
	binding_callbacks.push(() => bind(monthview, 'year', monthview_year_binding));
	binding_callbacks.push(() => bind(monthview, 'month', monthview_month_binding));
	binding_callbacks.push(() => bind(monthview, 'value', monthview_value_binding));
	binding_callbacks.push(() => bind(monthview, 'unixMillis', monthview_unixMillis_binding));
	monthview.$on("day-click", /*day_click_handler*/ ctx[15]);

	const block = {
		c: function create() {
			div = element("div");
			create_component(monthview.$$.fragment);
			attr_dev(div, "class", "calendar svelte-mf1to4");
			attr_dev(div, "style", /*getCssVariablesString*/ ctx[6]());
			attr_dev(div, "data-calendartarget", "calendar");
			add_location(div, file, 65, 0, 1504);
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
			if (dirty & /*firstDayOrder*/ 16) monthview_changes.firstDayOrder = /*firstDayOrder*/ ctx[4];
			if (dirty & /*unixValue*/ 32) monthview_changes.unixValue = /*unixValue*/ ctx[5];

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

			if (!updating_value && dirty & /*value*/ 8) {
				updating_value = true;
				monthview_changes.value = /*value*/ ctx[3];
				add_flush_callback(() => updating_value = false);
			}

			if (!updating_unixMillis && dirty & /*unixMillis*/ 4) {
				updating_unixMillis = true;
				monthview_changes.unixMillis = /*unixMillis*/ ctx[2];
				add_flush_callback(() => updating_unixMillis = false);
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
	let { unixMillis = 0 } = $$props;

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
		return "--clr-bg:" + classes.colorBg + ";" + "--clr-bg-d:" + classes.colorBgDisabled + ";" + "--clr-bg-h:" + classes.colorBgHover + ";" + "--clr-bg-hol:" + classes.colorBgHoliday;
	};

	const setYearView = () => {
		$$invalidate(9, view = 0b00000001);
	};

	const setMonthView = () => {
		$$invalidate(9, view = 0b00000010);
	};

	const setDayView = e => {
		$$invalidate(9, view = 0b00000100);
	};

	const setEventView = () => {
		$$invalidate(9, view = 0b00000001);
	};

	const setDayValue = e => {
		$$invalidate(3, value = e.detail);
		console.log("Day value in top Calendar:", value);
	};

	const writable_props = [
		'year',
		'month',
		'day',
		'unixMillis',
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
		$$invalidate(3, value);
	}

	function monthview_unixMillis_binding(value) {
		unixMillis = value;
		$$invalidate(2, unixMillis);
	}

	const day_click_handler = e => setDayValue(e);

	$$self.$$set = $$props => {
		if ('year' in $$props) $$invalidate(0, year = $$props.year);
		if ('month' in $$props) $$invalidate(1, month = $$props.month);
		if ('day' in $$props) $$invalidate(8, day = $$props.day);
		if ('unixMillis' in $$props) $$invalidate(2, unixMillis = $$props.unixMillis);
		if ('classes' in $$props) $$invalidate(10, classes = $$props.classes);
		if ('value' in $$props) $$invalidate(3, value = $$props.value);
		if ('view' in $$props) $$invalidate(9, view = $$props.view);
		if ('firstDayOrder' in $$props) $$invalidate(4, firstDayOrder = $$props.firstDayOrder);
		if ('unixValue' in $$props) $$invalidate(5, unixValue = $$props.unixValue);
	};

	$$self.$capture_state = () => ({
		MonthView,
		SelectNumber,
		DayView,
		year,
		month,
		day,
		unixMillis,
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
		if ('day' in $$props) $$invalidate(8, day = $$props.day);
		if ('unixMillis' in $$props) $$invalidate(2, unixMillis = $$props.unixMillis);
		if ('classes' in $$props) $$invalidate(10, classes = $$props.classes);
		if ('value' in $$props) $$invalidate(3, value = $$props.value);
		if ('view' in $$props) $$invalidate(9, view = $$props.view);
		if ('firstDayOrder' in $$props) $$invalidate(4, firstDayOrder = $$props.firstDayOrder);
		if ('unixValue' in $$props) $$invalidate(5, unixValue = $$props.unixValue);
	};

	if ($$props && "$$inject" in $$props) {
		$$self.$inject_state($$props.$$inject);
	}

	return [
		year,
		month,
		unixMillis,
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
		monthview_unixMillis_binding,
		day_click_handler
	];
}

class Calendar extends SvelteComponentDev {
	constructor(options) {
		super(options);

		init(this, options, instance, create_fragment, safe_not_equal, {
			year: 0,
			month: 1,
			day: 8,
			unixMillis: 2,
			classes: 10,
			value: 3,
			view: 9,
			firstDayOrder: 4,
			unixValue: 5
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

	get unixMillis() {
		throw new Error("<Calendar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set unixMillis(value) {
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

export { Calendar, Day, Month, MonthView, Select, SelectNumber };
