import { EditorState, Transaction, Selection, Plugin } from 'prosemirror-state';
import { Mark, Node, ParseRule, Slice, ResolvedPos, DOMParser, DOMSerializer } from 'prosemirror-model';
import { Mapping } from 'prosemirror-transform';

declare type DOMNode = InstanceType<typeof window.Node>;

declare type WidgetConstructor = ((view: EditorView, getPos: () => number | undefined) => DOMNode) | DOMNode;
declare class Decoration {
    readonly from: number;
    readonly to: number;
    static widget(pos: number, toDOM: WidgetConstructor, spec?: {
        side?: number;
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
declare type DecorationAttrs = {
    nodeName?: string;
    class?: string;
    style?: string;
    [attribute: string]: string | undefined;
};
interface DecorationSource {
    map: (mapping: Mapping, node: Node) => DecorationSource;
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
    static empty: DecorationSet;
}

declare global {
    interface Node {
        pmViewDesc?: ViewDesc;
    }
}
interface NodeView {
    dom: DOMNode;
    contentDOM?: HTMLElement | null;
    update?: (node: Node, decorations: readonly Decoration[], innerDecorations: DecorationSource) => boolean;
    selectNode?: () => void;
    deselectNode?: () => void;
    setSelection?: (anchor: number, head: number, root: Document | ShadowRoot) => void;
    stopEvent?: (event: Event) => boolean;
    ignoreMutation?: (mutation: MutationRecord) => boolean;
    destroy?: () => void;
}
declare class ViewDesc {
    parent: ViewDesc | undefined;
    children: ViewDesc[];
    dom: DOMNode;
    contentDOM: HTMLElement | null;
    dirty: number;
    node: Node | null;
    constructor(parent: ViewDesc | undefined, children: ViewDesc[], dom: DOMNode, contentDOM: HTMLElement | null);
    matchesWidget(widget: Decoration): boolean;
    matchesMark(mark: Mark): boolean;
    matchesNode(node: Node, outerDeco: readonly Decoration[], innerDeco: DecorationSource): boolean;
    matchesHack(nodeName: string): boolean;
    parseRule(): ParseRule | null;
    stopEvent(event: Event): boolean;
    get size(): number;
    get border(): number;
    destroy(): void;
    posBeforeChild(child: ViewDesc): number;
    get posBefore(): number;
    get posAtStart(): number;
    get posAfter(): number;
    get posAtEnd(): number;
    localPosFromDOM(dom: DOMNode, offset: number, bias: number): number;
    nearestDesc(dom: DOMNode, onlyNodes?: boolean): ViewDesc | undefined;
    getDesc(dom: DOMNode): ViewDesc | undefined;
    posFromDOM(dom: DOMNode, offset: number, bias: number): number;
    descAt(pos: number): ViewDesc | undefined;
    domFromPos(pos: number, side: number): {
        node: DOMNode;
        offset: number;
    };
    parseRange(from: number, to: number, base?: number): {
        node: DOMNode;
        from: number;
        to: number;
        fromOffset: number;
        toOffset: number;
    };
    emptyChildAt(side: number): boolean;
    domAfterPos(pos: number): DOMNode;
    setSelection(anchor: number, head: number, root: Document | ShadowRoot, force?: boolean): void;
    ignoreMutation(mutation: MutationRecord): boolean;
    get contentLost(): boolean | null;
    markDirty(from: number, to: number): void;
    markParentsDirty(): void;
    get domAtom(): boolean;
    get ignoreForCoords(): boolean;
}

declare class EditorView {
    private _props;
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
    private updateStateInner;
    private destroyPluginViews;
    private updatePluginViews;
    someProp<PropName extends keyof EditorProps, Result>(propName: PropName, f: (value: NonNullable<EditorProps[PropName]>) => Result): Result | undefined;
    someProp<PropName extends keyof EditorProps>(propName: PropName): NonNullable<EditorProps[PropName]> | undefined;
    hasFocus(): boolean;
    focus(): void;
    get root(): Document | ShadowRoot;
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
    destroy(): void;
    get isDestroyed(): boolean;
    dispatchEvent(event: Event): void;
    dispatch(tr: Transaction): void;
}
declare type NodeViewConstructor = (node: Node, view: EditorView, getPos: () => number, decorations: readonly Decoration[], innerDecorations: DecorationSource) => NodeView;
declare type MarkViewConstructor = (mark: Mark, view: EditorView, inline: boolean) => {
    dom: HTMLElement;
    contentDOM?: HTMLElement;
};
interface DOMEventMap extends HTMLElementEventMap {
    [event: string]: Event;
}
interface EditorProps {
    handleDOMEvents?: {
        [event in keyof DOMEventMap]?: (view: EditorView, event: DOMEventMap[event]) => boolean | void;
    };
    handleKeyDown?: (view: EditorView, event: KeyboardEvent) => boolean | void;
    handleKeyPress?: (view: EditorView, event: KeyboardEvent) => boolean | void;
    handleTextInput?: (view: EditorView, from: number, to: number, text: string) => boolean | void;
    handleClickOn?: (view: EditorView, pos: number, node: Node, nodePos: number, event: MouseEvent, direct: boolean) => boolean | void;
    handleClick?: (view: EditorView, pos: number, event: MouseEvent) => boolean | void;
    handleDoubleClickOn?: (view: EditorView, pos: number, node: Node, nodePos: number, event: MouseEvent, direct: boolean) => boolean | void;
    handleDoubleClick?: (view: EditorView, pos: number, event: MouseEvent) => boolean | void;
    handleTripleClickOn?: (view: EditorView, pos: number, node: Node, nodePos: number, event: MouseEvent, direct: boolean) => boolean | void;
    handleTripleClick?: (view: EditorView, pos: number, event: MouseEvent) => boolean | void;
    handlePaste?: (view: EditorView, event: ClipboardEvent, slice: Slice) => boolean | void;
    handleDrop?: (view: EditorView, event: DragEvent, slice: Slice, moved: boolean) => boolean | void;
    handleScrollToSelection?: (view: EditorView) => boolean;
    createSelectionBetween?: (view: EditorView, anchor: ResolvedPos, head: ResolvedPos) => Selection | null;
    domParser?: DOMParser;
    transformPastedHTML?: (html: string) => string;
    clipboardParser?: DOMParser;
    transformPastedText?: (text: string, plain: boolean) => string;
    clipboardTextParser?: (text: string, $context: ResolvedPos, plain: boolean) => Slice;
    transformPasted?: (slice: Slice) => Slice;
    nodeViews?: {
        [node: string]: NodeViewConstructor;
    };
    markViews?: {
        [mark: string]: MarkViewConstructor;
    };
    clipboardSerializer?: DOMSerializer;
    clipboardTextSerializer?: (content: Slice) => string;
    decorations?: (state: EditorState) => DecorationSource | null | undefined;
    editable?: (state: EditorState) => boolean;
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

export { DOMEventMap, Decoration, DecorationAttrs, DecorationSet, DecorationSource, DirectEditorProps, EditorProps, EditorView, MarkViewConstructor, NodeView, NodeViewConstructor };
