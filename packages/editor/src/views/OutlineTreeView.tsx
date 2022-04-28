import { observer } from "mobx-react-lite";
import React, { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import scrollIntoView from "scroll-into-view-if-needed";
import {
  LeafTreeViewItem,
  RootTreeViewItem,
  TreeViewItem,
} from "@seanchas116/paintkit/dist/components/treeview/TreeViewItem";
import {
  TreeRow,
  TreeRowIcon,
  TreeRowLabel,
  TreeRowNameEdit,
} from "@seanchas116/paintkit/dist/components/treeview/TreeRow";
import { TreeView } from "@seanchas116/paintkit/dist/components/treeview/TreeView";
import {
  ContextMenuController,
  useContextMenu,
} from "@seanchas116/paintkit/dist/components/menu/ContextMenuProvider";
import widgetsFilledIcon from "@iconify-icons/ic/baseline-widgets";
import switchIcon from "@seanchas116/paintkit/dist/icon/Switch";
import chevronsIcon from "@seanchas116/paintkit/dist/icon/Chevrons";
import { action, computed, makeObservable, reaction } from "mobx";
import { colors } from "@seanchas116/paintkit/src/components/Palette";
import { filterInstance } from "@seanchas116/paintkit/src/util/Collection";
import { compact } from "lodash-es";
import { assertNonNull } from "@seanchas116/paintkit/src/util/Assert";
import { EditorState } from "../state/EditorState";
import { Component } from "../models/Component";
import { DefaultVariant, Variant } from "../models/Variant";
import { ElementInstance } from "../models/ElementInstance";
import { TextInstance } from "../models/TextInstance";
import { Document } from "../models/Document";
import { useEditorState } from "./EditorStateContext";

const NODE_DRAG_MIME = "application/x.macaron-tree-drag-node";
const COMPONENT_DRAG_MIME = "application/x.macaron-tree-drag-component";
const VARIANT_DRAG_MIME = "application/x.macaron-tree-drag-variant";

const TreeViewPadding = styled.div`
  height: 8px;
`;

const TagName = styled.div<{
  color: string;
}>`
  font-size: 8px;
  font-weight: 600;
  text-transform: uppercase;
  color: ${(p) => p.color};
  opacity: 0.5;
  margin-right: 6px;
`;

const StyledIcon = styled(TreeRowIcon)<{
  iconColor: string;
}>`
  color: ${(p) => p.iconColor};
`;

const StyledNameEdit = styled(TreeRowNameEdit)<{
  isComponent?: boolean;
  color: string;
}>`
  color: ${(p) => p.color};
  font-weight: ${(p) => (p.isComponent ? "700" : "400")};
`;

const StyledRow = styled(TreeRow)`
  position: relative;
`;

export const OutlineTreeView: React.FC<{
  className?: string;
  hidden?: boolean;
}> = observer(({ className, hidden }) => {
  const contextMenu = useContextMenu();
  const editorState = useEditorState();
  const [instanceToItem] = useState(
    () =>
      new WeakMap<
        ElementInstance | TextInstance | Component,
        ElementItem | TextItem | ComponentItem
      >()
  );

  const rootItem = useMemo(
    () =>
      new RootItem({
        editorState,
        contextMenu,
        instanceToItem,
      }),
    [editorState, contextMenu]
  );

  // reveal nodes on selection change
  useEffect(
    () =>
      reaction(
        () => editorState.document.selectedInstances,
        async (instances) => {
          for (const instance of instances) {
            instance.parent?.expandAncestors();
          }

          // wait for render
          await new Promise((resolve) => setTimeout(resolve, 0));

          for (const instance of instances) {
            const item = instanceToItem.get(instance);
            if (item?.rowElement) {
              scrollIntoView(item.rowElement, {
                scrollMode: "if-needed",
              });
            }
          }
        }
      ),
    [editorState, instanceToItem]
  );

  // reveal component on selection change
  useEffect(
    () =>
      reaction(
        () => editorState.document.selectedComponents,
        async (components) => {
          // wait for render
          await new Promise((resolve) => setTimeout(resolve, 0));

          for (const component of components) {
            const item = instanceToItem.get(component);
            if (item?.rowElement) {
              scrollIntoView(item.rowElement, {
                scrollMode: "if-needed",
              });
            }
          }
        }
      ),
    [editorState, instanceToItem]
  );

  return (
    <TreeView
      className={className}
      hidden={hidden}
      rootItem={rootItem}
      header={<TreeViewPadding />}
      footer={<TreeViewPadding />}
    />
  );
});

interface OutlineContext {
  editorState: EditorState;
  contextMenu: ContextMenuController;
  instanceToItem: WeakMap<
    ElementInstance | TextInstance | Component,
    ElementItem | TextItem | ComponentItem
  >;
}

class ElementItem extends TreeViewItem {
  constructor(
    context: OutlineContext,
    parent: ElementItem | ComponentItem,
    instance: ElementInstance
  ) {
    super();
    this.context = context;
    this.parent = parent;
    this.instance = instance;
    makeObservable(this);
    context.instanceToItem.set(instance, this);
  }

  readonly context: OutlineContext;
  readonly parent: ElementItem | ComponentItem;
  readonly instance: ElementInstance;

  get children(): readonly TreeViewItem[] {
    return this.instance.children.map((instance) => {
      if (instance.type === "element") {
        return new ElementItem(this.context, this, instance);
      } else {
        return new TextItem(this.context, this, instance);
      }
    });
  }

  get key(): string {
    return this.instance.key;
  }

  get selected(): boolean {
    return this.instance.selected;
  }
  @computed get hovered(): boolean {
    return this.context.editorState.hoveredItem === this.instance;
  }
  get collapsed(): boolean {
    return this.instance.collapsed;
  }
  get showsCollapseButton(): boolean {
    return true;
  }

  deselect(): void {
    this.instance.deselect();
  }
  select(): void {
    this.instance.select();
  }
  toggleCollapsed(): void {
    this.instance.collapsed = !this.instance.collapsed;
  }

  private onNameChange = action((id: string) => {
    this.instance.element.setID(id);
    this.context.editorState.history.commit("Change ID");
    return true;
  });

  rowElement: HTMLElement | undefined;

  renderRow(options: { inverted: boolean }): React.ReactNode {
    return (
      <StyledRow
        ref={(e) => (this.rowElement = e || undefined)}
        inverted={options.inverted}
      >
        <StyledIcon icon={chevronsIcon} iconColor={colors.label} />
        <TagName color={colors.text}> {this.instance.element.tagName}</TagName>
        <StyledNameEdit
          color={colors.text}
          value={this.instance.element.id}
          // TODO: validate
          onChange={this.onNameChange}
          disabled={!options.inverted}
          trigger="click"
        />
      </StyledRow>
    );
  }

  handleContextMenu(e: React.MouseEvent): void {
    e.preventDefault();
    e.stopPropagation();

    this.context.contextMenu.show(
      e.clientX,
      e.clientY,
      this.context.editorState.getElementContextMenu(this.instance)
    );
  }

  handleDragStart(e: React.DragEvent) {
    e.dataTransfer.effectAllowed = "copyMove";
    e.dataTransfer.setData(NODE_DRAG_MIME, "drag");
  }

  canDropData(dataTransfer: DataTransfer) {
    return dataTransfer.types.includes(NODE_DRAG_MIME);
  }

  handleDrop(event: React.DragEvent, before: TreeViewItem | undefined) {
    const copy = event.altKey || event.ctrlKey;
    const beforeNode = (before as ElementItem | TextItem | undefined)?.instance
      .node;

    // TODO: copy
    for (const node of this.context.editorState.document.selectedNodes) {
      this.instance.node.insertBefore(node, beforeNode);
    }

    this.context.editorState.history.commit(
      copy ? "Duplicate Layers" : "Move Layers"
    );
  }
}

class TextItem extends LeafTreeViewItem {
  constructor(
    context: OutlineContext,
    parent: ElementItem,
    instance: TextInstance
  ) {
    super();
    this.context = context;
    this.parent = parent;
    this.instance = instance;
    makeObservable(this);
    context.instanceToItem.set(instance, this);
  }

  readonly context: OutlineContext;
  readonly parent: ElementItem | VariantItem;
  readonly instance: TextInstance;

  get key(): string {
    return this.instance.key;
  }

  get selected(): boolean {
    return this.instance.selected;
  }
  @computed get hovered(): boolean {
    return this.context.editorState.hoveredItem === this.instance;
  }

  deselect(): void {
    this.instance.deselect();
  }
  select(): void {
    this.instance.select();
  }

  private onNameChange = action((content: string) => {
    this.instance.text.content = content;
    this.context.editorState.history.commit("Change Text");
    return true;
  });

  rowElement: HTMLElement | undefined;

  renderRow(options: { inverted: boolean }): React.ReactNode {
    return (
      <StyledRow
        ref={(e) => (this.rowElement = e || undefined)}
        inverted={options.inverted}
      >
        <StyledNameEdit
          color={colors.label}
          value={this.instance.text.content}
          // TODO: validate
          onChange={this.onNameChange}
          disabled={!options.inverted}
          trigger="click"
        />
      </StyledRow>
    );
  }

  handleContextMenu(e: React.MouseEvent): void {
    e.preventDefault();
    e.stopPropagation();

    this.context.contextMenu.show(
      e.clientX,
      e.clientY,
      this.context.editorState.getTextContextMenu(this.instance)
    );
  }

  handleDragStart(e: React.DragEvent) {
    e.dataTransfer.effectAllowed = "copyMove";
    e.dataTransfer.setData(NODE_DRAG_MIME, "drag");
  }
}

class VariantItem extends ElementItem {
  constructor(
    context: OutlineContext,
    parent: ComponentItem,
    variant: Variant | DefaultVariant,
    rootInstance: ElementInstance
  ) {
    super(context, parent, rootInstance);
    this.variant = variant;
    makeObservable(this);
  }

  readonly variant: Variant | DefaultVariant;

  renderRow(options: { inverted: boolean }): React.ReactNode {
    return (
      <StyledRow
        ref={(e) => (this.rowElement = e || undefined)}
        inverted={options.inverted}
      >
        <StyledIcon icon={switchIcon} iconColor={colors.label} />
        <TreeRowLabel>{this.variant.name}</TreeRowLabel>
      </StyledRow>
    );
  }

  handleDragStart(e: React.DragEvent) {
    if (this.variant.type === "defaultVariant") {
      return;
    }
    e.dataTransfer.effectAllowed = "copyMove";
    e.dataTransfer.setData(VARIANT_DRAG_MIME, "drag");
  }
}

class ComponentItem extends TreeViewItem {
  constructor(context: OutlineContext, parent: RootItem, component: Component) {
    super();
    this.context = context;
    this.parent = parent;
    this.component = component;
    makeObservable(this);
    context.instanceToItem.set(component, this);
  }

  readonly context: OutlineContext;
  readonly parent: RootItem;
  readonly component: Component;

  get key(): string {
    return this.component.key;
  }

  get children(): readonly TreeViewItem[] {
    return compact(
      this.component.allVariants.map(
        (variant) =>
          new VariantItem(
            this.context,
            this,
            variant,
            assertNonNull(variant.rootInstance)
          )
      )
    );
  }

  get selected(): boolean {
    return this.component.selected;
  }
  get hovered(): boolean {
    return false;
  }
  get collapsed(): boolean {
    return this.component.collapsed;
  }
  get showsCollapseButton(): boolean {
    return true;
  }

  deselect(): void {
    this.component.deselect();
  }
  select(): void {
    this.component.select();
  }
  toggleCollapsed(): void {
    this.component.collapsed = !this.component.collapsed;
  }

  rowElement: HTMLElement | undefined;

  private onNameChange = action((name: string) => {
    this.component.rename(name);
    this.context.editorState.history.commit("Rename Component");
    return true;
  });

  renderRow(options: { inverted: boolean }): React.ReactNode {
    return (
      <StyledRow
        ref={(e) => (this.rowElement = e || undefined)}
        inverted={options.inverted}
      >
        <StyledIcon icon={widgetsFilledIcon} iconColor={colors.component} />
        <StyledNameEdit
          color={colors.text}
          isComponent
          value={this.component.name}
          // TODO: validate
          onChange={this.onNameChange}
          disabled={!options.inverted}
          trigger="click"
        />
      </StyledRow>
    );
  }

  handleContextMenu(e: React.MouseEvent): void {
    e.preventDefault();
    e.stopPropagation();

    this.context.contextMenu.show(
      e.clientX,
      e.clientY,
      this.context.editorState.getComponentContextMenu(this.component)
    );
  }

  handleDragStart(e: React.DragEvent) {
    e.dataTransfer.effectAllowed = "copyMove";
    e.dataTransfer.setData(COMPONENT_DRAG_MIME, "drag");
  }

  canDropData(dataTransfer: DataTransfer) {
    return dataTransfer.types.includes(VARIANT_DRAG_MIME);
  }

  handleDrop(event: React.DragEvent, before: TreeViewItem | undefined) {
    const copy = event.altKey || event.ctrlKey;
    let beforeVariant = (before as VariantItem | undefined)?.variant;
    if (beforeVariant?.type === "defaultVariant") {
      beforeVariant = this.component.variants.firstChild;
    }

    const selectedVariants = filterInstance(this.component.selectedVariants, [
      Variant,
    ]);
    for (const variant of selectedVariants) {
      this.component.variants.insertBefore(variant, beforeVariant);
    }

    this.context.editorState.history.commit(
      copy ? "Duplicate Variants" : "Move Variants"
    );
  }
}

class RootItem extends RootTreeViewItem {
  constructor(context: OutlineContext) {
    super();
    this.context = context;
  }

  readonly context: OutlineContext;

  get document(): Document {
    return this.context.editorState.document;
  }

  get children(): readonly TreeViewItem[] {
    return this.document.components.children.map(
      (c) => new ComponentItem(this.context, this, c)
    );
  }

  deselect(): void {
    for (const component of this.document.components.children) {
      component.deselect();
    }
  }

  handleContextMenu(e: React.MouseEvent): void {
    e.preventDefault();
    e.stopPropagation();

    this.context.contextMenu.show(
      e.clientX,
      e.clientY,
      this.context.editorState.getOutlineContextMenu()
    );
  }

  canDropData(dataTransfer: DataTransfer) {
    return dataTransfer.types.includes(COMPONENT_DRAG_MIME);
  }

  handleDrop(event: React.DragEvent, before: TreeViewItem | undefined) {
    const copy = event.altKey || event.ctrlKey;
    const beforeComponent = (before as ComponentItem | undefined)?.component;

    // TODO: copy
    for (const node of this.document.selectedComponents) {
      this.document.components.insertBefore(node, beforeComponent);
    }

    this.context.editorState.history.commit(
      copy ? "Duplicate Components" : "Move Components"
    );
  }
}
