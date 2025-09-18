import { EditorState, Transaction, Selection, Plugin } from 'prosemirror-state';
import { Mark, Node, Slice, ResolvedPos, DOMParser, DOMSerializer } from 'prosemirror-model';
import { Mapping } from 'prosemirror-transform';

type DOMNode = InstanceType<typeof window.Node>;

type WidgetConstructor = ((view: EditorView, getPos: () => number | undefined) => DOMNode) | DOMNode;
declare class Decoration {
    readonly from: number;
    readonly to: number;
    static widget(pos: number, toDOM: WidgetConstructor, spec?: {
        side?: number;
        relaxedSide?: boolean;
        marks?: readonly Mark[];
        stopEvent?: (event: Event) => boolean;
        ignoreSelection?: boolean;
        key?: string;
        destroy?: (node: DOMNode) => void;
        [key: string]: any;
    }): Decoration;
    static inline(from: number, to: number, attrs: DecorationAttrs, spec?: {
        inclusiveStart?: boolean;
        inclusiveEnd?: boolean;
        [key: string]: any;
    }): Decoration;
    static node(from: number, to: number, attrs: DecorationAttrs, spec?: any): Decoration;
    get spec(): any;
}
type DecorationAttrs = {
    nodeName?: string;
    class?: string;
    style?: string;
    [attribute: string]: string | undefined;
};
interface DecorationSource {
    map: (mapping: Mapping, node: Node) => DecorationSource;
    forChild(offset: number, child: Node): DecorationSource;
    forEachSet(f: (set: DecorationSet) => void): void;
}
declare class DecorationSet implements DecorationSource {
    static create(doc: Node, decorations: Decoration[]): DecorationSet;
    find(start?: number, end?: number, predicate?: (spec: any) => boolean): Decoration[];
    private findInner;
    map(mapping: Mapping, doc: Node, options?: {
        onRemove?: (decorationSpec: any) => void;
    }): DecorationSet;
    add(doc: Node, decorations: Decoration[]): DecorationSet;
    private addInner;
    remove(decorations: Decoration[]): DecorationSet;
    private removeInner;
    forChild(offset: number, node: Node): DecorationSet | DecorationGroup;
    static empty: DecorationSet;
    forEachSet(f: (set: DecorationSet) => void): void;
}
declare class DecorationGroup implements DecorationSource {
    readonly members: readonly DecorationSet[];
    constructor(members: readonly DecorationSet[]);
    map(mapping: Mapping, doc: Node): DecorationSource;
    forChild(offset: number, child: Node): DecorationSource | DecorationSet;
    eq(other: DecorationGroup): boolean;
    locals(node: Node): readonly any[];
    static from(members: readonly DecorationSource[]): DecorationSource;
    forEachSet(f: (set: DecorationSet) => void): void;
}

declare global {
    interface Node {
    }
}
type ViewMutationRecord = MutationRecord | {
    type: "selection";
    target: DOMNode;
};
interface NodeView {
    dom: DOMNode;
    contentDOM?: HTMLElement | null;
    update?: (node: Node, decorations: readonly Decoration[], innerDecorations: DecorationSource) => boolean;
    multiType?: boolean;
    selectNode?: () => void;
    deselectNode?: () => void;
    setSelection?: (anchor: number, head: number, root: Document | ShadowRoot) => void;
    stopEvent?: (event: Event) => boolean;
    ignoreMutation?: (mutation: ViewMutationRecord) => boolean;
    destroy?: () => void;
}
interface MarkView {
    dom: DOMNode;
    contentDOM?: HTMLElement | null;
    ignoreMutation?: (mutation: ViewMutationRecord) => boolean;
    destroy?: () => void;
}

declare class EditorView {
    private directPlugins;
    private _root;
    private mounted;
    private prevDirectPlugins;
    private pluginViews;
    state: EditorState;
    constructor(place: null | DOMNode | ((editor: HTMLElement) => void) | {
        mount: HTMLElement;
    }, props: DirectEditorProps);
    readonly dom: HTMLElement;
    editable: boolean;
    dragging: null | {
        slice: Slice;
        move: boolean;
    };
    get composing(): boolean;
    get props(): DirectEditorProps;
    update(props: DirectEditorProps): void;
    setProps(props: Partial<DirectEditorProps>): void;
    updateState(state: EditorState): void;
    lastHeight: number;
    private updateStateInner;
    private destroyPluginViews;
    private updatePluginViews;
    private updateDraggedNode;
    someProp<PropName extends keyof EditorProps, Result>(propName: PropName, f: (value: NonNullable<EditorProps[PropName]>) => Result): Result | undefined;
    someProp<PropName extends keyof EditorProps>(propName: PropName): NonNullable<EditorProps[PropName]> | undefined;
    hasFocus(): boolean;
    focus(): void;
    get root(): Document | ShadowRoot;
    updateRoot(): void;
    posAtCoords(coords: {
        left: number;
        top: number;
    }): {
        pos: number;
        inside: number;
    } | null;
    coordsAtPos(pos: number, side?: number): {
        left: number;
        right: number;
        top: number;
        bottom: number;
    };
    domAtPos(pos: number, side?: number): {
        node: DOMNode;
        offset: number;
    };
    nodeDOM(pos: number): DOMNode | null;
    posAtDOM(node: DOMNode, offset: number, bias?: number): number;
    endOfTextblock(dir: "up" | "down" | "left" | "right" | "forward" | "backward", state?: EditorState): boolean;
    pasteHTML(html: string, event?: ClipboardEvent): boolean;
    pasteText(text: string, event?: ClipboardEvent): boolean;
    serializeForClipboard(slice: Slice): {
        dom: HTMLElement;
        text: string;
        slice: Slice;
    };
    destroy(): void;
    get isDestroyed(): boolean;
    dispatchEvent(event: Event): void;
    dispatch: (tr: Transaction) => void;
}
type NodeViewConstructor = (node: Node, view: EditorView, getPos: () => number | undefined, decorations: readonly Decoration[], innerDecorations: DecorationSource) => NodeView;
type MarkViewConstructor = (mark: Mark, view: EditorView, inline: boolean) => MarkView;
interface DOMEventMap extends HTMLElementEventMap {
    [event: string]: any;
}
interface EditorProps<P = any> {
    handleDOMEvents?: {
        [event in keyof DOMEventMap]?: (this: P, view: EditorView, event: DOMEventMap[event]) => boolean | void;
    };
    handleKeyDown?: (this: P, view: EditorView, event: KeyboardEvent) => boolean | void;
    handleKeyPress?: (this: P, view: EditorView, event: KeyboardEvent) => boolean | void;
    handleTextInput?: (this: P, view: EditorView, from: number, to: number, text: string, deflt: () => Transaction) => boolean | void;
    handleClickOn?: (this: P, view: EditorView, pos: number, node: Node, nodePos: number, event: MouseEvent, direct: boolean) => boolean | void;
    handleClick?: (this: P, view: EditorView, pos: number, event: MouseEvent) => boolean | void;
    handleDoubleClickOn?: (this: P, view: EditorView, pos: number, node: Node, nodePos: number, event: MouseEvent, direct: boolean) => boolean | void;
    handleDoubleClick?: (this: P, view: EditorView, pos: number, event: MouseEvent) => boolean | void;
    handleTripleClickOn?: (this: P, view: EditorView, pos: number, node: Node, nodePos: number, event: MouseEvent, direct: boolean) => boolean | void;
    handleTripleClick?: (this: P, view: EditorView, pos: number, event: MouseEvent) => boolean | void;
    handlePaste?: (this: P, view: EditorView, event: ClipboardEvent, slice: Slice) => boolean | void;
    handleDrop?: (this: P, view: EditorView, event: DragEvent, slice: Slice, moved: boolean) => boolean | void;
    handleScrollToSelection?: (this: P, view: EditorView) => boolean;
    dragCopies?: (event: DragEvent) => boolean;
    createSelectionBetween?: (this: P, view: EditorView, anchor: ResolvedPos, head: ResolvedPos) => Selection | null;
    domParser?: DOMParser;
    transformPastedHTML?: (this: P, html: string, view: EditorView) => string;
    clipboardParser?: DOMParser;
    transformPastedText?: (this: P, text: string, plain: boolean, view: EditorView) => string;
    clipboardTextParser?: (this: P, text: string, $context: ResolvedPos, plain: boolean, view: EditorView) => Slice;
    transformPasted?: (this: P, slice: Slice, view: EditorView, plain: boolean) => Slice;
    transformCopied?: (this: P, slice: Slice, view: EditorView) => Slice;
    nodeViews?: {
        [node: string]: NodeViewConstructor;
    };
    markViews?: {
        [mark: string]: MarkViewConstructor;
    };
    clipboardSerializer?: DOMSerializer;
    clipboardTextSerializer?: (this: P, content: Slice, view: EditorView) => string;
    decorations?: (this: P, state: EditorState) => DecorationSource | null | undefined;
    editable?: (this: P, state: EditorState) => boolean;
    attributes?: {
        [name: string]: string;
    } | ((state: EditorState) => {
        [name: string]: string;
    });
    scrollThreshold?: number | {
        top: number;
        right: number;
        bottom: number;
        left: number;
    };
    scrollMargin?: number | {
        top: number;
        right: number;
        bottom: number;
        left: number;
    };
}
interface DirectEditorProps extends EditorProps {
    state: EditorState;
    plugins?: readonly Plugin[];
    dispatchTransaction?: (tr: Transaction) => void;
}

export { type DOMEventMap, Decoration, type DecorationAttrs, DecorationSet, type DecorationSource, type DirectEditorProps, type EditorProps, EditorView, type MarkView, type MarkViewConstructor, type NodeView, type NodeViewConstructor, type ViewMutationRecord };
